const EMO = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];
const $ = (id) => document.getElementById(id);
const COLORS = { Angry:'#ef4444', Disgust:'#84cc16', Fear:'#a78bfa', Happy:'#facc15', Sad:'#60a5fa', Surprise:'#f472b6', Neutral:'#94a3b8' };
const faceIcon = (n) => `<svg class="ic" aria-hidden="true" style="color:${COLORS[n]}"><use href="#face-${n.toLowerCase()}"/></svg>`;
const sysIcon = (n) => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
let modelsReady = false, engine = null;
let mode = 'live', streaming = false, stream = null, timer = null, smooth = null, busy = false;

const video = $('video'), img = $('img'), ov = $('ov'), ctx = ov.getContext('2d'), stage = $('stage');

/* ---------- AI engine (main thread, same pipeline as the fast old version) ---------- */
async function loadModels() {
  const chip = $('chip');
  try {
    engine = { init: aiInit, analyze: aiAnalyze, reset: aiReset };
    const backend = await engine.init();
    modelsReady = true;
    chip.textContent = 'AI ready · ' + (backend === 'webgl' ? 'GPU' : backend === 'wasm' ? 'fast CPU' : 'CPU');
    chip.classList.add('ok'); setTimeout(() => chip.classList.add('fade'), 1800);
  } catch (e) {
    console.error(e); chip.textContent = 'Could not load AI models'; chip.classList.add('err');
  }
}
const analyze = (source, live) => engine.analyze(source, live);

/* ---------- UI state ---------- */
function setStatus(text, live) {
  $('src-status-t').textContent = text; $('src-status').classList.toggle('live', !!live);
}
let rowEls = null, shownName = null;
function buildRows() {
  const box = $('rows'); box.style.display = 'flex'; box.style.flexDirection = 'column';
  box.innerHTML = EMO.map(n => `<div class="row idle" data-n="${n}"><div class="t"><span>${faceIcon(n)}${n}</span><span>--</span></div><div class="track"><div class="fill sx" style="background:${COLORS[n]}"></div></div></div>`).join('');
  rowEls = EMO.map((n, i) => { const r = box.children[i]; return { r, v: r.querySelector('.t span:last-child'), f: r.querySelector('.fill') }; });
}
function renderIdle(title, sub) {
  ctx.clearRect(0, 0, ov.width, ov.height);
  if (!rowEls) buildRows();
  rowEls.forEach((e, i) => { e.r.classList.add('idle'); e.idle = true; e.r.style.order = i; e.v.textContent = '--'; e.f.style.transform = 'scaleX(0)'; e.rank = i; });
  const r = $('ring'); r.innerHTML = sysIcon('scan'); r.style.borderColor = ''; r.style.boxShadow = ''; r.style.color = ''; shownName = null;
  $('top').textContent = title; $('top').style.color = ''; $('conf').textContent = sub;
  $('ai-view').getContext('2d').clearRect(0, 0, 48, 48);
}
function render(res, useSmooth) {
  if (!res) { smooth = null; renderIdle('No face detected', mode === 'live' ? 'Scanning… position your face in the frame' : 'Try a clearer, front-facing photo'); return; }
  let p = res.probs;
  if (useSmooth && smooth) p = p.map((v, i) => smooth[i] * 0.4 + v * 0.6);
  smooth = p;
  const idx = p.indexOf(Math.max(...p)), name = EMO[idx], col = COLORS[name], pct = (p[idx] * 100).toFixed(1);
  if (shownName !== name) {
    const r = $('ring'); r.innerHTML = `<svg class="ic" aria-hidden="true"><use href="#face-${name.toLowerCase()}"/></svg>`;
    r.style.borderColor = col; r.style.color = col; r.style.boxShadow = `0 0 26px ${col}55`;
    shownName = name;
  }
  if ($('top').textContent !== name) { $('top').textContent = name; $('top').style.color = col; }
  $('conf').textContent = `${pct}% confidence`;
  const order = EMO.map((_, i) => i).sort((a, b) => p[b] - p[a]);
  order.forEach((i, rank) => {
    const e = rowEls[i]; if (e.idle !== false) { e.r.classList.remove('idle'); e.idle = false; } if (e.rank !== rank) { e.r.style.order = rank; e.rank = rank; }
    const v = (p[i] * 100).toFixed(1); e.v.textContent = v + '%'; e.f.style.transform = `scaleX(${p[i]})`;
  });
  drawModelView(res.pixels); drawBox(res.box, name, pct, col);
}
function drawBox(b, name, pct, color) {
  ctx.clearRect(0, 0, ov.width, ov.height);
  const s = Math.max(ov.width / 640, 0.7);
  ctx.strokeStyle = color; ctx.lineWidth = 3.5 * s; ctx.lineJoin = 'round';
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  const t = `${name}  ${pct}%`;
  ctx.font = `700 ${20 * s}px Inter, system-ui, sans-serif`;
  const tw = ctx.measureText(t).width, th = 32 * s;
  const ty = b.y - th - 4 * s < 0 ? b.y + b.h + 4 * s : b.y - th - 4 * s;
  ctx.fillStyle = color; ctx.fillRect(b.x - 1.5 * s, ty, tw + 18 * s, th);
  ctx.fillStyle = '#06101c'; ctx.fillText(t, b.x + 8 * s, ty + 22.5 * s);
}
function drawModelView(px) {
  const c = $('ai-view').getContext('2d'), d = c.createImageData(48, 48);
  for (let i = 0; i < 2304; i++) {
    const v = Math.max(0, Math.min(255, Math.round(px[i])));
    d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255;
  }
  c.putImageData(d, 0, 0);
}
function setTitle(icon, text) { $('src-title').innerHTML = sysIcon(icon) + text; }

