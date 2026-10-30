(()=>{
'use strict';
if(window.__storyCoverIntegrityV4)return;
window.__storyCoverIntegrityV4=true;
if(document.body?.dataset.page!=='home')return;

const COVERS={
 vice:'https://cdn.phototourl.com/member/2026-10-30-2ac3266c-508e-45cf-8d6a-885a3776a1d1.jpg',
 liberty:'https://cdn.phototourl.com/member/2026-10-30-4dd8d394-ba44-49cd-88b7-ff99308a3943.jpg'
};
const FALLBACK={
 vice:'assets/story-covers/vice-city-stories.webp',
 liberty:'assets/story-covers/liberty-city-stories.webp'
};
let sectionObserver=null;
let mountObserver=null;
let settleTimer=0;

function typeFor(card){
 const label=(card?.getAttribute('aria-label')||'').toLowerCase();
 if(label.includes('liberty city stories'))return'liberty';
 if(label.includes('vice city stories'))return'vice';
 return'';
}

function repairCard(card){
 if(!(card instanceof Element))return;
 const type=typeFor(card);
 if(!type)return;
 const image=card.querySelector('.story-showcase-v1-art img');
 if(!image)return;
 const expected=COVERS[type];
 if((image.getAttribute('src')||'')!==expected&&image.dataset.storyFallback!=='1'){
  image.src=expected;
  image.removeAttribute('srcset');
  image.removeAttribute('referrerpolicy');
 }
 image.loading='eager';
 image.decoding='async';
 image.dataset.storyCover=type;
 image.onerror=()=>{
  if(image.dataset.storyFallback==='1')return;
  image.dataset.storyFallback='1';
  image.src=FALLBACK[type];
 };
}

function repair(section){
 section?.querySelectorAll?.('[data-story-card]').forEach(repairCard);
}

function observeSection(section){
 if(!section)return false;
 mountObserver?.disconnect();
 mountObserver=null;
 sectionObserver?.disconnect();
 repair(section);
 sectionObserver=new MutationObserver(records=>{
  let needsRepair=false;
  for(const record of records){
   if(record.type==='attributes'){needsRepair=true;break}
   if(record.addedNodes.length){needsRepair=true;break}
  }
  if(needsRepair)repair(section);
 });
 sectionObserver.observe(section,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
 clearTimeout(settleTimer);
 // Other home scripts finish mounting quickly. Stop observing after the carousel has settled.
 settleTimer=setTimeout(()=>{
  repair(section);
  sectionObserver?.disconnect();
  sectionObserver=null;
 },12000);
 return true;
}

function boot(){
 const section=document.querySelector('.story-showcase-v1');
 if(observeSection(section))return;
 mountObserver=new MutationObserver(()=>{
  const mounted=document.querySelector('.story-showcase-v1');
  if(mounted)observeSection(mounted);
 });
 mountObserver.observe(document.body,{childList:true,subtree:true});
 setTimeout(()=>mountObserver?.disconnect(),12000);
}

boot();
window.addEventListener('pageshow',()=>{
 const section=document.querySelector('.story-showcase-v1');
 if(section)repair(section);
},{passive:true});
window.addEventListener('pagehide',()=>{
 clearTimeout(settleTimer);
 sectionObserver?.disconnect();
 mountObserver?.disconnect();
},{once:true});
})();
