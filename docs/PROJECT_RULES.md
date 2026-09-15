# PROJECT RULES — ND Labs

> **Scope:** All sub-projects in the ND Labs repository  
> **Authority:** This document is the source of truth for project-wide rules.  
> **Last Updated:** 2026-09-05  

---

### Core Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## 1. Ten Cardinal Foundation Rules (Phase 01-C0)

1. **RULE 1: Canonical Immutable Identity**  
   `CodeID` is the single canonical, permanent, immutable identity of every account.
2. **RULE 2: Firebase Auth UID Identity Parity**  
   `Firebase Auth UID === CodeID`. There is no separate random UID layer.
3. **RULE 3: Universal CodeID Foreign Keys**  
   Every internal relationship to an account MUST reference `CodeID` (`ownerCodeID`, `authorCodeID`, `recipientCodeID`, `creatorCodeID`, `studentCodeID`, `memberCodeID`).
4. **RULE 4: No NDID/Email as Canonical Foreign Key**  
   `NDID` and `Email` are mutable user attributes or login identifiers. They MUST NOT be used as relational foreign keys.
5. **RULE 5: User Information Resolution**  
   User information (display name, NDID, email, avatar, grade, school) MUST be dynamically resolved on demand from `users/{CodeID}`.
6. **RULE 6: Zero Global Rewrites on Attribute Changes**  
   When a user updates their NDID, email, name, or avatar, ONLY the canonical user document and its private lookup mapping are updated. Global rewrites across business modules (TimeTable, comments, chats, quizzes) are strictly prohibited.
7. **RULE 7: Client Is Untrusted**  
   The frontend is purely a presentation layer and is NOT a security authority. Clients cannot determine roles, status, ownership, or security validity.
8. **RULE 8: Backend Authority for Sensitive Data**  
   All security-sensitive operations, password verifications, lockouts, and privileged writes MUST be executed in trusted backend environments (Cloud Functions / Firebase Admin SDK).
9. **RULE 9: TimeTable Target Canonical Ownership**  
   TimeTable ownership target is `ownerCodeID`. Collaborators are bound by `memberCodeID`.
10. **RULE 10: TimeTable Data Preservation (Phase 01-C0)**  
    The existing, working TimeTable module MUST NOT be deleted, reset, or migrated during Phase 01-C0. Phase 01-C0 is strictly audit and architectural specification.

---

## 2. Technology Stack (TimeTable & New Modules)

TimeTable and all new modules MUST use:

- **React** (v19+)
- **Vite** (v6+)
- **TypeScript** (v5+)
- **Tailwind CSS** (v4+)
- **Firebase** (Firestore, Auth, Cloud Functions, Hosting)

DO NOT use: Next.js, Vue, Nuxt, Angular, Svelte, Astro, Solid, or vanilla HTML/JS for new modules unless explicitly instructed by the Owner.

---

## 3. Version Control

- Update version in `assets/js/version.js` after code changes (not for new quiz data).
- Format: `ver:<year(2025=0,2026=1)>.<month>.<day>.<hour><minute>`
- Example: 2026-09-05 15:30 → `ver:1.9.5.1530`

---

## 4. NDID Rules (3 Core Principles)

### Rule 1: Form Input Validation
- Apply regex `/^[a-zA-Z0-9_.]+$/` ONLY on user-facing input forms (registration, profile edit).
- NEVER run sanitize/strip functions on NDID values already stored in the database.

### Rule 2: Database Values Are Sacred
- NDID from Database or Admin may contain any character (including `@`, `#`, `$`, spaces).
- When rendering NDID from Database/API: display the raw string exactly as stored.
- NEVER use replace, filter, or regex to trim characters from NDID when rendering UI.

### Rule 3: No Auto-Prefix
- NEVER prepend `@` to NDID in code if the stored value does not already contain it.
  - ❌ Wrong: `@${ndid}`, `NDID: @${user.ndid}`
  - ✅ Correct: `${ndid}`, `NDID: ${user.ndid}`
- If DB stores `"admin@nd"` → display `"admin@nd"` (part of raw string in DB).

