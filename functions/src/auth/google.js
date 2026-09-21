/**
 * Canonical Google Identity Linking Module (Phase 01-C4)
 * 
 * Manages external Google provider identity bindings to canonical CodeID:
 * - google_identities/{googleSubjectId} -> { codeId, provider: "google", email, createdAt, updatedAt }
 * 
 * Strict Security Invariants:
 * 1. googleSubjectId is the stable provider subject identity (Google OAuth 'sub' / provider uid).
 *    Email, NDID, or displayName are NEVER used as mapping keys.
 * 2. Firebase Auth UID strictly equals CodeID (UID === CodeID). Linking Google NEVER alters CodeID.
 * 3. A Google identity can belong to at most ONE CodeID.
 * 4. Duplicate prevention:
 *    - Not linked yet -> linked to current CodeID.
 *    - Linked to current CodeID -> idempotent success (no-op).
 *    - Linked to another CodeID -> rejected with conflict error (NO automatic account merging).
 * 5. Unlinking is BLOCKED if it would leave the account without any login method (requires password).
 * 6. google_identities/ is strictly SERVER-ONLY (client read/write DENY in firestore.rules).
 * 7. Zero provider tokens or client secrets are ever stored in the database.
 */

'use strict';

const admin = require('firebase-admin');
const { USERS_COLLECTION } = require('../database/users');
const { getSecurityDocRef } = require('../database/security');
const { createCanonicalUserFoundation } = require('../database/users');
const { createPrivateSecurityDoc } = require('../database/security');
const { allocateCodeId } = require('../codeid/allocator');
const {
  checkUniqueMappingsAvailableInTransaction,
  writeUniqueMappingsInTransaction,
  reserveUniqueMappingsInTransaction,
  releaseMappingsCompensation,
  releaseUserFoundationCompensation,
} = require('./identity');
const { validateNDID, normalizeNDID } = require('./validation');
const { recordSecurityEvent } = require('./security_events');
const {
  ValidationError,
  InvalidCredentialsError,
  GoogleIdentityAlreadyLinkedError,
  IdentifierUnavailableError,
  RegistrationCompensationError,
} = require('./errors');

const GOOGLE_IDENTITIES_COLLECTION = 'google_identities';
const GOOGLE_PROVIDER_ID = 'google.com';

// Pending Google sessions collection (30-minute TTL, server-only)
const GOOGLE_PENDING_COLLECTION = 'google_pending';
const GOOGLE_PENDING_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Validates Google Subject ID (must be non-empty string).
 * @param {unknown} googleSubjectId
 * @returns {string}
 */
function validateGoogleSubjectId(googleSubjectId) {
  if (typeof googleSubjectId !== 'string' || !googleSubjectId.trim()) {
    throw new ValidationError('Google Subject ID không hợp lệ.');
  }
  return googleSubjectId.trim();
}

/**
 * Links a verified Google identity to an authenticated user's canonical CodeID.
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} [params.auth=null]
 * @param {string} params.codeId - Authenticated user's CodeID
 * @param {string} [params.googleSubjectId] - Verified Google OAuth subject ID
 * @param {string | null} [params.googleEmail=null] - Google verified email
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, codeId: string, googleSubjectId: string, googleEmail: string | null, noOp?: boolean, message: string }>}
 */
