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
  ['wheel', 'touchstart'].forEach(type => window.addEventListener(type, () => {interacted = true;}, {passive: true}));
  window.addEventListener('scroll', () => {if (scrollY > 20) interacted = true;checkEnd();}, {passive: true});
  window.addEventListener('keydown', event => {
    if (event.key === 'Enter') {event.preventDefault();enter();}
    if (['ArrowDown','PageDown','End',' '].includes(event.key)) interacted = true;
  });
  window.addEventListener('pageshow', () => {entering = false;document.body.classList.remove('leaving');});
})();
