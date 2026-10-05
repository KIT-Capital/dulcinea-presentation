import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createNodeServer } from './node.mjs';
import { publicAssetPaths } from './public-asset-paths.mjs';

const credentials = {
  INVESTOR_PASSWORD: 'synthetic-node-test-password',
  SESSION_SECRET: 'synthetic-node-test-signing-secret-with-32-characters',
};
const film = publicAssetPaths.find(asset => asset.endsWith('.mp4'));

async function fixture(t, env = credentials) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'dulcinea-node-test-'));
  for (const [name, bytes] of Object.entries({
    'index.html': '<h1>English site and presentation</h1>',
    'es/index.html': '<h1>Sitio y presentación</h1>',
    'financial-statements.html': 'Private statement fixture',
    'es/financial-statements.html': 'Estados financieros privados',
    'source-packages/model.xlsx': 'Never serve this source',
    [film.slice(1)]: Buffer.from('0123456789abcdef'),
  })) {
    const filename = path.join(directory, name);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, bytes);
  }
  const server = createNodeServer({ assetsDirectory: directory, env });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    const closed = once(server, 'close');
    server.close();
    server.closeAllConnections();
    await closed;
    await rm(directory, { recursive: true, force: true });
  });
  return { base, request: (pathname, options) => fetch(base + pathname, { redirect: 'manual', ...options }) };
}

function login(origin, overrides = {}) {
  return {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      name: 'Synthetic Investor', email: 'synthetic@example.test',
      password: credentials.INVESTOR_PASSWORD, next: '/financial-statements.html', ...overrides,
    }),
  };
}

test('Node serves identical public bytes and keeps statements gated with source paths denied', async t => {
  const { request } = await fixture(t);
  for (const [pathname, expected] of [['/', '<h1>English site and presentation</h1>'], ['/es/', '<h1>Sitio y presentación</h1>']]) {
    const response = await request(pathname);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), expected);
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
    assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
  }
  for (const pathname of ['/financial-statements', '/es/financial-statements.html']) {
    const response = await request(pathname);
    assert.equal(response.status, 302);
    assert.match(response.headers.get('Location'), /^\/login\?next=/);
  }
  for (const pathname of ['/source-packages/model.xlsx', '/server/worker.mjs', '/.env', '/assets/unknown.png']) {
    assert.equal((await request(pathname)).status, 404, pathname);
  }
  assert.equal((await request('/', { method: 'HEAD' })).status, 200);
  assert.equal(await (await request('/', { method: 'HEAD' })).text(), '');
});

test('Node login rejects wrong passwords, issues a usable cookie and signs out', async t => {
  const { base, request } = await fixture(t);
  assert.equal((await request('/login', login(base, { password: 'incorrect' }))).status, 401);
  assert.equal((await request('/login', login('https://wrong.example.test'))).status, 403);
  const signedIn = await request('/login', login(base));
  assert.equal(signedIn.status, 303);
  const cookie = signedIn.headers.get('Set-Cookie').split(';')[0];
  assert.match(cookie, /^dulcinea_preview_session=/);
  const statement = await request('/financial-statements.html', { headers: { Cookie: cookie } });
  assert.equal(statement.status, 200);
  assert.equal(await statement.text(), 'Private statement fixture');
  assert.equal((await request('/source-packages/model.xlsx', { headers: { Cookie: cookie } })).status, 404);
  const signedOut = await request('/logout', { method: 'POST', headers: { Origin: base, Cookie: cookie } });
  assert.equal(signedOut.status, 303);
  assert.match(signedOut.headers.get('Set-Cookie'), /Max-Age=0/);
  assert.equal((await request('/financial-statements.html')).status, 302);
});

test('Node preserves video byte ranges and HEAD metadata', async t => {
  const { request } = await fixture(t);
  const response = await request(film, { headers: { Range: 'bytes=3-7' } });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('Content-Range'), 'bytes 3-7/16');
  assert.equal(response.headers.get('Content-Length'), '5');
  assert.equal(await response.text(), '34567');
  assert.equal((await request(film, { headers: { Range: 'bytes=99-100' } })).status, 416);
  const head = await request(film, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('Content-Length'), '16');
  assert.equal(await head.text(), '');
});

