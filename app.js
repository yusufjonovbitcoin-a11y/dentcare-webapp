// ══════════════════════════════════════════════
//  DentCare — iOS App Logic
// ══════════════════════════════════════════════

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor('#F2F2F7'); }

// ── LAUNCH ─────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const launch = document.getElementById('launch');
    launch.style.opacity = '0';
    setTimeout(() => {
      launch.style.display = 'none';
      document.getElementById('app').classList.remove('hidden');
      buildCalendar();
      buildTimeSlots();
      buildServices();
    }, 400);
  }, 1800);
});

// ── TAB SWITCHING ──────────────────────────────
let activeTab = 'home';

function switchTab(name) {
  if (name === activeTab) {
    // Scroll to top if same tab tapped
    document.querySelector(`#tab-${name} .scroll-view`)?.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  document.getElementById('tab-' + activeTab)?.classList.remove('active');
  document.getElementById('tb-' + activeTab)?.classList.remove('active');

  document.getElementById('tab-' + name)?.classList.add('active');
  document.getElementById('tb-' + name)?.classList.add('active');

  activeTab = name;
  haptic('selection');

  if (name === 'chat') {
    document.getElementById('tb-badge')?.classList.add('hidden');
    setTimeout(() => document.getElementById('chat-msgs')?.scrollTo({ top: 99999 }), 100);
  }
}

// ── HAPTIC ─────────────────────────────────────
function haptic(type = 'light') {
  if (!tg?.HapticFeedback) return;
  if (type === 'selection') tg.HapticFeedback.selectionChanged();
  else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
  else if (type === 'error') tg.HapticFeedback.notificationOccurred('error');
  else tg.HapticFeedback.impactOccurred(type);
}

// ── UTILS ──────────────────────────────────────
function callClinic() { window.location.href = 'tel:+998711234567'; }
function openMap() { window.open('https://maps.google.com/?q=Toshkent+Chilonzor', '_blank'); }

const DOW = ['Yak','Du','Se','Cho','Pay','Ju','Sha'];
const MON = ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'];

// ── TOAST ──────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('ios-toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
}

// ── SHEETS ─────────────────────────────────────
function openNotifSheet() {
  document.getElementById('notif-sheet-bg')?.classList.remove('hidden');
  haptic('light');
}
function closeNotifSheet() {
  document.getElementById('notif-sheet-bg')?.classList.add('hidden');
}
function closeSuccessSheet() {
  document.getElementById('success-sheet-bg')?.classList.add('hidden');
}
function showSuccessSheet(html) {
  document.getElementById('success-desc').innerHTML = html;
  document.getElementById('success-sheet-bg')?.classList.remove('hidden');
  haptic('success');
}

// ══════════════════════════════════════════════
//  SCHEDULE
// ══════════════════════════════════════════════
let selDay = null;
let selSlot = null;
const BUSY_SLOTS = ['10:00','11:30','14:00','15:30','16:00'];
const ALL_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'
];

function buildCalendar() {
  const strip = document.getElementById('cal-strip');
  if (!strip) return;
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isSun = d.getDay() === 0;

    const el = document.createElement('div');
    el.className = 'cal-day' + (isSun ? ' disabled' : '');
    el.innerHTML = `
      <span class="cd-dow">${DOW[d.getDay()]}</span>
      <span class="cd-num">${d.getDate()}</span>
      <div class="cd-dot"></div>
    `;
    if (!isSun) {
      el.onclick = () => pickDay(el, d);
      if (i === 0) setTimeout(() => pickDay(el, d), 50);
    }
    strip.appendChild(el);
  }
}

function pickDay(el, date) {
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  selDay = date;
  selSlot = null;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));

  const label = document.getElementById('sel-date-lbl');
  if (label) label.textContent = `— ${date.getDate()} ${MON[date.getMonth()]}`;
  haptic('light');
}

function buildTimeSlots() {
  const grid = document.getElementById('time-grid');
  if (!grid) return;
  grid.innerHTML = '';

  ALL_SLOTS.forEach(t => {
    const busy = BUSY_SLOTS.includes(t);
    const btn = document.createElement('button');
    btn.className = 'time-slot' + (busy ? ' busy' : '');
    btn.textContent = t;
    if (!busy) {
      btn.onclick = () => {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');
        selSlot = t;
        haptic('light');
      };
    }
    grid.appendChild(btn);
  });
}

