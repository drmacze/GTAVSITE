(()=>{
'use strict';
if(window.__gtaOnlineMenuPromoV3)return;
window.__gtaOnlineMenuPromoV3=true;
if(document.body?.dataset.page!=='home')return;

const SHARE_URL='https://screenapp.io/app/share/HtRxbVRx8lWo-LxRpIfC4Ak8?t=0';
const RELEASE_URL='updates.html#release-2026-10-29';
const hero=document.querySelector('.home-hero');
if(!hero)return;

if(!document.querySelector('link[data-gta-online-menu-promo]')){
 const css=document.createElement('link');
 css.rel='stylesheet';
 css.href='gta-online-menu-promo-v1.css?v=20261030onlinepromo3';
 css.dataset.gtaOnlineMenuPromo='true';
 document.head.append(css);
}

const card=document.createElement('aside');
card.className='gta-online-menu-promo';
card.setAttribute('aria-labelledby','gta-online-menu-title');
card.setAttribute('aria-hidden','true');
card.setAttribute('data-lenis-prevent','');
card.innerHTML=`
 <div class="gta-online-menu-media">
  <div class="gta-online-menu-media-placeholder" aria-hidden="true">
   <div class="gta-online-menu-playmark"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"></circle><path d="m20 16.5 13 7.5-13 7.5Z"></path></svg></div>
   <span>GTA ONLINE</span>
  </div>
  <iframe title="GTA Online for GTA V iOS video preview" data-src="${SHARE_URL}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
  <div class="gta-online-menu-media-shade" aria-hidden="true"></div>
  <span class="gta-online-menu-video-label"><i></i>VIDEO PREVIEW</span>
  <a class="gta-online-menu-preview-link" href="${SHARE_URL}" target="_blank" rel="noopener noreferrer" aria-label="Open GTA Online video preview">
   <span>Open video</span>
   <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"></path></svg>
  </a>
 </div>
 <div class="gta-online-menu-copy">
  <div class="gta-online-menu-kicker"><span></span>NEW MODE</div>
  <div class="gta-online-menu-title-row">
   <div><h3 id="gta-online-menu-title">GTA Online</h3><p class="gta-online-menu-subtitle">New mode for GTA V iOS</p></div>
   <span class="gta-online-menu-platform">iOS</span>
  </div>
  <p class="gta-online-menu-description">Create your Online character, join sessions with friends, and launch supported Online jobs from the trainer.</p>
  <div class="gta-online-menu-footer">
   <span class="gta-online-menu-build">29 OCT BUILD</span>
   <a class="gta-online-menu-play" href="${RELEASE_URL}" aria-label="Play Now — open the GTA Online release">
    <span>Play Now</span>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
   </a>
  </div>
 </div>`;
document.body.append(card);

const iframe=card.querySelector('iframe');
const onboarding=document.querySelector('#onboarding-dialog');
let mediaLoaded=false;
let loadTimer=0;
let visible=false;
let bootReady=false;
let raf=0;

const loadMedia=()=>{
 if(mediaLoaded||!visible)return;
 clearTimeout(loadTimer);
 loadTimer=setTimeout(()=>{
  if(mediaLoaded||!visible)return;
  const src=iframe.dataset.src;
  if(!src)return;
  mediaLoaded=true;
  iframe.src=src;
 },260);
};

const setVisible=next=>{
 next=!!next;
 if(visible===next)return;
 visible=next;
 card.classList.toggle('is-visible',visible);
 card.setAttribute('aria-hidden',visible?'false':'true');
 if(visible)loadMedia();
};

const mainMenuVisible=()=>{
 if(!bootReady)return false;
 const rect=hero.getBoundingClientRect();
 const viewport=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0);
 const heroVisible=rect.bottom>viewport*.08&&rect.top<viewport*.88;
 const intro=document.querySelector('.home-intro-v5');
 const introRect=intro?.getBoundingClientRect();
 const introBlocking=document.body.classList.contains('intro5-active')||Boolean(introRect&&introRect.bottom>viewport*.12);
 const onboardingOpen=Boolean(onboarding?.open);
 return heroVisible&&!introBlocking&&!onboardingOpen;
};

const syncVisibility=()=>{
 raf=0;
 setVisible(mainMenuVisible());
 const helperOpen=!!document.querySelector('.ask-franklin-panel.is-open');
 card.classList.toggle('helper-is-open',helperOpen);
};
const scheduleSync=()=>{
 if(raf)return;
 raf=requestAnimationFrame(syncVisibility);
};

iframe.addEventListener('load',()=>{
 if(iframe.getAttribute('src'))card.classList.add('media-ready');
});

const observer=new IntersectionObserver(scheduleSync,{threshold:[0,.02,.12,.4]});
observer.observe(hero);
const stateObserver=new MutationObserver(scheduleSync);
stateObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','open']});
window.addEventListener('scroll',scheduleSync,{passive:true});
window.addEventListener('resize',scheduleSync,{passive:true});
window.addEventListener('pageshow',scheduleSync,{passive:true});
window.addEventListener('gtav:intro-loader-complete',scheduleSync,{passive:true});

setTimeout(()=>{bootReady=true;scheduleSync()},420);
setTimeout(scheduleSync,1200);

card.querySelector('.gta-online-menu-play')?.addEventListener('click',()=>card.classList.add('is-leaving'));

window.addEventListener('pagehide',()=>{
 clearTimeout(loadTimer);
 if(raf)cancelAnimationFrame(raf);
 observer.disconnect();
 stateObserver.disconnect();
 window.removeEventListener('scroll',scheduleSync);
 window.removeEventListener('resize',scheduleSync);
 window.removeEventListener('pageshow',scheduleSync);
 window.removeEventListener('gtav:intro-loader-complete',scheduleSync);
 if(mediaLoaded)iframe.removeAttribute('src');
},{once:true});
})();
