(()=>{
 'use strict';
 if(window.__franklinUiPolishLoaded)return;
 window.__franklinUiPolishLoaded=true;
 const panel=document.querySelector('.ask-franklin-panel');
 if(!panel)return;
 const ensureStyle=()=>{
  if(document.getElementById('franklin-ui-polish-style'))return;
  const s=document.createElement('style');
  s.id='franklin-ui-polish-style';
  s.textContent=`
   .franklin-language-control{position:relative!important;width:38px!important;height:38px!important;min-width:38px!important;max-width:38px!important;flex:0 0 38px!important;margin:0 2px 0 0!important;border:1px solid color-mix(in srgb,var(--site-accent,var(--af-accent,#e8b65e)) 22%,var(--af-border,#ffffff1a))!important;border-radius:50%!important;background:color-mix(in srgb,var(--af-surface-2,#171613) 66%,transparent)!important;display:grid!important;place-items:center!important;overflow:hidden!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(16px) saturate(1.15)!important;-webkit-backdrop-filter:blur(16px) saturate(1.15)!important;transition:border-color .2s ease,background .2s ease,transform .2s ease!important}
   .franklin-language-control::before,.franklin-language-control::after{content:none!important;display:none!important}
   .franklin-language-control:hover,.franklin-language-control:focus-within{border-color:color-mix(in srgb,var(--site-accent,var(--af-accent,#e8b65e)) 62%,transparent)!important;background:color-mix(in srgb,var(--af-surface-2,#171613) 74%,var(--site-accent,var(--af-accent,#e8b65e)) 7%)!important}
   .franklin-language-control:active{transform:scale(.95)!important}
   .franklin-language-icon{width:17px;height:17px;display:block;color:var(--af-muted,currentColor);pointer-events:none;transition:color .2s ease,filter .2s ease}
   .franklin-language-control:hover .franklin-language-icon,.franklin-language-control:focus-within .franklin-language-icon{color:var(--site-accent,var(--af-accent,#e8b65e));filter:drop-shadow(0 0 7px color-mix(in srgb,var(--site-accent,var(--af-accent,#e8b65e)) 32%,transparent))}
   .franklin-language-select{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;color:transparent!important;opacity:0!important;appearance:none!important;-webkit-appearance:none!important;cursor:pointer!important;z-index:2!important}
   .franklin-language-select:focus{outline:0!important;box-shadow:none!important}
   .franklin-head-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important}
   @media(max-width:760px){.franklin-language-control{width:36px!important;height:36px!important;min-width:36px!important;flex-basis:36px!important}.franklin-language-icon{width:16px;height:16px}}
   @media(prefers-reduced-motion:reduce){.franklin-language-control,.franklin-language-icon{transition:none!important}}
  `;
  document.head.append(s);
 };
 const apply=()=>{
  const wrap=panel.querySelector('.franklin-language-control');
  const select=wrap?.querySelector('.franklin-language-select');
  if(!wrap||!select)return false;
  ensureStyle();
  if(!wrap.querySelector('.franklin-language-icon')){
   const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
   icon.setAttribute('viewBox','0 0 24 24');
   icon.setAttribute('fill','none');
   icon.setAttribute('stroke','currentColor');
   icon.setAttribute('stroke-width','1.7');
   icon.setAttribute('stroke-linecap','round');
   icon.setAttribute('stroke-linejoin','round');
   icon.setAttribute('aria-hidden','true');
   icon.classList.add('franklin-language-icon');
   icon.innerHTML='<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9M12 3C9.6 5.5 8.4 8.5 8.4 12s1.2 6.5 3.6 9"></path>';
   wrap.prepend(icon);
  }
  const syncTitle=()=>{
   const text=select.options[select.selectedIndex]?.textContent?.trim()||'Language';
   wrap.title=text;
   wrap.setAttribute('aria-label',`Language: ${text}`);
  };
  if(!select.dataset.polishBound){select.dataset.polishBound='true';select.addEventListener('change',syncTitle)}
  syncTitle();
  return true;
 };
 if(!apply()){
  const mo=new MutationObserver(()=>{if(apply())mo.disconnect()});
  mo.observe(panel,{childList:true,subtree:true});
 }
})();