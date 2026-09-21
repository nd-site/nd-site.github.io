/**
 * Canonical Registration Orchestration Service (Phase 01-C2)
 * 
 * Implements an orchestrated, compensating registration workflow that coordinates:
 * 1. Input validation & strict normalization (NDID, email, password, name).
 * 2. Atomic reservation of unique NDID and Email keys in Firestore transaction.
 * 3. Atomic sequential CodeID allocation (consumed permanently upon issuance).
 * 4. Password hashing via centralized bcrypt-v1 service.
 * 5. Firebase Auth user creation with UID === CodeID.
 * 6. Canonical Firestore document establishment:
 *    - users/{CodeID} (Foundation Profile)
 *    - users/{CodeID}/private/security (Isolated Credentials)
 * 7. Minting Firebase Custom Token (UID === CodeID).
 * 8. Audit event logging into security_events.
 * 
 * Compensation Strategy:
 * - If Firebase Auth creation fails after CodeID allocation:
 *   - Mappings (ndids, emails) are released so user can retry.
 *   - CodeID is NEVER recycled (remains permanently consumed, creating an intentional gap).
 * - If Firestore user creation fails after Auth user creation:
 *   - Firebase Auth user is deleted (compensated) to avoid orphan auth accounts.
 *   - Mappings are released.
 *   - CodeID remains permanently consumed.
 */

'use strict';

const admin = require('firebase-admin');
const { validateNDID, normalizeNDID, validateEmail, normalizeEmail, validateDisplayName } = require('./validation');
const { hashPassword, validatePassword, getPasswordVersion } = require('./password');
const { allocateCodeId } = require('../codeid/allocator');
const { createCanonicalUserFoundation } = require('../database/users');
const { createPrivateSecurityDoc } = require('../database/security');
const {
  checkUniqueMappingsAvailableInTransaction,
  writeUniqueMappingsInTransaction,
  reserveUniqueMappingsInTransaction,
  releaseMappingsCompensation,
  releaseUserFoundationCompensation,
} = require('./identity');
const { recordSecurityEvent } = require('./security_events');
const { ValidationError, IdentifierUnavailableError, RegistrationCompensationError } = require('./errors');

const IDEMPOTENCY_COLLECTION = 'idempotency_keys';

/**
 * Registers a new canonical user account with compensating orchestration.
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {admin.auth.Auth} params.auth
 * @param {string} params.ndid
 * @param {string} params.password
 * @param {string} [params.email]
 * @param {string} [params.name]
 * @param {string} [params.displayName]
 * @param {string | null} [params.ip=null]
 * @param {string | null} [params.userAgent=null]
 * @param {string | null} [params.idempotencyKey=null]
 * @returns {Promise<{ success: boolean, codeId: string, customToken: string, user: Object }>}
 */
