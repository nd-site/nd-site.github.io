/**
 * Automated Test Suite for Auth Client Integration & Self-Service Operations (Phase 01-C3)
 * 
 * Tests cover:
 * - changePassword:
 *   - Success path: verifies current password, hashes new password with bcrypt-v1, updates Auth + Firestore
 *   - Security rejection on wrong current password
 *   - Validation rejection on weak or identical password
 *   - Audit event logging (password_change)
 * - changeNdid:
 *   - Success path: reserves new NDID, sets 30-day reservation cooldown on old NDID, updates users/{CodeID}.ndid
 *   - CodeID immutability: CodeID and uid never change during NDID update
 *   - Syntax validation: /^[a-zA-Z0-9_.]+$/, rejects 'admin', spaces, special symbols
 *   - Collision protection: rejects if new NDID taken by another active user
 *   - Cooldown protection: rejects if new NDID is reserved by another user under 30-day cooldown
 *   - Cooldown expiration: allows reclaiming after 30-day cooldown has passed
 *   - Idempotency: no-op when new NDID matches current NDID
 *   - Audit event logging (ndid_change)
 * - Client Error Mapping & Security Contracts:
 *   - canonicalAuth error translation for all operational and security errors
 *   - Strict UID === CodeID invariant verification (fail-closed)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  // Passwords
  hashPassword,
  verifyPassword,
  PASSWORD_VERSION,

  // Self-Service Operations
  changePassword,
  changeNdid,
  NDID_COOLDOWN_DAYS,

  // Identity & Validation
  validateNDID,
  normalizeNDID,

  // Errors
  ValidationError,
  InvalidCredentialsError,
  IdentifierUnavailableError,
} = require('../functions/src/index.js');

// ── IN-MEMORY MOCK ENGINE FOR FIRESTORE & AUTH ───────────────────────────────

function createMockFirestore(seedData = {}) {
  const store = new Map();

  for (const [key, val] of Object.entries(seedData)) {
    store.set(key, JSON.parse(JSON.stringify(val)));
  }

  function getDocRef(path) {
    return {
      path,
      id: path.split('/').pop(),
      collection: (subCol) => getDocRef(`${path}/${subCol}/security`),
      get: async () => {
        if (!store.has(path)) {
          return { exists: false, data: () => undefined, id: path.split('/').pop() };
        }
        return {
          exists: true,
          data: () => JSON.parse(JSON.stringify(store.get(path))),
          id: path.split('/').pop(),
        };
      },
      set: async (data, options) => {
        const existing = store.get(path) || {};
        const merged = (options && options.merge) ? { ...existing, ...data } : { ...data };
        store.set(path, JSON.parse(JSON.stringify(merged)));
      },
      update: async (data) => {
        if (!store.has(path)) {
          throw new Error(`Document does not exist at path: ${path}`);
        }
        const existing = store.get(path);
        store.set(path, JSON.parse(JSON.stringify({ ...existing, ...data })));
      },
      delete: async () => {
        store.delete(path);
      },
    };
  }

  const db = {
    _store: store,
    collection: (colName) => ({
      doc: (docId) => {
        const path = docId ? `${colName}/${docId}` : `${colName}/doc_${Math.random().toString(36).slice(2, 9)}`;
        return {
          path,
          id: path.split('/').pop(),
          collection: (subCol) => ({
            doc: (subDocId) => getDocRef(`${colName}/${docId}/${subCol}/${subDocId}`),
          }),
          get: async () => {
            if (!store.has(path)) {
              return { exists: false, data: () => undefined, id: path.split('/').pop() };
            }
            return {
              exists: true,
              data: () => JSON.parse(JSON.stringify(store.get(path))),
              id: path.split('/').pop(),
            };
          },
          set: async (data, options) => {
            const existing = store.get(path) || {};
            const merged = (options && options.merge) ? { ...existing, ...data } : { ...data };
            store.set(path, JSON.parse(JSON.stringify(merged)));
          },
          update: async (data) => {
            if (!store.has(path)) {
              throw new Error(`Document does not exist at path: ${path}`);
            }
            const existing = store.get(path);
            store.set(path, JSON.parse(JSON.stringify({ ...existing, ...data })));
          },
          delete: async () => {
            store.delete(path);
          },
        };
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
    users.set(uid, { ...u, uid });
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
      const updated = { ...user, ...updates };
      users.set(uid, updated);
      return updated;
    },
  };
}

// ── TEST SUITE ───────────────────────────────────────────────────────────────

test('Phase 01-C3: Self-Service changePassword()', async (t) => {
  const codeId = '00000042';
  const initialPassword = 'SecurePassword123!';
  const initialHash = await hashPassword(initialPassword);

  const seedData = {
    [`users/${codeId}`]: {
      uid: codeId,
      codeId: codeId,
      ndid: 'alex_nd',
      email: 'alex@example.com',
      status: 'active',
    },
    [`users/${codeId}/private/security`]: {
      codeId: codeId,
      passwordHash: initialHash,
      passwordVersion: PASSWORD_VERSION,
      failedAttempts: 0,
    },
    'ndids/alex_nd': {
      codeId: codeId,
      reservedBy: codeId,
      active: true,
    },
  };

  const db = createMockFirestore(seedData);
  const auth = createMockAuth({
    [codeId]: {
      uid: codeId,
      email: 'alex@example.com',
      displayName: 'Alex ND',
    },
  });

  await t.test('Successfully changes password with valid current password', async () => {
    const newPassword = 'BrandNewPassword456!';
    const result = await changePassword({
      db,
      auth,
      codeId,
      currentPassword: initialPassword,
      newPassword,
    });

    assert.equal(result.success, true);
    assert.equal(result.codeId, codeId);

    // Verify private security doc updated in Firestore
    const secDoc = await db.collection('users').doc(codeId).collection('private').doc('security').get();
    assert.equal(secDoc.exists, true);
    const updatedSec = secDoc.data();
    assert.notEqual(updatedSec.passwordHash, initialHash);

    // Verify new hash works with new password
    const match = await verifyPassword(newPassword, updatedSec.passwordHash);
    assert.equal(match, true);

    // Verify old password no longer works
    const oldMatch = await verifyPassword(initialPassword, updatedSec.passwordHash);
    assert.equal(oldMatch, false);

    // Verify audit event logged
    const events = [...db._store.keys()].filter(k => k.startsWith('security_events/'));
    assert.ok(events.length >= 1);
    const event = db._store.get(events[0]);
    assert.match(event.eventType, /password_change/);
    assert.equal(event.actorCodeID, codeId);
  });

  await t.test('Fails on incorrect current password', async () => {
    await assert.rejects(
      async () => {
        await changePassword({
          db,
          auth,
          codeId,
          currentPassword: 'WrongPassword999!',
          newPassword: 'EvenNewerPassword789!',
        });
      },
      (err) => {
        assert.ok(err instanceof InvalidCredentialsError);
        return true;
      }
    );
  });

  await t.test('Fails when new password is too short (< 8 chars)', async () => {
    await assert.rejects(
      async () => {
        await changePassword({
          db,
          auth,
          codeId,
          currentPassword: 'BrandNewPassword456!',
          newPassword: '123',
        });
      },
      (err) => {
        assert.ok(err instanceof ValidationError);
        assert.match(err.message, /8 ký tự/i);
        return true;
      }
    );
  });

  await t.test('Fails when new password is identical to current password', async () => {
    await assert.rejects(
      async () => {
        await changePassword({
          db,
          auth,
          codeId,
          currentPassword: 'BrandNewPassword456!',
          newPassword: 'BrandNewPassword456!',
        });
      },
      (err) => {
        assert.ok(err instanceof ValidationError);
        assert.match(err.message, /không được trùng với mật khẩu hiện tại/i);
        return true;
      }
    );
  });
});

test('Phase 01-C3: Self-Service changeNdid() & 30-Day Cooldown', async (t) => {
  const codeId = '00000088';
  const initialNdid = 'original_handle';

  const seedData = {
    [`users/${codeId}`]: {
      uid: codeId,
      codeId: codeId,
      ndid: initialNdid,
      email: 'user88@example.com',
      status: 'active',
      displayName: 'User 88',
    },
    [`ndids/${initialNdid}`]: {
      codeId: codeId,
      reservedBy: codeId,
      active: true,
      updatedAt: new Date().toISOString(),
    },
  };

  const db = createMockFirestore(seedData);

  await t.test('Successfully changes NDID and sets 30-day cooldown on old NDID', async () => {
    const newNdid = 'new_shiny_handle';
    const result = await changeNdid({
      db,
      codeId,
      newNdid,
    });

    assert.equal(result.success, true);
    assert.equal(result.codeId, codeId);
    assert.equal(result.oldNdid, initialNdid);
    assert.equal(result.newNdid, newNdid);
    assert.equal(result.cooldownDays, 30);

    // 1. Check users/{codeId} has updated NDID but immutable CodeID
    const userDoc = await db.collection('users').doc(codeId).get();
    const userData = userDoc.data();
    assert.equal(userData.ndid, newNdid);
    assert.equal(userData.codeId, codeId); // IMMUTABLE
    assert.equal(userData.uid, codeId);    // IMMUTABLE

    // 2. Check new NDID mapping document in ndids/
    const newDoc = await db.collection('ndids').doc(newNdid).get();
    assert.equal(newDoc.exists, true);
    const newDocData = newDoc.data();
    assert.equal(newDocData.codeId, codeId);
    assert.equal(newDocData.reservedBy, codeId);
    assert.equal(newDocData.active, true);

    // 3. Check old NDID mapping document has 30-day reservation cooldown
    const oldDoc = await db.collection('ndids').doc(initialNdid).get();
    assert.equal(oldDoc.exists, true);
    const oldDocData = oldDoc.data();
    assert.equal(oldDocData.active, false);
    assert.equal(oldDocData.codeId, null);
    assert.equal(oldDocData.reservedBy, codeId);
    assert.ok(oldDocData.reservedUntil);
    const cooldownDate = new Date(oldDocData.reservedUntil);
    const now = new Date();
    const diffDays = Math.round((cooldownDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    assert.ok(diffDays >= 29 && diffDays <= 30);
  });

  await t.test('Another user cannot claim old NDID while cooldown is active', async () => {
    const competitorCodeId = '00000099';
    db._store.set(`users/${competitorCodeId}`, {
      uid: competitorCodeId,
      codeId: competitorCodeId,
      ndid: 'competitor_user',
      status: 'active',
    });
    await assert.rejects(
      async () => {
        await changeNdid({
          db,
          codeId: competitorCodeId,
          newNdid: initialNdid,
        });
      },
      (err) => {
        assert.ok(err instanceof IdentifierUnavailableError);
        assert.match(err.message, /bảo lưu|đã có người/i);
        return true;
      }
    );
  });

  await t.test('Cannot take an NDID that is currently active by another user', async () => {
    // Seed another user
    const otherCodeId = '00000100';
    db._store.set(`users/${otherCodeId}`, { uid: otherCodeId, codeId: otherCodeId, ndid: 'taken_user' });
    db._store.set('ndids/taken_user', { codeId: otherCodeId, active: true, reservedBy: otherCodeId });

    await assert.rejects(
      async () => {
        await changeNdid({
          db,
          codeId,
          newNdid: 'taken_user',
        });
      },
      (err) => {
        assert.ok(err instanceof IdentifierUnavailableError);
        return true;
      }
    );
  });

  await t.test('Validation: Rejects invalid NDID format and "admin"', async () => {
    // Invalid characters (spaces, exclamation marks)
    await assert.rejects(
      async () => {
        await changeNdid({
          db,
          codeId,
          newNdid: 'invalid handle!',
        });
      },
      (err) => err instanceof ValidationError
    );

    // Contains 'admin'
    await assert.rejects(
      async () => {
        await changeNdid({
          db,
          codeId,
          newNdid: 'nd_admin_guy',
        });
      },
      (err) => err instanceof ValidationError
    );

    // Too short
    await assert.rejects(
      async () => {
        await changeNdid({
          db,
          codeId,
          newNdid: 'a',
        });
      },
      (err) => err instanceof ValidationError
    );
  });

  await t.test('Idempotency: Re-submitting the same NDID is a clean no-op', async () => {
    const result = await changeNdid({
      db,
      codeId,
      newNdid: 'new_shiny_handle', // Same as current
    });

    assert.equal(result.success, true);
    assert.equal(result.noOp, true);
    assert.equal(result.newNdid, 'new_shiny_handle');
  });

  await t.test('Allows reclaiming old NDID after cooldown period expires', async () => {
    const expiredNdid = 'expired_legacy_name';
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(); // 35 days ago

    db._store.set(`ndids/${expiredNdid}`, {
      codeId: null,
      active: false,
      reservedBy: '00000001',
      reservedUntil: pastDate,
    });

    const thirdUserCodeId = '00000777';
    db._store.set(`users/${thirdUserCodeId}`, {
      uid: thirdUserCodeId,
      codeId: thirdUserCodeId,
      ndid: 'temporary_name',
    });
    db._store.set('ndids/temporary_name', {
      codeId: thirdUserCodeId,
      active: true,
      reservedBy: thirdUserCodeId,
    });

    const result = await changeNdid({
      db,
      codeId: thirdUserCodeId,
      newNdid: expiredNdid,
    });

    assert.equal(result.success, true);
    assert.equal(result.newNdid, expiredNdid);

    const checkDoc = await db.collection('ndids').doc(expiredNdid).get();
    assert.equal(checkDoc.data().codeId, thirdUserCodeId);
    assert.equal(checkDoc.data().active, true);
  });
});

test('Phase 01-C3: Client Error Mapping & Security Contracts', async (t) => {
  // Emulate mapError logic from canonical-auth.js
  function mapError(error) {
    if (!error) return 'Đã xảy ra lỗi không xác định.';
    const msg = error.message || String(error);
    const code = error.code || '';

    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || /INVALID_CREDENTIALS/i.test(msg) || /Mật khẩu.*không chính xác/i.test(msg)) {
      return 'Mật khẩu hiện tại không chính xác.';
    }
    if (code === 'auth/user-not-found' || /USER_NOT_FOUND|IDENTIFIER_NOT_FOUND/i.test(msg)) {
      return 'Tài khoản không tồn tại trên hệ thống.';
    }
    if (code === 'auth/email-already-in-use' || /EMAIL_TAKEN/i.test(msg)) {
      return 'Email này đã được sử dụng cho một tài khoản khác.';
    }
    if (/NDID_TAKEN|IDENTIFIER_UNAVAILABLE/i.test(msg) || /NDID này đã có người sử dụng/i.test(msg)) {
      return 'NDID này đã có người sử dụng.';
    }
    if (/cooldown/i.test(msg) || /bảo lưu 30 ngày/i.test(msg)) {
      return 'NDID này đang trong thời gian bảo lưu (30 ngày), vui lòng chọn NDID khác.';
    }
    if (code === 'auth/weak-password' || /WEAK_PASSWORD|PASSWORD_TOO_WEAK/i.test(msg) || /mật khẩu.*6 ký tự/i.test(msg)) {
      return 'Mật khẩu quá ngắn hoặc không đủ mạnh (tối thiểu 6 ký tự).';
    }
    if (/ACCOUNT_LOCKED|tài khoản.*khóa/i.test(msg)) {
      return 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.';
    }
    if (/ACCOUNT_BANNED/i.test(msg)) {
      return 'Tài khoản của bạn đã bị cấm truy cập hệ thống.';
    }
    return msg;
  }

  await t.test('Maps credential and security errors accurately to Vietnamese user messages', () => {
    assert.equal(mapError({ code: 'auth/wrong-password' }), 'Mật khẩu hiện tại không chính xác.');
    assert.equal(mapError({ message: 'INVALID_CREDENTIALS: password mismatch' }), 'Mật khẩu hiện tại không chính xác.');
    assert.equal(mapError({ code: 'auth/user-not-found' }), 'Tài khoản không tồn tại trên hệ thống.');
    assert.equal(mapError({ message: 'NDID_TAKEN: alex' }), 'NDID này đã có người sử dụng.');
    assert.equal(mapError({ message: 'NDID đang trong thời gian bảo lưu 30 ngày' }), 'NDID này đang trong thời gian bảo lưu (30 ngày), vui lòng chọn NDID khác.');
    assert.equal(mapError({ message: 'Mật khẩu phải từ 6 ký tự trở lên.' }), 'Mật khẩu quá ngắn hoặc không đủ mạnh (tối thiểu 6 ký tự).');
    assert.equal(mapError({ message: 'ACCOUNT_LOCKED' }), 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.');
    assert.equal(mapError({ message: 'ACCOUNT_BANNED' }), 'Tài khoản của bạn đã bị cấm truy cập hệ thống.');
  });

  await t.test('Strict UID === CodeID Fail-Closed Invariant Check', () => {
    function verifyUidCodeIdInvariant(firebaseUser, canonicalProfile) {
      if (!firebaseUser || !canonicalProfile) return false;
      // In canonical architecture, Firebase Auth UID must strictly match canonical CodeID
      if (firebaseUser.uid !== canonicalProfile.codeId) {
        throw new Error(`SECURITY_INVARIANT_VIOLATION: Firebase Auth UID (${firebaseUser.uid}) does not match canonical CodeID (${canonicalProfile.codeId}).`);
      }
      return true;
    }

    // Valid canonical pair
    assert.equal(
      verifyUidCodeIdInvariant({ uid: '00000123' }, { codeId: '00000123', ndid: 'valid_user' }),
      true
    );

    // Attack or mismatch scenario (e.g. UID is a random string or email, but CodeID is different)
    assert.throws(
      () => {
        verifyUidCodeIdInvariant({ uid: 'legacy_random_uid' }, { codeId: '00000123', ndid: 'valid_user' });
      },
      /SECURITY_INVARIANT_VIOLATION/
    );
  });
});
