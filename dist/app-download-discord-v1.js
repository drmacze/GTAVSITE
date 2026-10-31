(()=>{
'use strict';
if(window.__appDownloadDiscordV1)return;
window.__appDownloadDiscordV1=true;
const DISCORD='https://discord.gg/HgcbPjcyJ';
const PAGE=document.body?.dataset.page||'';
const APP_PAGES=new Set(['updates','guide','faq','get-started']);
if(!APP_PAGES.has(PAGE))return;

function toDiscord(a,label){
 a.href=DISCORD;a.target='_blank';a.rel='noopener noreferrer';a.classList.add('discord-link');
 if(label){
  const span=a.querySelector('span:not(.icon)');
  if(span&&a.classList.contains('start-resource')){
   const small=span.querySelector('small');span.childNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.remove();});span.append(document.createTextNode(label));if(small)span.prepend(small);
  }else if(!a.querySelector('svg'))a.textContent=label;
 }
}
function audit(root=document){
 root.querySelectorAll?.('a').forEach(a=>{
  const href=a.getAttribute('href')||'';const text=(a.textContent||'').toLowerCase();
  if(/gofile\.io/i.test(href)){toDiscord(a);return;}
  if(PAGE==='updates'&&(a.classList.contains('managed-update-download')||a.classList.contains('updates-download')||(a.closest('.release-download')&&/(download|get app|ios|iphone|ipad|mac)/i.test(text)))){toDiscord(a);return;}
 });
 if(PAGE==='guide'){
  const header=document.querySelector('.guide-heading .discord-link');if(header)toDiscord(header);
  document.querySelectorAll('#installation a.discord-link,#updates a.discord-link').forEach(a=>toDiscord(a));
 }
 if(PAGE==='get-started'){
  const final=document.querySelector('#start-panel-4 .start-resource');if(final){toDiscord(final,'Open Discord release post');const small=final.querySelector('small');if(small)small.textContent='APP DOWNLOAD / SUPPORT';}
 }
}
audit();
const root=document.querySelector('#main')||document.body;
const observer=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n instanceof Element)audit(n)})));
observer.observe(root,{childList:true,subtree:true});
setTimeout(()=>observer.disconnect(),15000);
})();