# HealthPulse AI - Hệ Thống Giám Sát, Phân Tích & Cảnh Báo Sớm Bất Ổn Sức Khỏe Cá Nhân

> **Dự án Nghiên cứu Khoa học Kĩ thuật (KHKT)**  
> **Trường:** THPT Phạm Thành Trung  
> **Thí sinh thực hiện:** Nguyễn Hoàng Minh Trọng - Lớp 10A5  
> **Lĩnh vực:** Phần mềm hệ thống  

---

## 🌟 Giới Thiệu Đề Tài
**HealthPulse AI** là ứng dụng y tế thông minh hỗ trợ người dân theo dõi sức khỏe chủ động, ghi chép chỉ số sinh hiệu và triệu chứng hàng ngày, phân tích theo chuỗi thời gian để đưa ra cảnh báo sớm theo **3 cấp độ rủi ro (Xanh - Vàng - Đỏ)**. Đặc biệt, ứng dụng hỗ trợ người thân ở xa có thể theo dõi và phản ứng kịp thời trước các biến chứng nguy hiểm.

---

## 🧮 Thuật Toán & Quy Trình Suy Luận Ma Trận Nguy Cơ

### 1. Công thức tổng quát:
$$S = S_{\text{sinh hiệu}} + \sum_{i=1}^n (W_i \times D)$$

- **$S_{\text{sinh hiệu}}$**: Tổng điểm rủi ro từ các chỉ số đo khách quan:
  - *Thân nhiệt*: $37.5^\circ\text{C} - 38.4^\circ\text{C}$ (+10đ); $38.5^\circ\text{C} - 39.4^\circ\text{C}$ (+20đ); $\ge 39.5^\circ\text{C}$ (+30đ).
  - *SpO2*: $94\% - 95\%$ (+10đ); $<93\%$ (Kích hoạt Cảnh Báo Đỏ Khẩn Cấp).
  - *Nhịp tim*: $100 - 119\text{ BPM}$ (+15đ); $\ge 120\text{ BPM}$ (+25đ).
  - *Huyết áp*: Tiền tăng huyết áp (+10đ); Tăng huyết áp độ 2 (+20đ); Cơn tăng huyết áp (+30đ).
- **$W_i$**: Trọng số mức độ nghiêm trọng của triệu chứng lâm sàng $i$ (Thang điểm 1 - 10).
- **$D$**: Hệ số nhân theo thời gian kéo dài:
  $$D = 1 + (N - 1) \times 0.3 \quad (N \text{ là số ngày})$$

### 2. Cơ chế Ưu Tiên Ngắt Khẩn Cấp (Emergency Override):
Nếu xuất hiện một trong các dấu hiệu cấp tính:
- $\text{SpO2} < 93\%$
- Đau thắt ngực / Co thắt tim
- Khó thở cấp tính / Hụt hơi nặng  
$\implies$ **Hệ thống lập tức bỏ qua điểm tổng và kích hoạt CẢNH BÁO ĐỎ KHẨN CẤP**, phát còi cứu thương và kích hoạt nút gọi Cấp cứu 115.

### 3. Phân cấp 3 mức độ cảnh báo:
- 🟢 **Mức Xanh (An toàn - $S < 12$)**: Sức khỏe ổn định, duy trì sinh hoạt.
- 🟡 **Mức Vàng (Cần chú ý theo dõi - $12 \le S < 35$)**: Dấu hiệu bất ổn nhẹ, khuyến nghị bù nước, nghỉ ngơi và tái khám sau 12h - 24h.
- 🔴 **Mức Đỏ (Nguy hiểm khẩn cấp - $S \ge 35$ hoặc Triệu chứng Đỏ)**: Nguy cơ cao, yêu cầu đến cơ sở y tế ngay.

---

## 🚀 Các Tính Năng Nổi Bật Đã Hiện Thực Hóa

1. **Khối Đầu Vào & Tương Tác Trực Quan:**
   - Hỗ trợ cả 2 chế độ: **Đo chuẩn xác** (có nhiệt kế, máy SpO2) và **Ước lượng lâm sàng** (dành cho người không có thiết bị đo).
   - Bộ thẻ chọn triệu chứng có trọng số $W_i$.
   - Công cụ **Gõ nhịp tim trực tiếp (Tap-Tempo)** trên màn hình để đo mạch cổ tay không cần dụng cụ.
   - **Hộp cảnh báo AI thông minh khi thiếu dữ liệu** (như minh họa tại trang 5 của báo cáo).

2. **Khối Xử Lý & Bóc Tách Quy Trình:**
   - Hiển thị trực quan từng bước tính toán: Bước 1 ($S_{\text{sinh hiệu}}$), Bước 2 ($D$), Bước 3 ($\sum W_i \times D$), Bước 4 ($S$).
   - Vòng đo điểm nguy cơ Gauge và thẻ trạng thái lớn đổi màu theo cấp độ.

3. **Âm Thanh Y Tế Tổng Hợp (Web Audio API):**
   - Tiếng còi cứu thương (Ambulance Siren) khi Mức Đỏ.
   - Tiếng bíp nhắc nhở khi Mức Vàng.
   - Tiếng chimes thư giãn khi Mức Xanh.
   - Tiếng nhịp đập tim thực tế (Lub-Dub) khi chạm đo mạch.

4. **Trình Xuất Báo Cáo Y Tế (Medical Report):**
   - Chuẩn hóa thông tin bệnh nhân, bảng chỉ số sinh hiệu, chẩn đoán nguy cơ và lời khuyên.
   - Hỗ trợ in trực tiếp hoặc lưu ra định dạng PDF chuẩn A4 y khoa.

5. **Chế Độ Người Thân Giám Sát Từ Xa (Family Guardian Mode):**
   - Theo dõi tình trạng sức khỏe của các thành viên trong gia đình theo thời gian thực.

6. **Đa Ngôn Ngữ (Multilingual):**
   - Tiếng Việt, Tiếng Anh (English), Tiếng Hàn (한국어), Tiếng Trung (中文).

7. **Bộ Ca Mẫu Thử Nghiệm Tức Thì:**
   - **Bệnh nhân C (Theo đề tài)**: $S = 31.4$ điểm $\implies$ Mức Vàng (chuẩn 100% theo bài thi).
   - **Bệnh nhân A**: $S = 0$ điểm $\implies$ Mức Xanh.
   - **Bệnh nhân B**: Hạ SpO2 91% + Khó thở $\implies$ Báo động Đỏ.
   - **Bệnh nhân D**: Chế độ ước lượng cảm giác sốt & hụt hơi.

---

## 💻 Hướng Dẫn Chạy & Thuyết Trình

### Khởi chạy máy chủ nội bộ:
```bash
# Di chuyển vào thư mục HealthPulse_AI
cd c:\Users\ad\Documents\HealthPulse_AI

# Khởi chạy bằng Python
python -m http.server 8888
```
Truy cập trình duyệt tại địa chỉ: **[http://localhost:8888](http://localhost:8888)**

---
*Chúc bạn Nguyễn Hoàng Minh Trọng đạt giải cao nhất trong Cuộc thi Khoa học Kĩ thuật!*
