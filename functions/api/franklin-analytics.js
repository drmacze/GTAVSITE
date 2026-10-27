const ADMIN_TOKEN_SHA256='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'}})}
async function hash(value){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value||'')));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function admin(request){return(await hash(request.headers.get('X-Admin-Token')||''))===ADMIN_TOKEN_SHA256}
function clean(v,n=120){return String(v??'').trim().slice(0,n)}
function sameOrigin(request){const o=request.headers.get('Origin');return !o||o===new URL(request.url).origin}
async function setup(db){
 await db.prepare(`CREATE TABLE IF NOT EXISTS franklin_usage(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,session_id TEXT NOT NULL,event_type TEXT NOT NULL,topic TEXT NOT NULL DEFAULT 'other',page TEXT NOT NULL DEFAULT '',device_type TEXT NOT NULL DEFAULT '',language TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS idx_fu_created ON franklin_usage(created_at)`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS idx_fu_session ON franklin_usage(session_id,created_at)`).run();
 await db.prepare(`CREATE TABLE IF NOT EXISTS franklin_conversations(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,session_id TEXT NOT NULL,role TEXT NOT NULL,content TEXT NOT NULL,page TEXT NOT NULL DEFAULT '',topic TEXT NOT NULL DEFAULT 'other',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS idx_fc_created ON franklin_conversations(created_at)`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS idx_fc_session ON franklin_conversations(session_id,created_at)`).run();
}
async function purgeChats(db){await db.prepare(`DELETE FROM franklin_conversations WHERE created_at < datetime('now','-1 day')`).run()}
export async function onRequest({request,env}){
 if(!env.VISITS_DB)return json({error:'database_unavailable'},503);if(!['GET','POST'].includes(request.method))return json({error:'method_not_allowed'},405);
 try{await setup(env.VISITS_DB);await purgeChats(env.VISITS_DB);
  if(request.method==='POST'){
   if(!sameOrigin(request))return json({error:'origin_not_allowed'},403);let b;try{b=await request.json()}catch{return json({error:'invalid_json'},400)}
   const eventType=clean(b.eventType,20);if(!['open','question','answer','disconnect'].includes(eventType))return json({error:'invalid_event'},400);
   const userId=clean(b.userId,80),sessionId=clean(b.sessionId,80);if(!userId||!sessionId)return json({error:'identity_required'},400);
   const topic=clean(b.topic,40)||'other',page=clean(b.page,160);
   await env.VISITS_DB.prepare(`INSERT INTO franklin_usage(id,user_id,session_id,event_type,topic,page,device_type,language,created_at) VALUES(?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`).bind(crypto.randomUUID(),userId,sessionId,eventType,topic,page,clean(b.deviceType,20),clean(b.language,20)).run();
   const consent=b.consent===true,content=clean(b.content,6000);if(consent&&content&&(eventType==='question'||eventType==='answer'))await env.VISITS_DB.prepare(`INSERT INTO franklin_conversations(id,user_id,session_id,role,content,page,topic,created_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`).bind(crypto.randomUUID(),userId,sessionId,eventType==='question'?'user':'franklin',content,page,topic).run();
   return json({ok:true,chatRetentionHours:24,chatStored:Boolean(consent&&content&&(eventType==='question'||eventType==='answer'))},201)
  }
  if(!(await admin(request)))return json({error:'unauthorized'},401);
  const totals=await env.VISITS_DB.prepare(`SELECT COUNT(DISTINCT user_id) unique_users,COUNT(DISTINCT session_id) sessions,SUM(CASE WHEN event_type='question' THEN 1 ELSE 0 END) questions,SUM(CASE WHEN event_type='answer' THEN 1 ELSE 0 END) answers,SUM(CASE WHEN event_type='open' THEN 1 ELSE 0 END) opens,COUNT(DISTINCT CASE WHEN date(created_at)=date('now') THEN user_id END) users_today,SUM(CASE WHEN date(created_at)=date('now') AND event_type='question' THEN 1 ELSE 0 END) questions_today FROM franklin_usage`).first();
  const trend=await env.VISITS_DB.prepare(`WITH RECURSIVE days(d) AS (SELECT date('now','-13 day') UNION ALL SELECT date(d,'+1 day') FROM days WHERE d<date('now')) SELECT d date,COUNT(DISTINCT CASE WHEN f.event_type IN('open','question') THEN f.user_id END) users,COUNT(DISTINCT CASE WHEN f.event_type IN('open','question') THEN f.session_id END) sessions,SUM(CASE WHEN f.event_type='question' THEN 1 ELSE 0 END) questions FROM days LEFT JOIN franklin_usage f ON date(f.created_at)=d GROUP BY d ORDER BY d`).all();
  const sessions=await env.VISITS_DB.prepare(`SELECT session_id,user_id,MIN(created_at) started_at,MAX(created_at) last_active,MAX(page) page,MAX(device_type) device_type,MAX(language) language,SUM(CASE WHEN event_type='question' THEN 1 ELSE 0 END) questions FROM franklin_usage GROUP BY session_id,user_id ORDER BY last_active DESC LIMIT 120`).all();
  const topics=await env.VISITS_DB.prepare(`SELECT topic,COUNT(*) count FROM franklin_usage WHERE event_type='question' GROUP BY topic ORDER BY count DESC LIMIT 10`).all();
  const pages=await env.VISITS_DB.prepare(`SELECT page,COUNT(*) questions,COUNT(DISTINCT user_id) users FROM franklin_usage WHERE event_type='question' AND page<>'' GROUP BY page ORDER BY questions DESC LIMIT 8`).all();
  const devices=await env.VISITS_DB.prepare(`SELECT COALESCE(NULLIF(device_type,''),'unknown') device,COUNT(DISTINCT user_id) users FROM franklin_usage GROUP BY device ORDER BY users DESC`).all();
  const chats=await env.VISITS_DB.prepare(`SELECT id,user_id,session_id,role,content,page,topic,created_at FROM franklin_conversations WHERE created_at >= datetime('now','-1 day') ORDER BY created_at ASC LIMIT 800`).all();
  return json({chatRetentionHours:24,summary:{uniqueUsers:Number(totals?.unique_users||0),sessions:Number(totals?.sessions||0),questions:Number(totals?.questions||0),answers:Number(totals?.answers||0),opens:Number(totals?.opens||0),usersToday:Number(totals?.users_today||0),questionsToday:Number(totals?.questions_today||0)},trend:(trend.results||[]).map(r=>({date:r.date,users:Number(r.users||0),sessions:Number(r.sessions||0),questions:Number(r.questions||0)})),sessions:(sessions.results||[]).map(r=>({...r,questions:Number(r.questions||0)})),topics:(topics.results||[]).map(r=>({topic:r.topic,count:Number(r.count||0)})),pages:(pages.results||[]).map(r=>({page:r.page,questions:Number(r.questions||0),users:Number(r.users||0)})),devices:(devices.results||[]).map(r=>({device:r.device,users:Number(r.users||0)})),chats:chats.results||[]})
 }catch(e){console.error('franklin analytics error',e);return json({error:'analytics_error'},500)}
}
