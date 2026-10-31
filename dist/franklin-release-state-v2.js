(()=>{
'use strict';
if(window.__franklinReleaseStateV5)return;
window.__franklinReleaseStateV5=true;
window.__gtavFranklinLatestKBV1=true;

const CATALOG=[
 {
  key:'release-20261029-ios',uuid:'367053AC',label:'29 Oct release',platform:'iOS / iPadOS',compat:'Oct 29 2026 20:09:28',
  line:'29 Oct 2026 previous iPhone/iPad release. GTA5 367053AC, compat built Oct 29 2026 20:09:28.'
 },
 {
  key:'release-20261029-macos',uuid:'5C9B8E26',label:'29 Oct release',platform:'macOS',compat:'',
  line:'29 Oct 2026 previous Mac release. GTA5 5C9B8E26.'
 },
 {
  key:'release-20261030-ios',uuid:'31927966',label:'30 Oct release',platform:'iOS / iPadOS',compat:'Oct 31 2026 00:23:16',
  line:'30 Oct 2026 current public iPhone/iPad release, batches 104-106. GTA5 31927966, compat built Oct 31 2026 00:23:16; it was built just after midnight but the launcher calls it the 30 Oct build.'
 },
 {
  key:'release-20261030-macos',uuid:'255B475E',label:'30 Oct release',platform:'macOS',compat:'Oct 29 2026',
  line:'30 Oct 2026 current public Mac release. GTA5 255B475E; its compat line still reports Oct 29.'
 }
];
const CURRENT_MOBILE=CATALOG[2];
const CURRENT_MAC=CATALOG[3];
let catalogPatched=false,rerendered=false;
const keyOf=item=>item?.key||item?.uuid||'';
const hasItem=(list,item)=>Array.isArray(list)&&list.some(entry=>keyOf(entry)===item.key);
function addCatalog(list){if(!Array.isArray(list))return false;let changed=false;for(const item of CATALOG){const existing=list.find(entry=>keyOf(entry)===item.key);if(existing){Object.assign(existing,item);changed=true}else{list.push({...item});changed=true}}if(changed)catalogPatched=true;return changed}
function blockOldLatestWrapper(){const kb=window.FranklinDeveloperKB;if(!kb)return false;kb.__latestWrapped=true;return true}
function refreshSetup(){if(rerendered)return;const panel=document.querySelector('.ask-franklin-panel');if(!panel||panel.dataset.supportPhase==='chat')return;rerendered=true;document.dispatchEvent(new CustomEvent('franklin-disconnect'))}
function patchContext(){const ctx=window.FranklinSupportContext;if(!ctx||ctx.__releaseStateV5||typeof ctx.load!=='function')return false;const originalLoad=ctx.load.bind(ctx);ctx.load=async()=>{const list=await originalLoad();const changed=addCatalog(list);if(changed)queueMicrotask(refreshSetup);return list};ctx.__releaseStateV5=true;originalLoad().then(list=>{if(addCatalog(list))refreshSetup()}).catch(()=>{});return true}
const nativeAppend=document.head?.append?.bind(document.head);
if(nativeAppend&&!document.head.__releaseStateV5AppendPatched){document.head.append=(...nodes)=>{for(const node of nodes){if(!(node instanceof HTMLScriptElement))continue;const src=node.src||'';if(/franklin-support-context\.js(?:\?|$)/.test(src))node.addEventListener('load',()=>setTimeout(patchContext,0),{once:true});if(/franklin-developer-kb\.js(?:\?|$)/.test(src))node.addEventListener('load',blockOldLatestWrapper,{once:true})}return nativeAppend(...nodes)};document.head.__releaseStateV5AppendPatched=true}
document.addEventListener('franklin-connected',()=>{blockOldLatestWrapper();patchContext()});
const timer=setInterval(()=>{blockOldLatestWrapper();if(patchContext()&&catalogPatched&&window.FranklinDeveloperKB)clearInterval(timer)},50);
addEventListener('pagehide',()=>clearInterval(timer),{once:true});
blockOldLatestWrapper();patchContext();
function resolveNativeBuild(input={}){
 const ctx={...(window.FranklinSupportContext?.get?.()||{}),...(input||{})};
 const platform=String(ctx.platform||ctx.os||ctx.build?.platform||'');
 const mac=/macos|\bmac\b/i.test(platform);
 const key=ctx.releaseKey||ctx.build?.key||'';
 if(/20261029/.test(key))return {...(mac?CATALOG[1]:CATALOG[0])};
 if(/20261030/.test(key))return {...(mac?CURRENT_MAC:CURRENT_MOBILE)};
 return {...(mac?CURRENT_MAC:CURRENT_MOBILE)};
}
window.FranklinReleaseStateV2={current:{...CURRENT_MOBILE},currentMobile:{...CURRENT_MOBILE},currentMac:{...CURRENT_MAC},catalog:CATALOG.map(x=>({...x})),resolveNativeBuild,status:()=>({catalogPatched,currentKey:CURRENT_MOBILE.key,currentLabel:'30 Oct 2026',mobileUuid:CURRENT_MOBILE.uuid,macUuid:CURRENT_MAC.uuid,previousKeys:CATALOG.slice(0,2).map(x=>x.key),staleLatestBlocked:!!window.FranklinDeveloperKB?.__latestWrapped})};
})();