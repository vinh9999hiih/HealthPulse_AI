/**
 * HealthPulse AI — Hệ thống Đa ngôn ngữ (Multilingual System)
 * Hỗ trợ 4 ngôn ngữ: Tiếng Việt (vi), English (en), 한국어 (ko), 中文 (zh)
 */

const TRANSLATIONS = {
  vi: {
    langName: "Tiếng Việt",
    appTitle: "HealthPulse AI",
    appDesc: "Theo dõi & Cảnh báo sức khỏe",
    btnElderly: "Chữ lớn",
    btnDarkMode: "Giao diện",
    btnSOS: "Cấp cứu 115",
    
    // Bottom Navigation
    navOverview: "Tổng quan",
    navCheckin: "Đo lường",
    navDetail: "Chi tiết",
    navTrends: "Xu hướng",
    navReport: "Báo cáo",

    // Home / Overview
    heroTitle: "Tình trạng sức khỏe hiện tại",
    heroScoreMax: "/ 100 điểm",
    heroStatusSafe: "ỔN ĐỊNH",
    heroStatusWarning: "CẦN CHÚ Ý",
    heroStatusDanger: "NGUY CẤP",
    btnVoice: "Nghe đọc kết quả (AI Voice)",
    btnVoiceStop: "Dừng đọc âm thanh",
    lblVoiceSelect: "Giọng đọc:",
    voiceFemale: "Hoài My (Nữ truyền cảm - AI)",
    voiceMale: "Nam Minh (Nam trầm ấm - Bác sĩ AI)",
    voiceGoogle: "Google AI (Tự nhiên)",
    tempLabel: "Thân nhiệt",
    spo2Label: "Oxy SpO2",
    heartRateLabel: "Nhịp tim",
    bpLabel: "Huyết áp",
    statNotMeasured: "Chưa đo",
    statSafe: "Bình thường",
    statWarning: "Cần chú ý",
    statDanger: "Bất thường",
    statFeverHigh: "Sốt cao",
    statFeverMild: "Sốt nhẹ",
    statHypoxia: "Thiếu oxy",
    statHRFast: "Nhanh",
    statHRSlow: "Chậm",
    statBPHigh: "Huyết áp cao",
    statBPLow: "Huyết áp thấp",
    ptsSuffix: "điểm",
    smsCopiedAlert: "Đã sao chép nội dung tin nhắn khẩn cấp kèm tọa độ GPS!",
    disclaimerText: "Báo cáo này được tự động tạo bởi phần mềm HealthPulse AI nhằm mục đích hỗ trợ tham khảo và cảnh báo sớm, không thay thế cho chẩn đoán chính thức của bác sĩ chuyên khoa.",
    homeSymptomsTitle: "Triệu chứng đã ghi nhận",
    editArrow: "Chỉnh sửa →",
    homeNoSymptoms: "Chưa ghi nhận triệu chứng nào. Bấm 'Đo lường' để bắt đầu kiểm tra.",
    homeAdviceTitle: "Khuyến nghị lâm sàng từ AI",
    adviceLabel: "Khuyến cáo:",
    scheduleLabel: "Lịch theo dõi:",
    btnLogToday: "GHI NHẬN CHỈ SỐ HÔM NAY",

    // Checkin / Measurements
    checkinTitle: "Ghi nhận chỉ số sức khỏe",
    patientCardTitle: "Thông tin người đo / Bệnh nhân",
    patientIdLabel: "Mã:",
    lblFullName: "Họ và tên",
    lblAge: "Tuổi",
    lblGender: "Giới tính",
    genderMale: "Nam",
    genderFemale: "Nữ",
    genderOther: "Khác",
    btnEditPatient: "Chỉnh sửa",
    btnDoneEdit: "Xong",
    
    // Vitals Section
    vitalsSecTitle: "Bảng chỉ số sinh hiệu (Vitals)",
    vitalsSecHint: "Chạm nút + / − hoặc nhập giá trị đo được",
    tempHint: "Bình thường: 36.5 – 37.4 °C",
    spo2Hint: "Dưới 93% → Cấp cứu ngay",
    hrHint: "Bình thường: 60 – 99 BPM",
    bpHint: "Bình thường: 120 / 80 mmHg",
    btnTapPulse: "Đo nhịp tim 15 giây",
    tapModalTitle: "Đo nhịp tim 15 giây (Bắt mạch cổ tay)",
    tapModalDesc: "Đặt ngón tay lên mạch đập cổ tay. Chạm nút đỏ theo từng nhịp đập, đồng hồ sẽ đếm ngược 15s và tự động tính kết quả.",
    tapStatusReady: "Chạm nút đỏ để bắt đầu đếm 15 giây",
    tapStatusRunning: "Đang đếm ngược 15 giây… Hãy chạm theo từng nhịp tim!",
    tapStatusDone: "Đo hoàn tất! Kết quả đã tự động lưu.",
    tapTimeLabel: "Thời gian",
    tapBeatsLabel: "Số nhịp",
    tapBeatsUnit: "nhịp",
    tapEstLabel: "Ước tính",
    tapBpmUnit: "BPM",
    tapFormulaText: "nhịp trong 15s × 4",
    tapAutoSavedNotice: "✓ Đã tự động lưu vào chỉ số nhịp tim của bạn",
    tapBtnReset: "Đặt lại",
    tapBtnRetest: "Đo lại (15s)",
    tapBtnClose: "Áp dụng & Đóng",
    tapModalResult: "Chạm theo nhịp mạch đập…",
    tapModalClose: "Áp dụng & Đóng",
    tapNoBeatsNotice: "Chưa ghi nhận nhịp nào. Hãy bấm 'Đo lại' và chạm theo nhịp đập.",

    // Estimator & Manual Guide
    modeNoDeviceTitle: "Không có dụng cụ đo? Bật ước tính lâm sàng & Hướng dẫn AI",
    modeNoDeviceSub: "Bao gồm ước tính triệu chứng và hướng dẫn đo mạch đập cổ tay",
    pulseGuideTitle: "Hướng dẫn đo mạch đập cổ tay (Bắt mạch quay)",
    pulseGuideSub: "Cách đo nhịp tim chuẩn y tế khi không có máy đo hoặc đồng hồ thông minh",
    pulseGuideStep1: "Đặt 2 ngón tay (ngón trỏ và ngón giữa) lên mặt trong cổ tay, ngay phía dưới gốc ngón tay cái.",
    pulseGuideStep2: "Ấn nhẹ cho đến khi cảm nhận rõ từng nhịp đập rộn ràng (không dùng ngón cái vì ngón cái có mạch riêng).",
    pulseGuideStep3: "Đếm số nhịp trong 15 giây rồi nhân với 4 (ví dụ 18 nhịp × 4 = 72 BPM) hoặc đếm trọn 60 giây.",
    pulseGuideStep4: "Hoặc bấm nút bên dưới để vừa bắt mạch vừa chạm nhịp trực tiếp lên màn hình, AI sẽ tự tính BPM:",
    pulseGuideBtn: "Mở công cụ Chạm nhịp tim (Tap-Tempo)",
    pulseGuideNormal: "Chuẩn sinh lý bình thường lúc nghỉ ngơi: 60 – 99 BPM.",
    estQ1: "1. Bạn cảm thấy thân nhiệt thế nào?",
    estTemp1: "Bình thường, không sốt",
    estTemp2: "Nóng nhẹ, hơi mệt",
    estTemp3: "Nóng ran, ớn lạnh, vã mồ hôi",
    estQ2: "2. Tình trạng hô hấp / nhịp thở?",
    estBreath1: "Thở đều, bình thường",
    estBreath2: "Hụt hơi khi vận động / leo cầu thang",
    estBreath3: "Khó thở nhiều khi ngồi yên (Cấp tính)",

    // Symptoms Section
    symptomsSecTitle: "Triệu chứng lâm sàng",
    symptomsSecHint: "Chạm chọn các triệu chứng đang xuất hiện (nếu có)",
    symptomsGroupRed: "Dấu hiệu báo động khẩn cấp",
    symptomsGroupCommon: "Triệu chứng thường gặp",
    durationTitle: "Thời gian diễn tiến triệu chứng",
    daysSuffix: "ngày",
    btnAnalyze: "PHÂN TÍCH & XEM KẾT QUẢ",

    // Analysis Detail
    detailTitle: "Chi tiết phân tích logic",
    step1Title: "Bước 1: Điểm chỉ số sinh hiệu (S_vital)",
    step2Title: "Bước 2: Hệ số thời gian diễn tiến (D)",
    step3Title: "Bước 3: Tổng điểm triệu chứng (∑Wi × D)",
    step4Title: "Bước 4: Tổng điểm nguy cơ toàn phần S",

    // Trends
    trendsTitle: "Xu hướng & Lịch sử",
    chartTitle: "Biểu đồ sinh hiệu 7 ngày",
    historyTitle: "Nhật ký các lần đo gần đây",
    btnClearHistory: "Xóa lịch sử",
    noHistoryYet: "Chưa có dữ liệu lịch sử.",

    // Report
    reportPageTitle: "Báo cáo y tế",
    btnPrintReport: "In / Lưu PDF",
    reportMainTitle: "HealthPulse AI – Nền tảng Giám sát & Cảnh báo Sức khỏe Cá nhân",
    reportSubTitle: "Hệ thống phân tích nguy cơ sinh hiệu lâm sàng tự động",
    reportStdBadge: "Bản in y tế tiêu chuẩn",
    repSec1: "1. Thông tin báo cáo:",
    repId: "ID:",
    repTime: "Thời gian xuất báo cáo:",
    repSec2: "2. Thông tin bệnh nhân:",
    repName: "Họ và tên:",
    repAge: "Tuổi:",
    repGender: "Giới tính:",
    repInputStatus: "Trạng thái nhập liệu:",
    statusDevice: "Đầy đủ chỉ số sinh hiệu đo bằng thiết bị y tế",
    statusEstimated: "Ước tính triệu chứng lâm sàng AI (Không có thiết bị SpO2)",
    repSec3: "3. Kết quả đánh giá nguy cơ:",
    repScore: "Tổng điểm nguy cơ (S):",
    repLevel: "Phân cấp mức độ nguy cơ:",
    repAIReview: "Nhận định từ AI:",
    repSec4: "4. Chi tiết dữ liệu đầu vào:",
    repVitalsTableTitle: "Bảng chỉ số sinh hiệu (Vitals):",
    colMetric: "Chỉ số sinh hiệu",
    colValue: "Giá trị ghi nhận",
    colNormal: "Khoảng sinh lý chuẩn",
    colStatus: "Đánh giá lâm sàng",
    repSymptomsListTitle: "Danh sách triệu chứng ghi nhận:",
    repSymptomsSelected: "Các triệu chứng đã chọn:",
    repSymptomsNone: "Không ghi nhận triệu chứng bất thường",
    repDuration: "Thời gian diễn tiến:",
    repSec5: "5. Khuyến nghị & Hướng xử lý (Actionable Recommendations):",
    repHomeCare: "Hướng dẫn chăm sóc tại nhà:",
    repHospitalWarn: "Cảnh báo chuyển viện:",
    hospWarnRed: "YÊU CẦU ĐẾN CƠ SỞ Y TẾ HOẶC GỌI CẤP CỨU 115 NGAY LẬP TỨC. Giữ bệnh nhân ở tư thế nửa nằm nửa ngồi, bảo đảm thông khí tốt, có người thân túc trực bên cạnh.",
    hospWarnYellow: "Cần theo dõi sát diễn biến sinh hiệu. Chuyển viện khám ngay nếu: SpO2 hạ dưới 93%, khó thở tăng dần, sốt cao liên tục không hạ (>38.5°C), li bì hoặc co giật.",
    hospWarnGreen: "Chưa có chỉ định chuyển viện khẩn cấp. Tiếp tục theo dõi định kỳ sáng và tối.",
    repSec6: "6. Lời miễn trừ trách nhiệm y khoa:",
    repDisclaimer: "Báo cáo này được tự động tạo bởi phần mềm HealthPulse AI nhằm mục đích hỗ trợ tham khảo và cảnh báo sớm, không thay thế cho chẩn đoán chính thức của bác sĩ chuyên khoa.",
    repSignSystem: "Hệ thống HealthPulse AI",
    repSignPatient: "Người thực hiện theo dõi",

    // SOS Modal
    sosTitle: "CẤP CỨU KHẨN CẤP (115)",
    sosCallBtn: "Gọi Ngay 115",
    sosRelativeBtn: "Gọi Người Thân",
    sosSmsBtn: "Soạn Tin Nhắn Khẩn Kèm Vị Trí",
    sosGuideTitle: "Hướng dẫn xử trí nhanh:",
    sosGuideContent: "Giữ bệnh nhân ở tư thế nửa nằm nửa ngồi, nới lỏng quần áo, mở cửa sổ thông thoáng và giữ liên lạc liên tục với nhân viên y tế 115.",
    btnClose: "Đóng",

    // Symptoms Catalog
    symptoms: {
      cough: { name: "Ho / Đau họng", desc: "Ho khan hoặc có đờm, rát cổ họng" },
      fatigue: { name: "Mệt mỏi / Suy nhược", desc: "Uể oải, mất sức, không muốn vận động" },
      headache: { name: "Đau đầu / Nặng đầu", desc: "Đau âm ỉ vùng trán hoặc sau gáy" },
      runny_nose: { name: "Sổ mũi / Nghẹt mũi", desc: "Chảy nước mũi, khó thở đường mũi" },
      dizziness: { name: "Chóng mặt / Choáng váng", desc: "Đứng không vững, hoa mắt, mất thăng bằng" },
      muscle_pain: { name: "Đau mỏi cơ khớp", desc: "Nhức mỏi toàn thân, đau nhức tay chân" },
      insomnia: { name: "Mất ngủ / Khó ngủ", desc: "Trằn trọc, thức giấc giữa đêm nhiều lần" },
      nausea: { name: "Buồn nôn / Nôn ói", desc: "Cảm giác cồn cào buồn nôn hoặc đã nôn" },
      stomach_pain: { name: "Đau bụng dữ dội", desc: "Đau quặn từng cơn, bụng co cứng" },
      chest_pain: { name: "Đau thắt ngực / Co thắt tim", desc: "Cảm giác bị đè nặng lồng ngực lan ra cánh tay (Khẩn cấp)" },
      dyspnea: { name: "Khó thở cấp tính / Hụt hơi nặng", desc: "Thở dốc, thở rít, thiếu oxy lúc ngồi nghỉ (Khẩn cấp)" }
    }
  },

  en: {
    langName: "English",
    appTitle: "HealthPulse AI",
    appDesc: "Clinical Health Monitor & AI Warning",
    btnElderly: "Large Text",
    btnDarkMode: "Theme",
    btnSOS: "Emergency 115",

    // Bottom Navigation
    navOverview: "Overview",
    navCheckin: "Vitals Log",
    navDetail: "Analysis",
    navTrends: "Trends",
    navReport: "Report",

    // Home / Overview
    heroTitle: "Current Health Status",
    heroScoreMax: "/ 100 pts",
    heroStatusSafe: "STABLE",
    heroStatusWarning: "ATTENTION",
    heroStatusDanger: "CRITICAL",
    btnVoice: "Listen to Voice Summary",
    btnVoiceStop: "Stop Voice Playback",
    lblVoiceSelect: "AI Voice:",
    voiceFemale: "Jenny (Natural Female AI)",
    voiceMale: "Guy (Calm Male Doctor AI)",
    voiceGoogle: "Google AI (Natural)",
    tempLabel: "Temperature",
    spo2Label: "Blood SpO2",
    heartRateLabel: "Heart Rate",
    bpLabel: "Blood Pressure",
    statNotMeasured: "Not logged",
    statSafe: "Normal",
    statWarning: "Attention",
    statDanger: "Abnormal",
    statFeverHigh: "High Fever",
    statFeverMild: "Mild Fever",
    statHypoxia: "Hypoxia Alert",
    statHRFast: "Fast (Tachycardia)",
    statHRSlow: "Slow (Bradycardia)",
    statBPHigh: "Hypertension",
    statBPLow: "Hypotension",
    ptsSuffix: "pts",
    smsCopiedAlert: "Emergency SOS message with GPS coordinates copied to clipboard!",
    disclaimerText: "This report is generated automatically by HealthPulse AI software for reference and early warning purposes only. It does not replace an official clinical diagnosis by a licensed physician.",
    homeSymptomsTitle: "Recorded Symptoms",
    editArrow: "Edit →",
    homeNoSymptoms: "No symptoms recorded yet. Tap 'Vitals Log' to check in.",
    homeAdviceTitle: "Clinical Recommendations (AI)",
    adviceLabel: "Clinical Advice:",
    scheduleLabel: "Monitoring Plan:",
    btnLogToday: "LOG TODAY'S VITALS",

    // Checkin / Measurements
    checkinTitle: "Log Health Measurements",
    patientCardTitle: "Patient Profile",
    patientIdLabel: "ID:",
    lblFullName: "Full Name",
    lblAge: "Age",
    lblGender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    btnEditPatient: "Edit",
    btnDoneEdit: "Done",

    // Vitals Section
    vitalsSecTitle: "Vital Signs Panel",
    vitalsSecHint: "Tap + / − or enter measured values",
    tempHint: "Normal: 36.5 – 37.4 °C",
    spo2Hint: "Below 93% → Emergency alert",
    hrHint: "Normal: 60 – 99 BPM",
    bpHint: "Normal: 120 / 80 mmHg",
    btnTapPulse: "15-Second Pulse Check",
    tapModalTitle: "15-Second Pulse Measurement (Wrist Palpation)",
    tapModalDesc: "Place fingers on your wrist pulse. Tap the red button with each beat; a 15-second timer will count down and automatically compute BPM.",
    tapStatusReady: "Tap the red button to start 15s countdown",
    tapStatusRunning: "Counting down 15 seconds… Tap rhythmically with your pulse!",
    tapStatusDone: "Measurement complete! Result auto-saved.",
    tapTimeLabel: "Time",
    tapBeatsLabel: "Beats",
    tapBeatsUnit: "beats",
    tapEstLabel: "Estimated",
    tapBpmUnit: "BPM",
    tapFormulaText: "beats in 15s × 4",
    tapAutoSavedNotice: "✓ Automatically saved to your Heart Rate log",
    tapBtnReset: "Reset",
    tapBtnRetest: "Retest (15s)",
    tapBtnClose: "Apply & Close",
    tapModalResult: "Tap rhythmically with pulse…",
    tapModalClose: "Apply & Close",
    tapNoBeatsNotice: "No pulse beats recorded. Tap 'Retest' and tap with each beat.",

    // Estimator & Manual Guide
    modeNoDeviceTitle: "No measurement devices? Enable AI estimation & Manual guide",
    modeNoDeviceSub: "Includes clinical symptom estimation & wrist pulse measurement guide",
    pulseGuideTitle: "Wrist Pulse Measurement Guide (Radial Pulse)",
    pulseGuideSub: "Standard medical method to measure heart rate without any devices or smartwatch",
    pulseGuideStep1: "Place two fingers (index and middle) on the inside of your wrist, just below the base of your thumb.",
    pulseGuideStep2: "Press lightly until you clearly feel the rhythmic beats (do not use your thumb, as it has its own pulse).",
    pulseGuideStep3: "Count beats for 15 seconds and multiply by 4 (e.g., 18 beats × 4 = 72 BPM) or count for full 60 seconds.",
    pulseGuideStep4: "Or tap the button below to tap rhythmically on screen with your pulse, AI will calculate BPM instantly:",
    pulseGuideBtn: "Open Tap-to-Measure Pulse Tool",
    pulseGuideNormal: "Normal resting heart rate reference: 60 – 99 BPM.",
    estQ1: "1. How does your body temperature feel?",
    estTemp1: "Normal, no fever sensation",
    estTemp2: "Mild warmth, slight fatigue",
    estTemp3: "High heat, shivering chills, heavy sweat",
    estQ2: "2. How is your breathing rhythm?",
    estBreath1: "Even, effortless breathing",
    estBreath2: "Short of breath on stairs / effort",
    estBreath3: "Severe breathlessness at rest (Acute)",

    // Symptoms Section
    symptomsSecTitle: "Clinical Symptoms",
    symptomsSecHint: "Select all symptoms you are currently experiencing",
    symptomsGroupRed: "Emergency Red Flags",
    symptomsGroupCommon: "Common Symptoms",
    durationTitle: "Symptom Duration",
    daysSuffix: "days",
    btnAnalyze: "ANALYZE HEALTH NOW",

    // Analysis Detail
    detailTitle: "Logical Inference Details",
    step1Title: "Step 1: Vital Signs Score (S_vital)",
    step2Title: "Step 2: Duration Multiplier (D)",
    step3Title: "Step 3: Weighted Symptoms (∑Wi × D)",
    step4Title: "Step 4: Overall Clinical Risk Score S",

    // Trends
    trendsTitle: "Trends & History",
    chartTitle: "7-Day Vitals Trend Chart",
    historyTitle: "Recent Check-in Logs",
    btnClearHistory: "Clear History",
    noHistoryYet: "No history logs yet.",

    // Report
    reportPageTitle: "Medical Report",
    btnPrintReport: "Print / Save PDF",
    reportMainTitle: "HealthPulse AI – Personal Health Monitoring & Early Warning Platform",
    reportSubTitle: "Automated Clinical Vital Risk Analysis Engine",
    reportStdBadge: "Standard Medical Printout",
    repSec1: "1. Report Information:",
    repId: "ID:",
    repTime: "Export Timestamp:",
    repSec2: "2. Patient Information:",
    repName: "Full Name:",
    repAge: "Age:",
    repGender: "Gender:",
    repInputStatus: "Data Input Mode:",
    statusDevice: "Complete vital signs measured by certified medical devices",
    statusEstimated: "AI Clinical Symptoms Estimation (No SpO2 oximeter)",
    repSec3: "3. Risk Assessment Result:",
    repScore: "Total Risk Score (S):",
    repLevel: "Risk Classification Level:",
    repAIReview: "AI Clinical Assessment:",
    repSec4: "4. Input Data Breakdown:",
    repVitalsTableTitle: "Vital Signs Table (Vitals):",
    colMetric: "Vital Sign",
    colValue: "Recorded Value",
    colNormal: "Standard Reference",
    colStatus: "Clinical Status",
    repSymptomsListTitle: "Recorded Clinical Symptoms:",
    repSymptomsSelected: "Selected Symptoms:",
    repSymptomsNone: "No abnormal symptoms recorded",
    repDuration: "Symptom Duration:",
    repSec5: "5. Actionable Recommendations:",
    repHomeCare: "Home Care Guidelines:",
    repHospitalWarn: "Hospital Referral Warning:",
    hospWarnRed: "IMMEDIATELY GO TO A MEDICAL FACILITY OR CALL EMERGENCY SERVICES. Keep patient semi-upright, ensure proper ventilation, and have someone stay by their side.",
    hospWarnYellow: "Closely monitor vital signs. Seek immediate emergency care if: SpO2 drops below 93%, breathing difficulty worsens, continuous high fever (>38.5°C), lethargy or convulsions occur.",
    hospWarnGreen: "No emergency hospital referral indicated at this time. Continue routine morning and evening monitoring.",
    repSec6: "6. Medical Disclaimer:",
    repDisclaimer: "This report is generated automatically by HealthPulse AI software for reference and early warning purposes only. It does not replace an official clinical diagnosis by a licensed physician.",
    repSignSystem: "HealthPulse AI System",
    repSignPatient: "Monitored Individual",

    // SOS Modal
    sosTitle: "EMERGENCY DISPATCH (115)",
    sosCallBtn: "Call 115 Now",
    sosRelativeBtn: "Call Family Contact",
    sosSmsBtn: "Send Emergency SMS with GPS",
    sosGuideTitle: "Immediate First Aid:",
    sosGuideContent: "Keep patient in a semi-seated upright position, loosen tight clothing, ensure fresh airflow, and maintain continuous contact with emergency dispatchers.",
    btnClose: "Close",

    // Symptoms Catalog
    symptoms: {
      cough: { name: "Cough / Sore Throat", desc: "Dry cough or phlegm, irritated throat" },
      fatigue: { name: "Fatigue / Weakness", desc: "Exhaustion, low energy, lethargy" },
      headache: { name: "Headache / Pressure", desc: "Dull ache around forehead or nape" },
      runny_nose: { name: "Runny / Stuffy Nose", desc: "Nasal congestion or rhinorrhea" },
      dizziness: { name: "Dizziness / Vertigo", desc: "Unsteady balance, lightheadedness" },
      muscle_pain: { name: "Muscle / Joint Ache", desc: "Generalized body soreness, limb pain" },
      insomnia: { name: "Insomnia / Restlessness", desc: "Difficulty falling or staying asleep" },
      nausea: { name: "Nausea / Vomiting", desc: "Upset stomach, intense nausea or vomiting" },
      stomach_pain: { name: "Severe Abdominal Pain", desc: "Sharp abdominal cramps, rigid abdomen" },
      chest_pain: { name: "Chest Pain / Tightness", desc: "Severe chest squeezing radiating to arm (Urgent)" },
      dyspnea: { name: "Acute Dyspnea / Shortness of Breath", desc: "Rapid gasp, wheezing, oxygen lack at rest (Urgent)" }
    }
  },

  ko: {
    langName: "한국어",
    appTitle: "HealthPulse AI",
    appDesc: "개인 건강 모니터링 및 AI 조기 경보",
    btnElderly: "큰 글자",
    btnDarkMode: "테마",
    btnSOS: "긴급 115 / 119",

    // Bottom Navigation
    navOverview: "개요",
    navCheckin: "측정 기록",
    navDetail: "상세 분석",
    navTrends: "추세 기록",
    navReport: "보고서",

    // Home / Overview
    heroTitle: "현재 건강 상태",
    heroScoreMax: "/ 100 점",
    heroStatusSafe: "안정 상태",
    heroStatusWarning: "주의 관찰",
    heroStatusDanger: "위험 상태",
    btnVoice: "AI 음성 안내 듣기",
    btnVoiceStop: "음성 재생 중지",
    lblVoiceSelect: "음성 선택:",
    voiceFemale: "선희 (자연스러운 여성 AI)",
    voiceMale: "인준 (신뢰할 수 있는 남성 AI)",
    voiceGoogle: "Google AI (자연스러운 음성)",
    tempLabel: "체온",
    spo2Label: "산소포화도 SpO2",
    heartRateLabel: "심박수",
    bpLabel: "혈압",
    statNotMeasured: "미측정",
    statSafe: "정상 안정",
    statWarning: "주의 요망",
    statDanger: "이상 징후",
    statFeverHigh: "고열",
    statFeverMild: "미열",
    statHypoxia: "저산소증",
    statHRFast: "빠름 (빈맥)",
    statHRSlow: "느림 (서맥)",
    statBPHigh: "고혈압",
    statBPLow: "저혈압",
    ptsSuffix: "점",
    smsCopiedAlert: "GPS 좌표가 포함된 긴급 SOS 메시지가 클립보드에 복사되었습니다!",
    disclaimerText: "본 보고서는 HealthPulse AI 소프트웨어에 의해 자동 생성되었으며 참고 및 조기 경보 목적으로만 제공됩니다. 전문의의 공식적인 임상 진단을 대신할 수 없습니다.",
    homeSymptomsTitle: "기록된 증상 목록",
    editArrow: "수정 →",
    homeNoSymptoms: "기록된 증상이 없습니다. '측정 기록'을 눌러 검사를 시작하세요.",
    homeAdviceTitle: "AI 맞춤 임상 권고사항",
    adviceLabel: "임상 권고:",
    scheduleLabel: "모니터링 계획:",
    btnLogToday: "오늘의 건강 지표 기록하기",

    // Checkin / Measurements
    checkinTitle: "건강 지표 측정 및 기록",
    patientCardTitle: "환자 / 측정자 프로필",
    patientIdLabel: "코드:",
    lblFullName: "성명",
    lblAge: "나이",
    lblGender: "성별",
    genderMale: "남성",
    genderFemale: "여성",
    genderOther: "기타",
    btnEditPatient: "수정",
    btnDoneEdit: "완료",

    // Vitals Section
    vitalsSecTitle: "활력 징후 패널 (Vitals)",
    vitalsSecHint: "+ / − 버튼을 누르거나 측정값을 입력하세요",
    tempHint: "정상 범위: 36.5 – 37.4 °C",
    spo2Hint: "93% 미만 시 즉시 응급 조치",
    hrHint: "정상 범위: 60 – 99 BPM",
    bpHint: "정상 범위: 120 / 80 mmHg",
    btnTapPulse: "15초 수동 맥박 측정",
    tapModalTitle: "15초 손목 맥박 측정 (수동 심박수)",
    tapModalDesc: "손목 맥박에 손가락을 대고 박동에 맞춰 빨간 버튼을 탭하세요. 15초 카운트다운 후 심박수가 자동으로 계산됩니다.",
    tapStatusReady: "빨간 버튼을 눌러 15초 측정을 시작하세요",
    tapStatusRunning: "15초 카운트다운 진행 중… 맥박 박동에 맞춰 탭하세요!",
    tapStatusDone: "측정 완료! 심박수가 자동으로 저장되었습니다.",
    tapTimeLabel: "남은 시간",
    tapBeatsLabel: "감지 횟수",
    tapBeatsUnit: "회",
    tapEstLabel: "예상 BPM",
    tapBpmUnit: "BPM",
    tapFormulaText: "15초간 감지 횟수 × 4",
    tapAutoSavedNotice: "✓ 심박수 기록에 자동 적용되었습니다",
    tapBtnReset: "초기화",
    tapBtnRetest: "다시 측정 (15초)",
    tapBtnClose: "적용 및 닫기",
    tapModalResult: "맥박에 맞춰 탭하세요…",
    tapModalClose: "적용 및 닫기",
    tapNoBeatsNotice: "감지된 박동이 없습니다. '다시 측정'을 누른 후 박동에 맞춰 탭하세요.",

    // Estimator & Manual Guide
    modeNoDeviceTitle: "측정 기기 없음? AI 임상 추정 및 수동 측정 가이드 켜기",
    modeNoDeviceSub: "증상 추정 및 손목 맥박 측정 가이드 포함",
    pulseGuideTitle: "손목 맥박 측정 가이드 (요골동맥 측정법)",
    pulseGuideSub: "측정기나 스마트워치 없이 손목 맥박을 정확하게 측정하는 의료 표준 방법",
    pulseGuideStep1: "엄지손가락 뿌리 바로 아래 손목 안쪽에 검지와 중지 두 손가락을 가볍게 올립니다.",
    pulseGuideStep2: "규칙적인 맥박 박동이 느껴질 때까지 살짝 누릅니다 (엄지손가락은 자체 맥박이 있으므로 사용 금지).",
    pulseGuideStep3: "15초 동안 맥박 수를 센 뒤 4를 곱하거나(예: 18회 × 4 = 72 BPM), 60초 동안 전체 박동을 셉니다.",
    pulseGuideStep4: "또는 아래 버튼을 눌러 맥박에 맞춰 화면을 탭하면 AI가 자동으로 BPM을 계산합니다:",
    pulseGuideBtn: "맥박 탭 측정 도구 열기 (Tap-Tempo)",
    pulseGuideNormal: "성인 정상 안정 시 맥박 기준: 60 – 99 BPM.",
    estQ1: "1. 현재 체온 느낌이 어떠신가요?",
    estTemp1: "정상, 열감 없음",
    estTemp2: "약간의 미열, 피로감",
    estTemp3: "고열, 오한, 식은땀 발생",
    estQ2: "2. 현재 호흡 상태는 어떠신가요?",
    estBreath1: "고르고 편안한 호흡",
    estBreath2: "계단 이용 또는 가벼운 활동 시 숨참",
    estBreath3: "가만히 앉아 있어도 심한 호흡 곤란 (급성)",

    // Symptoms Section
    symptomsSecTitle: "임상 증상 선택",
    symptomsSecHint: "현재 나타나는 증상을 모두 선택하세요",
    symptomsGroupRed: "긴급 경보 증상 (Red Flags)",
    symptomsGroupCommon: "일반 증상",
    durationTitle: "증상 지속 기간",
    daysSuffix: "일",
    btnAnalyze: "건강 분석 및 진단 실행",

    // Analysis Detail
    detailTitle: "논리적 추론 세부정보",
    step1Title: "1단계: 활력 징후 점수 (S_vital)",
    step2Title: "2단계: 시간 지속 계수 (D)",
    step3Title: "3단계: 가중 증상 점수 (∑Wi × D)",
    step4Title: "4단계: 종합 임상 위험도 점수 S",

    // Trends
    trendsTitle: "추세 및 기록",
    chartTitle: "7일 활력 징후 추세 그래프",
    historyTitle: "최근 측정 기록",
    btnClearHistory: "기록 지우기",
    noHistoryYet: "기록된 데이터가 없습니다.",

    // Report
    reportPageTitle: "의료 보고서",
    btnPrintReport: "인쇄 / PDF 저장",
    reportMainTitle: "HealthPulse AI – 개인 건강 모니터링 및 조기 경보 플랫폼",
    reportSubTitle: "자동화된 임상 활력 징후 위험 분석 엔진",
    reportStdBadge: "표준 의료 인쇄본",
    repSec1: "1. 보고서 정보:",
    repId: "ID:",
    repTime: "발행 일시:",
    repSec2: "2. 환자 정보:",
    repName: "성명:",
    repAge: "나이:",
    repGender: "성별:",
    repInputStatus: "데이터 입력 상태:",
    statusDevice: "의료 기기로 측정한 완전한 활력 징후",
    statusEstimated: "AI 임상 증상 추정 모드 (산소포화도계 미사용)",
    repSec3: "3. 위험도 평가 결과:",
    repScore: "종합 위험 지수 (S):",
    repLevel: "위험 등급 분류:",
    repAIReview: "AI 임상 종합 평가:",
    repSec4: "4. 입력 데이터 상세:",
    repVitalsTableTitle: "활력 징후 측정표 (Vitals):",
    colMetric: "측정 지표",
    colValue: "기록 수치",
    colNormal: "표준 기준 범위",
    colStatus: "임상 상태 평가",
    repSymptomsListTitle: "기록된 임상 증상 목록:",
    repSymptomsSelected: "선택된 증상:",
    repSymptomsNone: "기록된 이상 증상 없음",
    repDuration: "증상 지속 시간:",
    repSec5: "5. 권고 및 조치 방안 (Actionable Recommendations):",
    repHomeCare: "자가 간호 지침:",
    repHospitalWarn: "병원 이송 경고:",
    hospWarnRed: "즉시 의료기관을 방문하거나 응급구조 115에 연락하십시오. 환자를 반쯤 앉은 자세로 유지하고 환기를 확보하며 보호자가 곁을 지키도록 하십시오.",
    hospWarnYellow: "활력징후 변화를 면밀히 모니터링하십시오. SpO2가 93% 미만으로 떨어지거나 호흡곤란 악화, 지속적인 고열(>38.5°C), 의식 저하 또는 경련 시 즉시 병원으로 이송하십시오.",
    hospWarnGreen: "현재 응급 입원 지침은 없습니다. 아침과 저녁으로 정기적인 모니터링을 지속하십시오.",
    repSec6: "6. 의료 면책 조항:",
    repDisclaimer: "본 보고서는 HealthPulse AI 소프트웨어에 의해 자동 생성되었으며 참고 및 조기 경보 목적으로만 제공됩니다. 전문의의 공식적인 임상 진단을 대신할 수 없습니다.",
    repSignSystem: "HealthPulse AI 시스템",
    repSignPatient: "건강 측정자",

    // SOS Modal
    sosTitle: "응급 구조 요청 (115 / 119)",
    sosCallBtn: "즉시 115 연결",
    sosRelativeBtn: "보호자 전화 연결",
    sosSmsBtn: "위치 포함 긴급 문자 발송",
    sosGuideTitle: "응급 처치 가이드:",
    sosGuideContent: "환자를 반쯤 앉은 자세로 유지하고, 옷을 느슨하게 풀어주며, 환기를 시키고 응급 요원과 통화를 지속하세요.",
    btnClose: "닫기",

    // Symptoms Catalog
    symptoms: {
      cough: { name: "기침 / 인후통", desc: "마른 기침 또는 가래, 목 통증" },
      fatigue: { name: "피로 / 쇠약감", desc: "무기력함, 기운 없음, 탈진" },
      headache: { name: "두통 / 머리 무거움", desc: "이마나 뒷머리의 둔한 통증" },
      runny_nose: { name: "콧물 / 코막힘", desc: "맑은 콧물, 비강 충혈 및 폐색" },
      dizziness: { name: "어지럼증 / 현기증", desc: "비틀거림, 시야 회전, 균형 상실" },
      muscle_pain: { name: "근육통 / 관절통", desc: "전신 근육 쑤심, 사지 통증" },
      insomnia: { name: "불면 / 수면 장애", desc: "입면 곤란, 잦은 야간 각성" },
      nausea: { name: "메스꺼움 / 구토", desc: "속쓰림 및 심한 구역감 또는 구토" },
      stomach_pain: { name: "심한 복통", desc: "경련성 복부 통증, 복부 경직" },
      chest_pain: { name: "흉통 / 가슴 쥐어짜임", desc: "가슴 압박감 및 팔 방사통 (긴급)" },
      dyspnea: { name: "급성 호흡곤란 / 숨가쁨", desc: "안정 시에도 헐떡임, 산소 부족 (긴급)" }
    }
  },

  zh: {
    langName: "中文",
    appTitle: "HealthPulse AI",
    appDesc: "临床健康监测与AI风险预警",
    btnElderly: "大字体",
    btnDarkMode: "界面主题",
    btnSOS: "紧急 115",

    // Bottom Navigation
    navOverview: "概览",
    navCheckin: "测量记录",
    navDetail: "分析详情",
    navTrends: "健康趋势",
    navReport: "医疗报告",

    // Home / Overview
    heroTitle: "当前健康状态",
    heroScoreMax: "/ 100 分",
    heroStatusSafe: "状态稳定",
    heroStatusWarning: "需要关注",
    heroStatusDanger: "危急状态",
    btnVoice: "播放AI语音解读",
    btnVoiceStop: "停止播放语音",
    lblVoiceSelect: "播报音色:",
    voiceFemale: "晓晓 (温和亲切女声 AI)",
    voiceMale: "云希 (沉稳专业男声 AI)",
    voiceGoogle: "Google AI (自然音色)",
    tempLabel: "体温",
    spo2Label: "血氧饱和度",
    heartRateLabel: "心率",
    bpLabel: "血压",
    statNotMeasured: "未测量",
    statSafe: "健康稳定",
    statWarning: "需要关注",
    statDanger: "异常预警",
    statFeverHigh: "高热",
    statFeverMild: "微热",
    statHypoxia: "缺氧预警",
    statHRFast: "过快 (心动过速)",
    statHRSlow: "过慢 (心动过缓)",
    statBPHigh: "高血压",
    statBPLow: "低血压",
    ptsSuffix: "分",
    smsCopiedAlert: "附带GPS定位的紧急求救短信已复制到剪贴板！",
    disclaimerText: "本报告由 HealthPulse AI 智能软件自动生成，仅供参考和早期预警，不能替代专业执业医师的正式临床诊断。",
    homeSymptomsTitle: "已登记症状",
    editArrow: "编辑 →",
    homeNoSymptoms: "暂无记录症状。点击'测量记录'开始健康检测。",
    homeAdviceTitle: "来自 HealthPulse AI 的建议",
    adviceLabel: "临床处置建议:",
    scheduleLabel: "随访监测计划:",
    btnLogToday: "记录今日健康体征",

    // Checkin / Measurements
    checkinTitle: "录入健康监测指标",
    patientCardTitle: "测量人 / 患者信息",
    patientIdLabel: "编号:",
    lblFullName: "姓名",
    lblAge: "年龄",
    lblGender: "性别",
    genderMale: "男",
    genderFemale: "女",
    genderOther: "其他",
    btnEditPatient: "修改",
    btnDoneEdit: "完成",

    // Vitals Section
    vitalsSecTitle: "生命体征监测面板 (Vitals)",
    vitalsSecHint: "点击 + / − 或直接输入仪器测量数值",
    tempHint: "正常范围：36.5 – 37.4 °C",
    spo2Hint: "低于 93% 需立即紧急处置",
    hrHint: "正常范围：60 – 99 BPM",
    bpHint: "正常范围：120 / 80 mmHg",
    btnTapPulse: "15秒手动测脉搏",
    tapModalTitle: "15秒手腕脉搏测量 (手动心率计算)",
    tapModalDesc: "请将手指搭在手腕脉搏处，跟随心跳节奏点击红色按钮。15秒倒计时结束后将自动计算并保存心率数值。",
    tapStatusReady: "点击红色按钮开始15秒倒计时",
    tapStatusRunning: "正在倒计时15秒… 请跟随心跳节奏点击！",
    tapStatusDone: "测量完成！心率数据已自动保存。",
    tapTimeLabel: "倒计时",
    tapBeatsLabel: "记录心跳",
    tapBeatsUnit: "次",
    tapEstLabel: "实时预估",
    tapBpmUnit: "BPM",
    tapFormulaText: "15秒心跳数 × 4",
    tapAutoSavedNotice: "✓ 已自动保存至心率监测指标",
    tapBtnReset: "重置",
    tapBtnRetest: "重新测量 (15秒)",
    tapBtnClose: "应用并关闭",
    tapModalResult: "请跟随脉搏节奏点击…",
    tapModalClose: "应用并关闭",
    tapNoBeatsNotice: "未检测到有效心跳。请点击'重新测量'并在感到搏动时点击按钮。",

    // Estimator & Manual Guide
    modeNoDeviceTitle: "没有测量仪器？开启AI临床估算与手动测量指南",
    modeNoDeviceSub: "包含临床症状推算与手腕脉搏简易测量指南",
    pulseGuideTitle: "手腕桡动脉脉搏测量指南（无仪器测心率）",
    pulseGuideSub: "无需智能手表或专业医疗仪器，居家精准测量心率的标准手法",
    pulseGuideStep1: "将食指和中指指腹并拢，平放于大拇指根部下方的手腕内侧桡动脉处。",
    pulseGuideStep2: "适度施加压力，直到清晰感受到规律有力的脉搏搏动（请勿使用自带动脉搏动的大拇指）。",
    pulseGuideStep3: "记录15秒内的脉搏跳动次数并乘以4（例如：18次 × 4 = 72 BPM），或直接测满60秒。",
    pulseGuideStep4: "或点击下方快捷按钮跟随手腕脉搏节奏点击屏幕，AI将全自动精准换算BPM：",
    pulseGuideBtn: "打开节拍测心率工具 (Tap-Tempo)",
    pulseGuideNormal: "成年人安静状态下正常心率参考值：60 – 99 BPM。",
    estQ1: "1. 您的体温感觉如何？",
    estTemp1: "正常，无发热感觉",
    estTemp2: "微热，轻度乏力",
    estTemp3: "发烫灼热，畏寒发抖，出虚汗",
    estQ2: "2. 您的呼吸状态如何？",
    estBreath1: "平稳通畅，呼吸均匀",
    estBreath2: "爬楼梯或活动后明显气促气短",
    estBreath3: "静坐时依然严重呼吸困难 (急性)",

    // Symptoms Section
    symptomsSecTitle: "临床症状登记",
    symptomsSecHint: "请点击选择您目前出现的症状（多选）",
    symptomsGroupRed: "危急预警症状 (Red Flags)",
    symptomsGroupCommon: "常见不适症状",
    durationTitle: "症状持续天数",
    daysSuffix: "天",
    btnAnalyze: "执行数据分析与AI诊断",

    // Analysis Detail
    detailTitle: "逻辑推理分析过程",
    step1Title: "第1步：生命体征风险评分 (S_vital)",
    step2Title: "第2步：病程时间累积系数 (D)",
    step3Title: "第3步：症状加权总分 (∑Wi × D)",
    step4Title: "第4步：综合临床风险指数 S",

    // Trends
    trendsTitle: "健康趋势与记录",
    chartTitle: "7天体征动态趋势图",
    historyTitle: "近期测量记录清单",
    btnClearHistory: "清空历史记录",
    noHistoryYet: "暂无历史记录。",

    // Report
    reportPageTitle: "医疗健康报告",
    btnPrintReport: "打印 / 保存为PDF",
    reportMainTitle: "HealthPulse AI – 个人健康监测与早期预警平台",
    reportSubTitle: "全自动临床生命体征风险分析系统",
    reportStdBadge: "标准临床打印文本",
    repSec1: "1. 报告基本信息:",
    repId: "编号:",
    repTime: "报告出具时间:",
    repSec2: "2. 患者基本信息:",
    repName: "姓名:",
    repAge: "年龄:",
    repGender: "性别:",
    repInputStatus: "数据录入状态:",
    statusDevice: "使用医疗监测设备获取完整生命体征",
    statusEstimated: "AI临床症状推算模式（未配备血氧仪）",
    repSec3: "3. 风险评估结果:",
    repScore: "综合风险指数 (S):",
    repLevel: "健康风险分级:",
    repAIReview: "AI临床综合评估:",
    repSec4: "4. 录入数据详情:",
    repVitalsTableTitle: "生命体征监测表 (Vitals):",
    colMetric: "监测指标",
    colValue: "记录数值",
    colNormal: "生理标准范围",
    colStatus: "临床状态评估",
    repSymptomsListTitle: "已记录临床症状清单:",
    repSymptomsSelected: "所选症状:",
    repSymptomsNone: "未记录到异常症状",
    repDuration: "症状持续时间:",
    repSec5: "5. 建议与处置方案 (Actionable Recommendations):",
    repHomeCare: "居家护理指导建议:",
    repHospitalWarn: "转院就医紧急预警:",
    hospWarnRed: "请立即前往医疗机构或拨打急救电话。让患者保持半卧位，确保空气流通，并由家属在旁陪护。",
    hospWarnYellow: "需密切监测生命体征。若SpO2降至93%以下、呼吸困难加剧、持续高热不退（>38.5°C）、嗜睡或抽搐，请立即送医。",
    hospWarnGreen: "目前无需紧急送医。请继续在早晚进行常规监测。",
    repSec6: "6. 医疗免责声明:",
    repDisclaimer: "本报告由 HealthPulse AI 智能软件自动生成，仅供参考和早期预警，不能替代专业执业医师的正式临床诊断。",
    repSignSystem: "HealthPulse AI 智能系统",
    repSignPatient: "健康监测人",

    // SOS Modal
    sosTitle: "紧急呼救调度 (115 / 120)",
    sosCallBtn: "立即拨打 115 / 120",
    sosRelativeBtn: "致电紧急联系人",
    sosSmsBtn: "发送附带GPS位置的求救短信",
    sosGuideTitle: "应急急救指南:",
    sosGuideContent: "请协助患者保持半卧半坐姿势，解开衣领纽扣保持呼吸顺畅，开窗通风，并与急救调度人员保持通话。",
    btnClose: "关闭",

    // Symptoms Catalog
    symptoms: {
      cough: { name: "咳嗽 / 咽痛", desc: "干咳或伴有咳痰，喉咙刺痛" },
      fatigue: { name: "疲乏无力 / 虚弱", desc: "精神萎靡，四肢乏力，不愿活动" },
      headache: { name: "头痛 / 头部沉重", desc: "额部或枕后隐痛、紧箍感" },
      runny_nose: { name: "流涕 / 鼻塞", desc: "流清鼻涕，鼻腔充血不通畅" },
      dizziness: { name: "头晕 / 眩晕", desc: "站立不稳，视物旋转，头昏脑胀" },
      muscle_pain: { name: "肌肉关节酸痛", desc: "全身肌肉酸楚，四肢酸痛" },
      insomnia: { name: "失眠 / 烦躁难眠", desc: "难以入睡，夜间频繁惊醒" },
      nausea: { name: "恶心 / 呕吐", desc: "胃部不适反酸，剧烈反胃或呕吐" },
      stomach_pain: { name: "剧烈腹痛", desc: "阵发性腹部绞痛，腹肌紧张" },
      chest_pain: { name: "胸痛 / 心前区压榨感", desc: "胸骨后压榨性闷痛向手臂放射（紧急）" },
      dyspnea: { name: "急性呼吸困难 / 极度气促", desc: "喘息气急，静息状态下严重缺氧（紧急）" }
    }
  }
};

