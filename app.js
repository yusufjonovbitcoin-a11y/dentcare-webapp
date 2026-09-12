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
    const scrollBox = document.querySelector(`#tab-${tabId} .page-scroll, #tab-${tabId} .scroll-area, #tab-${tabId} .chat-body-messages`);
    if (scrollBox) scrollBox.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // 1. Hide ALL tab pages
  document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));

  // 2. Deactivate ALL nav buttons
  document.querySelectorAll('.tab-bar-btn, .dock-nav-btn').forEach(btn => btn.classList.remove('active'));

  // 3. Show target tab with animation
  const targetScene = document.getElementById(`tab-${tabId}`);
  const targetDockBtn = document.getElementById(`tab-btn-${tabId}`) || document.getElementById(`dock-btn-${tabId}`);
  if (targetScene) {
    targetScene.classList.add('active');
    currentActiveTab = tabId;
  }
  if (targetDockBtn) {
    targetDockBtn.classList.add('active');
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

// ── Doctor Profiles Data (Online Medical Booking Standard) ──
const DOCTOR_PROFILES = {
  'Zulfiya Karimova': {
    name: 'Dr. Zulfiya Karimova',
    role: 'Jarroh-Implantolog',
    cabinet: 'Kabinet № 204',
    badge: '💎 ITI Member',
    bio: "Nobel Biocare va Osstem implantlari. Og'riqsiz 3D raqamli implantatsiya.",
    photo: 'zulfiya_karimova.jpg',
    rating: '4.9',
    reviews: '(128 ta sharh)',
    exp: '12 yil tajriba',
    patients: '2000+ bemor',
    recommend: 'Bemorlar tavsiyasi 98%'
  },
  'Dr. Bobur Yusupov': {
    name: 'Dr. Bobur Yusupov',
    role: 'Estetik Terapevt · Mikroskopiya',
    cabinet: 'Kabinet № 201',
    badge: '⭐ Top Doctor',
    bio: 'Tishlarni badiiy restavratsiya qilish va nozik kanallarni tozalash.',
    photo: 'bobur_yusupov.jpg',
    rating: '4.9',
    reviews: '(95 ta sharh)',
    exp: '10 yil tajriba',
    patients: '1800+ bemor',
    recommend: 'Bemorlar tavsiyasi 99%'
  },
  'Dr. Jasur Abdullayev': {
    name: 'Dr. Jasur Abdullayev',
    role: 'Bosh Ortodontist · Damon Master',
    cabinet: 'Kabinet № 208',
    badge: '💎 Damon Master',
    bio: "Breketlar, alignerlar va to'g'ri tishlash bo'yicha 2000+ muvaffaqiyatli amaliyot.",
    photo: 'jasur_abdullayev.jpg',
    rating: '4.9',
    reviews: '(164 ta sharh)',
    exp: '15 yil tajriba',
    patients: '2500+ bemor',
    recommend: 'Bemorlar tavsiyasi 98%'
  }
};

// ── Online Booking Services (Standardized with Duration & Pricing) ──
const ONLINE_BOOKING_SERVICES = [
  {
    id: 'consult',
    name: 'Konsultatsiya va 3D diagnostika',
    duration: '20 daq',
    durationMin: 20,
    price: 'Bepul',
    icon: '🦷',
    desc: "Shifokor ko'rigi, 3D rentgen tahlili va shaxsiy davolash rejasi"
  },
  {
    id: 'hygiene',
    name: 'Professional gigiyena va tozalash',
    duration: '30 daq',
    durationMin: 30,
    price: "350 000 so'm",
    icon: '✨',
    desc: "Air-Flow va ultratovush orqali tish toshlari va pigmentatsiyani yo'qotish"
  },
  {
    id: 'plomba',
    name: 'Plomba va badiiy restavratsiya',
    duration: '45 daq',
    durationMin: 45,
    price: "450 000 so'm",
    icon: '💎',
    desc: "Estetik nano-kompozit yordamida kariesni davolash va anatomiyani tiklash"
  },
  {
    id: 'implant',
    name: 'Tish implantatsiyasi konsultatsiya',
    duration: '40 daq',
    durationMin: 40,
    price: 'Bepul',
    icon: '🔩',
    desc: "Nobel Biocare / Osstem implantlari bo'yicha 3D jarrohlik konsultatsiyasi"
  },
  {
    id: 'whitening',
    name: 'Tishlarni oqartirish (Zoom-4)',
    duration: '60 daq',
    durationMin: 60,
    price: "1 200 000 so'm",
    icon: '⭐',
    desc: "Philips Zoom-4 nuri ostida emalga zarar bermasdan 6-8 tongacha oqartirish"
  },
  {
    id: 'ortho',
    name: 'Ortodontik ko\'rik (Breket / Aligner)',
    duration: '30 daq',
    durationMin: 30,
    price: 'Bepul',
    icon: '📐',
    desc: "Damon metall/keramik breketlari yoki shaffof alignerlar konsultatsiyasi"
  }
];

// ── 7-Day Strip Dataset (Dush 16 to Yak 22) ──
const BASE_DAYS_DATA = [
  { name: 'Dush', num: 16, freeCount: 12 },
  { name: 'Sesh', num: 17, freeCount: 10 },
  { name: 'Chor', num: 18, freeCount: 9 },
  { name: 'Pay',  num: 19, freeCount: 14 },
  { name: 'Jum',  num: 20, freeCount: 11 },
  { name: 'Shan', num: 21, freeCount: 7 },
  { name: 'Yak',  num: 22, freeCount: 5 }
];

// ── Categorized Time Slots with Real Online Booking Occupied/Available Status ──
const TIME_SLOT_GROUPS = {
  morning: {
    containerId: 'sched-time-morning',
    slots: [
      { time: '09:00', status: 'occupied' },
      { time: '09:30', status: 'available' },
      { time: '10:00', status: 'available' },
      { time: '10:30', status: 'available' },
      { time: '11:00', status: 'occupied' },
      { time: '11:30', status: 'available' }
    ]
  },
  afternoon: {
    containerId: 'sched-time-afternoon',
    slots: [
      { time: '13:00', status: 'available' },
      { time: '13:30', status: 'available' },
      { time: '14:00', status: 'occupied' },
      { time: '14:30', status: 'available' },
      { time: '15:00', status: 'available' },
      { time: '15:30', status: 'occupied' },
      { time: '16:00', status: 'available' },
      { time: '16:30', status: 'available' },
      { time: '17:00', status: 'available' }
    ]
  },
  evening: {
    containerId: 'sched-time-evening',
    slots: [
      { time: '18:00', status: 'occupied' },
      { time: '18:30', status: 'available' },
      { time: '19:00', status: 'available' },
      { time: '19:30', status: 'available' }
    ]
  }
};

chosenDoctor = 'Dr. Zulfiya Karimova';
let chosenCabinet = 'Kabinet № 204';
let chosenService = 'Professional gigiyena va tozalash';
let chosenDuration = '30 daq';
let chosenPrice = "350 000 so'm";
let chosenDayStr = '19 sentabr';
let chosenDayIndex = 3; // Pay 19
let chosenTimeSlot = '10:30';
let schedWeekOffset = 0;
let lastBookingTicket = null;

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
  chosenCabinet = doc.cabinet;

  const imgEl = document.getElementById('sched-doc-img');
  const nameEl = document.getElementById('sched-doc-name');
  const roleEl = document.getElementById('sched-doc-role');
  const badgeEl = document.getElementById('sched-doc-badge');
  const bioEl = document.getElementById('sched-doc-bio');
  const ratingEl = document.getElementById('sched-doc-rating');
  const reviewsEl = document.getElementById('sched-doc-reviews');
  const expEl = document.getElementById('sched-doc-exp');
  const patientsEl = document.getElementById('sched-doc-patients');
  const cabEl = document.getElementById('sched-doc-cabinet');
  const roomBadge = document.getElementById('sched-doctor-room');

  if (imgEl) imgEl.src = doc.photo;
  if (nameEl) nameEl.textContent = doc.name;
  if (roleEl) roleEl.textContent = doc.role;
  if (badgeEl) badgeEl.textContent = doc.badge;
  if (bioEl) bioEl.textContent = doc.bio;
  if (ratingEl) ratingEl.textContent = doc.rating;
  if (reviewsEl) reviewsEl.textContent = doc.reviews;
  if (expEl) expEl.textContent = doc.exp;
  if (patientsEl) patientsEl.textContent = doc.patients;
  if (cabEl) cabEl.textContent = doc.cabinet;
  if (roomBadge) roomBadge.textContent = doc.cabinet;

  // Update pills active state
  document.querySelectorAll('.doc-select-pill').forEach(pill => {
    if (pill.textContent.includes(doc.name) || pill.innerHTML.includes(doc.photo)) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  updateScheduleSummary();
}

function selectScheduleDoctor(docName, pillEl) {
  renderScheduleDoctor(docName);
  triggerHaptic('selection');
  showToast(`👨‍⚕️ ${chosenDoctor} tanlandi`);
}

// ── Step 1: Services List Renderer (Online Booking Standard) ──
function renderOnlineServices() {
  const container = document.getElementById('sched-services-list');
  if (!container) return;
  container.innerHTML = '';

  ONLINE_BOOKING_SERVICES.forEach(svc => {
    const card = document.createElement('div');
    const isActive = (svc.name === chosenService);
    card.className = `online-service-card ${isActive ? 'active' : ''}`;
    card.innerHTML = `
      <div class="svc-icon-badge">${svc.icon}</div>
      <div class="svc-card-content">
        <div class="svc-title-row">
          <h4 class="svc-title-name">${svc.name}</h4>
          <span class="svc-duration-chip">⏱ ${svc.duration}</span>
        </div>
        <p class="svc-card-desc">${svc.desc}</p>
      </div>
      <div class="svc-card-end">
        <span class="svc-card-price">${svc.price}</span>
        <div class="svc-radio-indicator"></div>
      </div>
    `;

    card.onclick = () => {
      document.querySelectorAll('.online-service-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      chosenService = svc.name;
      chosenDuration = svc.duration;
      chosenPrice = svc.price;
      updateScheduleSummary();
      triggerHaptic('selection');
    };

    container.appendChild(card);
  });
}

// ── Step 2: Calendar 7-Day Strip Renderer ──
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
      <span class="sched-day-slot-count">${d.freeCount} bo'sh</span>
    `;

    card.onclick = () => {
      document.querySelectorAll('.sched-day-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      chosenDayIndex = idx;
      chosenDayStr = `${dayNum} sentabr`;

      const countEl = document.getElementById('sched-available-slots-count');
      if (countEl) countEl.textContent = `${d.freeCount} ta bo'sh vaqt mavjud`;

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

// ── Step 3: Categorized Time Slots Renderer (Online Booking Occupied & Available) ──
function renderScheduleTimeSlots() {
  for (let groupKey in TIME_SLOT_GROUPS) {
    const grp = TIME_SLOT_GROUPS[groupKey];
    const container = document.getElementById(grp.containerId);
    if (!container) continue;
    container.innerHTML = '';

    grp.slots.forEach(slot => {
      const chip = document.createElement('div');
      const isOccupied = (slot.status === 'occupied');
      const isActive = (!isOccupied && slot.time === chosenTimeSlot);

      chip.className = `sched-time-chip ${isOccupied ? 'occupied' : ''} ${isActive ? 'active' : ''}`;
      chip.textContent = slot.time;

      if (isOccupied) {
        chip.title = "Bu vaqt boshqa bemor tomonidan band qilingan";
        chip.onclick = () => {
          showToast(`⚠️ Soat ${slot.time} band qilingan. Iltimos, yashil/bo'sh vaqtlardan tanlang.`);
          triggerHaptic('warning');
        };
      } else {
        chip.onclick = () => {
          document.querySelectorAll('.sched-time-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          chosenTimeSlot = slot.time;
          updateScheduleSummary();
          triggerHaptic('light');
        };
      }

      container.appendChild(chip);
    });
  }
}

// ── Phone Input Auto-Formatter (+998 (90) 123-45-67) ──
function setupPhoneMask() {
  const phoneInput = document.getElementById('sched-input-phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (!digits.startsWith('998')) {
      digits = '998' + digits;
    }
    digits = digits.substring(0, 12);
    let res = '+998';
    if (digits.length > 3) {
      res += ' (' + digits.substring(3, 5);
    }
    if (digits.length >= 5) {
      res += ') ' + digits.substring(5, 8);
    }
    if (digits.length >= 8) {
      res += '-' + digits.substring(8, 10);
    }
    if (digits.length >= 10) {
      res += '-' + digits.substring(10, 12);
    }
    e.target.value = res;
  });
}

// ── Bottom Summary Bar Update ──
function updateScheduleSummary() {
  const dtEl = document.getElementById('sched-summary-datetime');
  const metaEl = document.getElementById('sched-summary-meta');
  if (dtEl) dtEl.textContent = `${chosenDayStr}, ${chosenTimeSlot}`;
  if (metaEl) metaEl.textContent = `${chosenDoctor} · ${chosenService} (${chosenDuration})`;
}

// ── Online Booking Execution (Validation + E-Ticket + Telegram Admin) ──
function executeOnlineBooking() {
  const nameInput = document.getElementById('sched-input-name');
  const phoneInput = document.getElementById('sched-input-phone');
  const noteInput = document.getElementById('sched-input-note');
  const reminderCheck = document.getElementById('sched-reminder-check');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const note = noteInput && noteInput.value.trim() ? noteInput.value.trim() : 'Onlayn bron';
  const reminder = reminderCheck ? reminderCheck.checked : true;

  if (!name || name.length < 2) {
    showToast("⚠️ Iltimos, ism va familiyangizni kiriting");
    nameInput?.focus();
    triggerHaptic('warning');
    return;
  }

  const rawDigits = phone.replace(/\D/g, '');
  if (!phone || rawDigits.length < 9) {
    showToast("⚠️ Iltimos, to'liq telefon raqamingizni kiriting");
    phoneInput?.focus();
    triggerHaptic('warning');
    return;
  }

  // Generate Booking Reference Number
  const randomId = Math.floor(10000 + Math.random() * 90000);
  const bookingId = `#DC-${randomId}`;

  lastBookingTicket = {
    bookingId,
    patientName: name,
    patientPhone: phone,
    doctor: chosenDoctor,
    cabinet: chosenCabinet,
    service: chosenService,
    duration: chosenDuration,
    price: chosenPrice,
    date: chosenDayStr,
    time: chosenTimeSlot,
    note,
    reminder: reminder ? "Ha (2 soat oldin)" : "Yo'q",
    createdAt: new Date().toISOString()
  };

  // Save to LocalStorage
  try {
    localStorage.setItem('dentcare_active_booking', JSON.stringify(lastBookingTicket));
  } catch (e) {}

  // Populate Medical E-Ticket Modal
  const ticketIdEl = document.getElementById('ticket-booking-id');
  const patientEl = document.getElementById('ticket-patient-name');
  const doctorEl = document.getElementById('ticket-doctor-name');
  const dtEl = document.getElementById('ticket-datetime');
  const cabEl = document.getElementById('ticket-cabinet');
  const svcEl = document.getElementById('ticket-service');

  if (ticketIdEl) ticketIdEl.textContent = bookingId;
  if (patientEl) patientEl.textContent = name;
  if (doctorEl) doctorEl.textContent = chosenDoctor;
  if (dtEl) dtEl.textContent = `${chosenDayStr}, ${chosenTimeSlot}`;
  if (cabEl) cabEl.textContent = chosenCabinet;
  if (svcEl) svcEl.textContent = `${chosenService} (${chosenDuration}) · ${chosenPrice}`;

  // Open E-Ticket Modal
  document.getElementById('booking-ticket-modal')?.classList.remove('hidden');
  triggerHaptic('success');

  // Telegram Bot Notification Payload
  const adminText = 
    `🏥 <b>YANGI ONLAYN QABUL BRONI (DENTCARE)</b>\n\n` +
    `🔖 <b>Bron kodi:</b> <code>${bookingId}</code>\n` +
    `👤 <b>Bemor:</b> ${name}\n` +
    `📞 <b>Telefon:</b> <code>${phone}</code>\n` +
    `👨‍⚕️ <b>Shifokor:</b> ${chosenDoctor}\n` +
    `🚪 <b>Kabinet:</b> ${chosenCabinet}\n` +
    `🦷 <b>Xizmat:</b> ${chosenService} (⏱ ${chosenDuration})\n` +
    `💰 <b>Narxi:</b> ${chosenPrice}\n` +
    `📅 <b>Sana:</b> ${chosenDayStr}\n` +
    `⏰ <b>Vaqt:</b> ${chosenTimeSlot}\n` +
    `🔔 <b>Eslatma:</b> ${reminder ? "Ha (2 soat oldin)" : "Yo'q"}\n` +
    `📝 <b>Shikoyat/Izoh:</b> ${note}`;

  // Direct send via Telegram Bot API
  if (typeof TELEGRAM_BOT_TOKEN !== 'undefined' && typeof TELEGRAM_ADMIN_CHAT_ID !== 'undefined') {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: adminText,
        parse_mode: 'HTML'
      })
    }).catch(e => console.log('Telegram send error:', e));
  }

  // Telegram WebApp sendData
  if (tg) {
    try {
      tg.sendData(JSON.stringify({
        action: 'online_booking',
        ...lastBookingTicket
      }));
    } catch (e) {}
  }

  showToast(`✅ Qabul muvaffaqiyatli band qilindi!`);
}

