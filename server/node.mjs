import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import worker from './worker.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BODY_BYTES = 4096;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.pdf': 'application/pdf',
};
const isLoopback = hostname => ['localhost', '127.0.0.1', '[::1]'].includes(hostname);

function configuredOrigins(env) {
  const values = env.PUBLIC_ORIGIN
    ? [env.PUBLIC_ORIGIN]
    : [env.REPLIT_DEV_DOMAIN, ...(env.REPLIT_DOMAINS || '').split(',')]
      .filter(Boolean).map(domain => `https://${domain.trim()}`);
  return [...new Set(values.map(value => {
    const url = new URL(value);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash
        || (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback(url.hostname)))) {
      throw new Error('PUBLIC_ORIGIN must be an HTTPS origin, or loopback HTTP for local development.');
    }
    return url.origin;
  }))];
}

function requestOrigin(incoming, origins) {
  if (origins.length) {
    // Replit terminates HTTPS before the Node process. Forwarded headers may
    // select an explicitly configured origin, but can never introduce one.
    const hosts = [incoming.headers.host, incoming.headers['x-forwarded-host']]
      .filter(value => typeof value === 'string' && !value.includes(','));
    return origins.find(origin => hosts.includes(new URL(origin).host)) || origins[0];
  }
  const host = incoming.headers.host;
  if (typeof host !== 'string' || /[\s/@\\?#]/.test(host)) throw new Error('Invalid host.');
  const url = new URL(`http://${host}`);
  if (!isLoopback(url.hostname)) throw new Error('Set PUBLIC_ORIGIN for a remote server.');
  return url.origin;
}

function assetBinding(directory) {
  return { async fetch(request) {
    try {
      const root = await realpath(directory);
      const pathname = decodeURIComponent(new URL(request.url).pathname);
      const candidate = path.resolve(root, '.' + pathname);
      if (!candidate.startsWith(root + path.sep)) return new Response('Not found.', { status: 404 });
      const filename = await realpath(candidate);
      if (!filename.startsWith(root + path.sep)) return new Response('Not found.', { status: 404 });
      const info = await stat(filename);
      if (!info.isFile()) return new Response('Not found.', { status: 404 });
      return new Response(request.method === 'HEAD' ? null : Readable.toWeb(createReadStream(filename)), {
        headers: {
          'Content-Type': MIME[path.extname(filename).toLowerCase()] || 'application/octet-stream',
          'Content-Length': String(info.size),
        },
      });
    } catch { return new Response('Not found.', { status: 404 }); }
  } };
}

function loginLimiter() {
  // This limiter is for one Replit/Node process. It resets on restart and is
  // not shared across replicas. Proxy peers share a bucket deliberately:
  // trusting arbitrary forwarded client-IP headers would permit bypasses.
  const attempts = new Map();
  return { async limit({ key }) {
    const now = Date.now();
    for (const [candidate, entry] of attempts) if (entry.expires <= now) attempts.delete(candidate);
    let entry = attempts.get(key);
    if (!entry) {
      if (attempts.size >= 10000) return { success: false };
      entry = { count: 0, expires: now + 60000 };
      attempts.set(key, entry);
    }
    entry.count++;
    return { success: entry.count <= 8 };
  } };
}

class BodyTooLarge extends Error {}

function readBody(incoming) {
  if (Number(incoming.headers['content-length'] || 0) > MAX_BODY_BYTES) {
    incoming.pause();
    return Promise.reject(new BodyTooLarge());
  }
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    const clean = () => {
      incoming.off('data', onData);
      incoming.off('end', onEnd);
      incoming.off('error', onError);
      incoming.off('aborted', onAbort);
    };
    const onData = chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        clean(); incoming.pause(); reject(new BodyTooLarge());
      } else chunks.push(chunk);
    };
    const onEnd = () => { clean(); resolve(Buffer.concat(chunks, size)); };
    const onError = error => { clean(); reject(error); };
    const onAbort = () => onError(new Error('Request aborted.'));
    incoming.on('data', onData).on('end', onEnd).on('error', onError).on('aborted', onAbort);
  });
}

export function createNodeServer({
  assetsDirectory = path.join(repository, 'dist/private-site'),
  env = process.env,
} = {}) {
  const origins = configuredOrigins(env);
  const bindings = {
    PREVIEW_ONLY: 'false',
    INVESTOR_PASSWORD: env.INVESTOR_PASSWORD,
    SESSION_SECRET: env.SESSION_SECRET,
    LOGIN_LIMITER: loginLimiter(),
    ASSETS: assetBinding(assetsDirectory),
  };
  const server = http.createServer(async (incoming, outgoing) => {
    try {
      if (!incoming.url?.startsWith('/') || incoming.url.startsWith('//') || incoming.url.includes('\\')) {
        throw new Error('Invalid request target.');
      }
      const origin = requestOrigin(incoming, origins);
      const headers = new Headers();
      for (const [name, value] of Object.entries(incoming.headers)) {
        if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
      }
      headers.set('Host', new URL(origin).host);
      headers.set('CF-Connecting-IP', incoming.socket.remoteAddress || 'unknown');
      const method = incoming.method || 'GET';
      const body = ['GET', 'HEAD'].includes(method) ? undefined : await readBody(incoming);
      const request = new Request(new URL(incoming.url, origin), { method, headers, body });
      const response = await worker.fetch(request, bindings);
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      if (!response.body || method === 'HEAD') { outgoing.end(); return; }
      const stream = Readable.fromWeb(response.body);
      stream.on('error', () => outgoing.destroy());
      outgoing.on('close', () => stream.destroy());
      stream.pipe(outgoing);
    } catch (error) {
      if (outgoing.headersSent) { outgoing.destroy(); return; }
      const status = error instanceof BodyTooLarge ? 413 : 400;
      outgoing.writeHead(status, {
        'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', Connection: 'close',
      });
      outgoing.end(status === 413 ? 'Request body is too large.' : 'Invalid request or server origin configuration.', () => incoming.destroy());
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  createNodeServer().listen(port, '0.0.0.0', () => {
    console.log(`Dulcinea site and presentation listening on port ${port}.`);
  });
}
