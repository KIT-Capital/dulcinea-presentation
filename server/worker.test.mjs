import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac, webcrypto } from 'node:crypto';
import worker from './worker.mjs';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const ORIGIN = 'https://investor.example.test';
const SESSION_SECONDS = 8 * 60 * 60;

function fixture(overrides = {}) {
  const assetRequests = [];
  const rateKeys = [];
  const env = {
    INVESTOR_PASSWORD: 'test-only-shared-password',
    SESSION_SECRET: 'test-only-signing-secret-at-least-32-characters',
    PREVIEW_ONLY: 'false',
    LOGIN_LIMITER: { async limit({ key }) { rateKeys.push(key); return { success: true }; } },
    ASSETS: { async fetch(request) {
      assetRequests.push(request.url);
      return new Response(request.method === 'HEAD' ? null : 'private asset bytes', {
        headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=3600', Vary: 'Accept-Encoding' },
      });
    } },
    ...overrides,
  };
  return { env, assetRequests, rateKeys };
}

function request(path = '/', { origin = ORIGIN, ...options } = {}) {
  return new Request(new URL(path, origin), options);
}

function loginRequest(env, fields = {}, options = {}) {
  const { origin = ORIGIN, headers = {}, ...rest } = options;
  return request('/login', {
    origin, method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body: new URLSearchParams({ name: 'Test Investor', email: 'investor@example.test', password: env.INVESTOR_PASSWORD, next: '/', ...fields }),
    ...rest,
  });
}

async function session(env, fields = {}, options = {}) {
  const response = await worker.fetch(loginRequest(env, fields, options), env);
  assert.equal(response.status, 303);
  return response.headers.get('Set-Cookie').split(';')[0];
}

function signedCookie(env, payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const key = createHash('sha256').update(JSON.stringify([env.SESSION_SECRET, env.INVESTOR_PASSWORD])).digest();
  const signature = createHmac('sha256', key).update(encoded).digest('base64url');
  return `__Host-dulcinea_session=${encoded}.${signature}`;
}

test('every private route, image, video, plan and financial statement is gated before assets are read', async () => {
  const { env, assetRequests } = fixture();
  for (const path of ['/', '/index.html', '/financial-statements.html', '/assets/video/medellin-after-dark.mp4',
    '/assets/images/team/dov-supplied.jpg', '/source-packages/PLANOS.pdf', '/downloads/deck.html', '/gate-assets/not-public.svg']) {
    for (const method of ['GET', 'HEAD']) {
      const response = await worker.fetch(request(path, { method }), env);
      assert.equal(response.status, 302, `${method} ${path}`);
      assert.equal(response.headers.get('Location'), `/login?next=${encodeURIComponent(path)}`);
      assert.match(response.headers.get('Cache-Control'), /no-store/);
      assert.equal(await response.text(), '');
    }
  }
  assert.equal(assetRequests.length, 0);
});

test('only the exact gate logo and robots are public, even before secrets exist', async () => {
  const { env, assetRequests } = fixture({ INVESTOR_PASSWORD: undefined, SESSION_SECRET: undefined });
  assert.equal((await worker.fetch(request('/gate-assets/logo.svg'), env)).status, 200);
  const robots = await worker.fetch(request('/robots.txt'), env);
  assert.match(await robots.text(), /Disallow: \/$/m);
  assert.equal(assetRequests.length, 1);
  assert.equal((await worker.fetch(request('/favicon.ico'), env)).status, 503);
  assert.equal((await worker.fetch(request('/gate-assets/logo.svg', { method: 'POST' }), env)).status, 503);
  assert.equal(assetRequests.length, 1);
});

