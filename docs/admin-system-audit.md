# BÁO CÁO TOÀN DIỆN VỀ HỆ THỐNG /admin (SOURCE OF TRUTH)

> **Tài liệu kiểm toán và đặc tả kiến trúc hiện tại của hệ thống /admin**  
> **Phiên bản tài liệu:** 1.0  
> **Thời gian lập:** 11/09/2026  
> **Mục đích:** Đóng vai trò là Source of Truth phục vụ tái cấu trúc (redesign) toàn diện phân hệ quản trị (/admin) trong giai đoạn tiếp theo mà không phá vỡ các hợp đồng kiến trúc chuẩn (canonical contracts).

---

## 1. Executive Summary

Phân hệ quản trị hiện tại của hệ thống ND Labs được hình thành qua nhiều giai đoạn phát triển phân tán, dẫn đến tình trạng tồn tại **nhiều trang quản trị độc lập, phân mảnh và thiếu nhất quán**. 

Qua kiểm toán thực tế mã nguồn, hệ thống có 5 điểm truy cập quản trị chính:
1. `/admin/index.html` (ND Labs Central Admin Console)
2. `/admin/eduspace/index.html` (EduSpace Lesson & Exam Manager)
3. `/admin/eduspace/timetable/index.html` (EduSpace Timetable App Container)
4. `/admin/lotus_bot/index.html` (Lotus Bot Standalone Configurator)
5. `/eduspace/admin/index.html` (Legacy EduSpace User Admin Console)

### Các phát hiện cốt lõi:
- **Xung đột quyền hạn & thiếu phân cấp Owner**: Client-side chỉ kiểm tra lỏng lẻo `userData.role === 'admin'`. Không có bất kỳ cơ chế nào phân biệt giữa `admin` thông thường và `owner` trên giao diện hoặc client code, trong khi Firestore Security Rules và Cloud Functions đã phân định rõ ràng quyền tối cao của Owner (`adminLevel == 'owner'`).
- **Lỗ hổng thao tác trực tiếp Client-SDK**: Các file `/admin/index.html` và `/eduspace/admin/index.html` vẫn chứa các hàm gọi trực tiếp client Firestore SDK (`updateDoc`, `deleteDoc`, sửa `code_ids`, sửa `ndids`) để cập nhật tài khoản, xóa người dùng, xóa hàng loạt dữ liệu chat. Các thao tác này vừa xung đột trực tiếp với Firestore Rules (`allow delete: if false; allow create: if false;`), vừa vi phạm quy chuẩn bảo mật (bypass audit log, không qua server-side).
- **Trùng lặp mã nguồn nghiêm trọng**: Tính năng quản lý người dùng tồn tại song song ở cả `/admin/index.html` và `/eduspace/admin/index.html`. Tính năng quản lý Lotus Bot tồn tại ở cả `/admin/index.html` (tab Lotus Bot) và `/admin/lotus_bot/index.html`.
- **Rủi ro phá vỡ dữ liệu chuẩn (Canonical Data)**: `/admin/index.html` vẫn giữ code cũ sinh CodeID 8 số ngẫu nhiên ghi vào collection `code_ids`, hoàn toàn mâu thuẫn với quy chuẩn hiện tại (CodeID 4 số dạng chuỗi `0000`, Auth UID = CodeID).

---

## 2. Current /admin Structure

### Sơ đồ cấu trúc thư mục thực tế:
```
d:\Project\WebSite\ND Labs\
├── admin\
│   ├── index.html                  # Central Admin Console (2,459 lines, 134.5 KB)
│   ├── eduspace\
│   │   ├── index.html              # EduSpace Exam & Lesson Builder (2,792 lines, 167.1 KB)
│   │   └── timetable\
│   │       └── index.html          # Timetable Container App (32 lines, 1.1 KB)
│   └── lotus_bot\
│       └── index.html              # Standalone Lotus Bot Manager (371 lines, 20.3 KB)
└── eduspace\
    └── admin\
        └── index.html              # Legacy EduSpace User Admin (616 lines, 32.9 KB)
```

---

## 3. Route & Page Inventory

