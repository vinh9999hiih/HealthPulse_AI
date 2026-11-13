/**
 * HealthPulse AI — App Controller
 * Giao diện hiện đại, sạch sẽ, trực quan
 * Hỗ trợ 4 ngôn ngữ: Tiếng Việt, English, 한국어, 中文
 */

/* ===== STATE ===== */
const S = {
  lang: 'vi',
  patient: {
    id: String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0'),
    name: 'Nguyễn Văn A',
    age: 35,
    gender: 'Nam'
  },
  temp: 36.5, spo2: 98, hr: 75, sys: 120, dia: 80,
  symptoms: [], days: 1,
  estimated: false,
  est: { estTemp: 'normal', estBreathing: 'normal', manualPulse: null },
  result: null,
  tapTimes: [], tapTimer: null,
  history: []
};

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  loadStorage();
  applyLanguage(S.lang);
  buildSymptoms();
  initTap();
  initToggles();
  syncDisplays();
  updateEstModeUI();
  analyze();
  initChart();

  document.getElementById('btnSOS')?.addEventListener('click', openSOS);
  document.getElementById('btnVoice')?.addEventListener('click', readVoice);

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        try { window.speechSynthesis.getVoices(); } catch(e) {}
      };
    } catch(e) {}
  }
});

/* ===== LOCAL STORAGE ===== */
function loadStorage() {
  try {
    const lang = localStorage.getItem('hp_lang');
    if (lang && ['vi', 'en', 'ko', 'zh'].includes(lang)) {
      S.lang = lang;
    }
    const h = localStorage.getItem('hp_hist');
    if (h) S.history = JSON.parse(h);
    const p = localStorage.getItem('hp_patient');
    if (p) {
      try { Object.assign(S.patient, JSON.parse(p)); } catch(e) {}
    }
    if (localStorage.getItem('hp_dark') === '1') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('btnDarkMode')?.classList.add('on');
    }
    if (localStorage.getItem('hp_lg') === '1') {
      document.body.setAttribute('data-size', 'lg');
      document.getElementById('btnElderly')?.classList.add('on');
    }
  } catch(e) {}
}

function saveHistory() {
  try { localStorage.setItem('hp_hist', JSON.stringify(S.history.slice(-30))); } catch(e) {}
}

/* ===== PATIENT PROFILE COMPACT ===== */
function toggleEditPatient() {
  const drawer = document.getElementById('patientEditDrawer');
  if (!drawer) return;
  const isHidden = drawer.style.display === 'none';
  drawer.style.display = isHidden ? 'block' : 'none';
  const txt = document.getElementById('txtEditPatient');
  if (txt) {
    txt.textContent = isHidden ? getTranslation('btnDoneEdit') : getTranslation('btnEditPatient');
  }
}

function onPatientChange() {
  const name = document.getElementById('inpPatientName')?.value.trim() || 'Nguyễn Văn A';
  const age = parseInt(document.getElementById('inpPatientAge')?.value) || 35;
  const gender = document.getElementById('inpPatientGender')?.value || 'Nam';
  S.patient.name = name;
  S.patient.age = age;
  S.patient.gender = gender;
  try { localStorage.setItem('hp_patient', JSON.stringify(S.patient)); } catch(e) {}

  updatePatientSummary();
  if (document.getElementById('page_report')?.classList.contains('active-page')) {
    renderReport();
  }
}

function updatePatientSummary() {
  const elName = document.getElementById('dispPatientSummaryName');
  if (elName) elName.textContent = S.patient.name || 'Nguyễn Văn A';
  const elMeta = document.getElementById('dispPatientSummaryMeta');
  const genderKey = S.patient.gender === 'Nữ' ? 'genderFemale' : S.patient.gender === 'Khác' ? 'genderOther' : 'genderMale';
  const genderText = getTranslation(genderKey);
  const ageUnit = getTranslation('lblAge').toLowerCase();
  if (elMeta) elMeta.textContent = `${S.patient.age || 35} ${ageUnit} • ${genderText}`;
  const elBadge = document.getElementById('dispPatientIdBadge');
  if (elBadge) elBadge.textContent = `${getTranslation('patientIdLabel')} ${S.patient.id}`;
}

/* ===== STEPPER & VITALS ===== */
function stepEstHR(delta) {
  let current = parseInt(S.est.manualPulse || S.hr || 70);
  if (isNaN(current)) current = 70;
  let next = Math.max(40, Math.min(220, current + delta));
  S.est.manualPulse = next;
  S.hr = next;
  syncDisplays();
  updateEstModeUI();
  analyze();
}

function setEstHR(val) {
  let n = parseInt(val);
  if (!isNaN(n)) {
    n = Math.max(30, Math.min(220, n));
    S.est.manualPulse = n;
    S.hr = n;
    syncDisplays();
    analyze();
  }
}

function stepVal(type, delta) {
  if (type === 'temp') {
    S.temp = Math.round(Math.max(34, Math.min(43, S.temp + delta)) * 10) / 10;
  } else if (type === 'spo2') {
    S.spo2 = Math.max(70, Math.min(100, S.spo2 + delta));
  } else if (type === 'hr') {
    S.hr = Math.max(40, Math.min(220, S.hr + delta));
  } else if (type === 'days') {
    S.days = Math.max(1, Math.min(30, S.days + delta));
    updateDurationChips();
  } else if (type === 'sys') {
    S.sys = Math.max(70, Math.min(220, S.sys + delta));
  } else if (type === 'dia') {
    S.dia = Math.max(40, Math.min(140, S.dia + delta));
  }
  syncDisplays();
  updateEstModeUI();
  analyze();
}

function setDays(n) {
  S.days = n;
  updateDurationChips();
  syncDisplays();
  updateEstModeUI();
  analyze();
}

function updateDurationChips() {
  document.querySelectorAll('.dur-chip').forEach(c => {
    const num = parseInt(c.textContent);
    c.classList.toggle('active', num === S.days || (num === 7 && S.days >= 7));
  });
}