function closeTicketModal() {
  document.getElementById('booking-ticket-modal')?.classList.add('hidden');
}

function addToGoogleCalendar() {
  if (!lastBookingTicket) return;
  const title = encodeURIComponent(`DentCare Qabuli: ${lastBookingTicket.service}`);
  const details = encodeURIComponent(
    `Bron kodi: ${lastBookingTicket.bookingId}\n` +
    `Shifokor: ${lastBookingTicket.doctor}\n` +
    `Kabinet: ${lastBookingTicket.cabinet}\n` +
    `Bemor: ${lastBookingTicket.patientName}\n` +
    `Klinika: DentCare, Chilonzor 14, 25-uy\n` +
    `Tel: +998 71 123-45-67`
  );
  const location = encodeURIComponent(`DentCare Dental Clinic, Toshkent, Chilonzor 14`);
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  window.open(url, '_blank');
  showToast('📅 Taqvimga yo\'naltirilmoqda...');
}

// Backward compatibility handlers
function onScheduleBookClick() {
  executeOnlineBooking();
}

function executeBookingFinal() {
  executeOnlineBooking();
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
        <p style="font-size:16px; font-weight:700; color:var(--text-title);">Hech narsa topilmadi 🔍</p>
        <p style="font-size:13px; margin-top:4px;">Boshqa xizmat nomi bilan qidirib ko'ring</p>
      </div>
    `;
    return;
  }

  list.forEach(svc => {
    const card = document.createElement('div');
    card.className = 'service-catalog-white-card';
    card.innerHTML = `
      <div class="service-cat-card-top">
        <div class="service-cat-thumb-wrap">
          <img src="${svc.image}" alt="${svc.title}" class="service-cat-thumb" loading="lazy"/>
        </div>
        <div class="service-cat-info-col">
          <div class="service-top-badges">
            <span class="service-category-badge">${svc.category}</span>
            <span class="service-duration-badge">⏱ ${svc.duration}</span>
          </div>
          <h4 class="service-catalog-title">${svc.title}</h4>
          <p class="service-catalog-desc">${svc.description}</p>
        </div>
      </div>
      <div class="service-cat-bottom-row">
        <div class="service-price-block">
          <span class="price-label">Narxi:</span>
          <span class="service-price-text">${svc.price}</span>
        </div>
        <button class="service-select-book-btn" onclick="bookServiceItem('${svc.title}')">
          <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>
          <span>Qabulga yozilish</span>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function bookServiceItem(svcTitle) {
  chosenService = svcTitle;
  const match = DENTAL_SERVICES.find(s => s.title.toLowerCase().includes(svcTitle.toLowerCase()) || svcTitle.toLowerCase().includes(s.title.toLowerCase()));
  if (match) {
    chosenPrice = match.price;
  }

  switchTab('schedule');

  // Highlight matching radio card in Step 3
  document.querySelectorAll('.sched-service-card').forEach(card => {
    if (card.textContent.toLowerCase().includes(svcTitle.toLowerCase().slice(0, 5))) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  updateScheduleSummary();
  showToast(`🦷 ${svcTitle} tanlandi`);
}

function filterServicesByCategory(category, btnEl) {
  document.querySelectorAll('.svc-cat-chip').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const query = document.getElementById('services-search-input')?.value.toLowerCase().trim() || '';

  let filtered = DENTAL_SERVICES;
  if (category && category !== 'Barchasi') {
    filtered = filtered.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }
  if (query) {
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    );
  }
  renderServicesCatalog(filtered);
  triggerHaptic('selection');
}

function filterServicesCatalog(queryVal) {
  const query = (queryVal !== undefined ? queryVal : (document.getElementById('services-search-input')?.value || '')).toLowerCase().trim();
  const activeChip = document.querySelector('.svc-cat-chip.active');
  const activeCategory = activeChip ? activeChip.textContent.trim() : 'Barchasi';

  let filtered = DENTAL_SERVICES;
  if (activeCategory && activeCategory !== 'Barchasi') {
    filtered = filtered.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());
  }
  if (query) {
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    );
  }
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

function onChatInputChanged(input) {
  const hasText = input.value.trim().length > 0;
  const micSvg = document.getElementById('chat-mic-svg');
  const sendSvg = document.getElementById('chat-send-svg');
  if (micSvg && sendSvg) {
    if (hasText) {
      micSvg.classList.add('hidden');
      sendSvg.classList.remove('hidden');
    } else {
      micSvg.classList.remove('hidden');
      sendSvg.classList.add('hidden');
    }
  }
}

function focusChatWithPrompt(text) {
  const input = document.getElementById('chat-text-input');
  if (input) {
    input.value = text;
    onChatInputChanged(input);
    input.focus();
  }
}

function openChatQuickMenu() {
  showToast('📎 Rasm yoki rentgen tasvirini biriktirish');
  triggerHaptic('light');
}

function handleChatSend() {
  const input = document.getElementById('chat-text-input');
  const text = input?.value.trim();
  if (!text) {
    // If empty and mic is clicked:
    showToast('🎙️ Ovoz orqali savol yozib olinmoqda...');
    triggerHaptic('warning');
    return;
  }

  appendChatMessage(text, 'user');
  input.value = '';
  onChatInputChanged(input);
  triggerHaptic('light');
  scrollChatToEnd();

  const typingRow = showChatTyping();
  scrollChatToEnd();

  setTimeout(() => {
    typingRow?.remove();
    const reply = getBotReply(text);
    appendChatMessage(reply, 'bot');
    scrollChatToEnd();
    triggerHaptic('light');
  }, 600);
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

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const row = document.createElement('div');
  row.className = `chat-message-row ${type === 'bot' ? 'bot-row' : 'user-row'}`;

  if (type === 'bot') {
    row.innerHTML = `
      <div class="chat-avatar-round">
        <svg viewBox="0 0 48 48" class="bubble-tooth-svg">
          <path d="M24 4C17.5 4 12 9.5 12 16c0 4.2 2.1 8 5.3 10.4L18 40c.2 2.2 2 4 4.2 4h3.6c2.2 0 4-1.8 4.2-4l.7-13.6C33.9 24 36 20.2 36 16c0-6.5-5.5-12-12-12zm-3 32h-1l-.5-8h2.3l-.8 8zm6 0l-.8-8h2.3l-.5 8h-1z" fill="#FFFFFF"/>
        </svg>
      </div>
      <div class="chat-bubble-col">
        <div class="chat-bubble bot-bubble">
          <div class="chat-bubble-text">${htmlText}</div>
          <div class="chat-bubble-time">${timeStr}</div>
        </div>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="chat-bubble user-bubble">
        <div class="chat-bubble-text">${htmlText}</div>
        <div class="chat-bubble-time user-time">
          <span>${timeStr}</span>
          <span class="double-check-blue">✓✓</span>
        </div>
      </div>
    `;
  }

  chatBox.appendChild(row);
}

function showChatTyping() {
  const chatBox = document.getElementById('chat-messages-box');
  const row = document.createElement('div');
  row.className = 'chat-message-row bot-row';

  row.innerHTML = `
    <div class="chat-avatar-round">
      <svg viewBox="0 0 48 48" class="bubble-tooth-svg">
        <path d="M24 4C17.5 4 12 9.5 12 16c0 4.2 2.1 8 5.3 10.4L18 40c.2 2.2 2 4 4.2 4h3.6c2.2 0 4-1.8 4.2-4l.7-13.6C33.9 24 36 20.2 36 16c0-6.5-5.5-12-12-12zm-3 32h-1l-.5-8h2.3l-.8 8zm6 0l-.8-8h2.3l-.5 8h-1z" fill="#FFFFFF"/>
      </svg>
    </div>
    <div class="chat-bubble-col">
      <div class="chat-bubble bot-bubble" style="display:inline-flex; align-items:center; gap:4px; padding:10px 14px;">
        <span style="font-size:12px; color:var(--text-muted);">DentAI javob tayyorlamoqda...</span>
      </div>
    </div>
  `;

  chatBox.appendChild(row);
  return row;
}

function scrollChatToEnd() {
  const box = document.getElementById('chat-messages-box');
  if (box) {
    box.scrollTop = box.scrollHeight;
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
window.changeSchedWeek = changeSchedWeek;
window.bookServiceItem = bookServiceItem;
window.filterServicesCatalog = filterServicesCatalog;
window.filterServicesByCategory = filterServicesByCategory;
window.handleChatSend = handleChatSend;
window.sendQuickPrompt = sendQuickPrompt;
window.onChatInputChanged = onChatInputChanged;
window.toggleQuickChips = toggleQuickChips;
window.simulateVoiceRecord = simulateVoiceRecord;
window.openNotifications = openNotifications;
window.openGoogleMap = openGoogleMap;
window.focusChatWithPrompt = focusChatWithPrompt;
window.openChatQuickMenu = openChatQuickMenu;
window.callClinicPhone = callClinicPhone;
window.viewStory = viewStory;
window.selectScheduleDoctor = selectScheduleDoctor;
window.executeOnlineBooking = executeOnlineBooking;
window.closeTicketModal = closeTicketModal;
window.addToGoogleCalendar = addToGoogleCalendar;

// ── App Init (Immediate & Safe) ──
function initApp() {
  try {
    switchTab('home');

    if (tg?.initDataUnsafe?.user?.first_name) {
      const pName = document.getElementById('home-patient-name');
      if (pName) pName.textContent = tg.initDataUnsafe.user.first_name;

      const pInputName = document.getElementById('sched-input-name') || document.getElementById('patient-name');
      if (pInputName && !pInputName.value) {
        const full = [tg.initDataUnsafe.user.first_name, tg.initDataUnsafe.user.last_name].filter(Boolean).join(' ');
        pInputName.value = full;
      }
    }

    renderScheduleDoctor('Zulfiya Karimova');
    renderOnlineServices();
    renderScheduleDays();
    renderScheduleTimeSlots();
    setupPhoneMask();
    updateScheduleSummary();
    renderServicesCatalog(DENTAL_SERVICES);
  } catch (e) {
    console.error('App init error:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
