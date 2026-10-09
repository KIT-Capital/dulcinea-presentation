const escapeAttribute = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const stars = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: row % 2 ? 5 : 6 }, (_, column) =>
    `<circle cx="${0.85 + column * 1.72 + (row % 2 ? 0.86 : 0)}" cy="${0.48 + row * 0.95}" r=".23"/>`
  ).join('')
).join('');
const usFlag = `<svg class="flag-icon" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><rect width="24" height="16" fill="#fff"/><path fill="#b22234" d="M0 0h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0z"/><path fill="#3c3b6e" d="M0 0h10.4v8.62H0z"/><g fill="#fff">${stars}</g></svg>`;
const colombiaFlag = '<svg class="flag-icon" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><path fill="#fcd116" d="M0 0h24v8H0z"/><path fill="#003893" d="M0 8h24v4H0z"/><path fill="#ce1126" d="M0 12h24v4H0z"/></svg>';
const franceFlag = '<svg class="flag-icon" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><path fill="#002654" d="M0 0h8v16H0z"/><path fill="#fff" d="M8 0h8v16H8z"/><path fill="#ed2939" d="M16 0h8v16h-8z"/></svg>';

export const languageSwitchCss = `
  .locale-switch{display:inline-flex;align-items:center;gap:4px;flex:0 0 auto;margin:0;color:inherit;font:500 10px/1.2 'Segoe UI',Arial,sans-serif;white-space:nowrap}
  .locale-switch a{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:34px;padding:7px 6px;border:0;border-radius:3px;color:inherit;text-decoration:none;letter-spacing:.25px;opacity:.58;transition:opacity .18s,background .18s}
  .locale-switch a::after{content:"";position:absolute;inset:auto 6px 3px;height:1px;background:currentColor;opacity:0}
  .locale-switch a[aria-current="page"]{opacity:1}
  .locale-switch a[aria-current="page"]::after{opacity:.55}
  .locale-switch a:hover{opacity:1;background:#78bdd414}
  .locale-switch a:focus-visible{opacity:1;outline:2px solid #78bdd4;outline-offset:2px}
  .locale-switch .flag-icon{display:block;width:16px;height:11px;flex:0 0 auto;border-radius:1px;box-shadow:0 0 0 1px #27323818}
  @media(pointer:coarse){.locale-switch a{min-height:42px}}
  @media(prefers-reduced-motion:reduce){.locale-switch a{transition:none}}
`;

export function renderLanguageSwitch({ englishPath, spanishPath, frenchPath, locale = 'en' }) {
  return `<nav class="locale-switch notranslate" translate="no" aria-label="${locale === 'fr' ? 'Langue' : locale === 'es' ? 'Idioma' : 'Language'}"><a href="${escapeAttribute(englishPath)}" lang="en" hreflang="en-US" aria-label="English (United States)" title="English"${locale === 'en' ? ' aria-current="page"' : ''}>${usFlag}<span>EN</span></a><a href="${escapeAttribute(spanishPath)}" lang="es" hreflang="es-419" aria-label="Español (Latinoamérica)" title="Español"${locale === 'es' ? ' aria-current="page"' : ''}>${colombiaFlag}<span>ES</span></a>${frenchPath ? `<a href="${escapeAttribute(frenchPath)}" lang="fr" hreflang="fr-FR" aria-label="Français" title="Français"${locale === 'fr' ? ' aria-current="page"' : ''}>${franceFlag}<span>FR</span></a>` : ''}</nav>`;
}
