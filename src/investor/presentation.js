// Live presentation view of the current investor story, using the same content
// and media as the scrolling site. Arrows, Page Up/Down and Space change slides;
// Home/End jump to the ends, F toggles full screen and Escape returns to the site.
(() => {
  const main = document.querySelector('#main');
  const controls = document.querySelector('#presentation-controls');
  const startButton = document.querySelector('#start-presentation');
  const menu = document.querySelector('#presentation-menu');
  const websiteMenu = document.querySelector('#presentation-website-menu');
  const websiteButton = document.querySelector('#presentation-website');
  if (!main || !controls || !startButton || !menu) return;

  const story = window.DULCINEA_STORY;
  if (!Array.isArray(story?.main) || !story.main.length || !Array.isArray(story.appendices)) return;
  const steps = story.main;
  const appendices = story.appendices;
  const allSteps = [...steps,...appendices];
  const byId = new Map(allSteps.map(step => [step.id,step]));
  const mainIndex = new Map(steps.map((step,number) => [step.id,number]));
  const propertySteps = steps.filter(step => step.propertyKey);
  const sections = [...main.children];
  if (allSteps.some(step => !sections.includes(document.querySelector(step.selector)))) {
    startButton.disabled = true;
    console.warn('Presentation targets must be direct children of #main.');
    return;
  }
  const previousButton = document.querySelector('#presentation-previous');
  const nextButton = document.querySelector('#presentation-next');
  const fullscreenButton = document.querySelector('#presentation-fullscreen');
  const languageButton = document.querySelector('#presentation-language');
  const languageMenu = document.querySelector('#presentation-language-menu');
  const downloadLink = document.querySelector('#presentation-download');
  const exitButton = document.querySelector('#presentation-exit');
  const menuActions = document.createElement('div');
  menuActions.className = 'presentation-menu-actions';
  menuActions.hidden = true;
  websiteMenu?.querySelector('.dialog-top')?.after(menuActions);
  const readingCue = document.createElement('p');
  readingCue.id = 'presentation-reading-cue';
  readingCue.hidden = true;
  controls.prepend(readingCue);
  const motionButton = document.createElement('button');
  motionButton.type = 'button';
  motionButton.id = 'presentation-motion';
  const motionIcon = document.createElementNS('http://www.w3.org/2000/svg','svg');
  motionIcon.setAttribute('viewBox','0 0 24 24');
  motionIcon.setAttribute('aria-hidden','true');
  const motionPath = document.createElementNS('http://www.w3.org/2000/svg','path');
  motionIcon.append(motionPath);
  motionButton.append(motionIcon);
  controls.insertBefore(motionButton,languageButton || fullscreenButton);
  const status = document.querySelector('#presentation-status');
  const menuItems = document.querySelector('#presentation-menu-items');
  const appendixButton = document.createElement('button');
  appendixButton.type = 'button';
  appendixButton.id = 'presentation-appendix-return';
  appendixButton.hidden = true;
  controls.insertBefore(appendixButton,document.querySelector('#presentation-title'));
  const sectionState = new Map();
  const detailsState = new Map();
  let active = false;
  let index = 0;
  let activeId = steps[0].id;
  let appendixReturn = null;
  let returnFocus = null;
  let returnLanguage = null;
  let opener = null;
  let ownsFullscreen = false;
  let resizeFrame = 0;
  let mediaFrame = 0;
  let readingFrame = 0;
  let touch = null;

  const translated = values => window.DulcineaI18n.translate(values);
  const hasOpenDialog = () => Boolean(document.querySelector('dialog[open]'));
  const stepTitle = id => translated(byId.get(id).title);
  const inAppendix = () => !mainIndex.has(activeId);
  const clamp = number => Math.max(0,Math.min(steps.length - 1,Math.trunc(Number(number) || 0)));
  const routeId = (hash = location.hash) => {
    const match = /^#present-(.*)$/.exec(hash);
    if (!match) return null;
    const subject = /^\d+$/.test(match[1]) ? story.legacyNumeric[match[1]] : match[1];
    return byId.has(subject) ? subject : steps[0].id;
  };
  const targetId = target => typeof target === 'number' ? steps[clamp(target)].id : (byId.has(target) ? target : steps[0].id);
  function label(button, values) {
    if (!button) return;
    const text = translated(values);
    button.setAttribute('aria-label',text);
    button.title = text;
  }
  function announce(message) {
    if (status) status.textContent = message;
  }
  function updateMotionControl() {
    label(motionButton,paused ? ['Resume animations','Reanudar animaciones'] : ['Pause animations','Pausar animaciones']);
    motionButton.setAttribute('aria-pressed',String(paused));
    motionPath.setAttribute('d',paused ? 'M8 5l10 7-10 7z' : 'M8 6v12M16 6v12');
  }
  function announceCurrentStep() {
    announce(inAppendix() ? `${translated(['Appendix','Anexo'])}: ${stepTitle(activeId)}` : `${translated(['Slide','Diapositiva'])} ${index + 1} ${translated(['of','de'])} ${steps.length}: ${stepTitle(activeId)}`);
  }
  function writeHash(hash, push = false, appendixContext = null) {
    const url = new URL(location.href);
    url.hash = hash;
    try {
      const state = {...history.state};
      if (appendixContext) state.dulcineaAppendix = appendixContext;
      else delete state.dulcineaAppendix;
      history[push ? 'pushState' : 'replaceState'](state,'',url);
    } catch { /* Local file previews can still present without a history update. */ }
  }
  function compactControls(compact) {
    if (!websiteMenu || controls.classList.contains('is-compact') === compact) return;
    if (websiteMenu.open) websiteMenu.close();
    controls.classList.toggle('is-compact',compact);
    menuActions.hidden = !compact;
    if (compact) {
      [exitButton,downloadLink,languageButton,fullscreenButton].filter(Boolean).forEach(button => menuActions.append(button));
    } else {
      controls.insertBefore(exitButton,websiteButton);
      [downloadLink,languageButton,fullscreenButton].filter(Boolean).forEach(button => controls.append(button));
    }
    updateControls();
  }
  function updateReadingCue() {
    if (!active || document.body.dataset.presentationLayout !== 'responsive') {
      controls.classList.remove('has-reading-overflow');
      readingCue.hidden = true;
      return;
    }
    // Discount the cue's own row so adding it cannot manufacture overflow.
    const cueHeight = controls.classList.contains('has-reading-overflow') ? 24 : 0;
    const overflows = main.scrollHeight > main.clientHeight + cueHeight + 8;
    controls.classList.toggle('has-reading-overflow',overflows);
    readingCue.hidden = !overflows;
    if (!overflows) return;
    const more = main.scrollHeight - main.clientHeight - main.scrollTop > 8;
    const text = translated(more ? ['More on this slide ↓','Más en esta diapositiva ↓'] : ['End of this slide','Fin de esta diapositiva']);
    if (readingCue.textContent !== text) readingCue.textContent = text;
  }
  function scheduleReadingCue() {
    cancelAnimationFrame(readingFrame);
    readingFrame = requestAnimationFrame(updateReadingCue);
  }
  function fitCanvas() {
    if (!active) return;
    // Preserve the user's pinch zoom rather than reflowing under their fingers.
    const zoomed = window.visualViewport && window.visualViewport.scale > 1.01;
    if (zoomed && document.body.dataset.presentationLayout) return;
    const width = document.documentElement.clientWidth;
    const height = zoomed ? window.innerHeight : Math.min(window.innerHeight,window.visualViewport?.height || window.innerHeight);
    const responsive = width < 1180 || height < 600;
    document.body.dataset.presentationLayout = responsive ? 'responsive' : 'canvas';
    compactControls(responsive && (width <= 900 || height < 600));
    if (!responsive) {
      controls.classList.remove('has-reading-overflow');
      readingCue.hidden = true;
    }
    const toolbarHeight = controls.getBoundingClientRect().height || 64;
    const availableHeight = Math.max(1,height - toolbarHeight);
    document.body.style.setProperty('--presentation-width',`${width}px`);
    document.body.style.setProperty('--presentation-height',`${availableHeight}px`);
    scheduleReadingCue();
    if (responsive) {
      ['--presentation-scale','--presentation-left','--presentation-top'].forEach(name => document.body.style.removeProperty(name));
      return;
    }
    const scale = Math.min(width / 1440,availableHeight / 810);
    document.body.style.setProperty('--presentation-scale',String(scale));
    document.body.style.setProperty('--presentation-left',`${Math.max(0,(width - 1440 * scale) / 2)}px`);
    document.body.style.setProperty('--presentation-top',`${Math.max(0,(availableHeight - 810 * scale) / 2)}px`);
  }
  function scheduleFit() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { fitCanvas(); refreshMedia(); });
  }
  function refreshMedia() {
    cancelAnimationFrame(mediaFrame);
    mediaFrame = requestAnimationFrame(() => {
      if (!active) { syncMotion(); return; }
      // Reconcile immediately when consecutive slides share a section. The
      // intersection observer continues normal playback management afterward.
      const viewport = main.getBoundingClientRect();
      videos.forEach(video => {
        const bounds = video.getBoundingClientRect();
        const section = video.closest('.presentation-active');
        const visible = bounds.bottom > viewport.top && bounds.top < viewport.bottom && bounds.right > viewport.left && bounds.left < viewport.right;
        if (section && visible && bounds.width > 0 && bounds.height > 0) visibleVideos.add(video);
        else visibleVideos.delete(video);
      });
      syncMotion();
    });
  }
  function updateControls() {
    updateMotionControl();
    const appendix = inAppendix();
    const count = appendix ? translated(['Appendix','Anexo']) : `${String(index + 1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')}`;
    document.querySelector('#presentation-count').textContent = count;
    document.querySelector('#presentation-title').textContent = stepTitle(activeId);
    previousButton.disabled = appendix || index === 0;
    nextButton.disabled = appendix || index === steps.length - 1;
    appendixButton.hidden = !appendix;
    appendixButton.textContent = translated(['← Back to presentation','← Volver a la presentación']);
    label(appendixButton,['Back to presentation','Volver a la presentación']);
    label(previousButton,['Previous slide','Diapositiva anterior']);
    label(nextButton,['Next slide','Siguiente diapositiva']);
    label(document.querySelector('#presentation-overview'),['All slides','Todas las diapositivas']);
    label(exitButton,['Back to website','Volver al sitio web']);
    const compact = controls.classList.contains('is-compact');
    label(websiteButton,compact ? ['Presentation menu','Menú de presentación'] : ['Explore website','Explorar sitio web']);
    const websiteLabel = websiteButton?.querySelector('span');
    if (websiteLabel) websiteLabel.textContent = translated(compact ? ['Menu','Menú'] : ['Explore website','Explorar sitio web']);
    const websiteTitle = document.querySelector('#presentation-website-title');
    if (websiteTitle) websiteTitle.textContent = translated(compact ? ['Presentation menu','Menú de presentación'] : ['Explore the website','Explore el sitio web']);
    label(document.querySelector('#presentation-website-close'),compact ? ['Close presentation menu','Cerrar menú de presentación'] : ['Close website navigation','Cerrar navegación del sitio web']);
    label(document.querySelector('#presentation-menu-close'),['Close slide overview','Cerrar índice de diapositivas']);
    label(startButton,['Start presentation','Iniciar presentación']);
    label(fullscreenButton,document.fullscreenElement ? ['Exit full screen','Salir de pantalla completa'] : ['Full screen','Pantalla completa']);
    fullscreenButton?.setAttribute('aria-pressed',String(Boolean(document.fullscreenElement)));
    controls.setAttribute('aria-label',translated(['Presentation controls','Controles de presentación']));
    document.querySelector('#presentation-menu-title').textContent = translated(['The presentation','La presentación']);
    if (languageButton) {
      label(languageButton,['Choose language','Elegir idioma','Choisir la langue']);
      // Reuse the exact flag artwork from the site's language switch.
      const currentLanguage = window.DulcineaI18n.language;
      const flag = document.querySelector(`.header [data-language="${currentLanguage}"] svg`);
      languageButton.replaceChildren();
      if (flag) languageButton.append(flag.cloneNode(true));
      const abbreviation = document.createElement('span');
      abbreviation.textContent = currentLanguage.toUpperCase();
      languageButton.append(abbreviation);
      languageMenu?.querySelectorAll('[data-presentation-language]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.presentationLanguage === currentLanguage)));
    }
    menuItems.querySelectorAll('[data-presentation-id]').forEach(button => {
      const id = button.dataset.presentationId;
      button.querySelector('.presentation-menu-label').textContent = stepTitle(id);
      button.classList.toggle('is-current',id === activeId);
      if (id === activeId) button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
    menuItems.querySelector('.presentation-appendix-heading').textContent = translated(['Optional detail','Detalle opcional']);
  }
  function goTo(target, updateRoute = true) {
    if (!active) return start(target,updateRoute);
    status?.classList.remove('presentation-feedback');
    const id = targetId(target);
    const step = byId.get(id);
    const section = document.querySelector(step.selector);
    if (!sections.includes(section)) return;
    const resetScroll = id !== activeId || !document.body.dataset.presentationStep;
    const openingAppendix = !mainIndex.has(id) && (id !== activeId || !document.body.dataset.presentationStep);
    if (openingAppendix) {
      const saved = history.state?.dulcineaAppendix?.returnTo;
      const caller = updateRoute && mainIndex.has(activeId) ? activeId : (mainIndex.has(saved) ? saved : step.returnTo);
      appendixReturn = {id:caller,element:document.activeElement,locale:document.documentElement.lang};
    }
    activeId = id;
    if (mainIndex.has(id)) index = mainIndex.get(id);
    else index = mainIndex.get(appendixReturn?.id || step.returnTo);
    if (menu.open) menu.close();
    if (websiteMenu?.open) websiteMenu.close();
    if (languageMenu?.open) languageMenu.close();
    const focusedSection = sections.find(item => item.contains(document.activeElement));
    if (focusedSection && focusedSection !== section) controls.focus({preventScroll:true});
    document.body.dataset.presentationStep = step.id;
    document.body.classList.toggle('presentation-appendix',inAppendix());
    sections.forEach(item => {
      const selected = item === section;
      item.classList.toggle('presentation-active',selected);
      item.inert = !selected;
      item.setAttribute('aria-hidden',String(!selected));
    });
    if (step.propertyKey) window.DulcineaProperties.select(step.propertyKey,{writeRoute:false,scroll:false,focus:false});
    if (step.id === 'returns') section.querySelector('details.model')?.setAttribute('open','');
    if (step.anchor) document.querySelector(step.anchor)?.setAttribute('open','');
    if (updateRoute) writeHash(`present-${id}`,openingAppendix,inAppendix() ? (openingAppendix ? {returnTo:appendixReturn.id,pushed:true} : history.state?.dulcineaAppendix || null) : null);
    updateControls();
    if (openingAppendix) appendixButton.focus({preventScroll:true});
    if (!inAppendix() && document.activeElement === appendixButton) controls.focus({preventScroll:true});
    fitCanvas();
    if (resetScroll) main.scrollTo({top:0,left:0,behavior:'instant'});
    scheduleReadingCue();
    refreshMedia();
    announceCurrentStep();
    window.dispatchEvent(new CustomEvent('dulcinea:presentation-slide',{detail:{index:inAppendix() ? null : index,id:step.id,count:steps.length,appendix:inAppendix()}}));
  }
  function start(target = 0, updateRoute = true) {
    if (active) { goTo(target,updateRoute); return; }
    if (hasOpenDialog()) return;
    opener = document.activeElement;
    sectionState.clear();
    detailsState.clear();
    sections.forEach(section => sectionState.set(section,{inert:section.inert,hidden:section.getAttribute('aria-hidden')}));
    main.querySelectorAll('details').forEach(details => detailsState.set(details,details.open));
    active = true;
    controls.hidden = false;
    document.body.classList.add('is-presenting');
    activeId = targetId(target);
    if (updateRoute) writeHash(`present-${activeId}`,true);
    goTo(activeId,false);
    controls.focus({preventScroll:true});
  }
  function returnFromAppendix() {
    if (!active || !inAppendix()) return;
    const destination = appendixReturn?.id || byId.get(activeId).returnTo;
    returnFocus = appendixReturn?.element;
    if (history.state?.dulcineaAppendix?.pushed && history.state.dulcineaAppendix.returnTo === destination) {
      returnLanguage = document.documentElement.lang;
      history.back();
    } else {
      goTo(destination);
      restoreAppendixFocus();
    }
  }
  function restoreAppendixFocus() {
    if (!returnFocus || inAppendix()) return;
    const element = returnFocus;
    returnFocus = null;
    requestAnimationFrame(() => {
      if (!active) return;
      const visible = element.isConnected && element.getClientRects().length && !element.closest('[inert]');
      (visible ? element : controls).focus({preventScroll:true});
    });
  }
  function focusWebsiteSection(section) {
    if (!section) return;
    const headingId = section.getAttribute('aria-labelledby')?.split(/\s+/)[0];
    const labelledHeading = headingId && document.getElementById(headingId);
    const heading = section.querySelector(':scope > summary') ||
      (labelledHeading?.getClientRects().length ? labelledHeading : null) ||
      [...section.querySelectorAll('h1,h2,h3')].find(item => item.getClientRects().length) || section;
    const previousTabIndex = heading.getAttribute('tabindex');
    heading.setAttribute('tabindex','-1');
    heading.focus({preventScroll:true});
    heading.addEventListener('blur',() => {
      if (previousTabIndex === null) heading.removeAttribute('tabindex');
      else heading.setAttribute('tabindex',previousTabIndex);
    },{once:true});
  }
  function exit(updateRoute = true, restoreFocus = true, destinationId = null) {
    if (!active) return;
    const step = byId.get(activeId);
    const propertyKey = destinationId?.startsWith('property-') ? destinationId.slice(9) : (!destinationId || destinationId === 'homes') ? window.DulcineaProperties.key : null;
    const leavingProperty = Boolean(propertyKey && (step.propertyKey || destinationId === 'homes' || destinationId?.startsWith('property-')));
    const target = destinationId || (leavingProperty ? `property-${propertyKey}` : step.anchor?.slice(1));
    const section = (target && document.getElementById(target)) || document.querySelector(step.selector);
    if (menu.open) menu.close();
    if (websiteMenu?.open) websiteMenu.close();
    if (languageMenu?.open) languageMenu.close();
    active = false;
    controls.classList.remove('has-reading-overflow');
    readingCue.hidden = true;
    compactControls(false);
    status?.classList.remove('presentation-feedback');
    touch = null;
    document.body.classList.remove('is-presenting','presentation-appendix');
    delete document.body.dataset.presentationStep;
    delete document.body.dataset.presentationLayout;
    ['--presentation-scale','--presentation-left','--presentation-top','--presentation-height','--presentation-width'].forEach(name => document.body.style.removeProperty(name));
    sections.forEach(item => {
      item.classList.remove('presentation-active');
      const state = sectionState.get(item);
      item.inert = state?.inert || false;
      if (state?.hidden == null) item.removeAttribute('aria-hidden');
      else item.setAttribute('aria-hidden',state.hidden);
    });
    detailsState.forEach((wasOpen,details) => { details.open = wasOpen; });
    if (target === 'owner-use') document.querySelector('#owner-use').open = true;
    controls.hidden = true;
    if (ownsFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    ownsFullscreen = false;
    const sectionHash = leavingProperty ? `property-${propertyKey}` : section?.id || section?.querySelector('[id]')?.id || 'home';
    if (updateRoute) writeHash(sectionHash);
    const destination = updateRoute ? section : document.getElementById(location.hash.slice(1));
    requestAnimationFrame(() => {
      if (active) return;
      if (updateRoute && leavingProperty) {
        window.DulcineaProperties.select(propertyKey,{writeRoute:false,scroll:true,focus:restoreFocus});
      } else if (!updateRoute && location.hash.startsWith('#property-')) {
        window.DulcineaProperties.followRoute();
      } else {
        destination?.scrollIntoView({behavior:'instant',block:'start'});
      }
      if (restoreFocus && !leavingProperty) {
        if (destination) focusWebsiteSection(destination);
        else (opener?.isConnected ? opener : startButton).focus({preventScroll:true});
      }
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
    menuItems.querySelector(`[data-presentation-id="${activeId}"]`)?.focus();
    syncMotion();
  }
  function showWebsiteMenu() {
    if (!active || !websiteMenu || hasOpenDialog()) return;
    websiteMenu.showModal();
    websiteButton?.setAttribute('aria-expanded','true');
    const firstAction = controls.classList.contains('is-compact') ? exitButton : websiteMenu.querySelector('[data-website-section]');
    firstAction?.focus();
    syncMotion();
  }
  function addMenuStep(step,number = null) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.presentationId = step.id;
    if (number !== null) button.dataset.presentationIndex = String(number);
    const counter = document.createElement('span');
    counter.className = 'presentation-menu-number';
    counter.textContent = number === null ? '+' : String(number + 1).padStart(2,'0');
    const title = document.createElement('span');
    title.className = 'presentation-menu-label';
    title.textContent = stepTitle(step.id);
    button.append(counter,title);
    button.addEventListener('click',() => {
      goTo(step.id);
      controls.focus({preventScroll:true});
    });
    menuItems.append(button);
  }
  steps.forEach(addMenuStep);
  const appendixHeading = document.createElement('p');
  appendixHeading.className = 'presentation-appendix-heading';
  menuItems.append(appendixHeading);
  appendices.forEach(step => addMenuStep(step));
  controls.tabIndex = -1;
  main.tabIndex = -1;
  startButton.addEventListener('click',() => start());
  previousButton.addEventListener('click',() => { if (!inAppendix()) goTo(index - 1); });
  nextButton.addEventListener('click',() => { if (!inAppendix()) goTo(index + 1); });
  appendixButton.addEventListener('click',returnFromAppendix);
  document.querySelector('#presentation-exit').addEventListener('click',() => exit());
  document.querySelector('#presentation-overview').addEventListener('click',showOverview);
  document.querySelector('#presentation-menu-close').addEventListener('click',() => menu.close());
  websiteButton?.addEventListener('click',showWebsiteMenu);
  document.querySelector('#presentation-website-close')?.addEventListener('click',() => websiteMenu.close());
  fullscreenButton?.addEventListener('click',toggleFullscreen);
  if (fullscreenButton) fullscreenButton.hidden = !document.fullscreenEnabled || !document.documentElement.requestFullscreen;
  if (languageMenu) {
    const options = languageMenu.querySelector('.presentation-language-options');
    document.querySelectorAll('.header [data-language]').forEach(source => {
      const button = source.cloneNode(true);
      button.dataset.presentationLanguage = button.dataset.language;
      delete button.dataset.language;
      button.querySelector('span').textContent = source.getAttribute('aria-label');
      button.addEventListener('click',() => { setLanguage(button.dataset.presentationLanguage); languageMenu.close(); });
      options.append(button);
    });
    languageButton?.addEventListener('click',() => {
      if (!active) return;
      if (websiteMenu?.open) websiteMenu.close();
      if (hasOpenDialog()) return;
      languageMenu.showModal();
      languageButton.setAttribute('aria-expanded','true');
      languageMenu.querySelector('[aria-pressed="true"]')?.focus();
      syncMotion();
    });
    document.querySelector('#presentation-language-close')?.addEventListener('click',() => languageMenu.close());
    languageMenu.addEventListener('close',() => {
      languageButton?.setAttribute('aria-expanded','false');
      if (active) (controls.classList.contains('is-compact') ? websiteButton : languageButton)?.focus({preventScroll:true});
    });
  }
  motionButton.addEventListener('click',() => {
    paused = !paused;
    motionState();
    updateMotionControl();
  });
  // Hero controls and reduced-motion changes use the same playback preference.
  // Temporary pauses for dialogs or hidden tabs do not alter that preference.
  const heroMotionButton = document.querySelector('.motion');
  if (heroMotionButton) new MutationObserver(updateMotionControl).observe(heroMotionButton,{attributes:true,attributeFilter:['aria-pressed']});
  menu.addEventListener('close',() => {
    if (active) document.querySelector('#presentation-overview')?.focus({preventScroll:true});
  });
  websiteMenu?.addEventListener('close',() => {
    websiteButton?.setAttribute('aria-expanded','false');
    if (active) websiteButton?.focus({preventScroll:true});
  });
  document.addEventListener('dulcinea:language',() => {
    // On popstate app.js may apply the caller entry's older language before
    // this controller runs. Save locale changes only while the URL still
    // identifies the appendix, not during that return navigation.
    if (active && inAppendix() && routeId() === activeId && appendixReturn) appendixReturn.locale = document.documentElement.lang;
    updateControls(); scheduleFit();
    if (active) {
      status?.classList.remove('presentation-feedback');
      announceCurrentStep();
    }
  });
  window.addEventListener('resize',scheduleFit);
  window.visualViewport?.addEventListener('resize',scheduleFit);
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (active) scheduleFit(); }).observe(controls);
  if ('ResizeObserver' in window) {
    const contentResize = new ResizeObserver(entries => {
      if (active && entries.some(entry => entry.target.classList.contains('presentation-active'))) scheduleReadingCue();
    });
    sections.forEach(section => contentResize.observe(section));
  }
  document.fonts?.ready.then(scheduleFit);
  main.addEventListener('scroll',scheduleReadingCue,{passive:true});
  document.addEventListener('fullscreenchange',() => { updateControls(); scheduleFit(); });
  function syncRoute() {
    if (returnLanguage) {
      const language = returnLanguage;
      returnLanguage = null;
      setLanguage(language);
    }
    const requested = routeId();
    if (requested !== null) {
      // Browser navigation wins over an open viewer; ordinary dialog keyboard
      // handling still has priority until a route actually changes.
      document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
      if (active) goTo(requested,false);
      else start(requested,false);
      if (location.hash !== `#present-${requested}`) writeHash(`present-${requested}`,false,history.state?.dulcineaAppendix || null);
      restoreAppendixFocus();
    } else {
      if (active) exit(false,false);
      if (location.hash === '#owner-use') document.querySelector('#owner-use').open = true;
    }
  }
  window.addEventListener('hashchange',syncRoute);
  // Retain the saved appendix locale regardless of popstate listener order.
  window.addEventListener('popstate',() => {
    if (active && inAppendix() && mainIndex.has(routeId())) {
      returnLanguage ||= appendixReturn?.locale || document.documentElement.lang;
      returnFocus = appendixReturn?.element;
    }
  },true);
  window.addEventListener('popstate',syncRoute);
  // These destinations deliberately return to the scrolling site; ordinary
  // in-slide anchor links continue to navigate the presentation itself.
  document.addEventListener('click',event => {
    if (!active || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest('a[data-website-section]');
    if (!link || link.target === '_blank' || !document.getElementById(link.dataset.websiteSection)) return;
    event.preventDefault();
    exit(true,true,link.dataset.websiteSection);
  },true);
  document.addEventListener('keydown',event => {
    if (!active || hasOpenDialog() || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.key === 'Escape') { event.preventDefault(); if (inAppendix()) returnFromAppendix(); else exit(); return; }
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); return; }
    const interactive = target?.closest('a,button,summary,[role="button"]');
    const readingKey = event.key === 'PageDown' || event.key === 'PageUp' || ((event.key === ' ' || event.code === 'Space') && !interactive);
    if ((document.body.dataset.presentationLayout === 'responsive' || inAppendix()) && readingKey) {
      const direction = event.key === 'PageUp' || (event.shiftKey && (event.key === ' ' || event.code === 'Space')) ? -1 : 1;
      const scrollRegion = document.body.dataset.presentationLayout === 'canvas' && inAppendix() ? document.querySelector(byId.get(activeId).selector) : main;
      const remaining = direction > 0 ? scrollRegion.scrollHeight - scrollRegion.clientHeight - scrollRegion.scrollTop : scrollRegion.scrollTop;
      if (remaining > 2) {
        event.preventDefault();
        scrollRegion.scrollBy({top:direction * scrollRegion.clientHeight * .8,behavior:'instant'});
        return;
      }
    }
    let destination = null;
    if (!inAppendix()) {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') destination = index + 1;
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') destination = index - 1;
      if ((event.key === ' ' || event.code === 'Space') && !interactive) destination = index + (event.shiftKey ? -1 : 1);
    }
    if (event.key === 'Home') destination = 0;
    if (event.key === 'End') destination = steps.length - 1;
    if (destination === null) return;
    event.preventDefault();
    goTo(destination);
  });
  main.addEventListener('click',event => {
    if (!active || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const homeButton = target?.closest('[data-home],[data-preview-home],#prev-home,#next-home');
    if (homeButton) {
      event.preventDefault(); event.stopImmediatePropagation();
      let chosen;
      if (homeButton.hasAttribute('data-preview-home') || homeButton.hasAttribute('data-home')) {
        const sourceIndex = Number(homeButton.dataset.previewHome ?? homeButton.dataset.home);
        chosen = propertySteps.find(step => step.propertyKey === homes[sourceIndex]?.key);
      } else {
        const position = propertySteps.findIndex(step => step.propertyKey === window.DulcineaProperties.key);
        chosen = propertySteps[(position + (homeButton.id === 'next-home' ? 1 : propertySteps.length - 1)) % propertySteps.length];
      }
      if (chosen) goTo(chosen.id);
      return;
    }
    const summary = target?.closest('#returns > details.model > summary, #owner-use > summary');
    if (summary) { event.preventDefault(); return; }
    const link = target?.closest('a[href]');
    if (!link || link.target === '_blank') return;
    const url = new URL(link.href,location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    const requested = routeId(url.hash) || allSteps.find(step => (step.anchor || step.selector) === url.hash || (step.propertyKey && `#property-${step.propertyKey}` === url.hash))?.id;
    if (!requested) return;
    event.preventDefault();
    goTo(requested);
  },true);
  main.addEventListener('touchstart',event => {
    if (!active || hasOpenDialog() || event.touches.length !== 1 || window.visualViewport?.scale > 1.01) { touch = null; return; }
    if (event.target instanceof Element && event.target.closest('a,button,input,summary,video[controls]')) { touch = null; return; }
    touch = {x:event.touches[0].clientX,y:event.touches[0].clientY,time:Date.now(),scrollTop:main.scrollTop};
  },{passive:true});
  main.addEventListener('touchmove',event => {
    if (!touch) return;
    if (event.touches.length !== 1) { touch = null; return; }
    const x = Math.abs(event.touches[0].clientX - touch.x);
    const y = Math.abs(event.touches[0].clientY - touch.y);
    if (y > 18 && y > x * 1.2) touch = null;
  },{passive:true});
  main.addEventListener('touchend',event => {
    if (!active || !touch || !event.changedTouches.length || event.touches.length || hasOpenDialog()) { touch = null; return; }
    const deltaX = event.changedTouches[0].clientX - touch.x;
    const deltaY = event.changedTouches[0].clientY - touch.y;
    const elapsed = Date.now() - touch.time;
    const scrolled = Math.abs(main.scrollTop - touch.scrollTop) > 12;
    touch = null;
    if (!inAppendix() && !scrolled && elapsed < 900 && Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) goTo(index + (deltaX < 0 ? 1 : -1));
  },{passive:true});
  main.addEventListener('touchcancel',() => { touch = null; },{passive:true});
  window.DulcineaPresentation = Object.freeze({
    get active() { return active; },
    get index() { return inAppendix() ? null : index; },
    get id() { return activeId; },
    get appendix() { return inAppendix(); },
    get count() { return steps.length; },
    start, goTo, exit, returnFromAppendix,
    get slides() { return steps.map((step,number) => ({index:number,id:step.id,title:stepTitle(step.id)})); },
    get appendices() { return appendices.map(step => ({id:step.id,title:stepTitle(step.id)})); }
  });
  updateControls();
  syncRoute();
})();
