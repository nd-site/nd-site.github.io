/**
 * CodeID Formatting & Validation Pure Helpers (Phase 01-C1)
 * 
 * Rules:
 * - CodeID sequence starts at 0000
 * - 0000 to 9999 is zero-padded to 4 digits
 * - >= 10000 expands naturally without fixed max length and without padding (10000, 10001, ...)
 * - Digits only, no whitespace, no signs, no decimals, no special characters
 * - Values >= 10000 must not have leading zero corruption (e.g. '00001' is invalid)
 */

'use strict';

/**
 * Formats a non-negative integer into its canonical CodeID string representation.
 * @param {number} num - Non-negative integer (e.g., 0, 1, 9999, 10000)
 * @returns {string} Canonical CodeID string
 * @throws {TypeError|RangeError} If num is not a non-negative finite integer
 */
function formatCodeId(num) {
  if (typeof num !== 'number' || !Number.isFinite(num)) {
    throw new TypeError(`CodeID numeric value must be a valid number, received: ${typeof num}`);
  }
  if (!Number.isInteger(num)) {
    throw new RangeError(`CodeID numeric value must be an integer, received decimal: ${num}`);
  }
  if (num < 0) {
    throw new RangeError(`CodeID numeric value cannot be negative, received: ${num}`);
  }

  if (num < 10000) {
    return String(num).padStart(4, '0');
  }
  return String(num);
}

/**
 * Validates whether a given string is a strictly valid canonical CodeID.
 * 
 * Valid criteria:
 * - Must be a string
 * - Digits only (/^\d+$/)
 * - Length must be >= 4
 * - If length == 4: valid representations 0000-9999
 * - If length > 4: cannot start with '0' (no leading zero corruption, e.g. 00001 is invalid)
 * 
 * @param {unknown} codeId - The value to test
 * @returns {boolean} True if canonical CodeID, false otherwise
 */
function isValidCodeId(codeId) {
  if (typeof codeId !== 'string') {
    return false;
  }

  // Check digits only and minimum length 4
  if (!/^\d{4,}$/.test(codeId)) {
    return false;
  }

  // If length > 4, it must NOT start with '0'
  if (codeId.length > 4 && codeId[0] === '0') {
    return false;
  }

  return true;
}

/**
 * Parses a canonical CodeID string into its numeric value.
 * @param {string} codeId - Canonical CodeID string
 * @returns {number} The integer representation
 * @throws {Error} If codeId is not a valid canonical CodeID
 */
function parseCodeId(codeId) {
  if (!isValidCodeId(codeId)) {
    throw new Error(`Invalid canonical CodeID format: "${codeId}"`);
  }
  return parseInt(codeId, 10);
}

module.exports = {
  formatCodeId,
  isValidCodeId,
  parseCodeId,
};
