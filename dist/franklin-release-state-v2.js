(()=>{
'use strict';
if(window.__franklinReleaseStateV2)return;
window.__franklinReleaseStateV2=true;

const CURRENT={
 key:'release-20261029-ios',
 uuid:'',
 label:'29 Oct release',
 platform:'iOS / iPadOS',
 compat:'',
 line:'29 Oct 2026 public iPhone/iPad release. GTA5 UUID and compat timestamp are not asserted unless present in a user log or verified release metadata.'
};
let catalogPatched=false;
let rerendered=false;

function hasCurrent(list){return Array.isArray(list)&&list.some(item=>item?.key===CURRENT.key||/\b29\s+Oct\b/i.test(item?.label||''));}
function addCurrent(list){
 if(!Array.isArray(list)||hasCurrent(list))return false;
 list.push({...CURRENT});
 catalogPatched=true;
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
 if(!ctx||ctx.__releaseStateV2||typeof ctx.load!=='function')return false;
 const originalLoad=ctx.load.bind(ctx);
 ctx.load=async()=>{
  const list=await originalLoad();
  const changed=addCurrent(list);
  if(changed)queueMicrotask(refreshSetup);
  return list;
 };
 ctx.__releaseStateV2=true;
 originalLoad().then(list=>{
  if(addCurrent(list))refreshSetup();
  else if(hasCurrent(list))catalogPatched=true;
 }).catch(()=>{});
 return true;
}

const nativeAppend=document.head?.append?.bind(document.head);
if(nativeAppend&&!document.head.__releaseStateV2AppendPatched){
 document.head.append=(...nodes)=>{
  for(const node of nodes){
   if(node instanceof HTMLScriptElement&&/franklin-support-context\.js(?:\?|$)/.test(node.src||'')){
    node.addEventListener('load',()=>setTimeout(patchContext,0),{once:true});
   }
  }
  return nativeAppend(...nodes);
 };
 document.head.__releaseStateV2AppendPatched=true;
}

document.addEventListener('franklin-connected',patchContext);
const timer=setInterval(()=>{if(patchContext()&&catalogPatched)clearInterval(timer)},100);
addEventListener('pagehide',()=>clearInterval(timer),{once:true});
patchContext();

window.FranklinReleaseStateV2={
 current:{...CURRENT},
 status:()=>({catalogPatched,currentKey:CURRENT.key,currentLabel:'29 Oct 2026'})
};
})();
