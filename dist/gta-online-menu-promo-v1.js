(()=>{
'use strict';
if(window.__gtaOnlineMenuPromoV6)return;
window.__gtaOnlineMenuPromoV6=true;
if(document.body?.dataset.page!=='home')return;

const RELEASE_URL='updates.html#release-2026-10-30';
const DISMISS_KEY='gtav-online-promo-dismissed-v1';
const hero=document.querySelector('.home-hero');
if(!hero)return;

if(!document.querySelector('link[data-gta-online-menu-promo]')){
 const css=document.createElement('link');css.rel='stylesheet';css.href='gta-online-menu-promo-v1.css?v=20261030onlinepromo5';css.dataset.gtaOnlineMenuPromo='true';document.head.append(css);
}

const closeIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg>`;
const arrowIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>`;
const platformPills='<span>iOS</span><span>Mac</span>';

const dock=document.createElement('div');
dock.className='gta-online-menu-dock';dock.setAttribute('role','button');dock.tabIndex=0;dock.setAttribute('aria-label','Open GTA Online panel');dock.setAttribute('aria-expanded','false');
dock.innerHTML=`<div class="gta-online-dock-grip" aria-hidden="true"></div><div class="gta-online-dock-copy"><small>NEW MODE</small><strong><span>GTA</span> <em>ONLINE</em></strong></div><div class="gta-online-platforms gta-online-dock-platforms">${platformPills}</div><span class="gta-online-dock-hint">Swipe up</span><button type="button" class="gta-online-dismiss gta-online-dock-dismiss" aria-label="Hide GTA Online panel">${closeIcon}</button>`;

const sheet=document.createElement('aside');
sheet.className='gta-online-menu-promo';sheet.setAttribute('aria-labelledby','gta-online-menu-title');sheet.setAttribute('aria-hidden','true');sheet.setAttribute('data-lenis-prevent','');sheet.inert=true;
sheet.innerHTML=`
 <div class="gta-online-sheet-grip" aria-hidden="true"><span></span></div>
 <div class="gta-online-sheet-top">
  <div class="gta-online-sheet-heading"><small>NEW MODE</small><div class="gta-online-sheet-title-row"><h3 id="gta-online-menu-title"><span class="gta-online-title-gta">GTA</span> <span class="gta-online-title-online">ONLINE</span></h3><div class="gta-online-platforms">${platformPills}</div></div><p>GTA Online for supported iOS, iPadOS & macOS builds</p></div>
  <button type="button" class="gta-online-dismiss gta-online-sheet-dismiss" aria-label="Hide GTA Online panel">${closeIcon}</button>
 </div>
 <div class="gta-online-menu-body">
  <div class="gta-online-menu-media" role="group" aria-label="GTA Online preview">
   <div class="gta-online-menu-media-placeholder"><div class="gta-online-menu-playmark"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20"></circle><path d="m20 16.5 13 7.5-13 7.5Z"></path></svg></div><span>GTA ONLINE</span><small>Tap to preview</small></div>
   <div class="gta-online-menu-media-frame"></div>
   <div class="gta-online-menu-media-shade" aria-hidden="true"></div>
  </div>
  <div class="gta-online-menu-copy"><p class="gta-online-menu-description">Explore GTA Online sessions, interiors, persistent weapons and the latest Trainer improvements.</p><div class="gta-online-menu-footer"><span class="gta-online-menu-note">30 Oct release · iPhone, iPad & Apple silicon Mac</span><a class="gta-online-menu-play" href="${RELEASE_URL}" aria-label="Read the 30 Oct GTA Online release"><span>Release notes</span>${arrowIcon}</a></div></div>
 </div>`;

document.body.append(dock,sheet);
const onboarding=document.querySelector('#onboarding-dialog');
const menu=document.querySelector('#site-menu');
let bootReady=false,available=false,opened=false,dismissed=false,raf=0;
try{dismissed=sessionStorage.getItem(DISMISS_KEY)==='1'}catch{}

const syncUi=()=>{
 const showDock=available&&!opened&&!dismissed;
 const showSheet=available&&opened&&!dismissed;
 dock.classList.toggle('is-visible',showDock);dock.setAttribute('aria-hidden',showDock?'false':'true');dock.setAttribute('aria-expanded',showSheet?'true':'false');
 sheet.classList.toggle('is-open',showSheet);sheet.setAttribute('aria-hidden',showSheet?'false':'true');sheet.inert=!showSheet;
 document.documentElement.classList.toggle('gta-online-sheet-open',showSheet);
};
const openSheet=()=>{if(!available||dismissed)return;opened=true;dock.style.transform='';sheet.style.transform='';syncUi()};
const minimizeSheet=()=>{opened=false;sheet.style.transform='';dock.style.transform='';syncUi()};
const dismiss=()=>{dismissed=true;opened=false;try{sessionStorage.setItem(DISMISS_KEY,'1')}catch{}dock.classList.remove('is-visible');sheet.classList.remove('is-open');dock.setAttribute('aria-hidden','true');sheet.setAttribute('aria-hidden','true');sheet.inert=true;document.documentElement.classList.remove('gta-online-sheet-open')};

const mainMenuVisible=()=>{
 if(!bootReady||dismissed)return false;
 const rect=hero.getBoundingClientRect();const viewport=Math.max(document.documentElement.clientHeight||0,innerHeight||0);
 const heroVisible=rect.bottom>viewport*.08&&rect.top<viewport*.88;
 const intro=document.querySelector('.home-intro-v5');const introRect=intro?.getBoundingClientRect();
 const introBlocking=document.body.classList.contains('intro5-active')||Boolean(introRect&&introRect.bottom>viewport*.12);
 const onboardingOpen=Boolean(onboarding?.open);const helperOpen=!!document.querySelector('.ask-franklin-panel.is-open,.ask-franklin-panel.is-chat-open');const menuOpen=Boolean(menu?.open);
 return heroVisible&&!introBlocking&&!onboardingOpen&&!helperOpen&&!menuOpen;
};
const syncVisibility=()=>{raf=0;const next=mainMenuVisible();if(available!==next){available=next;if(!available&&opened)opened=false}syncUi()};
const scheduleSync=()=>{if(!raf)raf=requestAnimationFrame(syncVisibility)};

function bindSwipe(surface,direction,action,isDock=false){
 let gesture=null;surface.style.touchAction='none';
 const finish=event=>{if(!gesture)return;const dy=event.clientY-gesture.y,dx=Math.abs(event.clientX-gesture.x),delta=dy*direction;surface.releasePointerCapture?.(event.pointerId);dock.style.transform='';sheet.style.transform='';surface.classList.remove('is-dragging');if(delta>(isDock?22:42)&&delta>dx*1.15)action();gesture=null};
 surface.addEventListener('pointerdown',event=>{if(event.button!==undefined&&event.button!==0||event.target.closest('button,a'))return;gesture={x:event.clientX,y:event.clientY};surface.setPointerCapture?.(event.pointerId);surface.classList.add('is-dragging')});
 surface.addEventListener('pointermove',event=>{if(!gesture)return;const dy=event.clientY-gesture.y,dx=Math.abs(event.clientX-gesture.x);if(Math.abs(dy)<4||Math.abs(dy)<dx)return;if(isDock){const lift=Math.max(-34,Math.min(0,dy));dock.style.transform=matchMedia('(max-width:760px)').matches?`translateY(${lift}px)`:`translate(-50%,${lift}px)`}else{sheet.style.transform=`translateY(${Math.max(0,Math.min(150,dy))}px)`}});
 surface.addEventListener('pointerup',finish);surface.addEventListener('pointercancel',finish);
}

bindSwipe(dock,-1,openSheet,true);
bindSwipe(sheet.querySelector('.gta-online-sheet-grip'),1,minimizeSheet,false);
bindSwipe(sheet.querySelector('.gta-online-sheet-top'),1,minimizeSheet,false);
dock.addEventListener('click',event=>{if(!event.target.closest('.gta-online-dismiss'))openSheet()});
dock.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.gta-online-dismiss')){event.preventDefault();openSheet()}});
[dock,sheet].forEach(root=>root.querySelector('.gta-online-dismiss')?.addEventListener('click',event=>{event.stopPropagation();dismiss()}));
sheet.querySelector('.gta-online-menu-play')?.addEventListener('click',()=>sheet.classList.add('is-leaving'));

const heroObserver=new IntersectionObserver(scheduleSync,{threshold:[0,.02,.12,.4]});heroObserver.observe(hero);
const bodyObserver=new MutationObserver(scheduleSync);bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
const menuObserver=menu?new MutationObserver(scheduleSync):null;menuObserver?.observe(menu,{attributes:true,attributeFilter:['open']});
const onboardingObserver=onboarding?new MutationObserver(scheduleSync):null;onboardingObserver?.observe(onboarding,{attributes:true,attributeFilter:['open']});
window.addEventListener('scroll',scheduleSync,{passive:true});
if(matchMedia('(max-width:760px)').matches)window.addEventListener('orientationchange',scheduleSync,{passive:true});else window.addEventListener('resize',scheduleSync,{passive:true});
document.addEventListener('click',scheduleSync,{passive:true});
window.addEventListener('pageshow',scheduleSync,{passive:true});window.addEventListener('gtav:intro-loader-complete',scheduleSync,{passive:true});
setTimeout(()=>{bootReady=true;scheduleSync()},320);setTimeout(scheduleSync,900);

window.addEventListener('pagehide',()=>{
 if(raf)cancelAnimationFrame(raf);heroObserver.disconnect();bodyObserver.disconnect();menuObserver?.disconnect();onboardingObserver?.disconnect();
 window.removeEventListener('scroll',scheduleSync);window.removeEventListener('resize',scheduleSync);window.removeEventListener('orientationchange',scheduleSync);document.removeEventListener('click',scheduleSync);window.removeEventListener('pageshow',scheduleSync);window.removeEventListener('gtav:intro-loader-complete',scheduleSync);document.documentElement.classList.remove('gta-online-sheet-open');
},{once:true});
})();