| Route / Entry Point | File Path | Trọng lượng / Dòng | Mục đích chức năng | Trạng thái hiện tại |
| :--- | :--- | :--- | :--- | :--- |
| `/admin/` hoặc `/admin/index.html` | `admin/index.html` | 134.5 KB / 2,459 dòng | Dashboard tổng quan, Quản lý tài khoản ND Labs, Bảng thông báo RTDB, Lotus Bot RTDB, Dữ liệu EduSpace & Xóa Chat | Đang hoạt động, chứa nhiều logic cũ/lỗi |
| `/admin/eduspace/` | `admin/eduspace/index.html` | 167.1 KB / 2,792 dòng | Trình soạn thảo đề thi, bài giảng, mammoth docx parser, đồng bộ câu hỏi lên Firestore | Đang hoạt động, độc lập, file nguyên khối lớn |
| `/admin/eduspace/timetable/` | `admin/eduspace/timetable/index.html` | 1.1 KB / 32 dòng | Vỏ bọc nhúng React Timetable App bundle (`/assets/timetable-dist/bundle.js`) | **Bất biến (Frozen)** - Tuyệt đối không can thiệp |
| `/admin/lotus_bot/` | `admin/lotus_bot/index.html` | 20.3 KB / 371 dòng | Quản lý cấu hình Lotus Bot (trạng thái, whitelist NDID) trên Realtime Database | Dư thừa (Duplicate với tab trong `/admin/`) |
| `/eduspace/admin/` | `eduspace/admin/index.html` | 32.9 KB / 616 dòng | Quản trị người dùng riêng của phân hệ EduSpace | Rất cũ, trùng lặp, logic sửa DB trực tiếp lỗi thời |

---

## 4. Component Inventory

Hầu hết các trang quản trị hiện tại được viết dưới dạng **Monolithic HTML + Vanilla JS + Tailwind CDN / Custom CSS**, không dùng framework SPA tổng thể (ngoại trừ Timetable nhúng React bundle).

### 4.1. Khối giao diện tại `/admin/index.html`:
- **Auth Gate Overlay**: `#admin-lock-screen` - Kiểm tra `userData.role === 'admin'`, hiển thị màn hình khóa nếu từ chối hoặc nút đăng nhập.
- **Sidebar**: Chứa menu chuyển tab:
  - `tab-btn-overview` (Tổng quan)
  - `tab-btn-users` (Quản lý người dùng)
  - `tab-btn-lotus-bot` (Lotus Bot)
  - `tab-btn-notifications` (Thông báo)
  - `tab-btn-eduspace` (EduSpace)
  - `tab-btn-danger` (Khu vực nguy hiểm)
- **Top Bar**: Profile user, badge vai trò, nút Đăng xuất (`auth.signOut()`).
- **Tab Overview**: 4 card thống kê (Tổng người dùng, EduSpace users, Lotus Bot allowed, Tin nhắn hệ thống). Bảng hoạt động gần đây.
- **Tab Users**:
  - Ô tìm kiếm, filter theo role (`all`, `admin`, `user`).
  - Nút thêm người dùng mới (`openAddUserModal`).
  - Bảng danh sách (`#users-table-body`): Avatar, Tên, NDID, Email, CodeID, Role, Trạng thái, Ngày tạo, Actions (Sửa, Xóa).
  - Modal Sửa Người Dùng (`#edit-user-modal`): Form sửa Tên, Email, NDID, Role, Khóa tài khoản.
- **Tab Lotus Bot**:
  - Toggle Bật/Tắt Bot trên Realtime Database (`/lotus_bots`).
  - Form thêm NDID vào danh sách được phép trò chuyện.
  - Danh sách NDID whitelist với nút xóa.
- **Tab Notifications**:
  - Form phát thông báo toàn hệ thống (Tiêu đề, Nội dung, Loại thông báo, Thời hạn). Ghi vào RTDB `/announcements`.
  - Danh sách các thông báo đang hoạt động.
- **Tab EduSpace**:
  - Liên kết điều hướng sang `/admin/eduspace/` và `/admin/eduspace/timetable/`.
  - Trình duyệt/tìm kiếm hồ sơ học tập EduSpace (`users/{id}/eduspace_profile`).
- **Tab Danger Zone**:
  - Nút "Wipe All ChatND Data" (Xóa sạch tin nhắn trong collection `chats`).

### 4.2. Khối giao diện tại `/admin/eduspace/index.html`:
- Header thanh điều hướng, trạng thái kết nối Firebase.
- Sidebar danh mục đề thi / môn học (`math`, `physics`, `chemistry`, `biology`, `history`, `geography`, `civic`, v.v.).
- Bộ chuyển đổi tệp Word (.docx) sang đề thi sử dụng thư viện **Mammoth.js**.
- Trình biên tập câu hỏi chi tiết: Trắc nghiệm (4 lựa chọn), Điền khuyết, Đúng/Sai.
- Trình hiển thị công thức Toán học / Hóa học qua **KaTeX**.
- Trình quản lý xuất/nhập tệp JSON cấu trúc đề thi EduSpace.

