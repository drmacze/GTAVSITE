(()=>{
'use strict';
if(window.__gtavGlobalBeamsV1)return;
window.__gtavGlobalBeamsV1=true;

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

const mount=()=>{
  if(document.querySelector('.global-beams-bg'))return;
  const layer=document.createElement('div');
  layer.className='global-beams-bg';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML=`
    <svg viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="globalBeamsGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff9a45"/>
          <stop offset="52%" stop-color="#ff7a1a"/>
          <stop offset="100%" stop-color="#b84d00"/>
        </linearGradient>
      </defs>
      <g class="beam-path"><path class="beam-base" d="M-180 126 C 180 24, 390 82, 690 260 S 1180 520, 1620 392"/><path pathLength="1" class="beam-flow" style="--beam-duration:12.2s;--beam-delay:-1.6s" d="M-180 126 C 180 24, 390 82, 690 260 S 1180 520, 1620 392"/></g>
      <g class="beam-path"><path class="beam-base" d="M-220 242 C 145 132, 390 160, 720 330 S 1200 616, 1640 492"/><path pathLength="1" class="beam-flow is-soft" style="--beam-duration:13.8s;--beam-delay:-7.4s" d="M-220 242 C 145 132, 390 160, 720 330 S 1200 616, 1640 492"/></g>
      <g class="beam-path"><path class="beam-base" d="M-250 354 C 88 260, 360 236, 674 404 S 1170 720, 1660 582"/><path pathLength="1" class="beam-flow" style="--beam-duration:10.7s;--beam-delay:-4.1s" d="M-250 354 C 88 260, 360 236, 674 404 S 1170 720, 1660 582"/></g>
      <g class="beam-path"><path class="beam-base" d="M-250 474 C 90 352, 340 344, 650 492 S 1120 790, 1640 692"/><path pathLength="1" class="beam-flow is-soft" style="--beam-duration:15.1s;--beam-delay:-9.2s" d="M-250 474 C 90 352, 340 344, 650 492 S 1120 790, 1640 692"/></g>
      <g class="beam-path"><path class="beam-base" d="M-180 600 C 160 442, 420 456, 724 600 S 1162 886, 1620 804"/><path pathLength="1" class="beam-flow" style="--beam-duration:11.6s;--beam-delay:-5.8s" d="M-180 600 C 160 442, 420 456, 724 600 S 1162 886, 1620 804"/></g>
      <g class="beam-path"><path class="beam-base" d="M-80 -80 C 160 122, 360 260, 646 420 S 1110 710, 1510 950"/><path pathLength="1" class="beam-flow is-soft" style="--beam-duration:14.5s;--beam-delay:-2.9s" d="M-80 -80 C 160 122, 360 260, 646 420 S 1110 710, 1510 950"/></g>
      <g class="beam-path"><path class="beam-base" d="M120 -120 C 330 72, 510 210, 770 372 S 1160 676, 1540 910"/><path pathLength="1" class="beam-flow" style="--beam-duration:12.9s;--beam-delay:-8.6s" d="M120 -120 C 330 72, 510 210, 770 372 S 1160 676, 1540 910"/></g>
      <g class="beam-path"><path class="beam-base" d="M340 -160 C 520 50, 690 176, 912 336 S 1230 610, 1560 812"/><path pathLength="1" class="beam-flow is-soft" style="--beam-duration:16.2s;--beam-delay:-11.3s" d="M340 -160 C 520 50, 690 176, 912 336 S 1230 610, 1560 812"/></g>
      <g class="beam-path"><path class="beam-base" d="M580 -200 C 720 12, 850 156, 1010 304 S 1280 566, 1580 716"/><path pathLength="1" class="beam-flow" style="--beam-duration:13.4s;--beam-delay:-6.7s" d="M580 -200 C 720 12, 850 156, 1010 304 S 1280 566, 1580 716"/></g>
    </svg>`;
  document.body.prepend(layer);
};
const syncVisibility=()=>{if(document.body)document.body.dataset.beamsPaused=document.hidden?'true':'false'};
const init=()=>{applySiteIcon();mount();syncVisibility()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('visibilitychange',syncVisibility,{passive:true});
window.addEventListener('pageshow',()=>{applySiteIcon();mount();syncVisibility()},{passive:true});
window.addEventListener('gtav:site-icon-updated',applySiteIcon);
})();