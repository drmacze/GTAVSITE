(()=>{
 'use strict';
 if(window.__release27PolishV2)return;
 window.__release27PolishV2=true;
 if(document.body?.dataset.page!=='updates')return;

 const EMOJI=/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u2600-\u27BF]\uFE0F?/gu;
 const cleanText=value=>String(value||'').replace(EMOJI,'').replace(/[ \t]{2,}/g,' ').replace(/\s+([,.;:!?])/g,'$1');

 function cleanNodeText(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
   const next=cleanText(node.nodeValue);
   if(next!==node.nodeValue)node.nodeValue=next;
  });
 }

 function polish(){
  const release=document.getElementById('release-2026-10-27');
  if(!release)return false;
  release.classList.remove('release-27-redesign');
  release.querySelectorAll('.release-intro h2,.release-intro p,.release-callout,.release-part').forEach(cleanNodeText);
  return true;
 }

 if(polish())return;
 const observer=new MutationObserver(()=>{
  if(polish())observer.disconnect();
 });
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