let currentLang = 'vi';

function getTranslation(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.vi[key] || key);
}

function getSymptomTranslation(id) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
  if (dict.symptoms && dict.symptoms[id]) {
    return dict.symptoms[id];
  }
  return TRANSLATIONS.vi.symptoms[id] || { name: id, desc: '' };
}

const FLAG_SVGS = {
  vi: `<svg class="flag-svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="#da251d" rx="2"/><polygon points="15,4 16.5,8.8 21.6,8.8 17.5,11.8 19.1,16.6 15,13.6 10.9,16.6 12.5,11.8 8.4,8.8 13.5,8.8" fill="#ff0"/></svg>`,
  en: `<svg class="flag-svg" viewBox="0 0 30 20"><clipPath id="uk-flag-act"><rect width="30" height="20" rx="2"/></clipPath><g clip-path="url(#uk-flag-act)"><rect width="30" height="20" fill="#012169"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" stroke-width="3.5"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#c8102e" stroke-width="2"/><path d="M15,0 v20 M0,10 h30" stroke="#fff" stroke-width="6"/><path d="M15,0 v20 M0,10 h30" stroke="#c8102e" stroke-width="3.5"/></g></svg>`,
  ko: `<svg class="flag-svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff" rx="2"/><circle cx="15" cy="10" r="4.5" fill="#cd2e3a"/><path d="M 10.5 10 A 4.5 4.5 0 0 0 19.5 10 A 2.25 2.25 0 0 0 15 10 A 2.25 2.25 0 0 1 10.5 10 Z" fill="#0047a0"/><path d="M5.5 6.5l2 1.5M5 7.5l2 1.5M6 5.5l2 1.5M22.5 12l2 1.5M23 11l2 1.5M24 10l2 1.5" stroke="#000" stroke-width="0.8"/></svg>`,
  zh: `<svg class="flag-svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="#de2910" rx="2"/><polygon points="5,3 5.9,5.8 8.9,5.8 6.5,7.6 7.4,10.4 5,8.6 2.6,10.4 3.5,7.6 1.1,5.8 4.1,5.8" fill="#ffde00"/><circle cx="10" cy="3" r="0.8" fill="#ffde00"/><circle cx="12" cy="5" r="0.8" fill="#ffde00"/><circle cx="12" cy="8" r="0.8" fill="#ffde00"/><circle cx="10" cy="10" r="0.8" fill="#ffde00"/></svg>`
};

