/* Developer troubleshooting knowledge. Source data is local JSON, never executable instructions. */
(()=>{
'use strict';
if(window.__franklinDeveloperKB2)return;
window.__franklinDeveloperKB2=true;

const SNAPSHOT='2026-10-31';
const KB_URL='knowledge/kb.json?v=20261031developer2';
const CURRENT_RELEASE='30 Oct 2026';
const CURRENT_KEYS=new Set(['release-20261030-ios','release-20261030-macos']);
const BUILD_CATALOG=[
 ['C2CC8111','18 Oct 2026','iOS / iPadOS','',false],
 ['8041FAB9','20 Oct 2026','iOS / iPadOS','Oct 20 2026 06:12:09',false],
 ['313C1F8D','21 Oct 2026','iOS / iPadOS','Oct 21 2026 06:56:55',false],
 ['193E06C4','22 Oct 2026 morning','iOS / iPadOS','Oct 22 2026 08:39:18',false],
 ['1514D0A6','22 Oct 2026 second update','iOS / iPadOS','Oct 22 2026 10:39:52',false],
 ['BBE4596C','23 Oct 2026','iOS / iPadOS','Oct 22 2026 21:09:13',false],
 ['4CB1849E','24 Oct 2026','iOS / iPadOS','Oct 24 2026 00:02:28',false],
 ['CF8E87FB','24 Oct 2026 evening test','iOS / iPadOS','Oct 24 2026 19:51:15',false],
 ['81F8A070','25 Oct 2026','iOS / iPadOS','Oct 25 2026 21:13:51',false],
 ['35EAB785','25 Oct 2026','macOS','',false],
 ['32BC6458','26 Oct 2026','iOS / iPadOS','Oct 26 2026 17:28:09',false],
 ['7234D513','26 Oct 2026','macOS','',false],
 ['367053AC','29 Oct 2026','iOS / iPadOS','Oct 29 2026 20:09:28',false],
 ['5C9B8E26','29 Oct 2026','macOS','',false],
 ['31927966','30 Oct 2026','iOS / iPadOS','Oct 31 2026 00:23:16',true],
 ['255B475E','30 Oct 2026','macOS','Oct 29 2026',true]
].map(([uuid,label,platform,compat,current])=>({uuid,label,platform,compat,current}));

let entries=null;
let promise=null;
let last=null;
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+./:_-]+/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set('a an the this that it is are was were my i to of on in for at after when with and or game gta ios iphone ipad mac please help fix me issue problem'.split(' '));
const aliases={
 layar:'screen',hitam:'black',macet:'stuck',beku:'freeze',mogok:'freeze',panas:'hot',uang:'money',hilang:'missing',kamera:'camera',foto:'photo',garasi:'garage',berhenti:'freeze',keluar:'crash',gagal:'failed',memori:'memory',arsip:'archive',rusak:'broken',ngecrash:'crash',crash:'crash',ngelag:'lag',lag:'performance',setelah:'after',memuat:'loading',refleksi:'reflection',bayangan:'shadows',senjata:'weapon',mobil:'vehicle',online:'online',mod:'mods',mods:'mods',tanda:'marker',bangunan:'building',masuk:'join',teman:'friend',versi:'build',build:'build',log:'logs',folder:'folder',simpan:'save',save:'save',macbook:'macos'
};
const tokens=v=>[...new Set(norm(v).split(' ').flatMap(t=>[t,aliases[t]]).filter(t=>t&&t.length>1&&!stop.has(t)))];
const context=()=>{try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}};

async function load(){
 if(!promise)promise=fetch(KB_URL,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('knowledge unavailable');return r.json();}).then(data=>{
  entries=Array.isArray(data)?data.filter(e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&Array.isArray(e.player_fix)):[];
  return entries;
 }).catch(()=>{promise=null;return[]});
 return promise;
}

function detectBuild(raw){
 const text=String(raw||'');
 const upper=text.toUpperCase();
 let found=BUILD_CATALOG.find(b=>upper.includes(b.uuid));
 if(!found){
  const compat=text.match(/compat\s+built\s+([^\r\n]+)/i)?.[1]?.trim()||'';
  if(compat){
   found=BUILD_CATALOG.find(b=>b.compat&&norm(compat).includes(norm(b.compat)))||null;
  }
 }
 if(!found)return null;
 return {...found,outdated:!found.current};
}

function buildAnswer(build){
 const current=build.current?'This is the current public 30 Oct release.':`This is an older ${build.label} build. The current public release is ${CURRENT_RELEASE}.`;
 const compat=build.compat?` Compat build: ${build.compat}.`:'';
 return {
  text:`Your log identifies ${build.platform} ${build.label}. GTA5 UUID ${build.uuid}.${compat}\n\n${current}${build.outdated?' Install the current build over the existing app with the same signing setup so data and saves stay in place.':''}`,
  topic:'build-identification',grounded:true,knowledgeId:'REF-02',discord:build.outdated,
  suggestions:['What should I check next?','Where are the Logs?']
 };
}

