(() => {
  'use strict';
  if (window.__franklinEngineV2) return;
  window.__franklinEngineV2 = true;

  const DISCORD = 'https://discord.gg/HgcbPjcyJ';
  const SOURCE_PAGES = [
    ['home.html', 'Home'],
    ['get-started.html', 'Get Started'],
    ['faq.html', 'FAQ'],
    ['guide.html', 'Installation Guide'],
    ['technicalities.html', 'Technicalities'],
    ['compatibility.html', 'Compatibility'],
    ['updates.html', 'Updates'],
    ['community.html', 'Community']
  ];
  const STOP = new Set(('a an the is are was were be been being to of in on at for from with without and or but if then than so do does did can could would should will may might ' +
    'i me my mine you your yours we our ours they their it its this that these those what why how when where who which about please tell say give get got have has had ' +
    'yang dan atau di ke dari untuk pada dengan ini itu saya aku gue kamu anda tentang apa bagaimana gimana kenapa apakah bisa tidak nggak ga gak tolong kasih jelaskan').split(/\s+/));
  const ALIASES = {
    unduh: 'download', download: 'install', downloading: 'install', pasang: 'install', pemasangan: 'install', setup: 'install', sideload: 'install', ipa: 'install',
    hp: 'device', phone: 'device', iphone: 'device', perangkat: 'device', support: 'compatibility', supported: 'compatibility', cocok: 'compatibility', kuat: 'compatibility',
    ram: 'memory', mem: 'memory', lowmem: 'memory', memrestrict: 'memory', cache: 'memory',
    lag: 'performance', stutter: 'performance', patah: 'performance', fps: 'performance', panas: 'performance', hot: 'performance', thermal: 'performance',
    crash: 'troubleshooting', crashing: 'troubleshooting', error: 'troubleshooting', freeze: 'troubleshooting', forceclose: 'troubleshooting',
    update: 'updates', version: 'updates', build: 'updates', terbaru: 'updates', latest: 'updates', newest: 'updates',
    gamepad: 'controller', joystick: 'controller', touch: 'controls',
    car: 'vehicle', cars: 'vehicle', kendaraan: 'vehicle', mobil: 'vehicle',
    gun: 'weapon', guns: 'weapon', senjata: 'weapon',
    mission: 'missions', missions: 'missions', misi: 'missions',
    map: 'world', peta: 'world', lokasi: 'world', location: 'world',
    cerita: 'story', storyline: 'story', plot: 'story', campaign: 'story',
    cheatcode: 'cheats', codes: 'cheats', kode: 'cheats',
    uang: 'money', cash: 'money', duit: 'money',
    online: 'multiplayer', multiplayer: 'multiplayer',
    savegame: 'save', saves: 'save', progress: 'save', backup: 'save'
  };

  const state = {
    kb: null,
    kbPromise: null,
    passages: null,
    passagesPromise: null,
    lastTopic: '',
    lastQuestion: '',
    lastSource: null,
    history: []
  };

document.addEventListener('franklin-disconnect',()=>{state.lastTopic='';state.lastQuestion='';state.lastSource=null;state.history=[];});
  const norm = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/gta\s*5/g, 'gta v')
    .replace(/ios\s*&\s*macos/g, 'ios macos')
    .replace(/[^a-z0-9+.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawTokens = value => norm(value).split(' ').filter(Boolean);
  const tokens = value => {
    const list = [];
    rawTokens(value).forEach(token => {
      if (token.length < 2 || STOP.has(token)) return;
      list.push(token);
      const alias = ALIASES[token];
      if (alias && alias !== token) list.push(alias);
    });
    return [...new Set(list)];
  };

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    if (Math.abs(a.length - b.length) > 3) return 4;
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    const cur = new Array(b.length + 1);
    for (let i = 1; i <= a.length; i++) {
      cur[0] = i;
      let rowMin = cur[0];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          cur[j - 1] + 1,
          prev[j] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
        rowMin = Math.min(rowMin, cur[j]);
      }
      if (rowMin > 3) return 4;
      for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
    }
    return prev[b.length];
  }

  const fuzzy = (a, b) => {
    if (a === b) return 1;
    if (a.length < 4 || b.length < 4) return 0;
    const max = Math.max(a.length, b.length);
    const d = levenshtein(a, b);
    return d > 3 ? 0 : 1 - d / max;
  };

  const overlapRatio = (a, b) => {
    if (!a.length || !b.length) return 0;
    const set = new Set(b);
    return a.filter(x => set.has(x)).length / Math.max(1, a.length);
  };

  const loadKnowledge = () => {
    if (state.kbPromise) return state.kbPromise;
    state.kbPromise = fetch('franklin-knowledge.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : { entries: [] })
      .then(data => {
        state.kb = Array.isArray(data?.entries) ? data.entries.map(entry => ({
          ...entry,
          _patterns: (entry.patterns || []).map(norm),
          _keywords: [...new Set((entry.keywords || []).flatMap(tokens))]
        })) : [];
        return state.kb;
      })
      .catch(() => (state.kb = []));
    return state.kbPromise;
  };

  const loadPassages = () => {
    if (state.passagesPromise) return state.passagesPromise;
    state.passagesPromise = Promise.all(SOURCE_PAGES.map(async ([href, label]) => {
      try {
        const response = await fetch(href, { cache: 'no-cache' });
        if (!response.ok) return [];
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const main = doc.querySelector('main');
        if (!main) return [];
        let heading = label;
        const out = [];
        main.querySelectorAll('h1,h2,h3,p,li,summary').forEach(node => {
          const text = node.textContent.replace(/\s+/g, ' ').trim();
          if (/^H[1-3]$/.test(node.tagName)) {
            heading = text || heading;
            return;
          }
          if (text.length < 28 || text.length > 620) return;
          out.push({
            text,
            heading,
            href,
            label,
            haystack: norm(`${heading} ${text}`),
            words: tokens(`${heading} ${text}`)
          });
        });
        return out;
      } catch {
        return [];
      }
    })).then(groups => (state.passages = groups.flat()));
    return state.passagesPromise;
  };

  const smallTalk = question => {
    const q = norm(question);
    if (/^(hi|hello|hey|yo|hallo|halo|hai|sup|wassup|whats up|what s up)[.! ]*$/.test(q)) {
      return { text: "Yo, what's good? Franklin here. Ask me anything about GTA V or this iOS project — characters, story, settings, installation, performance, whatever you need." };
    }
    if (/^(good morning|morning|good afternoon|good evening|good night)[.! ]*$/.test(q)) {
      return { text: "Yo. Hope you're doing good. What's on your mind — GTA V, the launcher, your device, or something else around the project?" };
    }
    if (/\b(how are you|how you doing|you good)\b/.test(q)) {
      return { text: "I'm good, homie. Just hanging around Los Santos and keeping an eye on this project. What do you need help with?" };
    }
    if (/^(thanks|thank you|thx|makasih|terima kasih|nice|great|mantap)[.! ]*$/.test(q)) {
      return { text: "You got it, homie. If something else comes up, hit me with it." };
    }
    if (/^(bye|goodbye|see ya|see you|later|dadah)[.! ]*$/.test(q)) {
      return { text: "Aight, catch you later. Stay safe out there in Los Santos." };
    }
    if (/\b(who are you|what are you|siapa kamu)\b/.test(q)) {
      return { text: "I'm Ask Franklin — a fan-made community helper styled after Franklin Clinton. I can help with GTA V knowledge and this GTA V iOS community project, but I'm not an official Rockstar assistant." };
    }
    return null;
  };

  const contextQuery = question => {
    const q = norm(question);
    const count = rawTokens(q).length;
    const follow = count <= 6 && (/^(and|what about|how about|why|how|where|when|can it|does it|is it|that|it)\b/.test(q) || /\b(it|that|this one|same thing)\b/.test(q));
    if (!follow || !state.lastQuestion) return question;
    return `${state.lastQuestion} ${question} ${state.lastTopic}`;
  };

  const scoreKnowledge = (entry, question, queryTokens) => {
    const q = norm(question);
    let score = 0;
    for (const pattern of entry._patterns) {
      if (!pattern) continue;
      if (q === pattern) score += 18;
      else if (q.includes(pattern) || pattern.includes(q)) score += Math.min(12, 4 + pattern.length / 12);
      const pTokens = tokens(pattern);
      score += overlapRatio(queryTokens, pTokens) * 5;
    }
    for (const token of queryTokens) {
      if (entry._keywords.includes(token)) {
        score += token.length >= 7 ? 3.4 : 2.4;
        continue;
      }
      let best = 0;
      for (const keyword of entry._keywords) best = Math.max(best, fuzzy(token, keyword));
      if (best >= 0.84) score += 1.5 * best;
    }
    if (state.lastTopic && entry.topic === state.lastTopic && rawTokens(question).length <= 6) score += 2.8;
    return score;
  };

  const searchKnowledge = async question => {
    const entries = await loadKnowledge();
    const queryTokens = tokens(question);
    let best = null;
    let second = null;
    for (const entry of entries) {
      const score = scoreKnowledge(entry, question, queryTokens);
      const hit = { entry, score };
      if (!best || score > best.score) {
        second = best;
        best = hit;
      } else if (!second || score > second.score) second = hit;
    }
    const floor = queryTokens.length <= 2 ? 4.4 : Math.min(8.2, 3.8 + queryTokens.length * 0.72);
    if (!best || best.score < floor) return null;
    const confidence = second ? best.score - second.score : best.score;
    return { ...best, confidence };
  };

  const searchSite = async question => {
    const passages = await loadPassages();
    const q = norm(question);
    const qTokens = tokens(question);
    let best = null;
    for (const passage of passages) {
      let score = 0;
      if (passage.haystack.includes(q) && q.length > 4) score += 8;
      for (const token of qTokens) {
        if (passage.words.includes(token)) {
          score += token.length >= 7 ? 2.5 : 1.7;
          continue;
        }
        let near = 0;
        for (const word of passage.words) near = Math.max(near, fuzzy(token, word));
        if (near >= 0.86) score += near;
      }
      score += overlapRatio(qTokens, passage.words) * 4;
      if (state.lastSource?.href === passage.href && rawTokens(question).length <= 6) score += 1.4;
      if (!best || score > best.score) best = { ...passage, score };
    }
    const floor = Math.min(8, 3.7 + qTokens.length * 0.62);
    return best && best.score >= floor ? best : null;
  };

  const trimSnippet = text => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= 430) return clean;
    const cut = clean.slice(0, 430);
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '), cut.lastIndexOf(', '));
    return `${cut.slice(0, end > 260 ? end + 1 : 420).trim()}…`;
  };

  const remember = (question, result) => {
    state.lastQuestion = question;
    if (result.topic) state.lastTopic = result.topic;
    if (result.source) state.lastSource = result.source;
    state.history.push({ question, topic: result.topic || '', at: Date.now() });
    if (state.history.length > 6) state.history.shift();
  };

  async function answer(rawQuestion) {const social=window.FranklinConversation?.social(rawQuestion);if(social)return social;const developerAnswer=await window.FranklinDeveloperKB?.answer(rawQuestion);if(developerAnswer)return developerAnswer;
    const question = String(rawQuestion || '').trim();
    if (!question) return { text: "Yo, give me something to work with." };

    const chat = smallTalk(question);
    if (chat) {
      remember(question, { topic: 'small-talk' });
      return chat;
    }

    const enriched = contextQuery(question);
    const [knowledge, site] = await Promise.all([
      searchKnowledge(enriched),
      searchSite(enriched)
    ]);

    if (knowledge && (!site || knowledge.score >= site.score + 0.6)) {
      const entry = knowledge.entry;
      const result = {
        text: entry.answer,
        topic: entry.topic,
        source: entry.source || null,
        discord: entry.discord === true
      };
      remember(question, result);
      return result;
    }

    if (site) {
      const result = {
        text: `Aight, I found something relevant in the community docs: ${trimSnippet(site.text)}`,
        topic: state.lastTopic || norm(site.heading).replace(/\s+/g, '-'),
        source: { href: site.href, label: site.label }
      };
      remember(question, result);
      return result;
    }

    const result = {
      text: "Aight, I don't have a solid answer for that one yet, homie. I don't wanna make something up. Join the Discord and ask the staff or community directly — they'll be better for anything build-specific or outside my current knowledge.",
      topic: 'unknown',
      discord: true
    };
    remember(question, result);
    return result;
  }

  window.FranklinEngine = {
    version: 2,
    answer,
    preload: () => Promise.all([loadKnowledge(), loadPassages()]),
    getContext: () => ({ lastTopic: state.lastTopic, lastQuestion: state.lastQuestion, history: [...state.history] })
  };

  const svg = name => `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;
  const appendBot = (text, options = {}) => {
    const messages = document.querySelector('.ask-franklin-messages');
    if (!messages) return null;
    const row = document.createElement('div');
    row.className = 'ask-franklin-message bot franklin-v2-message';
    const mini = document.createElement('span');
    mini.className = 'mini-avatar';
    mini.textContent = 'F';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    row.append(mini, bubble);
    if (options.discord) {
      const link = document.createElement('a');
      link.className = 'ask-franklin-discord';
      link.href = DISCORD;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = `Ask the crew on Discord ${svg('arrow-up-right')}`;
      bubble.append(document.createElement('br'), link);
    }
    if (options.source?.href) {
      const link = document.createElement('a');
      link.className = 'ask-franklin-discord';
      link.href = options.source.href;
      link.innerHTML = `Open ${options.source.label || 'source'} ${svg('arrow-right')}`;
      bubble.append(document.createElement('br'), link);
    }
    messages.append(row);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
    return row;
  };

  const appendUser = text => {
    const messages = document.querySelector('.ask-franklin-messages');
    if (!messages) return;
    const row = document.createElement('div');
    row.className = 'ask-franklin-message user franklin-v2-message';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    row.append(bubble);
    messages.append(row);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  };

  const thinking = () => {
    const messages = document.querySelector('.ask-franklin-messages');
    if (!messages) return null;
    const row = document.createElement('div');
    row.className = 'ask-franklin-message bot is-thinking franklin-v2-message';
    row.innerHTML = '<span class="mini-avatar">F</span><div class="bubble" aria-label="Franklin is thinking"><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i></div>';
    messages.append(row);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
    return row;
  };

  let uiBusy = false;
  async function answerInUI(raw) {
    const question = String(raw || '').trim();
    if (!question || uiBusy) return;
    const input = document.querySelector('.ask-franklin-input');
    const send = document.querySelector('.ask-franklin-send');
    if (!input || !send) return;
    uiBusy = true;
    send.disabled = true;
    appendUser(question);
    input.value = '';
    input.style.height = 'auto';
    const wait = thinking();
    try {
      const result = await answer(question);
      await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 220));
      wait?.remove();
      appendBot(result.text, result);
      window.gtavHaptics?.trigger?.('soft');
    } catch {
      wait?.remove();
      appendBot("Man, something went sideways on my end. Try that again, or ask the crew on Discord if you need an answer right now.", { discord: true });
      window.gtavHaptics?.trigger?.('warning');
    } finally {
      uiBusy = false;
      send.disabled = !input.value.trim();
      input.focus({ preventScroll: true });
    }
  }

  document.addEventListener('submit', event => {
    const form = event.target instanceof Element ? event.target.closest('.ask-franklin-form') : null;
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const input = form.querySelector('.ask-franklin-input');
    answerInUI(input?.value || '');
  }, true);

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const chip = event.target.closest('.ask-franklin-chip');
    if (!chip) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    answerInUI(chip.textContent || '');
  }, true);

  const markReady = () => {
    const panel = document.querySelector('.ask-franklin-panel');
    if (panel) panel.dataset.engine = 'v2';
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markReady, { once: true });
  else markReady();

  loadKnowledge();
})();
