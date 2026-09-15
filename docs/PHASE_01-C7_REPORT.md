# BÁO CÁO KẾT THÚC PHASE 01-C7
## AUTHORIZATION + PRODUCTION HARDENING + LEGACY AUTH CUTOVER

> **Dự án:** ND Labs / EduSpace  
> **Thời gian hoàn tất:** 2026-09-05  
> **Phạm vi:** Phase 01-C7 (Hệ thống phân quyền & quản trị vai trò, siết chặt Firestore Rules, loại bỏ hoàn toàn legacy auth entry points, production hardening)  
> **Trạng thái:** ✅ **HOÀN THÀNH 100% (105/105 Automated Tests Passed, 0 Regressions)**  
> **Mã phiên bản hệ thống:** `ver:1.9.5.1717`  

---

## 1. MỤC TIÊU & TỔNG QUAN PHASE 01-C7

Phase 01-C7 là cột mốc hoàn tất việc đưa hệ thống Xác thực và Phân quyền Canonical vào trạng thái sẵn sàng vận hành chính thức (Production Readiness), đưa Canonical Auth trở thành hệ thống xác thực duy nhất trên toàn bộ website và đóng lại hoàn toàn các lỗ hổng legacy cũ:

1. **Hệ thống phân quyền phân cấp đa tầng (Authorization & Role Governance):**
   - Phân định rõ ràng 2 tầng quyền hạn: `role` (`user`, `admin`) và `adminLevel` (`null`, `admin`, `owner`).
   - Bảo vệ tuyệt đối Chủ sở hữu hệ thống (System Owner Protection): Không thể bị nâng hoặc giáng quyền bởi người dùng thông thường hoặc quản trị viên (admin).
   - Cơ chế chống tự khóa (Zero-Owner Lockout Prevention): Chặn đứng mọi hành vi giáng quyền hoặc xóa Chủ sở hữu duy nhất còn lại của hệ thống.
   - Quản trị viên (Admin) không thể tự thăng cấp lên Owner, không thể cấp quyền admin cho người khác hoặc giáng quyền admin của người khác (chỉ có Owner mới có quyền phân quyền).
2. **Siết chặt toàn diện Firestore Security Rules (Production Hardening):**
   - Loại bỏ 100% các chuỗi hard-code email (như `nhatdang10.nd@gmail.com`) và các kiểm tra vai trò cũ dạng chữ in hoa (`SUPER_ADMIN`, `ADMIN`).
   - Khóa triệt để quyền tạo tài khoản trực tiếp (`allow create: if false;`) và xóa tài khoản (`allow delete: if false;`) trên client SDK đối với collection `/users/{userId}`. Toàn bộ thao tác cấp phát CodeID và tạo hồ sơ phải đi qua Cloud Functions (`registerUser`).
   - Ràng buộc bất biến tuyệt đối các trường nhạy cảm khi client tự cập nhật hồ sơ (`codeId`, `role`, `adminLevel`, `status`).
   - Bảo vệ hồ sơ Owner khỏi bị client Admin chỉnh sửa trực tiếp.
   - Đóng toàn bộ quyền đọc/ghi từ client vào các subcollection nhạy cảm (`private/**`, `sessions/**`, `devices/**`) và các collection mapping gốc (`counters/**`, `ndids/**`, `emails/**`, `google_identities/**`).
3. **Cắt bỏ hoàn toàn các cổng xác thực Legacy (Legacy Auth Cutover):**
   - Loại bỏ hoàn toàn form OTP cũ (`login-form-otp`) và tab chuyển OTP (`tab-btn-otp`) trên trang đăng nhập (`auth/login/index.html`).
   - Xóa bỏ 100% các đoạn mã sử dụng fake email `@ndsite.web.app` và `@ndsite.id` trong code xác thực.
   - Xóa bỏ 100% trường mật khẩu plaintext `registeredPassword` và hàm tạo mã OTP giả bằng `Math.random()`.
   - Xóa bỏ cơ chế ghi phiên đăng nhập tạm bợ trực tiếp vào `localStorage.nd_user`.
   - Trang đăng nhập chỉ sử dụng Canonical Auth (`canonicalAuth.login()`) và Google Popup Identity Exchange (`canonicalAuth.loginWithGoogle()`).
