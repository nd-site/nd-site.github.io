# TIMETABLE AUTH BINDING AUDIT
## Comprehensive Assessment & Canonical Binding Target (Phase 01-C0)

> **Authority:** Technical Audit & Security Review of Existing TimeTable Module.  
> **Status:** AUDIT COMPLETE — SPECIFICATION ONLY.  
> **Rule:** TimeTable is currently working stably. **DO NOT MODIFY, DELETE, REWRITE, OR MIGRATE CURRENT TIMETABLE DATA IN THIS PHASE.**  
> **Last Updated:** 2026-09-05  
> **Auditor:** Senior Software Architect + Database Architect + Security Architect

---

### Architectural Principle (Mandatory Rule)

**English:**
> *"Every internal relationship to a user MUST reference the immutable CodeID. User-facing attributes such as NDID, email, name, avatar, or profile data MUST be resolved from the canonical user record using CodeID and MUST NOT be used as the canonical relationship key."*

**Tiếng Việt:**
> *"Mọi quan hệ nội bộ tới tài khoản người dùng bắt buộc phải tham chiếu bằng CodeID bất biến. Các thông tin người dùng có thể thay đổi như NDID, email, tên, avatar hoặc dữ liệu hồ sơ phải được trích xuất từ user record canonical thông qua CodeID và không được sử dụng làm khóa liên kết canonical."*

---

## 1. Executive Summary

The **TimeTable** module has already been built and is currently active and functioning stably in production. It was built using modern technologies (**React 19 + TypeScript + Tailwind CSS v4 + Vite**) and connects directly to **Firebase Firestore** for real-time schedule persistence, collaborative presence, and commenting.

However, an in-depth audit reveals that the existing TimeTable implementation relies on a **mixture of Firebase Auth random UIDs, raw NDID handles, and localStorage session objects** for its access control and user bindings. 

This document provides a thorough audit of the current TimeTable architecture, pinpoints all user identifier dependencies, defines the canonical target binding (`ownerCodeID`), and outlines the future migration plan.

> [!IMPORTANT]
> **NO MIGRATION PERFORMED IN PHASE 01-C0.**  
> Current timetable documents, test data, owner references, and URL contracts are preserved 100% without modification.

---

## 2. Current TimeTable Architecture & Directory Layout

### 2.1 File System Structure
```
d:\Project\WebSite\ND Labs\
├── src/
│   └── timetable/
│       ├── main.tsx                # React entrypoint mounting <TimetableApp />
│       ├── TimetableApp.tsx        # Monolithic main application component (3,416 lines)
│       ├── AITimetableModal.tsx    # Modal UI for OCR & AI timetable import
│       ├── aiTimetableService.ts   # Client-side AI prompt & extraction service
│       └── index.css               # Tailwind CSS imports
├── eduspace/
│   └── timetable/
│       └── index.html              # Public hosting wrapper serving bundle.js
├── admin/
│   └── eduspace/
│       └── timetable/
│           └── index.html          # Admin portal wrapper serving bundle.js
├── assets/
│   └── timetable-dist/
│       ├── bundle.js               # Compiled JavaScript bundle (Rollup output)
│       └── style.css               # Compiled Tailwind CSS styles
├── vite.timetable.config.ts        # Vite build configuration (outputs to assets/timetable-dist)
└── firebase.json                   # Hosting rewrite rules routing to /eduspace/timetable/index.html
```

### 2.2 Hosting & Routing Configuration (`firebase.json`)
```json
"rewrites": [
  {
    "source": "/eduspace/timetable/**",
    "destination": "/eduspace/timetable/index.html"
  },
  {
    "source": "/eduspace/timtable/**",
    "destination": "/eduspace/timetable/index.html"
  },
  {
    "source": "/admin/eduspace/timetable/**",
    "destination": "/eduspace/timetable/index.html"
  }
]
```

---

## 3. Current Firebase & Firestore Usage

The TimeTable application interacts directly with Firebase via dynamic CDN imports of the Firebase v10.12.0 Modular SDK (`window.firebaseFirestore` and `window.firebaseAuth` initialized by `/assets/js/firebase-init.js`).

### 3.1 Collections & Documents Queried

| Path / Collection | Operation | Query / Method | Current Usage in Code |
|---|---|---|---|
| `timetables/{timetableId}` | Realtime Listen | `onSnapshot(collection(db, 'timetables'))` | Loads entire public list of timetables into local state and localStorage cache |
| `timetables/{activeId}` | Document Sync | `onSnapshot(doc(db, 'timetables', activeId))` | Listens to active schedule changes |
| `timetables/{activeId}` | Create / Update | `setDoc(doc(db, 'timetables', id), data, { merge: true })` | Saves schedule grid, days, and ownership |
| `timetables/{activeId}` | Delete | `deleteDoc(doc(db, 'timetables', id))` | Deletes schedule |
| `timetables/{activeId}/comments` | Subcollection Listen | `onSnapshot(query(colRef, orderBy('createdAt', 'asc')))` | Realtime comments stream |
| `timetables/{activeId}/comments` | Post Comment | `addDoc(colRef, commentData)` | Adds new comment |
| `timetables/{activeId}/presence` | Presence Tracker | `setDoc(presenceRef, data)` / `deleteDoc` | Realtime multiplayer heartbeat (every 5s) |
| `users` | Lookup Collaborator | `query(collection(db, 'users'), where('ndid', '==', rawInput), limit(1))` | Looks up user profile by NDID to add collaborator |

