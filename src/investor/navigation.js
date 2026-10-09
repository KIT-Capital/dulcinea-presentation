(() => {
  const header = document.querySelector('.header');
  const toggle = header?.querySelector('.navigation-toggle');
  const panel = header?.querySelector('.header-navigation');
  const resources = header?.querySelector('.navigation-resources');
  const resourcesToggle = resources?.querySelector('summary');
  if (!header || !toggle || !panel) return;

  const compact = window.matchMedia('(max-width:1279px)');
  let open = false;
  let viewportWidth = window.innerWidth;

  function closeResources(restoreFocus = false) {
    if (!resources?.open) return;
    resources.open = false;
    if (restoreFocus) resourcesToggle.focus({preventScroll:true});
  }

  function translateToggle() {
    const language = ['en','es','fr'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
    toggle.setAttribute('aria-label',toggle.getAttribute(`data-${open ? 'close' : 'open'}-${language}`));
  }

  function setOpen(next,{restoreFocus = false} = {}) {
    open = Boolean(next && compact.matches && !document.body.classList.contains('is-presenting'));
    header.classList.toggle('navigation-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    if (!open) closeResources();
    translateToggle();
    // Update anchor clearance before the browser follows a menu link.
    if (typeof syncHeaderHeight === 'function') syncHeaderHeight();
    if (restoreFocus && compact.matches && !document.body.classList.contains('is-presenting')) {
      toggle.focus({preventScroll:true});
    }
  }

  toggle.addEventListener('click',() => setOpen(!open));
  header.addEventListener('click',event => {
    const link = event.target.closest('a');
    if (!link) return;
    closeResources(!open && resources?.contains(event.target));
    // A link opening a separate tab leaves keyboard focus on the visible toggle.
    if (open) setOpen(false,{restoreFocus:panel.contains(event.target)});
    if (!link.hasAttribute('data-section-nav') || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    event.preventDefault();
    // Measure after the compact menu closes; its height must not offset the destination.
    requestAnimationFrame(() => {
      const oldURL = location.href;
      const destination = new URL(location.href);
      destination.hash = section.id;
      if (destination.href !== oldURL) {
        history.pushState(history.state,'',destination);
        window.dispatchEvent(new HashChangeEvent('hashchange',{oldURL,newURL:destination.href}));
      }
      const heading = section.querySelector('h1,h2,h3') || section;
      const previousTabIndex = heading.getAttribute('tabindex');
      heading.setAttribute('tabindex','-1');
      heading.focus({preventScroll:true});
      heading.addEventListener('blur',() => {
        if (previousTabIndex === null) heading.removeAttribute('tabindex');
        else heading.setAttribute('tabindex',previousTabIndex);
      },{once:true});
      window.scrollTo({top:Math.max(0,window.scrollY+section.getBoundingClientRect().top-header.getBoundingClientRect().height-24),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    });
  });
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && resources?.open) {
      event.preventDefault();
      closeResources(true);
      return;
    }
    if (event.key !== 'Escape' || !open) return;
    event.preventDefault();
    setOpen(false,{restoreFocus:true});
  });
  document.addEventListener('pointerdown',event => {
    if (resources?.open && !resources.contains(event.target)) closeResources();
    if (open && !header.contains(event.target)) setOpen(false);
  });
  header.addEventListener('focusout',event => {
    if (resources?.open && event.relatedTarget && !resources.contains(event.relatedTarget)) closeResources();
    if (open && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  compact.addEventListener('change',() => {
    const focusWasInPanel = panel.contains(document.activeElement);
    setOpen(false,{restoreFocus:compact.matches && focusWasInPanel});
  });
  window.addEventListener('resize',() => {
    if (window.innerWidth === viewportWidth) return;
    viewportWidth = window.innerWidth;
    closeResources();
    if (open) setOpen(false,{restoreFocus:panel.contains(document.activeElement)});
  });
  document.addEventListener('dulcinea:language',translateToggle);
  new MutationObserver(() => {
    if (document.body.classList.contains('is-presenting')) setOpen(false);
  }).observe(document.body,{attributes:true,attributeFilter:['class']});

  // Without JavaScript the same links and controls remain visible.
  header.classList.add('navigation-ready');
  setOpen(false);
})();
