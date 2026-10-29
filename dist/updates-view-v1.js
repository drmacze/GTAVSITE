(()=>{
'use strict';
if(window.__gtavUpdatesViewV1)return;
window.__gtavUpdatesViewV1=true;

const KEY='gtav-updates-view-v1';
const root=document.documentElement;
const valid=value=>value==='grid'||value==='list';
let mode='list';
try{const saved=localStorage.getItem(KEY);if(valid(saved))mode=saved;}catch{}
root.dataset.updatesView=mode;

function closeInitialDetails(scope=document){
  scope.querySelectorAll('details.managed-update-details, details.release-card').forEach(details=>{
    if(details.dataset.defaultStateReady==='1')return;
    details.open=false;
    details.dataset.defaultStateReady='1';
  });
}

function setMode(next){
  if(!valid(next))return;
  mode=next;
  root.dataset.updatesView=mode;
  try{localStorage.setItem(KEY,mode);}catch{}
  document.querySelectorAll('.updates-view-toggle button').forEach(button=>{
    const active=button.dataset.view===mode;
    button.setAttribute('aria-pressed',String(active));
    button.setAttribute('aria-label',`${active?'Current view: ':'Switch to '}${button.dataset.view} view`);
  });
}

function icon(kind){
  return kind==='grid'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.2"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.2"/><rect x="14" y="14" width="6.5" height="6.5" rx="1.2"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="2.8"/></svg>';
}

function mountToggle(){
  if(document.querySelector('.updates-view-toggle'))return true;
  const heading=document.querySelector('.managed-updates-heading');
  if(!heading)return false;
  const controls=document.createElement('div');
  controls.className='updates-view-toggle';
  controls.setAttribute('role','group');
  controls.setAttribute('aria-label','Release layout');
  ['grid','list'].forEach(view=>{
    const button=document.createElement('button');
    button.type='button';
    button.dataset.view=view;
    button.innerHTML=icon(view);
    button.addEventListener('click',()=>setMode(view));
    controls.append(button);
  });
  heading.append(controls);
  setMode(mode);
  return true;
}

closeInitialDetails();
mountToggle();

const observer=new MutationObserver(records=>{
  for(const record of records){
    for(const node of record.addedNodes){
      if(!(node instanceof Element))continue;
      if(node.matches?.('details.managed-update-details, details.release-card'))closeInitialDetails(node.parentElement||document);
      else if(node.querySelector?.('details.managed-update-details, details.release-card'))closeInitialDetails(node);
    }
  }
  mountToggle();
});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
