(()=>{
'use strict';
if(window.__gtaBrandLogoPatchV4)return;
window.__gtaBrandLogoPatchV4=true;
if(document.body?.dataset.page!=='home')return;

const HEADER_LOGO='https://cdn.phototourl.com/member/2026-10-30-4a5422ca-95e0-47e2-ab64-a891f266d209.png';
const ONLINE_LOGO='https://cdn.phototourl.com/member/2026-10-30-a765632e-959f-46e8-999f-4cd96dfa7d8c.jpg';

function applyHeaderLogo(){
 const img=document.querySelector('.site-brand img');
 if(!img)return false;
 if(img.dataset.brandLogoV4==='true')return true;
 img.dataset.brandLogoV4='true';
 img.classList.add('site-brand-kommodo-logo');
 img.alt='GTA V';
 img.decoding='async';
 img.src=HEADER_LOGO;
 return true;
}

function applyOnlineLogo(){
 const dock=document.querySelector('.gta-online-menu-dock');
 if(!dock)return false;
 let logo=dock.querySelector('.gta-online-dock-brand-logo');
 if(logo){
  const existing=logo.querySelector('img');
  if(existing&&existing.src!==ONLINE_LOGO)existing.src=ONLINE_LOGO;
  return true;
 }
 logo=document.createElement('div');
 logo.className='gta-online-dock-brand-logo';
 logo.setAttribute('aria-hidden','true');
 const img=document.createElement('img');
 img.src=ONLINE_LOGO;
 img.alt='';
 img.decoding='async';
 img.addEventListener('load',()=>{
  logo.classList.add('is-loaded');
  dock.classList.add('gta-online-has-brand-logo');
 },{once:true});
 img.addEventListener('error',()=>{
  logo.classList.remove('is-loaded');
  dock.classList.remove('gta-online-has-brand-logo');
 },{once:true});
 logo.append(img);
 const copy=dock.querySelector('.gta-online-dock-copy');
 if(copy)copy.before(logo);else dock.prepend(logo);
 return true;
}

function apply(){
 applyHeaderLogo();
 applyOnlineLogo();
}

apply();
const observer=new MutationObserver(apply);
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('pageshow',apply,{passive:true});
window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
