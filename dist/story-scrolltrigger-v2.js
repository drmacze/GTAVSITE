(()=>{
'use strict';
if(window.__storyST3||document.body?.dataset.page!=='home')return;
window.__storyST3=true;

const VICE='https://cdn.phototourl.com/member/2026-10-28-c1ede1c5-8074-4007-84b0-8914de52aca7.jpg';
const LIBERTY='https://cdn.phototourl.com/member/2026-10-28-15936355-50be-4aaa-ba32-8c767668038c.jpg';
const COVER_URLS=[VICE,LIBERTY];

const addCss=()=>{
  if(document.querySelector('link[data-story-st3]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='story-scrolltrigger-v2.css?v=20261029st3';
  link.dataset.storySt3='1';
  document.head.append(link);
};

const loadScript=src=>new Promise((resolve,reject)=>{
  const existing=[...document.scripts].find(node=>node.src.includes(src));
  if(existing){
    if((src.includes('gsap')&&window.gsap)||(src.includes('ScrollTrigger')&&window.ScrollTrigger))return resolve();
    existing.addEventListener('load',resolve,{once:true});
    existing.addEventListener('error',reject,{once:true});
    return;
  }
  const script=document.createElement('script');
  script.src=src;
  script.onload=resolve;
  script.onerror=reject;
  document.head.append(script);
});

const ensureGsap=async()=>{
  if(!window.gsap)await loadScript('vendor/gsap-3.13.0.min.js');
  if(!window.ScrollTrigger)await loadScript('vendor/ScrollTrigger-3.13.0.min.js');
  if(!window.gsap||!window.ScrollTrigger)throw new Error('GSAP ScrollTrigger unavailable');
  window.gsap.registerPlugin(window.ScrollTrigger);
};

const waitForStories=()=>new Promise(resolve=>{
  const find=()=>document.querySelector('.story-showcase-v1');
  const current=find();
  if(current)return resolve(current);
  const root=document.querySelector('main')||document.body;
  const observer=new MutationObserver(()=>{
    const section=find();
    if(!section)return;
    observer.disconnect();
    resolve(section);
  });
  observer.observe(root,{childList:true,subtree:true});
  setTimeout(()=>{
    observer.disconnect();
    resolve(find());
  },8000);
});

const applyArtwork=section=>{
  const images=[...section.querySelectorAll('.story-showcase-v1-art img')];
  COVER_URLS.forEach((src,index)=>{
    const image=images[index];
    if(!image)return;
    image.src=src;
    image.removeAttribute('srcset');
    image.loading='eager';
    image.decoding='async';
    image.referrerPolicy='no-referrer';
  });
};

const setActive=(cards,dots,index)=>{
  cards.forEach((card,i)=>card.classList.toggle('is-current',i===index));
  dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
};

const buildMotion=section=>{
  const gsap=window.gsap;
  const ScrollTrigger=window.ScrollTrigger;
  const track=section.querySelector('.story-showcase-v1-track');
  const inner=section.querySelector('.story-showcase-v1-inner');
  const cards=[...section.querySelectorAll('.story-showcase-v1-card')];
  const dots=[...section.querySelectorAll('.story-showcase-v1-dots i')];
  const images=cards.map(card=>card.querySelector('img'));
  const actions=[...section.querySelectorAll('.story-showcase-v1-actions')];
  if(!track||!inner||cards.length<2)return;

  section.classList.add('story-st2','story-st2-ready');
  cards.forEach(card=>card.classList.add('is-visible'));
  setActive(cards,dots,0);

  const isMobile=()=>matchMedia('(max-width:760px)').matches;
  const travel=()=>Math.max(0,track.scrollWidth-section.clientWidth);

  gsap.set(inner,{opacity:.28,scale:.965,y:isMobile()?'7vh':'5vh',transformOrigin:'50% 50%'});
  gsap.set(track,{x:0,y:isMobile()?'22vh':'16vh'});
  gsap.set(cards,{scale:isMobile()?.84:.9,opacity:.34,transformOrigin:'50% 50%'});
  gsap.set(cards[0],{opacity:1,scale:isMobile()?.93:.96});
  gsap.set(images,{scale:1.12,yPercent:4});
  gsap.set(actions,{opacity:0,y:24,scale:.96});

  const timeline=gsap.timeline({
    defaults:{ease:'none'},
    scrollTrigger:{
      trigger:section,
      start:'top top',
      end:()=>`+=${Math.round(innerHeight*(isMobile()?2.55:2.25))}`,
      pin:true,
      pinSpacing:true,
      scrub:.68,
      anticipatePin:1,
      invalidateOnRefresh:true,
      onUpdate:self=>{
        const index=self.progress<.57?0:1;
        setActive(cards,dots,index);
        section.style.setProperty('--story-progress',self.progress.toFixed(4));
      }
    }
  });

  timeline
    .to(inner,{opacity:1,scale:1,y:0,duration:.16},0)
    .to(track,{y:0,duration:.18},0)
    .to(cards,{scale:1,opacity:1,duration:.18,stagger:.018},0)
    .to(images,{scale:1.045,yPercent:0,duration:.22,stagger:.015},0)
    .to(actions,{opacity:1,y:0,scale:1,duration:.12,stagger:.02},.07)
    .to(track,{x:()=>-travel(),duration:.62},.18)
    .to(cards[0],{scale:isMobile()?.91:.945,opacity:.58,duration:.34},.38)
    .fromTo(cards[1],{scale:isMobile()?.92:.955,opacity:.72},{scale:1,opacity:1,duration:.34,immediateRender:false},.4)
    .to(images[0],{xPercent:-4,duration:.42},.28)
    .fromTo(images[1],{xPercent:4},{xPercent:0,duration:.42,immediateRender:false},.4)
    .to(inner,{scale:.992,y:isMobile()?'-2.5vh':'-1.5vh',duration:.14},.84)
    .to(section,{filter:'brightness(.94)',duration:.12},.87);

  const refresh=()=>ScrollTrigger.refresh();
  images.forEach(image=>{
    if(image&&!image.complete){
      image.addEventListener('load',refresh,{once:true});
      image.addEventListener('error',refresh,{once:true});
    }
  });

  const resizeObserver='ResizeObserver'in window?new ResizeObserver(refresh):null;
  resizeObserver?.observe(section);
  requestAnimationFrame(refresh);

  addEventListener('pagehide',()=>{
    resizeObserver?.disconnect();
    timeline.scrollTrigger?.kill();
    timeline.kill();
  },{once:true});
};

const init=async()=>{
  addCss();
  document.querySelectorAll('.story-showcase:not(.story-showcase-v1)').forEach(node=>node.remove());
  const section=await waitForStories();
  if(!section)return;
  applyArtwork(section);

  if(matchMedia('(prefers-reduced-motion:reduce)').matches){
    section.classList.add('story-st2','story-st2-ready');
    return;
  }

  try{
    await ensureGsap();
    buildMotion(section);
  }catch(error){
    section.classList.remove('story-st2','story-st2-ready');
    console.warn('[stories] ScrollTrigger fallback',error);
  }
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
