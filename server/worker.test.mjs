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

function htmlAttribute(tag, name) {
  const match = tag?.match(new RegExp(`\\b${name}="([^"]*)"`));
  assert.ok(match, `Missing ${name} attribute`);
  return match[1].replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
}

function loginFormAction(html, language = 'en') {
  const action = new URL(htmlAttribute(html.match(/<form\b[^>]*>/)?.[0], 'action'), ORIGIN);
  assert.equal(action.origin, ORIGIN);
  assert.equal(action.pathname, '/login');
  assert.equal(action.searchParams.get('lang'), language);
  return action;
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
  for (const path of ['/index.html', '/financial-statements.html', '/investment-criteria.html', '/assets/video/medellin-after-dark.mp4',
    '/assets/images/team/dov-supplied.jpg', '/source-packages/PLANOS.pdf', '/downloads/deck.html', '/gate-assets/not-public.svg',
    '/assets/social/not-public.jpg', '/assets/social/README.md']) {
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

test('shared English and Spanish home URLs serve localized cards without granting investor access', async () => {
  const { env, assetRequests } = fixture();
  for (const [route, language, locale, alternate, image, title] of [
    ['/', 'en', 'en_US', 'es_CO', 'dulcinea-one-medellin-v2.jpg', 'Dulcinea One | Five homes. One portfolio.'],
    ['/es/', 'es', 'es_CO', 'en_US', 'dulcinea-one-medellin-es-v2.jpg', 'Dulcinea One | Cinco propiedades. Un portafolio.'],
  ]) {
    for (const target of [route, `/login?next=${encodeURIComponent(route)}`]) {
      const response = await worker.fetch(request(target), env);
      const html = await response.text();
      assert.equal(response.status, 200);
      const meta = key => htmlAttribute(html.match(/<meta\b[^>]*>/g)?.find(tag =>
        tag.includes(`property="${key}"`) || tag.includes(`name="${key}"`)), 'content');
      assert.equal(meta('og:title'), title);
      assert.equal(meta('twitter:title'), title);
      assert.equal(meta('og:url'), `https://invest.dulcineainvestments.org${route}`);
      assert.equal(meta('og:locale'), locale);
      assert.equal(meta('og:locale:alternate'), alternate);
      assert.equal(meta('og:image'), `https://invest.dulcineainvestments.org/assets/social/${image}`);
      assert.equal(meta('twitter:image'), meta('og:image'));
      assert.equal(meta('og:image:width'), '1200');
      assert.equal(meta('og:image:height'), '630');
      assert.equal(meta('twitter:image:alt'), meta('og:image:alt'));
      assert.equal(meta('og:video'), 'https://invest.dulcineainvestments.org/assets/video/stock/AdobeStock_693150796.mp4');
      assert.equal(meta('og:video:width'), '1280');
      assert.equal(meta('og:video:height'), '720');
      assert.match(html, /Dulcinea Investments, LLC/);
      assert.doesNotMatch(html, /id="(?:homes|fund|team)"/);
      assert.match(response.headers.get('X-Robots-Tag'), /noindex/);
      loginFormAction(html, language);
    }
    const head = await worker.fetch(request(route, { method: 'HEAD' }), env);
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.match(head.headers.get('Content-Type'), /text\/html/);
  }
  assert.equal(assetRequests.length, 0);
});

test('login language switches preserve destinations and anchors through Spanish errors and successful sign-in', async () => {
  const { env, assetRequests } = fixture();
  const inputValue = (html, name) => htmlAttribute(
    html.match(/<input\b[^>]*>/g)?.find((tag) => tag.includes(`name="${name}"`)), 'value');

  for (const englishNext of ['/financial-statements.html?view=full&currency=USD#balance-sheet', '/#slide-12']) {
    let page = await worker.fetch(request(`/login?next=${encodeURIComponent(englishNext)}`), env);
    let html = await page.text();
    assert.equal(page.status, 200);
    loginFormAction(html, 'en');

    for (const language of ['es', 'en']) {
      const link = html.match(/<a\b[^>]*>/g)?.find((tag) => tag.includes(`lang="${language}"`));
      const target = new URL(htmlAttribute(link, 'href'), ORIGIN);
      assert.equal(target.origin, ORIGIN);
      assert.equal(target.pathname, '/login');
      assert.equal(target.searchParams.get('lang'), language);
      const expectedNext = language === 'es' ? `/es${englishNext}` : englishNext;
      assert.equal(target.searchParams.get('next'), expectedNext);
      page = await worker.fetch(request(target), env);
      html = await page.text();
      assert.equal(page.status, 200);
      assert.match(html, new RegExp(`<html lang="${language}">`));
      assert.equal(inputValue(html, 'next'), expectedNext);
      assert.equal(inputValue(html, 'lang'), language);

      const submit = (markup, password) => worker.fetch(request(loginFormAction(markup, language), {
        method: 'POST',
        headers: { Origin: ORIGIN, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name: 'Test Investor', email: 'investor@example.test', password,
          next: inputValue(markup, 'next'), lang: inputValue(markup, 'lang') }),
      }), env);

      if (language === 'es') {
        const denied = await submit(html, 'wrong-test-password');
        assert.equal(denied.status, 401);
        assert.equal(denied.headers.get('Set-Cookie'), null);
        html = await denied.text();
        assert.match(html, /<html lang="es">/);
        assert.match(html, /La contraseña no es correcta/);
        assert.equal(inputValue(html, 'next'), expectedNext);
        assert.equal(inputValue(html, 'name'), 'Test Investor');
        assert.equal(inputValue(html, 'email'), 'investor@example.test');
      }

      const accepted = await submit(html, env.INVESTOR_PASSWORD);
      assert.equal(accepted.status, 303);
      assert.equal(accepted.headers.get('Location'), expectedNext);
      assert.ok(accepted.headers.get('Set-Cookie'));
    }
  }
  assert.equal(assetRequests.length, 0);
});

test('only the gate logo, exact social media URLs and robots are public, even before secrets exist', async () => {
  const { env, assetRequests } = fixture({ INVESTOR_PASSWORD: undefined, SESSION_SECRET: undefined });
  for (const path of ['/gate-assets/logo.svg', '/assets/images/stock/AdobeStock_891890158-web.jpg',
    '/assets/video/stock/AdobeStock_693150796.mp4', '/assets/social/dulcinea-one-medellin-v2.jpg',
    '/assets/social/dulcinea-one-medellin-es-v2.jpg']) {
    for (const method of ['GET', 'HEAD']) assert.equal((await worker.fetch(request(path, { method }), env)).status, 200, `${method} ${path}`);
  }
  const robots = await worker.fetch(request('/robots.txt'), env);
  assert.match(await robots.text(), /Disallow: \/$/m);
  assert.equal(assetRequests.length, 10);
  assert.equal((await worker.fetch(request('/favicon.ico'), env)).status, 503);
  assert.equal((await worker.fetch(request('/gate-assets/logo.svg', { method: 'POST' }), env)).status, 503);
  assert.equal(assetRequests.length, 10);
});

test('correct login grants a browser-session cookie with an eight-hour limit and no visitor identity', async () => {
  const { env, assetRequests, rateKeys } = fixture();
  const response = await worker.fetch(loginRequest(env, { next: '/financial-statements.html#balance-sheet' },
    { headers: { 'CF-Connecting-IP': '192.0.2.11' } }), env);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('Location'), '/financial-statements.html#balance-sheet');
  const cookie = response.headers.get('Set-Cookie');
  assert.match(cookie, /^__Host-dulcinea_session=/);
  for (const flag of ['Path=/', 'HttpOnly', 'SameSite=Strict', 'Secure']) assert.ok(cookie.includes(flag));
  assert.doesNotMatch(cookie, /Max-Age=|Expires=/i);
  assert.ok(!cookie.includes('Domain='));
  const payload = JSON.parse(Buffer.from(cookie.split('=')[1].split('.')[0], 'base64url').toString());
  assert.deepEqual(Object.keys(payload).sort(), ['exp', 'iat', 'nonce', 'v']);
  assert.equal(payload.v, 2);
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

test('source documents remain unavailable after sign-in, including claimed admin requests', async () => {
  const { env, assetRequests } = fixture();
  const cookie = await session(env);
  const paths = [
    '/source-packages/company.pdf', '/docs/disclosure-research.md', '/company-documents/formation.pdf',
    '/downloads/Operating%20Agreement.pdf', '/downloads/model.xlsx', '/downloads/terms.docx',
    '/downloads/source.zip', '/downloads/statement.csv', '/downloads/terms.PDF',
    '/downloads/terms%2Epdf', '/downloads/terms%252Epdf', '/downloads/terms.pdf/preview',
    '/%64ocs/internal', '/server/worker.mjs',
  ];
  for (const path of paths) {
    for (const method of ['GET', 'HEAD']) {
      const response = await worker.fetch(request(path, { method, headers: { Cookie: cookie, 'X-Role': 'admin' } }), env);
      assert.equal(response.status, 404, `${method} ${path}`);
      assert.match(response.headers.get('Cache-Control'), /no-store/);
      assert.equal(await response.text(), method === 'HEAD' ? '' : 'Not found.');
    }
  }
  assert.equal(assetRequests.length, 0, 'Source requests must never reach the asset binding');
  for (const path of ['/downloads/Dulcinea-Floorplans.pdf', '/financial-statements.html', '/assets/floorplans/plan-1.webp']) {
    const response = await worker.fetch(request(path, { headers: { Cookie: cookie } }), env);
    assert.equal(response.status, 200, `Approved investor content remains available: ${path}`);
  }
  assert.equal(assetRequests.length, 3);
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
  const expired = signedCookie(env, { v: 2, iat: now - SESSION_SECONDS - 1, exp: now - 1, nonce: 'test-expired' });
  const future = signedCookie(env, { v: 2, iat: now + 120, exp: now + 120 + SESSION_SECONDS, nonce: 'test-future' });
  const longer = signedCookie(env, { v: 2, iat: now, exp: now + SESSION_SECONDS + 60, nonce: 'test-long' });
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
    assert.equal(response.status, 200);
    loginFormAction(await response.text());
  }
  assert.equal(assetRequests.length, 0);
});

test('formerly persistent sessions no longer grant access', async () => {
  const { env, assetRequests } = fixture();
  const now = Math.floor(Date.now() / 1000);
  const former = signedCookie(env, { iat: now, exp: now + SESSION_SECONDS, nonce: 'old-policy' });
  const denied = await worker.fetch(request('/financial-statements.html', { headers: { Cookie: former } }), env);
  assert.equal(denied.status, 302);
  assert.equal(assetRequests.length, 0);
  const fresh = await session(env);
  assert.equal((await worker.fetch(request('/financial-statements.html', { headers: { Cookie: fresh } }), env)).status, 200);
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

test('an eleven-character configured password grants access; ten characters fail closed', async () => {
  const accepted = fixture({ INVESTOR_PASSWORD: 'test-only11' });
  assert.equal(accepted.env.INVESTOR_PASSWORD.length, 11);
  const cookie = await session(accepted.env, { next: '/investment-criteria.html' });
  const page = await worker.fetch(request('/investment-criteria.html', { headers: { Cookie: cookie } }), accepted.env);
  assert.equal(page.status, 200);
  assert.equal(await page.text(), 'private asset bytes');
  assert.equal(accepted.assetRequests.length, 1);

  const rejected = fixture({ INVESTOR_PASSWORD: 'test-only1' });
  assert.equal(rejected.env.INVESTOR_PASSWORD.length, 10);
  const response = await worker.fetch(loginRequest(rejected.env), rejected.env);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Set-Cookie'), null);
  assert.equal((await worker.fetch(request('/investment-criteria.html'), rejected.env)).status, 503);
  assert.equal(rejected.assetRequests.length, 0);
  assert.equal(rejected.rateKeys.length, 0);
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
