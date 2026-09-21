/**
 * Canonical Transactional Email Service (Phase 01-C10-FINAL)
 *
 * Central application-level service for dispatching transactional emails:
 * - 01. Verify Email
 * - 02. Recovery Code (One-Time Verification Code)
 * - 03. Password Reset Success
 * - 04. Password Changed
 * - 05. Security Alert / New Login
 * - 06. Google Linked
 * - 07. Google Unlinked
 * - 08. Account Unlocked
 * - 09. Email Change
 * - 10. Generic Security Notice
 *
 * Strict Architectural Invariants:
 * 1. Single Centralized Service: Application modules never communicate with vendor SDKs directly.
 * 2. Non-Fatal Resiliency: Provider delivery errors are captured and logged safely
 *    without crashing calling transactions or rolling back verified credentials.
 * 3. Anti-Duplicate Protection: Transient in-memory duplicate throttling protects against
 *    rapid retry bursts (3-second debounce).
 * 4. Zero Sensitive Data Exposure: Never logs full recipient credentials or secrets.
 * 5. Full 10-Template Support: Dispatches all 10 canonical templates per the Final Contract.
 */

'use strict';

const { getEmailConfig } = require('./config');
const { createEmailProvider } = require('./provider_adapter');
const {
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

class EmailService {
  /**
   * @param {Object} [options]
   * @param {import('./provider_adapter').EmailProvider} [options.provider]
   * @param {Object} [options.config]
   */
  constructor(options = {}) {
    this.config = options.config || getEmailConfig();
    this.provider = options.provider || createEmailProvider(this.config);
    // Transient cache to throttle accidental immediate duplicate dispatches (key -> timestamp)
    this._recentDispatches = new Map();
  }

  /**
   * Cleans up expired items from transient dispatch cache.
   * @private
   */
  _cleanupDispatchCache() {
    const now = Date.now();
    for (const [key, timestamp] of this._recentDispatches.entries()) {
      if (now - timestamp > 10000) { // 10s retention
        this._recentDispatches.delete(key);
      }
    }
  }

  /**
   * Core method to send a transactional email.
   * @param {Object} params
   * @param {string} params.to
   * @param {string} params.subject
   * @param {string} params.html
   * @param {string} params.text
   * @param {string} [params.type='transactional']
   * @param {Object} [params.metadata={}]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string, duplicateSuppressed?: boolean }>}
   */
  async sendTransactionalEmail({ to, subject, html, text, type = 'transactional', metadata = {} }) {
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return { success: false, error: 'INVALID_RECIPIENT_EMAIL' };
    }

    const normalizedTo = to.trim().toLowerCase();

    // Idempotency / Duplicate burst guard:
    const dispatchKey = `${normalizedTo}:${type}:${subject}`;
    const now = Date.now();
    this._cleanupDispatchCache();

    if (this._recentDispatches.has(dispatchKey)) {
      const lastSent = this._recentDispatches.get(dispatchKey);
      if (now - lastSent < 3000) { // Throttles exact duplicates within 3 seconds
        return {
          success: true,
          messageId: `dedup_${now}`,
          duplicateSuppressed: true,
        };
      }
    }
    this._recentDispatches.set(dispatchKey, now);

    try {
      const result = await this.provider.send({
        to: normalizedTo,
        subject,
        html,
        text,
        from: this.config.senderAddress,
        replyTo: this.config.replyTo,
        metadata: {
          ...metadata,
          type,
        },
      });

      return result;
    } catch (err) {
      console.warn(`[EmailService] Uncaught provider error delivering ${type} email:`, err.message);
      return {
        success: false,
        error: 'EMAIL_SERVICE_EXCEPTION',
      };
    }
  }

  // ── 01. VERIFY EMAIL ──────────────────────────────────────────────────────
  /**
   * Sends an account email verification email.
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} params.verificationToken
   * @param {string} [params.appBaseUrl]
   * @param {number} [params.expiresHours=24]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendVerificationEmail({ toEmail, ndid, codeId, verificationToken, appBaseUrl = null, expiresHours = 24 }) {
    const baseUrl = appBaseUrl || this.config.appBaseUrl;
    const verificationUrl = `${baseUrl}/auth/verify/?token=${encodeURIComponent(verificationToken)}`;

    const { subject, html, text } = buildVerificationEmail({
      ndid,
      verificationUrl,
      expiresHours,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'email_verification',
      metadata: { codeId },
    });
  }

  // ── 02. RECOVERY CODE ─────────────────────────────────────────────────────
  /**
   * Sends a 6-digit account recovery code.
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} params.verificationCode - 6-digit OTP
   * @param {number} [params.expiresMinutes=15]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendRecoveryEmail({ toEmail, ndid, codeId, verificationCode, expiresMinutes = 15 }) {
    const { subject, html, text } = buildRecoveryEmail({
      ndid,
      verificationCode,
      expiresMinutes,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'account_recovery',
      metadata: { codeId },
    });
  }

  // ── 03. PASSWORD RESET SUCCESS ────────────────────────────────────────────
  /**
   * Sends a password reset success confirmation.
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} [params.eventTime]
   * @param {string} [params.ipMasked]
   * @param {string} [params.device]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendPasswordResetSuccessEmail({ toEmail, ndid, codeId, eventTime = null, ipMasked = null, device = null }) {
    const { subject, html, text } = buildPasswordResetSuccessEmail({
      ndid,
      eventTime,
      ipMasked,
      device,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'password_reset_success',
      metadata: { codeId },
    });
  }

  // ── 04. PASSWORD CHANGED ──────────────────────────────────────────────────
  /**
   * Sends a password changed notification (self-service).
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} [params.eventTime]
   * @param {string} [params.ipMasked]
   * @param {string} [params.device]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendPasswordChangedEmail({ toEmail, ndid, codeId, eventTime = null, ipMasked = null, device = null }) {
    const { subject, html, text } = buildPasswordChangedEmail({
      ndid,
      eventTime,
      ipMasked,
      device,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'password_changed',
      metadata: { codeId },
    });
  }

  // ── 05. NEW LOGIN SECURITY ALERT ──────────────────────────────────────────
  /**
   * Sends a new login / new device security alert.
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} [params.eventTime]
   * @param {string} [params.ipMasked]
   * @param {string} [params.device]
   * @param {string} [params.browser]
   * @param {string} [params.location]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendNewLoginSecurityEmail({ toEmail, ndid, codeId, eventTime = null, ipMasked = null, device = null, browser = null, location = null }) {
    const { subject, html, text } = buildNewLoginSecurityEmail({
      ndid,
      eventTime,
      ipMasked,
      device,
      browser,
      location,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'security_alert_new_login',
      metadata: { codeId },
    });
  }

  // ── 06. GOOGLE LINKED ─────────────────────────────────────────────────────
  /**
   * Sends Google Identity Linked notification.
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} params.googleEmail
   * @param {string} [params.eventTime]
   * @param {string} [params.ipMasked]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendGoogleLinkedEmail({ toEmail, ndid, codeId, googleEmail, eventTime = null, ipMasked = null }) {
    const { subject, html, text } = buildGoogleLinkedEmail({
      ndid,
      googleEmail,
      eventTime,
      ipMasked,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'google_linked',
      metadata: { codeId },
    });
  }

  // ── 07. GOOGLE UNLINKED ───────────────────────────────────────────────────
  /**
   * Sends Google Identity Unlinked notification.
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} [params.eventTime]
   * @param {string} [params.ipMasked]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendGoogleUnlinkedEmail({ toEmail, ndid, codeId, eventTime = null, ipMasked = null }) {
    const { subject, html, text } = buildGoogleUnlinkedEmail({
      ndid,
      eventTime,
      ipMasked,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'google_unlinked',
      metadata: { codeId },
    });
  }

  // ── 08. ACCOUNT UNLOCKED ──────────────────────────────────────────────────
  /**
   * Sends Account Unlocked notification.
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} [params.eventTime]
   * @param {string} [params.ipMasked]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendAccountUnlockedEmail({ toEmail, ndid, codeId, eventTime = null, ipMasked = null }) {
    const { subject, html, text } = buildAccountUnlockedEmail({
      ndid,
      eventTime,
      ipMasked,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'account_unlocked',
      metadata: { codeId },
    });
  }

  // ── 09. EMAIL CHANGE ──────────────────────────────────────────────────────
  /**
   * Sends Email Change verification request.
   * @param {Object} params
   * @param {string} params.toEmail - New email address
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} params.newEmail
   * @param {string} params.verificationToken
   * @param {string} [params.appBaseUrl]
   * @param {number} [params.expiresHours=24]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendEmailChangeEmail({ toEmail, ndid, codeId, newEmail, verificationToken, appBaseUrl = null, expiresHours = 24 }) {
    const baseUrl = appBaseUrl || this.config.appBaseUrl;
    const verificationUrl = `${baseUrl}/auth/verify-email-change/?token=${encodeURIComponent(verificationToken)}`;

    const { subject, html, text } = buildEmailChangeEmail({
      ndid,
      newEmail,
      verificationUrl,
      expiresHours,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'email_change_verification',
      metadata: { codeId },
    });
  }

  // ── 10. GENERIC SECURITY NOTICE ───────────────────────────────────────────
  /**
   * Sends a generic security notice email.
   * @param {Object} params
   * @param {string} params.toEmail
   * @param {string} params.ndid
   * @param {string} [params.codeId]
   * @param {string} params.eventType
   * @param {string} params.description
   * @param {string | null} [params.ip=null]
   * @param {string | null} [params.timestamp=null]
   * @param {string | null} [params.device=null]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendGenericSecurityNoticeEmail({ toEmail, ndid, codeId, eventType, description, ip = null, timestamp = null, device = null }) {
    const { subject, html, text } = buildGenericSecurityNoticeEmail({
      ndid,
      eventType,
      description,
      ipMasked: ip,
      eventTime: timestamp,
      device,
    });

    return this.sendTransactionalEmail({
      to: toEmail,
      subject,
      html,
      text,
      type: 'security_notification',
      metadata: { codeId, eventType },
    });
  }

  /**
   * Backward-compatibility alias for sendGenericSecurityNoticeEmail
   */
  async sendSecurityNotification(params) {
    return this.sendGenericSecurityNoticeEmail(params);
  }
}

// Global singleton instance
const defaultEmailService = new EmailService();

module.exports = {
  EmailService,
  defaultEmailService,
};
