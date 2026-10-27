const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
const schema=`CREATE TABLE IF NOT EXISTS community_daily_stats (date TEXT PRIMARY KEY, joined INTEGER, left_count INTEGER, online_peak INTEGER, updated_at TEXT NOT NULL)`;
export async function onRequest({request,env}){
 if(!['GET','PUT'].includes(request.method))return json({error:'method_not_allowed'},405);
 if(request.method==='PUT'){
  if(!env.COMMUNITY_STATS_INGEST_KEY)return json({error:'tracking_not_configured'},503);
  const provided=request.headers.get('Authorization')||'';
  const digest=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
  const [a,b]=await Promise.all([digest(provided),digest('Bearer '+env.COMMUNITY_STATS_INGEST_KEY)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];if(diff)return json({error:'unauthorized'},401);
 }
 if(!env.VISITS_DB)return request.method==='GET'?json({days:[],updatedAt:null,tracking:false}):json({error:'database_unavailable'},503);
 try{
  await env.VISITS_DB.prepare(schema).run();
  if(request.method==='PUT'){
   const text=await request.text();if(new TextEncoder().encode(text).length>2048)return json({error:'payload_too_large'},413);
   let data;try{data=JSON.parse(text);}catch{return json({error:'invalid_json'},400);}
   const date=data?.date;const today=new Date().toISOString().slice(0,10);
   if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date>today)return json({error:'invalid_date'},400);
   const keys=['joined','left','onlinePeak'];if(!keys.every(k=>data[k]===null||(Number.isSafeInteger(data[k])&&data[k]>=0&&data[k]<=10000000)))return json({error:'invalid_counts'},400);
   const time=new Date().toISOString();
   await env.VISITS_DB.prepare(`INSERT INTO community_daily_stats (date,joined,left_count,online_peak,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(date) DO UPDATE SET joined=excluded.joined,left_count=excluded.left_count,online_peak=excluded.online_peak,updated_at=excluded.updated_at`).bind(date,data.joined,data.left,data.onlinePeak,time).run();
   return json({saved:true,date});
  }
  const cutoff=new Date();cutoff.setUTCDate(cutoff.getUTCDate()-29);
  const result=await env.VISITS_DB.prepare(`SELECT date,joined,left_count AS "left",online_peak AS onlinePeak,updated_at FROM community_daily_stats WHERE date>=? ORDER BY date`).bind(cutoff.toISOString().slice(0,10)).all();
  const rows=result.results||[];const updatedAt=rows.reduce((latest,r)=>!latest||r.updated_at>latest?r.updated_at:latest,null);
  return json({days:rows.map(({updated_at,...r})=>r),updatedAt,tracking:!!env.COMMUNITY_STATS_INGEST_KEY});
 }catch{return json({error:'stats_unavailable'},503);}
}
