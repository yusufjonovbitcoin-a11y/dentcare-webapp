// ══════════════════════════════════════════
//  DentCare Pro — App.js
// ══════════════════════════════════════════

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

// ── SPLASH ──────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const s = document.getElementById('splash');
    s.style.opacity = '0';
    s.style.transition = 'opacity .5s';
    setTimeout(() => {
      s.style.display = 'none';
      document.getElementById('app').classList.remove('hidden');
      initGreeting();
      buildDayStrip();
      buildSlots();
      buildServices();
    }, 500);
  }, 1900);
});

// ── GREETING ────────────────────────────────
function initGreeting() {
  const h = new Date().getHours();
  const g = document.getElementById('greeting');
  if (!g) return;
  if (h < 6)  g.textContent = 'Xayrli tun 🌙';
  else if (h < 12) g.textContent = 'Xayrli tong ☀️';
  else if (h < 18) g.textContent = 'Xayrli kun 🌤️';
  else g.textContent = 'Xayrli kech 🌆';
  if (tg?.initDataUnsafe?.user?.first_name) {
    g.textContent += ', ' + tg.initDataUnsafe.user.first_name + '!';
  }
}

// ── NAVIGATION ──────────────────────────────
let currentScreen = 'home';

function goTo(name) {
  if (name === currentScreen) return;

  // Hide current
  document.getElementById('screen-' + currentScreen)?.classList.remove('active');
  document.getElementById('nav-' + currentScreen)?.classList.remove('active');

  // Show new
  const scr = document.getElementById('screen-' + name);
  if (scr) {
    scr.classList.add('active');
    scr.querySelector('.screen-scroll')?.scrollTo(0, 0);
  }
  document.getElementById('nav-' + name)?.classList.add('active');

  currentScreen = name;

  if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
}

// ── UTILS ───────────────────────────────────
function callClinic() {
  window.location.href = 'tel:+998711234567';
}

function openMap() {
  window.open('https://maps.google.com/?q=Toshkent,Chilonzor', '_blank');
}

function haptic(type = 'light') {
  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
}

// ── TOAST ───────────────────────────────────
let toastT;
function showToast(msg, duration = 2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.add('hidden'), duration);
}

// ── MODAL ───────────────────────────────────
function showModal(text) {
  document.getElementById('modal-msg').innerHTML = text;
  document.getElementById('modal-bg').classList.remove('hidden');
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
}

function closeModal() {
  document.getElementById('modal-bg').classList.add('hidden');
}

// ══════════════════════════════════════════
//  SCHEDULE
// ══════════════════════════════════════════
let selectedDay = null;
let selectedSlot = null;
const BUSY = ['10:00','11:30','14:00','15:30','16:00'];

const DAYS_UZ = ['Yak','Du','Se','Cho','Pay','Ju','Sha'];
const MONTHS_UZ = ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'];

function buildDayStrip() {
  const strip = document.getElementById('day-strip');
  if (!strip) return;
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isSun = d.getDay() === 0;

    const pill = document.createElement('div');
    pill.className = 'day-pill' + (isSun ? ' disabled' : '');
    pill.innerHTML = `
      <span class="dp-dow">${DAYS_UZ[d.getDay()]}</span>
      <span class="dp-num">${d.getDate()}</span>
      <span class="dp-avail">${isSun ? 'Yopiq' : 'Bo\'sh'}</span>
    `;
    if (!isSun) {
      pill.onclick = () => selectDay(pill, d);
      if (i === 0) selectDay(pill, d);
    }
    strip.appendChild(pill);
  }
}

function selectDay(pill, date) {
  document.querySelectorAll('.day-pill').forEach(p => p.classList.remove('selected'));
  pill.classList.add('selected');
  selectedDay = date;
  selectedSlot = null;
  buildSlots();
  updateSteps();
  haptic('light');
}

