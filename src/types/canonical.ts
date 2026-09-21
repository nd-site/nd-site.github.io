/**
 * Canonical Identity, User Reference & Authentication Types (Phase 01-C1 & Phase 01-C2)
 * 
 * Defines the canonical CodeID, relationship contracts, and authentication data models:
 * - TimeTable (ownerCodeID, memberCodeID)
 * - EduSpace (creatorCodeID, studentCodeID)
 * - Chat (senderCodeID, participants)
 * - Comments (authorCodeID)
 * - Authentication (Registration, Login, Security Events)
 */

export type CodeID = string & { readonly __brand: 'CodeID' };

export type AccountStatus = 'active' | 'pending' | 'disabled' | 'banned' | 'locked';
export type UserRole = 'user' | 'admin';
export type AdminLevel = 'owner' | 'admin' | null;

/**
 * Resolved user profile attributes from users/{CodeID}
 */
export interface ResolvedUserProfile {
  codeId: string;
  displayName: string;
  name?: string;
  ndid: string;
  email?: string | null;
  emailVerified?: boolean;
  photoURL?: string | null;
  role?: UserRole;
  adminLevel?: AdminLevel;
  status?: AccountStatus;
  grade?: string | null;
  school?: string | null;
  eduRole?: string | null;
}

/**
 * Isolated security data in users/{CodeID}/private/security
 */
export interface PrivateSecurityData {
  passwordHash: string;
  passwordVersion: string;
  failedLoginAttempts: number;
  lockedAt?: any | null;
  lockReason?: string | null;
  lastFailedLoginAt?: any | null;
  lastPasswordChangedAt?: any | null;
  createdAt: any;
  updatedAt: any;
}

/**
 * Registration Input contract
 */
export interface RegistrationInput {
  ndid: string;
  password: string;
  email?: string | null;
  name?: string | null;
  displayName?: string | null;
}

/**
 * Successful Registration Result
 */
export interface RegistrationResult {
  success: true;
  codeId: string;
  customToken: string;
  user: ResolvedUserProfile;
  idempotentReplay?: boolean;
}

/**
 * Login Input contract
 */
export interface LoginInput {
  identifier: string;
  password: string;
}

/**
 * Successful Login Result
 */
export interface LoginResult {
  success: true;
  codeId: string;
  customToken: string;
  user: ResolvedUserProfile;
}

/**
 * Security Event Types for Audit Logging
 */
export type SecurityEventType =
  | 'registration_success'
  | 'registration_failed'
  | 'login_success'
  | 'login_failed'
  | 'account_locked'
  | 'account_unlocked'
  | 'password_changed';

export interface SecurityEventRecord {
  eventId: string;
  eventType: SecurityEventType;
  actorCodeID: string | null;
  targetCodeID: string | null;
  timestamp: any;
  ip?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown>;
}

/**
 * Standard User References across modules
 */
export interface HasOwnerReference {
  ownerCodeID: string;
}

export interface HasAuthorReference {
  authorCodeID: string;
}

export interface HasSenderReference {
  senderCodeID: string;
}

export interface HasMemberReference {
  memberCodeID: string;
}

export interface HasCreatorReference {
  creatorCodeID: string;
}

export interface HasStudentReference {
  studentCodeID: string;
}
