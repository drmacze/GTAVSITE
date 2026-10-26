(() => {
  const { gsap, ScrollTrigger, Lenis } = window;
  if (!gsap || !ScrollTrigger || !Lenis) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = gsap.matchMedia();
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const $ = (selector, root = document) => root.querySelector(selector);
  const collect = (selector, scope = document) => {
    const nodes = scope === document ? $$(selector) : $$(selector, scope);
    if (scope instanceof Element && scope.matches(selector)) nodes.unshift(scope);
    return [...new Set(nodes)];
  };

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const root = document.documentElement;
    const body = document.body;
    const coarsePointer = matchMedia('(pointer: coarse)').matches;
    const desktop = matchMedia('(min-width: 769px)').matches;
    const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
    const disposers = [];
    root.classList.add('motion-ready');

    const lenis = new Lenis({
      lerp: coarsePointer ? 0.11 : 0.082,
      duration: coarsePointer ? 0.92 : 1.08,
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

    lenis.on('scroll', event => {
      const p = Math.max(0, Math.min(1, event.progress || 0));
      progressBar.style.transform = `scaleX(${p})`;
      root.style.setProperty('--scroll-progress', p.toFixed(4));
      if (!header) return;
      header.classList.toggle('is-scrolled', event.scroll > 18);
      const locked = root.classList.contains('menu-open') || root.classList.contains('survey-open') || root.classList.contains('privacy-open');
      if (locked || event.scroll < 110) {
        setHeaderY(0);
        return;
      }
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

    const processed = {
      reveal: new WeakSet(),
      heading: new WeakSet(),
      list: new WeakSet(),
      image: new WeakSet(),
      line: new WeakSet(),
      tracked: new WeakSet(),
      number: new WeakSet(),
      details: new WeakSet(),
      toc: new WeakSet(),
      scrub: new WeakSet()
    };

    const canAnimate = element => {
      if (!(element instanceof Element) || element.closest('dialog')) return false;
      if (element.hidden || getComputedStyle(element).display === 'none') return false;
      return true;
    };

    const variantFrom = (variant, amount = 1) => {
      const blur = coarsePointer ? 'blur(0px)' : 'blur(6px)';
      if (variant === 1) return { x: -42 * amount, y: 0, opacity: 0, filter: blur };
      if (variant === 2) return { x: 42 * amount, y: 0, opacity: 0, filter: blur };
      if (variant === 3) return { scale: 0.965, y: 18 * amount, opacity: 0, clipPath: 'inset(9% 0 9% 0)' };
      return { y: 38 * amount, opacity: 0, filter: blur };
    };

    const revealElement = (element, index = 0, options = {}) => {
      if (!canAnimate(element) || processed.reveal.has(element)) return;
      processed.reveal.add(element);
      const variant = options.variant ?? index % 4;
      gsap.fromTo(element, variantFrom(variant, options.amount ?? 1), {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        clipPath: 'inset(0% 0 0% 0)',
        duration: options.duration ?? 0.86,
        ease: options.ease || 'power3.out',
        clearProps: 'filter,clipPath',
        scrollTrigger: {
          trigger: element,
          start: options.start || 'top 90%',
          once: true
        }
      });
    };

    const animateHeading = (heading, index = 0) => {
      if (!canAnimate(heading) || processed.heading.has(heading)) return;
      if (heading.closest('.home-content, .welcome-copy, .menu-dialog, .onboarding-dialog')) return;
      processed.heading.add(heading);
      const isH1 = heading.matches('h1');
      const side = index % 2 ? 1 : -1;
      const from = isH1
        ? { y: 34, opacity: 0, clipPath: 'inset(0 0 100% 0)' }
        : { x: side * 24, y: 10, opacity: 0, clipPath: 'inset(0 0 18% 0)' };
      gsap.fromTo(heading, from, {
        x: 0,
        y: 0,
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: isH1 ? 0.94 : 0.78,
        ease: 'power4.out',
        clearProps: 'clipPath',
        scrollTrigger: { trigger: heading, start: 'top 91%', once: true }
      });
    };

    const animateList = list => {
      if (!canAnimate(list) || processed.list.has(list)) return;
      const items = $$(':scope > li', list).filter(canAnimate);
      if (!items.length) return;
      processed.list.add(list);
      gsap.fromTo(items,
        { x: 18, y: 8, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.58,
          stagger: { each: 0.055, from: 'start' },
          ease: 'power3.out',
          scrollTrigger: { trigger: list, start: 'top 91%', once: true }
        }
      );
    };

    const animateImage = image => {
      if (!canAnimate(image) || processed.image.has(image)) return;
      processed.image.add(image);
      const parent = image.parentElement || image;
      gsap.fromTo(image,
        { scale: 1.075, clipPath: 'inset(6% 5% 6% 5%)', opacity: 0.35 },
        {
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.05,
          ease: 'power3.out',
          clearProps: 'clipPath',
          scrollTrigger: { trigger: parent, start: 'top 90%', once: true }
        }
      );
      if (desktop && !image.closest('.gameplay-slide')) {
        gsap.fromTo(image, { yPercent: -2.5 }, {
          yPercent: 2.5,
          ease: 'none',
          scrollTrigger: { trigger: parent, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        });
      }
    };

    const addHeadingLine = container => {
      if (!canAnimate(container) || processed.line.has(container)) return;
      processed.line.add(container);
      container.classList.add('motion-heading-line');
      gsap.fromTo(container, { '--motion-line-scale': 0 }, {
        '--motion-line-scale': 1,
        duration: 1.05,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: container, start: 'top 88%', once: true }
      });
    };

    const trackSection = section => {
      if (!canAnimate(section) || processed.tracked.has(section)) return;
      processed.tracked.add(section);
      section.classList.add('motion-tracked');
      ScrollTrigger.create({
        trigger: section,
        start: 'top 68%',
        end: 'bottom 34%',
        toggleClass: { targets: section, className: 'is-motion-active' }
      });
    };

    const animateNumber = element => {
      if (!canAnimate(element) || processed.number.has(element)) return;
      const raw = element.textContent.trim();
      const match = raw.match(/^([^\d-]*)(-?[\d,.]+)(.*)$/);
      if (!match) return;
      const value = Number(match[2].replace(/,/g, ''));
      if (!Number.isFinite(value) || Math.abs(value) < 1) return;
      processed.number.add(element);
      const prefix = match[1];
      const suffix = match[3];
      const state = { value: 0 };
      gsap.to(state, {
        value,
        duration: 1.25,
        ease: 'power2.out',
        snap: { value: 1 },
        onUpdate: () => { element.textContent = `${prefix}${new Intl.NumberFormat('en').format(Math.round(state.value))}${suffix}`; },
        scrollTrigger: { trigger: element, start: 'top 92%', once: true }
      });
    };

    const setupDetails = details => {
      if (!(details instanceof HTMLDetailsElement) || processed.details.has(details)) return;
      processed.details.add(details);
      const onToggle = () => {
        requestAnimationFrame(() => ScrollTrigger.refresh());
        if (!details.open) return;
        const content = $$(':scope > *:not(summary)', details);
        if (!content.length) return;
        gsap.fromTo(content,
          { y: -10, opacity: 0, clipPath: 'inset(0 0 18% 0)' },
          { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.46, ease: 'power3.out', clearProps: 'clipPath', overwrite: true }
        );
      };
      details.addEventListener('toggle', onToggle);
      disposers.push(() => details.removeEventListener('toggle', onToggle));
    };

    const setupToc = nav => {
      if (!canAnimate(nav) || processed.toc.has(nav)) return;
      const links = $$('a[href^="#"]', nav);
      if (!links.length) return;
      processed.toc.add(nav);
      links.forEach(link => {
        const id = decodeURIComponent(link.getAttribute('href').slice(1));
        const target = document.getElementById(id);
        if (!target) return;
        ScrollTrigger.create({
          trigger: target,
          start: 'top 46%',
          end: 'bottom 46%',
          onToggle: self => link.classList.toggle('motion-current', self.isActive)
        });
      });
      gsap.fromTo(links, { x: -10, opacity: 0 }, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.045,
        ease: 'power3.out',
        scrollTrigger: { trigger: nav, start: 'top 92%', once: true }
      });
    };

    const setupScrubDetails = scope => {
      if (!desktop) return;
      collect('.technical-number', scope).forEach(number => {
        if (processed.scrub.has(number)) return;
        processed.scrub.add(number);
        gsap.fromTo(number, { y: 28, opacity: 0.28 }, {
          y: -24,
          opacity: 0.9,
          ease: 'none',
          scrollTrigger: { trigger: number.closest('.technical-section') || number, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
        });
      });
      collect('.guide-section > .eyebrow', scope).forEach(label => {
        if (processed.scrub.has(label)) return;
        processed.scrub.add(label);
        gsap.fromTo(label, { x: -12 }, {
          x: 12,
          ease: 'none',
          scrollTrigger: { trigger: label.closest('.guide-section') || label, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      });
      collect('.chip-orbit', scope).forEach(orbit => {
        if (processed.scrub.has(orbit)) return;
        processed.scrub.add(orbit);
        gsap.to(orbit, {
          rotation: 18,
          y: -12,
          ease: 'none',
          scrollTrigger: { trigger: orbit.closest('.compat-checker') || orbit, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      });
    };

    const majorSelector = [
      '.support-heading', '.support-help', '.support-group',
      '.technical-heading', '.technical-toc', '.technical-section',
      '.guide-heading', '.guide-toc', '.guide-section',
      '.gameplay-heading', '.gameplay-gallery', '.project-credits',
      '.section-heading', '.updates-heading', '.release-entry',
      '.community-overview', '.team-heading', '.team-empty',
      '.faq-intro', '.faq-list details',
      '.compat-heading', '.compat-checker', '.compat-results', '.memory-support', '.performance-studio',
      '.news-main', '.discord-card', '.post', '.staff-card', '.credit-item',
      '#hardware-grid > *', '#runtime-grid > *', '#performance-findings > *', '.saved-device-card'
    ].join(', ');

    const lineSelector = [
      '.support-heading', '.technical-heading', '.guide-heading', '.gameplay-heading',
      '.section-heading', '.updates-heading', '.team-heading', '.credits-heading',
      '.faq-intro', '.compat-heading', '.runtime-heading', '.result-heading'
    ].join(', ');

    const listSelector = [
      '.technical-section ul', '.technical-section ol', '.guide-section ul', '.guide-section ol',
      '.review-steps', '.performance-steps', '.page-tabs', '.result-nav'
    ].join(', ');

    const imageSelector = [
      '.gameplay-slide img', '.staff-card img', '.server-icon img', '.credit-apple img', '.saved-phone img'
    ].join(', ');

    const trackedSelector = [
      '.technical-section', '.guide-section', '.release-entry', '.support-group',
      '.compat-checker', '.performance-studio', '.community-overview'
    ].join(', ');

    const enhance = (scope = document) => {
      collect(majorSelector, scope).forEach((element, index) => revealElement(element, index));
      collect('main h1, main h2, main h3', scope).forEach((heading, index) => animateHeading(heading, index));
      collect(lineSelector, scope).forEach(addHeadingLine);
      collect(listSelector, scope).forEach(animateList);
      collect(imageSelector, scope).forEach(animateImage);
      collect(trackedSelector, scope).forEach(trackSection);
      collect('.stats strong, #member-count, #online-count, #staff-count', scope).forEach(animateNumber);
      collect('main details', scope).forEach(setupDetails);
      collect('.technical-toc, .guide-toc, .result-nav', scope).forEach(setupToc);
      setupScrubDetails(scope);
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
          y: desktop ? 58 : 34,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: 0.55 }
        });
        if ($('.home-hero video')) {
          gsap.to('.home-hero video', {
            scale: desktop ? 1.095 : 1.055,
            yPercent: desktop ? 4 : 2,
            ease: 'none',
            scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: 0.65 }
          });
        }
        gsap.to('.hero-overlay', {
          opacity: 0.8,
          ease: 'none',
          scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: 0.7 }
        });
      }

      enhance(document);

      $$('.gameplay-slide img').forEach(image => {
        if (!desktop) return;
        gsap.fromTo(image, { yPercent: -3, scale: 1.045 }, {
          yPercent: 3,
          scale: 1.015,
          ease: 'none',
          scrollTrigger: { trigger: image.closest('.gameplay-slide'), start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        });
      });

      const footer = $('.site-footer');
      if (footer) {
        gsap.fromTo(footer, { y: 28, opacity: 0.55 }, {
          y: 0,
          opacity: 1,
          duration: 0.72,
          ease: 'power3.out',
          scrollTrigger: { trigger: footer, start: 'top 96%', once: true }
        });
      }

      const main = $('main');
      if (main) {
        let refreshTimer = 0;
        const dynamicObserver = new MutationObserver(mutations => {
          let relevant = false;
          for (const mutation of mutations) {
            if (mutation.type === 'childList' || mutation.type === 'characterData' || mutation.attributeName === 'hidden') {
              relevant = true;
              break;
            }
          }
          if (!relevant) return;
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            enhance(main);
            ScrollTrigger.refresh();
          }, 110);
        });
        dynamicObserver.observe(main, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
        disposers.push(() => { clearTimeout(refreshTimer); dynamicObserver.disconnect(); });
      }
    }

    if (finePointer) {
      const magneticTargets = $$('.button, .menu-toggle, .gameplay-prev, .gameplay-next, .gameplay-thumb, .music-footer-control');
      magneticTargets.forEach(target => {
        target.classList.add('motion-magnetic');
        const xTo = gsap.quickTo(target, 'x', { duration: 0.34, ease: 'power3.out' });
        const yTo = gsap.quickTo(target, 'y', { duration: 0.34, ease: 'power3.out' });
        const scaleTo = gsap.quickTo(target, 'scale', { duration: 0.28, ease: 'power3.out' });
        const move = event => {
          const rect = target.getBoundingClientRect();
          xTo((event.clientX - (rect.left + rect.width / 2)) * 0.12);
          yTo((event.clientY - (rect.top + rect.height / 2)) * 0.12);
          scaleTo(1.018);
        };
        const leave = () => { xTo(0); yTo(0); scaleTo(1); };
        target.addEventListener('pointermove', move);
        target.addEventListener('pointerleave', leave);
        disposers.push(() => { target.removeEventListener('pointermove', move); target.removeEventListener('pointerleave', leave); });
      });

      const liftTargets = $$('.post, .discord-card, .staff-card, .credit-item, .release-entry, .support-group, .community-overview, .team-empty, .news-main, .guide-policy, .guide-caution, .memory-support');
      liftTargets.forEach(card => {
        card.classList.add('motion-lift');
        const enter = () => gsap.to(card, { y: -5, duration: 0.32, ease: 'power2.out', overwrite: true });
        const leave = () => gsap.to(card, { y: 0, duration: 0.42, ease: 'power3.out', overwrite: true });
        card.addEventListener('pointerenter', enter);
        card.addEventListener('pointerleave', leave);
        disposers.push(() => { card.removeEventListener('pointerenter', enter); card.removeEventListener('pointerleave', leave); });
      });
    }

    $$('.desktop-nav a, .subtle-link, .post > a, .staff-card a, .site-footer a, .home-explore, .guide-inline, .technical-toc a, .guide-toc a').forEach(link => link.classList.add('motion-link'));

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
    const onPageShow = () => { body.classList.remove('motion-page-leaving'); updateLock(); delayedRefresh(); };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      disposers.forEach(dispose => dispose());
      document.removeEventListener('click', onNavigate);
      document.removeEventListener('toggle', delayedRefresh, true);
      window.removeEventListener('pageshow', onPageShow);
      lockObserver.disconnect();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      progress.remove();
      root.style.removeProperty('--scroll-progress');
      root.classList.remove('motion-ready');
      body.classList.remove('motion-page-leaving');
    };
  });
})();
