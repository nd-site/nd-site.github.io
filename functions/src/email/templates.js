/**
 * Canonical Transactional Email Templates (Phase 01-C10-FINAL)
 *
 * Implements the official ND Labs Transactional Email Design Contract:
 * "BẢN KHẾ ƯỚC THIẾT KẾ EMAIL GIAO DỊCH CHÍNH THỨC — ND LABS (FINAL CONTRACT)"
 *
 * Strict Architectural & Design Rules:
 * 1. Flow: LOGO -> TITLE -> 1-2 câu -> CTA/OTP -> thông tin cần thiết -> Security Note -> footer
 * 2. Brand Palette:
 *    - Primary CTA & Accent: #0070F3
 *    - Secondary Accents: #0026FB, #008CE7
 *    - Main Text: #261A2D
 *    - Background: #F6F8FA
 *    - Card Container: #FFFFFF
 *    - Inner Info: #F8FAFC / #F0F6FF
 * 3. Official Assets & Links:
 *    - Logo: https://ndsite.web.app/assets/images/logo.png
 *    - Logo Link: https://ndsite.web.app
 *    - Footer Link: https://ndsite.web.app (Label: ndsite.web.app)
 * 4. Strict Security Invariants:
 *    - OTP/recoveryCode MUST NEVER appear in Subject or Preheader. Only in the OTP body block.
 *    - Canonical NDID: Raw string preservation (${ndid}), TUYỆT ĐỐI KHÔNG prefix '@'.
 *    - Zero Credential Leakage: Never leak password, passwordHash, resetToken, session token, API key, private key.
 *    - Security Note: Maximum 1 sentence when needed.
 *    - Dual Format: Every template provides both responsive table-based HTML and clean plain text.
 *    - Zero marketing, zero slogans, zero social media bloat.
 */

'use strict';

const BRAND_LOGO_URL = 'https://ndsite.web.app/assets/images/logo.png';
const BRAND_HOME_URL = 'https://ndsite.web.app';
const BRAND_LABEL = 'ndsite.web.app';

/**
 * Escapes HTML special characters to prevent HTML injection attacks.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Base email layout wrapper adhering to the ND Labs Final Design Contract.
 * Structure: LOGO -> TITLE -> CONTENT -> SECURITY NOTE -> FOOTER
 *
 * @param {Object} params
 * @param {string} params.title - Main email title
 * @param {string} params.preheader - Hidden preheader preview text (MUST NOT contain OTP)
 * @param {string} params.contentHtml - Inner body content
 * @param {string} [params.securityNote] - Optional 1-sentence security note
 * @returns {string}
 */
