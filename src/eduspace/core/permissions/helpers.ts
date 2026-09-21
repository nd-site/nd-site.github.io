/**
 * EduSpace V3 - UI / Domain Permission Helpers
 * Source of truth: docs/eduspace-v3-api-contract.md & AUTH_RULES.md
 * 
 * NOTE: These helpers are for UI/presentation gating and client-side flow control only.
 * Authoritative security enforcement is ALWAYS performed on the server (Cloud Functions & Firestore Rules).
 */

import type { UserRole, AdminLevel, EduRole } from '../constants/index.ts';

export interface UserAuthContext {
  codeId: string;
  ndid: string; // Raw String preserved
  displayName?: string;
  role: UserRole;
  adminLevel: AdminLevel;
  eduRole?: EduRole | string | null;
}

/**
 * Checks whether the user is the immutable Owner (CodeID === '0000' and adminLevel === 'owner').
 */
export function isOwner(user?: UserAuthContext | null): boolean {
  if (!user) return false;
  return user.codeId === '0000' && user.adminLevel === 'owner';
}

/**
 * Checks whether the user has Admin privileges (either Admin role or Owner).
 */
export function isAdmin(user?: UserAuthContext | null): boolean {
  if (!user) return false;
  return isOwner(user) || user.role === 'admin';
}

/**
 * Checks whether the user is a Teacher / Lecturer in EduSpace or an Admin.
 */
export function isTeacher(user?: UserAuthContext | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.eduRole === 'teacher' || user.eduRole === 'lecturer';
}

/**
 * Checks whether the user is a Student.
 */
export function isStudent(user?: UserAuthContext | null): boolean {
  if (!user) return false;
  return user.eduRole === 'student' || user.eduRole === 'college_student' || !user.eduRole;
}

/**
 * UI Gating Helper: Can the user review/moderate public exams?
 */
export function canModeratePublicContent(user?: UserAuthContext | null): boolean {
  return isAdmin(user);
}

/**
 * UI Gating Helper: Can the user create classrooms and assign exams?
 */
export function canManageClassrooms(user?: UserAuthContext | null): boolean {
  return isTeacher(user);
}

/**
 * UI Gating Helper: Can the user edit or delete an exam?
 * Accepts either (user, examOrCreatorCodeId) or (examOrCreatorCodeId, user).
 */
export function canEditExam(
  arg1: string | { creatorCodeId?: string } | UserAuthContext | null | undefined,
  arg2?: string | { creatorCodeId?: string } | UserAuthContext | null
): boolean {
  let user: UserAuthContext | null | undefined;
  let creatorCodeId: string | undefined;

  if (arg1 && typeof arg1 === 'object' && 'role' in arg1 && 'codeId' in arg1) {
    user = arg1 as UserAuthContext;
    creatorCodeId = typeof arg2 === 'string' ? arg2 : (arg2 as any)?.creatorCodeId;
  } else {
    creatorCodeId = typeof arg1 === 'string' ? arg1 : (arg1 as any)?.creatorCodeId;
    user = arg2 as UserAuthContext | null | undefined;
  }

  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.codeId === creatorCodeId;
}

/**
 * UI Gating Helper: Can the user edit or delete a classroom?
 * Accepts either (user, classroomOrTeacherCodeId) or (classroomOrTeacherCodeId, user).
 */
export function canEditClassroom(
  arg1: string | { teacherCodeId?: string } | UserAuthContext | null | undefined,
  arg2?: string | { teacherCodeId?: string } | UserAuthContext | null
): boolean {
  let user: UserAuthContext | null | undefined;
  let teacherCodeId: string | undefined;

  if (arg1 && typeof arg1 === 'object' && 'role' in arg1 && 'codeId' in arg1) {
    user = arg1 as UserAuthContext;
    teacherCodeId = typeof arg2 === 'string' ? arg2 : (arg2 as any)?.teacherCodeId;
  } else {
    teacherCodeId = typeof arg1 === 'string' ? arg1 : (arg1 as any)?.teacherCodeId;
    user = arg2 as UserAuthContext | null | undefined;
  }

  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.codeId === teacherCodeId;
}