/* ---------- modes ---------- */
function setMode(m) {
  mode = m;
  $('m-live').classList.toggle('on', m === 'live'); $('m-up').classList.toggle('on', m === 'upload');
  stopCamera(true);
  video.classList.add('hide'); stage.classList.remove('on');
  if (m === 'live') {
    setTitle('camera', 'Camera'); setStatus('Camera off', false);
    img.classList.add('hide'); $('ov-drop').classList.add('hide'); $('replace').classList.add('hide');
    $('ov-cam').classList.remove('hide'); $('hint').textContent = 'Tip: face the light for the best accuracy.';
    renderIdle('Standby', 'Awaiting camera feed');
  } else {
    setTitle('image', 'Image'); $('ov-cam').classList.add('hide'); $('stop-cam').classList.add('hide');
    $('hint').textContent = 'Images are analyzed on your device and never uploaded.';
    if (img.dataset.loaded) {
      img.classList.remove('hide'); $('replace').classList.remove('hide'); $('ov-drop').classList.add('hide');
      setStatus('Image loaded', false); analyzeUpload();
    } else {
      img.classList.add('hide'); $('ov-drop').classList.remove('hide'); setStatus('No image', false);
      renderIdle('Standby', 'Awaiting image upload');
    }
  }
}
$('m-live').onclick = () => mode !== 'live' && setMode('live');
$('m-up').onclick = () => mode !== 'upload' && setMode('upload');

