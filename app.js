// ═══════════════════════════════════════════════════════════════════
//  DentCare — iOS Native Controller & Logic
// ═══════════════════════════════════════════════════════════════════

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#F2F2F7');
    tg.setBackgroundColor('#F2F2F7');
  } catch (e) {}
}

// ── State Management ──
let currentTab = 'home';
let selectedDateObj = null;
let selectedTimeSlot = null;
let currentDoctorFilter = 'all';

const DAYS_SHORT = ['Yak', 'Du', 'Se', 'Cho', 'Pay', 'Ju', 'Sha'];
const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

// Xizmatlar ro'yxati
const SERVICES_DATA = [
  {
    id: 'therapy',
    name: 'Tish davolash (Karies & Terapiya)',
    category: 'Davolash',
    price: '70 000 – 180 000 so\'m',
    duration: '40 daqiqa',
    description: 'Germaniyaning Dentsply Sirona fotopolimer kompozitlari bilan tishlarni tabiiy shaklda restavratsiya qilish va og\'riqsiz davolash.'
  },
  {
    id: 'hygiene',
    name: 'Professional gigiyena (Air Flow)',
    category: 'Profilaktika',
    price: '120 000 – 180 000 so\'m',
    duration: '45 daqiqa',
    description: 'EMS (Shveysariya) ultratovush skaleri va mayda kukunli Air Flow yordamida tish toshlari va kofe/choy dog\'larini zararsiz tozalash.'
  },
  {
    id: 'whitening',
    name: 'Tishlarni oqartirish (Zoom 4)',
    category: 'Estetika',
    price: '450 000 – 900 000 so\'m',
    duration: '60 daqiqa',
    description: 'Philips Zoom 4 eng so\'nggi avlod sovuq LED nuri bilan tish emalini zararlamasdan 6-8 tongacha xavfsiz oqartirish.'
  },
  {
    id: 'implant',
    name: 'Implantatsiya (Nobel Biocare)',
    category: 'Jarrohlik',
    price: '1 800 000 – 3 500 000 so\'m',
    duration: '45 daqiqa',
    description: 'Shveysariya va Janubiy Koreya (Osstem) titan implantlari. 100% integratsiya kafolati va umrbod xizmat.'
  },
  {
    id: 'orthodontics',
    name: 'Breket tizimlari (Metall / Keramika)',
    category: 'Ortodontiya',
    price: '2 500 000 so\'mdan',
    duration: 'Muolaja kursi',
    description: 'Damon Q samoligiruvchi metall va shaffof sapfir breketlar. Tish qatorini to\'g\'rilash va to\'g\'ri tishlashni shakllantirish.'
  },
  {
    id: 'consultation',
    name: 'Bepul konsultatsiya va rentgen',
    category: 'Tashxis',
    price: 'Bepul',
    duration: '20 daqiqa',
    description: 'Birinchi marotaba tashrif buyuruvchilar uchun shifokor ko\'rigi, tish holatini 3D tekshirish va shaxsiy davolash rejasi.'
  }
];

