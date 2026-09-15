# BÁO CÁO GIAI ĐOẠN PHASE AUTH-LIVE: ĐƯA CANONICAL AUTH VÀO HOẠT ĐỘNG PRODUCTION

---

## 1. STATUS
- **Canonical Authentication Core**: Đã hoàn thiện toàn diện, tích hợp đầy đủ và đạt 100% kiểm thử kỹ thuật.
- **Tách biệt Transactional Email**: Hoàn tất phân tách tuyệt đối (Decoupled). Core Auth hoạt động độc lập và không phụ thuộc vào tình trạng phân phối email của Resend.
- **Firestore Security Rules**: Đã triển khai thành công lên môi trường production của dự án ndlabs-0.
- **Cloud Functions Backend**: Mã nguồn backend đã hoàn thiện 100% (21 endpoints). Quá trình deploy hiện đang bị chặn bởi giới hạn gói dịch vụ miễn phí (Firebase Spark Plan) cần nâng cấp lên gói Blaze.
- **Firebase Hosting Frontend**: Giao diện và SDK client (canonical-auth.js) đã hoàn thiện 100%. Quá trình deploy hosting gặp lỗi hạn mức dung lượng lưu trữ phiên bản (HTTP 429 Storage Quota Exceeded).
- **Transactional Email**: CHƯA HOẠT ĐỘNG (NOT YET LIVE). Email provider adapter và 10 mẫu email đã sẵn sàng, chờ Owner cấp cấu hình bí mật và cấu hình DNS tên miền gửi.

---

## 2. DEPLOY
- **Firestore Security Rules**:
  - Lệnh thực thi: `firebase deploy --only firestore:rules`
  - Kết quả: **THÀNH CÔNG (DEPLOYED)**
  - Chi tiết: `+ firestore: released rules firestore.rules to cloud.firestore. Deploy complete!`
  - Quy tắc phân quyền bảo vệ đa tầng đã chính thức có hiệu lực trên database ndlabs-0.
- **Cloud Functions Backend**:
  - Lệnh thực thi: `firebase deploy --only functions`
  - Kết quả: **TẠM DỪNG DO GÓI DỊCH VỤ (BLOCKED BY SPARK PLAN)**
  - Thông báo hệ thống:
    ```
    Error: Your project ndlabs-0 must be on the Blaze (pay-as-you-go) plan to complete this command.
    Required API artifactregistry.googleapis.com can't be enabled until the upgrade is complete.
    To upgrade, visit: https://console.firebase.google.com/project/ndlabs-0/usage/details
    ```
- **Firebase Hosting Frontend**:
  - Lệnh thực thi: `firebase deploy --only hosting`
  - Kết quả: **TẠM DỪNG DO HẠN MỨC DUNG LƯỢNG (BLOCKED BY STORAGE QUOTA)**
  - Thông báo hệ thống:
    ```
    Error: Request to https://firebasehosting.googleapis.com/v1beta1/projects/-/sites/ndsite/versions had HTTP Error: 429,
    You have exceeded the Hosting storage quota for your Firebase project, so you cannot deploy to your site right now.
    Visit the Firebase console to either manage your Hosting storage or upgrade to the Blaze plan.
    ```
- **Cấu hình Client Adapter (assets/js/canonical-auth.js)**:
  - Đã cập nhật domain Cloud Functions sang canonical project domain chính thức: `https://asia-southeast1-ndlabs-0.cloudfunctions.net`.
  - Phiên bản hệ thống cập nhật: `ver:1.9.5.2017` tại `assets/js/version.js`.

---

## 3. LIVE AUTH VERIFICATION
- **Thăm dò Trực tiếp Môi trường Production (Live Probing)**:
  - `https://ndsite.web.app/auth/login/`: **HTTP 200 OK** (Trang đăng nhập đang trực tuyến).
  - `https://ndsite.web.app/auth/register/`: **HTTP 200 OK** (Trang tạo NDID đang trực tuyến).
  - `https://ndsite.web.app/assets/js/canonical-auth.js`: **HTTP 404** (Bản phát hành Hosting mới nhất chưa được đẩy lên do hạn mức quota 429).
  - `https://asia-southeast1-ndlabs-0.cloudfunctions.net/registerUser`: **HTTP 404** (Endpoint Cloud Functions chưa được triển khai do yêu cầu nâng cấp gói Blaze).
- **Kết quả Kiểm thử Luồng Trực tiếp trên Production**:
  - Do các Cloud Functions chưa thể deploy lên hạ tầng Google Cloud khi dự án ở gói Spark, việc gửi request trực tiếp từ client đến các endpoint production hiện trả về HTTP 404 từ Cloud Functions gateway.
  - Không tạo lập kết quả kiểm thử ảo: Báo cáo trung thực tình trạng hạ tầng thực tế.

---

## 4. SECURITY
- **0 Plaintext Passwords**:
  - Mật khẩu được mã hóa an toàn bằng thuật toán bcrypt-v1 (10 rounds).
  - Hash mật khẩu lưu biệt lập tại subcollection máy chủ `users/{CodeID}/private/security`.
