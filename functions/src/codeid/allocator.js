/**
 * CodeID Atomic Sequential Allocator (Phase 01-C1)
 * 
 * Rules:
 * - Counter path: counters/code_ids
 * - Internal state: nextNumericValue (starts at 0)
 * - Allocation sequence: 0000, 0001, ..., 9999, 10000, 10001, ...
 * - Concurrency: Safe within Firestore transactions; zero duplicate allocations
 * - Failed registration policy: Once allocated, CodeID is consumed permanently; never recycled
 * - Corruption safety: Throws explicit error on invalid state; NEVER fallbacks to Math.random() or Date.now()
 */

'use strict';

const { admin } = require('../firebase/admin');
const { formatCodeId, isValidCodeId } = require('./format');

const COUNTERS_COLLECTION = 'counters';
const CODE_ID_COUNTER_DOC = 'code_ids';

class CounterCorruptedError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'CounterCorruptedError';
    this.code = 'COUNTER_CORRUPTED';
    this.details = details;
  }
}

class AllocationError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'AllocationError';
    this.code = 'ALLOCATION_FAILED';
    this.originalError = originalError;
  }
}

/**
 * Atomically allocates the next sequential CodeID using a Firestore transaction.
 * 
 * @param {FirebaseFirestore.Firestore} db - Firestore database instance
 * @param {Object} [options] - Optional execution options
 * @param {FirebaseFirestore.Transaction} [options.transaction] - Existing active transaction
 * @returns {Promise<string>} The newly allocated, permanently consumed canonical CodeID
 * @throws {CounterCorruptedError} If counter document has an invalid or corrupted numeric value
 * @throws {AllocationError} If transaction fails
 */
async function allocateCodeId(db, options = {}) {
  if (!db || typeof db.runTransaction !== 'function') {
    throw new TypeError('A valid Firestore database instance is required for allocateCodeId()');
  }

  const counterRef = db.collection(COUNTERS_COLLECTION).doc(CODE_ID_COUNTER_DOC);

  const executeAllocation = async (transaction) => {
    const snap = await transaction.get(counterRef);

    let currentAllocValue = 0;

    if (!snap.exists) {
      // Counter does not exist yet: First allocation is 0 -> "0000"
      currentAllocValue = 0;
      const newNext = 1;

      transaction.set(counterRef, {
        nextNumericValue: newNext,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        initializedBy: 'CodeIdAllocator_AutoInit',
      });
    } else {
      const data = snap.data() || {};
      let nextVal = data.nextNumericValue;

      // Backward compatibility: Support legacy lastNumber if nextNumericValue was not set
      if (nextVal === undefined && typeof data.lastNumber === 'number') {
        nextVal = data.lastNumber + 1;
      }

      // Corruption & Validation check
      if (typeof nextVal !== 'number' || !Number.isFinite(nextVal) || !Number.isInteger(nextVal) || nextVal < 0) {
        throw new CounterCorruptedError(
          `Counter document '${COUNTERS_COLLECTION}/${CODE_ID_COUNTER_DOC}' is corrupted. Expected non-negative integer 'nextNumericValue', found: ${JSON.stringify(nextVal)}`,
          { counterPath: `${COUNTERS_COLLECTION}/${CODE_ID_COUNTER_DOC}`, data }
        );
      }

      currentAllocValue = nextVal;
      const newNext = currentAllocValue + 1;

      transaction.update(counterRef, {
        nextNumericValue: newNext,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Format canonical CodeID string (0 -> "0000", 9999 -> "9999", 10000 -> "10000")
    return formatCodeId(currentAllocValue);
  };

  try {
    if (options && options.transaction) {
      return await executeAllocation(options.transaction);
    }
    return await db.runTransaction(executeAllocation);
  } catch (err) {
    if (err instanceof CounterCorruptedError) {
      throw err;
    }
    throw new AllocationError(`Failed to allocate CodeID atomically: ${err.message}`, err);
  }
}

/**
 * Initializes or resets the counter document with an explicit next value.
 * Useful for bootstrapping or isolated integration testing.
 * 
 * @param {FirebaseFirestore.Firestore} db
 * @param {number} [initialNextValue=0] - The value to allocate next (defaults to 0 -> "0000")
 * @returns {Promise<void>}
 */
async function initializeCounter(db, initialNextValue = 0) {
  if (typeof initialNextValue !== 'number' || !Number.isInteger(initialNextValue) || initialNextValue < 0) {
    throw new TypeError(`initialNextValue must be a non-negative integer, got: ${initialNextValue}`);
  }

  const counterRef = db.collection(COUNTERS_COLLECTION).doc(CODE_ID_COUNTER_DOC);
  await counterRef.set({
    nextNumericValue: initialNextValue,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    initializedBy: 'CodeIdAllocator_ExplicitInit',
  }, { merge: true });
}

/**
 * Inspects current counter status without allocating or modifying state.
 * 
 * @param {FirebaseFirestore.Firestore} db
 * @returns {Promise<{ exists: boolean, nextNumericValue: number|null, nextCodeId: string|null }>}
 */
async function getCounterState(db) {
  const counterRef = db.collection(COUNTERS_COLLECTION).doc(CODE_ID_COUNTER_DOC);
  const snap = await counterRef.get();

  if (!snap.exists) {
    return {
      exists: false,
      nextNumericValue: null,
      nextCodeId: null,
    };
  }

  const data = snap.data() || {};
  let nextVal = data.nextNumericValue;
  if (nextVal === undefined && typeof data.lastNumber === 'number') {
    nextVal = data.lastNumber + 1;
  }

  if (typeof nextVal !== 'number' || !Number.isInteger(nextVal) || nextVal < 0) {
    return {
      exists: true,
      nextNumericValue: nextVal,
      nextCodeId: null,
      isCorrupted: true,
    };
  }

  return {
    exists: true,
    nextNumericValue: nextVal,
    nextCodeId: formatCodeId(nextVal),
    isCorrupted: false,
  };
}

/**
 * Object-oriented wrapper for dependency-injected CodeID management.
 */
class CodeIdAllocator {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Allocates next CodeID.
   * @returns {Promise<string>}
   */
  async allocate() {
    return allocateCodeId(this.db);
  }

  /**
   * Initializes counter.
   * @param {number} [initialNextValue=0]
   */
  async initialize(initialNextValue = 0) {
    return initializeCounter(this.db, initialNextValue);
  }

  /**
   * Gets counter state.
   */
  async getState() {
    return getCounterState(this.db);
  }
}

module.exports = {
  COUNTERS_COLLECTION,
  CODE_ID_COUNTER_DOC,
  CounterCorruptedError,
  AllocationError,
  allocateCodeId,
  initializeCounter,
  getCounterState,
  CodeIdAllocator,
};