function buildSlots() {
  const wrap = document.getElementById('slots-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  const times = [
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '12:00','12:30','13:00','13:30','14:00','14:30',
    '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'
  ];

  times.forEach(t => {
    const btn = document.createElement('button');
    const isBusy = BUSY.includes(t);
    btn.className = 'slot-btn' + (isBusy ? ' busy' : '');
    btn.textContent = t;
    if (!isBusy) {
      btn.onclick = () => {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        selectedSlot = t;
        updateSteps();
        haptic('light');
      };
    }
    wrap.appendChild(btn);
  });
}

function updateSteps() {
  const s1 = document.getElementById('st1');
  const s2 = document.getElementById('st2');
  const s3 = document.getElementById('st3');
  const l12 = document.getElementById('sl12');
  const l23 = document.getElementById('sl23');
  if (!s1) return;

  if (selectedDay) {
    s1.classList.add('done'); s1.classList.remove('act');
    l12 && l12.classList.add('done');
    s2.classList.add('act');
  }
  if (selectedSlot) {
    s2.classList.add('done'); s2.classList.remove('act');
    l23 && l23.classList.add('done');
    s3.classList.add('act');
  }
}

function submitBooking() {
  const name    = document.getElementById('f-name')?.value.trim();
  const phone   = document.getElementById('f-phone')?.value.trim();
  const service = document.getElementById('f-service')?.value;
  const note    = document.getElementById('f-note')?.value.trim();

  if (!name)    { showToast('❌ Ismingizni kiriting!'); haptic('medium'); return; }
  if (!phone)   { showToast('❌ Telefon raqam kiriting!'); haptic('medium'); return; }
  if (!service) { showToast('❌ Xizmat turini tanlang!'); haptic('medium'); return; }
  if (!selectedSlot) { showToast('❌ Vaqtni tanlang!'); haptic('medium'); return; }

  const d = selectedDay || new Date();
  const dateStr = `${d.getDate()} ${MONTHS_UZ[d.getMonth()]}`;

  const payload = { action:'book', name, phone, service, date: dateStr, time: selectedSlot, note };
  if (tg) {
    try { tg.sendData(JSON.stringify(payload)); } catch(e) {}
  }

  showModal(
    `<b>${name}</b><br><br>` +
    `📅 ${dateStr} — ⏰ ${selectedSlot}<br>` +
    `🛠️ ${service}<br><br>` +
    `Tez orada siz bilan bog'lanamiz 📞`
  );

  // Reset
  document.getElementById('f-name').value = '';
  document.getElementById('f-phone').value = '';
  document.getElementById('f-service').value = '';
  document.getElementById('f-note').value = '';
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('sel'));
  selectedSlot = null;
}

