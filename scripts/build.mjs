import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath, encoding) => readFile(path.join(root, relativePath), encoding);

const assets = [
  ['{{HERO}}', 'assets/images/hospitality-concept.png', 'image/png'],
  ['{{CITY}}', 'assets/images/medellin.jpg', 'image/jpeg'],
  ['{{LOGO_DARK}}', 'brand/dulcinea-one/svg/dulcinea-one-color-on-dark.svg', 'image/svg+xml'],
  ['{{LOGO_LIGHT}}', 'brand/dulcinea-one/svg/dulcinea-one-color-on-light.svg', 'image/svg+xml'],
  ['{{SYMBOL_DARK}}', 'brand/shared-symbol/svg/dulcinea-symbol-color-on-dark.svg', 'image/svg+xml'],
  ['{{SYMBOL_LIGHT}}', 'brand/shared-symbol/svg/dulcinea-symbol-color-on-light.svg', 'image/svg+xml'],
  ['{{FAVICON}}', 'brand/favicon/favicon.svg', 'image/svg+xml'],
];

async function build() {
  const [template, styles, script, embeddedAssets] = await Promise.all([
    read('src/presentation.html', 'utf8'),
    read('src/presentation.css', 'utf8'),
    read('src/navigation.js', 'utf8'),
    Promise.all(assets.map(async ([marker, relativePath, mimeType]) => {
      // Base64 encodes the original file bytes; SVG artwork is never rewritten.
      const bytes = await read(relativePath);
      return [marker, `data:${mimeType};base64,${bytes.toString('base64')}`];
    })),
  ]);

  const replacements = [
    ['/*__STYLES__*/', styles],
    ['/*__SCRIPT__*/', script],
    ...embeddedAssets,
  ];
  let html = template;
  for (const [marker, content] of replacements) {
    if (!html.includes(marker)) throw new Error(`Missing template marker: ${marker}`);
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
