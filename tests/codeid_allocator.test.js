/**
 * Automated Tests for CodeID Formatter, Allocator & Database Foundation (Phase 01-C1)
 * 
 * Uses Node.js built-in test runner (node:test) and assertions (node:assert).
 * Runs natively via: node --test tests/codeid_allocator.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  formatCodeId,
  isValidCodeId,
  parseCodeId,
} = require('../functions/src/codeid/format.js');

const {
  COUNTERS_COLLECTION,
  CODE_ID_COUNTER_DOC,
  CounterCorruptedError,
  AllocationError,
  allocateCodeId,
  initializeCounter,
  getCounterState,
  CodeIdAllocator,
} = require('../functions/src/codeid/allocator.js');

const {
  USERS_COLLECTION,
  UserAlreadyExistsError,
  InvariantViolationError,
  createCanonicalUserFoundation,
  getCanonicalUserFoundation,
} = require('../functions/src/database/users.js');

// ============================================================================
// PART 1: PURE FORMATTING & VALIDATION TESTS
// ============================================================================

test('formatCodeId: 0000 starting sequence and 4-digit zero padding', () => {
  assert.strictEqual(formatCodeId(0), '0000');
  assert.strictEqual(formatCodeId(1), '0001');
  assert.strictEqual(formatCodeId(9), '0009');
  assert.strictEqual(formatCodeId(10), '0010');
  assert.strictEqual(formatCodeId(99), '0099');
  assert.strictEqual(formatCodeId(100), '0100');
  assert.strictEqual(formatCodeId(999), '0999');
  assert.strictEqual(formatCodeId(1000), '1000');
  assert.strictEqual(formatCodeId(9999), '9999');
});

test('formatCodeId: 9999 to 10000 boundary and 5+ digit expansion (no fixed max length)', () => {
  assert.strictEqual(formatCodeId(10000), '10000');
  assert.strictEqual(formatCodeId(10001), '10001');
  assert.strictEqual(formatCodeId(99999), '99999');
  assert.strictEqual(formatCodeId(100000), '100000');
  assert.strictEqual(formatCodeId(1234567), '1234567');
});

test('formatCodeId: rejects invalid inputs safely (negative, non-integer, NaN, non-number)', () => {
  assert.throws(() => formatCodeId(-1), RangeError);
  assert.throws(() => formatCodeId(-100), RangeError);
  assert.throws(() => formatCodeId(1.5), RangeError);
  assert.throws(() => formatCodeId(NaN), TypeError);
  assert.throws(() => formatCodeId(Infinity), TypeError);
  assert.throws(() => formatCodeId('0'), TypeError);
  assert.throws(() => formatCodeId(null), TypeError);
  assert.throws(() => formatCodeId(undefined), TypeError);
  assert.throws(() => formatCodeId({}), TypeError);
});

test('isValidCodeId: accepts strictly canonical CodeIDs', () => {
  // 4-digit valid
  assert.strictEqual(isValidCodeId('0000'), true);
  assert.strictEqual(isValidCodeId('0001'), true);
  assert.strictEqual(isValidCodeId('0123'), true);
  assert.strictEqual(isValidCodeId('9999'), true);

  // 5+ digits valid
  assert.strictEqual(isValidCodeId('10000'), true);
  assert.strictEqual(isValidCodeId('10001'), true);
  assert.strictEqual(isValidCodeId('123456'), true);
  assert.strictEqual(isValidCodeId('987654321'), true);
});

test('isValidCodeId: rejects non-canonical and corrupt CodeIDs', () => {
  // Too short (< 4 digits)
  assert.strictEqual(isValidCodeId('0'), false);
  assert.strictEqual(isValidCodeId('1'), false);
  assert.strictEqual(isValidCodeId('01'), false);
  assert.strictEqual(isValidCodeId('001'), false);

  // Leading-zero corruption on 5+ digits
  assert.strictEqual(isValidCodeId('00001'), false);
  assert.strictEqual(isValidCodeId('010000'), false);

  // Non-digit characters
  assert.strictEqual(isValidCodeId('abc'), false);
  assert.strictEqual(isValidCodeId('00a0'), false);
  assert.strictEqual(isValidCodeId('-001'), false);
  assert.strictEqual(isValidCodeId('1.0'), false);

  // Whitespace and special characters
  assert.strictEqual(isValidCodeId(' 0001 '), false);
  assert.strictEqual(isValidCodeId('0000\n'), false);
  assert.strictEqual(isValidCodeId('@0001'), false);

  // Non-strings
  assert.strictEqual(isValidCodeId(0), false);
  assert.strictEqual(isValidCodeId(1000), false);
  assert.strictEqual(isValidCodeId(null), false);
  assert.strictEqual(isValidCodeId(undefined), false);
  assert.strictEqual(isValidCodeId({}), false);
});

test('parseCodeId: converts valid CodeIDs to integer and throws on invalid', () => {
  assert.strictEqual(parseCodeId('0000'), 0);
  assert.strictEqual(parseCodeId('0042'), 42);
  assert.strictEqual(parseCodeId('9999'), 9999);
  assert.strictEqual(parseCodeId('10000'), 10000);

  assert.throws(() => parseCodeId('01'), Error);
  assert.throws(() => parseCodeId('00001'), Error);
  assert.throws(() => parseCodeId('invalid'), Error);
});

// ============================================================================
// PART 2: DETERMINISTIC IN-MEMORY FIRESTORE MOCK
// ============================================================================

/**
 * High-fidelity in-memory Firestore mock with atomic transactional semantics,
 * read-write lock simulation, and concurrency retry support.
 */
