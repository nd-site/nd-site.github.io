/**
 * Canonical Database & Authentication Foundation Exports (Phase 01-C1 & Phase 01-C2)
 * 
 * Centralized, typed, trusted backend authority for:
 * - CodeID Formatting & Validation (formatCodeId, isValidCodeId, parseCodeId)
 * - Atomic Sequential CodeID Allocation (allocateCodeId, initializeCounter, CodeIdAllocator)
 * - Canonical User Document Foundation (createCanonicalUserFoundation, getCanonicalUserFoundation)
 * - Password Security with bcrypt-v1 (hashPassword, verifyPassword, getPasswordVersion)
 * - Input Validation & Normalization (NDID, Email, Password, Name)
 * - Unique Identity Mappings (ndids/, emails/)
 * - Private Security Credentials Isolation (users/{CodeID}/private/security)
 * - Canonical Orchestrated Registration (registerUser)
 * - Canonical Login via NDID or Email (loginUser)
 * - Tamper-evident Audit Logging (recordSecurityEvent)
 * - Firebase Admin SDK Authority
 */

'use strict';

const {
  formatCodeId,
  isValidCodeId,
  parseCodeId,
} = require('./codeid/format');

const {
  COUNTERS_COLLECTION,
  CODE_ID_COUNTER_DOC,
  CounterCorruptedError,
  AllocationError,
  allocateCodeId,
  initializeCounter,
  getCounterState,
  CodeIdAllocator,
} = require('./codeid/allocator');

const {
  USERS_COLLECTION,
  UserAlreadyExistsError,
  InvariantViolationError,
  createCanonicalUserFoundation,
  getCanonicalUserFoundation,
  isCodeIdExisting,
} = require('./database/users');

const {
  PRIVATE_SUBCOLLECTION,
  SECURITY_DOC_ID,
  MAX_FAILED_ATTEMPTS,
  getSecurityDocRef,
  createPrivateSecurityDoc,
  getPrivateSecurityDoc,
  handleFailedLoginAttempt,
  resetFailedLoginAttempts,
} = require('./database/security');

const {
  PASSWORD_VERSION,
  BCRYPT_SALT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  getPasswordVersion,
  validatePassword,
  hashPassword,
  verifyPassword,
  dummyVerifyPassword,
} = require('./auth/password');

const {
  NDID_REGEX,
  EMAIL_REGEX,
  MIN_NDID_LENGTH,
  MAX_NDID_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  validateNDID,
  normalizeNDID,
  validateEmail,
  normalizeEmail,
  validateDisplayName,
} = require('./auth/validation');

const {
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
} = require('./auth/identity');

const {
  AuthError,
  ValidationError,
  InvalidCredentialsError,
  IdentifierUnavailableError,
  AccountLockedError,
  AccountDisabledError,
  AccountBannedError,
  AccountPendingError,
  RegistrationCompensationError,
  GoogleIdentityAlreadyLinkedError,
  UnauthorizedError,
  ForbiddenError,
  PrivilegeEscalationError,
} = require('./auth/errors');

const {
  SECURITY_EVENTS_COLLECTION,
  recordSecurityEvent,
  sanitizeEventDetails,
} = require('./auth/security_events');

const {
  registerUser,
} = require('./auth/registration');

const {
  loginUser,
} = require('./auth/login');

const {
  NDID_COOLDOWN_DAYS,
  changePassword,
  changeNdid,
} = require('./auth/self_service');

const {
  GOOGLE_IDENTITIES_COLLECTION,
  GOOGLE_PENDING_COLLECTION,
  GOOGLE_PROVIDER_ID,
  validateGoogleSubjectId,
  linkGoogleIdentity,
  unlinkGoogleIdentity,
  resolveGoogleSubjectToCodeId,
  createGooglePendingSession,
  provisionGoogleAccount,
} = require('./auth/google');

const {
  RECOVERY_DOC_ID,
  getRecoveryDocRef,
  getRecoveryDoc,
  setRecoveryDoc,
  updateRecoveryDoc,
  deleteRecoveryDoc,
} = require('./database/recovery');

