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
      const cleanPath = (target.pathname || '/').replace(/\/+$/, '') || '/';
      const isHome = cleanPath.endsWith('/home') || cleanPath.endsWith('/home.html');
      const isWelcome = cleanPath === '/' || cleanPath.endsWith('/index.html');
      const invalid = target.origin !== location.origin || isHome || isWelcome || target.pathname.includes('release-publisher-8c2f71d4') || target.searchParams.has('return');
      if (invalid) {
        try { sessionStorage.removeItem('gtav-onboarding-return'); } catch {}
        return '';
      }
      const value = target.pathname + target.search + target.hash;
      try { sessionStorage.setItem('gtav-onboarding-return', value); } catch {}
      return value;
    } catch {
      try { sessionStorage.removeItem('gtav-onboarding-return'); } catch {}
      return '';
    }
  }

  function enter() {
    if (entering || window.__gtavWelcomeNavigating) return;
    entering = true;
    window.__gtavWelcomeNavigating = true;
    document.body.setAttribute('aria-busy', 'true');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const returnTarget = safeReturnTarget();
    const next = '/home?intro=1' + (returnTarget ? '&return=' + encodeURIComponent(returnTarget) : '') + '#onboarding';
    try {
      sessionStorage.setItem('gtav-onboarding-transit', String(Date.now()));
      sessionStorage.setItem('gtav-welcome-seen', '1');
      document.cookie = 'gtav-onboarding-transit=1; Max-Age=30; Path=/; SameSite=Lax; Secure';
    } catch {}
    setTimeout(() => location.replace(next), reduced ? 0 : 80);
  }

  window.addEventListener('wheel', event => {
    if (event.deltaY > 12) enter();
  }, {passive: true});

  window.addEventListener('touchstart', event => {
    if (event.touches?.length !== 1) {
      touchStartY = null;
      return;
    }
    touchStartY = event.touches[0].clientY;
  }, {passive: true});

  window.addEventListener('touchmove', event => {
    if (entering || window.__gtavWelcomeNavigating || touchStartY == null || event.touches?.length !== 1) return;
    const currentY = event.touches[0].clientY;
    const distance = touchStartY - currentY;
    if (Math.abs(distance) > 6 && event.cancelable) event.preventDefault();
    if (distance >= 28) {
      touchStartY = null;
      enter();
    }
  }, {passive: false});

  window.addEventListener('touchend', event => {
    if (entering || window.__gtavWelcomeNavigating || touchStartY == null) return;
    const endY = event.changedTouches?.[0]?.clientY ?? touchStartY;
    const distance = touchStartY - endY;
    touchStartY = null;
    if (distance >= 24) enter();
  }, {passive: true});

  window.addEventListener('touchcancel', () => {
    touchStartY = null;
  }, {passive: true});

  const hint = document.querySelector('.welcome-hint');
  if (hint) hint.addEventListener('click', enter);

  window.addEventListener('keydown', event => {
    if (['Enter', 'ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) {
      event.preventDefault();
      enter();
    }
  });

  window.addEventListener('pageshow', event => {
    entering = false;
    window.__gtavWelcomeNavigating = false;
    touchStartY = null;
    document.body.classList.remove('leaving');
    document.body.removeAttribute('aria-busy');
    if (event.persisted) {
      try { sessionStorage.setItem('gtav-welcome-seen', '1'); } catch {}
    }
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
