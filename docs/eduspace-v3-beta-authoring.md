# Hướng Dẫn Soạn Thảo Đề Thi V3 & Công Cụ Trợ Lý Soạn Đề (EduSpace V3 Beta)

Tài liệu hướng dẫn nghiệp vụ và kỹ thuật dành cho giáo viên và quản trị viên sử dụng hệ thống soạn đề trực quan **EduSpace Visual Exam Builder V3** (`/eduspace/v3/author/`).

---

## 1. Mục tiêu & Nguyên tắc Cốt lõi

1. **Giao diện trực quan 100%:** Giáo viên cấu hình ma trận đề, nhập câu hỏi, chèn hình ảnh, file nghe, công thức toán học và thiết lập nhóm câu hỏi tự chọn trực tiếp trên giao diện — **hoàn toàn không cần chỉnh sửa JSON hay code**.
2. **Hỗ trợ định dạng đề thi chuẩn GDPT 2018:**
   - Trắc nghiệm nhiều lựa chọn (4 phương án A, B, C, D).
   - Trắc nghiệm Đúng / Sai 4 ý (thang điểm lũy tiến 0.1 - 0.25 - 0.5 - 1.0).
   - Trả lời ngắn / Điền kết quả số học.
   - Tự luận (chấm thủ công theo rubric).
   - Câu hỏi nhiều ý thành phần (1a, 1b...) kèm điểm số phân bổ chi tiết cho từng ý.
3. **Cân đối điểm số thời gian thực (Live Point Balance):**
   - Tự động tính toán điểm hiệu dụng (Effective Total Points) theo công thức nhóm tự chọn: `Tổng = Câu bắt buộc + (Số câu chọn / Tổng số câu) * Điểm nhóm`.
   - Cảnh báo trực quan màu hổ phách khi tổng điểm chưa khớp với điểm tối đa của đề (ví dụ 10 điểm), chuyển xanh lá khi điểm số hoàn toàn cân đối.
4. **Quy chuẩn Trợ lý AI (Strict 0% AI in Exam Execution):**
   - **AI CHỈ ĐÓNG VAI TRÒ TRỢ LÝ SOẠN THẢO CHO GIÁO VIÊN:** Hỗ trợ gợi ý đề tài, tạo câu hỏi nháp, phương án nhiễu và lời giải theo ma trận năng lực GDPT 2018.
   - **Tất cả nội dung do AI gợi ý bắt buộc phải qua giáo viên xem xét, chỉnh sửa và bấm chèn vào đề.**
   - **TUYỆT ĐỐI 0% AI TRONG KHI HỌC SINH THI:** Quá trình làm bài, tính giờ và chấm điểm tự động diễn ra 100% tất định (deterministic), không phụ thuộc vào bất kỳ mô hình AI nào.

---

## 2. Các Phân Hệ Soạn Đề (4 Tab Chức năng)

### Tab 1: Soạn Thảo Câu Hỏi (Questions)
- Danh sách câu hỏi phân chia theo từng phần thi (`Phần I`, `Phần II`, `Phần III`...).
- Chọn dạng câu hỏi: Trắc nghiệm, Đúng/Sai 4 ý, Trả lời ngắn, Kết quả số, Tự luận.
- Thiết lập mức độ nhận thức: **Nhận biết**, **Thông hiểu**, **Vận dụng**, **Vận dụng cao**.
- Gán điểm số cho từng câu hoặc ý nhỏ thành phần.
- Chèn khối nội dung đa phương tiện (`ContentBlock`): Văn bản Markdown, Hình ảnh, Âm thanh / Bài nghe Audio, Bảng biểu, Công thức KaTeX, Trích dẫn văn học.
- Gán câu hỏi vào **Ngữ liệu chung** (đoạn văn đọc hiểu, bài nghe) hoặc **Nhóm câu hỏi tự chọn**.
- Nhân bản nhanh câu hỏi hoặc xóa câu hỏi thừa.

### Tab 2: Ngữ liệu chung (Source Sets)
- Dành cho các bài thi Tiếng Anh (Reading Passage, Listening Audio) và Ngữ Văn (Văn bản trích dẫn nghị luận, thơ ca).
- Cho phép tạo các khối ngữ liệu chung có tiêu đề, nội dung văn bản dài, file âm thanh nghe trực tiếp.
- Các câu hỏi thuộc ngữ liệu này sẽ tự động liên kết và hiển thị song song (chia đôi màn hình hoặc collapsible viewer) trong lúc thí sinh làm bài.