test('Node uses configured external HTTPS behind Replit without trusting arbitrary forwarded origins', async t => {
  const publicOrigin = 'https://dulcinea.example.replit.dev';
  const { request } = await fixture(t, { ...credentials, PUBLIC_ORIGIN: publicOrigin });
  const options = login(publicOrigin);
  options.headers['X-Forwarded-Proto'] = 'https';
  options.headers['X-Forwarded-Host'] = new URL(publicOrigin).host;
  const signedIn = await request('/login', options);
  assert.equal(signedIn.status, 303);
  const setCookie = signedIn.headers.get('Set-Cookie');
  assert.match(setCookie, /^__Host-dulcinea_session=/);
  assert.match(setCookie, /; Secure/);
  assert.equal((await request('/financial-statements.html', { headers: { Cookie: setCookie.split(';')[0] } })).status, 200);
  const signedOut = await request('/logout', { method: 'POST', headers: { Origin: publicOrigin, Cookie: setCookie.split(';')[0] } });
  assert.equal(signedOut.status, 303);
  assert.match(signedOut.headers.get('Set-Cookie'), /; Secure/);
  assert.match(signedOut.headers.get('Set-Cookie'), /Max-Age=0/);
  const forged = login('https://attacker.example.test');
  forged.headers['X-Forwarded-Host'] = 'attacker.example.test';
  forged.headers['X-Forwarded-Proto'] = 'https';
  assert.equal((await request('/login', forged)).status, 403);
});

test('Node ignores unconfigured forwarding and selects only allowlisted Replit hosts', async t => {
  const local = await fixture(t);
  const forwarded = login(local.base);
  forwarded.headers['X-Forwarded-Proto'] = 'https';
  forwarded.headers['X-Forwarded-Host'] = 'unconfigured.example.test';
  const response = await local.request('/login', forwarded);
  assert.equal(response.status, 303);
  assert.match(response.headers.get('Set-Cookie'), /^dulcinea_preview_session=/);
  const deployment = 'https://published.example.replit.app';
  const replit = await fixture(t, {
    ...credentials, REPLIT_DEV_DOMAIN: 'preview.example.replit.dev',
    REPLIT_DOMAINS: new URL(deployment).host,
  });
  const publishedLogin = login(deployment);
  publishedLogin.headers['X-Forwarded-Host'] = new URL(deployment).host;
  assert.equal((await replit.request('/login', publishedLogin)).status, 303);
});

test('Node accepts only configured Replit domains and fails closed without credentials', async t => {
  const publicOrigin = 'https://preview.example.replit.dev';
  const { request } = await fixture(t, { ...credentials, REPLIT_DEV_DOMAIN: new URL(publicOrigin).host });
  assert.equal((await request('/login', login(publicOrigin))).status, 303);
  const unconfigured = await fixture(t, {});
  assert.equal((await unconfigured.request('/')).status, 200);
  assert.equal((await unconfigured.request('/financial-statements.html')).status, 503);
  assert.equal((await unconfigured.request('/login')).status, 503);
  assert.throws(() => createNodeServer({ env: { PUBLIC_ORIGIN: 'https://example.test/other-path' } }), /PUBLIC_ORIGIN/);
  assert.throws(() => createNodeServer({ env: { PUBLIC_ORIGIN: 'http://example.test' } }), /PUBLIC_ORIGIN/);
});

test('Node limits both declared and streamed form bodies before passing them to the Worker', async t => {
  const { base, request } = await fixture(t);
  const tooLarge = login(base);
  tooLarge.body = 'x'.repeat(4097);
  assert.equal((await request('/login', tooLarge)).status, 413);
  const status = await new Promise((resolve, reject) => {
    const request = http.request(base + '/login', {
      method: 'POST', headers: { Origin: base, 'Content-Type': 'application/x-www-form-urlencoded', 'Transfer-Encoding': 'chunked' },
    }, response => { response.resume(); response.on('end', () => resolve(response.statusCode)); });
    request.on('error', reject);
    request.write('x'.repeat(3000));
    request.end('x'.repeat(1097));
  });
  assert.equal(status, 413);
});

test('Node login rate limiting cannot be bypassed with a supplied Cloudflare client-IP header', async t => {
  const { base, request } = await fixture(t);
  for (let attempt = 0; attempt < 9; attempt++) {
    const options = login(base, { password: 'incorrect' });
    options.headers['CF-Connecting-IP'] = `192.0.2.${attempt}`;
    const response = await request('/login', options);
    assert.equal(response.status, attempt < 8 ? 401 : 429);
  }
});
