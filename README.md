# 🦷 DentCare — Telegram WebApp

Tish shifoxonasi uchun professional Telegram Mini App.

## 📁 Fayl tuzilmasi

```
webbot/
├── index.html       ← WebApp asosiy sahifasi
├── style.css        ← Dizayn (Dark Mode qo'llab-quvvatlaydi)
├── app.js           ← JavaScript mantiq + AI Chat
├── bot.py           ← Telegram Bot (Python)
├── requirements.txt ← Python kutubxonalar
└── README.md        ← Bu fayl
```

## 🚀 Ishga tushirish

### 1. Bot yaratish
1. Telegramda [@BotFather](https://t.me/BotFather) ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting
4. Olingan **tokenni** `bot.py` faylidagi `BOT_TOKEN` ga kiriting

### 2. WebApp URLni sozlash
WebApp HTTPS URL kerak. Bepul variantlar:
- **GitHub Pages** — bepul hosting
- **Vercel** — bepul, tez
- **Netlify** — bepul

URL ni `bot.py` faylidagi `WEBAPP_URL` ga kiriting.

### 3. Python botni ishga tushirish
```bash
pip install -r requirements.txt
python bot.py
```

### 4. BotFather da WebApp ulash (ixtiyoriy)
```
/mybots → Botingiz → Bot Settings → Menu Button → URL kiriting
```

## ✨ Xususiyatlar

| Tab | Funksiya |
|-----|---------|
| 🏠 Bosh sahifa | Klinika haqida, shifokorlar, manzil |
| 📅 Ish kunlari | Jadval, bo'sh vaqtlar, bron forma |
| 🛠️ Xizmatlar | Narxlar bilan xizmatlar ro'yxati |
| 🤖 AI Chat | Savolga javob beruvchi AI yordamchi |

## 🎨 Dizayn xususiyatlari
- ✅ Telegram Dark Mode qo'llab-quvvatlaydi
- ✅ Telegram Haptic Feedback
- ✅ Smooth animatsiyalar
- ✅ Mobil optimizatsiya
- ✅ Professional renk sxemasi

## 📞 Sozlash uchun o'zgartiring
- `bot.py` → `BOT_TOKEN`, `WEBAPP_URL`, `ADMIN_CHAT_ID`
- `index.html` → Klinika nomi, shifokorlar
- `app.js` → AI javoblari, band vaqtlar
- `style.css` → Ranglar (`--primary`)
