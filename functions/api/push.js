const ADMIN_TOKEN_SHA256='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';
const NOTIFICATION_TITLE='GTA V IOS Website';
const NOTIFICATION_ICON='/assets/notification-logo.jpeg';

function json(payload,status=200,headers={}){return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff',...headers}})}
function clean(v,n=240){return String(v??'').trim().slice(0,n)}
function sameOrigin(request){const origin=request.headers.get('Origin');return !origin||origin===new URL(request.url).origin}
async function sha256Hex(value){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value||'')));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function isAdmin(request){return(await sha256Hex(request.headers.get('X-Admin-Token')||''))===ADMIN_TOKEN_SHA256}
function b64urlBytes(value){const bytes=value instanceof Uint8Array?value:new Uint8Array(value);let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64urlText(value){return b64urlBytes(new TextEncoder().encode(value))}
function safeTarget(value,origin){const raw=clean(value,1000)||'/updates.html';try{const url=new URL(raw,origin);if(url.origin!==origin)return'/updates.html';return url.pathname+url.search+url.hash}catch{return'/updates.html'}}
function safePushEndpoint(value){try{const u=new URL(clean(value,2200));if(u.protocol!=='https:')return'';const h=u.hostname.toLowerCase();const allowed=['googleapis.com','google.com','mozilla.com','apple.com','windows.com','microsoft.com'];if(!allowed.some(s=>h===s||h.endsWith('.'+s)))return'';return u.href}catch{return''}}

async function setup(db){
 await db.prepare(`CREATE TABLE IF NOT EXISTS push_config(name TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 await db.prepare(`CREATE TABLE IF NOT EXISTS push_subscriptions(endpoint TEXT PRIMARY KEY,expiration_time TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 await db.prepare(`CREATE TABLE IF NOT EXISTS push_notifications(id TEXT PRIMARY KEY,body TEXT NOT NULL,target_url TEXT NOT NULL DEFAULT '/updates.html',sent_count INTEGER NOT NULL DEFAULT 0,failed_count INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 await db.prepare(`CREATE INDEX IF NOT EXISTS idx_push_notifications_created ON push_notifications(created_at)`).run();
}
async function ensureVapid(db){
 let row=await db.prepare(`SELECT value FROM push_config WHERE name='vapid' LIMIT 1`).first();
 if(row?.value){try{return JSON.parse(row.value)}catch{}}
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const privateJwk=await crypto.subtle.exportKey('jwk',pair.privateKey);
 const publicRaw=await crypto.subtle.exportKey('raw',pair.publicKey);
 const config={privateJwk,publicKey:b64urlBytes(publicRaw)};
 await db.prepare(`INSERT OR IGNORE INTO push_config(name,value,updated_at) VALUES('vapid',?,CURRENT_TIMESTAMP)`).bind(JSON.stringify(config)).run();
 row=await db.prepare(`SELECT value FROM push_config WHERE name='vapid' LIMIT 1`).first();
 return JSON.parse(row.value);
}
function derToJose(signature){
 const sig=new Uint8Array(signature);if(sig.length===64)return sig;
 if(sig[0]!==0x30)throw new Error('invalid_ecdsa_signature');let p=2;
 if(sig[1]&0x80)p=2+(sig[1]&0x7f);
 if(sig[p++]!==0x02)throw new Error('invalid_ecdsa_r');let rl=sig[p++];let r=sig.slice(p,p+rl);p+=rl;
 if(sig[p++]!==0x02)throw new Error('invalid_ecdsa_s');let sl=sig[p++];let s=sig.slice(p,p+sl);
 while(r.length>32&&r[0]===0)r=r.slice(1);while(s.length>32&&s[0]===0)s=s.slice(1);
 const out=new Uint8Array(64);out.set(r.slice(-32),32-Math.min(32,r.length));out.set(s.slice(-32),64-Math.min(32,s.length));return out;
}
async function vapidJwt(endpoint,config,subject){
 const audience=new URL(endpoint).origin,header=b64urlText(JSON.stringify({typ:'JWT',alg:'ES256'}));
 const payload=b64urlText(JSON.stringify({aud:audience,exp:Math.floor(Date.now()/1000)+12*60*60,sub:subject}));
 const input=header+'.'+payload;
 const key=await crypto.subtle.importKey('jwk',config.privateJwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(input));
 return input+'.'+b64urlBytes(derToJose(signature));
}
async function sendEmptyPush(endpoint,config,subject){
 const token=await vapidJwt(endpoint,config,subject);
 return fetch(endpoint,{method:'POST',headers:{TTL:'86400',Urgency:'normal',Authorization:`vapid t=${token}, k=${config.publicKey}`}});
}

export async function onRequest({request,env}){
 if(!env.VISITS_DB)return json({error:'database_unavailable'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'method_not_allowed'},405,{Allow:'GET, POST'});
 try{
  await setup(env.VISITS_DB);const config=await ensureVapid(env.VISITS_DB);const url=new URL(request.url),mode=url.searchParams.get('mode')||'config';
  if(request.method==='GET'){
   if(mode==='config')return json({title:NOTIFICATION_TITLE,icon:NOTIFICATION_ICON,vapidPublicKey:config.publicKey});
   if(mode==='latest'){
    const row=await env.VISITS_DB.prepare(`SELECT id,body,target_url,created_at FROM push_notifications ORDER BY created_at DESC LIMIT 1`).first();
    if(!row)return json({title:NOTIFICATION_TITLE,body:'',url:'/updates.html',icon:NOTIFICATION_ICON});
    return json({id:row.id,title:NOTIFICATION_TITLE,body:row.body,url:row.target_url,icon:NOTIFICATION_ICON,createdAt:row.created_at});
   }
   if(mode==='admin'){
    if(!(await isAdmin(request)))return json({error:'unauthorized'},401);
    const count=await env.VISITS_DB.prepare(`SELECT COUNT(*) count FROM push_subscriptions`).first();
    const history=await env.VISITS_DB.prepare(`SELECT id,body,target_url,sent_count,failed_count,created_at FROM push_notifications ORDER BY created_at DESC LIMIT 30`).all();
    return json({title:NOTIFICATION_TITLE,icon:NOTIFICATION_ICON,subscribers:Number(count?.count||0),history:history.results||[]});
   }
   return json({error:'invalid_mode'},400);
  }

  if(!sameOrigin(request))return json({error:'origin_not_allowed'},403);
  let body;try{body=await request.json()}catch{return json({error:'invalid_json'},400)}
  const action=clean(body.action,30);
  if(action==='subscribe'){
   const endpoint=safePushEndpoint(body.subscription?.endpoint||body.endpoint);if(!endpoint)return json({error:'invalid_push_endpoint'},400);
   const expiration=body.subscription?.expirationTime==null?'':clean(body.subscription.expirationTime,80);
   await env.VISITS_DB.prepare(`INSERT INTO push_subscriptions(endpoint,expiration_time,created_at,updated_at) VALUES(?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(endpoint) DO UPDATE SET expiration_time=excluded.expiration_time,updated_at=CURRENT_TIMESTAMP`).bind(endpoint,expiration).run();
   return json({ok:true},201);
  }
  if(action==='unsubscribe'){
   const endpoint=safePushEndpoint(body.endpoint);if(endpoint)await env.VISITS_DB.prepare(`DELETE FROM push_subscriptions WHERE endpoint=?`).bind(endpoint).run();
   return json({ok:true});
  }
  if(action==='send'){
   if(!(await isAdmin(request)))return json({error:'unauthorized'},401);
   const message=clean(body.body,240);if(!message)return json({error:'message_required'},400);
   const target=safeTarget(body.url,url.origin),id=crypto.randomUUID();
   await env.VISITS_DB.prepare(`INSERT INTO push_notifications(id,body,target_url,created_at) VALUES(?,?,?,CURRENT_TIMESTAMP)`).bind(id,message,target).run();
   const subs=await env.VISITS_DB.prepare(`SELECT endpoint FROM push_subscriptions ORDER BY updated_at DESC LIMIT 500`).all();
   const endpoints=(subs.results||[]).map(r=>r.endpoint),subject=url.origin+'/';
   let sent=0,failed=0;const stale=[];
   const results=await Promise.allSettled(endpoints.map(async endpoint=>{const response=await sendEmptyPush(endpoint,config,subject);if(response.ok){sent++;return}failed++;if(response.status===404||response.status===410)stale.push(endpoint)}));
   for(const result of results)if(result.status==='rejected')failed++;
   if(stale.length)await Promise.all(stale.map(endpoint=>env.VISITS_DB.prepare(`DELETE FROM push_subscriptions WHERE endpoint=?`).bind(endpoint).run()));
   await env.VISITS_DB.prepare(`UPDATE push_notifications SET sent_count=?,failed_count=? WHERE id=?`).bind(sent,failed,id).run();
   return json({ok:true,id,title:NOTIFICATION_TITLE,subscribers:endpoints.length,sent,failed,url:target},201);
  }
  return json({error:'invalid_action'},400);
 }catch(error){console.error('push api error',error);return json({error:'push_error'},500)}
}
