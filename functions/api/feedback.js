const ADMIN_HASH='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const clean=(v,n)=>String(v??'').trim().slice(0,n);
const hash=async v=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))].map(b=>b.toString(16).padStart(2,'0')).join('');
async function setup(db){await db.prepare(`CREATE TABLE IF NOT EXISTS community_feedback(id TEXT PRIMARY KEY, visitor TEXT NOT NULL, ip_hash TEXT NOT NULL, target TEXT NOT NULL, kind TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), title TEXT NOT NULL, message TEXT NOT NULL, steps TEXT NOT NULL DEFAULT '', os TEXT NOT NULL DEFAULT '', version TEXT NOT NULL DEFAULT '', build TEXT NOT NULL DEFAULT '', device TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'received', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();await db.prepare(`CREATE INDEX IF NOT EXISTS feedback_recent ON community_feedback(ip_hash,created_at)`).run();await db.prepare(`CREATE TABLE IF NOT EXISTS community_ratings(visitor TEXT NOT NULL,target TEXT NOT NULL,rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),PRIMARY KEY(visitor,target))`).run()}
export async function onRequest({request,env}){
 if(!['GET','POST'].includes(request.method))return json({error:'method_not_allowed'},405);
 if(!env.VISITS_DB)return json({error:'Feedback is temporarily unavailable. Please try again later.'},503);
 const url=new URL(request.url),db=env.VISITS_DB;
 try{
 await setup(db);
 if(request.method==='GET'){
 if(url.searchParams.has('admin')){if(await hash(request.headers.get('X-Admin-Token')||'')!==ADMIN_HASH)return json({error:'unauthorized'},401);const result=await db.prepare(`SELECT id,target,kind,rating,title,message,steps,os,version,build,device,status,created_at FROM community_feedback ORDER BY created_at DESC LIMIT 200`).all();return json({items:result.results||[]})}
 const result=await db.prepare(`SELECT target,COUNT(*) count,AVG(rating) average FROM community_ratings GROUP BY target`).all();return json({ratings:(result.results||[]).map(r=>({target:r.target,count:Number(r.count),average:Number(r.average)}))});
 }
 if(request.headers.get('Origin')!==url.origin)return json({error:'Please send feedback from this website.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'invalid_content_type'},415);
 if(Number(request.headers.get('Content-Length')||0)>18000)return json({error:'Your report is too long.'},413);
 const raw=await request.text();if(raw.length>18000)return json({error:'Your report is too long.'},413);
 let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid report.'},400)}
 const id=clean(b.id,40),target=clean(b.target,20),kind=clean(b.kind,20),rating=Number(b.rating),title=clean(b.title,100),message=clean(b.message,3000),steps=clean(b.steps,2000);
 if(!/^[0-9a-f-]{36}$/i.test(id)||!['helper','launcher'].includes(target)||!['feedback','issue'].includes(kind)||!Number.isInteger(rating)||rating<1||rating>5||title.length<5||message.length<15||(kind==='issue'&&steps.length<10))return json({error:'Please complete the rating and required report details.'},400);
 const cookie=request.headers.get('Cookie')||'',match=cookie.match(/(?:^|;\s*)gtav_feedback=([a-f0-9-]{36})(?:;|$)/i),visitor=match?.[1]||crypto.randomUUID();
 const ipHash=await hash((request.headers.get('CF-Connecting-IP')||'unknown')+':feedback:'+new Date().toISOString().slice(0,10));
 const prior=await db.prepare(`SELECT id,visitor FROM community_feedback WHERE id=?`).bind(id).first();if(prior){if(prior.visitor!==visitor)return json({error:'Please start a new report.'},409);return json({ok:true,id:prior.id,reference:'GTA-'+prior.id.slice(0,8).toUpperCase()})}
 const recent=await db.prepare(`SELECT COUNT(*) count FROM community_feedback WHERE ip_hash=? AND created_at>datetime('now','-1 hour')`).bind(ipHash).first();if(Number(recent?.count||0)>=5)return json({error:'You have sent several reports. Please wait an hour before sending another.'},429);
 await db.batch([db.prepare(`INSERT INTO community_feedback(id,visitor,ip_hash,target,kind,rating,title,message,steps,os,version,build,device) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,visitor,ipHash,target,kind,rating,title,message,steps,clean(b.os,20),clean(b.version,30),clean(b.build,100),clean(b.device,80)),db.prepare(`INSERT INTO community_ratings(visitor,target,rating) VALUES(?,?,?) ON CONFLICT(visitor,target) DO UPDATE SET rating=excluded.rating`).bind(visitor,target,rating)]);
 return json({ok:true,id,reference:'GTA-'+id.slice(0,8).toUpperCase()},201,{'Set-Cookie':`gtav_feedback=${visitor}; Max-Age=31536000; Path=/; HttpOnly; Secure; SameSite=Lax`});
 }catch(e){console.error('feedback error',e);return json({error:'Your report could not be saved. Your draft is still here. Please try again.'},500)}
}
