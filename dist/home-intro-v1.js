(()=>{
'use strict';
if(window.__gtavHomeIntroV1)return;window.__gtavHomeIntroV1=true;
if(document.body?.dataset.page!=='home')return;

const section=document.createElement('section');
section.className='home-intro';section.id='intro';section.setAttribute('aria-label','Welcome to the GTA V iOS community');
section.innerHTML=`
 <div class="home-intro-stage">
  <div class="home-intro-banner">Welcome to our community site</div>
  <div class="home-intro-rail" aria-label="Intro controls">
   <button type="button" class="home-intro-account" aria-label="Open account profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.7"/><path d="M5 20c.7-4.2 3.1-6.4 7-6.4s6.3 2.2 7 6.4"/></svg></button>
   <button type="button" class="home-intro-menu" aria-label="Open navigation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button>
  </div>
  <div class="home-intro-title-above">GTA V iOS</div>
  <div class="home-intro-wrap">
   <div class="home-intro-copy">
    <small>The GTA V iOS project</small>
    <h1>Welcome to<br><span>our community.</span></h1>
    <p>One place for project updates, compatibility, installation help and community captures.</p>
   </div>
   <div class="home-intro-art-wrap">
    <div class="home-intro-art" aria-label="GTA V iOS community cover collage">
     <div class="home-intro-grid" aria-hidden="true">
      <figure><img src="assets/gameplay/preview-4.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/avatars/gas-mask.jpg" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-2.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/avatars/franklin.jpg" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-3.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-1.webp" alt="" decoding="async"></figure>
      <figure><img src="assets/gameplay/preview-5.webp" alt="" decoding="async"></figure>
     </div>
     <span class="home-intro-logo"><img src="assets/gtav-logo.jpeg" alt="Grand Theft Auto V" decoding="async"></span>
    </div>
    <div class="home-intro-platforms" aria-label="Platform and original game creator">
     <span class="apple-mark"><img src="assets/apple.svg" alt="">Apple</span>
     <span class="rockstar-mark" aria-label="Rockstar Games">R<i>★</i></span>
    </div>
   </div>
   <div class="home-intro-meta">
    <span class="meta-label">Community project</span>
    <strong>GTA V on iOS.<br>Built around the community.</strong>
   </div>
  </div>
  <div class="home-intro-scroll">Scroll to explore</div>
 </div>`;

const hero=document.querySelector('.home-hero');
if(!hero)return;hero.before(section);

document.body.classList.add('intro-visible');
const account=section.querySelector('.home-intro-account');
const menu=section.querySelector('.home-intro-menu');
account.addEventListener('click',()=>{const trigger=document.querySelector('.profile-trigger');if(trigger){trigger.click();return}window.gtavIdentity?.open?.()});
menu.addEventListener('click',()=>document.querySelector('.menu-toggle')?.click());

const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
let ticking=false,last=-1;
function render(){
 ticking=false;
 const rect=section.getBoundingClientRect();
 const travel=Math.max(1,section.offsetHeight-innerHeight);
 const p=clamp((-rect.top)/travel);
 if(Math.abs(p-last)<.002)return;last=p;
 const exit=clamp((p-.72)/.28);
 document.body.style.setProperty('--intro-progress',p.toFixed(4));
 document.body.style.setProperty('--intro-exit',exit.toFixed(4));
 document.body.classList.toggle('intro-leaving',exit>.08);
 document.body.classList.toggle('intro-visible',rect.bottom>innerHeight*.22);
 // subtle tile motion, tied to real scroll position rather than a perpetual animation loop
 const tiles=section.querySelectorAll('.home-intro-grid figure');
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  tiles.forEach((tile,i)=>{const direction=i%2?1:-1;const amount=(1-p)*direction*(5+(i%3)*2);tile.style.transform=`translate3d(0,${amount.toFixed(2)}px,0)`});
 }
}
function schedule(){if(ticking)return;ticking=true;requestAnimationFrame(render)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});

// Root entry and explicit intro links should start at the poster. Anchored navigation should not be hijacked.
try{const u=new URL(location.href);if(u.searchParams.get('intro')==='1'&&!location.hash){history.scrollRestoration='manual';scrollTo(0,0);u.searchParams.delete('intro');history.replaceState(null,'',u.pathname+(u.searchParams.toString()?`?${u.searchParams}`:'')+u.hash)}}catch{}
requestAnimationFrame(()=>{render();requestAnimationFrame(render)});

// Once the user reaches the existing home hero, announce the continuous handoff for accessibility.
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){section.setAttribute('aria-hidden','true');hero.removeAttribute('aria-hidden')}else if(scrollY<section.offsetHeight*.8)section.removeAttribute('aria-hidden')}},{threshold:.3});observer.observe(hero);
addEventListener('pagehide',()=>{observer.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule)},{once:true});
})();
