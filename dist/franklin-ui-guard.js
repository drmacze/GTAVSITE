(()=>{
'use strict';
if(window.__franklinUiGuardLegacyShim)return;
window.__franklinUiGuardLegacyShim=true;
if(document.body?.dataset.page!=='home')return;
if(!document.querySelector('link[data-franklin-shell-v2]')){const l=document.createElement('link');l.rel='stylesheet';l.href='franklin-shell-v2.css?v=20261030shell2';l.dataset.franklinShellV2='true';document.head.append(l)}
if(!document.getElementById('franklin-shell-v2-loader')){const s=document.createElement('script');s.id='franklin-shell-v2-loader';s.src='franklin-shell-v2.js?v=20261030shell2';s.defer=true;document.head.append(s)}
})();
