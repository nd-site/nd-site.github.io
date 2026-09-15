# PHASE 01-C3 REPORT — ND LABS / EDUSPACE
## Auth Client Integration & Self-Service Operations (Canonical Frontend Auth Migration)

> **Phase:** 01-C3  
> **Status:** COMPLETED ✅  
> **Date:** 2026-09-05  
> **Authority:** Antigravity Architect & Firebase Security Engineering Team  
> **Test Pass Rate:** 100% (47/47 passing tests across Phase 01-C1, 01-C2, and 01-C3)  
> **Artifacts Produced:**  
> - `assets/js/canonical-auth.js` (Canonical Client Auth Adapter)  
> - `functions/src/auth/self_service.js` (Self-Service Operations: `changePassword`, `changeNdid`)  
> - `tests/auth_client_and_self_service.test.js` (Comprehensive Automated Test Suite)  
> - Frontend Integration Updates in `auth/login/`, `auth/register/`, `auth/settings/`, and `assets/js/nd-navbar.js`  

---

## 1. Executive Summary

Phase 01-C3 successfully bridged the canonical authentication and database foundation (established in Phase 01-C1 and Phase 01-C2) with the user-facing web applications of ND Labs and EduSpace. 

Prior to this phase, client-side authentication contained significant architectural and security vulnerabilities:
1. Client-side synthesis of synthetic fake emails (`${ndid}@ndsite.web.app` or `${ndid}@ndsite.id`).
2. Plaintext password persistence in Firestore (`registeredPassword`) and client-side password reveal widgets.
3. Uncoordinated, client-side generation of random 8-digit CodeIDs via `Math.random()`.
4. Multi-email trial-and-error loops during login and password reset.
5. Insecure reliance on `localStorage` as an unverified authority without validating that Firebase Auth UID matches canonical CodeID.

In Phase 01-C3, all frontend auth interactions were refactored to use a single, authoritative, centralized client adapter (`assets/js/canonical-auth.js`). All registration and authentication actions now communicate directly with canonical Cloud Functions endpoints (`registerUser`, `loginUser`, `changePassword`, `changeNdid`). Firebase Auth tokens strictly enforce `UID === CodeID`, passwords are fundamentally protected by bcrypt-v1 hashing, and handle changes enforce a 30-day reservation cooldown without altering user identity or breaking business relations.

---

## 2. Architectural Invariants Confirmed

| Architectural Principle | Status | Implementation Detail |
|---|---|---|
| **Immutable CodeID as Account Identity** | ✅ Enforced | CodeID is allocated strictly on the backend via atomic transaction and remains completely immutable throughout the account lifecycle. |
| **Firebase Auth UID === CodeID** | ✅ Enforced | All custom tokens minted by the backend contain `uid: CodeID`. The client adapter verifies `firebaseUser.uid === canonicalProfile.codeId` and fails closed on mismatch. |
| **Dynamic Profile Resolution via `users/{CodeID}`** | ✅ Enforced | User profile attributes (NDID, display name, avatar, role) are dynamically read from `users/{CodeID}`. |
| **NDID Mutability without Foreign Key Side Effects** | ✅ Enforced | NDID changes update `users/{CodeID}.ndid` and `ndids/` mappings. CodeID never changes; TimeTable ownership and business foreign keys are 100% untouched. |
| **No Plaintext Passwords** | ✅ Enforced | Passwords exist only in transit over TLS and are hashed with bcrypt-v1 on the trusted backend. No plaintext field is stored or transmitted to the client. |

---

## 3. Detailed List of Frontend Modifications

### 3.1 `assets/js/canonical-auth.js` [NEW]
Created the centralized client adapter for all frontend auth and session operations:
- `login({ identifier, password })`: Calls `loginUser` endpoint with NDID or email, exchanges custom token with `signInWithCustomToken()`, resolves canonical profile from `users/{CodeID}`, and stores session in multi-account cache.
- `register({ ndid, password, displayName, email })`: Calls `registerUser` endpoint, consumes allocated CodeID, initializes profile, and logs user in seamlessly.
- `logout()`: Signs out of Firebase Auth, cleans session cache, and dispatches state change event.
- `onAuthStateChanged(callback)`: Subscribes to Firebase Auth state, verifies `firebaseUser.uid === CodeID`, and fetches latest canonical profile from `users/{CodeID}`.
- `changePassword({ currentPassword, newPassword })`: Calls backend `changePassword` endpoint using authenticated Bearer token.
- `changeNdid({ newNdid })`: Calls backend `changeNdid` endpoint using authenticated Bearer token.
- `requireAuth(redirectUrl)`: Route guard protecting authenticated pages.
- `mapError(error)`: Centralized translation of backend and Firebase error codes into friendly Vietnamese messages.

