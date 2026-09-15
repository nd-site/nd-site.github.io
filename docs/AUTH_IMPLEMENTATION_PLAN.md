# AUTH IMPLEMENTATION PLAN

> **Project:** TimeTable – EduSpace by ND Labs
> **Target Stack:** React + Vite + TypeScript + Tailwind CSS + Firebase
> **Date:** 2026-08-30
> **Status:** PLAN ONLY — No implementation in this phase

---

## Phase A — Documentation / Rules

### Objective
Update all project rules and documentation to reflect the new auth architecture before any code changes.

### Files Likely Affected
- `_agent/workflows/coding-standards.md` — Remove/update §9 (fake email domain rule)
- `AGENT.md` — Add auth architecture rules
- `.cursorrules` — Sync with AGENT.md
- `.agents/AGENTS.md` — Sync with AGENT.md
- `docs/AUTH_RULES.md` — New file: definitive auth rules document

### Dependencies
- None (first phase)

### Risk
- **LOW** — Documentation only, no code changes.
- Risk: other AI agents may follow old rules if not updated atomically.

### Validation
- Review all rule files for consistency.
- Verify no conflicting rules remain (especially §9 of coding-standards.md re: `@ndsite.web.app`).

---

## Phase B — Backend Auth

### Objective
Create a trusted backend (Cloud Functions) that handles authentication logic: account verification, password hashing, login validation, and account status checks. This is the security boundary — frontend is NOT a security boundary.

### Files Likely Affected
- `functions/index.js` — Add new auth Cloud Functions (or create separate files)
- `functions/package.json` — Add dependencies (`bcryptjs` or `argon2`, etc.)
- `functions/auth/` — New directory for auth-specific functions

### Cloud Functions to Create

| Function | Type | Purpose |
|---|---|---|
| `authLogin` | `onCall` or `onRequest` | Validate NDID/email + password, check status/lockout, return Custom Token |
| `authRegister` | `onCall` or `onRequest` | Create new account (server-side only for now, or admin-triggered) |
| `authResetPassword` | `onCall` or `onRequest` | Password reset flow |
| `authCheckStatus` | `onCall` | Check account status (active/locked/banned) |
| `authUpdatePassword` | `onCall` | Change password (requires current password or admin) |

### Dependencies
- Firebase Admin SDK (already installed in functions)
- Password hashing library
- Phase A (documentation) should be complete

### Risk
- **MEDIUM** — Backend is additive; doesn't break existing system.
- Risk: Cold start latency on Cloud Functions.
- Risk: Need to handle CORS correctly for new functions.

### Validation
- Unit test each function with mock data.
- Test error cases: wrong password, locked account, banned account.
- Verify no plaintext passwords are logged or returned.

---

## Phase C — Firebase Custom Token

### Objective
Implement the Custom Token flow: backend verifies credentials → creates Firebase Custom Token → frontend calls `signInWithCustomToken()`.

### Files Likely Affected
- `functions/index.js` (or `functions/auth/`) — Custom Token generation using Admin SDK
- New React auth module — `signInWithCustomToken()` call
- `assets/js/firebase-init.js` — May need to support Custom Token session

### Architecture

```
Frontend (React)                    Backend (Cloud Functions)
─────────────────                   ────────────────────────
POST {ndid, password}  ──────────►  authLogin()
                                      │
                                      ▼
                                    Lookup user by NDID/email
                                    Verify passwordHash
                                    Check status ≠ locked/banned
                                    Check failedLoginAttempts < 5
                                      │
                                      ▼
                                    admin.auth().createCustomToken(uid, {role, adminLevel})
                                      │
◄──────────────────────────────────  Return {customToken, user}
         │
         ▼
signInWithCustomToken(auth, token)
         │
         ▼
Firebase Auth session established
```

### Dependencies
- Phase B (backend auth functions)

### Risk
- **MEDIUM** — Core auth change. Must coexist with old system during migration.
- Risk: Existing users logged in with old method will lose session.
- Risk: Custom claims propagation delay.

### Validation
- End-to-end test: login → Custom Token → session → protected page access.
- Verify Firebase Auth session persists across page reloads.
- Verify custom claims appear in `auth.currentUser.getIdTokenResult()`.

---

## Phase D — CodeID

### Objective
Implement server-side sequential CodeID generation starting from `0000`, with atomic counter to prevent race conditions.

