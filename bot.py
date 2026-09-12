#!/usr/bin/env python3
"""
DentCare Telegram Bot — Tish klinikasi uchun avtomatlashtirilgan WebApp boti
Har bir bron qilingan qabul administratorga avtomatik tarzda barcha ma'lumotlar bilan yetib boradi.
"""

import json
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters,
    ContextTypes
)

# ============================================================
#  SOZLAMALAR
# ============================================================
BOT_TOKEN = "7726488316:AAFl1Vw_YOUR_TOKEN_HERE"  # @BotFather dan olingan bot tokeni
WEBAPP_URL = "https://yusufjonovbitcoin-a11y.github.io/dentcare-webapp/"

# Administrator Telegram ID si (Shaxsiy ID yoki guruh ID si)
# O'z ID ingizni bilish uchun Telegramda @userinfobot ga /start bosing
ADMIN_CHAT_ID = 0  # Bu yerga admin ID raqami yoziladi (masalan: 123456789)
# ============================================================

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchi /start bosganda ochiladigan menyu"""
    user = update.effective_user
    name = user.first_name or "Hurmatli bemor"

    keyboard = [
        [
            InlineKeyboardButton(
                text="🦷 DentCare Klinikasini Ochish",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ],
        [
            InlineKeyboardButton("📞 Qo'ng'iroq qilish", url="tel:+998711234567"),
            InlineKeyboardButton("📍 Klinika manzili", url="https://maps.google.com/?q=Toshkent+Chilonzor+14")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        f"Assalomu alaykum, *{name}*! 👋\n\n"
        "🦷 *DentCare zamonaviy stomatologiya klinikasiga xush kelibsiz!*\n\n"
        "Bizning ilova orqali:\n"
        "• 📅 Shifokorlar qabuliga qulay vaqtni band qiling\n"
        "• 🛠️ Xizmatlar va narxlar bilan tanishing\n"
        "• 🤖 DentAI bilan tish parvarishi bo'yicha maslahat oling\n\n"
        "Ilovani ochish uchun quyidagi tugmani bosing 👇",
        parse_mode="Markdown",
        reply_markup=reply_markup
    )


async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """WebApp dan kelgan bron ma'lumotlarini qabul qilish va adminga uzatish"""
    try:
        raw_data = update.message.web_app_data.data
        data = json.loads(raw_data)
        user = update.effective_user

        if data.get("action") == "book":
            doctor = data.get("doctor", "Navbatchi shifokor")
            name = data.get("name", user.first_name or "Noma'lum")
            phone = data.get("phone", "Ko'rsatilmadi")
            service = data.get("service", "Umumiy ko'rik")
            date = data.get("date", "Bugun")
            time = data.get("time", "Kelishilgan holda")
            note = data.get("note", "Izohsiz")

            # 1. BEMORGA TASDIQLASH KVITANSIYASI
            user_confirm_text = (
                "🎉 *QABULINGIZ MUVAFFAQIYATLI BAND QILINDI!*\n\n"
                f"👨‍⚕️ *Shifokor:* {doctor}\n"
                f"📅 *Sana va Vaqt:* {date} · {time}\n"
                f"🛠️ *Xizmat:* {service}\n"
                f"👤 *Bemor:* {name}\n"
                f"📞 *Telefon:* {phone}\n\n"
                "📍 *Manzil:* Toshkent sh., Chilonzor t., 14-uy (Mirzo Ulug'bek metrosi)\n"
                "📞 *Ma'lumot uchun:* +998 (71) 123-45-67\n\n"
                "_Klinikamiz ma'muriyati tez orada siz bilan bog'lanib, qabulni tasdiqlaydi!_"
            )
            await update.message.reply_text(user_confirm_text, parse_mode="Markdown")

            # 2. ADMINISTRATORGA AVTOMATIK BILDORISHNOMA
            admin_msg = (
                "🚨 *YANGI BRON BUYURTMASI TUSHDI!*\n"
                "━━━━━━━━━━━━━━━━━━━━\n"
                f"👤 *Bemor:* {name}\n"
                f"📞 *Telefon:* `{phone}`\n"
                f"👨‍⚕️ *Tanlangan Vrach:* {doctor}\n"
                f"📅 *Sana & Vaqt:* {date} | {time}\n"
                f"🛠️ *Xizmat:* {service}\n"
                f"📝 *Shikoyat/Izoh:* {note}\n"
                "━━━━━━━━━━━━━━━━━━━━\n"
                f"📱 *Telegram Profili:* @{user.username or 'yoq'} (ID: `{user.id}`)\n"
            )

            admin_keyboard = [
                [
                    InlineKeyboardButton("📞 Qo'ng'iroq qilish", url=f"tel:{phone}"),
                ]
            ]
            if user.username:
                admin_keyboard[0].append(
                    InlineKeyboardButton("💬 Telegramdan yozish", url=f"https://t.me/{user.username}")
                )

            admin_reply_markup = InlineKeyboardMarkup(admin_keyboard)

            target_admin = ADMIN_CHAT_ID if ADMIN_CHAT_ID != 0 else update.effective_chat.id

            await context.bot.send_message(
                chat_id=target_admin,
                text=admin_msg,
                parse_mode="Markdown",
                reply_markup=admin_reply_markup
            )
            logger.info(f"Yangi bron qabul qilindi: {name} -> Admin ({target_admin}) ga yuborildi.")

    except Exception as e:
        logger.error(f"WebApp ma'lumotlarini qabul qilishda xatolik: {e}")
        await update.message.reply_text(
            "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki to'g'ridan-to'g'ri qo'ng'iroq qiling: +998 71 123-45-67"
        )


async def my_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin o'z ID raqamini bilishi uchun qulay komanda"""
    chat_id = update.effective_chat.id
    await update.message.reply_text(
        f"Sizning Telegram Chat ID raqamingiz: `{chat_id}`\n\n"
        "Ushbu raqamni `bot.py` faylidagi `ADMIN_CHAT_ID` qatoriga qo'ying.",
        parse_mode="Markdown"
    )


def main():
    if BOT_TOKEN == "7726488316:AAFl1Vw_YOUR_TOKEN_HERE":
        print("\nDIQQAT: Iltimos, bot.py faylidagi BOT_TOKEN ga @BotFather dan olgan tokeningizni yozing!\n")

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("myid", my_id))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))

    logger.info("🤖 DentCare boti ishga tushdi va buyurtmalarni kutmoqda...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
