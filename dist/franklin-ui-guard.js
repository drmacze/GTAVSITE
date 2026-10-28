(()=>{
 'use strict';
 if(window.__franklinUiGuardLegacyShim)return;
 window.__franklinUiGuardLegacyShim=true;
 if(window.__franklinUiGuardV2Loaded||document.getElementById('franklin-ui-guard-v2-loader'))return;
 const s=document.createElement('script');
 s.id='franklin-ui-guard-v2-loader';
 s.src='franklin-ui-guard-v2.js?v=20261028polish3';
 document.head.append(s);
})();
