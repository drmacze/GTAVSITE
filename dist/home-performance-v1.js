(()=>{
'use strict';
if(window.__homePerformanceV3||document.body?.dataset.page!=='home')return;
window.__homePerformanceV3=true;
const body=document.body;
const ua=navigator.userAgent||'';
const isMac=/Macintosh|Mac OS X/i.test(ua);
const isChrome=/(?:Chrome|CriOS)\//i.test(ua)&&!/Edg\//i.test(ua);
const mobile=matchMedia('(max-width:760px)');
body.classList.add('home-perf-v1');
if(isMac&&isChrome)body.classList.add('perf-chrome-mac');

const sectionObservers=[];
const videoObservers=[];
const watchedSections=new WeakSet();
const watchedVideos=new WeakSet();
let mountObserver=null;
let mountTimer=0;
let tuneTimer=0;
let tuneAttempts=0;
let resizeTimer=0;
let orientationTimer=0;

function watchSection(section){
 if(!section||watchedSections.has(section))return;
 watchedSections.add(section);
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)entry.target.classList.toggle('is-perf-visible',entry.isIntersecting);
 },{rootMargin:'180px 0px 180px 0px',threshold:0});
 observer.observe(section);
 sectionObservers.push(observer);
}

function pauseVideo(video){
 if(!video||video.paused)return;
 video.dataset.perfResume='1';
 try{video.pause()}catch{}
}
function resumeVideo(video){
 if(!video||video.dataset.perfResume!=='1'||document.hidden)return;
 delete video.dataset.perfResume;
 const promise=video.play?.();
 promise?.catch?.(()=>{});
}
function watchVideo(video){
 if(!video||watchedVideos.has(video))return;
 watchedVideos.add(video);
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(entry.isIntersecting&&entry.intersectionRatio>.02)resumeVideo(video);
   else pauseVideo(video);
  }
 },{rootMargin:'100px 0px 100px 0px',threshold:[0,.02,.2]});
 observer.observe(video);
 videoObservers.push(observer);
}

function scan(root=document){
 const sections=[];
 if(root instanceof Element&&root.matches('.home-intro-v5,.story-showcase-v1'))sections.push(root);
 root.querySelectorAll?.('.home-intro-v5,.story-showcase-v1').forEach(node=>sections.push(node));
 sections.forEach(watchSection);
 const videos=[];
 if(root instanceof HTMLVideoElement)videos.push(root);
 root.querySelectorAll?.('video').forEach(video=>videos.push(video));
 videos.forEach(watchVideo);
}

function tuneStoryMotion(){
 tuneAttempts++;
 const gsap=window.gsap;
 const ScrollTrigger=window.ScrollTrigger;
 const trigger=ScrollTrigger?.getById?.('stories-st7');
 if(!gsap||!ScrollTrigger||!trigger){
  if(tuneAttempts<40)tuneTimer=setTimeout(tuneStoryMotion,200);
  return;
 }
 try{
  ScrollTrigger.config({limitCallbacks:true,ignoreMobileResize:true});
  const heading=document.querySelector('.story-st6 .story-showcase-v1-heading');
  if(heading){
   gsap.killTweensOf(heading,'filter');
   heading.style.setProperty('filter','none','important');
  }
  const cards=[...document.querySelectorAll('.story-st6 .story-showcase-v1-card')];
  const images=[...document.querySelectorAll('.story-st6 .story-showcase-v1-art img')];
  gsap.set(cards,{force3D:false,rotation:0});
  gsap.set(images,{force3D:false});
 }catch{}
}

function onVisibility(){
 body.classList.toggle('perf-page-hidden',document.hidden);
 document.querySelectorAll('video').forEach(video=>document.hidden?pauseVideo(video):resumeVideo(video));
}

document.addEventListener('visibilitychange',onVisibility,{passive:true});
scan();
mountObserver=new MutationObserver(records=>{
 for(const record of records){
  for(const node of record.addedNodes)if(node instanceof Element)scan(node);
 }
});
mountObserver.observe(document.body,{childList:true,subtree:true});
mountTimer=setTimeout(()=>{
 mountObserver?.disconnect();
 mountObserver=null;
 scan();
},10000);
tuneStoryMotion();

// Desktop window resizing can change ScrollTrigger geometry. Mobile browser chrome resize must not refresh mid-scroll.
const refreshAfterResize=()=>{
 clearTimeout(resizeTimer);
 resizeTimer=setTimeout(()=>{try{window.ScrollTrigger?.refresh?.()}catch{}},240);
};
const refreshAfterOrientation=()=>{
 clearTimeout(orientationTimer);
 orientationTimer=setTimeout(()=>{try{window.ScrollTrigger?.refresh?.()}catch{}},420);
};
if(!mobile.matches)window.addEventListener('resize',refreshAfterResize,{passive:true});
window.addEventListener('orientationchange',refreshAfterOrientation,{passive:true});

window.addEventListener('pagehide',()=>{
 clearTimeout(mountTimer);
 clearTimeout(tuneTimer);
 clearTimeout(resizeTimer);
 clearTimeout(orientationTimer);
 mountObserver?.disconnect();
 sectionObservers.forEach(observer=>observer.disconnect());
 videoObservers.forEach(observer=>observer.disconnect());
 document.removeEventListener('visibilitychange',onVisibility);
 window.removeEventListener('resize',refreshAfterResize);
 window.removeEventListener('orientationchange',refreshAfterOrientation);
},{once:true});
})();
