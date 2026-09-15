# PHASE 01-C0 COMPLETION REPORT
## ND Labs / EduSpace: Database + Auth + Identity Contract Redesign
### Clean Foundation Architecture (Phase 01-C0)

> **Software:** Antigravity  
> **Model:** Gemini 3.8 Flash (High)  
> **Role:** Senior Software Architect + Database Architect + Security Architect + Firebase Architect  
> **Date:** 2026-09-05  
> **Scope:** AUDIT + ARCHITECTURAL DESIGN + DATABASE CONTRACT + AUTH CONTRACT + IDENTITY CONTRACT + SECURITY CONTRACT + DOCUMENTATION ONLY.  
> **Execution Status:** COMPLETED (Zero Code Implementation, Zero Migration, Zero Data Modification, Zero Deployment).

---

### Core Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## 1. Executive Summary

Phase 01-C0 was initiated to completely redesign the foundational identity, authentication, database, and security architecture of the ND Labs and EduSpace ecosystem. 

Previously, user identities were fragmented across unpredictable Firebase Auth random UIDs, user-chosen mutable NDID strings, plaintext email values, and client-generated identifiers. Relationships between users and products (such as TimeTable schedules, comments, chat messages, and exam attempts) suffered from high coupling: changing a handle or email risked breaking foreign keys or requiring massive database updates.

In Phase 01-C0, a clean, permanent canonical architecture was established:
1. **Single Canonical Identity:** `CodeID` is the sole immutable account identifier.
2. **Auth Identity Parity:** `Firebase Auth UID === CodeID`.
3. **Universal Foreign Keys:** All internal references to users MUST store `CodeID` (`ownerCodeID`, `authorCodeID`, `senderCodeID`, `creatorCodeID`, `studentCodeID`).
4. **Dynamic Attribute Resolution:** Mutable attributes (`ndid`, `email`, `displayName`, `photoURL`, `grade`) are resolved dynamically from `users/{CodeID}`.
5. **Zero Cascading Rewrites:** Renaming an NDID or email only modifies `users/{CodeID}` and its private lookup mapping.
6. **Physical Credential Isolation:** Credentials (`passwordHash`, `failedLoginAttempts`, `customGeminiKey`) are segregated into non-client-readable private subcollections (`users/{CodeID}/private/*`).
7. **TimeTable Audit & Preservation:** The existing, working TimeTable module was audited in detail. Current test data, documents, and user bindings were preserved 100% without modification or premature migration.

---

## 2. Files Inspected During Audit

### Documentation Inspected:
- `docs/PROJECT_RULES.md`
- `docs/AUTH_RULES.md`
- `docs/DATABASE.md`
- `docs/SECURITY.md`
- `docs/ARCHITECTURE_DECISIONS.md`
- `docs/AUTH_AUDIT_REPORT.md`
- `docs/AUTH_ARCHITECTURE.md`
- `docs/AUTH_IMPLEMENTATION_PLAN.md`
- `docs/PHASE_01B_REPORT.md`
- `.agents/AGENTS.md`
- `AGENT.md`

### Production Code & Configuration Inspected:
- `firebase.json` (Hosting rewrites, Cloud Functions config, Firestore/RTDB rules pointers)
- `firestore.rules` (Live Firestore security rules)
- `database.rules.json` (Live Realtime Database rules)
- `functions/index.js` (Cloud Functions: `geminiProxy`, `lotusBotWebhook`, `lotusBotAdmin`)
- `assets/js/firebase-init.js` (Firebase Web SDK initialization, client-side auto-generation of 8-digit CodeID, `onAuthStateChanged` hook)
- `assets/js/nd-navbar.js` (Navbar component, profile sync)
- `assets/js/nd-accounts.js` (Multi-account switcher in localStorage)
- `assets/js/nd-chat-core.js` (Direct & group chat persistence, attachments, reactions)
- `assets/js/api-service.js` (API helpers)
- `auth/login/index.html` (Legacy login form with fake email conversion)
- `auth/register/index.html` (Legacy registration form with `Math.random()` CodeID and plaintext password)
- `auth/settings/index.html` (Legacy profile & account settings)
- `auth/qa-test.html` (QA authentication testing suite)

### TimeTable Module Inspected:
- `src/timetable/main.tsx` (Vite / React mount point)
- `src/timetable/TimetableApp.tsx` (Monolithic 3,416-line React application)
- `src/timetable/AITimetableModal.tsx` (AI schedule import modal)
- `src/timetable/aiTimetableService.ts` (AI prompt & OCR extraction service)
- `src/timetable/index.css` (Tailwind CSS v4 root)
- `eduspace/timetable/index.html` (Public wrapper page)
- `admin/eduspace/timetable/index.html` (Admin wrapper page)
- `vite.timetable.config.ts` (Vite build configuration)