class InMemoryFirestore {
  constructor() {
    this.storage = new Map(); // key: "collection/doc" -> { data, version }
    this.version = 0;
  }

  _getKey(collection, docId) {
    return `${collection}/${docId}`;
  }

  collection(colName) {
    const self = this;
    return {
      doc(docId) {
        const key = self._getKey(colName, docId);
        return {
          id: docId,
          path: key,
          async get() {
            const entry = self.storage.get(key);
            return {
              id: docId,
              exists: !!entry,
              data: () => (entry ? JSON.parse(JSON.stringify(entry.data)) : undefined),
            };
          },
          async set(data, options = {}) {
            const existing = self.storage.get(key);
            let merged = { ...data };
            if (options.merge && existing) {
              merged = { ...existing.data, ...data };
            }
            self.version++;
            self.storage.set(key, { data: merged, version: self.version });
          },
          async update(data) {
            const existing = self.storage.get(key);
            if (!existing) {
              throw new Error(`Document not found: ${key}`);
            }
            self.version++;
            self.storage.set(key, { data: { ...existing.data, ...data }, version: self.version });
          },
        };
      },
    };
  }

  async runTransaction(updateFn) {
    const maxRetries = 25;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      const readVersions = new Map();
      const writes = [];

      const tx = {
        async get(docRef) {
          const key = docRef.path;
          const entry = this.parent.storage.get(key);
          const ver = entry ? entry.version : 0;
          readVersions.set(key, ver);

          return {
            id: docRef.id,
            exists: !!entry,
            data: () => (entry ? JSON.parse(JSON.stringify(entry.data)) : undefined),
          };
        },
        set(docRef, data, options = {}) {
          writes.push({ type: 'set', key: docRef.path, data, options });
        },
        update(docRef, data) {
          writes.push({ type: 'update', key: docRef.path, data });
        },
        parent: this,
      };

      try {
        const result = await updateFn(tx);

        // Atomic commit phase with optimistic concurrency check
        let conflict = false;
        for (const [key, readVer] of readVersions.entries()) {
          const currentEntry = this.storage.get(key);
          const currentVer = currentEntry ? currentEntry.version : 0;
          if (currentVer !== readVer) {
            conflict = true;
            break;
          }
        }

        if (conflict) {
          // Add small jitter and retry transaction
          await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 5) + 1));
          continue;
        }

        // Apply all writes atomically
        for (const w of writes) {
          this.version++;
          if (w.type === 'set') {
            const existing = this.storage.get(w.key);
            let merged = { ...w.data };
            if (w.options.merge && existing) {
              merged = { ...existing.data, ...w.data };
            }
            this.storage.set(w.key, { data: merged, version: this.version });
          } else if (w.type === 'update') {
            const existing = this.storage.get(w.key) || { data: {} };
            this.storage.set(w.key, { data: { ...existing.data, ...w.data }, version: this.version });
          }
        }

        return result;
      } catch (err) {
        if (err instanceof CounterCorruptedError) {
          throw err;
        }
        // If conflict or transient, retry
        if (attempt >= maxRetries) {
          throw err;
        }
      }
    }

    throw new Error('Transaction contention limit exceeded');
  }
}

