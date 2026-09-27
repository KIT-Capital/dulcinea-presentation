(() => {
  'use strict';

  function initializePhotoMotion() {
    const deck = document.getElementById('deck');
    const root = document.documentElement;
    if (!deck || root.dataset.photoMotionReady === 'true') return;

    const viewer = document.getElementById('property-viewer');
    const viewerStage = viewer?.querySelector('.viewer-stage');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const states = new Map();
    let userPaused = preference.matches;
    let pauseOrigin = userPaused ? 'preference' : null;

    function isExcluded(image) {
      return image.matches('.video-poster, .logo-full, .logo-symbol, .menu-brand-logo, [data-no-photo-motion], [data-photo-motion="off"]')
        || Boolean(image.closest('.brand-logo, .masthead, .menu-top, .cover-partner, template'));
    }

    function effectFor(image) {
      if (image.closest('#property-viewer')) return 'viewer';
      if (image.closest('.team-grid')) return 'portrait';
      // Keep plans still and avoid animating a poster beneath its own video.
      if (image.closest('.execution-plan, .property-media')) return 'reveal';
      if (image.closest('.home-card')) return 'gallery';
      if (image.matches('.full-image') || image.closest('.editorial-image, .investment-image')) return 'ambient';
      return 'reveal';
    }

    function syncPhotos() {
      const dialogOpen = Boolean(document.querySelector('dialog[open]'));
      const paused = userPaused || preference.matches || document.hidden || dialogOpen;
      root.dataset.photoMotionPaused = String(paused);
      root.dataset.photoMotionUserPaused = String(userPaused);
      root.dataset.photoMotionReduced = String(preference.matches);
      root.dataset.photoMotionHidden = String(document.hidden);
      root.dataset.photoMotionDialog = String(dialogOpen);
      let visibleCount = 0;
      let activeCount = 0;
      states.forEach((state, image) => {
        if (!image.isConnected) {
          observer?.unobserve(image);
          states.delete(image);
          return;
        }
        if (state.effect === 'viewer') state.visible = Boolean(viewer?.open);
        if (state.visible) visibleCount++;
        if (state.visible && state.ready) image.dataset.photoSeen = 'true';
        const active = state.visible && state.ready && !paused;
        image.dataset.photoVisible = String(state.visible);
        image.dataset.photoActive = String(active);
        if (active) activeCount++;
      });
      root.dataset.photoCount = String(states.size);
      root.dataset.photoVisibleCount = String(visibleCount);
      root.dataset.photoActiveCount = String(activeCount);
    }

    // Only the shared user preference is sent to video controls. Visibility and
    // dialog pauses are temporary and must not overwrite that preference.
    function announceMotionState() {
      document.dispatchEvent(new CustomEvent('dulcinea-motion-change', {
        detail: { paused: userPaused },
      }));
    }

    function setPaused(paused, origin = 'user') {
      userPaused = paused;
      pauseOrigin = paused ? origin : null;
      syncPhotos();
      announceMotionState();
    }

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const state = states.get(entry.target);
        if (state) state.visible = entry.isIntersecting && entry.intersectionRatio > 0;
      });
      syncPhotos();
    }, { root: deck, threshold: [0, 0.01, 0.15] }) : null;

    function register(image) {
      if (!(image instanceof HTMLImageElement) || states.has(image) || isExcluded(image)) return;
      const effect = effectFor(image);
      // These two frames need clipping for a drift, with their captions left
      // outside. Portraits and property/video layers retain their exact DOM.
      if ((effect === 'gallery' || image.closest('.editorial-image'))
          && !image.parentElement.classList.contains('photo-motion-frame')) {
        const frame = document.createElement('span');
        frame.className = 'photo-motion-frame';
        image.before(frame);
        frame.append(image);
      }
      const state = { effect, visible: effect === 'viewer' && Boolean(viewer?.open), ready: image.complete };
      states.set(image, state);
      image.classList.add('photo-motion');
      image.dataset.photoEffect = effect;
      image.dataset.photoSeen = String(effect === 'viewer' || !observer);
      image.dataset.photoActive = 'false';
      image.dataset.photoVisible = String(state.visible);
      if (effect === 'portrait') {
        const portraits = Array.from(image.closest('.team-grid').querySelectorAll('img'));
        image.style.setProperty('--photo-delay', `${Math.min(portraits.indexOf(image), 2) * 90}ms`);
      }
      const ready = () => {
        state.ready = true;
        image.dataset.photoReady = 'true';
        syncPhotos();
      };
      image.dataset.photoReady = String(state.ready);
      if (!state.ready) {
        image.addEventListener('load', ready, { once: true });
        image.addEventListener('error', ready, { once: true });
      }
      if (effect !== 'viewer') observer?.observe(image);
      // Without IntersectionObserver, images stay fully visible and still;
      // never run ambient animations on unseen photographs as a fallback.
    }

    function registerWithin(container) {
      if (!container) return;
      if (container instanceof HTMLImageElement) register(container);
      container.querySelectorAll?.('img').forEach(register);
    }

    registerWithin(deck);
    registerWithin(viewerStage);

    if ('MutationObserver' in window) {
      const photoChanges = new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
          if (node instanceof Element) registerWithin(node);
        }));
        syncPhotos();
      });
      photoChanges.observe(deck, { childList: true, subtree: true });
      if (viewerStage) photoChanges.observe(viewerStage, { childList: true, subtree: true });

      const dialogChanges = new MutationObserver(syncPhotos);
      dialogChanges.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true });
    }

    document.querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('close', syncPhotos);
      dialog.addEventListener('toggle', syncPhotos);
    });
    document.addEventListener('visibilitychange', syncPhotos);
    document.addEventListener('dulcinea-motion-request', (event) => {
      if (typeof event.detail?.paused === 'boolean') setPaused(event.detail.paused);
    });

    function preferenceChanged() {
      if (preference.matches) {
        if (!userPaused) {
          userPaused = true;
          pauseOrigin = 'preference';
        }
      } else if (pauseOrigin === 'preference') {
        userPaused = false;
        pauseOrigin = null;
      }
      syncPhotos();
      announceMotionState();
    }
    if (typeof preference.addEventListener === 'function') preference.addEventListener('change', preferenceChanged);
    else preference.addListener(preferenceChanged);

    root.dataset.photoMotionObserver = observer ? 'intersection' : 'static-fallback';
    root.dataset.photoMotionReady = 'true';
    syncPhotos();
    announceMotionState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePhotoMotion, { once: true });
  } else {
    initializePhotoMotion();
  }
})();
