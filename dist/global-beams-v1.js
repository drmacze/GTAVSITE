(()=>{
'use strict';
if(window.__gtavGlobalBeamsV3)return;
window.__gtavGlobalBeamsV3=true;

const EFFECTS_HREF='sidebar-outline-fog-v2.css?v=20261031fog1';

const applySiteIcon=()=>{
  const href='/api/site-icon?v=20261029siteicon1';
  let icon=document.head.querySelector('link[rel="icon"]');
  if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.append(icon)}
  icon.type='image/png';icon.sizes='512x512';icon.href=href;
  let apple=document.head.querySelector('link[rel="apple-touch-icon"]');
  if(!apple){apple=document.createElement('link');apple.rel='apple-touch-icon';document.head.append(apple)}
  apple.sizes='512x512';apple.href=href;
  document.head.querySelectorAll('link[rel="shortcut icon"]').forEach(link=>link.href=href);
};

const ensureEffectsCss=()=>{
  let link=document.getElementById('sidebar-outline-fog-v2-style');
  if(!link){
    link=document.createElement('link');
    link.id='sidebar-outline-fog-v2-style';
    link.rel='stylesheet';
    link.href=EFFECTS_HREF;
    document.head.append(link);
  }
  return link;
};

const promoteEffectsCss=()=>{
  const link=ensureEffectsCss();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(link.isConnected)document.head.append(link);
  }));
};

const mount=()=>{
  let layer=document.querySelector('.global-beams-bg');
  if(!layer){
    layer=document.createElement('div');
    layer.className='global-beams-bg';
    layer.setAttribute('aria-hidden','true');
    document.body.prepend(layer);
  }
  // Old builds may have inserted the animated SVG. The new background is CSS fog only.
  layer.replaceChildren();
};

const syncVisibility=()=>{
  if(document.body)document.body.dataset.beamsPaused=document.hidden?'true':'false';
};

const init=()=>{
  applySiteIcon();
  ensureEffectsCss();
  mount();
  syncVisibility();
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('visibilitychange',syncVisibility,{passive:true});
window.addEventListener('load',promoteEffectsCss,{once:true});
window.addEventListener('pageshow',()=>{applySiteIcon();ensureEffectsCss();mount();syncVisibility();promoteEffectsCss()},{passive:true});
window.addEventListener('gtav:site-icon-updated',applySiteIcon);
})();