(() => {
  'use strict';
  const list = document.querySelector('#release-list');
  const managed = document.querySelector('#managed-releases');
  const collapse = document.querySelector('#release-collapse');
  const api = '/api/updates';
  if (!list) return;

  const plain = value => String(value ?? '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
    .replace(/[`*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const safeBody = value => String(value ?? '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '[external link omitted]')
    .replace(/\b(download|install|sideload|sign)\b/gi, match => ({download:'release',install:'use',sideload:'use',sign:'verify'}[match.toLowerCase()] || match));

  const appendBody = (container, value) => {
    const text = safeBody(value);
    if (!text.trim()) return;
    text.replace(/\r\n?/g, '\n').split(/\n{2,}/).forEach(block => {
      const p = document.createElement('p');
      p.textContent = block.replace(/^[-*•]\s*/gm, '').trim();
      if (p.textContent) container.append(p);
    });
  };

  const existingDates = () => new Set([...document.querySelectorAll('.release-entry time[datetime]')].map(t => t.dateTime));

  const renderManaged = items => {
    if (!managed) return;
    const known = existingDates();
    const safeItems = items.filter(item => item && item.releaseDate && !known.has(item.releaseDate));
    if (!safeItems.length) return;
    managed.hidden = false;
    const heading = document.createElement('div');
    heading.className = 'managed-updates-heading';
    heading.innerHTML = '<div><span>COMMUNITY PUBLISHER</span><h2>Additional release notes</h2></div>';
    managed.append(heading);

    safeItems
      .sort((a, b) => String(b.releaseDate).localeCompare(String(a.releaseDate)))
      .forEach(item => {
        const article = document.createElement('article');
        article.className = 'managed-update-card';
        const meta = document.createElement('div');
        meta.className = 'managed-update-meta';
        const category = document.createElement('span');
        category.className = 'managed-update-category';
        category.textContent = plain(item.category || 'Project update');
        const time = document.createElement('time');
        time.dateTime = item.releaseDate;
        time.textContent = item.releaseDate;
        meta.append(category, time);
        const title = document.createElement('h3');
        title.textContent = plain(item.title || 'Project update');
        const summary = document.createElement('div');
        summary.className = 'managed-update-summary';
        const summaryText = plain(item.summary || '');
        if (summaryText) {
          const p = document.createElement('p');
          p.textContent = summaryText;
          summary.append(p);
        }
        const details = document.createElement('details');
        details.className = 'managed-update-details';
        const detailSummary = document.createElement('summary');
        detailSummary.textContent = 'Release details';
        const body = document.createElement('div');
        body.className = 'managed-update-body';
        appendBody(body, item.body || item.summary || '');
        const notice = document.createElement('p');
        notice.className = 'form-status';
        notice.textContent = 'Public release notes do not expose direct software distribution links or request account credentials.';
        body.append(notice);
        details.append(detailSummary, body);
        article.append(meta, title, summary, details);
        managed.append(article);
      });
  };

  if (collapse) {
    const sync = () => { collapse.hidden = ![...list.querySelectorAll('details')].some(d => d.open); };
    collapse.addEventListener('click', () => {
      list.querySelectorAll('details').forEach(d => { d.open = false; });
      sync();
    });
    list.querySelectorAll('details').forEach(d => d.addEventListener('toggle', sync));
    sync();
  }

  document.querySelectorAll('.release-jump a').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.hash);
      target?.querySelector('details')?.setAttribute('open', '');
      document.querySelectorAll('.release-jump a').forEach(a => a.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'location');
    });
  });

  fetch(api, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('updates_unavailable')))
    .then(data => renderManaged(Array.isArray(data.updates) ? data.updates : []))
    .catch(() => {});
})();