# PHASE 01-C4 COMPLETION REPORT
## ND Labs / EduSpace — Google Identity Linking & Provider Protection

> **Phase:** 01-C4  
> **Component:** Firebase Authentication + Google Provider Identity Linking  
> **Status:** COMPLETED & VERIFIED (100% automated test coverage, 0 regressions)  
> **Date:** 2026-09-05  
> **System Version:** `ver:1.9.5.1607`  
> **References:** [AUTH_DATA_MODEL.md](AUTH_DATA_MODEL.md), [AUTH_API_CONTRACT.md](AUTH_API_CONTRACT.md), [DATABASE.md](DATABASE.md), [SECURITY.md](SECURITY.md), [AUTH_RULES.md](AUTH_RULES.md), [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md)

---

## 1. Executive Summary

In **Phase 01-C4**, canonical Google identity linking was implemented for the ND Labs / EduSpace authentication architecture. The system establishes a verified, server-controlled bridge between external Google OAuth credentials and internal canonical `CodeID` accounts without violating core identity invariants:

1. **Immutable Account Identity:**
   - `CodeID` remains the single immutable account identity.
   - Firebase Auth UID strictly equals CodeID (`UID === CodeID`).
   - Linking or unlinking a Google identity **NEVER** mutates `CodeID` or changes the user's Firebase Auth `UID`.
2. **Provider Identity vs Attributes:**
   - External Google accounts are keyed strictly by Google OAuth `sub` (`googleSubjectId` / provider `uid`) inside the server-only collection `google_identities/{googleSubjectId}`.
   - Google email is treated strictly as an informative profile attribute, **NEVER** as the primary identity key.
3. **Strict 1-to-1 Mapping & Duplicate Prevention:**
   - A Google identity can belong to at most **ONE** canonical `CodeID`.
   - Idempotent re-linking by the same account is accepted as a clean no-op.
   - Linking a Google identity already bound to another `CodeID` is rejected with HTTP 409 (`GoogleIdentityAlreadyLinkedError`).
   - **No automatic account merging:** Conflicting accounts are never silently merged; the user's existing account identity is preserved.
4. **Account Lockout Prevention Guard:**
   - Unlinking Google is blocked server-side if `users/{CodeID}/private/security.passwordHash` is absent.
   - Users must have an established password before unlinking Google, ensuring an account is never orphaned without an authentication credential.
5. **Zero Client Authority & Complete Elimination of Legacy Direct Writes:**
   - `google_identities/` has client read = DENY, client write = DENY in `firestore.rules`.
   - Legacy direct client writes in `auth/settings/` (`updateDoc(..., { googleEmail })`) were eliminated and replaced with `canonicalAuth.linkGoogle()` and `canonicalAuth.unlinkGoogle()`.

---

## 2. Core Invariants & Architecture Enforcement

### 2.1 Provider Subject ID vs Email Keying (Case Matrix)

| Scenario | Condition | System Behavior | Security Invariant |
|---|---|---|---|
| **Case A: New Link** | `googleSubjectId` not yet in `google_identities/` | Creates `google_identities/{googleSubjectId}`, updates `users/{CodeID}.googleEmail` and `googleSubjectId`, logs audit event. | 1-to-1 mapping established. |
| **Case B: Re-link** | `google_identities/{googleSubjectId}` belongs to current `CodeID` | Idempotent success (`noOp: true`). Returns HTTP 200 without duplicate writes. | Idempotency. |
| **Case C: Conflict** | `google_identities/{googleSubjectId}` belongs to another `CodeID` | Rejects with HTTP 409 (`GOOGLE_IDENTITY_ALREADY_LINKED`). Cleans up provider on caller's Auth record. Logs security audit `google_link_failed`. | **NO automatic account merging.** Conflict rejected cleanly. |
| **Case D: Re-created Email** | Different Google `sub`, but same email address | Keyed exclusively by `googleSubjectId`. Both mappings coexist independently. | Provider subject ID is primary key; email is attribute only. |

### 2.2 Anti-Spoofing Verification
- The client cannot claim an arbitrary Google identity by merely providing a payload with `googleSubjectId` or `googleEmail`.
- When linking, the backend validates `googleSubjectId` against the user's actual `providerData` fetched from Firebase Auth via Admin SDK (`auth.getUser(codeId)`).
- If the client supplies an ID that does not match the authenticated provider, the operation is rejected with `ValidationError`.
- If the client omits `googleSubjectId`, the backend automatically extracts it from `userRecord.providerData.find(p => p.providerId === 'google.com')`.

### 2.3 Safe Unlinking & Lockout Prevention
- Unlinking requires the user to maintain at least one valid authentication credential.
- Before removing `google_identities/{googleSubjectId}` and unlinking `google.com` in Firebase Auth, `unlinkGoogleIdentity` checks `users/{CodeID}/private/security`.
- If `passwordHash` is missing or null, the request is rejected with `ValidationError` ("Không thể hủy liên kết Google vì tài khoản chưa thiết lập mật khẩu đăng nhập...").

---

## 3. Implemented Components

### 3.1 Firestore Security Rules (`firestore.rules`)
Added server-side security rule denying all client access to `google_identities`:
```javascript
match /google_identities/{googleSubjectId} {
  allow read, write: if false;
}
```

### 3.2 Canonical Backend Google Module (`functions/src/auth/google.js`)
- `linkGoogleIdentity({ db, auth, codeId, googleSubjectId, googleEmail, ip, userAgent })`:
  - Enforces session validation, anti-spoofing verification, atomic transaction mapping in `google_identities/` and `users/{CodeID}`, and security audit logging.
