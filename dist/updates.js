(() => {
  const api = '/api/updates';
  // The Cloudinary URL supplied for the 27 Oct thumbnail currently fails to
  // resolve in Safari. Use a reachable mirror of the same GTA V artwork.
  const latest27OctThumbnail = 'https://images8.alphacoders.com/543/543379.jpg';
  const latest27OctFallback = 'https://cdn.mos.cms.futurecdn.net/v2/t%3A90%2Cl%3A0%2Ccw%3A2880%2Cch%3A1620%2Cq%3A80%2Cw%3A2560/iSybeeHJC96izazJfb6PpA.jpg';
  const heading = document.querySelector('.updates-heading');
  if (!heading) return;

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'managed-updates.css?v=20261028thumbfix2';
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

  // Build nodes directly so release text cannot inject HTML or executable URLs.
  function inline(value) {
    const fragment = document.createDocumentFragment();
    const plain = text => document.createTextNode(text.replace(/\*\*/g, ''));
    const pattern = /(`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
    let offset = 0;
    for (const match of String(value).matchAll(pattern)) {
      fragment.append(plain(value.slice(offset, match.index)));
      const node = document.createElement(match[2] ? 'code' : match[3] ? 'strong' : 'a');
      node.textContent = match[2] || match[3] || match[4];
      if (match[5]) {
        node.href = match[5];
        node.target = '_blank';
        node.rel = 'noopener noreferrer';
      }
      fragment.append(node);
      offset = match.index + match[0].length;
    }
    fragment.append(plain(value.slice(offset)));
    return fragment;
  }

  function paragraphs(value) {
    const fragment = document.createDocumentFragment();
    let list = null;
    escapeText(value).replace(/\r\n?/g, '\n').split('\n').forEach(raw => {
      const line = raw.trim();
      if (!line) { list = null; return; }
      const heading = line.match(/^#{1,6}\s+(.+)$/) || line.match(/^\*\*(.+?)\*\*:?$/);
      const bullet = line.match(/^(?:[-*•]\s+|\d+[.)]\s+)(.+)$/);
      // Emoji-led release instructions are individual steps, not one dense paragraph.
      const step = line.match(/^(?:[\u{1F100}-\u{1FAFF}\u2600-\u27BF]\uFE0F?\s*)(.+)$/u);
      if (heading) {
        list = null;
        const h = document.createElement('h4');
        h.append(inline(heading[1]));
        fragment.append(h);
      } else if (bullet || step) {
        const tag = /^\d+[.)]\s/.test(line) ? 'ol' : 'ul';
        if (!list || list.tagName.toLowerCase() !== tag) {
          list = document.createElement(tag);
          fragment.append(list);
        }
        const li = document.createElement('li');
        li.append(inline(bullet ? bullet[1] : step[1]));
        list.append(li);
      } else {
        list = null;
        const p = document.createElement('p');
        p.append(inline(line));
        fragment.append(p);
      }
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
        const summary = document.createElement('div');
        summary.className = 'managed-update-summary';
        summary.append(paragraphs(item.summary));
        card.append(summary);
      }

      const imageUrl = item.releaseDate === '2026-10-27' ? latest27OctThumbnail : item.imageUrl;
      if (imageUrl) {
        const image = document.createElement('img');
        image.className = 'managed-update-image';
        image.src = imageUrl;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.referrerPolicy = 'no-referrer';
        let usedFallback = false;
        image.addEventListener('error', () => {
          if (item.releaseDate === '2026-10-27' && !usedFallback) {
            usedFallback = true;
            image.src = latest27OctFallback;
            return;
          }
          // Never leave Safari's large broken-image placeholder in the card.
          image.remove();
        });
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
