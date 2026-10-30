(()=>{
'use strict';
if(window.__franklinContextIntelligenceV1)return;
window.__franklinContextIntelligenceV1=true;

const ONBOARDING_KEY='gtav-community-onboarding';
const MIN_IOS=16.3;
const RECOMMENDED_IOS=18;
const PRACTICAL_RAM_MIN=4;
const LOW_MEMORY_MAX=4.5;
const state={catalog:null,promise:null,device:null,deviceSource:'',deviceAmbiguous:null,osFamily:'',osVersion:null,osSource:'',appLabel:'',appSource:'',explicitMemory:null,lastQuestion:'',history:[]};

const SE_FALLBACK=[
 {id:'iphone-se-2',name:'iPhone SE (2nd generation)',family:'SE',chip:'A13 Bionic',cpu:6,gpu:4,ram:3,year:2020,fallback:true},
 {id:'iphone-se-3',name:'iPhone SE (3rd generation)',family:'SE',chip:'A15 Bionic',cpu:6,gpu:4,ram:4,year:2022,fallback:true}
];

const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/[^a-z0-9+.-]+/g,' ').replace(/\s+/g,' ').trim();
const numericVersion=v=>{const m=String(v||'').match(/(\d{1,2})(?:\.(\d{1,2}))?/);return m?Number(`${m[1]}.${m[2]||0}`):null};
const chipGeneration=chip=>{const m=String(chip||'').match(/\bA(\d{1,2})\b/i);return m?Number(m[1]):null};
const isCrash=q=>/\b(crash|crashes|crashing|force close|freeze|frozen|stuck|hang|hung|black screen|white screen|loading forever|infinite loading|closes?|closed|killed|jetsam|press(?:ing)? play|tap(?:ping)? play|launch|launcher crash)\b/i.test(String(q||''));
const isPerformance=q=>/\b(fps|performance|lag|stutter|heat|hot|thermal|graphics|settings?|preset|resolution|metalfx|msaa|shadows?|texture|battery saver|low memory)\b/i.test(String(q||''));
const wantsProfile=q=>/\b(what|which|do you know|can you tell|remember).{0,28}\b(my|the)\s+(device|iphone|phone|model|ios|os|app version|build|version|ram|memory|chip)\b/i.test(String(q||''))||/\bwhat am i using\b/i.test(String(q||''));
const wantsSpecs=q=>/\b(how much ram|what ram|memory does|what chip|which chip|device specs?|phone specs?|my specs?)\b/i.test(String(q||''));

function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||'null')}catch{return null}}
function onboardingModel(){const saved=readJSON(ONBOARDING_KEY);return saved?.device==='ios'&&saved.model?String(saved.model):''}
function supportState(){try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}}

function load(){
 if(state.promise)return state.promise;
 state.promise=fetch('compatibility-data.json?v=20261030context1',{cache:'no-cache'})
  .then(r=>r.ok?r.json():{models:[]})
  .then(data=>{
   const models=[...(data.models||[]),...SE_FALLBACK];
   const seen=new Set();
   state.catalog=models.filter(m=>m?.name).filter(m=>{const k=norm(m.name);if(seen.has(k))return false;seen.add(k);return true;}).map(m=>({...m,_name:norm(m.name)})).sort((a,b)=>b._name.length-a._name.length);
   restoreStoredDevice();
   return state.catalog;
  }).catch(()=>{state.catalog=[...SE_FALLBACK].map(m=>({...m,_name:norm(m.name)}));restoreStoredDevice();return state.catalog;});
 return state.promise;
}

function restoreStoredDevice(){
 if(state.device)return;
 const name=onboardingModel();
 if(!name)return;
 const hit=resolveDeviceName(name);
 if(hit){state.device=hit;state.deviceSource='onboarding';state.deviceAmbiguous=null;}
}

function resolveDeviceName(name){
 const n=norm(name);
 if(!n||!state.catalog)return null;
 return state.catalog.find(m=>m._name===n)||state.catalog.find(m=>n.includes(m._name)||m._name.includes(n))||null;
}

