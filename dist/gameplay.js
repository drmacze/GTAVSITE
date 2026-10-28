(() => {
  const track = document.querySelector('#gameplay-track');
  if (!track) return;
  const slides = [...track.querySelectorAll('.gameplay-slide')];
  const thumbs = [...document.querySelectorAll('.gameplay-thumb')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let frame = 0;
  function update(index) {
    current = index;
    thumbs.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    document.querySelector('#gameplay-current').textContent = String(index + 1).padStart(2, '0');
    slides.forEach((slide, i) => {
      if ('inert' in slide) slide.inert = i !== index;
    });
  }
  function goTo(index) {
    const next = (index + slides.length) % slides.length;
    track.scrollTo({left: slides[next].offsetLeft - slides[0].offsetLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    update(next);
  }
  thumbs.forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.shot))));
  document.querySelector('.gameplay-prev').addEventListener('click', () => goTo(current - 1));
  document.querySelector('.gameplay-next').addEventListener('click', () => goTo(current + 1));
  track.addEventListener('keydown', event => {
    const keys = {ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1};
    if (!(event.key in keys)) return;
    event.preventDefault();
    goTo(keys[event.key]);
  });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / slides[0].getBoundingClientRect().width)));
      update(index);
    });
  }, {passive: true});
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    track.scrollTo({left: slides[current].offsetLeft - slides[0].offsetLeft, behavior: 'instant'});
  }).observe(track);
  update(0);
})();