function syncDisplays() {
  // 1. Thân nhiệt
  const elTemp = document.getElementById('dispTemp');
  if (elTemp) elTemp.textContent = S.temp.toFixed(1);
  const badgeTemp = document.getElementById('badgeTemp');
  if (badgeTemp) {
    if (S.temp >= 38.5) {
      badgeTemp.textContent = `${S.temp.toFixed(1)}°C (Sốt cao)`;
      badgeTemp.className = 'v-status-badge status-danger';
    } else if (S.temp >= 37.5) {
      badgeTemp.textContent = `${S.temp.toFixed(1)}°C (Sốt nhẹ)`;
      badgeTemp.className = 'v-status-badge status-warn';
    } else if (S.temp < 35.5) {
      badgeTemp.textContent = `${S.temp.toFixed(1)}°C (Hạ nhiệt)`;
      badgeTemp.className = 'v-status-badge status-danger';
    } else {
      badgeTemp.textContent = `${S.temp.toFixed(1)}°C (${getTranslation('statSafe')})`;
      badgeTemp.className = 'v-status-badge status-ok';
    }
  }

  // 2. Oxy SpO2
  const elSpO2 = document.getElementById('dispSpO2');
  if (elSpO2) elSpO2.textContent = S.spo2;
  const badgeSpO2 = document.getElementById('badgeSpO2');
  if (badgeSpO2) {
    if (S.spo2 < 93) {
      badgeSpO2.textContent = `${S.spo2}% (Cấp cứu!)`;
      badgeSpO2.className = 'v-status-badge status-danger';
    } else if (S.spo2 <= 95) {
      badgeSpO2.textContent = `${S.spo2}% (${getTranslation('statWarning')})`;
      badgeSpO2.className = 'v-status-badge status-warn';
    } else {
      badgeSpO2.textContent = `${S.spo2}% (Tốt)`;
      badgeSpO2.className = 'v-status-badge status-ok';
    }
  }

  // 3. Nhịp tim
  const elHR = document.getElementById('dispHR');
  if (elHR) elHR.textContent = S.hr;
  const badgeHR = document.getElementById('badgeHR');
  if (badgeHR) {
    if (S.hr >= 110) {
      badgeHR.textContent = `${S.hr} BPM (Nhanh)`;
      badgeHR.className = 'v-status-badge status-warn';
    } else if (S.hr < 55) {
      badgeHR.textContent = `${S.hr} BPM (Chậm)`;
      badgeHR.className = 'v-status-badge status-warn';
    } else {
      badgeHR.textContent = `${S.hr} BPM (${getTranslation('statSafe')})`;
      badgeHR.className = 'v-status-badge status-ok';
    }
  }

  // Đồng bộ mục Nhịp tim mạch cổ tay (chế độ ước lượng lâm sàng)
  const estHR = S.est.manualPulse || S.hr || 70;
  const inpEstHR = document.getElementById('inpEstHR');
  if (inpEstHR && document.activeElement !== inpEstHR) {
    inpEstHR.value = estHR;
  }
  const badgeEstHR = document.getElementById('badgeEstHR');
  if (badgeEstHR) {
    let statText = getTranslation('statSafe');
    let cls = 'status-ok';
    if (estHR >= 120) {
      statText = currentLang === 'vi' ? 'Rất nhanh (Nguy hiểm)' : getTranslation('statHRFast');
      cls = 'status-danger';
    } else if (estHR >= 100) {
      statText = getTranslation('statHRFast');
      cls = 'status-warn';
    } else if (estHR < 60) {
      statText = getTranslation('statHRSlow');
      cls = 'status-warn';
    }
    badgeEstHR.textContent = `${estHR} BPM (${statText})`;
    badgeEstHR.className = `pulse-status-badge ${cls}`;
  }

  // 4. Huyết áp (Đồng bộ cả Tâm thu và Tâm trương)
  const elBP = document.getElementById('dispBP');
  if (elBP) elBP.textContent = `${S.sys}/${S.dia}`;
  const elSys = document.getElementById('dispSys');
  if (elSys) elSys.textContent = S.sys;
  const elDia = document.getElementById('dispDia');
  if (elDia) elDia.textContent = S.dia;

  const badgeBP = document.getElementById('badgeBP');
  if (badgeBP) {
    const isAbnormal = S.sys >= 140 || S.sys < 90 || S.dia >= 90 || S.dia < 60;
    const statText = isAbnormal ? getTranslation('statWarning') : getTranslation('statSafe');
    badgeBP.textContent = `${S.sys}/${S.dia} (${statText})`;
    badgeBP.className = `v-status-badge ${isAbnormal ? 'status-warn' : 'status-ok'}`;
  }

  // 5. Số ngày
  const elDays = document.getElementById('dispDays');
  if (elDays) elDays.textContent = `${S.days} ${getTranslation('daysSuffix')}`;

  // Inputs đồng bộ
  const elPName = document.getElementById('inpPatientName');
  if (elPName && document.activeElement !== elPName) elPName.value = S.patient.name;
  const elPAge = document.getElementById('inpPatientAge');
  if (elPAge && document.activeElement !== elPAge) elPAge.value = S.patient.age;
  const elPGender = document.getElementById('inpPatientGender');
  if (elPGender && document.activeElement !== elPGender) elPGender.value = S.patient.gender;

  updatePatientSummary();
  updateSymUI();
}

/* ===== ESTIMATION MODE ===== */
function updateEstModeUI() {
  const sw = document.getElementById('switchEstUI');
  if (sw) sw.classList.toggle('on', S.estimated);

  const drawer = document.getElementById('secNoDevice');
  if (drawer) drawer.style.display = S.estimated ? 'block' : 'none';

  const grid = document.getElementById('vitalsSmartGrid');
  const lockBadge = document.getElementById('vitalsLockBadge');
  const lockBanner = document.getElementById('vitalsLockBanner');
  const hint = document.getElementById('vitalsSecHint');

  if (grid) {
    grid.classList.toggle('is-disabled', S.estimated);
    grid.querySelectorAll('button').forEach(btn => {
      btn.disabled = S.estimated;
    });
  }

  if (lockBadge) lockBadge.style.display = S.estimated ? 'inline-flex' : 'none';
  if (lockBanner) lockBanner.style.display = S.estimated ? 'flex' : 'none';

  if (hint) {
    hint.textContent = S.estimated
      ? (getTranslation('vitalsSecHintLocked') || 'Đã vô hiệu hóa để dùng bảng ước lượng bên dưới')
      : getTranslation('vitalsSecHint');
  }
}

function toggleEstMode() {
  S.estimated = !S.estimated;
  updateEstModeUI();
  analyze();
}