### 4.3. Khối giao diện tại `/admin/eduspace/timetable/index.html`:
- Cực kỳ tối giản, đóng vai trò host DOM: `<div id="root"></div>`.
- Nạp thư viện: React, ReactDOM (hoặc bundle biên dịch sẵn) từ `/assets/timetable-dist/bundle.js`.

### 4.4. Khối giao diện tại `/admin/lotus_bot/index.html`:
- Form cấu hình độc lập cho Lotus Bot trên Realtime Database: `bot_status`, `allowed_users`.
- Trực tiếp thao tác đường dẫn RTDB: `ref(rtdb, 'lotus_bots')`.

### 4.5. Khối giao diện tại `/eduspace/admin/index.html`:
- Bảng danh sách thành viên EduSpace.
- Modal cấp quyền và gán lớp học / khối học.

---

## 5. Data & Firebase Architecture

### 5.1. Firestore Collections được Admin truy xuất:
| Collection | Thao tác hiện tại trong Admin | Đánh giá rủi ro / Chuẩn mực |
| :--- | :--- | :--- |
| `users` | `getDocs`, `updateDoc`, `deleteDoc` trực tiếp từ browser | **RẤT NGUY HIỂM / LỖI**: Vi phạm rule `allow delete: if false`. Bypass server-side authorization. Phải chuyển sang gọi Cloud Function hoặc server API. |
| `ndids` | `setDoc`, `deleteDoc` từ browser trong `eduspace/admin` | **LỖI NGHIÊM TRỌNG**: Collection này bị Rules chặn hoàn toàn ở client (`allow read, write: if false`). Mọi thao tác ghi client-side đều bị Permission Denied. |
| `code_ids` | Thao tác cấp phát CodeID cũ 8 số | **LỖI LẠC HẬU**: Trái ngược quy chuẩn CodeID 4 số (`0000`). |
| `chats` | Truy vấn đệ quy và xóa toàn bộ document | **RỦI RO CAO**: Thao tác hủy diệt dữ liệu lớn chạy từ client-side dễ timeout và không kiểm soát. Cần chỉ dành riêng cho Owner qua Cloud Function. |
| `exams` / `lessons` | `getDocs`, `setDoc`, `updateDoc` từ `admin/eduspace` | Hợp lệ theo nghiệp vụ quản trị nội dung học tập, nhưng cần xác thực role `admin` chặt chẽ. |

### 5.2. Realtime Database Nodes được Admin truy xuất:
| Node RTDB | Mục đích | Nhận xét |
| :--- | :--- | :--- |
| `/lotus_bots` | Quản lý trạng thái và Whitelist người dùng chat với bot | Đang bị phân mảnh giữa 2 nơi (`admin/index.html` và `admin/lotus_bot/index.html`). |
| `/announcements` | Lưu trữ thông báo broadcast hệ thống | Hoạt động tốt nhưng cần đồng bộ format với `assets/js/announcements.js`. |

---

## 6. Authentication & Authorization

### 6.1. Luồng xác thực & cấp quyền thực tế:
1. **Tại Client:**
   - Trình duyệt khởi tạo Firebase Auth (`getAuth()`).
   - Lắng nghe `onAuthStateChanged(auth, async (user) => { ... })`.
   - Nếu `!user`: Khóa màn hình, yêu cầu đăng nhập.
   - Nếu có `user`: Gọi `getDoc(doc(db, 'users', user.uid))`.
   - Kiểm tra điều kiện: `if (userData && userData.role === 'admin') { unlockUI(); } else { showLockScreen(); }`.
2. **Nhược điểm nghiêm trọng:**
   - **Hoàn toàn thiếu vắng kiểm tra `adminLevel`**: Trong hệ thống chuẩn, chỉ tài khoản có `role: "admin" AND adminLevel: "owner"` mới là Chủ sở hữu tối cao (Owner). Giao diện hiện tại không phân biệt được điều này, coi mọi `admin` đều như nhau.
   - **Không sử dụng Custom Claims**: Client chỉ dựa vào document Firestore đọc được, chưa đồng bộ hóa qua Firebase Auth Custom Claims (`admin: true`, `owner: true`).
   - **Bảo mật giả định (Security by Obscurity)**: Nếu người dùng can thiệp DOM hoặc sửa biến JS `userData.role = 'admin'`, họ có thể mở khóa giao diện, dù khi gọi Firestore sẽ bị rules chặn (hoặc lỗi dở dang).

---

## 7. Admin vs Owner Permission Matrix

Dưới đây là ma trận phân quyền chuẩn (Canonical Matrix) cần được áp dụng cho hệ thống mới:

| Hành động / Nghiệp vụ | Người dùng (User) | Quản trị viên (Admin) | Chủ sở hữu (Owner) | Cơ chế thực thi chuẩn |
| :--- | :---: | :---: | :---: | :--- |
| Xem Dashboard tổng quan | ❌ | ✅ | ✅ | Client UI + Rule |
| Quản lý đề thi / bài giảng EduSpace | ❌ | ✅ | ✅ | Client Firestore SDK (Rule `role == 'admin'`) |
| Quản lý Thời khóa biểu (Timetable) | ❌ | Theo quyền phân công | ✅ | Đóng gói riêng biệt (Read-only container) |
| Cấu hình Lotus Bot / Announcements | ❌ | ✅ | ✅ | RTDB Rules / Function |
| Xem danh sách người dùng | ❌ | ✅ | ✅ | Firestore query / Cloud Function |
| Chỉnh sửa thông tin học tập, profile user | ❌ | ✅ | ✅ | Server-side / Cloud Function |
| Khóa / Tạm ngừng tài khoản User | ❌ | ✅ | ✅ | Server-side Cloud Function |
| Nâng quyền User lên Admin | ❌ | ❌ | ✅ (Duy nhất) | Cloud Function (`adminLevel == 'owner'`) |
| Hạ quyền / Thu hồi quyền Admin | ❌ | ❌ | ✅ (Duy nhất) | Cloud Function (`adminLevel == 'owner'`) |
| Chỉnh sửa NDID / CodeID của tài khoản | ❌ | ❌ | ✅ (Duy nhất) | Cloud Function (`adminLevel == 'owner'`) |
| Chuyển giao quyền Owner | ❌ | ❌ | ✅ (Duy nhất) | Cloud Function + Xác thực 2 lớp |
| Xóa tài khoản người dùng (Hard Delete) | ❌ | ❌ | ✅ (Duy nhất) | Cloud Function (`adminLevel == 'owner'`) |
| Xóa sạch dữ liệu hệ thống (Danger Zone) | ❌ | ❌ | ✅ (Duy nhất) | Cloud Function (`adminLevel == 'owner'`) |

---

## 8. Feature Inventory

### Bảng đối chiếu hiện trạng chi tiết:
| Tính năng | Vị trí file | Công nghệ / Thao tác dữ liệu | Hiện trạng hoạt động | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Gate** | `admin/index.html` | `onAuthStateChanged`, đọc `users/{uid}` | Hoạt động | Cần bổ sung phân biệt Admin vs Owner |
| **Thống kê người dùng** | `admin/index.html` | `getCountFromServer` / query toàn bộ `users` | Hoạt động | Tốn read nếu collection lớn; cần cache/aggregation query |
| **Tìm kiếm & lọc User** | `admin/index.html` | Client-side search trên mảng nạp sẵn | Hoạt động với quy mô nhỏ | Sẽ chậm khi dữ liệu lớn; cần phân trang server-side |
| **Thêm mới User** | `admin/index.html` | Gọi `setDoc` trực tiếp và gán CodeID cũ 8 số | **HỎNG / VI PHẠM** | Không đồng bộ với Firebase Auth tạo tài khoản, sinh sai chuẩn CodeID |
| **Sửa User** | `admin/index.html` | `updateDoc(doc(db, 'users', uid))` | Hoạt động cục bộ nhưng vi phạm rule | Phải chuyển về Server API / Cloud Function |
| **Xóa User** | `admin/index.html` | `deleteDoc(doc(db, 'users', uid))` | **HỎNG** (Bị Rules chặn `allow delete: if false`) | Cần xóa qua Cloud Function an toàn |
| **Cấu hình Lotus Bot** | `admin/index.html` + `admin/lotus_bot/` | RTDB `/lotus_bots` | Hoạt động | Trùng lặp mã ở 2 trang khác nhau |
| **Gửi Thông báo** | `admin/index.html` | RTDB `/announcements` | Hoạt động | Tốt, giao diện cơ bản |
| **Quản lý Đề thi EduSpace** | `admin/eduspace/index.html` | Mammoth docx, KaTeX, Firestore `exams` | Hoạt động tốt | Công cụ mạnh, cần giữ nguyên tính năng nhưng làm sạch UI |
| **Quản lý Thời khóa biểu** | `admin/eduspace/timetable/` | React bundle (`/assets/timetable-dist/`) | Hoạt động tốt | **Khu vực bất biến** - Bảo tồn nguyên vẹn |
| **Xóa dữ liệu ChatND** | `admin/index.html` | Vòng lặp xóa `chats` từ client | **RẤT NGUY HIỂM** | Thiếu xác thực Owner, dễ gây treo trình duyệt |

