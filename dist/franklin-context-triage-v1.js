(()=>{
'use strict';
if(window.__franklinContextTriageV1)return;
window.__franklinContextTriageV1=true;
const crashLike=q=>/\b(crash|crashes|crashing|force close|freeze|frozen|stuck|hang|hung|black screen|white screen|loading forever|press(?:ing)? play|tap(?:ping)? play|fails? to launch|won['’]?t launch|doesn['’]?t launch)\b/i.test(String(q||''));
function clean(q,r){
 if(!r||r.topic!=='developer-triage'||!crashLike(q))return r;
 const p=window.FranklinContextIntelligence?.profile?.();if(!p)return r;
 const known=[];
 if(p.device)known.push(`${p.device.name}${Number.isFinite(p.ram)?` (${p.ram} GB RAM)`:''}`);
 if(p.osFamily)known.push(`${p.osFamily}${Number.isFinite(p.osVersion)?' '+p.osVersion:''}`);
 if(p.appVersion)known.push(`${p.appVersion} build`);
 const missing=[];
 if(!p.device&&!p.ambiguousDevice)missing.push('device model');
 if(!p.osFamily)missing.push('OS version');
 if(!p.appVersion)missing.push('app build');
 const parts=[];
 if(known.length)parts.push(`I already have this session context: ${known.join(' · ')}.`);
 if(p.ambiguousDevice&&!p.device)parts.push(`Your device is currently recorded only as ${p.ambiguousDevice.label}, so I still need the exact generation or model.`);
 parts.push('I do not have enough evidence yet to name the crash cause reliably from the symptom alone.');
 if(missing.length)parts.push(`I still need: ${missing.join(', ')}.`);
 parts.push('Please attach the whole GTA V > Logs folder, or at least run.log / run.prev.log / crash-*.txt from the failed attempt, and tell me exactly what happened immediately before the failure. I will use the session context above automatically instead of asking you to repeat it.');
 return{...r,text:parts.join('\n\n'),grounded:true,suggestions:['Where are the logs?','What context do you know about my device?']};
}
function wrap(){
 const api=window.FranklinDeveloperKB;if(!api||api.__contextTriageV1||typeof api.answer!=='function'||!api.__contextIntelligenceWrapped)return false;
 const original=api.answer.bind(api);api.answer=async q=>clean(q,await original(q));api.__contextTriageV1=true;return true;
}
function tryWrap(){wrap()}
document.addEventListener('franklin-connected',tryWrap);
const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(!(node instanceof HTMLScriptElement))continue;if(/franklin-developer-kb\.js/.test(node.getAttribute('src')||''))node.addEventListener('load',()=>setTimeout(tryWrap,0),{once:true});}});
observer.observe(document.head||document.documentElement,{childList:true});
const timer=setInterval(()=>{if(wrap())clearInterval(timer)},250);
addEventListener('pagehide',()=>{clearInterval(timer);observer.disconnect()},{once:true});
tryWrap();
window.FranklinContextTriage={clean,status:()=>({wrapped:!!window.FranklinDeveloperKB?.__contextTriageV1,forceEnglish:true})};
})();