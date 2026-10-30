(()=>{
'use strict';
if(window.__gtaOnlineHomeLoaderV2)return;
window.__gtaOnlineHomeLoaderV2=true;
if(document.body?.dataset.page!=='home')return;
const css=document.createElement('link');
css.rel='stylesheet';
css.href='gta-online-menu-promo-v1.css?v=20261030onlinepromo2';
css.dataset.gtaOnlineMenuPromo='true';
document.head.append(css);
const script=document.createElement('script');
script.src='gta-online-menu-promo-v1.js?v=20261030onlinepromo2';
script.defer=true;
document.head.append(script);
})();