function pickEst(btn) {
  const g = btn.dataset.g;
  const v = btn.dataset.v;
  S.est[g] = v;
  btn.parentElement.querySelectorAll('.est-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  analyze();
}

/* ===== 15-SECOND COUNTDOWN PULSE METER CONTROLLER ===== */
const PulseMeter = {
  duration: 15,          // 15 giây chuẩn lâm sàng
  secondsLeft: 15,
  countedBeats: 18,      // Mặc định 18 nhịp (18 × 4 = 72 BPM)
  state: 'idle',         // 'idle' | 'running' | 'paused' | 'done'
  intervalId: null,
  endTime: null,
  pausedRemainingMs: 15000,
  CIRCUMFERENCE: 502.65, // 2 * PI * 80

  openModal() {
    if (this.state === 'done') {
      this.reset();
    }
    // Gán giá trị nhịp mặc định từ nhịp tim hiện tại nếu có
    const currentBpm = S.est?.manualPulse || S.hr || 72;
    this.countedBeats = Math.max(5, Math.min(60, Math.round(currentBpm / 4)));
    const inp = document.getElementById('inpCountedBeats');
    if (inp) inp.value = this.countedBeats;
    this.updateFormulaDisplay();

    const m = document.getElementById('modalTap');
    if (m) m.style.display = 'flex';
    this.renderUI();
  },

  closeModal() {
    this.stopTimer();
    const m = document.getElementById('modalTap');
    if (m) m.style.display = 'none';
  },

  startNew() {
    this.reset();
    this.start();
  },

  reset() {
    this.stopTimer();
    this.state = 'idle';
    this.secondsLeft = this.duration;
    this.pausedRemainingMs = this.duration * 1000;
    this.renderUI();
    this.updateCountdownDisplay();
  },

  start() {
    if (this.state === 'running') return;
    try { HealthAudio?.init?.(); } catch(e) {}

    const remainingMs = this.state === 'paused' ? this.pausedRemainingMs : this.duration * 1000;
    this.endTime = performance.now() + remainingMs;
    this.state = 'running';
    this.renderUI();

    this.stopTimer();
    this.intervalId = setInterval(() => {
      const msLeft = this.endTime - performance.now();
      this.secondsLeft = Math.max(0, msLeft / 1000);
      this.updateCountdownDisplay();

      if (this.secondsLeft <= 0) {
        this.finish();
      }
    }, 40);
  },

  togglePause() {
    if (this.state === 'running') {
      this.stopTimer();
      this.pausedRemainingMs = Math.max(0, this.endTime - performance.now());
      this.secondsLeft = this.pausedRemainingMs / 1000;
      this.state = 'paused';
      this.renderUI();
      this.updateCountdownDisplay();
    } else if (this.state === 'paused') {
      this.start();
    }
  },

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  finish() {
    this.stopTimer();
    this.state = 'done';
    this.secondsLeft = 0;
    this.updateCountdownDisplay();

    try { HealthAudio?.playSafeChime?.(); } catch(e) {}

    this.updateFormulaDisplay();
    this.renderUI();
  },

  stepBeats(delta) {
    let val = parseInt(this.countedBeats);
    if (isNaN(val)) val = 18;
    this.countedBeats = Math.max(5, Math.min(60, val + delta));
    const inp = document.getElementById('inpCountedBeats');
    if (inp) inp.value = this.countedBeats;
    this.updateFormulaDisplay();
  },

  onBeatsChange(val) {
    let parsed = parseInt(val);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 90) {
      this.countedBeats = parsed;
    }
    this.updateFormulaDisplay();
  },

  updateFormulaDisplay() {
    const el = document.getElementById('tapFormulaDisplay');
    const beats = parseInt(this.countedBeats) || 0;
    const bpm = Math.max(20, Math.min(240, beats * 4));
    const unit = getTranslation('tapBeatsUnit') || 'nhịp';
    if (el) {
      el.textContent = `${beats} ${unit} × 4 = ${bpm} BPM`;
    }
  },

  applyAndClose() {
    const beats = parseInt(this.countedBeats) || 18;
    const finalBpm = Math.max(30, Math.min(240, Math.round(beats * 4)));

    // Lưu vào hệ thống chỉ số sinh hiệu và phân tích
    S.hr = finalBpm;
    S.est.manualPulse = finalBpm;
    syncDisplays();
    updateEstModeUI();
    analyze();

    try { HealthAudio?.playBeepSuccess?.(); } catch(e) {}
    this.closeModal();
  },

  updateCountdownDisplay() {
    const clock = document.getElementById('tapClockBig');
    const ring = document.getElementById('tapRingProgress');
    const bar = document.getElementById('tapProgressBar');

    const progressFraction = Math.max(0, Math.min(1, (this.duration - this.secondsLeft) / this.duration)); // 0 -> 1
    const offset = progressFraction * this.CIRCUMFERENCE;

    if (clock) clock.textContent = this.secondsLeft.toFixed(1);
    if (ring) {
      ring.style.strokeDashoffset = offset;
      ring.style.stroke = this.state === 'done' ? '#10b981' : 'var(--secondary)';
    }
    if (bar) bar.style.width = `${(progressFraction * 100).toFixed(1)}%`;
  },

  renderUI() {
    const badge = document.getElementById('tapBadgeContainer');
    const badgeText = document.getElementById('tapStatusBadge');
    const clockSub = document.getElementById('tapClockSub');
    const btnStart = document.getElementById('btnTimerStart');
    const runningControls = document.getElementById('timerRunningControls');
    const btnPauseText = document.getElementById('btnPauseText');
    const resultCard = document.getElementById('tapResultCard');
    const btnRetest = document.getElementById('btnTapRetest');

    if (this.state === 'idle') {
      if (badge) badge.className = 'tap-header-badge';
      if (badgeText) badgeText.textContent = getTranslation('tapStatusReady') || 'Sẵn sàng đếm ngược 15 giây';
      if (clockSub) {
        clockSub.textContent = '15 GIÂY';
        clockSub.className = 'tap-clock-sub';
      }
      if (btnStart) btnStart.style.display = 'flex';
      if (runningControls) runningControls.style.display = 'none';
      if (resultCard) resultCard.style.display = 'none';
      if (btnRetest) btnRetest.style.display = 'none';
      this.updateCountdownDisplay();
    } else if (this.state === 'running') {
      if (badge) badge.className = 'tap-header-badge measuring';
      if (badgeText) badgeText.textContent = getTranslation('tapStatusRunning') || 'Đang đếm ngược 15 giây… Hãy đếm số nhịp đập trong đầu!';
      if (clockSub) {
        clockSub.textContent = 'ĐANG ĐẾM…';
        clockSub.className = 'tap-clock-sub pulse-anim';
      }
      if (btnStart) btnStart.style.display = 'none';
      if (runningControls) runningControls.style.display = 'flex';
      if (btnPauseText) btnPauseText.textContent = getTranslation('tapBtnPause') || '⏸️ Tạm dừng';
      if (resultCard) resultCard.style.display = 'none';
      if (btnRetest) btnRetest.style.display = 'none';
    } else if (this.state === 'paused') {
      if (badge) badge.className = 'tap-header-badge';
      if (badgeText) badgeText.textContent = getTranslation('tapStatusPaused') || 'Đang tạm dừng đếm ngược';
      if (clockSub) {
        clockSub.textContent = 'TẠM DỪNG';
        clockSub.className = 'tap-clock-sub';
      }
      if (btnStart) btnStart.style.display = 'none';
      if (runningControls) runningControls.style.display = 'flex';
      if (btnPauseText) btnPauseText.textContent = getTranslation('tapBtnResume') || '▶️ Tiếp tục';
      if (resultCard) resultCard.style.display = 'none';
      if (btnRetest) btnRetest.style.display = 'none';
    } else if (this.state === 'done') {
      if (badge) badge.className = 'tap-header-badge done';
      if (badgeText) badgeText.textContent = getTranslation('tapStatusDone') || 'Đã hết 15 giây! Nhập số nhịp bạn đếm được:';
      if (clockSub) {
        clockSub.textContent = 'HOÀN THÀNH';
        clockSub.className = 'tap-clock-sub done';
      }
      if (btnStart) btnStart.style.display = 'none';
      if (runningControls) runningControls.style.display = 'none';
      if (resultCard) resultCard.style.display = 'block';
      if (btnRetest) btnRetest.style.display = 'inline-flex';
    }
  }
};

