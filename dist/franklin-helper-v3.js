(() => {
  'use strict';
  if (window.__franklinHelperV3Loaded) return;
  window.__franklinHelperV3Loaded = true;

  const I18n = window.FranklinI18n;
  const Guard = window.FranklinGuard;
  if (!I18n || !Guard) { console.error('[Franklin v3] i18n/guard dependencies are missing.'); return; }

  const panel = document.querySelector('.ask-franklin-panel');
  const input = document.querySelector('.ask-franklin-input');
  const send = document.querySelector('.ask-franklin-send');
  const messages = document.querySelector('.ask-franklin-messages');
  if (!panel || !input || !send || !messages) return;

  const svg = name => `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;
  const state = { busy: false, serverLockUntil: 0, serverTimer: 0 };

  function injectStyle() {
    if (document.getElementById('franklin-helper-v3-style')) return;
    const style = document.createElement('style');
    style.id = 'franklin-helper-v3-style';
    style.textContent = `.franklin-language-control{position:relative;display:flex;align-items:center;min-width:0;margin-inline-end:2px}.franklin-language-control::before{content:'🌐';position:absolute;inset-inline-start:9px;top:50%;transform:translateY(-52%);font-size:12px;pointer-events:none;z-index:2;filter:saturate(.8)}.franklin-language-select{appearance:none;-webkit-appearance:none;height:36px;min-width:72px;max-width:116px;padding:0 24px 0 29px;border:1px solid color-mix(in srgb,var(--site-accent) 22%,var(--settings-line));border-radius:11px;background:color-mix(in srgb,var(--settings-bg) 72%,transparent);color:var(--settings-text);font:650 10px/1 'DM Sans',Arial,sans-serif;letter-spacing:.04em;outline:0;box-shadow:inset 0 1px 0 #ffffff10;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.franklin-language-control::after{content:'⌄';position:absolute;inset-inline-end:8px;top:48%;transform:translateY(-50%);font-size:11px;color:var(--settings-muted);pointer-events:none}.franklin-language-select:focus{border-color:color-mix(in srgb,var(--site-accent) 62%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,var(--site-accent) 10%,transparent),inset 0 1px 0 #ffffff12}.franklin-safety-message .bubble{border-inline-start:2px solid var(--site-accent);padding-inline-start:14px}.franklin-safety-message[data-level="severe"] .bubble{border-inline-start-color:#ef4444}.franklin-safety-message[data-level="rate"] .bubble{border-inline-start-color:#f59e0b}.franklin-guard-status{display:flex;align-items:center;gap:7px;min-height:27px;padding:0 18px;border-top:1px solid var(--settings-line);font-size:9px;color:var(--settings-muted);letter-spacing:.02em}.franklin-guard-status[hidden]{display:none}.franklin-guard-status::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--site-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--site-accent) 12%,transparent)}.franklin-guard-status.is-locked::before{background:#f59e0b;box-shadow:0 0 0 3px #f59e0b1f}.franklin-v3-message.is-typing .bubble{min-width:18px}@media(max-width:760px){.franklin-language-select{height:34px;min-width:67px;max-width:92px;padding-inline-start:27px;padding-inline-end:20px;font-size:9px}.franklin-language-control::before{inset-inline-start:8px;font-size:11px}.franklin-language-control::after{inset-inline-end:7px}}@media(max-width:390px){.franklin-language-select{max-width:76px}}`;
    document.head.append(style);
  }

  function setupI18n() {
    input.setAttribute('data-i18n-placeholder', 'placeholder');
    input.setAttribute('data-i18n-aria-label', 'placeholder');
    send.setAttribute('data-i18n-aria-label', 'send');
    const actions = document.querySelector('.franklin-head-actions');
    if (actions && !actions.querySelector('.franklin-language-control')) {
      const wrap = document.createElement('label');
      wrap.className = 'franklin-language-control';
      wrap.setAttribute('aria-label', I18n.t('language'));
      const select = document.createElement('select');
      select.className = 'franklin-language-select'; select.id = 'franklin-language';
      I18n.mountSelect(select); wrap.append(select); actions.prepend(wrap);
    }
    const apply = () => { I18n.apply(panel); const wrap = panel.querySelector('.franklin-language-control'); if (wrap) wrap.setAttribute('aria-label', I18n.t('language')); };
    I18n.onChange(apply); apply();
  }

  function setupStatus() {
    let status = panel.querySelector('.franklin-guard-status');
    if (!status) { status = document.createElement('div'); status.className = 'franklin-guard-status'; status.hidden = true; const compose = panel.querySelector('.ask-franklin-compose'); if (compose) compose.before(status); }
    return status;
  }

  injectStyle(); setupI18n(); const statusBar = setupStatus();

  function appendSafety(text, level = 'info') {
    if (!text) return;
    const row = document.createElement('div'); row.className = 'ask-franklin-message bot franklin-safety-message'; row.dataset.level = level;
    const mini = document.createElement('span'); mini.className = 'mini-avatar'; mini.textContent = 'F';
    const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = text;
    row.append(mini, bubble); messages.append(row); requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
    window.gtavHaptics?.trigger?.(level === 'severe' ? 'warning' : 'soft');
  }

  function appendUser(text) { const row = document.createElement('div'); row.className = 'ask-franklin-message user franklin-v3-message'; const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = text; row.append(bubble); messages.append(row); requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; }); }
  function thinking() { const row = document.createElement('div'); row.className = 'ask-franklin-message bot is-thinking franklin-v3-message'; row.innerHTML = '<span class="mini-avatar">F</span><div class="bubble" aria-label="Franklin is thinking"><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i></div>'; messages.append(row); requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; }); return row; }
  async function typeText(target, text) { if (window.FranklinTyping?.reveal) return window.FranklinTyping.reveal(target, text); target.textContent = text; }

  async function appendBot(text, options = {}) {
    const row = document.createElement('div'); row.className = 'ask-franklin-message bot franklin-v3-message is-typing'; row.innerHTML = '<span class="mini-avatar">F</span>';
    const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.setAttribute('aria-live', 'polite'); row.append(bubble); messages.append(row); requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
    await typeText(bubble, text); if (!row.isConnected) return; row.classList.remove('is-typing');
    if (options.discord) { const link = document.createElement('a'); link.className = 'ask-franklin-discord'; link.href = 'https://discord.gg/HgcbPjcyJ'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.innerHTML = `Ask the crew on Discord ${svg('arrow-up-right')}`; bubble.append(document.createElement('br'), link); }
    if (options.source?.href) { const link = document.createElement('a'); link.className = 'ask-franklin-discord'; link.href = options.source.href; link.innerHTML = `Open ${options.source.label || 'source'} ${svg('arrow-right')}`; bubble.append(document.createElement('br'), link); }
    if (options.suggestions?.length) { const wrap = document.createElement('div'); wrap.className = 'ask-franklin-actions ask-franklin-related'; options.suggestions.slice(0, 2).forEach(label => { const chip = document.createElement('button'); chip.type = 'button'; chip.className = 'ask-franklin-chip'; chip.textContent = label; wrap.append(chip); }); messages.append(wrap); }
    messages.scrollTop = messages.scrollHeight;
  }

  function disableComposer(disabled, lockText = '') {
    input.disabled = disabled; send.disabled = disabled || !input.value.trim(); panel.querySelector('.helper-paste')?.toggleAttribute('disabled', disabled); panel.querySelector('.helper-attach')?.toggleAttribute('disabled', disabled);
    if (disabled && lockText) { statusBar.hidden = false; statusBar.classList.add('is-locked'); statusBar.textContent = lockText; }
    else if (!state.busy) { statusBar.hidden = true; statusBar.classList.remove('is-locked'); statusBar.textContent = ''; }
  }

  const guard = Guard.create({ profanityMode: 'block', maxLength: 1500, minIntervalMs: 1200, maxPerMinute: 12, duplicateWindowMs: 30000,
    onLockChange: ({ locked, time }) => { const serverLocked = state.serverLockUntil > Date.now(); if (locked || serverLocked) { const remaining = serverLocked ? Guard.formatTime(state.serverLockUntil - Date.now()) : time; disableComposer(true, I18n.t('locked', undefined, { time: remaining })); } else disableComposer(false); }
  });
  guard.watchLock();

  function serverLockTick() { if (state.serverLockUntil <= Date.now()) { state.serverLockUntil = 0; if (state.serverTimer) clearInterval(state.serverTimer); state.serverTimer = 0; guard.watchLock(); return; } const time = Guard.formatTime(state.serverLockUntil - Date.now()); disableComposer(true, I18n.t('locked', undefined, { time })); }

  async function serverModerate(text) {
    try {
      const response = await fetch('/api/moderate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify({ text }) });
      if (response.ok) return { ok: true };
      const data = await response.json().catch(() => ({}));
      if (response.status === 429 || data.code === 'locked') { const retry = Math.max(1, Number(data.retryAfter) || 30); state.serverLockUntil = Date.now() + retry * 1000; if (!state.serverTimer) state.serverTimer = setInterval(serverLockTick, 1000); serverLockTick(); return { ok: false, message: I18n.t('locked', undefined, { time: Guard.formatTime(retry * 1000) }), level: 'rate' }; }
      return { ok: false, message: data.level === 2 ? I18n.t('severe', undefined, { time: '0:00' }) : I18n.t('warn1'), level: data.level === 2 ? 'severe' : 'info' };
    } catch (error) { console.warn('[Franklin v3] server moderation unavailable:', error); return { ok: true, degraded: true }; }
  }

  const numbers = value => [...String(value || '').matchAll(/\b\d+(?:\.\d+)?\b/g)].map(m => m[0]);
  async function multilingualRefine(question, result, lang) {
    if (!result?.text) return result; const web = window.FranklinWebLLM; if (!web?.supported?.()) return result;
    const status = web.status?.(); if (!status || status.phase === 'idle') { web.start?.(); return result; } if (status.phase !== 'ready') return result;
    try {
      const engine = await web.start(); if (!engine?.chat?.completions?.create) return result; const trusted = String(result.text);
      const base = ['You are Franklin, a fan-made GTA V and GTA V iOS Project helper.','','STRICT GROUNDING RULES:','1. The TRUSTED ANSWER below is your only factual source.','2. Rewrite or translate it naturally without adding facts, numbers, versions, dates, links, requirements, or claims.','3. Preserve uncertainty exactly. Never guess.','4. Keep names of menus, files, folders, builds, settings, and project terms exactly as written when they are identifiers.','5. Keep the answer concise and useful. Return only the final answer.'].join('\n');
      const system = I18n.buildSystemPrompt(base, lang); const user = `LATEST USER MESSAGE:\n${question}\n\nTRUSTED ANSWER:\n${trusted}\n\nRewrite the TRUSTED ANSWER in the user's language.`;
      const completion = await engine.chat.completions.create({ messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.1, top_p: 0.8, max_tokens: 220, frequency_penalty: 0, presence_penalty: 0 });
      const candidate = String(completion?.choices?.[0]?.message?.content || '').trim().replace(/^["']|["']$/g, ''); if (candidate.length < 8 || candidate.length > 900 || /https?:\/\//i.test(candidate)) return result;
      const allowedNumbers = new Set([...numbers(question), ...numbers(trusted)]); if (numbers(candidate).some(n => !allowedNumbers.has(n))) return result;
      return { ...result, text: candidate, aiEnhanced: true, language: lang };
    } catch (error) { console.warn('[Franklin v3] multilingual local-AI refinement skipped:', error); return result; }
  }

  async function getGroundedAnswer(question) {
    let result = null; if (window.FranklinSiteRAG?.answer) result = await window.FranklinSiteRAG.answer(question); if (!result && window.FranklinExtended?.answer) result = await window.FranklinExtended.answer(question); if (!result && window.FranklinEngine?.answer) result = await window.FranklinEngine.answer(question);
    return result || { text: "Aight, my helper engine isn't ready yet. Give it a second and try again.", topic: 'unknown' };
  }

  async function processMessage(raw) {
    const generation = window.FranklinSession?.generation; const question = String(raw || '').trim(); if (!question || state.busy) return;
    if (state.serverLockUntil > Date.now()) { serverLockTick(); appendSafety(I18n.t('locked', undefined, { time: Guard.formatTime(state.serverLockUntil - Date.now()) }), 'rate'); return; }
    const verdict = guard.check(question); if (!verdict.ok) { appendSafety(verdict.message, verdict.level === 2 ? 'severe' : verdict.code === 'rate' ? 'rate' : 'info'); return; } if (verdict.softWarning) appendSafety(verdict.softWarning, 'info');
    const lang = I18n.resolve(question); I18n.apply(panel); state.busy = true; send.disabled = true;
    const server = await serverModerate(question); if (!server.ok) { state.busy = false; appendSafety(server.message, server.level || 'info'); send.disabled = !input.value.trim() || guard.isLocked(); return; }
    appendUser(question); input.value = ''; input.style.height = 'auto'; const wait = thinking();
    try { let result = await getGroundedAnswer(question); result = await multilingualRefine(question, result, lang); if (generation !== window.FranklinSession?.generation) return; wait?.remove(); await appendBot(result.text, result); window.gtavHaptics?.trigger?.('soft'); }
    catch (error) { if (generation !== window.FranklinSession?.generation) return; wait?.remove(); appendSafety(I18n.t('error'), 'rate'); console.error('[Franklin v3] answer error:', error); }
    finally { if (generation !== window.FranklinSession?.generation) return; state.busy = false; send.disabled = !input.value.trim() || guard.isLocked() || state.serverLockUntil > Date.now(); if (!send.disabled && !matchMedia('(max-width:760px)').matches) input.focus({ preventScroll: true }); }
  }

  document.addEventListener('submit', event => { const form = event.target instanceof Element ? event.target.closest('.ask-franklin-form') : null; if (!form) return; event.preventDefault(); event.stopImmediatePropagation(); processMessage(form.querySelector('.ask-franklin-input')?.value || ''); }, true);
  document.addEventListener('click', event => { if (!(event.target instanceof Element)) return; const chip = event.target.closest('.ask-franklin-chip'); if (!chip) return; event.preventDefault(); event.stopImmediatePropagation(); processMessage(chip.textContent || ''); }, true);
  document.addEventListener('franklin-disconnect', () => { state.busy = false; window.FranklinTyping?.finish?.(); });

  window.FranklinHelperV3 = { guard, processMessage, serverModerate, language: I18n, version: '2026.10.28' };
})();