4. **An toàn dữ liệu thời khóa biểu (TimeTable Safety):**
   - Tuyệt đối 0 đột biến (0 mutations) vào cấu trúc, rules hoặc dữ liệu của `timetables`.
5. **Che giấu lỗi & phòng chống dò quét (Anti-Enumeration & Error Redaction):**
   - Mọi endpoint trả về mã lỗi chuẩn hóa, không để lộ cấu trúc cơ sở dữ liệu nội bộ hoặc stack trace máy chủ.

---

## 2. CÁC THÀNH PHẦN ĐÃ TRIỂN KHAI

### 2.1 Module phân quyền máy chủ (`functions/src/auth/authorization.js`)
- **Định nghĩa hằng số phân quyền chuẩn:**
  - `ROLES = { USER: 'user', ADMIN: 'admin' }`
  - `ADMIN_LEVELS = { ADMIN: 'admin', OWNER: 'owner' }`
- **Hàm `getUserAuthorizationContext(db, codeId)`:** Trích xuất an toàn ngữ cảnh quyền hạn từ `users/{codeId}` gồm `{ codeId, role, adminLevel, status }`.
- **Hàm `assertSelfAccess(callerCodeId, targetCodeId)`:** Ràng buộc người dùng chỉ được phép truy xuất hoặc sửa đổi tài nguyên của chính mình; từ chối truy cập chéo với lỗi `ForbiddenError` (HTTP 403).
- **Hàm `assertAdmin(callerContext)` & `assertOwner(callerContext)`:** Kiểm tra quyền Quản trị viên và Chủ sở hữu hệ thống trên máy chủ, từ chối các tài khoản bị khóa (`status !== 'active'`).
- **Hàm `assertNoPrivilegeEscalation(callerContext, targetContext, desiredChanges)`:**
  - Người dùng thường không thể tự sửa `role` hoặc `adminLevel`.
  - Admin không thể tự thăng lên Owner, không thể cấp/thu hồi quyền của Admin khác hoặc Owner.
  - Chỉ Owner mới có thẩm quyền điều chỉnh phân cấp quản trị.
- **Hàm `updateUserRoleAndLevel({ db, callerCodeId, targetCodeId, newRole, newAdminLevel, ip, userAgent })`:**
  - Thực thi trong Firestore Transaction nguyên tử.
  - Kiểm tra và ngăn chặn triệt để nguy cơ Zero-Owner Lockout (không thể giáng quyền Owner duy nhất còn lại).
  - Tự động ghi nhận nhật ký kiểm toán bảo mật `role_or_privilege_updated`.

### 2.2 Endpoint Cloud Functions HTTPS mới (`functions/index.js`)
1. **`exports.updateUserRole` (POST):**
   - Xác thực Bearer ID Token khẳng định `UID === CodeID`.
   - Yêu cầu người gọi là Chủ sở hữu hệ thống (`assertOwner`).
   - Cập nhật an toàn vai trò và cấp quản trị cho người dùng mục tiêu.
2. **`exports.loginWithGoogle` (POST):**
   - Nhận `googleSubjectId` từ client sau khi xác thực qua Google Popup.
   - Truy vấn mapping máy chủ `google_identities/{googleSubjectId}` để tìm `CodeID` canonical tương ứng.
   - Nếu chưa liên kết: Từ chối an toàn với mã lỗi `GOOGLE_NOT_LINKED`, hướng dẫn người dùng đăng nhập bằng NDID và liên kết trong Cài đặt.
   - Nếu đã liên kết: Cấp Custom Token Firebase Auth với `UID = CodeID`, bảo toàn nguyên vẹn định đề `UID === CodeID`.

### 2.3 Siết chặt Firestore Security Rules (`firestore.rules`)
- Thay thế các hàm cũ bằng hàm canonical:
  ```firestore
  function isCallerAdmin() {
    return isSignedIn() &&
      exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
      getUserDoc(request.auth.uid).role == 'admin';
  }

  function isCallerOwner() {
    return isCallerAdmin() &&
      getUserDoc(request.auth.uid).adminLevel == 'owner';
  }
  ```
