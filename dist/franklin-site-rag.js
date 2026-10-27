(() => {
  'use strict';
  if (window.__franklinSiteRAGLoaded) return;
  window.__franklinSiteRAGLoaded = true;

  const DISCORD = 'https://discord.gg/HgcbPjcyJ';
  const SOURCES = [
    ['faq.html', 'FAQ', 1.45],
    ['guide.html', 'Installation Guide', 1.4],
    ['technicalities.html', 'Technicalities', 1.25],
    ['compatibility.html', 'Compatibility', 1.25],
    ['updates.html', 'Updates', 1.15],
    ['community.html', 'Community', 1.15],
    ['get-started.html', 'Get Started', 1.1],
    ['home.html', 'Home', 1]
  ];

  const STOP = new Set('a an the is are was were be been to of in on at for from with and or but if then than so do does did can could would should will may might i me my you your we our they their it this that these those what why how when where who which about please tell say give get have has had my always when clicking still keeps keep yang dan atau di ke dari untuk pada dengan ini itu saya aku gue kamu anda tentang apa bagaimana gimana kenapa apakah bisa tidak nggak ga gak tolong kasih jelaskan'.split(/\s+/));
  const ALIAS = {
    crashes:'crash', crashing:'crash', crashed:'crash', forceclose:'crash', closes:'crash', close:'crash',
    launch:'start', launching:'start', play:'start', startup:'start', boot:'start', opening:'start',
    log:'logs', crashlog:'logs', crashlogs:'logs', logfile:'logs',
    discord:'community', server:'community', support:'community', staff:'community', help:'community',
    download:'install', ipa:'install', sideload:'install', signing:'install', signed:'install',
    update:'updates', latest:'updates', build:'updates', version:'updates',
    iphone:'device', ipad:'device', mac:'device', macos:'device', ram:'memory',
    lag:'performance', stutter:'performance', fps:'performance', thermal:'performance', hot:'performance',
    controller:'controls', gamepad:'controls', joystick:'controls', touch:'controls',
    blackscreen:'black-screen', black:'black-screen', freeze:'stuck', frozen:'stuck'
  };

  const state = { passages: null, promise: null, lastIntent: '', lastSource: null };
  const norm = v => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/gta\s*5/g, 'gta v').replace(/[^a-z0-9+.-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = v => [...new Set(norm(v).split(' ').filter(Boolean).flatMap(w => {
    if (w.length < 2 || STOP.has(w)) return [];
    return ALIAS[w] && ALIAS[w] !== w ? [w, ALIAS[w]] : [w];
  }))];

  const clean = v => String(v || '').replace(/\s+/g, ' ').trim();
  const textOf = node => clean(node?.textContent || '');
  const linkFrom = (node, fallback) => {
    const link = node?.querySelector?.('a[href]');
    if (!link) return fallback;
    const href = link.getAttribute('href') || fallback;
    return /^https?:\/\//i.test(href) ? href : href;
  };

  function makePassage({ question = '', answer = '', heading = '', href, label, weight = 1, type = 'section' }) {
    const text = clean(`${question} ${answer}`);
    return {
      question: clean(question), answer: clean(answer), heading: clean(heading), href, label, weight, type,
      haystack: norm(`${heading} ${question} ${answer}`), tokens: words(`${heading} ${question} ${answer}`), text
    };
  }

  async function parseSource([href, label, weight]) {
    try {
      const res = await fetch(href, { cache: 'no-cache' });
      if (!res.ok) return [];
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const main = doc.querySelector('main');
      if (!main) return [];
      const out = [];

      // FAQ entries are authoritative Q/A pairs and receive the highest precision.
      main.querySelectorAll('details').forEach(details => {
        const q = textOf(details.querySelector('summary'));
        const body = details.querySelector('.answer-body') || details;
        const a = textOf(body);
        if (q.length > 5 && a.length > 12) {
          out.push(makePassage({ question: q, answer: a, heading: 'FAQ', href: linkFrom(body, href), label, weight: weight + .75, type: 'faq' }));
        }
      });

      // Guide/tutorial/technical pages are indexed by heading plus nearby paragraphs/lists.
      const headings = [...main.querySelectorAll('h1,h2,h3')];
      headings.forEach(h => {
        const title = textOf(h);
        if (!title) return;
        const chunks = [];
        let node = h.nextElementSibling;
        let guard = 0;
        while (node && guard++ < 10 && !/^H[1-3]$/.test(node.tagName)) {
          const t = textOf(node);
          if (t.length >= 18) chunks.push(t);
          if (chunks.join(' ').length > 900) break;
          node = node.nextElementSibling;
        }
        const answer = clean(chunks.join(' ')).slice(0, 1000);
        if (answer.length >= 30) out.push(makePassage({ question: title, answer, heading: title, href: linkFrom(h.parentElement || main, href), label, weight, type: 'section' }));
      });

      // Individual paragraphs/list items are fallback evidence.
      main.querySelectorAll('p,li').forEach(node => {
        const t = textOf(node);
        if (t.length < 35 || t.length > 650) return;
        const section = node.closest('section,article,details');
        const h = section?.querySelector?.('h1,h2,h3,summary');
        out.push(makePassage({ question: textOf(h), answer: t, heading: textOf(h) || label, href: linkFrom(node, href), label, weight: weight * .86, type: 'paragraph' }));
      });
      return out;
    } catch {
      return [];
    }
  }

  function load() {
    if (state.promise) return state.promise;
    state.promise = Promise.all(SOURCES.map(parseSource)).then(groups => {
      state.passages = groups.flat();
      return state.passages;
    }).catch(() => (state.passages = []));
    return state.promise;
  }

  function intent(q) {
    const n = norm(q);
    if (/\b(discord|community|server|staff|support team|join server)\b/.test(n)) return 'community';
    if (/\b(crash|crashes|crashing|force close|forceclose|closes|close itself|won t open|wont open|not open)\b/.test(n)) return 'crash';
    if (/\b(black screen|blackscreen)\b/.test(n)) return 'black-screen';
    if (/\b(stuck|freeze|frozen|loading forever|never loads)\b/.test(n)) return 'stuck';
    if (/\b(install|download|ipa|sideload|signing|certificate)\b/.test(n)) return 'install';
    if (/\b(update|latest build|new build|version)\b/.test(n)) return 'updates';
    if (/\b(fps|lag|stutter|performance|thermal|hot|heat|resolution|msaa|metalfx|graphics)\b/.test(n)) return 'performance';
    if (/\b(controller|gamepad|joystick|touch controls|keyboard|mouse)\b/.test(n)) return 'controls';
    if (/\b(save|savegame|import save|progress)\b/.test(n)) return 'save';
    return '';
  }

  function domainAllowed(q) {
    const n = norm(q);
    if (/\b(gta v|grand theft auto|ios project|launcher|dxmt|metalfx|lowmem|memrestrict|ipa|iphone|ipad|macos|discord|community|crash|crashing|install|sideload|compatibility|controller|gamepad|fps|graphics|settings|update|build|logs|log folder|save|patch)\b/.test(n)) return true;
    if (state.lastIntent && words(q).length <= 6) return true;
    return false;
  }

  function score(p, q) {
    const n = norm(q), qt = words(q), it = intent(q);
    let s = 0;
    if (p.question && n === norm(p.question)) s += 30;
    if (p.question && (n.includes(norm(p.question)) || norm(p.question).includes(n)) && n.length > 5) s += 12;
    for (const t of qt) {
      if (p.tokens.includes(t)) s += t.length >= 7 ? 3.2 : 2.2;
      if (p.question && norm(p.question).includes(t)) s += 1.6;
    }
    if (qt.length) s += qt.filter(t => p.tokens.includes(t)).length / qt.length * 7;
    if (it === 'crash' && /crash|logs|log folder|troubleshoot|launch|start|play/.test(p.haystack)) s += 7;
    if (it === 'community' && /discord|community|support|staff/.test(p.haystack)) s += 8;
    if (it === 'install' && /install|ipa|sign|sideload|download/.test(p.haystack)) s += 5;
    if (it === 'updates' && /update|release|build|latest/.test(p.haystack)) s += 5;
    if (it === 'performance' && /performance|fps|memory|thermal|graphics|resolution/.test(p.haystack)) s += 5;
    s *= p.weight;
    return s;
  }

  function concise(text, max = 560) {
    const c = clean(text);
    if (c.length <= max) return c;
    const cut = c.slice(0, max);
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
    return `${cut.slice(0, end > 300 ? end + 1 : max - 1).trim()}…`;
  }

  function crashEscalation() {
    return {
      text: "Aight, if GTA V still crashes after you've followed the troubleshooting steps, don't keep guessing. Join the Discord and send the crash log or the project's Logs folder to the staff/community so they can see what failed. Include your device, iOS version, build date/version, what you were doing when it crashed, and any settings you changed. That gives the crew something useful to diagnose.",
      topic: 'troubleshooting',
      source: { href: 'faq.html', label: 'FAQ / Troubleshooting' },
      discord: true,
      suggestions: ['Where can I find the logs?', 'Open troubleshooting guide']
    };
  }

  async function answer(question) {
    const q = String(question || '').trim();
    if (!q || !domainAllowed(q)) return null;
    const it = intent(q);
    const passages = await load();
    const ranked = passages.map(p => ({ p, s: score(p, q) })).sort((a, b) => b.s - a.s);
    const best = ranked[0];

    // Project-specific escalation is deterministic because this is a critical support path.
    if (it === 'crash' && /\b(still|always|keeps|keep|again|after|every time|clicking play|when i play|on launch|at launch)\b/i.test(q)) {
      const r = crashEscalation();
      state.lastIntent = 'crash'; state.lastSource = r.source;
      return r;
    }

    if (it === 'community') {
      state.lastIntent = 'community';
      return {
        text: "You can join the GTA V iOS community on Discord. That's also where the current build instructions and direct staff/community support are handled.",
        topic: 'community', source: { href: 'community.html', label: 'Community' }, discord: true,
        suggestions: ['Where do I download the latest build?', 'What should I send with a crash report?']
      };
    }

    const floor = words(q).length <= 2 ? 8.5 : 7;
    if (!best || best.s < floor) {
      if (it === 'crash') return crashEscalation();
      return null;
    }

    const p = best.p;
    let text = p.answer || p.text;
    if (p.type === 'faq') text = concise(text, 620);
    else text = `Aight, here's what the project docs say: ${concise(text, 560)}`;
    const result = {
      text,
      topic: it || 'site-docs',
      source: { href: p.href || 'faq.html', label: p.label || 'Project docs' },
      discord: /discord|send the logs|send.*log|support/.test(norm(text)),
      suggestions: it === 'crash' ? ['What if it still crashes?', 'Where can I find the logs?'] : []
    };
    state.lastIntent = it || 'site-docs'; state.lastSource = result.source;
    return result;
  }

  window.FranklinSiteRAG = { answer, load, status: () => ({ loaded: !!state.passages, passages: state.passages?.length || 0, lastIntent: state.lastIntent }) };
  requestIdleCallback?.(() => load(), { timeout: 2500 });
})();