function submitBooking() {
  const name    = document.getElementById('f-name').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const service = document.getElementById('f-service').value;
  const note    = document.getElementById('f-note').value.trim();

  if (!name)    { showToast('❌ Ism kiriting'); haptic('error'); return; }
  if (!phone)   { showToast('❌ Telefon kiriting'); haptic('error'); return; }
  if (!service) { showToast('❌ Xizmat tanlang'); haptic('error'); return; }
  if (!selSlot) { showToast('❌ Vaqt tanlang'); haptic('error'); return; }

  const d = selDay || new Date();
  const dateStr = `${d.getDate()} ${MON[d.getMonth()]}`;

  const payload = { action:'book', name, phone, service, date: dateStr, time: selSlot, note };
  if (tg) { try { tg.sendData(JSON.stringify(payload)); } catch(e) {} }

  showSuccessSheet(
    `<b>${name}</b> uchun qabul band qilindi.<br><br>` +
    `📅 ${dateStr} · ⏰ ${selSlot}<br>` +
    `${service}<br><br>` +
    `Tez orada siz bilan bog'lanamiz. 📞`
  );

  // Reset
  document.getElementById('f-name').value = '';
  document.getElementById('f-phone').value = '';
  document.getElementById('f-service').value = '';
  document.getElementById('f-note').value = '';
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  selSlot = null;
}

// ══════════════════════════════════════════════
//  SERVICES
// ══════════════════════════════════════════════
const SVCS = [
  { emoji:'🦷', bg:'#EBF5FF', name:'Tish davolash', price:'50 000 – 150 000 so\'m', dur:'30–60 daqiqa',
    desc:'Karies va tish kasalliklarini zamonaviy fotopolymer to\'ldiruvchilar bilan og\'riqsiz davolaymiz. Anesteziya imkoniyati mavjud.' },
  { emoji:'✨', bg:'#FFFBEB', name:'Tish oqartirish', price:'200 000 – 400 000 so\'m', dur:'60–90 daqiqa',
    desc:'Zoom Whitening tizimi yordamida tishlarni 8 tonga oqartirish. LED texnologiyasi va xavfsiz gel ishlatiladi.' },
  { emoji:'🔩', bg:'#F0FDF4', name:'Implant qo\'yish', price:'1 500 000 – 3 000 000 so\'m', dur:'1–3 seansa',
    desc:'Nobel Biocare titanium implantlari. 10 yillik kafolat. Og\'riqsiz anesteziya bilan o\'tkaziladi.' },
  { emoji:'😁', bg:'#F5F0FF', name:'Ortodontik davolash', price:'2 000 000 so\'mdan', dur:'12–24 oy',
    desc:'Metal va sershaffof breket tizimlari, shaffof kappalar (aligners). Bolalar va kattalar uchun.' },
  { emoji:'🧹', bg:'#FFF7ED', name:'Tish tozalash', price:'80 000 – 120 000 so\'m', dur:'30–45 daqiqa',
    desc:'Ultratovush skaleri va Air Flow texnologiyasi. Tosh va dog\'larni olib tashlash. Har 6 oyda tavsiya etiladi.' },
  { emoji:'👶', bg:'#FDF2F8', name:'Bolalar stomatologiyasi', price:'30 000 – 100 000 so\'m', dur:'20–40 daqiqa',
    desc:'3 yoshdan yuqori bolalar uchun maxsus shifokor. Yumshoq va qo\'rqmaslik uchun mo\'ljallangan muolajalar.' },
  { emoji:'💬', bg:'#ECFDF5', name:'Bepul konsultatsiya', price:'🎁 Bepul', dur:'20–30 daqiqa',
    desc:'Birinchi tashrif buyuruvchilar uchun bepul suhbat va tish holati tekshiruvi. Majburiyat yo\'q.' },
];

function buildServices() {
  renderSvcs(SVCS);
}