---

## 9. UI/UX Audit

### Ưu điểm:
- Giao diện có bố cục sidebar - content rõ ràng, trực quan, có chế độ tối (dark mode theme).
- Có thanh tìm kiếm tức thời trên danh sách bảng người dùng.
- Có các modal popup thao tác nhanh mà không tải lại trang.

### Nhược điểm & Bất hợp lý:
- **Thiếu phản hồi trạng thái quyền hạn**: Admin đăng nhập vào không biết mình có những quyền hạn gì, nút "Xóa người dùng" hay "Wipe Chat" vẫn hiển thị cho mọi admin dù bấm vào có thể lỗi.
- **Văn phong UI chưa chuẩn hóa**: Một số chỗ xuất hiện thuật ngữ lộn xộn giữa "CodeID", "UID", "Mã định danh", "Tên đăng nhập".
- **Thiếu phân trang (Pagination)**: Tải toàn bộ collection người dùng vào bộ nhớ trình duyệt một lần. Nếu hệ thống có hàng ngàn user, trang sẽ bị đơ cứng.
- **Trải nghiệm di động (Mobile Responsive)**: Bảng dữ liệu người dùng bị tràn màn hình (overflow), khó thao tác trên màn hình cảm ứng nhỏ.
- **Trạng thái tải (Loading/Skeleton)**: Khi đang nạp dữ liệu từ Firestore, giao diện chỉ hiển thị spinner thô sơ hoặc chớp nháy nội dung cũ.

---

## 10. Security Audit

1. **Client-Side Bypass Risk**: Kiểm tra quyền quản trị hoàn toàn phụ thuộc vào việc đọc Firestore document từ máy khách. Nếu kẻ xấu sử dụng DevTools chặn sửa mã JavaScript, họ có thể vượt qua màn hình che chắn để lộ bố cục UI.
2. **Thiếu Audit Trail (Nhật ký kiểm toán)**: Mọi thao tác sửa đổi người dùng, bật tắt bot, xóa tin nhắn đều không lưu lại lịch sử ai là người thực hiện, thời gian nào, địa chỉ IP nào.
3. **Quyền hạn hủy diệt không có rào chắn 2 lớp**: Chức năng xóa toàn bộ tin nhắn ChatND không đòi hỏi nhập mật khẩu xác nhận của Owner hoặc mã OTP/Re-authentication.
4. **Vi phạm nguyên tắc bảo mật Firestore**: Việc để client gọi trực tiếp lệnh xóa / ghi đè thông tin nhạy cảm của user khác dẫn đến nguy cơ xung đột security rules hoặc lộ lỗ hổng nếu rules bị nới lỏng vô tình.

---

## 11. Broken / Risky / Dead / Duplicated Areas

### 11.1. Các phần bị hỏng (Broken):
- Nút Xóa tài khoản trong `/admin/index.html` và `/eduspace/admin/index.html`: Gây lỗi `FirebaseError: Missing or insufficient permissions` do quy tắc bảo mật Firestore cấm xóa trực tiếp.
- Nút Thêm người dùng mới trong `/admin/index.html`: Sinh CodeID 8 số vào collection `code_ids`, phá vỡ toàn bộ cấu trúc CodeID 4 số và liên kết Auth UID.
- Cập nhật collection `ndids` từ client trong `/eduspace/admin/index.html`: Luôn thất bại do rules `allow read, write: if false`.

### 11.2. Các phần rủi ro cao (Risky):
- Xóa đệ quy collection `chats` từ trình duyệt máy khách (dễ đứt mạng giữa chừng, để lại dữ liệu rác mồ côi).
- Không kiểm tra `adminLevel == 'owner'` khi cấp/hạ quyền Admin.

### 11.3. Các phần chết / không dùng (Dead):
- Script quét chẩn đoán và sửa NDID lỗi thời trong `admin/index.html` dựa trên cấu trúc database cũ.
- Tệp `eduspace/admin/index.html` gần như bị bỏ quên sau khi `admin/index.html` ra đời.

### 11.4. Các phần trùng lặp (Duplicated):
- Quản lý người dùng: Tồn tại cả ở `/admin/` và `/eduspace/admin/`.
- Quản lý Lotus Bot: Tồn tại cả ở `/admin/` (tab) và `/admin/lotus_bot/` (file riêng).

---

## 12. Existing Features to Preserve