function detectSE(text){
 const n=norm(text);
 if(!/\biphone\s*se\b/.test(n))return null;
 if(/\b(3rd|third|gen\s*3|3rd\s*gen|2022)\b/.test(n))return state.catalog?.find(m=>m.id==='iphone-se-3')||SE_FALLBACK[1];
 if(/\b(2nd|second|gen\s*2|2nd\s*gen|2020)\b/.test(n))return state.catalog?.find(m=>m.id==='iphone-se-2')||SE_FALLBACK[0];
 return {ambiguous:true,label:'iPhone SE',choices:[state.catalog?.find(m=>m.id==='iphone-se-2')||SE_FALLBACK[0],state.catalog?.find(m=>m.id==='iphone-se-3')||SE_FALLBACK[1]]};
}

function detectDevice(text){
 const n=norm(text);
 if(!n)return null;
 const se=detectSE(n);if(se)return se;
 if(!state.catalog?.length)return null;
 const exact=state.catalog.find(m=>n.includes(m._name));if(exact)return exact;
 const shorthand=n.match(/\b(?:iphone\s*)?(1[0-9]|[8-9])\s*(pro\s*max|pro|max|plus|mini)?\b/);
 if(shorthand){
  const num=shorthand[1],suffix=(shorthand[2]||'').replace(/\s+/g,' ');
  const target=`iphone ${num}${suffix?' '+suffix:''}`;
  const hit=state.catalog.find(m=>m._name===target);if(hit)return hit;
 }
 const series=n.match(/\biphone\s*(x|xs|xr|1[0-9])\s*series\b/);
 if(series){
  const key=series[1];const choices=state.catalog.filter(m=>norm(m.family)===key||m._name.startsWith(`iphone ${key}`));
  if(choices.length)return{ambiguous:true,label:`iPhone ${String(key).toUpperCase()} series`,choices};
 }
 return null;
}

function detectOS(text){
 const m=String(text||'').match(/\b(iOS|iPadOS|macOS)\s*(\d{1,2}(?:\.\d{1,2}){0,2})\b/i);
 if(!m)return null;
 const family=({ios:'iOS',ipados:'iPadOS',macos:'macOS'})[m[1].toLowerCase()]||m[1];
 return{family,raw:m[2],version:numericVersion(m[2])};
}

