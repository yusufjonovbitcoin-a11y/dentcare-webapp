// ═══════════════════════════════════════════════════════════════════
//  DentCare — Ultra-Professional Animated Controller (app.js)
// ═══════════════════════════════════════════════════════════════════

// Safely initialize Telegram WebApp
let tg = null;
try {
  if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor('#F8FAFC');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#F8FAFC');
  }
} catch (err) {
  console.log('Telegram SDK warning:', err);
}

// ── Application State ──
let currentActiveTab = 'home';
let chosenDoctor = 'Dr. Jasur Abdullayev';
let chosenDateObj = new Date();
let chosenTimeSlot = null;

const WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

// ── Rich Services Data with Photography ──
const DENTAL_SERVICES = [
  {
    id: 'therapy',
    title: 'Tish davolash & Plomba',
    category: 'Terapiya',
    duration: '40 daqiqa',
    price: '70 000 – 180 000 so\'m',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=80',
    description: 'Germaniya va Yaponiya fotopolimer kompozitlari yordamida kariesni butunlay og\'riqsiz tozalash va tishning tabiiy shaklini tiklash.'
  },
  {
    id: 'cleaning',
    title: 'Air Flow Professional Gigiyena',
    category: 'Profilaktika',
    duration: '45 daqiqa',
    price: '120 000 – 180 000 so\'m',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80',
    description: 'Shveysariyaning EMS uskunasi yordamida tish toshlari, qora dog\'lar va bakterial qatlamni milklarga teginmasdan tozalash va ftorlash.'
  },
  {
    id: 'whitening',
    title: 'Philips Zoom 4 Oqartirish',
    category: 'Estetika',
    duration: '60 daqiqa',
    price: '450 000 – 900 000 so\'m',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80',
    description: 'Sovuq LED nuri texnologiyasi. Emalni saqlagan holda tishlarni 6 dan 8 tongacha oppoq qilish. 1 yildan ortiq saqlanadi.'
  },
  {
    id: 'implant',
    title: 'Titanium Implantatsiya',
    category: 'Jarrohlik',
    duration: '1-3 seans',
    price: '1 800 000 – 3 500 000 so\'m',
    image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=500&auto=format&fit=crop&q=80',
    description: 'Nobel Biocare (Shveysariya) va Osstem (Koreya) titan implantlari. Yo\'qolgan tishni 100% qayta tiklash va 10 yillik kafolat.'
  },
  {
    id: 'orthodontics',
    title: 'Breket & Aligner Tizimlari',
    category: 'Ortodontiya',
    duration: 'Kurs bo\'yicha',
    price: '2 500 000 so\'mdan',
    image: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=500&auto=format&fit=crop&q=80',
    description: 'Damon Q metall va shaffof sapfir breketlar, shuningdek shaffof kappa (aligner)lar. Tish qatorini tekislash va jozibali tabassum.'
  },
  {
    id: 'free-checkup',
    title: 'Bepul Konsultatsiya & Rentgen',
    category: 'Diagnostika',
    duration: '25 daqiqa',
    price: '0 so\'m (Bepul)',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=80',
    description: 'Birinchi marotaba tashrif buyuruvchilar uchun shifokor ko\'rigi, rentgen tahlili va shaxsiy davolash rejasi bepul taqdim etiladi.'
  }
];

