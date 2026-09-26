import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath, encoding) => readFile(path.join(root, relativePath), encoding);

const assets = [
  ['{{LOGO_DARK}}', 'brand/dulcinea-one/svg/dulcinea-one-mono-white.svg', 'image/svg+xml'],
  ['{{LOGO_LIGHT}}', 'brand/dulcinea-one/svg/dulcinea-one-mono-black.svg', 'image/svg+xml'],
  ['{{SYMBOL_DARK}}', 'brand/shared-symbol/svg/dulcinea-symbol-mono-white.svg', 'image/svg+xml'],
  ['{{SYMBOL_LIGHT}}', 'brand/shared-symbol/svg/dulcinea-symbol-mono-black.svg', 'image/svg+xml'],
  ['{{FAVICON}}', 'brand/shared-symbol/svg/dulcinea-symbol-mono-black.svg', 'image/svg+xml'],
];

async function build() {
  const manifest = JSON.parse(await read('assets/manifest.json', 'utf8'));
  const media = manifest.map(({ marker, path: assetPath, mime }) => [marker, assetPath, mime]);
  const [template, styles, script, paletteText, embeddedAssets] = await Promise.all([
    read('src/presentation.html', 'utf8'),
    Promise.all([read('src/presentation.css', 'utf8'), read('src/story.css', 'utf8')]).then(parts => parts.join('\n')),
    read('src/navigation.js', 'utf8'),
    read('design/palette.json', 'utf8'),
    Promise.all([...assets, ...media].map(async ([marker, relativePath, mimeType]) => {
      // Base64 encodes the original file bytes; SVG artwork is never rewritten.
      const bytes = await read(relativePath);
      return [marker, `data:${mimeType};base64,${bytes.toString('base64')}`];
    })),
  ]);

  const palette = JSON.parse(paletteText);
  if (!Array.isArray(palette.colors) || palette.colors.length !== 5) {
    throw new Error('The presentation requires the five supplied Pantone colors.');
  }
  const paletteCss = ':root{\n' + palette.colors.map(({ token, hex }) => {
    if (!/^[a-z]+(?:-[a-z]+)*$/.test(token) || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      throw new Error('Invalid palette token or digital color value.');
    }
    const rgb = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(',');
    return `  --pantone-${token}:${hex};\n  --pantone-${token}-rgb:${rgb};`;
  }).join('\n') + '\n}';
  const themeColor = palette.colors.find(({ token }) => token === 'coconut-shell')?.hex;
  if (!themeColor) throw new Error('The palette must include Coconut Shell.');

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
  const unresolved = html.match(/\{\{[A-Z_]+\}\}|\/\*__[A-Z_]+__\*\//g);
  if (unresolved) throw new Error(`Unresolved template markers: ${[...new Set(unresolved)].join(', ')}`);

  const output = path.join(root, 'index.html');
  await writeFile(output, html, 'utf8');
  console.log(`Built index.html (${Buffer.byteLength(html, 'utf8').toLocaleString('en-US')} bytes)`);
}

build().catch((error) => {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
});
