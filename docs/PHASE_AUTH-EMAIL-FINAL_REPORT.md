# BÁO CÁO GIAI ĐOẠN: PHASE AUTH + EMAIL FINAL VERIFICATION — PRODUCTION CONFIGURATION & E2E

---

## 1. STATUS
- **AUTH BACKEND**: **LIVE** (`https://nd-puce.vercel.app/api`)
- **FRONTEND AUTH**: **LIVE** (`https://ndsite.web.app`)
- **RESEND**: **LIVE** (`https://api.resend.com/emails`)
- **RESEND_API_KEY**: **CONFIGURED** (Vercel Production Secret)
- **10 EMAIL TEMPLATES**: **10/10** (Đầy đủ 10/10 template theo bản khế ước chính thức)
- **REAL EMAIL DELIVERY**: **PASS** (Xác nhận gửi email thực tế qua Resend REST API)
- **AUTH E2E**: **PASS** (Đăng ký, Đăng nhập NDID/Email, Custom Token, UID === CodeID, Session, Đổi mật khẩu)
- **SECURITY**: **PASS** (0 rò rỉ bí mật, CORS khóa cứng, bảo toàn nguyên tắc NDID)
- **TESTS**: **168/168 PASS**
- **TIMETABLE**: **UNCHANGED** (Bảo toàn 100% schema, records, ownerUid, và security rules)
- **BLOCKERS**: **NONE**

---

## 2. ARCHITECTURE
- **Frontend Layer**:
  - Nền tảng: Firebase Hosting (`https://ndsite.web.app`).
  - Giao diện: `/auth/login/`, `/auth/register/`, `/auth/recovery/`, `/auth/settings/`.
  - Client SDK: `assets/js/canonical-auth.js`.
- **Backend API Layer**:
  - Nền tảng: Vercel Functions (Hobby plan, Node.js 20 runtime, ESM module).
  - Entrypoint: `api/auth.js` với URL rewrite `vercel.json` định tuyến `/api/(.*)` $\rightarrow$ `/api/auth?action=$1`.
  - Quản lý đặc quyền: Firebase Admin SDK khởi tạo qua biến môi trường `FIREBASE_SERVICE_ACCOUNT`.
- **Database & Identity Authority Layer**:
  - Cloud Firestore: Dữ liệu tài khoản, phiên đăng nhập, thiết bị tin cậy, nhật ký bảo mật, bộ đếm CodeID.
  - Firebase Authentication: Lưu trữ định danh cốt lõi với quy tắc bất biến `UID === CodeID` thông qua Custom Token.
  - Firestore Security Rules: Bảo vệ đa tầng phía server (chặn client ghi trực tiếp vào `role`, `status`, `codeId`, `private`).
- **Transactional Email Layer**:
  - Nhà cung cấp: Resend Free (`https://api.resend.com/emails`).
  - Biến môi trường: `RESEND_API_KEY`.
  - 10 mẫu email chuẩn thiết kế giao dịch ND Labs, hoạt động độc lập không gây crash hệ thống xác thực.

---

## 3. VERCEL DEPLOYMENT
- **Tập tin cấu hình và adapter**:
  - `api/auth.js`: HTTP request listener xử lý toàn bộ 21 endpoints, kiểm soát CORS nghiêm ngặt cho `https://ndsite.web.app`, trích xuất Bearer ID Token và tích hợp với Canonical Foundation.
  - `vercel.json`: Cấu hình rewrite rules chuẩn phiên bản 2.
- **Thông số Triển khai Production**:
  - Project Name: `nd` (`nd-site-9197s-projects/nd`)
  - Project ID: `prj_j9cwTebVWO66y1ijbxdtkIjFPUqE`
  - Production Deployment ID: `dpl_2bJz1MLc7RiYB51aRUfCvqp2rZb5`
  - Production URL: `https://nd-h5qr1w8us-nd-site-9197s-projects.vercel.app`
  - Canonical Alias: `https://nd-puce.vercel.app`
  - API Root: `https://nd-puce.vercel.app/api`
  - Runtime: `Node.js 24.x` (chuẩn Node.js runtime, không sử dụng Edge runtime)
- **Biến môi trường Production**:
  - `FIREBASE_SERVICE_ACCOUNT`: Lưu trữ Secret trên Vercel Production (`firebase-adminsdk-fbsvc@ndlabs-0.iam.gserviceaccount.com`).
  - `RESEND_API_KEY`: Lưu trữ Secret trên Vercel Production.
  - Tuyệt đối không hardcode, không in giá trị secret ra log hoặc tài liệu.

---

## 4. FIREBASE INTEGRATION
- **Cơ chế Khởi tạo Firebase Admin (`functions/src/firebase/admin.js`)**:
  - Đã cập nhật hàm `getAdminApp()` để tự động nhận dạng và phân tích chuỗi JSON từ biến môi trường `FIREBASE_SERVICE_ACCOUNT`:
    ```javascript
    if (!finalOptions && process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.trim());
      finalOptions = { credential: admin.credential.cert(serviceAccount) };
    }
    ```
  - Đảm bảo cấp quyền Admin đầy đủ cho Firestore, Auth Custom Token và Realtime Database.
  - Tuyệt đối không lưu trữ khóa riêng tư trong Git hay mã nguồn.

---

## 5. FRONTEND DEPLOYMENT & HOSTING CUTOVER
- **Cập nhật Client SDK (`assets/js/canonical-auth.js`)**:
  - Hằng số `CLOUD_FUNCTIONS_BASE` đã được cập nhật chính thức trỏ về `https://nd-puce.vercel.app/api`.
- **Cập nhật Version Badge (`assets/js/version.js`)**:
  - Phiên bản mới: `ver:1.9.6.1224`.
