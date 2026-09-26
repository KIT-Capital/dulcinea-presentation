const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function localDestination(value) {
  const path = String(value ?? '/');
  return path.startsWith('/') && !path.startsWith('//') && !/[\\\u0000-\u001f\u007f]/.test(path)
    ? path : '/';
}

export function renderLogin({ name = '', email = '', next = '/', error = '', contactEmail = 'kit@kitcapital.com' } = {}) {
  const contact = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(String(contactEmail))
    ? String(contactEmail) : 'kit@kitcapital.com';
  const requestAccess = `mailto:${encodeURIComponent(contact)}?subject=Dulcinea%20One%20%E2%80%94%20Investor%20access`;
  const errorBlock = error ? `<div class="error" id="sign-in-error" role="alert" tabindex="-1" autofocus>
      <strong>We couldn’t sign you in.</strong><p>${escapeHtml(error)}</p>
    </div>` : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="referrer" content="same-origin">
  <meta name="theme-color" content="#78BDD4">
  <title>Investor access · Dulcinea One</title>
  <style>
    :root{color-scheme:light;--blue:#78BDD4;--pink:#FB90A2;--violet:#B085B7;--green:#009B74;--ink:#203330;--muted:#536561;--line:#80908a;--paper:#fff;--copper:#8b6552;font-family:"Segoe UI",Arial,sans-serif;color:var(--ink);background:#f6f9f8}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;min-height:100dvh}a{color:inherit;text-underline-offset:5px}a:hover{text-decoration-thickness:2px}a:focus-visible,button:focus-visible,input:focus-visible,[tabindex]:focus-visible{outline:3px solid #73457a;outline-offset:4px}button,input{font:inherit}button{cursor:pointer}.skip-link{position:absolute;top:12px;left:16px;z-index:5;background:white;padding:12px;transform:translateY(-160%)}.skip-link:focus{transform:none}
    .page{min-height:100vh;min-height:100dvh;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,1fr)}.welcome{background:#e8f4f8;padding:clamp(30px,5vw,76px);display:flex;flex-direction:column;position:relative;isolation:isolate;overflow:hidden}.logo{display:block;width:clamp(170px,21vw,258px);height:auto;max-height:100px;object-fit:contain;object-position:left center}.intro{position:relative;z-index:1;max-width:580px;margin:auto 0;padding:76px 0 90px}.eyebrow{font-size:11px;line-height:1.5;font-weight:600;letter-spacing:2.1px;text-transform:uppercase;margin:0 0 28px}.eyebrow:before{content:"";display:inline-block;width:25px;height:2px;background:var(--copper);vertical-align:middle;margin-right:12px}h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(50px,5.1vw,83px);font-weight:400;letter-spacing:-2.4px;line-height:1.08;margin:0 0 28px}.intro-copy{max-width:330px;font-size:19px;line-height:1.65;margin:0}.place{display:block;margin-top:12px;font-size:14px;color:var(--muted)}.co-brand{position:relative;z-index:1;font-size:11px;line-height:1.6;letter-spacing:.25px;margin:0;max-width:250px}.ribbons{position:absolute;right:-80px;bottom:10%;width:220px;height:340px;border:1px solid var(--blue);border-radius:140px;transform:rotate(22deg);z-index:-1}.ribbons:before,.ribbons:after{content:"";position:absolute;inset:22px;border:1px solid var(--violet);border-radius:120px}.ribbons:after{inset:44px;border-color:var(--pink)}
    .access{background:var(--paper);display:flex;align-items:center;justify-content:center;padding:64px clamp(28px,6vw,94px)}.form-wrap{width:100%;max-width:420px}.access-label{display:flex;align-items:center;gap:9px;margin:0 0 20px;text-transform:uppercase;letter-spacing:1.8px;font-size:10px;font-weight:600}.access-label:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--green)}h2{font-family:Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-1px;font-size:40px;line-height:1.15;margin:0 0 14px}.form-intro{font-size:15px;line-height:1.65;color:var(--muted);margin:0 0 32px}.field{margin-top:22px}label{display:block;font-size:13px;font-weight:600;margin-bottom:9px}input:not([type="hidden"]){width:100%;height:52px;min-width:0;border:1px solid var(--line);border-radius:3px;background:#fff;color:var(--ink);padding:12px 14px;font-size:16px;transition:border-color .15s}input:hover{border-color:#657b71}input:focus{border-color:var(--green)}input::placeholder{color:#7a8984;opacity:1}.submit{width:100%;display:flex;align-items:center;justify-content:space-between;margin-top:28px;padding:17px 20px;min-height:54px;border:1px solid transparent;border-radius:3px;background:var(--green);color:#07251c;font-size:15px;font-weight:600;text-align:left}.submit:hover{background:#0baa81}.submit span:last-child{font-size:21px;line-height:16px;font-weight:400}.privacy{font-size:12px;color:var(--muted);line-height:1.6;margin:16px 0 0}.request{font-size:13px;line-height:1.7;margin:32px 0 0;padding-top:24px;border-top:1px solid var(--line);color:var(--muted)}.request a{color:var(--ink);font-weight:600;white-space:nowrap}.error{background:#fff1f4;border-left:3px solid var(--pink);padding:16px 18px;margin:0 0 24px;font-size:14px;line-height:1.5;overflow-wrap:anywhere}.error strong{font-weight:600}.error p{margin:6px 0 0}
    @media(min-width:1500px){.welcome{padding-left:max(76px,calc((100vw - 1440px)/2))}}@media(max-width:780px){.page{grid-template-columns:1fr}.welcome{padding:28px 28px 30px}.logo{width:190px;max-height:70px}.intro{padding:45px 0 32px}.eyebrow{margin-bottom:16px;font-size:10px}h1{font-size:52px;letter-spacing:-1.7px;margin-bottom:17px}.intro-copy{font-size:17px;max-width:410px}.place{display:inline;font-size:13px;margin-left:5px}.ribbons{right:-85px;bottom:-75px;width:210px;height:300px;opacity:.75}.co-brand{max-width:none;font-size:10px}.access{padding:40px 28px 50px}.form-wrap{max-width:480px}h2{font-size:35px}.form-intro{margin-bottom:26px}}@media(prefers-reduced-motion:reduce){input{transition:none}}
  </style>
</head>
<body>
  <a class="skip-link" href="#investor-access">Skip to investor access</a>
  <main class="page">
    <section class="welcome" aria-labelledby="brand-title">
      <img class="logo" src="/gate-assets/logo.svg" alt="Dulcinea" width="258" height="84">
      <div class="intro">
        <p class="eyebrow">Private investor presentation</p>
        <h1 id="brand-title">Dulcinea One.</h1>
        <p class="intro-copy">Dulcinea is a real estate investment firm.<span class="place">Medellín, Colombia.</span></p>
      </div>
      <p class="co-brand">Co-branded by Lola &amp; Ber Hospitality.</p>
      <div class="ribbons" aria-hidden="true"></div>
    </section>
    <section class="access" aria-labelledby="investor-access">
      <div class="form-wrap">
        <p class="access-label">Welcome to Dulcinea</p>
        <h2 id="investor-access" tabindex="-1">Investor access</h2>
        <p class="form-intro">Enter your details and the access password provided to you.</p>
        ${errorBlock}
        <form action="/login" method="post" aria-describedby="sign-in-privacy${error ? ' sign-in-error' : ''}">
          <input type="hidden" name="next" value="${escapeHtml(localDestination(next))}">
          <div class="field"><label for="name">Full name</label><input id="name" name="name" type="text" autocomplete="name" required maxlength="120" value="${escapeHtml(name)}"></div>
          <div class="field"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" required maxlength="254" value="${escapeHtml(email)}"></div>
          <div class="field"><label for="password">Access password</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
          <button class="submit" type="submit"><span>Enter presentation</span><span aria-hidden="true">→</span></button>
          <p class="privacy" id="sign-in-privacy">Your name and email are used for this sign-in only.</p>
        </form>
        <p class="request">Need an invitation? <a href="${escapeHtml(requestAccess)}">Request access</a></p>
      </div>
    </section>
  </main>
</body>
</html>`;
}
