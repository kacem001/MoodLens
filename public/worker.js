/* Web Worker: runs all AI off the main thread so the page never lags. */
self.window = self;
self.document = { createElement: (t) => { if (t === 'canvas') return new OffscreenCanvas(1, 1); throw new Error('no DOM in worker'); } };
self.HTMLImageElement = class {}; self.HTMLVideoElement = class {};
self.HTMLCanvasElement = OffscreenCanvas;
self.CanvasRenderingContext2D = self.OffscreenCanvasRenderingContext2D || class {};
if (typeof self.ImageData === 'undefined') self.ImageData = class {};
importScripts('lib/face-api.js', 'emotion-model.js', 'ai-core.js');

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === 'init') {
      const backend = await aiInit();
      self.postMessage({ type: 'ready', backend });
    } else if (m.type === 'reset') {
      aiReset();
    } else if (m.type === 'analyze') {
      const res = await aiAnalyze(m.bitmap, m.live);
      m.bitmap.close();
      if (!res) self.postMessage({ type: 'result', id: m.id, res: null });
      else self.postMessage({ type: 'result', id: m.id, res }, [res.pixels.buffer]);
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: m.id, message: String(err && err.message || err) });
  }
};
