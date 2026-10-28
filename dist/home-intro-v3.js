(()=>{
'use strict';
if(window.__gtavHomeIntroV3)return;window.__gtavHomeIntroV3=true;
if(document.body?.dataset.page!=='home')return;

const ASSETS=[
 'assets/community-mark.svg','assets/gameplay/preview-4.webp','assets/avatars/gas-mask.jpg','assets/gameplay/preview-2.webp',
 'assets/avatars/franklin.jpg','assets/gameplay/preview-3.webp','assets/gameplay/preview-1.webp','assets/gameplay/preview-5.webp',
 'assets/gtav-logo.jpeg','assets/apple.svg'
];
const preloadOne=src=>new Promise(resolve=>{const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve(src)};img.onload=finish;img.onerror=finish;img.src=src;if(img.decode)img.decode().then(finish).catch(()=>{});setTimeout(finish,6000)});
Promise.all(ASSETS.map(preloadOne)).then(()=>{window.__gtavHomeIntroAssetsReady=true;window.dispatchEvent(new CustomEvent('gtav:intro-assets-ready',{detail:{count:ASSETS.length}}))});

for(const old of document.querySelectorAll('.home-intro,.home-intro-v2'))old.remove();
const section=document.createElement('section');section.className='home-intro-v3';section.id='intro';section.setAttribute('aria-label','Welcome to the GTA V iOS community');
section.innerHTML=`
 <div class="home-intro-v3-stage">
  <div class="home-intro-v3-announcement">Welcome to our community site</div>
  <div class="home-intro-v3-nav">
   <div class="home-intro-v3-mark" aria-label="GTA V iOS"><img src="assets/community-mark.svg" alt=""></div>
   <div class="home-intro-v3-nav-actions">
    <button type="button" class="home-intro-v3-account" aria-label="Open account profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.7"/><path d="M5 20c.7-4.2 3.1-6.4 7-6.4s6.3 2.2 7 6.4"/></svg></button>
    <button type="button" class="home-intro-v3-menu" aria-label="Open navigation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button>
   </div>
  </div>
  <div class="home-intro-v3-status"><span>GTA V</span><small>iOS</small></div>
  <div class="home-intro-v3-cover-phase">
   <div class="home-intro-v3-cover-stack">
    <div class="home-intro-v3-cover" aria-label="GTA V iOS community cover">
     <div class="home-intro-v3-grid" aria-hidden="true">
      <figure><img src="assets/gameplay/preview-4.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/avatars/gas-mask.jpg" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-2.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/avatars/franklin.jpg" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-3.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-1.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-5.webp" alt="" decoding="async"></figure>
     </div>
     <span class="home-intro-v3-logo"><img src="assets/gtav-logo.jpeg" alt="Grand Theft Auto V" decoding="async"></span>
    </div>
    <div class="home-intro-v3-brands" aria-label="Apple and Rockstar Games">
     <img class="apple-logo" src="assets/apple.svg" alt="Apple">
     <span class="home-intro-v3-brand-divider" aria-hidden="true"></span>
     <img class="rockstar-logo" src="https://media-rockstargames-com.akamaized.net/rockstargames-newsite/img/meta-icons/rockstar/favicon.svg" alt="Rockstar Games" referrerpolicy="no-referrer">
    </div>
   </div>
  </div>
  <div class="home-intro-v3-cue" aria-hidden="true"><div class="home-intro-v3-cue-pill">Scroll down</div><div class="home-intro-v3-chevron"></div></div>
  <div class="home-intro-v3-message-phase">
   <div class="home-intro-v3-message">
    <small>The GTA V iOS project</small>
    <h1>Welcome to our<br><span>community site.</span></h1>
    <p>Project updates, compatibility guidance, installation help, community captures and Franklin support — all in one place.</p>
   </div>
  </div>
 </div>`;
const hero=document.querySelector('.home-hero');if(!hero)return;hero.before(section);

document.body.classList.add('intro3-active');
const rstar=section.querySelector('.rockstar-logo');rstar?.addEventListener('error',()=>{if(rstar.dataset.fallback)return;rstar.dataset.fallback='1';rstar.src='https://upload.wikimedia.org/wikipedia/commons/f/fa/Rockstar_Games.svg'});
section.querySelector('.home-intro-v3-account')?.addEventListener('click',()=>{const trigger=document.querySelector('.profile-trigger');if(trigger){trigger.click();return}window.gtavIdentity?.open?.()});
section.querySelector('.home-intro-v3-menu')?.addEventListener('click',()=>document.querySelector('.menu-toggle')?.click());

const reveal=()=>{if(document.body.classList.contains('intro3-revealed'))return;requestAnimationFrame(()=>document.body.classList.add('intro3-revealed'))};
if(window.__gtavIntroLoaderComplete)reveal();else window.addEventListener('gtav:intro-loader-complete',reveal,{once:true});

const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const ease=t=>1-Math.pow(1-clamp(t),3);
let ticking=false,last=-1;
function render(){
 ticking=false;
 const rect=section.getBoundingClientRect();const travel=Math.max(1,section.offsetHeight-innerHeight);const p=clamp((-rect.top)/travel);
 if(Math.abs(p-last)<.0015)return;last=p;
 // Closely mirror the reference rhythm: hold the poster, then enlarge/lift it away,
 // then bring the welcome statement into the same stage before handing off to Home.
 const coverOut=ease((p-.30)/.26);const coverScale=1+coverOut*.18;const coverY=-coverOut*72;const coverOpacity=1-ease((p-.48)/.16);
 const copyIn=ease((p-.50)/.18);const copyOut=1-ease((p-.84)/.14);const copyOpacity=clamp(copyIn*copyOut);const copyY=(1-copyIn)*72-ease((p-.84)/.14)*28;
 const exit=ease((p-.92)/.08);
 document.body.style.setProperty('--intro3-cover-scale',coverScale.toFixed(4));
 document.body.style.setProperty('--intro3-cover-y',`${coverY.toFixed(2)}px`);
 document.body.style.setProperty('--intro3-cover-opacity',coverOpacity.toFixed(4));
 document.body.style.setProperty('--intro3-copy-opacity',copyOpacity.toFixed(4));
 document.body.style.setProperty('--intro3-copy-y',`${copyY.toFixed(2)}px`);
 document.body.style.setProperty('--intro3-exit',exit.toFixed(4));
 const controlsFade=1-ease((p-.40)/.16);section.querySelector('.home-intro-v3-announcement')?.style.setProperty('opacity',controlsFade.toFixed(3));section.querySelector('.home-intro-v3-nav')?.style.setProperty('opacity',controlsFade.toFixed(3));section.querySelector('.home-intro-v3-status')?.style.setProperty('opacity',(controlsFade*coverOpacity).toFixed(3));section.querySelector('.home-intro-v3-cue')?.style.setProperty('opacity',(controlsFade*coverOpacity).toFixed(3));
 const active=rect.bottom>innerHeight*.12&&exit<.995;document.body.classList.toggle('intro3-active',active);document.body.classList.toggle('intro3-releasing',exit>.1);
}
function schedule(){if(ticking)return;ticking=true;requestAnimationFrame(render)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
try{const u=new URL(location.href);if(u.searchParams.get('intro')==='1'&&!location.hash){history.scrollRestoration='manual';scrollTo(0,0);u.searchParams.delete('intro');history.replaceState(null,'',u.pathname+(u.searchParams.toString()?`?${u.searchParams}`:'')+u.hash)}}catch{}
requestAnimationFrame(()=>{render();requestAnimationFrame(render)});
addEventListener('pagehide',()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule)},{once:true});
})();
