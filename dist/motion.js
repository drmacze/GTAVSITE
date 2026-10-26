(() => {
  const { gsap, ScrollTrigger, Lenis } = window;
  if (!gsap || !ScrollTrigger || !Lenis) return;

  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const $ = (selector, root = document) => root.querySelector(selector);

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add('motion-ready');

    const lenis = new Lenis({
      lerp: 0.085,
      duration: 1.08,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      anchors: true,
      prevent: node => Boolean(node.closest('dialog, [data-lenis-prevent], #gameplay-track, .release-jump, input, textarea, select'))
    });

    lenis.on('scroll', ScrollTrigger.update);
    const ticker = time => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const progress = document.createElement('div');
    progress.className = 'motion-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    body.append(progress);
    const progressBar = progress.firstElementChild;

    const header = $('.site-header');
    const setHeaderY = header ? gsap.quickTo(header, 'yPercent', { duration: 0.42, ease: 'power3.out' }) : null;
    let lastDirection = 0;

    lenis.on('scroll', event => {
      const p = Math.max(0, Math.min(1, event.progress || 0));
      progressBar.style.transform = `scaleX(${p})`;
      if (!header) return;
      header.classList.toggle('is-scrolled', event.scroll > 18);
      const locked = root.classList.contains('menu-open') || root.classList.contains('survey-open') || root.classList.contains('privacy-open');
      if (locked || event.scroll < 110) {
        setHeaderY(0);
        return;
      }
      if (event.direction !== lastDirection) lastDirection = event.direction;
      setHeaderY(event.direction > 0 ? -104 : 0);
    });

    const updateLock = () => {
      const locked = root.classList.contains('menu-open') || root.classList.contains('survey-open') || root.classList.contains('privacy-open');
      if (locked) {
        lenis.stop();
        if (setHeaderY) setHeaderY(0);
      } else lenis.start();
    };
    const lockObserver = new MutationObserver(updateLock);
    lockObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
    updateLock();

    const reveal = (targets, options = {}) => {
      $$(targets).forEach((target, index) => {
        if (target.closest('dialog') || target.hidden) return;
        gsap.fromTo(target,
          { y: options.y ?? 34, opacity: 0, filter: 'blur(7px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: options.duration ?? 0.82,
            delay: options.delay ? options.delay * index : 0,
            ease: options.ease || 'power3.out',
            clearProps: 'filter',
            scrollTrigger: {
              trigger: target,
              start: options.start || 'top 91%',
              once: true
            }
          }
        );
      });
    };

    const staggerGroup = (selector, childSelector = ':scope > *') => {
      $$(selector).forEach(group => {
        const children = $$(childSelector, group).filter(el => !el.hidden);
        if (!children.length) return;
        gsap.fromTo(children,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.72,
            stagger: 0.07,
            ease: 'power3.out',
            scrollTrigger: { trigger: group, start: 'top 89%', once: true }
          }
        );
      });
    };

    if ($('.welcome-page')) {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.from('.welcome-art', { scale: 1.1, duration: 1.5, ease: 'power2.out' }, 0)
        .from('.welcome-kicker', { y: 18, opacity: 0, duration: 0.7 }, 0.12)
        .from('.welcome-line', { yPercent: 35, opacity: 0, stagger: 0.1, duration: 0.9 }, 0.2)
        .from('.welcome-description', { y: 18, opacity: 0, duration: 0.72 }, 0.42)
        .from('.welcome-bottom > *', { y: 14, opacity: 0, stagger: 0.08, duration: 0.62 }, 0.55)
        .from('.visit-signal', { x: 18, opacity: 0, duration: 0.7 }, 0.62);

      const scrub = gsap.timeline({
        scrollTrigger: { trigger: '.welcome-main', start: 'top top', end: 'bottom bottom', scrub: 0.65 }
      });
      scrub.to('.welcome-art', { scale: 1.14, yPercent: -4, ease: 'none' }, 0)
        .to('.welcome-shade', { opacity: 0.82, ease: 'none' }, 0)
        .to('.welcome-copy', { y: -72, opacity: 0.1, ease: 'none' }, 0.22)
        .to('.welcome-bottom', { y: -18, opacity: 0, ease: 'none' }, 0.08)
        .to('.visit-signal', { y: -20, opacity: 0, ease: 'none' }, 0.12);
    } else {
      if ($('.home-hero')) {
        const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
        hero.from('.home-hero video, .home-hero', { scale: 1.035, duration: 1.4, ease: 'power2.out' }, 0)
          .from('.home-content .eyebrow', { y: 16, opacity: 0, duration: 0.6 }, 0.08)
          .from('.home-content h1', { y: 36, opacity: 0, duration: 0.9 }, 0.14)
          .from('.home-content > p', { y: 22, opacity: 0, duration: 0.7 }, 0.32)
          .from('.home-actions > *', { y: 18, opacity: 0, stagger: 0.09, duration: 0.62 }, 0.42)
          .from('.home-device-link', { y: 12, opacity: 0, duration: 0.55 }, 0.52)
          .from('.home-bottom > *', { y: 12, opacity: 0, stagger: 0.08, duration: 0.56 }, 0.6);

        gsap.to('.home-content', {
          y: 54,
          opacity: 0.22,
          ease: 'none',
          scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: 0.55 }
        });
        gsap.to('.home-hero video', {
          scale: 1.085,
          yPercent: 3,
          ease: 'none',
          scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: 0.65 }
        });
        gsap.to('.hero-overlay', {
          opacity: 0.78,
          ease: 'none',
          scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: 0.7 }
        });
      }

      reveal('.support-heading, .support-help, .technical-heading, .technical-section, .gameplay-heading, .gameplay-gallery, .section-heading, .updates-heading, .release-entry, .community-overview, .team-heading, .team-empty, .faq-intro, .faq-list, .guide-intro, .compatibility-intro, .project-credits, .news-main, .discord-card');
      staggerGroup('.staff-grid');
      staggerGroup('.credits-grid');
      staggerGroup('.stats');
      staggerGroup('.gameplay-thumbnails');
      staggerGroup('.page-tabs');

      $$('.gameplay-slide img').forEach(image => {
        gsap.fromTo(image, { yPercent: -3, scale: 1.045 }, {
          yPercent: 3,
          scale: 1.015,
          ease: 'none',
          scrollTrigger: { trigger: image.closest('.gameplay-slide'), start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        });
      });

      $$('details').forEach(details => {
        details.addEventListener('toggle', () => {
          if (!details.open) return;
          const content = $$(':scope > *:not(summary)', details);
          if (!content.length) return;
          gsap.fromTo(content, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: 'power2.out', overwrite: true });
        });
      });
    }

    const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (finePointer) {
      const magneticTargets = $$('.button, .menu-toggle, .gameplay-prev, .gameplay-next, .gameplay-thumb, .music-footer-control');
      magneticTargets.forEach(target => {
        target.classList.add('motion-magnetic');
        const xTo = gsap.quickTo(target, 'x', { duration: 0.34, ease: 'power3.out' });
        const yTo = gsap.quickTo(target, 'y', { duration: 0.34, ease: 'power3.out' });
        const scaleTo = gsap.quickTo(target, 'scale', { duration: 0.28, ease: 'power3.out' });
        target.addEventListener('pointermove', event => {
          const rect = target.getBoundingClientRect();
          xTo((event.clientX - (rect.left + rect.width / 2)) * 0.12);
          yTo((event.clientY - (rect.top + rect.height / 2)) * 0.12);
          scaleTo(1.018);
        });
        target.addEventListener('pointerleave', () => { xTo(0); yTo(0); scaleTo(1); });
      });

      const liftTargets = $$('.post, .discord-card, .staff-card, .credit-item, .release-entry, .support-group, .community-overview, .team-empty, .news-main');
      liftTargets.forEach(card => {
        card.classList.add('motion-lift');
        card.addEventListener('pointerenter', () => gsap.to(card, { y: -5, duration: 0.32, ease: 'power2.out', overwrite: true }));
        card.addEventListener('pointerleave', () => gsap.to(card, { y: 0, duration: 0.42, ease: 'power3.out', overwrite: true }));
      });
    }

    $$('.desktop-nav a, .subtle-link, .post > a, .staff-card a, .site-footer a, .home-explore').forEach(link => link.classList.add('motion-link'));

    const onNavigate = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      let url;
      try { url = new URL(link.href, location.href); } catch { return; }
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search && url.hash)) return;
      event.preventDefault();
      body.classList.add('motion-page-leaving');
      setTimeout(() => { location.href = url.href; }, 190);
    };
    document.addEventListener('click', onNavigate);

    const refresh = () => ScrollTrigger.refresh();
    const delayedRefresh = () => requestAnimationFrame(() => requestAnimationFrame(refresh));
    window.addEventListener('load', delayedRefresh, { once: true });
    if (document.fonts) document.fonts.ready.then(delayedRefresh);
    document.addEventListener('toggle', delayedRefresh, true);
    window.addEventListener('pageshow', () => { body.classList.remove('motion-page-leaving'); updateLock(); delayedRefresh(); });

    return () => {
      document.removeEventListener('click', onNavigate);
      document.removeEventListener('toggle', delayedRefresh, true);
      lockObserver.disconnect();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      progress.remove();
      root.classList.remove('motion-ready');
      body.classList.remove('motion-page-leaving');
    };
  });
})();
