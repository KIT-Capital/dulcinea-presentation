import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { videoSizes } from '../server/video-sizes.mjs';
import { assetPolicy } from '../server/access-policy.mjs';
import { publicAssetPaths } from '../server/public-asset-paths.mjs';
import { socialMetadata, SOCIAL_ORIGIN, REVIEW_ORIGIN, SOCIAL_IMAGE_PATH, SOCIAL_IMAGE_ES_PATH } from '../shared/social-metadata.mjs';
import { FAVICON_ASSETS } from '../shared/favicon.mjs';
import { french, frenchText } from '../shared/locales.mjs';
import { PRESENTATION_PDFS } from '../shared/presentation-downloads.mjs';
import { verifyPresentationPdfs } from './verify-presentation-pdfs.mjs';

// Read-only release gate. Build first with `node scripts/build.mjs --web`.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'dist/private-site');
const review = process.argv.includes('--review');
const origin = review ? REVIEW_ORIGIN : SOCIAL_ORIGIN;
const limit = 25 * 1024 * 1024;
const approvedPDFs = new Set(['/downloads/Dulcinea-Floorplans.pdf', ...Object.values(PRESENTATION_PDFS)]);
const files = new Map();
const pages = new Map();
const read = name => readFile(path.join(root, name), 'utf8');
const build = JSON.parse(await read('dist/investor-build.json'));
assert.deepEqual(build, {version:1,mode:review?'review':'production',origin}, 'Build mode does not match this verification; rebuild for the intended destination');
const story = JSON.parse(await read('content/presentation-story.json'));
const memberTerms = JSON.parse(await read('content/investor-terms.json'));
const latestModel = JSON.parse(await read('content/model-summary.json'));
assert.equal(memberTerms.source.sha256, latestModel.provenance.sha256, 'Member terms and financial projections must use the same workbook');
const expectedOrder = ["cover", "lifestyle", "region", "oriente", "city", "hospitality", "services", "benefits", "monte-sereno", "montana", "fontanar", "san-lucas", "aires", "idea", "team", "specialists", "returns", "offer", "disclaimer", "contact"];
assert.deepEqual(story.main.map(step=>step.id), expectedOrder, 'Main presentation order');
assert.deepEqual(story.appendices.map(step=>step.id), ['owner-use'], 'Owner booking is optional detail');
assert.deepEqual(Object.values(story.legacyNumeric), ['cover','lifestyle','benefits','owner-use','oriente','city','hospitality','fontanar','san-lucas','aires','monte-sereno','montana','idea','offer','returns','team','specialists','disclaimer','contact'], 'Published numeric links must retain their subjects');
const presentationAnchors = new Set([...story.main,...story.appendices].map(step=>`present-${step.id}`).concat(Object.keys(story.legacyNumeric).map(key=>`present-${key}`)));
const decode = text => text.replace(/&#(x[\da-f]+|\d+);/gi, (_, value) =>
  String.fromCodePoint(value[0].toLowerCase() === 'x' ? parseInt(value.slice(1), 16) : Number(value)))
  .replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const withoutScripts = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const normalizeWhitespace = text => text.replace(/\s+/g, ' ');