// ══════════════════════════════════════════
//  SERVICES
// ══════════════════════════════════════════
const SERVICES = [
  {
    emoji: '🦷',
    color: '#EFF6FF',
    name: 'Tish davolash',
    price: '50 000 – 150 000 so\'m',
    dur: '⏱ 30–60 daqiqa',
    desc: 'Karies va tish kasalliklarini zamonaviy fotopolymer to\'ldiruvchilar yordamida og\'riqsiz davolaymiz. Anesteziya bilan ishlash imkoniyati mavjud.'
  },
  {
    emoji: '✨',
    color: '#FFFBEB',
    name: 'Tish oqartirish',
    price: '200 000 – 400 000 so\'m',
    dur: '⏱ 60–90 daqiqa',
    desc: 'Professiyonal Zoom Whitening tizimi yordamida tishlarni 8 tonga oqartirish. Xavfsiz gel va LED yorug\'lik texnologiyasi ishlatiladi.'
  },
  {
    emoji: '🔩',
    color: '#F0FDF4',
    name: 'Implant qo\'yish',
    price: '1 500 000 – 3 000 000 so\'m',
    dur: '⏱ 1–3 seansa',
    desc: 'Titanium implantlar (Nobel Biocare) yordamida tushib ketgan tishlarga o\'rin bosuvchi sun\'iy tish o\'rnatish. 10 yillik kafolat.'
  },
  {
    emoji: '😁',
    color: '#F5F3FF',
    name: 'Ortodontik davolash',
    price: '2 000 000 so\'mdan',
    dur: '⏱ 12–24 oy muolaja',
    desc: 'Metal va sershaffof breket tizimlari, shuningdek, shaffof kappalar (aligners) yordamida tishlarni to\'g\'rilaymiz. Bolalar va kattalarga mos.'
  },
  {
    emoji: '🧹',
    color: '#FFF7ED',
    name: 'Tish tozalash',
    price: '80 000 – 120 000 so\'m',
    dur: '⏱ 30–45 daqiqa',
    desc: 'Ultratovush skaleri va Air Flow texnologiyasi bilan tosh (tartar) hamda dog\'larni olib tashlash. Har 6 oyda tavsiya etiladi.'
  },
  {
    emoji: '👶',
    color: '#FDF2F8',
    name: 'Bolalar stomatologiyasi',
    price: '30 000 – 100 000 so\'m',
    dur: '⏱ 20–40 daqiqa',
    desc: 'Maxsus bolalar shifokorimiz 3 yoshdan yuqori bolalarga xizmat ko\'rsatadi. Yumshoq muolajalar va ruhiy qo\'llab-quvvatlash.'
  },
  {
    emoji: '💬',
    color: '#ECFDF5',
    name: 'Bepul konsultatsiya',
    price: '🎁 Bepul',
    dur: '⏱ 20–30 daqiqa',
    desc: 'Birinchi marta tashrif buyuruvchilar uchun shifokor bilan bepul suhbat va tish holati tekshiruvi. Hech qanday majburiyat yo\'q.'
  }
];

function buildServices() {
  renderServices(SERVICES);
}

