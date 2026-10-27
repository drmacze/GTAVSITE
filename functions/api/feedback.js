const ADMIN_HASH='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const clean=(v,n)=>String(v??'').trim().slice(0,n);
const hash=async v=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const visitorFrom=request=>{const cookie=request.headers.get('Cookie')||'',match=cookie.match(/(?:^|;\s*)gtav_feedback=([a-f0-9-]{36})(?:;|$)/i);return match?.[1]||null};
const cookieFor=visitor=>`gtav_feedback=${visitor}; Max-Age=31536000; Path=/; HttpOnly; Secure; SameSite=Lax`;
const normalizeText=value=>String(value||'').normalize('NFKD').toLowerCase().replace(/[013457@$!]/g,c=>({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','!':'i'}[c]||c)).replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const toxicPatterns=[
 /\b(fuck(?:ing|er|ers)?|shit(?:ty)?|bitch(?:es)?|asshole|motherfucker|dickhead|cunt|nigg(?:er|a)s?|retard(?:ed)?|idiot|stupid)\b/i,
 /\b(anjing|anjir|anjay|bangsat|bajingan|kontol|memek|ngentot|goblok|tolol|kampret|keparat|brengsek|bodoh)\b/i,
 /\b(kill yourself|kys|go die|mati aja|bunuh diri)\b/i
];
const isToxic=(...values)=>{const text=normalizeText(values.join(' '));return toxicPatterns.some(pattern=>pattern.test(text))};
async function setup(db){
 await db.prepare(`CREATE TABLE IF NOT EXISTS community_feedback(id TEXT PRIMARY KEY, visitor TEXT NOT NULL, ip_hash TEXT NOT NULL, target TEXT NOT NULL, kind TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), title TEXT NOT NULL, message TEXT NOT NULL, steps TEXT NOT NULL DEFAULT '', os TEXT NOT NULL DEFAULT '', version TEXT NOT NULL DEFAULT '', build TEXT NOT NULL DEFAULT '', device TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'received', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 try{await db.prepare(`ALTER TABLE community_feedback ADD COLUMN public_share INTEGER NOT NULL DEFAULT 0`).run()}catch{}
 await db.prepare(`CREATE INDEX IF NOT EXISTS feedback_recent ON community_feedback(ip_hash,created_at)`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS feedback_public_recent ON community_feedback(public_share,created_at)`).run();
 await db.prepare(`CREATE TABLE IF NOT EXISTS community_ratings(visitor TEXT NOT NULL,target TEXT NOT NULL,rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),PRIMARY KEY(visitor,target))`).run();
 await db.prepare(`CREATE TABLE IF NOT EXISTS community_feedback_reactions(report_id TEXT NOT NULL,visitor TEXT NOT NULL,reaction INTEGER NOT NULL CHECK(reaction IN(-1,1)),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(report_id,visitor))`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS feedback_reaction_report ON community_feedback_reactions(report_id)`).run();
}
async function publicFeed(db,request,url){
 const limit=Math.min(30,Math.max(1,Number(url.searchParams.get('limit')||18)||18)),visitor=visitorFrom(request)||'';
 const rows=await db.prepare(`SELECT f.id,f.target,f.kind,f.rating,f.title,f.message,f.created_at,
 COALESCE(SUM(CASE WHEN r.reaction=1 THEN 1 ELSE 0 END),0) likes,
 COALESCE(SUM(CASE WHEN r.reaction=-1 THEN 1 ELSE 0 END),0) dislikes,
 COALESCE((SELECT rr.reaction FROM community_feedback_reactions rr WHERE rr.report_id=f.id AND rr.visitor=? LIMIT 1),0) my_reaction
 FROM community_feedback f LEFT JOIN community_feedback_reactions r ON r.report_id=f.id
 WHERE f.public_share=1 AND f.status NOT IN('hidden','rejected')
 GROUP BY f.id ORDER BY f.created_at DESC,f.id DESC LIMIT ?`).bind(visitor,limit).all();
 const items=(rows.results||[]).filter(item=>!isToxic(item.title,item.message)).map(item=>({id:item.id,target:item.target,kind:item.kind,rating:Number(item.rating),title:item.title,message:item.message,createdAt:item.created_at,likes:Number(item.likes||0),dislikes:Number(item.dislikes||0),myReaction:Number(item.my_reaction||0)}));
 return json({items});
}
async function react(db,request,b){
 const reportId=clean(b.reportId,40),reaction=Number(b.reaction);if(!/^[0-9a-f-]{36}$/i.test(reportId)||![1,-1].includes(reaction))return json({error:'invalid_reaction'},400);
 const report=await db.prepare(`SELECT id,title,message,public_share,status FROM community_feedback WHERE id=?`).bind(reportId).first();
 if(!report||Number(report.public_share)!==1||['hidden','rejected'].includes(report.status)||isToxic(report.title,report.message))return json({error:'Feedback is not available.'},404);
 const visitor=visitorFrom(request)||crypto.randomUUID(),existing=await db.prepare(`SELECT reaction FROM community_feedback_reactions WHERE report_id=? AND visitor=?`).bind(reportId,visitor).first();
 let myReaction=reaction;
 if(Number(existing?.reaction)===reaction){await db.prepare(`DELETE FROM community_feedback_reactions WHERE report_id=? AND visitor=?`).bind(reportId,visitor).run();myReaction=0}else{await db.prepare(`INSERT INTO community_feedback_reactions(report_id,visitor,reaction) VALUES(?,?,?) ON CONFLICT(report_id,visitor) DO UPDATE SET reaction=excluded.reaction,created_at=CURRENT_TIMESTAMP`).bind(reportId,visitor,reaction).run()}
 const counts=await db.prepare(`SELECT SUM(CASE WHEN reaction=1 THEN 1 ELSE 0 END) likes,SUM(CASE WHEN reaction=-1 THEN 1 ELSE 0 END) dislikes FROM community_feedback_reactions WHERE report_id=?`).bind(reportId).first();
 return json({ok:true,reportId,myReaction,likes:Number(counts?.likes||0),dislikes:Number(counts?.dislikes||0)},200,{'Set-Cookie':cookieFor(visitor)});
}
export async function onRequest({request,env}){
 if(!['GET','POST'].includes(request.method))return json({error:'method_not_allowed'},405);
 if(!env.VISITS_DB)return json({error:'Feedback is temporarily unavailable. Please try again later.'},503);
 const url=new URL(request.url),db=env.VISITS_DB;
 try{
  await setup(db);
  if(request.method==='GET'){
   if(url.searchParams.has('feed'))return publicFeed(db,request,url);
   if(url.searchParams.has('admin')){if(await hash(request.headers.get('X-Admin-Token')||'')!==ADMIN_HASH)return json({error:'unauthorized'},401);const snapshotParam=Number(url.searchParams.get('snapshot')),offset=Number(url.searchParams.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0)return json({error:'invalid_offset'},400);const latest=await db.prepare(`SELECT COALESCE(MAX(rowid),0) snapshot FROM community_feedback`).first();const snapshot=url.searchParams.has('snapshot')&&Number.isSafeInteger(snapshotParam)&&snapshotParam>=0?Math.min(snapshotParam,Number(latest.snapshot)):Number(latest.snapshot);const totals=await db.prepare(`SELECT COUNT(*) total,SUM(CASE WHEN kind='issue' THEN 1 ELSE 0 END) issues,SUM(CASE WHEN kind='feedback' THEN 1 ELSE 0 END) feedback FROM community_feedback WHERE rowid<=?`).bind(snapshot).first();const ratings=await db.prepare(`SELECT target,COUNT(*) count,AVG(rating) average FROM community_ratings GROUP BY target`).all();const result=await db.prepare(`SELECT id,target,kind,rating,title,message,steps,os,version,build,device,status,created_at,public_share FROM community_feedback WHERE rowid<=? ORDER BY created_at DESC,id DESC LIMIT 200 OFFSET ?`).bind(snapshot,offset).all();const total=Number(totals.total||0);return json({items:result.results||[],snapshot,total,nextOffset:offset+200<total?offset+200:null,summary:{reports:total,issues:Number(totals.issues||0),feedback:Number(totals.feedback||0),ratings:ratings.results||[]}})}
   const result=await db.prepare(`SELECT target,COUNT(*) count,AVG(rating) average FROM community_ratings GROUP BY target`).all();return json({ratings:(result.results||[]).map(r=>({target:r.target,count:Number(r.count),average:Number(r.average)}))});
  }
  if(request.headers.get('Origin')!==url.origin)return json({error:'Please send feedback from this website.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'invalid_content_type'},415);
  if(Number(request.headers.get('Content-Length')||0)>18000)return json({error:'Your report is too long.'},413);
  const raw=await request.text();if(raw.length>18000)return json({error:'Your report is too long.'},413);
  let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid report.'},400)}
  if(b?.action==='react')return react(db,request,b);
  const id=clean(b.id,40),target=clean(b.target,20),kind=clean(b.kind,20),rating=Number(b.rating),title=clean(b.title,100),message=clean(b.message,3000),steps=clean(b.steps,2000),publicShare=b.publicShare==='yes'||b.publicShare===true||b.publicShare==='1';
  if(!/^[0-9a-f-]{36}$/i.test(id)||!['helper','launcher'].includes(target)||!['feedback','issue'].includes(kind)||!Number.isInteger(rating)||rating<1||rating>5||title.length<5||message.length<15||(kind==='issue'&&steps.length<10))return json({error:'Please complete the rating and required report details.'},400);
  if(isToxic(title,message,steps))return json({error:'Please keep feedback respectful and remove toxic, abusive, or offensive language before sending.'},422);
  const visitor=visitorFrom(request)||crypto.randomUUID();
  const ipHash=await hash((request.headers.get('CF-Connecting-IP')||'unknown')+':feedback:'+new Date().toISOString().slice(0,10));
  const prior=await db.prepare(`SELECT id,visitor FROM community_feedback WHERE id=?`).bind(id).first();if(prior){if(prior.visitor!==visitor)return json({error:'Please start a new report.'},409);return json({ok:true,id:prior.id,reference:'GTA-'+prior.id.slice(0,8).toUpperCase()})}
  const recent=await db.prepare(`SELECT COUNT(*) count FROM community_feedback WHERE ip_hash=? AND created_at>datetime('now','-1 hour')`).bind(ipHash).first();if(Number(recent?.count||0)>=5)return json({error:'You have sent several reports. Please wait an hour before sending another.'},429);
  await db.batch([db.prepare(`INSERT INTO community_feedback(id,visitor,ip_hash,target,kind,rating,title,message,steps,os,version,build,device,public_share) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,visitor,ipHash,target,kind,rating,title,message,steps,clean(b.os,20),clean(b.version,30),clean(b.build,100),clean(b.device,80),publicShare?1:0),db.prepare(`INSERT INTO community_ratings(visitor,target,rating) VALUES(?,?,?) ON CONFLICT(visitor,target) DO UPDATE SET rating=excluded.rating`).bind(visitor,target,rating)]);
  return json({ok:true,id,reference:'GTA-'+id.slice(0,8).toUpperCase(),public:publicShare},201,{'Set-Cookie':cookieFor(visitor)});
 }catch(e){console.error('feedback error',e);return json({error:'Your report could not be saved. Your draft is still here. Please try again.'},500)}
}