### EduSpace & Sub-App Code Inspected:
- `eduspace/teacher/index.html` (`classrooms`, `quizzes`, `attempts` queries)
- `eduspace/taode/index.html` (Quiz creation & publishing)
- `eduspace/exam/index.html` (Student exam taking & attempt submission)
- `admin/index.html` (Admin dashboard user queries)
- `admin/eduspace/index.html` (EduSpace lesson management)
- `chat/index.html` (ND Chat UI, participant queries)
- `src/miniworld/hooks/useFirebase.ts` (MiniWorld sub-app user references)

---

## 3. Current Architecture vs Canonical Architecture

| Dimension | Legacy Architecture (Audited) | Canonical Architecture (Redesigned) |
|---|---|---|
| **Account Identity** | Random Firebase Auth UID (e.g. `7bK9...`) | Sequential `CodeID` (`"0000"`, `"0001"`, `"10000"`) |
| **Auth UID Parity** | `auth.uid` is random; mapped to CodeID | `Firebase Auth UID === CodeID` |
| **User Document Key** | `users/{randomUid}` | `users/{CodeID}` |
| **Foreign Keys in Modules** | Mixed `ndid`, `uid`, `email`, `displayName` | Universal `CodeID` (`ownerCodeID`, `authorCodeID`) |
| **User Information** | Denormalized into business records | Dynamically resolved from `users/{CodeID}` |
| **Handle Change Impact** | Breaks references or requires global rewrite | Zero rewrites across modules; updates `users` only |
| **Password Storage** | Plaintext in `registeredPassword` | `passwordHash` in isolated `private/security` |
| **CodeID Generation** | Client-side `Math.random()` | Server-side transaction on `counters/code_ids` |
| **CodeID Consumption** | Unspecified; attempts retry | Consumed immediately upon allocation; gaps allowed |
| **NDID Nature** | Converted to fake `${ndid}@ndsite.web.app` | Pure handle; verified independent credential |
| **Security Boundary** | Client-side `localStorage` guards | Firestore Security Rules + trusted Cloud Functions |
| **Brute Force Defense** | None (unlimited attempts) | Atomic server-side lockout after 5 failures |
| **Mapping Collections** | Readable by clients (enumeration risk) | Backend-only (`allow read: if false;`) |
| **TimeTable Ownership** | `ownerUid`, `ownerNdid`, `ownerName` | Target `ownerCodeID` |

---

## 4. Canonical Identity & CodeID Model

- **Format:** Zero-padded 4-digit string (`"0000"` to `"9999"`), expanding to 5+ digits (`"10000"`, `"10001"`, ...) with no fixed upper bound.
- **Generation:** Cloud Function executing a Firestore transaction on `counters/code_ids`.
- **Consumption:** Once allocated, a CodeID is permanently consumed. If registration fails or is abandoned, the CodeID is never recycled. Sequence gaps are valid and harmless.
- **Immutability:** A CodeID cannot be altered, transferred, or reassigned.

---

## 5. Universal User Relationship Contract

Every database document referencing a user MUST use `CodeID` as the foreign key:
- **TimeTable:** `ownerCodeID`, `collaborators[].memberCodeID`, `comments[].authorCodeID`, `presence[].userCodeID`
- **Chat:** `senderCodeID`, `participants` (array of CodeIDs)
- **EduSpace Classrooms:** `creatorCodeID`, `studentCodeIDs`
- **EduSpace Quizzes:** `creatorCodeID`
- **EduSpace Exam Attempts:** `studentCodeID`
- **Audit Logs:** `actorCodeID`, `targetCodeID`

---

## 6. TimeTable Audit & Binding Analysis

### Current Status:
- TimeTable is active and stable. It was created with modern React 19 + TypeScript + Tailwind CSS v4 + Vite.
- Documents reside at `timetables/{timetableId}`.
- Current records bind ownership via `ownerUid` and `ownerNdid`, with denormalized `ownerName` and `ownerPhotoURL`.
- Collaborators and comments store `ndid` and `uid`.
- URL routing supports `/eduspace/timetable/:id` and query/hash formats.

### Target Canonical Binding:
- Target ownership field: `ownerCodeID`.
- Target collaborator reference: `memberCodeID`.
- Target comment reference: `authorCodeID`.
- Canonical URLs: `/timetable/{CodeID}` and `/timetable/{CodeID}/{timetableId}`.

