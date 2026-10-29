(()=>{
'use strict';
if(window.__gtavModsPreviewSliderV1)return;
window.__gtavModsPreviewSliderV1=true;
const API='/api/mods';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const uniqueUrls=values=>{const seen=new Set();return (Array.isArray(values)?values:[]).map(x=>String(x||'').trim()).filter(x=>{if(!x||seen.has(x))return false;seen.add(x);return true}).slice(0,12)};
const itemPreviews=item=>uniqueUrls(Array.isArray(item?.previewUrls)&&item.previewUrls.length?item.previewUrls:[item?.imageUrl,item?.preview2Url]);
const arrowSvg=direction=>direction==='prev'?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
let modMap=new Map(),observer=null;

async function loadMods(){
 try{
  const response=await fetch(`${API}?preview=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error();
  const data=await response.json();
  if(Array.isArray(data.mods))modMap=new Map(data.mods.map(item=>[String(item.id),item]));
 }catch{}
}

function decorate(card){
 const id=String(card.dataset.id||'');
 const item=modMap.get(id);
 if(!item)return;
 const previews=itemPreviews(item);
 const media=card.querySelector('.library-media');
 if(!media)return;

 const currentCount=Number(card.dataset.previewSliderCount||0);
 if(card.dataset.previewSliderReady&&currentCount===previews.length)return;
 card.dataset.previewSliderReady='';
 card.dataset.previewSliderCount=String(previews.length);

 if(previews.length<=1){
  media.classList.remove('library-preview-slider');
  media.removeAttribute('data-preview-count');
  card.dataset.previewSliderReady='single';
  return;
 }

 const label=media.querySelector('.media-label')?.outerHTML||'';
 media.classList.add('library-preview-slider');
 media.dataset.previewCount=String(previews.length);
 media.innerHTML=`<div class="library-preview-track" role="group" aria-label="${safe(card.querySelector('h3')?.textContent||'Mod')} previews">${previews.map((url,index)=>`<figure class="library-preview-slide" data-preview="${index}"><img src="${safe(url)}" alt="Preview ${index+1} of ${previews.length}" loading="${index===0?'eager':'lazy'}" decoding="async"></figure>`).join('')}</div>${label}<button class="library-preview-arrow is-prev" type="button" aria-label="Previous preview">${arrowSvg('prev')}</button><button class="library-preview-arrow is-next" type="button" aria-label="Next preview">${arrowSvg('next')}</button><div class="library-preview-dots" aria-label="Choose preview">${previews.map((_,index)=>`<button type="button" data-preview-dot="${index}" aria-label="Show preview ${index+1}"${index===0?' class="is-active"':''}></button>`).join('')}</div><span class="library-preview-count" aria-hidden="true">1 / ${previews.length}</span>`;

 const track=media.querySelector('.library-preview-track');
 const prev=media.querySelector('.is-prev');
 const next=media.querySelector('.is-next');
 const dots=[...media.querySelectorAll('[data-preview-dot]')];
 const counter=media.querySelector('.library-preview-count');
 let index=0,frame=0,lastWidth=0;
 const setIndex=(value,scroll=false)=>{
  index=Math.max(0,Math.min(previews.length-1,value));
  dots.forEach((dot,i)=>{const active=i===index;dot.classList.toggle('is-active',active);dot.setAttribute('aria-current',active?'true':'false')});
  counter.textContent=`${index+1} / ${previews.length}`;
  prev.disabled=index===0;next.disabled=index===previews.length-1;
  if(scroll)track.scrollTo({left:index*track.clientWidth,behavior:reduced?'auto':'smooth'});
 };
 const readScroll=()=>{
  frame=0;
  const width=track.clientWidth||1;
  const nextIndex=Math.round(track.scrollLeft/width);
  if(nextIndex!==index)setIndex(nextIndex,false);
 };
 track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(readScroll)},{passive:true});
 prev.addEventListener('click',()=>setIndex(index-1,true));
 next.addEventListener('click',()=>setIndex(index+1,true));
 dots.forEach(dot=>dot.addEventListener('click',()=>setIndex(Number(dot.dataset.previewDot),true)));
 if('ResizeObserver'in window){
  const resize=new ResizeObserver(()=>{const width=track.clientWidth;if(!width||width===lastWidth)return;lastWidth=width;track.scrollTo({left:index*width,behavior:'auto'})});
  resize.observe(track);
 }
 setIndex(0,false);
 card.dataset.previewSliderReady='slider';
}

function apply(){
 const cards=[...document.querySelectorAll('.library-card[data-id]')];
 if(!cards.length)return false;
 cards.forEach(decorate);
 return true;
}

async function init(){
 await loadMods();
 apply();
 observer=new MutationObserver(()=>apply());
 observer.observe(document.documentElement,{childList:true,subtree:true});
 setTimeout(()=>apply(),1200);
 setTimeout(()=>apply(),3500);
 window.addEventListener('pageshow',async()=>{await loadMods();apply()});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
