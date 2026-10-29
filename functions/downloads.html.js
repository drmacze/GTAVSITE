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

function respondHtml(assetResponse, output) {
  const headers = new Headers(assetResponse.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Vary', 'Accept-Encoding');
  return new Response(output, { status: assetResponse.status, headers });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const assetResponse = await env.ASSETS.fetch(request);
  if (!assetResponse.ok) return assetResponse;

  const modId = String(url.searchParams.get('mod') || '').trim().slice(0, 100);
  if (!modId) return assetResponse;

  const origin = url.origin;
  const fallbackImage = absoluteUrl('/assets/community-mark-512.png', origin);
  const shareUrl = `${origin}/downloads.html?mod=${encodeURIComponent(modId)}&share=2#mods`;
  let meta = {
    title: 'GTA V iOS Mods | Community Library',
    description: 'Browse curated gameplay mods, graphics enhancements, DLC packs and translations for the GTA V native iOS project.',
    url: shareUrl,
    image: fallbackImage,
    imageAlt: 'GTA V iOS Community Mods Library'
  };

  if (env.VISITS_DB) {
    try {
      if (modId === 'dlc-collection' || modId === 'language-collection') {
        const category = modId === 'dlc-collection' ? 'dlc' : 'language';
        const row = await env.VISITS_DB.prepare(`
          SELECT COUNT(*) AS total
          FROM project_mods
          WHERE category = ? AND published = 1
        `).bind(category).first();
        const total = Number(row?.total || 0);
        if (category === 'dlc') {
          meta = {
            title: 'DLC Collection | GTA V iOS Mods',
            description: `${total || 4} curated GTA Online content packs organized for the GTA V native iOS project.`,
            url: shareUrl,
            image: fallbackImage,
            imageAlt: 'GTA V iOS DLC Collection'
          };
        } else {
          meta = {
            title: 'Language Packs | GTA V iOS Mods',
            description: `${total || 5} community translation packs for the GTA V native iOS project.`,
            url: shareUrl,
            image: fallbackImage,
            imageAlt: 'GTA V iOS Language Packs'
          };
        }
      } else {
        const mod = await env.VISITS_DB.prepare(`
          SELECT id,title,category,subtitle,description,image_url,previews_json
          FROM project_mods
          WHERE id = ? AND published = 1
          LIMIT 1
        `).bind(modId).first();

        if (mod) {
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
          const image = absoluteUrl(previewUrls[0] || mod.image_url || fallbackImage, origin);
          meta = {
            title: `${mod.title} | GTA V iOS Mods`,
            description: cleanDescription(mod),
            url: shareUrl,
            image,
            imageAlt: `${mod.title} — ${category}`
          };
        }
      }
    } catch {
      // Keep the polished generic preview if metadata lookup is unavailable.
    }
  }

  const html = await assetResponse.text();
  return respondHtml(assetResponse, injectMeta(html, meta));
}
