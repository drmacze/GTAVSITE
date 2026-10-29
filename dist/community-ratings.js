(()=>{
'use strict';
if(window.__gtavLegacyRatingCleanupV1)return;
window.__gtavLegacyRatingCleanupV1=true;

function cleanup(){
 document.querySelectorAll('.rating-summary,[data-rating-summary]').forEach(node=>node.remove());
 document.querySelectorAll('.site-header .header-actions > a[href="get-started.html"]').forEach(node=>node.remove());
}

function boot(){
 cleanup();
 if(!document.querySelector('link[href*="saved-mods-compact-v2.css"]')){
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/saved-mods-compact-v2.css?v=20261030b';
  document.head.append(css);
 }
 if(!document.querySelector('script[src*="content-actions-v1.js"]')){
  const actions=document.createElement('script');
  actions.src='/content-actions-v1.js?v=20261030savedmods';
  actions.defer=true;
  document.head.append(actions);
 }
 const observer=new MutationObserver(cleanup);
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
