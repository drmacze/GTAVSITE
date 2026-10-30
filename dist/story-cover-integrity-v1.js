(()=>{
'use strict';
if(window.__storyCoverIntegrityV3)return;
window.__storyCoverIntegrityV3=true;
if(document.body?.dataset.page!=='home')return;

const COVERS={
 vice:'https://cdn.phototourl.com/member/2026-10-30-2ac3266c-508e-45cf-8d6a-885a3776a1d1.jpg',
 liberty:'https://cdn.phototourl.com/member/2026-10-30-4dd8d394-ba44-49cd-88b7-ff99308a3943.jpg'
};
const FALLBACK={
 vice:'assets/story-covers/vice-city-stories.webp',
 liberty:'assets/story-covers/liberty-city-stories.webp'
};

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
 const expected=COVERS[type];
 const image=card.querySelector('.story-showcase-v1-art img');
 if(!image||!expected)return;
 if((image.getAttribute('src')||'')!==expected){
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

function repair(root=document){
 const cards=[];
 if(root instanceof Element&&root.matches('[data-story-card]'))cards.push(root);
 root.querySelectorAll?.('[data-story-card]').forEach(card=>cards.push(card));
 cards.forEach(repairCard);
}

repair();
const observer=new MutationObserver(records=>{
 for(const record of records){
  if(record.type==='attributes'){
   const image=record.target;
   const card=image instanceof Element?image.closest('[data-story-card]'):null;
   if(card)repairCard(card);
   continue;
  }
  record.addedNodes.forEach(node=>{if(node instanceof Element)repair(node)});
 }
});
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
window.addEventListener('pageshow',()=>repair(),{passive:true});
window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
