import presentationFrench from '../content/locales/fr-presentation.json' with { type: 'json' };
import resourceFrench from '../content/locales/fr-resources.json' with { type: 'json' };

export const supportedLocales = Object.freeze(['en', 'es', 'fr']);
export const french = Object.freeze({ ...resourceFrench, ...presentationFrench });
export const normalizeLocale = value => supportedLocales.includes(value) ? value : 'en';
export function localePath(value = '/', locale = 'en') {
  const base = String(value).replace(/^\/(?:es|fr)(?=\/|[?#]|$)/, '') || '/';
  const path = base.startsWith('/') ? base : `/${base}`;
  return locale === 'en' ? path : `/${normalizeLocale(locale)}${path}`;
}
export const decodeText = value => String(value).replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (whole, code) => {
  if (code[0] === '#') return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0' }[code] ?? whole;
});
const escapeText = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const escapeAttribute = value => escapeText(value).replaceAll('"', '&quot;');
export function frenchText(value) {
  const decoded = decodeText(value);
  const key = decoded.trim();
  return Object.hasOwn(french, key) ? decoded.replace(key, () => french[key]) : decoded;
}
export function frenchAttributes(markup) {
  return markup.replace(/(<[a-z][\w-]*\b)([^>]*)(>)/gi, (whole, tag, attributes, end) => {
    let added = '';
    for (const match of attributes.matchAll(/\bdata-en(-[\w-]+)?="([^"]*)"/g)) {
      const suffix = match[1] || '';
      if (!attributes.includes(`data-fr${suffix}=`)) added += ` data-fr${suffix}="${escapeAttribute(frenchText(match[2]))}"`;
    }
    return tag + attributes + added + end;
  });
}
export function frenchMarkup(markup) {
  // Protect executable code and language names; translation never changes URLs or data-en source keys.
  const blocks = [];
  let html = markup.replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>|<nav\b[^>]*class="[^"]*locale-switch[^>]*>[\s\S]*?<\/nav>/gi, block => `\u0001${blocks.push(block)-1}\u0002`);
  html = html.replace(/>([^<>]+)</g, (whole, value) => `>${escapeText(frenchText(value))}<`)
    .replace(/\s(alt|aria-label|placeholder|title)="([^"]*)"/g, (whole, attribute, value) => ` ${attribute}="${escapeAttribute(frenchText(value))}"`);
  return html.replace(/\u0001(\d+)\u0002/g, (_, index) => blocks[Number(index)]);
}
