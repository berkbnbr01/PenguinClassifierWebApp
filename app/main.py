from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import torch
import torch.nn as nn
import numpy as np
import joblib
import os

# ── Yollar ────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
MODEL_PATH  = os.path.join(BASE_DIR, "penguin_model.pth")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
LE_PATH     = os.path.join(BASE_DIR, "label_encoder.pkl")
COLS_PATH   = os.path.join(BASE_DIR, "columns.pkl")

# ── Model tanımı ──────────────────────────────────────────────────────────────
class PenguinModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(in_features=8, out_features=16)
        self.layer2 = nn.Linear(in_features=16, out_features=16)
        self.layer3 = nn.Linear(in_features=16, out_features=3)
        self.relu   = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.layer1(x))
        x = self.relu(self.layer2(x))
        return self.layer3(x)

# ── Yükleme ───────────────────────────────────────────────────────────────────
model = PenguinModel()
model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu", weights_only=True))
model.eval()

scaler  = joblib.load(SCALER_PATH)   # StandardScaler – 4 sayisal ozellik
le      = joblib.load(LE_PATH)       # LabelEncoder  – species: Adelie/Chinstrap/Gentoo

import pickle
with open(COLS_PATH, "rb") as f:
    COLUMNS = pickle.load(f)
# COLUMNS = ['culmen_length_mm', 'culmen_depth_mm', 'flipper_length_mm',
#             'body_mass_g', 'sex', 'island_Biscoe', 'island_Dream', 'island_Torgersen']
print("[OK] Tum dosyalar yuklendi. Sutun sirasi:", COLUMNS)

# ── FastAPI ───────────────────────────────────────────────────────────────────
app = FastAPI(title="Penguin Classifier API", version="2.0.0")

STATIC_DIR = os.path.join(os.path.dirname(BASE_DIR), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ── Şemalar ───────────────────────────────────────────────────────────────────
class PenguinFeatures(BaseModel):
    """
    Kullanıcıdan alınan ham özellikler.
    culmen_length_mm / culmen_depth_mm → palmerpenguins/kaggle ismi
    """
    culmen_length_mm:   float   # Gaga uzunlugu (mm)
    culmen_depth_mm:    float   # Gaga derinligi (mm)
    flipper_length_mm:  float   # Yuzgec uzunlugu (mm)
    body_mass_g:        float   # Vucut kutlesi (g)
    island:             str     # "Biscoe" | "Dream" | "Torgersen"
    sex:                str     # "Female" | "Male"


class PredictionResult(BaseModel):
    predicted_species: str
    confidence:        float
    probabilities:     dict[str, float]


# ── Preprocessing ─────────────────────────────────────────────────────────────
def preprocess(feat: PenguinFeatures) -> torch.Tensor:
    """
    Eğitimdeki pipeline'ı birebir uygular:
      1. Sayısal 4 özelliği StandardScaler ile ölçekle
      2. sex  → LabelEncoder sırası: Female=0, Male=1
      3. island → one-hot: island_Biscoe, island_Dream, island_Torgersen

    Sütun sırası (columns.pkl'den):
      culmen_length_mm, culmen_depth_mm, flipper_length_mm, body_mass_g,
      sex, island_Biscoe, island_Dream, island_Torgersen
    """
    island = feat.island.strip().title()
    sex    = feat.sex.strip().title()

    # 1. Sayısal scaling (feature_names uyarısını önlemek için DataFrame kullan)
    import pandas as pd
    nums_df     = pd.DataFrame([[feat.culmen_length_mm,
                                 feat.culmen_depth_mm,
                                 feat.flipper_length_mm,
                                 feat.body_mass_g]],
                               columns=scaler.feature_names_in_)
    nums_scaled = scaler.transform(nums_df)[0]

    # 2. Sex encoding: Female=0, Male=1
    sex_encoded = 1.0 if sex == "Male" else 0.0

    # 3. Island one-hot
    island_biscoe    = 1.0 if island == "Biscoe"    else 0.0
    island_dream     = 1.0 if island == "Dream"     else 0.0
    island_torgersen = 1.0 if island == "Torgersen" else 0.0

    # 4. Birleştir (columns.pkl sırasına göre)
    vec = [
        nums_scaled[0],   # culmen_length_mm  (scaled)
        nums_scaled[1],   # culmen_depth_mm   (scaled)
        nums_scaled[2],   # flipper_length_mm (scaled)
        nums_scaled[3],   # body_mass_g       (scaled)
        sex_encoded,      # sex
        island_biscoe,    # island_Biscoe
        island_dream,     # island_Dream
        island_torgersen, # island_Torgersen
    ]
    return torch.tensor(vec, dtype=torch.float32).unsqueeze(0)


# ── Endpointler ───────────────────────────────────────────────────────────────
@app.get("/", response_class=FileResponse)
async def serve_index():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


@app.post("/predict", response_model=PredictionResult)
async def predict(features: PenguinFeatures):
    try:
        x = preprocess(features)
        with torch.inference_mode():
            logits = model(x)
            probs  = torch.softmax(logits, dim=1).squeeze().tolist()

        pred_idx   = int(np.argmax(probs))
        pred_name  = le.classes_[pred_idx]
        confidence = float(probs[pred_idx]) * 100

        probabilities = {
            name: round(float(p) * 100, 2)
            for name, p in zip(le.classes_, probs)
        }

        return PredictionResult(
            predicted_species=pred_name,
            confidence=round(confidence, 2),
            probabilities=probabilities,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "columns": COLUMNS,
        "classes": list(le.classes_),
    }
