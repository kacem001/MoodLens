// Rebuilds the Keras CNN in TensorFlow.js and loads exported weights.
const EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];

async function loadEmotionModel(tf) {
  const [manifest, buf] = await Promise.all([
    fetch('models/emotion/manifest.json').then(r => r.json()),
    fetch('models/emotion/weights.bin').then(r => r.arrayBuffer())
  ]);
  const L = tf.layers;
  const m = tf.sequential();
  const conv = (f, first) => L.conv2d(Object.assign(
    { filters: f, kernelSize: 3, padding: 'same', activation: 'relu' },
    first ? { inputShape: [48, 48, 1] } : {}));
  const bn = () => L.batchNormalization({ momentum: 0.99, epsilon: 0.001 });
  m.add(conv(64, true)); m.add(bn());
  m.add(conv(64)); m.add(bn());
  m.add(L.maxPooling2d({ poolSize: 2 })); m.add(L.dropout({ rate: 0.25 }));
  m.add(conv(128)); m.add(bn());
  m.add(conv(128)); m.add(bn());
  m.add(L.maxPooling2d({ poolSize: 2 })); m.add(L.dropout({ rate: 0.25 }));
  m.add(conv(256)); m.add(bn());
  m.add(L.maxPooling2d({ poolSize: 2 })); m.add(L.dropout({ rate: 0.25 }));
  m.add(L.flatten());
  m.add(L.dense({ units: 256, activation: 'relu' })); m.add(bn());
  m.add(L.dropout({ rate: 0.5 }));
  m.add(L.dense({ units: 7, activation: 'softmax' }));

  const all = new Float32Array(buf);
  let off = 0, idx = 0;
  for (const layer of m.layers) {
    const count = layer.weights.length;
    if (!count) continue;
    const ws = [];
    for (let i = 0; i < count; i++) {
      const shape = manifest.shapes[idx++];
      const n = shape.reduce((p, q) => p * q, 1);
      ws.push(tf.tensor(all.slice(off, off + n), shape));
      off += n;
    }
    layer.setWeights(ws);
    ws.forEach(w => w.dispose());
  }
  return m;
}

// Mimics cv2.resize(INTER_LINEAR) on a grayscale array
function resizeGray(src, sw, sh, dw, dh) {
  const out = new Float32Array(dw * dh);
  const xr = sw / dw, yr = sh / dh;
  for (let y = 0; y < dh; y++) {
    let fy = (y + 0.5) * yr - 0.5;
    let y0 = Math.floor(fy); const wy = fy - y0;
    let y1 = Math.min(y0 + 1, sh - 1); y0 = Math.max(y0, 0);
    for (let x = 0; x < dw; x++) {
      let fx = (x + 0.5) * xr - 0.5;
      let x0 = Math.floor(fx); const wx = fx - x0;
      let x1 = Math.min(x0 + 1, sw - 1); x0 = Math.max(x0, 0);
      out[y * dw + x] =
        src[y0 * sw + x0] * (1 - wx) * (1 - wy) + src[y0 * sw + x1] * wx * (1 - wy) +
        src[y1 * sw + x0] * (1 - wx) * wy + src[y1 * sw + x1] * wx * wy;
    }
  }
  return out;
}

// source: <video>/<img>/<canvas>, box: {x,y,w,h} in source pixel coords
function mkCanvas(w, h) {
  if (typeof document !== 'undefined' && document.createElement) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  return new OffscreenCanvas(w, h);
}
function cropToModelInput(source, box) {
  const c = mkCanvas(1, 1);
  const x = Math.max(0, Math.round(box.x)), y = Math.max(0, Math.round(box.y));
  const sw = source.videoWidth || source.naturalWidth || source.width;
  const sh = source.videoHeight || source.naturalHeight || source.height;
  const w = Math.max(1, Math.min(Math.round(box.w), sw - x));
  const h = Math.max(1, Math.min(Math.round(box.h), sh - y));
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, x, y, w, h, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]);
  }
  const out = resizeGray(gray, w, h, 48, 48);
  // contrast stretch (2%-98%) so dark / low-light skin keeps facial detail
  const sorted = Float32Array.from(out).sort();
  const lo = sorted[Math.floor(sorted.length * 0.02)], hi = sorted[Math.floor(sorted.length * 0.98)];
  if (hi - lo > 12) {
    for (let i = 0; i < out.length; i++) out[i] = Math.max(0, Math.min(255, (out[i] - lo) * 255 / (hi - lo)));
  }
  return out;
}

async function predictEmotion(tf, model, pixels48) {
  const input = tf.tensor4d(pixels48.map(v => v / 255), [1, 48, 48, 1]);
  const out = model.predict(input);
  const data = await out.data();   // async read: does not block the UI thread
  input.dispose(); out.dispose();
  return Array.from(data);
}