window.PulseMeter = PulseMeter;

function openTapModal() {
  PulseMeter.openModal();
}

function closeTapModal() {
  PulseMeter.closeModal();
}

function initTap() {
  // Đồng hồ đếm ngược 15 giây sẵn sàng
}


/* ===== SYMPTOMS ===== */
function buildSymptoms() {
  const g = document.getElementById('symptomsGrid');
  if (!g) return;
  g.innerHTML = '';

  HealthPulseEngine.SYMPTOMS_CATALOG.forEach(s => {
    const trans = getSymptomTranslation(s.id);
    const isSelected = S.symptoms.includes(s.id);
    const el = document.createElement('div');
    el.className = `sym-card ${s.isRedFlag ? 'red' : ''} ${isSelected ? 'on' : ''}`;
    el.id = 'sym_' + s.id;
    el.innerHTML = `
      <div class="sym-card-name">
        <span>${trans.name}</span>
        <span class="sym-card-check">✓</span>
      </div>
      <div class="sym-card-desc">${trans.desc}</div>
    `;
    el.onclick = () => toggleSym(s.id);
    g.appendChild(el);
  });
  updateSymCount();
}

function toggleSym(id) {
  const i = S.symptoms.indexOf(id);
  if (i > -1) S.symptoms.splice(i, 1); else S.symptoms.push(id);
  updateSymUI();
  analyze();
}

function updateSymCount() {
  const el = document.getElementById('symCountBadge');
  if (el) {
    el.textContent = `${S.symptoms.length} ${getTranslation('repSymptomsSelected').replace(':', '')}`;
  }
}

function updateSymUI() {
  HealthPulseEngine.SYMPTOMS_CATALOG.forEach(s => {
    const el = document.getElementById('sym_' + s.id);
    if (el) el.classList.toggle('on', S.symptoms.includes(s.id));
  });
  updateSymCount();

  const names = S.symptoms.map(id => {
    const trans = getSymptomTranslation(id);
    return trans.name;
  });
  const el = document.getElementById('homeSymptomsText');
  if (el) {
    el.innerText = names.length > 0
      ? names.join(' • ') + (S.days > 1 ? ` (${S.days} ${getTranslation('daysSuffix')})` : '')
      : getTranslation('homeNoSymptoms');
  }
}

/* ===== ANALYZE LOGIC ===== */
function analyze() {
  const estHR = S.est.manualPulse || S.hr || 70;
  const input = {
    temperature: S.estimated ? null : S.temp,
    spo2: S.estimated ? null : S.spo2,
    heartRate: S.estimated ? estHR : S.hr,
    systolic: S.sys, diastolic: S.dia,
    symptoms: S.symptoms,
    durationDays: S.days,
    isEstimatedMode: S.estimated,
    estTemp: S.est.estTemp,
    estBreathing: S.est.estBreathing,
    manualPulse: estHR
  };

  const r = HealthPulseEngine.evaluate(input, currentLang);
  S.result = r;

  // Cập nhật Home Hero Card
  const hero = document.getElementById('statusHero');
  const levelBadge = document.getElementById('heroLevel');
  const heroScore = document.getElementById('heroScore');
  const heroMsg = document.getElementById('heroMessage');

  if (hero && levelBadge && heroScore && heroMsg) {
    hero.className = `hero-card level-${r.level === 'red' ? 'danger' : r.level === 'yellow' ? 'warn' : 'safe'}`;
    const levelKey = r.level === 'red' ? 'heroStatusDanger' : r.level === 'yellow' ? 'heroStatusWarning' : 'heroStatusSafe';
    levelBadge.textContent = getTranslation(levelKey);
    heroScore.textContent = r.score;
    heroMsg.textContent = r.alertMessage;
  }

  // 4 Thẻ sinh hiệu trên Home (đa ngôn ngữ chuẩn y khoa)
  const tempStat = S.estimated ? getTranslation('statNotMeasured') : S.temp >= 38.5 ? getTranslation('statFeverHigh') : S.temp >= 37.5 ? getTranslation('statFeverMild') : getTranslation('statSafe');
  updateHomeMetric('mTemp', 'mTempVal', 'mTempStat', S.estimated ? '--' : S.temp.toFixed(1) + ' °C', tempStat, S.temp >= 38.5 ? 'danger' : S.temp >= 37.5 ? 'warn' : 'ok');

  const spo2Stat = S.estimated ? getTranslation('statusEstimated') : S.spo2 < 93 ? getTranslation('statHypoxia') : getTranslation('statSafe');
  updateHomeMetric('mSpO2', 'mSpO2Val', 'mSpO2Stat', S.estimated ? (r.breakdown.spo2Est ? '~' + r.breakdown.spo2Est + '%' : '--') : S.spo2 + ' %', spo2Stat, S.spo2 < 93 ? 'danger' : S.spo2 <= 95 ? 'warn' : 'ok');

  const displayHR = S.estimated ? estHR : S.hr;
  const hrStat = displayHR >= 110 ? getTranslation('statHRFast') : displayHR < 60 ? getTranslation('statHRSlow') : getTranslation('statSafe');
  updateHomeMetric('mHR', 'mHRVal', 'mHRStat', `${displayHR} BPM`, hrStat, displayHR >= 110 ? 'warn' : 'ok');

  const isBPDanger = S.sys >= 180 || S.dia >= 120 || S.sys < 90 || S.dia < 60;
  const isBPWarn = S.sys >= 140 || S.dia >= 90;
  const bpStat = (S.sys >= 140 || S.dia >= 90) ? getTranslation('statBPHigh') : (S.sys < 90 || S.dia < 60) ? getTranslation('statBPLow') : getTranslation('statSafe');
  updateHomeMetric('mBP', 'mBPVal', 'mBPStat', `${S.sys}/${S.dia}`, bpStat, isBPDanger ? 'danger' : isBPWarn ? 'warn' : 'ok');

  // Lời khuyên AI trên Home
  const homeAdv = document.getElementById('homeAdvice');
  if (homeAdv) homeAdv.textContent = r.recommendation;
  const homeSched = document.getElementById('homeSchedule');
  if (homeSched) homeSched.textContent = r.scheduleAdvice;

  // Cập nhật trang Chi Tiết
  renderBreakdown(r);

  // Cập nhật Báo Cáo nếu đang mở
  if (document.getElementById('page_report')?.classList.contains('active-page')) {
    renderReport();
  }
}