const {
  RECOVERY_CODE_TTL_MS,
  RESET_TOKEN_TTL_MS,
  MAX_RECOVERY_ATTEMPTS,
  RECOVERY_COOLDOWN_MS,
  maskEmail,
  requestAccountRecovery,
  verifyRecoveryCode,
  resetPasswordWithRecovery,
} = require('./auth/recovery');

const {
  RateLimitExceededError,
} = require('./auth/errors');

const {
  parseUserAgent,
  sanitizeIp,
  formatRelativeTimeVi,
} = require('./auth/device_parser');

const {
  SESSIONS_SUBCOLLECTION,
  DEFAULT_SESSION_TTL_MS,
  getSessionDocRef,
  getSessionsCollectionRef,
  createSession,
  getSession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  revokeAllSessions,
} = require('./database/sessions');

const {
  DEVICES_SUBCOLLECTION,
  DEFAULT_DEVICE_TTL_MS,
  getDeviceDocRef,
  getDevicesCollectionRef,
  registerTrustedDeviceDoc,
  getTrustedDeviceDoc,
  getTrustedDevices,
  revokeTrustedDeviceDoc,
} = require('./database/devices');

const {
  generateSessionId,
  generateDeviceId,
  hashFingerprint,
  registerSession,
  listActiveSessions,
  revokeUserSession,
  revokeOtherUserSessions,
  registerTrustedDeviceForUser,
  listTrustedDevicesForUser,
  revokeTrustedDeviceForUser,
  getRecentSecurityActivityForUser,
} = require('./auth/sessions');

const {
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
} = require('./auth/authorization');

const {
  admin,
  getAdminApp,
  getFirestoreDb,
  getAuth,
} = require('./firebase/admin');

const {
  EMAIL_PROVIDERS,
  getEmailConfig,
  validateEmailConfig,
  VERIFICATION_TOKEN_TTL_MS,
  VERIFICATION_RESEND_COOLDOWN_MS,
  EmailProvider,
  MockEmailProvider,
  ConsoleEmailProvider,
  GenericHttpEmailProvider,
  ResendEmailProvider,
  createEmailProvider,
  BRAND_LOGO_URL,
  BRAND_HOME_URL,
  BRAND_LABEL,
  buildVerificationEmail,
  buildRecoveryEmail,
  buildPasswordResetSuccessEmail,
  buildPasswordChangedEmail,
  buildNewLoginSecurityEmail,
  buildGoogleLinkedEmail,
  buildGoogleUnlinkedEmail,
  buildAccountUnlockedEmail,
  buildEmailChangeEmail,
  buildGenericSecurityNoticeEmail,
  buildSecurityNotificationEmail,
  EmailService,
  defaultEmailService,
  EMAIL_VERIFICATIONS_COLLECTION,
  generateEmailVerification,
  verifyEmailToken,
} = require('./email');

