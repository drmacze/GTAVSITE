(()=>{
'use strict';
if(window.__franklinReleaseStateV3)return;
window.__franklinReleaseStateV3=true;
/* Block obsolete cached latest wrappers before Franklin starts. */
window.__gtavFranklinLatestKBV1=true;

const CURRENT=[
 {
  key:'release-20261030-ios',
  uuid:'',
  label:'30 Oct release',
  platform:'iOS / iPadOS',
  compat:'',
  line:'30 Oct 2026 public iPhone/iPad release. GTA5 UUID and compat timestamp are not asserted unless present in a user log or verified release metadata.'
 },
 {
  key:'release-20261030-macos',
  uuid:'',
  label:'30 Oct release',
  platform:'macOS',
  compat:'',
  line:'30 Oct 2026 public Mac release. GTA5 UUID and compat timestamp are not asserted unless present in a user log or verified release metadata.'
 }
];
let catalogPatched=false;
let rerendered=false;

function buildKey(item){return item?.key||item?.uuid||'';}
function hasItem(list,item){return Array.isArray(list)&&list.some(entry=>buildKey(entry)===item.key);}
function addCurrent(list){
 if(!Array.isArray(list))return false;
 let changed=false;
 CURRENT.forEach(item=>{if(!hasItem(list,item)){list.push({...item});changed=true;}});
 if(changed)catalogPatched=true;
 return changed;
}
function hasCurrent(list){return CURRENT.every(item=>hasItem(list,item));}
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
 if(!ctx||ctx.__releaseStateV3||typeof ctx.load!=='function')return false;
 const originalLoad=ctx.load.bind(ctx);
 ctx.load=async()=>{
  const list=await originalLoad();
  const changed=addCurrent(list);
  if(changed)queueMicrotask(refreshSetup);
  return list;
 };
 ctx.__releaseStateV3=true;
 originalLoad().then(list=>{
  if(addCurrent(list))refreshSetup();
  else if(hasCurrent(list))catalogPatched=true;
 }).catch(()=>{});
 return true;
}

const nativeAppend=document.head?.append?.bind(document.head);
if(nativeAppend&&!document.head.__releaseStateV3AppendPatched){
 document.head.append=(...nodes)=>{
  for(const node of nodes){
   if(!(node instanceof HTMLScriptElement))continue;
   const src=node.src||'';
   if(/franklin-support-context\.js(?:\?|$)/.test(src))node.addEventListener('load',()=>setTimeout(patchContext,0),{once:true});
   if(/franklin-developer-kb\.js(?:\?|$)/.test(src))node.addEventListener('load',blockOldLatestWrapper,{once:true});
  }
  return nativeAppend(...nodes);
 };
 document.head.__releaseStateV3AppendPatched=true;
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
 current:{...CURRENT[0]},
 currentMobile:{...CURRENT[0]},
 currentMac:{...CURRENT[1]},
 status:()=>({catalogPatched,currentKey:CURRENT[0].key,currentLabel:'30 Oct 2026',macKey:CURRENT[1].key,staleLatestBlocked:!!window.FranklinDeveloperKB?.__latestWrapped})
};
})();