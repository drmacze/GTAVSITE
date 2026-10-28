(() => {
  const picker = document.querySelector('.language-picker');
  if (picker) {
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
  }

  const loadConverter = () => {
    if (document.querySelector('script[data-mod-converter]')) return;
    if (!document.querySelector('link[data-mod-converter]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/mod-converter.css?v=20261028launcher1';
      css.dataset.modConverter = '1';
      document.head.append(css);
    }
    const script = document.createElement('script');
    script.src = '/mod-converter.js?v=20261028launcher1';
    script.defer = true;
    script.dataset.modConverter = '1';
    document.head.append(script);
  };

  if ('requestIdleCallback' in window) requestIdleCallback(loadConverter, {timeout:1200});
  else setTimeout(loadConverter, 350);
})();
