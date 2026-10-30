(()=>{
'use strict';
if(window.__gtaOnlineHomeLoaderV3)return;
window.__gtaOnlineHomeLoaderV3=true;
if(document.body?.dataset.page!=='home')return;
if(!document.querySelector('link[data-gta-online-menu-promo]')){
 const css=document.createElement('link');
 css.rel='stylesheet';
 css.href='gta-online-menu-promo-v1.css?v=20261030onlinepromo3';
 css.dataset.gtaOnlineMenuPromo='true';
 document.head.append(css);
}
if(!document.getElementById('gta-online-menu-promo-v3')){
 const script=document.createElement('script');
 script.id='gta-online-menu-promo-v3';
 script.src='gta-online-menu-promo-v1.js?v=20261030onlinepromo3';
 document.head.append(script);
}
})();
