# EDUSPACE V3 CANONICAL EXAM ENGINE SPECIFICATION
## Động cơ Khảo thí Chuẩn tắc, Ma trận Phiên thi Bất biến & Hệ thống Chấm thi Máy chủ Bảo chứng

> **Tài liệu tham chiếu:** [docs/eduspace-v3-architecture.md](eduspace-v3-architecture.md), [docs/eduspace-v3-database-schema.md](eduspace-v3-database-schema.md), [docs/eduspace-v3-api-contract.md](eduspace-v3-api-contract.md), [docs/eduspace-v3-domain-foundation.md](eduspace-v3-domain-foundation.md), [.agents/AGENTS.md](../.agents/AGENTS.md)  
> **Dự án:** EduSpace by ND Labs (Phiên bản V3.0)  
> **Giai đoạn:** Phase 4 — Canonical Exam Engine  
> **Trạng thái:** HOÀN TẤT & XÁC THỰC BẢO CHỨNG TỰ ĐỘNG (56/56 TESTS PASSED)  
> **Ngày cập nhật:** 16/09/2026  

---

### TỔNG QUAN KIẾN TRÚC ĐỘNG CƠ (EXECUTIVE ARCHITECTURAL SUMMARY)

Động cơ Khảo thí Chuẩn tắc (Canonical Exam Engine V3) là trái tim vận hành việc tổ chức thi cử, tạo đề ngẫu nhiên có kiểm soát, quản lý phiên làm bài và chấm điểm trong hệ thống EduSpace V3.

Động cơ được thiết kế theo các nguyên tắc nền tảng:
1. **Hoàn toàn độc lập với Framework (Framework-Independent):** Không phụ thuộc trực tiếp vào React, DOM, HTML, Tailwind hay Firebase SDK. Động cơ là một hệ thống thuần logic toán - nghiệp vụ (Pure TypeScript Domain Engine), có thể chạy đồng nhất trên Node.js (Cloud Functions backend) cũng như trong môi trường Test hoặc Client Runner offline.
2. **Khách thể Bất tín nhiệm (Client Untrusted):** Client trình duyệt tuyệt đối không có quyền tự quyết định điểm số, thời gian hết hạn hoặc đáp án đúng. Mọi thông tin `score`, `awardedPoints`, `correctAnswers` gửi từ trình duyệt lên đều bị loại bỏ ngay tại lớp kiểm tra hợp lệ.
3. **Bảo mật Đáp án Tuyệt đối (Answer Key Isolation):** Kế hoạch thi (`ExamExecutionPlan`) trả về cho thí sinh chỉ chứa nội dung câu hỏi (`prompt`, `mediaAssets`, `options`), **loại bỏ hoàn toàn 100% cấu hình chấm (`gradingConfig`) và đáp án đúng**.
4. **Ngẫu nhiên hóa Xác định (Deterministic Randomization):** Sử dụng hàm băm PRNG (Mulberry32) gắn với mã `attemptSeed`. Cùng một bộ `(Exam + QuestionVersions + attemptSeed)` luôn sinh ra thứ tự câu hỏi và phương án giống hệt nhau mà **tuyệt đối không dùng `Math.random()`**.
5. **Tính Bất biến của Phiên bản Câu hỏi (Question Version Immutability):** Mỗi câu hỏi trong phiên thi được gắn chặt với một `questionVersionId` cụ thể. Dù giáo viên sửa câu hỏi sau khi học sinh đã vào thi, phiên thi đang chạy vẫn giữ nguyên phiên bản gốc.

---

### PHẦN I: VÒNG ĐỜI KHẢO THÍ (EXAM EXECUTION PIPELINE)

Quy trình khảo thí trong V3 được phân rã thành 6 giai đoạn logic độc lập, dễ dàng kiểm thử:

