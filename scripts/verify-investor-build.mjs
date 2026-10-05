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

// Read-only release gate. Build first with `node scripts/build.mjs --web`.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'dist/private-site');
const review = process.argv.includes('--review');
const origin = review ? REVIEW_ORIGIN : SOCIAL_ORIGIN;
const limit = 25 * 1024 * 1024;
const files = new Map();
const pages = new Map();
const read = name => readFile(path.join(root, name), 'utf8');
const build = JSON.parse(await read('dist/investor-build.json'));
assert.deepEqual(build, {version:1,mode:review?'review':'production',origin}, 'Build mode does not match this verification; rebuild for the intended destination');
const story = JSON.parse(await read('content/presentation-story.json'));
const expectedOrder = ["cover", "lifestyle", "oriente", "city", "hospitality", "benefits", "monte-sereno", "montana", "fontanar", "san-lucas", "aires", "idea", "team", "specialists", "returns", "offer", "disclaimer", "contact"];
assert.deepEqual(story.main.map(step=>step.id), expectedOrder, 'Main presentation order');
assert.deepEqual(story.appendices.map(step=>step.id), ['owner-use'], 'Owner booking is optional detail');
assert.deepEqual(Object.values(story.legacyNumeric), ['cover','lifestyle','benefits','owner-use','oriente','city','hospitality','fontanar','san-lucas','aires','monte-sereno','montana','idea','offer','returns','team','specialists','disclaimer','contact'], 'Published numeric links must retain their subjects');
const presentationAnchors = new Set([...story.main,...story.appendices].map(step=>`present-${step.id}`).concat(Object.keys(story.legacyNumeric).map(key=>`present-${key}`)));
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
    assert.ok(!/(^|\/)(?:source-packages|source-documents|company[ -]documents|content|docs|design|server|scripts|\.git|\.wrangler|node_modules)(?:\/|$)/i.test(relative), `Internal file in build: ${relative}`);
    assert.ok(!/(?:\.(?:docx?|xlsx?|xlsm|xlsb|pptx?|csv|tsv|ods|odt|odp|rtf|txt|md|zip|7z|rar|tar|gz|mov)|(?:^|\/)(?:\.env[^/]*|\.dev\.vars[^/]*|[^/]*(?:secrets|provenance)[^/]*))$/i.test(relative), `Source or private file in build: ${relative}`);
    if (/\.pdf$/i.test(relative)) assert.equal(relative, 'downloads/Dulcinea-Floorplans.pdf', 'Only the approved floorplan PDF may be published');
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
assert.deepEqual([...publicAssetPaths].sort(), [...files.keys()].filter(file=>!file.endsWith('.html')).sort(), 'Public asset allowlist must match approved built media');
for (const asset of publicAssetPaths) assert.equal(assetPolicy(asset).access, 'public', `Public media classification: ${asset}`);
for (const page of pages.keys()) assert.equal(assetPolicy(page).access, page.endsWith('/financial-statements.html')?'private':'public', `Page access classification: ${page}`);
const requiredPages = ['', 'es/'].flatMap(prefix => ['index', 'financial-statements', 'investment-criteria', 'specialists', 'disclaimer'].map(name => `/${prefix}${name}.html`));
assert.deepEqual([...pages.keys()].sort(), [...requiredPages].sort(), 'Expected only EN/ES investor, financial, criteria, specialists and disclaimer pages');
const publicAssets = ['/gate-assets/logo.svg', SOCIAL_IMAGE_PATH, SOCIAL_IMAGE_ES_PATH, '/assets/images/stock/AdobeStock_891890158-web.jpg', '/assets/video/stock/AdobeStock_693150796.mp4'];
for (const asset of publicAssets) assert.ok(files.has(asset), `Missing public share/login asset: ${asset}`);
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
  // The lake outing was removed from the story; its original clip stays archived.
  if(stock==='AdobeStock_1164208469.mp4'){
    assert.ok(!sourceOwners.has(`assets/video/stock/${stock}`),'Removed lake outing must not return to the active story');
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
  const language = pagePath.startsWith('/es/') ? 'es' : 'en';
  assert.match(html, new RegExp(`<html\\s+lang=["']${language}["']`), `Wrong language: ${pagePath}`);
  assert.doesNotMatch(html, /Design preview|Vista previa|\{\{[A-Z_0-9]+\}\}|\/\*__[A-Z_]+__\*\//i, `Preview text or unexpanded marker: ${pagePath}`);
  assert.doesNotMatch(html, /\uFFFD/, `Invalid text encoding: ${pagePath}`);
  const markup = withoutScripts(html);
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

  if (!pagePath.endsWith('/index.html')) {
    assert.equal((markup.match(/class="locale-switch(?:\s[^"]*)?"/g)||[]).length,1, `Exactly one resource language switch: ${pagePath}`);
    continue;
  }
  const card = socialMetadata(language, { origin });
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
  assert.equal(socialValue('og:locale:alternate'), card.alternateLocale);
  assert.equal(socialValue('og:image'), origin + card.imagePath);
  assert.equal(socialValue('og:image:width'), '1200');
  assert.equal(socialValue('og:image:height'), '630');
  assert.equal(socialValue('twitter:image'), socialValue('og:image'));
  assert.equal(socialValue('twitter:image:alt'), card.imageAlt);
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
    : ['Founder and Managing Partner','Director of Corporate Development','Director of Business Development','Director of Marketing'];
  assert.deepEqual(coreProfiles.map(profile=>textContent(profile.match(/<p class="micro"[^>]*>[\s\S]*?<\/p>/)?.[0] || '').trim()), expectedRoles, `Current user-approved core team titles: ${pagePath}`);
  assert.deepEqual(coreProfiles.map(profile=>textContent(profile.match(/<p class="team-affiliation"[^>]*>[\s\S]*?<\/p>/)?.[0] || '').trim()), ['KIT Capital','KIT Capital',language==='es' ? 'KIT Capital y Dulcinea' : 'KIT Capital and Dulcinea',language==='es' ? 'KIT Capital y Dulcinea' : 'KIT Capital and Dulcinea'], `Core team affiliations: ${pagePath}`);
  const nataliaPortrait = attributes(coreProfiles[3].match(/<img\b[^>]*>/)?.[0] || '');
  assert.ok(nataliaPortrait.src && map['natalia.png'], `Missing Natalia portrait or approved media alias: ${pagePath}`);
  assert.equal(nataliaPortrait.src, map['natalia.png'], `Natalia portrait must use its approved media alias: ${pagePath}`);
  assert.equal(nataliaPortrait.alt, 'Natalia Carvajal', `Natalia portrait description: ${pagePath}`);
  assert.ok(textContent(coreProfiles[3]).includes(language==='es' ? 'Directora de Marketing' : 'Director of Marketing'), `Missing localized Natalia role: ${pagePath}`);
  const coreBios = coreProfiles.map(profile=>textContent(profile.match(/<p\b[^>]*class="team-bio"[^>]*>[\s\S]*?<\/p>/)?.[0] || '').trim());
  assert.ok(coreBios.every(bio=>bio.split(/\s+/).length === (language==='es' ? 27 : 24)), `Core biographies must have uniform reading length: ${pagePath}`);
  assert.doesNotMatch(coreBios[3], /Director of Marketing|Directora de Marketing/i, 'Natalia biography must not repeat her role label');
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
  for (const name of ['financial-statements', 'investment-criteria', 'specialists', 'disclaimer']) {
    const target = `/${language === 'es' ? 'es/' : ''}${name}.html`;
    assert.ok(markup.includes(`href="${target}"`), `Missing ${language} navigation resource ${name}`);
  }
  const text = textContent(markup);
  assert.match(markup, /class="legal-notice"/, `Missing homepage disclosure: ${pagePath}`);
  for (const phrase of language === 'en'
    ? ['Dulcinea One is our first fund.', 'Lola & Ber Hospitality', '30% already committed.', 'Member benefits', 'Members’ collective stake', 'Each active home adds 73 nights.', 'Cancel 30 days ahead.', 'Winners sit out the next draw.', 'Delaware LLC']
    : ['Dulcinea One es nuestro primer fondo.', 'Lola & Ber Hospitality', '30% ya comprometido.', 'Beneficios de membresía', 'Participación colectiva', 'Cada propiedad activa aporta 73 noches.', 'Cancele con 30 días de anticipación.', 'Los ganadores no participan en el siguiente sorteo.', 'LLC de Delaware']) {
    assert.ok(text.includes(phrase), `Missing visible ${language} investor content: ${phrase}`);
  }
}

for (const prefix of ['', '/es']) {
  const financial = pages.get(`${prefix}/financial-statements.html`);
  const criteria = pages.get(`${prefix}/investment-criteria.html`);
  const disclaimer = pages.get(`${prefix}/disclaimer.html`);
  const specialists = pages.get(`${prefix}/specialists.html`);
  assert.match(textContent(financial), prefix ? /Estados financieros pro forma/ : /Pro forma financial statements/);
  assert.match(textContent(disclaimer), prefix ? /portafolio en su conjunto/ : /portfolio as a whole/);
  assert.match(textContent(disclaimer), prefix ? /no auditadas/ : /unaudited/);
  assert.match(textContent(specialists), prefix ? /Especialistas locales/ : /Local specialists/);
  assert.ok(specialists.includes('dulcinea-one-white-gold.svg') && specialists.includes('class="resource-navigation"'), 'Resource navigation needs the light logo on its dark background');
  assert.ok(specialists.includes(`href="${prefix}/#specialists"`), 'Missing localized specialists return link');
  assert.ok(specialists.includes(`href="${prefix}/#team"`), 'Missing localized core-team return link');
  const specialistBlock=html=>html.match(/<dl class="specialists">[\s\S]*?<\/dl>/)?.[0];
  assert.ok(specialistBlock(specialists), 'Missing specialists directory');
  assert.equal(specialistBlock(specialists),specialistBlock(pages.get(`${prefix}/index.html`)), 'Specialists content differs between presentation and resource page');
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
for(const name of ['financial-statements','investment-criteria','specialists']){
  const styles=html=>[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match=>match[1]);
  assert.deepEqual(styles(pages.get(`/es/${name}.html`)),styles(pages.get(`/${name}.html`)),`Translation changed responsive CSS: ${name}`);
}
for (const [url, filename] of files) {
  if (!url.endsWith('.mp4')) continue;
  assert.equal(videoSizes[url], (await stat(filename)).size, `Incorrect video range size: ${url}`);
  const hash = createHash('sha256').update(await readFile(filename)).digest('hex');
  assert.ok(!videoHashes.has(hash), `Duplicate MP4 bytes: ${url} and ${videoHashes.get(hash)}`);
  videoHashes.set(hash, url);
}
console.log(`Verified protected investor build: ${pages.size} EN/ES pages, ${files.size} files, ${Object.keys(aliases).length} media aliases, ${videoHashes.size} distinct MP4s, ${compiledScripts} parsed inline scripts; links, plan coverage, team, offer, sign-out and public share assets passed.`);
