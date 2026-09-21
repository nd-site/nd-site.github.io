# EDUSPACE V3 SERVER-AUTHORITATIVE EXAM SESSION & SUBMISSION SPECIFICATION
## Kiến trúc Phiên thi Máy chủ Bảo chứng, Cơ chế Đồng hồ Đơn nhất & Ranh giới Nộp bài Bất khả Xâm phạm

> **Tài liệu tham chiếu:** [docs/eduspace-v3-architecture.md](eduspace-v3-architecture.md), [docs/eduspace-v3-database-schema.md](eduspace-v3-database-schema.md), [docs/eduspace-v3-api-contract.md](eduspace-v3-api-contract.md), [docs/eduspace-v3-domain-foundation.md](eduspace-v3-domain-foundation.md), [docs/eduspace-v3-exam-engine.md](eduspace-v3-exam-engine.md), [.agents/AGENTS.md](../.agents/AGENTS.md)  
> **Dự án:** EduSpace by ND Labs (Phiên bản V3.0)  
> **Giai đoạn:** Phase 5 — Server-Authoritative Session & Assessment Backend  
> **Trạng thái:** HOÀN TẤT & XÁC THỰC TOÀN DIỆN  
> **Ngày phát hành:** 16/09/2026  

---

### TỔNG QUAN KIẾN TRÚC PHIÊN THI (EXECUTIVE SUMMARY)

Module Khảo thí Máy chủ Bảo chứng (`src/eduspace/assessment/`) chịu trách nhiệm thiết lập và bảo vệ ranh giới bảo mật nghiêm ngặt giữa máy khách (Browser/Client Runner) và cơ sở dữ liệu EduSpace V3.

Mọi hành động của thí sinh — từ lúc mở đề, lưu bài tạm (autosave), đến khi bấm nộp bài chính thức — đều phải tuân thủ các tiên đề bảo mật:

1. **Thẩm quyền Thời gian Tuyệt đối thuộc về Máy chủ (Server Clock Authority):**
   Mốc bắt đầu (`startedAt`), mốc hết hạn (`expiresAt`), và mốc nộp bài (`submittedAt`) hoàn toàn do máy chủ tính toán và ghi nhận. Đồng hồ trên trình duyệt của thí sinh chỉ mang tính chất hiển thị tham khảo (Advisory Display Timer).
2. **Cách ly Tuyệt đối Barem Đáp án (100% Answer Key Isolation):**
   Trong suốt thời gian làm bài, payload trả về máy khách không bao giờ chứa bất kỳ trường nào liên quan đến đáp án đúng (`correctOptionId`, `correctOptionIds`, `correctAnswers`, `acceptableAnswers`, `rubricCriteria`, `explanation`).
3. **Sở quyền Phiên thi Nghiêm ngặt (Strict Session Ownership):**
   Mọi yêu cầu đến phiên thi (`resume`, `autosave`, `submit`) bắt buộc phải có chứng thực từ Firebase Auth, trong đó `request.auth.uid === CodeID` của chủ sở hữu phiên (`studentCodeId`). Bất kỳ nỗ lực can thiệp từ tài khoản khác đều bị từ chối với mã lỗi `FORBIDDEN` (HTTP 403).
4. **Tính Bất biến & Chống Trùng lặp (Idempotency Contract):**
   Mã `sessionId` đồng thời là khóa định danh (Primary Key) duy nhất của `Submission`, `GradingRecord`, và `Result`. Mọi hành động gửi bài nộp trùng lặp (Network retry hoặc double click) đều được nhận diện và xử lý an toàn mà không sinh ra nhiều bản ghi hoặc ghi đè kết quả đã khóa.
5. **Bảo tồn Nguyên vẹn Định danh NDID Chuẩn tắc (Raw String NDID Preservation):**
   Mã định danh NDID của thí sinh được truy xuất trực tiếp từ `users/{CodeID}.ndid` và bảo tồn 100% dạng chuỗi gốc (Raw String). Tuyệt đối không tự ý thêm tiền tố `@` và không cắt lọc ký tự.

---