```
┌───────────┐      1. Create Plan       ┌───────────────────┐
│   Exam    │ ────────────────────────> │ ExamExecutionPlan │
└───────────┘                           └───────────────────┘
                                                  │
                                                  │ 2. Start Session
                                                  ▼
┌───────────┐      4. Submit            ┌───────────────────┐
│Submission │ <──────────────────────── │    ExamSession    │ <─── 3. Autosave (Idempotent)
└───────────┘                           └───────────────────┘
      │
      │ 5. Grade
      ▼
┌───────────────┐  6. Build Result      ┌───────────────────┐
│ GradingRecord │ ────────────────────> │      Result       │
└───────────────┘                       └───────────────────┘
```

1. **Giai đoạn 1: `Exam` $\rightarrow$ `ExamExecutionPlan`**
   - Xác thực đề thi và các câu hỏi cấu thành bằng `ExamValidator` & `QuestionValidator`.
   - Sinh bộ xáo trộn ngẫu nhiên xác định từ `attemptSeed`.
   - Tạo kế hoạch thi `ExamExecutionPlan` gồm các phần thi (`PlanSection`) và câu hỏi thi (`PlanQuestion`) đã tách sạch barem đáp án.
2. **Giai đoạn 2: `ExamExecutionPlan` $\rightarrow$ `ExamSession`**
   - Thiết lập thời gian máy chủ: `startedAt` (Server-authoritative time).
   - Tính toán mốc hết hạn chính thức: `expiresAt = startedAt + durationMinutes + 30s (buffer mạng)`.
   - Ghim cố định danh sách `questionVersionReferences`.
3. **Giai đoạn 3: `Autosave` (Lưu bài tạm)**
   - Cho phép định kỳ lưu bài làm. Đảm bảo phiên thi chưa hết hạn và đang ở trạng thái `in_progress`.
4. **Giai đoạn 4: `ExamSession` $\rightarrow$ `Submission` (Nộp bài)**
   - Khóa phiên thi, chuyển trạng thái sang `submitted`.
   - `SubmissionValidator` kiểm tra tính hợp lệ của bài nộp, loại bỏ câu hỏi lạ, câu hỏi trùng lặp, câu hỏi sửa đổi `questionVersionId`, và tước bỏ toàn bộ các trường điểm số do client tự gửi.
5. **Giai đoạn 5: `Submission` $\rightarrow$ `GradingRecord` (Chấm điểm)**
   - Nạp các `QuestionVersion.gradingConfig` nguyên bản trên máy chủ.
   - Điều phối qua `GradingEngine` gọi từng plugin câu hỏi để chấm điểm khách quan và áp dụng thang điểm bậc thang GDPT 2018.
6. **Giai đoạn 6: `GradingRecord` $\rightarrow$ `Result` (Kết quả chính thức)**
   - Tổng hợp điểm theo từng phần thi (`sectionScores`).
   - Giữ nguyên vẹn 100% `studentNdid` chuỗi gốc (Raw String, không tiền tố `@`).

---

### PHẦN II: QUESTION TYPE REGISTRY (9 LOẠI CÂU HỎI)

Thay vì dùng các khối `if/else` hoặc `switch` khổng lồ rải rác, hệ sinh thái V3 sử dụng kiến trúc Plugin Registry:

```typescript
export interface QuestionTypeDefinition<TContent = any, TGrading = any, TResponse = any> {
  readonly type: QuestionType;
  readonly defaultGradingMethod: GradingMethod;
  readonly supportsAutomaticGrading: boolean;
  validateDefinition(content: TContent, gradingConfig: TGrading): void;
  validateResponse(response: TResponse, content: TContent): void;
  evaluate(response: TResponse, content: TContent, gradingConfig: TGrading, allocatedPoints: number): QuestionEvaluation;
}
```

