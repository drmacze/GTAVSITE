(()=>{
'use strict';
if(window.__gtavHomeIntroV2)return;window.__gtavHomeIntroV2=true;
if(document.body?.dataset.page!=='home')return;

const ASSETS=[
 'assets/gameplay/preview-4.webp','assets/avatars/gas-mask.jpg','assets/gameplay/preview-2.webp',
 'assets/avatars/franklin.jpg','assets/gameplay/preview-3.webp','assets/gameplay/preview-1.webp',
 'assets/gameplay/preview-5.webp','assets/gtav-logo.jpeg','assets/apple.svg'
];
const preloadOne=src=>new Promise(resolve=>{const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve(src)};img.onload=finish;img.onerror=finish;img.src=src;if(img.decode)img.decode().then(finish).catch(()=>{});setTimeout(finish,6500)});
const readyPromise=Promise.all(ASSETS.map(preloadOne)).then(()=>{window.__gtavHomeIntroAssetsReady=true;window.dispatchEvent(new CustomEvent('gtav:intro-assets-ready',{detail:{count:ASSETS.length}}))});

const old=document.querySelector('.home-intro');if(old)old.remove();
const section=document.createElement('section');section.className='home-intro-v2';section.id='intro';section.setAttribute('aria-label','Welcome to the GTA V iOS community');
section.innerHTML=`
 <div class="home-intro-v2-stage">
  <div class="home-intro-v2-controls" aria-label="Intro controls">
   <button type="button" class="home-intro-v2-account" aria-label="Open account profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.7"/><path d="M5 20c.7-4.2 3.1-6.4 7-6.4s6.3 2.2 7 6.4"/></svg></button>
   <button type="button" class="home-intro-v2-menu" aria-label="Open navigation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button>
  </div>
  <div class="home-intro-v2-cover-phase">
   <div class="home-intro-v2-cover-stack">
    <p class="home-intro-v2-kicker">GTA V iOS</p>
    <div class="home-intro-v2-cover" aria-label="GTA V iOS community cover">
     <div class="home-intro-v2-grid" aria-hidden="true">
      <figure><img src="assets/gameplay/preview-4.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/avatars/gas-mask.jpg" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-2.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/avatars/franklin.jpg" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-3.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-1.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-5.webp" alt="" decoding="async"></figure>
     </div>
     <span class="home-intro-v2-logo"><img src="assets/gtav-logo.jpeg" alt="Grand Theft Auto V" decoding="async"></span>
    </div>
    <div class="home-intro-v2-platforms" aria-label="Platform and original game creator">
     <span class="apple-mark"><img src="assets/apple.svg" alt="">Apple</span><span class="home-intro-v2-divider" aria-hidden="true"></span><span class="rockstar-mark" aria-label="Rockstar Games">R<i>★</i></span>
    </div>
   </div>
  </div>
  <div class="home-intro-v2-message-phase">
   <div class="home-intro-v2-message">
    <small>The GTA V iOS project</small>
    <h1>Welcome to our<br><span>community site.</span></h1>
    <p>Project updates, compatibility guidance, installation help, community captures and Franklin support — all in one place.</p>
   </div>
  </div>
  <div class="home-intro-v2-scroll">Scroll to explore</div>
 </div>`;
const hero=document.querySelector('.home-hero');if(!hero)return;hero.before(section);

document.body.classList.add('intro2-active');
section.querySelector('.home-intro-v2-account').addEventListener('click',()=>{const trigger=document.querySelector('.profile-trigger');if(trigger){trigger.click();return}window.gtavIdentity?.open?.()});
section.querySelector('.home-intro-v2-menu').addEventListener('click',()=>document.querySelector('.menu-toggle')?.click());

const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const ease=t=>1-Math.pow(1-clamp(t),3);
let ticking=false,last=-1;
function render(){
 ticking=false;
 const rect=section.getBoundingClientRect();const travel=Math.max(1,section.offsetHeight-innerHeight);const p=clamp((-rect.top)/travel);
 if(Math.abs(p-last)<.0015)return;last=p;
 const coverIn=ease(p/.19),coverOut=1-ease((p-.44)/.2),coverOpacity=clamp(coverIn*coverOut);
 const coverScale=.86+.14*coverIn+.055*ease((p-.42)/.25);const coverY=(1-coverIn)*34-ease((p-.44)/.24)*54;
 const messageIn=ease((p-.50)/.18),messageOut=1-ease((p-.84)/.16),messageOpacity=clamp(messageIn*messageOut);const messageY=(1-messageIn)*76-ease((p-.84)/.16)*34;
 const exit=ease((p-.92)/.08);
 document.body.style.setProperty('--intro2-cover-opacity',coverOpacity.toFixed(4));
 document.body.style.setProperty('--intro2-cover-scale',coverScale.toFixed(4));
 document.body.style.setProperty('--intro2-cover-y',`${coverY.toFixed(2)}px`);
 document.body.style.setProperty('--intro2-message-opacity',messageOpacity.toFixed(4));
 document.body.style.setProperty('--intro2-message-y',`${messageY.toFixed(2)}px`);
 document.body.style.setProperty('--intro2-exit',exit.toFixed(4));
 const active=rect.bottom>innerHeight*.15&&exit<.995;document.body.classList.toggle('intro2-active',active);document.body.classList.toggle('intro2-releasing',exit>.12);
}
function schedule(){if(ticking)return;ticking=true;requestAnimationFrame(render)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});

try{const u=new URL(location.href);if(u.searchParams.get('intro')==='1'&&!location.hash){history.scrollRestoration='manual';scrollTo(0,0);u.searchParams.delete('intro');history.replaceState(null,'',u.pathname+(u.searchParams.toString()?`?${u.searchParams}`:'')+u.hash)}}catch{}
requestAnimationFrame(()=>{render();requestAnimationFrame(render)});
readyPromise.catch(()=>window.dispatchEvent(new CustomEvent('gtav:intro-assets-ready',{detail:{count:0}})));
addEventListener('pagehide',()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule)},{once:true});
})();
