(()=>{
'use strict';
if(window.__gtaOnlineHomeLoaderV5)return;
window.__gtaOnlineHomeLoaderV5=true;
if(document.body?.dataset.page!=='home')return;
if(!document.querySelector('link[data-gta-online-menu-promo]')){
 const css=document.createElement('link');
 css.rel='stylesheet';
 css.href='gta-online-menu-promo-v1.css?v=20261030onlinepromo5';
 css.dataset.gtaOnlineMenuPromo='true';
 document.head.append(css);
}
if(!document.getElementById('gta-online-menu-promo-v5')){
 const script=document.createElement('script');
 script.id='gta-online-menu-promo-v5';
 script.src='gta-online-menu-promo-v1.js?v=20261030onlinepromo5';
 document.head.append(script);
}
})();
