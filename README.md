# Training

Put your training script here as `cnn.py` (FER2013, 48x48 grayscale, 7 classes).
The best checkpoint is saved as `best_cnn_model.keras`.

Class order used by the website (must match your training labels):
`Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral`

## Update the website after retraining
```
python training/export_weights.py training/best_cnn_model.keras
git add . && git commit -m "Update model" && git push
```
Vercel redeploys automatically.