#### Ma trận 9 Plugin Câu hỏi Chuẩn tắc:
| Loại câu hỏi (`type`) | Phương thức mặc định | Tự động chấm | Quy tắc đánh giá & Barem điểm |
|---|---|---|---|
| `single_choice` | `automatic` | Có | So khớp `selectedOptionId === correctOptionId`. Đúng nhận đủ điểm, sai 0 điểm. |
| `multiple_choice` | `automatic` | Có | So khớp tập hợp các phương án. Hỗ trợ chấm từng phần (`partialScoring`): số câu đúng trừ số câu sai. |
| `true_false` | `automatic` | Có | **Thang điểm GDPT 2018:** 4 ý độc lập: đúng 1 ý $\rightarrow$ 0.1đ; đúng 2 ý $\rightarrow$ 0.25đ; đúng 3 ý $\rightarrow$ 0.5đ; đúng 4 ý $\rightarrow$ 1.0đ (nhân theo tỷ lệ `allocatedPoints`). |
| `short_answer` | `automatic` | Có | So khớp với danh sách `acceptableAnswers`, cấu hình phân biệt hoa thường và khoảng trắng. |
| `numeric` | `automatic` | Có | Kiểm tra $| \text{submitted} - \text{exactValue} | \le \text{tolerance}$. Hỗ trợ dấu phẩy và dấu chấm thập phân. |
| `essay` | `manual` | Không | Đánh dấu `needsManualReview: true`, trả điểm 0 ban đầu cho đến khi có giáo viên chấm điểm. |
| `matching` | `automatic` | Có | Ghép nối từng cặp. Điểm tính theo tỷ lệ cặp ghép đúng trên tổng số cặp. |
| `ordering` | `automatic` | Có | Sắp xếp thứ tự danh sách. Đúng toàn bộ thứ tự nhận đủ điểm. |
| `fill_blank` | `automatic` | Có | Điền từ vào chỗ trống. Điểm tỷ lệ theo số chỗ trống điền khớp với danh mục chấp nhận. |

---

### PHẦN III: HỆ THỐNG MÁY TRẠNG THÁI PHIÊN THI (SESSION STATE MACHINE)

```
        ┌─────────────┐
        │   created   │
        └─────────────┘
          │         │
          │         ▼
          │    ┌───────────┐
          │    │ cancelled │ (Terminal)
          │    └───────────┘
          ▼
   ┌─────────────┐
   │ in_progress │
   └─────────────┘
     │         │
     │         ▼
     │    ┌───────────┐
     │    │  expired  │
     │    └───────────┘
     │          │
     ▼          ▼
   ┌─────────────┐
   │  submitted  │
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │   grading   │
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │   graded    │ (Terminal)
   └─────────────┘
```

#### Quy tắc Bất biến về Trạng thái:
1. Trạng thái `graded` và `cancelled` là các trạng thái kết thúc (Terminal states).
2. Phiên thi đã ở trạng thái `graded` hoặc `submitted` **tuyệt đối không được phép quay lại `in_progress`** (ném lỗi HTTP 423 `SUBMISSION_CLOSED`).
3. Phiên thi đã `expired` **tuyệt đối không được phép quay lại `in_progress`** (ném lỗi HTTP 410 `SESSION_EXPIRED`). Tuy nhiên, bài thi đã hết giờ vẫn có thể chuyển sang `grading` để chấm các câu đã kịp autosave.

---

### PHẦN IV: RANH GIỚI BẢO MẬT VÀ QUYỀN HẠN CỐT LÕI

1. **Ranh giới Chấm điểm AI (AI Grading Security Boundary):**
   Được kiểm soát qua `GradingRegistry.assertCanFinalize`:
   - Phương thức `ai_assisted` **tuyệt đối không được tự ý chốt điểm chính thức** nếu thiếu chữ ký người duyệt (`reviewerCodeId`).
   - Nếu gọi chốt điểm AI mà không có giáo viên phê duyệt, hệ thống ném `EduSpaceError.forbidden`.
2. **Khóa Chống Trùng lặp Nộp bài (Submission Idempotency Boundary):**
   - Mã `sessionId` đồng thời là khóa định danh cho `Submission`, `GradingRecord` và `Result`.
   - Việc thí sinh gửi yêu cầu nộp bài lần thứ hai trên cùng một phiên thi sẽ bị từ chối ngay lập tức với mã lỗi `SUBMISSION_CLOSED`.
