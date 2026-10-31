(() => {
  const track = document.querySelector('#gameplay-track');
  if (!track) return;

  const section = track.closest('.gameplay-section');
  const slides = [...track.querySelectorAll('.gameplay-slide')];
  const thumbs = [...document.querySelectorAll('.gameplay-thumb')];
  const images = slides.map(slide => slide.querySelector('img')).filter(Boolean);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const currentLabel = document.querySelector('#gameplay-current');
  const prev = document.querySelector('.gameplay-prev');
  const next = document.querySelector('.gameplay-next');

  let current = 0;
  let scrollFrame = 0;
  let animationFrame = 0;
  let resizeFrame = 0;
  let programmatic = false;
  let lastWidth = track.getBoundingClientRect().width;

  function update(index) {
    current = index;
    thumbs.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    if (currentLabel) currentLabel.textContent = String(index + 1).padStart(2, '0');
    slides.forEach((slide, i) => {
      if ('inert' in slide) slide.inert = i !== index;
    });
  }

  function targetLeft(index) {
    return slides[index].offsetLeft - slides[0].offsetLeft;
  }

  function stopAnimation() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    programmatic = false;
    track.removeAttribute('data-programmatic');
  }

  function finishAt(index) {
    track.scrollLeft = targetLeft(index);
    stopAnimation();
    update(index);
  }

  function goTo(index) {
    const targetIndex = (index + slides.length) % slides.length;
    const start = track.scrollLeft;
    const destination = targetLeft(targetIndex);
    const distance = destination - start;

    stopAnimation();
    if (reducedMotion.matches || Math.abs(distance) < 2) {
      finishAt(targetIndex);
      return;
    }

    programmatic = true;
    track.setAttribute('data-programmatic', 'true');
    const started = performance.now();
    const duration = Math.min(320, Math.max(220, Math.abs(distance) * 0.22));

    const tick = now => {
      if (!programmatic) return;
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      track.scrollLeft = start + distance * eased;
      if (progress < 1) animationFrame = requestAnimationFrame(tick);
      else finishAt(targetIndex);
    };
    animationFrame = requestAnimationFrame(tick);
  }

  function warmGameplayImages() {
    images.forEach(img => {
      img.loading = 'eager';
      img.decoding = 'async';
      if (typeof img.decode === 'function') img.decode().catch(() => {});
    });
  }

  if ('IntersectionObserver' in window && section) {
    const preloadObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      warmGameplayImages();
      preloadObserver.disconnect();
    }, {rootMargin: '600px 0px 600px 0px', threshold: 0});
    preloadObserver.observe(section);
  } else {
    warmGameplayImages();
  }

  thumbs.forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.shot))));
  prev?.addEventListener('click', () => goTo(current - 1));
  next?.addEventListener('click', () => goTo(current + 1));

  track.addEventListener('keydown', event => {
    const keys = {ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1};
    if (!(event.key in keys)) return;
    event.preventDefault();
    goTo(keys[event.key]);
  });

  const cancelForUserInput = () => {
    if (programmatic) stopAnimation();
  };
  track.addEventListener('pointerdown', cancelForUserInput, {passive: true});
  track.addEventListener('touchstart', cancelForUserInput, {passive: true});
  track.addEventListener('wheel', cancelForUserInput, {passive: true});

  track.addEventListener('scroll', () => {
    if (programmatic) return;
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const width = slides[0]?.getBoundingClientRect().width || 1;
      const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / width)));
      if (index !== current) update(index);
    });
  }, {passive: true});

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width || track.getBoundingClientRect().width;
      if (Math.abs(width - lastWidth) < 1) return;
      lastWidth = width;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (!programmatic) track.scrollLeft = targetLeft(current);
      });
    });
    resizeObserver.observe(track);
    window.addEventListener('pagehide', () => resizeObserver.disconnect(), {once: true});
  }

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(resizeFrame);
  }, {once: true});

  update(0);
})();
