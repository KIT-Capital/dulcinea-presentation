import { renderLogin } from './login.mjs';

const encoder = new TextEncoder();
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_FORM_BYTES = 4096;
const CONTACT_EMAIL = 'kit@kitcapital.com';
const PUBLIC_ASSETS = new Set(['/gate-assets/logo.svg']);
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'self'",
].join('; ');

function protect(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  const vary = headers.get('Vary');
  if (vary !== '*' && !vary?.split(',').some((value) => value.trim().toLowerCase() === 'cookie')) {
    headers.set('Vary', vary ? `${vary}, Cookie` : 'Cookie');
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function text(content, status = 200, headers = {}) {
  return protect(new Response(content, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...headers } }));
}

function json(data, status = 200, headers = {}) {
  return protect(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } }));
}

function loginPage(options = {}, status = 200, headers = {}) {
  return protect(new Response(renderLogin({ ...options, contactEmail: CONTACT_EMAIL }), {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers },
  }));
}

function redirect(location, cookie, status = 303) {
  return protect(new Response(null, {
    status, headers: { Location: location, ...(cookie ? { 'Set-Cookie': cookie } : {}) },
  }));
}

function safeNext(value, origin) {
  if (typeof value !== 'string' || value.length > 2048 || !value.startsWith('/')
      || value.startsWith('//') || /[\\\r\n\x00]/.test(value)) return '/';
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || ['/login', '/logout'].includes(url.pathname)) return '/';
    return url.pathname + url.search + url.hash;
  } catch { return '/'; }
}

function cookieName(url) {
  return url.protocol === 'https:' ? '__Host-dulcinea_session' : 'dulcinea_preview_session';
}

function sessionCookie(url, value, seconds = SESSION_SECONDS) {
  return `${cookieName(url)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${url.protocol === 'https:' ? '; Secure' : ''}`;
}

function readCookie(request, name) {
  return (request.headers.get('Cookie') || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}

function b64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoding');
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)), (char) => char.charCodeAt(0));
}

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function passwordMatches(actual, expected) {
  const [a, b] = await Promise.all([digest(actual), digest(expected)]);
  // Compare fixed-length digests without early returns based on their contents.
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  return difference === 0;
}

