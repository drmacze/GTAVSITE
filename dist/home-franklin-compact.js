(()=>{
 'use strict';
 if(document.body?.dataset?.page!=='home'||window.__homeFranklinCompactLoaded)return;
 window.__homeFranklinCompactLoaded=true;
 const style=document.createElement('style');
 style.textContent=`
 body[data-page="home"] .ask-franklin-launcher,
 body[data-page="home"] .ask-franklin-launcher.is-dock-open{
   width:62px!important;height:62px!important;overflow:visible!important;
 }
 body[data-page="home"] .ask-franklin-launcher::before,
 body[data-page="home"] .ask-franklin-launcher::after,
 body[data-page="home"] .ask-franklin-launcher-copy{display:none!important}
 body[data-page="home"] .ask-franklin-launcher .ask-franklin-avatar{
   left:2px!important;width:58px!important;height:58px!important;
 }
 @media(max-width:760px){
   body[data-page="home"] .ask-franklin-launcher,
   body[data-page="home"] .ask-franklin-launcher.is-dock-open{width:58px!important;height:58px!important}
   body[data-page="home"] .ask-franklin-launcher .ask-franklin-avatar{left:1px!important;width:54px!important;height:54px!important}
 }
 `;
 document.head.append(style);
 const prepare=launcher=>{
   if(!launcher)return;
   launcher.classList.remove('is-dock-open');
   if(launcher.dataset.state==='expanded')launcher.dataset.state='compact';
   launcher.setAttribute('aria-label','Open Ask Franklin chat');
 };
 const sync=()=>prepare(document.querySelector('.ask-franklin-launcher'));
 sync();
 const observer=new MutationObserver(sync);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-state']});
 document.addEventListener('click',event=>{
   if(!(event.target instanceof Element))return;
   const launcher=event.target.closest('.ask-franklin-launcher');
   if(!launcher||launcher.dataset.state!=='compact')return;
   const identity=window.gtavIdentity?.get?.();
   if(!identity)return;
   launcher.dataset.state='expanded';
 },true);
})();
