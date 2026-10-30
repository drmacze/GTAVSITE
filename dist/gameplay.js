(() => {
  const track = document.querySelector('#gameplay-track');
  if (!track) return;
  const slides = [...track.querySelectorAll('.gameplay-slide')];
  const thumbs = [...document.querySelectorAll('.gameplay-thumb')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ua = navigator.userAgent || '';
  const isiOSWebKit = /iP(?:hone|ad|od)/i.test(ua) && /WebKit/i.test(ua);
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

  function targetLeft(index) {
    return slides[index].offsetLeft - slides[0].offsetLeft;
  }

  function goTo(index) {
    const next = (index + slides.length) % slides.length;
    const behavior = (isiOSWebKit || reducedMotion.matches) ? 'instant' : 'smooth';
    track.scrollTo({left: targetLeft(next), behavior});
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
      const width = slides[0].getBoundingClientRect().width || 1;
      const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / width)));
      if (index !== current) update(index);
    });
  }, {passive: true});
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    track.scrollTo({left: targetLeft(current), behavior: 'instant'});
  }).observe(track);
  update(0);
})();