function wrapBaseLayout({ title, preheader, contentHtml, securityNote = null }) {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader);

  const securityNoteBlock = securityNote
    ? `<div style="margin: 24px 0 16px; padding: 12px 16px; background-color: #fef2f2; border-left: 3px solid #ef4444; border-radius: 6px; font-size: 13px; line-height: 1.5; color: #991b1b;">
        <strong>Lưu ý bảo mật:</strong> ${escapeHtml(securityNote)}
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F6F8FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #261A2D; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    .email-container { max-width: 580px; margin: 32px auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); }
    .email-header { padding: 32px 32px 20px; text-align: center; }
    .email-logo { height: 44px; width: auto; vertical-align: middle; border: 0; }
    .email-title { margin: 16px 0 0 0; color: #261A2D; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.3; }
    .email-body { padding: 8px 32px 32px; }
    .email-greeting { font-size: 15px; font-weight: 700; color: #261A2D; margin-bottom: 12px; }
    .email-text { font-size: 14.5px; line-height: 1.6; color: #261A2D; margin: 0 0 16px; }
    .btn-action { display: inline-block; background-color: #0070F3; color: #FFFFFF !important; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 700; font-size: 14.5px; margin: 12px 0 20px; text-align: center; }
    .code-box { background-color: #F8FAFC; border: 1.5px dashed #0070F3; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .code-value { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; color: #0070F3; letter-spacing: 8px; margin: 4px 0; }
    .code-label { font-size: 12px; font-weight: 700; color: #008CE7; text-transform: uppercase; letter-spacing: 1px; }
    .info-card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; margin: 20px 0; }
    .info-table { width: 100%; font-size: 13.5px; border-collapse: collapse; }
    .info-label { color: #64748B; padding: 6px 0; width: 120px; vertical-align: top; }
    .info-value { color: #261A2D; font-weight: 600; padding: 6px 0; }
    .email-footer { background-color: #F6F8FA; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
    .footer-link { color: #0070F3; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <!-- Preheader text hidden in body -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; opacity: 0; color: transparent;">
    ${safePreheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F6F8FA; padding: 20px 0;">
    <tr>
      <td align="center">
        <div class="email-container">
          <div class="email-header">
            <a href="${BRAND_HOME_URL}" target="_blank" rel="noopener">
              <img src="${BRAND_LOGO_URL}" alt="ND Labs" class="email-logo">
            </a>
            <h1 class="email-title">${safeTitle}</h1>
          </div>
          <div class="email-body">
            ${contentHtml}
            ${securityNoteBlock}
          </div>
          <div class="email-footer">
            <p style="margin: 0 0 6px 0;">Email giao dịch tự động từ hệ thống ND Labs. Vui lòng không trả lời thư này.</p>
            <p style="margin: 0;">
              <a href="${BRAND_HOME_URL}" target="_blank" rel="noopener" class="footer-link">${BRAND_LABEL}</a>
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── 01. VERIFY EMAIL TEMPLATE ──────────────────────────────────────────────
/**
 * 01. Account Email Verification
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID (never prefixed with @)
 * @param {string} params.verificationUrl - Tokenized URL
 * @param {number} [params.expiresHours=24]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildVerificationEmail({ ndid, verificationUrl, expiresHours = 24 }) {
  const safeNdid = escapeHtml(ndid);
  const subject = '[ND Labs] Xác nhận địa chỉ email của bạn';
  const preheader = 'Vui lòng xác nhận địa chỉ email để hoàn tất kích hoạt tài khoản ND Labs của bạn.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Cảm ơn bạn đã đăng ký tài khoản tại ND Labs. Vui lòng bấm vào nút bên dưới để xác nhận địa chỉ email của bạn.
    </p>
    <div style="text-align: center; margin: 24px 0 20px;">
      <a href="${verificationUrl}" class="btn-action" target="_blank" rel="noopener">Xác nhận email ngay</a>
    </div>
    <div class="info-card">
      <div style="font-size: 13px; color: #64748B;">
        Nếu nút bấm trên không hoạt động, bạn có thể sao chép liên kết này vào trình duyệt:<br>
        <a href="${verificationUrl}" style="color: #0070F3; word-break: break-all; font-weight: 500;">${verificationUrl}</a>
      </div>
    </div>
    <p class="email-text" style="font-size: 13px; color: #64748B; margin: 0;">
      Liên kết này có hiệu lực trong <strong>${expiresHours} giờ</strong>.
    </p>
  `;

  const securityNote = 'Nếu bạn không thực hiện đăng ký tài khoản tại ND Labs, vui lòng bỏ qua thư này.';

  const text = `Xin chào ${ndid},

Cảm ơn bạn đã đăng ký tài khoản tại ND Labs. Vui lòng truy cập liên kết sau để xác nhận địa chỉ email của bạn:

${verificationUrl}

Liên kết có hiệu lực trong ${expiresHours} giờ.
Lưu ý bảo mật: Nếu bạn không đăng ký tài khoản tại ND Labs, vui lòng bỏ qua email này.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Xác nhận địa chỉ email', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 02. RECOVERY CODE TEMPLATE ─────────────────────────────────────────────
/**
 * 02. Account Recovery Code (One-Time Verification Code)
 * CRITICAL: OTP must NEVER appear in subject or preheader!
 *
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} params.verificationCode - 6-digit OTP code (only displayed inside OTP body block)
 * @param {number} [params.expiresMinutes=15]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildRecoveryEmail({ ndid, verificationCode, expiresMinutes = 15 }) {
  const safeNdid = escapeHtml(ndid);
  const safeCode = escapeHtml(verificationCode);
  const subject = '[ND Labs] Mã xác nhận khôi phục tài khoản';
  // STRICT: Do NOT include OTP in preheader!
  const preheader = 'Sử dụng mã OTP xác nhận một lần bên dưới để tiến hành khôi phục tài khoản ND Labs của bạn.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản ND Labs của bạn. Dưới đây là mã xác thực của bạn:
    </p>
    <div class="code-box">
      <div class="code-label">Mã xác thực một lần (OTP)</div>
      <div class="code-value">${safeCode}</div>
      <div style="font-size: 12.5px; color: #64748B; margin-top: 6px;">Hiệu lực trong ${expiresMinutes} phút</div>
    </div>
  `;

  const securityNote = 'Tuyệt đối không chia sẻ mã xác thực này cho bất kỳ ai, kể cả nhân viên ND Labs.';

  const text = `Xin chào ${ndid},

Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản ND Labs của bạn.
Mã xác thực một lần (OTP) của bạn là:

${verificationCode}

Mã có hiệu lực trong ${expiresMinutes} phút.
Lưu ý bảo mật: Tuyệt đối không chia sẻ mã xác thực này cho bất kỳ ai, kể cả nhân viên ND Labs.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Khôi phục tài khoản', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 03. PASSWORD RESET SUCCESS TEMPLATE ────────────────────────────────────
/**
 * 03. Password Reset Success Notification
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} [params.eventTime]
 * @param {string} [params.timestamp]
 * @param {string} [params.ipMasked]
 * @param {string} [params.ip]
 * @param {string} [params.device]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildPasswordResetSuccessEmail({ ndid, eventTime = null, timestamp = null, ipMasked = null, ip = null, device = null }) {
  const safeNdid = escapeHtml(ndid);
  const effectiveTime = eventTime || timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const safeTime = escapeHtml(effectiveTime);
  const safeIp = escapeHtml(ipMasked || ip || '—');
  const safeDevice = escapeHtml(device || 'Không xác định');

  const subject = '[ND Labs] Thông báo bảo mật: Đặt lại mật khẩu thành công';
  const preheader = 'Mật khẩu tài khoản ND Labs của bạn đã được đặt lại thành công qua quy trình khôi phục.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Mật khẩu cho tài khoản ND Labs của bạn vừa được đặt lại thành công qua quy trình xác thực khôi phục tài khoản.
    </p>
    <div class="info-card">
      <table class="info-table">
        <tr>
          <td class="info-label">Thời gian:</td>
          <td class="info-value">${safeTime}</td>
        </tr>
        <tr>
          <td class="info-label">Thiết bị:</td>
          <td class="info-value">${safeDevice}</td>
        </tr>
        <tr>
          <td class="info-label">Địa chỉ IP:</td>
          <td class="info-value" style="font-family: monospace;">${safeIp}</td>
        </tr>
      </table>
    </div>
  `;

  const securityNote = 'Nếu bạn không thực hiện thay đổi này, hãy truy cập https://ndsite.web.app/auth/recovery/ để khôi phục tài khoản ngay.';

  const text = `Xin chào ${ndid},

Mật khẩu cho tài khoản ND Labs của bạn vừa được đặt lại thành công qua quy trình khôi phục.
- Thời gian: ${safeTime}
- Thiết bị: ${safeDevice}
- Địa chỉ IP: ${safeIp}

Lưu ý bảo mật: Nếu bạn không thực hiện thay đổi này, hãy truy cập ${BRAND_HOME_URL}/auth/recovery/ để khôi phục tài khoản ngay.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Đặt lại mật khẩu thành công', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 04. PASSWORD CHANGED TEMPLATE ──────────────────────────────────────────
/**
 * 04. Password Changed (Self-Service)
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} [params.eventTime]
 * @param {string} [params.timestamp]
 * @param {string} [params.ipMasked]
 * @param {string} [params.ip]
 * @param {string} [params.device]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildPasswordChangedEmail({ ndid, eventTime = null, timestamp = null, ipMasked = null, ip = null, device = null }) {
  const safeNdid = escapeHtml(ndid);
  const effectiveTime = eventTime || timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const safeTime = escapeHtml(effectiveTime);
  const safeIp = escapeHtml(ipMasked || ip || '—');
  const safeDevice = escapeHtml(device || 'Không xác định');

  const subject = '[ND Labs] Thông báo bảo mật: Mật khẩu tài khoản đã được thay đổi';
  const preheader = 'Mật khẩu tài khoản ND Labs của bạn vừa được thay đổi thành công.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Mật khẩu cho tài khoản ND Labs của bạn vừa được thay đổi thành công. Mọi phiên đăng nhập cũ đã được tự động đăng xuất để bảo mật.
    </p>
    <div class="info-card">
      <table class="info-table">
        <tr>
          <td class="info-label">Thời gian:</td>
          <td class="info-value">${safeTime}</td>
        </tr>
        <tr>
          <td class="info-label">Thiết bị:</td>
          <td class="info-value">${safeDevice}</td>
        </tr>
        <tr>
          <td class="info-label">Địa chỉ IP:</td>
          <td class="info-value" style="font-family: monospace;">${safeIp}</td>
        </tr>
      </table>
    </div>
  `;

  const securityNote = 'Nếu bạn không trực tiếp đổi mật khẩu, vui lòng liên hệ hỗ trợ hoặc khôi phục tài khoản ngay.';

  const text = `Xin chào ${ndid},

Mật khẩu cho tài khoản ND Labs của bạn vừa được thay đổi thành công.
- Thời gian: ${safeTime}
- Thiết bị: ${safeDevice}
- Địa chỉ IP: ${safeIp}

Lưu ý bảo mật: Nếu bạn không trực tiếp đổi mật khẩu, vui lòng liên hệ hỗ trợ hoặc khôi phục tài khoản ngay.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Mật khẩu đã được thay đổi', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 05. SECURITY ALERT / NEW LOGIN TEMPLATE ────────────────────────────────
/**
 * 05. Security Alert / New Login Detected
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} [params.eventTime]
 * @param {string} [params.timestamp]
 * @param {string} [params.ipMasked]
 * @param {string} [params.ip]
 * @param {string} [params.device]
 * @param {string} [params.browser]
 * @param {string} [params.location]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildNewLoginSecurityEmail({ ndid, eventTime = null, timestamp = null, ipMasked = null, ip = null, device = null, browser = null, location = null }) {
  const safeNdid = escapeHtml(ndid);
  const effectiveTime = eventTime || timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const safeTime = escapeHtml(effectiveTime);
  const safeIp = escapeHtml(ipMasked || ip || '—');
  const safeDevice = escapeHtml(device || 'Không xác định');
  const safeBrowser = escapeHtml(browser || 'Trình duyệt web');
  const safeLocation = escapeHtml(location || 'Không xác định');

  const subject = '[ND Labs] Thông báo bảo mật: Phát hiện đăng nhập từ thiết bị mới';
  const preheader = 'Tài khoản ND Labs của bạn vừa được đăng nhập từ một thiết bị hoặc phiên mới.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Hệ thống bảo mật ND Labs ghi nhận một phiên đăng nhập mới vào tài khoản của bạn:
    </p>
    <div class="info-card">
      <table class="info-table">
        <tr>
          <td class="info-label">Thiết bị:</td>
          <td class="info-value">${safeDevice} (${safeBrowser})</td>
        </tr>
        <tr>
          <td class="info-label">Thời gian:</td>
          <td class="info-value">${safeTime}</td>
        </tr>
        <tr>
          <td class="info-label">Vị trí ước tính:</td>
          <td class="info-value">${safeLocation}</td>
        </tr>
        <tr>
          <td class="info-label">Địa chỉ IP:</td>
          <td class="info-value" style="font-family: monospace;">${safeIp}</td>
        </tr>
      </table>
    </div>
  `;

  const securityNote = 'Nếu đây không phải thao tác của bạn, hãy đăng nhập và thu hồi phiên lạ tại Cài đặt bảo mật ngay.';

  const text = `Xin chào ${ndid},

Hệ thống ghi nhận phiên đăng nhập mới vào tài khoản ND Labs của bạn:
- Thiết bị: ${safeDevice} (${safeBrowser})
- Thời gian: ${safeTime}
- Vị trí: ${safeLocation}
- Địa chỉ IP: ${safeIp}

Lưu ý bảo mật: Nếu đây không phải bạn, hãy truy cập Cài đặt bảo mật để thu hồi phiên ngay lập tức.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Đăng nhập từ thiết bị mới', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 06. GOOGLE LINKED TEMPLATE ─────────────────────────────────────────────
/**
 * 06. Google Identity Linked
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} params.googleEmail
 * @param {string} [params.eventTime]
 * @param {string} [params.timestamp]
 * @param {string} [params.ipMasked]
 * @param {string} [params.ip]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildGoogleLinkedEmail({ ndid, googleEmail, eventTime = null, timestamp = null, ipMasked = null, ip = null }) {
  const safeNdid = escapeHtml(ndid);
  const safeGoogleEmail = escapeHtml(googleEmail || '—');
  const effectiveTime = eventTime || timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const safeTime = escapeHtml(effectiveTime);
  const safeIp = escapeHtml(ipMasked || ip || '—');

  const subject = '[ND Labs] Thông báo bảo mật: Tài khoản Google đã được liên kết';
  const preheader = 'Tài khoản Google đã được liên kết thành công với tài khoản ND Labs của bạn.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Tài khoản ND Labs của bạn vừa được liên kết thành công với tài khoản Google. Bây giờ bạn có thể đăng nhập nhanh bằng Google.
    </p>
    <div class="info-card">
      <table class="info-table">
        <tr>
          <td class="info-label">Email Google:</td>
          <td class="info-value" style="color: #0070F3;">${safeGoogleEmail}</td>
        </tr>
        <tr>
          <td class="info-label">Thời gian:</td>
          <td class="info-value">${safeTime}</td>
        </tr>
        <tr>
          <td class="info-label">Địa chỉ IP:</td>
          <td class="info-value" style="font-family: monospace;">${safeIp}</td>
        </tr>
      </table>
    </div>
  `;

  const securityNote = 'Nếu bạn không thực hiện thao tác này, vui lòng truy cập Cài đặt để hủy liên kết ngay.';

  const text = `Xin chào ${ndid},

Tài khoản Google (${googleEmail}) đã được liên kết thành công với tài khoản ND Labs của bạn.
- Thời gian: ${safeTime}
- Địa chỉ IP: ${safeIp}

Lưu ý bảo mật: Nếu bạn không thực hiện thao tác này, vui lòng truy cập Cài đặt để hủy liên kết ngay.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Liên kết Google thành công', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 07. GOOGLE UNLINKED TEMPLATE ───────────────────────────────────────────
/**
 * 07. Google Identity Unlinked
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} [params.eventTime]
 * @param {string} [params.timestamp]
 * @param {string} [params.ipMasked]
 * @param {string} [params.ip]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildGoogleUnlinkedEmail({ ndid, eventTime = null, timestamp = null, ipMasked = null, ip = null }) {
  const safeNdid = escapeHtml(ndid);
  const effectiveTime = eventTime || timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const safeTime = escapeHtml(effectiveTime);
  const safeIp = escapeHtml(ipMasked || ip || '—');

  const subject = '[ND Labs] Thông báo bảo mật: Tài khoản Google đã được hủy liên kết';
  const preheader = 'Phương thức đăng nhập bằng Google đã được gỡ bỏ khỏi tài khoản ND Labs của bạn.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Phương thức đăng nhập bằng tài khoản Google đã được hủy liên kết khỏi tài khoản ND Labs của bạn theo yêu cầu.
    </p>
    <div class="info-card">
      <table class="info-table">
        <tr>
          <td class="info-label">Thời gian:</td>
          <td class="info-value">${safeTime}</td>
        </tr>
        <tr>
          <td class="info-label">Địa chỉ IP:</td>
          <td class="info-value" style="font-family: monospace;">${safeIp}</td>
        </tr>
      </table>
    </div>
  `;

  const securityNote = 'Nếu bạn không thực hiện yêu cầu này, vui lòng kiểm tra lại thiết lập bảo mật tài khoản ngay.';

  const text = `Xin chào ${ndid},

Tài khoản Google đã được hủy liên kết khỏi tài khoản ND Labs của bạn.
- Thời gian: ${safeTime}
- Địa chỉ IP: ${safeIp}

Lưu ý bảo mật: Nếu bạn không thực hiện yêu cầu này, vui lòng kiểm tra lại thiết lập bảo mật tài khoản ngay.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Hủy liên kết Google thành công', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 08. ACCOUNT UNLOCKED TEMPLATE ──────────────────────────────────────────
/**
 * 08. Account Unlocked
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} [params.eventTime]
 * @param {string} [params.timestamp]
 * @param {string} [params.ipMasked]
 * @param {string} [params.ip]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildAccountUnlockedEmail({ ndid, eventTime = null, timestamp = null, ipMasked = null, ip = null }) {
  const safeNdid = escapeHtml(ndid);
  const effectiveTime = eventTime || timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const safeTime = escapeHtml(effectiveTime);
  const safeIp = escapeHtml(ipMasked || ip || '—');

  const subject = '[ND Labs] Thông báo bảo mật: Tài khoản của bạn đã được mở khóa';
  const preheader = 'Tài khoản ND Labs của bạn đã được mở khóa và có thể đăng nhập bình thường.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Tài khoản ND Labs của bạn đã được mở khóa thành công. Bạn hiện có thể đăng nhập và sử dụng các dịch vụ bình thường.
    </p>
    <div class="info-card">
      <table class="info-table">
        <tr>
          <td class="info-label">Trạng thái:</td>
          <td class="info-value" style="color: #16a34a;">Đang hoạt động (Active)</td>
        </tr>
        <tr>
          <td class="info-label">Thời gian:</td>
          <td class="info-value">${safeTime}</td>
        </tr>
        <tr>
          <td class="info-label">Địa chỉ IP:</td>
          <td class="info-value" style="font-family: monospace;">${safeIp}</td>
        </tr>
      </table>
    </div>
  `;

  const securityNote = 'Hãy đảm bảo tài khoản của bạn luôn được thiết lập mật khẩu mạnh và không chia sẻ cho người khác.';

  const text = `Xin chào ${ndid},

Tài khoản ND Labs của bạn đã được mở khóa thành công.
- Trạng thái: Đang hoạt động
- Thời gian: ${safeTime}
- Địa chỉ IP: ${safeIp}

Lưu ý bảo mật: Hãy đảm bảo tài khoản luôn được thiết lập mật khẩu mạnh và an toàn.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Tài khoản đã được mở khóa', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 09. EMAIL CHANGE TEMPLATE ──────────────────────────────────────────────
/**
 * 09. Email Change Request Verification
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} params.newEmail - The new email address requested
 * @param {string} params.verificationUrl - URL with verification token
 * @param {number} [params.expiresHours=24]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildEmailChangeEmail({ ndid, newEmail, verificationUrl, expiresHours = 24 }) {
  const safeNdid = escapeHtml(ndid);
  const safeNewEmail = escapeHtml(newEmail);
  const subject = '[ND Labs] Xác nhận cập nhật địa chỉ email';
  const preheader = 'Vui lòng xác nhận yêu cầu đổi địa chỉ email cho tài khoản ND Labs của bạn.';

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Chúng tôi nhận được yêu cầu cập nhật địa chỉ email đăng nhập tài khoản ND Labs sang <strong>${safeNewEmail}</strong>.
    </p>
    <div style="text-align: center; margin: 24px 0 20px;">
      <a href="${verificationUrl}" class="btn-action" target="_blank" rel="noopener">Xác nhận email mới</a>
    </div>
    <div class="info-card">
      <div style="font-size: 13px; color: #64748B;">
        Nếu nút bấm không hoạt động, bạn có thể sao chép liên kết này vào trình duyệt:<br>
        <a href="${verificationUrl}" style="color: #0070F3; word-break: break-all; font-weight: 500;">${verificationUrl}</a>
      </div>
    </div>
    <p class="email-text" style="font-size: 13px; color: #64748B; margin: 0;">
      Liên kết xác nhận có hiệu lực trong <strong>${expiresHours} giờ</strong>.
    </p>
  `;

  const securityNote = 'Nếu bạn không yêu cầu thay đổi email, hãy bỏ qua thư này để giữ nguyên thông tin hiện tại.';

  const text = `Xin chào ${ndid},

Chúng tôi nhận được yêu cầu cập nhật địa chỉ email tài khoản ND Labs sang ${newEmail}.
Vui lòng truy cập liên kết sau để xác nhận:

${verificationUrl}

Liên kết có hiệu lực trong ${expiresHours} giờ.
Lưu ý bảo mật: Nếu bạn không yêu cầu thay đổi email, hãy bỏ qua thư này.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Xác nhận cập nhật email', preheader, contentHtml, securityNote }),
    text,
  };
}

// ─── 10. GENERIC SECURITY NOTICE TEMPLATE ───────────────────────────────────
/**
 * 10. Generic Security Notice
 * @param {Object} params
 * @param {string} params.ndid - Raw NDID
 * @param {string} params.eventType - Security event code
 * @param {string} params.description - Human-readable description
 * @param {string} [params.eventTime]
 * @param {string} [params.timestamp]
 * @param {string} [params.ipMasked]
 * @param {string} [params.ip]
 * @param {string} [params.device]
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildGenericSecurityNoticeEmail({ ndid, eventType, description, eventTime = null, timestamp = null, ipMasked = null, ip = null, device = null }) {
  const safeNdid = escapeHtml(ndid);
  const safeDesc = escapeHtml(description);
  const safeType = escapeHtml(eventType || 'SECURITY_EVENT');
  const effectiveTime = eventTime || timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const safeTime = escapeHtml(effectiveTime);
  const safeIp = escapeHtml(ipMasked || ip || '—');
  const safeDevice = escapeHtml(device || 'Không xác định');

  const subject = `[ND Labs] Thông báo bảo mật: ${description}`;
  const preheader = `Thông báo bảo mật quan trọng liên quan đến tài khoản ND Labs của bạn: ${description}`;

  const contentHtml = `
    <div class="email-greeting">Xin chào ${safeNdid},</div>
    <p class="email-text">
      Chúng tôi gửi thông báo này để cập nhật về một hoạt động bảo mật vừa diễn ra trên tài khoản ND Labs của bạn:
    </p>
    <div class="info-card">
      <table class="info-table">
        <tr>
          <td class="info-label">Hoạt động:</td>
          <td class="info-value">${safeDesc}</td>
        </tr>
        <tr>
          <td class="info-label">Mã sự kiện:</td>
          <td class="info-value" style="font-family: monospace; color: #0070F3;">${safeType}</td>
        </tr>
        <tr>
          <td class="info-label">Thời gian:</td>
          <td class="info-value">${safeTime}</td>
        </tr>
        <tr>
          <td class="info-label">Thiết bị:</td>
          <td class="info-value">${safeDevice}</td>
        </tr>
        <tr>
          <td class="info-label">Địa chỉ IP:</td>
          <td class="info-value" style="font-family: monospace;">${safeIp}</td>
        </tr>
      </table>
    </div>
  `;

  const securityNote = 'Nếu bạn không thực hiện hành động này, vui lòng truy cập https://ndsite.web.app/auth/settings/ để bảo vệ tài khoản ngay.';

  const text = `Xin chào ${ndid},

