(() => {
  if (!document.querySelector('.welcome-page')) return;

  let entering = false;
  let touchStartY = null;

  function safeReturnTarget() {
    const params = new URL(location.href).searchParams;
    const raw = params.get('return');
    if (!raw) return '';
    try {
      const target = new URL(raw, location.origin);
      if (target.origin !== location.origin) return '';
      if (target.pathname.includes('release-publisher-8c2f71d4')) return '';
      const value = target.pathname + target.search + target.hash;
      try { sessionStorage.setItem('gtav-onboarding-return', value); } catch {}
      return value;
    } catch {
      return '';
    }
  }

  function enter() {
    if (entering) return;
    entering = true;
    document.body.setAttribute('aria-busy', 'true');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const returnTarget = safeReturnTarget();
    const next = '/home.html?intro=1' + (returnTarget ? '&return=' + encodeURIComponent(returnTarget) : '');
    try { sessionStorage.setItem('gtav-onboarding-transit', '1'); } catch {}
    setTimeout(() => location.assign(next), reduced ? 0 : 120);
  }

  // Desktop wheel/trackpad: a deliberate downward scroll immediately continues.
  window.addEventListener('wheel', event => {
    if (event.deltaY > 12) enter();
  }, {passive: true});

  // iPhone/iPad: detect the swipe itself instead of waiting for Safari scrollY.
  window.addEventListener('touchstart', event => {
    touchStartY = event.touches?.[0]?.clientY ?? null;
  }, {passive: true});

  window.addEventListener('touchend', event => {
    if (touchStartY == null) return;
    const endY = event.changedTouches?.[0]?.clientY ?? touchStartY;
    const distance = touchStartY - endY;
    touchStartY = null;
    if (distance >= 42) enter();
  }, {passive: true});

  window.addEventListener('touchcancel', () => {
    touchStartY = null;
  }, {passive: true});

  window.addEventListener('keydown', event => {
    if (['Enter', 'ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) {
      event.preventDefault();
      enter();
    }
  });

  window.addEventListener('pageshow', () => {
    entering = false;
    touchStartY = null;
    document.body.classList.remove('leaving');
    document.body.removeAttribute('aria-busy');
  });

  const signal = document.getElementById('visit-signal');
  const countNode = document.getElementById('visit-count');
  if (!signal || !countNode) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatter = new Intl.NumberFormat('en-US');

  function renderCount(value) {
    countNode.textContent = formatter.format(Math.max(0, Math.round(value)));
  }

  function animateCount(target) {
    if (reducedMotion || target <= 1) {
      renderCount(target);
      return;
    }

    const startValue = target > 999 ? Math.floor(target * 0.84) : 0;
    const duration = Math.min(1650, 760 + Math.log10(target + 1) * 210);
    const startedAt = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      renderCount(startValue + (target - startValue) * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  async function syncVisitCount() {
    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {Accept: 'application/json'},
        credentials: 'same-origin',
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`Visit counter responded ${response.status}`);
      const data = await response.json();
      const total = Number(data.visits);
      if (!Number.isFinite(total) || total < 0) throw new Error('Invalid visit count');

      signal.dataset.state = 'ready';
      animateCount(total);
      signal.classList.remove('visit-flash');
      requestAnimationFrame(() => signal.classList.add('visit-flash'));
      setTimeout(() => signal.classList.remove('visit-flash'), 700);
    } catch (error) {
      signal.dataset.state = 'error';
      countNode.textContent = '—';
      console.warn('Visit counter unavailable:', error);
    }
  }

  setTimeout(syncVisitCount, 280);
})();