function updateHomeMetric(cardId, valId, statId, val, stat, level) {
  const card = document.getElementById(cardId);
  const v = document.getElementById(valId);
  const s = document.getElementById(statId);
  if (card) card.className = `metric-card mc-${level}`;
  if (v) v.textContent = val;
  if (s) s.textContent = stat;
}

function renderBreakdown(r) {
  const b = r.breakdown;
  const pts = getTranslation('ptsSuffix');
  const setStep = (id, title, val, sub, formula) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `
      <div class="bk-head"><span>${title}</span><span class="bk-val">${val}</span></div>
      <div class="bk-sub">${sub}</div>
      ${formula ? `<div class="bk-formula">${formula}</div>` : ''}
    `;
  };

  const tScore = b.tempScore ?? 0;
  const oScore = b.spo2Score ?? 0;
  const hrScore = b.heartRateScore ?? 0;
  const sVital = b.sVital ?? b.sVitalTotal ?? 0;

  const vitalSub = currentLang === 'en'
    ? `Temp: ${tScore} pts, SpO2: ${oScore} pts, Pulse: ${hrScore} pts`
    : currentLang === 'ko'
    ? `체온: ${tScore}점, SpO2: ${oScore}점, 맥박: ${hrScore}점`
    : currentLang === 'zh'
    ? `体温: ${tScore}分, SpO2: ${oScore}分, 脉搏: ${hrScore}分`
    : `Thân nhiệt: ${tScore} đ, SpO2: ${oScore} đ, Nhịp tim: ${hrScore} đ`;

  const durationSub = currentLang === 'en'
    ? `Duration ${b.durationDays} ${getTranslation('daysSuffix')} (Formula D = 1 + (N−1) × 0.3)`
    : currentLang === 'ko'
    ? `지속 기간 ${b.durationDays} ${getTranslation('daysSuffix')} (공식 D = 1 + (N−1) × 0.3)`
    : currentLang === 'zh'
    ? `持续 ${b.durationDays} ${getTranslation('daysSuffix')} (公式 D = 1 + (N−1) × 0.3)`
    : `Kéo dài ${b.durationDays} ${getTranslation('daysSuffix')} (Công thức D = 1 + (N−1) × 0.3)`;

  const symSub = currentLang === 'en'
    ? `Weighted symptom sum: ${b.sSymptomRaw} × ${b.durationFactor}`
    : currentLang === 'ko'
    ? `가중 증상 합계: ${b.sSymptomRaw} × ${b.durationFactor}`
    : currentLang === 'zh'
    ? `加权症状总计: ${b.sSymptomRaw} × ${b.durationFactor}`
    : `Tổng trọng số triệu chứng: ${b.sSymptomRaw} × ${b.durationFactor}`;

  setStep('bk1', getTranslation('step1Title'), `+${sVital} ${pts}`, vitalSub);
  setStep('bk2', getTranslation('step2Title'), `D = ${b.durationFactor}`, durationSub);
  setStep('bk3', getTranslation('step3Title'), `+${b.sSymptomWeighted} ${pts}`, symSub);
  setStep('bk4', getTranslation('step4Title'), `${b.totalScore} / 100`, `${r.levelName.toUpperCase()} — ${r.alertMessage}`, `S = ${sVital} + (${b.sSymptomRaw} × ${b.durationFactor}) = ${b.totalScore}`);
}

/* ===== SUBMIT CHECKIN ===== */
function submitCheckin() {
  try { HealthAudio?.playBeepSuccess?.(); } catch(e) {}
  const now = new Date();
  const dateStr = now.toLocaleDateString(currentLang === 'en' ? 'en-US' : currentLang === 'ko' ? 'ko-KR' : currentLang === 'zh' ? 'zh-CN' : 'vi-VN', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit' });

  // Lưu lịch sử
  S.history.push({
    date: dateStr,
    temp: S.temp,
    hr: S.hr,
    spo2: S.spo2,
    score: S.result ? S.result.score : 0,
    level: S.result ? S.result.level : 'green'
  });
  saveHistory();

  // Chuyển sang trang Tổng quan
  switchTab('home');
}

/* ===== TABS & NAVIGATION ===== */
function switchTab(tabId) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active-page'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  stopVoice();

  const sec = document.getElementById('page_' + tabId);
  if (sec) sec.classList.add('active-page');

  const btn = document.querySelector(`.nav-item[data-page="${tabId}"]`);
  if (btn) btn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'report') renderReport();
  if (tabId === 'trends') renderTrends();
}

/* ===== SOS MODAL & VOICE ===== */
function openSOS() {
  const m = document.getElementById('modalSOS');
  if (m) m.style.display = 'flex';
  try { HealthAudio?.playAlertWarning?.(); } catch(e) {}

  // Lấy GPS thực tế
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const t = document.getElementById('gpsText');
        if (t) t.innerText = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      },
      () => {
        const t = document.getElementById('gpsText');
        if (t) t.innerText = '10.7769° N, 106.7009° E (Ước tính TP.HCM)';
      },
      { timeout: 5000 }
    );
  }
}

function closeSOS() {
  const m = document.getElementById('modalSOS');
  if (m) m.style.display = 'none';
}

function copySMS() {
  const coords = document.getElementById('gpsText')?.innerText || 'Không có tọa độ';
  const prefix = currentLang === 'en' ? '[EMERGENCY HealthPulse AI]' : currentLang === 'ko' ? '[긴급 의료 HealthPulse AI]' : currentLang === 'zh' ? '[紧急求救 HealthPulse AI]' : '[KHẨN CẤP HealthPulse AI]';
  const text = `${prefix} ${S.patient.name} (${S.patient.age}) GPS: ${coords} | SpO2=${S.spo2}%, HR=${S.hr}BPM, Temp=${S.temp}°C, Risk=${S.result?.score}/100`;
  navigator.clipboard.writeText(text).then(() => {
    alert(getTranslation('smsCopiedAlert'));
  }).catch(() => {
    prompt('SMS:', text);
  });
}

let currentVoiceAudio = null;
let isVoiceSpeaking = false;
let voiceWatchdog = null;

function updateVoiceUI(speaking) {
  const btn = document.getElementById('btnVoice');
  const txt = document.getElementById('voiceBtnText');
  const icon = document.getElementById('voiceIcon');
  if (btn) btn.classList.toggle('speaking', speaking);
  if (txt) txt.textContent = speaking ? getTranslation('btnVoiceStop') : getTranslation('btnVoice');
  if (icon) {
    if (speaking) {
      icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    } else {
      icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    }
  }
}