- **0 Fake-Email Identities**:
  - Loại bỏ hoàn toàn định danh email giả mạo (`@ndsite.web.app`).
  - Tài khoản định danh bất biến bằng CodeID tuần tự (`ND-XXXXXX`) và ndid duy nhất do người dùng chọn.
- **0 Client-Authoritative Roles**:
  - Khách hàng (Client) bị cấm ghi trực tiếp vào các trường `role`, `adminLevel`, `status`, `codeId` thông qua `firestore.rules`.
  - Mọi thay đổi quyền hạn bắt buộc thực hiện qua endpoint máy chủ kiểm duyệt nghiêm ngặt.
- **0 Hardcoded Secrets**:
  - Kiểm tra tự động toàn bộ mã nguồn: 0 API keys, 0 private keys, 0 token nhạy cảm trong git và code.
- **0 Exposed PasswordHash / ResetToken**:
  - Subcollection `private` có luật bảo mật `allow read, write: if false;`.
  - Mã khôi phục (Reset Token) được băm một chiều bằng SHA-256 trước khi lưu.
- **Bảo toàn Chuỗi Gốc NDID**:
  - Tuyệt đối không tự ý thêm tiền tố `@` vào biến NDID trong mã nguồn logic và giao diện hiển thị.
- **Chống Dò quét (Anti-Enumeration) & Giới hạn Tần suất**:
  - Phản hồi đồng nhất khi nhập sai tài khoản hoặc yêu cầu khôi phục.
  - Cooldown 60s đối với yêu cầu gửi mã; cooldown 30 ngày đối với đổi NDID.

---

## 5. TESTS
Toàn bộ test suite và build pipeline đạt trạng thái hoàn hảo (100% PASS):

| Hạng mục kiểm tra | Lệnh thực thi | Kết quả | Chi tiết |
| :--- | :--- | :---: | :--- |
| **Node Test Runner** | `node --test tests/*.test.js` | **PASS** | 161/161 tests PASS (10 files, ~1.7s) |
| **Type Check / Lint** | `npm run lint` (`tsc --noEmit`) | **PASS** | 0 lỗi cú pháp / type error |
| **TimeTable Bundle** | `npm run build:timetable` | **PASS** | `assets/timetable-dist/bundle.js` (636 kB) |
| **Full Build** | `npm run build` | **PASS** | MW bundle (645 kB) & TimeTable bundle (636 kB) |

---

## 6. EMAIL DEPENDENCY
- **Tách biệt Core Auth và Email**:
  - Các luồng `registerUser`, `loginUser`, `changePassword`, `changeNdid`, `linkGoogleIdentity`, `unlinkGoogleIdentity`, `resetPasswordWithRecovery` đều bọc tác vụ email trong khối `try/catch` bất đồng bộ với cơ chế ghi log cảnh báo non-fatal.
  - Lỗi gửi email (do chưa có API key, quá hạn mức, lỗi mạng) KHÔNG BAO GIỜ làm gián đoạn hoặc hủy bỏ (rollback) thao tác xác thực của người dùng.
- **Trạng thái Triển khai Email**:
  - **CHƯA HOẠT ĐỘNG TRÊN PRODUCTION (EMAIL NOT YET LIVE)**.
  - Provider adapter Resend (`ResendEmailProvider`) và 10 mẫu email canonical theo hợp đồng thiết kế đã hoàn thành và sẵn sàng hoạt động ngay khi có API key.

---

## 7. TIMETABLE INTEGRITY
- **Bảo toàn Nguyên vẹn Dữ liệu Thời khóa biểu (0 Mutations)**:
  - Collection `timetables` giữ nguyên 100% schema, không thay đổi cấu trúc dữ liệu.
  - Không thay đổi liên kết `ownerUid` của các thời khóa biểu hiện có.
  - Quy tắc phân quyền Firestore cho `timetables` và các subcollection `comments`, `presence` được bảo lưu nguyên trạng (`allow read, write: if true`).
  - Quá trình build và đóng gói bundle `assets/timetable-dist/` hoạt động bình thường, không chịu ảnh hưởng từ hệ thống Auth.

---

## 8. BLOCKERS
1. **Gói Dịch Vụ Firebase (Spark Tier Cần Lên Blaze)**:
   - Google Cloud yêu cầu dự án phải liên kết tài khoản thanh toán (Blaze Plan - Pay as you go) để kích hoạt API `artifactregistry.googleapis.com` và `cloudbuild.googleapis.com` phục vụ việc deploy Cloud Functions thế hệ mới.
   - Khi Owner kích hoạt Blaze, lệnh `firebase deploy --only functions` sẽ hoàn tất tức thì.
2. **Hạn Mức Dung Lượng Lưu Trữ Firebase Hosting**:
   - Site `ndsite` đã sử dụng hết hạn mức lưu trữ bản phát hành (HTTP 429 Storage Quota Exceeded).
   - Cần xóa bớt các bản phát hành cũ (Releases) trong Firebase Console Hosting hoặc nâng cấp lên gói Blaze.
3. **Cấu Hình Khóa Bí Mật Email Giao Dịch**:
   - Secret `RESEND_API_KEY` và bản ghi xác thực tên miền gửi (DNS records: SPF/DKIM) cần được Owner thiết lập khi quyết định kích hoạt tính năng gửi email giao dịch thực tế.