- Khóa quyền tạo và xóa tài khoản từ client:
  ```firestore
  match /users/{userId} {
    allow read: if isSignedIn();
    allow create: if false;
    allow delete: if false;
    allow update: if isSignedIn() && (
      (isSelf(userId) &&
        request.resource.data.codeId == resource.data.codeId &&
        (!('role' in request.resource.data) || request.resource.data.role == resource.data.role) &&
        (!('adminLevel' in request.resource.data) || request.resource.data.adminLevel == resource.data.adminLevel) &&
        (!('status' in request.resource.data) || request.resource.data.status == resource.data.status)
      )
      ||
      (isCallerAdmin() &&
        resource.data.adminLevel != 'owner' &&
        request.resource.data.codeId == resource.data.codeId &&
        (!('role' in request.resource.data) || request.resource.data.role == resource.data.role) &&
        (!('adminLevel' in request.resource.data) || request.resource.data.adminLevel == resource.data.adminLevel)
      )
    );
  }
  ```
- Khóa toàn bộ các subcollection `private/**`, `sessions/**`, `devices/**` và các mapping `counters/**`, `ndids/**`, `emails/**`, `google_identities/**`.
- Phân quyền nhật ký bảo mật `/security_events/{eventId}`: Admin chỉ đọc, cấm mọi client ghi.

### 2.4 Cắt bỏ Legacy Auth trên Giao diện Đăng nhập (`auth/login/index.html`)
- Cắt bỏ hoàn toàn tab mã OTP và form OTP cũ.
- Loại bỏ toàn bộ code sinh OTP bằng `Math.random()`, kiểm tra `registeredPassword`, và fallback tạo email `@ndsite.web.app`.
- Form đăng nhập chuẩn hóa: Nhập NDID hoặc Email + Mật khẩu → gọi `window.canonicalAuth.login()`.
- Nút "Đăng nhập với Google" chuyển sang sử dụng `window.canonicalAuth.loginWithGoogle()`, bảo toàn `UID === CodeID`.
- Link "Quên mật khẩu?" dẫn trực tiếp đến `/auth/recovery/` (luồng khôi phục chuẩn mực của Phase 01-C5).

### 2.5 Nâng cấp Thư viện Client Adapter (`assets/js/canonical-auth.js`)
- Bổ sung các phương thức kiểm tra và bảo vệ route phía client:
  - `isAdmin()`: Kiểm tra quyền quản trị viên của phiên hiện tại.
  - `isOwner()`: Kiểm tra quyền chủ sở hữu của phiên hiện tại.
  - `requireRole(role, adminLevel, redirectUrl)`: Điều hướng người dùng không đủ thẩm quyền (UX layer).
  - `requireAdmin(redirectUrl)` & `requireOwner(redirectUrl)`.
  - `loginWithGoogle()`: Trao đổi danh tính Google lấy Custom Token canonical.
  - `updateUserRole({ targetCodeId, role, adminLevel })`.
- Mở rộng bảng ánh xạ lỗi thân thiện tiếng Việt (`mapError`): `FORBIDDEN`, `PRIVILEGE_ESCALATION_DENIED`, `GOOGLE_NOT_LINKED`.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TESTING)

### 3.1 Test Suite Phase 01-C7 (`tests/authorization_and_hardening.test.js`)
- **Số lượng test:** 10 test case
- **Kết quả:** **10/10 passed (100%)**
- **Nội dung kiểm chứng:**
  1. Hằng số vai trò & cấp quản trị (`user`, `admin`, `owner`).
  2. Trích xuất ngữ cảnh quyền hạn `getUserAuthorizationContext`.
  3. Kiểm soát truy cập cục bộ `assertSelfAccess`.
  4. Xác thực đặc quyền `assertAdmin` & `assertOwner`.
  5. Chống nâng quyền `assertNoPrivilegeEscalation` (chặn user tự thăng, chặn admin tự thăng lên owner hoặc cấp admin).
  6. Cơ chế chống khóa hệ thống `Zero-Owner Lockout Prevention`.
  7. Khế ước bảo mật Firestore Rules (chặn create/delete client, chặn sửa `role`/`codeId`, chặn hard-code email).
  8. Khế ước cắt bỏ Legacy Auth trên `auth/login/index.html` (0 fake email, 0 registeredPassword, 0 Math.random).
  9. Khế ước Client Adapter Route Guards và UI Error Mapping.
  10. Khế ước an toàn TimeTable (0 mutations).