function stopVoice() {
  if (voiceWatchdog) {
    clearInterval(voiceWatchdog);
    voiceWatchdog = null;
  }
  if (currentVoiceAudio) {
    try {
      currentVoiceAudio.pause();
      currentVoiceAudio.currentTime = 0;
    } catch(e) {}
    currentVoiceAudio = null;
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch(e) {}
  }
  isVoiceSpeaking = false;
  window.__hpVoiceUtterance = null;
  updateVoiceUI(false);
}

let systemVoices = [];
function loadSystemVoices() {
  if ('speechSynthesis' in window) {
    systemVoices = window.speechSynthesis.getVoices() || [];
  }
}
if ('speechSynthesis' in window) {
  loadSystemVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadSystemVoices();
  };
}

function findVoiceForLang(lang) {
  let voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length && systemVoices.length) voices = systemVoices;
  const target = (lang || 'vi').toLowerCase();
  
  // 1. Tìm chính xác theo mã ngôn ngữ (vi-VN, vi_VN, vi)
  let found = voices.find(v => {
    const l = (v.lang || '').replace('_', '-').toLowerCase();
    return l === target || l.startsWith(target + '-') || l.startsWith(target);
  });
  if (found) return found;

  // 2. Tìm theo tên giọng (Linh, Mai, HoaiMy, NamMinh, Google Tiếng Việt, Vietnamese, Vietnam)
  if (target === 'vi') {
    found = voices.find(v => {
      const n = (v.name || '').toLowerCase();
      const l = (v.lang || '').toLowerCase();
      return n.includes('viet') || n.includes('tiếng việt') || l.includes('vie') || n.includes('linh') || n.includes('mai');
    });
    if (found) return found;
  }

  return voices.find(v => (v.lang || '').toLowerCase().startsWith(target));
}

function splitTextIntoTTSChunks(text, maxLength = 120) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = '';
  for (let s of sentences) {
    s = s.trim();
    if (!s) continue;
    if ((current + ' ' + s).trim().length <= maxLength) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length > maxLength) {
        const words = s.split(' ');
        let sub = '';
        for (let w of words) {
          if ((sub + ' ' + w).trim().length <= maxLength) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) chunks.push(sub);
        current = '';
      } else {
        current = s;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

function playGoogleTTS(text, lang) {
  const chunks = splitTextIntoTTSChunks(text, 100);
  let idx = 0;
  let fallbackTriggered = false;

  // Lấy đối tượng audio: ưu tiên tạo trong iframe about:blank để TUYỆT ĐỐI KHÔNG GỬI REFERER
  let audio = null;
  try {
    const frame = document.getElementById('hpVoiceFrame');
    if (frame && frame.contentWindow && frame.contentWindow.document) {
      const fdoc = frame.contentWindow.document;
      let fa = fdoc.getElementById('frameTtsAudio');
      if (!fa) {
        fa = fdoc.createElement('audio');
        fa.id = 'frameTtsAudio';
        fa.setAttribute('referrerpolicy', 'no-referrer');
        fdoc.body.appendChild(fa);
      }
      audio = fa;
    }
  } catch(e) {
    console.warn('Iframe audio fallback:', e);
  }

  if (!audio) {
    audio = document.getElementById('hpVoiceAudio') || new Audio();
    audio.referrerPolicy = 'no-referrer';
    audio.setAttribute('referrerpolicy', 'no-referrer');
  }

  currentVoiceAudio = audio;

  function doFallback() {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    speakWithWebSpeech(text);
  }

  function playNextChunk() {
    if (!isVoiceSpeaking) return;
    if (idx >= chunks.length) {
      stopVoice();
      return;
    }

    const chunk = chunks[idx++];
    const langCode = lang === 'zh' ? 'zh-CN' : (lang || 'vi');
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(langCode)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

    audio.src = url;

    audio.onended = () => {
      playNextChunk();
    };

    audio.onerror = (err) => {
      console.warn('Google TTS lỗi chunk, thử máy chủ google.com.vn:', err);
      const fallbackUrl = `https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=${encodeURIComponent(langCode)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      audio.onerror = () => { doFallback(); };
      audio.src = fallbackUrl;
      const retryPromise = audio.play();
      if (retryPromise !== undefined) {
        retryPromise.catch(() => { doFallback(); });
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Audio play bị chặn hoặc lỗi mạng:', err);
        const fallbackUrl = `https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=${encodeURIComponent(langCode)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        audio.onerror = () => { doFallback(); };
        audio.src = fallbackUrl;
        audio.play().catch(() => { doFallback(); });
      });
    }
  }

  playNextChunk();
}

function readVoice() {
  if (isVoiceSpeaking) {
    stopVoice();
    return;
  }

  // Khởi tạo AudioContext (mở khóa quyền phát âm thanh trên Safari iOS & Chrome Mobile)
  try { HealthAudio?.init?.(); } catch(e) {}

  const estHR = S.est.manualPulse || S.hr || 70;
  const input = {
    temperature: S.estimated ? null : S.temp,
    spo2: S.estimated ? null : S.spo2,
    heartRate: S.estimated ? estHR : S.hr,
    systolic: S.sys, diastolic: S.dia,
    symptoms: S.symptoms,
    durationDays: S.days,
    isEstimatedMode: S.estimated,
    estTemp: S.est.estTemp,
    estBreathing: S.est.estBreathing,
    manualPulse: estHR
  };
  const r = HealthPulseEngine.evaluate(input, currentLang);
  S.result = r;
  
  let text = '';
  if (currentLang === 'en') {
    text = `HealthPulse AI notification: Health status is ${r.levelName}. Risk score is ${r.score} out of 100. ${r.alertMessage}. Clinical advice: ${r.recommendation}`;
  } else if (currentLang === 'ko') {
    text = `HealthPulse AI 알림: 현재 상태는 ${r.levelName}입니다. 위험 지수는 100점 만점에 ${r.score}점입니다. ${r.alertMessage}. 권고사항: ${r.recommendation}`;
  } else if (currentLang === 'zh') {
    text = `HealthPulse AI 播报：当前健康评估为${r.levelName}。综合风险评分为 ${r.score} 分。${r.alertMessage}。临床建议：${r.recommendation}`;
  } else {
    text = `HealthPulse AI thông báo: Tình trạng sức khỏe ${r.levelName}. Điểm nguy cơ ${r.score} trên 100. ${r.alertMessage}. Lời khuyên y khoa: ${r.recommendation}`;
  }

  isVoiceSpeaking = true;
  updateVoiceUI(true);

  const selectedVoice = document.getElementById('voiceSelect')?.value || 'female';

  // Nếu người dùng chọn giọng máy Web Speech API
  if (selectedVoice === 'system') {
    speakWithWebSpeech(text);
    return;
  }

  // Kiểm tra môi trường: nếu đang chạy trên localhost có backend Python server.py
  const isLocalBackend = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !!window.location.port;

  if (isLocalBackend) {
    const audio = document.getElementById('hpVoiceAudio') || new Audio();
    audio.referrerPolicy = 'no-referrer';
    currentVoiceAudio = audio;

    const ttsUrl = `/api/tts?lang=${currentLang}&voice=${selectedVoice}&text=${encodeURIComponent(text)}`;
    audio.src = ttsUrl;

    audio.onended = () => { stopVoice(); };
    audio.onerror = () => {
      console.warn('API Edge TTS không phản hồi, chuyển sang Google TTS');
      playGoogleTTS(text, currentLang);
    };
    audio.play().catch(e => {
      console.warn('Audio play Edge TTS bị lỗi, chuyển sang Google TTS:', e);
      playGoogleTTS(text, currentLang);
    });
  } else {
    // Trên GitHub Pages / Web trực tuyến: Phát qua Google TTS đảm bảo chuẩn tiếng Việt tự nhiên
    playGoogleTTS(text, currentLang);
  }
}

