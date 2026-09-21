# ND Labs Core Project Rules

## 1. Phiên Bản
- Khi viết code, sửa code bao gồm tính năng mới, sửa tính năng, ... (nhưng không bao gồm thêm bài kiểm tra mới trong eduspace), bạn phải luôn tự động cập nhật số phiên bản trong `assets/js/version.js`.
- Định dạng phiên bản: `ver:<năm (2025=0, 2026=1)>.<tháng>.<ngày>.<giờ><phút>`
  Ví dụ với ngày 22/07/2026 lúc 23:51 -> `ver:1.7.22.2351`

## 2. QUY CHUẨN XỬ LÝ & HIỂN THỊ NDID (3 NGUYÊN TẮC CỐT LÕI)

### Quy tắc 1: Form Nhập Liệu (Người dùng tự đăng ký / tự sửa)
- Chỉ áp dụng Regex validation `/^[a-zA-Z0-9_.]+$/` TRÊN CÁC FORM mà người dùng tự nhập.
- Tuyệt đối KHÔNG chạy hàm lọc / xóa ký tự (sanitize/strip) đối với biến NDID đã có sẵn trong hệ thống.

### Quy tắc 2: Dữ Liệu Từ Database / Admin (Bảo toàn RAW STRING)
- NDID được lưu trong Database hoặc do Admin sửa CÓ THỂ chứa bất kỳ ký tự đặc biệt nào (bao gồm cả @, #, $, dấu cách...).
- Khi hiển thị NDID từ Database / API ra màn hình: Phải giữ nguyên 100% chuỗi gốc (RAW STRING, ví dụ: `{user.ndid}` hoặc `<span>${ndid}</span>`).
- KHÔNG ĐƯỢC dùng bất kỳ hàm replace, filter, hay regex nào để cắt xén bớt ký tự của NDID khi render UI hoặc đọc dữ liệu.

### Quy tắc 3: Tuyệt Đối Không Tự Chèn Tiền Tố (Prefix "@")
- "Không chèn @" nghĩa là: Không được tự ý nối / cộng thêm ký tự `@` vào ĐẦU chuỗi nếu chuỗi gốc không có.
  - ❌ SAI: Tự cộng `@` vào code: `@${ndid}`, `@${user.name}`, `NDID: @{ndid}`, `chat?@username` (khi NDID là "username")
  - ✅ ĐÚNG: In nguyên bản: `${ndid}`, `${user.name}`, `NDID: {ndid}`, `chat?username`
  - Nếu bản thân chuỗi NDID lưu trong DB đã là "admin@nd" -> hiển thị đúng "admin@nd" (vì đây là ký tự gốc trong DB, không phải tiền tố tự chèn trong code).

## 3. Quy Chuẩn Văn Phong Giao Diện (UI)
- Tuyệt đối KHÔNG bê nguyên văn câu chữ giải thích, ghi chú trong ngoặc đơn của người dùng vào UI (ví dụ: người dùng giải thích `đồng (thỏi trong game)` thì nhãn UI chỉ hiển thị duy nhất là `Đồng`).
- Nhãn trên giao diện phải ngắn gọn, chuẩn thuật ngữ game, không dài dòng.
- Không dùng cụm từ kiểu AI như "hệ sinh thái", "thúc đẩy", "đột phá", "tối ưu hóa", "vượt trội", "hỗ trợ đắc lực", v.v. trong văn bản giao diện.
