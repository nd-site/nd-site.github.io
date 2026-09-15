# AUTH AUDIT REPORT

> **Project:** TimeTable – EduSpace by ND Labs
> **Repository:** https://github.com/nd-site/nd-site.github.io
> **Production:** https://ndsite.web.app/eduspace/timetable
> **Audit Date:** 2026-08-30
> **Scope:** Read-only audit — NO source code was modified

---

## 1. Executive Summary

The ND Labs repository is a **multi-project monorepo** hosted on Firebase Hosting and GitHub Pages. It primarily uses **vanilla HTML/JS** for most pages (auth, EduSpace quiz, admin, chat), with a **React + Vite + TypeScript + Tailwind CSS** island used only for the MiniWorld sub-app.

**The TimeTable project does not yet exist in the repository.** No `timetable/` directory or files were found.

### Critical Findings (Summary)

1. **NDID is converted to a fake email** (`ndid@ndsite.web.app`) for Firebase Auth — directly conflicts with the new auth spec.
2. **Plaintext password stored in Firestore** (`registeredPassword` field) — CRITICAL security vulnerability.
3. **CodeID generated client-side** using `Math.random()` — violates the new spec requiring server-side sequential generation.
4. **Role/admin checks are client-only** — based on `localStorage` data that users can tamper with.
5. **No ProtectedRoute / AdminRoute / OwnerRoute** route guards exist — the project has no React Router.
6. **OTP generated client-side** and never actually sent — fake OTP flow.
7. **No lockout mechanism** exists.
8. **No account status system** (active/disabled/banned/locked/pending) exists.
9. **No `adminLevel` / Owner concept** exists — only a flat `role` field.
10. **Firebase client config hardcoded** in `config.js` as fallback values (acceptable for client SDK, but `env.json` contains API keys and is in `.gitignore`).

---

## 2. Current Technology Stack

| Layer | Technology | Status | Notes |
|---|---|---|---|
| **Frontend (Auth/EduSpace)** | Vanilla HTML + JS (ES Modules) | ❌ NOT React | Auth pages are plain HTML files |
| **Frontend (MiniWorld)** | React 19 + Vite + TypeScript + Tailwind CSS v4 | ✅ Matches target | Only `src/miniworld/` uses this stack |
| **Frontend (Landing)** | React 19 + Vite + TypeScript + Tailwind CSS v4 | ✅ Matches target | `src/App.tsx` — static landing page |
| **Build Tool** | Vite 6.2 | ✅ Present | Builds only MiniWorld (`src/miniworld/main.tsx`) |
| **TypeScript** | 5.8 | ✅ Present | `tsconfig.json` exists, `jsx: react-jsx` |
| **Tailwind CSS** | v4.1.14 (`@tailwindcss/vite`) | ✅ Present | Used via `@import "tailwindcss"` in `src/index.css` |
| **CSS (Auth pages)** | Custom CSS (`auth/auth.css`) | ❌ No Tailwind | Pure custom CSS, not Tailwind |
| **Firebase SDK** | v10.12.0 (Modular, CDN imports) | ✅ Present | Loaded via `https://www.gstatic.com/firebasejs/10.12.0/` |
| **Firebase Auth** | Email/Password + Google Sign-In | ✅ Present | No Custom Token |
| **Firebase Realtime Database** | Used for config/keys | ✅ Present | `database.rules.json` exists |
| **Firebase Firestore** | User data, NDID lookup | ✅ Present | Collections: `users`, `ndids`, `code_ids` |
| **Cloud Functions** | Node 20, firebase-functions v6 | ✅ Present | `geminiProxy`, `lotusBotWebhook`, `lotusBotAdmin` |
| **Firebase Hosting** | Site: `ndsite` | ✅ Present | Serves static files from root `.` |
| **Routing** | File-based (directories) | ❌ No React Router | No SPA routing; each page is a separate HTML file |
| **State Management** | `localStorage` (`nd_user`, `nd_accounts`) | ❌ No React state | All session data in localStorage |
| **Package Manager** | npm | ✅ Present | `package-lock.json` |

### Key Observation for TimeTable

The TimeTable project is specified to use **React + Vite + TypeScript + Tailwind CSS**. The current auth system is entirely vanilla HTML/JS. This means:

- The TimeTable will need its **own React-based auth components** (login, register, guards).
- The existing `auth/login/index.html` and `auth/register/index.html` **cannot be reused directly** in a React app.
- The MiniWorld sub-app (`src/miniworld/`) demonstrates the pattern: React components that read from `window.firebaseAuth` and `localStorage`.
- **No `react-router-dom`** is installed. It will need to be added for TimeTable.

---

## 3. Current Authentication Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CURRENT AUTH FLOW                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User enters NDID + Password on /auth/login/             │
│         │                                                │
│         ▼                                                │
│  Frontend converts NDID to fake email:                   │
│    "${ndid}@ndsite.web.app"                              │
│    "${ndid}@ndsite.id"                                   │
│         │                                                │
│         ▼                                                │
│  Tries Firestore lookup: /ndids/{ndid} → get uid         │
│    → /users/{uid} → get recoveryEmail/email              │
│    (may fail with permissions error)                     │
│         │                                                │
│         ▼                                                │
│  Loops through candidate emails, tries each:             │
│    signInWithEmailAndPassword(auth, email, password)     │
│         │                                                │
│         ├── Success ──► saveUserSession()                 │
│         │                  │                             │
│         │                  ▼                             │
│         │     Read /users/{uid} from Firestore           │
│         │     Build session object                       │
│         │     Store in localStorage (nd_user)            │
│         │     Store in NDAccounts (nd_accounts)          │
│         │     Redirect to /                              │
│         │                                                │
│         └── Failure ──► Show error message               │
│                                                          │
│  ─── Parallel: Google Sign-In ───                        │
│  signInWithPopup(GoogleAuthProvider)                     │
│    → saveUserSession()                                   │
│    → Redirect                                            │
│                                                          │
│  ─── Parallel: OTP Login ───                             │
│  Client generates random 8-digit OTP                    │
│  OTP is NEVER actually sent (console log only)          │
│  If OTP matches → reads registeredPassword from         │
│    Firestore → calls signInWithEmailAndPassword          │
│                                                          │
│  ─── On Every Page Load (firebase-init.js) ───           │
│  onAuthStateChanged() → reads /users/{uid}              │
│    → syncs role, ndid, codeId to localStorage           │
│    → updates navbar UI                                  │
│    → auto-generates CodeID if missing (client-side)     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Registration Flow

```
User fills form on /auth/register/
    │
    ▼
Frontend validates: NDID regex /^[a-zA-Z0-9_.]+$/
    │
    ▼
createUserWithEmailAndPassword(auth, "${ndid}@ndsite.web.app", password)
    │
    ▼
Generate CodeID: Math.floor(10000000 + Math.random() * 90000000)
  (check if exists in Firestore, retry up to 10 times)
    │
    ▼
setDoc(db, 'users', uid) → includes registeredPassword in PLAINTEXT
setDoc(db, 'ndids', ndid) → {uid, createdAt}
setDoc(db, 'code_ids', codeId) → {uid, ndid, createdAt}
    │
    ▼
Save session to localStorage
Show CardID modal (includes password in plaintext on screen)
```

---

## 4. Current Authentication Flow

### Login Methods

| Method | Implementation | Status |
|---|---|---|
| NDID + Password | `signInWithEmailAndPassword` with fake email `${ndid}@ndsite.web.app` | ⚠️ Fake email pattern |
| Email + Password | Not directly supported — only tries recovery email from Firestore | ⚠️ Partial |
| Google Sign-In | `signInWithPopup(GoogleAuthProvider)` | ✅ Works |
| OTP Login | Client-generated OTP, never sent to user | ❌ Fake/broken |
| Custom Token | Not implemented | ❌ Missing |

### Session Management

| Mechanism | Key | Data |
|---|---|---|
| `localStorage` | `nd_user` | Full user profile JSON (uid, ndid, role, codeId, etc.) |
| `localStorage` | `nd_accounts` | Array of up to 10 account profiles |
| `localStorage` | `nd_active_index` | Index of currently active account (0-9) |
| Firebase Auth | `onAuthStateChanged` | Firebase user object (uid, email, photoURL) |

### Logout

- Handled by `NDAccounts.removeAccount()` or `NDAccounts.removeAllAccounts()`
- Calls `signOut(auth)` from Firebase Auth
- Clears `nd_user`, `nd_accounts`, `nd_active_index` from localStorage
- Clears sessionStorage
- Redirects to `/auth/login/`