function speakWithWebSpeech(text) {
  if (!('speechSynthesis' in window)) {
    stopVoice();
    alert('Trình duyệt của bạn chưa hỗ trợ tính năng đọc giọng nói.');
    return;
  }

  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch(e) {}

  const utter = new SpeechSynthesisUtterance(text);
  window.__hpVoiceUtterance = utter; // Lưu biến toàn cục tránh bộ thu gom rác Garbage Collector trên Chrome di động

  const voiceLangMap = { vi: 'vi-VN', en: 'en-US', ko: 'ko-KR', zh: 'zh-CN' };
  utter.lang = voiceLangMap[currentLang] || 'vi-VN';
  utter.rate = 0.95;
  utter.pitch = 1.0;

  const matched = findVoiceForLang(currentLang);
  if (matched) {
    utter.voice = matched;
    utter.lang = matched.lang || utter.lang;
  }

  utter.onstart = () => {
    isVoiceSpeaking = true;
    updateVoiceUI(true);
  };

  utter.onend = () => {
    stopVoice();
  };

  utter.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    stopVoice();
  };

  try {
    window.speechSynthesis.speak(utter);
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    if (voiceWatchdog) clearInterval(voiceWatchdog);
    voiceWatchdog = setInterval(() => {
      if (!isVoiceSpeaking) {
        clearInterval(voiceWatchdog);
        voiceWatchdog = null;
        return;
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 3000);
  } catch(err) {
    console.error('Không thể phát giọng nói:', err);
    stopVoice();
  }
}

/* ===== TOGGLES ===== */
function initToggles() {
  document.getElementById('btnDarkMode')?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      document.getElementById('btnDarkMode').classList.remove('on');
      localStorage.setItem('hp_dark', '0');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('btnDarkMode').classList.add('on');
      localStorage.setItem('hp_dark', '1');
    }
  });

  document.getElementById('btnElderly')?.addEventListener('click', () => {
    const isLg = document.body.getAttribute('data-size') === 'lg';
    if (isLg) {
      document.body.removeAttribute('data-size');
      document.getElementById('btnElderly').classList.remove('on');
      localStorage.setItem('hp_lg', '0');
    } else {
      document.body.setAttribute('data-size', 'lg');
      document.getElementById('btnElderly').classList.add('on');
      localStorage.setItem('hp_lg', '1');
    }
  });
}