test('correct login grants an eight-hour secure signed session without storing visitor identity', async () => {
  const { env, assetRequests, rateKeys } = fixture();
  const response = await worker.fetch(loginRequest(env, { next: '/financial-statements.html#balance-sheet' },
    { headers: { 'CF-Connecting-IP': '192.0.2.11' } }), env);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('Location'), '/financial-statements.html#balance-sheet');
  const cookie = response.headers.get('Set-Cookie');
  assert.match(cookie, /^__Host-dulcinea_session=/);
  for (const flag of ['Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=28800', 'Secure']) assert.ok(cookie.includes(flag));
  assert.ok(!cookie.includes('Domain='));
  const payload = JSON.parse(Buffer.from(cookie.split('=')[1].split('.')[0], 'base64url').toString());
  assert.deepEqual(Object.keys(payload).sort(), ['exp', 'iat', 'nonce']);
  assert.equal(payload.exp - payload.iat, SESSION_SECONDS);
  assert.equal(rateKeys.length, 1);
  assert.ok(!rateKeys[0].includes('192.0.2.11'));
  const privateResponse = await worker.fetch(request('/financial-statements.html', { headers: { Cookie: cookie.split(';')[0] } }), env);
  assert.equal(privateResponse.status, 200);
  assert.equal(await privateResponse.text(), 'private asset bytes');
  assert.equal(assetRequests.length, 1);
  assert.match(privateResponse.headers.get('Cache-Control'), /private, no-store/);
  assert.match(privateResponse.headers.get('Vary'), /Accept-Encoding, Cookie/);
  assert.match(privateResponse.headers.get('Content-Security-Policy'), /media-src 'self' data: blob:/);
});

test('wrong password and malformed identity never issue a cookie or fetch private assets', async () => {
  const { env, assetRequests } = fixture();
  for (const [fields, expected] of [
    [{ password: 'not-the-password' }, 401], [{ name: 'A' }, 400], [{ name: 'x'.repeat(121) }, 400],
    [{ email: 'not-an-email' }, 400], [{ password: '' }, 400], [{ password: 'x'.repeat(129) }, 400],
  ]) {
    const response = await worker.fetch(loginRequest(env, fields), env);
    assert.equal(response.status, expected);
    assert.equal(response.headers.get('Set-Cookie'), null);
    assert.ok(!(await response.text()).includes(env.INVESTOR_PASSWORD));
  }
  assert.equal(assetRequests.length, 0);
});

test('login and logout require the exact same Origin, including protocol and port', async () => {
  const { env } = fixture();
  for (const origin of ['https://attacker.example', 'http://investor.example.test', `${ORIGIN}:8443`, 'null', '']) {
    const login = loginRequest(env, {}, { headers: { Origin: origin } });
    assert.equal((await worker.fetch(login, env)).status, 403);
    const logout = await worker.fetch(request('/logout', { method: 'POST', headers: { Origin: origin } }), env);
    assert.equal(logout.status, 403);
    assert.equal(logout.headers.get('Set-Cookie'), null);
  }
  const missingOrigin = loginRequest(env);
  missingOrigin.headers.delete('Origin');
  assert.equal((await worker.fetch(missingOrigin, env)).status, 403);
});

test('next destinations cannot escape this origin or create login/logout redirect loops', async () => {
  const { env } = fixture();
  for (const next of ['https://attacker.example', '//attacker.example', '/\\attacker.example', '/\n/attacker.example',
    '/login', '/logout?x=1', '/somewhere/../login', 'javascript:alert(1)', 'not-a-path']) {
    const response = await worker.fetch(loginRequest(env, { next }), env);
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('Location'), '/', JSON.stringify(next));
  }
  const response = await worker.fetch(loginRequest(env, { next: '/assets/plan.pdf?download=1#page=2' }), env);
  assert.equal(response.headers.get('Location'), '/assets/plan.pdf?download=1#page=2');
});

test('malformed, forged, expired, future-issued and overlong sessions fail closed', async () => {
  const { env, assetRequests } = fixture();
  const cookie = await session(env);
  const now = Math.floor(Date.now() / 1000);
  const forged = cookie.replace(/\.[^.;]+$/, '.invalidsignature');
  const expired = signedCookie(env, { iat: now - SESSION_SECONDS - 1, exp: now - 1, nonce: 'test-expired' });
  const future = signedCookie(env, { iat: now + 120, exp: now + 120 + SESSION_SECONDS, nonce: 'test-future' });
  const longer = signedCookie(env, { iat: now, exp: now + SESSION_SECONDS + 60, nonce: 'test-long' });
  for (const invalid of ['__Host-dulcinea_session=garbage', '__Host-dulcinea_session=a.b.c',
    `__Host-dulcinea_session=${'a'.repeat(1025)}`, forged, expired, future, longer]) {
    assert.equal((await worker.fetch(request('/assets/private.pdf', { headers: { Cookie: invalid } }), env)).status, 302);
  }
  assert.equal(assetRequests.length, 0);
});

test('changing either secret invalidates previously issued sessions', async () => {
  const { env, assetRequests } = fixture();
  const cookie = await session(env);
  for (const changed of [{ ...env, INVESTOR_PASSWORD: 'a-different-test-only-password' },
    { ...env, SESSION_SECRET: 'a-different-test-only-session-secret-32-chars' }]) {
    const response = await worker.fetch(request('/', { headers: { Cookie: cookie } }), changed);
    assert.equal(response.status, 302);
  }
  assert.equal(assetRequests.length, 0);
});

