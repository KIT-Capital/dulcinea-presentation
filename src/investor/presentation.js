// Live presentation view of the current investor story, using the same content
// and media as the scrolling site. Arrows, Page Up/Down and Space change slides;
// Home/End jump to the ends, F toggles full screen and Escape returns to the site.
(() => {
  const main = document.querySelector('#main');
  const controls = document.querySelector('#presentation-controls');
  const startButton = document.querySelector('#start-presentation');
  const menu = document.querySelector('#presentation-menu');
  if (!main || !controls || !startButton || !menu) return;

  const steps = [
    {id:'cover', selector:'#home', title:['Dulcinea One','Dulcinea One']},
    {id:'idea', selector:'#approach', title:['The investment approach','La estrategia de inversión']},
    {id:'lifestyle', selector:'#approach', title:['Life in Medellín','La vida en Medellín']},
    {id:'fontanar', selector:'#homes', home:0, title:['Fontanar 201','Fontanar 201']},
    {id:'san-lucas', selector:'#homes', home:1, title:['San Lucas 101','San Lucas 101']},
    {id:'aires', selector:'#homes', home:2, title:['Aires de Campestre','Aires de Campestre']},
    {id:'monte-sereno', selector:'#homes', home:3, title:['Casa Monte Sereno','Casa Monte Sereno']},
    {id:'montana', selector:'#homes', home:4, title:['Casa Montana','Casa Montana']},
    {id:'hospitality', selector:'#experience', title:['Lola & Ber Hospitality','Lola & Ber Hospitality']},
    {id:'offer', selector:'#fund', title:['The offer + the ask','La oferta + la invitación']},
    {id:'kickers', selector:'#fund', title:['Three equity kickers','Tres beneficios de participación']},
    {id:'returns', selector:'#fund', title:['Projected returns','Retornos proyectados']},
    {id:'team', selector:'#team', title:['The core team','El equipo principal']},
    {id:'specialists', selector:'#specialists', title:['Local specialists','Especialistas locales']},
    {id:'disclaimer', selector:'#main .legal-notice', title:['Important disclosures','Información importante']},
    {id:'contact', selector:'#contact', title:['Talk to us','Hable con nosotros']}
  ];
  const sections = [...main.children];
  const previousButton = document.querySelector('#presentation-previous');
  const nextButton = document.querySelector('#presentation-next');
  const fullscreenButton = document.querySelector('#presentation-fullscreen');
  const languageButton = document.querySelector('#presentation-language');
  const status = document.querySelector('#presentation-status');
  const menuItems = document.querySelector('#presentation-menu-items');
  const sectionState = new Map();
  const detailsState = new Map();
  let active = false;
  let index = 0;
  let opener = null;
  let ownsFullscreen = false;
  let resizeFrame = 0;
  let mediaFrame = 0;
  let touch = null;

  const spanish = () => document.documentElement.lang === 'es';
  const translated = values => values[spanish() ? 1 : 0];
  const hasOpenDialog = () => Boolean(document.querySelector('dialog[open]'));
  const stepTitle = number => translated(steps[number].title);
  const clamp = number => Math.max(0,Math.min(steps.length - 1,Math.trunc(Number(number) || 0)));
  const routeIndex = () => {
    const match = /^#present-(\d+)$/.exec(location.hash);
    return match ? clamp(Number(match[1]) - 1) : null;
  };
  function label(button, values) {
    if (!button) return;
    const text = translated(values);
    button.setAttribute('aria-label',text);
    button.title = text;
  }
  function announce(message) {
    if (status) status.textContent = message;
  }
  function writeHash(hash, push = false) {
    const url = new URL(location.href);
    url.hash = hash;
    try {
      history[push ? 'pushState' : 'replaceState'](history.state,'',url);
    } catch { /* Local file previews can still present without a history update. */ }
  }
  function fitCanvas() {
    if (!active) return;
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const toolbarHeight = controls.getBoundingClientRect().height || 64;
    const availableHeight = Math.max(1,height - toolbarHeight);
    const scale = Math.min(width / 1440,availableHeight / 810);
    document.body.style.setProperty('--presentation-scale',String(scale));
    document.body.style.setProperty('--presentation-left',`${Math.max(0,(width - 1440 * scale) / 2)}px`);
    document.body.style.setProperty('--presentation-top',`${Math.max(0,(availableHeight - 810 * scale) / 2)}px`);
  }
  function scheduleFit() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(fitCanvas);
  }
  function refreshMedia() {
    cancelAnimationFrame(mediaFrame);
    mediaFrame = requestAnimationFrame(() => {
      if (!active) { syncMotion(); return; }
      // Reconcile immediately when consecutive slides share a section. The
      // intersection observer continues normal playback management afterward.
      videos.forEach(video => {
        const bounds = video.getBoundingClientRect();
        const section = video.closest('.presentation-active');
        if (section && bounds.width > 0 && bounds.height > 0) visibleVideos.add(video);
        else visibleVideos.delete(video);
      });
      syncMotion();
    });
  }
  function updateControls() {
    const count = `${String(index + 1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')}`;
    document.querySelector('#presentation-count').textContent = count;
    document.querySelector('#presentation-title').textContent = stepTitle(index);
    previousButton.disabled = index === 0;
    nextButton.disabled = index === steps.length - 1;
    label(previousButton,['Previous slide','Diapositiva anterior']);
    label(nextButton,['Next slide','Siguiente diapositiva']);
    label(document.querySelector('#presentation-overview'),['All slides','Todas las diapositivas']);
    label(document.querySelector('#presentation-exit'),['Return to website','Volver al sitio web']);
    label(document.querySelector('#presentation-menu-close'),['Close slide overview','Cerrar índice de diapositivas']);
    label(startButton,['Start presentation','Iniciar presentación']);
    label(fullscreenButton,document.fullscreenElement ? ['Exit full screen','Salir de pantalla completa'] : ['Full screen','Pantalla completa']);
    fullscreenButton?.setAttribute('aria-pressed',String(Boolean(document.fullscreenElement)));
    controls.setAttribute('aria-label',translated(['Presentation controls','Controles de presentación']));
    document.querySelector('#presentation-menu-title').textContent = translated(['The presentation','La presentación']);
    if (languageButton) {
      label(languageButton,spanish() ? ['Switch to English','Cambiar a inglés'] : ['Switch to Spanish','Cambiar a español']);
      // Reuse the exact flag artwork from the site's language switch.
      const targetLanguage = spanish() ? 'en' : 'es';
      const flag = document.querySelector(`.header [data-language="${targetLanguage}"] svg`);
      languageButton.replaceChildren();
      if (flag) languageButton.append(flag.cloneNode(true));
      const abbreviation = document.createElement('span');
      abbreviation.textContent = targetLanguage.toUpperCase();
      languageButton.append(abbreviation);
    }
    menuItems.querySelectorAll('[data-presentation-index]').forEach(button => {
      const number = Number(button.dataset.presentationIndex);
      button.querySelector('.presentation-menu-label').textContent = stepTitle(number);
      button.classList.toggle('is-current',number === index);
      if (number === index) button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
  }
  function goTo(number, updateRoute = true) {
    if (!active) return start(number);
    status?.classList.remove('presentation-feedback');
    index = clamp(number);
    const step = steps[index];
    const section = document.querySelector(step.selector);
    if (!section) return;
    if (menu.open) menu.close();
    const focusedSection = sections.find(item => item.contains(document.activeElement));
    if (focusedSection && focusedSection !== section) controls.focus({preventScroll:true});
    document.body.dataset.presentationStep = step.id;
    sections.forEach(item => {
      const selected = item === section;
      item.classList.toggle('presentation-active',selected);
      item.inert = !selected;
      item.setAttribute('aria-hidden',String(!selected));
    });
    if (typeof step.home === 'number') {
      const changed = current !== step.home;
      current = step.home;
      renderHome(changed);
    }
    if (step.id === 'returns') document.querySelector('#fund > details.model').open = true;
    if (updateRoute) writeHash(`present-${index + 1}`);
    updateControls();
    fitCanvas();
    refreshMedia();
    announce(`${translated(['Slide','Diapositiva'])} ${index + 1} ${translated(['of','de'])} ${steps.length}: ${stepTitle(index)}`);
    window.dispatchEvent(new CustomEvent('dulcinea:presentation-slide',{detail:{index,id:step.id,count:steps.length}}));
  }
  function start(number = 0, updateRoute = true) {
    if (active) { goTo(number,updateRoute); return; }
    if (hasOpenDialog()) return;
    opener = document.activeElement;
    sectionState.clear();
    detailsState.clear();
    sections.forEach(section => sectionState.set(section,{inert:section.inert,hidden:section.getAttribute('aria-hidden')}));
    main.querySelectorAll('details').forEach(details => detailsState.set(details,details.open));
    active = true;
    controls.hidden = false;
    document.body.classList.add('is-presenting');
    if (updateRoute) writeHash(`present-${clamp(number) + 1}`,true);
    goTo(number,false);
    controls.focus({preventScroll:true});
  }
  function exit(updateRoute = true, restoreFocus = true) {
    if (!active) return;
    const section = document.querySelector(steps[index].selector);
    if (menu.open) menu.close();
    active = false;
    status?.classList.remove('presentation-feedback');
    touch = null;
    document.body.classList.remove('is-presenting');
    delete document.body.dataset.presentationStep;
    ['--presentation-scale','--presentation-left','--presentation-top'].forEach(name => document.body.style.removeProperty(name));
    sections.forEach(item => {
      item.classList.remove('presentation-active');
      const state = sectionState.get(item);
      item.inert = state?.inert || false;
      if (state?.hidden == null) item.removeAttribute('aria-hidden');
      else item.setAttribute('aria-hidden',state.hidden);
    });
    detailsState.forEach((wasOpen,details) => { details.open = wasOpen; });
    controls.hidden = true;
    if (ownsFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    ownsFullscreen = false;
    const sectionHash = section?.id || section?.querySelector('[id]')?.id || 'home';
    if (updateRoute) writeHash(sectionHash);
    const destination = updateRoute ? section : document.getElementById(location.hash.slice(1));
    requestAnimationFrame(() => {
      if (active) return;
      destination?.scrollIntoView({behavior:'instant',block:'start'});
      if (restoreFocus) (opener?.isConnected ? opener : startButton).focus({preventScroll:true});
      syncMotion();
    });
    announce(translated(['Website view','Vista del sitio web']));
  }
  async function toggleFullscreen() {
    if (!active) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        ownsFullscreen = false;
      } else {
        await document.documentElement.requestFullscreen();
        ownsFullscreen = true;
      }
    } catch (error) {
      console.warn('Presentation fullscreen unavailable:',error.message);
      announce(translated(['Full screen is unavailable in this browser. Presentation mode is still active.','La pantalla completa no está disponible en este navegador. La presentación sigue activa.']));
      status?.classList.add('presentation-feedback');
    }
    updateControls();
    scheduleFit();
  }
  function showOverview() {
    if (!active || hasOpenDialog()) return;
    menu.showModal();
    menuItems.querySelector(`[data-presentation-index="${index}"]`)?.focus();
    syncMotion();
  }
  steps.forEach((step,number) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.presentationIndex = String(number);
    const counter = document.createElement('span');
    counter.className = 'presentation-menu-number';
    counter.textContent = String(number + 1).padStart(2,'0');
    const title = document.createElement('span');
    title.className = 'presentation-menu-label';
    title.textContent = stepTitle(number);
    button.append(counter,title);
    button.addEventListener('click',() => {
      goTo(number);
      controls.focus({preventScroll:true});
    });
    menuItems.append(button);
  });
  controls.tabIndex = -1;
  startButton.addEventListener('click',() => start());
  previousButton.addEventListener('click',() => goTo(index - 1));
  nextButton.addEventListener('click',() => goTo(index + 1));
  document.querySelector('#presentation-exit').addEventListener('click',() => exit());
  document.querySelector('#presentation-overview').addEventListener('click',showOverview);
  document.querySelector('#presentation-menu-close').addEventListener('click',() => menu.close());
  fullscreenButton?.addEventListener('click',toggleFullscreen);
  if (fullscreenButton) fullscreenButton.hidden = !document.fullscreenEnabled || !document.documentElement.requestFullscreen;
  languageButton?.addEventListener('click',() => setLanguage(spanish() ? 'en' : 'es'));
  menu.addEventListener('close',() => {
    if (active) document.querySelector('#presentation-overview')?.focus({preventScroll:true});
  });
  document.addEventListener('dulcinea:language',updateControls);
  window.addEventListener('resize',scheduleFit);
  window.visualViewport?.addEventListener('resize',scheduleFit);
  document.addEventListener('fullscreenchange',() => { updateControls(); scheduleFit(); });
  function syncRoute() {
    const requested = routeIndex();
    if (requested !== null) {
      if (active) goTo(requested,false);
      else start(requested,false);
    } else if (active) exit(false,false);
  }
  window.addEventListener('hashchange',syncRoute);
  window.addEventListener('popstate',syncRoute);
  document.addEventListener('keydown',event => {
    if (!active || hasOpenDialog() || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.key === 'Escape') { event.preventDefault(); exit(); return; }
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); return; }
    const interactive = target?.closest('a,button,summary,[role="button"]');
    let destination = null;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') destination = index + 1;
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') destination = index - 1;
    if ((event.key === ' ' || event.code === 'Space') && !interactive) destination = index + (event.shiftKey ? -1 : 1);
    if (event.key === 'Home') destination = 0;
    if (event.key === 'End') destination = steps.length - 1;
    if (destination === null) return;
    event.preventDefault();
    goTo(destination);
  });
  main.addEventListener('click',event => {
    if (!active || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const homeButton = target?.closest('[data-home],#prev-home,#next-home');
    if (homeButton) {
      event.preventDefault(); event.stopImmediatePropagation();
      const chosen = homeButton.hasAttribute('data-home') ? Number(homeButton.dataset.home) : (current + (homeButton.id === 'next-home' ? 1 : homes.length - 1)) % homes.length;
      goTo(steps.findIndex(step => step.home === chosen));
      return;
    }
    const summary = target?.closest('#fund > details.model > summary');
    if (summary) { event.preventDefault(); return; }
    const link = target?.closest('a[href]');
    if (!link || link.target === '_blank') return;
    const url = new URL(link.href,location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    const requested = steps.findIndex(step => step.selector === url.hash);
    if (requested < 0) return;
    event.preventDefault();
    goTo(requested);
  },true);
  main.addEventListener('touchstart',event => {
    if (!active || hasOpenDialog() || event.touches.length !== 1) { touch = null; return; }
    if (event.target instanceof Element && event.target.closest('a,button,input,summary,video[controls]')) { touch = null; return; }
    touch = {x:event.touches[0].clientX,y:event.touches[0].clientY,time:Date.now()};
  },{passive:true});
  main.addEventListener('touchend',event => {
    if (!active || !touch || !event.changedTouches.length || hasOpenDialog()) { touch = null; return; }
    const deltaX = event.changedTouches[0].clientX - touch.x;
    const deltaY = event.changedTouches[0].clientY - touch.y;
    const elapsed = Date.now() - touch.time;
    touch = null;
    if (elapsed < 900 && Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) goTo(index + (deltaX < 0 ? 1 : -1));
  },{passive:true});
  main.addEventListener('touchcancel',() => { touch = null; },{passive:true});
  window.DulcineaPresentation = Object.freeze({
    get active() { return active; },
    get index() { return index; },
    get count() { return steps.length; },
    start, goTo, exit,
    get slides() { return steps.map((step,number) => ({index:number,id:step.id,title:stepTitle(number)})); }
  });
  updateControls();
  syncRoute();
})();
