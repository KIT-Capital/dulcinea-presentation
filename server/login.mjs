import { toColombianSpanish } from '../scripts/spanish.mjs';
import { renderLanguageSwitch, languageSwitchCss } from '../shared/language-switch.mjs';
import { renderSocialMetadata } from '../shared/social-metadata.mjs';
import { renderFaviconMetadata } from '../shared/favicon.mjs';
import { investorFontCss } from '../shared/investor-typography.mjs';
import { normalizeLocale, localePath, frenchMarkup, frenchText } from '../shared/locales.mjs';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function localDestination(value) {
  const path = String(value ?? '/financial-statements.html');
  return path.startsWith('/') && !path.startsWith('//') && !/[\\\u0000-\u001f\u007f]/.test(path)
    ? path : '/financial-statements.html';
}

function destinationForLanguage(value, language) {
  return localePath(localDestination(value),normalizeLocale(language));
}

export function renderLogin({ name = '', email = '', next = '/financial-statements.html', error = '', lang = 'en', contactEmail = 'kit@kitcapital.com' } = {}) {
  lang = normalizeLocale(lang);
  const firmName = 'Dulcinea Investments, LLC';
  const firmDescription = lang === 'es'
    ? `${firmName} es una firma de inversión inmobiliaria.`
    : `${firmName} is a real estate investment firm.`;
  const metaDescription = lang === 'fr' ? frenchText(`${firmDescription} Medellín, Colombia.`) : `${firmDescription} Medellín, Colombia.`;
  const accessTitle = lang === 'es' ? 'Estados financieros privados' : 'Private financial statements';
  const accessLabel = lang === 'es' ? 'Acceso con contraseña' : 'Password access';
  const accessIntro = lang === 'es'
    ? 'El sitio web y la presentación están abiertos. Ingrese sus datos y contraseña para consultar los estados financieros.'
    : 'The website and presentation are open. Enter your details and password to view the financial statements.';
  const submitLabel = lang === 'es' ? 'Ver estados financieros' : 'View financial statements';
  const websiteLabel = lang === 'es' ? 'Volver al sitio web' : 'Back to website';
  const websitePath = localePath('/#home',lang);
  const contact = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(String(contactEmail))
    ? String(contactEmail) : 'kit@kitcapital.com';
  const requestAccess = `mailto:${encodeURIComponent(contact)}?subject=${encodeURIComponent(`${firmName} — ${lang === 'fr' ? frenchText(accessTitle) : accessTitle}`)}`;
  const englishNext = destinationForLanguage(next, 'en');
  const spanishNext = destinationForLanguage(next, 'es');
  const frenchNext = destinationForLanguage(next, 'fr');
  const loginLanguageLinks = renderLanguageSwitch({
    englishPath: `/login?lang=en&next=${encodeURIComponent(englishNext)}`,
    spanishPath: `/login?lang=es&next=${encodeURIComponent(spanishNext)}`,
    frenchPath: `/login?lang=fr&next=${encodeURIComponent(frenchNext)}`,
    locale: lang,
  });
  const errorBlock = error ? `<div class="error" id="sign-in-error" role="alert" tabindex="-1" autofocus>
      <strong>We couldn’t sign you in.</strong><p>${escapeHtml(error)}</p>
    </div>` : '';

  const markup = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="referrer" content="same-origin">
  <meta name="theme-color" content="#78BDD4">
  <meta name="description" content="${escapeHtml(metaDescription)}">
  {{SOCIAL_METADATA}}
  <title>${accessTitle} · ${firmName}</title>
  <style>
    :root{color-scheme:light;--blue:#78BDD4;--pink:#FB90A2;--violet:#B085B7;--green:#009B74;--ink:#203330;--muted:#536561;--line:#80908a;--paper:#fff;--copper:#8b6552;font-family:"Segoe UI",Arial,sans-serif;color:var(--ink);background:#f6f9f8}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;min-height:100dvh}a{color:inherit;text-underline-offset:5px}a:hover{text-decoration-thickness:2px}a:focus-visible,button:focus-visible,input:focus-visible,[tabindex]:focus-visible{outline:3px solid #73457a;outline-offset:4px}button,input{font:inherit}button{cursor:pointer}.skip-link{position:absolute;top:12px;left:16px;z-index:5;background:white;padding:12px;transform:translateY(-160%)}.skip-link:focus{transform:none}
    .page{min-height:100vh;min-height:100dvh;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,1fr)}.welcome{background:#e8f4f8;padding:clamp(30px,5vw,76px);display:flex;flex-direction:column;position:relative;isolation:isolate;overflow:hidden}.logo{display:block;width:clamp(170px,21vw,258px);height:auto;max-height:100px;object-fit:contain;object-position:left center}.intro{position:relative;z-index:1;max-width:580px;margin:auto 0;padding:76px 0 90px}.eyebrow{font-size:11px;line-height:1.5;font-weight:600;letter-spacing:2.1px;text-transform:uppercase;margin:0 0 28px}.eyebrow:before{content:"";display:inline-block;width:25px;height:2px;background:var(--copper);vertical-align:middle;margin-right:12px}h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(50px,5.1vw,83px);font-weight:400;letter-spacing:-2.4px;line-height:1.08;margin:0 0 28px}.intro-copy{max-width:330px;font-size:19px;line-height:1.65;margin:0}.place{display:block;margin-top:12px;font-size:14px;color:var(--muted)}.co-brand{position:relative;z-index:1;font-size:11px;line-height:1.6;letter-spacing:.25px;margin:0;max-width:250px}.ribbons{position:absolute;right:-80px;bottom:10%;width:220px;height:340px;border:1px solid var(--blue);border-radius:140px;transform:rotate(22deg);z-index:-1}.ribbons:before,.ribbons:after{content:"";position:absolute;inset:22px;border:1px solid var(--violet);border-radius:120px}.ribbons:after{inset:44px;border-color:var(--pink)}
    .access{background:var(--paper);display:flex;align-items:center;justify-content:center;padding:64px clamp(28px,6vw,94px)}.form-wrap{width:100%;max-width:420px}.access-label{display:flex;align-items:center;gap:9px;margin:0 0 20px;text-transform:uppercase;letter-spacing:1.8px;font-size:10px;font-weight:600}.access-label:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--green)}h2{font-family:Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-1px;font-size:40px;line-height:1.15;margin:0 0 14px}.form-intro{font-size:15px;line-height:1.65;color:var(--muted);margin:0 0 32px}.field{margin-top:22px}label{display:block;font-size:13px;font-weight:600;margin-bottom:9px}input:not([type="hidden"]){width:100%;height:52px;min-width:0;border:1px solid var(--line);border-radius:3px;background:#fff;color:var(--ink);padding:12px 14px;font-size:16px;transition:border-color .15s}input:hover{border-color:#657b71}input:focus{border-color:var(--green)}input::placeholder{color:#7a8984;opacity:1}.submit{position:relative;isolation:isolate;overflow:hidden;width:100%;display:flex;align-items:center;justify-content:space-between;margin-top:28px;padding:17px 20px;min-height:56px;border:1px solid #b8962d;border-radius:3px;background:#D4AF37;color:var(--ink);font-size:15px;font-weight:600;text-align:left;box-shadow:0 3px 0 #20333014;transition:background-color .28s ease,border-color .28s ease,box-shadow .28s ease,transform .2s ease;touch-action:manipulation}
    .submit:before{content:"";position:absolute;inset:0 auto 0 -45%;width:30%;z-index:-1;background:linear-gradient(110deg,transparent,#ffffff70,transparent);transform:skewX(-18deg);transition:left .65s ease;pointer-events:none}
    .submit span:last-child{font-size:21px;line-height:16px;font-weight:400;transition:transform .25s ease}
    @media(hover:hover){.submit:hover{background:var(--blue);border-color:#5a9fb6;transform:translateY(-2px);box-shadow:0 9px 20px #20333020}.submit:hover:before{left:115%}.submit:hover span:last-child{transform:translateX(5px)}}
    .submit:focus-visible{outline:3px solid var(--ink);outline-offset:4px;background:var(--blue);border-color:#5a9fb6;box-shadow:0 0 0 7px #78bdd42b}
    .submit:active{background:var(--pink);border-color:#d67788;transform:translateY(1px) scale(.985);box-shadow:inset 0 2px 5px #2033301c;transition-duration:.08s}
    .submit:active span:last-child{transform:translateX(8px)}
    @media(prefers-reduced-motion:reduce){.submit,.submit span:last-child,.submit:before{transition:none}.submit:before{display:none}.submit:hover,.submit:active,.submit:hover span:last-child,.submit:active span:last-child{transform:none}}
    .privacy{font-size:12px;color:var(--muted);line-height:1.6;margin:16px 0 0}.request{font-size:13px;line-height:1.7;margin:32px 0 0;padding-top:24px;border-top:1px solid var(--line);color:var(--muted)}.request a{color:var(--ink);font-weight:600;white-space:nowrap}.error{background:#fff1f4;border-left:3px solid var(--pink);padding:16px 18px;margin:0 0 24px;font-size:14px;line-height:1.5;overflow-wrap:anywhere}.error strong{font-weight:600}.error p{margin:6px 0 0}
    @media(min-width:1500px){.welcome{padding-left:max(76px,calc((100vw - 1440px)/2))}}@media(max-width:780px){.page{grid-template-columns:1fr}.welcome{padding:28px 28px 30px}.logo{width:190px;max-height:70px}.intro{padding:45px 0 32px}.eyebrow{margin-bottom:16px;font-size:10px}h1{font-size:52px;letter-spacing:-1.7px;margin-bottom:17px}.intro-copy{font-size:17px;max-width:410px}.place{display:inline;font-size:13px;margin-left:5px}.ribbons{right:-85px;bottom:-75px;width:210px;height:300px;opacity:.75}.co-brand{max-width:none;font-size:10px}.access{padding:40px 28px 50px}.form-wrap{max-width:480px}h2{font-size:35px}.form-intro{margin-bottom:26px}}@media(prefers-reduced-motion:reduce){input{transition:none}}
    ${languageSwitchCss}
    .access-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}
    .access-toolbar>.access-label{margin:0;min-width:0;flex:1;line-height:1.7}
    .website-back{display:inline-flex;align-items:center;align-self:flex-start;min-height:44px;margin:0 0 18px;font-size:14px;gap:8px}
    @media(min-width:781px) and (max-height:800px){.welcome{padding-block:32px}.intro{padding-block:48px}.access{padding-block:28px}.access-toolbar{margin-bottom:14px}h2{font-size:36px}.form-intro{margin-bottom:20px;line-height:1.5}.field{margin-top:14px}input:not([type="hidden"]){height:48px}.submit{margin-top:20px}.request{margin-top:20px;padding-top:16px}}
    /* Readable access form, with compact spacing on notebooks. */
    body{font-size:18px}
    .eyebrow{font-size:13px;letter-spacing:.12em}
    .intro-copy{font-size:20px;line-height:1.5;max-width:370px}
    .place{font-size:16px}
    .co-brand{font-size:14px;line-height:1.5;max-width:320px}
    .website-back{font-size:16px}
    .form-wrap{max-width:460px}
    .access-label{font-size:12px;letter-spacing:.1em}
    h2{font-size:36px;line-height:1.15;font-weight:600}
    .form-intro{font-size:18px;line-height:1.45}
    label{font-size:14px;line-height:1.3}
    input:not([type="hidden"]){font-size:17px}
    .submit{font-size:17px}
    .privacy{font-size:14px;line-height:1.45}
    .request{font-size:16px;line-height:1.5}
    .error{font-size:16px}
    @media(min-width:781px) and (max-height:800px){.access{padding:20px clamp(28px,4vw,64px)}.access-toolbar{margin-bottom:12px}h2{font-size:32px;margin-bottom:12px}.form-intro{margin-bottom:16px}.field{margin-top:12px}label{margin-bottom:7px}.submit{margin-top:18px}.privacy{margin-top:12px}.request{margin-top:18px;padding-top:14px}}
    @media(max-width:780px){.intro-copy{font-size:20px}.place{font-size:16px}.co-brand{font-size:14px}h2{font-size:34px}}
  </style>
</head>
<body>
  <a class="skip-link" href="#investor-access">Skip to investor access</a>
  <main class="page">
    <section class="welcome" aria-labelledby="brand-title">
      <a class="website-back" href="${websitePath}"><span aria-hidden="true">←</span>${websiteLabel}</a>
      <img class="logo" src="/gate-assets/logo.svg" alt="${firmName}" width="2135" height="565">
      <div class="intro">
        <p class="eyebrow">Dulcinea One</p>
        <h1 id="brand-title">Dulcinea.</h1>
        <p class="intro-copy">${firmDescription}<span class="place">Medellín, Colombia.</span></p>
      </div>
      <p class="co-brand">Co-branded by Lola &amp; Ber Hospitality.</p>
      <div class="ribbons" aria-hidden="true"></div>
    </section>
    <section class="access" aria-labelledby="investor-access">
      <div class="form-wrap">
        <div class="access-toolbar"><p class="access-label">${accessLabel}</p>${loginLanguageLinks}</div>
        <h2 id="investor-access" tabindex="-1">${accessTitle}</h2>
        <p class="form-intro">${accessIntro}</p>
        ${errorBlock}
        <form action="/login?lang=${lang}" method="post" aria-describedby="sign-in-privacy${error ? ' sign-in-error' : ''}">
          <input type="hidden" name="next" value="${escapeHtml(destinationForLanguage(next, lang))}">
          <input type="hidden" name="lang" value="${lang}">
          <div class="field"><label for="name">Full name</label><input id="name" name="name" type="text" autocomplete="name" required maxlength="120" value="${escapeHtml(name)}"></div>
          <div class="field"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" required maxlength="254" value="${escapeHtml(email)}"></div>
          <div class="field"><label for="password">Access password</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
          <button class="submit" type="submit"><span>${submitLabel}</span><span aria-hidden="true">→</span></button>
          <p class="privacy" id="sign-in-privacy">Your name and email are used for this sign-in only.</p>
        </form>
        <p class="request">Need an invitation? <a href="${escapeHtml(requestAccess)}">Request access</a></p>
      </div>
    </section>
  </main>
</body>
</html>`;
  const styles = [];
  const translatable = markup.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, block => `__LOGINSTYLE${styles.push(block)-1}__`);
  const localized = (lang === 'fr' ? frenchMarkup(translatable).replace('<html lang="en">', '<html lang="fr">') : lang === 'es' ? toColombianSpanish(translatable).replace('<html lang="en">', '<html lang="es">') : translatable)
    .replace(/__LOGINSTYLE(\d+)__/g, (_, index) => styles[Number(index)])
    .replace('{{SOCIAL_METADATA}}', renderSocialMetadata(lang))
    .replace('</head>', `${renderFaviconMetadata()}\n</head>`)
    .replace('</head>', `<style>${investorFontCss('/assets/fonts/manrope/manrope-variable.woff2')}</style></head>`);
  // URL fragments never reach the server. Carry a statement section through the
  // access form and language switch without changing any authentication rule.
  return localized.replace('</body>', `<script>
    if (/^#(?:income-statement|after-carry|cash-flow-statement|balance-sheet)$/.test(location.hash)) {
      const next = document.querySelector('input[name="next"]');
      const destination = new URL(next.value, location.origin);
      destination.hash = location.hash;
      next.value = destination.pathname + destination.search + destination.hash;
      document.querySelectorAll('.locale-switch a').forEach(link => {
        const url = new URL(link.href);
        const target = new URL(url.searchParams.get('next') || '/financial-statements.html', location.origin);
        target.hash = location.hash;
        url.searchParams.set('next', target.pathname + target.search + target.hash);
        link.href = url.href;
      });
    }
  </script></body>`);
}