function renderSvcs(list) {
  const el = document.getElementById('svc-container');
  if (!el) return;
  el.innerHTML = '';
  if (list.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:#8E8E93;padding:40px 0;font-size:15px">Hech narsa topilmadi 🔍</div>';
    return;
  }
  list.forEach(s => {
    const card = document.createElement('div');
    card.className = 'svc-item';
    card.innerHTML = `
      <div class="svc-row" onclick="toggleSvc(this.parentElement)">
        <div class="svc-ico" style="background:${s.bg}">${s.emoji}</div>
        <div class="svc-info">
          <h4>${s.name}</h4>
          <div class="svc-price">${s.price}</div>
        </div>
        <div class="svc-chev">
          <svg width="8" height="13" viewBox="0 0 8 13"><path d="M1 1l6 5.5L1 12" stroke="#C7C7CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="svc-detail">
        <p>${s.desc}</p>
        <div class="svc-detail-foot">
          <span class="svc-dur">⏱ ${s.dur}</span>
          <button class="svc-book" onclick="switchTab('schedule')">Band qilish</button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
}

function toggleSvc(card) {
  const open = card.classList.contains('expanded');
  document.querySelectorAll('.svc-item').forEach(c => c.classList.remove('expanded'));
  if (!open) card.classList.add('expanded');
  haptic('light');
}

function filterSvc() {
  const q = (document.getElementById('svc-q')?.value || '').toLowerCase();
  renderSvcs(SVCS.filter(s =>
    s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
  ));
}

// ══════════════════════════════════════════════
//  AI CHAT
// ══════════════════════════════════════════════
const KB = {
  'vaqt|qabul|band|kela|uchrashuv|jadval|qachon|soat':
    `📅 <b>Qabul vaqtlari:</b><br><br>✅ Du–Juma: 09:00 – 19:00<br>✅ Shanba: 10:00 – 15:00<br>❌ Yakshanba: Yopiq<br><br>Vaqt band qilish uchun <b>Jadval</b> bo'limiga o'ting.`,

  'og\'ri|ach|qattiq|sezgi|pulsir|pain|ауру|og\'riq':
    `🦷 <b>Tish og'rig'i bo'lsa:</b><br><br>① Ibuprofen yoki Nimesulid iching<br>② Issiq/sovuq ovqat iste'mol qilmang<br>③ Og'rigan tishga tegmang<br>④ Imkon qadar tezroq keling<br><br>⚠️ Kechiktirmang!<br>📞 <b>+998 71 123-45-67</b>`,

  'narx|pul|necha|qancha|arzon|qimmat|price|cost':
    `💰 <b>Narxlar ro'yxati:</b><br><br>🦷 Tish davolash — 50–150 ming so'm<br>✨ Oqartirish — 200–400 ming so'm<br>🔩 Implant — 1.5–3 mln so'm<br>😁 Breket — 2 mln so'mdan<br>🧹 Tish tozalash — 80–120 ming so'm<br>💬 Konsultatsiya — <b>Bepul!</b>`,

  'breket|kappa|to\'g\'ri|ortodont|tekis|align':
    `😁 <b>Breket va kappalar:</b><br><br>✅ Yosh chegarasi yo'q<br>✅ Metal, sershaffof, shaffof variantlar<br>✅ Davolash: 12–24 oy<br>✅ Oylik ko'rik bilan nazorat<br><br>💰 2 mln so'mdan<br>👩‍⚕️ Dr. Karimova mutaxassis`,

  'implant|protez|sun\'iy|joy':
    `🔩 <b>Dental Implant:</b><br><br>✅ Nobel Biocare titanium<br>✅ 10 yillik kafolat<br>✅ Og'riqsiz anesteziya<br>✅ 1–3 seansa<br><br>💰 1.5–3 mln so'm<br>👨‍⚕️ Dr. Abdullayev mutaxassis`,

  'oqart|whitening|zoom|tish oq':
    `✨ <b>Tish oqartirish:</b><br><br>🔬 Zoom Whitening tizimi<br>📊 8 tonga oqaradi<br>⏱ 60–90 daqiqa<br>✅ Xavfsiz va uzoq muddatli<br><br>💰 200–400 ming so'm`,

  'tozala|tosh|dog\'|profgig|ultratovush':
    `🧹 <b>Professional tozalash:</b><br><br>🔊 Ultratovush skaleri<br>💨 Air Flow texnologiyasi<br>✅ Tosh va dog'larni olib tashlash<br>⏱ 30–45 daqiqa<br><br>💰 80–120 ming so'm<br>🗓 Har 6 oyda tavsiya etiladi`,

  'bola|child|farzand|yosh bola|bola uchun':
    `👶 <b>Bolalar stomatologiyasi:</b><br><br>✅ 3 yoshdan qabul qilamiz<br>✅ Maxsus bolalar mutaxassisi<br>✅ Yumshoq, qo'rqmaslik texnikasi<br>✅ Birinchi tashrif bepul!`,

  'manzil|adres|qaer|qayerda|joylash|ko\'cha':
    `📍 <b>Manzilimiz:</b><br><br>Toshkent sh., Chilonzor t., 14-uy<br><br>🚌 Yaqin metro: Chilonzor<br>🚗 Bepul avtoturargoh<br>📞 +998 71 123-45-67`,

  'shifokor|doktor|vrach|kimlar':
    `👨‍⚕️ <b>Shifokorlarimiz:</b><br><br>🔵 Dr. Abdullayev — Ortodontist ⭐4.9<br>🟣 Dr. Karimova — Implantolog ⭐4.8<br>🟢 Dr. Yusupov — Terapevt ⭐4.9<br><br>Barchasi xalqaro sertifikatlarga ega`,

  'kafolat|garantiya':
    `🏆 <b>Kafolatimiz:</b><br><br>✅ Implantlar: 10 yil<br>✅ To'ldiruvchilar: 2 yil<br>✅ Oqartirish: 1–2 yil<br>✅ 100% sifat kafolati`,

  'anestezi|og\'riqsiz|uxlat|ukol':
    `💉 <b>Anesteziya:</b><br><br>✅ Zamonaviy mahalliy anesteziya<br>✅ Igna kirishidan oldin surtma<br>✅ Og'riq deyarli sezilmaydi<br>✅ Allerjiya tekshiruvi o'tkaziladi`,

  'salom|assalom|hi|hello|hey|privet|ассалом':
    `Salom! 👋<br><br>Men <b>DentAI</b> — DentCare klinikasining AI yordamchisiman. Tish sog'lig'i bo'yicha istalgan savolingizga javob bera olaman! 🦷`,

  'rahmat|sog\'|xayr|bye|thanks|ko\'rishguncha':
    `Rahmat! 😊<br><br>Tishlaringiz doim sog' bo'lsin! 🦷✨<br>Yana savollar bo'lsa, bemalol yozing!`,
};

function getAIAnswer(msg) {
  const m = msg.toLowerCase();
  for (const [keys, ans] of Object.entries(KB)) {
    if (keys.split('|').some(k => m.includes(k))) return ans;
  }
  return `Tushundim 🤔<br><br>Bu haqda aniqroq ma'lumot olish uchun:<br><br>📞 <b>+998 71 123-45-67</b><br><br>Yoki <b>Jadval</b> bo'limidan qabul uchun vaqt oling. Boshqa savollaringiz bo'lsa yozing! 😊`;
}

function appendMsg(html, who) {
  const box = document.getElementById('chat-msgs');
  if (!box) return;
  const row = document.createElement('div');
  row.className = `chat-row ${who === 'bot' ? 'bot-row' : 'user-row'}`;
  if (who === 'bot') {
    row.innerHTML = `<div class="chat-av-sm">🤖</div><div class="chat-bubble bot-bubble">${html}</div>`;
  } else {
    row.innerHTML = `<div class="chat-bubble user-bubble">${html}</div>`;
  }
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
}

function showTyping() {
  const box = document.getElementById('chat-msgs');
  const el = document.createElement('div');
  el.className = 'chat-row bot-row typing-indicator';
  el.innerHTML = `<div class="chat-av-sm">🤖</div><div class="typing-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
  return el;
}

let chatStarted = false;

function sendMsg() {
  const inp = document.getElementById('chat-field');
  const txt = inp?.value.trim();
  if (!txt) return;
  inp.value = '';

  if (!chatStarted) {
    const sugg = document.getElementById('suggestions');
    if (sugg) sugg.style.display = 'none';
    chatStarted = true;
  }

  appendMsg(txt, 'user');
  haptic('light');

  if (activeTab !== 'chat') {
    document.getElementById('tb-badge')?.classList.remove('hidden');
  }

  const typer = showTyping();
  setTimeout(() => {
    typer.remove();
    appendMsg(getAIAnswer(txt), 'bot');
  }, 700 + Math.random() * 700);
}

function quickChat(text) {
  const inp = document.getElementById('chat-field');
  if (inp) inp.value = text;
  sendMsg();
}
