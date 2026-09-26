(() => {
  'use strict';

  function initializePresentation() {
    const deck = document.getElementById('deck');
    if (!deck) return;

    const slides = Array.from(deck.querySelectorAll('.slide'));
    if (!slides.length) return;
    document.documentElement.classList.add('js-ready');
    const masthead = document.querySelector('.masthead');

    const previousButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const menuButton = document.getElementById('menu-toggle');
    const menu = document.getElementById('slide-menu');
    const menuClose = document.getElementById('menu-close');
    const menuLinks = document.getElementById('menu-links');
    const fullscreenButton = document.getElementById('fullscreen');
    const number = document.getElementById('current-number');
    const title = document.getElementById('current-title');
    const progress = document.getElementById('progress-fill');
    const announcement = document.getElementById('slide-announcement');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const links = Array.from(menuLinks?.querySelectorAll('a[href^="#"]') || []);
    let currentIndex = -1;
    let pendingIndex = null;
    let settleTimer = 0;
    let frame = 0;
    let returnFocus = null;
    const videoStates = Array.from(deck.querySelectorAll('.ambient-video')).map((video) => ({
      video,
      slide: video.closest('.slide'),
      button: video.closest('.slide').querySelector('.motion-toggle'),
      manuallyPaused: false,
      explicitlyEnabled: false,
      blocked: false,
      failed: false,
      pending: false,
    }));

    function videoAllowed(state) {
      return state.slide === slides[currentIndex] && !document.hidden && !menu?.open
        && !state.manuallyPaused && !state.failed && !state.blocked
        && (!reducedMotion.matches || state.explicitlyEnabled);
    }

    function updateVideoButton(state) {
      if (!state.button) return;
      const paused = state.video.paused;
      state.button.textContent = paused ? 'Play motion  ▷' : 'Pause motion  Ⅱ';
      state.button.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
      state.button.setAttribute('aria-pressed', String(!paused));
      state.button.hidden = state.failed;
    }

    function syncVideos() {
      videoStates.forEach((state) => {
        const { video } = state;
        if (!videoAllowed(state)) {
          video.pause();
          updateVideoButton(state);
          return;
        }
        if (!video.dataset.loaded) {
          const source = video.querySelector('source[data-src]');
          source.src = source.dataset.src;
          video.dataset.loaded = 'true';
          video.muted = true;
          video.load();
        }
        if (!state.pending && video.paused) {
          state.pending = true;
          video.play().catch((error) => {
            if (error.name !== 'AbortError' && videoAllowed(state)) state.blocked = true;
          }).finally(() => {
            state.pending = false;
            if (!videoAllowed(state)) video.pause();
            updateVideoButton(state);
          });
        }
      });
    }

    videoStates.forEach((state) => {
      state.video.addEventListener('loadeddata', () => state.video.classList.add('is-ready'));
      state.video.addEventListener('playing', () => {
        if (!videoAllowed(state)) state.video.pause();
        updateVideoButton(state);
      });
      state.video.addEventListener('pause', () => updateVideoButton(state));
      state.video.addEventListener('error', () => {
        state.failed = true;
        state.video.classList.remove('is-ready');
        updateVideoButton(state);
      });
      state.button?.addEventListener('click', () => {
        if (state.video.paused) {
          state.manuallyPaused = false;
          state.explicitlyEnabled = true;
          state.blocked = false;
          state.video.classList.add('user-enabled');
        } else {
          state.manuallyPaused = true;
        }
        syncVideos();
      });
    });
    document.addEventListener('visibilitychange', syncVideos);
    reducedMotion.addEventListener('change', () => {
      videoStates.forEach((state) => {
        state.explicitlyEnabled = false;
        state.video.classList.remove('user-enabled');
      });
      syncVideos();
    });

    const announce = (message) => {
      if (announcement) announcement.textContent = message;
    };

    function indexFromHash(hash) {
      return slides.findIndex((slide) => `#${slide.id}` === hash);
    }

    function updateMastheadScroll() {
      if (currentIndex < 0) return;
      masthead?.classList.toggle('scrolled',
        slides[currentIndex].getBoundingClientRect().top < deck.getBoundingClientRect().top - 20);
    }

    function setActive(index) {
      if (index < 0 || index >= slides.length) return;
      const changed = currentIndex !== index;
      currentIndex = index;
      masthead?.classList.toggle('on-light', slides[index].classList.contains('ivory') || slides[index].classList.contains('blue'));
      slides.forEach((slide, position) => {
        slide.dataset.active = String(position === index);
      });
      slides[index].dataset.seen = 'true';
      updateMastheadScroll();
      const slideTitle = slides[index].dataset.title || `Slide ${index + 1}`;
      if (number) number.textContent = String(index + 1).padStart(2, '0');
      if (title) title.textContent = slideTitle;
      if (progress) progress.style.width = `${((index + 1) / slides.length) * 100}%`;
      if (previousButton) previousButton.disabled = index === 0;
      if (nextButton) nextButton.disabled = index === slides.length - 1;
      links.forEach((link) => {
        if (link.getAttribute('href') === `#${slides[index].id}`) {
          link.setAttribute('aria-current', 'step');
        } else {
          link.removeAttribute('aria-current');
        }
      });
      if (changed) announce(`Chapter ${index + 1} of ${slides.length}: ${slideTitle}`);
      syncVideos();
      const nextHash = `#${slides[index].id}`;
      if (window.location.hash !== nextHash) {
        try {
          window.history.replaceState(window.history.state, '', nextHash);
        } catch {
          // Some local-file browser policies block History API updates.
          // Navigation remains available without adding history entries.
        }
      }
    }

    function updateFromPosition() {
      updateMastheadScroll();
      if (pendingIndex !== null) return;
      const viewport = deck.getBoundingClientRect();
      const center = viewport.top + deck.clientHeight / 2;
      let bestIndex = 0;
      let bestDistance = Infinity;
      slides.forEach((slide, index) => {
        const bounds = slide.getBoundingClientRect();
        if (bounds.bottom > viewport.top && bounds.top < viewport.bottom) {
          slide.dataset.seen = 'true';
        }
        const distance = center < bounds.top ? bounds.top - center
          : center > bounds.bottom ? center - bounds.bottom : 0;
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      setActive(bestIndex);
    }

    function schedulePositionUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateFromPosition();
      });
    }

    function finishScroll() {
      window.clearTimeout(settleTimer);
      pendingIndex = null;
      schedulePositionUpdate();
    }

    function goTo(index, { instant = false, focus = false } = {}) {
      const target = Math.max(0, Math.min(slides.length - 1, index));
      const jumpInstantly = instant || reducedMotion.matches;
      const slide = slides[target];
      const top = deck.scrollTop + slide.getBoundingClientRect().top
        - deck.getBoundingClientRect().top - deck.clientTop;
      pendingIndex = target;
      setActive(target);
      deck.scrollTo({ top, behavior: jumpInstantly ? 'instant' : 'smooth' });
      updateMastheadScroll();
      if (focus) {
        if (!slide.hasAttribute('tabindex')) slide.tabIndex = -1;
        slide.focus({ preventScroll: true });
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(finishScroll, jumpInstantly ? 50 : 1000);
    }

    function scrollVertically(direction, page = false) {
      const slide = slides[currentIndex];
      const viewport = deck.getBoundingClientRect();
      const bounds = slide.getBoundingClientRect();
      const start = deck.scrollTop + bounds.top - viewport.top - deck.clientTop;
      const end = Math.max(start, start + bounds.height - deck.clientHeight);
      const position = deck.scrollTop;
      const room = direction > 0 ? end - position : position - start;
      if (bounds.height > deck.clientHeight + 2 && room > 2) {
        pendingIndex = null;
        const step = page ? deck.clientHeight * 0.8 : 72;
        const top = Math.max(start, Math.min(end, position + direction * step));
        deck.scrollTo({ top, behavior: 'instant' });
        schedulePositionUpdate();
      } else {
        goTo(currentIndex + direction);
      }
    }

    previousButton?.addEventListener('click', () => goTo(currentIndex - 1));
    nextButton?.addEventListener('click', () => goTo(currentIndex + 1));

    const gallery = deck.querySelector('.home-gallery');
    const galleryButtons = Array.from(deck.querySelectorAll('[data-gallery-step]'));
    if (gallery) {
      const updateGallery = () => galleryButtons.forEach((button) => {
        button.disabled = Number(button.dataset.galleryStep) < 0
          ? gallery.scrollLeft < 2
          : gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
      });
      galleryButtons.forEach((button) => button.addEventListener('click', () => {
        const card = gallery.querySelector('.home-card');
        gallery.scrollBy({ left: Number(button.dataset.galleryStep) * (card.offsetWidth + 24),
          behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }));
      gallery.addEventListener('scroll', updateGallery, { passive: true });
      window.addEventListener('resize', updateGallery, { passive: true });
      updateGallery();
    }

    const revealTargets = deck.querySelectorAll('.reveal, .editorial-image, .home-card, .property-image');
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      }), { root: deck, threshold: 0.12 });
      revealTargets.forEach((element, index) => {
        element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 90}ms`);
        revealObserver.observe(element);
      });
    }

    deck.addEventListener('scroll', () => {
      schedulePositionUpdate();
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(finishScroll, 180);
    }, { passive: true });
    deck.addEventListener('scrollend', finishScroll);
    deck.addEventListener('wheel', finishScroll, { passive: true });
    deck.addEventListener('touchstart', finishScroll, { passive: true });
    let lastViewportWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth !== lastViewportWidth) {
        lastViewportWidth = window.innerWidth;
        goTo(Math.max(0, currentIndex), { instant: true });
      } else {
        schedulePositionUpdate();
      }
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            entry.target.dataset.seen = 'true';
          }
        });
        schedulePositionUpdate();
      }, {
        root: deck,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      slides.forEach((slide) => observer.observe(slide));
    }

    document.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || menu?.open) return;
      const target = event.target;
      if (target instanceof Element && target.closest(
        'a, button, input, textarea, select, summary, video, audio, .table-scroll, .home-gallery, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="textbox"], [role="slider"]',
      )) return;
      const verticalDirection = event.key === 'ArrowDown' || event.key === 'PageDown'
        || (event.key === ' ' && !event.shiftKey) ? 1
        : event.key === 'ArrowUp' || event.key === 'PageUp'
          || (event.key === ' ' && event.shiftKey) ? -1 : 0;
      if (verticalDirection) {
        event.preventDefault();
        scrollVertically(verticalDirection, event.key === 'PageDown' || event.key === 'PageUp' || event.key === ' ');
        return;
      }
      let destination;
      switch (event.key) {
        case 'ArrowRight': destination = currentIndex + 1; break;
        case 'ArrowLeft': destination = currentIndex - 1; break;
        case 'Home': destination = 0; break;
        case 'End': destination = slides.length - 1; break;
        default: return;
      }
      event.preventDefault();
      goTo(destination);
    });

    window.addEventListener('hashchange', () => {
      const index = indexFromHash(window.location.hash);
      if (index >= 0) goTo(index, { instant: true });
    });

    // Handle deck links ourselves so only the deck scrolls and history stays tidy.
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href^="#slide-"]') : null;
      if (!link) return;
      const index = indexFromHash(link.getAttribute('href'));
      if (index < 0) return;
      event.preventDefault();
      const fromMenu = Boolean(menu?.contains(link));
      if (menu?.open) menu.close();
      goTo(index, { focus: fromMenu });
    });

    if (menu && menuButton && typeof menu.showModal === 'function') {
      menuButton.setAttribute('aria-haspopup', 'dialog');
      menuButton.setAttribute('aria-controls', menu.id);
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.addEventListener('click', () => {
        if (menu.open) return;
        returnFocus = document.activeElement;
        menu.showModal();
        syncVideos();
        menuButton.setAttribute('aria-expanded', 'true');
        const selectedLink = links.find((link) => link.hasAttribute('aria-current'));
        (selectedLink || menuClose)?.focus();
      });
      menuClose?.addEventListener('click', () => menu.close());
      menu.addEventListener('close', () => {
        syncVideos();
        menuButton.setAttribute('aria-expanded', 'false');
        // Native dialog handles Escape and traps focus. Restore focus only if
        // a slide jump has not already placed it elsewhere.
        if (document.activeElement === document.body || menu.contains(document.activeElement)) {
          (returnFocus instanceof HTMLElement ? returnFocus : menuButton).focus({ preventScroll: true });
        }
      });
      menu.addEventListener('click', (event) => {
        if (event.target !== menu) return;
        const bounds = menu.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
          menu.close();
        }
      });
    } else if (menuButton) {
      menuButton.disabled = true;
      menuButton.title = 'Slide menu is unavailable in this browser. Use the navigation arrows.';
    }

    if (fullscreenButton) {
      const canFullscreen = typeof document.documentElement.requestFullscreen === 'function'
        && document.fullscreenEnabled !== false;
      if (!canFullscreen) {
        fullscreenButton.disabled = true;
        fullscreenButton.title = 'Fullscreen is unavailable in this browser.';
      } else {
        const updateFullscreen = () => {
          const active = Boolean(document.fullscreenElement);
          fullscreenButton.setAttribute('aria-pressed', String(active));
          fullscreenButton.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
          fullscreenButton.title = active ? 'Exit fullscreen' : 'Enter fullscreen';
          schedulePositionUpdate();
        };
        updateFullscreen();
        document.addEventListener('fullscreenchange', updateFullscreen);
        fullscreenButton.addEventListener('click', async () => {
          try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await document.documentElement.requestFullscreen();
          } catch {
            announce('Fullscreen could not be opened. The presentation remains available in this window.');
          }
        });
      }
    }

    const initialIndex = indexFromHash(window.location.hash);
    goTo(initialIndex >= 0 ? initialIndex : 0, { instant: true });
    // Run again after layout settles, including when restored from a local file.
    window.requestAnimationFrame(() => goTo(initialIndex >= 0 ? initialIndex : 0, { instant: true }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePresentation, { once: true });
  } else {
    initializePresentation();
  }
})();