Những tính năng lõi đang vận hành ổn định và **bắt buộc phải bảo tồn 100%**:
1. **Toàn bộ phân hệ Quản lý Đề thi EduSpace (`/admin/eduspace/index.html`)**:
   - Trình phân tích tài liệu Word (.docx) sang câu hỏi tự động (Mammoth parser).
   - Trình soạn thảo câu hỏi trắc nghiệm, điền khuyết, KaTeX preview.
   - Cơ chế xuất/nhập tệp JSON cấu trúc đề thi EduSpace.
2. **Toàn bộ ứng dụng Thời khóa biểu EduSpace (`/admin/eduspace/timetable/`)**:
   - Gói bundle React (`/assets/timetable-dist/bundle.js`) và route chứa nó.
   - Toàn bộ cơ chế dữ liệu và lưu trữ của Timetable.
3. **Tính năng Phát thông báo toàn hệ thống (Announcements)**:
   - Cơ chế phát thông báo lên Realtime Database `/announcements` hiển thị trên toàn site.
4. **Cấu hình Trạng thái & Whitelist Lotus Bot**:
   - Bật/tắt bot và thêm/bớt NDID được phép dùng bot.

---

## 13. Features to Consolidate

Gộp các phân hệ phân tán về một bảng điều khiển duy nhất (`/admin/` Unified Hub):
1. **Gộp Quản lý Người dùng**: Hủy bỏ giao diện cũ tại `/eduspace/admin/`, tập trung toàn bộ nghiệp vụ người dùng vào tab hoặc phân trang của `/admin/`.
2. **Gộp Lotus Bot Manager**: Chuyển toàn bộ cấu hình từ `/admin/lotus_bot/index.html` vào phân khu chuyên trách trong `/admin/`, biến route `/admin/lotus_bot/` thành redirect hoặc loại bỏ độc lập.
3. **Hợp nhất thanh điều hướng (Unified Navbar & Breadcrumbs)**: Một thanh điều hướng quản trị chung cho phép di chuyển liền mạch giữa Central Admin, EduSpace Content Manager, và Timetable.

---

## 14. Features to Fix

1. **Chuẩn hóa thao tác sửa đổi User**: Mọi thao tác sửa role, tên, khóa tài khoản phải gọi qua Cloud Function an toàn có kiểm tra quyền hạn thực tế.
2. **Chuẩn hóa hiển thị NDID & CodeID**:
   - Hiển thị nguyên bản raw string của NDID, tuyệt đối không tự thêm tiền tố `@`.
   - CodeID luôn là 4 ký tự chuẩn (ví dụ `0000`), đồng nhất giữa Auth UID và Firestore document ID.
3. **Phân quyền giao diện theo 2 tầng (Admin vs Owner)**:
   - Các nút chức năng nhạy cảm (Đổi role, Chuyển quyền, Sửa định danh, Danger Zone) chỉ hiển thị khi tài khoản có `adminLevel === 'owner'`.
   - Với tài khoản `admin` thông thường, các khu vực này bị ẩn hoặc hiển thị trạng thái vô hiệu hóa kèm tooltip giải thích.

---

## 15. Features That Should Be Removed

1. **Loại bỏ form tự tạo tài khoản thủ công với CodeID 8 số ngẫu nhiên** trên client-side.
2. **Loại bỏ tính năng xóa trực tiếp từ client-side Firestore SDK** (`deleteDoc`).
3. **Loại bỏ trang quản trị mồ côi `/eduspace/admin/index.html`** (sau khi đã hợp nhất toàn bộ dữ liệu hiển thị về trung tâm).
4. **Loại bỏ script quét fix NDID cũ** trực tiếp từ trình duyệt gây rủi ro hỏng index.

---

## 16. Missing Pieces Required by the Current Architecture

1. **Bộ Cloud Functions chuyên trách cho Quản trị (Admin Backend Functions)**:
   - `adminUpdateUser({ targetUid, updates })`: Cho phép Admin sửa thông tin cơ bản, Owner sửa thông tin nâng cao.
   - `adminSetRole({ targetUid, newRole, newAdminLevel })`: Chỉ cho phép Owner thực thi, tự động cập nhật cả Firestore `users/{uid}` và Custom Claims của Firebase Auth.
   - `adminDeleteUser({ targetUid })`: Xóa an toàn cả Firebase Auth user và Firestore data (chỉ dành cho Owner).
   - `adminDangerWipe({ targetCollection, confirmationToken })`: Xóa hàng loạt an toàn từ server với cơ chế kiểm tra token nghiêm ngặt.
2. **Hệ thống ghi nhận nhật ký hoạt động (Audit Logs Collection `admin_logs`)**:
   - Tự động ghi lại: `timestamp`, `actorUid`, `actorNdid`, `action`, `targetUid`, `details`.
3. **Cơ chế Phân trang & Tìm kiếm phía Server (Server-side Pagination & Query)**.

