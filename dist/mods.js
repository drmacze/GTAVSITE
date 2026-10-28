(() => {
  const picker = document.querySelector('.language-picker');
  if (!picker) return;
  const summary = picker.querySelector('summary');
  const content = picker.querySelector('.language-options');
  let animation;
  summary.addEventListener('click', event => {
    event.preventDefault();
    if (animation) return;
    const opening = !picker.open;
    if (opening) picker.open = true;
    const height = content.scrollHeight;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { picker.open = opening; return; }
    animation = content.animate(opening ? [{height:'0px',opacity:0},{height:height+'px',opacity:1}] : [{height:height+'px',opacity:1},{height:'0px',opacity:0}], {duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
    animation.onfinish = () => { picker.open = opening; animation = null; };
  });
})();
