(() => {
  const api = '/api/updates';
  const heading = document.querySelector('.updates-heading');
  if (!heading) return;

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'managed-updates.css?v=20261027a';
  document.head.append(css);

  const shell = document.createElement('section');
  shell.className = 'managed-updates';
  shell.setAttribute('aria-label', 'Latest published updates');
  shell.hidden = true;
  heading.insertAdjacentElement('afterend', shell);

  const escapeText = value => String(value ?? '');
  const formatDate = date => {
    const parsed = new Date(`${date}T12:00:00`);
    return Number.isNaN(parsed.valueOf()) ? date : new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
  };

  function paragraphs(body) {
    const fragment = document.createDocumentFragment();
    escapeText(body).split(/\n{2,}/).map(value => value.trim()).filter(Boolean).forEach(text => {
      const p = document.createElement('p');
      p.textContent = text;
      fragment.append(p);
    });
    return fragment;
  }

  function render(items) {
    if (!items.length) return;
    shell.hidden = false;
    shell.replaceChildren();
    const titleRow = document.createElement('div');
    titleRow.className = 'managed-updates-heading';
    titleRow.innerHTML = '<div><span>LIVE RELEASE FEED</span><h2>Latest update</h2></div>';
    shell.append(titleRow);

    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'managed-update-card';
      if (index === 0) card.classList.add('is-latest');

      const meta = document.createElement('div');
      meta.className = 'managed-update-meta';
      const category = document.createElement('span');
      category.className = 'managed-update-category';
      category.textContent = item.category || 'Update';
      meta.append(category);
      if (index === 0) {
        const badge = document.createElement('span');
        badge.className = 'managed-update-new';
        badge.textContent = 'NEW';
        meta.append(badge);
      }
      const date = document.createElement('time');
      date.dateTime = item.releaseDate;
      date.textContent = formatDate(item.releaseDate);
      meta.append(date);

      const h3 = document.createElement('h3');
      h3.textContent = item.title;
      card.append(meta, h3);

      if (item.version) {
        const version = document.createElement('div');
        version.className = 'managed-update-version';
        version.textContent = item.version;
        card.append(version);
      }
      if (item.summary) {
        const summary = document.createElement('p');
        summary.className = 'managed-update-summary';
        summary.textContent = item.summary;
        card.append(summary);
      }
      if (item.imageUrl) {
        const image = document.createElement('img');
        image.className = 'managed-update-image';
        image.src = item.imageUrl;
        image.alt = '';
        image.loading = 'lazy';
        card.append(image);
      }
      if (item.body) {
        const details = document.createElement('details');
        details.className = 'managed-update-details';
        if (index === 0) details.open = true;
        const summary = document.createElement('summary');
        summary.textContent = 'Release details';
        const body = document.createElement('div');
        body.className = 'managed-update-body';
        body.append(paragraphs(item.body));
        details.append(summary, body);
        card.append(details);
      }
      if (item.downloadUrl) {
        const link = document.createElement('a');
        link.className = 'button outline compact managed-update-download';
        link.href = item.downloadUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open download';
        card.append(link);
      }
      shell.append(card);
    });
  }

  fetch(api, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('updates_unavailable')))
    .then(data => render(Array.isArray(data.updates) ? data.updates : []))
    .catch(() => {});

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
    links[0]?.focus({preventScroll: true});
  });
  window.addEventListener('hashchange', openHash);
  openHash();
  updateCollapse();
})();
