/**
 * Canonical Password Security Service (Phase 01-C2)
 * 
 * Centralized password hashing, verification, versioning, and timing-safe checks.
 * - Algorithm: bcrypt (via bcryptjs) with 10 salt rounds (OWASP recommended standard).
 * - Version: "bcrypt-v1"
 * - Constraints: 8 to 128 characters, UTF-8 compliant.
 * - Strict Invariant: No silent trimming (whitespace is preserved to avoid altering user input).
 * - Anti-Enumeration: Built-in dummy verification to prevent timing attacks when accounts do not exist.
 */

'use strict';

const bcrypt = require('bcryptjs');
const { ValidationError } = require('./errors');

const PASSWORD_VERSION = 'bcrypt-v1';
const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

// Valid, pre-computed bcrypt hash of a random token for constant-time comparison
const DUMMY_HASH = '$2a$10$7EqJtq98hPqEX7fNZaFWoO0L0927v8sF5hR8u1eS5y8.4uP6v8m.m';

/**
 * Returns the active password hashing algorithm version.
 * @returns {string}
 */
function getPasswordVersion() {
  return PASSWORD_VERSION;
}

/**
 * Validates password criteria without modifying the string.
 * @param {unknown} password
 * @throws {ValidationError}
 */
function validatePassword(password) {
  if (typeof password !== 'string') {
    throw new ValidationError('Mật khẩu phải là chuỗi ký tự.');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(`Mật khẩu phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new ValidationError(`Mật khẩu không được vượt quá ${MAX_PASSWORD_LENGTH} ký tự.`);
  }
}

/**
 * Asynchronously hashes a plaintext password.
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  validatePassword(password);
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Asynchronously verifies a password against a stored bcrypt hash.
 * Returns false safely if password or hash is invalid.
 * @param {string} password
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string' || !storedHash) {
    return false;
  }
  try {
    return await bcrypt.compare(password, storedHash);
  } catch (err) {
    // If storedHash is corrupted or malformed, return false safely without crashing
    return false;
  }
}

/**
 * Executes a dummy password comparison to normalize processing time
 * when a user or identifier is not found, defeating timing attacks.
 * @param {string} password
 * @returns {Promise<void>}
 */
async function dummyVerifyPassword(password) {
  try {
    const input = typeof password === 'string' ? password : 'dummy';
    await bcrypt.compare(input, DUMMY_HASH);
  } catch {
    // Suppress internal error
  }
}

module.exports = {
  PASSWORD_VERSION,
  BCRYPT_SALT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  getPasswordVersion,
  validatePassword,
  hashPassword,
  verifyPassword,
  dummyVerifyPassword,
};
