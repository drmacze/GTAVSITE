const ADMIN_TOKEN_SHA256='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';

function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'}})}
async function sha256Hex(value){const bytes=new TextEncoder().encode(String(value||''));const digest=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function isAdmin(request){const token=request.headers.get('X-Admin-Token')||'';if(!token)return false;const actual=await sha256Hex(token);if(actual.length!==ADMIN_TOKEN_SHA256.length)return false;let diff=0;for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^ADMIN_TOKEN_SHA256.charCodeAt(i);return diff===0}
function sameOrigin(request){const origin=request.headers.get('Origin');if(!origin)return true;return origin===new URL(request.url).origin}
function clean(value,max=1800){return String(value??'').trim().slice(0,max)}
async function ensureTable(db){await db.prepare(`CREATE TABLE IF NOT EXISTS mod_download_events(event_id TEXT PRIMARY KEY,mod_id TEXT NOT NULL,mod_title TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();await db.prepare(`CREATE INDEX IF NOT EXISTS idx_mod_download_events_created ON mod_download_events(created_at)`).run();await db.prepare(`CREATE INDEX IF NOT EXISTS idx_mod_download_events_mod ON mod_download_events(mod_id)`).run()}

export async function onRequest(context){
 const{request,env}=context;
 if(!env.VISITS_DB)return json({error:'database_unavailable'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'method_not_allowed'},405);
 try{
  await ensureTable(env.VISITS_DB);
  if(request.method==='POST'){
   if(!sameOrigin(request))return json({error:'origin_not_allowed'},403);
   let body={};try{body=await request.json()}catch{return json({error:'invalid_json'},400)}
   const eventId=clean(body.eventId,120),downloadUrl=clean(body.downloadUrl,1800),fallbackTitle=clean(body.title,160);
   if(!eventId||!downloadUrl)return json({error:'missing_fields'},400);
   let mod=null;
   try{mod=await env.VISITS_DB.prepare(`SELECT id,title FROM project_mods WHERE download_url=? AND published=1 LIMIT 1`).bind(downloadUrl).first()}catch{}
   const modId=clean(mod?.id||body.modId||fallbackTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'unknown',120);
   const modTitle=clean(mod?.title||fallbackTitle||'Unknown mod',160);
   await env.VISITS_DB.prepare(`INSERT OR IGNORE INTO mod_download_events(event_id,mod_id,mod_title,created_at) VALUES(?,?,?,CURRENT_TIMESTAMP)`).bind(eventId,modId,modTitle).run();
   return json({ok:true});
  }

  if(!(await isAdmin(request)))return json({error:'unauthorized'},401);
  const total=await env.VISITS_DB.prepare(`SELECT COUNT(*) AS n FROM mod_download_events`).first();
  const today=await env.VISITS_DB.prepare(`SELECT COUNT(*) AS n FROM mod_download_events WHERE date(created_at)=date('now')`).first();
  const seven=await env.VISITS_DB.prepare(`SELECT COUNT(*) AS n FROM mod_download_events WHERE datetime(created_at)>=datetime('now','-7 days')`).first();
  const perMod=await env.VISITS_DB.prepare(`SELECT mod_id,MAX(mod_title) AS title,COUNT(*) AS downloads,SUM(CASE WHEN date(created_at)=date('now') THEN 1 ELSE 0 END) AS today FROM mod_download_events GROUP BY mod_id ORDER BY downloads DESC, title ASC LIMIT 100`).all();
  const daily=await env.VISITS_DB.prepare(`SELECT date(created_at) AS day,COUNT(*) AS downloads FROM mod_download_events WHERE datetime(created_at)>=datetime('now','-13 days') GROUP BY date(created_at) ORDER BY day ASC`).all();
  return json({total:Number(total?.n||0),today:Number(today?.n||0),last7Days:Number(seven?.n||0),perMod:(perMod.results||[]).map(x=>({id:x.mod_id,title:x.title||x.mod_id,downloads:Number(x.downloads||0),today:Number(x.today||0)})),daily:(daily.results||[]).map(x=>({day:x.day,downloads:Number(x.downloads||0)}))});
 }catch(error){return json({error:'server_error'},500)}
}
