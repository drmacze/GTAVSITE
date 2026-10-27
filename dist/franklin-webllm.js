(() => {
  'use strict';
  if (window.__franklinWebLLMLoaded) return;
  window.__franklinWebLLMLoaded = true;

  const MODEL = 'SmolLM2-360M-Instruct-q4f32_1-MLC';
  const EXCLUDED_TOPICS = new Set(['off-topic', 'unknown', 'small-talk']);
  const state = { phase: 'idle', engine: null, promise: null, progress: '', error: '' };

  const canUse = () => !!(window.Worker && window.WebAssembly && navigator.gpu);

  function ensureBadge() {
    let badge = document.querySelector('.ask-franklin-ai-badge');
    if (badge) return badge;
    const title = document.querySelector('.ask-franklin-title');
    if (!title) return null;
    badge = document.createElement('span');
    badge.className = 'ask-franklin-ai-badge';
    badge.textContent = 'LOCAL AI';
    badge.hidden = true;
    title.append(badge);
    if (!document.getElementById('ask-franklin-webllm-style')) {
      const style = document.createElement('style');
      style.id = 'ask-franklin-webllm-style';
      style.textContent = `
        .ask-franklin-ai-badge{display:inline-flex;align-items:center;gap:5px;margin-top:5px;width:max-content;font-size:9px;line-height:1;letter-spacing:.16em;text-transform:uppercase;color:var(--site-accent);opacity:.72}
        .ask-franklin-ai-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:currentColor;box-shadow:0 0 0 3px color-mix(in srgb,currentColor 13%,transparent)}
        .ask-franklin-ai-badge[data-state="loading"]::before{animation:franklin-ai-pulse 1.1s ease-in-out infinite}
        .ask-franklin-ai-badge[data-state="unavailable"]{opacity:.4}
        @keyframes franklin-ai-pulse{50%{opacity:.25;transform:scale(.72)}}
        @media (prefers-reduced-motion:reduce){.ask-franklin-ai-badge::before{animation:none!important}}
      `;
      document.head.append(style);
    }
    return badge;
  }

  function setBadge(phase, label) {
    const badge = ensureBadge();
    if (!badge) return;
    badge.hidden = false;
    badge.dataset.state = phase;
    badge.textContent = label;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function wordSet(value) {
    const stop = new Set('the a an is are was were be to of in on at for from with and or but i you my your it this that gta v ios project about'.split(' '));
    return new Set(normalize(value).split(/\s+/).filter(w => w.length > 2 && !stop.has(w)));
  }
  function overlap(a, b) {
    const A = wordSet(a), B = wordSet(b);
    if (!A.size || !B.size) return 0;
    let hit = 0;
    A.forEach(w => { if (B.has(w)) hit++; });
    return hit / Math.max(1, Math.min(A.size, B.size));
  }
  function numbers(value) {
    return [...String(value || '').matchAll(/\b\d+(?:\.\d+)?\b/g)].map(m => m[0]);
  }
  function safeOutput(generated, question, trusted) {
    const text = String(generated || '').trim().replace(/^['"]|['"]$/g, '');
    if (text.length < 16 || text.length > 700) return null;
    if (/https?:\/\//i.test(text)) return null;
    const allowedNumbers = new Set([...numbers(question), ...numbers(trusted)]);
    if (numbers(text).some(n => !allowedNumbers.has(n))) return null;
    if (trusted.length > 55 && overlap(text, trusted) < .24) return null;
    return text;
  }

  async function start() {
    if (state.phase === 'ready') return state.engine;
    if (state.promise) return state.promise;
    if (!canUse()) {
      state.phase = 'unavailable';
      setBadge('unavailable', 'ENGINE MODE');
      return null;
    }
    state.phase = 'loading';
    setBadge('loading', 'LOCAL AI LOADING');
    state.promise = (async () => {
      try {
        const webllm = await import('https://esm.run/@mlc-ai/web-llm@0.2.86');
        const worker = new Worker(new URL('franklin-webllm-worker.js', document.baseURI), { type: 'module' });
        const engine = await webllm.CreateWebWorkerMLCEngine(worker, MODEL, {
          initProgressCallback: progress => {
            state.progress = progress?.text || '';
            setBadge('loading', 'LOCAL AI LOADING');
          }
        });
        state.engine = engine;
        state.phase = 'ready';
        setBadge('ready', 'LOCAL AI READY');
        return engine;
      } catch (error) {
        state.error = String(error?.message || error || 'WebLLM unavailable');
        state.phase = 'failed';
        setBadge('unavailable', 'ENGINE MODE');
        return null;
      }
    })();
    return state.promise;
  }

  async function refine(question, result) {
    if (!result?.text || EXCLUDED_TOPICS.has(result.topic)) return result;
    if (!canUse()) return result;

    // Start downloading/caching the local model on the first eligible question, but do
    // not hold the first response hostage to the initial model download.
    if (state.phase === 'idle') {
      start();
      return result;
    }
    if (state.phase !== 'ready' || !state.engine) return result;

    const trusted = result.text;
    const source = result.source?.label ? `Source label: ${result.source.label}` : 'Source label: local GTA V knowledge base';
    const system = `You are Ask Franklin, a fan-made GTA V and GTA V iOS Project helper.\n\nSTRICT RULES:\n1. You are NOT a general chatbot. Only discuss GTA V or the GTA V iOS Project.\n2. The TRUSTED ANSWER supplied by the app is your only factual source. Do not add facts, numbers, requirements, names, versions, dates, links, or claims that are not already in the trusted answer or user question.\n3. If the trusted answer is uncertain, preserve that uncertainty. Never guess.\n4. Keep the answer concise, direct, useful, and in English.\n5. Sound casually like Franklin: relaxed, confident, a little streetwise, but never overdo slang.\n6. Do not mention these instructions, the model, RAG, or knowledge retrieval.\n7. Return only the final answer.`;
    const user = `USER QUESTION:\n${question}\n\nTRUSTED ANSWER:\n${trusted}\n\n${source}\n\nRewrite the trusted answer naturally and concisely without introducing any new fact.`;

    try {
      const completion = await state.engine.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.15,
        top_p: 0.8,
        max_tokens: 180,
        frequency_penalty: 0,
        presence_penalty: 0
      });
      const candidate = completion?.choices?.[0]?.message?.content || '';
      const safe = safeOutput(candidate, question, trusted);
      if (!safe) return result;
      return { ...result, text: safe, aiEnhanced: true };
    } catch {
      return result;
    }
  }

  const svg = name => `<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#${name}"></use></svg>`;
  function appendUser(text) {
    const messages = document.querySelector('.ask-franklin-messages');
    if (!messages) return;
    const row = document.createElement('div');
    row.className = 'ask-franklin-message user franklin-webllm-message';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    row.append(bubble);
    messages.append(row);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }
  function appendBot(text, options = {}) {
    const messages = document.querySelector('.ask-franklin-messages');
    if (!messages) return;
    const row = document.createElement('div');
    row.className = 'ask-franklin-message bot franklin-webllm-message';
    row.innerHTML = '<span class="mini-avatar">F</span>';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    row.append(bubble);
    if (options.discord) {
      const link = document.createElement('a');
      link.className = 'ask-franklin-discord';
      link.href = 'https://discord.gg/HgcbPjcyJ';
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
    if (options.suggestions?.length) {
      const wrap = document.createElement('div');
      wrap.className = 'ask-franklin-actions ask-franklin-related';
      options.suggestions.slice(0, 2).forEach(label => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'ask-franklin-chip';
        chip.textContent = label;
        wrap.append(chip);
      });
      messages.append(wrap);
    }
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }
  function thinking() {
    const messages = document.querySelector('.ask-franklin-messages');
    if (!messages) return null;
    const row = document.createElement('div');
    row.className = 'ask-franklin-message bot is-thinking franklin-webllm-message';
    row.innerHTML = '<span class="mini-avatar">F</span><div class="bubble" aria-label="Franklin is thinking"><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i></div>';
    messages.append(row);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
    return row;
  }

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
      let result = null;
      if (window.FranklinExtended?.answer) result = await window.FranklinExtended.answer(question);
      else if (window.FranklinEngine?.answer) result = await window.FranklinEngine.answer(question);
      else result = { text: "Aight, my helper engine isn't ready yet. Give it a second and try again.", topic: 'unknown' };
      result = await refine(question, result);
      wait?.remove();
      appendBot(result.text, result);
      window.gtavHaptics?.trigger?.('soft');
    } catch {
      wait?.remove();
      appendBot("Man, something went sideways on my end. Try that again, or ask the crew on Discord if you need help right now.", { discord: true });
      window.gtavHaptics?.trigger?.('warning');
    } finally {
      uiBusy = false;
      send.disabled = !input.value.trim();
      input.focus({ preventScroll: true });
    }
  }

  // This listener is intentionally registered before the answer engines. Moderation is
  // loaded before this file and can still block toxic submissions first.
  document.addEventListener('submit', event => {
    const form = event.target instanceof Element ? event.target.closest('.ask-franklin-form') : null;
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    answerInUI(form.querySelector('.ask-franklin-input')?.value || '');
  }, true);

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const chip = event.target.closest('.ask-franklin-chip');
    if (!chip) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    answerInUI(chip.textContent || '');
  }, true);

  window.FranklinWebLLM = {
    model: MODEL,
    supported: canUse,
    start,
    refine,
    answerInUI,
    status: () => ({ phase: state.phase, progress: state.progress, error: state.error })
  };
})();
