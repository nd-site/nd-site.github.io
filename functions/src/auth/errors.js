/**
 * Canonical Authentication Error Definitions (Phase 01-C2)
 * 
 * Standardized error classes and error codes for server-side auth operations.
 * Designed with anti-enumeration security: public messages do not reveal
 * internal state, account existence, or credential details.
 */

'use strict';

class AuthError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number} [status=400]
   * @param {Record<string, unknown>} [details]
   */
  constructor(code, message, status = 400, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class ValidationError extends AuthError {
  /**
   * @param {string} message
   * @param {Record<string, unknown>} [details]
   */
  constructor(message, details = {}) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

class InvalidCredentialsError extends AuthError {
  /**
   * Generic anti-enumeration error for bad username/email/password.
   * @param {string} [message]
   */
  constructor(message = 'Thông tin đăng nhập không chính xác.') {
    super('AUTH_CREDENTIALS_INVALID', message, 401);
  }
}

class IdentifierUnavailableError extends AuthError {
  /**
   * Generic collision error: avoids leaking which identifier collided.
   * @param {string} [message]
   */
  constructor(message = 'Tên tài khoản hoặc email đã được sử dụng.') {
    super('IDENTIFIER_UNAVAILABLE', message, 409);
  }
}

class AccountLockedError extends AuthError {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng khôi phục hoặc liên hệ quản trị viên.') {
    super('ACCOUNT_LOCKED', message, 403);
  }
}

class AccountDisabledError extends AuthError {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Tài khoản đã bị vô hiệu hóa.') {
    super('ACCOUNT_DISABLED', message, 403);
  }
}

class AccountBannedError extends AuthError {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Tài khoản đang bị tạm khóa.') {
    super('ACCOUNT_BANNED', message, 403);
  }
}

class AccountPendingError extends AuthError {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Tài khoản chưa hoàn tất kích hoạt.') {
    super('ACCOUNT_PENDING', message, 403);
  }
}

class RegistrationCompensationError extends AuthError {
  /**
   * Raised when registration partially succeeded and compensation was triggered.
   * @param {string} message
   * @param {Record<string, unknown>} [details]
   */
  constructor(message, details = {}) {
    super('REGISTRATION_FAILED', message, 500, details);
  }
}

class GoogleIdentityAlreadyLinkedError extends AuthError {
  /**
   * Raised when a Google identity is already mapped to another CodeID.
   * @param {string} [message]
   */
  constructor(message = 'Tài khoản Google này đã được liên kết với một tài khoản khác.') {
    super('GOOGLE_IDENTITY_ALREADY_LINKED', message, 409);
  }
}

class RateLimitExceededError extends AuthError {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
  }
}

class UnauthorizedError extends AuthError {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Yêu cầu phiên đăng nhập hợp lệ.') {
    super('UNAUTHORIZED', message, 401);
  }
}

class ForbiddenError extends AuthError {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Bạn không có quyền thực hiện thao tác này.') {
    super('FORBIDDEN', message, 403);
  }
}

class PrivilegeEscalationError extends AuthError {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Thao tác nâng quyền hoặc thay đổi quyền hạn không được phép.') {
    super('PRIVILEGE_ESCALATION_DENIED', message, 403);
  }
}

module.exports = {
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
  RateLimitExceededError,
  UnauthorizedError,
  ForbiddenError,
  PrivilegeEscalationError,
};
