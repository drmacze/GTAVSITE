(()=>{
'use strict';
if(window.__gtavGlobalBeamsV16)return;
window.__gtavGlobalBeamsV16=true;

const EFFECTS_HREF='rockstar-black-yellow-v1.css?v=20261031rockstar2';
const EFFECTS_ID='rockstar-black-yellow-v1-style';
const HOME_DETAIL_HREF='home-rockstar-detail-v1.css?v=20261031homeDetail3';
const HOME_DETAIL_ID='home-rockstar-detail-v1-style';
const RELEASE30_SRC='release30-site-v1.js?v=20261031release30site2';
const RELEASE30_ID='release30-site-v2-loader';
const APP_DOWNLOAD_SRC='app-download-discord-v1.js?v=20261031discordapps1';
const APP_DOWNLOAD_ID='app-download-discord-v1-loader';
const RELEASE30_MODS_SRC='release30-mods-v1.js?v=20261031release30mods2';
const RELEASE30_MODS_ID='release30-mods-v1-loader';
const MODS_CLEANUP_SRC='mods-card-cleanup-v1.js?v=20261031modscard3';
const MODS_CLEANUP_ID='mods-card-cleanup-v3-loader';

const retireFeedbackFeature=()=>{
  const path=location.pathname.replace(/\/+$/,'').toLowerCase();
  if(path.endsWith('/feedback')||path.endsWith('/feedback.html')){
    location.replace('home.html');
    return false;
  }
  document.querySelectorAll('a[href]').forEach(link=>{
    let href='';
    try{href=new URL(link.getAttribute('href')||'',location.href).pathname.toLowerCase()}catch{}
    if(href.endsWith('/feedback')||href.endsWith('/feedback.html')){
      const item=link.closest('li');
      if(item&&item.children.length===1)item.remove();
      else link.remove();
    }
  });
  document.querySelectorAll('.feedback-sheet,.feedback-sheet-backdrop,.feedback-sheet-dock,.mods-feedback-gate').forEach(el=>el.remove());
  document.documentElement.classList.remove('feedback-sheet-open','mods-feedback-open');
  return true;
};

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
  if(!link){link=document.createElement('link');link.id=EFFECTS_ID;link.rel='stylesheet';link.href=EFFECTS_HREF;document.head.append(link)}
  else if(link.getAttribute('href')!==EFFECTS_HREF)link.href=EFFECTS_HREF;
  return link;
};

const ensureHomeDetailCss=()=>{
  if(document.body?.dataset.page!=='home')return null;
  let link=document.getElementById(HOME_DETAIL_ID);
  if(!link){link=document.createElement('link');link.id=HOME_DETAIL_ID;link.rel='stylesheet';link.href=HOME_DETAIL_HREF;document.head.append(link)}
  else if(link.getAttribute('href')!==HOME_DETAIL_HREF)link.href=HOME_DETAIL_HREF;
  return link;
};

const ensureScript=(id,src)=>{
  if(document.getElementById(id))return;
  const script=document.createElement('script');script.id=id;script.src=src;script.defer=true;document.head.append(script);
};
const ensureRelease30=()=>ensureScript(RELEASE30_ID,RELEASE30_SRC);
const ensureAppDownloadRouting=()=>ensureScript(APP_DOWNLOAD_ID,APP_DOWNLOAD_SRC);
const ensureRelease30Mods=()=>{if(document.body?.dataset.page==='downloads')ensureScript(RELEASE30_MODS_ID,RELEASE30_MODS_SRC)};
const ensureModsCleanup=()=>{if(document.body?.dataset.page==='downloads')ensureScript(MODS_CLEANUP_ID,MODS_CLEANUP_SRC)};
const ensureFranklin30=()=>{
  if(document.body?.dataset.page!=='home')return;
  ensureScript('franklin-release-state-v4-direct','franklin-release-state-v2.js?v=20261031release30state4');
  ensureScript('franklin-latest-kb-v3-direct','franklin-latest-kb-v1.js?v=20261031latest30v2');
  ensureScript('franklin-release29-v3-direct','franklin-release29-knowledge-v1.js?v=20261031release29knowledge3');
  ensureScript('franklin-release30-v1-direct','franklin-release30-knowledge-v1.js?v=20261031release30knowledge1');
};

const promoteEffectsCss=()=>{
  const links=[ensureEffectsCss(),ensureHomeDetailCss()].filter(Boolean);
  requestAnimationFrame(()=>requestAnimationFrame(()=>links.forEach(link=>{if(link.isConnected)document.head.append(link)})));
};

const mount=()=>{
  let layer=document.querySelector('.global-beams-bg');
  if(!layer){layer=document.createElement('div');layer.className='global-beams-bg';layer.setAttribute('aria-hidden','true');document.body.prepend(layer)}
  layer.replaceChildren();
};
const syncVisibility=()=>{if(document.body)document.body.dataset.beamsPaused=document.hidden?'true':'false'};

const init=()=>{
  if(!retireFeedbackFeature())return;
  applySiteIcon();applyChromeTint();ensureEffectsCss();ensureHomeDetailCss();ensureRelease30();ensureAppDownloadRouting();ensureRelease30Mods();ensureModsCleanup();ensureFranklin30();mount();syncVisibility();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('visibilitychange',syncVisibility,{passive:true});
new MutationObserver(applyChromeTint).observe(document.documentElement,{attributes:true,attributeFilter:['data-mode','data-theme']});
window.addEventListener('load',()=>{if(!retireFeedbackFeature())return;applyChromeTint();ensureRelease30();ensureAppDownloadRouting();ensureRelease30Mods();ensureModsCleanup();ensureFranklin30();promoteEffectsCss()},{once:true});
window.addEventListener('pageshow',()=>{if(!retireFeedbackFeature())return;applySiteIcon();applyChromeTint();ensureEffectsCss();ensureHomeDetailCss();ensureRelease30();ensureAppDownloadRouting();ensureRelease30Mods();ensureModsCleanup();ensureFranklin30();mount();syncVisibility();promoteEffectsCss()},{passive:true});
window.addEventListener('gtav:site-icon-updated',applySiteIcon);
})();