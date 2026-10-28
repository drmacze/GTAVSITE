(()=>{
'use strict';
if(window.__gtavHomeIntroV4)return;window.__gtavHomeIntroV4=true;
if(document.body?.dataset.page!=='home')return;

const ASSETS=[
 'assets/gameplay/preview-4.webp','assets/avatars/gas-mask.jpg','assets/gameplay/preview-2.webp',
 'assets/avatars/franklin.jpg','assets/gameplay/preview-3.webp','assets/gameplay/preview-1.webp','assets/gameplay/preview-5.webp',
 'assets/gtav-logo.jpeg','assets/apple.svg'
];
const preloadOne=src=>new Promise(resolve=>{const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve(src)};img.onload=finish;img.onerror=finish;img.src=src;if(img.decode)img.decode().then(finish).catch(()=>{});setTimeout(finish,6500)});
Promise.all(ASSETS.map(preloadOne)).then(()=>{window.__gtavHomeIntroAssetsReady=true;window.dispatchEvent(new CustomEvent('gtav:intro-assets-ready',{detail:{count:ASSETS.length}}))});

for(const old of document.querySelectorAll('.home-intro,.home-intro-v2,.home-intro-v3,.home-intro-v5'))old.remove();
const section=document.createElement('section');
section.className='home-intro-v4';section.id='intro';section.setAttribute('aria-label','Welcome to the GTA V iOS community');
section.innerHTML=`
 <div class="home-intro-v4-stage">
  <div class="home-intro-v4-announcement">Welcome to our community site</div>
  <div class="home-intro-v4-nav">
   <div class="home-intro-v4-mark" aria-label="GTA V iOS"><svg viewBox="0 0 88 88" aria-hidden="true"><path class="v4-mark-outer" d="M12 12h22l10 30 10-30h22L51 76H37Z"/><path class="v4-mark-inner" d="M27 18h7l10 34 10-34h7"/><path class="v4-mark-base" d="M35 70h18"/></svg></div>
   <div class="home-intro-v4-nav-actions">
    <button type="button" class="home-intro-v4-account" aria-label="Open account profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.7"/><path d="M5 20c.7-4.2 3.1-6.4 7-6.4s6.3 2.2 7 6.4"/></svg></button>
    <button type="button" class="home-intro-v4-menu" aria-label="Open navigation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button>
   </div>
  </div>
  <div class="home-intro-v4-cover-phase">
   <div class="home-intro-v4-cover-stack">
    <div class="home-intro-v4-status">GTA V IOS</div>
    <div class="home-intro-v4-cover" aria-label="GTA V iOS community cover">
     <div class="home-intro-v4-grid" aria-hidden="true">
      <figure><img src="assets/gameplay/preview-4.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/avatars/gas-mask.jpg" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-2.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/avatars/franklin.jpg" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-3.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-1.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-5.webp" alt="" decoding="async"></figure>
     </div>
     <span class="home-intro-v4-logo"><img src="assets/gtav-logo.jpeg" alt="Grand Theft Auto V" decoding="async"></span>
    </div>
    <div class="home-intro-v4-brands" aria-label="Apple and Rockstar Games">
     <img class="apple-logo" src="assets/apple.svg" alt="Apple">
     <span class="home-intro-v4-brand-divider" aria-hidden="true"></span>
     <span class="rockstar-wrap">
      <img class="rockstar-logo" src="https://media-rockstargames-com.akamaized.net/rockstargames-newsite/img/meta-icons/rockstar/favicon.svg" alt="Rockstar Games" referrerpolicy="no-referrer">
      <span class="rockstar-fallback" aria-hidden="true">R<span>★</span></span>
     </span>
    </div>
    <div class="home-intro-v4-cue" aria-hidden="true"><div class="home-intro-v4-cue-pill">Scroll down</div><div class="home-intro-v4-chevron"></div></div>
   </div>
  </div>
  <div class="home-intro-v4-message-phase"><div class="home-intro-v4-message"><small>The GTA V iOS project</small><h1>Welcome to our<br><span>community site.</span></h1><p>Project updates, compatibility guidance, installation help, community captures and Franklin support — all in one place.</p></div></div>
 </div>`;
const hero=document.querySelector('.home-hero');if(!hero)return;hero.before(section);

document.body.classList.add('intro4-active');
section.querySelector('.home-intro-v4-account')?.addEventListener('click',()=>{const trigger=document.querySelector('.profile-trigger');if(trigger){trigger.click();return}window.gtavIdentity?.open?.()});
section.querySelector('.home-intro-v4-menu')?.addEventListener('click',()=>document.querySelector('.menu-toggle')?.click());
const rstar=section.querySelector('.rockstar-logo');if(rstar){rstar.addEventListener('load',()=>rstar.closest('.rockstar-wrap')?.classList.add('has-logo'));rstar.addEventListener('error',()=>rstar.remove())}

const reveal=()=>{if(document.body.classList.contains('intro4-revealed'))return;requestAnimationFrame(()=>document.body.classList.add('intro4-revealed'))};
if(window.__gtavIntroLoaderComplete)setTimeout(reveal,180);else window.addEventListener('gtav:intro-loader-complete',()=>setTimeout(reveal,180),{once:true});

const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const smoother=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10)};
let currentProgress=0,targetProgress=0,raf=0,lastRendered=-1;
function computeTarget(){const rect=section.getBoundingClientRect();const travel=Math.max(1,section.offsetHeight-innerHeight);targetProgress=clamp((-rect.top)/travel)}
function paint(p){
 if(Math.abs(p-lastRendered)<.00035)return;lastRendered=p;
 // GTA VI-like cadence: long hold, then a soft scrubbed lift/scale, then poster fade, then copy.
 const motion=smoother((p-.49)/.27);
 const coverScale=1+motion*.14;
 const coverY=-motion*86;
 const chromeOpacity=1-smoother((p-.59)/.16);
 const coverOpacity=1-smoother((p-.69)/.16);
 const copyIn=smoother((p-.80)/.12);
 const copyOut=1-smoother((p-.94)/.045);
 const copyOpacity=clamp(copyIn*copyOut);
 const copyY=(1-copyIn)*78-smoother((p-.94)/.045)*22;
 const exit=smoother((p-.975)/.025);
 document.body.style.setProperty('--intro4-cover-scale',coverScale.toFixed(5));
 document.body.style.setProperty('--intro4-cover-y',`${coverY.toFixed(2)}px`);
 document.body.style.setProperty('--intro4-cover-opacity',coverOpacity.toFixed(5));
 document.body.style.setProperty('--intro4-chrome-opacity',chromeOpacity.toFixed(5));
 document.body.style.setProperty('--intro4-copy-opacity',copyOpacity.toFixed(5));
 document.body.style.setProperty('--intro4-copy-y',`${copyY.toFixed(2)}px`);
 document.body.style.setProperty('--intro4-exit',exit.toFixed(5));
 const rect=section.getBoundingClientRect();const active=rect.bottom>innerHeight*.10&&exit<.995;
 document.body.classList.toggle('intro4-active',active);document.body.classList.toggle('intro4-releasing',exit>.08)
}
function scrub(){
 const delta=targetProgress-currentProgress;
 currentProgress+=delta*.105;
 if(Math.abs(delta)<.00045)currentProgress=targetProgress;
 paint(currentProgress);
 if(Math.abs(targetProgress-currentProgress)>.00045)raf=requestAnimationFrame(scrub);else raf=0;
}
function schedule(){computeTarget();if(!raf)raf=requestAnimationFrame(scrub)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
try{const u=new URL(location.href);if(u.searchParams.get('intro')==='1'&&!location.hash){history.scrollRestoration='manual';scrollTo(0,0);u.searchParams.delete('intro');history.replaceState(null,'',u.pathname+(u.searchParams.toString()?`?${u.searchParams}`:'')+u.hash)}}catch{}
computeTarget();currentProgress=targetProgress;requestAnimationFrame(()=>paint(currentProgress));
addEventListener('pagehide',()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule);if(raf)cancelAnimationFrame(raf)},{once:true});
})();