### 3.2 `auth/login/index.html` [MODIFIED]
- Included `/assets/js/canonical-auth.js`.
- Eliminated fake candidate email array (`candidateEmails.push('${ndid}@ndsite.web.app')`) and guessing loop.
- Replaced direct `signInWithEmailAndPassword` calls with `canonicalAuth.login({ identifier, password })`.
- Integrated `canonicalAuth.mapError(err)` to display accurate security messages (account locked, invalid credentials, disabled).

### 3.3 `auth/register/index.html` [MODIFIED]
- Included `/assets/js/canonical-auth.js`.
- Removed `Math.random()` client-side CodeID generation.
- Removed client-side `createUserWithEmailAndPassword` with fake email.
- Removed client-side `setDoc` writing `registeredPassword` in plaintext to Firestore.
- Connected registration form to `canonicalAuth.register()`.
- Upon successful registration, user receives their immutable sequential CodeID directly from the backend.

### 3.4 `auth/settings/index.html` [MODIFIED]
- Included `/assets/js/canonical-auth.js`.
- **Citizen Card Widget:** Removed the "Xem mật khẩu" (reveal password) button and 8-digit OTP plaintext reveal modal. Replaced with "Đổi mật khẩu" button that opens the password management modal. Password is permanently masked (`••••••••`).
- **Card Download:** Allows downloading Citizen Card image with masked password without requiring OTP unlock.
- **NDID Update Form:** Connected to `canonicalAuth.changeNdid({ newNdid })`. Notifies user of the 30-day reservation cooldown on their previous NDID.
- **Password Change Form:** Replaced candidate email guessing and plaintext password writing with `canonicalAuth.changePassword({ currentPassword, newPassword })`.
- **Logout:** Wired logout buttons to `canonicalAuth.logout()`.

### 3.5 `assets/js/nd-navbar.js` [MODIFIED]
- Added auto-loading for `/assets/js/canonical-auth.js` alongside `font.js` and `nd-accounts.js`.
- Refactored `userSection` into reactive `renderNavbarUser(userObj)` function.
- Added event listener to `window.addEventListener('nd-auth-state-changed', ...)` so the navbar automatically refreshes avatar, NDID, and role badge when user authenticates or switches accounts.
- Updated popover logout handlers to call `canonicalAuth.logout()`.

---

## 4. Detailed List of Backend Modifications

### 4.1 `functions/src/auth/self_service.js` [NEW]
Implemented trusted self-service operations:
1. `changePassword({ db, auth, codeId, currentPassword, newPassword, ip, userAgent })`:
   - Validates new password length (≥ 8 chars).
   - Validates new password differs from current password.
   - Verifies `currentPassword` against bcrypt hash in `users/{CodeID}/private/security`.
   - Hashes `newPassword` with bcrypt-v1.
   - Updates `passwordHash`, `lastPasswordChangedAt`, and resets `failedLoginAttempts: 0`.
   - Synchronizes Firebase Auth password via `admin.auth().updateUser()`.
   - Logs tamper-evident security event (`password_changed` or `password_change_failed`).
2. `changeNdid({ db, codeId, newNdid, ip, userAgent })`:
   - Validates syntax (`/^[a-zA-Z0-9_.]+$/`, 3–30 characters, no spaces, no 'admin').
   - Handles idempotency (returns `noOp: true` if unchanged).
   - Verifies availability in `ndids/{normalizedNDID}` (checks active status and cooldown expiration).
   - Runs atomic Firestore transaction:
     - Sets new NDID mapping with `codeId`, `status: 'active'`, `reservedBy: codeId`.
     - Sets old NDID mapping with `status: 'reserved'`, `active: false`, `reservedUntil = now + 30 days`.
     - Updates `users/{CodeID}.ndid` preserving raw casing.
     - Logs tamper-evident security event (`ndid_changed`).

