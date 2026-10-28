/**
 * Cloudflare Pages Function -> POST /api/moderate
 * Body: { text: string }
 */
import Core from '../lib/guard-core.mjs';

const MAX_LEN = 4000;
const LOCK_SECONDS = [0, 0, 30, 300, 1800, 86400];

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, code: 'bad_request' }, 400); }

  const text = typeof body.text === 'string' ? body.text : '';
  if (!text.trim()) return json({ ok: false, code: 'empty' }, 400);
  if (text.length > MAX_LEN) return json({ ok: false, code: 'too_long' }, 413);

  const useLock = env && env.GUARD_KV && String(env.GUARD_SERVER_LOCK) === '1';
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = 'guard:' + ip;
  const now = Date.now();
  let st = { strikes: 0, lockUntil: 0 };

  if (useLock) {
    try {
      const raw = await env.GUARD_KV.get(key);
      if (raw) st = JSON.parse(raw);
    } catch {}
    if (st.lockUntil > now) {
      const retryAfter = Math.ceil((st.lockUntil - now) / 1000);
      return json({ ok: false, code: 'locked', retryAfter }, 429, { 'Retry-After': String(retryAfter) });
    }
  }

  const verdict = Core.check(text);
  if (!verdict.flagged) return json({ ok: true });

  let retryAfter = 0;
  if (useLock) {
    st.strikes += verdict.level === 2 ? 2 : 1;
    retryAfter = LOCK_SECONDS[Math.min(st.strikes, LOCK_SECONDS.length - 1)];
    if (retryAfter > 0) st.lockUntil = now + retryAfter * 1000;
    try { await env.GUARD_KV.put(key, JSON.stringify(st), { expirationTtl: 86400 }); } catch {}
  }

  return json({
    ok: false,
    code: retryAfter > 0 ? 'locked' : 'toxic',
    level: verdict.level,
    strikes: st.strikes,
    retryAfter
  }, 422);
}

export async function onRequest() {
  return json({ ok: false, code: 'method_not_allowed' }, 405, { Allow: 'POST' });
}
