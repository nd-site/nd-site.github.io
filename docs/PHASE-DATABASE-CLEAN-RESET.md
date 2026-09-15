# BÁO CÁO AUDIT DỮ LIỆU — PHASE DATABASE CLEAN RESET (PHASE A)

---

## 1. AUDIT TỔNG QUAN TÀI NGUYÊN HIỆN TẠI (PHASE A)

### A. FIRESTORE ROOT COLLECTIONS (12 collections)
1. **timetables** (2 documents):
   - `LA0407092627`: `title: "THPT Lộc An - 10A4 - 0709 (26-27)"`, `ownerUid: "HqPqx9xcx4ejlYOvAzjU10Vo0VP2"`
   - `LA1407092627`: `title: "THPT Lộc An - 11A4 - 0709 (26-27)"`, `ownerUid: "HqPqx9xcx4ejlYOvAzjU10Vo0VP2"` (kèm subcollection `presence`)
2. **quizzes** (56 documents):
   - Toàn bộ 56 đề kiểm tra / bài thi của EduSpace (D101-D126, H101-H127, I101-I12I, K101-K111, v.v.).
3. **eduspace_lessons** (41 documents):
   - Danh mục bài học, mục luyện tập EduSpace (h101-h127, i101-i12i, item-3, item-4).
4. **classrooms** (1 document):
   - `721040`: `className: "10A4 (2026-2027)"`, `creatorUid: "HqPqx9xcx4ejlYOvAzjU10Vo0VP2"`.
5. **users** (12 documents):
   - 5 tài khoản Canonical Auth test: `0006`, `0007`, `0008`, `0009`, `0010`.
   - 7 tài khoản legacy cũ: `HqPqx9xcx4ejlYOvAzjU10Vo0VP2` (owner TimeTable), `6cXk6a9Pj3fK3bgsLuLkLgausPH3`, `uZtDX3Wgp9VIYCrcQ8R2NCYPH052`, `ODaSFYrYjieoDdjfq8Qw4CRGcJy1`, `UkvNFl0XFHhEJtcYXRsSNR1QQU43`, `YFkOJn7ca6gq9sys0SwhlXH39y03`, `b0TOCkcgJvQuyyyhpc91ZwKbafz2`.
6. **code_ids** (8 documents):
   - `00000000`, `00000001`, `00000002`, `00000003`, `00000004`, `00000005`, `28957192`, `67802567`.
7. **counters** (1 document):
   - `code_ids`: lưu trữ trạng thái bộ đếm `nextNumericValue`, `lastNumber`.
8. **ndids** (12 documents): Mappings NDID sang CodeID/UID.
9. **emails** (5 documents): Mappings email test sang CodeID.
10. **email_verifications** (7 documents): Token xác thực email test.
11. **security_events** (47 documents): Nhật ký bảo mật test.
12. **chats** (5 documents): Dữ liệu chat tin nhắn cũ.

### B. REALTIME DATABASE (13 root keys)
- `mw_transaction_types`, `mw_organizations`, `mw_chats`, `mw_messages`, `config`, `rooms`, `system_commands`, `lotus_bots`, `mw_transactions`, `notifications_trigger`, `notifications`, `mw_maps`, `mw_user_profiles`.

### C. FIREBASE AUTHENTICATION (10 users)
1. `0006` (`vtest_1788672204971@example.com`) - Test account
2. `0007` (`e2e_1788672330888@ndlabs.dev`) - Test account
3. `0008` (`v2_1788672365409@example.com`) - Test account
4. `0009` (`u_1788672396818@example.com`) - Test account
5. `0010` (`v_final_1788673278334@example.com`) - Test account
6. `6cXk6a9Pj3fK3bgsLuLkLgausPH3` (`chauchau_tc@ndsite.web.app`) - Legacy account
7. `AR8b4fcqY9afIOJ7ZvUBKk1yGTi1` (`nhatdang10.nd@gmail.com`) - Legacy account
8. `HqPqx9xcx4ejlYOvAzjU10Vo0VP2` (`nhatdang10@ndsite.web.app`) - **CHỦ SỞ HỮU 2 THỜI KHÓA BIỂU**
9. `UkvNFl0XFHhEJtcYXRsSNR1QQU43` (`bkhuyen160503@gmail.com`) - Legacy account
10. `uZtDX3Wgp9VIYCrcQ8R2NCYPH052` (`nhatdang@ndsite.web.app`) - Legacy account

---

