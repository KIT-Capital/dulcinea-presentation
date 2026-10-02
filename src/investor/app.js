const homes = [
  {name:'Fontanar 201',key:'fontanar',image:'fontanar.jpg',original:'fontanar-original.jpeg',plans:[1,2],location:'El Poblado',type:['Penthouse','Penthouse'],area:'389 m²',description:['A two-level penthouse in El Poblado.','Un penthouse de dos niveles en El Poblado.'],status:['Closed · 3Q26','Cerrado · 3T26']},
  {name:'San Lucas 101',key:'san-lucas',image:'san-lucas.webp',original:'san-lucas-original.png',plans:[8,9],location:'El Poblado',type:['Apartment','Apartamento'],area:'325 m²',description:['An apartment in El Poblado.','Un apartamento en El Poblado.'],status:['Negotiated · Compraventa drafted','Negociado · Compraventa redactada']},
  {name:'Aires de Campestre',key:'aires',image:'aires.jpg',original:'aires-original.png',plans:[6,7],location:'El Poblado',type:['Penthouse','Penthouse'],area:'489 m²',description:['A two-level penthouse in El Poblado.','Un penthouse de dos niveles en El Poblado.'],status:['Closed · 3Q26','Cerrado · 3T26']},
  {name:'Casa Monte Sereno',key:'monte-sereno',image:'monte-sereno.webp',original:'monte-sereno-original.png',plans:[3,4,5],location:'El Retiro',type:['House','Casa'],area:'420 m²',description:['A country house on a 2,940 m² lot.','Una casa de campo en un lote de 2.940 m².'],status:['Negotiated · Finalizing modifications','Negociado · Ajustando modificaciones']},
  {name:'Casa Montana',key:'montana',image:'montana.webp',original:'montana-original.png',plans:[],location:'El Retiro',type:['House','Casa'],area:'591 m²',description:['A country house in El Retiro.','Una casa de campo en El Retiro.'],status:['Negotiated · Works being budgeted','Negociado · Obras en presupuesto']}
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
const planImage = $('#plan-image');
const planViewport = $('#plan-viewport');
const planCanvas = $('#plan-canvas');
const planZoomLevels = [1,1.5,2,3,4];
let planZoom = 1, renderedPlan = null, planLayoutFrame = 0;
const plansDownload = $('#plans-dialog a[download]');
if (plansDownload) plansDownload.href = assetMap['floorplans.pdf'] || new URL(plansDownload.getAttribute('href'),location.href).href;
const dialogs = [...document.querySelectorAll('dialog')];
const propertyVideo = $('#property-video');
function canAnimate() { return !paused && !document.hidden && !dialogs.some(dialog => dialog.open); }
function syncVideo(video) {
  if (canAnimate() && visibleVideos.has(video)) video.play().catch(() => {});
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
// Hospitality and nightlife now have separate, viewport-controlled film chapters.
function homeLabel(index) { return `${lang === 'es' ? 'Ver' : 'View'} ${homes[index].name}`; }
function layoutPlan(preservePosition = true) {
  if (!plansDialog?.open || !planImage?.complete || !planImage.naturalWidth || planImage.hidden) return;
  const width = planViewport.clientWidth, height = planViewport.clientHeight;
  if (!width || !height) return;
  const centerX = (planViewport.scrollLeft + width / 2) / Math.max(width,planCanvas.offsetWidth);
  const centerY = (planViewport.scrollTop + height / 2) / Math.max(height,planCanvas.offsetHeight);
  const fit = Math.min(Math.max(1,width - 32) / planImage.naturalWidth,Math.max(1,height - 32) / planImage.naturalHeight);
  const imageWidth = Math.round(planImage.naturalWidth * fit * planZoom);
  const imageHeight = Math.round(planImage.naturalHeight * fit * planZoom);
  planImage.style.width = `${imageWidth}px`;
  planImage.style.height = `${imageHeight}px`;
  planCanvas.style.width = `${Math.max(width,imageWidth + 32)}px`;
  planCanvas.style.height = `${Math.max(height,imageHeight + 32)}px`;
  planViewport.scrollTo({left:preservePosition ? centerX * planCanvas.offsetWidth - width / 2 : 0,top:preservePosition ? centerY * planCanvas.offsetHeight - height / 2 : 0,behavior:'instant'});
  planViewport.classList.toggle('is-zoomed',planZoom > 1);
  $('#plan-zoom-value').textContent = `${Math.round(planZoom * 100)}%`;
  $('#plan-zoom-out').disabled = planZoom === planZoomLevels[0];
  $('#plan-zoom-in').disabled = planZoom === planZoomLevels.at(-1);
}
function schedulePlanLayout() {
  cancelAnimationFrame(planLayoutFrame);
  planLayoutFrame = requestAnimationFrame(() => layoutPlan());
}
function zoomPlan(direction) {
  planZoom = planZoomLevels[Math.max(0,Math.min(planZoomLevels.length - 1,planZoomLevels.indexOf(planZoom) + direction))];
  layoutPlan();
}
function renderPlan() {
  const home = homes[current], page = home.plans[planIndex];
  if (!page || !plansDialog) return;
  const labels = {1:['Floor 1','Piso 1'],2:['Floor 2','Piso 2'],3:['Site plan','Terreno'],4:['Floor 1','Piso 1'],5:['Roof plan','Cubierta'],6:['Floor 1','Piso 1'],7:['Floor 2','Piso 2'],8:['Floor 1','Piso 1'],9:['Floor 2','Piso 2']};
  const caption = `${home.name} · ${labels[page][lang === 'es' ? 1 : 0]}`;
  $('#plans-title').textContent = home.name;
  const sheets = $('#plan-sheets');
  // Reuse sheet controls when possible so keyboard focus survives selection.
  if (sheets.dataset.property !== home.key) {
    sheets.replaceChildren(...home.plans.map((_,index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.plan = String(index);
      return button;
    }));
    sheets.dataset.property = home.key;
  }
  [...sheets.children].forEach((button,index) => {
    button.textContent = labels[home.plans[index]][lang === 'es' ? 1 : 0];
    button.setAttribute('aria-pressed',String(index === planIndex));
  });
  if (renderedPlan !== page) {
    renderedPlan = page; planZoom = 1; planImage.hidden = true;
    $('#plan-error').hidden = true; planViewport.setAttribute('aria-busy','true');
    planCanvas.style.width = '100%'; planCanvas.style.height = '100%';
    planViewport.scrollTo({left:0,top:0,behavior:'instant'});
    planImage.src = asset(`plan-${page}.webp`);
    $('#plan-zoom-value').textContent = '100%';
    $('#plan-zoom-out').disabled = true; $('#plan-zoom-in').disabled = true;
  }
  planImage.alt = caption;
  $('#plan-open').href = asset(`plan-${page}.webp`);
  $('#plan-caption').textContent = caption; $('#plan-count').textContent = `${planIndex + 1} / ${home.plans.length}`;
  $('#prev-plan').disabled = home.plans.length < 2; $('#next-plan').disabled = home.plans.length < 2;
  schedulePlanLayout();
}
function renderHome(changeMedia = true) {
  const home = homes[current], i = lang === 'es' ? 1 : 0;
  $('#property-name').textContent = home.name; $('#property-location').textContent = home.location;
  $('#property-type').textContent = home.type[i]; $('#property-description').textContent = home.description[i];
  $('#property-area').textContent = home.area; $('#property-status').textContent = home.status[i];
  $('#property-count').textContent = `0${current + 1} / 05`;
  $('#property-plan-count').textContent = String(home.plans.length).padStart(2,'0');
  $('.property-layout').dataset.property = home.key;
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
// Film previews lead to the existing detailed viewer, including plans and status.
document.querySelectorAll('[data-preview-home]').forEach(link => link.addEventListener('click',event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const index = Number(link.dataset.previewHome);
  if (!Number.isInteger(index) || !homes[index]) return;
  current = index; renderHome();
  const url = new URL(location.href); url.hash = 'homes'; history.replaceState(history.state,'',url);
  $('#homes').scrollIntoView({behavior:reduce.matches ? 'instant' : 'smooth',block:'start'});
  const heading = $('#property-name');
  heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true});
}));
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
  document.querySelectorAll('[data-en-alt]').forEach(element => element.alt = element.getAttribute(`data-${lang}-alt`));
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
  document.dispatchEvent(new CustomEvent('dulcinea:language'));
}
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click',() => setLanguage(button.dataset.language)));
function openDialog(dialog) { dialog.showModal(); syncMotion(); }
$('#view-original').addEventListener('click',() => openDialog(originalDialog));
$('#close-original').addEventListener('click',() => originalDialog.close());
$('#view-plans')?.addEventListener('click',() => {
  if (!homes[current].plans.length) return;
  planIndex = 0; planZoom = 1; renderPlan(); openDialog(plansDialog); schedulePlanLayout();
});
$('#close-plans')?.addEventListener('click',() => plansDialog.close());
function stepPlan(direction) { planIndex = (planIndex + direction + homes[current].plans.length) % homes[current].plans.length; renderPlan(); }
$('#prev-plan')?.addEventListener('click',() => stepPlan(-1));
$('#next-plan')?.addEventListener('click',() => stepPlan(1));
$('#plan-sheets')?.addEventListener('click',event => {
  const button = event.target.closest('button[data-plan]');
  if (!button) return;
  planIndex = Number(button.dataset.plan); renderPlan();
});
$('#plan-zoom-out')?.addEventListener('click',() => zoomPlan(-1));
$('#plan-zoom-in')?.addEventListener('click',() => zoomPlan(1));
$('#plan-fit')?.addEventListener('click',() => { planZoom = 1; layoutPlan(false); });
planImage?.addEventListener('load',() => {
  planImage.hidden = false; planViewport.removeAttribute('aria-busy');
  layoutPlan(false);
});
planImage?.addEventListener('error',() => {
  renderedPlan = null;
  $('#plan-zoom-out').disabled = true; $('#plan-zoom-in').disabled = true;
  planImage.hidden = true; planViewport.removeAttribute('aria-busy'); $('#plan-error').hidden = false;
});
if (typeof ResizeObserver === 'function') new ResizeObserver(schedulePlanLayout).observe(planViewport);
else window.addEventListener('resize',schedulePlanLayout);
// Mouse dragging complements native touch panning and trackpad scrolling.
let planDrag = null;
planViewport?.addEventListener('pointerdown',event => {
  if (event.pointerType !== 'mouse' || event.button !== 0 || planZoom <= 1) return;
  planDrag = {x:event.clientX,y:event.clientY,left:planViewport.scrollLeft,top:planViewport.scrollTop};
  planViewport.setPointerCapture(event.pointerId); planViewport.classList.add('is-dragging');
});
planViewport?.addEventListener('pointermove',event => {
  if (!planDrag) return;
  planViewport.scrollLeft = planDrag.left + planDrag.x - event.clientX;
  planViewport.scrollTop = planDrag.top + planDrag.y - event.clientY;
});
function endPlanDrag() { planDrag = null; planViewport?.classList.remove('is-dragging'); }
planViewport?.addEventListener('pointerup',endPlanDrag);
planViewport?.addEventListener('pointercancel',endPlanDrag);
planViewport?.addEventListener('lostpointercapture',endPlanDrag);
plansDialog?.addEventListener('close',endPlanDrag);
plansDialog?.addEventListener('keydown',event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  // The drawing region retains arrow-key scrolling while enlarged.
  if (event.target === planViewport && planZoom > 1 && event.key.startsWith('Arrow')) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stepPlan(event.key === 'ArrowLeft' ? -1 : 1); }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomPlan(1); }
  if (event.key === '-') { event.preventDefault(); zoomPlan(-1); }
  if (event.key === '0') { event.preventDefault(); planZoom = 1; layoutPlan(false); }
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
const legacyAnchors = ['home','approach','experience','experience','homes','approach','approach','fund','homes','homes','homes','homes','homes','homes','team','specialists','fund','fund','contact'];
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
