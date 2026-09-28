# SYSTEM STATE AUDIT: ADMIN & EDUSPACE EXAM / ASSESSMENT SYSTEM

**Date:** September 21, 2026  
**Audit Target:** `/admin` Portal & EduSpace Examination / Assessment System (V2 & V3)  
**Status:** CURRENT STATE TECHNICAL DOCUMENT (VERIFIED REALITY)

---

## SECTION A — SYSTEM OVERVIEW

### Repository & Application Architecture

The ND Labs platform is a multi-tier web application built on static HTML frontend pages, Vite/React SPA modules, a server-authoritative V3 TypeScript assessment core, Vercel Serverless Functions, and Firebase Cloud Infrastructure.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CLIENT LAYER                                       │
│  ┌───────────────────────┐  ┌─────────────────────────────┐  ┌──────────────────────┐  │
│  │     Admin Portal      │  │  EduSpace V2 Exam Runner    │  │ Vite/React Apps      │  │
│  │ (/admin/dashboard.html│  │ (/eduspace/exam/index.html  │  │ (Timetable, Beta,    │  │
│  │  /admin/edu/index.html│  │  + eduspace/template.html)  │  │  MiniWorld, Main)    │  │
│  └───────────┬───────────┘  └──────────────┬──────────────┘  └──────────┬───────────┘  │
└──────────────┼─────────────────────────────┼────────────────────────────┼──────────────┘
               │                             │                            │
               ▼                             ▼                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SECURITY & API LAYER                                 │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │         Vercel Auth API Endpoint        │  │     Vercel V3 Assessment Backend    │  │
│  │              (/api/auth.js)             │  │             (/api/v3.js)            │  │
│  └────────────────────┬────────────────────┘  └──────────────────┬──────────────────┘  │
└───────────────────────┼──────────────────────────────────────────┼─────────────────────┘
                        │                                          │
                        ▼                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND CORE & INFRA                                  │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   Firebase Auth / Firestore Rules       │  │   V3 Engine & Server Authority      │  │
│  │    (UID = CodeID, Owner Gating)         │  │ (ExamEngine, Session, Sanitizer)    │  │
│  └────────────────────┬────────────────────┘  └──────────────────┬──────────────────┘  │
│                       │                                          │
│                       ▼                                          ▼
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                        Firestore Database Admin SDK                              │  │
│  │  (users, quizzes, eduspace_lessons, attempts, exams, exam_sessions, results)    │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### System Component Classification

| System Component | Status | Implementation Details & Source Files |
| :--- | :--- | :--- |
| **Canonical Auth System** | `IMPLEMENTED` | `/api/auth.js`, `/assets/js/canonical-auth.js`, `firestore.rules`. UID = CodeID, sequential allocation (`0001`, `0002`...), Owner `0000` invariant. |
| **`/admin` Portal Shell** | `IMPLEMENTED` | `/admin/dashboard.html`. User directory, audit logs, role modification modal (Owner gated), system announcements. |
| **EduSpace Authoring Admin** | `IMPLEMENTED` | `/admin/edu/index.html`. Single-page editor for Word/Text import, Gemini AI question extraction, visual editor, test runner, and direct Firebase sync. |
| **EduSpace V2 Exam Runner** | `LEGACY` | `/eduspace/exam/index.html` loading `/eduspace/template.html`. Client-side quiz loading, timer, answer state, and direct client Firestore submission to `attempts`. |
| **EduSpace V3 Domain Foundation** | `IMPLEMENTED` | `src/eduspace/core/domain/` (`exam.ts`, `question.ts`, `session.ts`). 9 question types, canonical schema V1. |
| **EduSpace V3 Exam Engine** | `IMPLEMENTED` | `src/eduspace/engine/` (`examEngine.ts`, `gradingEngine.ts`, `examPlanner.ts`, `prng.ts`). Server-side planning, PRNG attempt seed, GDPT 2018 grading ladder. |
| **EduSpace V3 Server Authority** | `IMPLEMENTED` | `src/eduspace/assessment/sessionService.ts`, `src/eduspace/backend/assessmentBackend.ts`, `api/v3.js`. HTTP `/api/v3/exam-sessions`, 0% answer key leakage, server clock timer, 15s grace buffer, idempotent submission. |
| **V2 → V3 Read-Only Adapters** | `IMPLEMENTED` | `src/eduspace/core/normalizers/` (`v2QuizAdapter.ts`, `v2AttemptAdapter.ts`, `v2ClassroomAdapter.ts`). Normalizes V2 documents at runtime without mutating legacy data. |
| **Teacher V3 Dashboard UI** | `PARTIAL` | Backend APIs (`/api/v3/...`) are fully built and tested; Teacher UI pages (`/eduspace/teacher/`, `/eduspace/taode/`) currently still interface with V2 collections (`quizzes`, `classrooms`, `attempts`). |
| **Student V3 UI Runner Integration** | `PLANNED` | React/TS Student Exam Runner consuming `/api/v3/exam-sessions` directly instead of legacy V2 client-side runner. |

---

## SECTION B — CURRENT AUTH / IDENTITY CONTRACT

### Canonical Identity Specification

1. **Firebase Auth UID = CodeID**
   - The primary key for every user in the system is an immutable, sequentially allocated numeric string (`0001`, `0002`, `0003`...).
   - Firebase Auth `user.uid` is strictly equal to `CodeID`.
   - `CodeID: 0000` is reserved exclusively as the immutable System Owner.

2. **Canonical NDID Contract (3 Core Principles)**
   - **Form Input Validation Only:** Regex `/^[a-zA-Z0-9_.]+$/` is applied ONLY on user registration/edit forms.
   - **Database Preservation (RAW STRING):** NDIDs stored in Firestore are preserved 100% as raw strings (including special characters `@`, `#`, `$`, spaces if assigned by Admin). Code NEVER runs sanitize, strip, or replace filters when rendering existing NDIDs.
   - **Zero Automatic Prefixing:** Code MUST NEVER prepend `@` to NDID strings in UI or API logic (e.g. renders `${ndid}`, NOT `@${ndid}`).

3. **Authentication Methods**
   - **Email/Password:** Enforces mandatory email verification before login.
   - **Google OAuth:** Automatically creates or links Google identity to a single CodeID via server-side mapping collection `google_identities/{googleSubjectId}`.

4. **Owner / Admin Hierarchy**
   - **User Role (`role`):** `user` (default) or `admin`.
   - **Admin Level (`adminLevel`):** `none` (default), `admin` (standard admin), `owner` (system owner).
   - **Owner Privilege:** Only accounts with `adminLevel === 'owner'` can execute role updates or promote accounts via `updateUserRole` in `/api/auth.js`.

5. **User Determination in Admin & EduSpace**
   - **Client-Side:** Managed by `window.canonicalAuth` (`/assets/js/canonical-auth.js`). Subscribes to Firebase Auth `onAuthStateChanged`, fetches profile from `users/{CodeID}`, and caches in `localStorage`.
   - **Backend API:** Managed by `authenticateServerRequest` in `src/eduspace/backend/assessmentBackend.ts`. Extracts `Authorization: Bearer <idToken>`, verifies token using Firebase Admin Auth, resolves `codeId = decoded.uid`, and reads profile from `users/{codeId}`.

---

## SECTION C — `/admin` COMPLETE AUDIT

### Admin Routes Audit

| Route URL | Entry File | Purpose | Authentication | Authorization | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/admin` | `admin/index.html` | Redirects to `/admin/dashboard.html` | None | None | `ACTIVE` |
| `/admin/dashboard.html` | `admin/dashboard.html` | Central Admin Dashboard (Metrics, Users, Audit Logs, EduSpace links, Lotus Bot, Announcements) | Firebase Auth | `role === 'admin'` | `ACTIVE` |
| `/admin/edu/` | `admin/edu/index.html` | Central Admin & EduSpace Exam Authoring (Docx/Text import, AI question extraction, Test Runner, Firebase sync) | Firebase Auth | `role === 'admin'` | `ACTIVE` |
| `/admin/eduspace/` | `admin/eduspace/index.html` | Legacy EduSpace Lesson & Quiz Admin page | Firebase Auth | `role === 'admin'` | `ACTIVE` |
| `/admin/eduspace/timetable/` | `admin/eduspace/timetable/index.html` | Timetable Management App | Firebase Auth | `role === 'admin'` | `ACTIVE` |
| `/admin/lotus_bot/` | `admin/lotus_bot/index.html` | Lotus Bot Realtime Configuration | Firebase Auth | `role === 'admin'` | `ACTIVE` |
| `/eduspace/admin/` | `eduspace/admin/index.html` | Alternative entry to EduSpace Admin | Firebase Auth | `role === 'admin'` | `ACTIVE` |

### Dashboard UI Audit (`admin/dashboard.html`)

- **Loading Gate:** `#admin-loading` displays spinner while checking auth status.
- **Denied Screen:** `#admin-denied` blocks non-admin users with warning banner and logout button.
- **Header Profile Bar:** Displays user's raw NDID, CodeID, avatar initial, and role badge (`Chủ sở hữu` for Owner, `Quản trị viên` for Admin).
- **Tab Panels:**
  1. `overview`: Total active user count, current release version (`ver:1.9.21.1929`), canonical auth status, active role level, quick shortcut links.
  2. `users`: Paginated server-side user directory with search filter (CodeID, NDID, name, email) and role filter. Includes "Phân quyền" action button.
  3. `logs`: Security audit log table rendering recent events from Firestore `security_events` collection.
  4. `eduspace`: Navigation cards for EduSpace Central Admin (`/admin/edu/`) and Timetable (`/admin/eduspace/timetable/`).
  5. `lotus-bot`: Realtime Database bot status badge and configuration link.
  6. `announcements`: Broadcast system-wide notification form.
- **User Role Modal (`#modal-role`):** Displays target user profile details. Shows dropdowns for `role` and `adminLevel` if caller is Owner; shows lock notice if caller is non-owner Admin.

### Backend Execution Flow Audit

```
Admin Browser UI
  │
  ├─► window.canonicalAuth (assets/js/canonical-auth.js)
  │     │
  │     ├──► adminGetUsers({ pageSize, cursor, role })
  │     │      └─► POST /api/auth.js (action: 'admin-get-users')
  │     │            ├─► verifyIdToken(idToken) -> caller CodeID
  │     │            ├─► Read users/{callerCodeId} -> verify role == 'admin'
  │     │            └─► Query users collection -> Return user list
  │     │
  │     └──► updateUserRole({ targetCodeId, role, adminLevel })
  │            └─► POST /api/auth.js (action: 'update-user-role')
  │                  ├─► verifyIdToken(idToken) -> caller CodeID
  │                  ├─► Read users/{callerCodeId} -> verify adminLevel == 'owner'
  │                  ├─► Update users/{targetCodeId} role & adminLevel
  │                  └─► Log to security_events collection
  │
  └─► Firebase Client SDK (direct Firestore query for security_events)
        └─► Firestore Rules check: isCallerAdmin() -> Read allowed
```

### Owner vs Admin Permission Matrix

| Operation / Feature | Non-Admin User | Admin (`role === 'admin'`) | Owner (`adminLevel === 'owner'`) |
| :--- | :---: | :---: | :---: |
| Access `/admin/dashboard.html` | ❌ Denied | ✅ Allowed | ✅ Allowed |
| View System Metrics & Version | ❌ Denied | ✅ Allowed | ✅ Allowed |
| View User Directory | ❌ Denied | ✅ Allowed (Read-only) | ✅ Allowed |
| Change User Roles / Promote Admin | ❌ Denied | ❌ Denied | ✅ Allowed (`updateUserRole`) |
| Demote or Alter Owner `0000` | ❌ Denied | ❌ Denied | ❌ BLOCKED BY BACKEND INVARIANT |
| View Security Audit Logs | ❌ Denied | ✅ Allowed | ✅ Allowed |
| Author & Publish EduSpace Quizzes | ❌ Denied | ✅ Allowed | ✅ Allowed |
| Access Timetable Admin | ❌ Denied | ✅ Allowed | ✅ Allowed |

### Admin Security Audit Findings

1. **Client-Side Privilege Modification Protection:** Firestore Security Rules (`firestore.rules`) strictly enforce `allow create: if false;` and block updates to `role`, `adminLevel`, `codeId`, or `status` by client SDK calls. Role elevation MUST go through `/api/auth.js`.
2. **Owner Invariant Protection:** `/api/auth.js` enforces that target CodeID `0000` cannot have its role or admin level altered by any caller.
3. **Audit Log Integrity:** `security_events` and `admin_logs` collections have `allow write: if false;` in Firestore Rules, ensuring that only trusted backend serverless functions can write security audit events.

---

## SECTION D — EDUSPACE EXAM V2

### V2 Architecture & Data Flow

The legacy V2 examination runner resides in `/eduspace/exam/index.html` and `/eduspace/template.html`.

```
Student Browser (/eduspace/exam/?t111)
  │
  ├─► 1. Parse examId ('T111') from location query
  ├─► 2. Query Firestore: db.collection('quizzes').doc('T111')
  │       ├─► Check visibility ('public', 'private', 'classroom')
  │       └─► Load quizData object
  ├─► 3. Fetch /eduspace/template.html via HTTP
  ├─► 4. Inject template DOM into document.body and execute scripts
  │       ├─► Render activeQuestions array
  │       ├─► Initialize local timer (setInterval)
  │       └─► Track userAnswers in browser memory & localStorage
  ├─► 5. Student submits exam -> processSubmit()
  │       ├─► calculateScoreData() computes score in browser
  │       └─► window.submitAttemptToFirestore(score, correct, total)
  └─► 6. Write attempt to Firestore collection 'attempts/{attemptId}' via client SDK
```

### V2 Component Inspection

- **Quiz Loading:** `loadExam()` in `/eduspace/exam/index.html` reads `quizzes/{EXAM_ID}` from Firestore. Falls back to static `quizList` if Firestore doc is not found.
- **Visibility & Access Checks:** Evaluated client-side in `loadExam()`. Checks `qData.visibility === 'private'` (compares `auth.currentUser.uid === qData.creatorUid`) and `qData.visibility === 'classroom'` (queries `classrooms` collection to check if student UID is in `studentUids`).
- **Question Types Supported:**
  1. `multiple`: Trắc nghiệm 4 lựa chọn (choice index 0..3).
  2. `truefalse`: Đúng/Sai (array of booleans for 4 sub-statements).
  3. `short`: Trả lời ngắn (string equality check).
  4. `essay`: Tự luận (client marks `isCorrect = true` automatically).
- **Timer Management:** Local browser `setInterval` decrements `timerSeconds` every 1000ms. On timer expiry, calls `submitQuiz(true)`.
- **Question Navigation:** Maintained via browser state `currentIndex` (0-indexed) and rendered as interactive buttons in `#question-map`.
- **Answer Storage & Autosave:** State stored in memory array `userAnswers`. Local persistence relies on `localStorage.setItem('active_session_' + window.location.pathname, ...)` for crash recovery.
- **Scoring Engine:** Calculated purely in browser JS via `calculateScoreData()`:
  - `multiple`: `pointsPerQ` (default 0.25).
  - `truefalse`: `pointsPerQ` (default 1.0) with partial score ladder `[0.1, 0.25, 0.5, 1.0]`.
  - `short`: `pointsPerQ` (default 0.5) if cleaned input matches answer.
- **Attempt Submission:** `window.submitAttemptToFirestore` creates a new document directly in Firestore collection `attempts` using the client SDK:
  ```javascript
  await setDoc(doc(db, 'attempts', attemptId), {
      studentUid: user.uid,
      studentNdid: user.ndid || 'Khách',
      studentName: user.fullname || user.displayName || 'ND Member',
      quizId: window.quizData.quizId,
      quizTitle: window.quizData.title,
      score: score,
      correctAnswers: correct,
      totalQuestions: total,
      submittedAt: new Date().toISOString()
  });
  ```
- **AI-Assisted Grading / Help:** `askEduAI()` triggers client-side Gemini API call via `/assets/js/ai.js`. (Disabled during exam mode, enabled in practice mode).

---

## SECTION E — EDUSPACE V3 EXAM ENGINE

### V3 Domain Models & Schemas

The V3 Assessment Core is implemented in TypeScript under `src/eduspace/` and defined by `schemaVersion: 1`.

- **`Exam` (`src/eduspace/core/domain/exam.ts`):** Canonical exam entity containing metadata, policy (`maxAttempts`, `openTime`, `deadlineTime`, `timeLimitMinutes`), and array of `ExamSection`s referencing `QuestionVersion` IDs.
- **`Question` & `QuestionVersion` (`src/eduspace/core/domain/question.ts`):** Questions are immutable entities versioned via `QuestionVersion` (content payload separated from grading payload).
- **`ExamSession` (`src/eduspace/core/domain/session.ts`):** Immutable session entity storing `studentCodeId`, `startedAt`, `expiresAt`, `attemptSeed`, `questionVersionReferences`, and state.
- **`Submission` (`src/eduspace/core/domain/session.ts`):** Student answer payload submitted to the server.
- **`GradingRecord` (`src/eduspace/core/domain/session.ts`):** Server-generated detailed breakdown of points awarded per question.
- **`Result` (`src/eduspace/core/domain/session.ts`):** Final official score record containing student raw NDID, total score, percentage, and status.

### V3 Question Types & Capabilities

V3 defines 9 canonical question types in domain schemas:

| Question Type Name | Code Identifier | Payload Structure | Server Auto-Grading | V2 Adapter Mapping |
| :--- | :--- | :--- | :---: | :--- |
| **Single Choice** | `single_choice` | `options: [{id, text}]`, `correctOptionId` | ✅ Executable | Maps from V2 `multiple` |
| **Multiple Choice** | `multiple_choice` | `options: [{id, text}]`, `correctOptionIds` | ✅ Executable | Native V3 |
| **True / False** | `true_false` | `items: [{id, text}]`, `correctAnswers: {itemId: bool}` | ✅ Executable | Maps from V2 `truefalse` (GDPT 2018 4-item) |
| **Short Answer** | `short_answer` | `placeholder`, `acceptableAnswers: string[]` | ✅ Executable | Maps from V2 `short` (text) |
| **Numeric Fill** | `numeric` | `placeholder`, `exactValue`, `tolerance` | ✅ Executable | Maps from V2 `short` (numeric string) |
| **Essay** | `essay` | `minWords`, `maxWords`, `rubricCriteria` | ⚠️ Manual / AI | Maps from V2 `essay` |
| **Matching** | `matching` | `leftColumn`, `rightColumn`, `correctPairs` | ✅ Executable | Native V3 schema |
| **Ordering** | `ordering` | `items`, `correctOrderIds` | ✅ Executable | Native V3 schema |
| **Fill in Blank** | `fill_blank` | `textWithTokens`, `blanks` | ✅ Executable | Native V3 schema |

### Exam Engine Pipeline (`src/eduspace/engine/pipeline/examEngine.ts`)

1. **Validation (`examValidator.ts`):** Validates exam sections, total points, and question version existence.
2. **Deterministic Planning (`examPlanner.ts` & `prng.ts`):** Uses Mulberry32 PRNG seeded by `attemptSeed` to produce deterministic question order and option shuffling across reloads without exposing seeds to client.
3. **Sanitizer (`sanitizer.ts`):** Strips 100% of answer keys (`correctOptionId`, `correctAnswers`, `acceptableAnswers`, `exactValue`, `rubricCriteria`, `explanation`, `gradingConfig`) before delivering payload to student.
4. **Grading Engine (`gradingEngine.ts`):** Evaluates `Submission` against authoritative `QuestionVersion.gradingConfig`. Applies GDPT 2018 partial ladder (`[0.1, 0.25, 0.5, 1.0]`) for True/False questions.
5. **Result Builder (`resultBuilder.ts`):** Assembles canonical `Result` document preserving 100% RAW NDID string.

### Session Engine Lifecycle (`src/eduspace/assessment/sessionService.ts`)

```
   ┌───────────────┐        startSession()         ┌───────────────┐
   │  Not Started  │ ─────────────────────────────►│  in_progress  │
   └───────────────┘                               └───────┬───────┘
                                                           │
                                   ┌───────────────────────┼───────────────────────┐
                                   │                       │                       │
                            autosave()              submit()               serverTimer.isExpired()
                                   │                       │                       │
                                   ▼                       ▼                       ▼
                           ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
                           │   autosaved   │       │   submitted   │       │    expired    │
                           └───────────────┘       └───────┬───────┘       └───────────────┘
                                                           │
                                                     grade()
                                                           │
                                                           ▼
                                                   ┌───────────────┐
                                                   │    graded     │
                                                   └───────────────┘
```

- **Server Clock Authority:** Server computes `expiresAt = serverNow + (durationMinutes * 60) + 30s technical buffer`.
- **Submission Grace Window:** Accepts submission up to 15 seconds after `expiresAt` to account for network latency. Submissions past 15s grace are rejected with `HTTP 410 SESSION_EXPIRED`.
- **Session Idempotency:** Session ID is identical to Submission ID, GradingRecord ID, and Result ID (`sessionId === submission.id === gradingRecord.id === result.id`). Re-submitting an already submitted session returns `HTTP 200` with `{ isIdempotentReplay: true }`.

---

## SECTION F — REAL SERVER AUTHORITY

### HTTP Execution Trace (`/api/v3/...`)

```
Student Browser (HTTP Request)
  │
  ├─► 1. POST /api/v3/exam-sessions/sess_123/submit
  │      Headers: Authorization: Bearer <Firebase_ID_Token>
  │
  ├─► 2. api/v3.js (Vercel Serverless Function)
  │      └─► Calls handleAssessmentApi() in api/dist/eduspace.mjs
  │
  ├─► 3. authenticateServerRequest(req, db, auth) (src/eduspace/backend/assessmentBackend.ts)
  │      ├─► auth.verifyIdToken(idToken) -> resolves decoded.uid
  │      ├─► codeId = decoded.uid (ignores client-supplied studentCodeId)
  │      ├─► Reads db.collection('users').doc(codeId)
  │      └─► Loads canonical profile: ndid (RAW STRING), role, eduRole, adminLevel
  │
  ├─► 4. ExamSessionService.submit(userContext, sessionId, request)
  │      ├─► Verify session ownership: session.studentCodeId === userContext.codeId
  │      ├─► Check server expiration: serverNow <= session.expiresAt + 15s grace
  │      ├─► Strip client-submitted score/awardedPoints
  │      ├─► Load authoritative QuestionVersions from Firestore
  │      ├─► Execute GradingEngine.evaluateSubmission() on server
  │      ├─► Write Submission & GradingRecord to Firestore Admin SDK
  │      └─► Build & save Result to Firestore Admin SDK
  │
  └─► 5. Return Sanitized HTTP 200 Response:
         { success: true, sessionId: 'sess_123', status: 'graded', resultId: 'sess_123' }
```

### Real Server Authority Matrix

| Vulnerability / Attack Vector | Authority Classification | Server Enforcement Mechanism | Source Reference File |
| :--- | :--- | :--- | :--- |
| **Client Score Tampering** | `SERVER-AUTHORITATIVE` | Client-supplied score fields are stripped and discarded. Score is computed 100% on server by `GradingEngine`. | [sessionService.ts](file:///d:/Project/WebSite/ND%20Labs/src/eduspace/assessment/sessionService.ts#L400-L415) |
| **Answer Key Exposure** | `SERVER-AUTHORITATIVE` | `sanitizeExecutionPlan()` strips all correct options, acceptable answers, and grading configs before delivering payloads. | [sanitizer.ts](file:///d:/Project/WebSite/ND%20Labs/src/eduspace/assessment/sanitizer.ts#L14-L47) |
| **maxPoints Tampering** | `SERVER-AUTHORITATIVE` | Points per question are locked to authoritative `QuestionVersion.allocatedPoints` stored in database. | [gradingEngine.ts](file:///d:/Project/WebSite/ND%20Labs/src/eduspace/engine/grading/gradingEngine.ts#L67-L75) |
| **Timer Tampering** | `SERVER-AUTHORITATIVE` | Expiration calculated using server clock (`serverNow + duration + 30s`). Client clock manipulation has zero effect. | [sessionService.ts](file:///d:/Project/WebSite/ND%20Labs/src/eduspace/assessment/sessionService.ts#L177-L185) |
| **Session Hijacking / IDOR** | `SERVER-AUTHORITATIVE` | Checks `session.studentCodeId === userContext.codeId`. Student B cannot resume, autosave, or submit Student A's session. | [sessionService.ts](file:///d:/Project/WebSite/ND%20Labs/src/eduspace/assessment/sessionService.ts#L221-L224) |
| **Result Tampering** | `SERVER-AUTHORITATIVE` | `Result` document is generated and saved directly by server Admin SDK. Client cannot write or overwrite `results` collection. | [sessionService.ts](file:///d:/Project/WebSite/ND%20Labs/src/eduspace/assessment/sessionService.ts#L412-L425) |
| **Submission Replay** | `SERVER-AUTHORITATIVE` | Idempotency check returns existing submission status (`isIdempotentReplay: true`) without double-grading. | [sessionService.ts](file:///d:/Project/WebSite/ND%20Labs/src/eduspace/assessment/sessionService.ts#L352-L364) |
| **AI Finalization Spoofing** | `SERVER-AUTHORITATIVE` | `GradingRegistry` rejects finalizing AI-assisted scores without explicit human `reviewerCodeId`. | [gradingRegistry.ts](file:///d:/Project/WebSite/ND%20Labs/src/eduspace/engine/grading/gradingRegistry.ts#L53-L60) |

---

## SECTION G — TEACHER EXAM SYSTEM

### Current Teacher Architecture Inspection

Teacher functionality currently resides in `/eduspace/teacher/` and `/eduspace/taode/` as well as `/admin/edu/index.html`.

- **Question & Quiz Creation:** `/admin/edu/index.html` allows teachers to import Word (.docx) files or paste text, extract questions via Gemini AI, edit questions visually, and publish directly to Firestore.
- **Collection Dual State:**
  - Teacher UI currently writes to **V2 collections**: `quizzes` (exam documents), `eduspace_lessons` (lesson metadata), and `classrooms` (student rosters).
  - V3 TS Domain and Vercel APIs operate on **V3 collections**: `exams`, `questionBanks`, `questions`, `questionVersions`, `exam_sessions`, `submissions`, `grading_records`, `results`.
  - Bridge: V2 quizzes published by teachers in `/admin/edu/` are transparently adapted at runtime to V3 domain models by `v2QuizAdapter.ts` when accessed via V3 APIs.

---

## SECTION H — ADMIN ↔ EDUSPACE RELATIONSHIP

### Operational Interaction Matrix

| Category | What Admin CAN Manage | What Admin CANNOT Manage | Data Access Route |
| :--- | :--- | :--- | :--- |
| **User Governance** | Promote users to `admin`, update status, inspect user directory | Demote or alter Owner `0000` invariant | Vercel `/api/auth.js` |
| **Exam Moderation** | Approve public exams (`moderationStatus = 'approved'`), unpublish content | Access student private password credentials | Firestore Admin SDK / Vercel API |
| **EduSpace Content** | Author, edit, delete, and publish quizzes and lessons | Bypass server auto-grading on finalized sessions | `/admin/edu/index.html` → Firestore `quizzes` |
| **Timetable** | Configure school schedules, subjects, classes, rooms | Mutate Timetable structure without rules | Firestore `timetables` collection |
| **Audit Logs** | Inspect system security logs (`security_events`, `admin_logs`) | Delete or alter historical audit log entries | Firestore Rules (`allow write: if false;`) |

---

## SECTION I — DATABASE / API MAP

### Firestore Collections Map

| Collection Name | Purpose | Current Schema | Architecture | Read Location | Write Location | Authorization | Migration Status |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `users` | User accounts | Canonical User | V2 / V3 | `/admin`, Auth APIs | `/api/auth.js` | Self / Admin (Gated) | `MIGRATED (V3)` |
| `ndids` | NDID uniqueness mapping | `{ codeId, ndid }` | V3 | Server Only | `/api/auth.js` | Server Only (`false`) | `MIGRATED (V3)` |
| `emails` | Email uniqueness mapping | `{ codeId, email }` | V3 | Server Only | `/api/auth.js` | Server Only (`false`) | `MIGRATED (V3)` |
| `google_identities` | Google OAuth mappings | `{ codeId, googleId }` | V3 | Server Only | `/api/auth.js` | Server Only (`false`) | `MIGRATED (V3)` |
| `counters` | Sequential CodeID counter | `{ nextCodeId }` | V3 | Server Only | `/api/auth.js` | Server Only (`false`) | `MIGRATED (V3)` |
| `security_events` | Security audit logging | Security Event | V2 / V3 | `/admin/dashboard.html` | `/api/auth.js` | Admin Read Only | `MIGRATED (V3)` |
| `quizzes` | Exam quiz documents | V2 Quiz Schema | V2 | Exam Runner, Admin | `/admin/edu/index.html` | Public Read / Admin Write | `LEGACY (V2 Adapter Active)` |
| `eduspace_lessons` | Lesson catalog | V2 Lesson Schema | V2 | EduSpace Homepage | `/admin/edu/index.html` | Public Read / Admin Write | `LEGACY (V2)` |
| `attempts` | Student exam attempts | V2 Attempt Schema | V2 | Teacher Gradebook | Client Exam Runner | Student Write (`attempts`) | `LEGACY (V2 Client Auth)` |
| `classrooms` | Classroom rosters | V2 Classroom | V2 / V3 | Teacher Portal | Teacher Portal | Signed-in / Teacher | `PARTIAL` |
| `exams` | Canonical V3 Exams | V3 Exam Schema | V3 | V3 API (`/api/v3`) | V3 Admin API | Server Authority | `V3 READY` |
| `questions` | Canonical V3 Questions | V3 Question Schema | V3 | V3 API (`/api/v3`) | V3 Admin API | Server Authority | `V3 READY` |
| `questionVersions` | Pinned Question Versions | V3 Version Schema | V3 | V3 API (`/api/v3`) | V3 Admin API | Server Authority | `V3 READY` |
| `exam_sessions` | Authoritative Sessions | V3 Session Schema | V3 | V3 API (`/api/v3`) | `/api/v3/exam-sessions` | Server Authority | `V3 READY` |
| `submissions` | Student Submissions | V3 Submission Schema | V3 | V3 API (`/api/v3`) | `/api/v3/.../submit` | Server Authority | `V3 READY` |
| `grading_records` | Detailed Grading | V3 Grading Schema | V3 | V3 API (`/api/v3`) | Server Grading Engine | Server Authority | `V3 READY` |
| `results` | Official Exam Results | V3 Result Schema | V3 | V3 API (`/api/v3`) | Server Result Builder | Student / Teacher Read | `V3 READY` |

### API Endpoints Map

| Endpoint | Method | Caller | Auth | Request Payload | Response Payload | Mutation / Read | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| `/api/auth.js` | `POST` | Admin / User | Bearer / Action | `{ action: 'login', ... }` | `{ success: true, token, profile }` | Mutation / Read | `PRODUCTION` |
| `/api/auth.js` | `POST` | Admin (Owner) | Bearer | `{ action: 'update-user-role', ... }` | `{ success: true }` | Mutation | `PRODUCTION` |
| `/api/v3/health` | `GET` | Monitoring | None | None | `{ status: 'ok', service: '...' }` | Read-only | `PRODUCTION` |
| `/api/v3/exam-sessions` | `POST` | Student | Bearer Token | `{ examId, assignmentId }` | `{ sessionId, startedAt, expiresAt, exam }` | Mutation | `PRODUCTION (107 Tests Pass)` |
| `/api/v3/exam-sessions/:id/resume` | `GET` | Student | Bearer Token | None | `{ sessionId, status, exam, autosaveState }` | Read-only | `PRODUCTION (107 Tests Pass)` |
| `/api/v3/exam-sessions/:id/autosave` | `POST` | Student | Bearer Token | `{ answersPayload, answerVersion }` | `{ sessionId, savedAt, answerVersion }` | Mutation | `PRODUCTION (107 Tests Pass)` |
| `/api/v3/exam-sessions/:id/submit` | `POST` | Student | Bearer Token | `{ answers: [...] }` | `{ sessionId, status, resultId, submittedAt }` | Mutation | `PRODUCTION (107 Tests Pass)` |
| `/api/v3/results/:id` | `GET` | Student / Teacher | Bearer Token | None | `{ success: true, result }` | Read-only | `PRODUCTION (107 Tests Pass)` |
| `/api/v3/grading/manual` | `POST` | Teacher / Admin | Bearer Token | `{ sessionId, scores: [...] }` | `{ sessionId, totalScore, isFinalized }` | Mutation | `PRODUCTION (107 Tests Pass)` |

---

## SECTION J — V2 → V3 COMPATIBILITY

### Normalization Architecture

V2 data structures are connected to V3 using **read-only runtime adapters**:

1. **`v2QuizAdapter.ts` (`adaptLegacyV2QuizBundle`):**
   - Parses legacy V2 quiz documents (from `quizzes` collection or static `data.js`).
   - Maps question types (`multiple` → `single_choice`, `truefalse` → `true_false`, `short` → `numeric`/`short_answer`, `essay` → `essay`).
   - Builds canonical V3 `Exam`, `Question`, and `QuestionVersion` objects on-the-fly.
   - Preserves 100% legacy data integrity (never alters or deletes V2 documents).
2. **`v2AttemptAdapter.ts` (`adaptLegacyV2Attempt`):**
   - Maps V2 client attempt entries into canonical V3 `Submission` and `Result` representations for unified gradebook viewing.
3. **`v2ClassroomAdapter.ts` (`adaptLegacyV2Classroom`):**
   - Maps V2 classroom documents into V3 `Classroom` domain models.

---

## SECTION K — CURRENT EXAM USER FLOWS

### 1. Student Flow (Legacy V2 vs Server-Authoritative V3)

```
[V2 Student Flow - Currently Active in UI]
Login ──► Enter /eduspace/exam/?t111 ──► Load Firestore quizzes/T111 ──► Render template.html
  ──► Local Timer Countdown ──► Select Answers in Browser Memory ──► Submit Exam
  ──► Browser calculates score ──► Write to Firestore attempts collection via Client SDK

[V3 Student Flow - Built, Tested & Ready Backend]
Login ──► POST /api/v3/exam-sessions ──► Receive SessionId & 0% Answer Key Sanitized Exam
  ──► Local Display (Server Clock Sync) ──► POST /api/v3/exam-sessions/:id/autosave
  ──► POST /api/v3/exam-sessions/:id/submit ──► Server Auto-Grades ──► GET /api/v3/results/:id
```

### 2. Teacher Flow

```
Login ──► Open /admin/edu/ ──► Import Word/Text file or Paste ──► Gemini AI extracts questions
  ──► Visual Question Editor ──► Set Points & GDPT Standard ──► Test in Runner
  ──► Publish Direct to Firebase ──► Saved to Firestore quizzes & eduspace_lessons
```

### 3. Admin Flow

```
Login ──► Open /admin/dashboard.html ──► Validate Auth & Admin Badge ──► Inspect System Metrics
  ──► View Paginated User Directory ──► Open Phân Quyền Modal ──► Update Role (Owner Gated)
  ──► Inspect Security Audit Logs ──► Post System Announcement
```

---

## SECTION L — CURRENT PROBLEMS

The following list contains ONLY verified architectural limitations supported by code inspection and test execution.

### Category P0 — Security / Data-Integrity Blockers (Legacy Runner Only)

1. **Client-Authoritative Submission in V2 Exam Runner**
   - **Evidence:** Line 441 in [eduspace/exam/index.html](file:///d:/Project/WebSite/ND%20Labs/eduspace/exam/index.html#L441-L460) directly executes `setDoc(doc(db, 'attempts', attemptId), { score: score, ... })` from the student browser.
   - **Affected Component:** `/eduspace/exam/index.html` & `/eduspace/template.html`.
   - **Impact:** Tech-savvy users can modify `score` in browser DevTools before submitting.
   - **Suggested Direction:** Replace V2 exam runner with V3 Server-Authoritative runner calling `/api/v3/exam-sessions/:id/submit`.

### Category P1 — Functional Blockers

2. **Student UI Not Connected to V3 API**
   - **Evidence:** Frontend UI pages (`/eduspace/exam/`) still fetch `/eduspace/template.html` and do not invoke Vercel endpoints `/api/v3/exam-sessions`.
   - **Affected Component:** Student Exam UI (`/eduspace/exam/`).
   - **Impact:** V3 Server Authority API is 100% operational in backend tests (107/107 passing), but students still use V2 runner UI.
   - **Suggested Direction:** Wire Student UI to V3 API endpoints (`POST /api/v3/exam-sessions`).

### Category P2 — Architectural Limitations

3. **Dual Authoring Collection Targets**
   - **Evidence:** `/admin/edu/index.html` publishes quizzes to Firestore `quizzes` collection (V2 format), while V3 native engine reads from `exams` and `questionVersions` collections.
   - **Affected Component:** `/admin/edu/index.html` & `src/eduspace/core/normalizers/v2QuizAdapter.ts`.
   - **Impact:** System relies on `v2QuizAdapter.ts` for runtime normalization rather than native V3 collection storage.
   - **Suggested Direction:** Add dual-write or native V3 export option to `/admin/edu/index.html`.

### Category P3 — UX / Cleanup

4. **Redundant Admin Pages**
   - **Evidence:** `/admin/eduspace/index.html` exists alongside `/admin/edu/index.html`.
   - **Impact:** Maintenance overhead having two separate admin authoring interfaces.
   - **Suggested Direction:** Consolidate `/admin/eduspace/index.html` into `/admin/edu/index.html`.

---

## SECTION M — ALREADY COMPLETED WORK

The following milestones have been verified in codebase history:

1. **Admin Redesign & Gating:** Implemented `/admin/dashboard.html` with canonical auth loading gate, access denied screen, paginated user directory, security audit logs, and Owner-gated permission modal.
2. **Canonical Auth Hardening:** Established `CodeID` sequential allocation (`0001`, `0002`...), Owner `0000` invariant, and hardened Firestore Security Rules preventing client-side `role` / `adminLevel` tampering.
3. **V3 Domain Foundation:** Built TypeScript domain models (`Exam`, `Question`, `QuestionVersion`, `ExamSession`, `Submission`, `GradingRecord`, `Result`) for 9 question types.
4. **V3 Exam Engine:** Built `ExamEngine`, `GradingEngine`, `ExamPlanner`, deterministic PRNG `attemptSeed`, and GDPT 2018 partial ladder (`[0.1, 0.25, 0.5, 1.0]`).
5. **V3 Session Service & Server Authority:** Implemented `ExamSessionService` with server-authoritative timer, 30s technical buffer, 15s grace period, 0% answer key sanitizer (`sanitizer.ts`), and submission idempotency.
6. **V3 Backend HTTP Adapter:** Built `assessmentBackend.ts` and `/api/v3.js` Vercel function exposing `/api/v3/exam-sessions` REST API.
7. **V2 Read-Only Adapters:** Implemented `v2QuizAdapter.ts`, `v2AttemptAdapter.ts`, `v2ClassroomAdapter.ts`.
8. **Automated Verification:** 107 unit and integration tests passing (`tests/eduspace/v3-*.test.ts`).

---

## SECTION N — CURRENT READINESS

| Component | Readiness Level | Factual Reasons |
| :--- | :--- | :--- |
| **`/admin` Portal** | **PRODUCTION-READY** | Fully hardened auth, role-based access, Owner `0000` protection, security audit log integration, and complete user directory controls. |
| **EduSpace V3 Backend & Engine** | **PRODUCTION-READY** | 107/107 unit and integration tests passing. Full server authority, 0% answer key leakage, GDPT 2018 grading engine, and idempotent submission handling. |
| **EduSpace V2 Exam Runner UI** | **LEGACY / ACTIVE** | Functioning correctly for general users, but relies on client-side scoring and direct Firestore write to `attempts`. |
| **Student V3 UI Integration** | **DEVELOPMENT-READY** | Backend APIs are fully ready for frontend UI integration. |

---

## SECTION O — NEXT DEVELOPMENT BOUNDARIES

The following implementation boundaries represent natural progression steps for future phases:

### Boundary 1 — Student V3 Exam Runner UI Integration
- **Prerequisite:** V3 Server Authority API (`/api/v3/exam-sessions`) is 100% operational.
- **Affected Files:** `eduspace/exam/index.html`, `eduspace/template.html`, or a new React runner component under `src/eduspace/ui/`.
- **Protected Systems:** Firestore Rules for `exam_sessions`, `submissions`, `results`.
- **Dependencies:** `api/v3.js`, `ExamSessionService`.

### Boundary 2 — Native V3 Exam Authoring & Question Bank UI
- **Prerequisite:** `/admin/edu/index.html` is operational for V2 `quizzes`.
- **Affected Files:** `admin/edu/index.html`, `src/eduspace/core/repositories/firestoreRepository.ts`.
- **Protected Systems:** Firestore `exams`, `questionBanks`, `questions`, `questionVersions` collections.
- **Dependencies:** `v2QuizAdapter.ts`, `QuestionRegistry`.

### Boundary 3 — Teacher V3 Gradebook & Manual Review UI
- **Prerequisite:** `manualGrade()` endpoint (`POST /api/v3/grading/manual`) is implemented and tested.
- **Affected Files:** `eduspace/teacher/index.html`, `src/eduspace/assessment/sessionService.ts`.
- **Protected Systems:** Firestore `grading_records`, `results`.
- **Dependencies:** `ResultRepository`, `SubmissionRepository`.

---

## ABSOLUTE PROTECTION VERIFICATION

During this audit:
- ❌ No production database records were modified.
- ❌ CodeID allocation and Auth rules were untouched.
- ❌ System Owner `0000` invariant was preserved.
- ❌ Existing Quiz data and TimeTable structures were untouched.
- ✅ Verification executed via static inspection and 107 read-only automated tests.

---