### Files Likely Affected
- `functions/auth/` — CodeID generation logic
- Firestore `counters/code_ids` — Atomic counter document
- Firestore `users/{CodeID}` — New collection structure (or migration)
- Firestore `code_ids/{CodeID}` — Index collection

### CodeID Rules
- Start from `0000`
- Increment sequentially: `0000`, `0001`, ..., `9999`, `10000`, ...
- Pad with leading zeros to minimum 4 digits
- Generated server-side only using Firestore transaction
- Never reuse, never reset, never change

### Dependencies
- Phase B (backend functions)

### Risk
- **HIGH** — Changes user document structure.
- Risk: Existing 8-digit random CodeIDs need mapping.
- Risk: `users/{CodeID}` vs `users/{uid}` is a fundamental schema change.

### Validation
- Test concurrent registrations (race condition test).
- Verify sequential generation under load.
- Verify CodeID never skips or duplicates.

---

## Phase E — NDID + Email Login

### Objective
Support dual login: NDID + password OR email + password, both resolving to the same account via CodeID.

### Files Likely Affected
- `functions/auth/` — Login function supports both NDID and email lookup
- New React login component — Dual input support
- Firestore `ndids/{ndid}` — Maps NDID → CodeID
- Firestore `emails/{email}` — New: Maps email → CodeID

### Login Resolution

```
User enters identifier + password
    │
    ├── Looks like email? → Lookup emails/{email} → get CodeID
    │
    └── Not email? → Lookup ndids/{ndid} → get CodeID
                │
                ▼
          Lookup users/{CodeID}
          Verify passwordHash
          Return Custom Token
```

### Dependencies
- Phase C (Custom Token)
- Phase D (CodeID)

