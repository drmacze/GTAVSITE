(()=>{
'use strict';
if(window.__gtavAdminSiteIconV1)return;
window.__gtavAdminSiteIconV1=true;
const API='/api/site-icon',TOKEN_KEY='gtav-admin-token-v2';
const $=id=>document.getElementById(id);
let selectedBlob=null,selectedPreview='';

function token(){return sessionStorage.getItem(TOKEN_KEY)||''}
function headers(extra={}){return{'X-Admin-Token':token(),...extra}}
function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function fmt(bytes){if(!bytes)return'0 KB';return bytes<1024*1024?`${Math.max(1,Math.round(bytes/1024))} KB`:`${(bytes/1024/1024).toFixed(2)} MB`}
function setStatus(text,type=''){const node=$('site-icon-status');if(!node)return;node.textContent=text;node.className='site-icon-status'+(type?' '+type:'')}
function setPreview(src,customized=false,meta=''){const img=$('site-icon-preview');if(!img)return;img.src=src;img.dataset.customized=String(customized);$('site-icon-meta').textContent=meta|| (customized?'Custom website icon':'Default website icon')}
function releasePreview(){if(selectedPreview){URL.revokeObjectURL(selectedPreview);selectedPreview=''}}

function injectStyles(){
 if(document.getElementById('admin-site-icon-v1-style'))return;
 const style=document.createElement('style');style.id='admin-site-icon-v1-style';style.textContent=`
 .site-icon-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.72fr);gap:14px}.site-icon-drop{border:1px solid color-mix(in srgb,currentColor 10%,transparent);border-radius:20px;padding:18px;background:color-mix(in srgb,var(--surface,#131313) 84%,transparent)}.site-icon-preview-wrap{display:grid;place-items:center;min-height:260px;border-radius:18px;background:linear-gradient(145deg,rgba(255,122,26,.06),rgba(255,255,255,.015));border:1px solid color-mix(in srgb,currentColor 8%,transparent);overflow:hidden}.site-icon-preview-wrap img{width:min(220px,62vw);aspect-ratio:1;object-fit:cover;border-radius:24%;box-shadow:0 22px 60px rgba(0,0,0,.38),0 0 0 1px rgba(255,255,255,.06)}.site-icon-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.site-icon-actions button{min-height:42px}.site-icon-file{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.site-icon-note{font-size:.72rem;line-height:1.55;color:var(--muted,#8d8d8d);margin:12px 0 0}.site-icon-status{font-size:.72rem;color:var(--muted,#8d8d8d);margin-top:12px}.site-icon-status.ok{color:#62d78c}.site-icon-status.error{color:#ff7373}.site-icon-specs{display:grid;gap:10px}.site-icon-spec{display:flex;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid color-mix(in srgb,currentColor 7%,transparent);font-size:.72rem}.site-icon-spec:last-child{border-bottom:0}.site-icon-spec span{color:var(--muted,#8d8d8d)}.site-icon-spec strong{font-weight:800;text-align:right}@media(max-width:760px){.site-icon-grid{grid-template-columns:1fr}.site-icon-preview-wrap{min-height:220px}}
 `;document.head.append(style);
}

function mount(){
 const dashboard=$('dashboard'),tabs=dashboard?.querySelector('.tabs');if(!dashboard||!tabs||$('panel-site-icon'))return;
 injectStyles();
 const tab=document.createElement('button');tab.className='tab';tab.type='button';tab.dataset.tab='site-icon';tab.textContent='Website Icon';
 const feedbackTab=tabs.querySelector('[data-tab="feedback"]');feedbackTab?.before(tab)??tabs.append(tab);
 const panel=document.createElement('section');panel.className='panel';panel.id='panel-site-icon';panel.innerHTML=`
 <div class="site-icon-grid">
  <section class="card">
   <div class="card-head"><div><h2>Website Icon</h2><small>Favicon, Apple Home Screen and installed web app icon</small></div></div>
   <div class="site-icon-drop">
    <div class="site-icon-preview-wrap"><img id="site-icon-preview" src="${API}?preview=1" alt="Current website icon"></div>
    <div id="site-icon-meta" class="site-icon-note">Loading current icon…</div>
    <input class="site-icon-file" id="site-icon-file" type="file" accept="image/*">
    <div class="site-icon-actions">
     <button class="button compact" id="site-icon-choose" type="button">Choose photo</button>
     <button class="button outline compact" id="site-icon-publish" type="button" disabled>Publish icon</button>
     <button class="button outline compact danger" id="site-icon-reset" type="button">Restore default</button>
    </div>
    <p class="site-icon-note">Choose one image from your device. It is automatically center-cropped to a square and exported as a 512×512 PNG before upload.</p>
    <div id="site-icon-status" class="site-icon-status">Ready.</div>
   </div>
  </section>
  <section class="card">
   <div class="card-head"><div><h2>Used across the site</h2><small>One upload updates every icon surface</small></div></div>
   <div class="site-icon-specs">
    <div class="site-icon-spec"><span>Browser tab</span><strong>Favicon</strong></div>
    <div class="site-icon-spec"><span>iPhone / iPad</span><strong>Apple Touch Icon</strong></div>
    <div class="site-icon-spec"><span>Installed web app</span><strong>PWA icon</strong></div>
    <div class="site-icon-spec"><span>Output</span><strong>512×512 PNG</strong></div>
   </div>
   <p class="site-icon-note">Browsers may keep an older Home Screen icon until the shortcut is removed and added again. New visits use the latest published icon.</p>
  </section>
 </div>`;
 const feedbackPanel=$('panel-feedback');feedbackPanel?.before(panel)??dashboard.append(panel);
 tab.addEventListener('click',()=>{dashboard.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===tab));dashboard.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x===panel));loadMeta()});
 dashboard.querySelectorAll('.tab:not([data-tab="site-icon"])').forEach(btn=>btn.addEventListener('click',()=>{tab.classList.remove('active');panel.classList.remove('active')}));
 $('site-icon-choose').addEventListener('click',()=>$('site-icon-file').click());
 $('site-icon-file').addEventListener('change',onChoose);
 $('site-icon-publish').addEventListener('click',publish);
 $('site-icon-reset').addEventListener('click',restoreDefault);
 window.addEventListener('project-admin-unlocked',loadMeta);
 window.addEventListener('project-admin-refreshed',loadMeta);
 $('refresh-all')?.addEventListener('click',loadMeta);
 $('lock-out')?.addEventListener('click',()=>{selectedBlob=null;releasePreview();$('site-icon-publish').disabled=true;setStatus('Unlock the dashboard to manage the icon.')});
 if(token()&&!dashboard.hidden)loadMeta();
}

