(()=>{
'use strict';
if(window.__gtaBrandLogoPatchV1)return;
window.__gtaBrandLogoPatchV1=true;
if(document.body?.dataset.page!=='home')return;

const HEADER_LOGO='https://kommodo.ai/i/jFvjP5sfDrtQ020DR4Pi';
const ONLINE_LOGO='https://kommodo.ai/i/YOtH3dfNwGBwvgtWyYAu';

function applyHeaderLogo(){
 const img=document.querySelector('.site-brand img');
 if(!img)return false;
 if(img.dataset.kommodoBrandLogo==='true')return true;
 img.dataset.kommodoBrandLogo='true';
 img.classList.add('site-brand-kommodo-logo');
 img.src=HEADER_LOGO;
 img.alt='GTA V';
 img.decoding='async';
 img.referrerPolicy='no-referrer';
 return true;
}

function applyOnlineLogo(){
 const dock=document.querySelector('.gta-online-menu-dock');
 if(!dock)return false;
 if(dock.querySelector('.gta-online-dock-brand-logo'))return true;
 const logo=document.createElement('div');
 logo.className='gta-online-dock-brand-logo';
 logo.setAttribute('aria-hidden','true');
 const img=document.createElement('img');
 img.src=ONLINE_LOGO;
 img.alt='';
 img.decoding='async';
 img.referrerPolicy='no-referrer';
 img.addEventListener('load',()=>dock.classList.add('gta-online-has-brand-logo'),{once:true});
 img.addEventListener('error',()=>{logo.remove();dock.classList.remove('gta-online-has-brand-logo')},{once:true});
 logo.append(img);
 const copy=dock.querySelector('.gta-online-dock-copy');
 if(copy)copy.before(logo);else dock.prepend(logo);
 dock.classList.add('gta-online-has-brand-logo');
 return true;
}

function apply(){
 applyHeaderLogo();
 applyOnlineLogo();
}

apply();
const observer=new MutationObserver(()=>apply());
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('pageshow',apply,{passive:true});
window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