// ── Tab Switching ──
function switchTab(tabId) {
  if (tabId === currentTab) {
    // Agar o'sha tab bo'lsa yuqoriga qaytarish
    const activeScroll = document.querySelector(`#tab-${tabId} .ios-scroll-content`);
    if (activeScroll) activeScroll.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Oldingisini o'chirish
  document.getElementById(`tab-${currentTab}`)?.classList.remove('active');
  document.getElementById(`tab-btn-${currentTab}`)?.classList.remove('active');

  // Yangisini yoqish
  const nextTab = document.getElementById(`tab-${tabId}`);
  const nextBtn = document.getElementById(`tab-btn-${tabId}`);

  if (nextTab && nextBtn) {
    nextTab.classList.add('active');
    nextBtn.classList.add('active');
    currentTab = tabId;
  }

  hapticFeedback('selection');

  if (tabId === 'chat') {
    document.getElementById('chat-tab-dot')?.classList.add('hidden');
    scrollChatBottom();
  }
}

// ── Haptic Feedback Helpers ──
function hapticFeedback(style) {
  if (!tg?.HapticFeedback) return;
  if (style === 'selection') tg.HapticFeedback.selectionChanged();
  else if (style === 'success') tg.HapticFeedback.notificationOccurred('success');
  else if (style === 'warning') tg.HapticFeedback.notificationOccurred('warning');
  else if (style === 'error') tg.HapticFeedback.notificationOccurred('error');
  else tg.HapticFeedback.impactOccurred(style || 'light');
}

// ── Calendar Strip Builder ──
function initCalendarStrip() {
  const container = document.getElementById('cal-strip');
  if (!container) return;
  container.innerHTML = '';

  const now = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const isSunday = d.getDay() === 0;
    const isToday = i === 0;

    const pill = document.createElement('div');
    pill.className = `cal-pill ${isToday ? 'active' : ''} ${isSunday ? 'disabled' : 'has-slots'}`;
    pill.dataset.date = d.toISOString();

    pill.innerHTML = `
      <span class="cal-pill-day">${DAYS_SHORT[d.getDay()]}</span>
      <span class="cal-pill-date">${d.getDate()}</span>
      <span class="cal-pill-dot"></span>
    `;

    if (!isSunday) {
      pill.onclick = () => onSelectDate(d, pill);
    }

    container.appendChild(pill);

    if (isToday) {
      selectedDateObj = d;
      updateDatePreview(d);
    }
  }

  renderTimeSlots();
}

function onSelectDate(date, pillEl) {
  document.querySelectorAll('.cal-pill').forEach(p => p.classList.remove('active'));
  pillEl.classList.add('active');
  selectedDateObj = date;
  selectedTimeSlot = null;
  updateDatePreview(date);
  renderTimeSlots();
  hapticFeedback('selection');
}

function updateDatePreview(date) {
  const el = document.getElementById('selected-date-preview');
  if (!el) return;
  const isToday = new Date().toDateString() === date.toDateString();
  if (isToday) {
    el.textContent = `Bugun, ${date.getDate()}-${MONTHS_SHORT[date.getMonth()]}`;
  } else {
    el.textContent = `${DAYS_SHORT[date.getDay()]}, ${date.getDate()}-${MONTHS_SHORT[date.getMonth()]}`;
  }
}

// ── Time Slots Builder ──
function renderTimeSlots() {
  const container = document.getElementById('slots-container');
  if (!container) return;
  container.innerHTML = '';

  const slots = [
    '09:00', '09:45', '10:30', '11:15',
    '12:00', '14:00', '14:45', '15:30',
    '16:15', '17:00', '17:45', '18:30'
  ];

  // Imitate booked slots
  const busySlots = ['10:30', '14:00', '16:15'];

  slots.forEach(slot => {
    const isBusy = busySlots.includes(slot);
    const btn = document.createElement('button');
    btn.className = `time-slot-btn ${isBusy ? 'disabled' : ''}`;
    btn.textContent = slot;

    if (!isBusy) {
      btn.onclick = () => {
        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTimeSlot = slot;
        hapticFeedback('light');
      };
    }

    container.appendChild(btn);
  });
}

function filterDoctorSlot(type) {
  currentDoctorFilter = type;
  document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`seg-${type}`)?.classList.add('active');
  renderTimeSlots();
  hapticFeedback('selection');
}

// ── Quick Doctor select helper ──
function selectDoctorAndBook(doctorName) {
  switchTab('schedule');
  const noteInput = document.getElementById('f-note');
  if (noteInput) {
    noteInput.value = `Shifokor: ${doctorName}`;
  }
}