### PHẦN I: VÒNG ĐỜI PHIÊN THI MÁY CHỦ BẢO CHỨNG

```
[Client]                      [API Controller]             [SessionService]             [ExamEngine]                [Repositories]
   │                                 │                            │                          │                            │
   │─── 1. POST /exam-sessions ─────>│                            │                          │                            │
   │                                 │─── startSession(ctx, req)─>│                          │                            │
   │                                 │                            │─── load Exam & Vers ─────────────────────────────────>│
   │                                 │                            │<── return exam, vers ─────────────────────────────────│
   │                                 │                            │─── createPlan(exam, seed)──>│                         │
   │                                 │                            │<── return Plan ─────────────│                         │
   │                                 │                            │─── startSession(plan) ─────>│                         │
   │                                 │                            │<── return Session ──────────│                         │
   │                                 │                            │─── save Session ─────────────────────────────────────>│
   │                                 │                            │─── sanitizeExecutionPlan()                            │
   │<── 201 Created (Sanitized) ─────│<───────────────────────────│                                                       │
   │                                 │                            │                                                       │
   │─── 2. POST /autosave ──────────>│                            │                                                       │
   │                                 │─── autosave(ctx, answers)─>│                                                       │
   │                                 │                            │─── validate & update ────>│                           │
   │                                 │                            │─── updateSession ────────────────────────────────────>│
   │<── 200 OK (savedAt) ────────────│<───────────────────────────│                                                       │
   │                                 │                            │                                                       │
   │─── 3. POST /submit ────────────>│                            │                                                       │
   │                                 │─── submit(ctx, answers)───>│                                                       │
   │                                 │                            │─── submit() ─────────────>│                           │
   │                                 │                            │─── grade() ──────────────>│                           │
   │                                 │                            │─── buildResult() ────────>│                           │
   │                                 │                            │─── save Submission, Grade, Result ───────────────────>│
   │<── 200 OK (resultId) ───────────│<───────────────────────────│                                                       │
```

---

### PHẦN II: CƠ CHẾ ĐỒNG HỒ & THỜI GIAN HẾT HẠN MÁY CHỦ (SERVER TIMER SEMANTICS)

#### 1. Công thức Thiết lập Mốc Hết hạn Chính thức
Khi thí sinh bấm bắt đầu làm bài, máy chủ ghi nhận mốc thời gian UTC hiện tại `startedAt`. Mốc hết hạn `expiresAt` được tính toán:

$$\text{expiresAt} = \text{startedAt} + (\text{durationMinutes} \times 60\text{s}) + 30\text{s (Buffer Mạng Kỹ thuật)}$$

- **30 giây Buffer Mạng:** Dành cho độ trễ tải trang ban đầu, khởi tạo DOM, nạp tài nguyên hình ảnh và thiết lập kết nối WebSocket/HTTP giữa máy khách và máy chủ.

#### 2. Vùng Đệm Nộp bài (15s Grace Period for Network Jitter)
Khi thí sinh gửi bài nộp chính thức (`POST /api/v3/exam-sessions/:id/submit`):
- Máy chủ chấp nhận yêu cầu nộp bài nếu:

$$\text{serverNow} \le \text{expiresAt} + 15\text{s}$$

- **15 giây Grace Buffer:** Bù đắp cho độ trễ truyền gói tin HTTP khi mạng chập chờn ở giây cuối cùng.
- Nếu $\text{serverNow} > \text{expiresAt} + 15\text{s}$, máy chủ lập tức:
  1. Chuyển trạng thái phiên thi sang `expired`.
  2. Cập nhật cơ sở dữ liệu `exam_sessions/{sessionId}`.
  3. Từ chối bài nộp và trả về mã lỗi `SESSION_EXPIRED` (HTTP 410). Thí sinh không thể tiếp tục gửi bài.