Thông báo hoạt động bảo mật trên tài khoản ND Labs của bạn:
- Hoạt động: ${description}
- Mã sự kiện: ${eventType || ''}
- Thời gian: ${safeTime}
- Thiết bị: ${safeDevice}
- Địa chỉ IP: ${safeIp}

Lưu ý bảo mật: Nếu bạn không nhận ra thao tác này, vui lòng truy cập ${BRAND_HOME_URL}/auth/settings/ để bảo vệ tài khoản ngay.

${BRAND_LABEL} - ${BRAND_HOME_URL}`;

  return {
    subject,
    html: wrapBaseLayout({ title: 'Thông báo bảo mật', preheader, contentHtml, securityNote }),
    text,
  };
}

/**
 * Backward compatibility alias for existing code
 */
const buildSecurityNotificationEmail = buildGenericSecurityNoticeEmail;

module.exports = {
  BRAND_LOGO_URL,
  BRAND_HOME_URL,
  BRAND_LABEL,
  escapeHtml,
  wrapBaseLayout,
  // 10 Official Canonical Templates
  buildVerificationEmail,          // 01
  buildRecoveryEmail,              // 02
  buildPasswordResetSuccessEmail,  // 03
  buildPasswordChangedEmail,       // 04
  buildNewLoginSecurityEmail,      // 05
  buildGoogleLinkedEmail,          // 06
  buildGoogleUnlinkedEmail,        // 07
  buildAccountUnlockedEmail,       // 08
  buildEmailChangeEmail,           // 09
  buildGenericSecurityNoticeEmail, // 10
  // Compatibility alias
  buildSecurityNotificationEmail,
};
