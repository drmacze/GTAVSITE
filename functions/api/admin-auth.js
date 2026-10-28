const ADMIN_TOKEN_SHA256='e0bc60c82713f64ef8a57c0c40d02ce24fd0141d5cc3086259c19b1e62a62bea';

function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'}})}

async function sha256Hex(value){const bytes=new TextEncoder().encode(String(value||''));const digest=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')}

function constantTimeEqual(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i+=1)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}

export async function onRequestGet({request}){const token=request.headers.get('X-Admin-Token')||'';if(!token)return json({ok:false,error:'unauthorized'},401);const actual=await sha256Hex(token);if(!constantTimeEqual(actual,ADMIN_TOKEN_SHA256))return json({ok:false,error:'unauthorized'},401);return json({ok:true})}
