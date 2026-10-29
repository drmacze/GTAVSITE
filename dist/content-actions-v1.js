(()=>{
'use strict';
if(window.__gtavContentActionsV1)return;window.__gtavContentActionsV1=true;

const path=(location.pathname||'').replace(/\/+$/,'');
const onUpdates=path.endsWith('/updates')||path.endsWith('/updates.html');
const onMods=path.endsWith('/downloads')||path.endsWith('/downloads.html');
if(!onUpdates&&!onMods)return;

if(!document.querySelector('link[href*="content-actions-v1.css"]')){
 const link=document.createElement('link');
 link.rel='stylesheet';
 link.href='/content-actions-v1.css?v=20261030savedmods';
 document.head.append(link);
}

const SHARE_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M5 11v7a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-7"/></svg>';
const BOOKMARK_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.75A1.75 1.75 0 0 1 8.75 3h6.5A1.75 1.75 0 0 1 17 4.75V21l-5-3.3L7 21Z"/></svg>';
const CHEVRON_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5"/></svg>';
const BOOKMARK_KEY='gtav-saved-mods-v1';

function pulse(type='tap'){try{window.gtavHaptics?.trigger?.(type)}catch{}}
function copyText(value){
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(value);
 return new Promise((resolve,reject)=>{try{const input=document.createElement('textarea');input.value=value;input.setAttribute('readonly','');input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();document.execCommand('copy');input.remove();resolve()}catch(error){reject(error)}});
}
function feedback(button,label,ms=1400){
 const original=button.getAttribute('aria-label')||label;
 button.classList.add('is-confirmed');
 button.setAttribute('aria-label',label);
 button.title=label;
 setTimeout(()=>{button.classList.remove('is-confirmed');button.setAttribute('aria-label',original);button.title=original},ms);
}

async function shareRelease(article,button){
 const title=(article.querySelector('h3')||article.querySelector('h2'))?.textContent?.trim()||'GTA V iOS release note';
 const summary=article.querySelector('.managed-update-summary,.release-intro p')?.textContent?.trim()||'GTA V iOS release notes';
 const url=new URL(location.href);url.search='';url.hash=article.id||'';
 try{
  pulse('medium');
  if(navigator.share){await navigator.share({title,text:summary,url:url.href});return}
  await copyText(url.href);feedback(button,'Link copied');
 }catch(error){if(error?.name==='AbortError')return;try{await copyText(url.href);feedback(button,'Link copied')}catch{}}
}
function makeShareButton(article){
 if(article.querySelector(':scope .release-share-action'))return;
 const button=document.createElement('button');button.type='button';button.className='content-action release-share-action';button.innerHTML=SHARE_ICON;button.setAttribute('aria-label','Share release');button.title='Share release';
 button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();shareRelease(article,button)});
 if(article.matches('.managed-update-card')){
  const meta=article.querySelector('.managed-update-meta');if(meta)meta.append(button);else article.prepend(button);
 }else{
  const summary=article.querySelector('.release-card>summary');
  const chevron=summary?.querySelector('.release-chevron');
  if(summary){if(chevron)summary.insertBefore(button,chevron);else summary.append(button)}
 }
}
function mountReleaseShares(){
 document.querySelectorAll('.managed-update-card[id],.release-entry[id]').forEach(makeShareButton);
}