#### 3. Đồng hồ Phía Trình duyệt (Client Display Timer Contract)
- Bộ đếm thời gian hiển thị trên giao diện người dùng (UI Countdown Timer) được tính từ hiệu số giữa `expiresAt` do máy chủ cấp và `serverNow` (được đồng bộ định kỳ qua header hoặc phản hồi API).
- Máy khách **hoàn toàn không có quyền can thiệp hay gia hạn** mốc thời gian này.
- Mọi nỗ lực chỉnh sửa đồng hồ hệ điều hành (Local Machine Clock Manipulation) của thí sinh không có tác dụng, vì kiểm tra hạn chót được thực thi bằng đồng hồ nguyên tử của máy chủ.

---

### PHẦN III: HỢP ĐỒNG LƯU TẠM BÀI THI (AUTOSAVE CONTRACT)

Nhằm đảm bảo không mất bài làm khi gặp sự cố mạng hoặc tắt nhầm trình duyệt, máy khách gửi gói tin lưu tạm định kỳ (`POST /api/v3/exam-sessions/:id/autosave`).

#### Quy tắc Thực thi tại Máy chủ:
1. **Kiểm tra Trạng thái Phiên:**
   - Phiên thi bắt buộc phải ở trạng thái `in_progress`.
   - Nếu phiên thi đã ở trạng thái kết thúc (`submitted`, `grading`, `graded`), máy chủ trả lỗi `SUBMISSION_CLOSED` (HTTP 423).
   - Nếu phiên thi đã quá hạn (`serverNow > expiresAt`), máy chủ cập nhật trạng thái sang `expired` và trả lỗi `SESSION_EXPIRED` (HTTP 410).
2. **Xác thực Cấu trúc Dữ liệu Trả lời:**
   - Chỉ các trường dữ liệu tương ứng với mã câu hỏi (`questionId`) có mặt trong `session.questionVersionReferences` mới được chấp nhận.
   - Nếu gói tin chứa câu hỏi lạ không thuộc đề thi, máy chủ từ chối với lỗi `VALIDATION_ERROR` (HTTP 422).
3. **Tước bỏ Trường Dữ liệu Xâm phạm:**
   - Mọi trường do client tự đính kèm nhằm gian lận (như `score`, `points`, `awardedPoints`, `isCorrect`) đều bị loại bỏ hoàn toàn trước khi lưu vào `session.autosaveState`.
4. **Không Thay đổi Trạng thái Kết thúc:**
   - Thao tác `autosave` **tuyệt đối không bao giờ** chuyển phiên thi sang `submitted` hay kích hoạt động cơ chấm điểm.
   - `autosaveState` chỉ ghi nhận: `lastSavedAt`, `savedAnswersCount`, và `answersPayload`.

---

### PHẦN IV: QUY TRÌNH NỘP BÀI CHÍNH THỨC & BẢO CHỨNG CHỐNG TRÙNG LẶP (SUBMISSION & IDEMPOTENCY)

#### 1. Kiểm soát Đơn nhất (Single-Submission Enforcement)
1. Xác thực quyền sở hữu: `userContext.codeId === session.studentCodeId`.
2. Kiểm tra thời gian: $\text{serverNow} \le \text{expiresAt} + 15\text{s}$.
3. Xác thực câu hỏi và phiên bản:
   - Tất cả câu trả lời phải tham chiếu đúng `questionId` và `questionVersionId` đã được ghim trong phiên thi.
   - Nếu phát hiện thí sinh nộp trùng nhiều đáp án cho cùng một câu hỏi $\rightarrow$ Trả lỗi `VALIDATION_ERROR`.
   - Nếu phát hiện thí sinh tự sửa đổi `questionVersionId` $\rightarrow$ Trả lỗi `VALIDATION_ERROR`.
4. Khóa phiên thi: Chuyển `session.status` sang `submitted`.