/* ===== TRENDS CHART ===== */
let trendChart = null;
function initChart() {
  const ctx = document.getElementById('trendChart')?.getContext('2d');
  if (!ctx || typeof Chart === 'undefined') return;

  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const scores = [0, 8, 14, 22, 28, 31, S.result ? S.result.score : 0];

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Điểm nguy cơ (S)',
        data: scores,
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#0d9488'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(148, 163, 184, 0.15)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderTrends() {
  const list = document.getElementById('historyList');
  if (!list) return;
  if (S.history.length === 0) {
    list.innerHTML = `<p style="font-size:0.85rem;color:var(--text-sub);padding:.5rem 0;">${getTranslation('noHistoryYet')}</p>`;
    return;
  }
  list.innerHTML = S.history.slice(-10).reverse().map(item => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:.65rem 0;border-bottom:1px solid var(--border);">
      <div>
        <div style="font-weight:700;font-size:0.88rem;">${item.date}</div>
        <div style="font-size:0.75rem;color:var(--text-sub);">T: ${item.temp}°C • SpO2: ${item.spo2}% • HR: ${item.hr} BPM</div>
      </div>
      <div style="text-align:right;">
        <span style="font-weight:800;font-family:var(--mono);color:${item.level==='red'?'#dc2626':item.level==='yellow'?'#d97706':'#059669'};">S = ${item.score}</span>
      </div>
    </div>
  `).join('');
}

function clearHistory() {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đo?')) {
    S.history = [];
    saveHistory();
    renderTrends();
  }
}

/* ===== MEDICAL REPORT (CHUẨN 6 MỤC ĐA NGÔN NGỮ) ===== */
function formatReportDate(d) {
  const pad = n => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}/${mm}/${dd} – ${hh}:${min}`;
}

function renderReport() {
  const c = document.getElementById('reportContent');
  if (!c) return;

  const r = S.result || HealthPulseEngine.evaluate({
    temperature: S.temp,
    spo2: S.spo2,
    heartRate: S.hr,
    symptoms: S.symptoms,
    durationDays: S.days
  });

  const now = new Date();
  const formattedDate = formatReportDate(now);
  const lc = r.level === 'red' ? '#dc2626' : r.level === 'yellow' ? '#d97706' : '#059669';
  const boxClass = r.level === 'red' ? 'red' : r.level === 'yellow' ? 'yellow' : '';

  const inputStatus = S.estimated ? getTranslation('statusEstimated') : getTranslation('statusDevice');
  const symptomsList = r.breakdown.symptoms.length > 0
    ? r.breakdown.symptoms.map(s => {
        const trans = getSymptomTranslation(s.id);
        return trans.name;
      }).join(', ')
    : getTranslation('repSymptomsNone');

  const hospitalWarning = r.level === 'red'
    ? getTranslation('hospWarnRed')
    : r.level === 'yellow'
    ? getTranslation('hospWarnYellow')
    : getTranslation('hospWarnGreen');

  const genderKey = S.patient.gender === 'Nữ' ? 'genderFemale' : S.patient.gender === 'Khác' ? 'genderOther' : 'genderMale';

  c.innerHTML = `
    <div class="rep-header">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="assets/logo_white_bg.png" alt="HealthPulse AI" style="width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0;">
        <div>
          <h2 class="rep-main-title">${getTranslation('reportMainTitle')}</h2>
          <div class="rep-sub-title">${getTranslation('reportSubTitle')}</div>
        </div>
      </div>
      <div style="text-align:right;font-size:0.8rem;color:#64748b;">
        <div>${getTranslation('reportStdBadge')}</div>
      </div>
    </div>

    <!-- 1. Thông tin báo cáo -->
    <div class="rep-section">
      <div class="rep-sec-title">${getTranslation('repSec1')}</div>
      <ul class="rep-list">
        <li><b>${getTranslation('repId')}</b> &nbsp;${S.patient.id}</li>
        <li><b>${getTranslation('repTime')}</b> &nbsp;${formattedDate}</li>
      </ul>
    </div>

    <!-- 2. Thông tin bệnh nhân -->
    <div class="rep-section">
      <div class="rep-sec-title">${getTranslation('repSec2')}</div>
      <ul class="rep-list">
        <li><b>${getTranslation('repName')}</b> &nbsp;${S.patient.name || 'Nguyễn Văn A'}</li>
        <li><b>${getTranslation('repAge')}</b> &nbsp;${S.patient.age || 35}</li>
        <li><b>${getTranslation('repGender')}</b> &nbsp;${getTranslation(genderKey)}</li>
        <li><b>${getTranslation('repInputStatus')}</b> &nbsp;${inputStatus}</li>
      </ul>
    </div>

    <!-- 3. Kết quả đánh giá nguy cơ -->
    <div class="rep-section">
      <div class="rep-sec-title">${getTranslation('repSec3')}</div>
      <ul class="rep-list">
        <li><b>${getTranslation('repScore')}</b> &nbsp;<span style="font-weight:800;color:${lc};font-size:1.1rem;">${r.score}</span> / 100</li>
        <li><b>${getTranslation('repLevel')}</b> &nbsp;<span style="font-weight:700;color:${lc};">${r.levelName.toUpperCase()}</span></li>
        <li><b>${getTranslation('repAIReview')}</b> &nbsp;${r.alertMessage} (S_vital = ${r.breakdown.sVital}, S_symptom = ${r.breakdown.sSymptomWeighted}).</li>
      </ul>
      <div class="rep-box ${boxClass}">
        <div style="font-weight:700;color:${lc};margin-bottom:0.25rem;">${r.levelBadge} — ${r.levelName}</div>
        <div style="font-size:0.85rem;">${r.alertMessage}</div>
      </div>
    </div>

    <!-- 4. Chi tiết dữ liệu đầu vào -->
    <div class="rep-section">
      <div class="rep-sec-title">${getTranslation('repSec4')}</div>
      <ul class="rep-list">
        <li><b>${getTranslation('repVitalsTableTitle')}</b></li>
      </ul>
      <table class="rep-table">
        <thead>
          <tr>
            <th>${getTranslation('colMetric')}</th>
            <th>${getTranslation('colValue')}</th>
            <th>${getTranslation('colNormal')}</th>
            <th>${getTranslation('colStatus')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${getTranslation('tempLabel')} (T)</td>
            <td><b>${S.temp.toFixed(1)} °C</b></td>
            <td>36.5 – 37.4 °C</td>
            <td>${S.temp >= 38.5 ? `[${getTranslation('heroStatusDanger')}] ${getTranslation('statFeverHigh')}` : S.temp >= 37.5 ? `[${getTranslation('heroStatusWarning')}] ${getTranslation('statFeverMild')}` : getTranslation('statSafe')}</td>
          </tr>
          <tr>
            <td>${getTranslation('spo2Label')}</td>
            <td><b style="color:${S.spo2 < 93 ? '#dc2626' : '#059669'};">${S.estimated ? (r.breakdown.spo2Est ? '~' + r.breakdown.spo2Est + ' % (AI)' : '--') : S.spo2 + ' %'}</b></td>
            <td>≥ 95 %</td>
            <td>${S.spo2 < 93 ? `[${getTranslation('heroStatusDanger')}] ${getTranslation('statHypoxia')}` : S.spo2 <= 95 ? `[${getTranslation('heroStatusWarning')}] ${getTranslation('statWarning')}` : getTranslation('statSafe')}</td>
          </tr>
          <tr>
            <td>${getTranslation('heartRateLabel')} (HR)</td>
            <td><b>${S.hr} BPM</b></td>
            <td>60 – 99 BPM</td>
            <td>${S.hr >= 110 ? `[${getTranslation('heroStatusWarning')}] ${getTranslation('statHRFast')}` : S.hr < 55 ? `[${getTranslation('heroStatusWarning')}] ${getTranslation('statHRSlow')}` : getTranslation('statSafe')}</td>
          </tr>
          <tr>
            <td>${getTranslation('bpLabel')} (BP)</td>
            <td><b>${S.sys} / ${S.dia} mmHg</b></td>
            <td>110-129 / 70-84 mmHg</td>
            <td>${S.sys >= 140 ? `[${getTranslation('heroStatusWarning')}] ${getTranslation('statBPHigh')}` : S.sys < 90 ? `[${getTranslation('heroStatusWarning')}] ${getTranslation('statBPLow')}` : getTranslation('statSafe')}</td>
          </tr>
        </tbody>
      </table>

      <ul class="rep-list" style="margin-top:0.6rem;">
        <li><b>${getTranslation('repSymptomsListTitle')}</b></li>
      </ul>
      <ul class="rep-sublist">
        <li>${getTranslation('repSymptomsSelected')} <b>${symptomsList}</b></li>
        <li>${getTranslation('repDuration')} <b>${S.days} ${getTranslation('daysSuffix')}</b> (D = ${r.breakdown.durationFactor})</li>
      </ul>
    </div>

    <!-- 5. Khuyến nghị & Hướng xử lý -->
    <div class="rep-section">
      <div class="rep-sec-title">${getTranslation('repSec5')}</div>
      <ul class="rep-list">
        <li><b>${getTranslation('repHomeCare')}</b> &nbsp;${r.recommendation}</li>
        <li><b>${getTranslation('repHospitalWarn')}</b> &nbsp;${hospitalWarning}</li>
      </ul>
    </div>

    <!-- 6. Lời miễn trừ trách nhiệm y khoa -->
    <div class="rep-disclaimer">
      <b>${getTranslation('repSec6')}</b><br>
      "${getTranslation('disclaimerText')}"
    </div>

    <div style="margin-top:25px;padding-top:12px;display:flex;justify-content:space-between;align-items:flex-end;font-size:0.82rem;color:#64748b;">
      <div>
        <b>${getTranslation('repSignSystem')}</b><br>
        Mã xác thực: HP-${S.patient.id}-${Math.floor(1000 + Math.random() * 9000)}
      </div>
      <div style="text-align:center;">
        <div>${getTranslation('repSignPatient')}</div>
        <div style="height:35px;"></div>
        <div><b>${S.patient.name || 'Người dùng'}</b></div>
      </div>
    </div>
  `;
}