---

## 17. Proposed Admin Information Architecture

```
/admin (ND Labs Control Center)
│
├── 1. Dashboard (Tổng quan hệ thống)
│   ├── Thống kê định lượng (Users, Bot, Exams, System health)
│   ├── Nhật ký kiểm toán gần đây (Recent Audit Logs)
│   └── Thông báo nhanh cho Quản trị viên
│
├── 2. User Directory (Quản trị Người dùng & Phân quyền)
│   ├── Bảng dữ liệu người dùng (Server-side pagination, Lọc, Tìm kiếm)
│   ├── Xem chi tiết Profile (Thông tin cá nhân, Học tập, Thiết bị)
│   ├── [Owner Only] Quản trị Quyền lực (Cấp/Thu hồi Admin, Chuyển Owner)
│   └── [Owner Only] Thao tác định danh (Sửa NDID/CodeID ngoại lệ)
│
├── 3. EduSpace Manager (Nội dung Học tập & Khảo thí)
│   ├── Liên kết trực tiếp sang Trình soạn thảo Đề thi (/admin/eduspace/)
│   ├── Liên kết trực tiếp sang Thời khóa biểu (/admin/eduspace/timetable/)
│   └── Quản lý kết quả thi & thống kê học viên
│
├── 4. System Services (Dịch vụ & Tiện ích)
│   ├── Lotus Bot Config (Trạng thái hoạt động & Whitelist truy cập)
│   └── Broadcast Announcements (Phát thông báo toàn site)
│
└── 5. System Governance & Danger Zone [Owner Only]
    ├── Cấu hình thông số hệ thống
    ├── Dọn dẹp dữ liệu rác / Reset cache
    └── Quản trị rủi ro & Sao lưu
```

---

## 18. Proposed /admin Navigation Structure

- **Cấu trúc Shell chuẩn**: Sidebar cố định bên trái (collapsible trên tablet/mobile), Top Header hiển thị Breadcrumb, Canonical NDID của Admin, Role Badge (`Admin` hoặc `Owner`) và nút Đăng xuất.
- **Phân tách phân khu trực quan**:
  - Nhóm **Tổng thể**: Dashboard.
  - Nhóm **Tài khoản**: Users, Phân quyền.
  - Nhóm **Nội dung**: EduSpace Exams, Timetable.
  - Nhóm **Cấu hình**: Lotus Bot, Thông báo.
  - Nhóm **Tối cao (Owner Exclusive)**: Governance, Danger Zone.
- **Trạng thái điều hướng chủ động**: Link active được highlight rõ ràng; các mục yêu cầu quyền Owner được đánh dấu icon ổ khóa vàng nếu người đăng nhập chỉ là Admin thông thường.

---

## 19. Proposed Page Responsibilities

| Phân hệ / Màn hình | Trách nhiệm chính | Ai được truy cập? |
| :--- | :--- | :--- |
| `/admin/` (Dashboard & Core Hub) | Điều phối trung tâm, thống kê tổng quát, quản lý user, thông báo, bot | Admin, Owner |
| `/admin/users` | Tra cứu danh sách, xem chi tiết tài khoản, khóa/mở tài khoản | Admin, Owner (Thao tác nâng cao chỉ Owner) |
| `/admin/eduspace/` | Soạn thảo, nhập docx, chỉnh sửa công thức KaTeX, lưu đề thi lên Firestore | Admin, Owner |
| `/admin/eduspace/timetable/` | Chạy ứng dụng Thời khóa biểu chuyên biệt | Giáo viên/Admin được cấp quyền, Owner |
| Cloud Functions / API Quản trị | Xử lý logic nghiệp vụ an toàn, kiểm toán, thay đổi role, xóa dữ liệu | Server-side execution only |

---

## 20. Compatibility Constraints

Để bảo đảm an toàn tuyệt đối cho toàn bộ hệ sinh thái ND Labs đang hoạt động, việc tái cấu trúc trong tương lai **BẮT BUỘC PHẢI TUÂN THỦ CÁC RÀNG BUỘC SAU**:

1. **Quy chuẩn CodeID & Auth UID**:
   - Tuyệt đối không thay đổi quy ước: Firebase Auth UID = CodeID (ví dụ tài khoản Owner là `0000`).
   - Mọi tài khoản mới phải được cấp CodeID theo cơ chế canonical server-side.
2. **Quy chuẩn NDID (3 Nguyên tắc cốt lõi)**:
   - Form tự nhập: Regex `/^[a-zA-Z0-9_.]+$/`.
   - Dữ liệu từ DB/Admin: Bảo toàn 100% RAW STRING, không sanitize, không cắt xén.
   - Tuyệt đối KHÔNG tự ý chèn tiền tố `@` vào đầu chuỗi NDID trên giao diện.
