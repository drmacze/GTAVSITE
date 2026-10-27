const ADMIN_TOKEN_SHA256 = '4c4e6118a661f11a759715469e706a1a61406647ab2cdd6eac6166df49ae8257';

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

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ''));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function isAdmin(request) {
  const token = request.headers.get('X-Admin-Token') || '';
  if (!token) return false;
  const actual = await sha256Hex(token);
  if (actual.length !== ADMIN_TOKEN_SHA256.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) diff |= actual.charCodeAt(i) ^ ADMIN_TOKEN_SHA256.charCodeAt(i);
  return diff === 0;
}

function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function cleanText(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

function cleanUrl(value) {
  const text = cleanText(value, 1600);
  if (!text) return '';
  try {
    const url = new URL(text);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function normalizeDate(value) {
  const text = cleanText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10);
}

async function ensureTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS project_updates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      release_date TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'Update',
      download_url TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary || '',
    body: row.body || '',
    releaseDate: row.release_date,
    version: row.version || '',
    category: row.category || 'Update',
    downloadUrl: row.download_url || '',
    imageUrl: row.image_url || '',
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function readPayload(request) {
  let source;
  try { source = await request.json(); }
  catch { throw new Error('invalid_json'); }

  const payload = {
    title: cleanText(source.title, 140),
    summary: cleanText(source.summary, 500),
    body: cleanText(source.body, 12000),
    releaseDate: normalizeDate(source.releaseDate),
    version: cleanText(source.version, 80),
    category: cleanText(source.category, 60) || 'Update',
    downloadUrl: cleanUrl(source.downloadUrl),
    imageUrl: cleanUrl(source.imageUrl),
    published: source.published === false ? 0 : 1
  };
  if (!payload.title) throw new Error('title_required');
  return payload;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.VISITS_DB) return json({ error: 'database_unavailable' }, 503);
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) {
    return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET, POST, PUT, DELETE' });
  }

  try {
    await ensureTable(env.VISITS_DB);
    const url = new URL(request.url);
    const adminView = url.searchParams.get('admin') === '1';

    if (request.method === 'GET') {
      if (adminView && !(await isAdmin(request))) return json({ error: 'unauthorized' }, 401);
      const query = adminView
        ? `SELECT * FROM project_updates ORDER BY release_date DESC, created_at DESC`
        : `SELECT * FROM project_updates WHERE published = 1 ORDER BY release_date DESC, created_at DESC`;
      const result = await env.VISITS_DB.prepare(query).all();
      return json({ updates: (result.results || []).map(mapRow) });
    }

    if (!sameOrigin(request)) return json({ error: 'origin_not_allowed' }, 403);
    if (!(await isAdmin(request))) return json({ error: 'unauthorized' }, 401);

    if (request.method === 'POST') {
      const payload = await readPayload(request);
      const id = crypto.randomUUID();
      await env.VISITS_DB.prepare(`
        INSERT INTO project_updates
        (id, title, summary, body, release_date, version, category, download_url, image_url, published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(
        id, payload.title, payload.summary, payload.body, payload.releaseDate,
        payload.version, payload.category, payload.downloadUrl, payload.imageUrl, payload.published
      ).run();
      const row = await env.VISITS_DB.prepare(`SELECT * FROM project_updates WHERE id = ? LIMIT 1`).bind(id).first();
      return json({ update: mapRow(row) }, 201);
    }

    const id = cleanText(url.searchParams.get('id'), 80);
    if (!id) return json({ error: 'id_required' }, 400);

    if (request.method === 'DELETE') {
      const result = await env.VISITS_DB.prepare(`DELETE FROM project_updates WHERE id = ?`).bind(id).run();
      if (!result.meta?.changes) return json({ error: 'not_found' }, 404);
      return json({ ok: true });
    }

    const payload = await readPayload(request);
    const result = await env.VISITS_DB.prepare(`
      UPDATE project_updates
      SET title = ?, summary = ?, body = ?, release_date = ?, version = ?, category = ?,
          download_url = ?, image_url = ?, published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      payload.title, payload.summary, payload.body, payload.releaseDate, payload.version,
      payload.category, payload.downloadUrl, payload.imageUrl, payload.published, id
    ).run();
    if (!result.meta?.changes) return json({ error: 'not_found' }, 404);
    const row = await env.VISITS_DB.prepare(`SELECT * FROM project_updates WHERE id = ? LIMIT 1`).bind(id).first();
    return json({ update: mapRow(row) });
  } catch (error) {
    const known = ['invalid_json', 'title_required'];
    if (known.includes(error?.message)) return json({ error: error.message }, 400);
    console.error('updates api error', error);
    return json({ error: 'updates_error' }, 500);
  }
}
