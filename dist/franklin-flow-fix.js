(()=>{
'use strict';
if(window.__franklinFlowFixLoaded)return;
window.__franklinFlowFixLoaded=true;
const root=document.documentElement;
const style=document.createElement('style');
style.id='franklin-flow-fix-style';
style.textContent=`
.franklin-head-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:9px!important;min-width:max-content!important}
.franklin-language-control{position:relative!important;width:32px!important;height:32px!important;min-width:32px!important;max-width:32px!important;flex:0 0 32px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;display:grid!important;place-items:center!important;overflow:hidden!important;transition:background .18s ease,transform .18s ease!important}
.franklin-language-control:hover,.franklin-language-control:focus-within{background:color-mix(in srgb,var(--af-text,currentColor) 7%,transparent)!important}
.franklin-language-control:active{transform:scale(.92)!important}
.franklin-language-icon{position:absolute!important;inset:50% auto auto 50%!important;transform:translate(-50%,-50%)!important;width:18px!important;height:18px!important;color:color-mix(in srgb,var(--af-text,currentColor) 76%,var(--site-accent,var(--af-accent,#e8b65e)) 24%)!important;pointer-events:none!important;z-index:1!important}
.franklin-language-select{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:0!important;appearance:none!important;-webkit-appearance:none!important;cursor:pointer!important;z-index:2!important}
.franklin-head-actions>.ask-franklin-close{width:34px!important;height:34px!important;min-width:34px!important;border:0!important;background:transparent!important;box-shadow:none!important}
.franklin-head-actions>.ask-franklin-close:hover{background:color-mix(in srgb,var(--af-text,currentColor) 7%,transparent)!important}
html.franklin-connect-handoff .ask-franklin-panel.is-open{opacity:0!important;pointer-events:none!important;filter:blur(5px)!important}
html.franklin-panel-arrival .ask-franklin-panel.is-open{animation:franklinPanelArrival .34s cubic-bezier(.16,1,.3,1) both}
@keyframes franklinPanelArrival{from{opacity:0;filter:blur(4px)}to{opacity:1;filter:blur(0)}}
@media(max-width:760px){.franklin-head-actions{gap:8px!important}.franklin-language-control{width:30px!important;height:30px!important;min-width:30px!important;max-width:30px!important;flex-basis:30px!important}.franklin-language-icon{width:17px!important;height:17px!important}.franklin-head-actions>.ask-franklin-close{width:32px!important;height:32px!important;min-width:32px!important}}
@media(prefers-reduced-motion:reduce){html.franklin-panel-arrival .ask-franklin-panel.is-open{animation:none!important}.franklin-language-control{transition:none!important}}
`;
document.head.append(style);
let arrivalTimer=0;
const sync=()=>{
 const layer=document.querySelector('.franklin-connect-layer');
 if(!layer){root.classList.remove('franklin-connect-handoff');return}
 const visible=!layer.hidden;
 const closing=visible&&layer.classList.contains('is-closing');
 if(visible){root.classList.add('franklin-connect-handoff');root.classList.remove('franklin-panel-arrival');clearTimeout(arrivalTimer);return}
 if(root.classList.contains('franklin-connect-handoff')){
  root.classList.remove('franklin-connect-handoff');
  root.classList.add('franklin-panel-arrival');
  clearTimeout(arrivalTimer);
  arrivalTimer=setTimeout(()=>root.classList.remove('franklin-panel-arrival'),420);
 }
};
const normalizeLanguage=()=>{
 const wrap=document.querySelector('.ask-franklin-panel .franklin-language-control');
 const select=wrap?.querySelector('.franklin-language-select');
 if(!wrap||!select)return;
 wrap.removeAttribute('style');
 const icon=wrap.querySelector('.franklin-language-icon');
 if(icon){icon.removeAttribute('style');icon.setAttribute('stroke-width','1.6')}
 const syncTitle=()=>{const label=select.options[select.selectedIndex]?.textContent?.trim()||'Language';wrap.title=label;wrap.setAttribute('aria-label',`Language: ${label}`)};
 if(!select.dataset.flowFixBound){select.dataset.flowFixBound='true';select.addEventListener('change',syncTitle)}
 syncTitle();
};
const observer=new MutationObserver(()=>{sync();normalizeLanguage()});
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','data-phase']});
window.addEventListener('pageshow',()=>{sync();normalizeLanguage()});
sync();normalizeLanguage();
})();
