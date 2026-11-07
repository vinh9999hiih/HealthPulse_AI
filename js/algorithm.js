/**
 * HealthPulse AI - Thuật toán & Quy trình suy luận logic y tế
 * Tác giả đề tài: Nguyễn Hoàng Minh Trọng - Lớp 10A5 - THPT Phạm Thành Trung
 * 
 * Công thức: S = S_sinh_hieu + SUM(W_i * D)
 * Trong đó: D = 1 + (N - 1) * 0.3 (với N là số ngày)
 * Cơ chế Red Override: SpO2 < 93% hoặc triệu chứng đỏ (đau ngực, khó thở cấp) -> Báo động ĐỎ ngay lập tức
 */

const HealthPulseEngine = {
  // Trọng số các triệu chứng chuẩn y tế lâm sàng
  SYMPTOMS_CATALOG: [
    { id: 'cough', name: 'Ho / Đau họng', weight: 2, icon: 'wind', desc: 'Ho khan hoặc ho có đờm, rát cổ họng' },
    { id: 'fatigue', name: 'Mệt mỏi / Uể oải', weight: 2, icon: 'battery-low', desc: 'Suy nhược cơ thể, uể oải không có sức' },
    { id: 'headache', name: 'Đau đầu / Nặng đầu', weight: 2, icon: 'brain', desc: 'Đau âm ỉ vùng trán hoặc sau gáy' },
    { id: 'runny_nose', name: 'Sổ mũi / Nghẹt mũi', weight: 1, icon: 'cloud-snow', desc: 'Chảy nước mũi, nghẹt đường hô hấp trên' },
    { id: 'dizziness', name: 'Chóng mặt / Choáng váng', weight: 4, icon: 'rotate-cw', desc: 'Đứng không vững, hoa mắt, mất thăng bằng' },
    { id: 'muscle_pain', name: 'Đau mỏi cơ bắp / Khớp', weight: 3, icon: 'activity', desc: 'Nhức mỏi tay chân, đau cơ toàn thân' },
    { id: 'insomnia', name: 'Mất ngủ / Trằn trọc', weight: 3, icon: 'moon', desc: 'Khó vào giấc, thức giấc giữa đêm nhiều lần' },
    { id: 'nausea', name: 'Buồn nôn / Nôn ói', weight: 4, icon: 'alert-circle', desc: 'Cảm giác cồn cào buồn nôn hoặc đã nôn' },
    { id: 'stomach_pain', name: 'Đau bụng dữ dội', weight: 7, icon: 'shield-alert', desc: 'Đau quặn từng cơn, bụng co cứng' },
    { id: 'chest_pain', name: 'Đau thắt ngực / Co thắt tim', weight: 10, isRedFlag: true, icon: 'heart-crack', desc: 'Cảm giác bị đè nặng lồng ngực, lan ra cánh tay trái (Khẩn cấp)' },
    { id: 'dyspnea', name: 'Khó thở cấp tính / Hụt hơi nặng', weight: 10, isRedFlag: true, icon: 'zap', desc: 'Thở dốc, thở rít, không đủ oxy ngay cả khi ngồi nghỉ (Khẩn cấp)' }
  ],

  // 1. Tính điểm Thân nhiệt (°C)
  calcTempScore(temp) {
    if (!temp || isNaN(temp)) return { score: 0, status: 'normal', label: 'Chưa đo' };
    const t = parseFloat(temp);
    if (t < 35.5) {
      return { score: 30, status: 'critical', label: 'Hạ thân nhiệt (< 35.5°C)', detail: 'Nguy hiểm, cần ủ ấm ngay' };
    } else if (t < 37.5) {
      return { score: 0, status: 'safe', label: 'Bình thường (36.0 - 37.4°C)', detail: 'Thân nhiệt ổn định' };
    } else if (t <= 38.4) {
      return { score: 10, status: 'warning', label: 'Sốt nhẹ (37.5 - 38.4°C)', detail: '+10 điểm nguy cơ' };
    } else if (t <= 39.4) {
      return { score: 20, status: 'danger', label: 'Sốt cao (38.5 - 39.4°C)', detail: '+20 điểm nguy cơ' };
    } else {
      return { score: 30, status: 'critical', label: 'Sốt rất cao (≥ 39.5°C)', detail: 'Nguy cơ co giật, sốt ác tính' };
    }
  },

  // 2. Tính điểm Oxy trong máu SpO2 (%)
  calcSpO2Score(spo2) {
    if (!spo2 || isNaN(spo2)) return { score: 0, status: 'normal', label: 'Chưa đo', isEmergency: false };
    const s = parseFloat(spo2);
    if (s >= 96) {
      return { score: 0, status: 'safe', label: 'Bình thường (96 - 100%)', detail: 'Độ bão hòa oxy tốt', isEmergency: false };
    } else if (s >= 94) {
      return { score: 10, status: 'warning', label: 'Hơi giảm nhẹ (94 - 95%)', detail: '+10 điểm nguy cơ', isEmergency: false };
    } else {
      return { score: 35, status: 'critical', label: 'Suy hô hấp / Nguy cấp (< 93%)', detail: 'Thiếu oxy tế bào nghiêm trọng!', isEmergency: true };
    }
  },

  // 3. Tính điểm Nhịp tim (BPM)
  calcHeartRateScore(hr) {
    if (!hr || isNaN(hr)) return { score: 0, status: 'normal', label: 'Chưa đo' };
    const h = parseFloat(hr);
    if (h < 50) {
      return { score: 25, status: 'danger', label: 'Nhịp tim quá chậm (< 50 BPM)', detail: 'Nguy cơ block nhĩ thất' };
    } else if (h < 60) {
      return { score: 5, status: 'warning', label: 'Nhịp chậm nhẹ (50 - 59 BPM)', detail: 'Theo dõi nếu không phải vận động viên' };
    } else if (h <= 99) {
      return { score: 0, status: 'safe', label: 'Bình thường (60 - 99 BPM)', detail: 'Nhịp xoang ổn định' };
    } else if (h <= 119) {
      return { score: 15, status: 'warning', label: 'Nhịp nhanh nhẹ (100 - 119 BPM)', detail: '+15 điểm nguy cơ' };
    } else {
      return { score: 25, status: 'critical', label: 'Nhịp rất nhanh (≥ 120 BPM)', detail: 'Nguy cơ rung nhĩ / loạn nhịp' };
    }
  },

  // 4. Tính điểm Huyết áp (mmHg: Tâm thu / Tâm trương)
  calcBPScore(systolic, diastolic) {
    if (!systolic || !diastolic || isNaN(systolic) || isNaN(diastolic)) {
      return { score: 0, status: 'normal', label: 'Chưa đo' };
    }
    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);
    if (sys < 90 || dia < 60) {
      return { score: 20, status: 'danger', label: 'Tụt huyết áp (< 90/60 mmHg)', detail: 'Nguy cơ sốc / choáng váng' };
    } else if (sys <= 120 && dia <= 80) {
      return { score: 0, status: 'safe', label: 'Huyết áp lý tưởng (<= 120/80)', detail: 'Chỉ số hoàn hảo' };
    } else if (sys <= 139 || dia <= 89) {
      return { score: 10, status: 'warning', label: 'Tiền tăng huyết áp (121-139 / 80-89)', detail: '+10 điểm nguy cơ' };
    } else if (sys <= 179 || dia <= 119) {
      return { score: 20, status: 'danger', label: 'Tăng huyết áp độ 2 (140-179 / 90-119)', detail: 'Cần uống thuốc theo toa' };
    } else {
      return { score: 30, status: 'critical', label: 'Cơn tăng huyết áp khẩn cấp (≥ 180 / ≥ 120)', detail: 'Nguy cơ đột quỵ cấp' };
    }
  },

  // 5. Chế độ ước lượng không có thiết bị đo (Fallback clinical estimation)
  calcEstimatedScore(data) {
    const est = data.estimation || data || {};
    let estVitalScore = 0;
    let details = [];
    let isRed = false;
    let tempScore = 0;
    let breathingScore = 0;
    let pulseScore = 0;
    let spo2Est = 97;

    // Ước lượng Thân nhiệt
    if (est.estTemp === 'fever_mild') {
      tempScore = 10;
      estVitalScore += 10;
      details.push({ param: 'Thân nhiệt ước lượng', value: 'Nóng sốt nhẹ', score: 10 });
    } else if (est.estTemp === 'fever_high') {
      tempScore = 25;
      estVitalScore += 25;
      details.push({ param: 'Thân nhiệt ước lượng', value: 'Nóng ran, ớn lạnh, vã mồ hôi', score: 25 });
    } else if (est.estTemp === 'normal') {
      details.push({ param: 'Thân nhiệt ước lượng', value: 'Cảm giác bình thường', score: 0 });
    }

    // Ước lượng Oxy & Hô hấp
    if (est.estBreathing === 'short_effort') {
      breathingScore = 15;
      estVitalScore += 15;
      spo2Est = 94;
      details.push({ param: 'Oxy & Nhịp thở', value: 'Hụt hơi khi gắng sức / leo cầu thang', score: 15 });
    } else if (est.estBreathing === 'short_severe') {
      breathingScore = 35;
      estVitalScore += 35;
      spo2Est = 90;
      isRed = true;
      details.push({ param: 'Oxy & Nhịp thở', value: 'Khó thở nặng cả khi ngồi yên', score: 35 });
    } else if (est.estBreathing === 'normal') {
      spo2Est = 98;
      details.push({ param: 'Oxy & Nhịp thở', value: 'Thở đều bình thường', score: 0 });
    }

    // Ước lượng Nhịp tim qua đếm mạch thủ công
    if (est.manualPulse) {
      const pRes = this.calcHeartRateScore(est.manualPulse);
      pulseScore = pRes.score;
      estVitalScore += pRes.score;
      details.push({ param: 'Mạch cổ tay đếm tay', value: `${est.manualPulse} BPM`, score: pRes.score });
    }

    return { estVitalScore, details, isRed, tempScore, breathingScore, pulseScore, spo2Est };
  },

  // 6. Tính Hệ số thời gian D: D = 1 + (N - 1) * 0.3
  calcDurationFactor(days) {
    const N = Math.max(1, parseInt(days) || 1);
    const D = 1 + (N - 1) * 0.3;
    return {
      days: N,
      factor: parseFloat(D.toFixed(2)),
      formula: `D = 1 + (${N} - 1) x 0.3 = ${D.toFixed(1)}`
    };
  },

  // 7. TOÀN BỘ QUY TRÌNH SUY LUẬN LOGIC (MASTER EVALUATION)
  evaluate(input, lang = (typeof currentLang !== 'undefined' ? currentLang : 'vi')) {
    const missingParams = [];
    const breakdown = {
      vitals: [],
      symptoms: [],
      sVital: 0,
      sVitalTotal: 0,
      tempScore: 0,
      spo2Score: 0,
      heartRateScore: 0,
      bpScore: 0,
      spo2Est: null,
      sSymptomRaw: 0,
      durationFactor: 1.0,
      sSymptomWeighted: 0,
      totalScore: 0,
      redFlagsTriggered: []
    };

    let isEmergencyRed = false;
    let sVital = 0;

    if (input.isEstimatedMode) {
      // Chế độ ước lượng lâm sàng
      const estResult = this.calcEstimatedScore(input.estimation || input);
      sVital = estResult.estVitalScore;
      breakdown.tempScore = estResult.tempScore;
      breakdown.spo2Score = estResult.breathingScore;
      breakdown.heartRateScore = estResult.pulseScore;
      breakdown.spo2Est = estResult.spo2Est;
      breakdown.vitals = estResult.details;
      if (estResult.isRed) {
        isEmergencyRed = true;
        breakdown.redFlagsTriggered.push('Khó thở nặng cả khi nghỉ ngơi (Ước lượng SpO2 giảm nguy cấp)');
      }
    } else {
      // Chế độ đo chuẩn xác với thiết bị
      // Thân nhiệt
      if (input.temperature) {
        const tRes = this.calcTempScore(input.temperature);
        sVital += tRes.score;
        breakdown.tempScore = tRes.score;
        breakdown.vitals.push({
          name: 'Thân nhiệt',
          value: `${input.temperature} °C`,
          score: tRes.score,
          status: tRes.status,
          label: tRes.label
        });
      } else {
        missingParams.push('Thân nhiệt');
      }

      // SpO2
      if (input.spo2) {
        const oRes = this.calcSpO2Score(input.spo2);
        sVital += oRes.score;
        breakdown.spo2Score = oRes.score;
        breakdown.vitals.push({
          name: 'Nồng độ Oxy (SpO2)',
          value: `${input.spo2} %`,
          score: oRes.score,
          status: oRes.status,
          label: oRes.label
        });
        if (oRes.isEmergency) {
          isEmergencyRed = true;
          breakdown.redFlagsTriggered.push(`Nồng độ oxy SpO2 tụt nguy hiểm (${input.spo2}% < 93%)`);
        }
      } else {
        missingParams.push('Oxy SpO2');
      }

      // Nhịp tim
      if (input.heartRate) {
        const hrRes = this.calcHeartRateScore(input.heartRate);
        sVital += hrRes.score;
        breakdown.heartRateScore = hrRes.score;
        breakdown.vitals.push({
          name: 'Nhịp tim',
          value: `${input.heartRate} BPM`,
          score: hrRes.score,
          status: hrRes.status,
          label: hrRes.label
        });
      } else {
        missingParams.push('Nhịp tim');
      }

      // Huyết áp
      if (input.systolic && input.diastolic) {
        const bpRes = this.calcBPScore(input.systolic, input.diastolic);
        sVital += bpRes.score;
        breakdown.bpScore = bpRes.score;
        breakdown.vitals.push({
          name: 'Huyết áp',
          value: `${input.systolic}/${input.diastolic} mmHg`,
          score: bpRes.score,
          status: bpRes.status,
          label: bpRes.label
        });
      }
    }

    breakdown.sVital = sVital;
    breakdown.sVitalTotal = sVital;

    // Tính điểm triệu chứng
    const selectedSymptomIds = input.symptoms || [];
    let sumWeight = 0;

    selectedSymptomIds.forEach(symId => {
      const item = this.SYMPTOMS_CATALOG.find(s => s.id === symId);
      if (item) {
        sumWeight += item.weight;
        breakdown.symptoms.push({
          id: item.id,
          name: item.name,
          weight: item.weight,
          isRedFlag: !!item.isRedFlag
        });

        if (item.isRedFlag) {
          isEmergencyRed = true;
          breakdown.redFlagsTriggered.push(`Triệu chứng Đỏ: ${item.name}`);
        }
      }
    });

    breakdown.sSymptomRaw = sumWeight;

    // Tính hệ số thời gian D
    const duration = this.calcDurationFactor(input.durationDays || 1);
    breakdown.durationFactor = duration.factor;
    breakdown.durationDays = duration.days;
    breakdown.durationFormula = duration.formula;

    // Tổng điểm triệu chứng theo thời gian = SUM(W_i * D)
    const symptomScoreWeighted = parseFloat((sumWeight * duration.factor).toFixed(1));
    breakdown.sSymptomWeighted = symptomScoreWeighted;

    // Tổng điểm nguy cơ toàn phần S
    let totalScore = parseFloat((sVital + symptomScoreWeighted).toFixed(1));
    breakdown.totalScore = totalScore;

    // Phân loại kết luận theo tiêu chuẩn HealthPulse AI
    let level = 'green';
    let levelName = 'Mức Xanh (An toàn)';
    let levelBadge = 'ỔN ĐỊNH';
    let alertMessage = '';
    let recommendation = '';
    let scheduleAdvice = '';

    const isLangEN = lang === 'en';
    const isLangKO = lang === 'ko';
    const isLangZH = lang === 'zh';

    if (isEmergencyRed || totalScore >= 35) {
      level = 'red';
      levelName = isLangEN ? 'Red (Critical Emergency)' : isLangKO ? '빨간색 (위험 상태)' : isLangZH ? '危急红标 (急重症预警)' : 'Mức Đỏ (Nguy hiểm khẩn cấp)';
      levelBadge = isLangEN ? 'CRITICAL' : isLangKO ? '위험' : isLangZH ? '危急' : 'NGUY CẤP';
      alertMessage = isLangEN
        ? 'CRITICAL EMERGENCY: Vital signs exceed safety limits or acute symptoms detected!'
        : isLangKO
        ? '긴급 위험 경보: 활력 징후가 안전 범위를 심각하게 초과했거나 응급 증상이 감지되었습니다!'
        : isLangZH
        ? '危急预警：生命体征严重超出安全范围或已触发急性重症特征！'
        : (isEmergencyRed ? `CẢNH BÁO ĐỎ KHẨN CẤP: Xuất hiện dấu hiệu cấp tính (${breakdown.redFlagsTriggered.join(', ')})!` : `CẢNH BÁO ĐỎ: Điểm nguy cơ toàn phần S = ${totalScore} (≥ 35) vượt ngưỡng an toàn nghiêm trọng!`);
      recommendation = isLangEN
        ? 'Seek immediate medical attention at the nearest emergency room or call 115 / 911 immediately. Keep patient semi-seated, loosen clothing, and stay accompanied!'
        : isLangKO
        ? '즉시 가장 가까운 의료기관을 방문하거나 115 / 119에 전화하세요. 환자를 반좌위 자세로 유지하고 의복을 느슨하게 하세요!'
        : isLangZH
        ? '请立即前往就近医疗急救机构或拨打 115 / 120。协助患者保持半卧位，松开衣物，留人陪护！'
        : 'Yêu cầu đến cơ sở y tế gần nhất hoặc gọi cấp cứu 115 ngay lập tức. Giữ tư thế nửa nằm nửa ngồi, nới lỏng trang phục, giữ người nhà bên cạnh!';
      scheduleAdvice = isLangEN
        ? 'DO NOT DELAY! Emergency dialer and GPS coordinates dispatch are now active.'
        : isLangKO
        ? '시간을 지체하지 마세요! 긴급 115 호출 및 보호자 GPS 전송 창구가 활성화되었습니다.'
        : isLangZH
        ? '请勿拖延！紧急呼救通道及亲友GPS定位协同功能已同步启动。'
        : 'KHÔNG trì hoãn thời gian! Hệ thống đã mở cổng gọi khẩn cấp 115 và gửi tọa độ định vị tới người thân.';
    } else if (totalScore >= 12) {
      level = 'yellow';
      levelName = isLangEN ? 'Yellow (Observation Required)' : isLangKO ? '노란색 (주의 관찰)' : isLangZH ? '黄标关注 (需密切观察)' : 'Mức Vàng (Cần chú ý theo dõi)';
      levelBadge = isLangEN ? 'ATTENTION' : isLangKO ? '주의' : isLangZH ? '关注' : 'CẦN CHÚ Ý';
      alertMessage = isLangEN
        ? 'Mild vital sign irregularities detected. Close monitoring is recommended.'
        : isLangKO
        ? '경미한 활력 징후 이상이 감지되었습니다. 면밀한 관찰이 필요합니다.'
        : isLangZH
        ? '监测到轻度生理体征波动，建议密切随访观察。'
        : 'Cơ thể có dấu hiệu bất ổn nhẹ cần theo dõi sát sao.';
      recommendation = isLangEN
        ? 'Ensure adequate hydration (warm water or oral rehydration solution 2-2.5L/day), rest in a well-ventilated room, and avoid physical or mental strain.'
        : isLangKO
        ? '충분한 수분 섭취(따뜻한 물 또는 전해질 2-2.5L/일), 환기가 잘 되는 곳에서 절대 휴식을 취하고 무리한 활동을 피하세요.'
        : isLangZH
        ? '充足补水（温开水或电解质水2-2.5升/天），保持室内空气流通并充分卧床休息，避免过度劳累。'
        : 'Bù đủ nước (Oresol hoặc nước ấm 2-2.5L/ngày), nghỉ ngơi tuyệt đối tại phòng thoáng khí, tránh vận động mạnh hay làm việc căng thẳng.';
      scheduleAdvice = isLangEN
        ? 'Re-check in 12 hours. If temperature exceeds 38.5°C, SpO2 drops below 94%, or shortness of breath occurs, system will trigger Red Alert!'
        : isLangKO
        ? '12시간 후 재측정하세요. 체온 38.5°C 초과, SpO2 94% 미만 또는 호흡곤란 발생 시 즉시 적색 경보로 전환됩니다!'
        : isLangZH
        ? '建议12小时后复测。若体温超过38.5°C、血氧低于94%或出现呼吸急促，系统将自动升级为危急预警！'
        : 'Hẹn kiểm tra lại sau 12 giờ. Nếu thân nhiệt vượt 38.5°C, SpO2 < 94% hoặc xuất hiện khó thở, hệ thống sẽ tự động nâng lên Cảnh Báo Đỏ!';
    } else {
      level = 'green';
      levelName = isLangEN ? 'Green (Normal Stable)' : isLangKO ? '녹색 (정상 안정)' : isLangZH ? '绿标正常 (健康稳定)' : 'Mức Xanh (An toàn)';
      levelBadge = isLangEN ? 'STABLE' : isLangKO ? '안정' : isLangZH ? '稳定' : 'ỔN ĐỊNH';
      alertMessage = isLangEN
        ? 'Vital signs and clinical indicators are within standard physiological limits.'
        : isLangKO
        ? '활력 징후와 임상 지표가 정상 생리적 범위 내에 있습니다.'
        : isLangZH
        ? '生命体征与临床监测指标均处于正常生理范围内。'
        : 'Các chỉ số sinh hiệu và lâm sàng nằm trong giới hạn sinh lý bình thường.';
      recommendation = isLangEN
        ? 'Health is stable. Maintain balanced nutrition, sleep 7-8 hours, and stay well hydrated.'
        : isLangKO
        ? '건강 상태가 양호합니다. 균형 잡힌 식단, 7-8시간 숙면 및 충분한 수분 섭취를 유지하세요.'
        : isLangZH
        ? '健康状态良好。保持均衡饮食、规律睡眠7-8小时，并适量补充水分。'
        : 'Sức khỏe ổn định, duy trì chế độ dinh dưỡng cân đối, ngủ đủ giấc từ 7-8 tiếng và uống đủ nước.';
      scheduleAdvice = isLangEN
        ? 'Log your health measurements every morning and evening for accurate AI trend analysis.'
        : isLangKO
        ? '정확한 AI 추세 분석을 위해 매일 아침과 저녁 정기적으로 건강 상태를 기록하세요.'
        : isLangZH
        ? '建议早晚定时记录健康指标，以便AI系统绘制精准的健康趋势动态图。'
        : 'Ghi nhận nhật ký sức khỏe đều đặn mỗi sáng và tối để hệ thống AI vẽ biểu đồ xu hướng chính xác.';
    }

    return {
      score: totalScore,
      level: level,
      levelName: levelName,
      levelBadge: levelBadge,
      alertMessage: alertMessage,
      recommendation: recommendation,
      scheduleAdvice: scheduleAdvice,
      breakdown: breakdown,
      missingParams: missingParams,
      isEmergencyRed: isEmergencyRed,
      timestamp: new Date().toISOString()
    };
  }
};

// Export for both browser and Node.js
if (typeof window !== 'undefined') {
  window.HealthPulseEngine = HealthPulseEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HealthPulseEngine;
}
