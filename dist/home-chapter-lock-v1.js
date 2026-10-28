(()=>{
'use strict';
if(window.__gtavHomeChapterLockV1||document.body?.dataset.page!=='home')return;
window.__gtavHomeChapterLockV1=true;

const body=document.body;
const hero=document.querySelector('.home-hero');
if(!hero)return;
let locked=false;
let raf=0;

function iconUse(name){
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;
}

function convertHeroCTA(){
  const cta=document.querySelector('.home-actions .button.primary');
  if(!cta)return;
  const alreadyGetStarted=!cta.classList.contains('discord-link')&&cta.getAttribute('href')==='get-started.html'&&cta.querySelector('.home-chapter-cta-label')?.textContent==='Get Started';
  if(alreadyGetStarted)return;
  cta.classList.remove('discord-link');
  cta.href='get-started.html';
  cta.removeAttribute('target');
  cta.removeAttribute('rel');
  cta.setAttribute('aria-label','Get Started');
  cta.innerHTML=`<span class="home-chapter-cta-label">Get Started</span>${iconUse('arrow-right')}`;
}

function installAccountButton(){
  const actions=document.querySelector('.site-header .header-actions');
  if(!actions||actions.querySelector('.home-header-account'))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='home-header-account';
  button.setAttribute('aria-label','Open account profile');
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.7"/><path d="M5 20c.7-4.2 3.1-6.4 7-6.4s6.3 2.2 7 6.4"/></svg>';
  button.addEventListener('click',()=>{
    const trigger=document.querySelector('.profile-trigger');
    if(trigger){trigger.click();return;}
    if(window.gtavIdentity?.open){window.gtavIdentity.open();return;}
    document.querySelector('.home-intro-v4-account')?.click();
  });
  const menu=actions.querySelector('.menu-toggle');
  actions.insertBefore(button,menu||null);
}

function finishChapter(){
  if(locked)return;
  locked=true;
  body.classList.add('home-chapter-locked');
  body.classList.remove('intro4-active','intro4-releasing');

  try{
    const trigger=window.ScrollTrigger?.getById?.('stories-st6');
    trigger?.kill?.(true);
  }catch{}

  // The previous cinematic chapter is intentionally removed from layout after completion.
  // This makes the transition one-way and avoids iOS rubber-band returning to ScrollTrigger.
  requestAnimationFrame(()=>{
    scrollTo({top:0,left:0,behavior:'auto'});
    requestAnimationFrame(()=>scrollTo({top:0,left:0,behavior:'auto'}));
  });
  window.dispatchEvent(new CustomEvent('gtav:home-chapter-locked'));
}

function checkChapter(){
  raf=0;
  if(locked)return;
  const rect=hero.getBoundingClientRect();
  // Only commit once the next chapter has actually reached the viewport.
  if(rect.top<=2&&rect.bottom>innerHeight*.35&&scrollY>40)finishChapter();
}

function schedule(){
  if(locked)return;
  if(!raf)raf=requestAnimationFrame(checkChapter);
}

convertHeroCTA();
installAccountButton();

// Run again after async community config so the Discord loader can never restore this hero CTA.
addEventListener('load',()=>{convertHeroCTA();installAccountButton();schedule()},{once:true});
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});

// Mutation-safe: Stories/intro are dynamically mounted by the Home bootstrap.
const observer=new MutationObserver(()=>{
  convertHeroCTA();
  installAccountButton();
  schedule();
});
observer.observe(document.body,{childList:true,subtree:true});
setTimeout(()=>observer.disconnect(),8000);

schedule();
addEventListener('pagehide',()=>{
  removeEventListener('scroll',schedule);
  removeEventListener('resize',schedule);
  if(raf)cancelAnimationFrame(raf);
  observer.disconnect();
},{once:true});
})();
