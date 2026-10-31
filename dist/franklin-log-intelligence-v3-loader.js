(()=>{
'use strict';
if(window.__franklinLogIntelligenceV3Loader)return;
window.__franklinLogIntelligenceV3Loader=true;
window.__franklinLogIntelligenceV2=true;
const existing=document.getElementById('franklin-log-intelligence-v3-runtime');
if(existing)return;
const script=document.createElement('script');
script.id='franklin-log-intelligence-v3-runtime';
script.async=false;
script.src='franklin-log-intelligence-v3.js?v=20261031knowledge4';
script.onerror=()=>{window.__franklinLogIntelligenceV2=false;};
document.head.append(script);
})();
