/**
 * Canonical Authorization & Role Governance Module (Phase 01-C7)
 * 
 * Strict Invariants:
 * 1. Roles: 'user' | 'admin'.
 * 2. Admin Levels: null (user) | 'admin' | 'owner'.
 * 3. System Owner Protection:
 *    - Owner cannot be demoted or promoted by regular user or admin.
 *    - First owner bootstrap is preserved.
 *    - Zero frontend hard-coding of admin or owner identities.
 * 4. Privilege Escalation Prevention:
 *    - Regular users cannot modify any role or adminLevel.
 *    - Admins cannot grant/revoke admin or owner privileges, nor self-promote.
 *    - Only an active Owner can modify role or adminLevel.
 *    - The last remaining Owner cannot be demoted (prevents zero-owner lockout).
 * 5. Caller identity is always asserted via verified Firebase Auth token (UID === CodeID).
 */

'use strict';

const admin = require('firebase-admin');
const { USERS_COLLECTION } = require('../database/users');
const { recordSecurityEvent } = require('./security_events');
const {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  PrivilegeEscalationError,
} = require('./errors');

const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

const ADMIN_LEVELS = Object.freeze({
  ADMIN: 'admin',
  OWNER: 'owner',
});

const VALID_ROLES = new Set(Object.values(ROLES));
const VALID_ADMIN_LEVELS = new Set([null, ADMIN_LEVELS.ADMIN, ADMIN_LEVELS.OWNER]);

/**
 * Resolves user authorization context from users/{codeId}
 * @param {admin.firestore.Firestore} db
 * @param {string} codeId
 * @param {admin.firestore.Transaction} [transaction=null]
 * @returns {Promise<{ codeId: string, role: string, adminLevel: string | null, status: string, exists: boolean, data: Object }>}
 */
async function getUserAuthorizationContext(db, codeId, transaction = null) {
  if (!codeId || typeof codeId !== 'string') {
    throw new UnauthorizedError('Mã định danh không hợp lệ.');
  }

  const userRef = db.collection(USERS_COLLECTION).doc(codeId);
  const snap = transaction ? await transaction.get(userRef) : await userRef.get();

  if (!snap.exists) {
    throw new UnauthorizedError('Không tìm thấy tài khoản người dùng.');
  }

  const data = snap.data() || {};
  return {
    codeId,
    role: data.role || ROLES.USER,
    adminLevel: data.adminLevel || null,
    status: data.status || 'active',
    exists: true,
    data,
  };
}

/**
 * Asserts that the caller is accessing only their own resource.
 * @param {string} callerCodeId
 * @param {string} targetCodeId
 */
function assertSelfAccess(callerCodeId, targetCodeId) {
  if (!callerCodeId || !targetCodeId || callerCodeId !== targetCodeId) {
    throw new ForbiddenError('Bạn chỉ có quyền truy cập dữ liệu của chính mình.');
  }
}

/**
 * Asserts that the caller is an active Admin.
 * @param {{ role: string, status: string }} callerContext
 */
function assertAdmin(callerContext) {
  if (!callerContext || callerContext.role !== ROLES.ADMIN || callerContext.status !== 'active') {
    throw new ForbiddenError('Yêu cầu quyền Quản trị viên (Admin).');
  }
}

/**
 * Asserts that the caller is an active System Owner.
 * @param {{ role: string, adminLevel: string | null, status: string }} callerContext
 */
function assertOwner(callerContext) {
  if (
    !callerContext ||
    callerContext.role !== ROLES.ADMIN ||
    callerContext.adminLevel !== ADMIN_LEVELS.OWNER ||
    callerContext.status !== 'active'
  ) {
    throw new ForbiddenError('Yêu cầu quyền Chủ sở hữu hệ thống (Owner).');
  }
}

/**
 * Asserts that a proposed role or adminLevel change does not violate privilege hierarchy.
 * @param {Object} callerContext
 * @param {Object} targetContext
 * @param {Object} desiredChanges - { role, adminLevel }
 */
