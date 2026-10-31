(()=>{
'use strict';
if(window.__franklinRelease30KnowledgeV1)return;
window.__franklinRelease30KnowledgeV1=true;
if(document.body?.dataset.page!=='home')return;

const RELEASE_KEYS=new Set(['release-20261030-ios','release-20261030-macos']);
const DISCORD='https://discord.gg/HgcbPjcyJ';
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/(\d)([a-z])/g,'$1 $2').replace(/([a-z])(\d)/g,'$1 $2').replace(/[^a-z0-9+./-]+/g,' ').replace(/\s+/g,' ').trim();
const ctx=()=>{try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}};
const on30=()=>{const s=ctx();return RELEASE_KEYS.has(s.releaseKey)||/\b30\s+oct\b/i.test(s.build?.label||'');};
const date30=q=>/(?:\b30\s*oct(?:ober)?\b|\boct(?:ober)?\s*30\b|\b30[\/-]10\b)/.test(q);
const changes=q=>/(?:what(?:'s| is)? new|what changed|changes?|changelog|new features?|update notes?|release notes?|whats new|new on)/.test(q);
const latest=q=>/(?:latest|current|newest).{0,18}(?:build|release|version|app)|(?:build|release|version|app).{0,18}(?:latest|current|newest)/.test(q);
const projectSignal=q=>date30(q)||latest(q)||/\b(?:gta|ios|ipad|iphone|mac|launcher|online|trainer|mods?|build|release|version|app|update|weapon|clothes|interior|benny|wheel)\b/.test(q);

function reply(text,topic='release-30-oct',suggestions=['What changed in GTA Online?','What changed for mods?']){
 return {text,topic,grounded:true,source:{href:'updates.html#release-2026-10-30',label:'30 Oct release notes'},suggestions};
}
function fullRelease(){
 return reply(`The 30 Oct 2026 build is the current public release for iPhone, iPad and Mac.\n\nGTA Online:\n• Apartment towers and 34 additional interiors can now be entered. Supported locations include homes, police stations, the hospital, banks, clubs and the FIB. Entrances use yellow door markers and map blips.\n• Your weapons are saved and restored the next time you play.\n• In a session, only the host can start jobs and use God mode.\n• Joining reports now have a clear path: Trainer › GTA Online › Copy the joining log. Include that log when reporting a connection problem.\n\nTrainer:\n• Weapons and attachments stay when you change skin.\n• New controls: Attachments and tint, and All weapons with attachments.\n• The Clothes page lets you change outfits piece by piece.\n• GTA Online DLC cars appear in their proper vehicle classes in the spawner.\n\nMods:\n• Up to 256 add-on packs are supported, so add-on cars no longer disappear just because all DLC packs are enabled.\n• Clothing mods are supported for Michael, Franklin and Trevor.\n• QuantV, VisualV, NaturalVision Remastered and MaxedV no longer hit the startup crash covered by this release.\n• Tapping a mod in the MODS tab shows its full description.\n• New content includes Community Mod Pack 2, Community Mod Pack 3 and a Hungarian translation.\n\nFix:\n• Fixed the crash involving Benny's wheels and GTA Online wheels.\n\nPerformance note:\n• Use one graphics overhaul at a time. QuantV and the sharper car-texture package are intended for 6 GB devices. On 4 GB devices, disable heavy mods in MODS if memory runs short. GTA Online cars in traffic require the corresponding DLC packs.\n\nUpdating:\n• Install the new build over the current installation. Saves and mods stay in place. Get the iPhone/iPad or Mac app package through Discord; Franklin does not expose direct app-package download links.`,'release-30-oct',['How do interiors work?','What changed for mods?','How do I update?']);
}
function online(){
 return reply(`On 30 Oct, GTA Online adds enterable apartment towers plus 34 more interiors such as homes, police stations, the hospital, banks, clubs and the FIB. Yellow markers appear at supported doors and map blips identify the locations.\n\nWeapons now persist between sessions. In multiplayer sessions, only the host can start jobs and use God mode. For join problems, use Trainer › GTA Online › Copy the joining log and include that log in the report.`,'release-30-oct-online',['What changed for Trainer?','How do I report a join problem?']);
}
function trainer(){
 return reply(`Trainer changes in the 30 Oct build:\n• Weapons and their attachments stay equipped when you change skin.\n• New weapon options include Attachments and tint and All weapons with attachments.\n• The Clothes page lets you build outfits piece by piece.\n• GTA Online DLC cars now appear in their matching classes in the vehicle spawner.`,'release-30-oct-trainer',['What changed for mods?','What changed in GTA Online?']);
}
function mods(){
 return reply(`The 30 Oct release expands the mod system substantially:\n• Up to 256 add-on packs.\n• Clothing mods for Michael, Franklin and Trevor.\n• QuantV, VisualV, NaturalVision Remastered and MaxedV are covered by a startup-crash compatibility fix.\n• Tap a mod in the MODS tab to see its full description.\n• Community Mod Pack 2 adds W.E.R.O. ragdolls, Forests of San Andreas and GTA 5 World Improvement.\n• Community Mod Pack 3 adds QuantV iOS, sharper car textures, fuller roadside bushes, bigger subtitles and GTA Online cars in traffic.\n• Hungarian translation is new.\n\nUse one graphics overhaul at a time. QuantV and the sharper car textures are intended for 6 GB devices. On 4 GB devices, switch heavy mods off if the game runs short of memory. GTA Online cars in traffic require the matching DLC packs.`,'release-30-oct-mods',['Can I use QuantV on 4 GB?','What is in Mod Pack 2?','What is in Mod Pack 3?']);
}
function memory(){
 return reply(`For the 30 Oct mod set, 6 GB devices are the intended target for QuantV and the sharper car-texture package. A 4 GB device can run the game, but heavy graphics mods leave much less memory headroom. Use one graphics overhaul at a time and disable heavy mods in MODS if the game runs short of memory.`,'release-30-oct-memory',['Which graphics mods are heavy?','What changed for mods?']);
}
function fixes(){
 return reply(`The explicit 30 Oct fix is the crash involving Benny's wheels and GTA Online wheels. The same release also improves mod compatibility at startup for QuantV, VisualV, NaturalVision Remastered and MaxedV.`,'release-30-oct-fixes',['What changed for mods?','What changed in GTA Online?']);
}
function update(){
 return reply(`Install the 30 Oct build over your current installation. The release notes say your saves and mods stay as they are.\n\nFor iPhone/iPad, get GTAV-unsigned.ipa from the project Discord and sign it as before. For Mac, get GTAV-mac.zip from Discord. Franklin and the website intentionally route app downloads through Discord instead of exposing direct package links.`,'release-30-oct-update',['Where do I get the build?','Will my mods stay?']);
}
function direct(raw){
 const q=norm(raw);if(!q)return null;
 const scoped=date30(q)||on30();
 if((date30(q)&&changes(q))||(on30()&&changes(q)))return fullRelease();
 if((scoped||latest(q))&&/(?:interior|building|apartment|police station|hospital|bank|club|fib|yellow marker|map blip|host|god mode|joining log|join log|weapons saved|weapon persist)/.test(q))return online();
 if(scoped&&/(?:trainer|attachments?|tint|change skin|clothes|outfit|spawner|dlc cars)/.test(q))return trainer();
 if(scoped&&/(?:mods?|256|quantv|visualv|naturalvision|maxedv|mod pack 2|mod pack 3|hungarian|clothing mod|car textures|bushes|subtitles|traffic)/.test(q))return mods();
 if(scoped&&/(?:4 gb|6 gb|memory|graphics overhaul|heavy mod)/.test(q))return memory();
 if(scoped&&/(?:fix|fixed|crash|benny|wheel)/.test(q))return fixes();
 if(scoped&&/(?:update|install|download|ipa|mac zip|save|mods stay)/.test(q))return update();
 if(date30(q)&&latest(q))return fullRelease();
 return null;
}

function install(){
 const ext=window.FranklinExtended;
 if(!ext||ext.__release30KnowledgeV1)return false;
 const originalAnswer=ext.answer?.bind(ext);
 const originalDecision=ext.domainDecision?.bind(ext);
 ext.answer=async raw=>direct(raw)||(originalAnswer?await originalAnswer(raw):null);
 if(originalDecision)ext.domainDecision=raw=>{
  const q=norm(raw);
  if(projectSignal(q)&&(date30(q)||(on30()&&(changes(q)||latest(q)||/(?:online|trainer|mods?|interior|weapon|clothes|benny|wheel)/.test(q)))))return{allowed:true,reason:'release-30-context'};
  return originalDecision(raw);
 };
 ext.__release30KnowledgeV1=true;
 return true;
}

document.addEventListener('franklin-connected',()=>setTimeout(install,0));
let tries=0;
const timer=setInterval(()=>{tries++;if(install()||tries>900)clearInterval(timer)},50);
addEventListener('pagehide',()=>clearInterval(timer),{once:true});
window.FranklinRelease30Knowledge={answer:direct,status:()=>({release:'30 Oct 2026',keys:[...RELEASE_KEYS],downloads:'discord-only',uuid:'unasserted',discord:DISCORD})};
})();