3. **Bảo tồn Phân hệ Thời khóa biểu (Timetable)**:
   - Giữ nguyên vẹn thư mục `admin/eduspace/timetable/` và `eduspace/timetable/`.
   - Không đụng chạm mã nguồn hoặc cấu trúc dữ liệu của Timetable.
4. **Bảo tồn Dữ liệu Bài thi (Quiz & Exams)**:
   - Giữ nguyên cấu trúc lưu trữ đề thi và lịch sử làm bài thi hiện có trong Firestore.
5. **Duy trì Khả năng Tương thích Ngược**:
   - Nếu điều chuyển đường dẫn của `/eduspace/admin/` hoặc `/admin/lotus_bot/`, phải thiết lập redirect 301/client-side redirect an toàn để không làm gãy bookmark hoặc liên kết cũ.

---

## 21. Redesign Principles

1. **Security-First (Bảo mật là tiên quyết)**: Không bao giờ thực hiện các thao tác quản trị nhạy cảm trực tiếp từ client SDK. Mọi hành động quan trọng phải qua Cloud Functions có xác thực danh tính và kiểm tra quyền Owner/Admin ở tầng máy chủ.
2. **Role & Ownership Clarity (Rõ ràng quyền hạn)**: Giao diện phải phản ánh trung thực quyền hạn của người đăng nhập. Quyền lực tối cao thuộc về Owner (`adminLevel == 'owner'`).
3. **Data Integrity (Toàn vẹn dữ liệu)**: Giữ vững tính bất biến của các định danh khóa chính (UID, CodeID, NDID). Mọi chỉnh sửa định danh phải được ghi vết và hạn chế tối đa.
4. **Performance & Scalability**: Không tải ồ ạt toàn bộ database về trình duyệt; áp dụng cơ chế phân trang, lọc từ máy chủ và tối ưu hóa số lượng read/write của Firebase.
5. **Modern, Clean, Human-Centric UI**: Giao diện quản trị hiện đại, chuẩn thuật ngữ, không dùng các văn phong sáo rỗng, trực quan và tiện dụng trên cả máy tính lẫn thiết bị di động.

---

## 22. Implementation Notes for the Next Phase

Khi bước vào giai đoạn thực thi thiết kế lại (Redesign Execution Phase), các bước nên được tiến hành theo trình tự:

- **Bước 1: Xây dựng Admin Cloud Functions**: Viết và triển khai các hàm backend quản trị (`adminUpdateUser`, `adminSetRole`, `adminDeleteUser`, `adminGetAuditLogs`).
- **Bước 2: Chuẩn hóa Custom Claims**: Thiết lập Cloud Function kích hoạt khi user đổi role để đồng bộ claim `admin: true` và `owner: true` vào Firebase Auth token.
- **Bước 3: Tái thiết kế giao diện vỏ `/admin/` (Admin Shell & Navigation)**: Tạo khung layout chuẩn (Sidebar, Header, Breadcrumb, Auth Guard 2 cấp).
- **Bước 4: Chuyển đổi và nâng cấp User Directory**: Thay thế bảng dữ liệu cũ bằng bảng quản trị mới gọi qua Cloud Functions/Phân trang an toàn.
- **Bước 5: Tích hợp và làm sạch các phân khu dịch vụ**: Đưa cấu hình Lotus Bot và Announcements vào giao diện chuẩn hóa.
- **Bước 6: Tinh chỉnh liên kết với `/admin/eduspace/` và bảo toàn `/admin/eduspace/timetable/`**.
- **Bước 7: Thiết lập Redirect dọn dẹp các trang cũ (`/eduspace/admin/`, `/admin/lotus_bot/`)**.

---

## 23. Final Audit Checklist

- [x] Đã kiểm toán toàn bộ 5 trang/phân hệ quản trị hiện có trong repository.
- [x] Đã chỉ ra rõ ràng các nguy cơ bảo mật, lỗi ghi trực tiếp từ client SDK và xung đột Firestore Rules.
- [x] Đã làm rõ sự khác biệt quyền hạn cốt lõi giữa Quản trị viên thường (`admin`) và Chủ sở hữu (`owner`).
- [x] Đã bảo đảm tuân thủ nguyên tắc bất biến đối với TimeTable, Quiz, và Quy chuẩn NDID/CodeID.
- [x] Toàn bộ tài liệu được đóng gói độc lập, không làm biến đổi bất kỳ dòng code logic hay dữ liệu production nào.
