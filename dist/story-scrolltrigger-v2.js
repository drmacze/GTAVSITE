(()=>{
'use strict';
if(window.__storyST4||document.body?.dataset.page!=='home')return;
window.__storyST4=true;

const COVER_URLS=[
  'https://cdn.phototourl.com/member/2026-10-28-c1ede1c5-8074-4007-84b0-8914de52aca7.jpg',
  'https://cdn.phototourl.com/member/2026-10-28-15936355-50be-4aaa-ba32-8c767668038c.jpg'
];

function addCss(){
  let link=document.querySelector('link[data-story-st4]');
  if(link)return;
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href='story-scrolltrigger-v2.css?v=20261029st4';
  link.dataset.storySt4='1';
  document.head.append(link);
}

function loadScript(src,test){
  if(test())return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(s=>s.src.includes(src));
    if(existing){
      existing.addEventListener('load',()=>test()?resolve():reject(new Error(src+' loaded without global')),{once:true});
      existing.addEventListener('error',reject,{once:true});
      setTimeout(()=>test()&&resolve(),0);
      return;
    }
    const script=document.createElement('script');
    script.src=src;
    script.async=true;
    script.onload=()=>test()?resolve():reject(new Error(src+' loaded without global'));
    script.onerror=reject;
    document.head.append(script);
  });
}

async function ensureGsap(){
  await loadScript('vendor/gsap-3.13.0.min.js',()=>!!window.gsap);
  await loadScript('vendor/ScrollTrigger-3.13.0.min.js',()=>!!window.ScrollTrigger);
  window.gsap.registerPlugin(window.ScrollTrigger);
}

function waitForStories(){
  return new Promise(resolve=>{
    const find=()=>document.querySelector('.story-showcase-v1');
    const now=find();
    if(now)return resolve(now);
    const root=document.querySelector('main')||document.body;
    const observer=new MutationObserver(()=>{
      const section=find();
      if(!section)return;
      observer.disconnect();
      resolve(section);
    });
    observer.observe(root,{childList:true,subtree:true});
    setTimeout(()=>{observer.disconnect();resolve(find())},12000);
  });
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
  });
}

function setActive(cards,dots,index){
  cards.forEach((card,i)=>{
    card.classList.toggle('is-current',i===index);
    card.classList.toggle('is-active',i===index);
  });
  dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
}

function buildMotion(section){
  const {gsap,ScrollTrigger}=window;
  const inner=section.querySelector('.story-showcase-v1-inner');
  const track=section.querySelector('.story-showcase-v1-track');
  const cards=[...section.querySelectorAll('.story-showcase-v1-card')];
  const dots=[...section.querySelectorAll('.story-showcase-v1-dots i')];
  const images=cards.map(card=>card.querySelector('.story-showcase-v1-art img'));
  const actions=cards.map(card=>card.querySelector('.story-showcase-v1-actions'));
  if(!inner||!track||cards.length<2)return;

  section.classList.add('story-st4','story-st4-ready');
  cards.forEach(card=>card.classList.add('is-visible'));
  setActive(cards,dots,0);

  const mobile=()=>matchMedia('(max-width:760px)').matches;
  const offX=()=>Math.max(innerWidth*0.86,520);

  gsap.set(inner,{opacity:1});
  gsap.set(cards,{xPercent:-50,yPercent:-50,transformOrigin:'50% 50%',force3D:true});
  gsap.set(cards[0],{x:0,y:mobile()?'12vh':'10vh',scale:.78,rotation:-1.4,opacity:0});
  gsap.set(cards[1],{x:offX(),y:mobile()?'5vh':'3vh',scale:.82,rotation:2.2,opacity:0});
  gsap.set(images,{scale:1.14,yPercent:3,force3D:true});
  gsap.set(actions,{opacity:0,y:20,scale:.94});
  gsap.set(dots,{opacity:0});

  const tl=gsap.timeline({
    defaults:{ease:'none'},
    scrollTrigger:{
      trigger:section,
      start:'top top',
      end:'bottom bottom',
      scrub:.62,
      invalidateOnRefresh:true,
      onUpdate:self=>{
        const p=self.progress;
        const index=p<.52?0:1;
        setActive(cards,dots,index);
        section.style.setProperty('--story-progress',p.toFixed(4));
        section.classList.toggle('is-in-view',p>.01&&p<.99);
      }
    }
  });

  tl.to(cards[0],{y:0,scale:1,rotation:0,opacity:1,duration:.15},0)
    .to(images[0],{scale:1.035,yPercent:0,duration:.18},0)
    .to(actions[0],{opacity:1,y:0,scale:1,duration:.08},.08)
    .to(dots,{opacity:1,duration:.06},.08)
    .to(cards[0],{x:()=>-offX(),y:'-2vh',scale:.86,rotation:-2.6,opacity:.2,duration:.26},.32)
    .to(images[0],{xPercent:-5,scale:1.08,duration:.26},.32)
    .to(actions[0],{opacity:0,y:-10,duration:.08},.34)
    .to(cards[1],{x:0,y:0,scale:1,rotation:0,opacity:1,duration:.26},.34)
    .to(images[1],{xPercent:0,yPercent:0,scale:1.035,duration:.26},.34)
    .to(actions[1],{opacity:1,y:0,scale:1,duration:.09},.48)
    .to(cards[1],{scale:1.025,duration:.16},.65)
    .to(images[1],{scale:1,duration:.16},.65)
    .to(cards[1],{y:'-9vh',scale:.93,opacity:.12,duration:.18},.82)
    .to(actions[1],{opacity:0,y:-12,duration:.08},.84)
    .to(dots,{opacity:0,duration:.08},.86)
    .to(inner,{opacity:.15,duration:.14},.86);

  const refresh=()=>ScrollTrigger.refresh();
  images.forEach(image=>{
    if(image&&!image.complete){
      image.addEventListener('load',refresh,{once:true});
      image.addEventListener('error',refresh,{once:true});
    }
  });

  let ro=null;
  if('ResizeObserver'in window){
    let raf=0;
    ro=new ResizeObserver(()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(refresh);
    });
    ro.observe(section);
  }

  requestAnimationFrame(()=>requestAnimationFrame(refresh));
  addEventListener('pageshow',refresh,{once:true});
  addEventListener('pagehide',()=>{
    ro?.disconnect();
    tl.scrollTrigger?.kill();
    tl.kill();
  },{once:true});
}

async function init(){
  addCss();
  document.querySelectorAll('.story-showcase:not(.story-showcase-v1)').forEach(node=>node.remove());
  const section=await waitForStories();
  if(!section)return;
  applyArtwork(section);

  if(matchMedia('(prefers-reduced-motion:reduce)').matches){
    section.classList.add('story-st4','story-st4-ready');
    return;
  }

  try{
    await ensureGsap();
    buildMotion(section);
  }catch(error){
    section.classList.add('story-st4','story-st4-fallback');
    console.warn('[stories] sticky ScrollTrigger fallback',error);
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