### Rule 4: NDID Is NOT Email
- NEVER convert NDID to a fake email (`${ndid}@ndsite.web.app`).
- NEVER use `signInWithEmailAndPassword()` with a fabricated NDID-based email.
- Authentication MUST use Firebase Custom Token via trusted backend.

---

## 5. UI Text & Terminology Rules

- DO NOT copy verbose explanations or parenthetical notes from prompts into UI labels.
- Labels must be short, using correct domain terminology.
- DO NOT use AI-style buzzwords: "hệ sinh thái", "thúc đẩy", "đột phá", "tối ưu hóa", "vượt trội", "hỗ trợ đắc lực".

---

## 6. Authentication Rules

All authentication MUST follow [AUTH_RULES.md](AUTH_RULES.md) and [AUTH_API_CONTRACT.md](AUTH_API_CONTRACT.md).

Summary:
- `CodeID` is the immutable account identity.
- `Firebase Auth UID === CodeID`.
- Passwords are NEVER stored in plaintext. Only `passwordHash`.
- Login goes through trusted backend → Firebase Custom Token → `signInWithCustomToken()`.
- Role enforcement is server-side (Firestore Rules + Cloud Functions). Frontend route guards are UX only.

---

## 7. Security Rules

All security concerns MUST follow [SECURITY.md](SECURITY.md).

Summary:
- Frontend is NOT a security boundary.
- Client CANNOT write: `role`, `adminLevel`, `passwordHash`, `codeId`, `status`, `failedLoginAttempts`, `lockedAt`, `lockReason`, `banExpiresAt`, `passwordVersion`.
- Firebase Admin SDK MUST NOT be bundled in frontend code.
- Secrets (API keys, service accounts) MUST NOT be committed to the repository.
- Sensitive credentials (`passwordHash`, `failedLoginAttempts`, `customGeminiKey`) are isolated in subcollections `users/{CodeID}/private/*`.
- Mapping collections `ndids` and `emails` are server-only (anti-enumeration).

---

## 8. Database Rules

All database schemas MUST follow [DATABASE.md](DATABASE.md) and [AUTH_DATA_MODEL.md](AUTH_DATA_MODEL.md).

Summary:
- User documents are keyed by CodeID: `users/{CodeID}`.
- Sensitive credentials are in subcollections `users/{CodeID}/private/*`.
- NDID mapping: `ndids/{normalizedNDID}` (server-only).
- Email mapping: `emails/{normalizedEmail}` (server-only).
- Atomic sequential counter: `counters/code_ids` (server-only).

---

## 9. AI AGENT ABSOLUTE PROHIBITIONS

The following actions are **strictly prohibited** for any AI agent working on this repository:

1. **MUST NOT** convert NDID to a fake email (`${ndid}@ndsite.web.app` or any domain).
2. **MUST NOT** store passwords in plaintext anywhere (Firestore, Realtime DB, localStorage, code).
3. **MUST NOT** generate CodeID on the frontend or using `Math.random()` / `Date.now()`.
4. **MUST NOT** use `signInWithEmailAndPassword()` with a fabricated NDID-based email.
5. **MUST NOT** bundle Firebase Admin SDK or service account keys in frontend code.
6. **MUST NOT** hard-code Owner/Admin by email, CodeID, or UID in frontend conditions.
7. **MUST NOT** rely solely on localStorage or frontend state for authorization decisions.
8. **MUST NOT** log, return, or display password values in any form.
9. **MUST NOT** create open Firestore rules (`allow read, write: if true;`) or allow client to write sensitive fields.
10. **MUST NOT** auto-prepend `@` to NDID values.
11. **MUST NOT** sanitize/strip characters from NDID values read from the database.
12. **MUST NOT** use SHA-256, MD5, or SHA-1 for password hashing.
13. **MUST NOT** use NDID or Email as canonical foreign keys in any module.
14. **MUST NOT** delete, reset, overwrite, or migrate current TimeTable data during Phase 01-C0.
15. **MUST NOT** expose `ndids` or `emails` mapping collections to client direct reads.
16. **MUST NOT** switch away from React + Vite + TypeScript + Tailwind CSS for TimeTable and new modules.
