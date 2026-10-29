(()=>{
'use strict';
if(window.__gtavModsDescriptionV1)return;window.__gtavModsDescriptionV1=true;

function enhance(description){
 if(!description||description.dataset.readMoreReady==='1')return;
 description.dataset.readMoreReady='1';
 if(!description.textContent.trim())return;
 const wrap=document.createElement('div');wrap.className='library-description-wrap';
 description.parentNode.insertBefore(wrap,description);wrap.append(description);
 description.classList.add('is-collapsible');
 const button=document.createElement('button');button.type='button';button.className='library-description-toggle';button.textContent='Read more';button.setAttribute('aria-expanded','false');button.hidden=true;wrap.append(button);
 const sync=()=>{
   if(description.classList.contains('is-expanded')){button.hidden=false;return;}
   requestAnimationFrame(()=>{button.hidden=description.scrollHeight<=description.clientHeight+2;});
 };
 button.addEventListener('click',()=>{
   const expanded=!description.classList.contains('is-expanded');
   description.classList.toggle('is-expanded',expanded);
   button.textContent=expanded?'Show less':'Read more';
   button.setAttribute('aria-expanded',String(expanded));
   if(!expanded)description.scrollIntoView({block:'nearest',behavior:'smooth'});
 });
 sync();
 if('ResizeObserver'in window)new ResizeObserver(sync).observe(description);
}
function scan(root=document){root.querySelectorAll?.('.library-card-description').forEach(enhance)}
function init(){if(document.body?.dataset.page!=='downloads')return;scan();const target=document.querySelector('.mods-studio')||document.body;new MutationObserver(mutations=>{for(const mutation of mutations){mutation.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.('.library-card-description'))enhance(node);scan(node)})}}).observe(target,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