async function loadImage(file){
 const url=URL.createObjectURL(file);try{return await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url})}finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}
}
async function normalize(file){
 if(!file||!file.type.startsWith('image/'))throw new Error('Choose an image file.');
 if(file.size>25*1024*1024)throw new Error('The selected image is too large.');
 const img=await loadImage(file),w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(!w||!h)throw new Error('Could not read this image.');
 const side=Math.min(w,h),sx=(w-side)/2,sy=(h-side)/2,canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d',{alpha:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.clearRect(0,0,512,512);ctx.drawImage(img,sx,sy,side,side,0,0,512,512);
 return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not prepare this image.')),'image/png'));
}
async function onChoose(event){
 const file=event.target.files?.[0];if(!file)return;setStatus('Preparing icon…');$('site-icon-publish').disabled=true;
 try{const blob=await normalize(file);if(blob.size>3_000_000)throw new Error('The prepared icon is still too large. Choose a simpler image.');selectedBlob=blob;releasePreview();selectedPreview=URL.createObjectURL(blob);setPreview(selectedPreview,true,`Ready to publish · 512×512 PNG · ${fmt(blob.size)}`);$('site-icon-publish').disabled=false;setStatus('Preview ready. Publish when it looks right.','ok')}catch(error){selectedBlob=null;setStatus(error.message||'Could not prepare this image.','error')}
}
async function publish(){
 if(!selectedBlob||!token())return;const button=$('site-icon-publish');button.disabled=true;setStatus('Publishing website icon…');
 try{const r=await fetch(API,{method:'POST',headers:headers({'Content-Type':'image/png'}),body:selectedBlob,cache:'no-store'});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||'upload_failed');selectedBlob=null;releasePreview();$('site-icon-file').value='';setPreview(`${API}?v=${Date.now()}`,true,`Custom icon published · ${fmt(data.size)}`);setStatus('Website icon published. New page loads will use it.','ok');window.dispatchEvent(new CustomEvent('gtav:site-icon-updated',{detail:{url:API}}))}catch(error){setStatus(error.message==='unauthorized'?'Admin session expired.':'Could not publish the website icon.','error');button.disabled=false}
}
async function restoreDefault(){
 if(!token())return;if(!confirm('Restore the default GTA V iOS website icon?'))return;setStatus('Restoring default icon…');
 try{const r=await fetch(API,{method:'DELETE',headers:headers(),cache:'no-store'});if(!r.ok)throw new Error();selectedBlob=null;releasePreview();$('site-icon-file').value='';$('site-icon-publish').disabled=true;setPreview(`/assets/community-mark-512.png?v=${Date.now()}`,false,'Default website icon');setStatus('Default icon restored.','ok')}catch{setStatus('Could not restore the default icon.','error')}
}
async function loadMeta(){
 if(!token()||!$('site-icon-preview'))return;try{const r=await fetch(API+'?meta=1',{cache:'no-store'}),data=await r.json();setPreview(data.customized?`${API}?v=${Date.now()}`:`/assets/community-mark-512.png?v=${Date.now()}`,!!data.customized,data.customized?`Custom website icon · ${fmt(data.size)}`:'Default website icon');setStatus(data.customized?'Custom icon is active.':'Default icon is active.')}catch{setStatus('Could not read the current icon status.','error')}
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
