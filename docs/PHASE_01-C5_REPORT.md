# PHASE 01-C5 COMPLETION REPORT
## ND Labs / EduSpace — Account Recovery, Password Reset & Account Unlock

> **Phase:** 01-C5  
> **Component:** Canonical Account Recovery + Password Reset + Account Unlock  
> **Status:** DONE  
> **Date:** 2026-09-05  
> **System Version:** `ver:1.9.5.1628`  
> **References:** [AUTH_DATA_MODEL.md](AUTH_DATA_MODEL.md), [AUTH_API_CONTRACT.md](AUTH_API_CONTRACT.md), [DATABASE.md](DATABASE.md), [SECURITY.md](SECURITY.md), [AUTH_RULES.md](AUTH_RULES.md), [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md)

---

## 1. Status

**STATUS: DONE**

Phase 01-C5 has been successfully implemented, tested with 100% passing automated test suites, and documented. The implementation establishes a secure, server-controlled account recovery state machine, one-time verification code mechanics, single-use password reset tokens, and automatic account unlocking without violating any core identity invariants.

---

## 2. Implemented Components

### 2.1 Backend Recovery Architecture & Database Access Layer
- **Private Subcollection Layer (`functions/src/database/recovery.js`):**
  - Path: `users/{CodeID}/private/recovery` (fixed singleton document `recovery`).
  - Implemented accessors: `getRecoveryDocRef`, `getRecoveryDoc`, `setRecoveryDoc`, `updateRecoveryDoc`, `deleteRecoveryDoc`.
- **Core Recovery Service (`functions/src/auth/recovery.js`):**
  - `maskEmail(email)`: Safe email masking utility for user interface and audit logs (e.g. `u***r@example.com`).
  - `requestAccountRecovery({ db, identifier, ip, userAgent, options })`:
    - Resolves `identifier` (NDID or email) to canonical `CodeID`.
    - Enforces Anti-Enumeration: returns uniform HTTP 200 generic message even if identifier is non-existent or email is unverified.
    - Constant-time dummy verification execution against timing attacks.
    - Verified Email Requirement: only accounts with `emailVerified: true` (or verified recovery email) generate verification codes.
    - Cooldown & Rate Limiting: enforces 60-second cooldown between recovery requests per account (throws `RateLimitExceededError` / HTTP 429).
    - Generates cryptographically secure 6-digit verification code (`crypto.randomInt(100000, 1000000)`).
    - Stores SHA-256 hash of code in `users/{CodeID}/private/recovery.codeHash`. Raw codes are **NEVER stored in Firestore**.
    - Sets 15-minute expiration (`expiresAtMs`).
    - Emits `recovery_requested` security audit event with masked target email.
  - `verifyRecoveryCode({ db, identifier, code, ip, userAgent })`:
    - Resolves `identifier` to `CodeID`.
    - Validates 6-digit code format.
    - Atomic Firestore transaction on `users/{CodeID}/private/recovery`:
      - Validates state is `'pending'`.
      - Checks expiration: if `now > expiresAtMs`, marks status as `'expired'`, logs `recovery_failed`, and rejects.
      - Checks attempt counter: if `attemptCount >= maxAttempts` (5), marks status as `'locked'`, logs `recovery_failed`, and rejects.
      - Hashes input code with SHA-256 and compares with stored `codeHash`.
      - If mismatch: atomically increments `attemptCount`. If attempts reach 5, sets status to `'locked'`, logs `recovery_failed`, and rejects.
      - If match: generates cryptographically secure 32-byte hex `resetToken` (10-minute TTL), stores SHA-256 hash in `resetTokenHash`, sets status to `'verified'`, wipes `codeHash` (`null`), and emits `recovery_code_verified` audit event.
  - `resetPasswordWithRecovery({ db, auth, identifier, resetToken, newPassword, ip, userAgent })`:
    - Validates password length and format rules (min 8 characters).
    - Hashes new password using canonical `bcrypt-v1`.
    - Atomic Firestore transaction across `users/{CodeID}/private/recovery`, `users/{CodeID}/private/security`, and `users/{CodeID}`:
      - Validates recovery status is `'verified'`.
      - Validates `resetToken` hash and TTL (`now < resetTokenExpiresAtMs`).
      - Updates `users/{CodeID}/private/security`: updates `passwordHash`, `passwordVersion: 'bcrypt-v1'`, resets `failedLoginAttempts: 0`, clears `lockedAt: null` and `lockReason: null`.
      - Automatic Account Unlock: if account was locked (`status: 'locked'`), updates `users/{CodeID}.status = 'active'`.
      - Single-Use Consumption: sets recovery doc `status: 'consumed'`, records `consumedAt`, wipes `resetTokenHash` (`null`).
    - Syncs password with Firebase Auth via `auth.updateUser(codeId, { password })`.
    - Revokes all active user refresh tokens via `auth.revokeRefreshTokens(codeId)`.
    - Emits `password_reset` and `account_unlocked` (when account was locked) security audit events.

