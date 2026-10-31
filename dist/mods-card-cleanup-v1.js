(()=>{
'use strict';
if(window.__modsCardCleanupV3)return;
window.__modsCardCleanupV3=true;
if(document.body?.dataset.page!=='downloads')return;

const isDownloadCount=node=>{
 if(!(node instanceof HTMLElement))return false;
 if(node.matches('button,a,[role="button"],.mod-share-button,.content-bookmark-button,.content-actions'))return false;
 const text=(node.textContent||'').replace(/\s+/g,' ').trim();
 return /^\d+\s+downloads?$/i.test(text);
};

function clean(root=document){
 const cards=[];
 if(root instanceof Element&&root.matches('.library-card'))cards.push(root);
 root.querySelectorAll?.('.library-card').forEach(card=>cards.push(card));
 for(const card of cards){
  card.querySelectorAll('span').forEach(span=>{
   if(isDownloadCount(span))span.remove();
  });
 }
}

clean();
const host=document.querySelector('.mods-studio')||document.body;
let idleTimer=0;
const observer=new MutationObserver(records=>{
 let changed=false;
 for(const record of records){
  for(const node of record.addedNodes){
   if(node instanceof Element){clean(node);changed=true;}
  }
 }
 if(changed){
  clearTimeout(idleTimer);
  idleTimer=setTimeout(()=>observer.disconnect(),3500);
 }
});
observer.observe(host,{childList:true,subtree:true});
idleTimer=setTimeout(()=>{clean(host);observer.disconnect()},10000);
addEventListener('pagehide',()=>{clearTimeout(idleTimer);observer.disconnect()},{once:true});
})();
