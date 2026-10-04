# 🐧 PenguinAI – Web Uygulaması

PyTorch ile eğitilmiş penguen türü sınıflandırma modelini sunan FastAPI tabanlı web uygulaması.

## 📁 Klasör Yapısı

```
PenguinWebApp/
├── app/
│   └── main.py              # FastAPI backend
├── static/
│   ├── index.html           # Kullanıcı arayüzü
│   ├── style.css            # Stiller
│   └── app.js               # Frontend mantığı
├── penguin_model.pth        # ← Buraya kopyalayın!
├── requirements.txt
└── README.md
```

## 🚀 Kurulum & Çalıştırma

### 1. Gerekli adım: Model dosyasını kopyalayın

`penguin_model.pth` dosyanızı `PenguinWebApp/` klasörüne kopyalayın.

### 2. Bağımlılıkları yükleyin

```bash
pip install -r requirements.txt
```

### 3. Uygulamayı başlatın

```bash
uvicorn app.main:app --reload
```

Tarayıcıda açın: **http://127.0.0.1:8000**

---

## ⚙️ Model Giriş Özellikleri (8 boyut)

| # | Özellik | Açıklama |
|---|---------|----------|
| 1 | `bill_length_mm` | Gaga uzunluğu |
| 2 | `bill_depth_mm` | Gaga derinliği |
| 3 | `flipper_length_mm` | Yüzgeç uzunluğu |
| 4 | `body_mass_g` | Vücut kütlesi |
| 5 | `island_Dream` | Ada = Dream (0/1) |
| 6 | `island_Torgersen` | Ada = Torgersen (0/1) |
| 7 | `sex_Female` | Cinsiyet = Female (0/1) |
| 8 | `sex_Male` | Cinsiyet = Male (0/1) |

> **Not:** Eğitimde normalizasyon yaptıysanız `app/main.py` içindeki `preprocess()` fonksiyonunu güncelleyin.

## 🔌 API

| Endpoint | Yöntem | Açıklama |
|----------|--------|----------|
| `/` | GET | Arayüz |
| `/predict` | POST | Tahmin (JSON body) |
| `/health` | GET | Sağlık kontrolü |
| `/docs` | GET | Swagger UI |
