import {answerDeveloper} from './_developer-engine.js';
const headers={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(d,status=200)=>new Response(JSON.stringify(d),{status,headers});
export async function onRequest({request,env}){
 if(request.method!=='POST')return json({error:'method_not_allowed'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'origin_not_allowed'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'invalid_content_type'},415);
 if(!env.XDE_KB_PARTS)return json({error:'private_helper_unavailable'},503);
 try{
 if(!env.VISITS_DB)return json({error:'private_helper_unavailable'},503);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+(env.XDE_KB_0||''))))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const slot=Math.floor(Date.now()/60000);
 await env.VISITS_DB.prepare('CREATE TABLE IF NOT EXISTS helper_rate (key TEXT PRIMARY KEY, slot INTEGER NOT NULL, count INTEGER NOT NULL)').run();
 const row=await env.VISITS_DB.prepare('INSERT INTO helper_rate(key,slot,count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN slot=excluded.slot THEN count+1 ELSE 1 END, slot=excluded.slot RETURNING count').bind(hash,slot).first();
 if(!row||row.count>15)return json({error:'rate_limited'},429);
 await env.VISITS_DB.prepare('DELETE FROM helper_rate WHERE slot < ?').bind(slot-2).run();
 const reader=request.body?.getReader();if(!reader)return json({error:'invalid_question'},400);let size=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>400000){await reader.cancel();return json({error:'too_large'},413);}parts.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.byteLength;}const body=new TextDecoder().decode(bytes);if(new TextEncoder().encode(body).length>400000)return json({error:'too_large'},413);const d=JSON.parse(body);if(typeof d.question!=='string'||!d.question.trim()||d.question.length>100000)return json({error:'invalid_question'},400);
 // Never log or persist the question or uploaded excerpt.
 const kb=JSON.parse(Array.from({length:Number(env.XDE_KB_PARTS)},(_,i)=>env['XDE_KB_'+i]||'').join(''));if(!Array.isArray(kb))return json({error:'private_helper_unavailable'},503);
 const answer=await answerDeveloper(kb,d.question);return json({answer});
 }catch{return json({error:'analysis_failed'},400);}
}
