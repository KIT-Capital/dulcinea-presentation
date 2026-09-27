const homes = [
  {name:'Fontanar 201',key:'fontanar',image:'fontanar.jpg',original:'fontanar-original.jpeg',plans:[1,2],location:'El Poblado',type:['Penthouse','Penthouse'],area:'389 m²',description:['A penthouse above the city.','Un penthouse sobre la ciudad.'],status:['Signed · September 2026 closing','Firmado · Cierre en septiembre de 2026']},
  {name:'San Lucas 101',key:'san-lucas',image:'san-lucas.webp',original:'san-lucas-original.png',plans:[8,9],location:'El Poblado',type:['Apartment','Apartamento'],area:'325 m²',description:['Room to gather in El Poblado.','Espacio para compartir en El Poblado.'],status:['Negotiated · Compraventa drafted','Negociado · Compraventa redactada']},
  {name:'Aires de Campestre',key:'aires',image:'aires.jpg',original:'aires-original.png',plans:[6,7],location:'El Poblado',type:['Penthouse','Penthouse'],area:'489 m²',description:['Space for a different kind of stay.','Espacio para una estadía diferente.'],status:['Signed · September 2026 closing','Firmado · Cierre en septiembre de 2026']},
  {name:'Casa Monte Sereno',key:'monte-sereno',image:'monte-sereno.webp',original:'monte-sereno-original.png',plans:[3,4,5],location:'El Retiro',type:['House','Casa'],area:'420 m²',description:['A country house on a 2,940 m² lot.','Una casa de campo en un lote de 2.940 m².'],status:['Negotiated · Finalizing modifications','Negociado · Ajustando modificaciones']},
  {name:'Casa Montana',key:'montana',image:'montana.webp',original:'montana-original.png',plans:[],location:'El Retiro',type:['House','Casa'],area:'591 m²',description:['A home in the green of El Retiro.','Una casa entre el verde de El Retiro.'],status:['Negotiated · Works being budgeted','Negociado · Obras en presupuesto']}
];
const $ = selector => document.querySelector(selector);
const isWeb = window.DULCINEA_WEB !== false;
const initialSpanishPath = /\/es(?:\/|$)/.test(location.pathname);
const portableRoot = new URL(initialSpanishPath ? '../' : './',location.href);
const assetMap = Object.fromEntries(Object.entries(window.DULCINEA_ASSETS || {}).map(([name,url]) => [name,new URL(url,location.href).href]));
const asset = name => assetMap[name] || `/media/${name}`;
const resource = path => isWeb ? `/${lang === 'es' ? 'es/' : ''}${path}` : new URL(`${lang === 'es' ? 'es/' : ''}${path}`,portableRoot).href;
let lang = 'en', current = 0, planIndex = 0;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduce.matches;
const videos = [...document.querySelectorAll('video')];
const visibleVideos = new Set();
const motion = $('.motion');
const originalDialog = $('#original-dialog');
const plansDialog = $('#plans-dialog');
const plansDownload = $('#plans-dialog a[download]');
if (plansDownload) plansDownload.href = assetMap['floorplans.pdf'] || new URL(plansDownload.getAttribute('href'),location.href).href;
const dialogs = [...document.querySelectorAll('dialog')];
const propertyVideo = $('#property-video');
const experienceVideos = [$('#experience-nightlife'),$('#experience-hospitality')].filter(Boolean);
let experienceActive = 0, experienceChanging = false, experienceRetryAt = 0;
function canAnimate() { return !paused && !document.hidden && !dialogs.some(dialog => dialog.open); }
function isExperienceActive(video) { return !experienceVideos.includes(video) || video === experienceVideos[experienceActive] || experienceChanging; }
function syncVideo(video) {
  if (canAnimate() && visibleVideos.has(video) && isExperienceActive(video)) video.play().catch(() => {});
  else video.pause();
}
function syncMotion() { document.body.classList.toggle('is-paused',!canAnimate()); videos.forEach(syncVideo); }
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visibleVideos.add(entry.target);
    else visibleVideos.delete(entry.target);
    syncVideo(entry.target);
  });
},{threshold:.15});
videos.forEach(video => observer.observe(video));
function motionState() {
  const label = lang === 'es' ? (paused ? 'Reanudar animaciones' : 'Pausar animaciones') : (paused ? 'Resume animations' : 'Pause animations');
  motion?.setAttribute('aria-pressed',String(paused)); motion?.setAttribute('aria-label',label);
  if (motion) motion.title = label;
  motion?.querySelector('path')?.setAttribute('d',paused ? 'M8 5l10 7-10 7z' : 'M8 6v12M16 6v12');
  syncMotion();
}
motion?.addEventListener('click',() => { paused = !paused; motionState(); });
reduce.addEventListener('change',event => { paused = event.matches; motionState(); });
document.addEventListener('visibilitychange',syncMotion);
// Keep hospitality and nightlife distinct from the city-walking, hero and closing films.
function advanceExperience() {
  if (experienceVideos.length < 2 || experienceChanging || !canAnimate() || Date.now() < experienceRetryAt) return;
  const outgoing = experienceVideos[experienceActive];
  const previousIndex = experienceActive;
  const nextIndex = (experienceActive + 1) % experienceVideos.length;
  const incoming = experienceVideos[nextIndex];
  if (!visibleVideos.has(outgoing)) return;
  experienceChanging = true;
  let settled = false, fadeStarted = false, timeout, fadeTimer;
  const cleanup = () => {
    clearTimeout(timeout); clearTimeout(fadeTimer);
    incoming.removeEventListener('canplay',startFade);
    incoming.removeEventListener('error',onError);
  };
  const recover = (retryDelay = true) => {
    if (settled) return;
    settled = true; cleanup(); experienceChanging = false; experienceActive = previousIndex;
    experienceRetryAt = retryDelay ? Date.now() + 30000 : 0;
    incoming.pause(); incoming.style.opacity = '0'; outgoing.style.opacity = '1';
    // Keep the available film moving while a failed clip waits for a later retry.
    outgoing.loop = true;
    if (outgoing.ended) outgoing.currentTime = 0;
    syncMotion();
  };
  const onError = () => recover();
  const startFade = () => {
    if (settled || fadeStarted) return;
    if (!canAnimate() || !visibleVideos.has(outgoing)) { recover(false); return; }
    fadeStarted = true;
    incoming.play().then(() => {
      if (settled) { incoming.pause(); return; }
      if (!canAnimate() || !visibleVideos.has(outgoing)) { recover(false); return; }
      outgoing.loop = false; incoming.loop = false;
      incoming.style.opacity = '1'; outgoing.style.opacity = '0'; experienceActive = nextIndex;
      clearTimeout(timeout);
      fadeTimer = setTimeout(() => {
        if (settled) return;
        settled = true; cleanup(); experienceChanging = false; experienceRetryAt = 0;
        outgoing.pause(); syncMotion();
      },800);
    }).catch(() => recover(canAnimate()));
  };
  incoming.addEventListener('error',onError,{once:true});
  timeout = setTimeout(() => recover(),15000);
  incoming.currentTime = 0;
  if (incoming.readyState >= 2) startFade();
  else { incoming.addEventListener('canplay',startFade,{once:true}); incoming.load(); }
}
experienceVideos.forEach((video,index) => {
  video.loop = false;
  video.style.opacity = index === 0 ? '1' : '0';
  video.addEventListener('timeupdate',() => {
    if (index === experienceActive && Number.isFinite(video.duration) && video.currentTime >= video.duration - .85) advanceExperience();
  });
  video.addEventListener('ended',advanceExperience);
});
function homeLabel(index) { return `${lang === 'es' ? 'Ver' : 'View'} ${homes[index].name}`; }
function renderPlan() {
  const home = homes[current], page = home.plans[planIndex];
  if (!page || !plansDialog) return;
  const labels = {1:['Floor 1','Piso 1'],2:['Floor 2','Piso 2'],3:['Site plan','Plano del terreno'],4:['Floor 1','Piso 1'],5:['Roof plan','Plano de cubierta'],6:['Floor 1','Piso 1'],7:['Floor 2','Piso 2'],8:['Floor 1','Piso 1'],9:['Floor 2','Piso 2']};
  const caption = `${home.name} · ${labels[page][lang === 'es' ? 1 : 0]}`;
  $('#plans-title').textContent = `${home.name} · ${lang === 'es' ? 'Planos' : 'Floorplans'}`;
  $('#plan-image').src = asset(`plan-${page}.webp`); $('#plan-image').alt = caption;
  $('#plan-caption').textContent = caption; $('#plan-count').textContent = `${planIndex + 1} / ${home.plans.length}`;
  $('#prev-plan').disabled = home.plans.length < 2; $('#next-plan').disabled = home.plans.length < 2;
}
function renderHome(changeMedia = true) {
  const home = homes[current], i = lang === 'es' ? 1 : 0;
  $('#property-name').textContent = home.name; $('#property-location').textContent = home.location;
  $('#property-type').textContent = home.type[i]; $('#property-description').textContent = home.description[i];
  $('#property-area').textContent = home.area; $('#property-status').textContent = home.status[i];
  $('#property-count').textContent = `0${current + 1} / 05`;
  document.querySelectorAll('[data-home]').forEach((button,index) => {
    button.setAttribute('aria-pressed',String(index === current)); button.setAttribute('aria-label',homeLabel(index));
  });
  if (changeMedia) {
    planIndex = 0; propertyVideo.pause(); propertyVideo.poster = asset(home.image); propertyVideo.src = asset(`${home.key}.mp4`);
    propertyVideo.load(); syncVideo(propertyVideo);
  }
  $('#original-title').textContent = home.name; $('#original-image').src = asset(home.original);
  $('#original-image').alt = lang === 'es' ? `${home.name}: imagen original` : `${home.name}: original property imagery`;
  if ($('#view-plans')) $('#view-plans').hidden = home.plans.length === 0;
  if (plansDialog?.open) renderPlan();
}
$('#next-home').addEventListener('click',() => { current = (current + 1) % homes.length; renderHome(); });
$('#prev-home').addEventListener('click',() => { current = (current + homes.length - 1) % homes.length; renderHome(); });
document.querySelectorAll('[data-home]').forEach(button => button.addEventListener('click',() => { current = Number(button.dataset.home); renderHome(); }));
function translateAria() {
  const labels = {
    '.primary':['Main navigation','Navegación principal'], '.language':['Language','Idioma'],
    '.property-tabs':['Select a property','Seleccionar propiedad'], '.brand':['Dulcinea One — Home','Dulcinea One — Inicio'],
    '#prev-home':['Previous property','Propiedad anterior'], '#next-home':['Next property','Siguiente propiedad'],
    '#close-original':['Close original imagery','Cerrar imagen original'], '#view-plans':['View floorplans','Ver planos'],
    '#prev-plan':['Previous floorplan','Plano anterior'], '#next-plan':['Next floorplan','Siguiente plano'], '#close-plans':['Close floorplans','Cerrar planos'],
    '.raise-bar':['30 percent of the target raise committed','30 por ciento del capital objetivo comprometido']
  };
  for (const [selector,values] of Object.entries(labels)) $(selector)?.setAttribute('aria-label',values[lang === 'es' ? 1 : 0]);
  document.querySelectorAll('[data-en-aria-label]').forEach(element => element.setAttribute('aria-label',element.getAttribute(`data-${lang}-aria-label`)));
}
function setLanguage(next,updateRoute = true) {
  lang = next === 'es' ? 'es' : 'en'; document.documentElement.lang = lang;
  document.querySelectorAll('[data-en]').forEach(element => { element.textContent = element.dataset[lang]; });
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.language === lang)));
  document.querySelectorAll('[data-path]').forEach(link => { link.href = resource(link.dataset.path); });
  document.title = lang === 'es' ? 'Dulcinea One | Inversión inmobiliaria en Medellín' : 'Dulcinea One | Real estate investment in Medellín';
  const description = lang === 'es' ? 'Cinco propiedades en El Poblado y El Retiro. El primer fondo de Dulcinea, con la marca compartida de Lola & Ber Hospitality.' : 'Five homes in El Poblado and El Retiro. Dulcinea’s first real estate fund, co-branded by Lola & Ber Hospitality.';
  $('meta[name="description"]')?.setAttribute('content',description);
  if (updateRoute) {
    const url = new URL(isWeb ? (lang === 'es' ? '/es/' : '/') : `${lang === 'es' ? 'es/' : ''}index.html`,isWeb ? location.origin : portableRoot);
    url.search = location.search; url.searchParams.delete('lang'); url.hash = location.hash;
    try { history.replaceState(history.state,'',url); } catch { /* File previews still switch in place. */ }
  }
  renderHome(false); translateAria(); motionState();
}
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click',() => setLanguage(button.dataset.language)));
// CORS-mode fetch retains the real Origin under the site's no-referrer policy;
// native form navigation would send Origin:null and fail the server check.
document.querySelectorAll('.signout-form').forEach(form => form.addEventListener('submit',async event => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const feedback = $('#signout-error');
  if (button.disabled) return;
  button.disabled = true;
  form.setAttribute('aria-busy','true');
  feedback.hidden = true;
  feedback.textContent = '';
  try {
    const response = await fetch('/logout', { method:'POST', mode:'cors', credentials:'same-origin', headers:{ Accept:'application/json' } });
    if (!response.ok) throw new Error('Sign-out failed');
    location.replace(lang === 'es' ? '/login?lang=es&next=%2Fes%2F' : '/login');
  } catch {
    feedback.textContent = lang === 'es' ? 'No se pudo cerrar sesión. Inténtelo de nuevo.' : 'Could not sign out. Please try again.';
    feedback.hidden = false;
    button.disabled = false;
    form.removeAttribute('aria-busy');
  }
}));
function openDialog(dialog) { dialog.showModal(); syncMotion(); }
$('#view-original').addEventListener('click',() => openDialog(originalDialog));
$('#close-original').addEventListener('click',() => originalDialog.close());
$('#view-plans')?.addEventListener('click',() => {
  if (!homes[current].plans.length) return;
  planIndex = 0; renderPlan(); openDialog(plansDialog);
});
$('#close-plans')?.addEventListener('click',() => plansDialog.close());
function stepPlan(direction) { planIndex = (planIndex + direction + homes[current].plans.length) % homes[current].plans.length; renderPlan(); }
$('#prev-plan')?.addEventListener('click',() => stepPlan(-1));
$('#next-plan')?.addEventListener('click',() => stepPlan(1));
plansDialog?.addEventListener('keydown',event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stepPlan(event.key === 'ArrowLeft' ? -1 : 1); }
});
dialogs.forEach(dialog => {
  dialog.addEventListener('close',syncMotion);
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
// Preserve links shared from the former nineteen-slide presentation.
const legacyAnchors = ['home','approach','experience','experience','homes','approach','approach','fund','homes','homes','homes','homes','homes','homes','team','team','fund','fund','contact'];
const legacyHomes = {10:1,11:2,12:0,13:3,14:4};
function migrateLegacyHash() {
  const match = /^#slide-(\d+)$/.exec(location.hash);
  if (!match) return;
  const slide = Number(match[1]), anchor = legacyAnchors[slide - 1];
  if (!anchor) return;
  if (Object.hasOwn(legacyHomes,slide)) { current = legacyHomes[slide]; renderHome(); }
  const url = new URL(location.href); url.hash = anchor; history.replaceState(history.state,'',url);
  requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({behavior:'instant'}));
}
window.addEventListener('hashchange',migrateLegacyHash);
window.addEventListener('popstate',() => { setLanguage(/\/es(?:\/|$)/.test(location.pathname) ? 'es' : 'en',false); migrateLegacyHash(); });
const requestedLanguage = new URLSearchParams(location.search).get('lang');
setLanguage(requestedLanguage === 'es' || (requestedLanguage !== 'en' && initialSpanishPath) ? 'es' : 'en');
migrateLegacyHash();