function isLogLike(q){return /[\r\n]/.test(q)||/gta5 uuid|compat built|sigsegv|sigtrap|fatal error|critical archive|game hung|hang detect|streamer:|datapatch:|no movies\/|0xdddd|previous run:|mb left|cv[e]?hicle|cfilemgr|dxmt|macport/i.test(q)}
function genericFailure(q){return /(?:crash|crashes|crashing|force close|freeze|frozen|stuck|black screen|doesn.t work|won.t work|not working|ngecrash|macet|beku|layar hitam|keluar sendiri)/i.test(q)}
function asksReference(q){return /(?:which|what|how|can|does|supported|support|device|iphone|ipad|mac|build|version|online|session|job|heist|mod|mods|sign|install|trainer|launcher|where|why|by design|works?)/i.test(q)}

function signatureScore(signature,raw,n){
 const s=String(signature||'');
 const sn=norm(s);
 if(!sn)return 0;
 if(s.includes('...')){
  const pieces=s.split('...').map(norm).filter(x=>x.length>=4);
  if(pieces.length&&pieces.every(p=>n.includes(p)))return 72;
 }
 const anchors=sn.split(' ').filter(t=>t.length>=4&&!['from','with','this','that'].includes(t));
 if(sn.length>=8&&n.includes(sn))return 90;
 if(anchors.length>=2){const hit=anchors.filter(t=>n.includes(t)).length;if(hit>=Math.min(3,anchors.length))return 48+hit*4;}
 const special=[
  ['unable to find critical archive',88],['datapatch no patches',88],['no movies/',85],['game hung for 10',85],
  ['0xdddd',86],['previous run',55],['terminated by signal 15',84],['sample count 8',86],['cv ehicle stream render gfx',70]
 ];
 for(const [needle,score] of special)if(norm(raw).includes(norm(needle))&&sn.includes(norm(needle).split(' ')[0]))return score;
 return 0;
}

function rank(data,raw){
 const n=norm(raw),qt=tokens(raw),referenceIntent=asksReference(n);
 const df=new Map();
 data.forEach(e=>new Set(tokens([e.title,...(e.symptoms||[]),...(e.log_signatures||[]),e.category].join(' '))).forEach(t=>df.set(t,(df.get(t)||0)+1)));
 return data.map(e=>{
  const fields=[e.title,...(e.symptoms||[]),e.category,e.cause||'',...(e.player_fix||[])].map(norm);
  const all=tokens(fields.join(' '));
  let score=0,hits=0,signature=false;
  for(const rawSig of e.log_signatures||[]){const s=signatureScore(rawSig,raw,n);if(s){score+=s;signature=true;}}
  for(const t of qt){if(all.includes(t)){score+=Math.log(1+data.length/(df.get(t)||1))*2.4;hits++;}}
  for(const f of fields.slice(0,1+(e.symptoms?.length||0)))if(f.length>10&&(n.includes(f)||(f.includes(n)&&n.length>16)))score+=20;
  if(e.kind==='reference')score+=referenceIntent?7:-8;
  if(e.still_open&&/still|again|same|open|unfixed/.test(n))score+=4;
  if(/\bmac\b|macos/.test(n)&&!(e.platforms||[]).includes('macOS'))score-=18;
  if(/iphone|ipad|ios/.test(n)&&(e.platforms||[]).length===1&&(e.platforms||[]).includes('macOS'))score-=18;
  return{e,score,hits,signature};
 }).sort((a,b)=>b.score-a.score);
}

function statusText(e){
 if(e.released===false)return `Status: ${e.status}. The referenced fix is not in the current public release yet.`;
 if(e.still_open)return `Status: ${e.status}. This case is still open or still needs a player-side step.`;
 if(e.status==='by design'||String(e.status).startsWith('by design'))return `Status: ${e.status}. This behavior is intentional.`;
 if(e.released===true)return `Status: ${e.status}. The fix is recorded as released.`;
 return `Status: ${e.status}.`;
}

function format(e,signature=false){
 const support=window.FranklinSupportContext?.summary?.();
 const steps=(e.player_fix||[]).slice(0,7);
 const parts=[e.title,support,`Developer KB · ${e.id} · ${SNAPSHOT}`];
 if(signature)parts.push('The log text matches a recorded signature, so this is a strong match. I still use the build and surrounding log context to avoid a false diagnosis.');
 else if(e.kind!=='reference')parts.push('This matches the reported symptom. If you provide the relevant log lines I can verify the diagnosis more strongly.');
 parts.push(statusText(e));
 if(e.cause)parts.push(`Cause: ${e.cause}`);
 if(steps.length)parts.push('What to do:\n'+steps.map((s,i)=>`${i+1}. ${s}`).join('\n'));
 if(e.fixed_in)parts.push(`Build / fix scope: ${e.fixed_in}`);
 if(e.related?.length)parts.push(`Related cases: ${e.related.join(', ')}`);
 if(e.still_open)parts.push('If it still happens after these steps, send the whole Logs folder, device, OS version, exact build and what you were doing.');
 last=e.id;
 return{text:parts.filter(Boolean).join('\n\n'),topic:e.kind==='reference'?'developer-reference':'developer-troubleshooting',grounded:true,knowledgeId:e.id,discord:!!e.still_open,suggestions:e.still_open?['Where are the Logs?','Which build am I using?']:['What build am I using?','Anything else I should check?']};
}

