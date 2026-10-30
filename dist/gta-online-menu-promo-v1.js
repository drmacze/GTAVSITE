(()=>{
'use strict';
if(window.__gtaOnlineMenuPromoV5)return;
window.__gtaOnlineMenuPromoV5=true;
if(document.body?.dataset.page!=='home')return;

const SHARE_URL='https://screenapp.io/app/share/HtRxbVRx8lWo-LxRpIfC4Ak8?t=0';
const RELEASE_URL='updates.html#release-2026-10-29';
const DISMISS_KEY='gtav-online-promo-dismissed-v1';
const hero=document.querySelector('.home-hero');
if(!hero)return;

if(!document.querySelector('link[data-gta-online-menu-promo]')){
 const css=document.createElement('link');
 css.rel='stylesheet';
 css.href='gta-online-menu-promo-v1.css?v=20261030onlinepromo5';
 css.dataset.gtaOnlineMenuPromo='true';
 document.head.append(css);
}

const closeIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg>`;
const arrowIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>`;
const platformPills=`<span>iOS</span><span>Mac</span>`;

const dock=document.createElement('div');
dock.className='gta-online-menu-dock';
dock.setAttribute('role','button');
dock.setAttribute('tabindex','0');
dock.setAttribute('aria-label','Open GTA Online panel');
dock.setAttribute('aria-expanded','false');
dock.innerHTML=`
 <div class="gta-online-dock-grip" aria-hidden="true"></div>
 <div class="gta-online-dock-copy">
  <small>NEW MODE</small>
  <strong><span>GTA</span> <em>ONLINE</em></strong>
 </div>
 <div class="gta-online-platforms gta-online-dock-platforms">${platformPills}</div>
 <span class="gta-online-dock-hint">Swipe up</span>
 <button type="button" class="gta-online-dismiss gta-online-dock-dismiss" aria-label="Hide GTA Online panel">${closeIcon}</button>`;

const sheet=document.createElement('aside');
sheet.className='gta-online-menu-promo';
sheet.setAttribute('aria-labelledby','gta-online-menu-title');
sheet.setAttribute('aria-hidden','true');
sheet.setAttribute('data-lenis-prevent','');
sheet.inert=true;
sheet.innerHTML=`
 <div class="gta-online-sheet-grip" aria-hidden="true"><span></span></div>
 <div class="gta-online-sheet-top">
  <div class="gta-online-sheet-heading">
   <small>NEW MODE</small>
   <div class="gta-online-sheet-title-row">
    <h3 id="gta-online-menu-title"><span class="gta-online-title-gta">GTA</span> <span class="gta-online-title-online">ONLINE</span></h3>
    <div class="gta-online-platforms">${platformPills}</div>
   </div>
   <p>New mode for GTA V on iOS &amp; Mac</p>
  </div>
  <button type="button" class="gta-online-dismiss gta-online-sheet-dismiss" aria-label="Hide GTA Online panel">${closeIcon}</button>
 </div>
 <div class="gta-online-menu-body">
  <div class="gta-online-menu-media">
   <div class="gta-online-menu-media-placeholder" aria-hidden="true">
    <div class="gta-online-menu-playmark"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"></circle><path d="m20 16.5 13 7.5-13 7.5Z"></path></svg></div>
    <span>GTA ONLINE</span>
   </div>
   <div class="gta-online-menu-media-frame">
    <iframe title="GTA Online video preview" data-src="${SHARE_URL}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
   </div>
   <div class="gta-online-menu-media-shade" aria-hidden="true"></div>
  </div>
  <div class="gta-online-menu-copy">
   <p class="gta-online-menu-description">Create your Online character, join sessions with friends, and launch supported Online jobs from the trainer.</p>
   <div class="gta-online-menu-footer">
    <span class="gta-online-menu-note">Available on supported iPhone, iPad and Mac builds.</span>
    <a class="gta-online-menu-play" href="${RELEASE_URL}" aria-label="Play Now — open the GTA Online release">
     <span>Play Now</span>${arrowIcon}
    </a>
   </div>
  </div>
 </div>`;

document.body.append(dock,sheet);

const iframe=sheet.querySelector('iframe');
const onboarding=document.querySelector('#onboarding-dialog');
let mediaLoaded=false;
let loadTimer=0;
let bootReady=false;
let available=false;
let opened=false;
let dismissed=false;
let raf=0;
try{dismissed=sessionStorage.getItem(DISMISS_KEY)==='1'}catch{}

const unloadMedia=()=>{
 clearTimeout(loadTimer);
 if(!mediaLoaded)return;
 mediaLoaded=false;
 sheet.classList.remove('media-ready');
 iframe.removeAttribute('src');
};
const loadMedia=()=>{
 if(mediaLoaded||!opened||!available)return;
 clearTimeout(loadTimer);
 loadTimer=setTimeout(()=>{
  if(mediaLoaded||!opened||!available)return;
  const src=iframe.dataset.src;
  if(!src)return;
  mediaLoaded=true;
  iframe.src=src;
 },180);
};

const syncUi=()=>{
 const showDock=available&&!opened&&!dismissed;
 const showSheet=available&&opened&&!dismissed;
 dock.classList.toggle('is-visible',showDock);
 dock.setAttribute('aria-hidden',showDock?'false':'true');
 dock.setAttribute('aria-expanded',showSheet?'true':'false');
 sheet.classList.toggle('is-open',showSheet);
 sheet.setAttribute('aria-hidden',showSheet?'false':'true');
 sheet.inert=!showSheet;
 document.documentElement.classList.toggle('gta-online-sheet-open',showSheet);
 if(showSheet)loadMedia();
 else if(mediaLoaded)setTimeout(()=>{if(!opened)unloadMedia()},260);
};

const openSheet=()=>{
 if(!available||dismissed)return;
 opened=true;
 dock.style.transform='';
 sheet.style.transform='';
 syncUi();
};
const minimizeSheet=()=>{
 opened=false;
 sheet.style.transform='';
 dock.style.transform='';
 syncUi();
};
const dismiss=()=>{
 dismissed=true;
 opened=false;
 try{sessionStorage.setItem(DISMISS_KEY,'1')}catch{}
 dock.classList.remove('is-visible');
 sheet.classList.remove('is-open');
 dock.setAttribute('aria-hidden','true');
 sheet.setAttribute('aria-hidden','true');
 sheet.inert=true;
 document.documentElement.classList.remove('gta-online-sheet-open');
 unloadMedia();
};

const mainMenuVisible=()=>{
 if(!bootReady||dismissed)return false;
 const rect=hero.getBoundingClientRect();
 const viewport=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0);
 const heroVisible=rect.bottom>viewport*.08&&rect.top<viewport*.88;
 const intro=document.querySelector('.home-intro-v5');
 const introRect=intro?.getBoundingClientRect();
 const introBlocking=document.body.classList.contains('intro5-active')||Boolean(introRect&&introRect.bottom>viewport*.12);
 const onboardingOpen=Boolean(onboarding?.open);
 const helperOpen=!!document.querySelector('.ask-franklin-panel.is-open,.ask-franklin-panel.is-chat-open');
 const menuOpen=Boolean(document.querySelector('#site-menu[open]'));
 return heroVisible&&!introBlocking&&!onboardingOpen&&!helperOpen&&!menuOpen;
};

const syncVisibility=()=>{
 raf=0;
 const next=mainMenuVisible();
 if(available!==next){
  available=next;
  if(!available&&opened)minimizeSheet();
 }
 syncUi();
};
const scheduleSync=()=>{
 if(raf)return;
 raf=requestAnimationFrame(syncVisibility);
};

function bindSwipe(surface,direction,action,isDock=false){
 let gesture=null;
 surface.style.touchAction='none';
 const finish=event=>{
  if(!gesture)return;
  const dy=event.clientY-gesture.y;
  const dx=Math.abs(event.clientX-gesture.x);
  const delta=dy*direction;
  surface.releasePointerCapture?.(event.pointerId);
  dock.style.transform='';
  sheet.style.transform='';
  surface.classList.remove('is-dragging');
  const threshold=isDock?22:42;
  if(delta>threshold&&delta>dx*1.15)action();
  gesture=null;
 };
 surface.addEventListener('pointerdown',event=>{
  if(event.button!==undefined&&event.button!==0)return;
  if(event.target.closest('button,a'))return;
  gesture={x:event.clientX,y:event.clientY};
  surface.setPointerCapture?.(event.pointerId);
  surface.classList.add('is-dragging');
 });
 surface.addEventListener('pointermove',event=>{
  if(!gesture)return;
  const dy=event.clientY-gesture.y;
  const dx=Math.abs(event.clientX-gesture.x);
  if(Math.abs(dy)<4||Math.abs(dy)<dx)return;
  if(isDock){
   const lift=Math.max(-34,Math.min(0,dy));
   dock.style.transform=matchMedia('(max-width:760px)').matches?`translateY(${lift}px)`:`translate(-50%,${lift}px)`;
  }else{
   const drop=Math.max(0,Math.min(150,dy));
   sheet.style.transform=`translateY(${drop}px)`;
  }
 });
 surface.addEventListener('pointerup',finish);
 surface.addEventListener('pointercancel',finish);
}

const sheetGrip=sheet.querySelector('.gta-online-sheet-grip');
const sheetTop=sheet.querySelector('.gta-online-sheet-top');
bindSwipe(dock,-1,openSheet,true);
bindSwipe(sheetGrip,1,minimizeSheet,false);
bindSwipe(sheetTop,1,minimizeSheet,false);

dock.addEventListener('click',event=>{
 if(event.target.closest('.gta-online-dismiss'))return;
 openSheet();
});
dock.addEventListener('keydown',event=>{
 if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.gta-online-dismiss')){
  event.preventDefault();openSheet();
 }
});
[dock,sheet].forEach(root=>root.querySelector('.gta-online-dismiss')?.addEventListener('click',event=>{event.stopPropagation();dismiss()}));
sheet.querySelector('.gta-online-menu-play')?.addEventListener('click',()=>sheet.classList.add('is-leaving'));
iframe.addEventListener('load',()=>{if(iframe.getAttribute('src'))sheet.classList.add('media-ready')});

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

window.addEventListener('pagehide',()=>{
 clearTimeout(loadTimer);
 if(raf)cancelAnimationFrame(raf);
 observer.disconnect();
 stateObserver.disconnect();
 window.removeEventListener('scroll',scheduleSync);
 window.removeEventListener('resize',scheduleSync);
 window.removeEventListener('pageshow',scheduleSync);
 window.removeEventListener('gtav:intro-loader-complete',scheduleSync);
 document.documentElement.classList.remove('gta-online-sheet-open');
 unloadMedia();
},{once:true});
})();
