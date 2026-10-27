(() => {
  if (!document.querySelector('.welcome-page')) return;

  let entering = false;
  let interacted = false;

  // Warm the next page while the welcome scene is visible. Using the
  // extensionless Pages URL avoids the home.html -> /home redirect hop.
  const warmHome = () => {
    if (window.__gtavHomeWarmed) return;
    window.__gtavHomeWarmed = true;
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/home?intro=1';
      link.as = 'document';
      document.head.append(link);
    } catch {}
    // A low-priority same-origin fetch also warms browsers that ignore
    // document prefetch. It never blocks the welcome experience.
    try {
      fetch('/home?intro=1', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'force-cache',
        priority: 'low'
      }).catch(() => {});
    } catch {}
  };

  if (document.readyState === 'complete') {
    setTimeout(warmHome, 0);
  } else {
    window.addEventListener('load', () => setTimeout(warmHome, 0), { once: true });
  }

  function enter() {
    if (entering) return;
    entering = true;
    // Keep the welcome scene visible until the new document commits. The old
    // fade-to-white transition made a normal navigation delay look like a
    // frozen blank page on iOS in-app browsers.
    location.assign('/home?intro=1');
  }

  function checkEnd() {
    const end = document.documentElement.scrollHeight - innerHeight;
    if (interacted && end > 50 && scrollY >= end - 10) enter();
  }

  ['wheel', 'touchstart'].forEach(type => {
    window.addEventListener(type, () => {
      interacted = true;
      warmHome();
    }, {passive: true});
  });

  window.addEventListener('scroll', () => {
    if (scrollY > 20) interacted = true;
    checkEnd();
  }, {passive: true});

  window.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      enter();
    }
    if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) interacted = true;
  });

  window.addEventListener('pageshow', () => {
    entering = false;
    document.body.classList.remove('leaving');
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
