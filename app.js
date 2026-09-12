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
    const scrollBox = document.querySelector(`#tab-${tabId} .scroll-area`);
    if (scrollBox) scrollBox.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Hide old tab
  const oldScene = document.getElementById(`tab-${currentActiveTab}`);
  const oldDockBtn = document.getElementById(`dock-btn-${currentActiveTab}`);
  if (oldScene) oldScene.classList.remove('active');
  if (oldDockBtn) oldDockBtn.classList.remove('active');

  // Show new tab with animation
  const targetScene = document.getElementById(`tab-${tabId}`);
  const targetDockBtn = document.getElementById(`dock-btn-${tabId}`);
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

// ── Doctor Picker Helpers ──
function selectDoctorQuick(doctorName, doctorSpec) {
  chosenDoctor = doctorName;
  switchTab('schedule');

  document.querySelectorAll('.doc-pick-card').forEach(card => {
    if (card.textContent.includes(doctorName.split(' ')[1])) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  const noteField = document.getElementById('patient-note');
  if (noteField) {
    noteField.value = `Shifokor: ${doctorName}`;
  }
}

function pickDoctorCard(cardElement, doctorName) {
  document.querySelectorAll('.doc-pick-card').forEach(c => c.classList.remove('active'));
  cardElement.classList.add('active');
  chosenDoctor = doctorName;
  triggerHaptic('selection');
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

// ── Calendar Strip Builder ──
function buildCalendarStrip() {
  const container = document.getElementById('booking-cal-strip');
  if (!container) return;
  container.innerHTML = '';

  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const isSunday = d.getDay() === 0;
    const isSelected = i === 0;

    const pill = document.createElement('div');
    pill.className = `calendar-day-pill ${isSelected ? 'selected' : ''} ${isSunday ? 'disabled' : ''} interactive-spring`;

    pill.innerHTML = `
      <span class="cal-day-name">${WEEKDAYS[d.getDay()]}</span>
      <span class="cal-day-number">${d.getDate()}</span>
      <span class="cal-status-dot"></span>
    `;

    if (!isSunday) {
      pill.onclick = () => onDayPicked(d, pill);
    }

    container.appendChild(pill);

    if (isSelected) {
      chosenDateObj = d;
      updateSelectedDayHint(d);
    }
  }

  buildTimeSlots();
}

function onDayPicked(date, pillEl) {
  document.querySelectorAll('.calendar-day-pill').forEach(p => p.classList.remove('selected'));
  pillEl.classList.add('selected');
  chosenDateObj = date;
  chosenTimeSlot = null;

  updateSelectedDayHint(date);
  buildTimeSlots();
  triggerHaptic('selection');
}

function updateSelectedDayHint(date) {
  const hint = document.getElementById('selected-day-text');
  if (!hint) return;
  const isToday = new Date().toDateString() === date.toDateString();
  if (isToday) {
    hint.textContent = `Bugun, ${date.getDate()}-${MONTHS[date.getMonth()]}`;
  } else {
    hint.textContent = `${WEEKDAYS[date.getDay()]}, ${date.getDate()}-${MONTHS[date.getMonth()]}`;
  }
}

// ── Time Slots (Morning & Afternoon) ──
function buildTimeSlots() {
  const morningBox = document.getElementById('morning-slots');
  const afternoonBox = document.getElementById('afternoon-slots');
  if (!morningBox || !afternoonBox) return;

  morningBox.innerHTML = '';
  afternoonBox.innerHTML = '';

  const morningTimes = ['09:00', '09:45', '10:30', '11:15', '12:00'];
  const afternoonTimes = ['14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30'];
  const busySlotsList = ['10:30', '14:45', '16:15'];

  morningTimes.forEach(time => {
    const isBusy = busySlotsList.includes(time);
    const chip = document.createElement('div');
    chip.className = `slot-chip ${isBusy ? 'busy' : ''} interactive-spring`;
    chip.textContent = time;
    if (!isBusy) {
      chip.onclick = () => selectSlot(chip, time);
    }
    morningBox.appendChild(chip);
  });

  afternoonTimes.forEach(time => {
    const isBusy = busySlotsList.includes(time);
    const chip = document.createElement('div');
    chip.className = `slot-chip ${isBusy ? 'busy' : ''} interactive-spring`;
    chip.textContent = time;
    if (!isBusy) {
      chip.onclick = () => selectSlot(chip, time);
    }
    afternoonBox.appendChild(chip);
  });
}

function selectSlot(chipEl, time) {
  document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('selected'));
  chipEl.classList.add('selected');
  chosenTimeSlot = time;
  triggerHaptic('light');
}

// ── Booking Confirmation ──
function executeBooking() {
  const name = document.getElementById('patient-name')?.value.trim();
  const phone = document.getElementById('patient-phone')?.value.trim();
  const service = document.getElementById('patient-service')?.value;
  const note = document.getElementById('patient-note')?.value.trim() || 'Izohsiz';

  if (!name) {
    showToast('⚠️ Iltimos, ismingizni kiriting');
    triggerHaptic('warning');
    return;
  }
  if (!phone || phone.length < 9) {
    showToast('⚠️ Telefon raqamni to\'liq kiriting');
    triggerHaptic('warning');
    return;
  }
  if (!chosenTimeSlot) {
    showToast('⚠️ Qabul soatini tanlang');
    triggerHaptic('warning');
    return;
  }

  const d = chosenDateObj || new Date();
  const dateStr = `${d.getDate()}-${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;

  const payload = {
    action: 'book',
    doctor: chosenDoctor,
    name,
    phone,
    service,
    date: dateStr,
    time: chosenTimeSlot,
    note
  };

  // Telegramga uzatish
  if (tg) {
    try {
      tg.sendData(JSON.stringify(payload));
    } catch (e) {
      console.log('Telegram send error:', e);
    }
  }

  // Receipt modal
  const receiptBox = document.getElementById('booking-receipt-details');
  if (receiptBox) {
    receiptBox.innerHTML = `
      <div class="receipt-row">
        <span class="receipt-key">Shifokor:</span>
        <span class="receipt-val">${chosenDoctor}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Sana & Vaqt:</span>
        <span class="receipt-val">${dateStr} · ${chosenTimeSlot}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Bemor:</span>
        <span class="receipt-val">${name}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Xizmat:</span>
        <span class="receipt-val">${service}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Telefon:</span>
        <span class="receipt-val">${phone}</span>
      </div>
    `;
  }

  document.getElementById('booking-modal-overlay')?.classList.remove('hidden');
  triggerHaptic('success');

  // Formani tozalash
  document.getElementById('patient-name').value = '';
  document.getElementById('patient-phone').value = '';
  document.getElementById('patient-note').value = '';
  document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('selected'));
  chosenTimeSlot = null;
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

function filterServicesCatalog() {
  const query = document.getElementById('search-svc-input')?.value.toLowerCase().trim() || '';
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
window.pickDoctorCard = pickDoctorCard;
window.bookCategory = bookCategory;
window.executeBooking = executeBooking;
window.closeBookingModal = closeBookingModal;
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
    }

    buildCalendarStrip();
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