// ── Tab Navigation with Spring Transitions ──
function switchTab(tabId) {
  if (tabId === currentActiveTab) {
    const scrollBox = document.querySelector(`#tab-${tabId} .page-scroll, #tab-${tabId} .scroll-area`);
    if (scrollBox) scrollBox.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Hide old tab
  const oldScene = document.getElementById(`tab-${currentActiveTab}`);
  const oldDockBtn = document.getElementById(`tab-btn-${currentActiveTab}`) || document.getElementById(`dock-btn-${currentActiveTab}`);
  if (oldScene) oldScene.classList.remove('active');
  if (oldDockBtn) oldDockBtn.classList.remove('active');

  // Show new tab with animation
  const targetScene = document.getElementById(`tab-${tabId}`);
  const targetDockBtn = document.getElementById(`tab-btn-${tabId}`) || document.getElementById(`dock-btn-${tabId}`);
  if (targetScene && targetDockBtn) {
    targetScene.classList.add('active');
    targetDockBtn.classList.add('active');
    currentActiveTab = tabId;
  }

  triggerHaptic('selection');

  if (tabId === 'chat') {
    const dot = document.getElementById('chat-notification-dot');
    if (dot) dot.classList.add('hidden');
    scrollChatToEnd();
  }
}

// ── Haptics ──
function triggerHaptic(type) {
  try {
    if (!tg?.HapticFeedback) return;
    if (type === 'selection') tg.HapticFeedback.selectionChanged();
    else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
    else if (type === 'warning') tg.HapticFeedback.notificationOccurred('warning');
    else tg.HapticFeedback.impactOccurred(type || 'light');
  } catch (e) {}
}

// ── Stories Viewer Handler ──
function viewStory(storyType) {
  triggerHaptic('light');
  if (storyType === 'before_after') {
    showToast('✨ 250+ bemorimizning oldin va keyin natijalari');
  } else if (storyType === 'equipment') {
    showToast('🔬 Germaniyaning eng so\'nggi 3D tomografi o\'rnatildi');
  } else if (storyType === 'promo') {
    showToast('🎁 Bu hafta Air Flow gigiyenasi uchun 20% maxsus aksiya!');
  } else if (storyType === 'team') {
    showToast('👨‍⚕️ Oliy toifali 12 nafar xalqaro darajadagi mutaxassislar');
  }
}

function openBookingFor(doctorName) {
  renderScheduleDoctor(doctorName);
  switchTab('schedule');
  showToast(`📅 ${chosenDoctor} qabuliga yo'naltirildi`);
}

function selectDoctorQuick(doctorName, doctorSpec) {
  openBookingFor(doctorName);
}

function pickDoctorCard(cardElement, doctorName) {
  renderScheduleDoctor(doctorName);
  triggerHaptic('selection');
}

function toggleFavorite(btn) {
  btn.classList.toggle('liked');
  triggerHaptic('selection');
  if (btn.classList.contains('liked')) {
    showToast('❤️ Sevimlilarga saqlandi');
  } else {
    showToast('🤍 Sevimlilardan olib tashlandi');
  }
}

function handleGlobalSearch(query) {
  const q = (query || '').toLowerCase().trim();
  const docCards = document.querySelectorAll('.doctor-white-card');
  docCards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (!q || text.includes(q)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function bookCategory(categoryName) {
  switchTab('schedule');
  const serviceSelect = document.getElementById('patient-service');
  if (serviceSelect) {
    for (let opt of serviceSelect.options) {
      if (opt.text.toLowerCase().includes(categoryName.toLowerCase().slice(0, 4))) {
        serviceSelect.value = opt.value;
        break;
      }
    }
  }
}

// ── Doctor Profiles Data (Matching Screenshot) ──
const DOCTOR_PROFILES = {
  'Zulfiya Karimova': {
    name: 'Zulfiya Karimova',
    role: 'Jarroh-Implantolog',
    badge: '💎 ITI Member',
    bio: "Nobel Biocare va Osstem implantlari. Og'riqsiz 3D raqamli implantatsiya.",
    photo: 'https://images.unsplash.com/photo-1594824813581-22928574d3a6?w=400&auto=format&fit=crop&q=80',
    rating: '4.9',
    reviews: '(128 ta sharh)',
    exp: '12 yil tajriba',
    patients: '2000+ bemor',
    recommend: 'Bemorlar tavsiyasi 98%'
  },
  'Dr. Bobur Yusupov': {
    name: 'Dr. Bobur Yusupov',
    role: 'Estetik Terapevt · Mikroskopiya',
    badge: '⭐ Top Doctor',
    bio: 'Tishlarni badiiy restavratsiya qilish va nozik kanallarni tozalash.',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    rating: '4.9',
    reviews: '(95 ta sharh)',
    exp: '10 yil tajriba',
    patients: '1800+ bemor',
    recommend: 'Bemorlar tavsiyasi 99%'
  },
  'Dr. Jasur Abdullayev': {
    name: 'Dr. Jasur Abdullayev',
    role: 'Bosh Ortodontist · Damon Master',
    badge: '💎 Damon Master',
    bio: "Breketlar, alignerlar va to'g'ri tishlash bo'yicha 2000+ muvaffaqiyatli amaliyot.",
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    rating: '4.9',
    reviews: '(164 ta sharh)',
    exp: '15 yil tajriba',
    patients: '2500+ bemor',
    recommend: 'Bemorlar tavsiyasi 98%'
  }
};

let chosenDayStr = '19 sentabr';
let chosenDayIndex = 3; // Pay 19 (default in screenshot)
let chosenTimeSlot = '10:30'; // (default in screenshot)
let chosenService = 'Professional tozalash'; // (default in screenshot)
let chosenPrice = "350 000 so'm";
let schedWeekOffset = 0;

function renderScheduleDoctor(docName) {
  let doc = DOCTOR_PROFILES[docName];
  if (!doc) {
    for (let key in DOCTOR_PROFILES) {
      if (docName.includes(key) || key.includes(docName)) {
        doc = DOCTOR_PROFILES[key];
        break;
      }
    }
  }
  if (!doc) doc = DOCTOR_PROFILES['Zulfiya Karimova'];

  chosenDoctor = doc.name;

  const imgEl = document.getElementById('sched-doc-img');
  const nameEl = document.getElementById('sched-doc-name');
  const roleEl = document.getElementById('sched-doc-role');
  const badgeEl = document.getElementById('sched-doc-badge');
  const bioEl = document.getElementById('sched-doc-bio');
  const ratingEl = document.getElementById('sched-doc-rating');
  const reviewsEl = document.getElementById('sched-doc-reviews');
  const expEl = document.getElementById('sched-doc-exp');
  const patientsEl = document.getElementById('sched-doc-patients');
  const recEl = document.getElementById('sched-doc-recommend');

  if (imgEl) imgEl.src = doc.photo;
  if (nameEl) nameEl.textContent = doc.name;
  if (roleEl) roleEl.textContent = doc.role;
  if (badgeEl) badgeEl.textContent = doc.badge;
  if (bioEl) bioEl.textContent = doc.bio;
  if (ratingEl) ratingEl.textContent = doc.rating;
  if (reviewsEl) reviewsEl.textContent = doc.reviews;
  if (expEl) expEl.textContent = doc.exp;
  if (patientsEl) patientsEl.textContent = doc.patients;
  if (recEl) recEl.textContent = doc.recommend;

  updateScheduleSummary();
}

// 7-day strip generator (Dush 16 to Yak 22, Pay 19 active as in screenshot)
const BASE_DAYS_DATA = [
  { name: 'Dush', num: 16 },
  { name: 'Sesh', num: 17 },
  { name: 'Chor', num: 18 },
  { name: 'Pay',  num: 19 },
  { name: 'Jum',  num: 20 },
  { name: 'Shan', num: 21 },
  { name: 'Yak',  num: 22 }
];

function renderScheduleDays() {
  const container = document.getElementById('sched-days-strip');
  if (!container) return;
  container.innerHTML = '';

  const monthLabel = document.getElementById('sched-month-label');
  if (monthLabel) {
    if (schedWeekOffset === 0) {
      monthLabel.textContent = 'Sentabr 2024';
    } else if (schedWeekOffset > 0) {
      monthLabel.textContent = `Oktabr 2024`;
    } else {
      monthLabel.textContent = `Avgust 2024`;
    }
  }

  BASE_DAYS_DATA.forEach((d, idx) => {
    const card = document.createElement('div');
    const dayNum = d.num + (schedWeekOffset * 7);
    const isActive = (idx === chosenDayIndex);

    card.className = `sched-day-card ${isActive ? 'active' : ''}`;
    card.innerHTML = `
      <span class="sched-day-name">${d.name}</span>
      <span class="sched-day-num">${dayNum}</span>
      <span class="sched-day-dot"></span>
    `;

    card.onclick = () => {
      document.querySelectorAll('.sched-day-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      chosenDayIndex = idx;
      chosenDayStr = `${dayNum} sentabr`;
      updateScheduleSummary();
      triggerHaptic('selection');
    };

    container.appendChild(card);
  });
}

function changeSchedWeek(dir) {
  schedWeekOffset += dir;
  renderScheduleDays();
  triggerHaptic('light');
}

// 20 Time Slots generator (08:00 to 17:30, 10:30 active as in screenshot)
const ALL_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

function renderScheduleTimeSlots() {
  const container = document.getElementById('sched-time-slots');
  if (!container) return;
  container.innerHTML = '';

  ALL_TIME_SLOTS.forEach(time => {
    const chip = document.createElement('div');
    const isActive = (time === chosenTimeSlot);
    chip.className = `sched-time-chip ${isActive ? 'active' : ''}`;
    chip.textContent = time;

    chip.onclick = () => {
      document.querySelectorAll('.sched-time-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      chosenTimeSlot = time;
      updateScheduleSummary();
      triggerHaptic('light');
    };

    container.appendChild(chip);
  });
}

// Step 3 Service Option Selection
function selectServiceOption(cardEl, serviceName, price) {
  document.querySelectorAll('.sched-service-card').forEach(c => c.classList.remove('active'));
  cardEl.classList.add('active');
  chosenService = serviceName;
  chosenPrice = price;
  updateScheduleSummary();
  triggerHaptic('selection');
}

// Bottom Summary Bar Update
function updateScheduleSummary() {
  const dtEl = document.getElementById('sched-summary-datetime');
  const metaEl = document.getElementById('sched-summary-meta');
  if (dtEl) dtEl.textContent = `${chosenDayStr}, ${chosenTimeSlot}`;
  if (metaEl) metaEl.textContent = `${chosenDoctor} · ${chosenService}`;
}

// Booking submission handlers
function onScheduleBookClick() {
  const name = document.getElementById('patient-name')?.value.trim();
  const phone = document.getElementById('patient-phone')?.value.trim();

  // If name or phone is empty, open bottom modal to collect info
  if (!name || !phone) {
    document.getElementById('patient-input-sheet')?.classList.remove('hidden');
    triggerHaptic('light');
    return;
  }

  executeBookingFinal();
}

function closePatientSheet() {
  document.getElementById('patient-input-sheet')?.classList.add('hidden');
}

function executeBookingFinal() {
  const name = document.getElementById('patient-name')?.value.trim();
  const phone = document.getElementById('patient-phone')?.value.trim();
  const note = document.getElementById('patient-note')?.value.trim() || "Tezroq bog'lanish";

  if (!name) {
    showToast('⚠️ Iltimos, ismingizni kiriting');
    triggerHaptic('warning');
    return;
  }
  if (!phone || phone.length < 9) {
    showToast("⚠️ Iltimos, to'liq telefon raqamingizni kiriting");
    triggerHaptic('warning');
    return;
  }

  closePatientSheet();

  const payload = {
    action: 'book',
    doctor: chosenDoctor,
    service: chosenService,
    price: chosenPrice,
    date: chosenDayStr,
    time: chosenTimeSlot,
    name,
    phone,
    note
  };

  // Telegram WebApp orqali botga jo'natish
  if (tg) {
    try {
      tg.sendData(JSON.stringify(payload));
    } catch (e) {
      console.log('Telegram send error:', e);
    }
  }

  // Populyatsiya cheki
  const receiptBox = document.getElementById('booking-receipt-details');
  if (receiptBox) {
    receiptBox.innerHTML = `
      <div class="receipt-row">
        <span class="receipt-key">Shifokor:</span>
        <span class="receipt-val">${chosenDoctor}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Vaqt:</span>
        <span class="receipt-val">${chosenDayStr}, ${chosenTimeSlot}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Xizmat:</span>
        <span class="receipt-val">${chosenService} (${chosenPrice})</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Bemor:</span>
        <span class="receipt-val">${name}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Telefon:</span>
        <span class="receipt-val">${phone}</span>
      </div>
    `;
  }

  document.getElementById('booking-modal-overlay')?.classList.remove('hidden');
  triggerHaptic('success');
}

function executeBooking() {
  executeBookingFinal();
}

function closeBookingModal() {
  document.getElementById('booking-modal-overlay')?.classList.add('hidden');
}

// ── Services Catalog Renderer ──
function renderServicesCatalog(list) {
  const container = document.getElementById('services-catalog-container');
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
        <p style="font-size:16px; font-weight:700;">Hech narsa topilmadi 🔍</p>
        <p style="font-size:13px; margin-top:4px;">Boshqa so'z bilan qidirib ko'ring</p>
      </div>
    `;
    return;
  }

  list.forEach(svc => {
    const card = document.createElement('div');
    card.className = 'service-catalog-card glass-card interactive-spring';
    card.innerHTML = `
      <img src="${svc.image}" alt="${svc.title}" class="service-card-image" loading="lazy"/>
      <div class="service-card-body">
        <div class="service-top-badge-row">
          <span class="service-category-badge">${svc.category}</span>
          <span class="service-duration-badge">⏱ ${svc.duration}</span>
        </div>
        <h4 class="service-title">${svc.title}</h4>
        <p class="service-desc">${svc.description}</p>
        <div class="service-card-footer">
          <span class="service-price-text">${svc.price}</span>
          <button class="service-book-cta interactive-spring" onclick="bookServiceItem('${svc.title}')">Yozilish ›</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function bookServiceItem(svcTitle) {
  switchTab('schedule');
  const sel = document.getElementById('patient-service');
  if (sel) {
    for (let opt of sel.options) {
      if (opt.text.toLowerCase().includes(svcTitle.toLowerCase().slice(0, 5))) {
        sel.value = opt.value;
        break;
      }
    }
  }
}

function filterServicesCatalog(queryVal) {
  const query = (queryVal !== undefined ? queryVal : (document.getElementById('services-search-input')?.value || document.getElementById('search-svc-input')?.value || '')).toLowerCase().trim();
  const filtered = DENTAL_SERVICES.filter(s =>
    s.title.toLowerCase().includes(query) ||
    s.category.toLowerCase().includes(query) ||
    s.description.toLowerCase().includes(query)
  );
  renderServicesCatalog(filtered);
}

// ── DentAI Smart Chat Knowledge Base ──
const AI_RESPONSES = {
  'og\'ri|achish|yallig\'|puls': `🦷 <b>Tish og'rig'ida birinchi yordam:</b>\n\n1. Ibuprofen (400 mg) yoki Nimesulid tabletkasi ichishingiz mumkin;\n2. 1 stakan iliq suvga 1 choy qoshiq soda va tuz solib og'izni chayqang;\n3. Og'rigan joyga aslo issiq kompress qo'ymang;\n4. Karies asab tolalariga yetmasligi uchun zudlik bilan qabulga yoziling.\n\nKlinikamiz bugun soat 19:00 gacha ochiq! 📞 +998 (71) 123-45-67`,

  'vaqt|qabul|soat|jadval|qachon': `📅 <b>DentCare ish jadvali:</b>\n\n• Dushanba – Shanba: 09:00 dan 19:00 gacha;\n• Tushlik tanaffusisiz;\n• Yakshanba: Dam olish kuni.\n\n"Jadval" bo'limida sizga qulay shifokor va vaqtni bemalol tanlashingiz mumkin!`,

  'narx|pul|qancha|to\'lov|summa': `💰 <b>Xizmatlar narxi:</b>\n\n• Bepul konsultatsiya va rentgen — 0 so'm\n• Tish davolash & Plomba — 70 000 so'mdan\n• Air Flow tozalash — 120 000 so'mdan\n• Zoom 4 oqartirish — 450 000 so'mdan\n• Titan implant — 1 800 000 so'mdan\n• Breket tizimlari — 2 500 000 so'mdan\n\nTo'lovlarni Uzcard, Humo, Naqd va Payme orqali amalga oshirish mumkin.`,

  'breket|qiyshiq|to\'g\'ri|ortodont': `😁 <b>Breket tizimlari haqida:</b>\n\n• Damon Q metall va estetik sapfir (shaffof) breketlar mavjud;\n• Shuningdek, ko'rinmas shaffof aligner (kappa)lar bor;\n• Davolanish muddati o'rtacha 12 – 18 oy;\n• Bosh mutaxassisimiz Dr. Jasur Abdullayev 15 yillik tajribaga ega.\n\nDastlabki 3D tashxis bepul!`,

  'implant|tushgan|ildiz|suyak': `🔩 <b>Titanium Implantatsiya:</b>\n\n• Nobel Biocare (Shveysariya) va Osstem (Koreya) implantlari;\n• Suyakka to'liq 100% integratsiya kafolati;\n• Zamonaviy anesteziya sababli muolaja mutlaqo og'riqsiz kechadi;\n• Rasmiy 10 yillik pasport va kafolat beriladi.`,

  'manzil|qaer|qayerda|metro|joy': `📍 <b>Manzilimiz:</b>\n\nToshkent shahri, Chilonzor tumani, 14-uy.\nMo'ljal: Mirzo Ulug'bek metro bekati yonida.\nAvtomobil uchun bepul xavfsiz to'xtash joyi bor.\nTelefon: +998 (71) 123-45-67`,

  'salom|assalom|qalaysiz|qalesiz': `Salom! 👋 Men DentCare klinikasining sun'iy intellekt assistentiman. Tish parvarishi, narxlar, shifokorlar yoki qabul vaqtlari bo'yicha qanday yordam bera olaman?`,

  'rahmat|tashakkur|spasibo': `Salomat bo'ling! 😊 Tishlaringiz doimo sog'lom, tabassumingiz esa jozibali bo'lsin! Boshqa savollaringiz bo'lsa marhamat.`
};

function getBotReply(userText) {
  const query = userText.toLowerCase();
  for (let key in AI_RESPONSES) {
    const keywords = key.split('|');
    if (keywords.some(kw => query.includes(kw))) {
      return AI_RESPONSES[key];
    }
  }
  return `Tushundim. Tishingiz holati bo'yicha aniq tashxis va tavsiya berish uchun klinikamiz shifokori ko'rigidan o'tishingizni maslahat beramiz.\n\n"Jadval" bo'limidan bepul ko'rikka yozilishingiz yoki to'g'ridan-to'g'ri +998 (71) 123-45-67 raqamiga qo'ng'iroq qilishingiz mumkin.`;
}

function onChatInputChanged(textarea) {
  // Auto-resize textarea up to 120px
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';

  const hasText = textarea.value.trim().length > 0;
  const voiceBtn = document.getElementById('chat-voice-btn');
  const sendBtn = document.getElementById('chat-send-btn');

  if (hasText) {
    voiceBtn?.classList.add('hidden');
    sendBtn?.classList.remove('hidden');
  } else {
    voiceBtn?.classList.remove('hidden');
    sendBtn?.classList.add('hidden');
  }
}

function toggleQuickChips() {
  const chips = document.getElementById('chat-quick-chips');
  if (!chips) return;
  chips.classList.toggle('hidden');
  triggerHaptic('light');
}

function simulateVoiceRecord() {
  const voiceBtn = document.getElementById('chat-voice-btn');
  if (!voiceBtn) return;

  voiceBtn.classList.add('recording');
  showToast('🎙️ Ovoz tinglanmoqda...');
  triggerHaptic('warning');

  setTimeout(() => {
    voiceBtn.classList.remove('recording');
    const input = document.getElementById('chat-text-input');
    if (input) {
      input.value = "Tish og'rig'iga nima qilish kerak?";
      onChatInputChanged(input);
      setTimeout(() => {
        handleChatSend();
      }, 400);
    }
  }, 1600);
}

function handleChatSend() {
  const input = document.getElementById('chat-text-input');
  const text = input?.value.trim();
  if (!text) return;

  appendChatMessage(text, 'user');
  input.value = '';
  input.style.height = 'auto';
  onChatInputChanged(input);
  triggerHaptic('light');

  document.getElementById('chat-quick-chips')?.classList.add('hidden');

  const typingRow = showChatTyping();
  scrollChatToEnd();

  setTimeout(() => {
    typingRow.remove();
    const reply = getBotReply(text);
    appendChatMessage(reply, 'bot');
    scrollChatToEnd();
    triggerHaptic('light');
  }, 650 + Math.random() * 450);
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('chat-text-input');
  if (input) {
    input.value = promptText;
    onChatInputChanged(input);
  }
  handleChatSend();
}

function appendChatMessage(htmlText, type) {
  const chatBox = document.getElementById('chat-messages-box');
  if (!chatBox) return;

  const row = document.createElement('div');
  row.className = `chat-msg-row ${type} animate-pop-in`;

  const card = document.createElement('div');
  card.className = `${type}-msg-card ${type === 'bot' ? 'glass-card' : ''}`;
  card.style.whiteSpace = 'pre-line';
  card.innerHTML = htmlText;

  row.appendChild(card);
  chatBox.appendChild(row);
}

function showChatTyping() {
  const chatBox = document.getElementById('chat-messages-box');
  const row = document.createElement('div');
  row.className = 'chat-msg-row bot';

  const card = document.createElement('div');
  card.className = 'bot-msg-card glass-card typing-dots-box';
  card.innerHTML = `
    <span class="typing-dot-circle"></span>
    <span class="typing-dot-circle"></span>
    <span class="typing-dot-circle"></span>
  `;

  row.appendChild(card);
  chatBox.appendChild(row);
  return row;
}

function scrollChatToEnd() {
  const box = document.getElementById('chat-messages-box');
  if (box) {
    box.scrollTop = box.scrollHeight;
  }
}

function updateChatSendButton() {
  const input = document.getElementById('chat-text-input');
  const btn = document.getElementById('chat-send-btn');
  if (!input || !btn) return;

  if (input.value.trim().length > 0) {
    btn.classList.remove('disabled');
  } else {
    btn.classList.add('disabled');
  }
}

// ── Toast Banner ──
let toastTimerInstance = null;
function showToast(message) {
  const toast = document.getElementById('toast-banner');
  const text = document.getElementById('toast-text');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(toastTimerInstance);
  toastTimerInstance = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}

function openNotifications() {
  showToast('🔔 Bugun klinikamizda barcha shifokorlar qabuli davom etmoqda');
  triggerHaptic('light');
}

function openGoogleMap() {
  window.open('https://maps.google.com/?q=Toshkent+Chilonzor+14', '_blank');
}

function callClinicPhone() {
  window.location.href = 'tel:+998711234567';
}

// ── Make functions available globally on window for inline HTML onclick ──
window.switchTab = switchTab;
window.selectDoctorQuick = selectDoctorQuick;
window.openBookingFor = openBookingFor;
window.pickDoctorCard = pickDoctorCard;
window.toggleFavorite = toggleFavorite;
window.handleGlobalSearch = handleGlobalSearch;
window.bookCategory = bookCategory;
window.executeBooking = executeBooking;
window.executeBookingFinal = executeBookingFinal;
window.closeBookingModal = closeBookingModal;
window.closePatientSheet = closePatientSheet;
window.onScheduleBookClick = onScheduleBookClick;
window.selectServiceOption = selectServiceOption;
window.changeSchedWeek = changeSchedWeek;
window.bookServiceItem = bookServiceItem;
window.filterServicesCatalog = filterServicesCatalog;
window.handleChatSend = handleChatSend;
window.sendQuickPrompt = sendQuickPrompt;
window.onChatInputChanged = onChatInputChanged;
window.toggleQuickChips = toggleQuickChips;
window.simulateVoiceRecord = simulateVoiceRecord;
window.openNotifications = openNotifications;
window.openGoogleMap = openGoogleMap;
window.callClinicPhone = callClinicPhone;
window.viewStory = viewStory;

// ── App Init (Immediate & Safe) ──
function initApp() {
  try {
    if (tg?.initDataUnsafe?.user?.first_name) {
      const pName = document.getElementById('home-patient-name');
      if (pName) pName.textContent = tg.initDataUnsafe.user.first_name;

      const pInputName = document.getElementById('patient-name');
      if (pInputName && !pInputName.value) {
        const full = [tg.initDataUnsafe.user.first_name, tg.initDataUnsafe.user.last_name].filter(Boolean).join(' ');
        pInputName.value = full;
      }
    }

    renderScheduleDoctor('Zulfiya Karimova');
    renderScheduleDays();
    renderScheduleTimeSlots();
    updateScheduleSummary();
    renderServicesCatalog(DENTAL_SERVICES);

    const chatInput = document.getElementById('chat-text-input');
    if (chatInput) {
      chatInput.addEventListener('input', updateChatSendButton);
    }
  } catch (e) {
    console.error('App init error:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