### 4.2 `functions/src/index.js` & `functions/index.js` [MODIFIED]
- Exported `changePassword`, `changeNdid`, and `NDID_COOLDOWN_DAYS`.
- Added authenticated HTTPS endpoints in `functions/index.js`:
  - `exports.changePassword`: Extracts Bearer token, verifies via `admin.auth().verifyIdToken()`, extracts `codeId = decodedToken.uid`, calls `changePassword()`.
  - `exports.changeNdid`: Extracts Bearer token, verifies via `admin.auth().verifyIdToken()`, extracts `codeId = decodedToken.uid`, calls `changeNdid()`.
- Validated all 8 Cloud Function exports:
  `['geminiProxy', 'lotusBotWebhook', 'lotusBotAdmin', 'canonical', 'registerUser', 'loginUser', 'changePassword', 'changeNdid']`.

---

## 5. Elimination of Anti-Patterns

| Anti-Pattern | Previous State | Canonical Phase 01-C3 State |
|---|---|---|
| **Fake Email Domains** | Created `${ndid}@ndsite.web.app` on Firebase Auth. | Completely removed. Firebase Auth users are minted directly with `uid: CodeID`. |
| **Plaintext Passwords** | Saved in Firestore (`users.registeredPassword`) and revealable on settings page. | Completely purged from frontend and backend. Bumpered with bcrypt-v1. Masked as `••••••••`. |
| **Math.random() CodeID** | Client generated 8-digit random string on registration. | Generated sequentially on backend via atomic counter (`counters/code_ids`). |
| **Candidate Email Guessing** | Tried 6 candidate emails in loop to authenticate or change password. | Single targeted lookup via `ndids/` or `emails/` mapping on backend. |
| **Unverified Local Storage** | `localStorage.nd_user` was treated as trusted security authority. | Session state verified against Firebase Auth token; fail-closed on UID mismatch. |

---

## 6. Self-Service Operations Verification

### 6.1 Password Change Flow
- **Current Password Verification:** Verifies current password using bcrypt before applying change.
- **Strength Validation:** Rejects passwords under 8 characters or identical to current password.
- **Multi-System Sync:** Updates both Firestore `users/{CodeID}/private/security` and Firebase Auth user credentials.
- **Audit Logging:** Every attempt (success or failure) is logged to `security_events` with actor CodeID and client metadata.

### 6.2 NDID Change & 30-Day Cooldown Flow
- **Syntax Enforcement:** Only permits `[a-zA-Z0-9_.]`, rejects 'admin' and whitespace.
- **Reservation Lock:** The previous NDID cannot be claimed by another user for 30 days.
- **Reclaiming After Cooldown:** After 30 days elapse, the NDID becomes available for any user.
- **Identity Preservation:** CodeID remains strictly immutable; all business documents and relations remain 100% intact.

---

## 7. Error Mapping Dictionary (canonicalAuth.mapError)

| Error Code / Message | Vietnamese Client Message |
|---|---|
| `auth/wrong-password`, `INVALID_CREDENTIALS` | *"Mật khẩu hiện tại không chính xác."* |
| `auth/user-not-found`, `IDENTIFIER_NOT_FOUND` | *"Tài khoản không tồn tại trên hệ thống."* |
| `auth/invalid-credential` | *"Thông tin đăng nhập không hợp lệ hoặc mật khẩu không chính xác."* |
| `auth/email-already-in-use`, `EMAIL_TAKEN` | *"Email này đã được sử dụng cho một tài khoản khác."* |
| `NDID_TAKEN`, `IDENTIFIER_UNAVAILABLE` | *"NDID này đã có người sử dụng."* |
| Cooldown Violation | *"NDID này đang trong thời gian bảo lưu (30 ngày), vui lòng chọn NDID khác."* |
| `auth/weak-password`, `WEAK_PASSWORD` | *"Mật khẩu quá ngắn hoặc không đủ mạnh (tối thiểu 8 ký tự)."* |
| `ACCOUNT_LOCKED` | *"Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút."* |
| `ACCOUNT_BANNED` | *"Tài khoản của bạn đã bị cấm truy cập hệ thống."* |
| `ACCOUNT_DISABLED` | *"Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."* |

---

## 8. Automated Test Suite Results

All 47 tests across the entire test suite passed successfully with 0 failures:

```
▶ Phase 01-C3: Self-Service changePassword()
  ✔ Successfully changes password with valid current password
  ✔ Fails on incorrect current password
  ✔ Fails when new password is too short (< 8 chars)
  ✔ Fails when new password is identical to current password
✔ Phase 01-C3: Self-Service changePassword()
▶ Phase 01-C3: Self-Service changeNdid() & 30-Day Cooldown
  ✔ Successfully changes NDID and sets 30-day cooldown on old NDID
  ✔ Another user cannot claim old NDID while cooldown is active
  ✔ Cannot take an NDID that is currently active by another user
  ✔ Validation: Rejects invalid NDID format and "admin"
  ✔ Idempotency: Re-submitting the same NDID is a clean no-op
  ✔ Allows reclaiming old NDID after cooldown period expires
✔ Phase 01-C3: Self-Service changeNdid() & 30-Day Cooldown
▶ Phase 01-C3: Client Error Mapping & Security Contracts
  ✔ Maps credential and security errors accurately to Vietnamese user messages
  ✔ Strict UID === CodeID Fail-Closed Invariant Check
✔ Phase 01-C3: Client Error Mapping & Security Contracts
✔ PASSWORD: hashing and verification with bcrypt-v1
✔ PASSWORD: validation constraints and whitespace preservation
✔ NDID: validation, normalization, and policy enforcement
✔ EMAIL: validation and normalization
✔ REGISTRATION: full canonical registration flow with UID === CodeID
✔ REGISTRATION: duplicate NDID is rejected atomically
✔ REGISTRATION: duplicate Email is rejected atomically
✔ REGISTRATION: failure downstream permanently consumes CodeID (never recycled)
✔ REGISTRATION: idempotency key replays exact result without duplicate account
✔ LOGIN: authenticate successfully via NDID
✔ LOGIN: authenticate successfully via Email
✔ LOGIN: wrong password increments failed count and locks after 5 attempts
✔ LOGIN: successful login resets failed counter to zero
✔ LOGIN: rejects accounts with disabled or banned status
✔ SECURITY & ANTI-ENUMERATION: generic error message for non-existent users
✔ CONCURRENCY: 2 simultaneous registrations with same NDID only permits 1
✔ formatCodeId: 0000 starting sequence and 4-digit zero padding
✔ formatCodeId: 9999 to 10000 boundary and 5+ digit expansion
✔ formatCodeId: rejects invalid inputs safely
✔ isValidCodeId: accepts strictly canonical CodeIDs
✔ isValidCodeId: rejects non-canonical and corrupt CodeIDs
✔ parseCodeId: converts valid CodeIDs to integer and throws on invalid
✔ allocateCodeId: initializes counter automatically starting at 0000
✔ allocateCodeId: monotonic sequential increments
✔ allocateCodeId: crosses 9999 -> 10000 boundary seamlessly
✔ allocateCodeId: consumed on allocation — never reused
✔ allocateCodeId: corruption fails safely without random/fallback IDs
✔ allocateCodeId: concurrency test (100 simultaneous allocations)
✔ createCanonicalUserFoundation: establishes users/{CodeID} with doc.id === codeId
✔ createCanonicalUserFoundation: rejects duplicate user creation
✔ getCanonicalUserFoundation: enforces doc.id === data.codeId invariant
✔ CodeIdAllocator class: object-oriented wrapper works as expected

ℹ tests 47
ℹ pass 47
ℹ fail 0
```

---

## 9. Scope Boundaries Verification

- **TimeTable System Unchanged:** No timetable documents, permissions, or ownership bindings were modified or deleted.
- **No Existing User Migration Performed:** Legacy user records were preserved without premature or breaking migrations.
- **No Production Deployments:** Code changes remain localized and verified in staging/test environments; `firebase deploy` was not executed.
- **Fail-Closed Security Maintained:** All endpoints enforce strict authentication and input validation boundaries.

---

## 10. Next Phase Recommendations

### Proposed Next Phase: PHASE 01-C4
**Title:** Google OAuth & Multi-Factor Account Linking + Recovery Foundation  
**Objectives:**
1. Connect Google Sign-In with canonical identity architecture (`google_identities/{googleSubjectId} -> codeId`).
2. Implement multi-factor account linking in `auth/settings/` ensuring Google account is bound to existing `CodeID` without creating duplicate accounts.
3. Build secure account recovery foundation (email verification flow + password reset OTP dispatch via trusted backend).