function readBookmarks(){try{const value=JSON.parse(localStorage.getItem(BOOKMARK_KEY)||'[]');return new Set(Array.isArray(value)?value.map(String):[])}catch{return new Set()}}
function writeBookmarks(saved){try{localStorage.setItem(BOOKMARK_KEY,JSON.stringify([...saved]));return true}catch{return false}}
let bookmarks=readBookmarks();
function bookmarkId(card,index=0){return String(card.dataset.id||card.id||card.querySelector('h3,h2')?.textContent||`mod-${index}`).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||`mod-${index}`}
function syncBookmark(button,id,title){
 const saved=bookmarks.has(id);button.classList.toggle('is-saved',saved);button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',saved?`Remove ${title} from saved mods`:`Save ${title}`);button.title=saved?'Saved':'Save';button.dataset.bookmarkId=id;
}
function syncAllBookmarkButtons(){
 document.querySelectorAll('.mod-bookmark-action[data-bookmark-id]').forEach(button=>{
  const card=button.closest('.library-card,#mods .mod-editorial,.dlc-pack,#graphics .awesomekills-card');
  const title=card?.querySelector('h3,h2,strong')?.textContent?.trim()||'mod';
  syncBookmark(button,button.dataset.bookmarkId,title);
 });
}
function makeBookmarkButton(card,index){
 if(card.querySelector(':scope .mod-bookmark-action'))return;
 const id=bookmarkId(card,index),title=card.querySelector('h3,h2')?.textContent?.trim()||'mod';
 const button=document.createElement('button');button.type='button';button.className='content-action mod-bookmark-action';button.innerHTML=BOOKMARK_ICON;syncBookmark(button,id,title);
 button.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  if(bookmarks.has(id))bookmarks.delete(id);else bookmarks.add(id);
  writeBookmarks(bookmarks);syncBookmark(button,id,title);syncAllBookmarkButtons();renderSavedMods(true);pulse(bookmarks.has(id)?'success':'tap');
 });
 const meta=card.querySelector('.library-card-meta');
 if(meta){
  let actions=meta.querySelector('.library-card-meta-actions');
  if(!actions){actions=document.createElement('span');actions.className='library-card-meta-actions';const children=[...meta.children];const countNode=children[1]||null;if(countNode)actions.append(countNode);meta.append(actions)}
  const share=actions.querySelector('.mod-share-button');if(share)actions.insertBefore(button,share);else actions.append(button);return;
 }
 const legacyHeader=card.querySelector('.glass-card-topline,.dlc-pack-summary,.awesomekills-meta,.mod-editorial');
 if(legacyHeader)legacyHeader.append(button);else card.prepend(button);
}
function mountModBookmarks(){
 const library=[...document.querySelectorAll('.library-card')];
 if(library.length){library.forEach(makeBookmarkButton);return}
 const legacy=[...document.querySelectorAll('#mods .mod-editorial,.dlc-pack,#graphics .awesomekills-card')];legacy.forEach(makeBookmarkButton);
}

