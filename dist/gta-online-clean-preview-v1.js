(()=>{
'use strict';
if(window.__gtaOnlineCleanPreviewV1)return;
window.__gtaOnlineCleanPreviewV1=true;
if(document.body?.dataset.page!=='home')return;

function patch(){
 const iframe=document.querySelector('.gta-online-menu-media iframe');
 if(!iframe)return false;
 iframe.setAttribute('scrolling','no');
 iframe.setAttribute('frameborder','0');
 iframe.style.overflow='hidden';
 iframe.style.overscrollBehavior='none';
 return true;
}

patch();
const observer=new MutationObserver(()=>patch());
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('pageshow',patch,{passive:true});
window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