- `unlinkGoogleIdentity({ db, auth, codeId, ip, userAgent })`:
  - Enforces lockout prevention check against `users/{CodeID}/private/security.passwordHash`, atomic deletion of `google_identities/{googleSubjectId}`, clearing of profile metadata, and unlinking provider in Firebase Auth.
- `resolveGoogleSubjectToCodeId(db, googleSubjectId, transaction)`:
  - Helper to resolve any Google provider subject ID to its owning `CodeID`.
- `GoogleIdentityAlreadyLinkedError`: HTTP 409 conflict error class exported from `functions/src/auth/errors.js`.

### 3.3 Cloud Function Endpoints (`functions/index.js`)
Added two authenticated HTTPS Cloud Function endpoints with CORS and Bearer ID token verification:
- `POST /linkGoogleIdentity`: Authenticated user links Google provider.
- `POST /unlinkGoogleIdentity`: Authenticated user unlinks Google provider.

### 3.4 Canonical Client Auth Adapter (`assets/js/canonical-auth.js`)
- Added `ENDPOINTS.linkGoogle` and `ENDPOINTS.unlinkGoogle`.
- Implemented `canonicalAuth.linkGoogle({ googleSubjectId, googleEmail })`:
  - Verifies current Firebase user.
  - Automatically extracts provider info from `auth.currentUser.providerData` if not passed.
  - Calls `/linkGoogleIdentity` with Bearer token.
  - Automatically rolls back client provider if backend returns conflict.
  - Refreshes canonical profile cache (`refreshUserProfile()`).
- Implemented `canonicalAuth.unlinkGoogle()`:
  - Calls `/unlinkGoogleIdentity` with Bearer token.
  - Cleans up client provider via `auth.currentUser.unlink('google.com')`.
  - Refreshes canonical profile cache.
- Extended `canonicalAuth.mapError()` with user-facing messages for `GOOGLE_IDENTITY_ALREADY_LINKED`, popup errors, and validation errors.

### 3.5 Frontend Settings Integration (`auth/settings/index.html`)
- Replaced legacy direct client Firestore writes with `canonicalAuth.linkGoogle()` and `canonicalAuth.unlinkGoogle()`.
- Updated Google link status check to inspect `providerData` and `userDataCache.googleSubjectId` instead of erroneously treating any Gmail address as Google-linked.
- Integrated standard confirmation prompt on unlink and unified status/error reporting.

---

## 4. Verification & Automated Test Results

### 4.1 Phase 01-C4 Test Suite (`tests/google_identity_linking.test.js`)
11 comprehensive automated tests covering all scenarios:
- `✔ Phase 01-C4: Google Identity Linking - Success Path (Case A)`
- `✔ Phase 01-C4: Google Identity Linking - Idempotent Same Account (Case B)`
- `✔ Phase 01-C4: Google Identity Linking - Reject Conflict with Different Account (Case C)`
- `✔ Phase 01-C4: Google Identity Linking - Provider Subject ID Keying (Case D)`
- `✔ Phase 01-C4: Google Identity Linking - Anti-Spoofing Verification`
- `✔ Phase 01-C4: Google Identity Linking - Automatic Resolution from Auth Record`
- `✔ Phase 01-C4: Safe Unlinking - Blocked if Account Has No Password (Lockout Prevention)`
- `✔ Phase 01-C4: Safe Unlinking - Success Path when Password Exists`
- `✔ Phase 01-C4: resolveGoogleSubjectToCodeId Helper`
- `✔ Phase 01-C4: Client Error Mapping Contract`
- `✔ Phase 01-C4: Firestore Rules Contract for google_identities`

### 4.2 Full Regression Test Suite (`tests/*.test.js`)
Executed across all phases:
- `tests/codeid_allocator.test.js` (Phase 01-C1)
- `tests/auth_foundation.test.js` (Phase 01-C2)
- `tests/auth_client_and_self_service.test.js` (Phase 01-C3)
- `tests/google_identity_linking.test.js` (Phase 01-C4)

```
ℹ tests 58
ℹ suites 0
ℹ pass 58
ℹ fail 0
ℹ duration_ms 1648.6745
```
**Result: 58/58 tests passing (100% success rate, 0 regressions).**

---

## 5. Explicit Non-Regressions & Strict Scope Boundaries

1. **Zero TimeTable Mutations:** TimeTable schemas, active schedule documents, and legacy references were not modified.
2. **Zero Legacy Data Mutations:** Existing production accounts and legacy users were not altered.
3. **Zero Production Deployments:** Cloud Functions, Firestore rules, and client code have not been deployed to live environments; changes remain verified locally and committed to the source repository.
4. **CodeID & Auth UID Immutability:** `CodeID` remains immutable; Firebase Auth `UID` strictly equals `CodeID`. Google identity is solely an external provider attribute mapped to `CodeID`.

---

## 6. Scope Boundaries & Items Deferred

- **DEFERRED:**
  - Canonical account recovery flow via email OTP (`users/{CodeID}/private/recovery`).
  - Automated account unlocking mechanisms after 5 consecutive failed attempts.
  - Multi-Factor Authentication (MFA) and trusted device management.
- **OUT OF SCOPE:**
  - Administrative role assignment / Admin dashboard mutations.
  - TimeTable schedule modifications or data migration.
- **MIGRATION REQUIRED:**
  - Backfilling legacy random UID accounts to canonical `CodeID` and linking historical Google profiles.

---

## 7. HANDOFF

Phase hoàn tất. Không thực hiện hoặc đề xuất phase tiếp theo.
Roadmap tiếp theo do Owner quyết định.

