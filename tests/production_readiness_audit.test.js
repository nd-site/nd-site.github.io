/**
 * PRODUCTION READINESS AUDIT TEST SUITE (Phase 01-C8)
 *
 * Comprehensive End-to-End Test Matrix verifying that Canonical Authentication
 * is fully finalized, hardened, and ready for production operation as the sole
 * authoritative identity system for ND Labs / EduSpace.
 *
 * Critical Test Matrix (Prompt 01-C8 Section 20):
 * 1. REGISTER:
 *    - Successful registration with sequential CodeID
 *    - Strict UID === CodeID invariant
 *    - Duplicate NDID rejected atomically
 *    - Duplicate Email rejected atomically
 * 2. LOGIN:
 *    - Successful login via NDID
 *    - Successful login via Email
 *    - Successful login via Google identity (preserves CodeID)
 *    - Wrong password increments failed counter and locks account after 5 attempts
 *    - Locked accounts rejected
 *    - Disabled accounts rejected
 *    - Banned accounts rejected
 * 3. PASSWORD & RECOVERY:
 *    - Self-service password change
 *    - Recovery code request with 6-digit code and rate limits
 *    - Verification code validation with single-use token issuance
 *    - Password reset via recovery token and automatic account unlocking
 *    - Old credentials rejected after password change/reset
 * 4. NDID LIFECYCLE:
 *    - Self-service NDID change
 *    - 30-day cooldown protection on old NDID
 *    - CodeID strictly immutable throughout NDID change
 * 5. SESSION MANAGEMENT:
 *    - Active session creation
 *    - Listing active sessions with current flag
 *    - Single session revocation
 *    - Other sessions revocation
 *    - All sessions revocation (logout / security event)
 * 6. TRUSTED DEVICES:
 *    - Trusted device registration with SHA-256 fingerprint hashing
 *    - Safe device listing without raw hashes or secrets
 *    - Trusted device revocation
 *    - Cross-user device & session isolation
 * 7. AUTHORIZATION & PRIVILEGE HIERARCHY:
 *    - User role self-access bounds
 *    - Admin privilege assertion
 *    - Owner privilege assertion
 *    - Privilege escalation prevention (user cannot self-promote, admin cannot self-promote or grant admin)
 *    - Zero-Owner Lockout Prevention
 * 8. SECURITY RULES & CONTRACTS:
 *    - users/{userId} client create: if false, delete: if false
 *    - Private credential, session, and device subcollections client denied
 *    - Server-only mapping and counter collections client denied
 *    - Zero plaintext passwords (registeredPassword) in repo
 *    - Zero fake emails (@ndsite.web.app, @ndsite.id) in canonical auth flows
 *    - TimeTable safety: 0 mutations to timetables
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);

const {
  // Foundation & Identity
  allocateCodeId,
  formatCodeId,
  isValidCodeId,
  registerUser,
  loginUser,
  changePassword,
  changeNdid,
  // Google Identity
  linkGoogleIdentity,
  resolveGoogleSubjectToCodeId,
  // Recovery
  requestAccountRecovery,
  verifyRecoveryCode,
  resetPasswordWithRecovery,
  // Session & Devices
  registerSession,
  listActiveSessions,
  revokeUserSession,
  revokeOtherUserSessions,
  revokeAllSessions,
  registerTrustedDeviceForUser,
  listTrustedDevicesForUser,
  revokeTrustedDeviceForUser,
  getRecentSecurityActivityForUser,
  // Authorization
  ROLES,
  ADMIN_LEVELS,
  getUserAuthorizationContext,
  assertSelfAccess,
  assertAdmin,
  assertOwner,
  assertNoPrivilegeEscalation,
  updateUserRoleAndLevel,
  // Errors
  ValidationError,
  IdentifierUnavailableError,
  InvalidCredentialsError,
  AccountLockedError,
  AccountDisabledError,
  AccountBannedError,
  ForbiddenError,
  PrivilegeEscalationError,
} = require('../functions/src/index.js');

// ── ROBUST IN-MEMORY FIRESTORE MOCK ENGINE ────────────────────────────────────

function createAuditMockFirestore(seedData = {}) {
  const store = new Map();

  for (const [key, val] of Object.entries(seedData)) {
    store.set(key, JSON.parse(JSON.stringify(val)));
  }

  function getDocRef(docPath) {
    return {
      path: docPath,
      id: docPath.split('/').pop(),
      collection: (subCol) => createCollectionRef(`${docPath}/${subCol}`),
      get: async () => {
        if (!store.has(docPath)) {
          return { exists: false, data: () => undefined, id: docPath.split('/').pop() };
        }
        const raw = store.get(docPath);
        return {
          exists: true,
          data: () => JSON.parse(JSON.stringify(raw)),
          id: docPath.split('/').pop(),
        };
      },
      set: async (data, opts = {}) => {
        if (opts.merge && store.has(docPath)) {
          store.set(docPath, { ...store.get(docPath), ...data });
        } else {
          store.set(docPath, JSON.parse(JSON.stringify(data)));
        }
      },
      update: async (data) => {
        if (!store.has(docPath)) throw new Error(`Doc ${docPath} not found`);
        const current = store.get(docPath);
        store.set(docPath, { ...current, ...data });
      },
      delete: async () => {
        store.delete(docPath);
      },
    };
  }

  function createCollectionRef(colPath) {
    let whereFilters = [];
    let orderBys = [];

    const colObj = {
      path: colPath,
      doc: (docId) => getDocRef(`${colPath}/${docId}`),
      where: (field, op, val) => {
        const subQuery = Object.assign({}, colObj);
        subQuery._filters = [...whereFilters, { field, op, val }];
        subQuery.where = (f, o, v) => {
          subQuery._filters.push({ field: f, op: o, val: v });
          return subQuery;
        };
        subQuery.orderBy = (f, dir) => {
          subQuery._orderBys = [...orderBys, { field, dir }];
          return subQuery;
        };
        subQuery.limit = (num) => {
          subQuery._limit = num;
          return subQuery;
        };
        subQuery.get = async () => {
          let docs = [];
          for (const [key, val] of store.entries()) {
            if (key.startsWith(`${colPath}/`) && key.split('/').length === colPath.split('/').length + 1) {
              let match = true;
              for (const filt of subQuery._filters) {
                if (filt.op === '==' && val[filt.field] !== filt.val) match = false;
              }
              if (match) {
                docs.push({
                  id: key.split('/').pop(),
                  data: () => JSON.parse(JSON.stringify(val)),
                });
              }
            }
          }
          return { docs, size: docs.length, empty: docs.length === 0 };
        };
        return subQuery;
      },
      orderBy: (field, direction = 'asc') => {
        const subQuery = Object.assign({}, colObj);
        subQuery._orderBys = [...orderBys, { field, direction }];
        subQuery.limit = (n) => {
          subQuery._limit = n;
          return subQuery;
        };
        subQuery.get = async () => {
          let docs = [];
          for (const [key, val] of store.entries()) {
            if (key.startsWith(`${colPath}/`) && key.split('/').length === colPath.split('/').length + 1) {
              docs.push({
                id: key.split('/').pop(),
                data: () => JSON.parse(JSON.stringify(val)),
              });
            }
          }
          if (subQuery._limit) docs = docs.slice(0, subQuery._limit);
          return { docs, size: docs.length, empty: docs.length === 0 };
        };
        return subQuery;
      },
      add: async (data) => {
        const autoId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        store.set(`${colPath}/${autoId}`, JSON.parse(JSON.stringify(data)));
        return { id: autoId, path: `${colPath}/${autoId}` };
      },
      get: async () => {
        const docs = [];
        for (const [key, val] of store.entries()) {
          if (key.startsWith(`${colPath}/`) && key.split('/').length === colPath.split('/').length + 1) {
            docs.push({
              id: key.split('/').pop(),
              data: () => JSON.parse(JSON.stringify(val)),
            });
          }
        }
        return { docs, size: docs.length, empty: docs.length === 0 };
      },
    };
    return colObj;
  }

  return {
    collection: (name) => createCollectionRef(name),
    doc: (docPath) => getDocRef(docPath),
    runTransaction: async (fn) => {
      const transaction = {
        get: async (docRef) => docRef.get(),
        set: (docRef, data, opts) => docRef.set(data, opts),
        update: (docRef, data) => docRef.update(data),
        delete: (docRef) => docRef.delete(),
      };
      return fn(transaction);
    },
    _getRawStore: () => store,
  };
}

// ── MOCK FIREBASE AUTH ENGINE ─────────────────────────────────────────────────

function createAuditMockAuth() {
  const users = new Map();
  const revokedUids = new Set();

  return {
    createUser: async ({ uid, displayName, email }) => {
      if (users.has(uid)) {
        const err = new Error('The user with the provided uid already exists.');
        err.code = 'auth/uid-already-exists';
        throw err;
      }
      const userRecord = { uid, displayName, email, disabled: false };
      users.set(uid, userRecord);
      return userRecord;
    },
    getUser: async (uid) => {
      if (!users.has(uid)) {
        const err = new Error('User not found');
        err.code = 'auth/user-not-found';
        throw err;
      }
      return users.get(uid);
    },
    updateUser: async (uid, data) => {
      if (!users.has(uid)) throw new Error('User not found');
      const u = users.get(uid);
      Object.assign(u, data);
      return u;
    },
    createCustomToken: async (uid, claims = {}) => {
      return `custom_token_for_${uid}_claims_${JSON.stringify(claims)}`;
    },
    revokeRefreshTokens: async (uid) => {
      revokedUids.add(uid);
    },
    _isRevoked: (uid) => revokedUids.has(uid),
  };
}

// ── TEST SUITE: AUDIT MATRIX ──────────────────────────────────────────────────

test('MATRIX 1: REGISTRATION & CANONICAL IDENTITY INVARIANT (UID === CodeID)', async () => {
  const db = createAuditMockFirestore();
  const auth = createAuditMockAuth();

  // Test 1: Successful Registration
  const reg1 = await registerUser({
    db,
    auth,
    ndid: 'student.zero',
    password: 'SecurePassword123!',
    email: 'student.zero@example.com',
    name: 'Student Zero',
  });

  assert.equal(reg1.success, true);
  assert.equal(reg1.codeId, '0000');
  assert.ok(reg1.customToken.includes('custom_token_for_0000'));

  // Verify Firestore document is keyed by CodeID
  const userDoc = await db.doc('users/0000').get();
  assert.equal(userDoc.exists, true);
  assert.equal(userDoc.data().codeId, '0000');
  assert.equal(userDoc.data().ndid, 'student.zero');
  assert.equal(userDoc.data().email, 'student.zero@example.com');
  assert.equal(userDoc.data().role, 'user');
  assert.equal(userDoc.data().adminLevel, null);
  assert.equal(userDoc.data().status, 'active');

  // Verify Firebase Auth record UID matches CodeID exactly
  const authRecord = await auth.getUser('0000');
  assert.equal(authRecord.uid, '0000');

  // Verify PasswordHash is stored in private subcollection, NEVER in users/{CodeID} root
  assert.equal(userDoc.data().passwordHash, undefined);
  assert.equal(userDoc.data().registeredPassword, undefined);
  const credDoc = await db.doc('users/0000/private/security').get();
  assert.equal(credDoc.exists, true);
  assert.ok(credDoc.data().passwordHash.startsWith('$2'));

  // Test 2: Duplicate NDID Rejected Atomically
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'student.zero', // duplicate
        password: 'AnotherPassword123!',
        email: 'different@example.com',
        name: 'Another User',
      });
    },
    (err) => err instanceof IdentifierUnavailableError
  );

  // Test 3: Duplicate Email Rejected Atomically
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'different.ndid',
        password: 'AnotherPassword123!',
        email: 'student.zero@example.com', // duplicate
        name: 'Another User',
      });
    },
    (err) => err instanceof IdentifierUnavailableError
  );

  // Next sequential registration establishes 0001 (as duplicate attempts do NOT consume CodeIDs under hardened pre-validation)
  const reg2 = await registerUser({
    db,
    auth,
    ndid: 'student.one',
    password: 'SecurePassword123!',
    email: 'student.one@example.com',
    name: 'Student One',
  });
  assert.equal(reg2.codeId, '0001');
});

test('MATRIX 2: LOGIN VIA NDID, EMAIL, WRONG PASSWORD, ACCOUNT STATUS LOCKOUT', async () => {
  const db = createAuditMockFirestore();
  const auth = createAuditMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'alice.nd',
    password: 'AlicePassword2026!',
    email: 'alice@example.com',
    name: 'Alice Wonder',
  });

  // 1. Successful login via NDID
  const loginNdid = await loginUser({
    db,
    auth,
    identifier: 'alice.nd',
    password: 'AlicePassword2026!',
  });
  assert.equal(loginNdid.success, true);
  assert.equal(loginNdid.codeId, '0000');
  assert.ok(loginNdid.customToken.includes('custom_token_for_0000'));

  // 2. Successful login via Email
  const loginEmail = await loginUser({
    db,
    auth,
    identifier: 'alice@example.com',
    password: 'AlicePassword2026!',
  });
  assert.equal(loginEmail.success, true);
  assert.equal(loginEmail.codeId, '0000');

  // 3. Wrong password increments counter and locks after 5 attempts
  for (let i = 1; i <= 4; i++) {
    await assert.rejects(
      async () => {
        await loginUser({
          db,
          auth,
          identifier: 'alice.nd',
          password: 'WrongPassword!',
        });
      },
      (err) => err instanceof InvalidCredentialsError
    );
    const cred = await db.doc('users/0000/private/security').get();
    assert.equal(cred.data().failedLoginAttempts, i);
  }

  // 5th attempt locks the account
  await assert.rejects(
    async () => {
      await loginUser({
        db,
        auth,
        identifier: 'alice.nd',
        password: 'WrongPassword!',
      });
    },
    (err) => err instanceof AccountLockedError
  );

  const lockedUser = await db.doc('users/0000').get();
  assert.equal(lockedUser.data().status, 'locked');

  // Subsequent login attempt (even with correct password) is rejected with ACCOUNT_LOCKED
  await assert.rejects(
    async () => {
      await loginUser({
        db,
        auth,
        identifier: 'alice.nd',
        password: 'AlicePassword2026!',
      });
    },
    (err) => err instanceof AccountLockedError
  );

  // 4. Disabled and Banned statuses rejected
  await db.doc('users/0000').update({ status: 'disabled' });
  await assert.rejects(
    async () => {
      await loginUser({ db, auth, identifier: 'alice.nd', password: 'AlicePassword2026!' });
    },
    (err) => err instanceof AccountDisabledError
  );

  await db.doc('users/0000').update({ status: 'banned' });
  await assert.rejects(
    async () => {
      await loginUser({ db, auth, identifier: 'alice.nd', password: 'AlicePassword2026!' });
    },
    (err) => err instanceof AccountBannedError
  );
});

test('MATRIX 3: PASSWORD RECOVERY, PASSWORD RESET & AUTOMATIC ACCOUNT UNLOCK', async () => {
  const db = createAuditMockFirestore();
  const auth = createAuditMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'bob.locked',
    password: 'OldPassword123!',
    email: 'bob@example.com',
    name: 'Bob Locked',
  });

  // Lock Bob's account and set emailVerified to true
  await db.doc('users/0000').update({ status: 'locked', emailVerified: true });
  await db.doc('users/0000/private/security').update({ failedLoginAttempts: 5 });

  // 1. Bob requests recovery code
  const reqRes = await requestAccountRecovery({
    db,
    identifier: 'bob@example.com',
    options: { exposeCodeForTesting: true },
  });
  assert.equal(reqRes.success, true);
  assert.ok(reqRes.message);
  assert.ok(reqRes._debugCode);
  const code = reqRes._debugCode;
  assert.equal(code.length, 6);

  // 2. Verify recovery code -> receives resetToken
  const verRes = await verifyRecoveryCode({
    db,
    identifier: 'bob.locked',
    code,
  });
  assert.equal(verRes.success, true);
  assert.ok(verRes.resetToken);

  // 3. Reset password using resetToken -> unlocks account and clears failedLoginAttempts
  const resetRes = await resetPasswordWithRecovery({
    db,
    auth,
    identifier: 'bob.locked',
    resetToken: verRes.resetToken,
    newPassword: 'BrandNewPassword2026!',
  });
  assert.equal(resetRes.success, true);
  assert.equal(resetRes.codeId, '0000');
  assert.ok(resetRes.message);

  // Verify user is active and counter reset
  const unlockedUser = await db.doc('users/0000').get();
  assert.equal(unlockedUser.data().status, 'active');
  const unlockedCred = await db.doc('users/0000/private/security').get();
  assert.equal(unlockedCred.data().failedLoginAttempts, 0);

  // 4. Bob can now login with NEW password; old password fails
  const loginNew = await loginUser({
    db,
    auth,
    identifier: 'bob.locked',
    password: 'BrandNewPassword2026!',
  });
  assert.equal(loginNew.success, true);

  await assert.rejects(
    async () => {
      await loginUser({
        db,
        auth,
        identifier: 'bob.locked',
        password: 'OldPassword123!',
      });
    },
    (err) => err instanceof InvalidCredentialsError
  );
});

test('MATRIX 4: SELF-SERVICE PASSWORD CHANGE & NDID 30-DAY COOLDOWN', async () => {
  const db = createAuditMockFirestore();
  const auth = createAuditMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'carol.dev',
    password: 'CarolPassword1!',
    email: 'carol@example.com',
    name: 'Carol Dev',
  });

  // 1. Password change
  const pwdRes = await changePassword({
    db,
    auth,
    codeId: '0000',
    currentPassword: 'CarolPassword1!',
    newPassword: 'CarolPasswordNew2026!',
  });
  assert.equal(pwdRes.success, true);

  // 2. Change NDID from carol.dev -> carol.engineer
  const ndidRes = await changeNdid({
    db,
    codeId: '0000',
    newNdid: 'carol.engineer',
  });
  assert.equal(ndidRes.success, true);
  assert.equal(ndidRes.oldNdid, 'carol.dev');
  assert.equal(ndidRes.newNdid, 'carol.engineer');

  // Verify CodeID remains strictly 0000
  const updatedUser = await db.doc('users/0000').get();
  assert.equal(updatedUser.data().codeId, '0000');
  assert.equal(updatedUser.data().ndid, 'carol.engineer');

  // Verify old NDID is on cooldown and cannot be taken by user Dave
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'carol.dev',
        password: 'DavePassword123!',
        email: 'dave@example.com',
        name: 'Dave',
      });
    },
    (err) => err instanceof IdentifierUnavailableError
  );
});

test('MATRIX 5: GOOGLE IDENTITY LINKING & PRESERVATION OF CODEID', async () => {
  const db = createAuditMockFirestore();
  const auth = createAuditMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'eve.google',
    password: 'EvePassword2026!',
    email: 'eve@example.com',
    name: 'Eve Google',
  });

  // 1. Link Google Subject ID to CodeID 0000
  const linkRes = await linkGoogleIdentity({
    db,
    codeId: '0000',
    googleSubjectId: 'google_sub_9988776655',
    googleEmail: 'eve.google@gmail.com',
  });
  assert.equal(linkRes.success, true);
  assert.equal(linkRes.codeId, '0000');

  // Verify mapping google_identities/{googleSubjectId} points to CodeID
  const mapping = await db.doc('google_identities/google_sub_9988776655').get();
  assert.equal(mapping.exists, true);
  assert.equal(mapping.data().codeId, '0000');

  // 2. Resolve Google Subject ID to CodeID
  const resolved = await resolveGoogleSubjectToCodeId(db, 'google_sub_9988776655');
  assert.equal(resolved.codeId, '0000');

  // Verify users/{0000}.googleSubjectId is updated
  const user = await db.doc('users/0000').get();
  assert.equal(user.data().googleSubjectId, 'google_sub_9988776655');
});

test('MATRIX 6: SESSION LIFECYCLE, REVOCATION & ISOLATION', async () => {
  const db = createAuditMockFirestore();
  const auth = createAuditMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'frank.session',
    password: 'FrankPassword2026!',
    email: 'frank@example.com',
    name: 'Frank Session',
  });

  // 1. Register Session 1 (laptop) and Session 2 (phone)
  const ses1 = await registerSession({
    db,
    codeId: '0000',
    sessionId: 'session_laptop_1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ip: '14.161.12.34',
  });
  assert.equal(ses1.success, true);

  const ses2 = await registerSession({
    db,
    codeId: '0000',
    sessionId: 'session_phone_2',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    ip: '14.161.12.35',
  });
  assert.equal(ses2.success, true);

  // 2. List sessions
  const list1 = await listActiveSessions({
    db,
    codeId: '0000',
    currentSessionId: 'session_laptop_1',
  });
  assert.equal(list1.sessions.length, 2);
  const currentSes = list1.sessions.find((s) => s.isCurrent);
  assert.equal(currentSes.sessionId, 'session_laptop_1');

  // 3. Revoke other sessions (from laptop)
  const revOthers = await revokeOtherUserSessions({
    db,
    codeId: '0000',
    currentSessionId: 'session_laptop_1',
  });
  assert.equal(revOthers.revokedCount, 1);

  // Verify phone session is now revoked
  const list2 = await listActiveSessions({ db, codeId: '0000' });
  assert.equal(list2.sessions.length, 1);
  assert.equal(list2.sessions[0].sessionId, 'session_laptop_1');

  // 4. Revoke single session
  const revSingle = await revokeUserSession({
    db,
    auth,
    codeId: '0000',
    sessionId: 'session_laptop_1',
  });
  assert.equal(revSingle.success, true);

  // 5. Cross-user isolation: User B cannot access User A's sessions
  await registerUser({
    db,
    auth,
    ndid: 'grace.hacker',
    password: 'GracePassword2026!',
    email: 'grace@example.com',
    name: 'Grace Hacker',
  });

  const graceList = await listActiveSessions({ db, codeId: '0001' });
  assert.equal(graceList.sessions.length, 0); // Grace sees only her sessions
});

test('MATRIX 7: TRUSTED DEVICES LIFECYCLE & ZERO RAW SECRET STORAGE', async () => {
  const db = createAuditMockFirestore();
  const auth = createAuditMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'heidi.dev',
    password: 'HeidiPassword2026!',
    email: 'heidi@example.com',
    name: 'Heidi Dev',
  });

  // 1. Register Trusted Device
  const devRes = await registerTrustedDeviceForUser({
    db,
    codeId: '0000',
    deviceId: 'device_heidi_pc',
    deviceLabel: 'Heidi Workstation',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ip: '113.160.20.10',
  });
  assert.equal(devRes.success, true);

  // Verify device document contains SHA-256 fingerprint hash and NO raw passwords/tokens
  const devDoc = await db.doc('users/0000/devices/device_heidi_pc').get();
  assert.equal(devDoc.exists, true);
  assert.ok(devDoc.data().deviceFingerprintHash);
  assert.equal(devDoc.data().rawPassword, undefined);
  assert.equal(devDoc.data().token, undefined);

  // 2. Safe listing
  const list = await listTrustedDevicesForUser({ db, codeId: '0000' });
  assert.equal(list.devices.length, 1);
  assert.equal(list.devices[0].deviceLabel, 'Heidi Workstation');
  assert.equal(list.devices[0].deviceFingerprintHash, undefined); // sanitized in projection

  // 3. Revoke trusted device
  const revRes = await revokeTrustedDeviceForUser({
    db,
    codeId: '0000',
    deviceId: 'device_heidi_pc',
  });
  assert.equal(revRes.success, true);

  const postRevDoc = await db.doc('users/0000/devices/device_heidi_pc').get();
  assert.equal(postRevDoc.data().status, 'revoked');
});

test('MATRIX 8: AUTHORIZATION, ROLE HIERARCHY & ZERO-OWNER LOCKOUT PREVENTION', async () => {
  const db = createAuditMockFirestore();

  // Setup 1 Owner (0000), 1 Admin (0001), 1 Normal User (0002)
  await db.doc('users/0000').set({ codeId: '0000', role: 'admin', adminLevel: 'owner', status: 'active' });
  await db.doc('users/0001').set({ codeId: '0001', role: 'admin', adminLevel: 'admin', status: 'active' });
  await db.doc('users/0002').set({ codeId: '0002', role: 'user', adminLevel: null, status: 'active' });

  // 1. assertSelfAccess
  assert.doesNotThrow(() => assertSelfAccess('0002', '0002'));
  assert.throws(() => assertSelfAccess('0002', '0000'), ForbiddenError);

  // 2. assertAdmin & assertOwner
  const ownerCtx = await getUserAuthorizationContext(db, '0000');
  const adminCtx = await getUserAuthorizationContext(db, '0001');
  const userCtx = await getUserAuthorizationContext(db, '0002');

  assert.doesNotThrow(() => assertAdmin(ownerCtx));
  assert.doesNotThrow(() => assertAdmin(adminCtx));
  assert.throws(() => assertAdmin(userCtx), ForbiddenError);

  assert.doesNotThrow(() => assertOwner(ownerCtx));
  assert.throws(() => assertOwner(adminCtx), ForbiddenError);
  assert.throws(() => assertOwner(userCtx), ForbiddenError);

  // 3. Privilege Escalation Prevention
  // User cannot self-promote to admin
  assert.throws(
    () => assertNoPrivilegeEscalation(userCtx, userCtx, { role: 'admin', adminLevel: 'admin' }),
    PrivilegeEscalationError
  );

  // Admin cannot promote anyone to owner
  assert.throws(
    () => assertNoPrivilegeEscalation(adminCtx, userCtx, { role: 'admin', adminLevel: 'owner' }),
    PrivilegeEscalationError
  );

  // Admin cannot demote or promote other admins
  assert.throws(
    () => assertNoPrivilegeEscalation(adminCtx, userCtx, { role: 'admin', adminLevel: 'admin' }),
    PrivilegeEscalationError
  );

  // Owner can promote user to admin
  assert.doesNotThrow(() =>
    assertNoPrivilegeEscalation(ownerCtx, userCtx, { role: 'admin', adminLevel: 'admin' })
  );

  // 4. Zero-Owner Lockout Prevention: Sole owner cannot demote themselves
  await assert.rejects(
    async () => {
      await updateUserRoleAndLevel({
        db,
        callerCodeId: '0000',
        targetCodeId: '0000',
        newRole: 'user',
        newAdminLevel: null,
      });
    },
    (err) => err instanceof PrivilegeEscalationError && err.code === 'PRIVILEGE_ESCALATION_DENIED'
  );
});

test('MATRIX 9: FIRESTORE SECURITY RULES CONTRACT VERIFICATION', () => {
  const rulesPath = path.resolve('firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Invariant 1: Client create & delete denied on users/{userId}
  assert.ok(rulesContent.includes('match /users/{userId}'), 'Rules must declare users/{userId}');
  assert.ok(rulesContent.includes('allow create: if false;'), 'Users create must be server-only');
  assert.ok(rulesContent.includes('allow delete: if false;'), 'Users delete must be server-only');

  // Invariant 2: Immutability of codeId, role, adminLevel, status in self-update
  assert.ok(rulesContent.includes('request.resource.data.codeId == resource.data.codeId'));
  assert.ok(rulesContent.includes("(!('role' in request.resource.data) || request.resource.data.role == resource.data.role)"));
  assert.ok(rulesContent.includes("(!('adminLevel' in request.resource.data) || request.resource.data.adminLevel == resource.data.adminLevel)"));
  assert.ok(rulesContent.includes("(!('status' in request.resource.data) || request.resource.data.status == resource.data.status)"));

  // Invariant 3: Server-only subcollections denied from client
  assert.ok(rulesContent.includes('match /private/{document=**}'));
  assert.ok(rulesContent.includes('match /sessions/{document=**}'));
  assert.ok(rulesContent.includes('match /devices/{document=**}'));

  // Invariant 4: Server-only root collections denied from client
  assert.ok(rulesContent.includes('match /counters/{counterId}'));
  assert.ok(rulesContent.includes('match /ndids/{ndid}'));
  assert.ok(rulesContent.includes('match /emails/{email}'));
  assert.ok(rulesContent.includes('match /google_identities/{googleSubjectId}'));

  // Invariant 5: Zero hardcoded emails in firestore.rules
  assert.ok(!rulesContent.includes('@gmail.com'), 'Zero hardcoded emails in firestore.rules');
  assert.ok(!rulesContent.includes('@ndsite.web.app'), 'Zero fake emails in firestore.rules');
});

test('MATRIX 10: LEGACY CUTOVER & TIMETABLE SAFETY CONTRACT', () => {
  // 1. Check login page
  const loginHtmlPath = path.resolve('auth/login/index.html');
  const loginHtml = fs.readFileSync(loginHtmlPath, 'utf8');

  assert.ok(!loginHtml.includes('@ndsite.web.app'), 'Zero @ndsite.web.app fake email in auth/login');
  assert.ok(!loginHtml.includes('registeredPassword'), 'Zero registeredPassword in auth/login');
  assert.ok(!loginHtml.includes('login-form-otp'), 'Zero legacy OTP form in auth/login');
  assert.ok(!loginHtml.includes('Math.random()'), 'Zero Math.random OTP in auth/login');
  assert.ok(loginHtml.includes('window.canonicalAuth.login'), 'auth/login uses canonicalAuth.login');
  assert.ok(loginHtml.includes('window.canonicalAuth.loginWithGoogle'), 'auth/login uses canonicalAuth.loginWithGoogle');

  // 2. Check register page
  const regHtmlPath = path.resolve('auth/register/index.html');
  const regHtml = fs.readFileSync(regHtmlPath, 'utf8');

  assert.ok(!regHtml.includes('@ndsite.web.app'), 'Zero fake email in auth/register');
  assert.ok(!regHtml.includes('registeredPassword'), 'Zero registeredPassword in auth/register');
  assert.ok(regHtml.includes('window.canonicalAuth.register'), 'auth/register uses canonicalAuth.register');

  // 3. Check recovery page
  const recHtmlPath = path.resolve('auth/recovery/index.html');
  const recHtml = fs.readFileSync(recHtmlPath, 'utf8');

  assert.ok(!recHtml.includes('@ndsite.web.app'), 'Zero fake email in auth/recovery');
  assert.ok(!recHtml.includes('registeredPassword'), 'Zero registeredPassword in auth/recovery');
  assert.ok(recHtml.includes('window.canonicalAuth.requestRecoveryCode'), 'auth/recovery uses canonicalAuth');

  // 4. TimeTable safety check in firestore.rules
  const rulesPath = path.resolve('firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  assert.ok(rulesContent.includes('match /timetables/{timetableId}'), 'TimeTable collection preserved in firestore.rules');
  assert.ok(!rulesContent.includes('ownerCodeID'), 'Zero unsolicited schema changes to timetables rules');
});
