// Existing brand artwork, published at conventional browser icon paths.
export const FAVICON_ASSETS = Object.freeze({
  'favicon.svg': 'brand/favicon/favicon.svg',
  'favicon.ico': 'brand/favicon/favicon.ico',
  'favicon-32x32.png': 'brand/favicon/favicon-32x32.png',
  'apple-touch-icon.png': 'brand/favicon/apple-touch-icon.png',
});

export function renderFaviconMetadata({ basePath = '/' } = {}) {
  const base = basePath && !basePath.endsWith('/') ? `${basePath}/` : basePath;
  const href = name => `${base}${name}`.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  return `<link rel="icon" href="${href('favicon.ico')}" type="image/x-icon">
<link rel="icon" href="${href('favicon-32x32.png')}" type="image/png" sizes="32x32">
<link rel="icon" href="${href('favicon.svg')}" type="image/svg+xml" sizes="any">
<link rel="apple-touch-icon" href="${href('apple-touch-icon.png')}" sizes="180x180">`;
}
