(()=>{
'use strict';
if(window.__gtaOnlineHomeLoaderV19)return;
window.__gtaOnlineHomeLoaderV19=true;
if(document.body?.dataset.page!=='home')return;
const addStyle=(href,key)=>{if(document.querySelector(`link[data-${key}]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'true');document.head.append(l)};
const addScript=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;document.head.append(s)};
addStyle('gta-online-menu-promo-v1.css?v=20261031onlinepromo6','gta-online-menu-promo');
addStyle('gta-online-outline-stable-v1.css?v=20261030outlinefix1','gta-online-outline-stable');
addStyle('gta-brand-logo-patch-v1.css?v=20261031brand8','gta-brand-logo-patch');
addStyle('gta-online-clean-preview-v1.css?v=20261031preview2','gta-online-clean-preview-v1');
addStyle('home-performance-v1.css?v=20261031perf1','home-performance-v1');
addScript('home-performance-v1.js?v=20261031perf1','home-performance-v1-loader');
addScript('story-cover-integrity-v1.js?v=20261031storycover4','story-cover-integrity-v4-loader');
addScript('gta-online-menu-promo-v1.js?v=20261031onlinepromo6','gta-online-menu-promo-v7');
addScript('gta-brand-logo-patch-v1.js?v=20261031brand5','gta-brand-logo-patch-v5-loader');
addScript('gta-online-clean-preview-v1.js?v=20261031preview2','gta-online-clean-preview-v2-loader');
})();
