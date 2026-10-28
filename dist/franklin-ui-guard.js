(()=>{
 'use strict';
 if(window.__franklinUiGuardLegacyShim)return;
 window.__franklinUiGuardLegacyShim=true;
 const add=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;document.head.append(s)};
 add('franklin-ui-guard-v2.js?v=20261028polish3','franklin-ui-guard-v2-loader');
 add('franklin-primary-state-fix.js?v=20261028primary1','franklin-primary-state-fix-loader');
})();
