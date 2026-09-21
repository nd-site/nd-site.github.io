/**
 * Vercel Serverless Function Adapter Integration Tests (Phase AUTH-LIVE-FINAL)
 *
 * Verifies:
 * 1. Health check GET /api/health
 * 2. CORS preflight OPTIONS request
 * 3. Method validation (405 on non-POST for action endpoints)
 * 4. Action routing (via query parameter ?action=... and path rewrite)
 * 5. Unknown endpoint returns structured 404
 * 6. Parsing of JSON payload
 * 7. Verification that canonical handler contract is preserved
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';

const require = createRequire(import.meta.url);
import handleCanonicalAuth from '../api/auth.js';

class MockReq extends EventEmitter {
  constructor({ method = 'GET', url = '/', headers = {}, body = null }) {
    super();
    this.method = method;
    this.url = url;
    this.headers = { host: 'localhost:3000', ...headers };
    this.body = body;
    this.socket = { remoteAddress: '127.0.0.1' };
  }
}

class MockRes extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 200;
    this.headers = {};
    this.body = '';
  }

  setHeader(key, val) {
    this.headers[key.toLowerCase()] = val;
  }

  end(chunk) {
    if (chunk) this.body += chunk;
    this.emit('finish');
  }

  getJson() {
    return this.body ? JSON.parse(this.body) : null;
  }
}

async function runHandler(reqOptions) {
  const req = new MockReq(reqOptions);
  const res = new MockRes();
  const finishPromise = new Promise(resolve => res.on('finish', resolve));

  handleCanonicalAuth(req, res);

  // If there is a body stream, emit it
  if (reqOptions.streamBody) {
    req.emit('data', reqOptions.streamBody);
    req.emit('end');
  }

  await finishPromise;
  return res;
}

test('Vercel Adapter: GET /api/health returns 200 OK', async () => {
  const res = await runHandler({ method: 'GET', url: '/api/health' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['access-control-allow-origin'], 'https://ndsite.web.app');
  const json = res.getJson();
  assert.equal(json.status, 'ok');
  assert.equal(json.service, 'nd-canonical-auth');
});

test('Vercel Adapter: OPTIONS preflight returns 204 No Content with CORS headers', async () => {
  const res = await runHandler({
    method: 'OPTIONS',
    url: '/api/loginUser',
    headers: { origin: 'https://ndsite.web.app' }
  });
  assert.equal(res.statusCode, 204);
  assert.equal(res.headers['access-control-allow-origin'], 'https://ndsite.web.app');
  assert.ok(res.headers['access-control-allow-methods'].includes('POST'));
});

test('Vercel Adapter: Non-POST on action endpoint returns 405 Method Not Allowed', async () => {
  const res = await runHandler({ method: 'GET', url: '/api/registerUser' });
  assert.equal(res.statusCode, 405);
  const json = res.getJson();
  assert.equal(json.success, false);
  assert.equal(json.error.code, 'METHOD_NOT_ALLOWED');
});

test('Vercel Adapter: Unknown action returns 404 with structured error', async () => {
  const res = await runHandler({
    method: 'POST',
    url: '/api/nonExistentAction',
    body: {}
  });
  assert.equal(res.statusCode, 404);
  const json = res.getJson();
  assert.equal(json.success, false);
  assert.equal(json.error.code, 'NOT_FOUND');
});

test('Vercel Adapter: Action routing supports query parameter action', async () => {
  const res = await runHandler({
    method: 'POST',
    url: '/api/auth?action=nonExistentEndpoint',
    body: {}
  });
  assert.equal(res.statusCode, 404);
  const json = res.getJson();
  assert.ok(json.error.message.includes('nonExistentEndpoint'));
});

test('Vercel Adapter: Validation error contract preserves 400 Bad Request', async () => {
  const res = await runHandler({
    method: 'POST',
    url: '/api/verifyEmail',
    body: {} // missing token
  });
  assert.equal(res.statusCode, 400);
  const json = res.getJson();
  assert.equal(json.success, false);
  assert.equal(json.error.code, 'INVALID_ARGUMENT');
});

test('Vercel Adapter: Missing bearer token on protected endpoint returns 401 Unauthorized', async () => {
  const res = await runHandler({
    method: 'POST',
    url: '/api/changePassword',
    body: { currentPassword: '1', newPassword: '2' }
  });
  assert.equal(res.statusCode, 401);
  const json = res.getJson();
  assert.equal(json.success, false);
  assert.equal(json.error.code, 'UNAUTHORIZED');
});
