(() => {
  if (window.__updatesLatest29) return;
  window.__updatesLatest29 = true;

  const api = '/api/updates';
  const heading = document.querySelector('.updates-heading');
  if (!heading) return;

  const cleanupLegacyShells = () => {
    document.querySelectorAll('.managed-updates:not(.latest-release-29)').forEach(node => node.remove());
  };
  cleanupLegacyShells();
  const legacyObserver = new MutationObserver(cleanupLegacyShells);
  legacyObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('pagehide', () => legacyObserver.disconnect(), { once: true });

  const featured29 = {
    category: 'Latest release',
    releaseDate: '2026-10-29',
    title: 'GTA V for iPhone, iPad & Mac: 29 Oct update, GTA Online',
    version: '29 Oct build',
    summary: 'GTA Online arrives in the launcher with custom characters, jobs, peer-to-peer sessions for up to 32 players, session codes, Nearby discovery, new controls, and fixes.',
    body: `**GTA Online**
- **Your own Online character:** the creator opens the first time, with heritage, facial features, hair, clothing by shop name, and supported DLC-pack clothing.
- **Free roam:** play without the story and use the trainer for everything.
- **Jobs:** GTA Online races, deathmatches, survivals, and contact missions are under Trainer › GTA Online › Jobs.
- **Sessions with friends:** up to 32 players. Sessions run on the players' own devices, with no project-hosted game servers.
- **Play with friends anywhere:** the host creates a session and shares its code from Trainer › GTA Online. Friends choose ENTER CODE under Join.
- **Nearby:** on the same Wi-Fi, available sessions can also appear under Nearby.
- **Host-led jobs:** when the host starts a job in a session, everyone in that session goes with the host.

**Also new**
- **Trainer:** car upgrades can be changed one by one.
- **Touch controls:** adjust touch-button opacity in Launcher › HUD & Controls.
- **Pause map:** pinch to zoom.
- **Add-on car audio:** vehicles without working custom sound use a stock-car sound from the matching class.
- **Launcher startup:** the launcher opens at every start.

**Fixes**
- Fixed a crash when changing clothes with DLC packs installed.
- Fixed a respawn loop after a vehicle is destroyed during a race.
- Mod-import error messages can now be read in full.

**Connection notes**
- Some mobile networks block direct peer-to-peer connections. If a friend cannot connect, try Wi-Fi or enable UPnP on the host router.
- Allow Local Network access when iOS asks, otherwise Nearby discovery may not work.

**Privacy**
- The app counts plays anonymously using device model, chip, and system version. The release notes state that names and accounts are not collected for this count.

**How to update**
- Your existing saves and mods stay as they are. Install the new build over the current installation.
- **iPhone / iPad:** sign and install GTAV-unsigned.ipa as before.
- **Mac:** unzip GTAV-mac.zip and open the app.`,
    downloads: [
      { label: 'Download iOS', meta: 'iPhone & iPad', url: 'https://gofile.io/d/aA176fns' },
      { label: 'Download MacOS', meta: 'Apple silicon', url: 'https://gofile.io/d/MO6xjKqm' }
    ]
  };

  const archive28 = {
    category: 'Previous release',
    releaseDate: '2026-10-28',
    title: 'GTA V for iPhone, iPad & Mac: 28 Oct update',
    version: '28 Oct build',
    summary: 'GTA Online DLC Packs 1–4 for story mode, a launcher-first Mac flow, expanded trainer support, and new iOS / macOS builds.',
    body: `**GTA Online DLC Packs 1–4**
- All 31 GTA Online updates for story mode, from Festive Surprise 2014 through The Criminal Enterprises: 436 vehicles, their weapons, clothing and tattoos for the online characters.
- Four downloads by release date: DLC Pack 1 (2014–2016), Pack 2 (2016–2018), Pack 3 (2018–2020), and Pack 4 (2020–2022), around 1.7–2 GB each.
- Use one IMPORT MOD per pack in the launcher's MODS tab. Every update then appears separately so you can switch off what you do not want.
- DLC vehicles now remain in story mode and the trainer's All weapons option includes their weapons.
- The game loads 32 add-on packs at most; all four DLC packs use 31. On 4 GB devices, keep only a few updates enabled.

**Mac**
- The launcher opens first, as on iPhone, with presets, every graphics setting, MODS with IMPORT MOD, and save management. Hold Option while the game opens if you previously disabled it.
- Trainer: ⌘T or F4 in game. With a controller, use View in the pause menu.
- Exit Game in the pause menu returns to the launcher.

**How to update**
- iPhone / iPad: sign and install the new GTAV-unsigned.ipa. Existing data, saves and mods stay.
- Mac: unzip GTAV-mac.zip and open GTA V.app.
- New install, or skipped 18 Oct? Set up GTAV_patch and movies.zip from the 22 Oct download once.

**Problems?**
Send the entire GTA V › Logs folder. On Mac use ~/Library/Logs/GTA5 and mention that you are on the 28 Oct build.`,
    downloads: [
      { label: 'Download iOS', meta: 'iPhone & iPad', url: 'https://gofile.io/d/ZtMFRLJE' },
      { label: 'Download MacOS', meta: 'Apple silicon', url: 'https://gofile.io/d/rBYaPK8L' }
    ]
  };

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'managed-updates.css?v=20261030latest29';
  document.head.append(css);

  document.querySelector('.release-list > #release-2026-10-29')?.remove();

  const shell = document.createElement('section');
  shell.className = 'managed-updates latest-release-29';
  shell.setAttribute('aria-label', 'Latest published update');
  heading.insertAdjacentElement('afterend', shell);

  const escapeText = value => String(value ?? '');
  const formatDate = date => {
    const parsed = new Date(`${date}T12:00:00`);
    return Number.isNaN(parsed.valueOf()) ? date : new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
  };
  const cleanPreview = value => escapeText(value)
    .replace(/[`*_#]/g, '')
    .replace(/\[[^\]]+\]\([^)]*\)/g, '')
    .replace(/^[-•]\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

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
      const subheading = line.match(/^#{1,6}\s+(.+)$/) || line.match(/^\*\*(.+?)\*\*:?$/);
      const bullet = line.match(/^(?:[-*•]\s+|\d+[.)]\s+)(.+)$/);
      const step = line.match(/^(?:[\u{1F100}-\u{1FAFF}\u2600-\u27BF]\uFE0F?\s*)(.+)$/u);
      if (subheading) {
        list = null;
        const h = document.createElement('h4');
        h.append(inline(subheading[1]));
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

  function renderFeatured(item) {
    shell.replaceChildren();
    const titleRow = document.createElement('div');
    titleRow.className = 'managed-updates-heading';
    titleRow.innerHTML = '<div><span>LIVE RELEASE FEED</span><h2>Latest update</h2></div>';
    shell.append(titleRow);

    const card = document.createElement('article');
    card.className = 'managed-update-card is-latest';
    card.id = `release-${item.releaseDate}`;

    const meta = document.createElement('div');
    meta.className = 'managed-update-meta';
    const category = document.createElement('span');
    category.className = 'managed-update-category';
    category.textContent = item.category;
    const badge = document.createElement('span');
    badge.className = 'managed-update-new';
    badge.textContent = 'NEW';
    const date = document.createElement('time');
    date.dateTime = item.releaseDate;
    date.textContent = formatDate(item.releaseDate);
    meta.append(category, badge, date);

    const h3 = document.createElement('h3');
    h3.textContent = item.title;
    card.append(meta, h3);

    const version = document.createElement('div');
    version.className = 'managed-update-version';
    version.textContent = item.version;
    card.append(version);

    const summary = document.createElement('div');
    summary.className = 'managed-update-summary';
    summary.append(paragraphs(item.summary));
    card.append(summary);

    if (item.imageUrl) {
      const image = document.createElement('img');
      image.className = 'managed-update-image';
      image.src = item.imageUrl;
      image.alt = item.title;
      image.loading = 'eager';
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', () => image.remove(), { once: true });
      card.append(image);
    }

    const details = document.createElement('details');
    details.className = 'managed-update-details';
    details.open = true;
    const detailsSummary = document.createElement('summary');
    detailsSummary.textContent = 'Release details';
    const body = document.createElement('div');
    body.className = 'managed-update-body';
    body.append(paragraphs(item.body));
    details.append(detailsSummary, body);
    card.append(details);

    const downloads = document.createElement('div');
    downloads.className = 'managed-update-downloads';
    item.downloads.forEach(download => {
      const link = document.createElement('a');
      link.className = 'button outline compact managed-update-download';
      link.href = download.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const span = document.createElement('span');
      const small = document.createElement('small');
      small.textContent = download.meta;
      span.append(small, document.createTextNode(download.label));
      link.append(span);
      downloads.append(link);
    });
    card.append(downloads);
    shell.append(card);
  }

  function ensureJumpLink(id, label) {
    const jump = document.querySelector('.release-jump');
    if (!jump) return null;
    [...jump.querySelectorAll(`a[href="#${id}"]`)].slice(1).forEach(node => node.remove());
    let link = jump.querySelector(`a[href="#${id}"]`);
    if (!link) {
      link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = label;
      jump.prepend(link);
    }
    return link;
  }

  function renderArchiveItem(item) {
    const list = document.querySelector('.release-list');
    if (!list || !item.releaseDate || item.releaseDate === featured29.releaseDate) return;
    const id = `release-${item.releaseDate}`;
    if (document.getElementById(id)) return;

    const article = document.createElement('article');
    article.className = 'release-entry managed-archive-entry';
    article.id = id;
    article.style.setProperty('--entry', '0');

    const date = new Date(`${item.releaseDate}T12:00:00`);
    const day = Number.isNaN(date.valueOf()) ? item.releaseDate.slice(-2) : String(date.getDate()).padStart(2, '0');
    const monthYear = Number.isNaN(date.valueOf()) ? item.releaseDate : new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date).toUpperCase();
    const preview = cleanPreview(item.summary || item.body || 'Release notes and project updates.');

    article.innerHTML = `
      <div class="release-date"><time datetime="${item.releaseDate}"><strong>${day}</strong><span>${monthYear}</span></time></div>
      <details class="release-card">
        <summary>
          <div class="release-intro">
            <span class="release-tag">Previous release</span>
            <h2></h2>
            <p></p>
          </div>
          <span class="release-chevron"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg></span>
        </summary>
        <div class="release-body"></div>
      </details>`;
    article.querySelector('h2').textContent = item.title || `${formatDate(item.releaseDate)} update`;
    article.querySelector('.release-intro p').textContent = preview.length > 190 ? `${preview.slice(0, 187).trimEnd()}…` : preview;

    const body = article.querySelector('.release-body');
    if (item.version) {
      const callout = document.createElement('div');
      callout.className = 'release-callout';
      callout.textContent = item.version;
      body.append(callout);
    }
    const section = document.createElement('section');
    section.className = 'release-part';
    const h3 = document.createElement('h3');
    h3.textContent = 'Release notes';
    section.append(h3, paragraphs(item.body || item.summary || ''));
    body.append(section);

    if (Array.isArray(item.downloads) && item.downloads.length) {
      const downloads = document.createElement('div');
      downloads.className = 'release-download';
      item.downloads.forEach(download => {
        const link = document.createElement('a');
        link.className = 'subtle-link';
        link.href = download.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `${download.label} ↗`;
        downloads.append(link);
      });
      const top = document.createElement('a');
      top.href = '#updates-top';
      top.textContent = 'Back to top ↑';
      downloads.append(top);
      body.append(downloads);
    } else if (item.downloadUrl) {
      const download = document.createElement('div');
      download.className = 'release-download';
      const link = document.createElement('a');
      link.className = 'subtle-link';
      link.href = item.downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Open download ↗';
      const top = document.createElement('a');
      top.href = '#updates-top';
      top.textContent = 'Back to top ↑';
      download.append(link, top);
      body.append(download);
    }

    const next = [...list.children].find(node => {
      const value = node.id?.replace('release-', '')?.replace('-evening', '');
      return value && value < item.releaseDate;
    });
    if (next) list.insertBefore(article, next);
    else list.append(article);
    ensureJumpLink(id, formatDate(item.releaseDate).replace(' 2026', ''));
  }

  function normalizeJumpOrder() {
    const jump = document.querySelector('.release-jump');
    if (!jump) return;
    const link29 = ensureJumpLink('release-2026-10-29', '29 Oct');
    const link28 = ensureJumpLink('release-2026-10-28', '28 Oct');
    if (link29) jump.prepend(link29);
    if (link28) link29?.insertAdjacentElement('afterend', link28);
    jump.querySelectorAll('a').forEach(link => link.removeAttribute('aria-current'));
    link29?.setAttribute('aria-current', 'location');
  }

  function updateCount() {
    const toolbarCount = document.querySelector('.release-toolbar small');
    if (!toolbarCount) return;
    const archiveCount = document.querySelectorAll('.release-list > .release-entry').length;
    toolbarCount.textContent = `${archiveCount + 1} releases · Newest first`;
  }

  function wireArchiveControls() {
    const entries = [...document.querySelectorAll('.release-entry')];
    const links = [...document.querySelectorAll('.release-jump a')];
    const collapse = document.querySelector('#release-collapse');
    const feature = document.querySelector('#release-2026-10-29');
    const markCurrent = id => links.forEach(link => {
      if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const openHash = () => {
      if (location.hash === '#release-2026-10-29') {
        markCurrent('release-2026-10-29');
        feature?.scrollIntoView({ block: 'start' });
        return;
      }
      const entry = entries.find(item => '#' + item.id === location.hash);
      if (!entry) return;
      entry.querySelector('details').open = true;
      markCurrent(entry.id);
    };
    links.forEach(link => link.addEventListener('click', () => {
      if (link.hash === '#release-2026-10-29') {
        markCurrent('release-2026-10-29');
        return;
      }
      const entry = entries.find(item => '#' + item.id === link.hash);
      if (entry) {
        entry.querySelector('details').open = true;
        markCurrent(entry.id);
      }
    }));
    if (collapse) {
      const updateCollapse = () => { collapse.hidden = !entries.some(entry => entry.querySelector('details').open); };
      entries.forEach(entry => entry.querySelector('details').addEventListener('toggle', () => {
        if (entry.querySelector('details').open) markCurrent(entry.id);
        updateCollapse();
      }));
      collapse.addEventListener('click', () => {
        entries.forEach(entry => { entry.querySelector('details').open = false; });
        updateCollapse();
      });
      updateCollapse();
    }
    window.addEventListener('hashchange', openHash);
    openHash();
  }

  renderFeatured(featured29);
  renderArchiveItem(archive28);
  normalizeJumpOrder();

  fetch(api, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('updates_unavailable')))
    .then(data => {
      const items = Array.isArray(data.updates) ? data.updates : [];
      items
        .filter(item => item.releaseDate !== featured29.releaseDate)
        .sort((a, b) => String(b.releaseDate).localeCompare(String(a.releaseDate)))
        .forEach(renderArchiveItem);
    })
    .catch(() => {})
    .finally(() => {
      normalizeJumpOrder();
      updateCount();
      wireArchiveControls();
    });
})();