async function linkGoogleIdentity({
  db,
  auth = null,
  codeId,
  googleSubjectId: inputSubjectId = null,
  googleEmail: inputEmail = null,
  ip = null,
  userAgent = null,
  options = {},
}) {
  if (!codeId || typeof codeId !== 'string') {
    throw new InvalidCredentialsError('Yêu cầu phiên đăng nhập hợp lệ.');
  }

  let resolvedSubjectId = inputSubjectId;
  let resolvedEmail = inputEmail;

  // If auth is provided, verify or extract provider data from Firebase Auth user record
  if (auth && typeof auth.getUser === 'function') {
    try {
      const userRecord = await auth.getUser(codeId);
      const googleProvider = (userRecord.providerData || []).find(p => p.providerId === GOOGLE_PROVIDER_ID);
      if (googleProvider) {
        if (inputSubjectId && inputSubjectId !== googleProvider.uid) {
          throw new ValidationError('Google Subject ID không khớp với tài khoản đã liên kết.');
        }
        resolvedSubjectId = googleProvider.uid;
        resolvedEmail = resolvedEmail || googleProvider.email || null;
      }
    } catch (err) {
      if (err instanceof ValidationError) throw err;
      console.warn('[linkGoogleIdentity] Error fetching user record from Auth:', err.message);
    }
  }

  const googleSubjectId = validateGoogleSubjectId(resolvedSubjectId);
  const normalizedEmail = resolvedEmail ? resolvedEmail.trim().toLowerCase() : null;

  const txResult = await db.runTransaction(async (transaction) => {
    const userRef = db.collection(USERS_COLLECTION).doc(codeId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists) {
      throw new InvalidCredentialsError('Không tìm thấy tài khoản người dùng.');
    }

    const googleDocRef = db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(googleSubjectId);
    const googleSnap = await transaction.get(googleDocRef);

    if (googleSnap.exists) {
      const existingMapping = googleSnap.data();

      // Case B: Already linked to current CodeID -> Idempotent no-op
      if (existingMapping.codeId === codeId) {
        return {
          success: true,
          codeId,
          googleSubjectId,
          googleEmail: normalizedEmail || existingMapping.email || null,
          noOp: true,
          message: 'Tài khoản Google này đã được liên kết với tài khoản của bạn.',
        };
      }

      // Case C: Linked to another CodeID -> CONFLICT
      // Revert/clean up Google provider on this user in Firebase Auth if needed
      if (auth && typeof auth.updateUser === 'function') {
        try {
          await auth.updateUser(codeId, { providersToUnlink: [GOOGLE_PROVIDER_ID] });
        } catch (_) {}
      }

      await recordSecurityEvent(db, {
        eventType: 'google_link_failed',
        actorCodeID: codeId,
        targetCodeID: codeId,
        ip,
        userAgent,
        details: {
          reason: 'identity_already_linked_to_other_account',
          conflictingCodeId: existingMapping.codeId,
        },
      });

      throw new GoogleIdentityAlreadyLinkedError('Tài khoản Google này đã được liên kết với một tài khoản khác.');
    }

    // Case A: Identity not yet linked -> Bind to current CodeID
    const serverTime = admin.firestore.FieldValue.serverTimestamp();

    // 1. Write server-only mapping
    transaction.set(googleDocRef, {
      codeId,
      googleSubjectId,
      provider: 'google',
      email: normalizedEmail,
      createdAt: serverTime,
      updatedAt: serverTime,
    });

    // 2. Update user profile with Google metadata (CodeID remains 100% immutable)
    transaction.update(userRef, {
      googleSubjectId,
      googleEmail: normalizedEmail,
      updatedAt: serverTime,
    });

    // 3. Log security audit event
    await recordSecurityEvent(db, {
      eventType: 'google_identity_linked',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: {
        googleSubjectId,
        googleEmail: normalizedEmail,
      },
      transaction,
    });

    return {
      success: true,
      codeId,
      googleSubjectId,
      googleEmail: normalizedEmail,
      message: 'Liên kết tài khoản Google thành công.',
    };
  });

  // Security notification email (Phase 01-C10-FINAL)
  if (!txResult.noOp) {
    try {
      const userSnap = await db.collection(USERS_COLLECTION).doc(codeId).get();
      if (userSnap.exists) {
        const uData = userSnap.data();
        const targetEmail = uData.email || normalizedEmail;
        if (targetEmail) {
          const { defaultEmailService } = require('../email/email_service');
          const emailSvc = options.emailService || defaultEmailService;
          const nowFormatted = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
          await emailSvc.sendGoogleLinkedEmail({
            toEmail: targetEmail,
            ndid: uData.ndid || 'bạn',
            codeId,
            googleEmail: normalizedEmail,
            eventTime: nowFormatted,
            ipMasked: ip,
          });
        }
      }
    } catch (secEmailErr) {
      console.warn('[linkGoogleIdentity] Security notification email warning:', secEmailErr.message);
    }
  }

  return txResult;
}