function assertNoPrivilegeEscalation(callerContext, targetContext, desiredChanges) {
  const { role: newRole, adminLevel: newAdminLevel } = desiredChanges;

  // Validate values
  if (newRole !== undefined && !VALID_ROLES.has(newRole)) {
    throw new ValidationError(`Vai trò '${newRole}' không hợp lệ. Chỉ chấp nhận: 'user', 'admin'.`);
  }
  if (newAdminLevel !== undefined && !VALID_ADMIN_LEVELS.has(newAdminLevel)) {
    throw new ValidationError(`Cấp quản trị '${newAdminLevel}' không hợp lệ. Chỉ chấp nhận: null, 'admin', 'owner'.`);
  }

  // Coherence validation
  if (newRole === ROLES.USER && newAdminLevel && newAdminLevel !== null) {
    throw new ValidationError("Tài khoản người dùng thông thường ('user') không thể có cấp quản trị (adminLevel phải là null).");
  }
  if (newRole === ROLES.ADMIN && (!newAdminLevel || !VALID_ADMIN_LEVELS.has(newAdminLevel))) {
    throw new ValidationError("Tài khoản quản trị viên ('admin') phải có cấp quản trị ('admin' hoặc 'owner').");
  }

  const isChangingRole = newRole !== undefined && newRole !== targetContext.role;
  const isChangingAdminLevel = newAdminLevel !== undefined && newAdminLevel !== targetContext.adminLevel;

  if (!isChangingRole && !isChangingAdminLevel) {
    return; // No changes to privileges
  }

  // Rule 1: Normal users can NEVER change privileges
  if (callerContext.role !== ROLES.ADMIN) {
    throw new PrivilegeEscalationError('Chỉ Quản trị viên cấp cao mới có quyền thay đổi vai trò hoặc cấp quản trị.');
  }

  // Rule 2: Admins without Owner level CANNOT grant/revoke admin or owner privileges, nor promote/demote anyone
  if (callerContext.adminLevel !== ADMIN_LEVELS.OWNER) {
    throw new PrivilegeEscalationError('Chỉ Chủ sở hữu hệ thống (Owner) mới có quyền phân quyền hoặc thay đổi vai trò.');
  }
}

/**
 * Atomically updates user role and adminLevel with full audit logging and owner protection.
 * @param {Object} params
 * @param {admin.firestore.Firestore} params.db
 * @param {string} params.callerCodeId
 * @param {string} params.targetCodeId
 * @param {string} params.newRole
 * @param {string|null} [params.newAdminLevel=null]
 * @param {string|null} [params.ip=null]
 * @param {string|null} [params.userAgent=null]
 * @returns {Promise<{ success: boolean, targetCodeId: string, role: string, adminLevel: string|null, message: string }>}
 */
async function updateUserRoleAndLevel({
  db,
  callerCodeId,
  targetCodeId,
  newRole,
  newAdminLevel = null,
  ip = null,
  userAgent = null,
}) {
  if (!callerCodeId || !targetCodeId) {
    throw new ValidationError('Mã định danh người thực hiện và người dùng mục tiêu là bắt buộc.');
  }

  return db.runTransaction(async (transaction) => {
    const callerContext = await getUserAuthorizationContext(db, callerCodeId, transaction);
    const targetContext = await getUserAuthorizationContext(db, targetCodeId, transaction);

    assertNoPrivilegeEscalation(callerContext, targetContext, {
      role: newRole,
      adminLevel: newAdminLevel,
    });

    // If target was owner and is being demoted, ensure at least one OTHER owner remains
    if (targetContext.adminLevel === ADMIN_LEVELS.OWNER && newAdminLevel !== ADMIN_LEVELS.OWNER) {
      const ownersQuery = db.collection(USERS_COLLECTION)
        .where('role', '==', ROLES.ADMIN)
        .where('adminLevel', '==', ADMIN_LEVELS.OWNER)
        .where('status', '==', 'active');
      const ownersSnap = await transaction.get(ownersQuery);
      
      const otherOwners = ownersSnap.docs.filter(d => d.id !== targetCodeId);
      if (otherOwners.length === 0) {
        throw new PrivilegeEscalationError('Không thể giáng quyền Chủ sở hữu duy nhất còn lại của hệ thống.');
      }
    }

    const serverTime = admin.firestore.FieldValue.serverTimestamp();
    const userRef = db.collection(USERS_COLLECTION).doc(targetCodeId);

    const updatePayload = {
      role: newRole,
      adminLevel: newAdminLevel,
      updatedAt: serverTime,
    };

    transaction.update(userRef, updatePayload);

    await recordSecurityEvent(db, {
      eventType: 'role_or_privilege_updated',
      actorCodeID: callerCodeId,
      targetCodeID: targetCodeId,
      ip,
      userAgent,
      details: {
        previousRole: targetContext.role,
        previousAdminLevel: targetContext.adminLevel,
        newRole,
        newAdminLevel,
      },
      transaction,
    });

    return {
      success: true,
      targetCodeId,
      role: newRole,
      adminLevel: newAdminLevel,
      message: 'Cập nhật vai trò và cấp quản trị thành công.',
    };
  });
}

module.exports = {
  ROLES,
  ADMIN_LEVELS,
  VALID_ROLES,
  VALID_ADMIN_LEVELS,
  getUserAuthorizationContext,
  assertSelfAccess,
  assertAdmin,
  assertOwner,
  assertNoPrivilegeEscalation,
  updateUserRoleAndLevel,
};