// ============================================================================
// PART 3: ATOMIC CODEID ALLOCATOR INTEGRATION TESTS
// ============================================================================

test('allocateCodeId: initializes counter automatically starting at 0000', async () => {
  const db = new InMemoryFirestore();
  const code0 = await allocateCodeId(db);
  assert.strictEqual(code0, '0000');

  const state = await getCounterState(db);
  assert.strictEqual(state.exists, true);
  assert.strictEqual(state.nextNumericValue, 1);
  assert.strictEqual(state.nextCodeId, '0001');
});

test('allocateCodeId: monotonic sequential increments', async () => {
  const db = new InMemoryFirestore();
  const c0 = await allocateCodeId(db);
  const c1 = await allocateCodeId(db);
  const c2 = await allocateCodeId(db);
  const c3 = await allocateCodeId(db);

  assert.strictEqual(c0, '0000');
  assert.strictEqual(c1, '0001');
  assert.strictEqual(c2, '0002');
  assert.strictEqual(c3, '0003');
});

test('allocateCodeId: crosses 9999 -> 10000 boundary seamlessly', async () => {
  const db = new InMemoryFirestore();
  await initializeCounter(db, 9998);

  const c9998 = await allocateCodeId(db);
  const c9999 = await allocateCodeId(db);
  const c10000 = await allocateCodeId(db);
  const c10001 = await allocateCodeId(db);

  assert.strictEqual(c9998, '9998');
  assert.strictEqual(c9999, '9999');
  assert.strictEqual(c10000, '10000');
  assert.strictEqual(c10001, '10001');
});

test('allocateCodeId: consumed on allocation — never reused even after simulated failed registration', async () => {
  const db = new InMemoryFirestore();

  // Account A allocates 0000 (succeeds)
  const codeA = await allocateCodeId(db);
  assert.strictEqual(codeA, '0000');
  await createCanonicalUserFoundation(db, { codeId: codeA, displayName: 'Account A' });

  // Account B allocates 0001 (registration fails halfway / aborted)
  const codeB = await allocateCodeId(db);
  assert.strictEqual(codeB, '0001');
  // Simulated failure: No user document created for 0001, code is dropped

  // Account C allocates next CodeID
  const codeC = await allocateCodeId(db);
  assert.strictEqual(codeC, '0002');
  await createCanonicalUserFoundation(db, { codeId: codeC, displayName: 'Account C' });

  // Verify: 0001 was consumed and skipped; Account C got 0002; gap is preserved
  const userA = await getCanonicalUserFoundation(db, '0000');
  const userB = await getCanonicalUserFoundation(db, '0001');
  const userC = await getCanonicalUserFoundation(db, '0002');

  assert.notStrictEqual(userA, null);
  assert.strictEqual(userB, null); // 0001 has no user doc
  assert.notStrictEqual(userC, null); // 0002 has user doc
});

test('allocateCodeId: corruption fails safely without random/fallback IDs', async () => {
  const db = new InMemoryFirestore();

  // Case 1: Corrupted negative value
  await db.collection(COUNTERS_COLLECTION).doc(CODE_ID_COUNTER_DOC).set({
    nextNumericValue: -5,
  });

  await assert.rejects(
    async () => {
      await allocateCodeId(db);
    },
    (err) => {
      assert.strictEqual(err.name, 'CounterCorruptedError');
      assert.strictEqual(err.code, 'COUNTER_CORRUPTED');
      return true;
    }
  );

  // Case 2: Corrupted string value
  await db.collection(COUNTERS_COLLECTION).doc(CODE_ID_COUNTER_DOC).set({
    nextNumericValue: 'corrupted_string',
  });

  await assert.rejects(
    async () => {
      await allocateCodeId(db);
    },
    (err) => {
      assert.strictEqual(err.name, 'CounterCorruptedError');
      return true;
    }
  );

  // Case 3: Corrupted decimal value
  await db.collection(COUNTERS_COLLECTION).doc(CODE_ID_COUNTER_DOC).set({
    nextNumericValue: 42.7,
  });

  await assert.rejects(
    async () => {
      await allocateCodeId(db);
    },
    (err) => {
      assert.strictEqual(err.name, 'CounterCorruptedError');
      return true;
    }
  );
});

