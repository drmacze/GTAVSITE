(()=>{
'use strict';
if(window.__storyST6||document.body?.dataset.page!=='home')return;
window.__storyST6=true;

const COVER_URLS=[
  'https://cdn.phototourl.com/member/2026-10-28-c1ede1c5-8074-4007-84b0-8914de52aca7.jpg',
  'https://cdn.phototourl.com/member/2026-10-28-15936355-50be-4aaa-ba32-8c767668038c.jpg'
];
const FALLBACK_URLS=[
  'assets/story-covers/vice-city-stories.webp',
  'assets/story-covers/liberty-city-stories.webp'
];
const DISCORD_URL='https://discord.gg/HgcbPjcyJ';

function addCss(){
  if(document.getElementById('story-scrolltrigger-v3-style'))return;
  const link=document.createElement('link');
  link.id='story-scrolltrigger-v3-style';
  link.rel='stylesheet';
  link.href='story-scrolltrigger-v3.css?v=20261029st7';
  document.head.append(link);
}

function storyMarkup(){
  return `
  <div class="story-showcase-v1-inner">
   <div class="story-showcase-v1-heading" aria-label="Play another port version">
    <h2><span>Play another</span><span>port version</span></h2>
    <i class="story-showcase-v1-heading-line" aria-hidden="true"></i>
   </div>
   <div class="story-showcase-v1-track" role="region" aria-label="Grand Theft Auto Stories covers">
    <article class="story-showcase-v1-card is-current" data-story-card aria-label="Grand Theft Auto Vice City Stories">
     <div class="story-showcase-v1-aura" aria-hidden="true"></div>
     <div class="story-showcase-v1-art"><img src="${COVER_URLS[0]}" alt="Grand Theft Auto Vice City Stories cover" loading="eager" decoding="async" referrerpolicy="no-referrer"></div>
     <div class="story-showcase-v1-actions"><a class="story-showcase-v1-get" href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer" aria-label="Get Vice City Stories on Discord"><span>Get</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a></div>
    </article>
    <article class="story-showcase-v1-card" data-story-card aria-label="Grand Theft Auto Liberty City Stories">
     <div class="story-showcase-v1-aura" aria-hidden="true"></div>
     <div class="story-showcase-v1-art"><img src="${COVER_URLS[1]}" alt="Grand Theft Auto Liberty City Stories cover" loading="eager" decoding="async" referrerpolicy="no-referrer"></div>
     <div class="story-showcase-v1-actions"><a class="story-showcase-v1-get" href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer" aria-label="Get Liberty City Stories on Discord"><span>Get</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a></div>
    </article>
   </div>
   <div class="story-showcase-v1-dots" aria-hidden="true"><i class="is-active"></i><i></i></div>
  </div>`;
}

function enhanceExisting(section){
  section.classList.add('story-st6');
  const inner=section.querySelector('.story-showcase-v1-inner');
  if(inner&&!inner.querySelector('.story-showcase-v1-heading')){
    const heading=document.createElement('div');
    heading.className='story-showcase-v1-heading';
    heading.setAttribute('aria-label','Play another port version');
    heading.innerHTML='<h2><span>Play another</span><span>port version</span></h2><i class="story-showcase-v1-heading-line" aria-hidden="true"></i>';
    inner.prepend(heading);
  }
  section.querySelectorAll('.story-showcase-v1-card').forEach(card=>{
    if(!card.querySelector('.story-showcase-v1-aura')){
      const aura=document.createElement('div');
      aura.className='story-showcase-v1-aura';
      aura.setAttribute('aria-hidden','true');
      card.prepend(aura);
    }
  });
  return section;
}

function createStories(anchor){
  const existing=document.querySelector('.story-showcase-v1');
  if(existing)return enhanceExisting(existing);
  const section=document.createElement('section');
  section.className='story-showcase-v1 story-st6';
  section.id='stories';
  section.setAttribute('aria-label','Grand Theft Auto Stories collection');
  section.innerHTML=storyMarkup();
  if(anchor?.parentNode)anchor.after(section);
  else{
    const hero=document.querySelector('.home-hero');
    if(hero?.parentNode)hero.before(section);
    else(document.querySelector('main')||document.body).append(section);
  }
  return section;
}

function ensureStories(){
  return new Promise(resolve=>{
    const existing=document.querySelector('.story-showcase-v1');
    if(existing)return resolve(enhanceExisting(existing));
    const intro=document.querySelector('.home-intro-v4,.home-intro-v5');
    if(intro)return resolve(createStories(intro));
    const root=document.querySelector('main')||document.body;
    const observer=new MutationObserver(()=>{
      const found=document.querySelector('.home-intro-v4,.home-intro-v5');
      if(!found)return;
      observer.disconnect();
      resolve(createStories(found));
    });
    observer.observe(root,{childList:true,subtree:true});
    setTimeout(()=>{
      observer.disconnect();
      const late=document.querySelector('.home-intro-v4,.home-intro-v5');
      resolve(createStories(late||null));
    },5000);
  });
}

function loadScript(src,test){
  if(test())return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const absolute=new URL(src,location.href).href;
    const existing=[...document.scripts].find(script=>script.src===absolute||script.src.includes(src));
    if(existing){
      if(test())return resolve();
      existing.addEventListener('load',()=>test()?resolve():reject(new Error(src+' loaded without global')),{once:true});
      existing.addEventListener('error',()=>reject(new Error('Failed to load '+src)),{once:true});
      setTimeout(()=>test()&&resolve(),0);
      return;
    }
    const script=document.createElement('script');
    script.src=src;
    script.async=true;
    script.onload=()=>test()?resolve():reject(new Error(src+' loaded without global'));
    script.onerror=()=>reject(new Error('Failed to load '+src));
    document.head.append(script);
  });
}