### 2.2 Cloud Functions API Endpoints (`functions/index.js`)
Exported 3 secure HTTPS endpoints:
1. `POST /requestRecoveryCode`: Initiates recovery, enforces cooldown, generates 6-digit code.
2. `POST /verifyRecoveryCode`: Validates code, enforces 5-attempt limit, issues single-use `resetToken`.
3. `POST /resetPasswordWithRecovery`: Resets password, unlocks account, consumes token, revokes sessions.

### 2.3 Client Adapter (`assets/js/canonical-auth.js`)
- Added endpoints: `ENDPOINTS.requestRecoveryCode`, `ENDPOINTS.verifyRecoveryCode`, `ENDPOINTS.resetPasswordWithRecovery`.
- Added client methods:
  - `canonicalAuth.requestRecoveryCode({ identifier })`
  - `canonicalAuth.verifyRecoveryCode({ identifier, code })`
  - `canonicalAuth.resetPasswordWithRecovery({ identifier, resetToken, newPassword })`
- Extended `canonicalAuth.mapError()` with Vietnamese localized error messages for rate limiting (`RATE_LIMIT_EXCEEDED` / HTTP 429), expired codes, invalid tokens, and brute-force lockouts.

### 2.4 User Interface
- **Dedicated Recovery Flow (`auth/recovery/index.html`):**
  - Step 1: Input NDID or Email.
  - Step 2: Input 6-digit verification code with live 60-second cooldown timer for resending codes.
  - Step 3: Input new password and password confirmation with visibility toggles and real-time validation.
  - Step 4: Success confirmation screen with automated redirect to login.
- **Login Integration (`auth/login/index.html`):**
  - Updated "Quên mật khẩu?" link to point directly to `/auth/recovery/`.
  - Removed legacy modal and deprecated client-side email dispatch loops.

---

## 3. Security Architecture & Invariants

1. **Anti-Enumeration Protection:**
   - Uniform generic response returned on recovery request regardless of whether the identifier exists.
   - Constant-time dummy hash verification prevents timing attacks on missing users or unverified accounts.
2. **Cryptographic Protection & Zero Secret Leakage:**
   - Raw 6-digit codes and `resetToken` values are **never stored in Firestore**.
   - Only SHA-256 hashes are stored in `users/{CodeID}/private/recovery`.
   - Security audit events in `security_events` record only metadata and masked emails (`targetEmailMasked`), never raw passwords, OTPs, or reset tokens.
3. **Strict Brute-Force & Rate Limiting Defense:**
   - 60-second cooldown between recovery requests per account (HTTP 429).
   - Maximum 5 failed verification attempts before the recovery attempt is permanently locked.
4. **Single-Use Ephemeral Reset Token:**
   - Verification code is wiped immediately upon issuing `resetToken`.
   - `resetToken` is consumed immediately upon password reset and cannot be reused.
