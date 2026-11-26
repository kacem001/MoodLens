/* Shared AI pipeline: face detection -> landmarks -> FER crop -> CNN. Runs in a Web Worker (preferred) or the main thread. */
const IN_WORKER = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
const tf = faceapi.tf;
let emotionModel = null, lastBox = null, lastDet = 0, misses = 0;
const ssdOpts = () => new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3, maxResults: 5 });
const tinyOpts = () => new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 });

// Pick the fastest TensorFlow.js backend for THIS device: GPU (webgl) or WASM (fast CPU with SIMD).
// Many PCs run WebGL in software mode (very slow); WASM is 10-50x faster there.
function softwareGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    return /swiftshader|llvmpipe|software|basic render|softpipe/i.test(r);
  } catch (e) { return true; }
}
async function benchBackend(name) {
  try {
    await tf.setBackend(name); await tf.ready();
    if (tf.getBackend() !== name) return Infinity;
    const x = tf.randomNormal([1, 48, 48, 64]), k = tf.randomNormal([3, 3, 64, 64]);
    const run = async () => { const y = tf.conv2d(x, k, 1, 'same'); await y.data(); y.dispose(); };
    await run(); await run();
    const t = performance.now(); for (let n = 0; n < 3; n++) await run();
    x.dispose(); k.dispose();
    return (performance.now() - t) / 3;
  } catch (e) { return Infinity; }
}
async function pickBackend() {
  tf.setWasmPaths(new URL('lib/wasm/', (typeof location !== 'undefined' ? location.href : self.location.href)).href);
  let best = 'wasm';
  if (!softwareGL()) {
    const [w, g] = [await benchBackend('wasm'), await benchBackend('webgl')];
    best = g <= w * 1.15 ? 'webgl' : 'wasm';          // prefer GPU unless WASM is clearly faster
    if (!isFinite(w) && !isFinite(g)) best = 'cpu';
    console.log('backend bench ms', { wasm: w, webgl: g, best });
  }
  await tf.setBackend(best); await tf.ready();
  return tf.getBackend();
}
async function aiInit() {
  await pickBackend();
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models/face'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('models/face'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models/face'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models/face')
  ]);
  emotionModel = await loadEmotionModel(tf);
  // warm-up so shaders / wasm kernels are ready before the first real frame
  const c = mkCanvas(320, 240); c.getContext('2d').fillRect(0, 0, 320, 240);
  await detectOn(c, 'tiny'); await detectOn(c, 'still'); await detectOn(c, 'ssd');
  await predictEmotion(tf, emotionModel, new Float32Array(48 * 48));
  return tf.getBackend();
}
// in a worker there is no DOM: feed face-api a tensor instead of a media element
function inp(src) { return IN_WORKER ? tf.browser.fromPixels(src) : src; }
async function detectOn(src, kind) {
  const t = inp(src);
  try {
    if (kind === 'tiny') { const r = await faceapi.detectSingleFace(t, tinyOpts()).withFaceLandmarks(true); return r ? [r] : []; }
    if (kind === 'still') return await faceapi.detectAllFaces(t, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })).withFaceLandmarks();
    return await faceapi.detectAllFaces(t, ssdOpts()).withFaceLandmarks();
  } finally { if (IN_WORKER) t.dispose(); }
}
function boxFromLandmarks(pts, det, W, H) {
  const jaw = pts.slice(0, 17), brows = pts.slice(17, 27), chin = pts[8];
  const xs = jaw.map(p => p.x), minX = Math.min(...xs), maxX = Math.max(...xs);
  const browY = Math.min(...brows.map(p => p.y));
  const botY = Math.max(chin.y, ...pts.slice(48, 68).map(p => p.y));
  const fh = botY - browY;
  let top = browY - 0.38 * fh, bottom = botY + 0.10 * fh;
  const cx = (minX + maxX) / 2, w = Math.max((maxX - minX) * 1.08, (bottom - top) * 0.92);
  let left = cx - w / 2, right = cx + w / 2;
  const d = det.box;
  if (!isFinite(left + right + top + bottom) || w < d.width * 0.6 || (bottom - top) < d.height * 0.6) {
    const px = d.width * 0.08, py = d.height * 0.12;
    left = d.x - px; right = d.x + d.width + px; top = d.y - py; bottom = d.y + d.height + py;
  }
  left = Math.max(0, left); top = Math.max(0, top); right = Math.min(W, right); bottom = Math.min(H, bottom);
  return { x: left, y: top, w: right - left, h: bottom - top };
}
function smoothBox(box) {
  if (lastBox) { const k = 0.6; box = { x: lastBox.x + (box.x - lastBox.x) * k, y: lastBox.y + (box.y - lastBox.y) * k, w: lastBox.w + (box.w - lastBox.w) * k, h: lastBox.h + (box.h - lastBox.h) * k }; }
  lastBox = box; return box;
}
function aiReset() { lastBox = null; lastDet = 0; misses = 0; }
const biggest = (all) => all.reduce((a, d) => (a.detection.box.area >= d.detection.box.area ? a : d));

let detMs = 40;
// LIVE: light face detector ~4x/second (adaptive) + CNN on the tracked face every frame = fast, smooth results.
// STILLS: accurate SSD + full landmarks.
async function aiAnalyze(source, live) {
  const W = source.videoWidth || source.naturalWidth || source.width, H = source.videoHeight || source.naturalHeight || source.height;
  const now = performance.now();
  if (live && lastBox && now - lastDet < Math.max(110, detMs * 3)) {
    const pixels = cropToModelInput(source, lastBox);
    return { box: lastBox, pixels, probs: await predictEmotion(tf, emotionModel, pixels) };
  }
  let found = null;
  if (live) {
    lastDet = now;
    const r = await detectOn(source, 'tiny');
    if (r.length) { found = r[0]; misses = 0; }
    else if (++misses % 2 === 0) { const all = await detectOn(source, 'ssd'); if (all.length) found = biggest(all); } // hard light / dark skin
    detMs = performance.now() - now;
  } else {
    let all = await detectOn(source, 'still');                    // fast first pass
    if (!all.length) all = await detectOn(source, 'ssd');          // accurate fallback (hard cases)
    if (all.length) found = biggest(all);
  }
  if (!found) { lastBox = null; return null; }
  let box = boxFromLandmarks(found.landmarks.positions, found.detection, W, H);
  if (live) box = smoothBox(box); else lastBox = null;
  const pixels = cropToModelInput(source, box);
  return { box, pixels, probs: await predictEmotion(tf, emotionModel, pixels) };
}
