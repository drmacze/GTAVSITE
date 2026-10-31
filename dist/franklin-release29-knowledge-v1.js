(()=>{
'use strict';
if(window.__franklinRelease29KnowledgeV3)return;
window.__franklinRelease29KnowledgeV3=true;
if(document.body?.dataset.page!=='home')return;

const RELEASE_KEY='release-20261029-ios';
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/(\d)([a-z])/g,'$1 $2').replace(/([a-z])(\d)/g,'$1 $2').replace(/[^a-z0-9+./-]+/g,' ').replace(/\s+/g,' ').trim();
const ctx=()=>{try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}};
const on29=()=>{const s=ctx();return s.releaseKey===RELEASE_KEY||/\b29\s+oct\b/i.test(s.build?.label||'');};
const date29=q=>/(?:\b29\s*oct(?:ober)?\b|\boct(?:ober)?\s*29\b|\b29[\/-]10\b)/.test(q);
const changes=q=>/(?:what(?:'s| is)? new|what changed|changes?|changelog|new features?|update notes?|release notes?|whats new|new on)/.test(q);
const latest=q=>/(?:latest|current|newest).{0,18}(?:build|release|version|app)|(?:build|release|version|app).{0,18}(?:latest|current|newest)/.test(q);
const projectSignal=q=>date29(q)||/\b(?:gta|ios|ipad|iphone|launcher|online|build|release|version|app|update)\b/.test(q);
function reply(text,topic='release-29-oct'){return{text,topic,grounded:true,source:{href:'updates.html#release-2026-10-29',label:'29 Oct release notes'},suggestions:['What is the current release?','What changed on 30 Oct?']};}
function fullRelease(){return reply(`The 29 Oct 2026 build is now a previous release. It introduced GTA Online character creation, free roam, races, deathmatches, survivals and contact missions; peer-to-peer sessions for up to 32 players; session-code joining; Nearby discovery on the same Wi-Fi; host-led jobs; individual trainer car upgrades; touch-button opacity; pinch-to-zoom on the pause map; add-on car audio fallback; and launcher startup changes.\n\nIts fixes covered DLC-clothing crashes, race respawn loops and truncated mod-import errors. The current public release is 30 Oct 2026.`);}
function previousRelease(){return reply(`29 Oct 2026 is a previous release, not the current one. The current public iPhone, iPad and Mac release in Franklin's project knowledge is 30 Oct 2026.`,'release-29-oct-previous');}
function fixesOnly(){return reply(`The 29 Oct fixes were a DLC-clothing crash, a race respawn loop after a vehicle was destroyed, and truncated mod-import error messages. These belong to the previous 29 Oct build; the current release is 30 Oct 2026.`,'release-29-oct-fixes');}
function sessions(){return reply(`On the 29 Oct build, GTA Online sessions were peer-to-peer and supported up to 32 players, session codes and Nearby discovery. This is previous-release behavior. The current project release is 30 Oct 2026, which adds more Online and host-control changes.`,'release-29-oct-online');}
function direct(raw){const q=norm(raw);if(!q)return null;const asks29=date29(q)||(on29()&&changes(q));if(asks29&&/(?:fix|fixed|crash|respawn|bug)/.test(q))return fixesOnly();if((asks29||on29())&&/(?:session|multiplayer|peer to peer|p2p|nearby|enter code|friends)/.test(q))return sessions();if(asks29&&changes(q))return fullRelease();if(date29(q)&&latest(q))return previousRelease();if(on29()&&latest(q))return previousRelease();return null;}
function install(){const ext=window.FranklinExtended;if(!ext||ext.__release29KnowledgeV3)return false;const originalAnswer=ext.answer?.bind(ext);const originalDecision=ext.domainDecision?.bind(ext);ext.answer=async raw=>direct(raw)||(originalAnswer?await originalAnswer(raw):null);if(originalDecision)ext.domainDecision=raw=>{const q=norm(raw);if(projectSignal(q)&&date29(q))return{allowed:true,reason:'release-29-context'};return originalDecision(raw);};ext.__release29KnowledgeV3=true;return true;}
document.addEventListener('franklin-connected',()=>setTimeout(install,0));let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>900)clearInterval(timer)},50);addEventListener('pagehide',()=>clearInterval(timer),{once:true});window.FranklinRelease29Knowledge={answer:direct,status:()=>({release:'29 Oct 2026',key:RELEASE_KEY,status:'previous'})};
})();