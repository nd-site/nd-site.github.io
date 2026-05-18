---
description: Các quy chuẩn và cấu trúc khi phát triển hệ thống Eduspace Quiz
---

# 📋 Quy chuẩn phát triển Eduspace Quiz

Tài liệu này hướng dẫn các AI Assistant khác về cách duy trì và phát triển hệ thống EduSpace.

## 1. Cấu trúc Project
- **`template.html`**: File giao diện chính. Chứa toàn bộ logic xử lý, CSS và UI. Không được chia nhỏ trừ khi có yêu cầu đặc biệt để đảm bảo tính di động.
- **`data.js`**: File dữ liệu riêng cho từng bộ đề. Chứa `window.quizData`.
- **`nd-navbar.js`**: Script dùng chung cho thanh điều hướng toàn trang.

## 2. Nguyên tắc "Bổ sung không Xóa" (Backward Compatibility)
- **TUYỆT ĐỐI KHÔNG** xóa bỏ các cách đọc hoặc xử lý dữ liệu cũ.
- Khi có yêu cầu mới về logic (ví dụ: cách tính điểm mới), phải viết thêm code xử lý mới và giữ lại fallback cho các bài cũ sử dụng cấu trúc cũ.
- Sử dụng các kiểm tra `if (config.new_feature)` để tách biệt logic.

## 3. Cấu hình Exam Layout (THPT-QG Mode)
Hệ thống hỗ trợ cấu hình linh hoạt trong `data.js` -> `config.examLayout`:
- `count`: Số câu lấy ra từ mỗi loại.
- `pointsPerQ`: Điểm cho mỗi câu (chia đều).
- `totalPoints`: Tổng điểm cho phần đó (tự chia đều dựa trên `count`).
- **`pointsList`**: (Mới) Cho phép chỉ định điểm chính xác cho từng câu dựa trên thứ tự trong `data.js`.
    - Hỗ trợ Index dương: `"0": 0.75` (Câu 1 trong data).
    - Hỗ trợ Index âm: `"-1": 0.5` (Câu cuối cùng trong data).
    - Điểm sẽ được gán cho câu hỏi **trước khi Shuffle**, đảm bảo điểm luôn đi kèm với nội dung câu hỏi đó cho dù vị trí xuất hiện trong đề thi bị thay đổi.

## 4. UI/UX & Thẩm mỹ
- Sử dụng **Tailwind CSS** kết hợp với các class tùy chỉnh (`glass-card`, `pill-shape`, `bg-blob`).
- Ưu tiên sự sang trọng (Premium): dùng gradient nhẹ, bo góc lớn (2xl, 3xl), hiệu ứng kính (backdrop-blur).
- **Responsive**: Phải hoạt động hoàn hảo trên cả Mobile và Desktop.
- Các nút tương tác quan trọng phải có hiệu ứng `hover:scale` hoặc `active:scale`.

## 5. Tính năng Lịch sử (Local History)
- Dữ liệu lịch sử được lưu vào `localStorage` dưới khóa `eduspace_history`.
- Khi hiển thị lại kết quả từ lịch sử (Review), sử dụng hàm `reviewAttempt(h)` để "hijack" màn hình kết quả mà không làm ảnh hưởng đến luồng làm bài hiện tại.

## 6. Lưu ý về AI & Math
- Luôn hỗ trợ **MathJax/KaTeX** và **Marked.js** để hiển thị công thức toán học và Markdown.
- Tích hợp Gemini API để chấm điểm tự luận và giải thích câu hỏi.

## 7. Quy chuẩn đặt tên môn học (Subject Naming)
- **BẮT BUỘC** viết hoa chữ cái đầu của từng từ trong tên môn học để đảm bảo tính nhất quán trên toàn hệ thống (ví dụ: `"Hóa Học"`, `"Vật Lý"`, `"Ngữ Văn"`, `"Địa Lý"`, `"Lịch Sử"`, `"Tin Học"`, `"Công Nghệ"`, `"Tiếng Anh"`, `"Sinh Học"`).
- **TUYỆT ĐỐI KHÔNG** viết thường chữ cái thứ hai trở đi trong cụm từ tên môn học (ví dụ: tránh viết `"Hóa học"`, `"Vật lý"`, `"Địa lý"`, `"Tin học"`, `"Ngữ văn"`, `"Lịch sử"`, `"Sinh học"`, `"Công nghệ"`).
- Quy chuẩn này áp dụng bắt buộc cho tất cả các khai báo thuộc tính `subject` trong `list_data.js`, các tiêu đề `title` trong file `data.js` và tiêu đề trang trong file `index.html` của từng bộ đề thi.

## 8. Quy chuẩn cập nhật phiên bản (Version Control)
- **BẮT BUỘC** cập nhật số phiên bản trong [version.js](file:///d:/WebSite/EduSpace%20-%20%C4%90%E1%BB%95i%20giao%20di%E1%BB%87n%20150526/assets/js/version.js) sau mỗi lần sửa đổi giao diện, thêm, xóa, sửa quy tắc, hoặc thay đổi code của bất kỳ trang/tính năng nào trên hệ thống.
- Định dạng phiên bản bắt buộc: `ver:<năm (2025=0, 2026=1, 2027=2, ...)>.<tháng>.<ngày>.<giờ><phút>`.
    - Ví dụ: Thời gian hiện tại là 18:30 ngày 19/05/2026 -> Version sẽ là `ver:1.5.19.1830`.

---
// turbo-all
