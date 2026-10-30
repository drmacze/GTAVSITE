(()=>{
'use strict';
if(window.__franklinUiGuardLegacyShim)return;
window.__franklinUiGuardLegacyShim=true;
if(document.body?.dataset.page!=='home')return;
const addStyle=(href,key)=>{if(document.querySelector(`link[data-${key}]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'true');document.head.append(l)};
addStyle('franklin-shell-v2.css?v=20261030shell3','franklin-shell-v2');
addStyle('franklin-shell-v2-stability.css?v=20261030shell3','franklin-shell-v2-stability');
if(!document.getElementById('franklin-shell-v2-loader')){const s=document.createElement('script');s.id='franklin-shell-v2-loader';s.src='franklin-shell-v2.js?v=20261030shell3';s.defer=true;document.head.append(s)}
})();
