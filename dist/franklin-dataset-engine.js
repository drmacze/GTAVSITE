(()=>{'use strict';
let data=null,promise=null,last=null;
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/gta\s*5/g,'gta v').replace(/[^a-z0-9+]+/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set('a an the is are was were i my me you your it to of for in on with and or please tell explain what who where when how do does can could would about saya aku kamu apa siapa dimana bagaimana kenapa tolong yang dan di ke untuk itu ini gta v ios'.split(' '));
const terms=v=>[...new Set(norm(v).split(' ').filter(t=>t.length>1&&!stop.has(t)))];

function outside(q){
 const n=norm(q);
 if(/[\r\n]/.test(q)&&/gta5|game hung|critical archive|sample count/i.test(q))return false;
 const project=/gta v|grand theft auto|launcher|project|proyek|sideload|dxmt|story mode|gta online/.test(n);
 if(/\b(recipe|resep|cook|masak|football|soccer|politic|presiden|president|homework|matematika|calculus|relationship|pacar|dating|medical|medicine|diagnose|horoscope|zodiak)\b/.test(n))return true;
 if(/\b(python|javascript|sql|html|write code|buat kode)\b/.test(n)&&!/settings|configuration|config|json|launcher/.test(n))return true;
 if(/\b(bitcoin|btc|ethereum|crypto|stock price|harga saham)\b/.test(n)&&!(/gta|lester|stock market/.test(n)))return true;
 if(/\b(weather|cuaca|temperature|suhu)\b/.test(n)&&!/gta|game|thermal|phone|iphone|perangkat|panas/.test(n))return true;
 if(/(?:iphone|ipad|macbook).*\b(price|harga|buy|beli)\b/.test(n)&&!project)return true;
 if(/ignore.*instructions|ignore.*rules|pretend.*unrestricted|abaikan.*aturan/.test(n))return true;
 return false;
}
function refusal(){return{text:'I can only help with GTA V, GTA Online, and the GTA V iOS Project, so I cannot answer that unrelated question.',topic:'off-topic',grounded:true};}
function load(){return promise||(promise=fetch('franklin-dataset.json?v=20261030legacy351').then(r=>{if(!r.ok)throw Error('dataset');return r.json()}).then(d=>data=d.entries.map(e=>({...e,_patterns:e.patterns.map(norm),_terms:e.patterns.map(terms)}))).catch(()=>{promise=null;return data=[]}));}
function rank(q){
 const n=norm(q),qt=terms(q);
 return(data||[]).map(e=>{
  let score=0,exact=false;
  for(let i=0;i<e._patterns.length;i++){
   const p=e._patterns[i];
   if(n===p){score=100;exact=true;break}
   const pt=e._terms[i],overlap=qt.filter(t=>pt.includes(t)).length;
   if(!overlap)continue;
   const coverage=overlap/Math.max(1,qt.length),patternCoverage=overlap/Math.max(1,pt.length);
   let value=coverage*.65+patternCoverage*.35;if(coverage<.7)value*=.5;
   if(qt.length===1&&!p.split(' ').includes(qt[0]))value=0;
   score=Math.max(score,value*10);
  }
  return{e,score,exact};
 }).sort((a,b)=>b.score-a.score);
}
async function answer(q){
 if(outside(q))return refusal();
 await load();if(!data?.length)return null;
 let ranked=rank(q),best=ranked[0],next=ranked[1];if(!best)return null;
 if(last&&/^(and |what about |how about |bagaimana |gimana |lalu |terus |kalau )/.test(norm(q))){
  const contextual=rank(last+' '+q);
  if(contextual[0]?.score>best.score){ranked=contextual;best=ranked[0];next=ranked[1]}
 }
 if(!best.exact&&(best.score<8.4||next&&best.score-next.score<1.15))return null;
 last=best.e.patterns[0];
 return{text:best.e.answer,topic:best.e.topic||'knowledge',grounded:true,knowledgeId:best.e.id,suggestions:['What else do you want to know?','Ask me about GTA V gameplay.']};
}
function clarify(){return{text:'I do not have a reliable answer for that specific GTA V question yet. Tell me the mission, character, vehicle, location, feature, or exact symptom and I will narrow it down without guessing.',topic:'clarification',grounded:true};}

const releaseSource={href:'updates.html#release-2026-10-29',label:'29 Oct Update'};
const releaseResult=(text,topic='updates',suggestions=[])=>({text,topic,grounded:true,knowledgeId:'release-2026-10-29',source:releaseSource,suggestions});
function release29Answer(raw){
 const q=norm(raw);if(!q)return null;
 const projectOnline=/gta online|online mode|multiplayer|session|enter code|nearby|peer to peer|p2p/.test(q);
 const projectContext=/ios|iphone|ipad|mac|launcher|port|project|trainer|29 oct|latest|update/.test(q);
 if((/latest update|newest update|current update|29 oct|update 29/.test(q))&&/gta|launcher|ios|iphone|ipad|mac|project/.test(q))
  return releaseResult('The latest project release is the 29 Oct 2026 build. It adds GTA Online to the launcher, including an Online character creator, free roam, GTA Online jobs, peer-to-peer sessions for up to 32 players, session codes, Nearby discovery, control improvements, and fixes.','updates',['Does GTA Online work on iOS?','How do session codes work?']);
 if(projectOnline&&(projectContext||/does gta online work|can i play online|online support/.test(q))){
  if(/character|creator|heritage|hair|clothes|clothing/.test(q))return releaseResult('The 29 Oct build includes an Online character creator with heritage, facial features, hair, clothing by shop name, and supported DLC-pack clothing.','project-online');
  if(/race|deathmatch|survival|contact mission|jobs?/.test(q))return releaseResult('In the 29 Oct iOS project build, GTA Online jobs are under Trainer › GTA Online › Jobs. The release notes list races, deathmatches, survivals, and contact missions.','project-online');
  if(/enter code|session code|share code|join code|code/.test(q))return releaseResult('The host creates a session from Trainer › GTA Online and shares the session code. Friends open Join, tap ENTER CODE, and enter that code.','project-online');
  if(/nearby|same wifi|same wi fi|local network/.test(q))return releaseResult('Nearby is for players on the same Wi-Fi. On iPhone or iPad, allow Local Network access when iOS asks or Nearby discovery may not work.','project-online');
  if(/connect|connection|mobile network|upnp|router|cannot reach|cant reach|can t reach/.test(q))return releaseResult('Some mobile networks can block direct connections. Try Wi-Fi, enable UPnP on the host router if appropriate, and allow Local Network access on iOS.','project-online');
  if(/server|servers|32|player|players|session/.test(q))return releaseResult('The 29 Oct build supports friend sessions for up to 32 players. The project notes say sessions run on players’ own devices with no project-hosted game server.','project-online');
  if(/free roam|story|trainer/.test(q))return releaseResult('The 29 Oct build includes GTA Online-style free roam without the Story Mode campaign, with the trainer still available.','project-online');
  return releaseResult('Yes. The 29 Oct 2026 project build adds GTA Online functionality with a custom Online character, free roam, jobs, and peer-to-peer friend sessions for up to 32 players.','project-online');
 }
 if(/car upgrade|vehicle upgrade|upgrade.*trainer|trainer.*upgrade/.test(q))return releaseResult('The 29 Oct build lets the Trainer change car upgrades one by one.','trainer');
 if(/touch.*opacity|opacity.*touch|button opacity|hud.*controls/.test(q))return releaseResult('Touch-button opacity is adjustable in Launcher › HUD & Controls.','controls');
 if(/pinch.*zoom|zoom.*pause map|pause map/.test(q))return releaseResult('The 29 Oct build adds pinch-to-zoom on the pause map.','controls');
 if(/crash.*cloth|change.*clothes|dlc.*clothes/.test(q))return releaseResult('The 29 Oct build fixes the crash that could happen when changing clothes with DLC packs installed.','troubleshooting');
 if(/respawn loop|race.*respawn/.test(q))return releaseResult('The 29 Oct build fixes the respawn loop that could happen after a vehicle was destroyed during a race.','troubleshooting');
 if(/mod import.*error|import.*error message/.test(q))return releaseResult('The 29 Oct build makes mod-import error messages readable in full.','mods');
 if(/anonymous|analytics|play count|privacy/.test(q)&&/app|project|launcher|gta/.test(q))return releaseResult('The project notes say play counts are anonymous and use device model, chip, and system version, not names or accounts.','privacy');
 if(/download|where.*ipa|where.*mac|latest.*ipa|latest.*mac/.test(q)&&/gta|project|launcher/.test(q))return releaseResult('Use the 29 Oct Update page for the current iPhone/iPad and Mac download buttons.','updates');
 return null;
}

let onlineLoader=null,legacyLoader=null;
function loadScriptOnce(attr,src,globalName){
 if(window[globalName])return Promise.resolve(window[globalName]);
 return new Promise(resolve=>{
  const existing=document.querySelector(`script[${attr}]`);
  if(existing){existing.addEventListener('load',()=>resolve(window[globalName]||null),{once:true});existing.addEventListener('error',()=>resolve(null),{once:true});return}
  const s=document.createElement('script');s.src=src;s.async=true;s.setAttribute(attr,'true');
  s.onload=()=>resolve(window[globalName]||null);s.onerror=()=>resolve(null);document.head.append(s);
 });
}
function ensureOnlineKB(){return onlineLoader||(onlineLoader=loadScriptOnce('data-franklin-online-kb','franklin-online-kb.js?v=20261030online150','FranklinOnlineKB'))}
function ensureLegacyKB(){return legacyLoader||(legacyLoader=loadScriptOnce('data-franklin-legacy-kb','franklin-legacy-kb.js?v=20261030legacy351','FranklinLegacyKB'))}

const explicitOnline=q=>/\b(gta online|online mode|multiplayer|bunker|nightclub|kosatka|agency|acid lab|salvage yard|bail office|garment factory|career builder|gta\+|cayo perico|diamond casino|ls car meet|terrorbyte|oppressor|securoserv|motorcycle club|mc business)\b/.test(norm(q));
async function broadKnowledge(q){
 const [legacy,online]=await Promise.all([ensureLegacyKB(),ensureOnlineKB()]);
 if(explicitOnline(q)){
  const oa=await online?.answer?.(q);if(oa)return oa;
  return await legacy?.answer?.(q)||null;
 }
 const la=await legacy?.answer?.(q);if(la)return la;
 return await online?.answer?.(q)||null;
}

function patchDeveloperKnowledge(){
 const api=window.FranklinDeveloperKB;
 if(!api||api.__broadKnowledgeWrapped)return false;
 const old=api.answer.bind(api);
 api.answer=async q=>{
  const release=release29Answer(q);if(release)return release;
  const broad=await broadKnowledge(q);if(broad)return broad;
  return old(q);
 };
 api.__broadKnowledgeWrapped=true;
 return true;
}
ensureLegacyKB();ensureOnlineKB();
if(!patchDeveloperKnowledge()){let tries=0;const timer=setInterval(()=>{if(patchDeveloperKnowledge()||++tries>80)clearInterval(timer)},50)}
document.addEventListener('franklin-disconnect',()=>{last=null});
window.FranklinDataset={load,answer,outside,refusal,clarify,rank,release29Answer,ensureOnlineKB,ensureLegacyKB,broadKnowledge};
})();