5. **Session Revocation on Password Reset:**
   - `auth.revokeRefreshTokens(codeId)` is invoked on every successful password reset, terminating active attacker sessions across all devices.
6. **Firestore Security Rules:**
   - `firestore.rules` enforces `match /users/{codeId}/private/{document=**} { allow read, write: if false; }`.
   - Clients have zero read and zero write authority over recovery documents.

---

## 4. Verification & Automated Test Results

### 4.1 Phase 01-C5 Test Suite (`tests/account_recovery.test.js`)
10 automated tests covering all recovery, reset, and unlock specifications:
- `✔ Phase 01-C5: Email Masking Utility`
- `✔ Phase 01-C5: Account Recovery Request - Anti-Enumeration & Code Generation`
- `✔ Phase 01-C5: Account Recovery - Reject Unverified Email Accounts`
- `✔ Phase 01-C5: Account Recovery - Cooldown & Rate Limiting (Task 9)`
- `✔ Phase 01-C5: Verification Code - Success, Wrong Code & Brute-Force Limit`
- `✔ Phase 01-C5: Verification Code - Expiry Enforcement`
- `✔ Phase 01-C5: Verification Code - Success Path & Reset Token Issuance`
- `✔ Phase 01-C5: Password Reset & Locked Account Unlock Flow`
- `✔ Phase 01-C5: Security Audit Events for Recovery & Unlock`
- `✔ Phase 01-C5: Firestore Rules Contract for private/recovery`

### 4.2 Full Repository Regression Suite (`tests/*.test.js`)
All 68 automated tests across all phases pass with 100% success rate:
- `tests/codeid_allocator.test.js` (Phase 01-C1): 13/13 pass
- `tests/auth_foundation.test.js` (Phase 01-C2): 15/15 pass
- `tests/auth_client_and_self_service.test.js` (Phase 01-C3): 19/19 pass
- `tests/google_identity_linking.test.js` (Phase 01-C4): 11/11 pass
- `tests/account_recovery.test.js` (Phase 01-C5): 10/10 pass

```
ℹ tests 68
ℹ suites 0
ℹ pass 68
ℹ fail 0
ℹ duration_ms 1658.3527
```

---

## 5. Non-Regression & Scope Boundaries

1. **Zero TimeTable Mutations:** TimeTable schemas, timetable documents, comments, and presence collections were not modified.
2. **Zero Legacy Account Mutations:** Production accounts and legacy records were not modified.
3. **Zero Production Deployments:** Changes remain in the local codebase and verified through test suites.
4. **CodeID & Auth UID Immutability:** `CodeID` remains immutable; Firebase Auth `UID` strictly equals `CodeID`.
5. **Preserved Raw NDID Representation:** NDID strings are preserved without stripping special characters or auto-prepending `@`.

---

## 6. Scope Boundaries & Items Deferred

- **DEFERRED:**
  - Production Email Delivery Provider integration (SendGrid / Resend / AWS SES; ADR-010 is OPEN).
  - Multi-Factor Authentication (MFA) and trusted device tokens (`private/security.activeSessions`).
  - Admin UI for manual lockout override.
- **OUT OF SCOPE:**
  - TimeTable data modifications or feature refactoring.
  - Production infrastructure deployment.
- **MIGRATION REQUIRED:**
  - Backfilling legacy users with unverified emails to prompt verification for recovery readiness.
- **OPEN DECISIONS:**
  - ADR-010: Email Delivery Provider for Verification & Recovery.
  - ADR-011: Trusted Device Recognition Mechanism.
  - ADR-012: Account Recovery Final Protocol & AI Guardrails.

---

## 7. HANDOFF

Phase hoàn tất. Không thực hiện hoặc đề xuất phase tiếp theo. Roadmap tiếp theo do Owner quyết định.