### Risk
- **MEDIUM** — Additive; new login flow alongside old.
- Risk: Email collision (user has email that looks like someone else's NDID).
- Risk: Case sensitivity in NDID lookup.

### Validation
- Test login with NDID.
- Test login with email.
- Test that both reach the same account.
- Test with non-existent NDID/email (should not reveal which is wrong).

---

## Phase F — Role / Guards

### Objective
Implement role system (`user`, `admin`) with `adminLevel` (`owner`, `admin`, `null`), plus React route guards.

### Files Likely Affected
- New React components:
  - `ProtectedRoute.tsx` — requires authenticated
  - `AdminRoute.tsx` — requires `role === 'admin'`
  - `OwnerRoute.tsx` — requires `role === 'admin' && adminLevel === 'owner'`
- Firestore `users/{CodeID}` — `role` and `adminLevel` fields
- `firestore.rules` — Server-side enforcement
- Cloud Functions — Role verification in Custom Token claims

### Custom Claims Strategy

```typescript
// In Custom Token creation:
admin.auth().createCustomToken(uid, {
  role: userData.role,        // 'user' | 'admin'
  adminLevel: userData.adminLevel,  // 'owner' | 'admin' | null
  codeId: userData.codeId
});
```

### Dependencies
- Phase C (Custom Token — claims are set during token creation)
- Phase D (CodeID — used as user document key)
- React Router (needs to be installed: `react-router-dom`)

### Risk
- **MEDIUM** — Route guards are additive for TimeTable.
- Risk: Existing admin pages (vanilla HTML) won't use React guards — separate migration.
- Risk: First Owner bootstrapping — must be done manually in Firestore or via setup script.

### Validation
- Test unauthenticated user cannot access protected routes.
- Test regular user cannot access admin routes.
- Test admin cannot access owner routes.
- Test owner has full access.
- Verify role cannot be modified by client.

---

## Phase G — Lockout

### Objective
Implement account lockout after 5 failed login attempts, with mandatory recovery.

### Files Likely Affected
- `functions/auth/` — Login function: increment `failedLoginAttempts`, set `status = 'locked'`
- Firestore `users/{CodeID}` — `failedLoginAttempts`, `lockedAt`, `lockReason` fields
- New React UI — Lockout message, recovery flow
- `firestore.rules` — Prevent client from resetting lockout fields

### Lockout Flow

```
Login attempt
    │
    ├── Success → failedLoginAttempts = 0, lastLoginAt = now()
    │
    └── Failure → failedLoginAttempts++
                    │
                    ├── < 5 → Return "invalid credentials"
                    │
                    └── >= 5 → status = 'locked'
                                lockedAt = now()
                                lockReason = 'Too many failed attempts'
                                Return "account locked"
```

### Dependencies
- Phase B (backend auth)
- Phase E (login flow)

### Risk
- **LOW** — Additive security feature.
- Risk: Legitimate users locked out need recovery path.
- Risk: Need to decide recovery mechanism (email reset, admin unlock, or both).

### Validation
- Test 5 failed logins → account locked.
- Test locked account cannot login even with correct password.
- Test successful login resets counter.
- Test recovery flow unlocks account.
- Verify client cannot reset `failedLoginAttempts`.

---

## Phase H — Firestore Security

### Objective
Create and deploy comprehensive Firestore Security Rules that enforce authorization server-side.

### Files Likely Affected
- `firestore.rules` — New file (does not currently exist in repo)
- `firebase.json` — Add `"firestore": {"rules": "firestore.rules"}` section
- `database.rules.json` — Update Realtime Database rules

### Key Rules

```
// Pseudocode
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - keyed by CodeID
    match /users/{codeId} {
      allow read: if isOwner(codeId) || isAdmin();
      allow write: if isAdmin();  // Users cannot self-edit sensitive fields
      
      // Sub-rules for specific fields
      // Client CANNOT write: codeId, role, adminLevel, passwordHash, 
      //   passwordVersion, failedLoginAttempts, lockedAt, lockReason, banExpiresAt
    }
    
    // NDID lookup - restricted
    match /ndids/{ndid} {
      allow read: if request.auth != null;  // Needed for login lookup
      allow write: if isAdmin();
    }
    
    // CodeID lookup - restricted
    match /code_ids/{codeId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

### Dependencies
- Phase D (CodeID — determines collection structure)
- Phase F (Role — determines permission model)

### Risk
- **HIGH** — Incorrect rules can lock out all users or expose data.
- Risk: Must be tested thoroughly before deployment.
- Risk: Existing client-side writes to `users` collection will break if rules are tightened.

### Validation
- Test with Firebase Emulator.
- Test all CRUD operations for each role: anonymous, user, admin, owner.
- Verify sensitive fields cannot be written by client.
- Verify admin can manage users.
- Verify owner can manage admins.

---

## Phase I — Testing

### Objective
Comprehensive testing of the new auth system before production deployment.

### Test Categories

#### Unit Tests
- Password hashing and verification
- CodeID generation (sequential, no duplicates)
- Login validation logic
- Lockout counter logic
- Role/permission checks

#### Integration Tests
- Cloud Function → Firestore → Custom Token flow
- Login → Session → Protected Route flow
- Registration → CodeID → Login flow
- Lockout → Recovery → Login flow

#### Security Tests
- Client cannot modify `role`, `adminLevel`, `passwordHash`
- Client cannot read other users' `passwordHash`
- Brute force triggers lockout
- Custom Token contains correct claims
- Expired/invalid tokens are rejected
- No plaintext passwords in logs, responses, or storage

#### Migration Tests (when applicable)
- Existing users can still login after migration
- Existing CodeIDs are preserved
- Existing NDIDs map correctly to new structure
- No data loss during migration

### Files Likely Affected
- `functions/__tests__/` — New test directory
- `firestore.rules` — Test with emulator
- React test files for auth components

### Dependencies
- All previous phases

### Risk
- **LOW** — Testing is non-destructive.
- Risk: Incomplete test coverage may miss edge cases.

### Validation
- All tests pass.
- Manual testing of full user journey.
- Security review of Firestore rules.
- Load testing of CodeID generation.

---

## Implementation Order Summary

```
Phase A ─── Documentation/Rules ──────────── No code changes
    │
Phase B ─── Backend Auth Functions ────────── Cloud Functions (additive)
    │
Phase C ─── Firebase Custom Token ─────────── Core auth mechanism
    │
Phase D ─── CodeID (Server-side) ──────────── Database schema change
    │
Phase E ─── NDID + Email Login ────────────── Dual login support
    │
Phase F ─── Role / Guards ─────────────────── React route protection
    │
Phase G ─── Lockout ───────────────────────── Security hardening
    │
Phase H ─── Firestore Security Rules ──────── Server-side enforcement
    │
Phase I ─── Testing ───────────────────────── Verification
```

### Parallel Opportunities
- Phase A can be done immediately.
- Phases B, C, D can be developed together (backend).
- Phases E, F can be developed together (frontend).
- Phase G is independent once B is done.
- Phase H should be developed alongside B-F but deployed carefully.
- Phase I runs throughout.

---

> **CONFIRMATION: This is a plan document only. NO SOURCE CODE WAS MODIFIED.**
