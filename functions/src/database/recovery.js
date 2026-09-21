/**
 * Canonical Private Recovery Data Access Service (Phase 01-C5)
 * 
 * Manages isolated, non-client-accessible recovery records under:
 * `users/{CodeID}/private/recovery`
 * 
 * Security Invariants:
 * - NEVER client-readable or client-writable (blocked by Firestore Security Rules `match /private/{doc=**}`).
 * - NEVER contains raw plaintext passwords.
 * - Stores secure hashes of verification codes (SHA-256) and temporary reset tokens.
 * - Enforces short TTLs, strict attempt bounds, and single-use consumption.
 */

'use strict';

const admin = require('firebase-admin');
const { USERS_COLLECTION } = require('./users');
const { PRIVATE_SUBCOLLECTION } = require('./security');

const RECOVERY_DOC_ID = 'recovery';

/**
 * Returns a reference to users/{CodeID}/private/recovery.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {admin.firestore.DocumentReference}
 */
function getRecoveryDocRef(db, codeId) {
  return db
    .collection(USERS_COLLECTION)
    .doc(codeId)
    .collection(PRIVATE_SUBCOLLECTION)
    .doc(RECOVERY_DOC_ID);
}

/**
 * Fetches the private recovery document for a given CodeID.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {admin.firestore.Transaction} [transaction]
 * @returns {Promise<Object | null>}
 */
async function getRecoveryDoc(db, codeId, transaction = null) {
  const docRef = getRecoveryDocRef(db, codeId);
  const snap = transaction ? await transaction.get(docRef) : await docRef.get();
  if (!snap.exists) return null;
  return snap.data();
}

/**
 * Sets/overwrites the private recovery document for a user.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {Object} payload
 * @param {admin.firestore.Transaction} [transaction]
 * @returns {Promise<void>}
 */
async function setRecoveryDoc(db, codeId, payload, transaction = null) {
  const docRef = getRecoveryDocRef(db, codeId);
  if (transaction) {
    transaction.set(docRef, payload);
  } else {
    await docRef.set(payload);
  }
}

/**
 * Updates specific fields of the private recovery document.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {Object} payload
 * @param {admin.firestore.Transaction} [transaction]
 * @returns {Promise<void>}
 */
async function updateRecoveryDoc(db, codeId, payload, transaction = null) {
  const docRef = getRecoveryDocRef(db, codeId);
  if (transaction) {
    transaction.update(docRef, payload);
  } else {
    await docRef.update(payload);
  }
}

/**
 * Deletes the recovery document for a user.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {admin.firestore.Transaction} [transaction]
 * @returns {Promise<void>}
 */
async function deleteRecoveryDoc(db, codeId, transaction = null) {
  const docRef = getRecoveryDocRef(db, codeId);
  if (transaction) {
    transaction.delete(docRef);
  } else {
    await docRef.delete();
  }
}

module.exports = {
  RECOVERY_DOC_ID,
  getRecoveryDocRef,
  getRecoveryDoc,
  setRecoveryDoc,
  updateRecoveryDoc,
  deleteRecoveryDoc,
};
