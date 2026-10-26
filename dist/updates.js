(() => {
  const entries = [...document.querySelectorAll('.release-entry')];
  const links = [...document.querySelectorAll('.release-jump a')];
  const collapse = document.querySelector('#release-collapse');
  if (!entries.length || !collapse) return;
  function markCurrent(id) {
    links.forEach(link => {
      if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function openHash() {
    const entry = entries.find(item => '#' + item.id === location.hash);
    if (!entry) return;
    entry.querySelector('details').open = true;
    markCurrent(entry.id);
  }
  links.forEach(link => link.addEventListener('click', () => {
    const entry = entries.find(item => '#' + item.id === link.hash);
    if (entry) {
      entry.querySelector('details').open = true;
      markCurrent(entry.id);
    }
  }));
  function updateCollapse() {
    collapse.hidden = !entries.some(entry => entry.querySelector('details').open);
  }
  entries.forEach(entry => entry.querySelector('details').addEventListener('toggle', () => {
    if (entry.querySelector('details').open) markCurrent(entry.id);
    updateCollapse();
  }));
  collapse.addEventListener('click', () => {
    entries.forEach(entry => { entry.querySelector('details').open = false; });
    updateCollapse();
    links[0].focus({preventScroll: true});
  });
  window.addEventListener('hashchange', openHash);
  openHash();
  updateCollapse();
})();
