/**
 * Dedicated Test Suite: Hardened Account Registration & Pre-Allocation Validation
 * 
 * Verifies that:
 * 1. Invalid registration input does NOT consume CodeID.
 * 2. Duplicate NDID does NOT consume CodeID.
 * 3. Duplicate email does NOT consume CodeID.
 * 4. Invalid Google provisioning does NOT consume CodeID.
 * 5. Valid registration allocates exactly one sequential CodeID.
 * 6. Double-submit (idempotency replay) does NOT allocate two CodeIDs.
 * 7. Concurrent registrations allocate sequential, atomic CodeIDs without collisions.
 * 8. Downstream failure compensation leaves no partial canonical records.
 * 9. Firebase Auth UID equals allocated CodeID.
 * 10. Existing Owner 0000 remains completely unchanged throughout.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  registerUser,
  provisionGoogleAccount,
  allocateCodeId,
  getCounterState,
  initializeCounter,
  ValidationError,
  IdentifierUnavailableError,
  RegistrationCompensationError,
} = require('../functions/src/index');

function createMockFirestore() {
  const store = new Map();

  function getDocRef(path) {
    return {
      path,
      id: path.split('/').pop(),
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
      set: async (data, opts = {}) => {
        if (opts.merge && store.has(path)) {
          const prev = store.get(path) || {};
          store.set(path, { ...prev, ...JSON.parse(JSON.stringify(data)) });
        } else {
          store.set(path, JSON.parse(JSON.stringify(data)));
        }
      },
      update: async (data) => {
        if (!store.has(path)) throw new Error(`Document ${path} not found`);
        const prev = store.get(path) || {};
        store.set(path, { ...prev, ...JSON.parse(JSON.stringify(data)) });
      },
      delete: async () => {
        store.delete(path);
      },
      collection: (sub) => getCollectionRef(`${path}/${sub}`),
    };
  }

  function getCollectionRef(collPath) {
    return {
      path: collPath,
      doc: (id) => getDocRef(`${collPath}/${id}`),
      add: async (data) => {
        const id = `auto_${Math.random().toString(36).slice(2, 10)}`;
        const docRef = getDocRef(`${collPath}/${id}`);
        await docRef.set(data);
        return docRef;
      },
    };
  }

  const db = {
    _store: store,
    collection: (collPath) => getCollectionRef(collPath),
    doc: (path) => getDocRef(path),
    batch: () => {
      const ops = [];
      return {
        set: (docRef, data, opts) => ops.push(() => docRef.set(data, opts)),
        delete: (docRef) => ops.push(() => docRef.delete()),
        commit: async () => {
          for (const op of ops) await op();
        },
      };
    },
    runTransaction: async (fn) => {
      let retries = 10;
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
          set: (docRef, data, opts) => {
            writeOps.push(() => docRef.set(data, opts));
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

// ─── TEST SUITE ─────────────────────────────────────────────────────────────

test('HARDENING 1: Invalid registration inputs do NOT consume CodeID', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  // Setup Owner 0000 in DB
  await initializeCounter(db, 1); // Next codeId will be "0001"
  const counterBefore = await getCounterState(db);
  assert.equal(counterBefore.nextNumericValue, 1);

  // Test 1a: NDID with uppercase
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'InvalidNDID',
        password: 'password123',
      });
    },
    (err) => err instanceof ValidationError
  );
  assert.equal((await getCounterState(db)).nextNumericValue, 1, 'Counter unchanged after invalid NDID');

  // Test 1b: NDID with invalid chars (@ symbol)
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: '@badndid',
        password: 'password123',
      });
    },
    (err) => err instanceof ValidationError
  );
  assert.equal((await getCounterState(db)).nextNumericValue, 1, 'Counter unchanged after invalid NDID character');

  // Test 1c: NDID containing forbidden "admin"
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'super_admin_user',
        password: 'password123',
      });
    },
    (err) => err instanceof ValidationError
  );
  assert.equal((await getCounterState(db)).nextNumericValue, 1, 'Counter unchanged after forbidden admin NDID');

  // Test 1d: Password too short (< 8 chars)
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'validndid',
        password: 'short',
      });
    },
    (err) => err instanceof ValidationError
  );
  assert.equal((await getCounterState(db)).nextNumericValue, 1, 'Counter unchanged after short password');

  // Test 1e: Invalid email format
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'validndid',
        password: 'validpassword123',
        email: 'not-an-email',
      });
    },
    (err) => err instanceof ValidationError
  );
  assert.equal((await getCounterState(db)).nextNumericValue, 1, 'Counter unchanged after invalid email format');
});

test('HARDENING 2: Duplicate NDID does NOT consume CodeID', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  // Setup Owner 0000 with NDID "nhatdang"
  await initializeCounter(db, 1);
  await db.collection('users').doc('0000').set({
    codeId: '0000',
    ndid: 'nhatdang',
    role: 'admin',
    adminLevel: 'owner',
    email: 'nhatdang10.nd@gmail.com',
  });
  await db.collection('ndids').doc('nhatdang').set({
    codeId: '0000',
    status: 'active',
  });

  const counterBefore = await getCounterState(db);
  assert.equal(counterBefore.nextNumericValue, 1);

  // Attempt registration with NDID "nhatdang"
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'nhatdang',
        password: 'password12345',
        email: 'other@example.com',
      });
    },
    (err) => err instanceof IdentifierUnavailableError
  );

  // Verify counter is STILL 1 (zero CodeIDs consumed!)
  const counterAfter = await getCounterState(db);
  assert.equal(counterAfter.nextNumericValue, 1, 'CodeID counter MUST NOT increment on duplicate NDID');
});

test('HARDENING 3: Duplicate email does NOT consume CodeID', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  // Setup Owner 0000 with email "nhatdang10.nd@gmail.com"
  await initializeCounter(db, 1);
  await db.collection('users').doc('0000').set({
    codeId: '0000',
    ndid: 'nhatdang',
    email: 'nhatdang10.nd@gmail.com',
  });
  await db.collection('emails').doc('nhatdang10.nd@gmail.com').set({
    codeId: '0000',
    status: 'active',
  });

  const counterBefore = await getCounterState(db);
  assert.equal(counterBefore.nextNumericValue, 1);

  // Attempt registration with same email but new NDID
  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'new_unique_ndid',
        password: 'password12345',
        email: 'nhatdang10.nd@gmail.com',
      });
    },
    (err) => err instanceof IdentifierUnavailableError
  );

  // Verify counter is STILL 1 (zero CodeIDs consumed!)
  const counterAfter = await getCounterState(db);
  assert.equal(counterAfter.nextNumericValue, 1, 'CodeID counter MUST NOT increment on duplicate Email');
  assert.equal(db._store.has('ndids/new_unique_ndid'), false, 'New NDID mapping was not created');
});

test('HARDENING 4: Invalid Google provisioning does NOT consume CodeID', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await initializeCounter(db, 1);
  const counterBefore = await getCounterState(db);
  assert.equal(counterBefore.nextNumericValue, 1);

  // Case 4a: Missing pending session
  await assert.rejects(
    async () => {
      await provisionGoogleAccount({
        db,
        auth,
        pendingSessionId: 'non_existent_session',
        ndid: 'google_user_1',
      });
    },
    (err) => err instanceof ValidationError
  );
  assert.equal((await getCounterState(db)).nextNumericValue, 1);

  // Case 4b: Expired pending session
  await db.collection('google_pending').doc('expired_ses').set({
    googleSubjectId: 'sub_9999',
    googleEmail: 'test@example.com',
    expiresAtMs: Date.now() - 1000,
  });
  await assert.rejects(
    async () => {
      await provisionGoogleAccount({
        db,
        auth,
        pendingSessionId: 'expired_ses',
        ndid: 'google_user_2',
      });
    },
    (err) => err instanceof ValidationError
  );
  assert.equal((await getCounterState(db)).nextNumericValue, 1);

  // Case 4c: Valid pending session but duplicate NDID
  await db.collection('ndids').doc('taken_ndid').set({ codeId: '0000', status: 'active' });
  await db.collection('google_pending').doc('valid_ses').set({
    googleSubjectId: 'sub_valid_123',
    googleEmail: 'valid_google@example.com',
    expiresAtMs: Date.now() + 60000,
  });
  await assert.rejects(
    async () => {
      await provisionGoogleAccount({
        db,
        auth,
        pendingSessionId: 'valid_ses',
        ndid: 'taken_ndid',
      });
    },
    (err) => err instanceof IdentifierUnavailableError
  );
  assert.equal((await getCounterState(db)).nextNumericValue, 1, 'CodeID counter unchanged on Google duplicate NDID');
});

test('HARDENING 5: Valid registration allocates exactly ONE CodeID with UID === CodeID', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await initializeCounter(db, 1); // 0001 next

  const res = await registerUser({
    db,
    auth,
    ndid: 'alice_01',
    password: 'password12345',
    email: 'alice@example.com',
    displayName: 'Alice Wonder',
  });

  assert.equal(res.success, true);
  assert.equal(res.codeId, '0001');

  // Verify counter incremented by exactly 1
  const counterAfter = await getCounterState(db);
  assert.equal(counterAfter.nextNumericValue, 2);

  // Verify Firebase Auth UID === CodeID
  const authUser = await auth.getUser('0001');
  assert.equal(authUser.uid, '0001');
  assert.equal(authUser.email, 'alice@example.com');

  // Verify Firestore documents
  const userDoc = await db.collection('users').doc('0001').get();
  assert.equal(userDoc.exists, true);
  assert.equal(userDoc.data().codeId, '0001');
  assert.equal(userDoc.data().ndid, 'alice_01');

  // Verify mappings
  const ndidDoc = await db.collection('ndids').doc('alice_01').get();
  assert.equal(ndidDoc.exists, true);
  assert.equal(ndidDoc.data().codeId, '0001');

  const emailDoc = await db.collection('emails').doc('alice@example.com').get();
  assert.equal(emailDoc.exists, true);
  assert.equal(emailDoc.data().codeId, '0001');
});

test('HARDENING 6: Double-submit (idempotent replay) does NOT allocate two CodeIDs', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await initializeCounter(db, 1);
  const idempotencyKey = 'idem_unique_key_12345';

  // First request
  const res1 = await registerUser({
    db,
    auth,
    ndid: 'bob_02',
    password: 'password12345',
    email: 'bob@example.com',
    idempotencyKey,
  });
  assert.equal(res1.success, true);
  assert.equal(res1.codeId, '0001');
  assert.equal((await getCounterState(db)).nextNumericValue, 2);

  // Second request with SAME idempotency key (double submit)
  const res2 = await registerUser({
    db,
    auth,
    ndid: 'bob_02',
    password: 'password12345',
    email: 'bob@example.com',
    idempotencyKey,
  });

  assert.equal(res2.success, true);
  assert.equal(res2.codeId, '0001', 'Replay must return original CodeID');
  assert.equal(res2.idempotentReplay, true);

  // Verify counter is STILL 2 (no second CodeID consumed!)
  assert.equal((await getCounterState(db)).nextNumericValue, 2, 'Double submit must NOT allocate a second CodeID');
});

test('HARDENING 7: Concurrent registrations remain atomic and allocate sequential CodeIDs', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await initializeCounter(db, 1);

  // Run 5 distinct concurrent registrations simultaneously
  const requests = Array.from({ length: 5 }, (_, i) => {
    return registerUser({
      db,
      auth,
      ndid: `concurrent_user_${i}`,
      password: 'password12345',
      email: `concurrent_${i}@example.com`,
    });
  });

  const results = await Promise.all(requests);
  const codeIds = results.map((r) => r.codeId).sort();

  assert.deepEqual(codeIds, ['0001', '0002', '0003', '0004', '0005']);
  assert.equal((await getCounterState(db)).nextNumericValue, 6);

  // Verify every UID === CodeID in auth
  for (const cid of codeIds) {
    const u = await auth.getUser(cid);
    assert.equal(u.uid, cid);
  }
});

test('HARDENING 8: No partial canonical records remain after downstream failure', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await initializeCounter(db, 1);

  // Sabotage auth.createUser to simulate infrastructure failure AFTER CodeID allocation
  const originalCreateUser = auth.createUser;
  auth.createUser = async () => {
    throw new Error('SIMULATED_AUTH_SERVICE_CRASH');
  };

  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'doomed_user',
        password: 'password12345',
        email: 'doomed@example.com',
      });
    },
    (err) => err instanceof RegistrationCompensationError || err.message.includes('SIMULATED_AUTH_SERVICE_CRASH')
  );

  // CodeID 0001 was consumed (creating an intentional gap, as required by project compensation contract)
  assert.equal((await getCounterState(db)).nextNumericValue, 2);

  // Mappings must be RELEASED (compensated) so user can retry
  const ndidDoc = await db.collection('ndids').doc('doomed_user').get();
  assert.equal(ndidDoc.exists, false, 'NDID mapping must be cleaned up on failure');

  const emailDoc = await db.collection('emails').doc('doomed@example.com').get();
  assert.equal(emailDoc.exists, false, 'Email mapping must be cleaned up on failure');

  // No partial users/ doc must exist
  const userDoc = await db.collection('users').doc('0001').get();
  assert.equal(userDoc.exists, false, 'No partial users/ document should remain');

  // No partial Auth record
  assert.equal(auth._users.has('0001'), false, 'No partial Auth account should remain');

  // Restore auth.createUser
  auth.createUser = originalCreateUser;
});

test('HARDENING 9: Existing Owner 0000 integrity check', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  // Create Owner 0000
  await db.collection('users').doc('0000').set({
    codeId: '0000',
    ndid: 'nhatdang',
    role: 'admin',
    adminLevel: 'owner',
    email: 'nhatdang10.nd@gmail.com',
    status: 'active',
  });
  await db.collection('ndids').doc('nhatdang').set({
    codeId: '0000',
    status: 'active',
  });
  await db.collection('emails').doc('nhatdang10.nd@gmail.com').set({
    codeId: '0000',
    status: 'active',
  });
  await auth.createUser({
    uid: '0000',
    email: 'nhatdang10.nd@gmail.com',
    displayName: 'Nhật Đăng',
  });
  await initializeCounter(db, 1);

  // Perform multiple registrations and failed registrations
  try {
    await registerUser({ db, auth, ndid: 'bad_ndid@', password: 'pwd' });
  } catch {}
  try {
    await registerUser({ db, auth, ndid: 'nhatdang', password: 'validpassword123' });
  } catch {}

  const reg1 = await registerUser({
    db,
    auth,
    ndid: 'new_member',
    password: 'validpassword123',
    email: 'new_member@example.com',
  });
  assert.equal(reg1.codeId, '0001');

  // Verify Owner 0000 remains 100% UNTOUCHED
  const ownerDoc = await db.collection('users').doc('0000').get();
  assert.equal(ownerDoc.data().codeId, '0000');
  assert.equal(ownerDoc.data().ndid, 'nhatdang');
  assert.equal(ownerDoc.data().role, 'admin');
  assert.equal(ownerDoc.data().adminLevel, 'owner');

  const ownerAuth = await auth.getUser('0000');
  assert.equal(ownerAuth.uid, '0000');
  assert.equal(ownerAuth.email, 'nhatdang10.nd@gmail.com');
});

test('HARDENING 10: Failure during users/{CodeID} write compensates Auth user and unique mappings', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await initializeCounter(db, 1);

  // Sabotage db.runTransaction ONLY on the second call (Step 6), while first call (Step 4) succeeds
  let txCallCount = 0;
  const originalRunTransaction = db.runTransaction;
  db.runTransaction = async (fn) => {
    txCallCount++;
    if (txCallCount === 2) {
      // Step 6: Fail during users foundation write
      throw new Error('SIMULATED_FIRESTORE_WRITE_ERROR');
    }
    return originalRunTransaction(fn);
  };

  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'user_ten',
        password: 'password12345',
        email: 'user_ten@example.com',
      });
    },
    (err) => err instanceof RegistrationCompensationError || err.message.includes('SIMULATED_FIRESTORE_WRITE_ERROR')
  );

  // Restore db.runTransaction
  db.runTransaction = originalRunTransaction;

  // Counter was incremented (gap = 1)
  assert.equal((await getCounterState(db)).nextNumericValue, 2);

  // Auth user was deleted by compensation
  assert.equal(auth._users.has('0001'), false, 'Auth user 0001 must be deleted by compensation');

  // Firestore user doc was not committed
  assert.equal(db._store.has('users/0001'), false, 'No users/0001 doc should exist');

  // Mappings released
  assert.equal(db._store.has('ndids/user_ten'), false, 'NDID mapping must be released');
  assert.equal(db._store.has('emails/user_ten@example.com'), false, 'Email mapping must be released');

  // Retry with same NDID and email succeeds and allocates next CodeID (0002)
  const retryRes = await registerUser({
    db,
    auth,
    ndid: 'user_ten',
    password: 'password12345',
    email: 'user_ten@example.com',
  });
  assert.equal(retryRes.success, true);
  assert.equal(retryRes.codeId, '0002');
  assert.equal((await auth.getUser('0002')).uid, '0002');
  assert.equal((await db.collection('users').doc('0002').get()).data().ndid, 'user_ten');
});

test('HARDENING 11: Failure after users/{CodeID} write cleans up both Auth and Firestore user foundation', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await initializeCounter(db, 1);

  // Sabotage auth.createCustomToken (Step 7) after users/{CodeID} transaction committed
  const originalCreateCustomToken = auth.createCustomToken;
  auth.createCustomToken = async () => {
    throw new Error('SIMULATED_TOKEN_MINTING_ERROR');
  };

  await assert.rejects(
    async () => {
      await registerUser({
        db,
        auth,
        ndid: 'user_eleven',
        password: 'password12345',
        email: 'user_eleven@example.com',
      });
    },
    (err) => err instanceof RegistrationCompensationError || err.message.includes('SIMULATED_TOKEN_MINTING_ERROR')
  );

  // Restore createCustomToken
  auth.createCustomToken = originalCreateCustomToken;

  // Counter incremented (gap = 1)
  assert.equal((await getCounterState(db)).nextNumericValue, 2);

  // Auth user was compensated
  assert.equal(auth._users.has('0001'), false, 'Auth user 0001 must be deleted');

  // Firestore user doc and private/security were compensated
  assert.equal(db._store.has('users/0001'), false, 'users/0001 doc must be deleted by compensation');
  assert.equal(db._store.has('users/0001/private/security'), false, 'users/0001/private/security must be deleted by compensation');

  // Mappings released
  assert.equal(db._store.has('ndids/user_eleven'), false, 'NDID mapping must be released');
  assert.equal(db._store.has('emails/user_eleven@example.com'), false, 'Email mapping must be released');

  // Retry with same NDID and email succeeds with CodeID 0002
  const retryRes = await registerUser({
    db,
    auth,
    ndid: 'user_eleven',
    password: 'password12345',
    email: 'user_eleven@example.com',
  });
  assert.equal(retryRes.success, true);
  assert.equal(retryRes.codeId, '0002');
});

test('HARDENING 12: Google provisioning post-allocation failure cleans up all resources and preserves pending session', async () => {
  const db = createMockFirestore();
  const auth = createMockAuth();

  await initializeCounter(db, 1);

  await db.collection('google_pending').doc('ses_fail_test').set({
    googleSubjectId: 'sub_test_fail_999',
    googleEmail: 'fail_test@example.com',
    googleDisplayName: 'Fail Test User',
    expiresAtMs: Date.now() + 60000,
  });

  // Sabotage auth.createCustomToken during provisioning
  const originalCreateCustomToken = auth.createCustomToken;
  auth.createCustomToken = async () => {
    throw new Error('SIMULATED_GOOGLE_TOKEN_ERROR');
  };

  await assert.rejects(
    async () => {
      await provisionGoogleAccount({
        db,
        auth,
        pendingSessionId: 'ses_fail_test',
        ndid: 'google_user_fail',
      });
    },
    (err) => err instanceof RegistrationCompensationError || err.message.includes('SIMULATED_GOOGLE_TOKEN_ERROR')
  );

  // Restore auth.createCustomToken
  auth.createCustomToken = originalCreateCustomToken;

  // Counter incremented (gap = 1)
  assert.equal((await getCounterState(db)).nextNumericValue, 2);

  // Resources cleaned up:
  assert.equal(auth._users.has('0001'), false, 'Auth user 0001 must be deleted');
  assert.equal(db._store.has('users/0001'), false, 'users/0001 must be deleted');
  assert.equal(db._store.has('google_identities/sub_test_fail_999'), false, 'google_identities must be released');
  assert.equal(db._store.has('ndids/google_user_fail'), false, 'ndid must be released');
  assert.equal(db._store.has('emails/fail_test@example.com'), false, 'email mapping must be released');

  // Retry with same pending session succeeds with CodeID 0002
  const retryRes = await provisionGoogleAccount({
    db,
    auth,
    pendingSessionId: 'ses_fail_test',
    ndid: 'google_user_fail',
  });
  assert.equal(retryRes.success, true);
  assert.equal(retryRes.codeId, '0002');
  assert.equal((await auth.getUser('0002')).uid, '0002');
  assert.equal(db._store.has('google_identities/sub_test_fail_999'), true);
  assert.equal(db._store.get('google_identities/sub_test_fail_999').codeId, '0002');
});