---

## 4. Current User Identifiers & Ownership Binding

### 4.1 How TimeTable Discovers the Current User
In `src/timetable/TimetableApp.tsx` (lines 128-198), the function `getLocalUser()` extracts user identity from `localStorage` in priority order:
1. `window.NDAccounts.getActiveAccount()`
2. `localStorage.getItem('nd_accounts')`
3. `localStorage.getItem('nd_user')`

This produces a `CurrentUser` object:
```typescript
export interface CurrentUser {
  uid: string;         // Legacy Firebase random UID
  ndid: string;        // NDID handle (e.g. "admin", "student01")
  displayName: string; // Full name
  photoURL: string;    // Avatar URL
  role?: string;       // "admin" | "member"
  eduRole?: string;    // "student" | "teacher"
}
```

### 4.2 Current Ownership Representation in `TimetableData`
In `src/timetable/TimetableApp.tsx` (lines 78-86), ownership and access control are defined as:
```typescript
export interface TimetableData {
  id: string;             // Custom timetable ID (e.g. "12a1", "my-schedule")
  title: string;
  // ... schedule fields ...

  // CURRENT OWNERSHIP BINDINGS:
  ownerUid?: string;      // Legacy Firebase Auth UID (unstable across migrations)
  ownerNdid?: string;     // NDID handle (MUTABLE attribute!)
  ownerName?: string;     // Denormalized name snapshot
  ownerPhotoURL?: string; // Denormalized photo snapshot
  isPublic?: boolean;     // Public visibility flag
  collaborators?: Collaborator[]; // Array of collaborator objects
  sharedNdids?: string[]; // Array of shared NDID strings
}
```

### 4.3 Current Collaborator & Comment Structures
```typescript
export interface Collaborator {
  ndid: string;           // Bound to mutable NDID
  uid?: string;           // Optional legacy UID
  name?: string;
  photoURL?: string;
  role: 'view' | 'comment' | 'edit';
  addedAt?: string;
}

export interface TimetableComment {
  id: string;
  uid: string;            // Legacy UID
  ndid: string;           // Mutable NDID
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: any;
}
```

### 4.4 Current Access Control Logic (`getEffectiveRole`)
Lines 242-280 in `TimetableApp.tsx`:
```typescript
const getEffectiveRole = (tt: TimetableData | null, user: CurrentUser | null): TimetableRole => {
  if (!tt) return 'none';
  if (!tt.ownerUid && !tt.ownerNdid && user) return 'owner';

  // Matches either UID OR NDID
  const isOwner = Boolean(
    user && (
      (tt.ownerUid && user.uid && tt.ownerUid === user.uid) ||
      (tt.ownerNdid && user.ndid && (
        tt.ownerNdid.toLowerCase() === user.ndid.toLowerCase() ||
        normalizeNdid(tt.ownerNdid) === normalizeNdid(user.ndid)
      ))
    )
  );
  if (isOwner) return 'owner';

  // Matches collaborator by UID or NDID
  if (user && tt.collaborators && tt.collaborators.length > 0) {
    const matched = tt.collaborators.find((c) => {
      if (c.uid && user.uid && c.uid === user.uid) return true;
      if (c.ndid && user.ndid && (
        c.ndid.toLowerCase() === user.ndid.toLowerCase() ||
        normalizeNdid(c.ndid) === normalizeNdid(user.ndid)
      )) return true;
      return false;
    });
    if (matched) return matched.role;
  }

  if (tt.isPublic === true) return 'view';
  return 'none';
};
```

---

## 5. Architectural & Security Vulnerabilities Identified

1. **Mutable NDID used as Foreign Key:**  
   If a user changes their NDID from `"student_a"` to `"student_b"`, their ownership check (`tt.ownerNdid === user.ndid`) and collaborator access immediately break unless all timetable records in the database are rewritten.
2. **Denormalized User Attributes:**  
   `ownerName`, `ownerPhotoURL`, `authorName`, and `authorPhoto` are duplicated into every timetable and comment record. If the user updates their avatar or name, historical timetables and comments display stale data.
3. **Firestore Security Rules Deficit:**  
   Currently, `firestore.rules` specifies:
   ```javascript
   match /timetables/{timetableId} {
     allow read, write: if true;
     match /comments/{commentId} { allow read, write: if true; }
     match /presence/{presenceId} { allow read, write: if true; }
   }
   ```
   **CRITICAL:** Any unauthenticated client can overwrite, modify, or delete any timetable in the database. Client-side role checks in `getEffectiveRole()` are strictly cosmetic.
