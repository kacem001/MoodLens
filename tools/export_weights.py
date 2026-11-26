# Re-export weights if you retrain: python tools/export_weights.py best_cnn_model.keras
import sys, json, numpy as np, keras
m = keras.models.load_model(sys.argv[1])
chunks, shapes = [], []
for l in m.layers:
    for w in l.get_weights():
        chunks.append(w.astype('<f4').ravel()); shapes.append(list(w.shape))
open('public/models/emotion/weights.bin', 'wb').write(np.concatenate(chunks).tobytes())
json.dump({'shapes': shapes}, open('public/models/emotion/manifest.json', 'w'))
