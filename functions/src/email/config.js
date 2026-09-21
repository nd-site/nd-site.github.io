/**
 * Canonical Transactional Email Configuration (Phase 01-C9)
 *
 * Centralizes environment configuration for transactional email dispatch,
 * provider resolution, sender identity, and safe diagnostics.
 *
 * Strict Security Invariants:
 * 1. ZERO SECRETS IN SOURCE: API keys, tokens, and passwords must exclusively
 *    originate from environment variables / secret managers.
 * 2. Safe Diagnostics: Diagnostic status functions must NEVER output secret values.
 * 3. OPEN DECISION: If a third-party provider is not configured by the System Owner,
 *    the system fails safely to Console/Mock mode with zero data loss or application crash.
 */

'use strict';

/**
 * Supported email provider types
 */
/**
 * Supported email provider types
 */
const EMAIL_PROVIDERS = {
  MOCK: 'mock',
  CONSOLE: 'console',
  HTTP: 'http',
  RESEND: 'resend',
};

const RESEND_CANONICAL_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_SENDER_ADDRESS = 'ND Labs <no-reply@ndsite.web.app>';
const DEFAULT_REPLY_TO = 'support@ndsite.web.app';
const DEFAULT_APP_BASE_URL = 'https://ndsite.web.app';

// Cooldowns and TTLs
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;      // 60 seconds

/**
 * Resolves current email configuration from environment variables.
 * @returns {Object}
 */
function getEmailConfig() {
  const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.NODE_TEST_CONTEXT);
  
  // Provider resolution:
  // - In test environment: always default to 'mock'
  // - Otherwise: use EMAIL_PROVIDER env var, falling back to 'console' if not explicitly configured
  let providerType = process.env.EMAIL_PROVIDER || (isTest ? EMAIL_PROVIDERS.MOCK : EMAIL_PROVIDERS.CONSOLE);
  providerType = providerType.toLowerCase().trim();

  if (!Object.values(EMAIL_PROVIDERS).includes(providerType)) {
    providerType = isTest ? EMAIL_PROVIDERS.MOCK : EMAIL_PROVIDERS.CONSOLE;
  }

  const senderAddress = process.env.EMAIL_SENDER_ADDRESS || DEFAULT_SENDER_ADDRESS;
  const replyTo = process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO;
  const appBaseUrl = process.env.EMAIL_APP_BASE_URL || process.env.APP_BASE_URL || DEFAULT_APP_BASE_URL;
  
  // Sensitive provider credentials (loaded purely from environment)
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY || process.env.RESEND_API_KEY || null;
  let endpoint = process.env.EMAIL_PROVIDER_ENDPOINT || process.env.RESEND_ENDPOINT || null;

  // Auto-fill canonical endpoint for Resend if not overridden
  if (providerType === EMAIL_PROVIDERS.RESEND && !endpoint) {
    endpoint = RESEND_CANONICAL_ENDPOINT;
  }

  const isConfiguredForProduction = Boolean(
    apiKey &&
    endpoint &&
    (providerType === EMAIL_PROVIDERS.RESEND || providerType === EMAIL_PROVIDERS.HTTP)
  );

  return {
    provider: providerType,
    providerType,
    senderAddress,
    replyTo,
    appBaseUrl,
    apiKey,
    endpoint,
    isConfiguredForProduction,
  };
}

/**
 * Validates the email configuration and produces a safe diagnostic report
 * suitable for logging or audit, with ZERO exposed secrets.
 * @param {Object} [configOverride] - Optional custom config to validate
 * @returns {Object}
 */
function validateEmailConfig(configOverride = null) {
  const config = configOverride || getEmailConfig();

  // Basic email syntax validation for sender
  const senderStr = config.senderAddress || '';
  const emailMatch = senderStr.match(/<([^>]+)>/) || [null, senderStr];
  const rawSenderEmail = emailMatch[1] ? emailMatch[1].trim() : senderStr.trim();
  const isValidSenderEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawSenderEmail);

  const rawApiKey = config.apiKey || null;
  const apiKeyMasked = rawApiKey
    ? (rawApiKey.length > 8 ? `${rawApiKey.slice(0, 4)}...${rawApiKey.slice(-4)}` : '****')
    : null;

  return {
    valid: isValidSenderEmail,
    provider: config.provider || config.providerType,
    senderAddress: config.senderAddress,
    senderEmailValid: isValidSenderEmail,
    replyTo: config.replyTo,
    appBaseUrl: config.appBaseUrl,
    hasApiKey: Boolean(rawApiKey),
    apiKeyConfigured: Boolean(rawApiKey),
    apiKeyMasked,
    hasEndpoint: Boolean(config.endpoint || config.apiEndpoint),
    isProductionReady: Boolean(config.isConfiguredForProduction && isValidSenderEmail),
    status: config.isConfiguredForProduction ? 'CONFIGURED' : (process.env.NODE_ENV === 'test' ? 'TEST_MOCK' : 'OPEN_DECISION_FALLBACK'),
  };
}

module.exports = {
  EMAIL_PROVIDERS,
  DEFAULT_SENDER_ADDRESS,
  DEFAULT_REPLY_TO,
  DEFAULT_APP_BASE_URL,
  VERIFICATION_TOKEN_TTL_MS,
  VERIFICATION_RESEND_COOLDOWN_MS,
  getEmailConfig,
  validateEmailConfig,
};
