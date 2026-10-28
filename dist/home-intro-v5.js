(()=>{
'use strict';
if(window.__gtavHomeIntroV5)return;window.__gtavHomeIntroV5=true;
if(document.body?.dataset.page!=='home')return;

const ASSETS=['assets/home-intro-cover-v5.svg','assets/apple.svg'];
const preloadOne=src=>new Promise(resolve=>{const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve(src)};img.onload=finish;img.onerror=finish;img.src=src;if(img.decode)img.decode().then(finish).catch(()=>{});setTimeout(finish,7000)});
Promise.all(ASSETS.map(preloadOne)).then(()=>{window.__gtavHomeIntroAssetsReady=true;window.dispatchEvent(new CustomEvent('gtav:intro-assets-ready',{detail:{count:ASSETS.length}}))});

for(const old of document.querySelectorAll('.home-intro,.home-intro-v2,.home-intro-v3,.home-intro-v4'))old.remove();
const section=document.createElement('section');section.className='home-intro-v5';section.id='intro';section.setAttribute('aria-label','Welcome to the GTA V iOS community');
section.innerHTML=`
 <div class="home-intro-v5-stage">
  <div class="home-intro-v5-announcement">Welcome to our community site</div>
  <div class="home-intro-v5-nav">
   <div class="home-intro-v5-mark" aria-label="GTA V iOS"><svg viewBox="0 0 88 88" aria-hidden="true"><path class="v5-mark-outer" d="M12 12h22l10 30 10-30h22L51 76H37Z"/><path class="v5-mark-inner" d="M27 18h7l10 34 10-34h7"/><path class="v5-mark-base" d="M35 70h18"/></svg></div>
   <div class="home-intro-v5-nav-actions">
    <button type="button" class="home-intro-v5-account" aria-label="Open account profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.7"/><path d="M5 20c.7-4.2 3.1-6.4 7-6.4s6.3 2.2 7 6.4"/></svg></button>
    <button type="button" class="home-intro-v5-menu" aria-label="Open navigation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button>
   </div>
  </div>
  <div class="home-intro-v5-cover-phase">
   <div class="home-intro-v5-cover-stack">
    <div class="home-intro-v5-status">GTA V iOS</div>
    <div class="home-intro-v5-cover" aria-label="GTA V iOS community cover"><img src="assets/home-intro-cover-v5.svg" alt="GTA V iOS community cover" decoding="async"></div>
    <div class="home-intro-v5-brands" aria-label="Apple and Rockstar Games">
     <img class="apple-logo" src="assets/apple.svg" alt="Apple">
     <span class="home-intro-v5-brand-divider" aria-hidden="true"></span>
     <span class="rockstar-wrap"><img class="rockstar-logo" src="https://media-rockstargames-com.akamaized.net/rockstargames-newsite/img/meta-icons/rockstar/favicon.svg" alt="Rockstar Games" referrerpolicy="no-referrer"><span class="rockstar-fallback" aria-hidden="true">R<span>★</span></span></span>
    </div>
    <div class="home-intro-v5-cue" aria-hidden="true"><div class="home-intro-v5-cue-pill">Scroll down</div><div class="home-intro-v5-chevron"></div></div>
   </div>
  </div>
  <div class="home-intro-v5-message-phase"><div class="home-intro-v5-message"><small>The GTA V iOS project</small><h1>Welcome to our<br><span>community site.</span></h1><p>Project updates, compatibility guidance, installation help, community captures and Franklin support — all in one place.</p></div></div>
 </div>`;
const hero=document.querySelector('.home-hero');if(!hero)return;hero.before(section);

document.body.classList.add('intro5-active');
section.querySelector('.home-intro-v5-account')?.addEventListener('click',()=>{const trigger=document.querySelector('.profile-trigger');if(trigger){trigger.click();return}window.gtavIdentity?.open?.()});
section.querySelector('.home-intro-v5-menu')?.addEventListener('click',()=>document.querySelector('.menu-toggle')?.click());
const rstar=section.querySelector('.rockstar-logo');if(rstar){rstar.addEventListener('load',()=>rstar.closest('.rockstar-wrap')?.classList.add('has-logo'));rstar.addEventListener('error',()=>rstar.remove())}

const reveal=()=>{if(document.body.classList.contains('intro5-revealed'))return;requestAnimationFrame(()=>document.body.classList.add('intro5-revealed'))};
if(window.__gtavIntroLoaderComplete)setTimeout(reveal,120);else window.addEventListener('gtav:intro-loader-complete',()=>setTimeout(reveal,120),{once:true});

const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
let ticking=false,last=-1;
function render(){
 ticking=false;
 const rect=section.getBoundingClientRect();const travel=Math.max(1,section.offsetHeight-innerHeight);const p=clamp((-rect.top)/travel);
 if(Math.abs(p-last)<.0009)return;last=p;
 // GTA VI-style rhythm: long poster hold, then controlled expansion toward the viewport,
 // chrome fades away, poster clears, and only then the next editorial statement enters.
 const motion=smooth((p-.46)/.29);
 const coverScale=1+motion*.38;
 const coverY=-motion*138;
 const coverOpacity=1-smooth((p-.70)/.13);
 const chromeOpacity=1-smooth((p-.53)/.17);
 const copyIn=smooth((p-.77)/.13);
 const copyOut=1-smooth((p-.93)/.055);
 const copyOpacity=clamp(copyIn*copyOut);
 const copyY=(1-copyIn)*118-smooth((p-.93)/.055)*30;
 const exit=smooth((p-.975)/.025);
 document.body.style.setProperty('--intro5-cover-scale',coverScale.toFixed(4));
 document.body.style.setProperty('--intro5-cover-y',`${coverY.toFixed(2)}px`);
 document.body.style.setProperty('--intro5-cover-opacity',coverOpacity.toFixed(4));
 document.body.style.setProperty('--intro5-chrome-opacity',chromeOpacity.toFixed(4));
 document.body.style.setProperty('--intro5-copy-opacity',copyOpacity.toFixed(4));
 document.body.style.setProperty('--intro5-copy-y',`${copyY.toFixed(2)}px`);
 document.body.style.setProperty('--intro5-exit',exit.toFixed(4));
 const active=rect.bottom>innerHeight*.10&&exit<.995;document.body.classList.toggle('intro5-active',active);document.body.classList.toggle('intro5-releasing',exit>.08);
}
function schedule(){if(ticking)return;ticking=true;requestAnimationFrame(render)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
try{const u=new URL(location.href);if(u.searchParams.get('intro')==='1'&&!location.hash){history.scrollRestoration='manual';scrollTo(0,0);u.searchParams.delete('intro');history.replaceState(null,'',u.pathname+(u.searchParams.toString()?`?${u.searchParams}`:'')+u.hash)}}catch{}
requestAnimationFrame(()=>{render();requestAnimationFrame(render)});
addEventListener('pagehide',()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule)},{once:true});
})();