test('logout only accepts same-origin POST and expires the correct cookie', async () => {
  const { env } = fixture();
  assert.equal((await worker.fetch(request('/logout'), env)).status, 405);
  const response = await worker.fetch(request('/logout', { method: 'POST', headers: { Origin: ORIGIN } }), env);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('Location'), '/login');
  assert.match(response.headers.get('Set-Cookie'), /^__Host-dulcinea_session=;/);
  assert.match(response.headers.get('Set-Cookie'), /Max-Age=0/);
});

test('missing or weak secrets and unavailable login limiting fail closed', async () => {
  for (const overrides of [{ INVESTOR_PASSWORD: undefined }, { INVESTOR_PASSWORD: 'short' },
    { SESSION_SECRET: undefined }, { SESSION_SECRET: 'short' }, { LOGIN_LIMITER: undefined },
    { LOGIN_LIMITER: { async limit() { throw new Error('unavailable'); } } }]) {
    const { env, assetRequests } = fixture(overrides);
    const response = await worker.fetch(loginRequest(env, { password: 'test-only-shared-password' }), env);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Set-Cookie'), null);
    assert.equal(assetRequests.length, 0);
  }
});

test('rate-limit rejection returns Retry-After without issuing a session', async () => {
  const { env } = fixture({ LOGIN_LIMITER: { async limit() { return { success: false }; } } });
  const response = await worker.fetch(loginRequest(env), env);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(response.headers.get('Set-Cookie'), null);
});

test('declared and streamed oversized forms are rejected, even with a false Content-Length', async () => {
  const { env } = fixture();
  const declared = loginRequest(env, {}, { headers: { 'Content-Length': '5000' } });
  assert.equal((await worker.fetch(declared, env)).status, 413);
  const large = `name=${'x'.repeat(5000)}`;
  for (const contentLength of [undefined, '10']) {
    const headers = { Origin: ORIGIN, 'Content-Type': 'application/x-www-form-urlencoded' };
    if (contentLength) headers['Content-Length'] = contentLength;
    const body = new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode(large.slice(0, 3000)));
      controller.enqueue(new TextEncoder().encode(large.slice(3000)));
      controller.close();
    } });
    const response = await worker.fetch(request('/login', { method: 'POST', headers, body, duplex: 'half' }), env);
    assert.equal(response.status, 413);
    assert.equal(response.headers.get('Set-Cookie'), null);
  }
  assert.equal((await worker.fetch(loginRequest(env, {}, { headers: { 'Content-Type': 'application/json' } }), env)).status, 415);
});

test('HTTP is restricted to loopback preview, and preview-only mode refuses external hosts', async () => {
  const { env, assetRequests } = fixture();
  assert.equal((await worker.fetch(request('/login', { origin: 'http://example.test' }), env)).status, 400);
  const local = 'http://127.0.0.1:8788';
  const cookie = await session(env, {}, { origin: local });
  assert.match(cookie, /^dulcinea_preview_session=/);
  assert.equal((await worker.fetch(request('/', { origin: local, headers: { Cookie: cookie } }), env)).status, 200);
  for (const path of ['/login', '/gate-assets/logo.svg', '/robots.txt', '/']) {
    assert.equal((await worker.fetch(request(path), { ...env, PREVIEW_ONLY: 'true' })).status, 503);
  }
  assert.equal(assetRequests.length, 1);
});

test('JSON login and logout preserve the same security and do not expose the shared password', async () => {
  const { env } = fixture();
  const response = await worker.fetch(loginRequest(env, { next: '/financial-statements.html' },
    { headers: { Accept: 'application/json' } }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { next: '/financial-statements.html' });
  assert.ok(response.headers.get('Set-Cookie'));
  const denied = await worker.fetch(loginRequest(env, { password: 'wrong' }, { headers: { Accept: 'application/json' } }), env);
  assert.equal(denied.status, 401);
  assert.equal(denied.headers.get('Set-Cookie'), null);
  assert.deepEqual(Object.keys(await denied.json()), ['error']);
  const logout = await worker.fetch(request('/logout', { method: 'POST', headers: { Origin: ORIGIN, Accept: 'application/json' } }), env);
  assert.deepEqual(await logout.json(), { next: '/login' });
  assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
});
