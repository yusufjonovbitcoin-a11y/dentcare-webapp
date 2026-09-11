// ===========================
//  DentCare Telegram WebApp JS
// ===========================

// ---------- TELEGRAM SDK ----------
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Apply Telegram theme colors if available
  if (tg.colorScheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

// ---------- SPLASH ----------
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash');
    const app = document.getElementById('app');
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
      app.classList.remove('hidden');
      generateTimeslots();
    }, 500);
  }, 1800);
});

// ---------- TAB SWITCHING ----------
let currentTab = 'home';

function switchTab(tab) {
  // Remove active from all tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  // Activate selected
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');

  currentTab = tab;

  // Haptic feedback
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.selectionChanged();
  }
}

// ---------- TIMESLOTS ----------
let selectedSlot = null;

const busySlots = ['10:00', '11:30', '14:00', '15:30'];

function generateTimeslots() {
  const container = document.getElementById('timeslots');
  const times = [
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '12:00','12:30','13:00','13:30','14:00','14:30',
    '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'
  ];

  times.forEach(time => {
    const btn = document.createElement('button');
    btn.className = 'slot' + (busySlots.includes(time) ? ' busy' : '');
    btn.textContent = time;
    if (!busySlots.includes(time)) {
      btn.onclick = () => selectSlot(btn, time);
    }
    container.appendChild(btn);
  });
}

function selectSlot(btn, time) {
  document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSlot = time;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light');
  }
}

// ---------- BOOKING ----------
function bookAppointment() {
  const name = document.getElementById('book-name').value.trim();
  const phone = document.getElementById('book-phone').value.trim();
  const service = document.getElementById('book-service').value;

  if (!name) { showToast('❌ Ismingizni kiriting!'); return; }
  if (!phone) { showToast('❌ Telefon raqamni kiriting!'); return; }
  if (!service) { showToast('❌ Xizmat turini tanlang!'); return; }
  if (!selectedSlot) { showToast('❌ Vaqtni tanlang!'); return; }

  const note = document.getElementById('book-note').value.trim();

  // Send data to Telegram bot if running inside Telegram
  if (tg) {
    const data = JSON.stringify({
      action: 'book',
      name,
      phone,
      service,
      time: selectedSlot,
      note
    });
    tg.sendData(data);
  }

  // Haptic
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred('success');
  }

  showToast(`✅ ${selectedSlot} — band qilindi!`);

  // Reset form
  setTimeout(() => {
    document.getElementById('book-name').value = '';
    document.getElementById('book-phone').value = '';
    document.getElementById('book-service').value = '';
    document.getElementById('book-note').value = '';
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
    selectedSlot = null;
  }, 2000);
}

// ---------- SERVICE TOGGLE ----------
function toggleService(card) {
  const isExpanded = card.classList.contains('expanded');
  document.querySelectorAll('.service-card').forEach(c => c.classList.remove('expanded'));
  if (!isExpanded) {
    card.classList.add('expanded');
  }
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light');
  }
}

