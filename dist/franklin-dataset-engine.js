(()=>{'use strict';let data=null,promise=null,last=null;
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/gta\s*5/g,'gta v').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set('a an the is are was were i my me you your it to of for in on with and or please tell explain what who where when how do does can could would about saya aku kamu apa siapa dimana bagaimana kenapa tolong yang dan di ke untuk itu ini gta v ios'.split(' '));
const terms=v=>[...new Set(norm(v).split(' ').filter(t=>t.length>1&&!stop.has(t)))];
function outside(q){const n=norm(q);if(/[\r\n]/.test(q)&&/gta5|GTA5|Game hung|critical archive|sample count/.test(q))return false;
 const project=/gta v|grand theft auto|launcher|project|proyek|donat|support developer|sideload|dxmt/.test(n);
 if(/\b(recipe|resep|cook|masak|football|soccer|politic|presiden|president|homework|matematika|calculus|relationship|pacar|dating|medical|medicine|diagnose|horoscope|zodiak|translate|terjemahkan)\b/.test(n))return true;
 if(/\b(python|javascript|sql|html|code a|write code|buat kode)\b/.test(n)&&!/settings|configuration|config|json|launcher/.test(n))return true;
 if(/\b(bitcoin|btc|ethereum|crypto|stock price|harga saham)\b/.test(n)&&!(/donat|support developer|support project|wallet address/.test(n)&&project)&&!/gta v.*stock|stock.*gta v/.test(n))return true;
 if(/\b(weather|cuaca|temperature|suhu)\b/.test(n)&&!/gta v|game|ingame|in game|thermal|phone|iphone|perangkat|hp|panas/.test(n))return true;
 if(/(?:iphone|ipad|macbook).*\b(price|harga|buy|beli)\b/.test(n)&&!project)return true;
 if(/ignore.*instructions|ignore.*rules|pretend.*unrestricted|abaikan.*aturan/.test(n))return true;
 return false;}
function refusal(){return{text:'I can only help with GTA V and the GTA V iOS Project, so I cannot answer that unrelated question. You can ask about gameplay, installation, the launcher, compatibility or troubleshooting.',topic:'off-topic',grounded:true};}
function load(){return promise||(promise=fetch('franklin-dataset.json?v=20261029online').then(r=>{if(!r.ok)throw Error('dataset');return r.json()}).then(d=>data=d.entries.map(e=>({...e,_patterns:e.patterns.map(norm),_terms:e.patterns.map(terms)}))).catch(()=>{promise=null;return data=[]}));}
function rank(q){const n=norm(q),qt=terms(q);return(data||[]).map(e=>{let score=0,exact=false;for(let i=0;i<e._patterns.length;i++){const p=e._patterns[i];if(n===p){score=100;exact=true;break;}const pt=e._terms[i],overlap=qt.filter(t=>pt.includes(t)).length;if(!overlap)continue;const coverage=overlap/Math.max(1,qt.length),patternCoverage=overlap/Math.max(1,pt.length);let value=coverage*.65+patternCoverage*.35;if(coverage<.7)value*=.5;if(qt.length===1&&!p.split(' ').includes(qt[0]))value=0;score=Math.max(score,value*10);}return{e,score,exact}}).sort((a,b)=>b.score-a.score);}
async function answer(q){if(outside(q))return refusal();await load();if(!data?.length)return null;let ranked=rank(q),best=ranked[0],next=ranked[1];if(!best)return null;
 if(last&&/^(and |what about |how about |bagaimana |lalu |terus )/.test(norm(q))){const contextual=rank(last+' '+q);if(contextual[0]?.score>best.score){ranked=contextual;best=ranked[0];next=ranked[1];}}
 if(!best.exact&&(best.score<8.4||next&&best.score-next.score<1.15))return null;
 last=best.e.patterns[0];return{text:best.e.answer,topic:best.e.topic||'knowledge',grounded:true,knowledgeId:best.e.id,suggestions:['What information do you need?','Where can I find the logs?']};}
function clarify(){return{text:'I do not have a reliable answer for that specific GTA V question yet. Which mission, launcher setting or error do you mean? For a technical problem, include the selected app build and the exact symptom or attach a log. I will not guess missing details.',topic:'clarification',grounded:true};}

const releaseSource={href:'updates.html#release-2026-10-29',label:'29 Oct Update'};
const releaseResult=(text,topic='updates',suggestions=[])=>({text,topic,grounded:true,knowledgeId:'release-2026-10-29',source:releaseSource,suggestions});
function release29Answer(raw){
 const q=norm(raw);
 if(!q)return null;
 const projectOnline=/gta online|online mode|multiplayer|session|enter code|nearby|peer to peer|p2p/.test(q);
 const projectContext=/ios|iphone|ipad|mac|launcher|port|project|trainer|29 oct|latest|update/.test(q);

 if((/latest update|newest update|current update|29 oct|update 29/.test(q))&&/gta|launcher|ios|iphone|ipad|mac|project/.test(q))return releaseResult('The latest release in the project notes is the 29 Oct 2026 build. It adds GTA Online to the launcher, including custom Online characters, free roam, GTA Online jobs, peer-to-peer sessions for up to 32 players, session codes, Nearby discovery on the same Wi-Fi, new trainer and touch-control features, plus several fixes. Open the 29 Oct Update for the current iOS and Mac downloads.','updates',['Does GTA Online work now?','How do session codes work?']);

 if(projectOnline&&(projectContext||/does gta online work|can i play online|online support/.test(q))){
  if(/character|creator|heritage|hair|clothes|clothing/.test(q))return releaseResult('Yes. In the 29 Oct build, GTA Online has its own character creator. It opens the first time and includes heritage, facial features, hair, clothing by shop name, and supported DLC-pack clothing.','project-online',['How do sessions work?','Where are GTA Online jobs?']);
  if(/race|deathmatch|survival|contact mission|jobs?/.test(q))return releaseResult('GTA Online jobs are available in Trainer › GTA Online › Jobs. The 29 Oct notes list races, deathmatches, survivals, and contact missions. If the host starts a job while everyone is in the same session, the session goes with the host.','project-online',['How do I host a session?','How many players can join?']);
  if(/enter code|session code|share code|join code|code/.test(q))return releaseResult('To play with friends anywhere, the host creates a session from Trainer › GTA Online and shares the session code. Friends open Join and tap ENTER CODE, then enter the host code.','project-online',['What is Nearby?','Why can’t my friend connect?']);
  if(/nearby|same wifi|same wi fi|local network/.test(q))return releaseResult('Nearby is for players on the same Wi-Fi. Available local sessions can appear under Nearby. On iPhone or iPad, allow Local Network access when iOS asks, otherwise Nearby discovery may not work.','project-online',['How do session codes work?','Why can’t my friend connect?']);
  if(/server|servers|32|player|players|session/.test(q))return releaseResult('The 29 Oct build supports sessions with friends for up to 32 players. The release notes say sessions run on the players’ own devices, with no project-hosted game servers. The host controls the session, and a host-started job takes the session with them.','project-online',['How do session codes work?','Why can’t my friend connect?']);
  if(/connect|connection|mobile network|upnp|router|cannot reach|cant reach|can t reach/.test(q))return releaseResult('If a friend cannot connect, the 29 Oct notes say some mobile networks block direct connections. Try Wi-Fi, or enable UPnP on the host router. On iPhone or iPad, also allow Local Network access when asked.','project-online',['What is Nearby?','How do session codes work?']);
  if(/free roam|story|trainer/.test(q))return releaseResult('GTA Online in the 29 Oct build includes free roam without the Story Mode campaign. The trainer remains available, and GTA Online jobs are under Trainer › GTA Online › Jobs.','project-online',['Where are GTA Online jobs?','How do sessions work?']);
  return releaseResult('Yes. The 29 Oct 2026 build adds GTA Online to the launcher. It includes a custom Online character, free roam, GTA Online jobs, and peer-to-peer sessions with friends for up to 32 players. Friends can join with a session code, while players on the same Wi-Fi can also use Nearby.','project-online',['How do session codes work?','Where are GTA Online jobs?']);
 }

 if(/car upgrade|vehicle upgrade|upgrade.*trainer|trainer.*upgrade/.test(q))return releaseResult('The 29 Oct build expands the Trainer so car upgrades can be changed one by one.','trainer');
 if(/touch.*opacity|opacity.*touch|button opacity|hud.*controls/.test(q))return releaseResult('Touch-button opacity is adjustable in Launcher › HUD & Controls in the 29 Oct build.','controls');
 if(/pinch.*zoom|zoom.*pause map|pause map/.test(q))return releaseResult('The 29 Oct build adds pinch-to-zoom on the pause map.','controls');
 if(/add on car|addon car|car sound|vehicle sound|custom sound/.test(q))return releaseResult('In the 29 Oct build, add-on cars that do not have working custom audio use a stock-car sound from the matching vehicle class.','audio');
 if(/launcher.*every start|launcher.*startup|opens.*launcher|launcher opens/.test(q))return releaseResult('From the 29 Oct build, the launcher opens at every start.','launcher');

 if(/crash.*cloth|cloth.*crash|change.*clothes|changing.*clothes|dlc.*clothes/.test(q))return releaseResult('The 29 Oct build fixes the crash that could happen when changing clothes with DLC packs installed. Update to the 29 Oct build first, then retest before treating it as an unresolved crash.','troubleshooting',['How do I update safely?','Where can I find the logs?']);
 if(/respawn loop|blow.*race|blown.*race|destroy.*race|race.*respawn/.test(q))return releaseResult('The 29 Oct build fixes the respawn loop that could occur after a vehicle was blown up during a race. Update to the 29 Oct build and retest.','troubleshooting');
 if(/mod import.*error|import.*error message|error message.*full|message.*read/.test(q))return releaseResult('The 29 Oct build changes mod-import errors so the full error message can be read.','mods');

 if(/anonymous|analytics|counts plays|play count|device model|chip|system version|privacy/.test(q)&&/app|project|launcher|gta/.test(q))return releaseResult('The 29 Oct release notes say the app counts plays anonymously using device model, chip, and system version. The notes explicitly say this play count does not use names or accounts.','privacy');
 if(/save|saves|mods|install over|update over/.test(q)&&/29 oct|latest build|new build|update/.test(q))return releaseResult('For the 29 Oct update, install the new build over the current one. The release notes say your existing saves and mods stay as they are. iPhone and iPad use the newly signed GTAV-unsigned.ipa; Mac uses GTAV-mac.zip.','updates',['Where do I get the latest build?','Does GTA Online work now?']);
 if(/download|where.*ipa|where.*mac|latest.*ipa|latest.*mac/.test(q)&&/gta|project|launcher/.test(q))return releaseResult('Use the 29 Oct Update on the website for the current iPhone/iPad and Mac download buttons. I will not paste hidden developer download URLs into chat.','updates');
 return null;
}

function patchDeveloperKnowledge(){const api=window.FranklinDeveloperKB;if(!api||api.__release29Wrapped)return false;const old=api.answer.bind(api);api.answer=async q=>release29Answer(q)||old(q);api.__release29Wrapped=true;return true;}
if(!patchDeveloperKnowledge()){let tries=0;const timer=setInterval(()=>{if(patchDeveloperKnowledge()||++tries>40)clearInterval(timer)},50);}

document.addEventListener('franklin-disconnect',()=>{last=null;});window.FranklinDataset={load,answer,outside,refusal,clarify,rank,release29Answer};
})();
