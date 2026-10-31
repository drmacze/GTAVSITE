(()=>{
'use strict';
if(window.__gtavModsDownloadTrackerV1)return;
window.__gtavModsDownloadTrackerV1=true;

const isDownloadLink=target=>{
 const anchor=target instanceof Element?target.closest('a.primary-action,a.collection-row'):null;
 if(!anchor||!anchor.href)return null;
 return anchor;
};

const track=anchor=>{
 const card=anchor.closest('.library-card');
 const row=anchor.closest('.collection-row');
 const multiFile=row?.classList.contains('mod-download-option');
 const title=(multiFile?card?.querySelector('h3')?.textContent:row?.querySelector('strong')?.textContent)||card?.querySelector('h3')?.textContent||'Mod';
 const payload={
  eventId:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,
  modId:row?.dataset.modId||card?.dataset.id||'',
  title:title.trim(),
  downloadUrl:anchor.href
 };
 fetch('/api/mod-downloads',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify(payload),
  keepalive:true,
  cache:'no-store'
 }).catch(()=>{});
};

document.addEventListener('click',event=>{
 const anchor=isDownloadLink(event.target);
 if(!anchor||event.defaultPrevented)return;
 track(anchor);
},true);
})();
