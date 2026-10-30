(()=>{
'use strict';
if(window.__franklinRelease29V1)return;
window.__franklinRelease29V1=true;
const KEY='release-20261029-ios';
const LABEL='29 Oct 2026';
let selected=false;
let patched=false;

function patchContext(){
 const ctx=window.FranklinSupportContext;
 if(!ctx||patched)return;
 patched=true;
 const originalGet=ctx.get?.bind(ctx);
 const originalSummary=ctx.summary?.bind(ctx);
 if(originalGet)ctx.get=()=>{
  const base=originalGet();
  if(!selected)return base;
  return {...base,releaseKey:KEY,uuid:'',build:{key:KEY,uuid:'',label:'29 Oct release',platform:'iOS / iPadOS',compat:'',line:'29 Oct release selected by the user.'}};
 };
 if(originalSummary)ctx.summary=()=>{
  if(!selected)return originalSummary();
  const base=originalGet?.()||{};
  return [base.os||'OS not specified',LABEL].join(' · ');
 };
}

function syncSessionLabel(){
 if(!selected)return;
 const label=document.querySelector('.helper-session-label');
 if(!label)return;
 const os=window.FranklinSupportContext?.get?.().os||'OS not specified';
 label.textContent=os+' · '+LABEL;
}

function decorate(){
 patchContext();
 const list=document.querySelector('.helper-build-list');
 if(!list)return;
 const platform=document.querySelector('.helper-setup-platform')?.textContent||'';
 if(/macOS/i.test(platform)){
  selected=false;
  list.querySelector('[data-release-29]')?.remove();
  return;
 }
 if(list.querySelector('[data-release-29]'))return;
 const button=document.createElement('button');
 button.type='button';
 button.className='helper-setup-choice';
 button.dataset.release29='true';
 button.setAttribute('aria-pressed',String(selected));
 button.innerHTML='<span>29 Oct 2026</span><span class="helper-choice-check" aria-hidden="true">✓</span>';
 button.addEventListener('click',()=>{
  const unknown=[...list.querySelectorAll('.helper-setup-choice')].find(item=>/not sure|another version/i.test(item.textContent||''));
  if(unknown){unknown.click();unknown.setAttribute('aria-pressed','false');}
  selected=true;
  list.querySelectorAll('.helper-setup-choice').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  const next=document.querySelector('.helper-setup-next');
  if(next)next.disabled=false;
  document.querySelector('.ask-franklin-panel')?.setAttribute('data-release29','true');
 });
 list.prepend(button);

 list.querySelectorAll('.helper-setup-choice:not([data-release-29])').forEach(item=>{
  item.addEventListener('click',()=>{
   if(item===button)return;
   selected=false;
   document.querySelector('.ask-franklin-panel')?.removeAttribute('data-release29');
  },{capture:true});
 });
}

document.addEventListener('click',event=>{
 const target=event.target instanceof Element?event.target:null;
 if(!target)return;
 if(target.closest('.helper-setup-next')&&selected)setTimeout(syncSessionLabel,0);
 if(target.closest('.helper-setup-unsure,.helper-setup-actions button:not(.helper-setup-next)')){
  if(!target.closest('[data-release-29]'))selected=false;
 }
});
document.addEventListener('franklin-disconnect',()=>{selected=false;document.querySelector('.ask-franklin-panel')?.removeAttribute('data-release29');});

const observer=new MutationObserver(()=>{decorate();if(selected)syncSessionLabel();});
observer.observe(document.body,{childList:true,subtree:true});
decorate();
addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();