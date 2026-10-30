(()=>{
'use strict';
if(window.__franklinUiGuardV2Loaded)return;
window.__franklinUiGuardV2Loaded=true;
if(document.body?.dataset.page!=='home')return;
const css='franklin-shell-v2.css?v=20261030shell2';
const js='franklin-shell-v2.js?v=20261030shell2';
if(!document.querySelector('link[data-franklin-shell-v2]')){const l=document.createElement('link');l.rel='stylesheet';l.href=css;l.dataset.franklinShellV2='true';document.head.append(l)}
if(!document.getElementById('franklin-shell-v2-loader')){const s=document.createElement('script');s.id='franklin-shell-v2-loader';s.src=js;s.defer=true;document.head.append(s)}
})();