const textContent = html => normalizeWhitespace(decode(withoutScripts(html).replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ')));
const attributes = tag => Object.fromEntries([...tag.matchAll(/\b([\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map(([, key, , value]) => [key.toLowerCase(), decode(value)]));

async function inventory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Build contains a symlink: ${filename}`);
    if (entry.isDirectory()) { await inventory(filename); continue; }
    const relative = path.relative(site, filename).replaceAll('\\', '/');
    const info = await stat(filename);
    assert.ok(info.size <= limit, `Asset exceeds 25 MiB: ${relative}`);
    assert.ok(!/(^|\/)(?:source-packages|source-documents|company[ -]documents|content|docs|design|server|scripts|\.git|\.wrangler|node_modules)(?:\/|$)/i.test(relative), `Internal file in build: ${relative}`);
    assert.ok(!/(?:\.(?:docx?|xlsx?|xlsm|xlsb|pptx?|csv|tsv|ods|odt|odp|rtf|txt|md|zip|7z|rar|tar|gz|mov)|(?:^|\/)(?:\.env[^/]*|\.dev\.vars[^/]*|[^/]*(?:secrets|provenance)[^/]*))$/i.test(relative), `Source or private file in build: ${relative}`);
    if (/\.pdf$/i.test(relative)) assert.ok(approvedPDFs.has('/' + relative), `Only the approved floorplan and localized presentation PDFs may be published: ${relative}`);
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
    assert.ok(ids.has(anchor) || (target.endsWith('/index.html') && presentationAnchors.has(anchor)), `Missing section: ${label} -> ${target}${url.hash}`);
  }
  return url;
}

await inventory(site);
await verifyPresentationPdfs(root, { builtDirectory: site });
assert.deepEqual([...publicAssetPaths].sort(), [...files.keys()].filter(file=>!file.endsWith('.html')).sort(), 'Public asset allowlist must match approved built media');
for (const asset of publicAssetPaths) assert.equal(assetPolicy(asset).access, 'public', `Public media classification: ${asset}`);
for (const page of pages.keys()) assert.equal(assetPolicy(page).access, page.endsWith('/financial-statements.html')?'private':'public', `Page access classification: ${page}`);
const requiredPages = ['', 'es/', 'fr/'].flatMap(prefix => ['index', 'financial-statements', 'member-benefits', 'investment-criteria', 'specialists', 'disclaimer'].map(name => `/${prefix}${name}.html`));
assert.deepEqual([...pages.keys()].sort(), [...requiredPages].sort(), 'Expected only EN/ES/FR investor, financial, member-benefits, criteria, specialists and disclaimer pages');
assert.deepEqual([...files.keys()].filter(file => /\.pdf$/i.test(file)).sort(), [...approvedPDFs].sort(), 'Exactly the floorplan PDF and three localized presentation PDFs must be built');
for (const [language, asset] of Object.entries(PRESENTATION_PDFS)) {
  const pdf = await readFile(files.get(asset));
  assert.ok(pdf.length > 1024, `Empty presentation PDF: ${language}`);
  assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-', `Invalid presentation PDF: ${language}`);
  assert.match(pdf.subarray(-2048).toString('latin1'), /%%EOF\s*$/, `Incomplete presentation PDF: ${language}`);
  assert.ok(pdf.equals(await readFile(path.join(root, asset.slice(1)))), `Built presentation differs from its approved source: ${language}`);
}
const publicAssets = ['/gate-assets/logo.svg', SOCIAL_IMAGE_PATH, SOCIAL_IMAGE_ES_PATH, '/assets/images/stock/AdobeStock_891890158-web.jpg', '/assets/video/stock/AdobeStock_693150796.mp4'];
for (const asset of publicAssets) assert.ok(files.has(asset), `Missing public share/login asset: ${asset}`);
for (const [filename, source] of Object.entries(FAVICON_ASSETS)) {
  const asset = '/' + filename;
  assert.ok(files.has(asset), `Missing browser icon: ${asset}`);
  assert.ok((await readFile(files.get(asset))).equals(await readFile(path.join(root,source))), `Browser icon differs from approved brand asset: ${asset}`);
}
for (const asset of [SOCIAL_IMAGE_PATH, SOCIAL_IMAGE_ES_PATH]) {
  const image = await readFile(files.get(asset));
  assert.equal(image.readUInt16BE(0), 0xffd8, `Share image must be JPEG: ${asset}`);
  let dimensions;
  for (let offset = 2; offset + 9 < image.length;) {
    assert.equal(image[offset], 0xff, `Invalid JPEG segment: ${asset}`);
    const marker = image[offset + 1];
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      dimensions = [image.readUInt16BE(offset + 7), image.readUInt16BE(offset + 5)];
      break;
    }
    const length = image.readUInt16BE(offset + 2);
    assert.ok(length >= 2, `Invalid JPEG segment length: ${asset}`);
    offset += length + 2;
  }
  assert.deepEqual(dimensions, [1200, 630], `Share-card dimensions do not match metadata: ${asset}`);
}

// A new alias must resolve to its canonical source, not a second copy of a video.
const aliases = JSON.parse(await read('src/investor/media.json'));
// Also catch repetition hidden inside different montage filenames.
const reviewEdits = JSON.parse(await read('assets/video/review/provenance.json')).videos;
const brandEdit = JSON.parse(await read('assets/video/hospitality-provenance.json'));
const sourceOwners = new Map();
for (const [alias, source] of Object.entries(aliases).filter(([name])=>name.endsWith('.mp4'))) {
  const edit = reviewEdits.find(video=>video.file===source);
  if(edit)assert.equal(createHash('sha256').update(await readFile(path.join(root,source))).digest('hex'),edit.sha256,`Film changed without updating its edit record: ${alias}`);
  const sourcePaths = edit ? edit.sources.map(scene=>scene.path)
    : source.endsWith('/hospitality-people.mp4') ? brandEdit.sources.map(scene=>scene.path||scene.external_source_path)
    : [source];
  for(const original of new Set(sourcePaths)){
    assert.ok(original,`Missing footage provenance: ${alias}`);
    assert.ok(!sourceOwners.has(original),`Footage repeated in ${alias} and ${sourceOwners.get(original)}: ${original}`);
    sourceOwners.set(original,alias);
  }
}
for(const stock of (await readdir(path.join(root,'assets/video/stock'))).filter(name=>name.endsWith('.mp4'))){
  // The user removed the lake outing and replaced the pine opening with the full reservoir aerial.
  // Keep both source clips archived, outside the active story.
  if(['AdobeStock_1164208469.mp4','AdobeStock_665115389.mp4'].includes(stock)){
    assert.ok(!sourceOwners.has(`assets/video/stock/${stock}`),`Archived footage must not return to the active story: ${stock}`);
    continue;
  }
  assert.ok(sourceOwners.has(`assets/video/stock/${stock}`),`Supplied stock clip omitted: ${stock}`);
}
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
  const language = pagePath.startsWith('/es/') ? 'es' : pagePath.startsWith('/fr/') ? 'fr' : 'en';
  assert.match(html, new RegExp(`<html\\s+lang=["']${language}["']`), `Wrong language: ${pagePath}`);
  assert.doesNotMatch(html, /Design preview|Vista previa|\{\{[A-Z_0-9]+\}\}|\/\*__[A-Z_]+__\*\//i, `Preview text or unexpanded marker: ${pagePath}`);
  assert.doesNotMatch(html, /\uFFFD/, `Invalid text encoding: ${pagePath}`);
  const markup = withoutScripts(html);
  if (language === 'fr') {
    const prose = markup.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
    for (const [, node] of prose.matchAll(/>([^<>]+)</g)) {
      const key = decode(node).trim();
      assert.ok(!Object.hasOwn(french, key) || french[key] === key, `Untranslated French text: ${pagePath}: ${key}`);
    }
  }
  assert.doesNotMatch(decode(markup) + textContent(markup), /buy[\s\u00ad\u200b\u2010-\u2015-]*box/i, `Use acquisition criteria instead of the retired label: ${pagePath}`);
  const forms = [...markup.matchAll(/<form\b[^>]*>/gi)].map(match => attributes(match[0]));
  const hasSignout = forms.some(form => form.action === '/logout' && form.method?.toLowerCase() === 'post');
  assert.equal(hasSignout, pagePath.endsWith('/financial-statements.html'), `Sign-out belongs only in financial statements: ${pagePath}`);
  for (const tag of markup.match(/<[a-z][^>]*>/gi) || []) {
    const attrs = attributes(tag);
    for (const name of ['src', 'poster', 'href', 'action','data-cover-source','data-cover-poster']) {
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

  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
  const headLinks = [...head.matchAll(/<link\b[^>]*>/gi)].map(match => attributes(match[0]));
  for (const filename of Object.keys(FAVICON_ASSETS)) {
    const icons = headLinks.filter(link => link.href === '/' + filename);
    assert.equal(icons.length, 1, `Expected browser icon on ${pagePath}: ${filename}`);
    assert.equal(icons[0].rel, filename === 'apple-touch-icon.png' ? 'apple-touch-icon' : 'icon');
  }
  assert.equal(headLinks.filter(link => link.rel === 'icon').length, 3, `Unexpected or duplicate favicon: ${pagePath}`);
  const page = path.posix.basename(pagePath, '.html');
  const card = socialMetadata(language, { origin, page });
  const socialTags = [...markup.matchAll(/<meta\b[^>]*>/gi)].map(match => attributes(match[0]));
  const socialValue = key => {
    const matches = socialTags.filter(tag => tag.property === key || tag.name === key);
    assert.equal(matches.length, 1, `Expected one ${key} tag: ${pagePath}`);
    return matches[0].content;
  };
  assert.equal(socialValue('og:title'), card.title);
  assert.equal(socialValue('og:description'), card.description);
  assert.equal(socialValue('og:url'), card.url);
  assert.equal(socialValue('og:locale'), card.locale);
  assert.deepEqual(socialTags.filter(tag => tag.property === 'og:locale:alternate').map(tag => tag.content).sort(), [...card.alternateLocales].sort(), `Alternate social locales: ${pagePath}`);
  assert.equal(socialValue('og:image'), origin + card.imagePath);
  assert.equal(socialValue('og:image:width'), '1200');
  assert.equal(socialValue('og:image:height'), '630');
  assert.equal(socialValue('twitter:image'), socialValue('og:image'));
  assert.equal(socialValue('twitter:image:alt'), card.imageAlt);
  assert.deepEqual(headLinks.filter(link => link.rel === 'canonical').map(link => link.href), [card.url], `Incorrect canonical URL: ${pagePath}`);
  assert.equal(socialValue('description'), card.description);
  if (!pagePath.endsWith('/index.html')) {
    assert.equal((markup.match(/class="locale-switch(?:\s[^"]*)?"/g)||[]).length,1, `Exactly one resource language switch: ${pagePath}`);
    const switchMarkup = markup.match(/<nav\b[^>]*class="locale-switch[^>]*>[\s\S]*?<\/nav>/)?.[0] || '';
    const choices = [...switchMarkup.matchAll(/<a\b[^>]*>/g)].map(match => attributes(match[0]));
    assert.deepEqual(choices.map(choice => choice.lang), ['en', 'es', 'fr'], `All three resource languages must be available: ${pagePath}`);
    assert.deepEqual(choices.filter(choice => choice['aria-current'] === 'page').map(choice => choice.lang), [language], `Current resource language: ${pagePath}`);
    continue;
  }
  const languageButtons = [...markup.matchAll(/<button\b[^>]*\bdata-language="[^"]+"[^>]*>/g)].map(match => attributes(match[0]));
  assert.deepEqual(languageButtons.map(button => button['data-language']), ['en', 'es', 'fr'], `All three homepage languages must be available: ${pagePath}`);
  const downloads = [...markup.matchAll(/<a\b[^>]*\bdata-presentation-pdf\b[^>]*>/g)].map(match => attributes(match[0]));
  assert.ok(downloads.length >= 1, `Missing presentation PDF download: ${pagePath}`);
  for (const download of downloads) {
    assert.equal(download.href, PRESENTATION_PDFS[language], `PDF download must match the current language: ${pagePath}`);
    assert.equal(download.download, path.posix.basename(PRESENTATION_PDFS[language]), `PDF download filename must identify its language: ${pagePath}`);
  }
  assert.match(html, /window\.DULCINEA_WEB\s*=\s*true\s*;/, `Portable build deployed: ${pagePath}`);
  const injected = html.match(/window\.DULCINEA_ASSETS\s*=\s*(\{[^\n]*?\})\s*;/);
  assert.ok(injected, `Missing injected media map: ${pagePath}`);
  const map = JSON.parse(injected[1]);
  assert.deepEqual(map, expectedMap, `Media alias map diverges from sources: ${pagePath}`);
  const injectedStory=html.match(/window\.DULCINEA_STORY\s*=\s*(\{[^\n]*?\})\s*;/);
  assert.ok(injectedStory, `Missing presentation story: ${pagePath}`);
  assert.deepEqual(JSON.parse(injectedStory[1]),story,`Presentation metadata diverges from source: ${pagePath}`);
  for (const [alias, url] of Object.entries(map)) resolveBuiltURL(url, pagePath, `${pagePath} media alias ${alias}`);
  if(review){
    assert.match(markup, /data-preview-contact=["']https:\/\/wa\.me\/19174284062["']/, `Missing preserved, inert Dov WhatsApp: ${pagePath}`);
    assert.match(markup, /data-preview-contact=["']mailto:kit@kitcapital\.com["']/, `Missing preserved, inert Dov email: ${pagePath}`);
    assert.doesNotMatch(markup,/href=["'](?:mailto:|tel:|https:\/\/wa\.me\/)/,`Preview contact must not send: ${pagePath}`);
  }else{
    assert.match(markup, /href=["']https:\/\/wa\.me\/19174284062["']/, `Missing active Dov WhatsApp: ${pagePath}`);
    assert.match(markup, /href=["']mailto:kit@kitcapital\.com["']/, `Missing active Dov email: ${pagePath}`);
    assert.doesNotMatch(markup,/data-preview-contact=/,`Production contact is still disabled: ${pagePath}`);
    assert.ok(!markup.includes(REVIEW_ORIGIN),`Production metadata refers to the review website: ${pagePath}`);
  }
  const teamSection = markup.match(/<section\b[^>]*\bid="team"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(teamSection, `Missing core team section: ${pagePath}`);
  const coreProfiles = [...teamSection.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(match=>match[0]);
  assert.deepEqual(coreProfiles.map(profile=>textContent(profile.match(/<h3\b[^>]*>[\s\S]*?<\/h3>/)?.[0] || '').trim()), ['K. Dov Isaza Tuzman', 'Ricardo Cidale', 'Adriana Suárez', 'Natalia Carvajal'], `Core team order and membership: ${pagePath}`);
  assert.equal(story.main.find(step=>step.id==='team')?.selector, '#team', 'Presentation must reuse the complete core team section');
  const expectedRoles = language==='es'
    ? ['Fundador y Socio Director','Director de Desarrollo Corporativo','Directora de Desarrollo de Negocios','Directora de Marketing']
    : ['Founder and Managing Partner','Director of Corporate Development','Director of Business Development','Director of Marketing'].map(role => language === 'fr' ? frenchText(role) : role);
  assert.deepEqual(coreProfiles.map(profile=>textContent(profile.match(/<p class="micro"[^>]*>[\s\S]*?<\/p>/)?.[0] || '').trim()), expectedRoles, `Current user-approved core team titles: ${pagePath}`);
  const sharedAffiliation = language === 'es' ? 'KIT Capital y Dulcinea' : language === 'fr' ? frenchText('KIT Capital and Dulcinea') : 'KIT Capital and Dulcinea';
  assert.deepEqual(coreProfiles.map(profile=>textContent(profile.match(/<p class="team-affiliation"[^>]*>[\s\S]*?<\/p>/)?.[0] || '').trim()), ['KIT Capital','KIT Capital',sharedAffiliation,sharedAffiliation], `Core team affiliations: ${pagePath}`);
  const nataliaPortrait = attributes(coreProfiles[3].match(/<img\b[^>]*>/)?.[0] || '');
  assert.ok(nataliaPortrait.src && map['natalia.png'], `Missing Natalia portrait or approved media alias: ${pagePath}`);
  assert.equal(nataliaPortrait.src, map['natalia.png'], `Natalia portrait must use its approved media alias: ${pagePath}`);
  assert.equal(nataliaPortrait.alt, 'Natalia Carvajal', `Natalia portrait description: ${pagePath}`);
  assert.ok(textContent(coreProfiles[3]).includes(expectedRoles[3]), `Missing localized Natalia role: ${pagePath}`);
  const coreBios = coreProfiles.map(profile=>textContent(profile.match(/<p\b[^>]*class="team-bio"[^>]*>[\s\S]*?<\/p>/)?.[0] || '').trim());
  assert.ok(coreBios.every(bio=>language === 'fr' ? bio.split(/\s+/).length >= 18 && bio.split(/\s+/).length <= 45 : bio.split(/\s+/).length === (language==='es' ? 27 : 24)), `Core biographies must retain concise reading lengths: ${pagePath}`);
  assert.ok(!coreBios[3].includes(expectedRoles[3]), 'Natalia biography must not repeat her role label');
  assert.match(markup, /id=["']plans-dialog["']/, `Missing plan viewer: ${pagePath}`);
  for(const chapter of ['destination','ownership','member-benefits','owner-use','oriente','after-dark','resources','home-films']) assert.ok(markup.includes(`id="${chapter}"`),`Missing homepage chapter ${chapter}: ${pagePath}`);
  const chapterOrder=['ownership','oriente','destination','after-dark','experience','member-benefits','homes','approach','team','specialists','returns','fund','resources','contact'];
  for(let i=1;i<chapterOrder.length;i++) assert.ok(markup.indexOf(`id="${chapterOrder[i-1]}"`) < markup.indexOf(`id="${chapterOrder[i]}"`), `Homepage chapter order: ${chapterOrder[i-1]} before ${chapterOrder[i]}`);
  assert.match(markup, /<details class="owner-use" id="owner-use">/, 'Owner booking rules should be expandable on the website');
  assert.doesNotMatch(markup, /Three equity kickers|Tres beneficios de participación adicionales/, 'The old equity-only overview must be replaced');
  assert.deepEqual([...markup.matchAll(/<a class="property-preview"[^>]*data-preview-home="(\d)"/g)].map(match=>Number(match[1])),[3,4,0,1,2],`Five country-first property selectors: ${pagePath}`);
  assert.doesNotMatch(markup, /class="property-tabs"|class="home-film-grid"/, 'Avoid duplicate property browsing');
  for(const step of story.main.filter(step=>step.propertyKey))assert.ok(markup.includes(`id="property-${step.propertyKey}"`),`Missing durable property URL: ${step.propertyKey}`);
  assert.ok(markup.indexOf('id="team"') < markup.indexOf('id="returns"'),'The team should precede projected returns');
  assert.match(markup, /<section class="returns section-pad" id="returns"/,'Projected results should be a visible section');
  assert.doesNotMatch(markup, /<details class="model"/,'Returns must not depend on the offer accordion');
  assert.match(markup, /id="experience-hospitality"[^>]*loop/,'Hospitality film must loop independently');
  assert.match(markup, /id="experience-nightlife"[^>]*loop/,'Nightlife film must loop independently');
  assert.doesNotMatch(html, /#experience-hospitality\s*\{\s*opacity:\s*0/, 'Hospitality video must remain visible');
  const homepageFilms = new Set([...markup.matchAll(/<video\b[^>]*>/gi)].map(match=>attributes(match[0]).src));
  const expectedFilms = new Set(Object.entries(map).filter(([alias])=>alias.endsWith('.mp4')).map(([,url])=>url));
  assert.ok(![...files.keys()].some(url=>url.includes('/review/lifestyle')), 'Rejected garden-reading and outdoor-gathering media must not be deployed');
  assert.deepEqual(homepageFilms,expectedFilms,`Every film should appear while scrolling the homepage: ${pagePath}`);
  assert.match(markup,/id="review-cover-film"[^>]*src="[^"']*AdobeStock_693150796\.mp4"/,'Cover starts with Medellin drone footage');
  // Each story chapter owns its footage. A property's preview and detail may
  // share its own film; destination/lifestyle chapters must not repeat films.
  const chapterFilms = [...markup.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)]
    .filter(([,id])=>id!=='homes')
    .flatMap(([,id,section])=>[...section.matchAll(/<video\b[^>]*>/g)].map(([tag])=>({id,src:attributes(tag).src})));
  assert.equal(new Set(chapterFilms.map(film=>film.src)).size,chapterFilms.length,`Repeated film across story chapters: ${pagePath}`);
  assert.doesNotMatch(markup,/dulcinea-introduction\.mp4|medellin-location\.mp4|oriente-country\.mp4|data-cover-source/, 'Retire the overlapping compilations and cover replays');
  const chapterLinks=markup.match(/<nav class="hero-destinations[\s\S]*?<\/nav>/)?.[0];
  assert.ok(chapterLinks,'Cover should link into the story');
  for(const destination of ['destination','oriente','homes'])assert.ok(chapterLinks.includes(`href="#${destination}"`),`Missing cover chapter link: ${destination}`);
  assert.ok(chapterFilms.some(film=>film.id==='contact'&&film.src.endsWith('AdobeStock_695926335.mp4')),'Closing uses the second Medellin drone, not the opening shot');
  const homeBlock = html.match(/const homes\s*=\s*\[([\s\S]*?)\n\];/);
  assert.ok(homeBlock, `Missing home configuration: ${pagePath}`);
  const homePlans = [...homeBlock[1].matchAll(/key:\s*['"]([^'"]+)['"][^\n]*?plans:\s*\[([^\]]*)\]/g)].map(([, key, planList]) => [key, planList.split(',').map(value => value.trim()).filter(Boolean).map(Number)]);
  assert.equal(homePlans.length, 5, `Expected five homes: ${pagePath}`);
  assert.equal(homePlans.filter(([, planList]) => planList.length).length, 4, `Expected four homes with plans: ${pagePath}`);
  assert.deepEqual(homePlans.flatMap(([, planList]) => planList).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9], `Plan coverage is incomplete or duplicated: ${pagePath}`);
  assert.deepEqual(homePlans.find(([key]) => key === 'montana')?.[1], [], 'Do not invent Casa Montana plans');
  for (const name of ['financial-statements', 'member-benefits', 'investment-criteria', 'specialists', 'disclaimer']) {
    const target = `/${language === 'en' ? '' : language + '/'}${name}.html`;
    assert.ok(markup.includes(`href="${target}"`), `Missing ${language} navigation resource ${name}`);
  }
  const text = textContent(markup);
  assert.match(markup, /class="legal-notice"/, `Missing homepage disclosure: ${pagePath}`);
  const englishPhrases = ['Dulcinea One is our first fund, with a projected four-year term.', 'Lola & Ber Hospitality', '30% already committed.', 'Member benefits', 'Members’ collective stake', 'Each active home adds 109.5 nights.', 'Cancel as soon as plans change.', 'Winners sit out the next draw.', 'Delaware LLC'];
  const frenchPhrases = [
    'Dulcinea One is our first fund, with a projected four-year term. The return model combines rental income with projected profits on sale.',
    'Lola & Ber Hospitality', '30% already committed.', 'Member benefits', 'Members’ collective stake',
    'The pool reaches 547.5 nights when all five homes operate. Each active home adds 109.5 nights.',
    'Book any home in service for at least two nights. Confirm swaps within 48 hours. Cancel as soon as plans change.',
    'Christmas to New Year, Semana Santa and Feria de las Flores: one stay per home, three nights minimum. A draw weighted by Units allocates stays. Winners sit out the next draw.',
    'You subscribe for units in a Delaware LLC fund investing in five homes without debt. Capital is paid in installments during Year 1, including an operating reserve.',
  ].map(frenchText);
  for (const phrase of language === 'es'
    ? ['Dulcinea One es nuestro primer fondo, con un plazo proyectado de cuatro años.', 'Lola & Ber Hospitality', '30% ya comprometido.', 'Beneficios de membresía', 'Participación colectiva', 'Cada propiedad activa aporta 109,5 noches.', 'Cancele en cuanto cambien sus planes.', 'Los ganadores no participan en el siguiente sorteo.', 'LLC de Delaware']
    : language === 'fr' ? frenchPhrases : englishPhrases) {
    assert.ok(text.includes(normalizeWhitespace(phrase)), `Missing visible ${language} investor content: ${phrase}`);
  }
}

for (const prefix of ['', '/es', '/fr']) {
  const language = prefix ? prefix.slice(1) : 'en';
  const financial = pages.get(`${prefix}/financial-statements.html`);
  const criteria = pages.get(`${prefix}/investment-criteria.html`);
  const disclaimer = pages.get(`${prefix}/disclaimer.html`);
  const specialists = pages.get(`${prefix}/specialists.html`);
  const members = pages.get(`${prefix}/member-benefits.html`);
  assert.ok(members, 'Member details are a separate resource in each language');
  const calculator = attributes(members.match(/<form\b[^>]*id="member-calculator"[^>]*>/)?.[0] || '');
  assert.equal(Number(calculator['data-raise-usd']), memberTerms.offering.raiseUsd, 'Member calculator full-subscription denominator');
  assert.equal(Number(calculator['data-nights-per-home']), memberTerms.ownerUse.annualNightsPerHomeInService, 'Member calculator annual home allocation');
  const commitmentInput = attributes(members.match(/<input\b[^>]*id="member-commitment"[^>]*>/)?.[0] || '');
  assert.equal(Number(commitmentInput.min), memberTerms.offering.minimumInvestmentUsd, 'Member calculator minimum commitment');
  assert.equal(Number(commitmentInput.step), memberTerms.offering.unitUsd, 'Member calculator unit size');
  assert.equal(Number(commitmentInput.max), memberTerms.offering.raiseUsd, 'Member calculator maximum commitment');
  assert.ok(members.includes(`href="${prefix}/#member-benefits"`), 'Member detail return destination');
  assert.ok(members.includes(`href="${prefix}/#present-benefits"`), 'Member detail presentation destination');
  for (const section of ['member-stays','stay-inclusions','shared-benefits','member-booking']) assert.ok(members.includes(`id="${section}"`), `Missing member details: ${section}`);
  assert.doesNotMatch(textContent(members), /Cancel 30 days|Cancel 60 days|Cancele con (?:30|60) días|Annulation (?:30|60) jours/, 'Superseded fixed cancellation notice');
  assert.match(textContent(financial), language === 'fr' ? /États financiers pro forma/ : language === 'es' ? /Estados financieros pro forma/ : /Pro forma financial statements/);
  assert.match(textContent(disclaimer), language === 'fr' ? /ensemble du portefeuille/ : language === 'es' ? /portafolio en su conjunto/ : /portfolio as a whole/);
  assert.match(textContent(disclaimer), language === 'fr' ? /non auditées/ : language === 'es' ? /no auditadas/ : /unaudited/);
  assert.match(textContent(specialists), language === 'fr' ? /Spécialistes locaux/ : language === 'es' ? /Especialistas locales/ : /Local specialists/);
  assert.ok(specialists.includes('dulcinea-one-white-gold.svg') && specialists.includes('class="resource-navigation"'), 'Resource navigation needs the light logo on its dark background');
  assert.ok(specialists.includes(`href="${prefix}/#specialists"`), 'Missing localized specialists return link');
  assert.ok(specialists.includes(`href="${prefix}/#team"`), 'Missing localized core-team return link');
  const specialistBlock=html=>html.match(/<dl class="specialists">[\s\S]*?<\/dl>/)?.[0];
  assert.ok(specialistBlock(specialists), 'Missing specialists directory');
  const homeSpecialists = specialistBlock(pages.get(`${prefix}/index.html`));
  assert.ok(homeSpecialists, 'Missing homepage specialists directory');
  const presentationBioPattern = /<p class="specialist-bio presentation-only"[^>]*>[\s\S]*?<\/p>/g;
  const presentationBios = [...homeSpecialists.matchAll(presentationBioPattern)].map(match=>match[0]);
  const fullBios = [...homeSpecialists.matchAll(/<p class="specialist-bio website-only"[^>]*>[\s\S]*?<\/p>/g)].map(match=>match[0]);
  assert.equal(presentationBios.length, 4, `Missing concise specialist biographies: ${prefix || '/'}`);
  assert.equal(fullBios.length, presentationBios.length, 'Each concise specialist biography needs its full website version');
  for (const [index, bio] of presentationBios.entries()) {
    const copy = textContent(bio).trim();
    assert.equal(copy, normalizeWhitespace(attributes(bio.match(/<p\b[^>]*>/)[0])[`data-${language}`]), 'Concise specialist biography must use the current page language');
    assert.ok(copy.length > 0 && copy.length < textContent(fullBios[index]).trim().length, 'Presentation specialist biography must be concise and nonempty');
  }
  const websiteSpecialists = homeSpecialists.replace(presentationBioPattern, '').replaceAll('class="specialist-bio website-only"', 'class="specialist-bio"');
  assert.equal(specialistBlock(specialists), websiteSpecialists, 'Full specialists content differs between website and resource page');
  assert.doesNotMatch(specialistBlock(specialists), /\b(?:website-only|presentation-only)\b/, 'Dedicated specialist biographies must always remain visible');
  assert.doesNotMatch(textContent(specialists), /Natalia Carvajal/, 'Natalia belongs in the core team, not the specialists directory');
  for(const person of ['Marcela Vélez','María Antonia Uribe','John Mario Piedrahita','Juan Carlos Pérez','Jorge Valiente'])assert.ok(textContent(specialists).includes(person), `Missing specialist: ${person}`);
  for(const document of [financial,criteria,specialists])assert.ok(document.includes(`href="${prefix}/disclaimer.html"`), 'Missing localized disclaimer link');
  for (const section of ['income-statement', 'after-carry', 'cash-flow-statement', 'balance-sheet']) {
    assert.ok(financial.includes(`id="${section}"`), `Missing financial section ${section}: ${prefix || '/'}`);
    assert.ok(financial.includes(`href="#${section}"`), `Missing financial navigation ${section}: ${prefix || '/'}`);
  }
  assert.ok(financial.includes(`href="${prefix || ''}/#fund"`), `Incorrect financial return link: ${prefix || '/'}`);
  assert.ok(criteria.includes(`href="${prefix || ''}/#homes"`), `Incorrect criteria return link: ${prefix || '/'}`);
  assert.doesNotMatch(financial + criteria, /href=["'][^"']*#slide-/, 'Resource links still target the old presentation');
}

const videoHashes = new Map();
for(const name of ['financial-statements','member-benefits','investment-criteria','specialists']){
  const styles=html=>[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match=>match[1]);
  for (const language of ['es', 'fr']) assert.deepEqual(styles(pages.get(`/${language}/${name}.html`)),styles(pages.get(`/${name}.html`)),`Translation changed responsive CSS: ${language}/${name}`);
}
for (const [url, filename] of files) {
  if (!url.endsWith('.mp4')) continue;
  assert.equal(videoSizes[url], (await stat(filename)).size, `Incorrect video range size: ${url}`);
  const hash = createHash('sha256').update(await readFile(filename)).digest('hex');
  assert.ok(!videoHashes.has(hash), `Duplicate MP4 bytes: ${url} and ${videoHashes.get(hash)}`);
  videoHashes.set(hash, url);
}
console.log(`Verified protected investor build: ${pages.size} EN/ES/FR pages, ${files.size} files, ${Object.keys(aliases).length} media aliases, ${videoHashes.size} distinct MP4s, ${compiledScripts} parsed inline scripts; three localized presentation PDFs, links, plan coverage, team, offer, sign-out and public share assets passed.`);
