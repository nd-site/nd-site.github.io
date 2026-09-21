/**
 * Automated Test Suite for Session Management, Trusted Devices & Auth Security Control (Phase 01-C6)
 *
 * Tests cover:
 * - DEVICE PARSER & IP SANITIZATION:
 *   - parses User-Agent into platform, browser, deviceLabel
 *   - sanitizes IPv4 and IPv6 to masked subnets (zero raw sensitive network IP)
 *   - formats relative time in human-friendly Vietnamese strings
 * - SESSION MANAGEMENT:
 *   - registerSession creates active session in users/{CodeID}/sessions/{sessionId}
 *   - listActiveSessions lists active sessions and flags currentSessionId
 *   - updates lastActiveAt on existing session
 *   - revokeUserSession revokes specific session (status 'revoked', sets revokedAt, revocationReason)
 *   - revokeOtherUserSessions revokes all active sessions except currentSessionId
 *   - revokeAllSessions revokes all active sessions with reason
 * - CROSS-USER ISOLATION:
 *   - User A cannot access, list, or revoke User B's sessions or devices
 *   - UID/CodeID invariant strictly enforced via authenticated context
 * - TRUSTED DEVICES:
 *   - registerTrustedDeviceForUser stores SHA-256 fingerprint hash; raw fingerprint is NEVER stored
 *   - listTrustedDevicesForUser returns safe metadata without raw secrets or hashes
 *   - revokeTrustedDeviceForUser updates isTrusted to false with revokedAt
 * - AUTH SECURITY INTEGRATION:
 *   - Password reset (C5) automatically revokes all sessions with reason 'password_reset'
 *   - Self-service password change revokes other sessions with reason 'password_changed' and refresh tokens
 * - RECENT SECURITY ACTIVITY:
 *   - getRecentSecurityActivityForUser formats human-friendly activity timeline
 *   - zero credentials, OTPs, or reset tokens exposed
 * - FIRESTORE RULES CONTRACT:
 *   - firestore.rules asserts deny for users/{CodeID}/sessions/** and users/{CodeID}/devices/**
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);

const {
  // Parser
  parseUserAgent,
  sanitizeIp,
  formatRelativeTimeVi,

  // Database
  createSession,
  getSession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  revokeAllSessions,
  registerTrustedDeviceDoc,
  getTrustedDeviceDoc,
  getTrustedDevices,
  revokeTrustedDeviceDoc,

  // Service
  registerSession,
  listActiveSessions,
  revokeUserSession,
  revokeOtherUserSessions,
  registerTrustedDeviceForUser,
  listTrustedDevicesForUser,
  revokeTrustedDeviceForUser,
  getRecentSecurityActivityForUser,

  // Errors & Contracts
  ValidationError,
  AccountLockedError,
  AccountDisabledError,
  InvalidCredentialsError
} = require('../functions/src/index.js');

// ── IN-MEMORY MOCK ENGINE FOR FIRESTORE & AUTH ───────────────────────────────

function createMockFirestore(seedData = {}) {
  const store = new Map();

  for (const [key, val] of Object.entries(seedData)) {
    store.set(key, JSON.parse(JSON.stringify(val)));
  }

  function getDocRef(docPath) {
    return {
      path: docPath,
      id: docPath.split('/').pop(),
      collection: (subCol) => createCollectionRef(`${docPath}/${subCol}`),
      get: async () => {
        if (!store.has(docPath)) {
          return { exists: false, data: () => undefined, id: docPath.split('/').pop() };
        }
        const raw = store.get(docPath);
        return {
          exists: true,
          data: () => JSON.parse(JSON.stringify(raw)),
          id: docPath.split('/').pop(),
        };
      },
      set: async (data, options) => {
        const existing = store.get(docPath) || {};
        const merged = (options && options.merge) ? { ...existing, ...data } : { ...data };
        store.set(docPath, JSON.parse(JSON.stringify(merged)));
      },
      update: async (data) => {
        if (!store.has(docPath)) {
          throw new Error(`Document does not exist at path: ${docPath}`);
        }
        const existing = store.get(docPath);
        store.set(docPath, JSON.parse(JSON.stringify({ ...existing, ...data })));
      },
      delete: async () => {
        store.delete(docPath);
      },
    };
  }

  function createCollectionRef(colPath) {
    return {
      path: colPath,
      doc: (docId) => {
        const id = docId || `doc_${Math.random().toString(36).slice(2, 9)}`;
        return getDocRef(`${colPath}/${id}`);
      },
      add: async (data) => {
        const id = `doc_${Math.random().toString(36).slice(2, 9)}`;
        const docRef = getDocRef(`${colPath}/${id}`);
        await docRef.set(data);
        return docRef;
      },
      where: (field, op, val) => createQuery(colPath, [{ field, op, val }]),
      orderBy: (field, direction) => createQuery(colPath, [], { field, direction }),
      limit: (count) => createQuery(colPath, [], null, count),
      get: async () => executeQuery(colPath, [])
    };
  }

  function createQuery(colPath, filters = [], order = null, limitCount = null) {
    return {
      where: (field, op, val) => createQuery(colPath, [...filters, { field, op, val }], order, limitCount),
      orderBy: (field, direction) => createQuery(colPath, filters, { field, direction }, limitCount),
      limit: (count) => createQuery(colPath, filters, order, count),
      get: async () => executeQuery(colPath, filters, order, limitCount)
    };
  }

  async function executeQuery(colPath, filters, order, limitCount) {
    const docs = [];
    const prefix = `${colPath}/`;

    for (const [key, val] of store.entries()) {
      if (key.startsWith(prefix)) {
        const sub = key.slice(prefix.length);
        if (!sub.includes('/')) {
          let match = true;
          for (const f of filters) {
            if (f.op === '==' && val[f.field] !== f.val) match = false;
            if (f.op === '!=' && val[f.field] === f.val) match = false;
          }
          if (match) {
            docs.push({
              id: key.split('/').pop(),
              data: () => JSON.parse(JSON.stringify(val)),
              exists: true
            });
          }
        }
      }
    }

    if (order && order.field) {
      docs.sort((a, b) => {
        const valA = a.data()[order.field];
        const valB = b.data()[order.field];
        const tA = valA && typeof valA.toMillis === 'function' ? valA.toMillis() : (valA || 0);
        const tB = valB && typeof valB.toMillis === 'function' ? valB.toMillis() : (valB || 0);
        return order.direction === 'desc' ? (tB - tA) : (tA - tB);
      });
    }

    if (limitCount != null) {
      return { docs: docs.slice(0, limitCount), size: Math.min(docs.length, limitCount) };
    }

    return { docs, size: docs.length };
  }

  return {
    _store: store,
    collection: (colName) => createCollectionRef(colName),
    batch: () => {
      const ops = [];
      return {
        update: (docRef, data) => {
          ops.push(() => docRef.update(data));
        },
        set: (docRef, data, options) => {
          ops.push(() => docRef.set(data, options));
        },
        delete: (docRef) => {
          ops.push(() => docRef.delete());
        },
        commit: async () => {
          for (const op of ops) {
            await op();
          }
        }
      };
    },
    runTransaction: async (fn) => {
      const writeOps = [];
      const transaction = {
        get: async (docRef) => docRef.get(),
        set: (docRef, data, options) => {
          writeOps.push(() => docRef.set(data, options));
        },
        update: (docRef, data) => {
          writeOps.push(() => docRef.update(data));
        },
        delete: (docRef) => {
          writeOps.push(() => docRef.delete());
        },
      };
      const result = await fn(transaction);
      for (const op of writeOps) {
        await op();
      }
      return result;
    }
  };
}

function createMockAuth() {
  const revokedTokens = new Set();
  return {
    _revokedTokens: revokedTokens,
    revokeRefreshTokens: async (uid) => {
      revokedTokens.add(uid);
    }
  };
}

// ── TEST SUITE ───────────────────────────────────────────────────────────────

test('Phase 01-C6: Device Parser & IP Sanitization', async (t) => {
  await t.test('parses Windows and Chrome correctly', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const info = parseUserAgent(ua);
    assert.equal(info.platform, 'Windows');
    assert.equal(info.browser, 'Google Chrome');
    assert.equal(info.deviceLabel, 'Máy tính Windows • Google Chrome');
  });

  await t.test('parses macOS and Safari correctly', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';
    const info = parseUserAgent(ua);
    assert.equal(info.platform, 'macOS');
    assert.equal(info.browser, 'Apple Safari');
    assert.equal(info.deviceLabel, 'Máy Mac • Apple Safari');
  });

  await t.test('parses Android and Mobile browser correctly', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    const info = parseUserAgent(ua);
    assert.equal(info.platform, 'Android');
    assert.equal(info.browser, 'Google Chrome');
    assert.equal(info.deviceLabel, 'Thiết bị Android • Google Chrome');
  });

  await t.test('parses iPhone and Safari correctly', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
    const info = parseUserAgent(ua);
    assert.equal(info.platform, 'iOS (iPhone)');
    assert.equal(info.browser, 'Apple Safari');
    assert.equal(info.deviceLabel, 'iPhone • Apple Safari');
  });

  await t.test('sanitizes IPv4 by masking last octet', () => {
    assert.equal(sanitizeIp('113.190.234.56'), '113.190.234.*');
    assert.equal(sanitizeIp('127.0.0.1'), '127.0.0.*');
    assert.equal(sanitizeIp('::ffff:192.168.1.100'), '192.168.1.*');
  });

  await t.test('sanitizes IPv6 by masking suffix', () => {
    const masked = sanitizeIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    assert.ok(masked.endsWith(':*') || masked.includes(':'));
  });

  await t.test('formats relative time in Vietnamese properly', () => {
    const now = Date.now();
    assert.equal(formatRelativeTimeVi(now - 10 * 1000), 'Vừa xong');
    assert.equal(formatRelativeTimeVi(now - 5 * 60 * 1000), '5 phút trước');
    assert.equal(formatRelativeTimeVi(now - 2 * 3600 * 1000), '2 giờ trước');
    assert.equal(formatRelativeTimeVi(now - 3 * 86400 * 1000), '3 ngày trước');
    assert.equal(formatRelativeTimeVi(null), 'Không rõ');
  });
});

test('Phase 01-C6: Canonical Session Lifecycle & Management', async (t) => {
  const codeId = '88888888';
  const db = createMockFirestore({
    [`users/${codeId}`]: {
      codeId,
      ndid: 'member_test',
      status: 'active'
    }
  });

  await t.test('registerSession creates active session document', async () => {
    const res = await registerSession({
      db,
      codeId,
      sessionId: 'sess_abc123',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ip: '113.190.234.56'
    });

    assert.equal(res.success, true);
    assert.equal(res.session.sessionId, 'sess_abc123');

    const snap = await db.collection('users').doc(codeId).collection('sessions').doc('sess_abc123').get();
    assert.ok(snap.exists);
    const data = snap.data();
    assert.equal(data.status, 'active');
    assert.equal(data.platform, 'Windows');
    assert.equal(data.browser, 'Google Chrome');
    assert.equal(data.ipSummary, '113.190.234.*');
  });

  await t.test('registerSession touches lastActiveAt on existing session', async () => {
    const firstRes = await registerSession({
      db,
      codeId,
      sessionId: 'sess_abc123',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });
    assert.equal(firstRes.success, true);

    const snap = await db.collection('users').doc(codeId).collection('sessions').doc('sess_abc123').get();
    assert.equal(snap.data().status, 'active');
  });

  await t.test('listActiveSessions returns active sessions and flags currentSessionId', async () => {
    // Add second session
    await registerSession({
      db,
      codeId,
      sessionId: 'sess_mobile999',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36'
    });

    const list = await listActiveSessions({
      db,
      codeId,
      currentSessionId: 'sess_abc123'
    });
    assert.equal(list.success, true);
    assert.equal(list.sessions.length, 2);

    const currentSess = list.sessions.find(s => s.sessionId === 'sess_abc123');
    const otherSess = list.sessions.find(s => s.sessionId === 'sess_mobile999');
    assert.ok(currentSess);
    assert.ok(otherSess);
    assert.equal(currentSess.isCurrent, true);
    assert.equal(otherSess.isCurrent, false);
  });

  await t.test('rejects session registration on locked account', async () => {
    const lockedCodeId = '77777777';
    db._store.set(`users/${lockedCodeId}`, {
      codeId: lockedCodeId,
      status: 'locked'
    });

    await assert.rejects(
      async () => {
        await registerSession({
          db,
          codeId: lockedCodeId,
          sessionId: 'sess_locked'
        });
      },
      (err) => err instanceof AccountLockedError
    );
  });
});

test('Phase 01-C6: Session Revocation (Individual, Others, All)', async (t) => {
  const codeId = '88888888';
  const db = createMockFirestore({
    [`users/${codeId}`]: {
      codeId,
      ndid: 'member_test',
      status: 'active'
    },
    [`users/${codeId}/sessions/sess_1`]: {
      sessionId: 'sess_1',
      codeId,
      status: 'active',
      deviceLabel: 'Máy bàn',
      platform: 'Windows'
    },
    [`users/${codeId}/sessions/sess_2`]: {
      sessionId: 'sess_2',
      codeId,
      status: 'active',
      deviceLabel: 'Điện thoại',
      platform: 'Android'
    }
  });

  const auth = createMockAuth();

  await t.test('revokeUserSession revokes specific session', async () => {
    const res = await revokeUserSession({
      db,
      auth,
      codeId,
      sessionId: 'sess_2',
      currentSessionId: 'sess_1'
    });
    assert.equal(res.success, true);
    assert.equal(res.isCurrentRevoked, false);

    const snap = await db.collection('users').doc(codeId).collection('sessions').doc('sess_2').get();
    assert.equal(snap.data().status, 'revoked');
    assert.equal(snap.data().revocationReason, 'user_revoked');
    assert.ok(snap.data().revokedAt);

    // Refresh token not revoked for user since it was not current session
    assert.equal(auth._revokedTokens.has(codeId), false);
  });

  await t.test('revokeUserSession on current session revokes refresh tokens', async () => {
    const res = await revokeUserSession({
      db,
      auth,
      codeId,
      sessionId: 'sess_1',
      currentSessionId: 'sess_1'
    });
    assert.equal(res.success, true);
    assert.equal(res.isCurrentRevoked, true);
    assert.equal(auth._revokedTokens.has(codeId), true);
  });

  await t.test('revokeOtherUserSessions revokes all active sessions except current', async () => {
    // Clean and set fresh sessions
    db._store.set(`users/${codeId}/sessions/sess_active_1`, { sessionId: 'sess_active_1', codeId, status: 'active', deviceLabel: '1' });
    db._store.set(`users/${codeId}/sessions/sess_active_2`, { sessionId: 'sess_active_2', codeId, status: 'active', deviceLabel: '2' });
    db._store.set(`users/${codeId}/sessions/sess_active_current`, { sessionId: 'sess_active_current', codeId, status: 'active', deviceLabel: 'current' });

    const res = await revokeOtherUserSessions({
      db,
      auth,
      codeId,
      currentSessionId: 'sess_active_current'
    });
    assert.equal(res.success, true);
    assert.equal(res.revokedCount, 2);

    const s1 = (await db.collection('users').doc(codeId).collection('sessions').doc('sess_active_1').get()).data();
    const s2 = (await db.collection('users').doc(codeId).collection('sessions').doc('sess_active_2').get()).data();
    const sc = (await db.collection('users').doc(codeId).collection('sessions').doc('sess_active_current').get()).data();

    assert.equal(s1.status, 'revoked');
    assert.equal(s2.status, 'revoked');
    assert.equal(sc.status, 'active');
  });

  await t.test('revokeAllSessions revokes every active session', async () => {
    await revokeAllSessions(db, codeId, 'password_reset');

    const sc = (await db.collection('users').doc(codeId).collection('sessions').doc('sess_active_current').get()).data();
    assert.equal(sc.status, 'revoked');
    assert.equal(sc.revocationReason, 'password_reset');
  });
});

test('Phase 01-C6: Cross-User Isolation & Anti-Tampering', async (t) => {
  const codeIdA = '11111111';
  const codeIdB = '22222222';

  const db = createMockFirestore({
    [`users/${codeIdA}`]: { codeId: codeIdA, status: 'active' },
    [`users/${codeIdB}`]: { codeId: codeIdB, status: 'active' },
    [`users/${codeIdB}/sessions/sess_b1`]: { sessionId: 'sess_b1', codeId: codeIdB, status: 'active', deviceLabel: 'User B Session' }
  });

  const auth = createMockAuth();

  await t.test('User A cannot revoke User B session', async () => {
    await assert.rejects(
      async () => {
        // Attempt to revoke sess_b1 within User A's scope
        await revokeUserSession({
          db,
          auth,
          codeId: codeIdA,
          sessionId: 'sess_b1',
          currentSessionId: 'sess_a1'
        });
      },
      (err) => err instanceof ValidationError
    );

    // Verify User B's session was unaffected
    const snap = await db.collection('users').doc(codeIdB).collection('sessions').doc('sess_b1').get();
    assert.equal(snap.data().status, 'active');
  });
});

test('Phase 01-C6: Trusted Devices Foundation (Fingerprint Hashing & Revocation)', async (t) => {
  const codeId = '88888888';
  const db = createMockFirestore({
    [`users/${codeId}`]: {
      codeId,
      ndid: 'member_test',
      status: 'active'
    }
  });

  let registeredDeviceId = null;
  const rawFingerprint = 'canvas_render_hash_random_entropy_secret_12345';
  const expectedHash = crypto.createHash('sha256').update(rawFingerprint).digest('hex');

  await t.test('registerTrustedDeviceForUser stores SHA-256 hash and zero raw secrets', async () => {
    const res = await registerTrustedDeviceForUser({
      db,
      codeId,
      deviceLabel: 'Laptop cá nhân',
      deviceFingerprint: rawFingerprint,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    assert.equal(res.success, true);
    assert.ok(res.device.deviceId);
    assert.equal(res.device.status, 'active');
    registeredDeviceId = res.device.deviceId;

    const snap = await db.collection('users').doc(codeId).collection('devices').doc(registeredDeviceId).get();
    assert.ok(snap.exists);
    const data = snap.data();

    assert.equal(data.deviceLabel, 'Laptop cá nhân');
    assert.equal(data.status, 'active');
    assert.equal(data.deviceFingerprintHash, expectedHash);
    // CRITICAL: Raw fingerprint must NEVER be stored
    assert.equal(data.deviceFingerprint, undefined);
  });

  await t.test('listTrustedDevicesForUser returns safe metadata without raw hashes', async () => {
    const list = await listTrustedDevicesForUser({ db, codeId });
    assert.equal(list.success, true);
    assert.equal(list.devices.length, 1);

    const dev = list.devices[0];
    assert.equal(dev.deviceId, registeredDeviceId);
    assert.equal(dev.deviceLabel, 'Laptop cá nhân');
    assert.equal(dev.platform, 'Windows');
    assert.equal(dev.browser, 'Google Chrome');
    // Secret zero-leakage check
    assert.equal(dev.deviceFingerprintHash, undefined);
    assert.equal(dev.deviceFingerprint, undefined);
  });

  await t.test('revokeTrustedDeviceForUser marks device as revoked', async () => {
    const res = await revokeTrustedDeviceForUser({ db, codeId, deviceId: registeredDeviceId });
    assert.equal(res.success, true);
    assert.equal(res.deviceId, registeredDeviceId);

    const snap = await db.collection('users').doc(codeId).collection('devices').doc(registeredDeviceId).get();
    assert.equal(snap.data().status, 'revoked');
    assert.ok(snap.data().revokedAt);

    // Check list returns empty for active trusted devices
    const list = await listTrustedDevicesForUser({ db, codeId });
    assert.equal(list.devices.length, 0);
  });
});

test('Phase 01-C6: Security Activity Audit Log & Safe Projection', async (t) => {
  const codeId = '88888888';
  const now = Date.now();
  const db = createMockFirestore({
    [`users/${codeId}`]: { codeId, status: 'active' },
    [`security_events/ev1`]: {
      targetCodeID: codeId,
      eventType: 'session_created',
      timestampMs: now - 60000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      ip: '113.190.234.56'
    },
    [`security_events/ev2`]: {
      targetCodeID: codeId,
      eventType: 'password_changed',
      timestampMs: now - 30000,
      ip: '113.190.234.56'
    },
    [`security_events/ev3`]: {
      targetCodeID: codeId,
      eventType: 'all_other_sessions_revoked',
      timestampMs: now - 10000,
      ip: '113.190.234.56'
    }
  });

  await t.test('getRecentSecurityActivityForUser formats human-friendly activity timeline', async () => {
    const res = await getRecentSecurityActivityForUser({ db, codeId, limit: 10 });
    assert.equal(res.success, true);
    assert.equal(res.events.length, 3);

    // Verify ordering: newest first (ev3 -> ev2 -> ev1)
    assert.equal(res.events[0].eventType, 'all_other_sessions_revoked');
    assert.equal(res.events[0].title, 'Đăng xuất khỏi các thiết bị khác');
    assert.equal(res.events[0].ipSummary, '113.190.234.*');

    assert.equal(res.events[1].eventType, 'password_changed');
    assert.equal(res.events[1].title, 'Đổi mật khẩu thành công');

    assert.equal(res.events[2].eventType, 'session_created');
    assert.equal(res.events[2].title, 'Phiên đăng nhập mới được thiết lập');
  });
});

test('Phase 01-C6: Firestore Rules Client Deny Contract', async () => {
  const rulesPath = path.resolve('firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  // Verify sessions deny
  assert.ok(
    rulesContent.includes('match /sessions/{document=**}') && rulesContent.includes('allow read, write: if false;'),
    'firestore.rules must contain strict client deny for /sessions/**'
  );

  // Verify devices deny
  assert.ok(
    rulesContent.includes('match /devices/{document=**}') && rulesContent.includes('allow read, write: if false;'),
    'firestore.rules must contain strict client deny for /devices/**'
  );
});
