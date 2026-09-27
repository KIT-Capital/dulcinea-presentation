import { readFile, writeFile, mkdir, copyFile, rm, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toColombianSpanish } from './spanish.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath, encoding) => readFile(path.join(root, relativePath), encoding);
const web = process.argv.includes('--web');
const siteRoot = path.join(root, 'dist', 'private-site');

const assets = [
  ['{{KIT_LOGO}}', 'brand/kit-capital/kit-capital.png', 'image/png'],
  ['{{LOGO_DARK}}', 'brand/dulcinea-one/svg/dulcinea-one-white-gold.svg', 'image/svg+xml'],
  ['{{LOGO_LIGHT}}', 'brand/dulcinea-one/svg/dulcinea-one-black-gold.svg', 'image/svg+xml'],
  ['{{SYMBOL_DARK}}', 'brand/shared-symbol/svg/dulcinea-symbol-mono-white.svg', 'image/svg+xml'],
  ['{{SYMBOL_LIGHT}}', 'brand/shared-symbol/svg/dulcinea-symbol-mono-black.svg', 'image/svg+xml'],
  ['{{FAVICON}}', 'brand/shared-symbol/svg/dulcinea-symbol-mono-black.svg', 'image/svg+xml'],
];

async function build() {
  const manifest = JSON.parse(await read('assets/manifest.json', 'utf8'));
  const media = manifest.map(({ marker, path: assetPath, mime }) => [marker, assetPath, mime]);
  if (web) {
    if (path.resolve(siteRoot) !== path.resolve(root, 'dist', 'private-site')) throw new Error('Invalid build directory');
    await mkdir(siteRoot, { recursive: true });
  }
  const [template, styles, script, paletteText] = await Promise.all([
    read('src/presentation.html', 'utf8'),
    Promise.all([read('src/presentation.css', 'utf8'), read('src/story.css', 'utf8'), read('src/property-viewer.css', 'utf8'), read('src/photo-motion.css', 'utf8'), read('src/navigation-layout.css', 'utf8')]).then(parts => parts.join('\n')),
    Promise.all([read('src/navigation.js', 'utf8'), read('src/photo-motion.js', 'utf8')]).then(parts => parts.join('\n')),
    read('design/palette.json', 'utf8'),
  ]);
  const copied = new Set();
  async function copyAsset(relativePath, destination = relativePath) {
    const source = path.resolve(root, relativePath);
    const target = path.resolve(siteRoot, destination);
    if (!source.startsWith(root + path.sep) || !target.startsWith(siteRoot + path.sep)) throw new Error('Asset outside build directory');
    if ((await stat(source)).size > 25 * 1024 * 1024) throw new Error(`Asset exceeds hosting limit: ${relativePath}`);
    if (!copied.has(target)) {
      copied.add(target);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(source, target);
    }
    return '/' + destination.replaceAll('\\', '/');
  }
  const embeddedAssets = [];
  for (const [marker, relativePath, mimeType] of [...assets, ...media]) {
    if (!template.includes(marker)) continue;
    const content = web
      ? await copyAsset(relativePath, marker === '{{FLOORPLAN_PDF}}' ? 'downloads/Dulcinea-Floorplans.pdf' : relativePath)
      : `data:${mimeType};base64,${(await read(relativePath)).toString('base64')}`;
    embeddedAssets.push([marker, content]);
  }

  const palette = JSON.parse(paletteText);
  const originalColors = ['blue-topaz', 'plumeria', 'african-violet', 'simply-green', 'coconut-shell'];
  if (!Array.isArray(palette.colors) || !originalColors.every(token => palette.colors.some(color => color.token === token))) {
    throw new Error('The presentation requires the five supplied Pantone colors.');
  }
  if (new Set(palette.colors.map(color => color.token)).size !== palette.colors.length) throw new Error('Duplicate palette token');
  const paletteCss = ':root{\n' + palette.colors.map(({ token, hex, pantone }) => {
    if (!/^[a-z]+(?:-[a-z]+)*$/.test(token) || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      throw new Error('Invalid palette token or digital color value.');
    }
    const rgb = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(',');
    const prefix = pantone ? 'pantone' : 'brand';
    return `  --${prefix}-${token}:${hex};\n  --${prefix}-${token}-rgb:${rgb};`;
  }).join('\n') + '\n}';
  const themeColor = palette.colors.find(({ token }) => token === 'blue-topaz')?.hex;
  if (!themeColor) throw new Error('The palette must include Blue Topaz.');

  const replacements = [
    ['{{THEME_COLOR}}', themeColor],
    ['/*__PALETTE__*/', paletteCss],
    ['/*__STYLES__*/', styles],
    ['/*__SCRIPT__*/', script],
    ...embeddedAssets,
  ];
  let html = template;
  for (const [marker, content] of replacements) {
    if (!html.includes(marker)) {
      if (media.some(([assetMarker]) => assetMarker === marker)) continue;
      throw new Error(`Missing template marker: ${marker}`);
    }
    html = html.replaceAll(marker, () => content);
  }
  const unresolved = html.match(/\{\{[A-Z_0-9]+\}\}|\/\*__[A-Z_]+__\*\//g);
  if (unresolved) throw new Error(`Unresolved template markers: ${[...new Set(unresolved)].join(', ')}`);

  let financial = await read('src/financial-statements.html', 'utf8');
  let criteria = await read('src/investment-criteria.html', 'utf8');
  const resourceLogo = embeddedAssets.find(([marker]) => marker === '{{LOGO_DARK}}')[1];
  financial = financial.replaceAll('{{RESOURCE_LOGO}}', () => resourceLogo);
  criteria = criteria.replaceAll('{{RESOURCE_LOGO}}', () => resourceLogo);
  if (web) {
    const signOut = '<form class="session-exit" action="/logout" method="post"><button type="submit">Sign out</button></form>';
    const exitStyle = '<style>.session-exit{margin:24px 0}.session-exit button{font:inherit;font-size:14px;color:inherit;background:transparent;border:1px solid currentColor;border-radius:0;padding:12px 20px;cursor:pointer}.session-exit button:focus-visible{outline:3px solid #009B74;outline-offset:4px}#slide-menu>.session-exit{margin:24px 5vw}</style>';
    html = html.replace('<button aria-label="Close slide menu"', signOut + '<button aria-label="Close slide menu"').replace('</head>', exitStyle + '</head>');
    financial = financial.replace('</main>', signOut + '</main>').replace('</head>', exitStyle + '</head>');
    criteria = criteria.replace('</main>', signOut + '</main>').replace('</head>', exitStyle + '</head>');
    await copyAsset('brand/dulcinea-one/svg/dulcinea-one-black-gold.svg', 'gate-assets/logo.svg');
    // The exact image URL in the public Open Graph metadata must exist in the deployment.
    await copyAsset('assets/images/stock/AdobeStock_891890158-web.jpg');
  }
  const destination = web ? siteRoot : root;
  const output = path.join(destination, 'index.html');
  const languageLinks = (englishPath, spanishPath, active) => `<nav class="locale-switch" aria-label="${active === 'es' ? 'Idioma' : 'Language'}"><a href="${englishPath}" lang="en" aria-label="English (United States)"${active === 'en' ? ' aria-current="page"' : ''}>🇺🇸 English</a><a href="${spanishPath}" lang="es" aria-label="Español (Colombia)"${active === 'es' ? ' aria-current="page"' : ''}>🇨🇴 Español</a></nav>`;
  const addLanguageSwitch = (markup, englishPath, spanishPath, locale) => {
    const switchMarkup = languageLinks(englishPath, spanishPath, locale);
    const languageStyle = '<style>.locale-switch{display:inline-flex;align-items:center;gap:4px;padding:3px;border:1px solid currentColor;border-radius:999px;font-size:11px;white-space:nowrap}.locale-switch a{display:inline-flex;align-items:center;gap:4px;padding:6px 8px;border-radius:999px;color:inherit;text-decoration:none;opacity:.78}.locale-switch a[aria-current="page"]{background:#ffffff38;opacity:1;font-weight:700}.locale-switch a:focus-visible{outline:2px solid currentColor;outline-offset:2px}@media(max-width:800px){.locale-switch{font-size:10px;gap:1px;padding:2px}.locale-switch a{font-size:0;gap:0;padding:5px 6px}.locale-switch a[lang="en"]:before{content:"🇺🇸";font-size:14px}.locale-switch a[lang="es"]:before{content:"🇨🇴";font-size:14px}}</style>';
    const localeScript = '<script>document.querySelectorAll(".locale-switch a").forEach(link=>link.addEventListener("click",()=>{const target=new URL(link.href);target.hash=location.hash;link.href=target.href;}));</script>';
    markup = markup.replace('</head>', `${languageStyle}</head>`);
    markup = markup.replace('</body>', `${localeScript}</body>`);
    if (markup.includes('class="header-resources"')) {
      return markup.replace('</nav><button aria-controls="slide-menu"', `</nav>${switchMarkup}<button aria-controls="slide-menu"`);
    }
    return markup.replace('</a></div><div class="hero">', `</a>${switchMarkup}</div><div class="hero">`);
  };
  const spanishIndex = toColombianSpanish(html).replace('<html lang="en">', '<html lang="es">')
    .replace('content="https://invest.dulcineainvestments.org/"', 'content="https://invest.dulcineainvestments.org/es/"');
  const spanishFinancial = toColombianSpanish(financial).replace('<html lang="en">', '<html lang="es">');
  const spanishCriteria = toColombianSpanish(criteria).replace('<html lang="en">', '<html lang="es">');
  html = addLanguageSwitch(html, '/', '/es/', 'en');
  financial = addLanguageSwitch(financial, '/financial-statements.html', '/es/financial-statements.html', 'en');
  criteria = addLanguageSwitch(criteria, '/investment-criteria.html', '/es/investment-criteria.html', 'en');
  const spanish = path.join(destination, 'es');
  await mkdir(spanish, { recursive: true });
  await writeFile(output, html, 'utf8');
  await writeFile(path.join(destination, 'financial-statements.html'), financial, 'utf8');
  await writeFile(path.join(destination, 'investment-criteria.html'), criteria, 'utf8');
  await writeFile(path.join(spanish, 'index.html'), addLanguageSwitch(spanishIndex, '/', '/es/', 'es'), 'utf8');
  await writeFile(path.join(spanish, 'financial-statements.html'), addLanguageSwitch(spanishFinancial, '/financial-statements.html', '/es/financial-statements.html', 'es'), 'utf8');
  await writeFile(path.join(spanish, 'investment-criteria.html'), addLanguageSwitch(spanishCriteria, '/investment-criteria.html', '/es/investment-criteria.html', 'es'), 'utf8');
  if (web) {
    const keep = new Set([...copied, output, path.join(destination, 'financial-statements.html'), path.join(destination, 'investment-criteria.html'),
      path.join(spanish, 'index.html'), path.join(spanish, 'financial-statements.html'), path.join(spanish, 'investment-criteria.html')]);
    // Keep watched directories in place on Windows; remove only stale build files.
    async function prune(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (!file.startsWith(siteRoot + path.sep)) throw new Error('Invalid build cleanup path');
        if (entry.isDirectory()) await prune(file);
        else if (!keep.has(file)) await rm(file);
      }
    }
    await prune(siteRoot);
  }
  console.log(`Built ${web ? 'dist/private-site/' : ''}index.html (${Buffer.byteLength(html, 'utf8').toLocaleString('en-US')} bytes)${web ? ` and ${copied.size} selected assets` : ''}`);
}

build().catch((error) => {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
});
