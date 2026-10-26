const COOKIE_NAME = 'gtav_visit_session';
const SESSION_TTL_SECONDS = 30 * 60;

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

function hasVisitCookie(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .some(part => part.startsWith(`${COOKIE_NAME}=`));
}

export async function onRequest(context) {
  const {request, env} = context;

  if (!['GET', 'POST'].includes(request.method)) {
    return json({error: 'method_not_allowed'}, 405, {Allow: 'GET, POST'});
  }

  if (!env.VISITS_DB) {
    return json({error: 'counter_unavailable'}, 503);
  }

  try {
    await env.VISITS_DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_counters (
        name TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await env.VISITS_DB.prepare(`
      INSERT INTO site_counters (name, value)
      VALUES ('visits', 0)
      ON CONFLICT(name) DO NOTHING
    `).run();

    const headers = {};
    const cookieHeader = request.headers.get('Cookie') || '';
    const alreadyCounted = hasVisitCookie(cookieHeader);

    if (request.method === 'POST' && !alreadyCounted) {
      const origin = request.headers.get('Origin');
      const requestOrigin = new URL(request.url).origin;

      if (origin && origin !== requestOrigin) {
        return json({error: 'origin_not_allowed'}, 403);
      }

      await env.VISITS_DB.prepare(`
        UPDATE site_counters
        SET value = value + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE name = 'visits'
      `).run();

      headers['Set-Cookie'] = `${COOKIE_NAME}=1; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
    }

    const row = await env.VISITS_DB.prepare(`
      SELECT value, updated_at
      FROM site_counters
      WHERE name = 'visits'
      LIMIT 1
    `).first();

    return json({
      visits: Number(row?.value || 0),
      updatedAt: row?.updated_at || null,
      counted: request.method === 'POST' && !alreadyCounted
    }, 200, headers);
  } catch (error) {
    console.error('visit counter error', error);
    return json({error: 'counter_error'}, 500);
  }
}
