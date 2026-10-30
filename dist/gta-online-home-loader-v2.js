(()=>{
'use strict';
if(window.__gtaOnlineHomeLoaderV6)return;
window.__gtaOnlineHomeLoaderV6=true;
if(document.body?.dataset.page!=='home')return;
if(!document.querySelector('link[data-gta-online-menu-promo]')){
 const css=document.createElement('link');
 css.rel='stylesheet';
 css.href='gta-online-menu-promo-v1.css?v=20261030onlinepromo5';
 css.dataset.gtaOnlineMenuPromo='true';
 document.head.append(css);
}
if(!document.querySelector('link[data-gta-online-outline-stable]')){
 const outline=document.createElement('link');
 outline.rel='stylesheet';
 outline.href='gta-online-outline-stable-v1.css?v=20261030outlinefix1';
 outline.dataset.gtaOnlineOutlineStable='true';
 document.head.append(outline);
}
if(!document.getElementById('gta-online-menu-promo-v6')){
 const script=document.createElement('script');
 script.id='gta-online-menu-promo-v6';
 script.src='gta-online-menu-promo-v1.js?v=20261030onlinepromo5';
 document.head.append(script);
}
})();
