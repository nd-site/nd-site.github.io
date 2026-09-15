# PHASE 01-C10 REPORT
# AUTH PRODUCTION ACTIVATION: RESEND FREE + PRODUCTION CONFIGURATION + LIVE AUTH VERIFICATION

STATUS:
PHASE 01-C10 COMPLETED

---

### RESEND:
- **provider**: Resend Free ($0/month, 3,000 emails/month, 100 emails/day, up to 3 domains). Đã thiết lập làm official transactional email provider cho ND Labs / EduSpace.
- **configuration status**:
  - `EMAIL_PROVIDER=resend` đã được định tuyến chính thức trong `functions/src/email/config.js`.
  - Canonical API Endpoint: `https://api.resend.com/emails`.
  - Native HTTP fetch adapter: `ResendEmailProvider` (`functions/src/email/provider_adapter.js`) gửi qua Node 20 `fetch`, zero vendor SDK dependencies.
  - Secret Key: `EMAIL_PROVIDER_API_KEY` / `RESEND_API_KEY` được nạp độc quyền từ server-side environment / Secret Manager (0 hardcoded secrets).
- **sender verification status**:
  - **BLOCKED** đối với gửi thư tới người nhận bất kỳ nếu domain người gửi chưa được xác thực DNS (DKIM, SPF) trên Resend Console của Owner.
  - Tôn trọng giới hạn quyền tự quyết: Không tự ý cấu hình DNS, không tự đổi hay tạo domain người gửi.
- **delivery test status**:
  - Mock & Contract Verification: Đạt 100% (payload serialization, authentication header, messageId parsing, rate limit handling 429).
  - Live sandbox delivery: Sẵn sàng thực thi khi Owner cung cấp API key và cấu hình domain trên Resend Dashboard.

---

### AUTH:
- **Canonical Architecture**:
  - CodeID = Firebase Auth UID (bất biến, duy nhất).
  - Internal relationships sử dụng CodeID làm khóa ngoại; NDID/Email không phải canonical foreign key.
  - Client không phải security authority.
- **Authentication Flows**:
  - Đăng ký tài khoản (`registerUser`): Cấp phát CodeID tuần tự, băm mật khẩu bcrypt-v1, tạo Firebase Auth user, tự động phát sinh email verification token khi có email.
  - Đăng nhập tài khoản (`loginUser`): Hỗ trợ NDID hoặc Email, khóa tài khoản sau 5 lần thất bại liên tiếp (brute-force defense), mint Firebase Custom Token (`UID === CodeID`).
  - Google Identity (`linkGoogleIdentity`, `loginWithGoogle`): Liên kết Google subject ID vào CodeID hiện có, không tạo tài khoản orphan.
  - Tự phục vụ (`changePassword`, `changeNdid`): Đổi mật khẩu an toàn, thu hồi session khác, bảo lưu 30 ngày cooldown khi đổi NDID.
  - Khôi phục tài khoản (`requestAccountRecovery`, `verifyRecoveryCode`, `resetPasswordWithRecovery`): OTP 6 số lưu băm SHA-256, chỉ gửi tới email đã xác thực (anti-enumeration), tự động mở khóa tài khoản sau khi đặt lại mật khẩu.
  - Quản lý phiên & thiết bị (`sessions`, `devices`): Theo dõi phiên đa nền tảng, băm vân tay thiết bị SHA-256, thu hồi phiên linh hoạt (từng phiên, phiên khác, toàn bộ).
  - Phân quyền quản trị (`authorization`): Phân cấp `user` -> `admin` -> `owner`, ngăn chặn nâng quyền trái phép, phòng ngừa mất quyền chủ sở hữu (Zero-Owner Lockout Prevention).

---

### SECURITY:
- **Secret Audit**:
  - Đã quét toàn bộ kho mã nguồn: **0 hardcoded API keys, 0 plaintext passwords, 0 private keys**.
  - Không có secrets trong Git tree, client frontend bundles, tài liệu hay logs.
- **Rules & Boundaries**:
  - `firestore.rules`:
    - `users/{userId}`: Client create denied (`allow create: if false;`), client delete denied (`allow delete: if false;`).
    - `private/{document=**}`: Client read/write strictly denied.
    - `sessions/{document=**}`: Client read/write strictly denied.
    - `devices/{document=**}`: Client read/write strictly denied.
    - `email_verifications/{tokenHash}`: Client read/write strictly denied (server-only).
    - `counters/{counterId}`, `ndids/{ndid}`, `emails/{email}`, `google_identities/{id}`: Server-only.
