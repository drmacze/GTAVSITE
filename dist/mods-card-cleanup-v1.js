(()=>{
'use strict';
if(window.__modsCardCleanupV1)return;
window.__modsCardCleanupV1=true;
if(document.body?.dataset.page!=='downloads')return;

function clean(root=document){
 const cards=[];
 if(root instanceof Element&&root.matches('.library-card'))cards.push(root);
 root.querySelectorAll?.('.library-card').forEach(card=>cards.push(card));
 for(const card of cards){
  const meta=card.querySelector('.library-card-meta');
  if(!meta)continue;
  const children=[...meta.children];
  children.slice(1).forEach(node=>node.remove());
  meta.classList.add('download-count-removed');
 }
}

clean();
const host=document.querySelector('.mods-studio')||document.body;
const observer=new MutationObserver(records=>{
 for(const record of records){
  for(const node of record.addedNodes){if(node instanceof Element)clean(node)}
 }
});
observer.observe(host,{childList:true,subtree:true});
setTimeout(()=>{clean(host);observer.disconnect()},15000);
addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
