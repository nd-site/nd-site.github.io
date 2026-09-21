import * as admin from 'firebase-admin';

export type CodeID = string & { readonly __brand: 'CodeID' };

export type AccountStatus = 'active' | 'pending' | 'disabled' | 'banned' | 'locked';
export type UserRole = 'user' | 'admin';
export type AdminLevel = 'owner' | 'admin' | null;

export interface CanonicalUserFoundation {
  codeId: string;
  status: AccountStatus;
  role: UserRole;
  adminLevel: AdminLevel;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  lastLoginAt?: admin.firestore.Timestamp | null;
  displayName?: string;
  name?: string;
  ndid?: string;
  email?: string | null;
  emailVerified?: boolean;
  photoURL?: string | null;
  grade?: string | null;
  school?: string | null;
  eduRole?: string | null;
  googleLinked?: boolean;
}

export interface PrivateSecurityData {
  passwordHash: string;
  passwordVersion: string;
  failedLoginAttempts: number;
  lockedAt?: admin.firestore.Timestamp | null;
  lockReason?: string | null;
  lastFailedLoginAt?: admin.firestore.Timestamp | null;
  lastPasswordChangedAt?: admin.firestore.Timestamp | null;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

export interface CodeIdCounterState {
  exists: boolean;
  nextNumericValue: number | null;
  nextCodeId: string | null;
  isCorrupted?: boolean;
}

export function formatCodeId(num: number): string;
export function isValidCodeId(codeId: unknown): boolean;
export function parseCodeId(codeId: string): number;

export function allocateCodeId(
  db: admin.firestore.Firestore,
  options?: { transaction?: admin.firestore.Transaction | null }
): Promise<string>;
export function initializeCounter(db: admin.firestore.Firestore, initialNextValue?: number): Promise<void>;
export function getCounterState(db: admin.firestore.Firestore): Promise<CodeIdCounterState>;

export class CodeIdAllocator {
  constructor(db: admin.firestore.Firestore);
  allocate(): Promise<string>;
  initialize(initialNextValue?: number): Promise<void>;
  getState(): Promise<CodeIdCounterState>;
}

export class CounterCorruptedError extends Error {
  readonly code: 'COUNTER_CORRUPTED';
  readonly details: Record<string, unknown>;
}

export class AllocationError extends Error {
  readonly code: 'ALLOCATION_FAILED';
  readonly originalError: unknown;
}

export class UserAlreadyExistsError extends Error {
  readonly code: 'USER_ALREADY_EXISTS';
  readonly codeId: string;
}

export class InvariantViolationError extends Error {
  readonly code: 'INVARIANT_VIOLATION';
  readonly details: Record<string, unknown>;
}

export class AuthError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, unknown>;
}

export class ValidationError extends AuthError {}
export class InvalidCredentialsError extends AuthError {}
export class IdentifierUnavailableError extends AuthError {}
export class AccountLockedError extends AuthError {}
export class AccountDisabledError extends AuthError {}
export class AccountBannedError extends AuthError {}
export class AccountPendingError extends AuthError {}
export class RegistrationCompensationError extends AuthError {}

export const PASSWORD_VERSION: string;
export const BCRYPT_SALT_ROUNDS: number;
export const MIN_PASSWORD_LENGTH: number;
export const MAX_PASSWORD_LENGTH: number;

export function getPasswordVersion(): string;
export function validatePassword(password: unknown): void;
export function hashPassword(password: string): Promise<string>;
export function verifyPassword(password: string, storedHash: string): Promise<boolean>;
export function dummyVerifyPassword(password: string): Promise<void>;

export const NDID_REGEX: RegExp;
export const EMAIL_REGEX: RegExp;
export const MIN_NDID_LENGTH: number;
export const MAX_NDID_LENGTH: number;
export const MAX_EMAIL_LENGTH: number;
export const MAX_NAME_LENGTH: number;

export function validateNDID(ndid: unknown): string;
export function normalizeNDID(ndid: string): string;
export function validateEmail(email: unknown): string;
export function normalizeEmail(email: string): string;
export function validateDisplayName(name: unknown, fieldName?: string): string;

export function resolveIdentifierToCodeId(
  db: admin.firestore.Firestore,
  identifier: string,
  transaction?: admin.firestore.Transaction | null
): Promise<{ codeId: string; type: 'email' | 'ndid'; normalizedKey: string } | null>;

export function createCanonicalUserFoundation(
  db: admin.firestore.Firestore,
  params: {
    codeId: string;
    status?: AccountStatus;
    role?: UserRole;
    adminLevel?: AdminLevel;
    displayName?: string;
    ndid?: string;
    email?: string | null;
    emailVerified?: boolean;
    photoURL?: string | null;
    grade?: string | null;
    school?: string | null;
    eduRole?: string | null;
  },
  transaction?: admin.firestore.Transaction | null
): Promise<{ codeId: string; path: string }>;

export function getCanonicalUserFoundation(
  db: admin.firestore.Firestore,
  codeId: string
): Promise<CanonicalUserFoundation | null>;

export function isCodeIdExisting(
  db: admin.firestore.Firestore,
  codeId: string
): Promise<boolean>;

export function registerUser(params: {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  ndid: string;
  password: string;
  email?: string | null;
  name?: string | null;
  displayName?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  idempotencyKey?: string | null;
}): Promise<{
  success: boolean;
  codeId: string;
  customToken: string;
  user: any;
  idempotentReplay?: boolean;
}>;

export function loginUser(params: {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  identifier: string;
  password: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<{
  success: boolean;
  codeId: string;
  customToken: string;
  user: any;
}>;

export function recordSecurityEvent(
  db: admin.firestore.Firestore,
  params: {
    eventType: string;
    actorCodeID?: string | null;
    targetCodeID?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    details?: Record<string, unknown>;
    transaction?: admin.firestore.Transaction | null;
  }
): Promise<string>;

export function getAdminApp(options?: admin.AppOptions): admin.app.App;
export function getFirestoreDb(app?: admin.app.App): admin.firestore.Firestore;
export function getAuth(app?: admin.app.App): admin.auth.Auth;
