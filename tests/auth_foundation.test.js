/**
 * Automated Test Suite for Authentication Foundation (Phase 01-C2)
 * 
 * Tests cover:
 * - Password Hashing, Verification, Versioning, Timing Safety, Length & Trimming
 * - NDID Validation, Normalization, Case Preservation, Collision Protection
 * - Email Validation, Normalization, Collision Protection
 * - Orchestrated Registration with Firebase Auth (UID === CodeID)
 * - Compensation Workflow: CodeID Consumed Permanently, Mappings Released, Auth Cleaned
 * - Concurrent Registrations with Same NDID / Email
 * - Idempotency Replay
 * - Canonical Login via NDID and Email
 * - Atomic Failed Attempt Tracking & Account Lockout at 5 Failures
 * - Status Gating (disabled, banned, locked, pending)
 * - Anti-Enumeration Protections & Credential Sanitization
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  // Password
  hashPassword,
  verifyPassword,
  dummyVerifyPassword,
  getPasswordVersion,
  validatePassword,
  PASSWORD_VERSION,

  // Validation
  validateNDID,
  normalizeNDID,
  validateEmail,
  normalizeEmail,
  validateDisplayName,

  // Identity & Mappings
  resolveIdentifierToCodeId,
  isNDIDAvailable,
  isEmailAvailable,

  // Orchestrated Registration & Login
  registerUser,
  loginUser,

  // Private Security
  getPrivateSecurityDoc,
  handleFailedLoginAttempt,
  resetFailedLoginAttempts,

  // Errors
  ValidationError,
  InvalidCredentialsError,
  IdentifierUnavailableError,
  AccountLockedError,
  AccountDisabledError,
  AccountBannedError,
  RegistrationCompensationError,
} = require('../functions/src/index.js');

// ── IN-MEMORY MOCK FIRESTORE & AUTH ENGINE ───────────────────────────────────

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
    batch: () => {
      const ops = [];
      return {
        set: (docRef, data) => ops.push(() => docRef.set(data)),
        delete: (docRef) => ops.push(() => docRef.delete()),
        commit: async () => {
          for (const op of ops) await op();
        },
      };
    },
    runTransaction: async (fn) => {
      let retries = 5;
      while (retries > 0) {
        retries--;
        const readVersions = new Map();
        const writeOps = [];

        const transaction = {
          get: async (docRef) => {
            const currentData = store.get(docRef.path);
            readVersions.set(docRef.path, JSON.stringify(currentData));
            if (!store.has(docRef.path)) {
              return { exists: false, data: () => undefined, id: docRef.id };
            }
            return {
              exists: true,
              data: () => JSON.parse(JSON.stringify(currentData)),
              id: docRef.id,
            };
          },
          set: (docRef, data) => {
            writeOps.push(() => docRef.set(data));
          },
          update: (docRef, data) => {
            writeOps.push(() => docRef.update(data));
          },
          delete: (docRef) => {
            writeOps.push(() => docRef.delete());
          },
        };

        try {
          const result = await fn(transaction);
          // Check conflict
          for (const [path, expectedJson] of readVersions.entries()) {
            const actualJson = JSON.stringify(store.get(path));
            if (expectedJson !== actualJson) {
              throw new Error('CONCURRENCY_CONFLICT');
            }
          }
          for (const op of writeOps) {
            await op();
          }
          return result;
        } catch (err) {
          if (err.message === 'CONCURRENCY_CONFLICT' && retries > 0) {
            await new Promise((r) => setTimeout(r, 5));
            continue;
          }
          throw err;
        }
      }
      throw new Error('Transaction exceeded maximum retries');
    },
  };

  return db;
}

function createMockAuth() {
  const users = new Map();

  return {
    _users: users,
    createUser: async ({ uid, email, displayName, disabled }) => {
      if (users.has(uid)) {
        const err = new Error(`User with UID ${uid} already exists`);
        err.code = 'auth/uid-already-exists';
        throw err;
      }
      if (email) {
        for (const u of users.values()) {
          if (u.email === email) {
            const err = new Error(`User with email ${email} already exists`);
            err.code = 'auth/email-already-exists';
            throw err;
          }
        }
      }
      const record = { uid, email, displayName, disabled: Boolean(disabled) };
      users.set(uid, record);
      return record;
    },
    deleteUser: async (uid) => {
      users.delete(uid);
    },
    createCustomToken: async (uid, claims = {}) => {
      return `mock-custom-token:${uid}:${JSON.stringify(claims)}`;
    },
    getUser: async (uid) => {
      if (!users.has(uid)) {
        const err = new Error(`User ${uid} not found`);
        err.code = 'auth/user-not-found';
        throw err;
      }
      return users.get(uid);
    },
  };
}

// ── TESTS ───────────────────────────────────────────────────────────────────

test('PASSWORD: hashing and verification with bcrypt-v1', async () => {
  const rawPass = 'SecretP@ssword123';
  const hash = await hashPassword(rawPass);

  assert.ok(hash.startsWith('$2'), 'Hash should be valid bcrypt string');
  assert.notEqual(hash, rawPass, 'passwordHash must never equal raw password');
  assert.equal(getPasswordVersion(), 'bcrypt-v1');
  assert.equal(PASSWORD_VERSION, 'bcrypt-v1');

  const match = await verifyPassword(rawPass, hash);
  assert.equal(match, true, 'Valid password must verify');

  const wrong = await verifyPassword('WrongPassword456', hash);
  assert.equal(wrong, false, 'Invalid password must not verify');

  const invalidHash = await verifyPassword(rawPass, 'corrupted_hash');
  assert.equal(invalidHash, false, 'Corrupted hash returns false safely without crashing');

  // Dummy verify for constant time mitigation
  await dummyVerifyPassword(rawPass);
});

test('PASSWORD: validation constraints and whitespace preservation', () => {
  assert.throws(() => validatePassword('short'), ValidationError);
  assert.throws(() => validatePassword('a'.repeat(129)), ValidationError);
  assert.throws(() => validatePassword(12345678), ValidationError);

  // Whitespace is preserved and valid if length >= 8
  assert.doesNotThrow(() => validatePassword('  spaced123  '));
});

test('NDID: validation, normalization, and policy enforcement', () => {
  assert.equal(validateNDID('john_doe.01'), 'john_doe.01');
  assert.equal(normalizeNDID('john_doe.01'), 'john_doe.01');

  // Must reject uppercase
  assert.throws(() => validateNDID('John_Doe.01'), ValidationError);

  // Must reject @, spaces, emojis, invalid symbols
  assert.throws(() => validateNDID('@john_doe'), ValidationError);
  assert.throws(() => validateNDID('john doe'), ValidationError);
  assert.throws(() => validateNDID('john#doe'), ValidationError);
  assert.throws(() => validateNDID('ab'), ValidationError); // too short (< 3)
  assert.throws(() => validateNDID('a'.repeat(31)), ValidationError); // too long (> 30)
});

test('EMAIL: validation and normalization', () => {
  assert.equal(validateEmail('User.ND@example.COM'), 'User.ND@example.COM');
  assert.equal(normalizeEmail('  User.ND@example.COM  '), 'user.nd@example.com');

  assert.throws(() => validateEmail('not-an-email'), ValidationError);
  assert.throws(() => validateEmail('user@'), ValidationError);
  assert.throws(() => validateEmail(''), ValidationError);
});

test('REGISTRATION: full canonical registration flow with UID === CodeID', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  const regResult = await registerUser({
    db,
    auth,
    ndid: 'alice_wonder',
    password: 'Password123!',
    email: 'alice@example.com',
    displayName: 'Alice Wonderland',
  });

  assert.equal(regResult.success, true);
  assert.equal(regResult.codeId, '0000', 'First allocated CodeID must be 0000');
  assert.ok(regResult.customToken.includes('0000'), 'Custom token must encode CodeID');
  assert.equal(regResult.user.ndid, 'alice_wonder', 'Raw NDID case is preserved in user profile');
  assert.equal(regResult.user.email, 'alice@example.com');
  assert.equal(regResult.user.status, 'active');

  // Verify Firebase Auth UID === CodeID
  const authUser = await auth.getUser('0000');
  assert.equal(authUser.uid, '0000', 'Firebase Auth UID must equal CodeID');
  assert.equal(authUser.email, 'alice@example.com');

  // Verify Firestore canonical document users/0000
  const userDocSnap = await db.collection('users').doc('0000').get();
  assert.ok(userDocSnap.exists);
  const userData = userDocSnap.data();
  assert.equal(userData.codeId, '0000');
  assert.equal(userData.role, 'user');

  // Verify private security document users/0000/private/security
  const secData = await getPrivateSecurityDoc(db, '0000');
  assert.ok(secData, 'Private security document must exist');
  assert.equal(secData.passwordVersion, 'bcrypt-v1');
  assert.ok(secData.passwordHash.startsWith('$2'));
  assert.equal(secData.failedLoginAttempts, 0);

  // Verify unique mappings
  const ndidSnap = await db.collection('ndids').doc('alice_wonder').get();
  assert.ok(ndidSnap.exists);
  assert.equal(ndidSnap.data().codeId, '0000');

  const emailSnap = await db.collection('emails').doc('alice@example.com').get();
  assert.ok(emailSnap.exists);
  assert.equal(emailSnap.data().codeId, '0000');
});

test('REGISTRATION: duplicate NDID is rejected atomically', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'bob_builder',
    password: 'Password123!',
    email: 'bob1@example.com',
  });

  // Attempt second registration with same NDID (different case)
  await assert.rejects(
    () =>
      registerUser({
        db,
        auth,
        ndid: 'bob_builder',
        password: 'AnotherPassword456!',
        email: 'bob2@example.com',
      }),
    IdentifierUnavailableError
  );
});

test('REGISTRATION: duplicate Email is rejected atomically', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'user_one',
    password: 'Password123!',
    email: 'shared@example.com',
  });

  // Attempt second registration with same email
  await assert.rejects(
    () =>
      registerUser({
        db,
        auth,
        ndid: 'user_two',
        password: 'Password123!',
        email: '  SHARED@example.com  ',
      }),
    IdentifierUnavailableError
  );
});

test('REGISTRATION: failure downstream permanently consumes CodeID (never recycled)', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  // First user succeeds: gets 0000
  const u1 = await registerUser({
    db,
    auth,
    ndid: 'user_zero',
    password: 'Password123!',
  });
  assert.equal(u1.codeId, '0000');

  // Inject failure into auth.createUser to simulate failure after CodeID allocation
  const originalCreateUser = auth.createUser;
  auth.createUser = async () => {
    throw new Error('SIMULATED_AUTH_OUTAGE');
  };

  await assert.rejects(
    () =>
      registerUser({
        db,
        auth,
        ndid: 'user_failed',
        password: 'Password123!',
        email: 'fail@example.com',
      }),
    RegistrationCompensationError
  );

  // Restore auth.createUser
  auth.createUser = originalCreateUser;

  // Next registration must allocate 0002! 0001 is consumed permanently as an intentional gap!
  const u2 = await registerUser({
    db,
    auth,
    ndid: 'user_next',
    password: 'Password123!',
  });
  assert.equal(u2.codeId, '0002', 'CodeID 0001 must not be recycled; 0002 allocated next');

  // Verify mappings for user_failed were released so handle can be used again
  const mappingSnap = await db.collection('ndids').doc('user_failed').get();
  assert.equal(mappingSnap.exists, false, 'Failed registration mapping must be released');
});

test('REGISTRATION: idempotency key replays exact result without duplicate account', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  const idempKey = 'req_unique_12345';

  const res1 = await registerUser({
    db,
    auth,
    ndid: 'idemp_user',
    password: 'Password123!',
    email: 'idemp@example.com',
    idempotencyKey: idempKey,
  });

  assert.equal(res1.codeId, '0000');

  // Second identical request
  const res2 = await registerUser({
    db,
    auth,
    ndid: 'idemp_user',
    password: 'Password123!',
    email: 'idemp@example.com',
    idempotencyKey: idempKey,
  });

  assert.equal(res2.codeId, '0000');
  assert.equal(res2.idempotentReplay, true);
  assert.equal(auth._users.size, 1, 'Only one Auth user created');
});

test('LOGIN: authenticate successfully via NDID', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'charlie_brown',
    password: 'PeanutsPassword123!',
    displayName: 'Charlie Brown',
  });

  const loginRes = await loginUser({
    db,
    auth,
    identifier: 'charlie_brown',
    password: 'PeanutsPassword123!',
  });

  assert.equal(loginRes.success, true);
  assert.equal(loginRes.codeId, '0000');
  assert.equal(loginRes.user.ndid, 'charlie_brown');
  assert.ok(loginRes.customToken.includes('0000'));
});

test('LOGIN: authenticate successfully via Email', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'david_copperfield',
    email: 'david@magic.com',
    password: 'Abracadabra123!',
  });

  const loginRes = await loginUser({
    db,
    auth,
    identifier: 'DAVID@MAGIC.COM',
    password: 'Abracadabra123!',
  });

  assert.equal(loginRes.success, true);
  assert.equal(loginRes.codeId, '0000');
  assert.equal(loginRes.user.ndid, 'david_copperfield');
});

test('LOGIN: wrong password increments failed count and locks after 5 attempts', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'targetaccount',
    password: 'CorrectPassword123!',
  });

  // 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    await assert.rejects(
      () =>
        loginUser({
          db,
          auth,
          identifier: 'targetaccount',
          password: 'WrongPassword!',
        }),
      InvalidCredentialsError
    );
    const sec = await getPrivateSecurityDoc(db, '0000');
    assert.equal(sec.failedLoginAttempts, i);
  }

  // 5th attempt triggers AccountLockedError
  await assert.rejects(
    () =>
      loginUser({
        db,
        auth,
        identifier: 'targetaccount',
        password: 'WrongPassword!',
      }),
    AccountLockedError
  );

  const secFinal = await getPrivateSecurityDoc(db, '0000');
  assert.equal(secFinal.failedLoginAttempts, 5);
  assert.ok(secFinal.lockedAt !== null);

  // Even correct password is now blocked by lock
  await assert.rejects(
    () =>
      loginUser({
        db,
        auth,
        identifier: 'targetaccount',
        password: 'CorrectPassword123!',
      }),
    AccountLockedError
  );
});

test('LOGIN: successful login resets failed counter to zero', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'resetcounteruser',
    password: 'CorrectPassword123!',
  });

  // 2 failed attempts
  for (let i = 0; i < 2; i++) {
    await assert.rejects(
      () =>
        loginUser({
          db,
          auth,
          identifier: 'resetcounteruser',
          password: 'WrongPassword!',
        }),
      InvalidCredentialsError
    );
  }

  const secBefore = await getPrivateSecurityDoc(db, '0000');
  assert.equal(secBefore.failedLoginAttempts, 2);

  // Successful login
  const success = await loginUser({
    db,
    auth,
    identifier: 'resetcounteruser',
    password: 'CorrectPassword123!',
  });
  assert.equal(success.success, true);

  const secAfter = await getPrivateSecurityDoc(db, '0000');
  assert.equal(secAfter.failedLoginAttempts, 0, 'Failed attempts must be reset to 0');
});

test('LOGIN: rejects accounts with disabled or banned status', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await registerUser({
    db,
    auth,
    ndid: 'disableduser',
    password: 'Password123!',
  });

  // Set status to disabled
  await db.collection('users').doc('0000').update({ status: 'disabled' });

  await assert.rejects(
    () =>
      loginUser({
        db,
        auth,
        identifier: 'disableduser',
        password: 'Password123!',
      }),
    AccountDisabledError
  );

  // Set status to banned
  await db.collection('users').doc('0000').update({ status: 'banned' });

  await assert.rejects(
    () =>
      loginUser({
        db,
        auth,
        identifier: 'disableduser',
        password: 'Password123!',
      }),
    AccountBannedError
  );
});

test('SECURITY & ANTI-ENUMERATION: generic error message for non-existent users', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await assert.rejects(
    () =>
      loginUser({
        db,
        auth,
        identifier: 'non_existent_ndid',
        password: 'SomePassword123!',
      }),
    (err) => {
      assert.ok(err instanceof InvalidCredentialsError);
      assert.equal(err.message, 'Thông tin đăng nhập không chính xác.');
      return true;
    }
  );

  await assert.rejects(
    () =>
      loginUser({
        db,
        auth,
        identifier: 'non_existent@example.com',
        password: 'SomePassword123!',
      }),
    (err) => {
      assert.ok(err instanceof InvalidCredentialsError);
      assert.equal(err.message, 'Thông tin đăng nhập không chính xác.');
      return true;
    }
  );
});

test('CONCURRENCY: 2 simultaneous registrations with same NDID only permits 1', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  const attempts = await Promise.allSettled([
    registerUser({
      db,
      auth,
      ndid: 'contendedhandle',
      password: 'Password123!',
      email: 'userA@example.com',
    }),
    registerUser({
      db,
      auth,
      ndid: 'contendedhandle',
      password: 'Password123!',
      email: 'userB@example.com',
    }),
  ]);

  const fulfilled = attempts.filter((a) => a.status === 'fulfilled');
  const rejected = attempts.filter((a) => a.status === 'rejected');

  assert.equal(fulfilled.length, 1, 'Exactly one registration must succeed');
  assert.equal(rejected.length, 1, 'Competing registration must fail');
  assert.ok(rejected[0].reason instanceof IdentifierUnavailableError);
});