test('allocateCodeId: concurrency test (100 simultaneous allocations)', async () => {
  const db = new InMemoryFirestore();
  const N = 100;

  // Dispatch 100 concurrent allocation promises
  const promises = Array.from({ length: N }, () => allocateCodeId(db));
  const results = await Promise.all(promises);

  // Assert exactly 100 allocations returned
  assert.strictEqual(results.length, N);

  // Assert uniqueness: every CodeID is unique, no duplicates
  const uniqueSet = new Set(results);
  assert.strictEqual(uniqueSet.size, N);

  // Assert sequential monotonic sequence: from "0000" to "0099"
  const expected = Array.from({ length: N }, (_, i) => formatCodeId(i));
  const sorted = [...results].sort((a, b) => parseCodeId(a) - parseCodeId(b));
  assert.deepStrictEqual(sorted, expected);

  // Counter state after 100 allocations
  const state = await getCounterState(db);
  assert.strictEqual(state.nextNumericValue, 100);
  assert.strictEqual(state.nextCodeId, '0100');
});

// ============================================================================
// PART 4: CANONICAL USER FOUNDATION TESTS
// ============================================================================

test('createCanonicalUserFoundation: establishes users/{CodeID} with doc.id === codeId', async () => {
  const db = new InMemoryFirestore();
  const codeId = await allocateCodeId(db); // "0000"

  const result = await createCanonicalUserFoundation(db, {
    codeId,
    displayName: 'Test User',
    ndid: 'test_user',
    status: 'active',
    role: 'user',
  });

  assert.strictEqual(result.codeId, '0000');
  assert.strictEqual(result.path, 'users/0000');

  const userDoc = await getCanonicalUserFoundation(db, codeId);
  assert.strictEqual(userDoc.codeId, '0000');
  assert.strictEqual(userDoc._id, '0000');
  assert.strictEqual(userDoc.displayName, 'Test User');
  assert.strictEqual(userDoc.ndid, 'test_user');
  assert.strictEqual(userDoc.status, 'active');
  assert.strictEqual(userDoc.role, 'user');
  assert.strictEqual(userDoc.adminLevel, null);
});

test('createCanonicalUserFoundation: rejects duplicate user creation', async () => {
  const db = new InMemoryFirestore();
  const codeId = await allocateCodeId(db);

  await createCanonicalUserFoundation(db, { codeId, displayName: 'User 1' });

  await assert.rejects(
    async () => {
      await createCanonicalUserFoundation(db, { codeId, displayName: 'User 2' });
    },
    (err) => {
      assert.strictEqual(err.name, 'UserAlreadyExistsError');
      return true;
    }
  );
});

test('getCanonicalUserFoundation: enforces doc.id === data.codeId invariant', async () => {
  const db = new InMemoryFirestore();

  // Intentionally inject corrupted document where doc.id != data.codeId
  await db.collection(USERS_COLLECTION).doc('0042').set({
    codeId: '9999', // Mismatched!
    status: 'active',
  });

  await assert.rejects(
    async () => {
      await getCanonicalUserFoundation(db, '0042');
    },
    (err) => {
      assert.strictEqual(err.name, 'InvariantViolationError');
      assert.strictEqual(err.code, 'INVARIANT_VIOLATION');
      return true;
    }
  );
});

test('CodeIdAllocator class: object-oriented wrapper works as expected', async () => {
  const db = new InMemoryFirestore();
  const allocator = new CodeIdAllocator(db);

  const c0 = await allocator.allocate();
  assert.strictEqual(c0, '0000');

  const state = await allocator.getState();
  assert.strictEqual(state.nextNumericValue, 1);
  assert.strictEqual(state.nextCodeId, '0001');

  await allocator.initialize(5000);
  const c5000 = await allocator.allocate();
  assert.strictEqual(c5000, '5000');
});
