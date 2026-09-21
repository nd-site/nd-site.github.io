/**
 * Canonical Transactional Email Provider Adapter Architecture (Phase 01-C9)
 *
 * Provides a clean decoupled abstraction between the application email service
 * and the underlying email delivery providers.
 *
 * Strict Architectural Rules:
 * 1. Pluggable Adapters: The application never calls vendor-specific SDKs directly.
 * 2. OPEN DECISION CONTRACT: When no vendor is selected by the Owner, the system
 *    gracefully operates in Console or Mock mode without hardcoded credentials.
 * 3. Zero Raw Secrets in Source: API keys are strictly evaluated from config at runtime.
 * 4. Resilient Error Handling: Delivery failures return structured result objects
 *    rather than throwing uncaught exceptions that crash business workflows.
 */

'use strict';

const { EMAIL_PROVIDERS } = require('./config');

/**
 * Abstract Base Class for Email Providers
 */
class EmailProvider {
  /**
   * Dispatches an email message.
   * @param {Object} params
   * @param {string} params.to
   * @param {string} params.subject
   * @param {string} params.html
   * @param {string} params.text
   * @param {string} params.from
   * @param {string} [params.replyTo]
   * @param {Object} [params.metadata]
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async send(params) {
    throw new Error('EmailProvider.send() must be implemented by subclass.');
  }
}

/**
 * In-Memory Mock Provider (For unit/integration testing & local development)
 */
class MockEmailProvider extends EmailProvider {
  constructor() {
    super();
    this.sentMessages = [];
  }

  async send(params) {
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      ...params,
      messageId,
      sentAt: new Date().toISOString(),
    };
    this.sentMessages.push(record);
    return {
      success: true,
      messageId,
    };
  }

  getLastMessage() {
    return this.sentMessages[this.sentMessages.length - 1] || null;
  }

  getSentMessages() {
    return [...this.sentMessages];
  }

  clear() {
    this.sentMessages = [];
  }
}

/**
 * Console Provider (Safe development fallback: outputs diagnostic log without external network calls)
 */
class ConsoleEmailProvider extends EmailProvider {
  async send(params) {
    const messageId = `console_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const maskedTo = params.to.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    console.log(`[ConsoleEmailProvider] Email dispatched: ID=[${messageId}], Type=[${params.metadata?.type || 'transactional'}], To=[${maskedTo}], Subject=[${params.subject}]`);
    return {
      success: true,
      messageId,
    };
  }
}

/**
 * Generic HTTP Transactional Email Provider (Production-ready adapter contract)
 *
 * Connects to standard transactional email HTTP APIs (e.g. SendGrid, Resend, Mailgun, or custom webhooks)
 * via fetch when the System Owner provides API credentials via environment variables.
 */
class GenericHttpEmailProvider extends EmailProvider {
  /**
   * @param {Object} options
   * @param {string} options.apiKey
   * @param {string} options.endpoint
   */
  constructor({ apiKey, endpoint }) {
    super();
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  async send(params) {
    if (!this.apiKey || !this.endpoint) {
      return {
        success: false,
        error: 'GenericHttpEmailProvider is not configured with valid API key or endpoint.',
      };
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: params.from,
          to: [params.to],
          reply_to: params.replyTo,
          subject: params.subject,
          html: params.html,
          text: params.text,
          metadata: params.metadata,
        }),
        signal: AbortSignal.timeout(10000), // 10-second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown HTTP Error');
        console.warn(`[GenericHttpEmailProvider] HTTP ${response.status} delivery failure`);
        return {
          success: false,
          error: `Provider HTTP Error ${response.status}`,
        };
      }

      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        messageId: data.id || data.messageId || `http_${Date.now()}`,
      };
    } catch (err) {
      console.warn('[GenericHttpEmailProvider] Network or timeout error during email dispatch:', err.message);
      return {
        success: false,
        error: err.name === 'TimeoutError' ? 'EMAIL_DELIVERY_TIMEOUT' : 'EMAIL_NETWORK_ERROR',
      };
    }
  }
}

/**
 * Resend Email Provider (Official Production Provider - Phase 01-C10)
 *
 * Implements Resend Free transactional email delivery via native fetch:
 * - Canonical Endpoint: https://api.resend.com/emails
 * - Auth: Bearer <API_KEY>
 * - Quota compliance: Resend Free (100 emails/day, 3,000 emails/month)
 * - Safe error handling with zero secret exposure
 */
class ResendEmailProvider extends GenericHttpEmailProvider {
  constructor({ apiKey, endpoint = 'https://api.resend.com/emails' } = {}) {
    super({ apiKey, endpoint });
  }

  async send(params) {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'RESEND_API_KEY_MISSING',
        message: 'Resend API key chưa được cấu hình trên server.',
      };
    }

    return super.send(params);
  }
}

/**
 * Factory to create or resolve the appropriate Email Provider instance.
 * @param {Object} config
 * @returns {EmailProvider}
 */
function createEmailProvider(config = {}) {
  const p = (config.provider || config.providerType || '').toLowerCase().trim();

  if (p === 'mock' || p === EMAIL_PROVIDERS.MOCK) {
    return new MockEmailProvider();
  }

  if (p === 'resend' || p === EMAIL_PROVIDERS.RESEND) {
    return new ResendEmailProvider({
      apiKey: config.apiKey,
      endpoint: config.endpoint || config.apiEndpoint || 'https://api.resend.com/emails',
    });
  }

  if (p === 'generic_http' || p === 'http' || p === EMAIL_PROVIDERS.HTTP) {
    return new GenericHttpEmailProvider({
      apiKey: config.apiKey,
      endpoint: config.endpoint || config.apiEndpoint,
    });
  }

  // Default fallback is ConsoleEmailProvider
  return new ConsoleEmailProvider();
}

module.exports = {
  EmailProvider,
  MockEmailProvider,
  ConsoleEmailProvider,
  GenericHttpEmailProvider,
  ResendEmailProvider,
  createEmailProvider,
};
