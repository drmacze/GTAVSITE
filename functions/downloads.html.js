function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function absoluteUrl(value, origin) {
  const text = String(value || '').trim();
  if (!text) return '';
  try { return new URL(text, origin + '/').href; }
  catch { return ''; }
}

function cleanDescription(mod) {
  const subtitle = String(mod.subtitle || '').trim();
  const description = String(mod.description || '').replace(/\s+/g, ' ').trim();
  const combined = subtitle && description ? `${subtitle} — ${description}` : (description || subtitle);
  return (combined || 'Community mod for the GTA V native iOS project.').slice(0, 220);
}

function injectMeta(html, meta) {
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="GTA V iOS Community">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}">`,
    meta.image ? `<meta property="og:image" content="${escapeHtml(meta.image)}">` : '',
    meta.image ? `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}">` : '',
    `<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    meta.image ? `<meta name="twitter:image" content="${escapeHtml(meta.image)}">` : ''
  ].filter(Boolean).join('');

  html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '');
  html = html.replace(/<meta\s+(?:property|name)=["'](?:og:|twitter:)[^>]*>/gi, '');
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  return html.replace(/<\/head>/i, `${tags}</head>`);
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const assetResponse = await env.ASSETS.fetch(request);
  const modId = String(url.searchParams.get('mod') || '').trim().slice(0, 100);

  if (!modId || !env.VISITS_DB || !assetResponse.ok) return assetResponse;

  let mod = null;
  try {
    mod = await env.VISITS_DB.prepare(`
      SELECT id,title,category,subtitle,description,image_url,previews_json
      FROM project_mods
      WHERE id = ? AND published = 1
      LIMIT 1
    `).bind(modId).first();
  } catch {
    return assetResponse;
  }
  if (!mod) return assetResponse;

  let previewUrls = [];
  try { previewUrls = JSON.parse(mod.previews_json || '[]'); }
  catch {}
  if (!Array.isArray(previewUrls)) previewUrls = [];

  const categoryLabels = {
    modpack: 'Mod Pack',
    dlc: 'DLC',
    graphics: 'Graphics',
    language: 'Language Pack'
  };
  const category = categoryLabels[mod.category] || 'Mod';
  const image = absoluteUrl(previewUrls[0] || mod.image_url || '/assets/community-mark-512.png', url.origin);
  const shareUrl = `${url.origin}/downloads.html?mod=${encodeURIComponent(mod.id)}#mods`;
  const title = `${mod.title} | GTA V iOS Mods`;
  const description = cleanDescription(mod);

  const html = await assetResponse.text();
  const output = injectMeta(html, {
    title,
    description,
    url: shareUrl,
    image,
    imageAlt: `${mod.title} — ${category}`
  });

  const headers = new Headers(assetResponse.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Vary', 'Accept-Encoding');
  return new Response(output, { status: assetResponse.status, headers });
}
