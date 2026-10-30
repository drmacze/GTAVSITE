(()=>{
 'use strict';
 if(window.__franklinUiGuardLegacyShim)return;
 window.__franklinUiGuardLegacyShim=true;
 const add=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;document.head.append(s)};
 const addStyle=(href,id)=>{if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.append(l)};
 add('franklin-ui-guard-v2.js?v=20261028polish3','franklin-ui-guard-v2-loader');
 add('franklin-primary-state-fix.js?v=20261028primary1','franklin-primary-state-fix-loader');
 let tries=0;
 const loadGlow=()=>{
   if(document.getElementById('franklin-ui-guard-v2-style')||window.__franklinUiGuardV2Loaded||tries++>100){
     addStyle('franklin-helper-glow-v1.css?v=20261030helperglow2','franklin-helper-glow-v1-style');
     return;
   }
   setTimeout(loadGlow,20);
 };
 loadGlow();
})();