async function registerUser({
  db,
  auth,
  ndid,
  password,
  email = null,
  name = null,
  displayName = null,
  ip = null,
  userAgent = null,
  idempotencyKey = null,
  options = {},
}) {
  // 1. Validate inputs (Authoritative server-side pre-validation BEFORE any DB/allocation actions)
  const rawNDID = validateNDID(ndid);
  const normalizedNDID = normalizeNDID(rawNDID);
  validatePassword(password);
  const normalizedEmail = email ? normalizeEmail(email) : null;
  const validatedDisplayName = validateDisplayName(displayName || name || rawNDID, 'Tên hiển thị');
  const validatedName = name ? validateDisplayName(name, 'Họ và tên') : validatedDisplayName;

  // 2. Preliminary Idempotency Check (if idempotencyKey provided)
  if (idempotencyKey && typeof idempotencyKey === 'string') {
    const idempRef = db.collection(IDEMPOTENCY_COLLECTION).doc(idempotencyKey);
    const idempSnap = await idempRef.get();
    if (idempSnap.exists) {
      const data = idempSnap.data();
      if (data.status === 'completed') {
        // Mint fresh custom token for idempotent replay
        const customToken = await auth.createCustomToken(data.codeId, { role: 'user' });
        return {
          success: true,
          codeId: data.codeId,
          customToken,
          user: data.user,
          idempotentReplay: true,
        };
      }
      if (data.status === 'in_progress') {
        throw new ValidationError('Yêu cầu đăng ký này đang được xử lý, vui lòng chờ trong giây lát.');
      }
    }
  }

  // 3. Preliminary Availability Pre-check (Fail-fast before opening allocation transaction)
  await checkUniqueMappingsAvailableInTransaction(db, {
    normalizedNDID,
    normalizedEmail,
  });

  // 4. Atomic Verification & Guarded CodeID Allocation (Firestore Transaction)
  let allocatedCodeId = null;
  try {
    allocatedCodeId = await db.runTransaction(async (transaction) => {
      // Re-check idempotency key inside transaction
      if (idempotencyKey && typeof idempotencyKey === 'string') {
        const idempRef = db.collection(IDEMPOTENCY_COLLECTION).doc(idempotencyKey);
        const idempSnap = await transaction.get(idempRef);
        if (idempSnap.exists) {
          const data = idempSnap.data();
          if (data.status === 'completed') {
            throw Object.assign(new Error('IDEMPOTENT_REPLAY'), { replayData: data });
          }
          if (data.status === 'in_progress') {
            throw new ValidationError('Yêu cầu đăng ký này đang được xử lý, vui lòng chờ trong giây lát.');
          }
        }
      }

      // STEP 4A: Check NDID and Email unique mappings FIRST inside transaction
      // Throws IdentifierUnavailableError BEFORE CodeID allocation if collision occurs!
      await checkUniqueMappingsAvailableInTransaction(db, {
        normalizedNDID,
        normalizedEmail,
        transaction,
      });

      // STEP 4B: Allocate next CodeID ONLY after all checks succeed!
      const codeId = await allocateCodeId(db, { transaction });

      // STEP 4C: Reserve NDID and Email mappings pointing to allocated CodeID
      writeUniqueMappingsInTransaction(db, {
        codeId,
        normalizedNDID,
        normalizedEmail,
        transaction,
      });

      if (idempotencyKey) {
        const idempRef = db.collection(IDEMPOTENCY_COLLECTION).doc(idempotencyKey);
        transaction.set(idempRef, {
          status: 'in_progress',
          codeId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return codeId;
    });
  } catch (err) {
    if (err.message === 'IDEMPOTENT_REPLAY' && err.replayData) {
      const data = err.replayData;
      const customToken = await auth.createCustomToken(data.codeId, { role: 'user' });
      return {
        success: true,
        codeId: data.codeId,
        customToken,
        user: data.user,
        idempotentReplay: true,
      };
    }
    throw err;
  }

  // At this point, allocatedCodeId is PERMANENTLY CONSUMED.
  // It will NEVER be rolled back or reused.

  let authUserCreated = false;
  let userDocCreated = false;
  let passwordHash = null;

  try {
    // 4. Hash password with canonical bcrypt-v1
    passwordHash = await hashPassword(password);

    // 5. Create Firebase Auth User with UID === CodeID
    await auth.createUser({
      uid: allocatedCodeId,
      email: normalizedEmail || undefined,
      displayName: validatedDisplayName,
      disabled: false,
    });
    authUserCreated = true;

    // 6. Establish Canonical Firestore Documents
    await db.runTransaction(async (transaction) => {
      // Canonical user foundation profile (users/{CodeID})
      await createCanonicalUserFoundation(
        db,
        {
          codeId: allocatedCodeId,
          ndid: rawNDID,
          email: normalizedEmail,
          emailVerified: false,
          displayName: validatedDisplayName,
          name: validatedName,
          status: 'active',
          role: 'user',
          adminLevel: null,
        },
        transaction
      );

      // Private security document (users/{CodeID}/private/security)
      await createPrivateSecurityDoc(db, {
        codeId: allocatedCodeId,
        passwordHash,
        passwordVersion: getPasswordVersion(),
        transaction,
      });

      // Update idempotency state if provided
      if (idempotencyKey) {
        const idempRef = db.collection(IDEMPOTENCY_COLLECTION).doc(idempotencyKey);
        transaction.update(idempRef, {
          status: 'completed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          user: {
            codeId: allocatedCodeId,
            ndid: rawNDID,
            displayName: validatedDisplayName,
            email: normalizedEmail,
            role: 'user',
            adminLevel: null,
            status: 'active',
          },
        });
      }
    });
    userDocCreated = true;

    // 7. Mint Firebase Custom Token with UID === CodeID
    const customToken = await auth.createCustomToken(allocatedCodeId, { role: 'user' });

    // 8. Log Audit Event
    await recordSecurityEvent(db, {
      eventType: 'registration_success',
      actorCodeID: allocatedCodeId,
      targetCodeID: allocatedCodeId,
      ip,
      userAgent,
      details: {
        ndid: normalizedNDID,
        hasEmail: Boolean(normalizedEmail),
      },
    });

    // 9. Dispatch Email Verification (Phase 01-C9)
    // Non-fatal: Email dispatch issues never block or rollback successful registration
    if (normalizedEmail) {
      try {
        const { generateEmailVerification } = require('../email/verification');
        await generateEmailVerification({
          db,
          codeId: allocatedCodeId,
          email: normalizedEmail,
          emailService: options.emailService,
          ip,
          userAgent,
          options,
        });
      } catch (verifErr) {
        console.warn(`[registerUser] Email verification dispatch warning for CodeID [${allocatedCodeId}]:`, verifErr.message);
      }
    }

    return {
      success: true,
      codeId: allocatedCodeId,
      customToken,
      user: {
        codeId: allocatedCodeId,
        ndid: rawNDID,
        displayName: validatedDisplayName,
        email: normalizedEmail,
        role: 'user',
        adminLevel: null,
        status: 'active',
      },
    };
  } catch (err) {
    // ── COMPENSATION WORKFLOW ────────────────────────────────────────────────
    // CodeID is intentionally NOT recycled. Sequence gaps are valid and safe.
    console.error(`[registerUser] Error occurred during registration for CodeID [${allocatedCodeId}]:`, err.message);

    // If Auth user was created, compensate by deleting it to avoid orphan account
    if (authUserCreated) {
      try {
        await auth.deleteUser(allocatedCodeId);
      } catch (authCleanupErr) {
        console.error(`[registerUser] Failed to compensate Auth user [${allocatedCodeId}]:`, authCleanupErr.message);
      }
    }

    // If Firestore user foundation was established, compensate by deleting it to avoid orphan documents
    if (userDocCreated) {
      try {
        await releaseUserFoundationCompensation(db, allocatedCodeId);
      } catch (userCleanupErr) {
        console.error(`[registerUser] Failed to compensate user foundation [${allocatedCodeId}]:`, userCleanupErr.message);
      }
    }

    // Release unique mappings so the user can try again with this NDID/email
    try {
      await releaseMappingsCompensation(db, {
        normalizedNDID,
        normalizedEmail,
      });
    } catch (mappingCleanupErr) {
      console.error(`[registerUser] Failed to release mappings during compensation:`, mappingCleanupErr.message);
    }

    // Clean up idempotency record if needed
    if (idempotencyKey) {
      try {
        await db.collection(IDEMPOTENCY_COLLECTION).doc(idempotencyKey).delete();
      } catch {}
    }

    // Log registration failure security event
    try {
      await recordSecurityEvent(db, {
        eventType: 'registration_failed',
        actorCodeID: allocatedCodeId,
        targetCodeID: allocatedCodeId,
        ip,
        userAgent,
        details: {
          error: err.message,
          codeIdConsumed: true,
        },
      });
    } catch {}

    if (err instanceof IdentifierUnavailableError) {
      throw err;
    }
    if (err.code === 'auth/email-already-exists') {
      throw new IdentifierUnavailableError('Tên tài khoản hoặc email đã được sử dụng.');
    }

    throw new RegistrationCompensationError(
      'Quá trình đăng ký gặp sự cố. Mã CodeID đã được bảo lưu an toàn. Vui lòng thử lại.',
      { originalError: err.message, codeId: allocatedCodeId }
    );
  }
}

module.exports = {
  registerUser,
};
