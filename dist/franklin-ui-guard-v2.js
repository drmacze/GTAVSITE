(()=>{
'use strict';
if(window.__franklinUiGuardV2Loaded)return;
window.__franklinUiGuardV2Loaded=true;
if(document.body?.dataset.page!=='home')return;
const addStyle=(href,key)=>{if(document.querySelector(`link[data-${key}]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'true');document.head.append(l)};
const addScript=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.async=false;s.src=src;document.head.append(s)};
addStyle('franklin-shell-v2.css?v=20261030shell5','franklin-shell-v2');
addStyle('franklin-shell-v2-stability.css?v=20261030shell5','franklin-shell-v2-stability');
addStyle('franklin-shell-v2-polish.css?v=20261030shell5','franklin-shell-v2-polish');
addStyle('franklin-shell-v2-fix5.css?v=20261030shell5','franklin-shell-v2-fix5');
addScript('franklin-release-state-v2.js?v=20261031release29state3','franklin-release-state-v2-loader');
addScript('franklin-latest-kb-v1.js?v=20261031latest29v2','franklin-latest-kb-v2-loader');
addScript('franklin-context-intelligence-v1.js?v=20261030context2','franklin-context-intelligence-v1-loader');
addScript('franklin-context-triage-v1.js?v=20261030contexttriage1','franklin-context-triage-v1-loader');
addScript('franklin-shell-v2.js?v=20261031release29state3','franklin-shell-v2-loader');
addScript('franklin-shell-v2-fix5.js?v=20261031release29state3','franklin-shell-v2-fix5-loader');
})();