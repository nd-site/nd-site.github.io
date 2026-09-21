/**
 * Canonical Input Validation & Normalization Module (Phase 01-C2)
 * 
 * Enforces strict validation and separation of:
 * - RAW INPUT (user-entered string)
 * - STORAGE VALUE (canonical preserved value)
 * - LOOKUP KEY (normalized lowercase, trimmed key for uniqueness indices)
 * 
 * Canonical NDID Rule (Phase 01-C8):
 * - NDID: /^[a-z0-9_.]+$/, 3-30 chars.
 * - Only lowercase letters (a-z), digits (0-9), underscore (_), dot (.).
 * - NO uppercase. NO '@'. NO spaces. NO special characters.
 * - This validator applies uniformly to ALL roles (user, admin, owner).
 *   No role-based bypass is permitted.
 * - Email: Valid RFC 5322 pattern, max 254 chars.
 * - Name / DisplayName: 1-50 chars.
 */

'use strict';

const { ValidationError } = require('./errors');

// Canonical NDID validator: lowercase a-z, digits 0-9, underscore, dot.
// NO uppercase. Applied uniformly to ALL roles — zero exceptions.
const NDID_REGEX = /^[a-z0-9_.]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const MIN_NDID_LENGTH = 3;
const MAX_NDID_LENGTH = 30;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 50;

/**
 * Validates NDID string for registration and updates.
 * @param {unknown} ndid
 * @returns {string} Raw validated NDID
 * @throws {ValidationError}
 */
function validateNDID(ndid) {
  if (typeof ndid !== 'string') {
    throw new ValidationError('NDID phải là chuỗi ký tự.');
  }
  const trimmed = ndid.trim();
  if (trimmed !== ndid) {
    throw new ValidationError('NDID không được chứa khoảng trắng ở đầu hoặc cuối.');
  }
  if (ndid.length < MIN_NDID_LENGTH || ndid.length > MAX_NDID_LENGTH) {
    throw new ValidationError(`NDID phải có độ dài từ ${MIN_NDID_LENGTH} đến ${MAX_NDID_LENGTH} ký tự.`);
  }
  if (!NDID_REGEX.test(ndid)) {
    throw new ValidationError('NDID chỉ được chứa chữ thường (a-z), chữ số (0-9), dấu gạch dưới (_) và dấu chấm (.). Không được dùng chữ hoa.');
  }
  if (ndid.toLowerCase().includes('admin')) {
    throw new ValidationError('NDID không được phép chứa từ "admin".');
  }
  return ndid;
}

/**
 * Normalizes NDID to lowercase for index lookup keys.
 * Note: Storage in users/{CodeID} retains raw case per project policy,
 * while ndids/{normalizedNDID} uses this normalized key.
 * @param {string} ndid
 * @returns {string}
 */
function normalizeNDID(ndid) {
  const validated = validateNDID(ndid);
  return validated.toLowerCase();
}

/**
 * Validates email address format.
 * @param {unknown} email
 * @returns {string} Validated email
 * @throws {ValidationError}
 */
function validateEmail(email) {
  if (typeof email !== 'string') {
    throw new ValidationError('Email phải là chuỗi ký tự.');
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('Email không được để trống.');
  }
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    throw new ValidationError(`Email không được vượt quá ${MAX_EMAIL_LENGTH} ký tự.`);
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new ValidationError('Địa chỉ email không đúng định dạng.');
  }
  return trimmed;
}

/**
 * Normalizes email address (lowercase, trimmed) for index lookup.
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  const validated = validateEmail(email);
  return validated.toLowerCase();
}

/**
 * Validates display name or full name.
 * @param {unknown} name
 * @param {string} [fieldName='Tên hiển thị']
 * @returns {string} Trimmed validated name
 * @throws {ValidationError}
 */
function validateDisplayName(name, fieldName = 'Tên hiển thị') {
  if (typeof name !== 'string') {
    throw new ValidationError(`${fieldName} phải là chuỗi ký tự.`);
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} không được để trống.`);
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new ValidationError(`${fieldName} không được vượt quá ${MAX_NAME_LENGTH} ký tự.`);
  }
  return trimmed;
}

module.exports = {
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
};
