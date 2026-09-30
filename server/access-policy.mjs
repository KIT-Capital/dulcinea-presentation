import { publicAssetPaths } from './public-asset-paths.mjs';

const publicAssets = new Set(publicAssetPaths);
const pages = new Map();
for (const prefix of ['', '/es']) {
  for (const name of ['index', 'investment-criteria', 'specialists', 'disclaimer', 'financial-statements']) {
    const asset = `${prefix}/${name}.html`;
    const access = name === 'financial-statements' ? 'private' : 'public';
    const aliases = [`${prefix}/${name}`, asset, `${prefix}/${name}/`, `${prefix}/${name}/index.html`];
    if (name === 'index') aliases.push(prefix || '/', `${prefix}/`);
    for (const alias of aliases) pages.set(alias, { access, asset });
  }
}

// Classify a canonical path before the asset binding can normalize or redirect it.
// Unknown files are denied even when a valid session is present.
export function assetPolicy(pathname) {
  let decoded = pathname;
  try {
    for (let i = 0; i < 4 && decoded.includes('%'); i++) decoded = decodeURIComponent(decoded);
    if (decoded.includes('%') || /[\\\x00-\x20\x7f?#]/.test(decoded)) return { access: 'denied' };
    decoded = new URL(decoded, 'https://asset.invalid').pathname;
  } catch { return { access: 'denied' }; }
  if (pages.has(decoded)) return pages.get(decoded);
  // Reserved for future, explicitly approved investor downloads. Nothing here
  // is currently publishable; authenticating does not expose source documents.
  if ((decoded !== '/downloads/Dulcinea-Floorplans.pdf' && /^\/(?:downloads|private-documents)(?:\/|$)/i.test(decoded))
      || /^\/(?:es\/)?financial-statements(?:[./;]|$)/i.test(decoded)) return { access: 'private' };
  if (publicAssets.has(decoded)) return { access: 'public', asset: decoded };
  return { access: 'denied' };
}
