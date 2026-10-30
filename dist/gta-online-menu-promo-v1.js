(()=>{
'use strict';
if(window.__gtaOnlineMenuPromoV1)return;
window.__gtaOnlineMenuPromoV1=true;
if(document.body?.dataset.page!=='home')return;

const SHARE_URL='https://screenapp.io/app/share/HtRxbVRx8lWo-LxRpIfC4Ak8?t=0';
const RELEASE_URL='updates.html#release-2026-10-29';
const menu=document.querySelector('#site-menu');
const panel=menu?.querySelector('.menu-panel');
const nav=panel?.querySelector('.drawer-nav');
if(!menu||!panel||!nav)return;

if(!document.querySelector('link[data-gta-online-menu-promo]')){
 const css=document.createElement('link');
 css.rel='stylesheet';
 css.href='gta-online-menu-promo-v1.css?v=20261030onlinepromo1';
 css.dataset.gtaOnlineMenuPromo='true';
 document.head.append(css);
}

const card=document.createElement('section');
card.className='gta-online-menu-promo';
card.setAttribute('aria-labelledby','gta-online-menu-title');
card.innerHTML=`
 <div class="gta-online-menu-media">
  <div class="gta-online-menu-media-placeholder" aria-hidden="true">
   <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="19"></circle><path d="m20 17 12 7-12 7Z"></path></svg>
   <strong>GTA ONLINE</strong>
  </div>
  <iframe title="GTA Online for GTA V iOS video preview" data-src="${SHARE_URL}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
  <div class="gta-online-menu-media-label" aria-hidden="true"><i></i>VIDEO PREVIEW</div>
  <a class="gta-online-menu-preview-link" href="${SHARE_URL}" target="_blank" rel="noopener noreferrer" aria-label="Open GTA Online video preview in a new tab">
   <span>Open preview</span>
   <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"></path></svg>
  </a>
 </div>
 <div class="gta-online-menu-copy">
  <div class="gta-online-menu-kicker"><span></span>NEW MODE</div>
  <h3 id="gta-online-menu-title">GTA Online</h3>
  <p>A new mode for GTA V iOS. Create your Online character, join sessions with friends, and launch supported Online jobs from the trainer.</p>
  <div class="gta-online-menu-meta">29 OCT BUILD <span></span> iPHONE · iPAD · MAC</div>
  <a class="gta-online-menu-play" href="${RELEASE_URL}" aria-label="Play Now — open the latest GTA Online release">
   <span>Play Now</span>
   <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
  </a>
 </div>`;
nav.insertAdjacentElement('beforebegin',card);

const iframe=card.querySelector('iframe');
let loadTimer=0;
let mediaLoaded=false;

const loadMedia=()=>{
 clearTimeout(loadTimer);
 if(mediaLoaded||!menu.open)return;
 loadTimer=setTimeout(()=>{
  if(mediaLoaded||!menu.open)return;
  const src=iframe.dataset.src;
  if(!src)return;
  mediaLoaded=true;
  iframe.src=src;
 },180);
};

const unloadMedia=()=>{
 clearTimeout(loadTimer);
 if(!mediaLoaded)return;
 mediaLoaded=false;
 card.classList.remove('media-ready');
 iframe.removeAttribute('src');
};

iframe.addEventListener('load',()=>{
 if(menu.open&&iframe.getAttribute('src'))card.classList.add('media-ready');
});

const syncMenuState=()=>{
 if(menu.open)loadMedia();
 else unloadMedia();
};

const observer=new MutationObserver(syncMenuState);
observer.observe(menu,{attributes:true,attributeFilter:['open']});
menu.addEventListener('close',unloadMedia);
card.querySelector('.gta-online-menu-play')?.addEventListener('click',()=>{
 try{if(menu.open)menu.close()}catch{}
});

syncMenuState();
window.addEventListener('pagehide',()=>{
 clearTimeout(loadTimer);
 observer.disconnect();
 unloadMedia();
},{once:true});
})();
