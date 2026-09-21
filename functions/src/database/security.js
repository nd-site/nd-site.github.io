/**
 * Canonical Private Security Data Access Service (Phase 01-C2)
 * 
 * Manages isolated, non-client-accessible credentials under:
 * `users/{CodeID}/private/security`
 * 
 * Invariants:
 * - NEVER client-readable (blocked by Firestore Security Rules).
 * - NEVER contains plaintext password.
 * - Atomic failed login attempt handling with automatic lockout at 5 failures.
 */

'use strict';

const admin = require('firebase-admin');
const { USERS_COLLECTION } = require('./users');

const PRIVATE_SUBCOLLECTION = 'private';
const SECURITY_DOC_ID = 'security';
const MAX_FAILED_ATTEMPTS = 5;

/**
 * Returns a reference to users/{CodeID}/private/security.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {admin.firestore.DocumentReference}
 */
function getSecurityDocRef(db, codeId) {
  return db.collection(USERS_COLLECTION).doc(codeId).collection(PRIVATE_SUBCOLLECTION).doc(SECURITY_DOC_ID);
}

/**
 * Initializes the private security document for a user.
 * @param {admin.firestore.Firestore} db
 * @param {Object} params
 * @param {string} params.codeId
 * @param {string} params.passwordHash
 * @param {string} params.passwordVersion
 * @param {admin.firestore.Transaction} [params.transaction]
 * @returns {Promise<void>}
 */
async function createPrivateSecurityDoc(db, {
  codeId,
  passwordHash,
  passwordVersion,
  transaction = null,
}) {
  const docRef = getSecurityDocRef(db, codeId);
  const now = admin.firestore.FieldValue.serverTimestamp();

  const payload = {
    passwordHash,
    passwordVersion,
    failedLoginAttempts: 0,
    lockedAt: null,
    lockReason: null,
    lastFailedLoginAt: null,
    lastPasswordChangedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  if (transaction) {
    transaction.set(docRef, payload);
  } else {
    await docRef.set(payload);
  }
}

/**
 * Fetches the private security document for a given CodeID.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {admin.firestore.Transaction} [transaction]
 * @returns {Promise<Object | null>}
 */
async function getPrivateSecurityDoc(db, codeId, transaction = null) {
  const docRef = getSecurityDocRef(db, codeId);
  const snap = transaction ? await transaction.get(docRef) : await docRef.get();
  if (!snap.exists) return null;
  return snap.data();
}

/**
 * Atomically increments failed login attempts and locks the account if reaching limit.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @returns {Promise<{ newCount: number, isLocked: boolean }>}
 */
async function handleFailedLoginAttempt(db, codeId) {
  return db.runTransaction(async (transaction) => {
    const secRef = getSecurityDocRef(db, codeId);
    const userRef = db.collection(USERS_COLLECTION).doc(codeId);

    const [secSnap, userSnap] = await Promise.all([
      transaction.get(secRef),
      transaction.get(userRef),
    ]);

    if (!secSnap.exists) {
      return { newCount: 1, isLocked: false };
    }

    const secData = secSnap.data();
    const currentCount = typeof secData.failedLoginAttempts === 'number' ? secData.failedLoginAttempts : 0;
    const newCount = currentCount + 1;
    const isLocked = newCount >= MAX_FAILED_ATTEMPTS;

    const serverTime = admin.firestore.FieldValue.serverTimestamp();
    const secUpdate = {
      failedLoginAttempts: newCount,
      lastFailedLoginAt: serverTime,
      updatedAt: serverTime,
    };

    if (isLocked) {
      secUpdate.lockedAt = serverTime;
      secUpdate.lockReason = `Quá ${MAX_FAILED_ATTEMPTS} lần đăng nhập không thành công`;
      if (userSnap.exists) {
        transaction.update(userRef, {
          status: 'locked',
          updatedAt: serverTime,
        });
      }
    }

    transaction.update(secRef, secUpdate);
    return { newCount, isLocked };
  });
}

/**
 * Resets failed login attempts to zero on successful login.
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {admin.firestore.Transaction} [transaction]
 * @returns {Promise<void>}
 */
async function resetFailedLoginAttempts(db, codeId, transaction = null) {
  const secRef = getSecurityDocRef(db, codeId);
  const serverTime = admin.firestore.FieldValue.serverTimestamp();
  const updatePayload = {
    failedLoginAttempts: 0,
    updatedAt: serverTime,
  };

  if (transaction) {
    transaction.update(secRef, updatePayload);
  } else {
    await secRef.update(updatePayload);
  }
}

module.exports = {
  PRIVATE_SUBCOLLECTION,
  SECURITY_DOC_ID,
  MAX_FAILED_ATTEMPTS,
  getSecurityDocRef,
  createPrivateSecurityDoc,
  getPrivateSecurityDoc,
  handleFailedLoginAttempt,
  resetFailedLoginAttempts,
};