function setPlatformLabel(){
 const stats=document.querySelector('.library-stats');if(!stats)return;
 for(const stat of stats.children){
  const label=stat.querySelector('small');const value=stat.querySelector('strong');
  if(label?.textContent?.trim().toLowerCase()==='platform'&&value&&value.textContent.trim()!=='iOS & macOS')value.textContent='iOS & macOS';
 }
}
function availableSavedCards(){
 return [...document.querySelectorAll('.library-card')].map((card,index)=>({card,id:bookmarkId(card,index)})).filter(item=>bookmarks.has(item.id));
}
function createSavedShelf(){
 const toolbar=document.querySelector('.library-toolbar');
 if(!toolbar||document.querySelector('.saved-mods-shelf'))return;
 const shelf=document.createElement('section');
 shelf.className='saved-mods-shelf';
 shelf.setAttribute('aria-labelledby','saved-mods-title');
 shelf.innerHTML=`<button class="saved-mods-toggle" type="button" aria-expanded="false" aria-controls="saved-mods-panel"><span class="saved-mods-toggle-main"><span class="saved-mods-mark">${BOOKMARK_ICON}</span><span><small>SAVED</small><strong id="saved-mods-title">Saved Mods</strong></span><b class="saved-mods-count">0</b></span><span class="saved-mods-toggle-action">View saved ${CHEVRON_ICON}</span></button><div class="saved-mods-panel" id="saved-mods-panel" hidden><div class="saved-mods-list"></div></div>`;
 toolbar.insertAdjacentElement('afterend',shelf);
 const toggle=shelf.querySelector('.saved-mods-toggle');const panel=shelf.querySelector('.saved-mods-panel');
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));panel.hidden=!open;shelf.classList.toggle('is-open',open);pulse('tap')});
 shelf.addEventListener('click',event=>{
  const remove=event.target.closest('[data-saved-remove]');
  if(remove){const id=remove.dataset.savedRemove;bookmarks.delete(id);writeBookmarks(bookmarks);syncAllBookmarkButtons();renderSavedMods(true);pulse('tap');return}
  const view=event.target.closest('[data-saved-view]');
  if(view){const target=[...document.querySelectorAll('.library-card')].find((card,index)=>bookmarkId(card,index)===view.dataset.savedView);if(target){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});target.classList.add('saved-mod-highlight');setTimeout(()=>target.classList.remove('saved-mod-highlight'),1200)}pulse('tap')}
 });
}
function renderSavedMods(force=false){
 const shelf=document.querySelector('.saved-mods-shelf');if(!shelf)return;
 const list=shelf.querySelector('.saved-mods-list'),countNode=shelf.querySelector('.saved-mods-count');if(!list||!countNode)return;
 const saved=availableSavedCards();const signature=saved.map(({id,card})=>`${id}:${card.querySelector('h3,h2')?.textContent?.trim()||''}`).join('|');
 countNode.textContent=String(saved.length);shelf.classList.toggle('has-saved-mods',saved.length>0);
 if(!force&&shelf.dataset.savedSignature===signature)return;shelf.dataset.savedSignature=signature;list.replaceChildren();
 if(!saved.length){const empty=document.createElement('div');empty.className='saved-mods-empty';empty.innerHTML=`<span class="saved-mods-empty-icon">${BOOKMARK_ICON}</span><div><strong>No saved mods yet</strong><p>Tap the bookmark icon on a mod to keep it here.</p></div>`;list.append(empty);return}
 for(const {card,id} of saved){
  const row=document.createElement('article');row.className='saved-mod-row';
  const image=card.querySelector('.library-media img');if(image){const thumb=document.createElement('img');thumb.className='saved-mod-thumb';thumb.src=image.currentSrc||image.src;thumb.alt='';thumb.loading='lazy';row.append(thumb)}else{const placeholder=document.createElement('span');placeholder.className='saved-mod-thumb saved-mod-thumb-placeholder';placeholder.innerHTML=BOOKMARK_ICON;row.append(placeholder)}
  const copy=document.createElement('div');copy.className='saved-mod-copy';const category=card.querySelector('.library-card-meta span')?.textContent?.trim()||'Mod';const title=card.querySelector('h3,h2')?.textContent?.trim()||'Saved mod';const subtitle=card.querySelector('.library-card-subtitle,.library-card-description')?.textContent?.trim()||'';const label=document.createElement('small');label.textContent=category;const heading=document.createElement('strong');heading.textContent=title;copy.append(label,heading);if(subtitle){const p=document.createElement('p');p.textContent=subtitle;copy.append(p)}
  const actions=document.createElement('div');actions.className='saved-mod-row-actions';const view=document.createElement('button');view.type='button';view.dataset.savedView=id;view.textContent='View';const remove=document.createElement('button');remove.type='button';remove.dataset.savedRemove=id;remove.className='saved-mod-remove';remove.setAttribute('aria-label',`Remove ${title} from saved mods`);remove.textContent='Remove';actions.append(view,remove);row.append(copy,actions);list.append(row);
 }
}
function mountSavedMods(){createSavedShelf();renderSavedMods()}

function mount(){if(onUpdates)mountReleaseShares();if(onMods){setPlatformLabel();mountModBookmarks();mountSavedMods()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})});
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('storage',event=>{if(onMods&&event.key===BOOKMARK_KEY){bookmarks=readBookmarks();syncAllBookmarkButtons();renderSavedMods(true)}});
window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
