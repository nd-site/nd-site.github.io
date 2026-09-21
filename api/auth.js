/**
 * Vercel Serverless Function Adapter for ND Labs Canonical Auth
 *
 * Implements a standard Node.js HTTP request listener for Vercel Functions:
 * - Replaces firebase-functions v2 onRequest wrapper
 * - Integrates directly with functions/src/index.js (Canonical Foundation)
 * - Strict CORS policy: https://ndsite.web.app (plus local dev)
 * - Exposes all 21 Canonical Auth endpoints under /api/:endpoint or /api/auth?action=:endpoint
 */

'use strict';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const canonicalFoundation = require('../functions/src/index');

const ALLOWED_ORIGINS = [
  'https://ndsite.web.app',
  'https://nd-site.github.io',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500'
];

function setCORSHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://ndsite.web.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try {
        resolve(bodyStr ? JSON.parse(bodyStr) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function getAuthenticatedCodeId(req, auth) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await auth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

async function handleCanonicalAuth(req, res) {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parse URL pathname to determine action
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  let action = urlObj.searchParams.get('action');

  if (!action) {
    action = pathParts[pathParts.length - 1];
    if (action === 'auth' || action === 'index' || action === 'api') {
      action = pathParts[pathParts.length - 2] || '';
    }
  }

  // Fallback check query parameter
  if (!action || action === 'api') {
    action = urlObj.searchParams.get('endpoint') || urlObj.searchParams.get('action') || '';
  }

  if (req.method === 'GET' && (action === 'health' || !action)) {
    const emailDiag = canonicalFoundation.validateEmailConfig ? canonicalFoundation.validateEmailConfig() : null;
    sendJson(res, 200, {
      status: 'ok',
      service: 'nd-canonical-auth',
      runtime: 'vercel-node',
      email: emailDiag ? {
        provider: emailDiag.provider,
        configured: emailDiag.apiKeyConfigured,
        ready: emailDiag.isProductionReady,
        sender: emailDiag.senderAddress,
      } : undefined,
    });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ phương thức POST' } });
    return;
  }

  const body = await parseBody(req);
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  const db = canonicalFoundation.getFirestoreDb();
  const auth = canonicalFoundation.getAuth();

  try {
    switch (action) {
      case 'registerUser': {
        const result = await canonicalFoundation.registerUser({
          db,
          auth,
          ndid: body.ndid,
          password: body.password,
          email: body.email,
          name: body.name,
          displayName: body.displayName,
          ip,
          userAgent,
          idempotencyKey: body.idempotencyKey,
        });
        sendJson(res, 201, result);
        return;
      }

      case 'loginUser': {
        const result = await canonicalFoundation.loginUser({
          db,
          auth,
          identifier: body.identifier,
          password: body.password,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'changePassword': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.changePassword({
          db,
          codeId,
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'changeNdid': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.changeNdid({
          db,
          codeId,
          newNdid: body.newNdid,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'linkGoogleIdentity': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.linkGoogleIdentity({
          db,
          auth,
          codeId,
          googleSubjectId: body.googleSubjectId || null,
          googleEmail: body.googleEmail || null,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'unlinkGoogleIdentity': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.unlinkGoogleIdentity({
          db,
          auth,
          codeId,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'requestRecoveryCode': {
        const result = await canonicalFoundation.requestAccountRecovery({
          db,
          identifier: body.identifier || '',
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'verifyRecoveryCode': {
        const result = await canonicalFoundation.verifyRecoveryCode({
          db,
          identifier: body.identifier || '',
          code: body.code || '',
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'resetPasswordWithRecovery': {
        const result = await canonicalFoundation.resetPasswordWithRecovery({
          db,
          auth,
          identifier: body.identifier || '',
          resetToken: body.resetToken || '',
          newPassword: body.newPassword || '',
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'registerSession': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.registerSession({
          db,
          codeId,
          sessionId: body.sessionId || null,
          deviceId: body.deviceId || null,
          deviceLabel: body.deviceLabel || null,
          userAgent,
          ip,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'getActiveSessions': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const currentSessionId = urlObj.searchParams.get('currentSessionId') || body.currentSessionId || null;
        const result = await canonicalFoundation.listActiveSessions({
          db,
          codeId,
          currentSessionId,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'revokeSession': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.revokeUserSession({
          db,
          auth,
          codeId,
          sessionId: body.sessionId,
          currentSessionId: body.currentSessionId || null,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'revokeOtherSessions': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.revokeOtherUserSessions({
          db,
          auth,
          codeId,
          currentSessionId: body.currentSessionId || null,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'registerTrustedDevice': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.registerTrustedDeviceForUser({
          db,
          codeId,
          deviceId: body.deviceId || null,
          deviceLabel: body.deviceLabel || null,
          deviceFingerprint: body.deviceFingerprint || null,
          userAgent,
          ip,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'getTrustedDevices': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const currentDeviceId = urlObj.searchParams.get('currentDeviceId') || body.currentDeviceId || null;
        const result = await canonicalFoundation.listTrustedDevicesForUser({
          db,
          codeId,
          currentDeviceId,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'revokeTrustedDevice': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.revokeTrustedDeviceForUser({
          db,
          codeId,
          deviceId: body.deviceId,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'getSecurityActivity': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const limitParam = urlObj.searchParams.get('limit') || body.limit || '20';
        const limit = parseInt(limitParam, 10);
        const result = await canonicalFoundation.getRecentSecurityActivityForUser({
          db,
          codeId,
          limit: isNaN(limit) ? 20 : limit,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'updateUserRole': {
        const callerCodeId = await getAuthenticatedCodeId(req, auth);
        if (!callerCodeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.updateUserRoleAndLevel({
          db,
          callerCodeId,
          targetCodeId: body.targetCodeId,
          newRole: body.role,
          newAdminLevel: body.adminLevel !== undefined ? body.adminLevel : null,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'adminGetUsers': {
        const callerCodeId = await getAuthenticatedCodeId(req, auth);
        if (!callerCodeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const callerContext = await canonicalFoundation.getUserAuthorizationContext(db, callerCodeId);
        canonicalFoundation.assertAdmin(callerContext);

        const rawPageSize = parseInt(urlObj.searchParams.get('pageSize') || body.pageSize || '20', 10);
        const pageSize = Math.min(Math.max(isNaN(rawPageSize) ? 20 : rawPageSize, 1), 100);
        const cursor = (urlObj.searchParams.get('cursor') || body.cursor || '').trim() || null;
        const roleFilter = (urlObj.searchParams.get('role') || body.role || '').trim().toLowerCase();

        let query = db.collection('users').orderBy('codeId').limit(pageSize + 1);
        if (roleFilter && (roleFilter === 'admin' || roleFilter === 'user')) {
          query = query.where('role', '==', roleFilter);
        }
        if (cursor) {
          query = query.startAfter(cursor);
        }

        const snapshot = await query.get();
        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const userDocs = hasMore ? docs.slice(0, pageSize) : docs;
        const nextCursor = hasMore && userDocs.length > 0 ? userDocs[userDocs.length - 1].id : null;

        const users = userDocs.map((doc) => {
          const data = doc.data() || {};
          let formattedCreatedAt = null;
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              formattedCreatedAt = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === 'string') {
              formattedCreatedAt = data.createdAt;
            }
          }
          return {
            codeId: doc.id,
            ndid: data.ndid || null,
            email: data.email || null,
            displayName: data.displayName || data.name || null,
            role: data.role || 'user',
            adminLevel: data.adminLevel || null,
            status: data.status || 'active',
            createdAt: formattedCreatedAt,
            photoURL: data.photoURL || null,
          };
        });

        sendJson(res, 200, {
          success: true,
          users,
          nextCursor,
          hasMore,
        });
        return;
      }

      case 'loginWithGoogle': {
        // Expected fields:
        // - googleSubjectId (string) – always present
        // - googleEmail (optional) – may be sent for email verification
        // - googleDisplayName (optional)
        // - ndid (optional) – present when client is provisioning a new account
        // - pendingSessionId (optional) – present when provisioning request follows a pending session
        const { googleSubjectId, googleEmail = null, googleDisplayName = null, ndid, pendingSessionId } = body;
        if (!googleSubjectId || typeof googleSubjectId !== 'string') {
          sendJson(res, 400, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Google Subject ID không hợp lệ.' } });
          return;
        }
        const cleanSubjectId = googleSubjectId.trim();
        // Try to resolve an existing linked Google identity
        const mapping = await canonicalFoundation.resolveGoogleSubjectToCodeId(db, cleanSubjectId);
        if (mapping && mapping.codeId) {
          // Existing linked account – issue custom token (same as original flow)
          const codeId = mapping.codeId;
          const userDoc = await db.collection(canonicalFoundation.USERS_COLLECTION).doc(codeId).get();
          if (!userDoc.exists) {
            sendJson(res, 401, { success: false, error: { code: 'AUTH_CREDENTIALS_INVALID', message: 'Thông tin đăng nhập không hợp lệ.' } });
            return;
          }
          const userData = userDoc.data();
          if (userData.status === 'locked') {
            sendJson(res, 403, { success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng khôi phục tài khoản.' } });
            return;
          }
          if (userData.status === 'disabled' || userData.status === 'banned') {
            sendJson(res, 403, { success: false, error: { code: 'ACCOUNT_DISABLED', message: 'Tài khoản này đã bị vô hiệu hóa hoặc tạm khóa.' } });
            return;
          }
          const customToken = await auth.createCustomToken(codeId);
          await canonicalFoundation.recordSecurityEvent(db, {
            eventType: 'google_login_success',
            actorCodeID: codeId,
            targetCodeID: codeId,
            ip,
            userAgent,
            details: { googleSubjectId: cleanSubjectId },
          });
          await db.collection(canonicalFoundation.USERS_COLLECTION).doc(codeId).update({
            lastLoginAt: canonicalFoundation.admin.firestore.FieldValue.serverTimestamp(),
          });
          sendJson(res, 200, {
            success: true,
            codeId,
            customToken,
            user: {
              codeId,
              ndid: userData.ndid || '',
              displayName: userData.displayName || userData.name || userData.ndid || '',
              role: userData.role || 'user',
              adminLevel: userData.adminLevel || null,
            },
          });
          return;
        }
        // No existing mapping – this is a first‑time Google login
        if (ndid && pendingSessionId) {
          // Client is provisioning a new account using the pending session
          const provisionResult = await canonicalFoundation.provisionGoogleAccount({
            db,
            auth,
            pendingSessionId,
            ndid,
            ip,
            userAgent,
          });
          // provisionGoogleAccount returns { success, codeId, customToken, user }
          sendJson(res, 200, provisionResult);
          return;
        }
        // Otherwise create a pending session and ask client to provide NDID
        const pending = await canonicalFoundation.createGooglePendingSession(db, {
          googleSubjectId: cleanSubjectId,
          googleEmail,
          googleDisplayName,
        });
        sendJson(res, 200, {
          success: false,
          needsProvisioning: true,
          pendingSessionId: pending.pendingSessionId,
          expiresAt: pending.expiresAt,
        });
        return;
      }

      case 'sendVerificationEmail': {
        const codeId = await getAuthenticatedCodeId(req, auth);
        if (!codeId) {
          sendJson(res, 401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.generateEmailVerification({
          db,
          codeId,
          email: body.email || null,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      case 'verifyEmail': {
        const token = body.token || urlObj.searchParams.get('token');
        if (!token || typeof token !== 'string') {
          sendJson(res, 400, { success: false, error: { code: 'INVALID_ARGUMENT', message: 'Vui lòng cung cấp mã xác thực email hợp lệ.' } });
          return;
        }
        const result = await canonicalFoundation.verifyEmailToken({
          db,
          auth,
          token,
          ip,
          userAgent,
        });
        sendJson(res, 200, result);
        return;
      }

      default: {
        sendJson(res, 404, { success: false, error: { code: 'NOT_FOUND', message: `Endpoint '${action}' không tồn tại trên hệ thống xác thực.` } });
        return;
      }
    }
  } catch (err) {
    const status = err.status || (action === 'loginUser' ? 401 : 400);
    sendJson(res, status, {
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'Đã xảy ra lỗi máy chủ nội bộ',
      },
    });
  }
}

export default handleCanonicalAuth;
export { handleCanonicalAuth };
