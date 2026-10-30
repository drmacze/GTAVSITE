(()=>{
'use strict';
if(window.__storyCoverIntegrityV1)return;
window.__storyCoverIntegrityV1=true;
if(document.body?.dataset.page!=='home')return;

const COVERS={
 vice:'assets/story-covers/vice-city-stories.webp',
 liberty:'assets/story-covers/liberty-city-stories.webp'
};

function expectedFor(card){
 const label=(card?.getAttribute('aria-label')||'').toLowerCase();
 if(label.includes('liberty city stories'))return COVERS.liberty;
 if(label.includes('vice city stories'))return COVERS.vice;
 return'';
}

function repairCard(card){
 if(!(card instanceof Element))return;
 const expected=expectedFor(card);
 if(!expected)return;
 const image=card.querySelector('.story-showcase-v1-art img');
 if(!image)return;
 const current=image.getAttribute('src')||'';
 if(current!==expected){
  image.src=expected;
  image.removeAttribute('srcset');
  image.removeAttribute('referrerpolicy');
 }
 image.loading='eager';
 image.decoding='async';
 image.dataset.storyCover=expected===COVERS.liberty?'liberty':'vice';
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