function renderServices(list) {
  const el = document.getElementById('svc-list');
  if (!el) return;
  el.innerHTML = '';
  list.forEach(s => {
    const card = document.createElement('div');
    card.className = 'svc-card';
    card.innerHTML = `
      <div class="svc-head" onclick="toggleSvc(this.parentElement)">
        <div class="svc-emoji" style="background:${s.color}">${s.emoji}</div>
        <div class="svc-meta">
          <h4>${s.name}</h4>
          <div class="svc-price">${s.price}</div>
        </div>
        <div class="svc-chev">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>
      <div class="svc-body">
        <p>${s.desc}</p>
        <div class="svc-body-footer">
          <span class="svc-dur">${s.dur}</span>
          <button class="svc-book-btn" onclick="goTo('schedule')">📅 Band qilish</button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
}

function toggleSvc(card) {
  const was = card.classList.contains('open');
  document.querySelectorAll('.svc-card').forEach(c => c.classList.remove('open'));
  if (!was) { card.classList.add('open'); }
  haptic('light');
}

function filterServices() {
  const q = document.getElementById('svc-search')?.value.toLowerCase() || '';
  const filtered = SERVICES.filter(s =>
    s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
  );
  renderServices(filtered);
}

// ══════════════════════════════════════════
//  AI CHAT
// ══════════════════════════════════════════
const KB = {
  'vaqt|qabul|band|kela|tashrif|uchrashuv|jadval|qachon': `📅 <b>Qabul vaqtlari:</b><br><br>✅ Dushanba – Juma: 09:00 – 19:00<br>✅ Shanba: 10:00 – 15:00<br>❌ Yakshanba: Yopiq<br><br>Vaqt band qilish uchun <b>"Jadval"</b> tabiga o'ting yoki quyidagi tugmani bosing 👇`,
  'og\'ri|ach|qattiq|sezgi|pulsir|dens|pain|ауру': `🦷 <b>Tish og'rig'i bo'lsa:</b><br><br>1. Ibuprofen yoki Nimesulid iching (og'riq qoldirgich)<br>2. Issiq yoki juda sovuq narsalarni iste'mol qilmang<br>3. Og'rigan tishni tilning yoki qo'lingiz bilan tegmang<br>4. Imkon qadar tezroq shifoxonaga keling<br><br>⚠️ Kechiktirmang — karies tez tarqaladi!<br>📞 <b>+998 71 123-45-67</b>`,
  'narx|pul|necha|qancha|arzon|qimmat|price|cost|стоим': `💰 <b>Xizmatlar narxlari:</b><br><br>🦷 Tish davolash: 50 000–150 000 so'm<br>✨ Oqartirish: 200 000–400 000 so'm<br>🔩 Implant: 1 500 000–3 000 000 so'm<br>😁 Breket: 2 000 000 so'mdan<br>🧹 Tish tozalash: 80 000–120 000 so'm<br>💬 Konsultatsiya: <b>Bepul!</b>`,
  'breket|kappa|to\'g\'ri|ortodont|tekis': `😁 <b>Breket va kappalar:</b><br><br>✅ Yosh chegarasi yo'q (bolalar + kattalar)<br>✅ Metal, sershaffof va shaffof variantlar<br>✅ Davolash muddati: 12–24 oy<br>✅ Oylik ko'riklar bilan nazorat<br><br>💰 2 000 000 so'mdan<br>👩‍⚕️ Dr. Karimova mutaxassis`,
  'implant|protez|sun\'iy|joy': `🔩 <b>Implant qo'yish:</b><br><br>✅ Nobel Biocare titanium implantlari<br>✅ 10 yillik kafolat<br>✅ Anesteziya bilan — og'riqsiz<br>✅ Jarayon: 1–3 seansa<br>✅ Ovqat chaynanishi to'liq tiklanadi<br><br>💰 1 500 000–3 000 000 so'm<br>👨‍⚕️ Dr. Abdullayev mutaxassis`,
  'oqart|whitening|zoom|tish oq': `✨ <b>Tish oqartirish:</b><br><br>🔬 Zoom Whitening tizimi<br>📊 8 tonga oqaradi<br>⏱ Davomiyligi: 60–90 daqiqa<br>✅ Xavfsiz va uzoq davomli natija<br>💧 Vaqtincha sezgirlik bo'lishi mumkin<br><br>💰 200 000–400 000 so'm`,
  'tozala|tosh|dog\'|profgig|ultratovush|air flow': `🧹 <b>Professional tish tozalash:</b><br><br>🔊 Ultratovush skaleri<br>💨 Air Flow texnologiyasi<br>✅ Tosh va dog'larni olib tashlash<br>✅ Milkni sog'lomlashtirish<br><br>💰 80 000–120 000 so'm<br>⏱ 30–45 daqiqa<br>🗓 Har 6 oyda tavsiya etiladi!`,
  'bola|child|farzand|o\'g\'il|qiz|yosh bola': `👶 <b>Bolalar stomatologiyasi:</b><br><br>✅ Maxsus bolalar mutaxassisi<br>✅ 3 yoshdan xizmat ko'rsatamiz<br>✅ Yumshoq va qo'rqmaslik uchun mo'ljallangan muolajalar<br>✅ Birinchi tashrif bepul!<br><br>📞 +998 71 123-45-67`,
  'manzil|adres|qaer|qayerda|joylash|ko\'cha|address': `📍 <b>Manzilimiz:</b><br><br>Toshkent shahri<br>Chilonzor tumani, 14-uy<br><br>🚌 Yaqin metro: Chilonzor<br>🚗 Avtoturg'oq mavjud<br>📞 +998 71 123-45-67`,
  'shifokor|doktor|doctor|vrach|kimlar|kim davolaydi': `👨‍⚕️ <b>Shifokorlarimiz:</b><br><br>🔵 <b>Dr. Abdullayev Jasur</b> — Ortodontist (15 yil) ⭐4.9<br>🟣 <b>Dr. Karimova Zulfiya</b> — Implantolog (12 yil) ⭐4.8<br>🟢 <b>Dr. Yusupov Bobur</b> — Terapevt (10 yil) ⭐4.9<br><br>Barchasi xalqaro sertifikatlarga ega!`,
  'salom|assalom|hi|hello|hey|privet|ассалом': `Salom! 👋😊<br><br>Men <b>DentAI</b> — DentCare klinikasining AI yordamchisiman!<br><br>Quyidagilar bo'yicha yordam bera olaman:<br>📅 Qabul vaqtlari<br>💰 Narxlar<br>🦷 Tish sog'lig'i maslahati<br>📍 Klinika ma'lumotlari<br><br>Savolingizni bering! 🙂`,
  'rahmat|sog\'|xayr|ko\'rishguncha|bye|thanks': `Rahmat! 😊<br><br>Tishlaringiz doim sog' bo'lsin! 🦷✨<br><br>Yana savollar bo'lsa bemalol so'rang. Yoki qabul uchun vaqt oling! 📅`,
  'kafolat|garantiya|garant': `🏆 <b>Kafolatimiz:</b><br><br>✅ Implantlar: 10 yil kafolat<br>✅ To'ldiruvchilar: 2 yil<br>✅ Breket natijasi: doimiy (retentor bilan)<br>✅ Oqartirish: 1–2 yil<br><br>Xizmat sifatiga 100% kafolat beramiz!`,
  'anestezi|og\'riqsiz|uxlat|ukol|novokain': `💉 <b>Og'riqsizlantirish:</b><br><br>✅ Zamonaviy mahalliy anesteziya<br>✅ Igna kirgizishdan oldin surtma anesteziya<br>✅ Og'riq deyarli sezilmaydi<br>✅ Allerjiya tekshiruvi o'tkaziladi<br><br>🦷 Qo'rqmang — biz ehtiyotkorlik bilan ishlaymiz!`,
};

let chatCount = 0;

function getAI(msg) {
  const m = msg.toLowerCase();
  for (const [keys, ans] of Object.entries(KB)) {
    if (keys.split('|').some(k => m.includes(k))) return ans;
  }
  return `Tushundim! 🤔<br><br>Bu savol bo'yicha aniqroq ma'lumot olish uchun shifokorimiz bilan gaplashing:<br><br>📞 <b>+998 71 123-45-67</b><br>📅 Yoki qabul uchun vaqt oling<br><br>Boshqa savollaringiz bo'lsa, yozavering! 😊`;
}

function addMsg(text, who) {
  const box = document.getElementById('chat-msgs');
  if (!box) return;
  const row = document.createElement('div');
  row.className = 'cmsg ' + who;
  row.innerHTML = `
    <div class="cmsg-av">${who === 'bot' ? '🤖' : '👤'}</div>
    <div class="cmsg-bub">${text}</div>
  `;
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
  return row;
}

function sendChat() {
  const inp = document.getElementById('chat-in');
  const txt = inp?.value.trim();
  if (!txt) return;
  inp.value = '';

  // Hide quick chips after first message
  const chips = document.getElementById('q-chips');
  if (chips) chips.style.display = 'none';

  addMsg(txt, 'user');
  haptic('light');

  // Show badge on nav
  if (currentScreen !== 'chat') {
    document.getElementById('nav-bdg')?.classList.remove('hidden');
  }

  // Typing
  const box = document.getElementById('chat-msgs');
  const typingRow = document.createElement('div');
  typingRow.className = 'cmsg bot typing-r';
  typingRow.innerHTML = `
    <div class="cmsg-av">🤖</div>
    <div class="cmsg-bub typing-bub">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  box.appendChild(typingRow);
  box.scrollTop = box.scrollHeight;

  const delay = 700 + Math.random() * 800;
  setTimeout(() => {
    typingRow.remove();
    addMsg(getAI(txt), 'bot');
    chatCount++;
  }, delay);
}

function quickAsk(text) {
  const inp = document.getElementById('chat-in');
  if (inp) inp.value = text;
  sendChat();
}

// Clear badge when entering chat
const origGoTo = goTo;
window.addEventListener('DOMContentLoaded', () => {
  // Patch goTo to clear badge
  const navChat = document.getElementById('nav-chat');
  if (navChat) {
    navChat.addEventListener('click', () => {
      document.getElementById('nav-bdg')?.classList.add('hidden');
    });
  }
});
