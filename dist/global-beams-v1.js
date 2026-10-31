(()=>{
'use strict';
if(window.__gtavGlobalBeamsV8)return;
window.__gtavGlobalBeamsV8=true;

const EFFECTS_HREF='rockstar-black-yellow-v1.css?v=20261031rockstar2';
const EFFECTS_ID='rockstar-black-yellow-v1-style';
const HOME_DETAIL_HREF='home-rockstar-detail-v1.css?v=20261031homeDetail2';
const HOME_DETAIL_ID='home-rockstar-detail-v1-style';
const RELEASE30_SRC='release30-site-v1.js?v=20261031release30site1';
const RELEASE30_ID='release30-site-v1-loader';

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

const applyChromeTint=()=>{
  const root=document.documentElement;
  const meta=document.querySelector('meta[name="theme-color"]')||(()=>{const m=document.createElement('meta');m.name='theme-color';document.head.append(m);return m})();
  meta.content='#000000';
  root.style.backgroundColor='#000000';
};

const ensureEffectsCss=()=>{
  document.getElementById('sidebar-outline-fog-v2-style')?.remove();
  let link=document.getElementById(EFFECTS_ID);
  if(!link){
    link=document.createElement('link');
    link.id=EFFECTS_ID;
    link.rel='stylesheet';
    link.href=EFFECTS_HREF;
    document.head.append(link);
  }else if(link.getAttribute('href')!==EFFECTS_HREF){
    link.href=EFFECTS_HREF;
  }
  return link;
};

const ensureHomeDetailCss=()=>{
  if(document.body?.dataset.page!=='home')return null;
  let link=document.getElementById(HOME_DETAIL_ID);
  if(!link){
    link=document.createElement('link');
    link.id=HOME_DETAIL_ID;
    link.rel='stylesheet';
    link.href=HOME_DETAIL_HREF;
    document.head.append(link);
  }else if(link.getAttribute('href')!==HOME_DETAIL_HREF){
    link.href=HOME_DETAIL_HREF;
  }
  return link;
};

const ensureRelease30=()=>{
  if(document.getElementById(RELEASE30_ID))return;
  const script=document.createElement('script');
  script.id=RELEASE30_ID;
  script.src=RELEASE30_SRC;
  script.defer=true;
  document.head.append(script);
};

const promoteEffectsCss=()=>{
  const links=[ensureEffectsCss(),ensureHomeDetailCss()].filter(Boolean);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    links.forEach(link=>{if(link.isConnected)document.head.append(link)});
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
  layer.replaceChildren();
};

const syncVisibility=()=>{
  if(document.body)document.body.dataset.beamsPaused=document.hidden?'true':'false';
};

const init=()=>{
  applySiteIcon();
  applyChromeTint();
  ensureEffectsCss();
  ensureHomeDetailCss();
  ensureRelease30();
  mount();
  syncVisibility();
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('visibilitychange',syncVisibility,{passive:true});
new MutationObserver(applyChromeTint).observe(document.documentElement,{attributes:true,attributeFilter:['data-mode','data-theme']});
window.addEventListener('load',()=>{applyChromeTint();ensureRelease30();promoteEffectsCss()},{once:true});
window.addEventListener('pageshow',()=>{applySiteIcon();applyChromeTint();ensureEffectsCss();ensureHomeDetailCss();ensureRelease30();mount();syncVisibility();promoteEffectsCss()},{passive:true});
window.addEventListener('gtav:site-icon-updated',applySiteIcon);
})();