#### 2. Tính Lũy đẳng khi Nộp bài (Idempotency Contract)
- Trường hợp thí sinh bấm nộp bài nhiều lần liên tiếp (Double Click) hoặc mạng bị trễ khiến trình duyệt gửi lại yêu cầu:
  - Máy chủ kiểm tra nếu phiên thi đã ở trạng thái `submitted` hoặc `graded`, đồng thời bản ghi `submissions/{sessionId}` đã tồn tại:
  - Máy chủ không ném lỗi sập hệ thống, mà trả về phản hồi thành công xác nhận kèm cờ:
    ```json
    {
      "success": true,
      "sessionId": "ses_001",
      "status": "graded",
      "submittedAt": "2026-09-16T12:45:00.000Z",
      "resultId": "res_ses_001",
      "isIdempotentReplay": true
    }
    ```
  - Cơ chế này bảo vệ toàn vẹn dữ liệu điểm số, ngăn chặn việc chấm lại nhiều lần làm sai lệch thống kê.

---

### PHẦN V: ĐỘNG CƠ CHẤM ĐIỂM TỰ ĐỘNG & BẢO VỆ ĐIỂM SỐ CHÍNH THỨC

Ngay sau khi bản ghi `Submission` được tạo, máy chủ tự động điều phối chấm thi qua `ExamEngine`:

1. **Câu hỏi Khách quan (Objective Questions):**
   - 8 loại câu hỏi khách quan (`single_choice`, `multiple_choice`, `true_false`, `short_answer`, `numeric`, `matching`, `ordering`, `fill_blank`) được chấm điểm tự động tức thì trên máy chủ bằng plugin tương ứng trong `QuestionRegistry`.
   - Áp dụng thang điểm bậc thang GDPT 2018 cho câu Đúng/Sai 4 ý:
     $$\text{Đúng 1 ý: } 0.1\text{đ} \quad\longrightarrow\quad \text{Đúng 2 ý: } 0.25\text{đ} \quad\longrightarrow\quad \text{Đúng 3 ý: } 0.5\text{đ} \quad\longrightarrow\quad \text{Đúng 4 ý: } 1.0\text{đ}$$
2. **Câu hỏi Tự luận & Chấm Thủ công (Manual Review):**
   - Câu hỏi loại `essay` được đánh dấu `needsManualReview: true`, gán điểm tạm thời là 0 và bài thi có trạng thái kết quả là `provisional`.
   - Giáo viên phụ trách sử dụng endpoint `POST /api/v3/grading/manual` để chấm điểm và cung cấp nhận xét sư phạm (`teacherFeedback`).
3. **Ranh giới Bảo vệ Chấm điểm AI (AI Grading Guardrails):**
   - Điểm số gợi ý từ mô hình trí tuệ nhân tạo (`aiSuggestedPoints`) chỉ được xem là dữ liệu tham khảo nội bộ.
   - Điểm số AI **tuyệt đối không bao giờ được tự ý chốt thành điểm chính thức** nếu thiếu chữ ký số xác thực của giáo viên/người duyệt (`reviewerCodeId`). Nỗ lực chốt điểm không có người duyệt sẽ bị từ chối với lỗi `FORBIDDEN`.

---

### PHẦN VI: BẢNG ÁNH XẠ MÃ LỖI CHUẨN TẮC (ERROR MAPPING MATRIX)

Tất cả các ngoại lệ trong quá trình thao tác phiên thi đều trả về định dạng phong bì lỗi tiêu chuẩn:

```json
{
  "success": false,
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Phiên làm bài đã quá thời gian quy định và đã tự động đóng.",
    "details": [],
    "retryAllowed": false
  }
}
```

| Tình huống Nghiệp vụ | Mã Lỗi (`code`) | Mã HTTP | `retryAllowed` |
|---|---|---|---|
| Chưa đăng nhập hoặc thiếu Bearer Token | `UNAUTHENTICATED` | 401 Unauthorized | `false` |
| Truy cập phiên thi của học sinh khác / Không thuộc lớp học | `FORBIDDEN` | 403 Forbidden | `false` |
| Đề thi, phiên thi hoặc kết quả không tồn tại | `NOT_FOUND` | 404 Not Found | `false` |
| Đề thi đã lưu trữ (Archived) hoặc phiên bị hủy | `CONFLICT` | 409 Conflict | `false` |
| Quá hạn nộp bài (vượt quá thời gian thi + 15s đệm) | `SESSION_EXPIRED` | 410 Gone | `false` |
| Dữ liệu nộp bài chứa câu hỏi lạ, câu hỏi trùng lặp hoặc sửa đổi version | `VALIDATION_ERROR` | 422 Unprocessable Entity | `false` |
| Phiên thi đã nộp hoặc đã chấm xong trước đó | `SUBMISSION_CLOSED` | 423 Locked | `false` |
| Hệ thống chấm điểm tự động quá tải hoặc gặp sự cố tạm thời | `GRADING_UNAVAILABLE` | 503 Service Unavailable | `true` |
| Lỗi hệ thống nội bộ máy chủ | `INTERNAL_ERROR` | 500 Internal Server Error | `true` |

