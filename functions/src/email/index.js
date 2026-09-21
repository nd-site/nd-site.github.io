/**
 * Canonical Transactional Email Module (Phase 01-C10-FINAL)
 *
 * Re-exports the unified Email Service, Provider Adapters, 10 Canonical Templates,
 * Configuration, and Verification workflows.
 */

'use strict';

const {
  EMAIL_PROVIDERS,
  getEmailConfig,
  validateEmailConfig,
  VERIFICATION_TOKEN_TTL_MS,
  VERIFICATION_RESEND_COOLDOWN_MS,
} = require('./config');

const {
  EmailProvider,
  MockEmailProvider,
  ConsoleEmailProvider,
  GenericHttpEmailProvider,
  ResendEmailProvider,
  createEmailProvider,
} = require('./provider_adapter');

const {
  BRAND_LOGO_URL,
  BRAND_HOME_URL,
  BRAND_LABEL,
  escapeHtml,
  wrapBaseLayout,
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
} = require('./templates');

const {
  EmailService,
  defaultEmailService,
} = require('./email_service');

const {
  EMAIL_VERIFICATIONS_COLLECTION,
  generateEmailVerification,
  verifyEmailToken,
} = require('./verification');

module.exports = {
  // Brand Assets & Helpers
  BRAND_LOGO_URL,
  BRAND_HOME_URL,
  BRAND_LABEL,
  escapeHtml,
  wrapBaseLayout,

  // Configuration
  EMAIL_PROVIDERS,
  getEmailConfig,
  validateEmailConfig,
  VERIFICATION_TOKEN_TTL_MS,
  VERIFICATION_RESEND_COOLDOWN_MS,

  // Providers
  EmailProvider,
  MockEmailProvider,
  ConsoleEmailProvider,
  GenericHttpEmailProvider,
  ResendEmailProvider,
  createEmailProvider,

  // 10 Canonical Templates
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

  // Service
  EmailService,
  defaultEmailService,

  // Verification Workflow
  EMAIL_VERIFICATIONS_COLLECTION,
  generateEmailVerification,
  verifyEmailToken,
};
