(() => {
  if (!document.querySelector('.welcome-page')) return;

  let entering = false;
  let interacted = false;

  function enter() {
    if (entering) return;
    entering = true;
    document.body.classList.add('leaving');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => location.assign('home.html?intro=1'), reduced ? 0 : 250);
  }

  function checkEnd() {
    const end = document.documentElement.scrollHeight - innerHeight;
    if (interacted && end > 50 && scrollY >= end - 10) enter();
  }

  ['wheel', 'touchstart'].forEach(type => {
    window.addEventListener(type, () => {
      interacted = true;
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