// ── Booking Action ──
function submitBooking() {
  const name = document.getElementById('f-name')?.value.trim();
  const phone = document.getElementById('f-phone')?.value.trim();
  const service = document.getElementById('f-service')?.value;
  const note = document.getElementById('f-note')?.value.trim() || '—';

  if (!name) {
    showIslandBanner('Ismni kiriting', 'Iltimos, ismingizni to\'liq yozing');
    hapticFeedback('warning');
    return;
  }
  if (!phone || phone.length < 9) {
    showIslandBanner('Telefon raqam', 'Telefon raqamni to\'g\'ri kiriting');
    hapticFeedback('warning');
    return;
  }
  if (!service) {
    showIslandBanner('Xizmat turi', 'Qaysi xizmat kerakligini tanlang');
    hapticFeedback('warning');
    return;
  }
  if (!selectedTimeSlot) {
    showIslandBanner('Vaqt belgilanmadi', 'Iltimos, bo\'sh soatlardan birini tanlang');
    hapticFeedback('warning');
    return;
  }

  const d = selectedDateObj || new Date();
  const dateFormatted = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}, ${DAYS_SHORT[d.getDay()]}`;

  const bookingData = {
    action: 'book',
    name,
    phone,
    service,
    date: dateFormatted,
    time: selectedTimeSlot,
    note
  };

  // Send to Telegram WebApp Bot
  if (tg) {
    try {
      tg.sendData(JSON.stringify(bookingData));
    } catch (e) {
      console.log('tg.sendData error:', e);
    }
  }

  // Render Confirmation Sheet
  const summaryBox = document.getElementById('confirmed-summary-box');
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="ios-row">
        <span class="ios-row-title">Sana va vaqt</span>
        <span class="ios-detail-label">${dateFormatted} · ${selectedTimeSlot}</span>
      </div>
      <div class="ios-row">
        <span class="ios-row-title">Bemor</span>
        <span class="ios-detail-label">${name}</span>
      </div>
      <div class="ios-row">
        <span class="ios-row-title">Xizmat</span>
        <span class="ios-detail-label">${service}</span>
      </div>
      <div class="ios-row">
        <span class="ios-row-title">Telefon</span>
        <span class="ios-detail-label">${phone}</span>
      </div>
    `;
  }

  document.getElementById('booking-sheet-backdrop')?.classList.remove('hidden');
  hapticFeedback('success');

  // Reset form
  document.getElementById('f-name').value = '';
  document.getElementById('f-phone').value = '';
  document.getElementById('f-service').value = '';
  document.getElementById('f-note').value = '';
  document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
  selectedTimeSlot = null;
}

function closeBookingSheet() {
  document.getElementById('booking-sheet-backdrop')?.classList.add('hidden');
}

// ── Notifications Sheet ──
function openNotifSheet() {
  document.getElementById('notif-sheet-backdrop')?.classList.remove('hidden');
  hapticFeedback('light');
}

function closeNotifSheet() {
  document.getElementById('notif-sheet-backdrop')?.classList.add('hidden');
}