const LANG_DISPLAY_NAMES = {
  vi: 'Tiếng Việt',
  en: 'English',
  ko: '한국어',
  zh: '中文'
};

function updateVoiceSelectOptions() {
  const sel = document.getElementById('voiceSelect');
  if (!sel) return;
  const currentVal = sel.value || 'female';
  
  const optionsMap = {
    vi: [
      { val: 'female', label: 'Hoài My (Nữ truyền cảm - AI)' },
      { val: 'male', label: 'Nam Minh (Nam trầm ấm - Bác sĩ AI)' },
      { val: 'google', label: 'Google AI (Tự nhiên)' }
    ],
    en: [
      { val: 'female', label: 'Jenny (Natural Female AI)' },
      { val: 'male', label: 'Guy (Calm Male Doctor AI)' },
      { val: 'google', label: 'Google AI (Natural)' }
    ],
    ko: [
      { val: 'female', label: '선희 (자연스러운 여성 AI)' },
      { val: 'male', label: '인준 (신뢰할 수 있는 남성 AI)' },
      { val: 'google', label: 'Google AI (자연스러운 음성)' }
    ],
    zh: [
      { val: 'female', label: '晓晓 (温和亲切女声 AI)' },
      { val: 'male', label: '云希 (沉稳专业男声 AI)' },
      { val: 'google', label: 'Google AI (自然音色)' }
    ]
  };

  const list = optionsMap[currentLang] || optionsMap.vi;
  sel.innerHTML = list.map(opt => `<option value="${opt.val}" ${opt.val === currentVal ? 'selected' : ''}>${opt.label}</option>`).join('');
}

function applyLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = 'vi';
  currentLang = lang;
  if (typeof stopVoice === 'function') stopVoice();
  try { localStorage.setItem('hp_lang', lang); } catch(e) {}
  document.documentElement.lang = lang;

  // Cập nhật nút bấm cờ ngôn ngữ trên Header
  const flagEl = document.getElementById('activeFlagIcon');
  const nameEl = document.getElementById('activeLangName');
  if (flagEl && FLAG_SVGS[lang]) flagEl.innerHTML = FLAG_SVGS[lang];
  if (nameEl && LANG_DISPLAY_NAMES[lang]) nameEl.textContent = LANG_DISPLAY_NAMES[lang];

  // Cập nhật trạng thái active & dấu tích trong menu chọn cờ
  document.querySelectorAll('.lang-opt-btn').forEach(btn => {
    const isAct = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('active', isAct);
    const check = btn.querySelector('.lang-check-icon');
    if (check) check.style.display = isAct ? 'inline' : 'none';
  });

  // Cập nhật select ẩn nếu có
  const sel = document.getElementById('langSelect');
  if (sel && sel.value !== lang) sel.value = lang;

  // Cập nhật tất cả các phần tử [data-i18n]
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = getTranslation(key);
    if (val !== undefined) {
      if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
        el.setAttribute('placeholder', val);
      } else {
        el.textContent = val;
      }
    }
  });

  // Cập nhật tên các giọng đọc trong menu chọn giọng đọc theo ngôn ngữ mới
  updateVoiceSelectOptions();

  // Re-render dynamic components
  if (typeof buildSymptoms === 'function') buildSymptoms();
  if (typeof syncDisplays === 'function') syncDisplays();
  if (typeof analyze === 'function') analyze();
  if (typeof renderReport === 'function') renderReport();
  if (typeof PulseMeter !== 'undefined' && PulseMeter.state !== 'running') {
    PulseMeter.renderUI(PulseMeter.tapCount * 4);
  }
}

