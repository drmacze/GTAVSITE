(() => {
  'use strict';
  if (window.__franklinModerationLoaded) return;
  window.__franklinModerationLoaded = true;

  const STRIKE_KEY = 'ask-franklin-moderation-strikes';
  const MAX_STRIKES = 3;

  // Keep this deliberately focused on harassment/profanity/spam. GTA terms such as
  // gun, kill, heist, weapon, police, wanted and mission are intentionally NOT blocked.
  const STRONG = [
    'fuck','fucker','fucking','motherfucker','bitch','asshole','cunt','dickhead',
    'ngentot','kontol','memek','jembut','bangsat','bajingan','keparat'
  ];
  const MILD = [
    'idiot','moron','stupid','dumbass','goblok','tolol','bodoh','anjing','babi'
  ];
  const PHRASES = [
    /\bkill\s+yourself\b/i,
    /\bgo\s+die\b/i,
    /\bkys\b/i,
    /\b(?:you|u)\s+(?:are|re|r)\s+(?:an?\s+)?(?:idiot|moron|stupid|dumbass|bitch|asshole)\b/i,
    /\b(?:dasar|lu|lo|kamu)\s+(?:goblok|tolol|bodoh|anjing|babi|bangsat)\b/i
  ];

  const canonical = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  function getStrikes() {
    try { return Math.max(0, Math.min(MAX_STRIKES, Number(sessionStorage.getItem(STRIKE_KEY)) || 0)); }
    catch { return 0; }
  }
  function setStrikes(value) {
    const next = Math.max(0, Math.min(MAX_STRIKES, value));
    try { sessionStorage.setItem(STRIKE_KEY, String(next)); } catch {}
    return next;
  }

  function repeatedSpam(text) {
    if (/(.)\1{10,}/i.test(text)) return true;
    const words = canonical(text).split(' ').filter(Boolean);
    if (words.length < 6) return false;
    const counts = new Map();
    for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
    return [...counts.values()].some(count => count >= 6);
  }

  function analyze(raw) {
    const text = String(raw || '').trim();
    if (!text) return { blocked: false, severity: 0, reasons: [] };
    const clean = canonical(text);
    const tokens = clean.split(' ').filter(Boolean);
    const reasons = [];
    let severity = 0;

    for (const re of PHRASES) {
      if (re.test(text)) {
        severity = Math.max(severity, 3);
        reasons.push('harassment');
      }
    }

    const strongHits = tokens.filter(token => STRONG.includes(token));
    const mildHits = tokens.filter(token => MILD.includes(token));
    if (strongHits.length) {
      severity = Math.max(severity, 2);
      reasons.push('profanity');
    }
    // One mild word can be contextual; two or more, or a direct-address construction,
    // is much more likely to be toxic.
    const directed = /\b(you|u|lu|lo|kamu|anda)\b/i.test(text);
    if (mildHits.length >= 2 || (mildHits.length >= 1 && directed)) {
      severity = Math.max(severity, 1);
      reasons.push('insult');
    }
    if (repeatedSpam(text)) {
      severity = Math.max(severity, 1);
      reasons.push('spam');
    }

    return { blocked: severity > 0, severity, reasons: [...new Set(reasons)] };
  }

  function censor(raw) {
    let output = String(raw || '');
    for (const re of PHRASES) output = output.replace(re, match => '•'.repeat(Math.min(10, Math.max(4, match.length))));
    const all = [...STRONG, ...MILD].sort((a, b) => b.length - a.length);
    for (const word of all) {
      const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi');
      output = output.replace(re, match => '•'.repeat(Math.min(8, Math.max(4, match.length))));
    }
    return output;
  }

  function avatar() {
    const mini = document.createElement('span');
    mini.className = 'mini-avatar';
    mini.textContent = 'F';
    return mini;
  }

  function appendUser(text) {
    const messages = document.querySelector('.ask-franklin-messages');
    if (!messages) return;
    const row = document.createElement('div');
    row.className = 'ask-franklin-message user franklin-moderated-message';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    bubble.setAttribute('aria-label', 'Message censored by community moderation');
    row.append(bubble);
    messages.append(row);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  function appendWarning(strike) {
    const messages = document.querySelector('.ask-franklin-messages');
    if (!messages) return;
    const row = document.createElement('div');
    row.className = 'ask-franklin-message bot franklin-moderation-warning';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const lines = [
      "Yo, keep it respectful, homie. That message crossed the line. Ask me about GTA V or the iOS project without the toxic stuff.",
      "Aight, that's the second warning. Keep the chat clean and follow the community rules. I can help, but not if the conversation stays toxic.",
      "Nah, I'm not rolling with that. You've hit the warning limit for this session. Keep it respectful and stay within the community rules if you want help."
    ];
    bubble.textContent = lines[Math.min(strike, 3) - 1];
    row.append(avatar(), bubble);
    messages.append(row);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  function style() {
    if (document.getElementById('franklin-moderation-style')) return;
    const el = document.createElement('style');
    el.id = 'franklin-moderation-style';
    el.textContent = `
      .franklin-moderated-message .bubble{opacity:.62;text-decoration:none;letter-spacing:.035em}
      .franklin-moderation-warning .bubble{border-inline-start:2px solid var(--site-accent);padding-inline-start:14px}
      .franklin-moderation-warning .mini-avatar{box-shadow:0 0 0 1px color-mix(in srgb,var(--site-accent) 55%,transparent)}
    `;
    document.head.append(el);
  }

  function moderateSubmission(event) {
    const form = event.target instanceof Element ? event.target.closest('.ask-franklin-form') : null;
    if (!form) return;
    const input = form.querySelector('.ask-franklin-input');
    const raw = input?.value || '';
    const result = analyze(raw);
    if (!result.blocked) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const strike = setStrikes(getStrikes() + 1);
    appendUser(censor(raw));
    appendWarning(strike);
    if (input) {
      input.value = '';
      input.style.height = 'auto';
    }
    form.querySelector('.ask-franklin-send')?.setAttribute('disabled', '');
    window.gtavHaptics?.trigger?.('warning');
  }

  style();
  document.addEventListener('submit', moderateSubmission, true);

  window.FranklinModeration = {
    analyze,
    censor,
    getStrikes,
    reset: () => setStrikes(0)
  };
})();