/* ---------- live camera ---------- */
async function startCamera() {
  const msg = $('cam-msg');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    msg.textContent = 'Camera is not supported here. Open this page over HTTPS in a modern browser.'; msg.classList.add('err'); return;
  }
  try {
    $('start-cam').disabled = true; msg.classList.remove('err'); msg.textContent = 'Requesting camera access…';
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false });
    video.srcObject = stream;
    await new Promise(r => { video.onloadedmetadata = r; });
    await video.play().catch(() => {});
    ov.width = video.videoWidth; ov.height = video.videoHeight;
    video.classList.remove('hide'); $('ov-cam').classList.add('hide'); $('stop-cam').classList.remove('hide');
    stage.classList.add('on'); setStatus('Live', true);
    streaming = true; smooth = null; fpsN = 0; fpsT = performance.now(); engine && engine.reset(); document.body.classList.add('live-on');
    renderIdle('Scanning…', 'Position your face in the frame');
    loop();
  } catch (e) {
    console.error(e);
    msg.textContent = 'Camera access was blocked or unavailable. Allow camera permission in your browser and try again.'; msg.classList.add('err');
  } finally { $('start-cam').disabled = false; }
}
function stopCamera(silent) {
  streaming = false; cancelAnimationFrame(raf); document.body.classList.remove('live-on'); ctx.clearRect(0, 0, ov.width, ov.height);
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null; video.srcObject = null; video.classList.add('hide'); stage.classList.remove('on');
  $('stop-cam').classList.add('hide');
  if (mode === 'live') {
    $('ov-cam').classList.remove('hide'); $('cam-msg').classList.remove('err'); $('cam-msg').textContent = 'Turn on your camera to start real-time emotion analysis.';
    if (!silent) { setStatus('Camera off', false); renderIdle('Standby', 'Awaiting camera feed'); }
  }
}
let fpsN = 0, fpsT = 0, raf = 0;
async function loop() {
  if (!streaming) return;
  const t = performance.now();
  if (modelsReady && video.readyState >= 2 && !document.hidden) {
    try { const r = await analyze(video, true); if (streaming) render(r, true); } catch (e) { console.error(e); }
    fpsN++; if (t - fpsT > 1000) { setStatus('Live · ' + Math.round(fpsN * 1000 / (t - fpsT)) + ' fps', true); fpsN = 0; fpsT = t; }
  }
  raf = requestAnimationFrame(loop);
}
$('start-cam').onclick = startCamera;
$('stop-cam').onclick = () => stopCamera(false);

/* ---------- upload ---------- */
function loadFile(f) {
  if (!f || !f.type.startsWith('image/')) { $('hint').textContent = 'Please choose a valid image file (JPG, PNG, WebP).'; return; }
  const url = URL.createObjectURL(f);
  img.onload = () => {
    img.dataset.loaded = '1';
    img.classList.remove('hide'); $('ov-drop').classList.add('hide'); $('replace').classList.remove('hide');
    setStatus('Image loaded', false); $('hint').textContent = f.name;
    analyzeUpload();
  };
  img.src = url;
}
async function analyzeUpload() {
  if (busy) return;
  if (!modelsReady) { renderIdle('Preparing…', 'Loading AI models'); setTimeout(analyzeUpload, 400); return; }
  busy = true; shownName = null; $('top').textContent = 'Analyzing…'; $('conf').textContent = 'Detecting face and expression';
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  try {
    // downscale big photos (keeps detection fast); overlay uses the same aspect ratio
    const nw = img.naturalWidth, nh = img.naturalHeight, k = Math.min(1, 800 / Math.max(nw, nh));
    const c = document.createElement('canvas'); c.width = Math.round(nw * k); c.height = Math.round(nh * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    ov.width = c.width; ov.height = c.height;
    smooth = null; render(await analyze(c, false), false);
  } catch (e) { console.error(e); renderIdle('Analysis failed', 'Please try another image'); }
  busy = false;
}
$('file').onchange = (e) => { loadFile(e.target.files[0]); e.target.value = ''; };
$('replace').onclick = () => $('file').click();
['dragenter', 'dragover'].forEach(v => stage.addEventListener(v, e => { if (mode !== 'upload') return; e.preventDefault(); $('ov-drop').classList.add('drag'); }));
['dragleave', 'drop'].forEach(v => stage.addEventListener(v, e => { if (mode !== 'upload') return; e.preventDefault(); $('ov-drop').classList.remove('drag'); }));
stage.addEventListener('drop', e => mode === 'upload' && loadFile(e.dataTransfer.files[0]));
document.addEventListener('visibilitychange', () => { if (document.hidden && engine) engine.reset(); });

renderIdle('Standby', 'Awaiting camera feed');
loadModels();
