(()=>{
 'use strict';
 if(window.__franklinPrimaryStateFix)return;
 window.__franklinPrimaryStateFix=true;
 const PRIMARY='.lazy-franklin[data-franklin-primary="true"]';
 const FALLBACK='.lazy-franklin[data-unified-fallback="true"]';
 let timer=0;
 const primary=()=>document.querySelector(PRIMARY);
 const fallback=()=>document.querySelector(FALLBACK);
 function keepPrimary(node){
  const p=node&&node.matches?.(PRIMARY)?node:node?.querySelector?.(PRIMARY)||primary();
  if(!p)return false;
  document.querySelectorAll(FALLBACK).forEach(el=>{if(el!==p)el.remove()});
  document.querySelectorAll('.lazy-franklin').forEach(el=>{if(el!==p&&el.dataset.franklinPrimary!=='true')el.remove()});
  if(!p.isConnected)document.body.append(p);
  return true;
 }
 document.addEventListener('click',event=>{
  const btn=event.target instanceof Element?event.target.closest('.lazy-franklin'):null;
  if(!btn||btn.dataset.unifiedFallback!=='true')return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  const p=primary();
  if(p){p.click();return}
  if(btn.dataset.state==='compact'){
   btn.dataset.state='expanded';
   btn.setAttribute('aria-label','Loading Franklin…');
  }
 },true);
 const observer=new MutationObserver(records=>{
  let addedPrimary=null;
  for(const record of records){for(const node of record.addedNodes){if(!(node instanceof Element))continue;if(node.matches(PRIMARY)){addedPrimary=node;break}const nested=node.querySelector?.(PRIMARY);if(nested){addedPrimary=nested;break}}if(addedPrimary)break}
  if(addedPrimary){document.querySelectorAll(FALLBACK).forEach(el=>el.remove());if(!addedPrimary.isConnected)document.body.append(addedPrimary);keepPrimary(addedPrimary);return}
  clearTimeout(timer);timer=setTimeout(()=>keepPrimary(),0);
 });
 observer.observe(document.body,{childList:true,subtree:true});
 keepPrimary();
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