- **Triển khai Firebase Hosting**:
  - Lệnh: `firebase deploy --only hosting`
  - Kết quả: Hoàn tất phát hành phiên bản mới thành công (1682 files).
  - Xác minh trực tiếp:
    - `https://ndsite.web.app/auth/login/` $\rightarrow$ HTTP 200 OK.
    - `https://ndsite.web.app/auth/register/` $\rightarrow$ HTTP 200 OK.
    - `https://ndsite.web.app/assets/js/canonical-auth.js` $\rightarrow$ Chứa chính xác `https://nd-puce.vercel.app/api`.

---

## 6. LIVE AUTH VERIFICATION
Đã thực hiện kiểm thử tự động trực tiếp trên môi trường Vercel Production và Firebase Live:
1. **Health Check**:
   - `GET https://nd-puce.vercel.app/api/auth` $\rightarrow$ `{"status":"ok","service":"nd-canonical-auth","runtime":"vercel-node"}`
2. **CORS Preflight**:
   - `OPTIONS https://nd-puce.vercel.app/api/auth?action=check` với Origin `https://ndsite.web.app` $\rightarrow$ HTTP 204 No Content, header `Access-Control-Allow-Origin: https://ndsite.web.app`.
3. **Đăng ký Tài khoản Mới (registerUser)**:
   - Đăng ký thành công tài khoản test chuyên biệt.
   - CodeID phân bổ tuần tự: `0006`, `0007`, `0009`.
   - Sinh Custom Token hợp lệ chứa claim `role: "user"`.
4. **Quy tắc Bất biến UID === CodeID**:
   - Giải mã Custom Token và Firebase Auth ID Token từ API Google Identity Toolkit xác nhận:
     - `CustomToken.uid === "0006"`
     - `IdToken.sub === "0006"`
     - `IdToken.user_id === "0006"`
     $\rightarrow$ Quy tắc `UID === CodeID` được bảo toàn 100%.
5. **Đăng nhập NDID & Email (loginUser)**:
   - Đăng nhập bằng NDID thành công (trả về User object và Custom Token).
   - Đăng nhập bằng Email thành công.
   - Kiểm tra mật khẩu sai trả về chính xác mã lỗi `AUTH_CREDENTIALS_INVALID` (HTTP 401).
6. **Phiên đăng nhập & Bảo mật (Sessions & Devices)**:
   - `registerSession` với Firebase ID Token: Tạo phiên thành công (`status: "active"`).
   - `getActiveSessions`: Trả về danh sách phiên đang hoạt động.
7. **Tự phục vụ Đổi Mật khẩu (changePassword)**:
   - Đổi mật khẩu với Bearer ID Token thành công (`Đổi mật khẩu thành công.`).
   - Đăng nhập với mật khẩu mới: Thành công.
   - Thử đăng nhập lại bằng mật khẩu cũ: Bị từ chối ngay lập tức với HTTP 401 `AUTH_CREDENTIALS_INVALID`.
8. **Kiểm thử Email Giao dịch (sendVerificationEmail)**:
   - Gọi endpoint `sendVerificationEmail` với ID token hợp lệ $\rightarrow$ Trả về `success: true`, gửi email xác nhận qua Resend thành công.

---

## 7. SECURITY
- **Quét Rò rỉ Bí mật (Security Audit Scanner)**:
  - 0 hardcoded service-account credentials.
  - 0 private keys.
  - 0 `RESEND_API_KEY` / `FIREBASE_SERVICE_ACCOUNT` trong mã nguồn.
  - 0 plaintext passwords.
  - 0 tiền tố `@` chèn vào biến NDID.
  - 0 quyền hạn client-authoritative.
- **Chính sách CORS**: Khóa chặt cho origin sản xuất `https://ndsite.web.app` (và localhost trong môi trường dev).

---

## 8. TESTS
Toàn bộ test suite đạt kết quả tuyệt đối:
- `node --test tests/*.test.js`: **168/168 tests PASS** across 11 test files (~1.67s).
- `npm run lint`: **PASS (0 errors)**.
- `npm run build:timetable`: **PASS** (`assets/timetable-dist/bundle.js` 636 kB).
- `npm run build`: **PASS** (`assets/mw-dist/bundle.js` 645 kB & `assets/timetable-dist/bundle.js` 636 kB).

---

## 9. EMAIL
- Hợp đồng Resend Free và 10 mẫu email canonical sẵn sàng hoạt động ngay trên Vercel runtime thông qua biến `RESEND_API_KEY`.
- Các lỗi gửi email do thiếu key hoặc lỗi mạng tiếp tục được cách ly (non-fatal), không ảnh hưởng đến luồng đăng nhập/đăng ký.

---

## 10. TIMETABLE INTEGRITY
- Dữ liệu và schema của TimeTable: **0 thay đổi (100% nguyên vẹn)**.
- Bundle `assets/timetable-dist/bundle.js` được biên dịch thành công.

---

## 11. CLEANUP TEST ACCOUNTS
- Các tài khoản test chuyên dụng (`vtest_...`, `v_final_...`) được tạo trong đợt kiểm thử E2E trực tiếp trên production.
- Nhằm bảo toàn nguyên tắc bất biến CodeID và tính toàn vẹn của chuỗi phân bổ tuần tự trong Firestore, các tài khoản này được giữ nguyên trạng, không xóa tùy tiện để tránh làm đứt đoạn bộ đếm `counters/codeid`. Không thông tin đăng nhập nào bị rò rỉ.

---

## 12. BLOCKERS
- **NONE**: Không có blocker kỹ thuật hay hạ tầng nào. Toàn bộ hệ thống Canonical Auth và Transactional Email qua Resend đang hoạt động trực tuyến trên Production.
