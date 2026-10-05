(() => {
  const header = document.querySelector('.header');
  const toggle = header?.querySelector('.navigation-toggle');
  const panel = header?.querySelector('.header-navigation');
  if (!header || !toggle || !panel) return;

  const compact = window.matchMedia('(max-width:850px)');
  let open = false;
  let viewportWidth = window.innerWidth;

  function translateToggle() {
    const language = document.documentElement.lang === 'es' ? 'es' : 'en';
    toggle.setAttribute('aria-label',toggle.getAttribute(`data-${open ? 'close' : 'open'}-${language}`));
  }

  function setOpen(next,{restoreFocus = false} = {}) {
    open = Boolean(next && compact.matches && !document.body.classList.contains('is-presenting'));
    header.classList.toggle('navigation-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    translateToggle();
    // Update anchor clearance before the browser follows a menu link.
    if (typeof syncHeaderHeight === 'function') syncHeaderHeight();
    if (restoreFocus && compact.matches && !document.body.classList.contains('is-presenting')) {
      toggle.focus({preventScroll:true});
    }
  }

  toggle.addEventListener('click',() => setOpen(!open));
  header.addEventListener('click',event => {
    if (!open || !event.target.closest('a')) return;
    // A link opening a separate tab leaves keyboard focus on the visible toggle.
    setOpen(false,{restoreFocus:panel.contains(event.target)});
  });
  document.addEventListener('keydown',event => {
    if (event.key !== 'Escape' || !open) return;
    event.preventDefault();
    setOpen(false,{restoreFocus:true});
  });
  document.addEventListener('pointerdown',event => {
    if (open && !header.contains(event.target)) setOpen(false);
  });
  header.addEventListener('focusout',event => {
    if (open && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  compact.addEventListener('change',() => {
    const focusWasInPanel = panel.contains(document.activeElement);
    setOpen(false,{restoreFocus:compact.matches && focusWasInPanel});
  });
  window.addEventListener('resize',() => {
    if (window.innerWidth === viewportWidth) return;
    viewportWidth = window.innerWidth;
    if (open) setOpen(false,{restoreFocus:panel.contains(document.activeElement)});
  });
  document.addEventListener('dulcinea:language',translateToggle);
  new MutationObserver(() => {
    if (open && document.body.classList.contains('is-presenting')) setOpen(false);
  }).observe(document.body,{attributes:true,attributeFilter:['class']});

  // Without JavaScript the same links and controls remain visible.
  header.classList.add('navigation-ready');
  setOpen(false);
})();
