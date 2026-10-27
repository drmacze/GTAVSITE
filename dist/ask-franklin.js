(() => {
  if (window.__askFranklinLoaded || document.querySelector('.ask-franklin-launcher')) return;
  window.__askFranklinLoaded = true;

  const DISCORD = 'https://discord.gg/HgcbPjcyJ';
  const SOURCE_PAGES = [
    ['faq.html', 'FAQ'],
    ['guide.html', 'Installation Guide'],
    ['technicalities.html', 'Technicalities'],
    ['compatibility.html', 'Compatibility'],
    ['updates.html', 'Updates'],
    ['community.html', 'Community']
  ];
  const STOP = new Set('yang dan atau di ke dari untuk pada dengan ini itu saya aku gue kamu anda tentang apa bagaimana gimana kenapa apakah bisa tidak nggak ga gak the a an is are of to in on for with how what why can do does my your about gta v ios'.split(/\s+/));
  let passagesPromise = null;

  const addCss = () => {
    if (document.querySelector('link[data-ask-franklin]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'ask-franklin.css?v=20261027sheet';
    link.dataset.askFranklin = 'true';
    document.head.append(link);
  };
  addCss();

  const svg = name => `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;
  const createAvatar = (small = false) => {
    const avatar = document.createElement('span');
    avatar.className = 'ask-franklin-avatar';
    if (small) avatar.classList.add('small');
    avatar.innerHTML = '<span class="ask-franklin-fallback" aria-hidden="true">F</span><img src="https://cdn.corenexis.com/f/dJ4k8HeoKK9.jpeg" alt="Franklin" aria-hidden="true"><i class="ask-franklin-status" aria-hidden="true"></i>';
    const image = avatar.querySelector('img');
    image.addEventListener('load', () => avatar.classList.add('is-loaded'), { once: true });
    image.addEventListener('error', () => image.remove(), { once: true });
    return avatar;
  };

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'ask-franklin-launcher is-dock-open';
  launcher.dataset.state = 'expanded';
  launcher.setAttribute('aria-label', 'Open Ask Franklin chat');
  launcher.setAttribute('aria-expanded', 'false');
  const launcherCopy = document.createElement('span');
  launcherCopy.className = 'ask-franklin-launcher-copy';
  launcherCopy.innerHTML = '<small>COMMUNITY</small><strong>Ask Franklin</strong>';
  launcher.append(createAvatar(), launcherCopy);

  const panel = document.createElement('aside');
  panel.className = 'ask-franklin-panel';
  panel.setAttribute('aria-label', 'Ask Franklin community helper');
  panel.setAttribute('data-lenis-prevent', '');
  panel.setAttribute('aria-hidden', 'true');

  const head = document.createElement('div');
  head.className = 'ask-franklin-head';
  const title = document.createElement('div');
  title.className = 'ask-franklin-title';
  title.innerHTML = '<strong>Ask Franklin</strong><span>Community helper</span>';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'ask-franklin-close';
  close.setAttribute('aria-label', 'Close Ask Franklin');
  close.innerHTML = svg('close');
  head.append(createAvatar(true), title, close);

  const notice = document.createElement('div');
  notice.className = 'ask-franklin-notice';
  notice.textContent = 'Franklin may give inaccurate answers. For the most reliable help, join Discord.';

  const messages = document.createElement('div');
  messages.className = 'ask-franklin-messages';
  messages.setAttribute('role', 'log');
  messages.setAttribute('aria-live', 'polite');
  messages.setAttribute('aria-relevant', 'additions');

  const compose = document.createElement('div');
  compose.className = 'ask-franklin-compose';
  const form = document.createElement('form');
  form.className = 'ask-franklin-form';
  const input = document.createElement('textarea');
  input.className = 'ask-franklin-input';
  input.rows = 1;
  input.maxLength = 500;
  input.placeholder = 'Ask about GTA V or the iOS launcher…';
  input.setAttribute('aria-label', 'Question for Franklin');
  const send = document.createElement('button');
  send.type = 'submit';
  send.className = 'ask-franklin-send';
  send.setAttribute('aria-label', 'Send question');
  send.innerHTML = svg('arrow-right');
  const legal = document.createElement('p');
  legal.className = 'ask-franklin-legal';
  legal.textContent = 'Ask Franklin is a fan-made community feature and is not affiliated with Rockstar Games.';
  form.append(input, send);
  compose.append(form, legal);
  panel.append(head, notice, messages, compose);
  document.body.append(launcher, panel);

  let collapseTimer = 0;
  const clearCollapseTimer = () => {
    if (!collapseTimer) return;
    clearTimeout(collapseTimer);
    collapseTimer = 0;
  };
  const collapseLauncher = () => {
    if (panel.classList.contains('is-open')) return;
    clearCollapseTimer();
    launcher.classList.remove('is-dock-open');
    launcher.dataset.state = 'compact';
    launcher.setAttribute('aria-label', 'Expand Ask Franklin helper');
  };
  const scheduleCollapse = (delay = 4500) => {
    if (panel.classList.contains('is-open')) return;
    clearCollapseTimer();
    collapseTimer = window.setTimeout(collapseLauncher, delay);
  };
  const expandLauncher = () => {
    if (panel.classList.contains('is-open')) return;
    clearCollapseTimer();
    launcher.classList.add('is-dock-open');
    launcher.dataset.state = 'expanded';
    launcher.setAttribute('aria-label', 'Open Ask Franklin chat');
    scheduleCollapse();
  };

  const scrollBottom = () => requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  const botMessage = (text, options = {}) => {
    const row = document.createElement('div');
    row.className = 'ask-franklin-message bot';
    const mini = document.createElement('span');
    mini.className = 'mini-avatar';
    mini.textContent = 'F';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    row.append(mini, bubble);
    messages.append(row);
    if (options.discord) {
      const link = document.createElement('a');
      link.className = 'ask-franklin-discord';
      link.href = DISCORD;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = `Ask the crew on Discord ${svg('arrow-up-right')}`;
      bubble.append(document.createElement('br'), link);
    }
    if (options.source) {
      const link = document.createElement('a');
      link.className = 'ask-franklin-discord';
      link.href = options.source.href;
      link.innerHTML = `Open ${options.source.label} ${svg('arrow-right')}`;
      bubble.append(document.createElement('br'), link);
    }
    scrollBottom();
    return row;
  };
  const userMessage = text => {
    const row = document.createElement('div');
    row.className = 'ask-franklin-message user';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    row.append(bubble);
    messages.append(row);
    scrollBottom();
  };
  const thinking = () => {
    const row = document.createElement('div');
    row.className = 'ask-franklin-message bot is-thinking';
    row.innerHTML = '<span class="mini-avatar">F</span><div class="bubble" aria-label="Franklin is thinking"><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i></div>';
    messages.append(row);
    scrollBottom();
    return row;
  };

  const addQuickActions = () => {
    const wrap = document.createElement('div');
    wrap.className = 'ask-franklin-actions';
    ['Can my iPhone run it?', 'How do I install it?', 'Best settings for 4 GB?', 'Why does it crash?', 'Who is Franklin?'].forEach(label => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ask-franklin-chip';
      button.textContent = label;
      button.addEventListener('click', () => ask(label));
      wrap.append(button);
    });
    messages.append(wrap);
  };

  const sheetDock = document.createElement('button');
  sheetDock.type = 'button';
  sheetDock.className = 'franklin-sheet-dock';
  sheetDock.hidden = true;
  sheetDock.setAttribute('aria-label', 'Open Franklin conversation');
  sheetDock.innerHTML = '<span class="franklin-sheet-grip"></span><span>Franklin</span><span class="franklin-sheet-hint">Swipe up to continue</span>';
  document.body.append(sheetDock);
  const mobileSheet = () => matchMedia('(max-width: 760px)').matches;
  const updateViewport = () => {
    const viewport = window.visualViewport;
    const keyboard = viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
    panel.style.setProperty('--franklin-keyboard', keyboard > 100 ? keyboard + 'px' : '0px');
    panel.style.setProperty('--franklin-viewport', (viewport?.height || window.innerHeight) + 'px');
  };
  window.visualViewport?.addEventListener('resize', updateViewport);
  window.visualViewport?.addEventListener('scroll', updateViewport);
  window.addEventListener('resize', updateViewport);
  updateViewport();
  const open = () => {
    sheetDock.hidden = true;
    launcher.classList.remove('is-sheet-minimized');
    panel.inert = false;
    clearCollapseTimer();
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.classList.remove('is-dock-open');
    launcher.classList.add('is-chat-open');
    launcher.dataset.state = 'chat';
    launcher.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('franklin-open');
    if (!messages.children.length) {
      botMessage("Yo. Franklin here. Ask me about GTA V, the iOS launcher, installation, compatibility, settings, or common problems. If I don't know something for sure, I won't make it up.");
      addQuickActions();
    }
    setTimeout(() => {if(!mobileSheet() && panel.dataset.supportPhase!=='setup')input.focus({ preventScroll: true });}, 180);
  };
  const shut = () => {
    panel.classList.remove('is-open');
    panel.inert = true;
    input.blur();
    panel.setAttribute('aria-hidden', 'true');
    launcher.classList.remove('is-chat-open', 'is-dock-open');
    launcher.dataset.state = 'compact';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Expand Ask Franklin helper');
    document.documentElement.classList.remove('franklin-open');
    if (mobileSheet()) {
      sheetDock.hidden = false;
      launcher.classList.add('is-sheet-minimized');
    }
    window.setTimeout(() => (mobileSheet() ? sheetDock : launcher).focus({ preventScroll: true }), 120);
  };

  launcher.addEventListener('click', () => {
    if (launcher.dataset.state === 'compact') {
      expandLauncher();
      return;
    }
    if (launcher.dataset.state === 'expanded') open();
  });
  launcher.addEventListener('pointerenter', () => {
    if (launcher.dataset.state === 'expanded') clearCollapseTimer();
  });
  launcher.addEventListener('pointerleave', () => {
    if (launcher.dataset.state === 'expanded') scheduleCollapse(3000);
  });
  launcher.addEventListener('focus', () => {
    if (launcher.dataset.state === 'expanded') clearCollapseTimer();
  });
  launcher.addEventListener('blur', () => {
    if (launcher.dataset.state === 'expanded') scheduleCollapse(3000);
  });
  // Gestures are limited to the header/dock, so scrolling and text selection stay native.
  const bindSwipe = (surface, direction, action) => {
    let gesture = null;
    surface.style.touchAction = 'none';
    surface.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button') && surface !== sheetDock) return;
      gesture = {id:event.pointerId, x:event.clientX, y:event.clientY};
      surface.setPointerCapture(event.pointerId);
    });
    surface.addEventListener('pointermove', event => {
      if (!gesture || gesture.id !== event.pointerId || !mobileSheet()) return;
      const delta = (event.clientY - gesture.y) * direction;
      if (delta > 0 && surface === head) panel.style.transform = `translateY(${Math.min(delta, panel.clientHeight)}px)`;
    });
    const end = (event, cancelled) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const delta = (event.clientY - gesture.y) * direction;
      const horizontal = Math.abs(event.clientX - gesture.x);
      gesture = null;
      panel.style.transform = '';
      if (!cancelled && mobileSheet() && delta > 55 && delta > horizontal) action();
    };
    surface.addEventListener('pointerup', event => end(event, false));
    surface.addEventListener('pointercancel', event => end(event, true));
  };
  bindSwipe(head, 1, shut);
  bindSwipe(sheetDock, -1, open);
  sheetDock.addEventListener('click', open);
  close.addEventListener('click', shut);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel.classList.contains('is-open')) shut(); });
  scheduleCollapse(4800);

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
    send.disabled = !input.value.trim();
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (input.value.trim()) form.requestSubmit();
    }
  });
  send.disabled = true;

  const norm = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9+.-]+/g, ' ').trim();
  const words = value => [...new Set(norm(value).split(/\s+/).filter(word => word.length > 2 && !STOP.has(word)))];

  const loadPassages = () => {
    if (passagesPromise) return passagesPromise;
    passagesPromise = Promise.all(SOURCE_PAGES.map(async ([href, label]) => {
      try {
        const response = await fetch(href, { cache: 'no-cache' });
        if (!response.ok) return [];
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return [...doc.querySelectorAll('main h1, main h2, main h3, main p, main li, main summary')]
          .map(node => node.textContent.replace(/\s+/g, ' ').trim())
          .filter(text => text.length >= 28 && text.length <= 560)
          .map(text => ({ text, haystack: norm(text), href, label }));
      } catch { return []; }
    })).then(groups => groups.flat());
    return passagesPromise;
  };

  const searchSite = async question => {
    const queryWords = words(question);
    if (!queryWords.length) return null;
    const passages = await loadPassages();
    let best = null;
    for (const passage of passages) {
      let score = 0;
      for (const word of queryWords) {
        if (passage.haystack.includes(word)) score += word.length > 6 ? 2.25 : 1.3;
      }
      if (passage.haystack.includes(norm(question))) score += 4;
      if (!best || score > best.score) best = { ...passage, score };
    }
    return best && best.score >= Math.max(3.3, queryWords.length * 1.35) ? best : null;
  };

  const manualAnswer = question => {
    const q = norm(question);
    const has = (...terms) => terms.some(term => q.includes(term));

    if (has('siapa franklin', 'who is franklin', 'franklin clinton')) return {
      text: "Yo, that's me. Franklin Clinton is one of GTA V's three playable protagonists, alongside Michael and Trevor. He starts out as a young hustler in Los Santos and gets pulled into much bigger jobs. Around here, I'm also your fan-made community helper."
    };
    if (has('michael', 'trevor') && has('siapa', 'who')) return {
      text: "GTA V has three main protagonists: Michael De Santa, Trevor Philips, and Franklin Clinton. Their stories cross as the crew gets involved in increasingly serious heists around Los Santos and Blaine County."
    };
    if (has('los santos', 'map', 'peta')) return {
      text: "Los Santos is GTA V's main city, inspired by Los Angeles. The wider map also includes Blaine County, deserts, mountains, coastlines, small towns, and plenty of roads to get yourself into trouble on."
    };
    if (has('release gta v', 'rilis gta v', 'kapan gta v')) return {
      text: "GTA V originally released in September 2013. Since then it has appeared across multiple console and PC generations. This iOS project is an independent community port, not an official Rockstar mobile release."
    };
    if (has('install', 'installation', 'cara pasang', 'cara install', 'sideload', 'ipa')) return {
      text: "Aight. Start with the Installation Guide. You need a supported iPhone, a valid app-signing method, the current community IPA instructions, and game files from your own legitimate copy. Don't grab random files from strangers — use the release notes and the community guide.",
      source: { href: 'guide.html', label: 'Installation Guide' }
    };
    if (has('iphone kuat', 'iphone support', 'supported iphone', 'compatib', 'device support', 'bisa jalan', 'can my iphone')) return {
      text: "Don't guess it from the phone name alone, homie. Open the Compatibility checker so it can use your saved iPhone model and show the hardware guidance. A12-family support is experimental in the releases documented by this community, and memory matters a lot.",
      source: { href: 'compatibility.html', label: 'Compatibility' }
    };
    if (has('4 gb', '4gb', 'low memory', 'lowmem', 'ram rendah')) return {
      text: "On a 4 GB iPhone, keep it conservative. Start with the lowest preset, keep low-memory mode enabled when the launcher provides it, use a low render resolution, avoid MSAA, and watch heat and memory pressure. Four gigs doesn't leave much headroom.",
      source: { href: 'guide.html#memory', label: 'Memory Guide' }
    };
    if (has('memrestrict', 'texture cache')) return {
      text: "memrestrict is treated by this site's configuration checker as the texture-cache value in MB. The checker compares it with installed RAM as one part of its rule-based estimate. It isn't the game's total memory use.",
      source: { href: 'compatibility.html#performance-check', label: 'Performance Check' }
    };
    if (has('crash', 'force close', 'keluar sendiri', 'menutup sendiri', 'close while loading')) return {
      text: "If the app drops out while loading, first check signing validity, local storage, game-file completeness, and memory pressure. On lower-memory devices, reduce graphics settings and review the memory guidance. If it still crashes, bring your exact iPhone model, iOS version, build version, and error/log to Discord.",
      source: { href: 'guide.html#troubleshooting', label: 'Troubleshooting' }
    };
    if (has('fps', 'lag', 'stutter', 'patah patah', 'performance', 'panas', 'heat', 'thermal')) return {
      text: "For smoother play, lower resolution before stacking expensive graphics options, disable MSAA, keep shadows modest, and leave some memory headroom. Heat can become the limiter even when the GPU still has room, so a high FPS target isn't always the smartest move.",
      source: { href: 'technicalities.html#performance-power', label: 'Performance Notes' }
    };
    if (has('metalfx')) return {
      text: "MetalFX is part of the project's graphics options and can be used for upscaling. The best choice depends on device, target resolution, and thermal headroom — don't assume the highest-looking setting is automatically the fastest.",
      source: { href: 'technicalities.html', label: 'Technicalities' }
    };
    if (has('dxmt', 'metal rendering', 'native arm64', 'emulation', 'native port')) return {
      text: "This project is documented as a native arm64 build, with GTA V's D3D11 renderer translated to Metal through DXMT. The current technical notes explicitly distinguish it from the earlier emulation attempt.",
      source: { href: 'technicalities.html', label: 'Technicalities' }
    };
    if (has('controller', 'gamepad', 'touch control', 'touch input')) return {
      text: "The technical notes describe touch controls as a virtual XInput gamepad with layouts for different game contexts. A physical controller can hide the touch overlay.",
      source: { href: 'technicalities.html#controls-ux', label: 'Controls Notes' }
    };
    if (has('save', 'save data', 'saves', 'backup')) return {
      text: "Back up your saves before replacing or reinstalling the app. Don't assume a reinstall will preserve data — check the release notes and your signing method before deleting anything.",
      source: { href: 'guide.html#updates', label: 'Updates & Saves' }
    };
    if (has('update terbaru', 'latest update', 'new update', 'versi terbaru')) return {
      text: "I don't want to fake a 'latest' version number, bro. The Updates page is the source of truth on this site, and Discord is where the community posts release-specific instructions.",
      source: { href: 'updates.html', label: 'Updates' }
    };
    if (has('discord', 'staff', 'community')) return {
      text: "Yeah, that's the crew. If you need release-specific help or something I can't verify, hit the Discord and ask the staff or community directly.",
      discord: true
    };
    return null;
  };

  const answer = async question => {
    const manual = manualAnswer(question);
    if (manual) return manual;
    const site = await searchSite(question);
    if (site) return {
      text: `Aight, I found something relevant in the community docs: ${site.text}`,
      source: { href: site.href, label: site.label }
    };
    return {
      text: "Aight, I don't have a solid answer for that, homie. I don't wanna make something up. It's better if you join the Discord and ask the staff or community directly.",
      discord: true
    };
  };

  let busy = false;
  async function ask(raw) {
    const question = String(raw || '').trim();
    if (!question || busy) return;
    if (!panel.classList.contains('is-open')) open();
    busy = true;
    send.disabled = true;
    userMessage(question);
    input.value = '';
    input.style.height = 'auto';
    const wait = thinking();
    try {
      const result = await answer(question);
      await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 60 : 360));
      wait.remove();
      botMessage(result.text, result);
    } catch {
      wait.remove();
      botMessage("Man, something went sideways on my end. Try that again, or ask the crew on Discord if you need an answer right now.", { discord: true });
    } finally {
      busy = false;
      send.disabled = !input.value.trim();
      input.focus({ preventScroll: true });
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    ask(input.value);
  });
})();