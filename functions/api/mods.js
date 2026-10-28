const ADMIN_TOKEN_SHA256 = 'e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';

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
  const text = cleanText(value, 1800);
  if (!text) return '';
  try {
    const url = new URL(text, 'https://local.invalid');
    if (url.origin === 'https://local.invalid') {
      return text.startsWith('assets/') || text.startsWith('/assets/') ? text : '';
    }
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function cleanCategory(value) {
  const category = cleanText(value, 24).toLowerCase();
  return ['modpack', 'dlc', 'graphics', 'language'].includes(category) ? category : 'modpack';
}

function cleanTags(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(',');
  return source.map(item => cleanText(item, 60)).filter(Boolean).slice(0, 8);
}

async function ensureTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS project_mods (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'modpack',
      subtitle TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      download_url TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      preview2_url TEXT NOT NULL DEFAULT '',
      preset_url TEXT NOT NULL DEFAULT '',
      tags_json TEXT NOT NULL DEFAULT '[]',
      language_code TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 100,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const seeds = [
    ['community-pack-1','Community Mod Pack 1','modpack','Gameplay & realism','Gore improvements, DriveV, realistic pedestrians and traffic, plus new forests and abandoned cabins.','https://gofile.io/d/RNlatXEi','assets/los-santos-background.jpeg','','',JSON.stringify(['4 improvements','Gameplay']),'',10],
    ['dlc-pack-1','DLC Pack 1','dlc','Dec 2014 — Oct 2016','15 updates · 133 vehicles · 21 weapons','https://gofile.io/d/RdZWkpX8','','','',JSON.stringify(['15 updates','133 vehicles','21 weapons']),'',20],
    ['dlc-pack-2','DLC Pack 2','dlc','Dec 2016 — Sep 2018','8 updates · 126 vehicles · 14 weapons','https://gofile.io/d/mkM4gKvY','','','',JSON.stringify(['8 updates','126 vehicles','14 weapons']),'',21],
    ['dlc-pack-3','DLC Pack 3','dlc','Dec 2018 — Aug 2020','4 updates · 103 vehicles · 6 weapons','https://gofile.io/d/x7ltGZrC','','','',JSON.stringify(['4 updates','103 vehicles','6 weapons']),'',22],
    ['dlc-pack-4','DLC Pack 4','dlc','Dec 2020 — Jul 2022','4 updates · 74 vehicles · 8 weapons','https://gofile.io/d/6LJ3NLlG','','','',JSON.stringify(['4 updates','74 vehicles','8 weapons']),'',23],
    ['awesomekills-graphics-ios','Awesomekills Graphics iOS','graphics','Lighting & timecycle','Improves nighttime lighting and the timecycle for GTA V on iOS.','https://gofile.io/d/e726b04a-a872-4ab3-a5b5-d877e05fa422','https://user13692.na.imgto.link/public/20261028/e2fc4facdafeabc469b5c8e2-img-8405.avif','https://user13692.na.imgto.link/public/20261028/ae37373de6e09c391ff08a60-img-8408.avif','assets/mods/awesomekills/GTA-V-graphics-settings-iPhone11.json',JSON.stringify(['Night lighting','Timecycle']),'',30],
    ['language-ro','Romanian','language','Romanian','Romanian translation pack for GTA V.','https://gofile.io/d/UBFyquIl','','','',JSON.stringify(['Translation']),'RO',40],
    ['language-vi','Vietnamese','language','Vietnamese','Vietnamese translation pack for GTA V.','https://gofile.io/d/inDXtUnp','','','',JSON.stringify(['Translation']),'VI',41],
    ['language-th','Thai','language','Thai','Thai translation pack for GTA V.','https://gofile.io/d/hSyKxoiG','','','',JSON.stringify(['Translation']),'TH',42],
    ['language-ar','Arabic','language','Arabic','Arabic translation pack for GTA V.','https://gofile.io/d/0KdSmVMg','','','',JSON.stringify(['Translation']),'AR',43],
    ['language-id','Indonesian','language','Indonesian','Indonesian translation pack for GTA V.','https://gofile.io/d/9u6eONPa','','','',JSON.stringify(['Translation']),'ID',44]
  ];

  const statement = db.prepare(`
    INSERT OR IGNORE INTO project_mods
    (id,title,category,subtitle,description,download_url,image_url,preview2_url,preset_url,tags_json,language_code,sort_order,published,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
  `);
  for (const seed of seeds) await statement.bind(...seed).run();
}

function mapRow(row) {
  let tags = [];
  try { tags = JSON.parse(row.tags_json || '[]'); } catch {}
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    subtitle: row.subtitle || '',
    description: row.description || '',
    downloadUrl: row.download_url || '',
    imageUrl: row.image_url || '',
    preview2Url: row.preview2_url || '',
    presetUrl: row.preset_url || '',
    tags: Array.isArray(tags) ? tags : [],
    languageCode: row.language_code || '',
    sortOrder: Number(row.sort_order || 100),
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
    category: cleanCategory(source.category),
    subtitle: cleanText(source.subtitle, 120),
    description: cleanText(source.description, 1200),
    downloadUrl: cleanUrl(source.downloadUrl),
    imageUrl: cleanUrl(source.imageUrl),
    preview2Url: cleanUrl(source.preview2Url),
    presetUrl: cleanUrl(source.presetUrl),
    tags: cleanTags(source.tags),
    languageCode: cleanText(source.languageCode, 8).toUpperCase(),
    sortOrder: Math.max(0, Math.min(9999, Number.parseInt(source.sortOrder, 10) || 100)),
    published: source.published === false ? 0 : 1
  };
  if (!payload.title) throw new Error('title_required');
  if (!payload.downloadUrl) throw new Error('download_url_required');
  return payload;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.VISITS_DB) return json({ error: 'database_unavailable' }, 503);
  if (!['GET','POST','PUT','DELETE'].includes(request.method)) {
    return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET, POST, PUT, DELETE' });
  }

  try {
    await ensureTable(env.VISITS_DB);
    const url = new URL(request.url);
    const adminView = url.searchParams.get('admin') === '1';

    if (request.method === 'GET') {
      if (adminView && !(await isAdmin(request))) return json({ error: 'unauthorized' }, 401);
      const query = adminView
        ? `SELECT * FROM project_mods ORDER BY sort_order ASC, created_at ASC`
        : `SELECT * FROM project_mods WHERE published = 1 ORDER BY sort_order ASC, created_at ASC`;
      const result = await env.VISITS_DB.prepare(query).all();
      return json({ mods: (result.results || []).map(mapRow) });
    }

    if (!sameOrigin(request)) return json({ error: 'origin_not_allowed' }, 403);
    if (!(await isAdmin(request))) return json({ error: 'unauthorized' }, 401);

    if (request.method === 'POST') {
      const payload = await readPayload(request);
      const id = crypto.randomUUID();
      await env.VISITS_DB.prepare(`
        INSERT INTO project_mods
        (id,title,category,subtitle,description,download_url,image_url,preview2_url,preset_url,tags_json,language_code,sort_order,published,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      `).bind(
        id,payload.title,payload.category,payload.subtitle,payload.description,payload.downloadUrl,
        payload.imageUrl,payload.preview2Url,payload.presetUrl,JSON.stringify(payload.tags),payload.languageCode,
        payload.sortOrder,payload.published
      ).run();
      const row = await env.VISITS_DB.prepare(`SELECT * FROM project_mods WHERE id = ? LIMIT 1`).bind(id).first();
      return json({ mod: mapRow(row) }, 201);
    }

    const id = cleanText(url.searchParams.get('id'), 80);
    if (!id) return json({ error: 'id_required' }, 400);

    if (request.method === 'DELETE') {
      const result = await env.VISITS_DB.prepare(`DELETE FROM project_mods WHERE id = ?`).bind(id).run();
      if (!result.meta?.changes) return json({ error: 'not_found' }, 404);
      return json({ ok: true });
    }

    const payload = await readPayload(request);
    const result = await env.VISITS_DB.prepare(`
      UPDATE project_mods
      SET title=?, category=?, subtitle=?, description=?, download_url=?, image_url=?, preview2_url=?,
          preset_url=?, tags_json=?, language_code=?, sort_order=?, published=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(
      payload.title,payload.category,payload.subtitle,payload.description,payload.downloadUrl,payload.imageUrl,
      payload.preview2Url,payload.presetUrl,JSON.stringify(payload.tags),payload.languageCode,payload.sortOrder,
      payload.published,id
    ).run();
    if (!result.meta?.changes) return json({ error: 'not_found' }, 404);
    const row = await env.VISITS_DB.prepare(`SELECT * FROM project_mods WHERE id = ? LIMIT 1`).bind(id).first();
    return json({ mod: mapRow(row) });
  } catch (error) {
    const known = ['invalid_json','title_required','download_url_required'];
    if (known.includes(error?.message)) return json({ error: error.message }, 400);
    console.error('mods api error', error);
    return json({ error: 'mods_error' }, 500);
  }
}