/**
 * Unlinks a Google identity from an authenticated user's canonical CodeID.
 * Enforces policy: account MUST retain at least one alternative login method (password).
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} [params.auth=null]
 * @param {string} params.codeId - Authenticated user's CodeID
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, codeId: string, message: string, noOp?: boolean }>}
 */
async function unlinkGoogleIdentity({
  db,
  auth = null,
  codeId,
  ip = null,
  userAgent = null,
  options = {},
}) {
  if (!codeId || typeof codeId !== 'string') {
    throw new InvalidCredentialsError('Yêu cầu phiên đăng nhập hợp lệ.');
  }

  // 1. Guard against account lockout: verify user has a registered password
  const secRef = getSecurityDocRef(db, codeId);
  const secSnap = await secRef.get();

  if (!secSnap.exists || !secSnap.data() || !secSnap.data().passwordHash) {
    throw new ValidationError('Không thể hủy liên kết Google vì tài khoản chưa thiết lập mật khẩu đăng nhập. Vui lòng thiết lập mật khẩu trước khi hủy liên kết.');
  }

  const txResult = await db.runTransaction(async (transaction) => {
    const userRef = db.collection(USERS_COLLECTION).doc(codeId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists) {
      throw new InvalidCredentialsError('Không tìm thấy tài khoản người dùng.');
    }

    const userData = userSnap.data();
    let googleSubjectId = userData.googleSubjectId;

    // If not stored on user doc, look up from Auth user record
    if (!googleSubjectId && auth && typeof auth.getUser === 'function') {
      try {
        const userRecord = await auth.getUser(codeId);
        const googleProvider = (userRecord.providerData || []).find(p => p.providerId === GOOGLE_PROVIDER_ID);
        if (googleProvider) {
          googleSubjectId = googleProvider.uid;
        }
      } catch (_) {}
    }

    if (!googleSubjectId && !userData.googleEmail) {
      return {
        success: true,
        codeId,
        noOp: true,
        message: 'Tài khoản chưa liên kết với Google.',
      };
    }

    const serverTime = admin.firestore.FieldValue.serverTimestamp();

    // 2. Delete mapping if subject ID is known
    if (googleSubjectId) {
      const googleDocRef = db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(googleSubjectId);
      transaction.delete(googleDocRef);
    }

    // 3. Clear Google metadata on user doc
    transaction.update(userRef, {
      googleSubjectId: null,
      googleEmail: null,
      updatedAt: serverTime,
    });

    // 4. Log audit event
    await recordSecurityEvent(db, {
      eventType: 'google_identity_unlinked',
      actorCodeID: codeId,
      targetCodeID: codeId,
      ip,
      userAgent,
      details: {
        unlinkedGoogleSubjectId: googleSubjectId || null,
      },
      transaction,
    });

    // 5. Unlink provider in Firebase Auth
    if (auth && typeof auth.updateUser === 'function') {
      try {
        await auth.updateUser(codeId, { providersToUnlink: [GOOGLE_PROVIDER_ID] });
      } catch (authErr) {
        console.warn('[unlinkGoogleIdentity] Auth provider unlink warning:', authErr.message);
      }
    }

    return {
      success: true,
      codeId,
      message: 'Đã hủy liên kết Google thành công.',
    };
  });

  // Security notification email (Phase 01-C10-FINAL)
  if (!txResult.noOp) {
    try {
      const userSnap = await db.collection(USERS_COLLECTION).doc(codeId).get();
      if (userSnap.exists) {
        const uData = userSnap.data();
        if (uData.email) {
          const { defaultEmailService } = require('../email/email_service');
          const emailSvc = options.emailService || defaultEmailService;
          const nowFormatted = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
          await emailSvc.sendGoogleUnlinkedEmail({
            toEmail: uData.email,
            ndid: uData.ndid || 'bạn',
            codeId,
            eventTime: nowFormatted,
            ipMasked: ip,
          });
        }
      }
    } catch (secEmailErr) {
      console.warn('[unlinkGoogleIdentity] Security notification email warning:', secEmailErr.message);
    }
  }

  return txResult;
}

