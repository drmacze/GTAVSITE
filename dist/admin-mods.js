(()=>{
'use strict';
if(window.__gtavAdminMods)return;
window.__gtavAdminMods=true;
const API='/api/mods',TOKEN_KEY='gtav-admin-token-v2';
const $=id=>document.getElementById(id);
const icon=name=>`<svg aria-hidden="true"><use href="assets/icons.svg#${name}"></use></svg>`;
let mods=[],editingId='',filter='';

function token(){return sessionStorage.getItem(TOKEN_KEY)||''}
function headers(){return{'Content-Type':'application/json','X-Admin-Token':token(),'Accept':'application/json'}}
async function req(url,options={}){const r=await fetch(url,{cache:'no-store',...options});let d={};try{d=await r.json()}catch{}if(!r.ok)throw new Error(d.error||'request_failed');return d}
function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function categoryLabel(value){return({modpack:'Mod Pack',dlc:'DLC',graphics:'Graphics',language:'Language'})[value]||'Mod Pack'}
function categoryIcon(value){return({modpack:'package',dlc:'archive',graphics:'palette',language:'languages'})[value]||'package'}

function mount(){
 const dashboard=$('dashboard');
 const tabs=dashboard?.querySelector('.tabs');
 if(!dashboard||!tabs||$('panel-mods'))return;
 const releaseTab=tabs.querySelector('[data-tab="releases"]');
 const tab=document.createElement('button');tab.className='tab';tab.type='button';tab.dataset.tab='mods';tab.textContent='Mods';
 releaseTab?.after(tab)??tabs.append(tab);
 const panel=document.createElement('section');panel.className='panel';panel.id='panel-mods';
 panel.innerHTML=`
  <div class="mods-admin-grid">
   <section class="card">
    <div class="card-head"><div><h2 id="mod-form-title">Add mod</h2><small>Publish directly to the public Mods Library</small></div><a class="mini" href="downloads.html#mods" target="_blank" rel="noopener">Open library</a></div>
    <form id="mod-admin-form" class="mods-admin-form">
     <input type="hidden" id="mod-editing-id">
     <div class="row-2">
      <div class="field"><label for="mod-title">Mod name *</label><input id="mod-title" maxlength="140" required placeholder="Awesomekills Graphics iOS"></div>
      <div class="field"><label for="mod-category">Category *</label><select id="mod-category"><option value="modpack">Mod Pack</option><option value="dlc">DLC</option><option value="graphics">Graphics</option><option value="language">Language</option></select></div>
     </div>
     <div class="field"><label for="mod-subtitle">Subtitle</label><input id="mod-subtitle" maxlength="120" placeholder="Lighting & timecycle"><small>Short context shown below the mod name.</small></div>
     <div class="field"><label for="mod-description">Description</label><textarea id="mod-description" class="mod-description" maxlength="1200" placeholder="Briefly explain what this mod changes or adds."></textarea></div>
     <div class="field"><label for="mod-download">Download link *</label><div class="mods-admin-link-row"><input id="mod-download" type="url" required placeholder="https://gofile.io/d/..."><button type="button" class="mini" data-paste="mod-download">Paste</button></div><small>Paste a GoFile or other direct HTTPS download page.</small></div>
     <div class="field"><label for="mod-image">Preview image</label><div class="mods-admin-link-row"><input id="mod-image" type="url" placeholder="https://.../preview.avif"><button type="button" class="mini" data-paste="mod-image">Paste</button></div></div>
     <div class="field is-conditional" id="mod-preview2-field"><label for="mod-preview2">Second preview <span class="muted">· optional</span></label><div class="mods-admin-link-row"><input id="mod-preview2" type="url" placeholder="https://.../preview-2.avif"><button type="button" class="mini" data-paste="mod-preview2">Paste</button></div></div>
     <div class="field is-conditional" id="mod-preset-field"><label for="mod-preset">Graphics preset <span class="muted">· optional</span></label><div class="mods-admin-link-row"><input id="mod-preset" placeholder="assets/...json or https://..."><button type="button" class="mini" data-paste="mod-preset">Paste</button></div></div>
     <div class="row-2">
      <div class="field"><label for="mod-tags">Tags</label><input id="mod-tags" maxlength="360" placeholder="Lighting, Timecycle, Realism"><small>Separate tags with commas.</small></div>
      <div class="field is-conditional" id="mod-code-field" hidden><label for="mod-code">Language code</label><input id="mod-code" maxlength="8" placeholder="ID"></div>
     </div>
     <div class="row-2">
      <div class="field"><label for="mod-sort">Order</label><input id="mod-sort" type="number" min="0" max="9999" value="100"><small>Lower numbers appear first.</small></div>
      <label class="check" style="align-self:end;padding-bottom:10px"><input id="mod-published" type="checkbox" checked> Publish immediately</label>
     </div>
     <div class="mods-admin-preview">
      <div class="mods-admin-preview-media" id="mod-preview-media">${icon('package')}</div>
      <div class="mods-admin-preview-copy"><strong id="mod-preview-title">New mod</strong><span id="mod-preview-meta">Mod Pack · ready to publish</span></div>
     </div>
     <div class="mods-admin-actions"><button class="button compact" id="mod-submit" type="submit">Publish mod</button><button class="button outline compact" id="mod-reset" type="button">Clear</button><span class="mods-admin-status" id="mod-form-status">Ready.</span></div>
    </form>
    <p class="mods-admin-help"><strong>Easy upload:</strong> host the mod file on GoFile (or another HTTPS host), paste the link here, add a preview, then press Publish. DLC items and Language Packs are automatically grouped in the public library.</p>
   </section>
   <section class="card">
    <div class="card-head"><div><h2>Library items</h2><small>Edit, draft or remove published mods</small></div><button class="mini" id="mods-refresh" type="button">Refresh</button></div>
    <div class="mods-admin-toolbar"><input id="mods-admin-search" class="search-input" placeholder="Search mods…"><span class="mods-admin-count" id="mods-admin-count">0 items</span></div>
    <div class="mods-admin-list" id="mods-admin-list"><div class="mods-admin-empty">Unlock the dashboard to load mods.</div></div>
   </section>
  </div>`;
 const feedbackPanel=$('panel-feedback');
 feedbackPanel?.before(panel)??dashboard.append(panel);

 // Existing dashboard bound its original tabs before this injected tab existed, so this tab owns its switch behavior.
 tab.addEventListener('click',()=>{
   dashboard.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===tab));
   dashboard.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x===panel));
   load();
 });
 dashboard.querySelectorAll('.tab:not([data-tab="mods"])').forEach(btn=>btn.addEventListener('click',()=>{
   tab.classList.remove('active');panel.classList.remove('active');
 }));

 $('mod-category').addEventListener('change',syncConditional);
 ['mod-title','mod-category','mod-image','mod-published'].forEach(id=>$(id).addEventListener('input',syncPreview));
 $('mod-admin-form').addEventListener('submit',save);
 $('mod-reset').addEventListener('click',resetForm);
 $('mods-refresh').addEventListener('click',load);
 $('mods-admin-search').addEventListener('input',()=>{filter=$('mods-admin-search').value.trim().toLowerCase();renderList()});
 panel.querySelectorAll('[data-paste]').forEach(button=>button.addEventListener('click',()=>pasteInto(button.dataset.paste)));
 window.addEventListener('project-admin-unlocked',load);
 window.addEventListener('project-admin-refreshed',load);
 $('refresh-all')?.addEventListener('click',load);
 $('lock-out')?.addEventListener('click',()=>{mods=[];editingId='';renderList();resetForm()});
 injectMetric();syncConditional();syncPreview();
 if(token()&&!dashboard.hidden)load();
}