module.exports = {
  // CodeID Pure Helpers
  formatCodeId,
  isValidCodeId,
  parseCodeId,

  // CodeID Allocator
  COUNTERS_COLLECTION,
  CODE_ID_COUNTER_DOC,
  CounterCorruptedError,
  AllocationError,
  allocateCodeId,
  initializeCounter,
  getCounterState,
  CodeIdAllocator,

  // User Document Foundation
  USERS_COLLECTION,
  UserAlreadyExistsError,
  InvariantViolationError,
  createCanonicalUserFoundation,
  getCanonicalUserFoundation,
  isCodeIdExisting,

  // Private Security Subcollection
  PRIVATE_SUBCOLLECTION,
  SECURITY_DOC_ID,
  MAX_FAILED_ATTEMPTS,
  getSecurityDocRef,
  createPrivateSecurityDoc,
  getPrivateSecurityDoc,
  handleFailedLoginAttempt,
  resetFailedLoginAttempts,

  // Password Security
  PASSWORD_VERSION,
  BCRYPT_SALT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  getPasswordVersion,
  validatePassword,
  hashPassword,
  verifyPassword,
  dummyVerifyPassword,

  // Validation & Normalization
  NDID_REGEX,
  EMAIL_REGEX,
  MIN_NDID_LENGTH,
  MAX_NDID_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  validateNDID,
  normalizeNDID,
  validateEmail,
  normalizeEmail,
  validateDisplayName,

  // Identity & Unique Mappings
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

  // Errors
  AuthError,
  ValidationError,
  InvalidCredentialsError,
  IdentifierUnavailableError,
  AccountLockedError,
  AccountDisabledError,
  AccountBannedError,
  AccountPendingError,
  RegistrationCompensationError,

  // Audit Events
  SECURITY_EVENTS_COLLECTION,
  recordSecurityEvent,
  sanitizeEventDetails,

  // Orchestrated Registration & Login
  registerUser,
  loginUser,

  // Self-Service Operations
  NDID_COOLDOWN_DAYS,
  changePassword,
  changeNdid,

  // Google Identity Linking (Phase 01-C4)
  GOOGLE_IDENTITIES_COLLECTION,
  GOOGLE_PENDING_COLLECTION,
  GOOGLE_PROVIDER_ID,
  validateGoogleSubjectId,
  linkGoogleIdentity,
  unlinkGoogleIdentity,
  resolveGoogleSubjectToCodeId,
  GoogleIdentityAlreadyLinkedError,
  createGooglePendingSession,
  provisionGoogleAccount,

  // Account Recovery & Password Reset (Phase 01-C5)
  RECOVERY_DOC_ID,
  getRecoveryDocRef,
  getRecoveryDoc,
  setRecoveryDoc,
  updateRecoveryDoc,
  deleteRecoveryDoc,
  RECOVERY_CODE_TTL_MS,
  RESET_TOKEN_TTL_MS,
  MAX_RECOVERY_ATTEMPTS,
  RECOVERY_COOLDOWN_MS,
  maskEmail,
  requestAccountRecovery,
  verifyRecoveryCode,
  resetPasswordWithRecovery,
  RateLimitExceededError,

  // Device & User-Agent Parsing (Phase 01-C6)
  parseUserAgent,
  sanitizeIp,
  formatRelativeTimeVi,

  // Session Management & Subcollections (Phase 01-C6)
  SESSIONS_SUBCOLLECTION,
  DEFAULT_SESSION_TTL_MS,
  getSessionDocRef,
  getSessionsCollectionRef,
  createSession,
  getSession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  revokeAllSessions,

  // Trusted Devices (Phase 01-C6)
  DEVICES_SUBCOLLECTION,
  DEFAULT_DEVICE_TTL_MS,
  getDeviceDocRef,
  getDevicesCollectionRef,
  registerTrustedDeviceDoc,
  getTrustedDeviceDoc,
  getTrustedDevices,
  revokeTrustedDeviceDoc,

  // Sessions & Security Center Services (Phase 01-C6)
  generateSessionId,
  generateDeviceId,
  hashFingerprint,
  registerSession,
  listActiveSessions,
  revokeUserSession,
  revokeOtherUserSessions,
  registerTrustedDeviceForUser,
  listTrustedDevicesForUser,
  revokeTrustedDeviceForUser,
  getRecentSecurityActivityForUser,

  // Authorization & Privilege Governance (Phase 01-C7)
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
  UnauthorizedError,
  ForbiddenError,
  PrivilegeEscalationError,

  // Firebase Admin Infrastructure
  admin,
  getAdminApp,
  getFirestoreDb,
  getAuth,

  // Transactional Email & Verification (Phase 01-C10-FINAL)
  BRAND_LOGO_URL,
  BRAND_HOME_URL,
  BRAND_LABEL,
  EMAIL_PROVIDERS,
  getEmailConfig,
  validateEmailConfig,
  VERIFICATION_TOKEN_TTL_MS,
  VERIFICATION_RESEND_COOLDOWN_MS,
  EmailProvider,
  MockEmailProvider,
  ConsoleEmailProvider,
  GenericHttpEmailProvider,
  ResendEmailProvider,
  createEmailProvider,
  buildVerificationEmail,
  buildRecoveryEmail,
  buildPasswordResetSuccessEmail,
  buildPasswordChangedEmail,
  buildNewLoginSecurityEmail,
  buildGoogleLinkedEmail,
  buildGoogleUnlinkedEmail,
  buildAccountUnlockedEmail,
  buildEmailChangeEmail,
  buildGenericSecurityNoticeEmail,
  buildSecurityNotificationEmail,
  EmailService,
  defaultEmailService,
  EMAIL_VERIFICATIONS_COLLECTION,
  generateEmailVerification,
  verifyEmailToken,
};
