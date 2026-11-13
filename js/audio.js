/**
 * HealthPulse AI - Trình tổng hợp âm thanh y tế Web Audio API
 * Tự động tạo hiệu ứng âm thanh cảnh báo y tế chuẩn không cần nạp file mp3 ngoài
 */

const HealthAudio = {
  ctx: null,
  isMuted: false,
  sirenOsc: null,
  sirenGain: null,
  isSirenPlaying: false,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isSirenPlaying) {
      this.stopSiren();
    }
    return this.isMuted;
  },

  // Tiếng tick đếm ngược chuẩn bị 3, 2, 1
  playTick(freq = 600) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch(e) {}
  },

  // Tiếng chimes nhẹ nhàng khi An Toàn (Mức Xanh)
  playSafeChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.ctx.currentTime + idx * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  },

  // Tiếng bíp nhắc nhở khi Cần Chú Ý (Mức Vàng)
  playWarningBeep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    [0, 0.18].forEach(delay => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + delay); // A5

      const startTime = this.ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  },

  // Tiếng còi báo động cấp cứu khẩn cấp (Mức Đỏ & SOS 115)
  startEmergencySiren() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.isSirenPlaying) return;

    this.isSirenPlaying = true;
    this.sirenOsc = this.ctx.createOscillator();
    this.sirenGain = this.ctx.createGain();

    this.sirenOsc.type = 'sawtooth';
    this.sirenGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // LFO điều chế tần số còi cứu thương (600Hz - 1100Hz)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    lfo.frequency.value = 1.2; // 1.2 chu kỳ/giây
    lfoGain.gain.value = 280; // Độ quét tần số

    this.sirenOsc.frequency.setValueAtTime(820, this.ctx.currentTime);
    lfo.connect(this.sirenOsc.frequency);

    this.sirenOsc.connect(this.sirenGain);
    this.sirenGain.connect(this.ctx.destination);

    lfo.start();
    this.sirenOsc.start();
    this.sirenOsc._lfo = lfo;
  },

  stopSiren() {
    if (!this.isSirenPlaying) return;
    try {
      if (this.sirenGain && this.ctx) {
        this.sirenGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
        setTimeout(() => {
          if (this.sirenOsc) {
            this.sirenOsc.stop();
            if (this.sirenOsc._lfo) this.sirenOsc._lfo.stop();
            this.sirenOsc.disconnect();
            this.sirenOsc = null;
          }
          this.isSirenPlaying = false;
        }, 220);
      }
    } catch (e) {
      this.isSirenPlaying = false;
    }
  },

  // Tiếng đập nhịp tim (Lub-Dub) khi đo mạch
  playHeartbeatThud() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Lub (Thấp hơn, kéo dài hơn)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(75, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);

    gain1.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start();
    osc1.stop(this.ctx.currentTime + 0.12);

    // Dub (Nhanh hơn, cao hơn 0.12s sau)
    setTimeout(() => {
      if (!this.ctx) return;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(95, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.06);

      gain2.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start();
      osc2.stop(this.ctx.currentTime + 0.09);
    }, 120);
  },

  // Aliases for seamless compatibility
  playBeepSuccess() {
    this.playSafeChime();
  },

  playAlertWarning() {
    this.playWarningBeep();
  }
};

if (typeof window !== 'undefined') {
  window.HealthAudio = HealthAudio;
}