---

## 5. Existing Auth Files

| File | Purpose | Current Behavior | Risk | Reuse? |
|---|---|---|---|---|
| `auth/login/index.html` | Login page | Vanilla HTML/JS, fake email auth, OTP stub | HIGH — fake email, no lockout | ❌ Replace with React |
| `auth/register/index.html` | Registration page | Vanilla HTML/JS, client CodeID gen, plaintext pwd | CRITICAL — plaintext password | ❌ Replace with React |
| `auth/settings/index.html` | Settings page | Vanilla HTML/JS, profile edit, password change | MEDIUM — plaintext pwd display | ❌ Replace with React |
| `auth/auth.css` | Auth page styles | Custom CSS, modern design | LOW | ⚠️ Reference for React Tailwind |
| `auth/qa-test.html` | QA test page | Unknown purpose | LOW | ❌ Not relevant |
| `assets/js/firebase-init.js` | Firebase SDK init + auth listener | Initializes Firebase, syncs user to localStorage, auto-generates CodeID | HIGH — client-side CodeID gen | ⚠️ Needs major refactor |
| `assets/js/nd-accounts.js` | Multi-account manager | localStorage-based multi-account switching (up to 10) | MEDIUM — no server validation | ⚠️ Pattern reusable |
| `assets/js/config.js` | Config & key management | Loads Firebase config from placeholders/env.json/.env | LOW | ⚠️ Pattern reusable |
| `assets/js/nd-navbar.js` | Navigation bar | Renders user info + role badge from localStorage | MEDIUM — trusts localStorage role | ⚠️ Needs auth integration |
| `functions/index.js` | Cloud Functions | geminiProxy, lotusBotWebhook, lotusBotAdmin | MEDIUM — no auth functions | ⚠️ Add auth functions here |
| `src/miniworld/hooks/useFirebase.ts` | React Firebase hook | Reads localStorage + window.firebaseAuth | MEDIUM — trusts localStorage | ⚠️ Pattern for TimeTable |
| `database.rules.json` | Realtime DB rules | Rules for users, ndids, code_ids, config, gemini_key | HIGH — some rules too permissive | ⚠️ Needs tightening |

---

## 6. Existing User Schema

### Firestore Collection: `users/{uid}`

> **Note:** Document ID is Firebase Auth UID, NOT CodeID. This conflicts with the new spec which requires `users/{CodeID}`.

| Field | Type | Purpose | New Spec Status |
|---|---|---|---|
| `ndid` | string | Username/identifier | ✅ Keep |
| `codeId` | string | 8-digit business ID | ⚠️ Change to 4+ digit sequential |
| `fullname` | string | Display name | ✅ Keep (rename to `name`) |
| `dob` | string | Date of birth | ✅ Keep |
| `gender` | string | male/female/other | ✅ Keep (not in new spec but useful) |
| `nationality` | string | Country | ✅ Keep (not in new spec but useful) |
| `recoveryEmail` | string | Recovery email | ✅ Map to `email` |
| `googleEmail` | string | Linked Google email | ⚠️ Map to `googleLinked` |
| `registeredPassword` | string | **PLAINTEXT PASSWORD** | ❌ CRITICAL — must remove, use `passwordHash` |
| `photoURL` | string | Avatar URL | ✅ Keep (not in new spec but useful) |
| `role` | string | `member` / `admin` | ⚠️ Change to `user` / `admin` |
| `eduRole` | string | `student` / `teacher` / etc. | ✅ Keep (EduSpace-specific) |
| `subrole` | string | Sub-role | ✅ Keep |
| `grade` | string | Student grade | ✅ Keep (EduSpace-specific) |
| `yob` | number | Year of birth | ✅ Keep |
| `customGeminiKey` | string | User's Gemini API key | ✅ Keep |
| `createdAt` | timestamp | Creation time | ✅ Keep |
| `updatedAt` | timestamp | Last update | ✅ Keep |

### Missing Fields (Required by New Spec)