// ── Services Section Rendering & Search ──
function renderServicesList(items) {
  const container = document.getElementById('services-list-group');
  const countHeader = document.getElementById('services-count-header');
  if (!container) return;

  if (countHeader) countHeader.textContent = `BARCHA XIZMATLAR (${items.length})`;
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `
      <div class="ios-row">
        <span class="ios-row-subtitle" style="padding: 12px 0;">Qidiruv bo'yicha xizmat topilmadi.</span>
      </div>
    `;
    return;
  }

  items.forEach((svc, index) => {
    const row = document.createElement('div');
    row.className = 'ios-service-wrapper';
    row.innerHTML = `
      <div class="ios-row" onclick="toggleServiceDetail(${index})">
        <div class="ios-sf-badge" style="background:#007AFF;">
          <svg class="sf-badge-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
        </div>
        <div class="ios-row-content">
          <span class="ios-row-title">${svc.name}</span>
          <span class="ios-row-subtitle">${svc.category} · ⏱ ${svc.duration}</span>
        </div>
        <span class="ios-detail-label" style="font-weight:600; color:var(--ios-blue);">${svc.price}</span>
        <svg class="sf-chevron" id="chevron-${index}" viewBox="0 0 8 13"><path d="M1.5 1.5l5 5-5 5"/></svg>
      </div>
      <div class="service-expand-body" id="svc-detail-${index}">
        <p>${svc.description}</p>
        <button class="service-book-mini-btn" onclick="bookFromService('${svc.name}')">Vaqt band qilish</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function toggleServiceDetail(index) {
  const detail = document.getElementById(`svc-detail-${index}`);
  const chevron = document.getElementById(`chevron-${index}`);
  if (!detail) return;

  const isOpen = detail.classList.contains('open');
  document.querySelectorAll('.service-expand-body').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.sf-chevron').forEach(el => el.style.transform = 'none');

  if (!isOpen) {
    detail.classList.add('open');
    if (chevron) chevron.style.transform = 'rotate(90deg)';
  }
  hapticFeedback('light');
}

function bookFromService(svcName) {
  switchTab('schedule');
  const sel = document.getElementById('f-service');
  if (sel) {
    for (let opt of sel.options) {
      if (opt.value.includes(svcName.slice(0, 8))) {
        sel.value = opt.value;
        break;
      }
    }
  }
}

function onServiceSearch() {
  const input = document.getElementById('service-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const q = (input?.value || '').toLowerCase().trim();

  if (clearBtn) {
    if (q.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  const filtered = SERVICES_DATA.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  );

  renderServicesList(filtered);
}

function clearServiceSearch() {
  const input = document.getElementById('service-search-input');
  if (input) input.value = '';
  document.getElementById('search-clear-btn')?.classList.add('hidden');
  renderServicesList(SERVICES_DATA);
}

// ── iMessage AI Chat Engine ──
const AI_KNOWLEDGE = {
  'og\'ri|achish|yallig\'|puls': `Tish og'rig'i bo'lganda quyidagi tavsiyalarga amal qiling:\n\n1. Og'riq qoldiruvchi (Ibuprofen yoki Nimesulid) qabul qilishingiz mumkin;\n2. Iliq tuzli suv (1 stakan suvga 1 choy qoshiq tuz) bilan chayqang;\n3. Hech qachon og'rigan tish ustiga issiq kompress qo'ymang;\n4. Karies yoki pulpit kuchaymasligi uchun zudlik bilan shifokor ko'rigiga yoziling.\n\nKlinikamiz bugun soat 19:00 gacha ishlaydi: +998 71 123-45-67`,

  'vaqt|qabul|soat|jadval|qachon': `DentCare klinikasining ish jadvali:\n\n• Dushanba – Shanba: 09:00 dan 19:00 gacha;\n• Tushlik tanaffusisiz;\n• Yakshanba: Dam olish kuni.\n\nQabulga yozilish uchun "Jadval" bo'limiga o'ting yoki xohlagan bo'sh vaqtingizni ayting.`,

  'narx|pul|qancha|to\'lov|summa': `Asosiy xizmatlar narxi:\n\n• Bepul konsultatsiya va tekshiruv — 0 so'm\n• Tish davolash (plomba) — 70 000 so'mdan\n• Air Flow tozalash — 120 000 so'mdan\n• Zoom 4 oqartirish — 450 000 so'mdan\n• Titan implant — 1 800 000 so'mdan\n• Breket tizimi — 2 500 000 so'mdan\n\nBarcha to'lovlar naqd, Uzcard, Humo va Payme orqali qabul qilinadi.`,

  'breket|qiyshiq|to\'g\'ri|ortodont': `Breketlar tish qatoridagi nuqsonlarni to'liq to'g'rilaydi:\n\n• Yosh chegarasi: 12 yoshdan kattalargacha barchaga to'g'ri keladi;\n• Turlari: Metall (mustahkam) va Shaffof keramika/sapfir (ko'rinmaydi);\n• Muolaja davomiyligi: o'rtacha 12 – 18 oy;\n\nOrtodontimiz Dr. Jasur Abdullayev bilan dastlabki bepul konsultatsiyaga yozilishingiz mumkin.`,

  'implant|tushgan|ildiz|suyak': `Titanium implantatsiya — tushib ketgan tish o'rnini 100% tiklaydi:\n\n• Titan vinti to'qimaga to'liq moslashadi (biomoslashuvchan);\n• Shveysariya (Nobel) va Koreya (Osstem) tizimlaridan foydalanamiz;\n• Jarayon mahalliy anesteziya bilan mutlaqo og'riqsiz kechadi;\n• 10 yillik rasmiy kafolat beriladi.`,

  'manzil|qaer|qayerda|metro|joy': `Manzilimiz:\n\nToshkent shahri, Chilonzor tumani, 14-uy.\nMo'ljal: Mirzo Ulug'bek metro bekati yonida.\nAvtomobil uchun bepul to'xtash joyi mavjud.\nTelefon: +998 71 123-45-67`,

  'salom|assalom|qalaysiz|qalesiz': `Assalomu alaykum! DentCare sun'iy intellekt xizmati sizni qutlaydi. Tish parvarishi, qabul soatlari yoki shifokorlarimiz bo'yicha qanday savolingiz bor?`,

  'rahmat|tashakkur|spasibo': `Salomat bo'ling! Tishlaringiz doimo sog'lom va oppoq bo'lsin. Savollaringiz bo'lsa har doim xizmatingizdamiz! 😊`
};

function getAIResponse(userText) {
  const lower = userText.toLowerCase();
  for (let key in AI_KNOWLEDGE) {
    const patterns = key.split('|');
    if (patterns.some(p => lower.includes(p))) {
      return AI_KNOWLEDGE[key];
    }
  }
  return `Tushundim. Tishingiz holati bo'yicha aniq tashxis qo'yish uchun shifokorimiz ko'rigi zarur. "Jadval" bo'limidan bepul konsultatsiyaga yozilishingiz yoki to'g'ridan-to'g'ri +998 71 123-45-67 raqamiga qo'ng'iroq qilishingiz mumkin.`;
}

function sendChatMessage() {
  const input = document.getElementById('imessage-input');
  const text = input?.value.trim();
  if (!text) return;

  // Append user bubble
  appendBubble(text, 'user');
  input.value = '';
  updateSendBtnState();
  hapticFeedback('light');

  // Hide suggestion chips
  document.getElementById('imessage-chips')?.classList.add('hidden');

  // Show typing
  const typingRow = showTypingIndicator();
  scrollChatBottom();

  setTimeout(() => {
    typingRow.remove();
    const reply = getAIResponse(text);
    appendBubble(reply, 'bot');
    scrollChatBottom();
    hapticFeedback('light');
  }, 700 + Math.random() * 500);
}

function quickAskAI(text) {
  const input = document.getElementById('imessage-input');
  if (input) input.value = text;
  sendChatMessage();
}

function appendBubble(content, type) {
  const body = document.getElementById('imessage-body');
  if (!body) return;

  const row = document.createElement('div');
  row.className = `imessage-bubble-row ${type}`;

  const bubble = document.createElement('div');
  bubble.className = `imessage-bubble ${type}`;
  bubble.style.whiteSpace = 'pre-line';
  bubble.textContent = content;

  row.appendChild(bubble);
  body.appendChild(row);
}

function showTypingIndicator() {
  const body = document.getElementById('imessage-body');
  const row = document.createElement('div');
  row.className = 'imessage-bubble-row bot';

  const bubble = document.createElement('div');
  bubble.className = 'imessage-bubble bot typing-bubble';
  bubble.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;

  row.appendChild(bubble);
  body.appendChild(row);
  return row;
}

function scrollChatBottom() {
  const body = document.getElementById('imessage-body');
  if (body) {
    body.scrollTop = body.scrollHeight;
  }
}

function updateSendBtnState() {
  const input = document.getElementById('imessage-input');
  const btn = document.getElementById('imessage-send-btn');
  if (!input || !btn) return;

  if (input.value.trim().length > 0) {
    btn.classList.remove('disabled');
  } else {
    btn.classList.add('disabled');
  }
}

// ── Dynamic Island Toast Banner ──
let islandTimeout = null;
function showIslandBanner(title, subtitle) {
  const banner = document.getElementById('ios-island-banner');
  const t = document.getElementById('island-title');
  const s = document.getElementById('island-sub');
  if (!banner || !t || !s) return;

  t.textContent = title;
  s.textContent = subtitle;
  banner.classList.remove('hidden');

  clearTimeout(islandTimeout);
  islandTimeout = setTimeout(() => {
    banner.classList.add('hidden');
  }, 2800);
}

// ── External Navigation Helpers ──
function callClinic() {
  window.location.href = 'tel:+998711234567';
}

function openMap() {
  window.open('https://maps.google.com/?q=Toshkent+Chilonzor+14', '_blank');
}

// ── App Init ──
window.addEventListener('DOMContentLoaded', () => {
  initCalendarStrip();
  renderServicesList(SERVICES_DATA);

  const imessageInput = document.getElementById('imessage-input');
  if (imessageInput) {
    imessageInput.addEventListener('input', updateSendBtnState);
  }
});
