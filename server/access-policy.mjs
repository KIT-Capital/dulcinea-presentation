import { publicAssetPaths } from './public-asset-paths.mjs';
import { PRESENTATION_PDFS } from '../shared/presentation-downloads.mjs';

const publicDownloads = new Set(['/downloads/Dulcinea-Floorplans.pdf', ...Object.values(PRESENTATION_PDFS)]);
const publicAssets = new Set([...publicAssetPaths, ...publicDownloads]);
const pages = new Map();
for (const prefix of ['', '/es', '/fr']) {
  for (const name of ['index', 'member-benefits', 'investment-criteria', 'specialists', 'disclaimer', 'financial-statements']) {
    const asset = `${prefix}/${name}.html`;
    const access = name === 'financial-statements' ? 'private' : 'public';
    const aliases = [`${prefix}/${name}`, asset, `${prefix}/${name}/`, `${prefix}/${name}/index.html`];
    if (name === 'index') aliases.push(prefix || '/', `${prefix}/`);
    for (const alias of aliases) pages.set(alias, { access, asset });
  }
}

// Preview crawlers may discover only pages already classified as public.
export const publicPagePaths = Object.freeze([...pages].filter(([, policy]) => policy.access === 'public').map(([pathname]) => pathname));

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
  // Only the named public presentations and floorplans are downloadable.
  // Authenticating does not expose other source documents.
  if ((!publicDownloads.has(decoded) && /^\/(?:downloads|private-documents)(?:\/|$)/i.test(decoded))
      || /^\/(?:(?:es|fr)\/)?financial-statements(?:[./;]|$)/i.test(decoded)) return { access: 'private' };
  if (publicAssets.has(decoded)) return { access: 'public', asset: decoded };
  return { access: 'denied' };
}