3. **Bảo tồn Bất biến Tài khoản Owner CodeID 0000:**
   - Hàm `isOwner` xác minh đồng thời `codeId === '0000'` VÀ `adminLevel === 'owner'`. Kẻ mạo danh có `codeId === '0000'` nhưng `adminLevel !== 'owner'` sẽ bị từ chối hoàn toàn.
4. **Quy chuẩn NDID RAW STRING (3 Nguyên tắc):**
   - Khi tạo kết quả (`ResultBuilder`), trường `studentNdid` được bảo lưu 100% nguyên trạng từ cơ sở dữ liệu.
   - Tuyệt đối không tự ý chèn tiền tố `@`.
   - Không chạy hàm lọc / xóa ký tự đối với NDID đã lưu sẵn trong hệ thống.

---

### PHẦN V: TỔNG KẾT KIỂM THỬ TỰ ĐỘNG & BẢO CHỨNG HỆ THỐNG

Toàn bộ 56 bài kiểm tra đơn vị trên 21 test suites đã thực thi thành công mỹ mãn:

```
# Lệnh chạy:
npx tsx --test tests/eduspace/v3-domain-foundation.test.ts tests/eduspace/v3-exam-engine.test.ts

▶ EduSpace V3 Constants & Enums (3/3 passed)
▶ Schema Version Detection & Isolation (3/3 passed)
▶ Question Normalization & V2 Adapter (4/4 passed)
▶ Exam Normalization & V2 Quiz Adapter (2/2 passed)
▶ Classroom Normalization & NDID Raw String Rules (1/1 passed)
▶ Attempt / Result Normalization & Raw String NDID (1/1 passed)
▶ EduSpaceError Canonical Error System (2/2 passed)
▶ Domain Permission & Identity Helpers (3/3 passed)
▶ In-Memory Repository Contracts & Operations (2/2 passed)
▶ EduSpaceApiClient Error Mapping & Request Handling (3/3 passed)
▶ Question Registry & Question Type Plugins (5/5 passed)
▶ True/False GDPT 2018 Partial Scoring Ladder (5/5 passed)
▶ Exam Validator & Section Restrictions (3/3 passed)
▶ Deterministic Randomization & Version Immutability (3/3 passed)
▶ Session State Machine & Lifecycle Transitions (3/3 passed)
▶ Server Timer Abstraction & Expiration (2/2 passed)
▶ Submission Validation & Tampering Protections (4/4 passed)
▶ Grading Capabilities & AI Review Isolation (2/2 passed)
▶ Full Assessment Engine Lifecycle & Idempotency (2/2 passed)
▶ V2 Compatibility: Engine Consuming Adapted Legacy Quiz (1/1 passed)
▶ Engine Security & Identity Invariant Tests (2/2 passed)

ℹ tests 56
ℹ suites 21
ℹ pass 56
ℹ fail 0
```

- **Kiểm tra biên dịch Typecheck (`npm run lint` - `tsc --noEmit`):** Exit code 0, 0 lỗi biên dịch.
- **Kiểm tra đóng gói sản xuất (`npm run build` - `vite build`):** Cả ứng dụng chính và phân hệ TimeTable đóng gói thành công 100%.
- **Số hiệu phiên bản hệ thống:** Đã cập nhật trong [assets/js/version.js](file:///d:/Project/WebSite/ND%20Labs/assets/js/version.js) thành `ver:1.9.16.1237`.
- **Hệ thống được bảo vệ an toàn:**
  - `TimeTable` hoàn toàn không bị sửa đổi.
  - Dữ liệu `quizzes` V2 nguyên vẹn.
  - Hợp đồng Auth và tài khoản Owner `0000` được bảo toàn nguyên vẹn.
  - Không tạo tài khoản thử nghiệm, không tiêu tốn quỹ CodeID, không deploy, không push Git.
