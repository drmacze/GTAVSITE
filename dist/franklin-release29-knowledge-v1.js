(()=>{
'use strict';
if(window.__franklinRelease29KnowledgeV2)return;
window.__franklinRelease29KnowledgeV2=true;
if(document.body?.dataset.page!=='home')return;

const RELEASE_KEY='release-20261029-ios';
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/(\d)([a-z])/g,'$1 $2').replace(/([a-z])(\d)/g,'$1 $2').replace(/[^a-z0-9+./-]+/g,' ').replace(/\s+/g,' ').trim();
const ctx=()=>{try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}};
const on29=()=>{
 const s=ctx();
 return s.releaseKey===RELEASE_KEY||/\b29\s+oct\b/i.test(s.build?.label||'');
};
const date29=q=>/(?:\b29\s*oct(?:ober)?\b|\boct(?:ober)?\s*29\b|\b29[\/-]10\b)/.test(q);
const changes=q=>/(?:what(?:'s| is)? new|what changed|changes?|changelog|new features?|update notes?|release notes?|whats new|new on)/.test(q);
const latest=q=>/(?:latest|current|newest).{0,18}(?:build|release|version|app)|(?:build|release|version|app).{0,18}(?:latest|current|newest)/.test(q);
const projectSignal=q=>date29(q)||latest(q)||/\b(?:gta|ios|ipad|iphone|launcher|online|build|release|version|app|update)\b/.test(q);

function reply(text,topic='release-29-oct'){
 return {
  text,
  topic,
  grounded:true,
  source:{href:'updates.html#release-2026-10-29',label:'29 Oct release notes'},
  suggestions:['How do GTA Online sessions work?','What was fixed on 29 Oct?']
 };
}

function fullRelease(){
 return reply(`The 29 Oct 2026 build is the current public iPhone/iPad release in your Franklin session.\n\nWhat is new:\n• GTA Online character creator with heritage, facial features, hair and clothing support.\n• Free roam without the story.\n• GTA Online races, deathmatches, survivals and contact missions under Trainer › GTA Online › Jobs.\n• Peer-to-peer sessions for up to 32 players. The host shares a session code and friends join with ENTER CODE.\n• Nearby session discovery on the same Wi-Fi.\n• Host-led jobs move everyone in the session into the job together.\n• Trainer car upgrades can be changed individually.\n• Touch-button opacity can be adjusted in HUD & Controls.\n• The pause map supports pinch-to-zoom.\n• Add-on cars without working custom audio use a matching stock-car sound.\n• The launcher now opens on every startup.\n\nFixes:\n• Fixed a crash when changing clothes with DLC packs installed.\n• Fixed a respawn loop after a vehicle is destroyed during a race.\n• Mod-import error messages can now be read in full.\n\nYour existing saves and mods stay when you install the 29 Oct build over the current installation.`);
}
function currentRelease(){
 return reply(`Your selected app build is 29 Oct 2026, which is the current public iPhone/iPad release in Franklin's project knowledge. I will use that build automatically for troubleshooting and release-specific questions.`,'release-29-oct-current');
}
function fixesOnly(){
 return reply(`The verified 29 Oct fixes are:\n• A crash when changing clothes with DLC packs installed.\n• A respawn loop after a vehicle is destroyed during a race.\n• Mod-import error messages can now be read in full.\n\nThe same release also adds GTA Online sessions, jobs, character creation, Nearby discovery, trainer upgrade controls, touch-opacity settings and pinch-to-zoom on the pause map.`,'release-29-oct-fixes');
}
function sessions(){
 return reply(`On the 29 Oct build, GTA Online sessions are peer-to-peer and support up to 32 players. The host creates a session and shares its code. Friends use ENTER CODE to join. On the same Wi-Fi, sessions can also appear under Nearby. When the host starts a supported job, everyone in that session follows into the job.\n\nSome mobile networks can block direct peer-to-peer connections. If a friend cannot connect, try Wi-Fi or enable UPnP on the host router. Allow Local Network access on iOS for Nearby discovery.`,'release-29-oct-online');
}
function direct(raw){
 const q=norm(raw);if(!q)return null;
 const asks29=date29(q)||(on29()&&changes(q));
 if(asks29&&/(?:fix|fixed|crash|respawn|bug)/.test(q))return fixesOnly();
 if((asks29||on29())&&/(?:session|multiplayer|peer to peer|p2p|nearby|enter code|friends)/.test(q))return sessions();
 if(asks29&&(changes(q)||/\bapp\b/.test(q)))return fullRelease();
 if(date29(q)&&latest(q))return currentRelease();
 if(on29()&&changes(q))return fullRelease();
 if(on29()&&latest(q))return currentRelease();
 return null;
}

function install(){
 const ext=window.FranklinExtended;
 if(!ext||ext.__release29KnowledgeV2)return false;
 const originalAnswer=ext.answer?.bind(ext);
 const originalDecision=ext.domainDecision?.bind(ext);
 ext.answer=async raw=>direct(raw)||(originalAnswer?await originalAnswer(raw):null);
 if(originalDecision)ext.domainDecision=raw=>{
  const q=norm(raw);
  if(projectSignal(q)&&(date29(q)||(changes(q)||latest(q))&&on29()))return{allowed:true,reason:'release-29-context'};
  return originalDecision(raw);
 };
 ext.__release29KnowledgeV2=true;
 return true;
}

document.addEventListener('franklin-connected',()=>setTimeout(install,0));
let tries=0;
const timer=setInterval(()=>{tries++;if(install()||tries>900)clearInterval(timer)},50);
addEventListener('pagehide',()=>clearInterval(timer),{once:true});
window.FranklinRelease29Knowledge={answer:direct,status:()=>({release:'29 Oct 2026',key:RELEASE_KEY})};
})();
