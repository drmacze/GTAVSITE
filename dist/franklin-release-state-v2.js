(()=>{
'use strict';
if(window.__franklinReleaseStateV4)return;
window.__franklinReleaseStateV4=true;
window.__gtavFranklinLatestKBV1=true;

const CATALOG=[
 {
  key:'release-20261029-ios',
  uuid:'',
  label:'29 Oct release',
  platform:'iOS / iPadOS',
  compat:'',
  line:'29 Oct 2026 previous iPhone/iPad release. GTA5 UUID and compat timestamp are not asserted unless present in a user log or verified release metadata.'
 },
 {
  key:'release-20261029-macos',
  uuid:'',
  label:'29 Oct release',
  platform:'macOS',
  compat:'',
  line:'29 Oct 2026 previous Mac release. GTA5 UUID and compat timestamp are not asserted unless present in a user log or verified release metadata.'
 },
 {
  key:'release-20261030-ios',
  uuid:'',
  label:'30 Oct release',
  platform:'iOS / iPadOS',
  compat:'',
  line:'30 Oct 2026 current public iPhone/iPad release. GTA5 UUID and compat timestamp are not asserted unless present in a user log or verified release metadata.'
 },
 {
  key:'release-20261030-macos',
  uuid:'',
  label:'30 Oct release',
  platform:'macOS',
  compat:'',
  line:'30 Oct 2026 current public Mac release. GTA5 UUID and compat timestamp are not asserted unless present in a user log or verified release metadata.'
 }
];
const CURRENT_MOBILE=CATALOG[2];
const CURRENT_MAC=CATALOG[3];
let catalogPatched=false;
let rerendered=false;

function buildKey(item){return item?.key||item?.uuid||'';}
function hasItem(list,item){return Array.isArray(list)&&list.some(entry=>buildKey(entry)===item.key);}
function addCatalog(list){
 if(!Array.isArray(list))return false;
 let changed=false;
 CATALOG.forEach(item=>{if(!hasItem(list,item)){list.push({...item});changed=true;}});
 if(changed)catalogPatched=true;
 return changed;
}
function hasCatalog(list){return CATALOG.every(item=>hasItem(list,item));}
function blockOldLatestWrapper(){
 const kb=window.FranklinDeveloperKB;
 if(!kb)return false;
 kb.__latestWrapped=true;
 return true;
}
function refreshSetup(){
 if(rerendered)return;
 const panel=document.querySelector('.ask-franklin-panel');
 if(!panel||panel.dataset.supportPhase==='chat')return;
 rerendered=true;
 document.dispatchEvent(new CustomEvent('franklin-disconnect'));
}
function patchContext(){
 const ctx=window.FranklinSupportContext;
 if(!ctx||ctx.__releaseStateV4||typeof ctx.load!=='function')return false;
 const originalLoad=ctx.load.bind(ctx);
 ctx.load=async()=>{
  const list=await originalLoad();
  const changed=addCatalog(list);
  if(changed)queueMicrotask(refreshSetup);
  return list;
 };
 ctx.__releaseStateV4=true;
 originalLoad().then(list=>{
  if(addCatalog(list))refreshSetup();
  else if(hasCatalog(list))catalogPatched=true;
 }).catch(()=>{});
 return true;
}

const nativeAppend=document.head?.append?.bind(document.head);
if(nativeAppend&&!document.head.__releaseStateV4AppendPatched){
 document.head.append=(...nodes)=>{
  for(const node of nodes){
   if(!(node instanceof HTMLScriptElement))continue;
   const src=node.src||'';
   if(/franklin-support-context\.js(?:\?|$)/.test(src))node.addEventListener('load',()=>setTimeout(patchContext,0),{once:true});
   if(/franklin-developer-kb\.js(?:\?|$)/.test(src))node.addEventListener('load',blockOldLatestWrapper,{once:true});
  }
  return nativeAppend(...nodes);
 };
 document.head.__releaseStateV4AppendPatched=true;
}

document.addEventListener('franklin-connected',()=>{blockOldLatestWrapper();patchContext();});
const timer=setInterval(()=>{
 blockOldLatestWrapper();
 if(patchContext()&&catalogPatched&&window.FranklinDeveloperKB)clearInterval(timer);
},50);
addEventListener('pagehide',()=>clearInterval(timer),{once:true});
blockOldLatestWrapper();
patchContext();

window.FranklinReleaseStateV2={
 current:{...CURRENT_MOBILE},
 currentMobile:{...CURRENT_MOBILE},
 currentMac:{...CURRENT_MAC},
 catalog:CATALOG.map(item=>({...item})),
 status:()=>({catalogPatched,currentKey:CURRENT_MOBILE.key,currentLabel:'30 Oct 2026',macKey:CURRENT_MAC.key,previousKeys:CATALOG.slice(0,2).map(item=>item.key),staleLatestBlocked:!!window.FranklinDeveloperKB?.__latestWrapped})
};
})();