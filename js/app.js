/**
 * HealthPulse AI — App Controller
 * Giao diện hiện đại, sạch sẽ, trực quan
 * Hỗ trợ 4 ngôn ngữ: Tiếng Việt, English, 한국어, 中文
 */

/* ===== STATE ===== */
const S = {
  lang: 'vi',
  patient: {
    id: '2829',
    name: 'Lê Thị Hoàng Nghi',
    age: 44,
    gender: 'Nữ'
  },
  temp: 36.5, spo2: 98, hr: 75, sys: 120, dia: 80,
  symptoms: [], days: 1,
  estimated: false,
  est: { estTemp: 'normal', estBreathing: 'normal', manualPulse: null },
  result: null,
  tapTimes: [], tapTimer: null,
  history: []
};


/* ===== TOAST NOTIFICATION SYSTEM ===== */
function showToast(message, type = 'info', duration = 2800) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  } else if (type === 'error' || type === 'danger') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  } else if (type === 'warning') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  } else {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }
  toast.innerHTML = `<span style="display:flex;align-items:center;flex-shrink:0;">${iconSvg}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      try { toast.remove(); } catch(e) {}
    }, 250);
  }, duration);
}
window.showToast = showToast;

/* ===== DAILY CARE PLAN CHECKLIST ===== */
function toggleCareItem(el) {
  if (!el) return;
  el.classList.toggle('done');
  try {
    HealthAudio?.playTick?.(750);
  } catch(e) {}
}
window.toggleCareItem = toggleCareItem;

function resetDailyPlan() {
  document.querySelectorAll('.care-item').forEach(item => item.classList.remove('done'));
  showToast(currentLang === 'en' ? 'Daily care plan reset' : 'Đã đặt lại kế hoạch chăm sóc trong ngày', 'info');
}
window.resetDailyPlan = resetDailyPlan;

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
  document.getElementById('btnHeaderSOS')?.addEventListener('click', openSOS);
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
  if (elName) elName.textContent = S.patient.name || 'Lê Thị Hoàng Nghi';
  const elMeta = document.getElementById('dispPatientSummaryMeta');
  const genderKey = S.patient.gender === 'Nữ' ? 'genderFemale' : S.patient.gender === 'Khác' ? 'genderOther' : 'genderMale';
  const genderText = getTranslation(genderKey);
  const ageUnit = currentLang === 'vi' ? 'tuổi' : getTranslation('lblAge').toLowerCase();
  if (elMeta) elMeta.textContent = `${S.patient.age || 44} ${ageUnit} • ${genderText}`;
  const elBadge = document.getElementById('dispPatientIdBadge');
  if (elBadge) elBadge.textContent = `${getTranslation('patientIdLabel')} ${S.patient.id || '2829'}`;
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
    c.classList.toggle('active', num === S.days);
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
  const elEstHR = document.getElementById('dispEstHR');
  if (elEstHR) elEstHR.textContent = estHR;
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
      statText = currentLang === 'vi' ? 'Nhanh' : getTranslation('statHRFast');
      cls = 'status-warn';
    } else if (estHR < 60) {
      statText = currentLang === 'vi' ? 'Chậm' : getTranslation('statHRSlow');
      cls = 'status-warn';
    }
    badgeEstHR.textContent = `${estHR} BPM (${statText})`;
    badgeEstHR.className = `v-status-badge ${cls}`;
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
    grid.querySelectorAll('input').forEach(inp => {
      inp.disabled = S.estimated;
    });
  }

  if (lockBadge) lockBadge.style.display = S.estimated ? 'inline-flex' : 'none';
  if (lockBanner) lockBanner.style.display = S.estimated ? 'flex' : 'none';

  if (hint) {
    hint.textContent = S.estimated
      ? (getTranslation('vitalsSecHintLocked') || 'Bảng đo trực tiếp đã tạm khóa để sử dụng chế độ ước lượng bên dưới')
      : getTranslation('vitalsSecHint');
  }
}

function toggleEstMode() {
  S.estimated = !S.estimated;
  updateEstModeUI();
  analyze();
  showToast(S.estimated ? (getTranslation('toastEstModeOn') || 'Đã bật Chế độ ước lượng lâm sàng') : (getTranslation('toastEstModeOff') || 'Đã chuyển sang chế độ Nhập chỉ số trực tiếp'), 'info');
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
  prepDuration: 3,       // 3 giây đếm lùi chuẩn bị đặt tay
  prepLeft: 3,
  countedBeats: 18,      // Mặc định 18 nhịp (18 × 4 = 72 BPM)
  state: 'idle',         // 'idle' | 'prep' | 'running' | 'paused' | 'done'
  intervalId: null,
  prepTimerId: null,
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
    this.prepLeft = this.prepDuration;
    this.pausedRemainingMs = this.duration * 1000;
    this.renderUI();
    this.updateCountdownDisplay();
  },

  start() {
    if (this.state === 'running' || this.state === 'prep') return;
    try { HealthAudio?.init?.(); } catch(e) {}

    // Nếu đang tạm dừng thì tiếp tục đếm 15s mà không cần đếm lại 3s chuẩn bị
    if (this.state === 'paused') {
      this.resumeRun();
      return;
    }

    // Đếm ngược 3 giây chuẩn bị (3... 2... 1...) để kịp đặt tay lên cổ tay
    this.startPrep();
  },

  startPrep() {
    this.stopTimer();
    this.state = 'prep';
    this.prepLeft = this.prepDuration;
    this.renderUI();

    try { HealthAudio?.playTick?.(600); } catch(e) {}

    this.prepTimerId = setInterval(() => {
      this.prepLeft--;
      if (this.prepLeft > 0) {
        const freq = this.prepLeft === 1 ? 750 : 600;
        try { HealthAudio?.playTick?.(freq); } catch(e) {}
        this.renderUI();
      } else {
        // Hết 3 giây chuẩn bị -> Bắt đầu đếm 15 giây!
        this.stopTimer();
        this.startRun();
      }
    }, 1000);
  },

  skipPrep() {
    this.stopTimer();
    this.startRun();
  },

  startRun() {
    this.state = 'running';
    this.secondsLeft = this.duration;
    this.endTime = performance.now() + this.duration * 1000;
    try { HealthAudio?.playTick?.(1050); } catch(e) {}
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

  resumeRun() {
    this.state = 'running';
    this.endTime = performance.now() + this.pausedRemainingMs;
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
      this.resumeRun();
    }
  },

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.prepTimerId) {
      clearInterval(this.prepTimerId);
      this.prepTimerId = null;
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
    showToast((getTranslation('toastPulseApplied') || 'Đã cập nhật nhịp tim vào hồ sơ') + `: ${finalBpm} BPM`, 'success');
    this.closeModal();
  },

  applyCountedResult() {
    this.applyAndClose();
  },

  updateCountdownDisplay() {
    const clock = document.getElementById('tapClockBig');
    const ring = document.getElementById('tapRingProgress');
    const bar = document.getElementById('tapProgressBar');
    const clockUnit = document.getElementById('tapClockUnit');

    if (this.state === 'prep') {
      if (clock) {
        clock.textContent = `${this.prepLeft}`;
        clock.className = 'tap-clock-digits prep-digits';
      }
      if (clockUnit) clockUnit.style.display = 'none';
      if (ring) {
        const prepFraction = (3 - this.prepLeft) / 3;
        ring.style.strokeDashoffset = prepFraction * this.CIRCUMFERENCE;
        ring.style.stroke = '#f59e0b';
      }
      if (bar) bar.style.width = `${((3 - this.prepLeft) / 3 * 100).toFixed(0)}%`;
      return;
    }

    if (clockUnit) clockUnit.style.display = 'inline';
    if (clock) {
      clock.textContent = this.secondsLeft.toFixed(1);
      clock.className = 'tap-clock-digits';
    }

    const progressFraction = Math.max(0, Math.min(1, (this.duration - this.secondsLeft) / this.duration)); // 0 -> 1
    const offset = progressFraction * this.CIRCUMFERENCE;

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
    const prepControls = document.getElementById('timerPrepControls');
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
      if (prepControls) prepControls.style.display = 'none';
      if (runningControls) runningControls.style.display = 'none';
      if (resultCard) resultCard.style.display = 'none';
      if (btnRetest) btnRetest.style.display = 'none';
      this.updateCountdownDisplay();
    } else if (this.state === 'prep') {
      if (badge) badge.className = 'tap-header-badge prep';
      if (badgeText) badgeText.textContent = getTranslation('tapStatusPrep') || 'Chuẩn bị: Đặt 2 ngón tay lên cổ tay... (3s)';
      if (clockSub) {
        clockSub.textContent = 'ĐẶT TAY LÊN CỔ TAY...';
        clockSub.className = 'tap-clock-sub prep-anim';
      }
      if (btnStart) btnStart.style.display = 'none';
      if (prepControls) prepControls.style.display = 'flex';
      if (runningControls) runningControls.style.display = 'none';
      if (resultCard) resultCard.style.display = 'none';
      if (btnRetest) btnRetest.style.display = 'none';
      this.updateCountdownDisplay();
    } else if (this.state === 'running') {
      if (badge) badge.className = 'tap-header-badge measuring';
      if (badgeText) badgeText.textContent = getTranslation('tapStatusRunning') || 'Đang đếm ngược 15 giây… Hãy đếm số nhịp đập trong đầu!';
      if (clockSub) {
        clockSub.textContent = 'ĐANG ĐẾM NHỊP…';
        clockSub.className = 'tap-clock-sub pulse-anim';
      }
      if (btnStart) btnStart.style.display = 'none';
      if (prepControls) prepControls.style.display = 'none';
      if (runningControls) runningControls.style.display = 'flex';
      if (btnPauseText) btnPauseText.textContent = getTranslation('tapBtnPause') || '⏸️ Tạm dừng';
      if (resultCard) resultCard.style.display = 'none';
      if (btnRetest) btnRetest.style.display = 'none';
      this.updateCountdownDisplay();
    } else if (this.state === 'paused') {
      if (badge) badge.className = 'tap-header-badge';
      if (badgeText) badgeText.textContent = getTranslation('tapStatusPaused') || 'Đang tạm dừng đếm ngược';
      if (clockSub) {
        clockSub.textContent = 'TẠM DỪNG';
        clockSub.className = 'tap-clock-sub';
      }
      if (btnStart) btnStart.style.display = 'none';
      if (prepControls) prepControls.style.display = 'none';
      if (runningControls) runningControls.style.display = 'flex';
      if (btnPauseText) btnPauseText.textContent = getTranslation('tapBtnResume') || '▶️ Tiếp tục';
      if (resultCard) resultCard.style.display = 'none';
      if (btnRetest) btnRetest.style.display = 'none';
      this.updateCountdownDisplay();
    } else if (this.state === 'done') {
      if (badge) badge.className = 'tap-header-badge done';
      if (badgeText) badgeText.textContent = getTranslation('tapStatusDone') || 'Đã hết 15 giây! Nhập số nhịp bạn đếm được:';
      if (clockSub) {
        clockSub.textContent = 'HOÀN THÀNH';
        clockSub.className = 'tap-clock-sub done';
      }
      if (btnStart) btnStart.style.display = 'none';
      if (prepControls) prepControls.style.display = 'none';
      if (runningControls) runningControls.style.display = 'none';
      if (resultCard) resultCard.style.display = 'block';
      if (btnRetest) btnRetest.style.display = 'inline-flex';
      this.updateCountdownDisplay();
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

    // Cập nhật vòng tròn điểm SVG trên Home
    const heroCircle = document.getElementById('heroScoreCircle');
    if (heroCircle) {
      const circumference = 2 * Math.PI * 42; // 263.89
      const progress = Math.min(Math.max(r.score, 0), 100) / 100;
      heroCircle.style.strokeDashoffset = circumference - (progress * circumference);
      heroCircle.style.stroke = r.level === 'red' ? 'var(--danger)' : r.level === 'yellow' ? 'var(--warn)' : 'var(--ok)';
    }

    // Cập nhật thước đo Gauge trên trang Chi tiết
    const needle = document.getElementById('riskGaugeNeedle');
    if (needle) {
      const angle = (Math.min(Math.max(r.score, 0), 100) / 100) * 180 - 90;
      needle.style.transform = `rotate(${angle}deg)`;
    }
    const dScore = document.getElementById('detailRiskScore');
    if (dScore) dScore.textContent = r.score;
    const dBadge = document.getElementById('detailRiskBadge');
    if (dBadge) {
      const levelKey = r.level === 'red' ? 'heroStatusDanger' : r.level === 'yellow' ? 'heroStatusWarning' : 'heroStatusSafe';
      dBadge.textContent = getTranslation(levelKey);
      dBadge.className = `hero-level-badge level-${r.level === 'red' ? 'danger' : r.level === 'yellow' ? 'warn' : 'safe'}`;
    }
    const dTriage = document.getElementById('detailTriageGuide');
    if (dTriage) {
      if (r.level === 'red') {
        dTriage.className = 'advice-block danger-left';
        dTriage.innerHTML = `<strong>${getTranslation('statusDanger') || 'Khẩn cấp'}:</strong> ${r.alertMessage} Cần liên hệ hỗ trợ y tế hoặc gọi 115 ngay lập tức!`;
      } else if (r.level === 'yellow') {
        dTriage.className = 'advice-block warn-left';
        dTriage.innerHTML = `<strong>${getTranslation('statusWarning') || 'Cần chú ý'}:</strong> ${r.alertMessage} Nên đến cơ sở y tế thăm khám trong vòng 24 giờ.`;
      } else {
        dTriage.className = 'advice-block green-left';
        dTriage.innerHTML = `<strong>${getTranslation('statusSafe') || 'Ổn định'}:</strong> Các chỉ số nằm trong giới hạn an toàn. Tiếp tục duy trì chế độ sinh hoạt và theo dõi định kỳ.`;
      }
    }
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

  showToast(getTranslation('toastCheckinSuccess') || 'Đã ghi nhận chỉ số sinh hiệu thành công!', 'success');

  // Chuyển sang trang Tổng quan
  switchTab('home');
}

/* ===== TABS & NAVIGATION ===== */
function switchTab(tabId) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active-page'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.desktop-nav-item').forEach(b => b.classList.remove('active'));
  stopVoice();

  const sec = document.getElementById('page_' + tabId);
  if (sec) sec.classList.add('active-page');

  const btn = document.querySelector(`.nav-item[data-page="${tabId}"]`);
  if (btn) btn.classList.add('active');

  const deskBtn = document.querySelector(`.desktop-nav-item[data-page="${tabId}"]`);
  if (deskBtn) deskBtn.classList.add('active');

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
  const wf = document.getElementById('voiceWaveform');
  if (btn) btn.classList.toggle('speaking', speaking);
  if (txt) txt.textContent = speaking ? getTranslation('btnVoiceStop') : getTranslation('btnVoice');
  if (icon) icon.style.display = speaking ? 'none' : 'inline-flex';
  if (wf) wf.style.display = speaking ? 'inline-flex' : 'none';
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
      currentVoiceAudio.removeAttribute('src');
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

function findVoiceForLang(lang, preference) {
  let voices = [];
  if ('speechSynthesis' in window) {
    try { voices = window.speechSynthesis.getVoices() || []; } catch(e) {}
  }
  if (!voices.length && systemVoices.length) voices = systemVoices;
  const target = (lang || 'vi').toLowerCase();
  
  // Lọc tất cả các giọng khớp chính xác theo ngôn ngữ
  let candidates = voices.filter(v => {
    const l = (v.lang || '').replace('_', '-').toLowerCase();
    const n = (v.name || '').toLowerCase();
    if (target === 'vi') {
      return l.startsWith('vi') || n.includes('viet') || n.includes('tiếng việt') || n.includes('linh') || n.includes('hoaimy') || n.includes('namminh') || n.includes('an');
    }
    return l === target || l.startsWith(target + '-') || l.startsWith(target);
  });

  if (!candidates.length) return null;

  // Lọc theo sở thích giới tính nếu có
  if (preference === 'male') {
    const m = candidates.find(v => {
      const n = (v.name || '').toLowerCase();
      return n.includes('nam') || n.includes('male') || n.includes('an');
    });
    if (m) return m;
  } else if (preference === 'female') {
    const f = candidates.find(v => {
      const n = (v.name || '').toLowerCase();
      return n.includes('linh') || n.includes('mai') || n.includes('hoaimy') || n.includes('female') || n.includes('nữ');
    });
    if (f) return f;
  }

  return candidates[0];
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
  const chunks = splitTextIntoTTSChunks(text, 160);
  let idx = 0;

  // Dùng trực tiếp phần tử Audio ở trang chính (không dùng iframe để không bị lỗi Autoplay trên thiết bị di động)
  let audio = document.getElementById('hpVoiceAudio');
  if (!audio) {
    audio = new Audio();
    audio.id = 'hpVoiceAudio';
    audio.preload = 'auto';
    document.body.appendChild(audio);
  }
  audio.referrerPolicy = 'no-referrer';
  audio.setAttribute('referrerpolicy', 'no-referrer');
  currentVoiceAudio = audio;

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
      console.warn('Google TTS lỗi chunk, thử máy chủ mirror:', err);
      const fallbackUrl = `https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=${encodeURIComponent(langCode)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      audio.onerror = () => {
        // Fallback sang Web Speech nếu mất kết nối mạng Internet hoàn toàn
        console.warn('Google TTS không phản hồi, thử Web Speech API dự phòng...');
        if ('speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(chunk);
          const langMap = { vi: 'vi-VN', en: 'en-US', ko: 'ko-KR', zh: 'zh-CN' };
          utter.lang = langMap[lang] || 'vi-VN';
          utter.onend = () => playNextChunk();
          utter.onerror = () => stopVoice();
          window.speechSynthesis.speak(utter);
        } else {
          stopVoice();
          showToast(currentLang === 'vi' ? 'Không thể tải âm thanh giọng nói, vui lòng kiểm tra kết nối mạng' : 'Audio stream failed, please check network', 'warn');
        }
      };
      audio.src = fallbackUrl;
      const retryPromise = audio.play();
      if (retryPromise !== undefined) {
        retryPromise.catch(() => {
          stopVoice();
        });
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Audio play bị chặn hoặc lỗi mạng:', err);
        stopVoice();
        showToast(currentLang === 'vi' ? 'Trình duyệt yêu cầu chạm lại nút đọc để cho phép phát âm thanh' : 'Please tap the listen button again to allow audio', 'warn');
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

  // Chỉ sử dụng duy nhất giọng Google AI Voice (Google TTS) chuẩn quốc tế
  playGoogleTTS(text, currentLang);
}

function speakWithWebSpeech(text, specificVoice) {
  if (!('speechSynthesis' in window)) {
    stopVoice();
    showToast(getTranslation('speechNotSupported') || 'Trình duyệt chưa hỗ trợ bộ đọc giọng nói', 'warn');
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

  const matched = specificVoice || findVoiceForLang(currentLang);
  if (matched) {
    utter.voice = matched;
    utter.lang = matched.lang || utter.lang;
  } else {
    // Tuyệt đối không để giọng Anh đọc tiếng Việt
    if (currentLang === 'vi') {
      console.warn('Không tìm thấy voice tiếng Việt phù hợp, chuyển sang Google TTS');
      playGoogleTTS(text, currentLang);
      return;
    }
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
      showToast(getTranslation('toastThemeLight') || 'Đã bật Giao diện Sáng', 'info');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('btnDarkMode').classList.add('on');
      localStorage.setItem('hp_dark', '1');
      showToast(getTranslation('toastThemeDark') || 'Đã bật Giao diện Tối', 'info');
    }
    if (typeof updateChartData === 'function') {
      updateChartData();
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

/* ===== TRENDS CHART & METRIC FILTER ===== */
let trendChart = null;
let currentMetricFilter = 'all';

function filterChartMetric(metric) {
  currentMetricFilter = metric;
  document.querySelectorAll('.c-filter-chip').forEach(c => {
    c.classList.toggle('active', c.getAttribute('onclick')?.includes(metric));
  });
  updateChartData();
}
window.filterChartMetric = filterChartMetric;

function updateChartData() {
  if (!trendChart) return;
  const labels = S.history.length >= 2
    ? S.history.slice(-7).map(h => h.date.split(' ')[0] || h.date)
    : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'Hôm nay'];

  let datasets = [];
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  if (currentMetricFilter === 'all' || currentMetricFilter === 'score') {
    const scores = S.history.length >= 2
      ? S.history.slice(-7).map(h => h.score)
      : [0, 8, 14, 22, 28, 31, S.result ? S.result.score : 0];
    datasets.push({
      label: 'Điểm nguy cơ (S)',
      data: scores,
      borderColor: '#0284c7',
      backgroundColor: 'rgba(2, 132, 199, 0.12)',
      fill: true,
      tension: 0.35,
      borderWidth: 2.5,
      pointBackgroundColor: '#0284c7',
      pointRadius: 4,
      pointHoverRadius: 6
    });
  }

  if (currentMetricFilter === 'all' || currentMetricFilter === 'hr') {
    const hrs = S.history.length >= 2
      ? S.history.slice(-7).map(h => h.hr)
      : [72, 74, 76, 75, 78, 80, S.hr || 75];
    datasets.push({
      label: 'Nhịp tim (BPM)',
      data: hrs,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      fill: false,
      tension: 0.35,
      borderWidth: 2,
      pointBackgroundColor: '#ef4444',
      pointRadius: 3
    });
  }

  if (currentMetricFilter === 'all' || currentMetricFilter === 'spo2') {
    const spo2s = S.history.length >= 2
      ? S.history.slice(-7).map(h => h.spo2)
      : [98, 98, 97, 98, 99, 98, S.spo2 || 98];
    datasets.push({
      label: 'SpO2 (%)',
      data: spo2s,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      fill: false,
      tension: 0.35,
      borderWidth: 2,
      pointBackgroundColor: '#10b981',
      pointRadius: 3
    });
  }

  trendChart.data.labels = labels;
  trendChart.data.datasets = datasets;
  if (trendChart.options?.scales?.y?.grid) {
    trendChart.options.scales.y.grid.color = gridColor;
  }
  trendChart.update();
}

function initChart() {
  const ctx = document.getElementById('trendChart')?.getContext('2d');
  if (!ctx || typeof Chart === 'undefined') return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'Hôm nay'];
  const scores = [0, 8, 14, 22, 28, 31, S.result ? S.result.score : 0];

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Điểm nguy cơ (S)',
        data: scores,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#0284c7',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
          bodyFont: { family: "'JetBrains Mono', monospace" }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: gridColor },
          ticks: { font: { family: "'JetBrains Mono', monospace" } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
        }
      }
    }
  });
}

