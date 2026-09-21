/**
 * Canonical Identity & Unique Mapping Service (Phase 01-C2)
 * 
 * Manages unique resolution indices for:
 * - ndids/{normalizedNDID} -> { codeId, status, createdAt, updatedAt }
 * - emails/{normalizedEmail} -> { codeId, status, createdAt, updatedAt }
 * 
 * These collections are strictly server-side (read/write false for clients)
 * to enforce anti-enumeration and prevent race condition collisions.
 */

'use strict';

const admin = require('firebase-admin');
const { normalizeNDID, normalizeEmail } = require('./validation');
const { IdentifierUnavailableError } = require('./errors');

const NDIDS_COLLECTION = 'ndids';
const EMAILS_COLLECTION = 'emails';

/**
 * Resolves an arbitrary login identifier (NDID or email) to its owning CodeID.
 * @param {admin.firestore.Firestore} db
 * @param {string} identifier
 * @param {admin.firestore.Transaction} [transaction]
 * @returns {Promise<{ codeId: string, type: 'email' | 'ndid', normalizedKey: string } | null>}
 */
async function resolveIdentifierToCodeId(db, identifier, transaction = null) {
  if (typeof identifier !== 'string' || !identifier.trim()) {
    return null;
  }

  const isEmail = identifier.includes('@');
  if (isEmail) {
    let normalized;
    try {
      normalized = normalizeEmail(identifier);
    } catch {
      return null;
    }
    const docRef = db.collection(EMAILS_COLLECTION).doc(normalized);
    const snap = transaction ? await transaction.get(docRef) : await docRef.get();
    if (!snap.exists) return null;
    const data = snap.data();
    if (data.status && data.status !== 'active') return null;
    return { codeId: data.codeId, type: 'email', normalizedKey: normalized };
  } else {
    let normalized;
    try {
      normalized = normalizeNDID(identifier);
    } catch {
      return null;
    }
    const docRef = db.collection(NDIDS_COLLECTION).doc(normalized);
    const snap = transaction ? await transaction.get(docRef) : await docRef.get();
    if (!snap.exists) return null;
    const data = snap.data();
    if (data.status && data.status !== 'active') return null;
    return { codeId: data.codeId, type: 'ndid', normalizedKey: normalized };
  }
}

/**
 * Checks if an NDID is available for registration inside a transaction.
 * @param {admin.firestore.Firestore} db
 * @param {string} normalizedNDID
 * @param {admin.firestore.Transaction} transaction
 * @returns {Promise<boolean>}
 */
async function isNDIDAvailable(db, normalizedNDID, transaction) {
  const docRef = db.collection(NDIDS_COLLECTION).doc(normalizedNDID);
  const snap = await transaction.get(docRef);
  if (!snap.exists) return true;
  const data = snap.data();
  return data.status === 'available';
}

/**
 * Checks if an email is available for registration inside a transaction.
 * @param {admin.firestore.Firestore} db
 * @param {string} normalizedEmail
 * @param {admin.firestore.Transaction} transaction
 * @returns {Promise<boolean>}
 */
async function isEmailAvailable(db, normalizedEmail, transaction) {
  const docRef = db.collection(EMAILS_COLLECTION).doc(normalizedEmail);
  const snap = await transaction.get(docRef);
  if (!snap.exists) return true;
  const data = snap.data();
  return data.status === 'available';
}

/**
 * Checks that NDID and optional Email are available inside an existing transaction or direct query.
 * Throws IdentifierUnavailableError BEFORE any CodeID allocation happens.
 * @param {admin.firestore.Firestore} db
 * @param {Object} params
 * @param {string} params.normalizedNDID
 * @param {string | null} [params.normalizedEmail]
 * @param {admin.firestore.Transaction} [params.transaction]
 * @throws {IdentifierUnavailableError}
 */
