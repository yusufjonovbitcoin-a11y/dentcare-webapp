#!/usr/bin/env python3
"""
DentCare Telegram Bot — tish shifoxonasi uchun WebApp boti
Talab: pip install python-telegram-bot
"""

import json
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# ============================================================
#  SOZLAMALAR — BU YERDA O'ZGARTIRING
# ============================================================
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"          # @BotFather dan olingan token
WEBAPP_URL = "https://your-domain.com"     # WebApp URL (HTTPS bo'lishi shart)
ADMIN_CHAT_ID = 123456789                  # Admin Telegram ID (qabul bildirishnomasi uchun)
# ============================================================

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Bot ishga tushganda /start komandasi"""
    user = update.effective_user
    name = user.first_name or "Mehmon"

    keyboard = [
        [
            InlineKeyboardButton(
                text="🦷 DentCare WebApp ni ochish",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ],
        [
            InlineKeyboardButton("📞 Qo'ng'iroq qilish", url="tel:+998711234567"),
            InlineKeyboardButton("📍 Manzil", url="https://maps.google.com")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        f"Assalomu alaykum, {name}! 👋\n\n"
        "🦷 *DentCare Tish Shifoxonasiga xush kelibsiz!*\n\n"
        "Bizning webappni ochib, quyidagilarni qilishingiz mumkin:\n"
        "• 📅 Qabul uchun vaqt band qilish\n"
        "• 🛠️ Xizmatlar va narxlar bilan tanishish\n"
        "• 🤖 AI yordamchidan maslahat olish\n"
        "• ⏰ Ish vaqtlari bilan tanishish\n\n"
        "Pastdagi tugmani bosing 👇",
        parse_mode="Markdown",
        reply_markup=reply_markup
    )


async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """WebApp dan kelgan ma'lumotlarni qayta ishlash"""
    try:
        data = json.loads(update.message.web_app_data.data)
        user = update.effective_user

        if data.get("action") == "book":
            name = data.get("name", "—")
            phone = data.get("phone", "—")
            service = data.get("service", "—")
            time = data.get("time", "—")
            note = data.get("note", "")

            # Foydalanuvchiga tasdiqlash xabari
            await update.message.reply_text(
                f"✅ *Qabul muvaffaqiyatli band qilindi!*\n\n"
                f"👤 Ism: {name}\n"
                f"📞 Telefon: {phone}\n"
                f"🛠️ Xizmat: {service}\n"
                f"⏰ Vaqt: {time}\n"
                f"📝 Izoh: {note if note else '—'}\n\n"
                f"📍 Manzil: Toshkent, Chilonzor t., 14-uy\n"
                f"📞 Savollar uchun: +998 71 123-45-67\n\n"
                f"Tez orada murojaat qilamiz! 😊",
                parse_mode="Markdown"
            )

            # Adminga xabardor qilish
            if ADMIN_CHAT_ID:
                await context.bot.send_message(
                    chat_id=ADMIN_CHAT_ID,
                    text=(
                        f"🔔 *Yangi qabul so'rovi!*\n\n"
                        f"👤 Foydalanuvchi: {user.first_name} (@{user.username or '—'})\n"
                        f"📋 Ism: {name}\n"
                        f"📞 Telefon: {phone}\n"
                        f"🛠️ Xizmat: {service}\n"
                        f"⏰ Vaqt: {time}\n"
                        f"📝 Izoh: {note if note else '—'}"
                    ),
                    parse_mode="Markdown"
                )

    except Exception as e:
        logger.error(f"WebApp data error: {e}")
        await update.message.reply_text("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📋 *Buyruqlar:*\n\n"
        "/start — Botni ishga tushirish\n"
        "/help — Yordam\n"
        "/info — Klinika haqida ma'lumot\n"
        "/time — Ish vaqtlari",
        parse_mode="Markdown"
    )


async def info_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🏥 *DentCare Tish Shifoxonasi*\n\n"
        "📍 Toshkent, Chilonzor t., 14-uy\n"
        "📞 +998 71 123-45-67\n"
        "⏰ Du–Shan: 09:00 – 19:00\n"
        "⏰ Shanba: 10:00 – 15:00\n"
        "❌ Yakshanba: Yopiq\n\n"
        "👨‍⚕️ 2000+ mamnun bemor\n"
        "🏆 15+ yil tajriba",
        parse_mode="Markdown"
    )


async def time_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "⏰ *Ish vaqtlari:*\n\n"
        "✅ Dushanba: 09:00 – 19:00\n"
        "✅ Seshanba: 09:00 – 19:00\n"
        "✅ Chorshanba: 09:00 – 19:00\n"
        "✅ Payshanba: 09:00 – 19:00\n"
        "✅ Juma: 09:00 – 18:00\n"
        "✅ Shanba: 10:00 – 15:00\n"
        "❌ Yakshanba: Yopiq",
        parse_mode="Markdown"
    )


def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("info", info_cmd))
    app.add_handler(CommandHandler("time", time_cmd))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))

    logger.info("🤖 DentCare boti ishga tushdi!")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