- **Anti-Enumeration & Cooldowns**:
  - Uniform response trên luồng khôi phục tài khoản.
  - 60s cooldown trên email verification và account recovery OTP.
  - 24h TTL trên verification token; 15m TTL trên recovery OTP.

---

### PRODUCTION READINESS:

| COMPONENT | STATUS | EVIDENCE | BLOCKER |
|---|---|---|---|
| Backend Auth | **READY** | 151/151 unit & integration tests passing | Không |
| Frontend Auth | **READY** | `canonical-auth.js` tích hợp 21 endpoints production | Không |
| Firebase Auth | **READY** | UID === CodeID, Custom Token, Email/Password & Google | Không |
| Firestore Rules | **READY** | Quy tắc server-only cho private, mappings, email_verifications | Không |
| Resend Adapter | **READY** | `ResendEmailProvider` qua native fetch, payload mapping chuẩn | Không |
| Email Verification | **READY** | Token 32-byte hex, hash SHA-256, 24h TTL, 60s cooldown | Không |
| Recovery Email | **READY** | OTP 6 số, anti-enumeration, chỉ gửi email đã verified | Không |
| Security Email | **READY** | Thông báo đổi mật khẩu & mở khóa, không lộ credential | Không |
| Secrets Management | **READY** | Zero secrets in source; nạp qua env/Secret Manager | Không |
| Sessions & Devices | **READY** | Quản lý phiên đa thiết bị, băm SHA-256 fingerprint | Không |
| Authorization | **READY** | Phân quyền Owner/Admin/User, chống leo thang quyền | Không |
| Legacy Cutover | **READY** | 0 fake emails, 0 plaintext passwords, 0 legacy fallback | Không |
| Resend Domain Sender | **BLOCKED** | Cần Owner xác minh DNS domain người gửi trên Resend Console | Chờ Owner xác minh domain trên Resend |

---

### TESTS:
- **total**: 151
- **passed**: 151
- **failed**: 0
- **duration**: ~1.75s

---

### REGRESSION:
- Toàn bộ 9 file test suite chạy đồng thời (`node --test tests/*.test.js`):
  - `account_recovery.test.js`: PASS
  - `auth_client_and_self_service.test.js`: PASS
  - `auth_foundation.test.js`: PASS
  - `authorization_and_hardening.test.js`: PASS
  - `codeid_allocator.test.js`: PASS
  - `google_identity_linking.test.js`: PASS
  - `production_readiness_audit.test.js`: PASS
  - `session_and_device_security.test.js`: PASS
  - `email_service_and_production_activation.test.js`: PASS
- Xác nhận: **0 regressions**.

---

### LEGACY:
- Đã loại bỏ hoàn toàn các phụ thuộc vào:
  - Fake email (`@ndsite.web.app`, `@ndsite.id` làm định danh tài khoản).
  - Plaintext `registeredPassword`.
  - Sinh OTP bằng `Math.random()`.
  - Quyền hạn lưu ở `localStorage`.
  - Mã định danh CodeID ngẫu nhiên.
- Hệ thống chạy 100% trên Canonical Authentication.

---

### TIMETABLE:
- **unchanged**: 0 thay đổi schema, 0 thay đổi field, 0 thay đổi dữ liệu bảng thời khóa biểu.
- **no migration**: Không thực hiện bất kỳ migration nào trên TimeTable.
- Invariant bất biến: `ownerUid` và các liên kết TimeTable được giữ nguyên vẹn 100%.

---

### REMAINING LIMITATIONS:
- Quota gói Resend Free: 100 emails/ngày và 3,000 emails/tháng. Khi vượt quá quota, Resend sẽ trả về HTTP 429 và hệ thống ghi nhận lỗi an toàn mà không làm gián đoạn tài khoản người dùng.
- Gửi thư trực tiếp ra Internet đòi hỏi domain người gửi phải được xác thực bản ghi DNS trên Resend Console.

---

### OPEN DECISIONS:
- Cấu hình Domain người gửi chính thức trên Resend Console (`EMAIL_SENDER_ADDRESS`) do Owner quản lý và kích hoạt.

---

### HANDOFF:
Phase hoàn tất.
Roadmap tiếp theo do Owner quyết định.