function triage(){
 return {text:'Before I guess at a crash, use the developer triage order:\n\n1. Send the whole Logs folder. iPhone/iPad: Files > On My iPhone/iPad > GTA V > Logs. Mac: ~/Library/Logs/GTA5. Include run.log, run.prev.log and crash-*.txt.\n2. Include your device, OS version and what you were doing.\n3. I will identify the build from “GTA5 UUID” / “compat built”. The current public release is 30 Oct 2026.\n4. Check DATA: a complete copy has 113 archives, about 21.6 GB.\n5. “Unable to find critical archive” means incomplete data; “datapatch: no patches...” points to GTAV_patch not applied; “no movies/<name>.mp4” points to missing movies.\n6. Then I match the crash/hang signature against the developer KB.',topic:'developer-triage',grounded:true,knowledgeId:'REF-01',suggestions:['Where are the Logs?','Which build am I using?']};
}

function directReference(raw){
 const q=norm(raw),s=context();
 if(/(?:minimum|supported|support|run on|compatible).*(?:ios|iphone|ipad)|(?:iphone|ipad).*(?:supported|work|run)/.test(q)){
  return {text:'Device support from the developer KB:\n\n• Confirmed runtime OS: iOS 18+\n• iOS 16 is not supported in practice. The IPA still declares MinimumOSVersion 16.3, so it can install there, but its graphics compiler cannot run the game correctly.\n• iOS 17 has not been confirmed in the developer reports.\n• Normal baseline: A13 and newer.\n• A12 / A12X / A12Z: experimental path.\n• 4 GB devices: use Battery Saver, Normal textures and MSAA / Reflection MSAA Off.\n• A11 and older are not supported.\n• Mac: Apple silicon M1 or newer, macOS 14+.',topic:'device-support',grounded:true,knowledgeId:'DEV-03'};
 }
 if(/(?:whole logs|logs folder|where.*logs|find.*logs|lokasi.*log|di mana.*log|^logs?$)/.test(q)){
  const os=String(s.os||'');
  const path=/macos/i.test(os)?'~/Library/Logs/GTA5':/ipados/i.test(os)?'Files > On My iPad > GTA V > Logs':/ios/i.test(os)?'Files > On My iPhone > GTA V > Logs':'iPhone/iPad: Files > On My iPhone/iPad > GTA V > Logs\nMac: ~/Library/Logs/GTA5';
  return{text:`${path}\n\nSend run.log, run.prev.log and crash-*.txt. Include the device, OS version and what happened immediately before the problem.`,topic:'log-location',grounded:true,knowledgeId:'REF-01'};
 }
 return null;
}

async function answer(raw){
 const generation=window.FranklinSession?.generation;
 const q=String(raw||'').trim().slice(0,50000);if(!q)return null;
 const contextReply=await window.FranklinSupportContext?.consume?.(q);if(contextReply)return contextReply;
 const build=detectBuild(q);if(build)return buildAnswer(build);
 const direct=directReference(q);if(direct)return direct;
 const data=await load();if(generation!==window.FranklinSession?.generation||!data.length)return null;
 const n=norm(q);
 if(/^(still|same issue|same problem|it still crashes|masih|masih sama|masih crash)/.test(n)&&last){const e=data.find(x=>x.id===last);if(e)return{...format(e,false),text:`The previous match was ${e.id}: ${e.title}. Since it still happens, send the whole Logs folder plus device, OS version and exact build. I will re-check it from the log rather than assuming the previous cause is correct.`,discord:true};}
 const logInput=isLogLike(q);
 const ranked=rank(data,q),best=ranked[0],next=ranked[1];
 if(best?.signature&&next?.signature&&best.score-next.score<12)return{text:`This log excerpt matches more than one recorded case: ${best.e.id} ${best.e.title}; ${next.e.id} ${next.e.title}. Send the first fatal error plus 20-30 lines around it and the whole Logs folder so I do not choose the wrong cause.`,topic:'developer-triage',grounded:true,discord:true};
 if(best&&(best.signature||(best.score>=15&&best.hits>=2&&best.score-(next?.score||0)>=2.2)))return format(best.e,best.signature);
 if(genericFailure(n))return triage();
 return null;
}

document.addEventListener('franklin-disconnect',()=>{last=null});
window.FranklinDeveloperKB={load,answer,rank,detectBuild,status:()=>({loaded:!!entries,entries:entries?.length||0,lastId:last,snapshot:SNAPSHOT,currentRelease:CURRENT_RELEASE,currentMobileUuid:'31927966',currentMacUuid:'255B475E'})};
})();