function toggleLangMenu() {
  const popover = document.getElementById('langMenuPopover');
  const trigger = document.getElementById('btnLangTrigger');
  if (!popover) return;
  const isShow = popover.classList.contains('show');
  if (isShow) {
    popover.classList.remove('show');
    if (trigger) {
      trigger.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  } else {
    popover.classList.add('show');
    if (trigger) {
      trigger.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  }
}

function selectLanguage(lang) {
  applyLanguage(lang);
  const popover = document.getElementById('langMenuPopover');
  const trigger = document.getElementById('btnLangTrigger');
  if (popover) popover.classList.remove('show');
  if (trigger) {
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
}

function changeLanguage(lang) {
  applyLanguage(lang);
}

// Đóng menu chọn cờ ngôn ngữ khi nhấp chuột ra ngoài
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const container = document.getElementById('langDropdownContainer');
    if (container && !container.contains(e.target)) {
      const popover = document.getElementById('langMenuPopover');
      const trigger = document.getElementById('btnLangTrigger');
      if (popover) popover.classList.remove('show');
      if (trigger) {
        trigger.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

// Export for browser and node
if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
  window.currentLang = currentLang;
  window.getTranslation = getTranslation;
  window.getSymptomTranslation = getSymptomTranslation;
  window.applyLanguage = applyLanguage;
  window.changeLanguage = changeLanguage;
  window.toggleLangMenu = toggleLangMenu;
  window.selectLanguage = selectLanguage;
  window.updateVoiceSelectOptions = updateVoiceSelectOptions;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRANSLATIONS, getTranslation, getSymptomTranslation };
}
