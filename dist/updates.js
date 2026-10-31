(() => {
  if (window.__updatesLatest30) return;
  window.__updatesLatest30 = true;

  const api = '/api/updates';
  const DISCORD = 'https://discord.gg/HgcbPjcyJ';
  const heading = document.querySelector('.updates-heading');
  if (!heading) return;

  const cleanupLegacyShells = () => {
    document.querySelectorAll('.managed-updates:not(.latest-release-30)').forEach(node => node.remove());
  };
  cleanupLegacyShells();
  const legacyObserver = new MutationObserver(cleanupLegacyShells);
  legacyObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('pagehide', () => legacyObserver.disconnect(), { once: true });

  const featured30 = {
    category: 'Latest release',
    releaseDate: '2026-10-30',
    title: 'GTA V for iPhone, iPad & Mac: 30 Oct update',
    version: '30 Oct build',
    summary: 'GTA Online interiors and persistent weapons, host-only session controls, expanded Trainer clothing and weapon tools, support for up to 256 add-on packs, new community mod packs, and stability fixes.',
    body: `**GTA Online**
- **Enterable interiors:** walk into apartment towers and 34 additional places, including homes, police stations, the hospital, banks, clubs and the FIB. Supported doors use yellow markers and map blips.
- **Persistent weapons:** your weapons are saved and restored the next time you play.
- **Host controls:** in a session, only the host can start jobs and use God mode.
- **Joining reports:** use Trainer › GTA Online › Copy the joining log and include that log when reporting a connection problem.

**Trainer**
- Weapons and attachments stay equipped when you change skin.
- New weapon options: Attachments and tint, plus All weapons with attachments.
- Clothes can be changed piece by piece from the Clothes page.
- GTA Online DLC cars now appear in their matching vehicle classes in the spawner.

**Mods**
- The launcher now supports up to 256 add-on packs. Add-on cars no longer disappear simply because all GTA Online DLC packs are enabled.
- Clothing mods are supported for Michael, Franklin and Trevor.
- QuantV, VisualV, NaturalVision Remastered and MaxedV no longer hit the startup crash covered by this release.
- In the MODS tab, tap a mod to read its full description.

**New mods**
- **Community Mod Pack 2:** W.E.R.O. ragdolls, Forests of San Andreas and GTA 5 World Improvement.
- **Community Mod Pack 3:** QuantV iOS, sharper car textures, fuller roadside bushes, bigger subtitles and GTA Online cars in traffic.
- **Hungarian translation** is now available.

**Fixes**
- Fixed the crash involving Benny's wheels and GTA Online wheels.

**Performance notes**
- Use one graphics overhaul at a time.
- QuantV and the sharper car-texture package are intended for 6 GB devices.
- On 4 GB devices, switch heavy mods off in MODS if the game runs short of memory.
- GTA Online cars in traffic require the matching DLC packs.

**How to update**
- Your saves and mods stay as they are. Install the new build over the current installation.
- **iPhone / iPad:** get GTAV-unsigned.ipa from the project Discord and sign it as before.
- **Mac:** get GTAV-mac.zip from the project Discord.
- App-package downloads on this website are routed through Discord.`,
    downloads: [
      { label: 'Get iOS on Discord', meta: 'iPhone & iPad', url: DISCORD },
      { label: 'Get Mac on Discord', meta: 'Apple silicon', url: DISCORD }
    ]
  };

  const archive29 = {
    category: 'Previous release',
    releaseDate: '2026-10-29',
    title: 'GTA V for iPhone, iPad & Mac: 29 Oct update, GTA Online',
    version: '29 Oct build',
    summary: 'GTA Online characters, free roam, jobs, peer-to-peer sessions for up to 32 players, session codes, Nearby discovery, new controls, and fixes.',
    body: `**GTA Online**
- Online character creator, free roam, races, deathmatches, survivals and contact missions.
- Peer-to-peer sessions for up to 32 players, session-code joining and Nearby discovery on the same Wi-Fi.
- Host-led jobs move everyone in the session into the selected job.

**Also new**
- Trainer car upgrades can be changed individually.
- Touch-button opacity can be adjusted in HUD & Controls.
- Pause map supports pinch-to-zoom.
- Add-on cars without working custom audio use a matching stock-car sound.
- The launcher opens at every start.

**Fixes**
- Fixed a crash when changing clothes with DLC packs installed.
- Fixed a respawn loop after a vehicle is destroyed during a race.
- Mod-import error messages can now be read in full.

**Updating**
- Existing saves and mods remain when installing over the current setup.
- App packages are now linked through Discord from this website.`,
    downloads: [
      { label: 'Get app on Discord', meta: 'Previous build', url: DISCORD }
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
- Four DLC packs cover the updates by release era.
- Use one IMPORT MOD per pack in the launcher's MODS tab.
- DLC vehicles remain in story mode and Trainer includes their weapons.

**Mac**
- The launcher opens first, with presets, graphics settings, MODS import and save management.
- Trainer: ⌘T or F4 in game. With a controller, use View in the pause menu.
- Exit Game in the pause menu returns to the launcher.

**How to update**
- iPhone / iPad: install over the current app. Existing data, saves and mods stay.
- Mac: install the matching Mac package over the current setup.
- App packages are linked through Discord from this website.`,
    downloads: [
      { label: 'Get app on Discord', meta: 'Previous build', url: DISCORD }
    ]
  };

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'managed-updates.css?v=20261031latest30';
  document.head.append(css);

  ['2026-10-30','2026-10-29','2026-10-28'].forEach(date => document.querySelector(`.release-list > #release-${date}`)?.remove());

  const shell = document.createElement('section');
  shell.className = 'managed-updates latest-release-30';
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
      if (subheading) {
        list = null;
        const h = document.createElement('h4');
        h.append(inline(subheading[1]));
        fragment.append(h);
      } else if (bullet) {
        if (!list) { list = document.createElement('ul'); fragment.append(list); }
        const li = document.createElement('li');
        li.append(inline(bullet[1]));
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

  function discordLink(label, className = 'subtle-link') {
    const link = document.createElement('a');
    link.className = `${className} discord-link`;
    link.href = DISCORD;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    return link;
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
    const category = document.createElement('span'); category.className = 'managed-update-category'; category.textContent = item.category;
    const badge = document.createElement('span'); badge.className = 'managed-update-new'; badge.textContent = 'NEW';
    const date = document.createElement('time'); date.dateTime = item.releaseDate; date.textContent = formatDate(item.releaseDate);
    meta.append(category, badge, date);
    const h3 = document.createElement('h3'); h3.textContent = item.title;
    card.append(meta, h3);
    const version = document.createElement('div'); version.className = 'managed-update-version'; version.textContent = item.version; card.append(version);
    const summary = document.createElement('div'); summary.className = 'managed-update-summary'; summary.append(paragraphs(item.summary)); card.append(summary);
    const details = document.createElement('details'); details.className = 'managed-update-details'; details.open = true;
    const detailsSummary = document.createElement('summary'); detailsSummary.textContent = 'Release details';
    const body = document.createElement('div'); body.className = 'managed-update-body'; body.append(paragraphs(item.body));
    details.append(detailsSummary, body); card.append(details);
    const downloads = document.createElement('div'); downloads.className = 'managed-update-downloads';
    item.downloads.forEach(download => {
      const link = discordLink('', 'button outline compact managed-update-download');
      const span = document.createElement('span');
      const small = document.createElement('small'); small.textContent = download.meta;
      span.append(small, document.createTextNode(download.label)); link.append(span); downloads.append(link);
    });
    card.append(downloads); shell.append(card);
  }

  function ensureJumpLink(id, label) {
    const jump = document.querySelector('.release-jump');
    if (!jump) return null;
    [...jump.querySelectorAll(`a[href="#${id}"]`)].slice(1).forEach(node => node.remove());
    let link = jump.querySelector(`a[href="#${id}"]`);
    if (!link) { link = document.createElement('a'); link.href = `#${id}`; link.textContent = label; jump.prepend(link); }
    return link;
  }

  function renderArchiveItem(item) {
    const list = document.querySelector('.release-list');
    if (!list || !item.releaseDate || item.releaseDate === featured30.releaseDate) return;
    const id = `release-${item.releaseDate}`;
    if (document.getElementById(id)) return;
    const article = document.createElement('article');
    article.className = 'release-entry managed-archive-entry'; article.id = id; article.style.setProperty('--entry', '0');
    const date = new Date(`${item.releaseDate}T12:00:00`);
    const day = Number.isNaN(date.valueOf()) ? item.releaseDate.slice(-2) : String(date.getDate()).padStart(2, '0');
    const monthYear = Number.isNaN(date.valueOf()) ? item.releaseDate : new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date).toUpperCase();
    const preview = cleanPreview(item.summary || item.body || 'Release notes and project updates.');
    article.innerHTML = `<div class="release-date"><time datetime="${item.releaseDate}"><strong>${day}</strong><span>${monthYear}</span></time></div><details class="release-card"><summary><div class="release-intro"><span class="release-tag">Previous release</span><h2></h2><p></p></div><span class="release-chevron"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg></span></summary><div class="release-body"></div></details>`;
    article.querySelector('h2').textContent = item.title || `${formatDate(item.releaseDate)} update`;
    article.querySelector('.release-intro p').textContent = preview.length > 190 ? `${preview.slice(0, 187).trimEnd()}…` : preview;
    const body = article.querySelector('.release-body');
    if (item.version) { const callout = document.createElement('div'); callout.className = 'release-callout'; callout.textContent = item.version; body.append(callout); }
    const section = document.createElement('section'); section.className = 'release-part';
    const h3 = document.createElement('h3'); h3.textContent = 'Release notes'; section.append(h3, paragraphs(item.body || item.summary || '')); body.append(section);
    const download = document.createElement('div'); download.className = 'release-download';
    download.append(discordLink('Get app on Discord ↗'));
    const top = document.createElement('a'); top.href = '#updates-top'; top.textContent = 'Back to top ↑'; download.append(top); body.append(download);
    const next = [...list.children].find(node => { const value = node.id?.replace('release-', '')?.replace('-evening', ''); return value && value < item.releaseDate; });
    if (next) list.insertBefore(article, next); else list.append(article);
    ensureJumpLink(id, formatDate(item.releaseDate).replace(' 2026', ''));
  }

  function normalizeJumpOrder() {
    const jump = document.querySelector('.release-jump'); if (!jump) return;
    const link30 = ensureJumpLink('release-2026-10-30', '30 Oct');
    const link29 = ensureJumpLink('release-2026-10-29', '29 Oct');
    const link28 = ensureJumpLink('release-2026-10-28', '28 Oct');
    if (link28) jump.prepend(link28); if (link29) jump.prepend(link29); if (link30) jump.prepend(link30);
    jump.querySelectorAll('a').forEach(link => link.removeAttribute('aria-current'));
    link30?.setAttribute('aria-current', 'location');
  }

  function updateCount() {
    const toolbarCount = document.querySelector('.release-toolbar small'); if (!toolbarCount) return;
    const archiveCount = document.querySelectorAll('.release-list > .release-entry').length;
    toolbarCount.textContent = `${archiveCount + 1} releases · Newest first`;
  }

  function wireArchiveControls() {
    const entries = [...document.querySelectorAll('.release-entry')];
    const links = [...document.querySelectorAll('.release-jump a')];
    const collapse = document.querySelector('#release-collapse');
    const feature = document.querySelector('#release-2026-10-30');
    const markCurrent = id => links.forEach(link => link.hash === '#' + id ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    const openHash = () => {
      if (location.hash === '#release-2026-10-30') { markCurrent('release-2026-10-30'); feature?.scrollIntoView({ block: 'start' }); return; }
      const entry = entries.find(item => '#' + item.id === location.hash); if (!entry) return;
      entry.querySelector('details').open = true; markCurrent(entry.id);
    };
    links.forEach(link => link.addEventListener('click', () => {
      if (link.hash === '#release-2026-10-30') { markCurrent('release-2026-10-30'); return; }
      const entry = entries.find(item => '#' + item.id === link.hash); if (entry) { entry.querySelector('details').open = true; markCurrent(entry.id); }
    }));
    if (collapse) {
      const updateCollapse = () => { collapse.hidden = !entries.some(entry => entry.querySelector('details').open); };
      entries.forEach(entry => entry.querySelector('details').addEventListener('toggle', () => { if (entry.querySelector('details').open) markCurrent(entry.id); updateCollapse(); }));
      collapse.addEventListener('click', () => { entries.forEach(entry => { entry.querySelector('details').open = false; }); updateCollapse(); });
      updateCollapse();
    }
    window.addEventListener('hashchange', openHash); openHash();
  }

  renderFeatured(featured30);
  renderArchiveItem(archive29);
  renderArchiveItem(archive28);
  normalizeJumpOrder();

  fetch(api, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('updates_unavailable')))
    .then(data => {
      const items = Array.isArray(data.updates) ? data.updates : [];
      items
        .filter(item => ![featured30.releaseDate, archive29.releaseDate, archive28.releaseDate].includes(item.releaseDate))
        .sort((a, b) => String(b.releaseDate).localeCompare(String(a.releaseDate)))
        .forEach(renderArchiveItem);
    })
    .catch(() => {})
    .finally(() => { normalizeJumpOrder(); updateCount(); wireArchiveControls(); });
})();