function detectMemory(text){const m=String(text||'').match(/\b(2|3|4|6|8|12|16)\s*GB\s*(?:RAM|memory)?\b/i);return m?Number(m[1]):null}
function detectAppLabel(text){
 const s=String(text||'');
 const m=s.match(/\b(1[6-9]|2\d|3[01])\s+Oct(?:ober)?\s+2026\b/i)||s.match(/\b(1[6-9]|2\d|3[01])\s+Oct(?:ober)?\b/i);
 if(m)return`${m[1]} Oct 2026`;
 const release=s.match(/\b(?:app|launcher)\s*(?:version|build)\s*[:#-]?\s*([A-Za-z0-9._-]{2,24})\b/i)||s.match(/\b(?:build|release)\s*[:#-]?\s*([A-Za-z0-9._-]{2,24})\b/i);
 return release?release[1]:'';
}

function syncFromSupport(){
 const s=supportState();
 if(s.os&&state.osSource!=='message'&&state.osSource!=='log'){const parsed=detectOS(s.os);if(parsed){state.osFamily=parsed.family;state.osVersion=parsed.version;state.osSource='support';}}
 if(state.appSource!=='message'&&state.appSource!=='log'){
  if(s.build?.label){const label=String(s.build.label);const date=label.match(/(\d{1,2}\s+Oct)/i);state.appLabel=date?`${date[1]} 2026`:label;state.appSource='support';}
  else if(s.releaseKey&&/20261029/.test(s.releaseKey)){state.appLabel='29 Oct 2026';state.appSource='support';}
 }
}

async function capture(text,source='message'){
 await load();
 syncFromSupport();
 const os=detectOS(text);if(os){state.osFamily=os.family;state.osVersion=os.version;state.osSource=source;}
 const mem=detectMemory(text);if(mem!==null)state.explicitMemory=mem;
 const app=detectAppLabel(text);if(app){state.appLabel=app;state.appSource=source;}
 const device=detectDevice(text);
 if(device?.ambiguous){state.device=null;state.deviceSource=source;state.deviceAmbiguous=device;state.explicitMemory=mem!==null?mem:null;}
 else if(device){if(!state.device||state.device.id!==device.id){state.explicitMemory=mem!==null?mem:null;}state.device=device;state.deviceSource=source;state.deviceAmbiguous=null;}
 if(!state.device)restoreStoredDevice();
 state.lastQuestion=String(text||'');
 state.history.push({at:Date.now(),source,text:String(text||'').slice(0,500)});if(state.history.length>8)state.history.shift();
 return profile();
}

function profile(){
 syncFromSupport();
 const device=state.device;
 const ram=state.explicitMemory??(device?.ram!=null?Number(device.ram):null);
 const chip=device?.chip||'';
 const gen=chipGeneration(chip);
 return{
  device:device?{id:device.id||'',name:device.name||'',family:device.family||'',chip,ram,gpu:device.gpu??null,cpu:device.cpu??null,fallback:!!device.fallback}:null,
  ambiguousDevice:state.deviceAmbiguous,
  osFamily:state.osFamily||'',osVersion:state.osVersion,
  appVersion:state.appLabel||'',appSource:state.appSource||'',ram,chipGeneration:gen,
  flags:{
   iosUnsupported:state.osFamily==='iOS'&&Number.isFinite(state.osVersion)&&state.osVersion<MIN_IOS,
   iosBelowRecommended:state.osFamily==='iOS'&&Number.isFinite(state.osVersion)&&state.osVersion>=MIN_IOS&&state.osVersion<RECOMMENDED_IOS,
   ramBelowMinimum:Number.isFinite(ram)&&ram<PRACTICAL_RAM_MIN,
   lowMemory:Number.isFinite(ram)&&ram<=LOW_MEMORY_MAX,
   gpuBelowFloor:Number.isFinite(gen)&&gen<=11,
   experimentalGPU:gen===12
  }
 };
}

function deviceLine(p){
 if(!p.device)return'Device: not identified';
 const parts=[p.device.name];
 if(p.device.chip)parts.push(p.device.chip);
 if(Number.isFinite(p.ram))parts.push(`${p.ram} GB RAM`);
 return`Device: ${parts.join(', ')}`;
}
function osLine(p){return p.osFamily?`OS: ${p.osFamily}${Number.isFinite(p.osVersion)?' '+p.osVersion:''}`:'OS: not identified'}
function appLine(p){return`App version: ${p.appVersion||'not identified'}`}

function profileAnswer(p){
 const lines=[deviceLine(p),osLine(p),appLine(p)];
 if(p.ambiguousDevice&&!p.device)lines.unshift(`Device note: ${p.ambiguousDevice.label} is ambiguous; I need the generation to map RAM and chip reliably.`);
 return{text:`Here is the context I can currently use for this session:\n\n${lines.join('\n')}`,topic:'support-context',grounded:true,source:{href:'compatibility.html',label:'Compatibility'},suggestions:['What settings fit this device?','Why is my game crashing?']};
}

function ambiguousAnswer(a){
 const choices=(a.choices||[]).map(d=>`${d.name}: ${d.chip}, ${d.ram} GB RAM`).join('\n');
 return{text:`${a.label} is not one single hardware profile, so I should not guess the RAM or chip.\n\n${choices}\n\nIf you mention the generation or year, I can use the correct hardware limits for the diagnosis.`,topic:'device',grounded:true,source:{href:'compatibility.html',label:'Compatibility'}};
}

function settingsAdvice(p){
 if(!p.device&&!Number.isFinite(p.ram))return null;
 const name=p.device?.name||'this device';
 if(p.flags.gpuBelowFloor)return`${name} uses ${p.device?.chip||'a GPU'} below the normal A13 graphics baseline. Graphics tuning cannot make that path supported.`;
 if(p.flags.ramBelowMinimum)return`${name} has ${p.ram} GB RAM, below the project’s practical 4 GB minimum. Use the most conservative graphics profile available: Normal or lower textures, low render resolution, MSAA off, modest shadows, and a conservative FPS cap. Even then, memory-related exits can still occur because software cannot add physical RAM.`;
 if(p.flags.lowMemory)return`${name} has ${p.ram} GB RAM and falls in the low-memory tier. Start with Normal textures, conservative render resolution, MSAA off, modest shadows, and a stable FPS cap. Preserve Increased Memory Limit when your signing method supports it.`;
 if(Number.isFinite(p.ram)&&p.ram<=6.5)return`${name} has ${p.ram} GB RAM. Start around High textures with moderate render resolution, keep MSAA off while troubleshooting, and prefer a stable 30 or 40 FPS target over an unstable higher cap.`;
 if(Number.isFinite(p.ram))return`${name} has ${p.ram} GB RAM. You have more physical-memory headroom, but app-memory allowance and thermals still matter. Start balanced, then raise texture and render quality one setting at a time.`;
 return null;
}

function crashDiagnosis(p,q){
 if(!isCrash(q))return null;
 const name=p.device?.name||'your device';
 if(p.flags.iosUnsupported)return{text:`The first thing to fix is the OS requirement. ${name} is recorded on iOS ${p.osVersion}, but the audited GTA V build declares iOS ${MIN_IOS} as its MinimumOSVersion. That makes this setup unsupported before we diagnose game files or graphics. Update iOS first, then test the same build again.`,topic:'compatibility',grounded:true,source:{href:'compatibility.html',label:'Compatibility'},suggestions:['What iOS version is recommended?','What device am I using?']};
 if(p.flags.gpuBelowFloor)return{text:`The hardware baseline is the first blocker here. ${name} uses ${p.device?.chip||'an older Apple GPU'}, which is below the project’s normal A13 graphics floor. A crash at or immediately after Play can therefore be a compatibility failure, not just a bad graphics setting.`,topic:'compatibility',grounded:true,source:{href:'compatibility.html',label:'Compatibility'}};
 if(p.flags.ramBelowMinimum)return{text:`Memory pressure is a strong suspect on ${name}. It has ${p.ram} GB RAM, below the project’s practical 4 GB minimum. If the crash happens at Play or while loading, use the most conservative graphics settings and keep MSAA off, but understand that a low-memory preset cannot create missing physical RAM. If it still crashes, the Logs folder is needed to separate memory pressure from missing game data or another fault.`,topic:'troubleshooting',grounded:true,source:{href:'compatibility.html',label:'Compatibility'},suggestions:['Where are the logs?','What settings should I use?']};
 if(p.flags.experimentalGPU)return{text:`${name} uses ${p.device?.chip||'A12-class hardware'}, which the project treats as an experimental path rather than the normal A13 baseline. A crash around Play can be device-path related. Use the lowest practical graphics settings first, then check the Logs folder if the failure remains.`,topic:'troubleshooting',grounded:true,source:{href:'compatibility.html',label:'Compatibility'}};
 if(p.flags.lowMemory)return{text:`Because ${name} has ${p.ram} GB RAM, I would treat memory pressure as one of the first suspects, especially if the crash happens during Play or loading. Use Normal textures, conservative resolution, MSAA off, modest shadows, and a stable FPS cap. This is not a confirmed cause from the symptom alone, so if it still fails, check the Logs folder for the actual error.`,topic:'troubleshooting',grounded:true,source:{href:'compatibility.html',label:'Compatibility'},suggestions:['Where are the logs?','What settings should I use?']};
 if(p.flags.iosBelowRecommended)return{text:`Your recorded iOS ${p.osVersion} is above the audited minimum of ${MIN_IOS}, so I would not call the OS unsupported. However, it is below the project’s current iOS ${RECOMMENDED_IOS}+ recommendation. For a crash at Play, update iOS if possible, but also check the Logs folder because game-data, signing, or runtime faults can produce the same symptom.`,topic:'troubleshooting',grounded:true,source:{href:'compatibility.html',label:'Compatibility'},suggestions:['Where are the logs?','What build am I using?']};
 return null;
}

function contextText(p){
 const parts=[];
 if(p.device){parts.push(p.device.name);if(p.device.chip)parts.push(p.device.chip);if(Number.isFinite(p.ram))parts.push(`${p.ram} GB RAM`);}
 if(p.osFamily)parts.push(`${p.osFamily}${Number.isFinite(p.osVersion)?' '+p.osVersion:''}`);
 if(p.appVersion)parts.push(`${p.appVersion} build`);
 return parts.join(' ');
}

async function directAnswer(q,p){
 if(p.ambiguousDevice&&!p.device&&(wantsSpecs(q)||isPerformance(q)||isCrash(q)))return ambiguousAnswer(p.ambiguousDevice);
 if(wantsProfile(q))return profileAnswer(p);
 if(wantsSpecs(q)&&p.device)return profileAnswer(p);
 if(isPerformance(q)&&!isCrash(q)){
  const advice=settingsAdvice(p);
  if(advice)return{text:advice,topic:'performance',grounded:true,source:{href:'compatibility.html',label:'Compatibility'},suggestions:['Why can app memory be lower than RAM?','What build am I using?']};
 }
 return null;
}
async function answer(q){const p=await capture(q,'message');return directAnswer(q,p);}

function augment(q,result){
 if(!result?.text)return result;
 const p=profile();
 if(!isCrash(q)&&!isPerformance(q))return result;
 if(result.topic==='support-context')return result;
 const lead=[];
 if(p.device)lead.push(`${p.device.name}${Number.isFinite(p.ram)?` (${p.ram} GB RAM)`:''}`);
 if(p.osFamily)lead.push(`${p.osFamily}${Number.isFinite(p.osVersion)?' '+p.osVersion:''}`);
 if(p.appVersion)lead.push(p.appVersion);
 if(!lead.length)return result;
 if(result.text.includes(lead[0]||'__none__'))return result;
 return{...result,text:`Using your session context: ${lead.join(' · ')}.\n\n${result.text}`};
}

function wrapDeveloper(){
 const api=window.FranklinDeveloperKB;
 if(!api||api.__contextIntelligenceWrapped||typeof api.answer!=='function')return false;
 const original=api.answer.bind(api);
 api.answer=async q=>{
  const p=await capture(q,'message');
  const direct=await directAnswer(q,p);if(direct)return direct;
  const enriched=contextText(p);
  const base=await original(enriched?`${q}\n\nSession context: ${enriched}`:q);
  if(base&&base.topic!=='developer-triage')return augment(q,base);
  const crash=crashDiagnosis(p,q);if(crash)return crash;
  return base?augment(q,base):base;
 };
 api.__contextIntelligenceWrapped=true;
 return true;
}

function wrapLogIngest(){
 const api=window.FranklinSupportContext;
 if(!api||api.__contextCaptureWrapped||typeof api.ingestLog!=='function')return false;
 const original=api.ingestLog.bind(api);
 api.ingestLog=async text=>{await capture(text,'log');return original(text)};
 api.__contextCaptureWrapped=true;
 return true;
}

function reset(){state.device=null;state.deviceSource='';state.deviceAmbiguous=null;state.osFamily='';state.osVersion=null;state.osSource='';state.appLabel='';state.appSource='';state.explicitMemory=null;state.lastQuestion='';state.history=[];restoreStoredDevice();}
document.addEventListener('franklin-disconnect',reset);

let tries=0;
const timer=setInterval(()=>{const a=wrapDeveloper(),b=wrapLogIngest();if((a||window.FranklinDeveloperKB?.__contextIntelligenceWrapped)&&(b||!window.FranklinSupportContext?.ingestLog||window.FranklinSupportContext?.__contextCaptureWrapped)){if(++tries>4)clearInterval(timer);}else if(++tries>240)clearInterval(timer);},50);
load();
window.FranklinContextIntelligence={load,capture,profile,answer,directAnswer,augment,contextText,status:()=>({loaded:!!state.catalog,device:profile().device?.name||'',os:profile().osFamily?`${profile().osFamily}${Number.isFinite(profile().osVersion)?' '+profile().osVersion:''}`:'',appVersion:profile().appVersion||'',forceEnglish:true,minimumIOS:MIN_IOS,recommendedIOS:RECOMMENDED_IOS,practicalRamMinimumGB:PRACTICAL_RAM_MIN})};
})();