### 3.2 Regression Test toàn bộ hệ thống (`tests/*.test.js`)
Chạy toàn bộ 7 test suite từ Phase 01-C1 đến Phase 01-C7:
```
✔ account_recovery.test.js (10 tests passed)
✔ auth_client_and_self_service.test.js (10 tests passed)
✔ auth_foundation.test.js (15 tests passed)
✔ authorization_and_hardening.test.js (10 tests passed)
✔ codeid_allocator.test.js (14 tests passed)
✔ google_identity_linking.test.js (19 tests passed)
✔ session_and_device_security.test.js (27 tests passed)

Total: 105 tests, 0 failures, 100% pass rate. Duration: ~1.65s.
```

---

## 4. ĐỒNG BỘ TÀI LIỆU HỆ THỐNG

1. **`docs/PROJECT_RULES.md`**: Cập nhật quy tắc bảo vệ CodeID, không dùng email giả, và nguyên tắc server-side authorization.
2. **`docs/AUTH_RULES.md`**: Bổ sung Section 11 quy định chi tiết về vai trò, cấp quản trị, bảo vệ Owner, Firestore Rules hardening, và decommission legacy auth.
3. **`docs/SECURITY.md`**: Bổ sung Section 10 quy định về ranh giới kiểm soát đặc quyền, chống leo thang đặc quyền, và loại bỏ hoàn toàn credential plaintext.
4. **`docs/AUTH_DATA_MODEL.md`**: Bổ sung Domain J (Role & Privilege Governance) và cập nhật bảng ánh xạ quyền hạn Firestore.
5. **`docs/AUTH_API_CONTRACT.md`**: Bổ sung đặc tả kỹ thuật cho `POST /updateUserRole` (Section 2.12) và `POST /loginWithGoogle` (Section 2.13).
6. **`docs/DATABASE.md`**: Bổ sung bảng tổng hợp quyền đọc/ghi của các collection đã được siết chặt trong Phase 01-C7.
7. **`docs/ARCHITECTURE_DECISIONS.md`**: Ban hành chính thức quyết định kiến trúc **ADR-018: Canonical Role Governance, Firestore Security Hardening, & Legacy Auth Cutover**.
8. **`assets/js/version.js`**: Cập nhật số phiên bản hệ thống lên `ver:1.9.5.1717`.

---

## 5. PHÂN LOẠI CÁC HẠNG MỤC TỒN ĐỌNG & GIỚI HẠN PHẠM VI

Tuân thủ nghiêm ngặt giới hạn quyền tự chủ của Agent:
- **DEFERRED:**
  - Đăng ký provider gửi email giao dịch thực tế (SendGrid, Resend, Amazon SES) cho môi trường production.
  - Hệ thống cảnh báo tự động qua webhook khi phát hiện hành vi cố ý nâng quyền trái phép.
  - Subcollection `users/{CodeID}/private/integrations` (Gemini API Key, R2 storage credentials).
- **MIGRATION REQUIRED:**
  - Chuyển đổi dữ liệu các tài khoản học viên legacy từ cấu trúc UID ngẫu nhiên cũ sang `users/{CodeID}`.
  - Ánh xạ trường `ownerUid` trong collection `timetables` sang `ownerCodeID` sau khi hoàn thành migration người dùng.
- **OUT OF SCOPE:**
  - Chỉnh sửa cấu trúc nghiệp vụ của TimeTable, Quiz, MiniWorld.
  - Triển khai trực tiếp lên môi trường production Firebase (`firebase deploy`).
- **OPEN DECISION:**
  - Lựa chọn nhà cung cấp dịch vụ SMTP / Transactional Email chính thức cho tên miền ND Labs.

---

## HANDOFF
Phase hoàn tất.
Roadmap tiếp theo do Owner quyết định.
