const ADMIN_TOKEN_SHA256='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';

function json(payload,status=200,extraHeaders={}){return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff',...extraHeaders}})}
async function sha256Hex(value){const bytes=new TextEncoder().encode(String(value||''));const digest=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function isAdmin(request){const token=request.headers.get('X-Admin-Token')||'';if(!token)return false;const actual=await sha256Hex(token);if(actual.length!==ADMIN_TOKEN_SHA256.length)return false;let diff=0;for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^ADMIN_TOKEN_SHA256.charCodeAt(i);return diff===0}
function sameOrigin(request){const origin=request.headers.get('Origin');if(!origin)return true;return origin===new URL(request.url).origin}
function cleanText(value,max=5000){return String(value??'').trim().slice(0,max)}
function cleanUrl(value){const text=cleanText(value,1800);if(!text)return'';try{const url=new URL(text,'https://local.invalid');if(url.origin==='https://local.invalid')return text.startsWith('assets/')||text.startsWith('/assets/')?text:'';return['https:','http:'].includes(url.protocol)?url.href:''}catch{return''}}
function cleanCategory(value){const category=cleanText(value,24).toLowerCase();return['modpack','dlc','graphics','language'].includes(category)?category:'modpack'}
function cleanTags(value){const source=Array.isArray(value)?value:String(value||'').split(',');return source.map(x=>cleanText(x,60)).filter(Boolean).slice(0,8)}
function cleanPreviewUrls(value){const source=Array.isArray(value)?value:String(value||'').split(/[\n,]+/),seen=new Set(),result=[];for(const entry of source){const url=cleanUrl(entry);if(!url||seen.has(url))continue;seen.add(url);result.push(url);if(result.length>=12)break}return result}
function cleanDownloadOptions(value,fallbackUrl=''){
 const source=Array.isArray(value)?value:[];const result=[],seen=new Set();
 for(const item of source){const url=cleanUrl(item?.url||item?.downloadUrl);if(!url||seen.has(url))continue;seen.add(url);result.push({label:cleanText(item?.label||item?.title||`File ${result.length+1}`,80)||`File ${result.length+1}`,url});if(result.length>=10)break}
 if(!result.length){const url=cleanUrl(fallbackUrl);if(url)result.push({label:'Main file',url})}
 return result;
}

async function ensureTable(db){
 await db.prepare(`CREATE TABLE IF NOT EXISTS project_mods(id TEXT PRIMARY KEY,title TEXT NOT NULL,category TEXT NOT NULL DEFAULT 'modpack',subtitle TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',download_url TEXT NOT NULL DEFAULT '',image_url TEXT NOT NULL DEFAULT '',preview2_url TEXT NOT NULL DEFAULT '',preset_url TEXT NOT NULL DEFAULT '',previews_json TEXT NOT NULL DEFAULT '[]',downloads_json TEXT NOT NULL DEFAULT '[]',tags_json TEXT NOT NULL DEFAULT '[]',language_code TEXT NOT NULL DEFAULT '',sort_order INTEGER NOT NULL DEFAULT 100,published INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 const columns=await db.prepare(`PRAGMA table_info(project_mods)`).all();const names=new Set((columns.results||[]).map(c=>c.name));
 if(!names.has('previews_json'))await db.prepare(`ALTER TABLE project_mods ADD COLUMN previews_json TEXT NOT NULL DEFAULT '[]'`).run();
 if(!names.has('downloads_json'))await db.prepare(`ALTER TABLE project_mods ADD COLUMN downloads_json TEXT NOT NULL DEFAULT '[]'`).run();
 await db.prepare(`CREATE TABLE IF NOT EXISTS project_mods_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL DEFAULT '')`).run();
 const seeded=await db.prepare(`SELECT value FROM project_mods_meta WHERE key='default_seed_v1' LIMIT 1`).first();
 if(!seeded){
  const seeds=[
   ['community-pack-1','Community Mod Pack 1','modpack','Gameplay & realism','Gore improvements, DriveV, realistic pedestrians and traffic, plus new forests and abandoned cabins.','https://gofile.io/d/RNlatXEi','assets/los-santos-background.jpeg','','',JSON.stringify(['assets/los-santos-background.jpeg']),JSON.stringify(['4 improvements','Gameplay']),'',10],
   ['dlc-pack-1','DLC Pack 1','dlc','Dec 2014 — Oct 2016','15 updates · 133 vehicles · 21 weapons','https://gofile.io/d/RdZWkpX8','','','',JSON.stringify([]),JSON.stringify(['15 updates','133 vehicles','21 weapons']),'',20],
   ['dlc-pack-2','DLC Pack 2','dlc','Dec 2016 — Sep 2018','8 updates · 126 vehicles · 14 weapons','https://gofile.io/d/mkM4gKvY','','','',JSON.stringify([]),JSON.stringify(['8 updates','126 vehicles','14 weapons']),'',21],
   ['dlc-pack-3','DLC Pack 3','dlc','Dec 2018 — Aug 2020','4 updates · 103 vehicles · 6 weapons','https://gofile.io/d/x7ltGZrC','','','',JSON.stringify([]),JSON.stringify(['4 updates','103 vehicles','6 weapons']),'',22],
   ['dlc-pack-4','DLC Pack 4','dlc','Dec 2020 — Jul 2022','4 updates · 74 vehicles · 8 weapons','https://gofile.io/d/6LJ3NLlG','','','',JSON.stringify([]),JSON.stringify(['4 updates','74 vehicles','8 weapons']),'',23],
   ['awesomekills-graphics-ios','Awesomekills Graphics iOS','graphics','Lighting & timecycle','Improves nighttime lighting and the timecycle for GTA V on iOS.','https://gofile.io/d/e726b04a-a872-4ab3-a5b5-d877e05fa422','https://user13692.na.imgto.link/public/20261028/e2fc4facdafeabc469b5c8e2-img-8405.avif','','assets/mods/awesomekills/GTA-V-graphics-settings-iPhone11.json',JSON.stringify(['https://user13692.na.imgto.link/public/20261028/e2fc4facdafeabc469b5c8e2-img-8405.avif']),JSON.stringify(['Night lighting','Timecycle']),'',30],
   ['language-ro','Romanian','language','Romanian','Romanian translation pack for GTA V.','https://gofile.io/d/UBFyquIl','','','',JSON.stringify([]),JSON.stringify(['Translation']),'RO',40],
   ['language-vi','Vietnamese','language','Vietnamese','Vietnamese translation pack for GTA V.','https://gofile.io/d/inDXtUnp','','','',JSON.stringify([]),JSON.stringify(['Translation']),'VI',41],
   ['language-th','Thai','language','Thai','Thai translation pack for GTA V.','https://gofile.io/d/hSyKxoiG','','','',JSON.stringify([]),JSON.stringify(['Translation']),'TH',42],
   ['language-ar','Arabic','language','Arabic','Arabic translation pack for GTA V.','https://gofile.io/d/0KdSmVMg','','','',JSON.stringify([]),JSON.stringify(['Translation']),'AR',43],
   ['language-id','Indonesian','language','Indonesian','Indonesian translation pack for GTA V.','https://gofile.io/d/9u6eONPa','','','',JSON.stringify([]),JSON.stringify(['Translation']),'ID',44]
  ];
  const statement=db.prepare(`INSERT OR IGNORE INTO project_mods(id,title,category,subtitle,description,download_url,image_url,preview2_url,preset_url,previews_json,tags_json,language_code,sort_order,published,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`);
  for(const seed of seeds)await statement.bind(...seed).run();
  await db.prepare(`INSERT OR REPLACE INTO project_mods_meta(key,value) VALUES('default_seed_v1','1')`).run();
 }
 const awesomeFixed=await db.prepare(`SELECT value FROM project_mods_meta WHERE key='awesomekills_single_preview_v1' LIMIT 1`).first();
 if(!awesomeFixed){const row=await db.prepare(`SELECT image_url FROM project_mods WHERE id='awesomekills-graphics-ios' LIMIT 1`).first();if(row){const previews=cleanPreviewUrls([row.image_url]);await db.prepare(`UPDATE project_mods SET preview2_url='',previews_json=?,updated_at=CURRENT_TIMESTAMP WHERE id='awesomekills-graphics-ios'`).bind(JSON.stringify(previews)).run()}await db.prepare(`INSERT OR REPLACE INTO project_mods_meta(key,value) VALUES('awesomekills_single_preview_v1','1')`).run()}
}

function mapRow(row){
 let tags=[],previewUrls=[],downloadOptions=[];try{tags=JSON.parse(row.tags_json||'[]')}catch{}try{previewUrls=JSON.parse(row.previews_json||'[]')}catch{}try{downloadOptions=JSON.parse(row.downloads_json||'[]')}catch{}
 previewUrls=cleanPreviewUrls(Array.isArray(previewUrls)&&previewUrls.length?previewUrls:[row.image_url,row.preview2_url]);
 downloadOptions=cleanDownloadOptions(downloadOptions,row.download_url);
 return{id:row.id,title:row.title,category:row.category,subtitle:row.subtitle||'',description:row.description||'',downloadUrl:downloadOptions[0]?.url||row.download_url||'',downloadOptions,imageUrl:previewUrls[0]||row.image_url||'',preview2Url:previewUrls[1]||'',previewUrls,presetUrl:row.preset_url||'',tags:Array.isArray(tags)?tags:[],languageCode:row.language_code||'',sortOrder:Number(row.sort_order||100),published:Boolean(row.published),createdAt:row.created_at,updatedAt:row.updated_at};
}

async function readPayload(request){
 let source;try{source=await request.json()}catch{throw new Error('invalid_json')}
 const previewUrls=cleanPreviewUrls(Array.isArray(source.previewUrls)?source.previewUrls:[source.imageUrl,source.preview2Url]);
 const downloadOptions=cleanDownloadOptions(source.downloadOptions,source.downloadUrl);
 const payload={title:cleanText(source.title,140),category:cleanCategory(source.category),subtitle:cleanText(source.subtitle,120),description:cleanText(source.description,1200),downloadUrl:downloadOptions[0]?.url||'',downloadOptions,imageUrl:previewUrls[0]||'',preview2Url:previewUrls[1]||'',previewUrls,presetUrl:cleanUrl(source.presetUrl),tags:cleanTags(source.tags),languageCode:cleanText(source.languageCode,8).toUpperCase(),sortOrder:Math.max(0,Math.min(9999,Number.parseInt(source.sortOrder,10)||100)),published:source.published===false?0:1};
 if(!payload.title)throw new Error('title_required');if(!payload.downloadUrl)throw new Error('download_url_required');return payload;
}

export async function onRequest(context){
 const{request,env}=context;if(!env.VISITS_DB)return json({error:'database_unavailable'},503);if(!['GET','POST','PUT','DELETE'].includes(request.method))return json({error:'method_not_allowed'},405,{Allow:'GET, POST, PUT, DELETE'});
 try{
  await ensureTable(env.VISITS_DB);const url=new URL(request.url),adminView=url.searchParams.get('admin')==='1';
  if(request.method==='GET'){if(adminView&&!(await isAdmin(request)))return json({error:'unauthorized'},401);const query=adminView?`SELECT * FROM project_mods ORDER BY sort_order ASC,created_at ASC`:`SELECT * FROM project_mods WHERE published=1 ORDER BY sort_order ASC,created_at ASC`;const result=await env.VISITS_DB.prepare(query).all();return json({mods:(result.results||[]).map(mapRow)})}
  if(!sameOrigin(request))return json({error:'origin_not_allowed'},403);if(!(await isAdmin(request)))return json({error:'unauthorized'},401);
  if(request.method==='POST'){
   const p=await readPayload(request),id=crypto.randomUUID();
   await env.VISITS_DB.prepare(`INSERT INTO project_mods(id,title,category,subtitle,description,download_url,image_url,preview2_url,preset_url,previews_json,downloads_json,tags_json,language_code,sort_order,published,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(id,p.title,p.category,p.subtitle,p.description,p.downloadUrl,p.imageUrl,p.preview2Url,p.presetUrl,JSON.stringify(p.previewUrls),JSON.stringify(p.downloadOptions),JSON.stringify(p.tags),p.languageCode,p.sortOrder,p.published).run();
   const row=await env.VISITS_DB.prepare(`SELECT * FROM project_mods WHERE id=? LIMIT 1`).bind(id).first();return json({mod:mapRow(row)},201);
  }
  const id=cleanText(url.searchParams.get('id'),80);if(!id)return json({error:'id_required'},400);
  if(request.method==='DELETE'){const result=await env.VISITS_DB.prepare(`DELETE FROM project_mods WHERE id=?`).bind(id).run();if(!result.meta?.changes)return json({error:'not_found'},404);return json({ok:true})}
  const p=await readPayload(request);const result=await env.VISITS_DB.prepare(`UPDATE project_mods SET title=?,category=?,subtitle=?,description=?,download_url=?,image_url=?,preview2_url=?,preset_url=?,previews_json=?,downloads_json=?,tags_json=?,language_code=?,sort_order=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(p.title,p.category,p.subtitle,p.description,p.downloadUrl,p.imageUrl,p.preview2Url,p.presetUrl,JSON.stringify(p.previewUrls),JSON.stringify(p.downloadOptions),JSON.stringify(p.tags),p.languageCode,p.sortOrder,p.published,id).run();
  if(!result.meta?.changes)return json({error:'not_found'},404);const row=await env.VISITS_DB.prepare(`SELECT * FROM project_mods WHERE id=? LIMIT 1`).bind(id).first();return json({mod:mapRow(row)});
 }catch(error){const known=['invalid_json','title_required','download_url_required'];if(known.includes(error?.message))return json({error:error.message},400);console.error('mods api error',error);return json({error:'mods_error'},500)}
}