async function signingKey(env) {
  // Either secret changing invalidates every previously issued session.
  return crypto.subtle.importKey('raw', await digest(JSON.stringify([env.SESSION_SECRET, env.INVESTOR_PASSWORD])),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function issueSession(env) {
  const now = Math.floor(Date.now() / 1000);
  // No visitor identity or access record is retained in the session.
  const payload = b64url(encoder.encode(JSON.stringify({ iat: now, exp: now + SESSION_SECONDS, nonce: crypto.randomUUID() })));
  const signature = await crypto.subtle.sign('HMAC', await signingKey(env), encoder.encode(payload));
  return `${payload}.${b64url(signature)}`;
}

async function authenticated(request, env, url) {
  try {
    const token = readCookie(request, cookieName(url));
    if (!token || token.length > 1024) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    if (!await crypto.subtle.verify('HMAC', await signingKey(env), unb64(parts[1]), encoder.encode(parts[0]))) return false;
    const payload = JSON.parse(new TextDecoder().decode(unb64(parts[0])));
    const now = Math.floor(Date.now() / 1000);
    return Number.isInteger(payload.iat) && Number.isInteger(payload.exp)
      && payload.iat <= now && payload.exp > now && payload.exp - payload.iat === SESSION_SECONDS;
  } catch { return false; }
}

class FormError extends Error {
  constructor(status) { super('Invalid access form'); this.status = status; }
}

async function readSmallForm(request) {
  if (Number(request.headers.get('Content-Length') || 0) > MAX_FORM_BYTES) throw new FormError(413);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/x-www-form-urlencoded')) throw new FormError(415);
  const reader = request.body?.getReader();
  if (!reader) throw new FormError(400);
  let size = 0;
  const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_FORM_BYTES) { await reader.cancel(); throw new FormError(413); }
    chunks.push(value);
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  return new URLSearchParams(new TextDecoder().decode(buffer));
}

async function submitLogin(request, env, url) {
  const wantsJson = request.headers.get('Accept')?.includes('application/json');
  const failure = (error, status, options = {}, headers = {}) => wantsJson
    ? json({ error }, status, headers) : loginPage({ ...options, error }, status, headers);
  if (request.headers.get('Origin') !== url.origin) return text('Please submit the form from this website.', 403);
  if (typeof env.LOGIN_LIMITER?.limit !== 'function') return text('Access is temporarily unavailable.', 503);
  const rateKey = b64url(await digest(`${request.headers.get('CF-Connecting-IP') || 'unknown'}\n${env.SESSION_SECRET}`));
  const allowed = await env.LOGIN_LIMITER.limit({ key: rateKey });
  if (allowed?.success !== true) return failure('Too many attempts. Please wait one minute and try again.', 429, {}, { 'Retry-After': '60' });
  let form;
  try { form = await readSmallForm(request); }
  catch (error) { return failure('Please submit a valid access form.', error instanceof FormError ? error.status : 400); }
  const name = (form.get('name') || '').trim().replace(/\s+/g, ' ');
  const email = (form.get('email') || '').trim().toLowerCase();
  const password = form.get('password') || '';
  const next = safeNext(form.get('next') || '/', url.origin);
  const options = { name, email, next };
  if (name.length < 2 || name.length > 120 || /[\x00-\x1f\x7f]/.test(name)
      || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || password.length < 1 || password.length > 128) {
    return failure('Enter your name, a valid email address and the shared password.', 400, options);
  }
  if (!await passwordMatches(password, env.INVESTOR_PASSWORD)) return failure('That password is not correct. Please try again.', 401, options);
  const cookie = sessionCookie(url, await issueSession(env));
  return wantsJson ? json({ next }, 200, { 'Set-Cookie': cookie }) : redirect(next, cookie);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (env.PREVIEW_ONLY === 'true' && !local) return text('This preview is not published.', 503);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) return text('HTTPS is required.', 400);
    try {
      const readRequest = ['GET', 'HEAD'].includes(request.method);
      if (url.pathname === '/robots.txt' && readRequest) return text(request.method === 'HEAD' ? null : 'User-agent: *\nDisallow: /\n');
      if (PUBLIC_ASSETS.has(url.pathname) && readRequest) return protect(await env.ASSETS.fetch(request));
      if (typeof env.INVESTOR_PASSWORD !== 'string' || env.INVESTOR_PASSWORD.length < 11
          || typeof env.SESSION_SECRET !== 'string' || env.SESSION_SECRET.length < 32) return text('Access is not configured yet.', 503);
      if (url.pathname === '/login') {
        if (request.method === 'POST') return await submitLogin(request, env, url);
        if (request.method !== 'GET') return text('Method not allowed.', 405, { Allow: 'GET, POST' });
        return loginPage({ next: safeNext(url.searchParams.get('next') || '/', url.origin) });
      }
      if (url.pathname === '/logout') {
        if (request.method !== 'POST') return text('Method not allowed.', 405, { Allow: 'POST' });
        if (request.headers.get('Origin') !== url.origin) return text('Please sign out from this website.', 403);
        const cookie = sessionCookie(url, '', 0);
        return request.headers.get('Accept')?.includes('application/json')
          ? json({ next: '/login' }, 200, { 'Set-Cookie': cookie }) : redirect('/login', cookie);
      }
      if (!await authenticated(request, env, url)) return redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`, null, 302);
      if (!readRequest) return text('Method not allowed.', 405, { Allow: 'GET, HEAD' });
      return protect(await env.ASSETS.fetch(request));
    } catch {
      // Do not log secrets, cookies, visitor details, or session tokens.
      return text('Access is temporarily unavailable. Please try again.', 503);
    }
  },
};