| Field | Type | Purpose |
|---|---|---|
| `email` | string | Login email (distinct from NDID) |
| `passwordHash` | string | Hashed password |
| `passwordVersion` | number | Password version counter |
| `adminLevel` | string | `owner` / `admin` / `null` |
| `status` | string | `active` / `disabled` / `banned` / `locked` / `pending` |
| `failedLoginAttempts` | number | Lockout counter |
| `lockedAt` | timestamp | Lock timestamp |
| `lockReason` | string | Reason for lock |
| `banExpiresAt` | timestamp | Ban expiry |
| `emailVerified` | boolean | Email verification status |
| `lastLoginAt` | timestamp | Last login |
| `lastPasswordChangedAt` | timestamp | Password change tracking |
| `lastLoginDeviceId` | string | Device tracking |

### Firestore Collection: `ndids/{ndid}`

| Field | Type | Purpose |
|---|---|---|
| `uid` | string | Firebase Auth UID |
| `createdAt` | timestamp | Creation time |

### Firestore Collection: `code_ids/{codeId}`

| Field | Type | Purpose |
|---|---|---|
| `uid` | string | Firebase Auth UID |
| `ndid` | string | Associated NDID |
| `createdAt` | timestamp | Creation time |

### Firestore Collection: `counters/code_ids`

| Field | Type | Purpose |
|---|---|---|
| `lastNumber` | number | Last assigned CodeID number (used in transaction) |

### Realtime Database: `users/{uid}`

Separate from Firestore. Rules exist in `database.rules.json` but usage in code references Firestore primarily.

---

## 7. Existing NDID Logic

### Current Behavior

1. **Registration**: User chooses NDID freely. Validated with regex `/^[a-zA-Z0-9_.]+$/` on the form.
2. **Storage**: NDID stored as-is in Firestore `users/{uid}.ndid` and as document ID in `ndids/{ndid}`.
3. **Login**: NDID converted to fake email `${ndid}@ndsite.web.app` for Firebase Auth `signInWithEmailAndPassword()`.
4. **Display**: NDID displayed from localStorage in navbar. No `@` prefix added (per project rules).
5. **Uniqueness**: Enforced by trying to create Firebase Auth user with `${ndid}@ndsite.web.app` — if exists, treated as duplicate.

### Conflicts with New Spec

| Current | New Spec | Conflict |
|---|---|---|
| User freely creates NDID | Admin creates/edits NDID | **Conflicting** |
| NDID → fake email for auth | NDID must NOT become fake email | **Conflicting** |
| NDID validated only on form | NDID can contain special chars from admin | **Compatible** (rules already say this) |
| No `@` prefix in display | No `@` prefix | **Compatible** |
| NDID is lowercase-optional | NDID should be lowercase | **Needs migration** |

---

## 8. Existing Firebase Auth

### Configuration

- **Project ID:** `ndlabs-0`
- **Auth Domain:** `ndlabs-0.firebaseapp.com` (also `ndsite.web.app`)
- **SDK Version:** 10.12.0 (Modular, loaded from CDN)
- **Auth Methods Used:**
  - `createUserWithEmailAndPassword` — registration
  - `signInWithEmailAndPassword` — login
  - `signInWithPopup` (GoogleAuthProvider) — Google login
  - `onAuthStateChanged` — session monitoring
  - `signOut` — logout
  - `sendPasswordResetEmail` — password reset
  - `updateProfile` — set displayName/photoURL

### Custom Token

- **NOT implemented.** The new spec requires `signInWithCustomToken()` via a backend that creates Firebase Custom Tokens.
- `firebase-admin` exists in `functions/` but is only used for Gemini proxy and Lotus Bot, not for auth.

### Admin SDK Usage

- **Server-side only** in `functions/index.js` — correctly not exposed to browser.
- Used for: reading Realtime Database config (`/config/geminiKey`), managing Lotus Bot settings.
- **NOT used for:** user management, custom token creation, role assignment.

---

## 9. Existing Firestore Rules

### Firestore Rules

**No `firestore.rules` file was found in the repository.** This means Firestore is likely using default rules set via Firebase Console (not version-controlled).