## 2. PHÂN TÍCH RÀNG BUỘC PHỤ THUỘC (DEPENDENCY AUDIT)
- **Ràng buộc TimeTable**:
  - 2 tài liệu `timetables/LA0407092627` và `timetables/LA1407092627` đều có `ownerUid: "HqPqx9xcx4ejlYOvAzjU10Vo0VP2"`.
  - Quy tắc: *"Không thay đổi ownerUid, không đổi CodeID liên quan đến owner"*.
  - Do đó: Tài khoản Firebase Auth `HqPqx9xcx4ejlYOvAzjU10Vo0VP2`, bản ghi `users/HqPqx9xcx4ejlYOvAzjU10Vo0VP2`, `code_ids/00000001` và `ndids/nhatdang10` **BẮT BUỘC PHẢI GIỮ LẠI (KEEP)** để TimeTable không bị mồ côi hoặc mất quyền sở hữu.
- **Ràng buộc EduSpace**:
  - Toàn bộ 56 đề kiểm tra trong `quizzes` và 41 bài học trong `eduspace_lessons` là dữ liệu bài kiểm tra / học liệu EduSpace cần bảo tồn.
  - Lớp học `classrooms/721040` liên kết giáo viên `HqPqx9xcx4ejlYOvAzjU10Vo0VP2`.

---

## 3. BẢN KÊ GIỮ LẠI (KEEP MANIFEST)
1. **Firestore - TimeTable**:
   - `timetables` (toàn bộ 2 documents và subcollection `presence`).
2. **Firestore - EduSpace**:
   - `quizzes` (toàn bộ 56 documents đề kiểm tra).
   - `eduspace_lessons` (toàn bộ 41 documents bài học).
   - `classrooms` (1 document `721040`).
3. **Firestore - Dữ liệu Owner TimeTable**:
   - `users/HqPqx9xcx4ejlYOvAzjU10Vo0VP2`.
   - `code_ids/00000001`.
   - `ndids/nhatdang10`.
4. **Firestore - Bộ đếm CodeID hệ thống**:
   - `counters/code_ids`.
5. **Firebase Authentication**:
   - UID: `HqPqx9xcx4ejlYOvAzjU10Vo0VP2` (`nhatdang10@ndsite.web.app`).

---

## 4. BẢN KÊ XÓA (DELETE MANIFEST)
1. **Firebase Authentication (9 users)**:
   - `0006`, `0007`, `0008`, `0009`, `0010` (5 test accounts).
   - `6cXk6a9Pj3fK3bgsLuLkLgausPH3`, `AR8b4fcqY9afIOJ7ZvUBKk1yGTi1`, `UkvNFl0XFHhEJtcYXRsSNR1QQU43`, `uZtDX3Wgp9VIYCrcQ8R2NCYPH052` (4 legacy accounts).
2. **Firestore Collections (Xóa toàn bộ documents)**:
   - `chats` (5 docs).
   - `security_events` (47 docs).
   - `email_verifications` (7 docs).
   - `emails` (5 docs).
3. **Firestore Documents thuộc Users & Mappings**:
   - `users`: `0006`, `0007`, `0008`, `0009`, `0010`, `6cXk6a9Pj3fK3bgsLuLkLgausPH3`, `ODaSFYrYjieoDdjfq8Qw4CRGcJy1`, `UkvNFl0XFHhEJtcYXRsSNR1QQU43`, `YFkOJn7ca6gq9sys0SwhlXH39y03`, `b0TOCkcgJvQuyyyhpc91ZwKbafz2`, `uZtDX3Wgp9VIYCrcQ8R2NCYPH052` (kèm subcollections `private`, `sessions`).
   - `ndids`: 11 documents (toàn bộ ngoại trừ `nhatdang10`).
   - `code_ids`: 7 documents (toàn bộ ngoại trừ `00000001`).
4. **Realtime Database**:
   - Xóa toàn bộ các root keys: `mw_transaction_types`, `mw_organizations`, `mw_chats`, `mw_messages`, `config`, `rooms`, `system_commands`, `lotus_bots`, `mw_transactions`, `notifications_trigger`, `notifications`, `mw_maps`, `mw_user_profiles`.
---

## 5. KẾT LUẬN AUDIT & TRẠNG THÁI GATE
- Toàn bộ 12 Firestore collections, 13 RTDB root keys và 10 tài khoản Firebase Auth đã được phân tích độc lập và bóc tách rõ ràng.
- Ràng buộc quan trọng nhất: **Giữ lại tài khoản `HqPqx9xcx4ejlYOvAzjU10Vo0VP2`** để 2 Thời khóa biểu của trường THPT Lộc An không bị mất quyền sở hữu (ownerUid).
- Không có bất kỳ dữ liệu nào bị xóa trong Phase A này.
- Hệ thống đang dừng tại **PHASE B — OWNER CONFIRMATION GATE** để chờ phê duyệt từ Owner trước khi tiến hành xóa.
