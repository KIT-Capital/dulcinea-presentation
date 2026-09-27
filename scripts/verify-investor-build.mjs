import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

// Read-only release gate. Build first with `node scripts/build.mjs --web`.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'dist/private-site');
const origin = 'https://invest.dulcineainvestments.org';
const limit = 25 * 1024 * 1024;
const files = new Map();
const pages = new Map();
const read = name => readFile(path.join(root, name), 'utf8');
const decode = text => text.replace(/&#(x[\da-f]+|\d+);/gi, (_, value) =>
  String.fromCodePoint(value[0].toLowerCase() === 'x' ? parseInt(value.slice(1), 16) : Number(value)))
  .replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const withoutScripts = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const textContent = html => decode(withoutScripts(html).replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
const attributes = tag => Object.fromEntries([...tag.matchAll(/\b([\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map(([, key, , value]) => [key.toLowerCase(), decode(value)]));

async function inventory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Build contains a symlink: ${filename}`);
    if (entry.isDirectory()) { await inventory(filename); continue; }
    const relative = path.relative(site, filename).replaceAll('\\', '/');
    const info = await stat(filename);
    assert.ok(info.size <= limit, `Asset exceeds 25 MiB: ${relative}`);
    assert.ok(!/(^|\/)(?:source-packages|content|design|server|scripts|\.git|\.wrangler|node_modules)(?:\/|$)/i.test(relative), `Internal file in build: ${relative}`);
    assert.ok(!/(?:\.(?:xlsx?|pptx?|zip|mov)|(?:^|\/)(?:\.env[^/]*|\.dev\.vars[^/]*|[^/]*(?:secrets|provenance)[^/]*))$/i.test(relative), `Source or private file in build: ${relative}`);
    files.set('/' + relative, filename);
    if (relative.endsWith('.html')) pages.set('/' + relative, await readFile(filename, 'utf8'));
  }
}

function resolveBuiltURL(reference, base, label) {
  if (!reference || /^(?:data:|blob:|mailto:|tel:|javascript:)/i.test(reference)) return null;
  const url = new URL(reference, origin + base);
  if (url.origin !== origin) return null;
  assert.ok(!url.pathname.includes('..'), `Invalid local URL: ${label}`);
  if (['/logout', '/login'].includes(url.pathname)) return url;
  let target = decodeURIComponent(url.pathname);
  if (target.endsWith('/')) target += 'index.html';
  if (!files.has(target) && files.has(target + '.html')) target += '.html';
  assert.ok(files.has(target), `Missing asset or page: ${label} -> ${url.pathname}`);
  if (url.hash && pages.has(target)) {
    const anchor = decodeURIComponent(url.hash.slice(1));
    const ids = new Set([...withoutScripts(pages.get(target)).matchAll(/\bid=(["'])(.*?)\1/g)].map(match => decode(match[2])));
    assert.ok(ids.has(anchor), `Missing section: ${label} -> ${target}${url.hash}`);
  }
  return url;
}

await inventory(site);
const requiredPages = ['', 'es/'].flatMap(prefix => ['index', 'financial-statements', 'investment-criteria'].map(name => `/${prefix}${name}.html`));
assert.deepEqual([...pages.keys()].sort(), [...requiredPages].sort(), 'Expected only EN/ES investor, financial and criteria pages');
const publicAssets = ['/gate-assets/logo.svg', '/assets/images/stock/AdobeStock_891890158-web.jpg', '/assets/video/stock/AdobeStock_693150796.mp4'];
for (const asset of publicAssets) assert.ok(files.has(asset), `Missing public share/login asset: ${asset}`);

// A new alias must resolve to its canonical source, not a second copy of a video.
const aliases = JSON.parse(await read('src/investor/media.json'));
const manifest = JSON.parse(await read('assets/manifest.json'));
for (let page = 1; page <= 9; page++) {
  const entry = manifest.find(item => item.marker === `{{PLAN_PAGE_${page}}}`);
  assert.ok(entry, `Missing source plan ${page}`);
  aliases[`plan-${page}.webp`] = entry.path;
}
assert.equal(new Set(Object.values(aliases)).size, Object.keys(aliases).length, 'Media aliases duplicate a source path');
const expectedMap = Object.fromEntries(Object.entries(aliases).map(([alias, source]) => [alias,
  alias === 'floorplans.pdf' ? '/downloads/Dulcinea-Floorplans.pdf' : '/' + source.replaceAll('\\', '/')]));
let compiledScripts = 0;
for (const [pagePath, html] of pages) {
  const language = pagePath.startsWith('/es/') ? 'es' : 'en';
  assert.match(html, new RegExp(`<html\\s+lang=["']${language}["']`), `Wrong language: ${pagePath}`);
  assert.doesNotMatch(html, /Design preview|Vista previa|\{\{[A-Z_0-9]+\}\}|\/\*__[A-Z_]+__\*\//i, `Preview text or unexpanded marker: ${pagePath}`);
  const markup = withoutScripts(html);
  for (const tag of markup.match(/<[a-z][^>]*>/gi) || []) {
    const attrs = attributes(tag);
    for (const name of ['src', 'poster', 'href', 'action']) {
      if (attrs[name]) resolveBuiltURL(attrs[name], pagePath, `${pagePath} ${name}`);
    }
    if (attrs['property'] === 'og:image' || attrs['property'] === 'og:video' || attrs['name'] === 'twitter:image') {
      resolveBuiltURL(attrs.content, pagePath, `${pagePath} ${attrs.property || attrs.name}`);
    }
  }
  for (const match of markup.matchAll(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi)) resolveBuiltURL(match[2], pagePath, `${pagePath} CSS`);
  for (const [index, match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
    const attrs = attributes(match[1]);
    if (attrs.src) continue;
    if (attrs.type && !['text/javascript', 'application/javascript'].includes(attrs.type)) continue;
    new Script(match[2], { filename: `${pagePath}:inline-${index + 1}` });
    compiledScripts++;
  }

  if (!pagePath.endsWith('/index.html')) continue;
  assert.match(html, /window\.DULCINEA_WEB\s*=\s*true\s*;/, `Portable build deployed: ${pagePath}`);
  const injected = html.match(/window\.DULCINEA_ASSETS\s*=\s*(\{[^\n]*?\})\s*;/);
  assert.ok(injected, `Missing injected media map: ${pagePath}`);
  const map = JSON.parse(injected[1]);
  assert.deepEqual(map, expectedMap, `Media alias map diverges from sources: ${pagePath}`);
  for (const [alias, url] of Object.entries(map)) resolveBuiltURL(url, pagePath, `${pagePath} media alias ${alias}`);
  const forms = [...markup.matchAll(/<form\b[^>]*>/gi)].map(match => attributes(match[0]));
  assert.ok(forms.some(form => form.action === '/logout' && form.method?.toLowerCase() === 'post'), `Missing POST sign-out: ${pagePath}`);
  assert.match(markup, /href=["']https:\/\/wa\.me\/19174284062["']/, `Missing Dov WhatsApp: ${pagePath}`);
  assert.match(markup, /href=["']mailto:kit@kitcapital\.com["']/, `Missing Dov email: ${pagePath}`);
  for (const person of ['K. Dov Isaza Tuzman', 'Ricardo Cidale', 'Adriana Suárez']) assert.ok(textContent(markup).includes(person), `Missing team member ${person}: ${pagePath}`);
  assert.match(markup, /id=["']plans-dialog["']/, `Missing plan viewer: ${pagePath}`);
  const homeBlock = html.match(/const homes\s*=\s*\[([\s\S]*?)\n\];/);
  assert.ok(homeBlock, `Missing home configuration: ${pagePath}`);
  const homePlans = [...homeBlock[1].matchAll(/key:\s*['"]([^'"]+)['"][^\n]*?plans:\s*\[([^\]]*)\]/g)].map(([, key, planList]) => [key, planList.split(',').map(value => value.trim()).filter(Boolean).map(Number)]);
  assert.equal(homePlans.length, 5, `Expected five homes: ${pagePath}`);
  assert.equal(homePlans.filter(([, planList]) => planList.length).length, 4, `Expected four homes with plans: ${pagePath}`);
  assert.deepEqual(homePlans.flatMap(([, planList]) => planList).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9], `Plan coverage is incomplete or duplicated: ${pagePath}`);
  assert.deepEqual(homePlans.find(([key]) => key === 'montana')?.[1], [], 'Do not invent Casa Montana plans');
  for (const name of ['financial-statements', 'investment-criteria']) {
    const target = `/${language === 'es' ? 'es/' : ''}${name}.html`;
    assert.ok(markup.includes(`href="${target}"`), `Missing ${language} navigation resource ${name}`);
  }
  const text = textContent(markup);
  for (const phrase of language === 'en'
    ? ['Our first fund.', 'Lola & Ber Hospitality', '30% already committed.', 'Three equity kickers.', 'Delaware LLC', 'Sign out']
    : ['Nuestro primer fondo.', 'Lola & Ber Hospitality', '30% ya comprometido.', 'Tres beneficios de participación adicionales.', 'LLC de Delaware', 'Cerrar sesión']) {
    assert.ok(text.includes(phrase), `Missing visible ${language} investor content: ${phrase}`);
  }
}

for (const prefix of ['', '/es']) {
  const financial = pages.get(`${prefix}/financial-statements.html`);
  const criteria = pages.get(`${prefix}/investment-criteria.html`);
  for (const section of ['income-statement', 'after-carry', 'cash-flow-statement', 'balance-sheet']) {
    assert.ok(financial.includes(`id="${section}"`), `Missing financial section ${section}: ${prefix || '/'}`);
    assert.ok(financial.includes(`href="#${section}"`), `Missing financial navigation ${section}: ${prefix || '/'}`);
  }
  assert.ok(financial.includes(`href="${prefix || ''}/#fund"`), `Incorrect financial return link: ${prefix || '/'}`);
  assert.ok(criteria.includes(`href="${prefix || ''}/#homes"`), `Incorrect criteria return link: ${prefix || '/'}`);
  assert.doesNotMatch(financial + criteria, /href=["'][^"']*#slide-/, 'Resource links still target the old presentation');
}

const videoHashes = new Map();
for (const [url, filename] of files) {
  if (!url.endsWith('.mp4')) continue;
  const hash = createHash('sha256').update(await readFile(filename)).digest('hex');
  assert.ok(!videoHashes.has(hash), `Duplicate MP4 bytes: ${url} and ${videoHashes.get(hash)}`);
  videoHashes.set(hash, url);
}
console.log(`Verified protected investor build: ${pages.size} EN/ES pages, ${files.size} files, ${Object.keys(aliases).length} media aliases, ${videoHashes.size} distinct MP4s, ${compiledScripts} parsed inline scripts; links, plan coverage, team, offer, sign-out and public share assets passed.`);