---

### PHẦN VII: BẢO MẬT ĐỊNH DANH & BẢO TOÀN DỮ LIỆU SẢN XUẤT

1. **Bảo tồn Tuyệt đối NDID Chuỗi Gốc:**
   - Trường `studentNdid` trong `Result` lưu trữ chính xác chuỗi từ `users/{CodeID}.ndid` (Raw String).
   - Tuyệt đối không thêm ký tự tiền tố `@`.
   - Tuyệt đối không suy diễn NDID từ email, display name hay UID.
2. **Bảo vệ Bất biến Tài khoản Chủ sở hữu (Owner CodeID 0000):**
   - Quyền hạn tối cao `adminLevel === 'owner'` của tài khoản `0000` được bảo chứng độc lập tại tầng phân quyền hệ thống.
3. **An toàn Cơ sở Dữ liệu V2 & Thời khóa biểu (TimeTable Safety):**
   - Toàn bộ dữ liệu V2 (Quizzes, Classrooms, Attempts) và toàn bộ hệ thống Thời khóa biểu (TimeTable) được giữ nguyên vẹn 100%, không bị sửa đổi, di chuyển hoặc ghi đè trong suốt quá trình vận hành của Động cơ V3.

---

### PHẦN VIII: KIẾN TRÚC THỰC THI MÁY CHỦ BẢO CHỨNG LIVE (PHASE 5.1 VERIFIED BOUNDARY)

Để khẳng định tính Server-Authoritative thực chất thay vì chỉ là thư viện client-side, hệ thống phân tách rõ rệt 5 tầng kiến trúc:

```
[Client / Browser Runner]
          │  (HTTP Request mang Bearer token)
          ▼
[Tầng C: HTTP / API Gateway & Routing]
   • vercel.json: Rewrite /api/v3/(.*) ──> api/v3.js?endpoint=$1
   • api/v3.js: Vercel Serverless Function entrypoint
          │
          ▼
[Tầng B: Server / Backend Adapter]
   • src/eduspace/backend/assessmentBackend.ts (handleAssessmentApi)
   • Xác thực Token: Firebase Admin Auth verifyIdToken(token) ──> decoded.uid === CodeID
   • Nhận diện Danh tính Chuẩn tắc: users/{CodeID} ──> canonical NDID (Raw String, không @)
   • Chống tràn luồng request: parseRequestBody non-blocking, timeout protection
          │
          ▼
[Tầng A: Lõi Khảo thí V3 Độc lập Framework (Assessment Core)]
   • src/eduspace/assessment/sessionService.ts (ExamSessionService)
   • src/eduspace/engine/pipeline/examEngine.ts (ExamEngine, PRNG Mulberry32)
   • Điều phối: StateMachine, ServerTimer, GDPT 2018 True/False Ladder, ResultBuilder
          │
          ▼
[Tầng D: Tầng Cơ sở Dữ liệu Tin cậy & Repositories]
   • src/eduspace/core/repositories/firestoreRepository.ts
   • Firestore Admin SDK: Ghi nhận độc quyền vào exam_sessions, submissions, grading_records, results
   • firestore.rules: Client Deny tuyệt đối (match /{document=**} { allow read, write: if false; })
          │
          ▼
[Tầng E: Client-Facing Sanitized DTOs]
   • src/eduspace/assessment/sanitizer.ts (sanitizeExecutionPlan)
   • Loại bỏ 100% answer keys trước khi gửi về client
```

