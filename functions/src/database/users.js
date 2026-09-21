/**
 * Canonical User Document Foundation Helper (Phase 01-C1)
 * 
 * Rules:
 * - Document path: users/{CodeID}
 * - Invariant: document ID === data.codeId (strictly enforced)
 * - CodeID is immutable and cannot be updated
 * - Creates foundation profile document for canonical accounts
 */

'use strict';

const { admin } = require('../firebase/admin');
const { isValidCodeId } = require('../codeid/format');

const USERS_COLLECTION = 'users';

class UserAlreadyExistsError extends Error {
  constructor(codeId) {
    super(`Canonical user document 'users/${codeId}' already exists.`);
    this.name = 'UserAlreadyExistsError';
    this.code = 'USER_ALREADY_EXISTS';
    this.codeId = codeId;
  }
}

class InvariantViolationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'InvariantViolationError';
    this.code = 'INVARIANT_VIOLATION';
    this.details = details;
  }
}

/**
 * Creates the foundation document for a canonical user under users/{CodeID}.
 * Enforces doc.id === data.codeId.
 * 
 * @param {FirebaseFirestore.Firestore} db
 * @param {Object} params
 * @param {string} params.codeId - Canonical CodeID (e.g. "0000", "10042")
 * @param {string} [params.status='active'] - Account status
 * @param {string} [params.role='user'] - Primary role ('user' | 'admin')
 * @param {string|null} [params.adminLevel=null] - Admin hierarchy ('owner' | 'admin' | null)
 * @param {string} [params.displayName]
 * @param {string} [params.ndid]
 * @param {string} [params.email]
 * @param {boolean} [params.emailVerified=false]
 * @param {string} [params.photoURL]
 * @param {string} [params.grade]
 * @param {string} [params.school]
 * @param {string} [params.eduRole]
 * @param {FirebaseFirestore.Transaction} [transaction] - Optional transaction to execute write within
 * @returns {Promise<{ codeId: string, path: string }>}
 */
async function createCanonicalUserFoundation(db, params, transaction = null) {
  const {
    codeId,
    status = 'active',
    role = 'user',
    adminLevel = null,
    displayName,
    ndid,
    email,
    emailVerified = false,
    photoURL = null,
    grade = null,
    school = null,
    eduRole = null,
  } = params;

  if (!isValidCodeId(codeId)) {
    throw new Error(`Cannot create user document: '${codeId}' is not a valid canonical CodeID.`);
  }

  const userRef = db.collection(USERS_COLLECTION).doc(codeId);

  const writeOperation = async (tx) => {
    const snap = tx ? await tx.get(userRef) : await userRef.get();
    if (snap.exists) {
      throw new UserAlreadyExistsError(codeId);
    }

    const payload = {
      codeId: codeId, // Invariant: matches doc.id
      status,
      role,
      adminLevel,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null,
      googleLinked: false,
    };

    if (displayName) {
      payload.displayName = displayName;
      payload.name = displayName;
    }
    if (ndid) payload.ndid = ndid;
    if (email) {
      payload.email = email;
      payload.emailVerified = !!emailVerified;
    }
    if (photoURL) payload.photoURL = photoURL;
    if (grade) payload.grade = grade;
    if (school) payload.school = school;
    if (eduRole) payload.eduRole = eduRole;

    if (tx) {
      tx.set(userRef, payload);
    } else {
      await userRef.set(payload);
    }

    return {
      codeId,
      path: `users/${codeId}`,
    };
  };

  if (transaction) {
    return writeOperation(transaction);
  }
  return writeOperation(null);
}

/**
 * Loads a canonical user document and verifies the invariant: doc.id === data.codeId.
 * 
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} codeId
 * @returns {Promise<Object|null>}
 */
async function getCanonicalUserFoundation(db, codeId) {
  if (!isValidCodeId(codeId)) {
    throw new Error(`Invalid canonical CodeID: '${codeId}'`);
  }

  const snap = await db.collection(USERS_COLLECTION).doc(codeId).get();
  if (!snap.exists) {
    return null;
  }

  const data = snap.data() || {};

  // INVARIANT VERIFICATION
  if (snap.id !== data.codeId) {
    throw new InvariantViolationError(
      `CRITICAL INVARIANT VIOLATION: Document ID 'users/${snap.id}' does not match payload codeId '${data.codeId}'`,
      { docId: snap.id, payloadCodeId: data.codeId }
    );
  }

  return {
    ...data,
    _id: snap.id,
  };
}

/**
 * Fast check for CodeID existence in users collection.
 * 
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} codeId
 * @returns {Promise<boolean>}
 */
async function isCodeIdExisting(db, codeId) {
  if (!isValidCodeId(codeId)) return false;
  const snap = await db.collection(USERS_COLLECTION).doc(codeId).get();
  return snap.exists;
}

module.exports = {
  USERS_COLLECTION,
  UserAlreadyExistsError,
  InvariantViolationError,
  createCanonicalUserFoundation,
  getCanonicalUserFoundation,
  isCodeIdExisting,
};
