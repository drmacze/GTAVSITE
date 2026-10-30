(()=>{
'use strict';
if(window.__storyCoverIntegrityV2)return;
window.__storyCoverIntegrityV2=true;
if(document.body?.dataset.page!=='home')return;

const FALLBACK={
 vice:'assets/story-covers/vice-city-stories.webp',
 liberty:'assets/story-covers/liberty-city-stories.webp'
};
const PARTS={
 vice:[
  'assets/story-covers/vice.b64.1.txt',
  'assets/story-covers/vice.b64.2.txt',
  'assets/story-covers/vice.b64.3.txt'
 ],
 liberty:[
  'assets/story-covers/liberty.b64.1.txt',
  'assets/story-covers/liberty.b64.2.txt',
  'assets/story-covers/liberty.b64.3.txt'
 ]
};
const COVERS={...FALLBACK};

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
 const current=image.getAttribute('src')||'';
 if(current!==expected){
  image.src=expected;
  image.removeAttribute('srcset');
  image.removeAttribute('referrerpolicy');
 }
 image.loading='eager';
 image.decoding='async';
 image.dataset.storyCover=type;
}

function repair(root=document){
 const cards=[];
 if(root instanceof Element&&root.matches('[data-story-card]'))cards.push(root);
 root.querySelectorAll?.('[data-story-card]').forEach(card=>cards.push(card));
 cards.forEach(repairCard);
}

async function loadHQ(type){
 const files=PARTS[type];
 if(!files)return;
 const chunks=await Promise.all(files.map(async file=>{
  const response=await fetch(file,{cache:'force-cache'});
  if(!response.ok)throw new Error(`Story cover chunk failed: ${file}`);
  return(await response.text()).trim();
 }));
 const base64=chunks.join('');
 if(!base64.startsWith('UklG'))throw new Error(`Invalid ${type} WebP payload`);
 COVERS[type]=`data:image/webp;base64,${base64}`;
 repair();
}

repair();
Promise.allSettled([loadHQ('vice'),loadHQ('liberty')]).then(()=>repair());

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
