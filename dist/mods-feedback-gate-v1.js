(()=>{
'use strict';
if(window.__gtavModsFeedbackGateV1)return;
window.__gtavModsFeedbackGateV1=true;

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let pending=null,lastFocus=null;

function trackDownload(item){
 if(!item?.url)return;
 const eventId=crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
 fetch('/api/mod-downloads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventId,modId:item.modId||'',title:item.title||'Mod',downloadUrl:item.url}),keepalive:true,cache:'no-store'}).catch(()=>{});
}

function ensureGate(){
 if(document.querySelector('.mods-feedback-gate'))return document.querySelector('.mods-feedback-gate');
 const root=document.createElement('div');
 root.className='mods-feedback-gate';
 root.hidden=true;
 root.innerHTML=`
  <div class="mods-feedback-backdrop" data-gate-close></div>
  <section class="mods-feedback-sheet" role="dialog" aria-modal="true" aria-labelledby="mods-feedback-title" aria-describedby="mods-feedback-copy">
   <button class="mods-feedback-close" type="button" aria-label="Close" data-gate-close>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
   </button>
   <div class="mods-feedback-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M20 11.5a8.5 8.5 0 1 1-3.2-6.64"/><path d="M20 4v6h-6"/></svg>
   </div>
   <div class="mods-feedback-head">
    <span>BEFORE YOU DOWNLOAD</span>
    <h2 id="mods-feedback-title">Help improve the library</h2>
    <p id="mods-feedback-copy">After trying <strong class="mods-feedback-mod-name">this mod</strong>, please share a quick rating or report any issue. Your feedback helps us keep the library useful and accurate.</p>
   </div>
   <label class="mods-feedback-check">
    <input type="checkbox" class="mods-feedback-checkbox">
    <span class="mods-feedback-checkmark" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4 10.5l3.5 3.5L16 6"/></svg></span>
    <span>I’ve read and understand this message.</span>
   </label>
   <div class="mods-feedback-actions">
    <button class="mods-feedback-secondary" type="button" disabled>Give feedback</button>
    <button class="mods-feedback-primary" type="button" disabled>Continue download</button>
   </div>
  </section>`;
 document.body.append(root);
 const checkbox=root.querySelector('.mods-feedback-checkbox');
 const feedback=root.querySelector('.mods-feedback-secondary');
 const download=root.querySelector('.mods-feedback-primary');
 const sync=()=>{feedback.disabled=!checkbox.checked;download.disabled=!checkbox.checked;};
 checkbox.addEventListener('change',sync);
 root.querySelectorAll('[data-gate-close]').forEach(el=>el.addEventListener('click',closeGate));
 feedback.addEventListener('click',()=>{
   if(!checkbox.checked||!pending)return;
   const url=`feedback.html?from=mods&mod=${encodeURIComponent(pending.title||'Mod')}`;
   closeGate(false);
   location.href=url;
 });
 download.addEventListener('click',()=>{
   if(!checkbox.checked||!pending)return;
   const item={...pending};
   trackDownload(item);
   closeGate(false);
   window.open(item.url,'_blank','noopener,noreferrer');
 });
 return root;
}

function closeGate(restore=true){
 const root=document.querySelector('.mods-feedback-gate');
 if(!root||root.hidden)return;
 root.classList.remove('is-open');
 document.documentElement.classList.remove('mods-feedback-open');
 setTimeout(()=>{root.hidden=true;},180);
 if(restore&&lastFocus?.focus)try{lastFocus.focus({preventScroll:true})}catch{}
 pending=null;
}

function openGate(anchor){
 const href=anchor.href;
 if(!href)return;
 const card=anchor.closest('.library-card');
 const row=anchor.closest('.collection-row');
 const title=(row?.querySelector('strong')?.textContent||card?.querySelector('h3')?.textContent||'this mod').trim();
 pending={url:href,title,modId:row?.dataset.modId||card?.dataset.id||''};
 lastFocus=anchor;
 const root=ensureGate();
 const checkbox=root.querySelector('.mods-feedback-checkbox');
 root.querySelector('.mods-feedback-mod-name').textContent=title;
 checkbox.checked=false;
 root.querySelector('.mods-feedback-secondary').disabled=true;
 root.querySelector('.mods-feedback-primary').disabled=true;
 root.hidden=false;
 document.documentElement.classList.add('mods-feedback-open');
 requestAnimationFrame(()=>root.classList.add('is-open'));
 setTimeout(()=>checkbox.focus({preventScroll:true}),120);
}

function isDownloadLink(target){
 const anchor=target.closest('a');
 if(!anchor)return null;
 if(anchor.matches('.primary-action'))return anchor;
 if(anchor.matches('.collection-row'))return anchor;
 return null;
}

document.addEventListener('click',event=>{
 const anchor=isDownloadLink(event.target);
 if(!anchor)return;
 if(event.defaultPrevented)return;
 event.preventDefault();
 event.stopPropagation();
 openGate(anchor);
},true);

document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&document.querySelector('.mods-feedback-gate.is-open'))closeGate();
});
})();
