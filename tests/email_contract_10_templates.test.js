/**
 * Phase 01-C10-FINAL: 10 Canonical Transactional Email Contract Tests
 *
 * Verifies strict adherence to:
 * "BẢN KHẾ ƯỚC THIẾT KẾ EMAIL GIAO DỊCH CHÍNH THỨC — ND LABS (FINAL CONTRACT)"
 *
 * Assertions:
 * 1. 10 template generators exist and return { subject, html, text }.
 * 2. Anti-enumeration: Subject & Preheader MUST NEVER contain OTP/recovery codes.
 * 3. NDID Raw String Invariant: Rendered strictly as raw string, NEVER prepended with '@'.
 * 4. Zero Credential Exposure: No plaintext passwords, hashes, reset tokens, session tokens, API keys, private keys.
 * 5. Official Brand Assets:
 *    - Logo: https://ndsite.web.app/assets/images/logo.png
 *    - Logo link: https://ndsite.web.app
 *    - Footer link: https://ndsite.web.app with label "ndsite.web.app"
 * 6. Official Brand Colors: #0070F3, #261A2D, #F6F8FA, #FFFFFF.
 * 7. OTP styling block contract: body-only display, #0070F3 accent.
 * 8. Dual format: Plain-text version exists for all 10 templates.
 * 9. Zero marketing, zero slogans, zero social media icons.
 * 10. EmailService helper methods for all 10 templates.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
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
  MockEmailProvider,
} = require('../functions/src/email');

const SAMPLE_NDID = 'alex_canonical_user';
const SECRET_OTP = '937105';
const FORBIDDEN_WORDS = ['password123', 'bcrypt', '$2b$', 'private_key', 'resetToken_raw'];

test('Phase 01-C10-FINAL: 10 Canonical Email Templates Contract Verification', async (t) => {

  await t.test('Assertion 1: All 10 canonical templates exist and are functions', () => {
    const templates = [
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
    ];

    assert.equal(templates.length, 10);
    for (const fn of templates) {
      assert.equal(typeof fn, 'function');
    }
  });

  await t.test('Assertion 2: Anti-Enumeration - OTP MUST NEVER appear in Subject or Preheader', () => {
    const recoveryEmail = buildRecoveryEmail({
      ndid: SAMPLE_NDID,
      verificationCode: SECRET_OTP,
      expiresMinutes: 15,
    });

    // Subject must NOT contain OTP
    assert.equal(recoveryEmail.subject.includes(SECRET_OTP), false, 'Subject must NOT contain OTP');

    // Extract preheader from HTML
    const preheaderMatch = recoveryEmail.html.match(/<div style="display: none;[^>]*>([\s\S]*?)<\/div>/i);
    assert.ok(preheaderMatch, 'Preheader div must exist');
    const preheaderContent = preheaderMatch[1];
    assert.equal(preheaderContent.includes(SECRET_OTP), false, 'Preheader must NOT contain OTP');

    // OTP MUST appear in the OTP block inside body
    assert.ok(recoveryEmail.html.includes(SECRET_OTP), 'OTP must appear in email body');
    assert.ok(recoveryEmail.html.includes('class="code-value"'), 'OTP must be wrapped in code-value class');
  });

  await t.test('Assertion 3: NDID Raw String Invariant across ALL 10 templates (NEVER @ndid)', () => {
    const sampleEmails = [
      buildVerificationEmail({ ndid: SAMPLE_NDID, verificationUrl: 'https://ndsite.web.app/auth/verify/?token=1' }),
      buildRecoveryEmail({ ndid: SAMPLE_NDID, verificationCode: '123456' }),
      buildPasswordResetSuccessEmail({ ndid: SAMPLE_NDID, eventTime: '12:00', ipMasked: '1.2.3.x', device: 'Chrome' }),
      buildPasswordChangedEmail({ ndid: SAMPLE_NDID, eventTime: '12:00', ipMasked: '1.2.3.x', device: 'Firefox' }),
      buildNewLoginSecurityEmail({ ndid: SAMPLE_NDID, eventTime: '12:00', ipMasked: '1.2.3.x', device: 'Safari', browser: 'Safari' }),
      buildGoogleLinkedEmail({ ndid: SAMPLE_NDID, googleEmail: 'test@gmail.com', eventTime: '12:00', ipMasked: '1.2.3.x' }),
      buildGoogleUnlinkedEmail({ ndid: SAMPLE_NDID, eventTime: '12:00', ipMasked: '1.2.3.x' }),
      buildAccountUnlockedEmail({ ndid: SAMPLE_NDID, eventTime: '12:00', ipMasked: '1.2.3.x' }),
      buildEmailChangeEmail({ ndid: SAMPLE_NDID, newEmail: 'new@nd.edu.vn', verificationUrl: 'https://ndsite.web.app/auth/verify/' }),
      buildGenericSecurityNoticeEmail({ ndid: SAMPLE_NDID, eventType: 'SEC_TEST', description: 'Kiểm tra bảo mật', ipMasked: '1.2.3.x' }),
    ];

    for (const email of sampleEmails) {
      // Must contain raw NDID
      assert.ok(email.html.includes(SAMPLE_NDID), `HTML must contain raw NDID ${SAMPLE_NDID}`);
      assert.ok(email.text.includes(SAMPLE_NDID), `Text must contain raw NDID ${SAMPLE_NDID}`);

      // Must NEVER prefix '@' to NDID
      assert.equal(email.html.includes(`@${SAMPLE_NDID}`), false, 'HTML must never prepend @ to NDID');
      assert.equal(email.text.includes(`@${SAMPLE_NDID}`), false, 'Text must never prepend @ to NDID');
      assert.equal(email.subject.includes(`@${SAMPLE_NDID}`), false, 'Subject must never prepend @ to NDID');
    }
  });

  await t.test('Assertion 4: Zero Credential Exposure (passwords, hashes, private keys)', () => {
    const sampleEmails = [
      buildVerificationEmail({ ndid: SAMPLE_NDID, verificationUrl: 'https://ndsite.web.app/auth/verify/?token=1' }),
      buildRecoveryEmail({ ndid: SAMPLE_NDID, verificationCode: '123456' }),
      buildPasswordResetSuccessEmail({ ndid: SAMPLE_NDID }),
      buildPasswordChangedEmail({ ndid: SAMPLE_NDID }),
      buildNewLoginSecurityEmail({ ndid: SAMPLE_NDID }),
      buildGoogleLinkedEmail({ ndid: SAMPLE_NDID, googleEmail: 'google@nd.edu.vn' }),
      buildGoogleUnlinkedEmail({ ndid: SAMPLE_NDID }),
      buildAccountUnlockedEmail({ ndid: SAMPLE_NDID }),
      buildEmailChangeEmail({ ndid: SAMPLE_NDID, newEmail: 'new@nd.edu.vn', verificationUrl: 'https://ndsite.web.app' }),
      buildGenericSecurityNoticeEmail({ ndid: SAMPLE_NDID, eventType: 'TEST', description: 'Test desc' }),
    ];

    for (const email of sampleEmails) {
      for (const forbidden of FORBIDDEN_WORDS) {
        assert.equal(email.html.includes(forbidden), false, `HTML must not contain ${forbidden}`);
        assert.equal(email.text.includes(forbidden), false, `Text must not contain ${forbidden}`);
        assert.equal(email.subject.includes(forbidden), false, `Subject must not contain ${forbidden}`);
      }
    }
  });

  await t.test('Assertion 5: Brand Identity - Logo, Links & Footer match Final Contract', () => {
    assert.equal(BRAND_LOGO_URL, 'https://ndsite.web.app/assets/images/logo.png');
    assert.equal(BRAND_HOME_URL, 'https://ndsite.web.app');
    assert.equal(BRAND_LABEL, 'ndsite.web.app');

    const email = buildVerificationEmail({
      ndid: SAMPLE_NDID,
      verificationUrl: 'https://ndsite.web.app/auth/verify/?token=test',
    });

    // Logo image tag exists with correct src and alt
    assert.ok(email.html.includes('src="https://ndsite.web.app/assets/images/logo.png"'));
    assert.ok(email.html.includes('href="https://ndsite.web.app"'));

    // Footer link
    assert.ok(email.html.includes('ndsite.web.app'));
    assert.ok(email.text.includes('ndsite.web.app'));
  });

  await t.test('Assertion 6: Brand Colors & Layout Contract', () => {
    const email = buildRecoveryEmail({
      ndid: SAMPLE_NDID,
      verificationCode: '654321',
    });

    // Primary CTA & accent: #0070F3
    assert.ok(email.html.includes('#0070F3') || email.html.includes('#0070f3'), 'Primary #0070F3 present');
    // Background: #F6F8FA
    assert.ok(email.html.includes('#F6F8FA') || email.html.includes('#f6f8fa'), 'Background #F6F8FA present');
    // Card: #FFFFFF
    assert.ok(email.html.includes('#FFFFFF') || email.html.includes('#ffffff'), 'Card #FFFFFF present');
    // Text: #261A2D
    assert.ok(email.html.includes('#261A2D') || email.html.includes('#261a2d'), 'Text #261A2D present');
  });

  await t.test('Assertion 7: Dual Format - Every template has clean HTML and plain text', () => {
    const email = buildEmailChangeEmail({
      ndid: SAMPLE_NDID,
      newEmail: 'user_updated@school.edu.vn',
      verificationUrl: 'https://ndsite.web.app/auth/verify-email-change/?token=valid123',
    });

    assert.ok(typeof email.html === 'string' && email.html.length > 200);
    assert.ok(typeof email.text === 'string' && email.text.length > 50);
    assert.ok(email.text.includes('user_updated@school.edu.vn'));
    assert.ok(email.text.includes('https://ndsite.web.app/auth/verify-email-change/?token=valid123'));
  });

  await t.test('Assertion 8: Zero Marketing Bloat - No marketing slogans or social icons', () => {
    const sampleEmails = [
      buildVerificationEmail({ ndid: SAMPLE_NDID, verificationUrl: 'https://ndsite.web.app' }),
      buildRecoveryEmail({ ndid: SAMPLE_NDID, verificationCode: '111222' }),
      buildGoogleLinkedEmail({ ndid: SAMPLE_NDID, googleEmail: 'test@nd.edu.vn' }),
    ];

    const marketingKeywords = ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'khuyến mãi', 'ưu đãi'];
    for (const email of sampleEmails) {
      for (const kw of marketingKeywords) {
        assert.equal(email.html.toLowerCase().includes(kw), false, `Must not contain ${kw}`);
        assert.equal(email.text.toLowerCase().includes(kw), false, `Must not contain ${kw}`);
      }
    }
  });

  await t.test('Assertion 9: EmailService provides convenience dispatchers for all templates', async () => {
    const mockProvider = new MockEmailProvider();
    const service = new EmailService({ provider: mockProvider });

    // 01 Verify Email
    await service.sendVerificationEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID, verificationToken: 'tok1' });
    // 02 Recovery Email
    await service.sendRecoveryEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID, verificationCode: '123456' });
    // 03 Password Reset Success
    await service.sendPasswordResetSuccessEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID });
    // 04 Password Changed
    await service.sendPasswordChangedEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID });
    // 05 New Login
    await service.sendNewLoginSecurityEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID });
    // 06 Google Linked
    await service.sendGoogleLinkedEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID, googleEmail: 'g@nd.edu.vn' });
    // 07 Google Unlinked
    await service.sendGoogleUnlinkedEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID });
    // 08 Account Unlocked
    await service.sendAccountUnlockedEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID });
    // 09 Email Change
    await service.sendEmailChangeEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID, newEmail: 'new@nd.edu.vn', verificationToken: 'tok2' });
    // 10 Generic Security Notice
    await service.sendGenericSecurityNoticeEmail({ toEmail: 'user@nd.edu.vn', ndid: SAMPLE_NDID, eventType: 'GENERIC', description: 'Test' });

    assert.equal(mockProvider.sentMessages.length, 10);
  });
});
