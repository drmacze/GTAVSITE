const ADMIN_TOKEN_SHA256='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';
const MAX_BYTES=3_000_000;

function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'}})}
async function sha256Hex(value){const bytes=new TextEncoder().encode(String(value||''));const digest=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function isAdmin(request){const token=request.headers.get('X-Admin-Token')||'';if(!token)return false;const actual=await sha256Hex(token);if(actual.length!==ADMIN_TOKEN_SHA256.length)return false;let diff=0;for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^ADMIN_TOKEN_SHA256.charCodeAt(i);return diff===0}
function sameOrigin(request){const origin=request.headers.get('Origin');return!origin||origin===new URL(request.url).origin}
async function ensureTable(db){await db.prepare(`CREATE TABLE IF NOT EXISTS project_site_icon (slot TEXT PRIMARY KEY,mime TEXT NOT NULL,size INTEGER NOT NULL,bytes BLOB NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run()}
function bytesToBase64(value){const bytes=value instanceof Uint8Array?value:new Uint8Array(value);let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length)));return btoa(binary)}
function base64ToBytes(value){const binary=atob(value),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes}
function toBytes(value){if(typeof value==='string'){if(value.startsWith('b64:'))return base64ToBytes(value.slice(4));return new Uint8Array()}if(value instanceof ArrayBuffer)return new Uint8Array(value);if(ArrayBuffer.isView(value))return new Uint8Array(value.buffer,value.byteOffset,value.byteLength);if(Array.isArray(value))return Uint8Array.from(value);return new Uint8Array()}

export async function onRequest(context){
 const{request,env}=context;
 if(!env.VISITS_DB)return json({error:'database_unavailable'},503);
 if(!['GET','POST','DELETE'].includes(request.method))return json({error:'method_not_allowed'},405);
 try{
  await ensureTable(env.VISITS_DB);
  const url=new URL(request.url);
  if(request.method==='GET'){
   const row=await env.VISITS_DB.prepare(`SELECT mime,size,bytes,updated_at FROM project_site_icon WHERE slot='current' LIMIT 1`).first();
   if(url.searchParams.get('meta')==='1')return json({customized:!!row,updatedAt:row?.updated_at||null,size:Number(row?.size||0)});
   if(!row)return Response.redirect(new URL('/assets/community-mark-512.png',url.origin),302);
   const bytes=toBytes(row.bytes);
   if(!bytes.byteLength)return Response.redirect(new URL('/assets/community-mark-512.png',url.origin),302);
   return new Response(bytes,{headers:{'Content-Type':'image/png','Content-Length':String(bytes.byteLength),'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}});
  }
  if(!sameOrigin(request))return json({error:'origin_not_allowed'},403);
  if(!(await isAdmin(request)))return json({error:'unauthorized'},401);
  if(request.method==='DELETE'){
   await env.VISITS_DB.prepare(`DELETE FROM project_site_icon WHERE slot='current'`).run();
   return json({ok:true,customized:false,url:'/api/site-icon'});
  }
  const mime=(request.headers.get('Content-Type')||'').split(';')[0].trim().toLowerCase();
  if(mime!=='image/png')return json({error:'png_required'},415);
  const body=await request.arrayBuffer();
  if(!body.byteLength)return json({error:'empty_image'},400);
  if(body.byteLength>MAX_BYTES)return json({error:'image_too_large'},413);
  const encoded='b64:'+bytesToBase64(new Uint8Array(body));
  await env.VISITS_DB.prepare(`INSERT INTO project_site_icon (slot,mime,size,bytes,updated_at) VALUES ('current','image/png',?,?,CURRENT_TIMESTAMP) ON CONFLICT(slot) DO UPDATE SET mime='image/png',size=excluded.size,bytes=excluded.bytes,updated_at=CURRENT_TIMESTAMP`).bind(body.byteLength,encoded).run();
  return json({ok:true,customized:true,size:body.byteLength,url:'/api/site-icon',updatedAt:new Date().toISOString()},201);
 }catch(error){console.error('site icon api error',error);return json({error:'site_icon_error'},500)}
}