### Safety Guarantee:
- **No timetable documents were deleted, modified, or overwritten.**
- **No owner references were rewritten.**
- **No data migration was executed.**

---

## 7. Decided Architecture Decision Records (ADRs)

1. **ADR-001 (DECIDED):** `Firebase Auth UID === CodeID`.
2. **ADR-002 (DECIDED):** Allocated CodeID is consumed even if registration fails (gaps allowed, no recycling).
3. **ADR-003 (DECIDED):** Every internal user relationship references immutable CodeID.
4. **ADR-004 (DECIDED):** User information is dynamically resolved from `users/{CodeID}`.
5. **ADR-005 (DECIDED):** First Owner is bootstrapped via trusted manual/script operation, never hard-coded.
6. **ADR-006 (DECIDED):** Firestore is the exclusive primary store for user accounts, profiles, credentials, and mappings.

---

## 8. Open Architectural Decisions (Not Implemented / Deferred)

1. **ADR-007 (OPEN / PROPOSED):** Password Hashing Algorithm Benchmark (`bcryptjs` vs `Argon2id`).
2. **ADR-008 (OPEN):** Account Deletion Semantics (Soft delete vs Phased delete vs Hard delete).
3. **ADR-009 (OPEN):** Session Token TTL and Custom Revocation Registry.
4. **ADR-010 (OPEN):** Email Delivery Service Provider for Recovery & OTPs.
5. **ADR-011 (OPEN):** Trusted Device Recognition Implementation.
6. **ADR-012 (OPEN):** Account Recovery Final Protocol & AI Guardrails.

---

## 9. Documentation Files Created & Updated

| File | Status | Description |
|---|---|---|
| `docs/AUTH_DATA_MODEL.md` | **CREATED** | Complete database schema, subcollection isolation, domain separation, and answers to 18 architecture questions |
| `docs/AUTH_API_CONTRACT.md` | **CREATED** | Formal HTTP API specification for all 15+ authentication endpoints |
| `docs/TIMETABLE_AUTH_BINDING_AUDIT.md` | **CREATED** | Exhaustive audit of current TimeTable architecture, code, user bindings, and migration targets |
| `docs/PROJECT_RULES.md` | **UPDATED** | Added 10 Cardinal Foundation Rules and core architectural principles |
| `docs/AUTH_RULES.md` | **UPDATED** | Reflected CodeID parity, dynamic resolution, and deprecated legacy patterns |
| `docs/DATABASE.md` | **UPDATED** | Clean separation of Target Canonical Data Model vs Legacy Migration Source |
| `docs/SECURITY.md` | **UPDATED** | Updated threat model, trust boundaries, lockout, and anti-enumeration rules |
| `docs/ARCHITECTURE_DECISIONS.md` | **UPDATED** | Promoted ADR-001 to ADR-005 to DECIDED; documented OPEN decisions |
| `docs/AUTH_ARCHITECTURE.md` | **UPDATED** | Updated system diagrams, registration/login flows, and trust boundaries |
| `docs/PHASE_01-C0_REPORT.md` | **CREATED** | This comprehensive completion report |

---

## 10. Remaining Security Risks in Unmigrated Legacy Code

Because Phase 01-C0 was strictly an architectural and documentation phase with no source code modification, the following vulnerabilities remain in the existing legacy code until the implementation & migration phases:
1. **Plaintext Passwords:** Existing accounts in `users/{uid}.registeredPassword` are still plaintext.
2. **Permissive Firestore Rules:** Current live `firestore.rules` has open read/write on `timetables/{timetableId}`.
3. **Fake Email Pattern:** Legacy `/auth/login/` still converts NDID to `${ndid}@ndsite.web.app`.
4. **Client-Side CodeID Generation:** `assets/js/firebase-init.js` still generates 8-digit CodeIDs on the client.
5. **Client-Side Role Checks:** Navigation and admin panels still rely on `localStorage` for role checks.

*All of these vulnerabilities are slated for full remediation in subsequent implementation phases.*

---

## 11. Explicit No-Change Confirmation

> **FINAL ARCHITECTURAL CONFIRMATION:**  
> - **NO CODE IMPLEMENTATION WAS PERFORMED IN THIS PHASE.**  
> - **NO DATA MIGRATION WAS PERFORMED IN THIS PHASE.**  
> - **NO FIREBASE RULES WERE DEPLOYED IN THIS PHASE.**  
> - **NO TIMETABLE OR USER DATA WAS MODIFIED, DELETED, OR RESET.**  
> - **THE TIMETABLE MODULE REMAINS 100% OPERATIONAL IN ITS CURRENT STATE.**
