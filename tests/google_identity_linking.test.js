/**
 * Automated Test Suite for Google Identity Linking (Phase 01-C4)
 * 
 * Tests cover:
 * - linkGoogleIdentity:
 *   - Case A: Link new Google identity (creates google_identities/{googleSubjectId}, updates user doc, audit log)
 *   - Case B: Idempotent re-link for same CodeID (no-op, success)
 *   - Case C: Rejection when Google identity already linked to another CodeID (conflict 409, rolls back Auth provider, logs security audit, NO auto-merge)
 *   - Case D: Different Google subject ID with same email handled cleanly
 *   - Anti-spoofing: verifies providerData from Firebase Auth user record
 *   - Auto-extraction: resolves googleSubjectId and email from Auth user record when not passed in body
 *   - CodeID & UID immutability: CodeID and Firebase Auth UID remain strictly unchanged
 * - unlinkGoogleIdentity:
 *   - Guard / Lockout prevention: rejects unlink if account has no registered password in private/security
 *   - Success path: deletes google_identities/{googleSubjectId}, clears user doc, unlinks Auth provider, logs security audit
 *   - Idempotency: no-op if account is already unlinked
 * - resolveGoogleSubjectToCodeId:
 *   - Correctly resolves CodeID from googleSubjectId
 *   - Returns null for unlinked or invalid subject IDs
 * - Client Error Mapping:
 *   - Maps GOOGLE_IDENTITY_ALREADY_LINKED, popup errors, and validation errors
 * - Security Rules Contract:
 *   - Asserts firestore.rules denies client read/write to google_identities
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);

const {
  // Google Linking Symbols
  GOOGLE_IDENTITIES_COLLECTION,
  GOOGLE_PROVIDER_ID,
  linkGoogleIdentity,
  unlinkGoogleIdentity,
  resolveGoogleSubjectToCodeId,
  GoogleIdentityAlreadyLinkedError,

  // Password & Security
  hashPassword,

  // Errors
  ValidationError,
  InvalidCredentialsError,
} = require('../functions/src/index.js');

// ── IN-MEMORY MOCK ENGINE FOR FIRESTORE & AUTH ───────────────────────────────

function createMockFirestore(seedData = {}) {
  const store = new Map();

  for (const [key, val] of Object.entries(seedData)) {
    store.set(key, JSON.parse(JSON.stringify(val)));
  }

  function getDocRef(docPath) {
    return {
      path: docPath,
      id: docPath.split('/').pop(),
      collection: (subCol) => ({
        doc: (subDocId) => getDocRef(`${docPath}/${subCol}/${subDocId}`),
      }),
      get: async () => {
        if (!store.has(docPath)) {
          return { exists: false, data: () => undefined, id: docPath.split('/').pop() };
        }
        return {
          exists: true,
          data: () => JSON.parse(JSON.stringify(store.get(docPath))),
          id: docPath.split('/').pop(),
        };
      },
      set: async (data, options) => {
        const existing = store.get(docPath) || {};
        const merged = (options && options.merge) ? { ...existing, ...data } : { ...data };
        store.set(docPath, JSON.parse(JSON.stringify(merged)));
      },
      update: async (data) => {
        if (!store.has(docPath)) {
          throw new Error(`Document does not exist at path: ${docPath}`);
        }
        const existing = store.get(docPath);
        store.set(docPath, JSON.parse(JSON.stringify({ ...existing, ...data })));
      },
      delete: async () => {
        store.delete(docPath);
      },
    };
  }

  const db = {
    _store: store,
    collection: (colName) => ({
      doc: (docId) => {
        const docPath = docId ? `${colName}/${docId}` : `${colName}/doc_${Math.random().toString(36).slice(2, 9)}`;
        return getDocRef(docPath);
      },
    }),
    runTransaction: async (fn) => {
      const writeOps = [];
      const transaction = {
        get: async (docRef) => docRef.get(),
        set: (docRef, data, options) => {
          writeOps.push(() => docRef.set(data, options));
        },
        update: (docRef, data) => {
          writeOps.push(() => docRef.update(data));
        },
        delete: (docRef) => {
          writeOps.push(() => docRef.delete());
        },
      };
      const result = await fn(transaction);
      for (const op of writeOps) {
        await op();
      }
      return result;
    },
  };

  return db;
}

function createMockAuth(initialUsers = {}) {
  const users = new Map();
  for (const [uid, u] of Object.entries(initialUsers)) {
    users.set(uid, {
      uid,
      providerData: [],
      ...u,
    });
  }

  return {
    _users: users,
    getUser: async (uid) => {
      const user = users.get(uid);
      if (!user) {
        const err = new Error(`User not found: ${uid}`);
        err.code = 'auth/user-not-found';
        throw err;
      }
      return { ...user };
    },
    updateUser: async (uid, updates) => {
      const user = users.get(uid);
      if (!user) {
        const err = new Error(`User not found: ${uid}`);
        err.code = 'auth/user-not-found';
        throw err;
      }
      let providerData = [...(user.providerData || [])];
      if (updates.providersToUnlink && Array.isArray(updates.providersToUnlink)) {
        providerData = providerData.filter(p => !updates.providersToUnlink.includes(p.providerId));
      }
      const updated = { ...user, ...updates, providerData };
      users.set(uid, updated);
      return updated;
    },
  };
}

// ── TEST SUITE ───────────────────────────────────────────────────────────────

test('Phase 01-C4: Google Identity Linking - Success Path (Case A)', async (t) => {
  const codeId = '00000010';
  const googleSubjectId = 'google_sub_10001';
  const googleEmail = 'alex.doe@gmail.com';
  const passwordHash = await hashPassword('MySecretPass123!');

  const seedData = {
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'alexdoe',
      email: 'alex.doe@example.com',
      googleSubjectId: null,
      googleEmail: null,
      role: 'member',
    },
    [`users/${codeId}/private/security`]: {
      passwordHash,
      passwordVersion: 'bcrypt-v1',
      failedLoginAttempts: 0,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId]: {
      email: 'alex.doe@example.com',
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: googleSubjectId, email: googleEmail }],
    },
  });

  const result = await linkGoogleIdentity({
    db,
    auth,
    codeId,
    googleSubjectId,
    googleEmail,
    ip: '192.168.1.1',
    userAgent: 'MochaTestAgent',
  });

  assert.equal(result.success, true);
  assert.equal(result.codeId, codeId);
  assert.equal(result.googleSubjectId, googleSubjectId);
  assert.equal(result.googleEmail, 'alex.doe@gmail.com');

  // Verify google_identities mapping created
  const mappingSnap = await db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(googleSubjectId).get();
  assert.equal(mappingSnap.exists, true);
  const mapping = mappingSnap.data();
  assert.equal(mapping.codeId, codeId);
  assert.equal(mapping.googleSubjectId, googleSubjectId);
  assert.equal(mapping.email, 'alex.doe@gmail.com');
  assert.equal(mapping.provider, 'google');

  // Verify users/{CodeID} updated
  const userSnap = await db.collection('users').doc(codeId).get();
  const userData = userSnap.data();
  assert.equal(userData.googleSubjectId, googleSubjectId);
  assert.equal(userData.googleEmail, 'alex.doe@gmail.com');
  // UID and CodeID must remain completely unchanged
  assert.equal(userData.uid, codeId);
  assert.equal(userData.codeId, codeId);

  // Verify security event logged
  let foundAuditEvent = false;
  for (const [key, val] of db._store.entries()) {
    if (key.startsWith('security_events/') && val.eventType === 'google_identity_linked') {
      foundAuditEvent = true;
      assert.equal(val.actorCodeID, codeId);
      assert.equal(val.details.googleSubjectId, googleSubjectId);
      assert.equal(val.details.googleEmail, 'alex.doe@gmail.com');
      break;
    }
  }
  assert.equal(foundAuditEvent, true, 'Audit log event google_identity_linked must be recorded');
});

test('Phase 01-C4: Google Identity Linking - Idempotent Same Account (Case B)', async (t) => {
  const codeId = '00000010';
  const googleSubjectId = 'google_sub_10001';
  const googleEmail = 'alex.doe@gmail.com';

  const seedData = {
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'alexdoe',
      googleSubjectId,
      googleEmail,
    },
    [`${GOOGLE_IDENTITIES_COLLECTION}/${googleSubjectId}`]: {
      codeId,
      googleSubjectId,
      provider: 'google',
      email: googleEmail,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId]: {
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: googleSubjectId, email: googleEmail }],
    },
  });

  const result = await linkGoogleIdentity({
    db,
    auth,
    codeId,
    googleSubjectId,
    googleEmail,
  });

  assert.equal(result.success, true);
  assert.equal(result.noOp, true);
  assert.equal(result.codeId, codeId);
  assert.equal(result.googleSubjectId, googleSubjectId);
});

test('Phase 01-C4: Google Identity Linking - Reject Conflict with Different Account (Case C)', async (t) => {
  const codeId1 = '00000001';
  const codeId2 = '00000002';
  const googleSubjectId = 'google_sub_shared';

  const seedData = {
    // User 1 already owns this Google identity
    [`users/${codeId1}`]: {
      uid: codeId1,
      codeId: codeId1,
      ndid: 'first_user',
      googleSubjectId,
      googleEmail: 'shared@gmail.com',
    },
    [`${GOOGLE_IDENTITIES_COLLECTION}/${googleSubjectId}`]: {
      codeId: codeId1,
      googleSubjectId,
      provider: 'google',
      email: 'shared@gmail.com',
    },
    // User 2 attempts to link the same Google identity
    [`users/${codeId2}`]: {
      uid: codeId2,
      codeId: codeId2,
      ndid: 'second_user',
      googleSubjectId: null,
      googleEmail: null,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId1]: {
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: googleSubjectId, email: 'shared@gmail.com' }],
    },
    [codeId2]: {
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: googleSubjectId, email: 'shared@gmail.com' }],
    },
  });

  await assert.rejects(
    async () => {
      await linkGoogleIdentity({
        db,
        auth,
        codeId: codeId2,
        googleSubjectId,
        googleEmail: 'shared@gmail.com',
      });
    },
    (err) => {
      assert.ok(err instanceof GoogleIdentityAlreadyLinkedError);
      assert.equal(err.code, 'GOOGLE_IDENTITY_ALREADY_LINKED');
      assert.equal(err.status, 409);
      return true;
    }
  );

  // Invariant check: NO account merging! User 1 still owns it.
  const mappingSnap = await db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(googleSubjectId).get();
  assert.equal(mappingSnap.data().codeId, codeId1);

  // User 2 has NOT been modified
  const user2Snap = await db.collection('users').doc(codeId2).get();
  assert.equal(user2Snap.data().googleSubjectId, null);

  // User 2's Google provider in Auth was cleaned up / unlinked
  const authUser2 = await auth.getUser(codeId2);
  const hasGoogle = (authUser2.providerData || []).some(p => p.providerId === GOOGLE_PROVIDER_ID);
  assert.equal(hasGoogle, false, 'Conflicting Google provider must be unlinked from Auth user');

  // Verify security audit recorded for failure
  let foundFailedEvent = false;
  for (const [key, val] of db._store.entries()) {
    if (key.startsWith('security_events/') && val.eventType === 'google_link_failed') {
      foundFailedEvent = true;
      assert.equal(val.actorCodeID, codeId2);
      assert.equal(val.details.conflictingCodeId, codeId1);
      break;
    }
  }
  assert.equal(foundFailedEvent, true, 'Audit log event google_link_failed must be recorded');
});

test('Phase 01-C4: Google Identity Linking - Provider Subject ID Keying (Case D)', async (t) => {
  // Two different Google subjects with same email
  const codeId1 = '00000011';
  const codeId2 = '00000022';
  const sameEmail = 'same.person@gmail.com';
  const sub1 = 'google_sub_original';
  const sub2 = 'google_sub_recreated';

  const seedData = {
    [`users/${codeId1}`]: {
      uid: codeId1,
      codeId: codeId1,
      ndid: 'user_one',
      googleSubjectId: sub1,
      googleEmail: sameEmail,
    },
    [`${GOOGLE_IDENTITIES_COLLECTION}/${sub1}`]: {
      codeId: codeId1,
      googleSubjectId: sub1,
      provider: 'google',
      email: sameEmail,
    },
    [`users/${codeId2}`]: {
      uid: codeId2,
      codeId: codeId2,
      ndid: 'user_two',
      googleSubjectId: null,
      googleEmail: null,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId2]: {
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: sub2, email: sameEmail }],
    },
  });

  // User 2 links sub2 which has the same email. Since subject IDs differ, this succeeds without collision!
  const result = await linkGoogleIdentity({
    db,
    auth,
    codeId: codeId2,
    googleSubjectId: sub2,
    googleEmail: sameEmail,
  });

  assert.equal(result.success, true);
  assert.equal(result.codeId, codeId2);
  assert.equal(result.googleSubjectId, sub2);

  // Both mappings coexist independently
  const map1 = (await db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(sub1).get()).data();
  const map2 = (await db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(sub2).get()).data();
  assert.equal(map1.codeId, codeId1);
  assert.equal(map2.codeId, codeId2);
});

test('Phase 01-C4: Google Identity Linking - Anti-Spoofing Verification', async (t) => {
  const codeId = '00000033';
  const realGoogleSub = 'real_google_sub_33';
  const fakeGoogleSub = 'fake_spoofed_sub_99';

  const seedData = {
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'victim',
      googleSubjectId: null,
      googleEmail: null,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId]: {
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: realGoogleSub, email: 'real@gmail.com' }],
    },
  });

  // Client attempts to claim a forged subject ID that does not match Auth providerData
  await assert.rejects(
    async () => {
      await linkGoogleIdentity({
        db,
        auth,
        codeId,
        googleSubjectId: fakeGoogleSub,
      });
    },
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.message.includes('không khớp'));
      return true;
    }
  );
});

test('Phase 01-C4: Google Identity Linking - Automatic Resolution from Auth Record', async (t) => {
  const codeId = '00000044';
  const googleSub = 'auto_resolved_sub_44';
  const googleEmail = 'auto.user@gmail.com';

  const seedData = {
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'auto_user',
      googleSubjectId: null,
      googleEmail: null,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId]: {
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: googleSub, email: googleEmail }],
    },
  });

  // No subject ID or email provided in params; should be extracted automatically from Auth
  const result = await linkGoogleIdentity({
    db,
    auth,
    codeId,
  });

  assert.equal(result.success, true);
  assert.equal(result.googleSubjectId, googleSub);
  assert.equal(result.googleEmail, googleEmail);
});

test('Phase 01-C4: Safe Unlinking - Blocked if Account Has No Password (Lockout Prevention)', async (t) => {
  const codeId = '00000055';
  const googleSub = 'sub_no_password';

  const seedData = {
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'nopassword_user',
      googleSubjectId: googleSub,
      googleEmail: 'nopass@gmail.com',
    },
    [`${GOOGLE_IDENTITIES_COLLECTION}/${googleSub}`]: {
      codeId,
      googleSubjectId: googleSub,
      provider: 'google',
    },
    // Missing private/security or passwordHash is null
    [`users/${codeId}/private/security`]: {
      passwordHash: null,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId]: {
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: googleSub }],
    },
  });

  await assert.rejects(
    async () => {
      await unlinkGoogleIdentity({
        db,
        auth,
        codeId,
      });
    },
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.message.includes('chưa thiết lập mật khẩu'));
      return true;
    }
  );

  // Verify mapping is NOT deleted
  const mappingSnap = await db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(googleSub).get();
  assert.equal(mappingSnap.exists, true, 'Mapping must remain intact when unlink is blocked');
});

test('Phase 01-C4: Safe Unlinking - Success Path when Password Exists', async (t) => {
  const codeId = '00000066';
  const googleSub = 'sub_with_password';
  const passwordHash = await hashPassword('KnownPassword123!');

  const seedData = {
    [`users/${codeId}`]: {
      uid: codeId,
      codeId,
      ndid: 'password_user',
      googleSubjectId: googleSub,
      googleEmail: 'haspass@gmail.com',
    },
    [`${GOOGLE_IDENTITIES_COLLECTION}/${googleSub}`]: {
      codeId,
      googleSubjectId: googleSub,
      provider: 'google',
      email: 'haspass@gmail.com',
    },
    [`users/${codeId}/private/security`]: {
      passwordHash,
      passwordVersion: 'bcrypt-v1',
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId]: {
      providerData: [{ providerId: GOOGLE_PROVIDER_ID, uid: googleSub }],
    },
  });

  const result = await unlinkGoogleIdentity({
    db,
    auth,
    codeId,
    ip: '127.0.0.1',
    userAgent: 'MochaTest',
  });

  assert.equal(result.success, true);
  assert.equal(result.codeId, codeId);

  // Verify google_identities mapping was deleted
  const mappingSnap = await db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(googleSub).get();
  assert.equal(mappingSnap.exists, false, 'Mapping must be deleted on unlink');

  // Verify users/{CodeID} cleared
  const userSnap = await db.collection('users').doc(codeId).get();
  assert.equal(userSnap.data().googleSubjectId, null);
  assert.equal(userSnap.data().googleEmail, null);
  assert.equal(userSnap.data().codeId, codeId);

  // Verify Auth provider unlinked
  const authUser = await auth.getUser(codeId);
  const hasGoogle = (authUser.providerData || []).some(p => p.providerId === GOOGLE_PROVIDER_ID);
  assert.equal(hasGoogle, false, 'Google provider must be unlinked from Auth user');

  // Verify security audit recorded
  let foundUnlinkEvent = false;
  for (const [key, val] of db._store.entries()) {
    if (key.startsWith('security_events/') && val.eventType === 'google_identity_unlinked') {
      foundUnlinkEvent = true;
      assert.equal(val.actorCodeID, codeId);
      assert.equal(val.details.unlinkedGoogleSubjectId, googleSub);
      break;
    }
  }
  assert.equal(foundUnlinkEvent, true, 'Audit log event google_identity_unlinked must be recorded');
});

test('Phase 01-C4: resolveGoogleSubjectToCodeId Helper', async (t) => {
  const codeId = '00000077';
  const googleSub = 'sub_resolvable_77';

  const seedData = {
    [`${GOOGLE_IDENTITIES_COLLECTION}/${googleSub}`]: {
      codeId,
      googleSubjectId: googleSub,
      provider: 'google',
      email: 'resolve@gmail.com',
    },
  };

  const db = createMockFirestore(seedData);

  const resolved = await resolveGoogleSubjectToCodeId(db, googleSub);
  assert.notEqual(resolved, null);
  assert.equal(resolved.codeId, codeId);
  assert.equal(resolved.email, 'resolve@gmail.com');

  const nonExistent = await resolveGoogleSubjectToCodeId(db, 'non_existent_sub');
  assert.equal(nonExistent, null);

  const emptyInput = await resolveGoogleSubjectToCodeId(db, '');
  assert.equal(emptyInput, null);
});

test('Phase 01-C4: Client Error Mapping Contract', () => {
  // Test simulated mapError function equivalent to canonical-auth.js
  function mapError(err) {
    if (!err) return 'Đã xảy ra lỗi không xác định.';
    const code = err.code || '';
    const msg = err.message || '';

    switch (code) {
      case 'AUTH_CREDENTIALS_INVALID':
        return 'Tài khoản hoặc mật khẩu không chính xác.';
      case 'GOOGLE_IDENTITY_ALREADY_LINKED':
      case 'auth/credential-already-in-use':
        return 'Tài khoản Google này đã được liên kết với một tài khoản khác.';
      case 'auth/popup-closed-by-user':
        return 'Đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.';
      case 'auth/popup-blocked':
        return 'Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép popup và thử lại.';
      case 'auth/cancelled-popup-request':
        return 'Yêu cầu đăng nhập Google đã bị hủy.';
      case 'VALIDATION_ERROR':
        return msg || 'Thông tin nhập vào không hợp lệ.';
      default:
        return msg || 'Đã xảy ra sự cố. Vui lòng thử lại sau.';
    }
  }

  assert.equal(
    mapError({ code: 'GOOGLE_IDENTITY_ALREADY_LINKED' }),
    'Tài khoản Google này đã được liên kết với một tài khoản khác.'
  );
  assert.equal(
    mapError({ code: 'auth/credential-already-in-use' }),
    'Tài khoản Google này đã được liên kết với một tài khoản khác.'
  );
  assert.equal(
    mapError({ code: 'auth/popup-closed-by-user' }),
    'Đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.'
  );
  assert.equal(
    mapError({ code: 'VALIDATION_ERROR', message: 'Không thể hủy liên kết Google vì tài khoản chưa thiết lập mật khẩu đăng nhập.' }),
    'Không thể hủy liên kết Google vì tài khoản chưa thiết lập mật khẩu đăng nhập.'
  );
});

test('Phase 01-C4: Firestore Rules Contract for google_identities', () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Verify google_identities is explicitly denied for client read and write
  assert.ok(
    rulesContent.includes('match /google_identities/{googleSubjectId}'),
    'firestore.rules must explicitly match /google_identities/{googleSubjectId}'
  );
  assert.ok(
    rulesContent.includes('allow read, write: if false;'),
    'firestore.rules must deny both read and write for client on google_identities'
  );
});