4. **Client-Side Collaborator Lookup:**  
   Adding a collaborator executes a direct client-side query against `users` collection: `query(collection(db, 'users'), where('ndid', '==', rawInput))`. Under canonical anti-enumeration rules, this query must not be exposed to arbitrary clients.

---

## 6. Target Canonical Binding: `ownerCodeID`

### 6.1 Canonical Timetable Document Contract
```typescript
export interface CanonicalTimetableData {
  id: string;                       // Timetable Custom ID
  title: string;
  
  // ─── CANONICAL OWNERSHIP ──────────────────────────
  ownerCodeID: string;              // IMMUTABLE CodeID of owner (e.g. "0000")
  isPublic: boolean;                // Public read permission toggle
  
  // ─── CANONICAL COLLABORATION ──────────────────────
  collaborators: {
    memberCodeID: string;           // Canonical user reference
    role: 'view' | 'comment' | 'edit';
    addedAt: string;
  }[];
  sharedCodeIDs: string[];          // Array of CodeIDs for Firestore array-contains querying

  // ─── SCHEDULE DATA ────────────────────────────────
  grid: Record<string, SlotItem>;
  dayData: Record<number, DayColumnData>;
  breakTimes: BreakTime[];
  slotTimes: Record<string, { startTime: string; endTime: string }>;
  school: string;
  gradeClass: string;
  schoolYear: string;
  startWeek: number | string;
  endWeek: number | string;
  startDate: string;
  endDate: string;
  morningSlotsCount: number;
  afternoonSlotsCount: number;

  createdAt: any;
  updatedAt: any;
}
```

### 6.2 Canonical Comments Contract
```typescript
export interface CanonicalTimetableComment {
  id: string;
  authorCodeID: string;             // Canonical CodeID (e.g. "0000")
  content: string;
  createdAt: any;
}
```
*Note:* `authorName` and `authorPhoto` are **NOT** stored in the comment record. The frontend resolves `users/{authorCodeID}` to obtain the fresh name and avatar.

### 6.3 Canonical Presence Contract
```typescript
export interface CanonicalPresenceUser {
  sessionId: string;
  userCodeID: string;               // Canonical CodeID
  role: string;
  lastActive: number;
}
```

---

## 7. URL Contract Specification

The project specification mandates the following URL contracts for TimeTable:

| Route | Purpose | Parameter Definition |
|---|---|---|
| `/timetable/{CodeID}` | User Timetable Dashboard / Primary Timetable | `{CodeID}` = Immutable Account Business ID (e.g. `/timetable/0000`) |
| `/timetable/{CodeID}/{timetableId}` | Specific Timetable View & Edit | `{CodeID}` = Owner CodeID, `{timetableId}` = Unique ID within user scope |
| `/eduspace/timetable/` | Legacy / General Browser Route | Supported via rewrite rule |
| `/eduspace/timetable/{timetableId}` | Existing Route | Preserved for backward compatibility |

**Rule on URL Immutability:**  
Because `CodeID` is permanent, the URL `/timetable/0000/12a1` will never break, even if the owner renames their handle, changes their email, or updates their profile.

---

## 8. Migration Plan (Scheduled for Future Phase)

When the project reaches the implementation & migration phase, the following migration procedure will be executed:

```
[Legacy Timetable Document]
  ├── ownerUid: "xyz123random"
  ├── ownerNdid: "johndoe"
  ├── collaborators: [{ ndid: "alice", role: "edit" }]
               │
               ▼ (Migration Script via Admin SDK)
  1. Lookup CodeID for "johndoe" / "xyz123random" -> returns "0042"
  2. Lookup CodeID for "alice" -> returns "0088"
               │
               ▼
[Canonical Timetable Document]
  ├── ownerCodeID: "0042"
  ├── collaborators: [{ memberCodeID: "0088", role: "edit" }]
  ├── sharedCodeIDs: ["0088"]
  └── (legacy ownerUid & ownerNdid retained as fallback during transitional period)
```

---

## 9. Safety & Preservation Checklist

| Aspect | Status | Rule Enforced |
|---|---|---|
| **Current Code & Components** | Preserved | `src/timetable/*` untouched |
| **Existing Timetable Documents** | Preserved | Zero database writes or schema resets executed |
| **Test Data & Seed Data** | Preserved | No test data deleted or altered |
| **Firestore Security Rules** | Preserved | Existing live rules untouched; target rules documented |
| **Current URLs** | Preserved | All routing paths remain operational |
| **Migration Execution** | Prohibited | **NO MIGRATION PERFORMED IN THIS PHASE** |

---

## 10. Audit Sign-Off Confirmation

> **EXPLICIT CONFIRMATION:**  
> In strict compliance with Prompt 01-C0, **NO MIGRATION, NO CODE IMPLEMENTATION, AND NO DATABASE RESETS WERE PERFORMED DURING THIS PHASE**.  
> The existing TimeTable data, components, and user relationships have been thoroughly audited and documented for seamless canonical migration in subsequent phases.