function injectMetric(){
 const metrics=$('panel-overview')?.querySelector('.metrics');
 if(!metrics||$('m-mods'))return;
 const node=document.createElement('div');node.className='mods-admin-metric';node.innerHTML='<small>Published mods</small><strong id="m-mods">0</strong><span id="m-mod-drafts">0 drafts</span>';metrics.append(node);
}

async function pasteInto(id){
 try{const text=await navigator.clipboard.readText();if(!text)return;$(id).value=text.trim();$(id).dispatchEvent(new Event('input',{bubbles:true}));setStatus('Pasted.','ok')}catch{setStatus('Clipboard access was blocked. Paste manually.','error')}
}

function syncConditional(){
 const category=$('mod-category').value;
 $('mod-code-field').hidden=category!=='language';
 $('mod-preview2-field').hidden=category!=='graphics';
 $('mod-preset-field').hidden=category!=='graphics';
 syncPreview();
}
function syncPreview(){
 const title=$('mod-title').value.trim()||'New mod';
 const category=$('mod-category').value;
 const image=$('mod-image').value.trim();
 $('mod-preview-title').textContent=title;
 $('mod-preview-meta').textContent=`${categoryLabel(category)} · ${$('mod-published').checked?'will publish':'draft'}`;
 const media=$('mod-preview-media');
 media.innerHTML=image?`<img src="${esc(image)}" alt="">`:icon(categoryIcon(category));
}
function setStatus(text,type=''){$('mod-form-status').textContent=text;$('mod-form-status').className='mods-admin-status'+(type?' '+type:'')}

function payload(){
 return{
  title:$('mod-title').value.trim(),category:$('mod-category').value,subtitle:$('mod-subtitle').value.trim(),description:$('mod-description').value.trim(),
  downloadUrl:$('mod-download').value.trim(),imageUrl:$('mod-image').value.trim(),preview2Url:$('mod-preview2').value.trim(),presetUrl:$('mod-preset').value.trim(),
  tags:$('mod-tags').value.split(',').map(x=>x.trim()).filter(Boolean),languageCode:$('mod-code').value.trim(),sortOrder:Number($('mod-sort').value||100),published:$('mod-published').checked
 };
}

