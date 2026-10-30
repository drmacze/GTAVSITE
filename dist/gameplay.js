(() => {
  const track = document.querySelector('#gameplay-track');
  if (!track) return;
  const slides = [...track.querySelectorAll('.gameplay-slide')];
  const thumbs = [...document.querySelectorAll('.gameplay-thumb')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ua = navigator.userAgent || '';
  const isiOSSafari = /iP(?:hone|ad|od)/i.test(ua) && /WebKit/i.test(ua) && !/(?:CriOS|FxiOS|EdgiOS|OPiOS)/i.test(ua);
  let current = 0;
  let frame = 0;
  let switchTimer = 0;
  let switching = false;

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

  function settleIOS(next) {
    if (switching) return;
    switching = true;
    clearTimeout(switchTimer);
    track.classList.add('is-switching');
    switchTimer = setTimeout(() => {
      track.scrollTo({left: targetLeft(next), behavior: 'instant'});
      update(next);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        track.classList.remove('is-switching');
        switchTimer = setTimeout(() => { switching = false; }, 150);
      }));
    }, 90);
  }

  function goTo(index) {
    const next = (index + slides.length) % slides.length;
    if (isiOSSafari && !reducedMotion.matches) {
      settleIOS(next);
      return;
    }
    track.scrollTo({left: targetLeft(next), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
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
      update(index);
    });
  }, {passive: true});
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    track.scrollTo({left: targetLeft(current), behavior: 'instant'});
  }).observe(track);
  window.addEventListener('pagehide', () => clearTimeout(switchTimer), {once: true});
  update(0);
})();