### Tab 3: Nhóm Câu Hỏi Tự Chọn (Choice Groups)
- Dành cho đề thi có phần tự chọn (ví dụ: Chọn làm 2 trong 3 câu bài tập; hoặc Thí sinh chọn làm Câu 7A hoặc 7B).
- Cấu hình:
  - Tên nhóm tự chọn (ví dụ: *Chủ đề Chuyên đề Tự chọn*).
  - Số câu bắt buộc phải chọn (`requiredCount`, ví dụ: làm 2 câu).
  - Danh sách câu hỏi ứng viên trong nhóm (`questionIds`).
  - Điểm số nhóm quy đổi.
- **Cơ chế chấm thi an toàn:** Thí sinh chỉ cần hoàn thành đúng số lượng yêu cầu; hệ thống chỉ chấm điểm các câu được chọn, các câu không chọn sẽ có `maxPoints = 0` và **tuyệt đối không bị trừ điểm**.

### Tab 4: Cài Đặt Ma Trận & Thời Gian (Settings)
- Chế độ đề thi:
  - **Làm full đề:** Thí sinh làm tuần tự toàn bộ các câu trong đề.
  - **Theo cấu trúc ma trận:** Bám sát ma trận năng lực và nhóm câu hỏi của cấu trúc đề thi tốt nghiệp / học kỳ.
- Tiêu đề, môn học, khối lớp (Lớp 10, 11, 12).
- Thời gian làm bài (phút), thang điểm tối đa (ví dụ: 10.00 điểm).
- Trạng thái công khai và phân quyền lớp học.

---

## 3. Trợ Lý Soạn Đề AI (AI Authoring Assistant)

1. Nhấp nút **AI Soạn đề** trên thanh công cụ góc phải màn hình soạn thảo.
2. Drawer trượt mở cho phép chọn:
   - Chủ đề cần tạo câu hỏi (ví dụ: *Đạo hàm và đồ thị hàm số bậc ba*, *Mệnh đề quan hệ trong Tiếng Anh 11*...).
   - Mức độ nhận thức (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao).
3. Nhấp **Tạo câu hỏi gợi ý**:
   - Hệ thống gửi yêu cầu đến `POST /api/v3/author/ai-assist`.
   - Kết quả trả về danh sách các câu hỏi nháp gồm: câu hỏi, các phương án nhiễu hợp lý, phương án đúng và giải thích chi tiết.
4. Giáo viên xem xét, tinh chỉnh và nhấp **Chèn câu hỏi này vào đề** để đưa vào đề thi chính thức.

---

## 4. API Endpoints Dành Cho Soạn Đề

| Phương thức | Tuyến đường (Route) | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v3/author/exams` | Giáo viên / Admin | Lưu trữ hoặc cập nhật bản thảo đề thi V3 và toàn bộ câu hỏi |
| `GET` | `/api/v3/author/exams/:id` | Giáo viên / Admin | Tải toàn bộ cấu trúc đề thi kèm đáp án và lời giải để chỉnh sửa |
| `POST` | `/api/v3/author/validate` | Giáo viên / Admin | Kiểm tra tính toàn vẹn, cân đối điểm số và hợp lệ của nhóm tự chọn |
| `POST` | `/api/v3/author/ai-assist` | Giáo viên / Admin | Tạo câu hỏi nháp và gợi ý phương án nhiễu hỗ trợ giáo viên |

---

## 5. Quy Chuẩn Về Nhận Diện & An Toàn Dữ Liệu

- **Bảo toàn RAW NDID:** Biến NDID của giáo viên và học sinh được giữ nguyên chuỗi gốc, không tự động chèn tiền tố `@`.
- **Bảo mật tài khoản Owner:** CodeID `0000` được bảo vệ tuyệt đối, có toàn quyền duyệt và quản lý mọi đề thi trên hệ thống.
- **Cách ly kho đề V2:** Toàn bộ đề soạn mới qua công cụ này được lưu trữ vào bộ sưu tập V3 (`exams` và `questions`), không ghi đè hay làm sai lệch kho đề V2 hiện hành.
