(()=>{
 'use strict';
 if(window.__franklinLauncherFixLoaded)return;window.__franklinLauncherFixLoaded=true;
 const localAvatar='/assets/avatars/franklin.jpg';
 const style=document.createElement('style');
 style.textContent=`
 .ask-franklin-avatar img{object-position:center 22%!important}
 .ask-franklin-message .mini-avatar{background-image:url('${localAvatar}')!important;background-position:center 22%!important;background-size:cover!important;color:transparent!important}
 @media(max-width:760px){
  .ask-franklin-launcher,.ask-franklin-launcher.is-dock-open{width:62px!important;height:62px!important;right:max(14px,env(safe-area-inset-right))!important;bottom:max(18px,calc(env(safe-area-inset-bottom) + 12px))!important;filter:drop-shadow(0 13px 25px rgba(0,0,0,.48))!important;overflow:visible!important}
  .ask-franklin-launcher::before,.ask-franklin-launcher::after,.ask-franklin-launcher-copy{display:none!important}
  .ask-franklin-launcher .ask-franklin-avatar{left:2px!important;top:50%!important;width:58px!important;height:58px!important;border-width:1px!important;transform:translateY(-50%)!important;box-shadow:0 0 0 3px var(--af-surface),0 0 0 4px var(--af-accent-soft),0 10px 24px var(--af-shadow)!important}
  .ask-franklin-launcher:active .ask-franklin-avatar{transform:translateY(-50%) scale(.94)!important}
  .ask-franklin-launcher:hover{transform:none!important}
 }
 `;
 document.head.append(style);
 const tune=()=>{
  document.querySelectorAll('.ask-franklin-avatar img').forEach(img=>{if(img.getAttribute('src')!==localAvatar)img.src=localAvatar});
  const launcher=document.querySelector('.ask-franklin-launcher');
  if(launcher)launcher.setAttribute('aria-label','Open Franklin helper');
 };
 tune();
 const observer=new MutationObserver(tune);observer.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',event=>{
  if(!matchMedia('(max-width:760px)').matches||!(event.target instanceof Element))return;
  const launcher=event.target.closest('.ask-franklin-launcher');if(!launcher||launcher.dataset.state!=='compact')return;
  setTimeout(()=>{
   if(launcher.dataset.state!=='expanded')return;
   const identity=window.gtavIdentity?.get?.();
   if(identity)launcher.click();
  },0);
 },true);
})();