async function checkUniqueMappingsAvailableInTransaction(db, { normalizedNDID, normalizedEmail = null, transaction = null }) {
  const ndidRef = db.collection(NDIDS_COLLECTION).doc(normalizedNDID);
  const ndidSnap = transaction ? await transaction.get(ndidRef) : await ndidRef.get();
  if (ndidSnap.exists && ndidSnap.data().status !== 'available') {
    throw new IdentifierUnavailableError('Tên tài khoản hoặc email đã được sử dụng.');
  }

  if (normalizedEmail) {
    const emailRef = db.collection(EMAILS_COLLECTION).doc(normalizedEmail);
    const emailSnap = transaction ? await transaction.get(emailRef) : await emailRef.get();
    if (emailSnap.exists && emailSnap.data().status !== 'available') {
      throw new IdentifierUnavailableError('Tên tài khoản hoặc email đã được sử dụng.');
    }
  }
}

/**
 * Writes NDID and optional Email mappings inside an active transaction.
 * MUST be called only after CodeID has been allocated and mappings confirmed available.
 * @param {admin.firestore.Firestore} db
 * @param {Object} params
 * @param {string} params.codeId
 * @param {string} params.normalizedNDID
 * @param {string | null} [params.normalizedEmail]
 * @param {admin.firestore.Transaction} params.transaction
 */
function writeUniqueMappingsInTransaction(db, { codeId, normalizedNDID, normalizedEmail = null, transaction }) {
  const ndidRef = db.collection(NDIDS_COLLECTION).doc(normalizedNDID);
  const serverTime = admin.firestore.FieldValue.serverTimestamp();

  transaction.set(ndidRef, {
    codeId,
    status: 'active',
    createdAt: serverTime,
    updatedAt: serverTime,
  });

  if (normalizedEmail) {
    const emailRef = db.collection(EMAILS_COLLECTION).doc(normalizedEmail);
    transaction.set(emailRef, {
      codeId,
      status: 'active',
      createdAt: serverTime,
      updatedAt: serverTime,
    });
  }
}

/**
 * Atomically reserves NDID and optional Email inside an existing transaction.
 * Performs availability check BEFORE writing.
 * @param {admin.firestore.Firestore} db
 * @param {Object} params
 * @param {string} params.codeId
 * @param {string} params.normalizedNDID
 * @param {string | null} [params.normalizedEmail]
 * @param {admin.firestore.Transaction} params.transaction
 * @throws {IdentifierUnavailableError}
 */
async function reserveUniqueMappingsInTransaction(db, { codeId, normalizedNDID, normalizedEmail = null, transaction }) {
  await checkUniqueMappingsAvailableInTransaction(db, { normalizedNDID, normalizedEmail, transaction });
  writeUniqueMappingsInTransaction(db, { codeId, normalizedNDID, normalizedEmail, transaction });
}

/**
 * Removes unique mappings as compensation if downstream registration steps fail.
 * @param {admin.firestore.Firestore} db
 * @param {Object} params
 * @param {string} [params.normalizedNDID]
 * @param {string | null} [params.normalizedEmail]
 * @param {string | null} [params.googleSubjectId]
 * @returns {Promise<void>}
 */
async function releaseMappingsCompensation(db, { normalizedNDID = null, normalizedEmail = null, googleSubjectId = null }) {
  const batch = db.batch();
  if (normalizedNDID) {
    batch.delete(db.collection(NDIDS_COLLECTION).doc(normalizedNDID));
  }
  if (normalizedEmail) {
    batch.delete(db.collection(EMAILS_COLLECTION).doc(normalizedEmail));
  }
  if (googleSubjectId) {
    batch.delete(db.collection('google_identities').doc(googleSubjectId));
  }
  await batch.commit();
}

/**
 * Removes user profile foundation and security subcollection as compensation
 * if post-allocation downstream steps fail, avoiding orphan Firestore documents.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {Promise<void>}
 */
async function releaseUserFoundationCompensation(db, codeId) {
  if (!codeId) return;
  const batch = db.batch();
  const userRef = db.collection('users').doc(codeId);
  const secRef = userRef.collection('private').doc('security');
  batch.delete(secRef);
  batch.delete(userRef);
  await batch.commit();
}

module.exports = {
  NDIDS_COLLECTION,
  EMAILS_COLLECTION,
  resolveIdentifierToCodeId,
  isNDIDAvailable,
  isEmailAvailable,
  checkUniqueMappingsAvailableInTransaction,
  writeUniqueMappingsInTransaction,
  reserveUniqueMappingsInTransaction,
  releaseMappingsCompensation,
  releaseUserFoundationCompensation,
};
