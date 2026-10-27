const ADMIN_TOKEN_SHA256='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'}})}
async function hash(value){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value||'')));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function admin(request){return(await hash(request.headers.get('X-Admin-Token')||''))===ADMIN_TOKEN_SHA256}
function clean(v,n=120){return String(v??'').trim().slice(0,n)}
function sameOrigin(request){const o=request.headers.get('Origin');return !o||o===new URL(request.url).origin}
async function setup(db){
 await db.prepare(`CREATE TABLE IF NOT EXISTS onboarding_responses(visitor_id TEXT PRIMARY KEY,source TEXT NOT NULL,selected_device TEXT NOT NULL,model TEXT NOT NULL DEFAULT '',browser_device TEXT NOT NULL DEFAULT '',browser TEXT NOT NULL DEFAULT '',language TEXT NOT NULL DEFAULT '',first_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS idx_onboarding_source ON onboarding_responses(source)`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS idx_onboarding_updated ON onboarding_responses(updated_at)`).run();
}
export async function onRequest({request,env}){
 if(!env.VISITS_DB)return json({error:'database_unavailable'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'method_not_allowed'},405);
 try{
  await setup(env.VISITS_DB);
  if(request.method==='POST'){
   if(!sameOrigin(request))return json({error:'origin_not_allowed'},403);
   let b;try{b=await request.json()}catch{return json({error:'invalid_json'},400)}
   const source=clean(b.source,20),selected=clean(b.device,20);
   if(!['youtube','tiktok','browser','friends','other'].includes(source)||!['ios','android'].includes(selected))return json({error:'invalid_payload'},400);
   const model=selected==='ios'?clean(b.model,80):'';
   await env.VISITS_DB.prepare(`INSERT INTO onboarding_responses(visitor_id,source,selected_device,model,browser_device,browser,language,first_seen,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(crypto.randomUUID(),source,selected,model,clean(b.browserDevice,40),clean(b.browser,40),clean(b.language,20)).run();
   return json({ok:true},201);
  }
  if(!(await admin(request)))return json({error:'unauthorized'},401);
  const total=await env.VISITS_DB.prepare(`SELECT COUNT(*) total,SUM(CASE WHEN selected_device='ios' THEN 1 ELSE 0 END) ios,SUM(CASE WHEN selected_device='android' THEN 1 ELSE 0 END) android,SUM(CASE WHEN date(first_seen)=date('now') THEN 1 ELSE 0 END) today FROM onboarding_responses`).first();
  const sources=await env.VISITS_DB.prepare(`SELECT source label,COUNT(*) count FROM onboarding_responses GROUP BY source ORDER BY count DESC`).all();
  const devices=await env.VISITS_DB.prepare(`SELECT COALESCE(NULLIF(browser_device,''),'Unknown') label,COUNT(*) count FROM onboarding_responses GROUP BY browser_device ORDER BY count DESC LIMIT 10`).all();
  const models=await env.VISITS_DB.prepare(`SELECT COALESCE(NULLIF(model,''),'Android / unspecified') label,COUNT(*) count FROM onboarding_responses GROUP BY model ORDER BY count DESC LIMIT 12`).all();
  const browsers=await env.VISITS_DB.prepare(`SELECT COALESCE(NULLIF(browser,''),'Unknown') label,COUNT(*) count FROM onboarding_responses GROUP BY browser ORDER BY count DESC LIMIT 8`).all();
  return json({summary:{total:Number(total?.total||0),ios:Number(total?.ios||0),android:Number(total?.android||0),today:Number(total?.today||0)},sources:(sources.results||[]).map(r=>({label:r.label,count:Number(r.count||0)})),devices:(devices.results||[]).map(r=>({label:r.label,count:Number(r.count||0)})),models:(models.results||[]).map(r=>({label:r.label,count:Number(r.count||0)})),browsers:(browsers.results||[]).map(r=>({label:r.label,count:Number(r.count||0)}))});
 }catch(e){console.error('onboarding analytics error',e);return json({error:'analytics_error'},500)}
}
