const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const clean=v=>String(v??'').trim().replace(/\s+/g,' ');
const AVATARS=new Set(['generic','gas-mask','trevor','franklin','michael','robber']);
const blocked=/\b(fuck|shit|bitch|cunt|nigg(?:a|er)|faggot|kontol|memek|ngentot|bangsat|anjing|goblok|tolol|babi)\b/i;
const nameKey=v=>clean(v).normalize('NFKC').toLocaleLowerCase('en-US');
const validName=v=>{const n=clean(v);return n.length>=3&&n.length<=24&&/^[\p{L}\p{N}._ -]+$/u.test(n)&&!blocked.test(n)};
const hash=async v=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const cookieValue=request=>{const m=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)gtav_identity=([^;]+)/);return m?decodeURIComponent(m[1]):''};
const token=()=>{const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('')};
const normalizeAvatar=value=>AVATARS.has(value)?value:'generic';
async function setup(db){await db.prepare(`CREATE TABLE IF NOT EXISTS community_profiles(id TEXT PRIMARY KEY,display_name TEXT NOT NULL,display_name_key TEXT NOT NULL UNIQUE,avatar TEXT NOT NULL DEFAULT 'generic',session_hash TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();await db.prepare(`CREATE INDEX IF NOT EXISTS community_profiles_session ON community_profiles(session_hash)`).run()}
async function current(db,request){const raw=cookieValue(request);if(!raw)return null;const row=await db.prepare(`SELECT id,display_name,avatar,created_at,updated_at FROM community_profiles WHERE session_hash=?`).bind(await hash(raw)).first();return row?{id:row.id,displayName:row.display_name,avatar:normalizeAvatar(row.avatar),createdAt:row.created_at,updatedAt:row.updated_at}:null}
export async function onRequest({request,env}){
 if(!env.VISITS_DB)return json({error:'profile_unavailable'},503);const db=env.VISITS_DB,url=new URL(request.url);try{await setup(db);
 if(request.method==='GET'){
  if(url.searchParams.has('check')){const displayName=clean(url.searchParams.get('check'));if(!validName(displayName))return json({available:false,valid:false});const me=await current(db,request);const row=await db.prepare(`SELECT id FROM community_profiles WHERE display_name_key=?`).bind(nameKey(displayName)).first();return json({available:!row||row.id===me?.id,valid:true})}
  return json({profile:await current(db,request)});
 }
 if(request.method!=='POST')return json({error:'method_not_allowed'},405);
 if(request.headers.get('Origin')!==url.origin)return json({error:'invalid_origin'},403);if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'invalid_content_type'},415);
 let body;try{body=await request.json()}catch{return json({error:'invalid_request'},400)}const action=clean(body.action),displayName=clean(body.displayName),avatar=normalizeAvatar(clean(body.avatar)||'generic');
 if(action==='claim'){
  if(await current(db,request))return json({error:'already_has_id'},409);if(!validName(displayName))return json({error:'invalid_display_name',message:'Use 3–24 letters, numbers, spaces, dots, underscores or hyphens.'},400);
  const existing=await db.prepare(`SELECT 1 ok FROM community_profiles WHERE display_name_key=?`).bind(nameKey(displayName)).first();if(existing)return json({error:'display_name_taken',message:'That display name is already in use.'},409);
  const raw=token(),id=crypto.randomUUID();try{await db.prepare(`INSERT INTO community_profiles(id,display_name,display_name_key,avatar,session_hash) VALUES(?,?,?,?,?)`).bind(id,displayName,nameKey(displayName),avatar,await hash(raw)).run()}catch(e){if(String(e).toLowerCase().includes('unique'))return json({error:'display_name_taken',message:'That display name is already in use.'},409);throw e}
  const profile={id,displayName,avatar};return json({ok:true,profile},201,{'Set-Cookie':`gtav_identity=${encodeURIComponent(raw)}; Max-Age=31536000; Path=/; HttpOnly; Secure; SameSite=Lax`});
 }
 if(action==='update'){
  const me=await current(db,request);if(!me)return json({error:'community_id_required'},401);if(!validName(displayName))return json({error:'invalid_display_name',message:'Use 3–24 letters, numbers, spaces, dots, underscores or hyphens.'},400);
  const key=nameKey(displayName),other=await db.prepare(`SELECT id FROM community_profiles WHERE display_name_key=? AND id<>?`).bind(key,me.id).first();if(other)return json({error:'display_name_taken',message:'That display name is already in use.'},409);
  try{await db.prepare(`UPDATE community_profiles SET display_name=?,display_name_key=?,avatar=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(displayName,key,avatar,me.id).run()}catch(e){if(String(e).toLowerCase().includes('unique'))return json({error:'display_name_taken',message:'That display name is already in use.'},409);throw e}
  return json({ok:true,profile:{...me,displayName,avatar}});
 }
 return json({error:'unknown_action'},400);
 }catch(e){console.error('profile api error',e);return json({error:'profile_unavailable'},500)}
}