async function save(event){
 event.preventDefault();
 const data=payload();
 if(!data.title||!data.downloadUrl){setStatus('Mod name and download link are required.','error');return}
 const button=$('mod-submit');button.disabled=true;setStatus(editingId?'Saving changes…':'Publishing mod…');
 try{
  const url=editingId?`${API}?id=${encodeURIComponent(editingId)}`:API;
  await req(url,{method:editingId?'PUT':'POST',headers:headers(),body:JSON.stringify(data)});
  setStatus(editingId?'Changes saved.':'Mod published.','ok');
  resetForm(false);await load();
 }catch(error){setStatus(error.message==='unauthorized'?'Admin session expired.':error.message==='download_url_required'?'A valid HTTPS download link is required.':'Could not save this mod.','error')}
 finally{button.disabled=false}
}

function resetForm(clearStatus=true){
 editingId='';$('mod-editing-id').value='';$('mod-admin-form').reset();$('mod-category').value='modpack';$('mod-sort').value='100';$('mod-published').checked=true;$('mod-form-title').textContent='Add mod';$('mod-submit').textContent='Publish mod';if(clearStatus)setStatus('Ready.');syncConditional();syncPreview();
}

function edit(id){
 const item=mods.find(x=>x.id===id);if(!item)return;
 editingId=id;$('mod-editing-id').value=id;$('mod-title').value=item.title||'';$('mod-category').value=item.category||'modpack';$('mod-subtitle').value=item.subtitle||'';$('mod-description').value=item.description||'';$('mod-download').value=item.downloadUrl||'';$('mod-image').value=item.imageUrl||'';$('mod-preview2').value=item.preview2Url||'';$('mod-preset').value=item.presetUrl||'';$('mod-tags').value=(item.tags||[]).join(', ');$('mod-code').value=item.languageCode||'';$('mod-sort').value=item.sortOrder??100;$('mod-published').checked=!!item.published;$('mod-form-title').textContent='Edit mod';$('mod-submit').textContent='Save changes';setStatus('Editing '+item.title);syncConditional();syncPreview();$('panel-mods').scrollIntoView({behavior:'smooth',block:'start'});
}

async function remove(id){
 const item=mods.find(x=>x.id===id);if(!item)return;
 if(!confirm(`Delete “${item.title}”? This removes it from the public library.`))return;
 try{await req(`${API}?id=${encodeURIComponent(id)}`,{method:'DELETE',headers:headers()});if(editingId===id)resetForm();await load()}catch{setStatus('Could not delete the mod.','error')}
}

function renderList(){
 const root=$('mods-admin-list');if(!root)return;
 const rows=mods.filter(item=>!filter||[item.title,item.category,item.subtitle,item.description,item.languageCode,...(item.tags||[])].join(' ').toLowerCase().includes(filter));
 $('mods-admin-count').textContent=`${rows.length} item${rows.length===1?'':'s'}`;
 root.replaceChildren();
 if(!rows.length){root.innerHTML='<div class="mods-admin-empty">No mods match this view.</div>';return}
 rows.forEach(item=>{
  const article=document.createElement('article');article.className='mods-admin-item';
  article.innerHTML=`<div class="mods-admin-thumb">${item.imageUrl?`<img src="${esc(item.imageUrl)}" alt="">`:icon(categoryIcon(item.category))}</div><div class="mods-admin-copy"><strong>${esc(item.title)}</strong><small>${esc(categoryLabel(item.category)+(item.subtitle?' · '+item.subtitle:''))}</small><div class="mods-admin-meta"><span>${esc(String(item.sortOrder??100))}</span><span class="${item.published?'published':'draft'}">${item.published?'Published':'Draft'}</span>${item.languageCode?`<span>${esc(item.languageCode)}</span>`:''}</div></div><div class="mods-admin-item-actions"><button type="button" data-edit="${esc(item.id)}">Edit</button><button type="button" class="delete" data-delete="${esc(item.id)}">Delete</button></div>`;
  root.append(article);
 });
 root.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>edit(b.dataset.edit)));
 root.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>remove(b.dataset.delete)));
}

async function load(){
 if(!token()||!$('mods-admin-list'))return;
 $('mods-admin-count').textContent='Loading…';
 try{const data=await req(API+'?admin=1',{headers:headers()});mods=Array.isArray(data.mods)?data.mods:[];renderList();const published=mods.filter(x=>x.published).length;const drafts=mods.length-published;if($('m-mods'))$('m-mods').textContent=published;if($('m-mod-drafts'))$('m-mod-drafts').textContent=`${drafts} draft${drafts===1?'':'s'}`}
 catch{$('mods-admin-list').innerHTML='<div class="mods-admin-empty">Could not load the Mods Library. Refresh to try again.</div>';$('mods-admin-count').textContent='Unavailable'}
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