### Realtime Database Rules (`database.rules.json`)

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    
    "users": {
      "$uid": {
        ".read": "auth !== null && (auth.uid === $uid || auth.token.admin === true)",
        ".write": "auth !== null && (auth.uid === $uid || auth.token.admin === true)",
        "ndid": {
          ".write": "admin || (own user && !exists && matches regex)",
          ".validate": "string, 3-32 chars"
        },
        "role": {
          ".write": "admin only",
          ".validate": "member | admin | moderator"
        },
        "$other": { ".validate": false }
      }
    },
    
    "ndids": {
      "$ndid": {
        ".read": "authenticated",
        ".write": "admin || (new && own uid)"
      }
    },
    
    "code_ids": {
      "$codeId": {
        ".read": "authenticated",
        ".write": "admin || (new && own uid)"
      }
    },
    
    "config": {
      ".read": true,
      ".write": "admin only"
    },
    
    "gemini_key": {
      ".read": "admin only",
      ".write": "admin only"
    }
  }
}
```

### Issues Found

| Rule | Issue | Severity |
|---|---|---|
| `users/$uid` `.write` allows self-write | User can modify their own profile including sensitive fields (except `role`, `ndid` after creation) | **HIGH** |
| `users/$uid` no restriction on `registeredPassword` | User and any admin can read/write plaintext password | **CRITICAL** |
| `ndids/$ndid` `.read` is `auth !== null` | Any authenticated user can look up any NDID → UID mapping | **MEDIUM** |
| `code_ids/$codeId` `.read` is `auth !== null` | Any authenticated user can look up any CodeID → UID mapping | **MEDIUM** |
| `config` `.read` is `true` | Public readable (may contain non-sensitive config, but risky) | **LOW** |
| No Firestore rules file in repo | Firestore rules not version-controlled | **HIGH** |
| `role` validates `member|admin|moderator` | Missing `user` value from new spec; no `owner` concept | **Conflicting** |

---

## 10. Role / Admin Architecture

### Current Implementation

| Aspect | Current | New Spec |
|---|---|---|
| Roles | `member`, `admin`, `moderator`, `teacher`, `student` | `user`, `admin` |
| Admin levels | None | `owner`, `admin`, `null` |
| Role storage | Firestore `users/{uid}.role` | Firestore `users/{CodeID}.role` + `adminLevel` |
| Role check location | Client-side (localStorage) | Server-side (Firestore rules + backend) |
| Admin link in navbar | Shown if `role === 'admin'` from localStorage | Must be server-verified |
| Hard-coded admin | No hard-coded email/UID check found | ✅ Compatible |

### Admin Page Access

- `/admin/index.html` — admin dashboard
- `/admin/eduspace/index.html` — EduSpace admin
- `/admin/lotus_bot/index.html` — Lotus Bot admin
- Access control: reads `role` from `localStorage.nd_user` — **client-only, easily bypassed**.

---

## 11. Route Protection

### Current State

| Guard Type | Exists? | Implementation |
|---|---|---|
| `ProtectedRoute` | ❌ No | No route guard component |
| `AdminRoute` | ❌ No | No route guard component |
| `OwnerRoute` | ❌ No | No route guard component |
| Page-level auth check | ⚠️ Partial | `firebase-init.js` shows login link if not authenticated |
| Admin page check | ⚠️ Client-only | Reads `role` from localStorage |

### How Auth is Currently Enforced

1. `firebase-init.js` runs on every page via `<script type="module" src="/assets/js/firebase-init.js">`.
2. `onAuthStateChanged()` detects if user is logged in.
3. If logged in: reads Firestore user doc, saves to localStorage, renders navbar with role badge.
4. If not logged in: renders "Đăng nhập" / "NDID" links in navbar.
5. **No page redirect for unauthenticated users** on most pages — content is still visible.
6. Admin pages rely on client-side role check from localStorage.

---

## 12. Security Findings

### CRITICAL

| # | Finding | Location | Evidence | Why It Matters | Recommended Direction |
|---|---|---|---|---|---|
| C1 | **Plaintext password stored in Firestore** | `auth/register/index.html` L1066 | `registeredPassword: password` saved via `setDoc()` | Any admin or Firestore reader can see all user passwords. Data breach = mass compromise. | Store `passwordHash` server-side only. Never store plaintext. |
| C2 | **Plaintext password displayed on CardID** | `auth/register/index.html` L1129 | `document.getElementById('card-pwd').textContent = password` | Password shown in UI and downloadable card image. | Remove password from CardID display/download. |
| C3 | **Plaintext password readable from Firestore in OTP flow** | `auth/login/index.html` L518 | `const regPassword = currentTargetUser.registeredPassword` | OTP login reads plaintext password from Firestore to authenticate — bypasses all security. | Remove this flow entirely. |
| C4 | **Plaintext password copied to clipboard** | `auth/register/index.html` L1150 | `Mật khẩu: ${generatedCardInfo.password}` in clipboard copy | Password in clipboard can be accessed by other apps. | Do not include password in copy/download. |

### HIGH

| # | Finding | Location | Evidence | Why It Matters | Recommended Direction |
|---|---|---|---|---|---|
| H1 | **NDID converted to fake email** | `auth/login/index.html` L387-388, `auth/register/index.html` L1016 | `${cleanNdid}@ndsite.web.app` | Violates new spec. Creates coupling between NDID and email. | Use Custom Token auth instead. |
| H2 | **CodeID generated client-side with Math.random()** | `auth/register/index.html` L1041 | `Math.floor(10000000 + Math.random() * 90000000)` | Race conditions, not sequential, not cryptographically secure. | Generate server-side with atomic counter. |
| H3 | **Client-only role enforcement** | `assets/js/firebase-init.js` L84-88, `src/miniworld/hooks/useFirebase.ts` L25 | `if (rawRole === 'admin') role = 'admin'` from localStorage | Users can modify localStorage to gain admin access on the client. | Enforce via Firestore Security Rules + backend. |
| H4 | **OTP generated client-side, never sent** | `auth/login/index.html` L493 | `Math.floor(10000000 + Math.random() * 90000000)` | Fake OTP — provides false sense of security. Anyone with DevTools can see OTP. | Implement real OTP via backend email service. |
| H5 | **Firestore rules not version-controlled** | Repository root | No `firestore.rules` file found | Rules may be overly permissive in console; no audit trail. | Add `firestore.rules` to repo. |
| H6 | **No lockout mechanism** | Entire codebase | No `failedLoginAttempts` tracking found | Brute force attacks possible. | Implement server-side lockout after 5 failures. |
| H7 | **User can write own Firestore doc** | `database.rules.json` L12 | `auth.uid === $uid` allows self-write | User can modify non-protected fields. `registeredPassword` is writable. | Restrict writable fields server-side. |

### MEDIUM

| # | Finding | Location | Evidence | Why It Matters | Recommended Direction |
|---|---|---|---|---|---|
| M1 | **Firebase config in env.json (gitignored)** | `env.json` | Contains API keys, project config | Acceptable for client SDK config, but Gemini/ImgBB keys should be server-only. | Move sensitive keys to Cloud Functions environment. |
| M2 | **Any authenticated user can read NDID→UID mapping** | `database.rules.json` L43 | `".read": "auth !== null"` on `ndids/$ndid` | User enumeration possible. | Restrict to admin or self-lookup. |
| M3 | **Session data in localStorage only** | `assets/js/nd-accounts.js` | Full profile including role stored in `nd_user` | Tamperable, no server session validation. | Validate session against Firestore on sensitive operations. |
| M4 | **Password visible in Settings page** | `auth/settings/index.html` L609 | "Xem mật khẩu" button reveals password | Password should never be retrievable/displayed. | Remove password reveal functionality. |
| M5 | **Admin password in Realtime DB** | `functions/index.js` L256 | `adminPassword` stored in `/config/adminPassword` with fallback `"123456"` | Lotus Bot admin uses a simple shared password. | Use Firebase Auth + custom claims for admin. |
| M6 | **config node publicly readable** | `database.rules.json` L69 | `".read": true` | Any visitor can read `/config` data. | Restrict to authenticated or admin. |

### LOW

| # | Finding | Location | Evidence | Why It Matters | Recommended Direction |
|---|---|---|---|---|---|
| L1 | **No CSRF protection** | Auth pages | No CSRF tokens in forms | Forms submit without CSRF validation. | Add CSRF tokens when implementing backend auth. |
| L2 | **Multiple email domains** | `auth/login/index.html` L387-388 | `@ndsite.web.app` and `@ndsite.id` | Legacy compatibility but adds complexity. | Consolidate to single domain in new system. |
| L3 | **set_gemini_key.js references service-account.json** | `set_gemini_key.js` L11 | `require('./service-account.json')` | File is gitignored but script remains. | Remove script from repo or add to gitignore. |

---

## 13. Existing Documentation / Rules

| Source | Rule/Content | Status | Action Later |
|---|---|---|---|
| **AGENT.md** | Version format `ver:X.M.D.HHMM` | **Compatible** | Keep |
| **AGENT.md** | NDID Regex `/^[a-zA-Z0-9_.]+$/` on forms only | **Compatible** | Keep for user-facing forms |
| **AGENT.md** | NDID raw string from DB — no sanitize | **Compatible** | Keep |
| **AGENT.md** | No `@` prefix on NDID display | **Compatible** | Keep |
| **AGENT.md** | UI text rules (no AI buzzwords) | **Compatible** | Keep |
| **.cursorrules** | Same as AGENT.md (duplicate) | **Duplicate** | Keep both (different tools read different files) |
| **.agents/AGENTS.md** | Same as AGENT.md (duplicate) | **Duplicate** | Keep |
| **coding-standards.md** | "TUYỆT ĐỐI KHÔNG sử dụng tên miền giả `@ndid.local`" | **Conflicting** | New spec says NO fake email at all. Rule says use `@ndsite.web.app`. |
| **coding-standards.md** | "Đuôi email nội bộ bắt buộc phải là `@ndsite.web.app`" | **Conflicting** | New spec requires Custom Token, not fake email. |
| **coding-standards.md** | "Hỗ trợ fallback cho tài khoản cũ `@ndlabs.com`" | **Obsolete** | Will be replaced by Custom Token auth. |
| **coding-standards.md** | Backward compatibility principle | **Compatible** | Important for migration strategy. |
| **coding-standards.md** | Subject naming conventions | **Compatible** | Not auth-related |
| **coding-standards.md** | Exam routing system | **Compatible** | Not auth-related |
| **coding-standards.md** | Version control format | **Duplicate** | Same as AGENT.md |
| **database.rules.json** | NDID regex validation on write | **Compatible** | Keep for user self-registration |
| **database.rules.json** | Role validation: `member|admin|moderator` | **Conflicting** | New spec uses `user|admin` |
| **database.rules.json** | Role write restricted to admin | **Compatible** | Keep and extend |
| **README.md** | Minimal (1 line) | **Unknown** | Not relevant |
| **eduspace/README.md** | EduSpace description | **Compatible** | Not auth-related |

---

## 14. Migration Risks

| Area | Risk Level | Details |
|---|---|---|
| **Existing Firebase Auth users** | **Needs Migration** | All users have `${ndid}@ndsite.web.app` emails in Firebase Auth. Switching to Custom Token requires either keeping old auth entries or migrating all users. |
| **Existing Firestore `users/{uid}` docs** | **Needs Migration** | Document IDs are Firebase UIDs. New spec requires `users/{CodeID}`. All existing docs need re-keying. |
| **Existing Firestore `ndids` collection** | **Needs Migration** | Currently maps NDID → UID. New system needs NDID → CodeID. |
| **Existing Firestore `code_ids` collection** | **Needs Migration** | Current CodeIDs are 8-digit random. New spec starts from `0000` sequential. Existing codes need mapping. |
| **Existing `registeredPassword` field** | **Potentially Destructive** | Must hash all existing passwords. Cannot recover if plaintext is removed first (but passwords are in Firebase Auth too). |
| **localStorage session format** | **Needs Migration** | `nd_user` schema will change. Multi-account system needs to be updated. |
| **EduSpace pages using `nd_user`** | **Needs Migration** | ~30+ HTML files read `localStorage.nd_user` for auth state. Field names may change. |
| **MiniWorld React components** | **Needs Migration** | `useFirebase.ts` reads from `localStorage` and `window.firebaseAuth`. |
| **Admin pages** | **Needs Migration** | Read `role` from localStorage. Need proper guard + server validation. |
| **Chat system** | **Needs Migration** | Uses auth state for user identification. |
| **Cloud Functions** | **Safe** | Current functions don't handle auth. New auth functions are additive. |
| **Firebase Hosting config** | **Safe** | `firebase.json` hosting config is unchanged. |
| **Firebase Realtime Database** | **Safe** | Config/gemini data unaffected. User rules will need updates. |
| **Environment variables** | **Safe** | `.env`, `env.json` patterns are unchanged. |
| **GitHub Actions deployment** | **Safe** | Placeholder injection system is unaffected. |
| **Google Sign-In users** | **Needs Migration** | Google-linked accounts need to work with new Custom Token flow. |

---

## 15. Recommended Refactor Boundaries

### MUST Change (for New Auth System)

1. **Create new React auth pages** in `eduspace/timetable/` (or wherever TimeTable lives) — login, register, settings.
2. **Create Cloud Functions** for auth backend: login verification, Custom Token generation, CodeID generation, lockout.
3. **Add `firestore.rules`** to repository with proper security rules.
4. **Migrate `users` collection** from `{uid}` to `{CodeID}` document IDs.
5. **Remove plaintext password** from Firestore. Hash server-side only.
6. **Add `adminLevel`** field and Owner/Admin distinction.
7. **Add account status** system (active/disabled/banned/locked/pending).
8. **Add lockout** mechanism (server-side).
9. **Create ProtectedRoute / AdminRoute / OwnerRoute** React components.

### SHOULD Change (for Security)

1. **Remove fake email pattern** — stop converting NDID to `@ndsite.web.app`.
2. **Remove OTP stub** — implement real OTP or remove.
3. **Remove password from CardID** display/download.
4. **Add Firestore Security Rules** that prevent client from writing sensitive fields.
5. **Restrict `ndids` collection** read access.
6. **Move `coding-standards.md` rule §9** to match new auth spec.

### MAY Keep (Compatible)

1. **`NDAccounts` multi-account system** — pattern is reusable, needs updated schema.
2. **`config.js` key management** — works well, keep pattern.
3. **`auth.css` design language** — reference for Tailwind migration.
4. **`firebase-init.js` pattern** — onAuthStateChanged + sync, but needs Custom Token support.
5. **Cloud Functions structure** — add auth functions alongside existing ones.

---

## 16. Files That Should NOT Be Modified

These files are unrelated to auth and should remain untouched during the auth rebuild:

| File/Directory | Reason |
|---|---|
| `eduspace/*/data.js` | Quiz data files — no auth dependency |
| `eduspace/template.html` | Quiz UI template — reads from localStorage but should be updated separately |
| `eduspace/index.html` | EduSpace main page — minimal auth coupling |
| `assets/js/edu_ai.js` | AI features — no auth dependency |
| `assets/js/api-service.js` | API service — no auth dependency |
| `assets/js/banner_eduspace.js` | UI banner — no auth dependency |
| `assets/js/data_modal.js` | Data modal — no auth dependency |
| `functions/index.js` (existing functions) | Gemini proxy, Lotus Bot — keep existing, add new functions |
| `chat/` | Chat system — update auth integration separately |
| `coffee/` | Coffee page — no auth dependency |
| `games/` | Games section — no auth dependency |
| `morse/` | Morse code tool — no auth dependency |
| `privacy/` | Privacy policy — no auth dependency |
| `media/` | Media assets — no auth dependency |
| `font/` | Font files — no auth dependency |
| `screenshot.png` | Screenshot — no auth dependency |

---

## 17. Questions / Unknowns

> These are genuine unknowns discovered during audit. No assumptions are made.

1. **What are the current Firestore Security Rules?** No `firestore.rules` file exists in the repository. The actual rules in Firebase Console are unknown.

2. **How many existing users are in the database?** The impact of migration depends on user count. Unknown from code audit alone.

3. **Is `@ndsite.id` domain actually configured?** Login code tries `${ndid}@ndsite.id` as a fallback, but it's unclear if this domain is set up in Firebase Auth.

4. **Are there users with `@ndlabs.com` email suffix?** `coding-standards.md` mentions backward compatibility for `@ndlabs.com`, suggesting older accounts may exist.

5. **Does the TimeTable project have any existing design specs or wireframes?** No TimeTable files or documentation were found in the repository.

6. **What backend hosting will be used for the auth server?** The new spec requires a trusted backend for Custom Token generation. Will this be Cloud Functions, Cloud Run, or external?

7. **Is there a Firestore `firestore.indexes.json`?** No index configuration file was found.

8. **Who is the designated Owner?** The new spec requires an Owner role. How will the first Owner be bootstrapped?

9. **What email service will be used for OTP delivery?** The current OTP is client-side fake. Real OTP requires an email sending service.

10. **Will existing users be migrated or will they need to re-register?** This determines the complexity of the auth migration.

11. **What is the `auth/qa-test.html` page?** Its purpose is unclear from the code audit.

12. **Are there any active Firestore triggers or scheduled functions?** Only HTTP functions were found in `functions/index.js`, but there may be others configured in Firebase Console.

---

> **CONFIRMATION: NO SOURCE CODE WAS MODIFIED DURING THIS AUDIT.**