// ---------- AI CHAT ----------
const aiKnowledge = {
  // Keywords -> answers
  'vaqt|qabul|band|kela|tashrif|uchrashuv|appointment': `📅 Qabul uchun quyidagilarni qilishingiz mumkin:\n\n1️⃣ "Ish kunlari" tabiga o'ting\n2️⃣ Qulay vaqtni tanlang\n3️⃣ Ma'lumotlaringizni to'ldiring\n\nDu-Juma: 09:00–19:00\nShanba: 10:00–15:00\nYakshanba: Yopiq ❌`,

  'og\'ri|ach|qattiq|sezgi|dens|pain': `🦷 Tish og'rig'i bo'lsa:\n\n1. Darhol shifoxonaga murojaat qiling\n2. Og'riq qoldirgich ichishingiz mumkin (Ibuprofen)\n3. Issiq yoki juda sovuq ovqat ichmang\n4. Tishni tilging yoki qo'lingiz bilan tegmang\n\n⚠️ Kechiktirmang! Karies tez tarqaladi.\n📞 +998 71 123-45-67`,

  'narx|pul|necha|qancha|arzon|qimmat|price|cost': `💰 Xizmatlar narxlari:\n\n🦷 Tish davolash: 50,000 – 150,000 so'm\n✨ Oqartirish: 200,000 – 400,000 so'm\n🔩 Implant: 1,500,000 – 3,000,000 so'm\n😁 Breket: 2,000,000 so'mdan\n🧹 Tish tozalash: 80,000 – 120,000 so'm\n💬 Konsultatsiya: Bepul!\n\nBatafsil "Xizmatlar" tabida.`,

  'breket|tish tog\'ri|kappa|ortodont': `😁 Breket va kappalар haqida:\n\n✅ Yosh chegarasi yo'q — bolalar ham, kattalar ham taxing qilishi mumkin\n✅ Davolash muddati: 12–24 oy\n✅ Metal va sershaffof breket turlari mavjud\n✅ Shaffof kappalar ham bor (ko'rinmaydi!)\n\n💰 2,000,000 so'mdan boshlanadi\n\nDr. Karimova bilan konsultatsiya uchun vaqt olishingiz mumkin 👩‍⚕️`,

  'implant|joy|ko\'chirish|protez': `🔩 Implant haqida:\n\n✅ Titanium implantlar ishlatamiz\n✅ Nobel Biocare markalari\n✅ Kafolat: 10 yil\n✅ Jarayon: 1–3 kun\n✅ Og'riqsiz anesteziya bilan\n\n💰 1,500,000 – 3,000,000 so'm\n\nDr. Abdullayev mutaxassis implantolog 👨‍⚕️\nBepul konsultatsiya uchun vaqt oling! 📅`,

  'oqart|tish oq|whitening|zoom': `✨ Tish oqartirish:\n\n🔬 Zoom Whitening tizimi ishlatamiz\n📊 8 tonga oqaradi\n⏱ Jarayon: 1–1.5 soat\n✅ Xavfsiz va doimiy natija\n💧 Sezgirlik vaqtincha bo'lishi mumkin\n\n💰 200,000 – 400,000 so'm\n\nBitta seansa kifoya! Bugunoq vaqt oling 📅`,

  'tozala|profgigiy|tosh|dog\'|qora|sariq|clean': `🧹 Professional tish tozalash:\n\n🔊 Ultratovush usuli\n💨 Air Flow texnologiyasi\n✅ Tosh va dog'larni olib tashlash\n✅ Milkni mustahkamlash\n⏱ 30–45 daqiqa\n\n💰 80,000 – 120,000 so'm\n🗓 Har 6 oyda bir marta tavsiya etiladi!\n\nDr. Yusupov qabul qiladi 👨‍⚕️`,

  'bola|child|farzand|o\'g\'il|qiz|yosh': `👶 Bolalar tish davolash:\n\n✅ Maxsus bolalar stomatologi bor\n✅ Og'riqsiz, yumshoq muolajalar\n✅ Animatsiya va sovg'alar (bolalar qo'rqmasin!)\n✅ 3 yoshdan boshlab qabul\n\n⭐ Birinchi tashrif bepul!\n📅 Vaqt olishingiz mumkin`,

  'salom|assalom|hi|hello|hey|privet': `Salom! 👋😊\n\nMen DentCare klinikasining AI yordamchisiman!\n\nSizga quyidagilar bo'yicha yordam bera olaman:\n• 📅 Qabul vaqtlari\n• 💰 Xizmatlar narxi\n• 🦷 Tish davolash maslahat\n• 🏥 Klinika haqida ma'lumot\n\nSavolingizni bering! 🙂`,

  'rahmat|sog\'|xayr|ko\'rishguncha|bye|thanks': `Rahmat! 😊\n\nSiz bilan gaplashganimdan xursandman!\nTishlaringiz doim sog' bo'lsin! 🦷✨\n\nQolgan savollar bo'lsa, bemalol so'rang!\nYoki qabul uchun vaqt oling 📅`,

  'manzil|adres|qaer|qayerda|joylash|kocha|address': `📍 Bizning manzil:\n\nToshkent shahri\nChilonzor tumani, 14-uy\n\n🚌 Metrostantsiya: Chilonzor\n🚗 Avtoturargoh mavjud\n\n📞 +998 71 123-45-67\n⏰ Du-Juma: 09:00–19:00\n⏰ Shanba: 10:00–15:00`,

  'shifokor|doktor|doctor|kimlar|vrach': `👨‍⚕️ Bizning shifokorlarimiz:\n\n🦷 Dr. Abdullayev — Ortodontist (15 yil tajriba) ⭐4.9\n👩‍⚕️ Dr. Karimova — Implantolog (12 yil tajriba) ⭐4.8\n👨‍⚕️ Dr. Yusupov — Terapevt (10 yil tajriba) ⭐4.9\n\nBarcha shifokorlar xalqaro sertifikatlarga ega!\n\n📅 Istalgan shifokordan vaqt olishingiz mumkin.`,
};

function getAIResponse(userMsg) {
  const msg = userMsg.toLowerCase();

  for (const [keywords, answer] of Object.entries(aiKnowledge)) {
    const keys = keywords.split('|');
    if (keys.some(k => msg.includes(k))) {
      return answer;
    }
  }

  // Default response
  return `🤖 Tushundim! Bu savol bo'yicha sizga yordam bera olaman.\n\nAmmo aniqroq javob olish uchun shifokorimiz bilan bevosita gaplashing:\n\n📞 +998 71 123-45-67\n📅 Yoki qabul uchun vaqt oling\n\nBoshqa savolingiz bo'lsa, bemalol so'rang! 😊`;
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  addMessage(text, 'user');

  // Show typing indicator
  const typingId = showTyping();

  // Simulate AI thinking delay
  setTimeout(() => {
    removeTyping(typingId);
    const response = getAIResponse(text);
    addMessage(response, 'bot');
  }, 800 + Math.random() * 700);

  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light');
  }
}

function sendQuick(text) {
  document.getElementById('chat-input').value = text;
  sendMessage();
}

function addMessage(text, sender) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${sender}-msg`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = sender === 'bot' ? '🤖' : '👤';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.style.whiteSpace = 'pre-line';
  bubble.textContent = text;

  div.appendChild(avatar);
  div.appendChild(bubble);
  container.appendChild(div);

  // Auto scroll
  container.scrollTop = container.scrollHeight;
}

let typingCounter = 0;

function showTyping() {
  const id = 'typing-' + (++typingCounter);
  const container = document.getElementById('chat-messages');

  const div = document.createElement('div');
  div.className = 'message bot-msg';
  div.id = id;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

  div.appendChild(avatar);
  div.appendChild(bubble);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ---------- TOAST ----------
let toastTimeout;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

// ---------- TELEGRAM MAIN BUTTON ----------
if (tg) {
  // Show main button on schedule tab
  tg.MainButton.setText('📅 Vaqt band qilish');
  tg.MainButton.color = '#1565C0';
}