function renderTrends() {
  const list = document.getElementById('historyList');
  if (!list) return;
  if (S.history.length === 0) {
    list.innerHTML = `
      <div class="empty-state-box">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <div class="empty-state-title">${getTranslation('noHistoryYet') || 'Chưa có nhật ký đo gần đây'}</div>
        <div class="empty-state-desc">Hãy vào trang "Đo lường" để ghi nhận và theo dõi diễn tiến sinh hiệu.</div>
      </div>
    `;
    return;
  }
  list.innerHTML = S.history.slice(-10).reverse().map(item => {
    const levelColor = item.level === 'red' ? 'var(--danger)' : item.level === 'yellow' ? 'var(--warn)' : 'var(--ok)';
    return `
      <div class="history-card-item">
        <div>
          <div class="hist-time">${item.date}</div>
          <div style="font-size:0.78rem;color:var(--text-sub);margin-top:2px;">
            Nhiệt độ: <b>${item.temp}°C</b> • SpO2: <b>${item.spo2}%</b> • Mạch: <b>${item.hr} BPM</b>
          </div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:1.15rem;font-weight:900;font-family:var(--mono);color:${levelColor};">S = ${item.score}</span>
        </div>
      </div>
    `;
  }).join('');
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
    <!-- Header -->
    <div class="rep-header">
      <div class="rep-brand-block">
        <img src="assets/logo_white_bg.png" alt="HealthPulse AI" class="rep-logo">
        <div>
          <div class="rep-main-title">${getTranslation('reportMainTitle')}</div>
          <div class="rep-sub-title">${getTranslation('reportSubTitle')}</div>
        </div>
      </div>
      <div class="rep-meta-block">
        <span class="rep-badge-std">${getTranslation('reportStdBadge')}</span>
        <div class="rep-code">Mã: HP-${S.patient.id}</div>
      </div>
    </div>

    <!-- 1 & 2. Thông tin bệnh nhân & hồ sơ -->
    <div class="rep-card">
      <div class="rep-card-header">
        <span class="rep-card-icon">👤</span>
        <span>${getTranslation('repSecProfile') || getTranslation('repSec2')}</span>
      </div>
      <div class="rep-grid-2x2">
        <div class="rep-grid-cell">
          <span class="rep-cell-label">${getTranslation('repName').replace(':', '')}</span>
          <span class="rep-cell-val">${S.patient.name || 'Lê Thị Hoàng Nghi'}</span>
        </div>
        <div class="rep-grid-cell">
          <span class="rep-cell-label">${getTranslation('repAge').replace(':', '')} • ${getTranslation('repGender').replace(':', '')}</span>
          <span class="rep-cell-val">${S.patient.age || 44} tuổi • ${getTranslation(genderKey)}</span>
        </div>
        <div class="rep-grid-cell">
          <span class="rep-cell-label">${getTranslation('repId').replace(':', '')}</span>
          <span class="rep-cell-val">#${S.patient.id}</span>
        </div>
        <div class="rep-grid-cell">
          <span class="rep-cell-label">${getTranslation('repTime').replace(':', '')}</span>
          <span class="rep-cell-val">${formattedDate}</span>
        </div>
      </div>
      <div class="rep-input-source">
        <span class="rep-cell-label">${getTranslation('repInputStatus').replace(':', '')}:</span>
        <span class="rep-source-badge">${inputStatus}</span>
      </div>
    </div>

    <!-- 3. Kết quả đánh giá nguy cơ -->
    <div class="rep-card rep-risk-card ${boxClass}">
      <div class="rep-card-header">
        <span class="rep-card-icon">🩺</span>
        <span>${getTranslation('repSec3')}</span>
      </div>
      <div class="rep-risk-body">
        <div class="rep-risk-score-badge" style="border-color:${lc};color:${lc};background:${r.level === 'red' ? 'rgba(220,38,38,0.1)' : r.level === 'yellow' ? 'rgba(217,119,6,0.1)' : 'rgba(5,150,105,0.1)'};">
          <span class="rep-risk-score-num">${r.score}</span>
          <span class="rep-risk-score-max">/ 100</span>
        </div>
        <div class="rep-risk-content">
          <div class="rep-risk-level-tag" style="background:${lc};">
            ${r.levelBadge} — ${r.levelName.toUpperCase()}
          </div>
          <div class="rep-risk-alert">${r.alertMessage}</div>
          <div class="rep-risk-breakdown">
            <span>S_vital: <b>${r.breakdown.sVital}</b></span>
            <span>S_symptom: <b>${r.breakdown.sSymptomWeighted}</b></span>
            <span>Hệ số D: <b>${r.breakdown.durationFactor}</b></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Chi tiết dữ liệu đầu vào -->
    <div class="rep-card">
      <div class="rep-card-header">
        <span class="rep-card-icon">📊</span>
        <span>${getTranslation('repSec4')}</span>
      </div>
      <div class="rep-subheading">${getTranslation('repVitalsTableTitle')}</div>
      
      <div class="rep-table-wrap">
        <table class="rep-table">
          <thead>
            <tr>
              <th style="width:29%;">${getTranslation('colMetric')}</th>
              <th style="width:21%;">${getTranslation('colValue')}</th>
              <th style="width:25%;">${getTranslation('colNormal')}</th>
              <th style="width:25%;text-align:right;">${getTranslation('colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="td-metric">
                  <span class="m-ico">🌡️</span>
                  <span>${getTranslation('tempLabel')}</span>
                </div>
              </td>
              <td class="td-val">${S.temp.toFixed(1)}°C</td>
              <td class="td-ref">36.5–37.4°C</td>
              <td class="td-status">
                <span class="rep-badge ${S.temp >= 38.5 ? 'badge-danger' : S.temp >= 37.5 ? 'badge-warning' : 'badge-safe'}">
                  ${S.temp >= 38.5 ? getTranslation('statFeverHigh') : S.temp >= 37.5 ? getTranslation('statFeverMild') : getTranslation('statSafe')}
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <div class="td-metric">
                  <span class="m-ico">💨</span>
                  <span>${getTranslation('spo2Label')}</span>
                </div>
              </td>
              <td class="td-val" style="color:${S.spo2 < 93 ? '#dc2626' : 'inherit'};">
                ${S.estimated ? (r.breakdown.spo2Est ? '~' + r.breakdown.spo2Est + '%' : '--') : S.spo2 + '%'}
              </td>
              <td class="td-ref">≥ 95%</td>
              <td class="td-status">
                <span class="rep-badge ${S.spo2 < 93 ? 'badge-danger' : S.spo2 <= 95 ? 'badge-warning' : 'badge-safe'}">
                  ${S.spo2 < 93 ? getTranslation('statHypoxia') : S.spo2 <= 95 ? getTranslation('statWarning') : getTranslation('statSafe')}
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <div class="td-metric">
                  <span class="m-ico">❤️</span>
                  <span>${getTranslation('heartRateLabel')}</span>
                </div>
              </td>
              <td class="td-val">${S.hr} BPM</td>
              <td class="td-ref">60–99 BPM</td>
              <td class="td-status">
                <span class="rep-badge ${S.hr >= 110 || S.hr < 55 ? 'badge-warning' : 'badge-safe'}">
                  ${S.hr >= 110 ? getTranslation('statHRFast') : S.hr < 55 ? getTranslation('statHRSlow') : getTranslation('statSafe')}
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <div class="td-metric">
                  <span class="m-ico">🩺</span>
                  <span>${getTranslation('bpLabel')}</span>
                </div>
              </td>
              <td class="td-val">${S.sys}/${S.dia}</td>
              <td class="td-ref">&lt; 130/85</td>
              <td class="td-status">
                <span class="rep-badge ${S.sys >= 140 || S.sys < 90 ? 'badge-warning' : 'badge-safe'}">
                  ${S.sys >= 140 ? getTranslation('statBPHigh') : S.sys < 90 ? getTranslation('statBPLow') : getTranslation('statSafe')}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Symptoms & Duration -->
      <div class="rep-symptoms-section">
        <div class="rep-subheading" style="margin-bottom:0.4rem;">${getTranslation('repSymptomsListTitle')}</div>
        <div class="rep-symptom-row">
          <span class="rep-symptom-tag-label">${getTranslation('repSymptomsSelected').replace(':', '')}:</span>
          <span class="rep-symptom-content"><b>${symptomsList}</b></span>
        </div>
        <div class="rep-symptom-row" style="margin-top:0.35rem;">
          <span class="rep-symptom-tag-label">${getTranslation('repDuration').replace(':', '')}:</span>
          <span class="rep-symptom-content"><b>${S.days} ${getTranslation('daysSuffix')}</b> <span class="rep-dim-text">(Hệ số D = ${r.breakdown.durationFactor})</span></span>
        </div>
      </div>
    </div>

    <!-- 5. Khuyến nghị & Hướng xử lý -->
    <div class="rep-card">
      <div class="rep-card-header">
        <span class="rep-card-icon">📋</span>
        <span>${getTranslation('repSec5')}</span>
      </div>
      
      <div class="rep-action-block rep-action-home">
        <div class="rep-action-title">
          <span>🏠</span>
          <span>${getTranslation('repHomeCare')}</span>
        </div>
        <p class="rep-action-desc">${r.recommendation}</p>
      </div>

      <div class="rep-action-block rep-action-hospital ${r.level === 'red' ? 'is-danger' : r.level === 'yellow' ? 'is-warning' : 'is-safe'}">
        <div class="rep-action-title">
          <span>🏥</span>
          <span>${getTranslation('repHospitalWarn')}</span>
        </div>
        <p class="rep-action-desc">${hospitalWarning}</p>
      </div>
    </div>

    <!-- 6. Lời miễn trừ trách nhiệm y khoa -->
    <div class="rep-disclaimer-box">
      <div class="rep-disclaimer-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        ${getTranslation('repSec6')}
      </div>
      <p class="rep-disclaimer-text">"${getTranslation('disclaimerText')}"</p>
    </div>

    <!-- Ký xác thực -->
    <div class="rep-sign-footer">
      <div class="rep-sign-col">
        <span class="rep-sign-title">${getTranslation('repSignSystem')}</span>
        <div class="rep-auth-code">
          <span class="auth-label">MÃ XÁC THỰC BẢN IN:</span>
          <code class="auth-hash">HP-${S.patient.id}-${Math.floor(1000 + Math.random() * 9000)}</code>
        </div>
      </div>
      <div class="rep-sign-col rep-sign-patient">
        <span class="rep-sign-title">${getTranslation('repSignPatient')}</span>
        <div class="rep-signature-space"></div>
        <span class="rep-sign-name">${S.patient.name || 'Người dùng'}</span>
      </div>
    </div>
  `;
}