async function ensureGsap(){
  await loadScript('vendor/gsap-3.13.0.min.js',()=>!!window.gsap);
  await loadScript('vendor/ScrollTrigger-3.13.0.min.js',()=>!!window.ScrollTrigger);
  window.gsap.registerPlugin(window.ScrollTrigger);
}

function setActive(cards,dots,index){
  cards.forEach((card,i)=>{
    card.classList.toggle('is-current',i===index);
    card.classList.toggle('is-active',i===index);
  });
  dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
}

function applyArtwork(section){
  const images=[...section.querySelectorAll('.story-showcase-v1-art img')];
  images.forEach((image,index)=>{
    if(!COVER_URLS[index])return;
    image.src=COVER_URLS[index];
    image.removeAttribute('srcset');
    image.loading='eager';
    image.decoding='async';
    image.referrerPolicy='no-referrer';
    image.addEventListener('error',()=>{
      if(image.dataset.fallbackApplied)return;
      image.dataset.fallbackApplied='1';
      image.src=FALLBACK_URLS[index];
    },{once:true});
  });
}

function buildMotion(section){
  const {gsap,ScrollTrigger}=window;
  const inner=section.querySelector('.story-showcase-v1-inner');
  const heading=section.querySelector('.story-showcase-v1-heading');
  const headingLine=section.querySelector('.story-showcase-v1-heading-line');
  const cards=[...section.querySelectorAll('.story-showcase-v1-card')];
  const dots=[...section.querySelectorAll('.story-showcase-v1-dots i')];
  const images=cards.map(card=>card.querySelector('.story-showcase-v1-art img'));
  const actions=cards.map(card=>card.querySelector('.story-showcase-v1-actions'));
  const auras=cards.map(card=>card.querySelector('.story-showcase-v1-aura'));
  if(!inner||cards.length<2)return;

  section.classList.add('story-st6','story-st6-ready');
  cards.forEach(card=>card.classList.add('is-visible'));
  setActive(cards,dots,0);

  ScrollTrigger.getAll().filter(trigger=>trigger.trigger===section).forEach(trigger=>trigger.kill(true));
  gsap.killTweensOf([inner,heading,headingLine,...cards,...images.filter(Boolean),...actions.filter(Boolean),...auras.filter(Boolean)]);

  const mobile=()=>matchMedia('(max-width:760px)').matches;
  const offX=()=>Math.max(innerWidth*(mobile()?.92:.82),mobile()?560:680);

  gsap.set(inner,{opacity:1});
  gsap.set(heading,{opacity:0,y:32,scale:.975,filter:'blur(9px)',transformOrigin:'50% 50%'});
  gsap.set(headingLine,{opacity:0,scaleX:.12,transformOrigin:'50% 50%'});
  gsap.set(cards,{xPercent:-50,yPercent:-50,transformOrigin:'50% 50%',force3D:true});
  gsap.set(cards[0],{x:0,y:mobile()?'10vh':'8vh',scale:.82,rotation:-1.2,opacity:.82});
  gsap.set(cards[1],{x:offX(),y:mobile()?'4vh':'2vh',scale:.84,rotation:2.2,opacity:0});
  gsap.set(images,{scale:1.12,yPercent:2.5,force3D:true});
  gsap.set(actions,{opacity:0,y:20,scale:.94});
  gsap.set(auras,{opacity:0,scale:.94});
  gsap.set(dots,{opacity:.4});

  const tl=gsap.timeline({paused:true,defaults:{ease:'none'}});
  tl
    .to(heading,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.12},0)
    .to(headingLine,{opacity:1,scaleX:1,duration:.16},.015)
    .to(cards[0],{y:mobile()?'3vh':'2vh',scale:1,rotation:0,opacity:1,duration:.13},0)
    .to(images[0],{scale:1.025,yPercent:0,duration:.15},0)
    .to(auras[0],{opacity:.9,scale:1,duration:.14},.01)
    .to(actions[0],{opacity:1,y:0,scale:1,duration:.075},.055)
    .to(dots,{opacity:1,duration:.06},.055)
    .to(cards[0],{scale:1.015,duration:.10},.20)
    .to(images[0],{scale:1.01,duration:.10},.20)
    .to(cards[0],{x:()=>-offX(),y:'-1vh',scale:.86,rotation:-2.4,opacity:.18,duration:.27},.31)
    .to(images[0],{xPercent:-5,scale:1.075,duration:.27},.31)
    .to(auras[0],{opacity:.12,scale:.9,duration:.24},.31)
    .to(actions[0],{opacity:0,y:-10,duration:.075},.32)
    .to(cards[1],{x:0,y:mobile()?'3vh':'2vh',scale:1,rotation:0,opacity:1,duration:.27},.31)
    .to(images[1],{xPercent:0,yPercent:0,scale:1.025,duration:.27},.31)
    .to(auras[1],{opacity:.9,scale:1,duration:.24},.34)
    .to(actions[1],{opacity:1,y:0,scale:1,duration:.085},.45)
    .to(cards[1],{scale:1.018,duration:.14},.62)
    .to(images[1],{scale:1,duration:.14},.62)
    .to(heading,{opacity:.9,y:-5,duration:.12},.62)
    .to(cards[1],{y:'-8vh',scale:.93,rotation:.5,opacity:.15,duration:.18},.82)
    .to(auras[1],{opacity:0,scale:.88,duration:.17},.82)
    .to(actions[1],{opacity:0,y:-12,duration:.08},.83)
    .to(heading,{opacity:0,y:-24,filter:'blur(7px)',duration:.12},.84)
    .to(headingLine,{opacity:0,scaleX:.28,duration:.10},.85)
    .to(dots,{opacity:0,duration:.08},.87)
    .to(inner,{opacity:.12,duration:.13},.87);

  const trigger=ScrollTrigger.create({
    id:'stories-st7',
    trigger:section,
    start:'top top',
    end:'bottom bottom',
    scrub:true,
    invalidateOnRefresh:true,
    animation:tl,
    onEnter:()=>section.classList.add('is-in-view'),
    onEnterBack:()=>section.classList.add('is-in-view'),
    onLeave:()=>section.classList.remove('is-in-view'),
    onLeaveBack:()=>section.classList.remove('is-in-view'),
    onUpdate:self=>{
      const p=self.progress;
      setActive(cards,dots,p<.50?0:1);
      section.style.setProperty('--story-progress',p.toFixed(4));
    }
  });

  const sync=()=>{
    ScrollTrigger.refresh();
    tl.progress(trigger.progress,false);
  };
  tl.progress(trigger.progress,false);
  images.forEach(image=>{
    if(image&&!image.complete){
      image.addEventListener('load',sync,{once:true});
      image.addEventListener('error',sync,{once:true});
    }
  });
  requestAnimationFrame(()=>requestAnimationFrame(sync));
  addEventListener('pageshow',sync,{once:true});
  addEventListener('pagehide',()=>{
    trigger.kill();
    tl.kill();
  },{once:true});
}

async function init(){
  addCss();
  document.querySelectorAll('.story-showcase:not(.story-showcase-v1)').forEach(node=>node.remove());
  const section=await ensureStories();
  if(!section)return;
  applyArtwork(section);

  if(matchMedia('(prefers-reduced-motion:reduce)').matches){
    section.classList.add('story-st6','story-st6-fallback');
    return;
  }

  try{
    await ensureGsap();
    buildMotion(section);
  }catch(error){
    section.classList.add('story-st6','story-st6-fallback');
    console.warn('[stories-st7] fallback',error);
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
