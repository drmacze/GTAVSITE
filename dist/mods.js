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

  // The converter is a primary Mods feature. Load it immediately after the
  // deferred Mods script runs instead of waiting for requestIdleCallback,
  // which can be delayed indefinitely on iOS Safari under load.
  if (!document.querySelector('link[data-mod-converter]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/mod-converter.css?v=20261028launcher2';
    css.dataset.modConverter = '1';
    document.head.append(css);
  }

  if (!document.querySelector('script[data-mod-converter]')) {
    const script = document.createElement('script');
    script.src = '/mod-converter.js?v=20261028launcher2';
    script.async = true;
    script.dataset.modConverter = '1';
    script.onerror = () => {
      console.error('Mod converter failed to load.');
      const anchor = document.querySelector('.mods-languages');
      if (anchor && !document.querySelector('#mod-converter-load-error')) {
        const notice = document.createElement('section');
        notice.id = 'mod-converter-load-error';
        notice.className = 'mod-converter-load-error';
        notice.innerHTML = '<span class="eyebrow">LAUNCHER TOOL</span><h2>Mod converter</h2><p>The converter could not be loaded. Reload this page and try again.</p>';
        anchor.insertAdjacentElement('beforebegin', notice);
      }
    };
    document.head.append(script);
  }
})();