/**
 * Resolves a Google Subject ID to its owning CodeID.
 * @param {admin.firestore.Firestore} db
 * @param {string} googleSubjectId
 * @param {admin.firestore.Transaction} [transaction=null]
 * @returns {Promise<{ codeId: string, email: string | null } | null>}
 */
async function resolveGoogleSubjectToCodeId(db, googleSubjectId, transaction = null) {
  if (typeof googleSubjectId !== 'string' || !googleSubjectId.trim()) {
    return null;
  }
  const cleanId = googleSubjectId.trim();
  const docRef = db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(cleanId);
  const snap = transaction ? await transaction.get(docRef) : await docRef.get();
  if (!snap.exists) return null;
  const data = snap.data();
  return {
    codeId: data.codeId,
    email: data.email || null,
  };
}

/**
 * Creates a server-side pending Google session for first-time Google login provisioning.
 * Returns a sessionId that the client uses to submit NDID choice.
 * @param {admin.firestore.Firestore} db
 * @param {{ googleSubjectId: string, googleEmail: string | null, googleDisplayName: string | null }} params
 * @returns {Promise<{ pendingSessionId: string, expiresAt: number }>}
 */
async function createGooglePendingSession(db, { googleSubjectId, googleEmail = null, googleDisplayName = null }) {
  const validatedSubjectId = validateGoogleSubjectId(googleSubjectId);
  const sessionId = `gp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  const expiresAt = now + GOOGLE_PENDING_TTL_MS;

  await db.collection(GOOGLE_PENDING_COLLECTION).doc(sessionId).set({
    googleSubjectId: validatedSubjectId,
    googleEmail: googleEmail ? googleEmail.trim().toLowerCase() : null,
    googleDisplayName: googleDisplayName || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAtMs: now,
    expiresAtMs: expiresAt,
  });

  return { pendingSessionId: sessionId, expiresAt };
}

/**
 * Provisions a new canonical account for a first-time Google login.
 * Enforces: Firebase Auth UID === CodeID, canonical google_identities mapping.
 * Uses the same compensation strategy as registerUser.
 *
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} params.auth
 * @param {string} params.pendingSessionId - Session ID returned by createGooglePendingSession
 * @param {string} params.ndid - User-chosen NDID (validated with canonical NDID_REGEX)
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, codeId: string, customToken: string, user: Object }>}
 */
async function provisionGoogleAccount({
  db,
  auth,
  pendingSessionId,
  ndid,
  ip = null,
  userAgent = null,
}) {
  // 1. Retrieve and validate pending session
  if (!pendingSessionId || typeof pendingSessionId !== 'string') {
    throw new ValidationError('Phiên xác thực Google không hợp lệ.');
  }
  const pendingRef = db.collection(GOOGLE_PENDING_COLLECTION).doc(pendingSessionId);
  const pendingSnap = await pendingRef.get();
  if (!pendingSnap.exists) {
    throw new ValidationError('Phiên xác thực Google đã hết hạn hoặc không tồn tại. Vui lòng đăng nhập lại.');
  }
  const pending = pendingSnap.data();
  if (Date.now() > pending.expiresAtMs) {
    await pendingRef.delete().catch(() => {});
    throw new ValidationError('Phiên xác thực Google đã hết hạn (30 phút). Vui lòng đăng nhập lại.');
  }

  const googleSubjectId = pending.googleSubjectId;
  const googleEmail = pending.googleEmail || null;
  const googleDisplayName = pending.googleDisplayName || null;

  // 2. Check if google identity was provisioned while this pending session was active
  const existingMapping = await resolveGoogleSubjectToCodeId(db, googleSubjectId);
  if (existingMapping && existingMapping.codeId) {
    // Already provisioned — delete pending session and return existing account info
    await pendingRef.delete().catch(() => {});
    const userDoc = await db.collection(USERS_COLLECTION).doc(existingMapping.codeId).get();
    if (!userDoc.exists) {
      throw new InvalidCredentialsError('Thông tin đăng nhập không hợp lệ.');
    }
    const customToken = await auth.createCustomToken(existingMapping.codeId);
    return {
      success: true,
      codeId: existingMapping.codeId,
      customToken,
      user: {
        codeId: existingMapping.codeId,
        ndid: userDoc.data().ndid || '',
        displayName: userDoc.data().displayName || userDoc.data().name || '',
        role: userDoc.data().role || 'user',
        adminLevel: userDoc.data().adminLevel || null,
      },
    };
  }

  // 3. Validate NDID input (canonical validator — no admin bypass)
  const rawNDID = validateNDID(ndid);
  const normalizedNDID = normalizeNDID(rawNDID);
  const normalizedGoogleEmail = googleEmail ? googleEmail.trim().toLowerCase() : null;

  // Derive display name from Google display name or NDID
  const displayName = googleDisplayName
    ? googleDisplayName.trim().slice(0, 50)
    : rawNDID;

  // 3b. Preliminary availability pre-check (Fail-fast before allocation)
  await checkUniqueMappingsAvailableInTransaction(db, {
    normalizedNDID,
    normalizedEmail: normalizedGoogleEmail,
  });

  // 4. Allocate CodeID + reserve NDID/email mappings atomically
  let allocatedCodeId = null;
  try {
    allocatedCodeId = await db.runTransaction(async (transaction) => {
      // Check google_identities again inside transaction (double-check)
      const googleDocRef = db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(googleSubjectId);
      const googleSnap = await transaction.get(googleDocRef);
      if (googleSnap.exists) {
        // Race condition: already provisioned
        throw Object.assign(new Error('ALREADY_PROVISIONED'), { codeId: googleSnap.data().codeId });
      }

      // STEP 4A: Check NDID and Email unique mappings FIRST inside transaction
      // Throws IdentifierUnavailableError BEFORE CodeID allocation if collision occurs!
      await checkUniqueMappingsAvailableInTransaction(db, {
        normalizedNDID,
        normalizedEmail: normalizedGoogleEmail,
        transaction,
      });

      // STEP 4B: Allocate CodeID ONLY after all checks succeed!
      const codeId = await allocateCodeId(db, { transaction });

      // STEP 4C: Write unique mappings
      writeUniqueMappingsInTransaction(db, {
        codeId,
        normalizedNDID,
        normalizedEmail: normalizedGoogleEmail,
        transaction,
      });

      return codeId;
    });
  } catch (err) {
    if (err.message === 'ALREADY_PROVISIONED') {
      // Another concurrent request provisioned this account — return existing
      await pendingRef.delete().catch(() => {});
      const customToken = await auth.createCustomToken(err.codeId);
      return { success: true, codeId: err.codeId, customToken, user: { codeId: err.codeId } };
    }
    throw err;
  }

  // CodeID is permanently consumed from this point.
  let authUserCreated = false;
  let userDocCreated = false;

  try {
    // 5. Create Firebase Auth user with UID === CodeID
    await auth.createUser({
      uid: allocatedCodeId,
      email: googleEmail || undefined,
      displayName: displayName,
      disabled: false,
    });
    authUserCreated = true;

    // 6. Establish canonical Firestore documents in a transaction
    const serverTime = admin.firestore.FieldValue.serverTimestamp();
    await db.runTransaction(async (transaction) => {
      // Canonical user profile (users/{CodeID})
      await createCanonicalUserFoundation(
        db,
        {
          codeId: allocatedCodeId,
          ndid: rawNDID,
          email: googleEmail,
          emailVerified: Boolean(googleEmail), // Google email is pre-verified
          displayName,
          name: displayName,
          status: 'active',
          role: 'user',
          adminLevel: null,
          googleLinked: true,
          googleSubjectId,
          googleEmail,
        },
        transaction
      );

      // Private security doc (no passwordHash for Google-only accounts)
      await createPrivateSecurityDoc(db, {
        codeId: allocatedCodeId,
        passwordHash: null,
        passwordVersion: null,
        transaction,
      });

      // google_identities mapping
      const googleDocRef = db.collection(GOOGLE_IDENTITIES_COLLECTION).doc(googleSubjectId);
      transaction.set(googleDocRef, {
        codeId: allocatedCodeId,
        googleSubjectId,
        provider: 'google',
        email: googleEmail,
        createdAt: serverTime,
        updatedAt: serverTime,
      });
    });
    userDocCreated = true;

    // 7. Mint Firebase Custom Token (UID === CodeID)
    const customToken = await auth.createCustomToken(allocatedCodeId);

    // 8. Delete pending session (cleanup after full provisioning success)
    await pendingRef.delete().catch(() => {});

    // 9. Audit log
    await recordSecurityEvent(db, {
      eventType: 'google_account_provisioned',
      actorCodeID: allocatedCodeId,
      targetCodeID: allocatedCodeId,
      ip,
      userAgent,
      details: {
        ndid: normalizedNDID,
        googleSubjectId,
        hasEmail: Boolean(googleEmail),
      },
    });

    return {
      success: true,
      codeId: allocatedCodeId,
      customToken,
      user: {
        codeId: allocatedCodeId,
        ndid: rawNDID,
        displayName,
        email: googleEmail,
        role: 'user',
        adminLevel: null,
        status: 'active',
        googleLinked: true,
      },
    };
  } catch (err) {
    // ── COMPENSATION ────────────────────────────────────────────────────────
    // CodeID is intentionally NOT recycled.
    if (authUserCreated) {
      try { await auth.deleteUser(allocatedCodeId); } catch (_) {}
    }
    if (userDocCreated) {
      try { await releaseUserFoundationCompensation(db, allocatedCodeId); } catch (_) {}
    }
    try {
      await releaseMappingsCompensation(db, {
        normalizedNDID,
        normalizedEmail: googleEmail || null,
        googleSubjectId: userDocCreated ? googleSubjectId : null,
      });
    } catch (_) {}

    await recordSecurityEvent(db, {
      eventType: 'google_provision_failed',
      actorCodeID: allocatedCodeId || 'unknown',
      targetCodeID: allocatedCodeId || 'unknown',
      ip,
      userAgent,
      details: { error: err.message, codeIdConsumed: Boolean(allocatedCodeId) },
    }).catch(() => {});

    if (err instanceof IdentifierUnavailableError) throw err;
    throw new RegistrationCompensationError(
      'Quá trình tạo tài khoản Google gặp sự cố. Vui lòng thử lại.',
      { originalError: err.message, codeId: allocatedCodeId }
    );
  }
}

module.exports = {
  GOOGLE_IDENTITIES_COLLECTION,
  GOOGLE_PENDING_COLLECTION,
  GOOGLE_PROVIDER_ID,
  validateGoogleSubjectId,
  linkGoogleIdentity,
  unlinkGoogleIdentity,
  resolveGoogleSubjectToCodeId,
  createGooglePendingSession,
  provisionGoogleAccount,
};
