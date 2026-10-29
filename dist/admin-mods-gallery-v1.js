(()=>{
'use strict';
if(window.__gtavAdminModsGalleryV4)return;window.__gtavAdminModsGalleryV4=true;
const TOKEN_KEY='gtav-admin-token-v2';
const UPLOAD_API='/api/mod-images';
const MAX_PREVIEWS=12;
const TARGET_BYTES=620000;
const HARD_LIMIT=690000;
const $=id=>document.getElementById(id);
let pending=[];
let uploading=false;
let lastPickSignature='';
let lastPickAt=0;
const unique=values=>{const seen=new Set();return (values||[]).map(v=>String(v||'').trim()).filter(v=>{if(!v||seen.has(v))return false;seen.add(v);return true}).slice(0,MAX_PREVIEWS)};
const urls=()=>unique(($('mod-images')?.value||'').split(/\r?\n/));
const setStatus=(text,type='')=>{const el=$('mod-form-status');if(!el)return;el.textContent=text;el.className='mods-admin-status'+(type?' '+type:'')};
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const plusIcon=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
function isImage(file){const type=String(file?.type||'').toLowerCase(),name=String(file?.name||'').toLowerCase();return type.startsWith('image/')||/\.(jpe?g|png|webp|heic|heif|avif)$/i.test(name)}
function setUrls(values){const input=$('mod-images');if(!input)return;input.value=unique(values).join('\n');input.dispatchEvent(new Event('input',{bubbles:true}));render()}
function safeObjectUrl(file){try{return URL.createObjectURL(file)}catch{return ''}}
function setUploading(value){uploading=!!value;$('mod-gallery-picker')?.classList.toggle('is-uploading',uploading);const submit=$('mod-submit');if(submit)submit.disabled=uploading;render()}
function render(){
 const grid=$('mod-gallery-grid'),summary=$('mod-gallery-summary');if(!grid||!summary)return;
 const uploaded=urls(),total=uploaded.length+pending.length;
 summary.textContent=pending.length?`${uploaded.length} uploaded · ${pending.length} processing/failed`:uploaded.length===0?'No photos selected':uploaded.length===1?'1 photo · static thumbnail':`${uploaded.length} photos · slider enabled`;
 grid.replaceChildren();
 uploaded.forEach((url,index)=>{const item=document.createElement('div');item.className='mods-gallery-item';item.innerHTML=`<img src="${esc(url)}" alt="Thumbnail ${index+1}"><span>${index===0?'Primary':String(index+1).padStart(2,'0')}</span><button type="button" aria-label="Remove photo ${index+1}">×</button>`;item.querySelector('button')?.addEventListener('click',()=>{const list=urls();list.splice(index,1);setUrls(list);setStatus('Photo removed.','ok')});grid.append(item)});
 pending.forEach((entry,index)=>{const item=document.createElement('div');item.className='mods-gallery-item is-pending '+(entry.status==='error'?'has-error':'');const label=entry.status==='error'?'Upload failed':entry.status==='uploading'?'Uploading…':entry.status==='optimizing'?'Optimizing…':'Selected';const img=entry.localUrl?`<img src="${esc(entry.localUrl)}" alt="Selected photo">`:'<div class="mods-gallery-file-fallback">PHOTO</div>';item.innerHTML=`${img}<span>${label}</span><button type="button" data-remove aria-label="Remove selected photo">×</button>${entry.status==='error'?'<button type="button" class="mods-gallery-retry">Retry</button>':''}`;item.querySelector('[data-remove]')?.addEventListener('click',()=>removePending(index));item.querySelector('.mods-gallery-retry')?.addEventListener('click',()=>retryPending(index));grid.append(item)});
 const choose=$('mod-gallery-choose');if(choose){const full=total>=MAX_PREVIEWS;choose.classList.toggle('is-full',full);const label=choose.querySelector('.mods-gallery-label');if(label)label.textContent=total?'Add photos':'Choose photos';const input=choose.querySelector('input');if(input)input.disabled=full||uploading}
}
function removePending(index){const item=pending[index];if(!item)return;if(item.localUrl)URL.revokeObjectURL(item.localUrl);pending.splice(index,1);render()}
function loadImage(file){return new Promise((resolve,reject)=>{const url=safeObjectUrl(file);if(!url){reject(new Error('image_decode_failed'));return}const img=new Image();let settled=false;const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(ok)resolve({img,url});else{URL.revokeObjectURL(url);reject(new Error('image_decode_failed'))}};img.onload=()=>done(true);img.onerror=()=>done(false);img.src=url;const timer=setTimeout(()=>done(false),15000)})}
function encode(canvas,type,quality){return new Promise(resolve=>canvas.toBlob(resolve,type,quality))}
async function encodeBest(canvas,quality){let blob=await encode(canvas,'image/webp',quality);if(!blob)blob=await encode(canvas,'image/jpeg',quality);return blob}
async function compressImage(file){
 const directType=String(file.type||'').toLowerCase();
 if(/image\/(jpeg|png|webp)/.test(directType)&&file.size>0&&file.size<=TARGET_BYTES)return file;
 const loaded=await loadImage(file),img=loaded.img;
 try{
  let width=img.naturalWidth||img.width,height=img.naturalHeight||img.height;if(!width||!height)throw new Error('image_decode_failed');
  const cap=1600,max0=Math.max(width,height);if(max0>cap){const r=cap/max0;width=Math.max(1,Math.round(width*r));height=Math.max(1,Math.round(height*r))}
  let quality=.82,last=null;
  for(let attempt=0;attempt<18;attempt++){
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('image_encode_failed');ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);
   last=await encodeBest(canvas,quality);if(last&&last.size<=TARGET_BYTES)return last;
   const currentMax=Math.max(width,height);if(currentMax<=320&&last&&last.size<=HARD_LIMIT)return last;
   const sizeRatio=last?.size?Math.sqrt(TARGET_BYTES/last.size):.8;const shrink=Math.max(.62,Math.min(.86,sizeRatio*.93));const nextMax=Math.max(280,Math.round(currentMax*shrink));const scale=nextMax/currentMax;width=Math.max(1,Math.round(width*scale));height=Math.max(1,Math.round(height*scale));quality=Math.max(.28,quality-.055);
  }
  if(last&&last.size<=HARD_LIMIT)return last;
  throw new Error('image_too_large');
 }finally{URL.revokeObjectURL(loaded.url)}
}
async function uploadBlob(blob,index,total){const token=sessionStorage.getItem(TOKEN_KEY)||'';if(!token)throw new Error('unauthorized');setStatus(`Uploading photo ${index} of ${total}…`);const response=await fetch(UPLOAD_API,{method:'POST',headers:{'X-Admin-Token':token,'Content-Type':blob.type||'image/jpeg','Accept':'application/json'},body:blob,cache:'no-store'});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||`upload_${response.status}`);if(!data.url)throw new Error('upload_failed');return data.url}
async function processItem(item,index,total){item.status='optimizing';render();setStatus(`Optimizing photo ${index} of ${total}…`);try{const blob=await compressImage(item.file);item.status='uploading';render();const url=await uploadBlob(blob,index,total);if(item.localUrl)URL.revokeObjectURL(item.localUrl);pending=pending.filter(x=>x!==item);setUrls([...urls(),url]);return true}catch(error){item.status='error';item.error=error?.message||'upload_failed';render();throw error}}
async function runQueue(items){if(!items.length)return;setUploading(true);let added=0,failed=0,lastError='';for(let i=0;i<items.length;i++){try{if(await processItem(items[i],i+1,items.length))added++}catch(error){failed++;lastError=error?.message||'upload_failed'}}setUploading(false);if(added&&failed)setStatus(`${added} photo${added===1?'':'s'} added · ${failed} failed.`,'error');else if(added)setStatus(`${added} photo${added===1?'':'s'} added.`,'ok');else if(lastError==='unauthorized')setStatus('Admin session expired. Unlock the dashboard again.','error');else if(lastError==='image_decode_failed')setStatus('Safari could not read this photo. Try a screenshot or JPEG/PNG.','error');else if(lastError==='image_too_large')setStatus('This photo still exceeded the upload limit. Tap Retry.','error');else setStatus('Photo upload failed. Tap Retry on the thumbnail.','error')}
function filesSignature(files){return files.map(f=>`${f.name}:${f.size}:${f.lastModified}`).join('|')}
function pickFiles(input){const files=[...(input?.files||[])];if(!files.length)return;const signature=filesSignature(files),now=Date.now();if(signature&&signature===lastPickSignature&&now-lastPickAt<1200)return;lastPickSignature=signature;lastPickAt=now;const valid=files.filter(isImage),room=MAX_PREVIEWS-urls().length-pending.length,selected=valid.slice(0,Math.max(0,room));if(!selected.length){setStatus(valid.length?`Maximum ${MAX_PREVIEWS} photos.`:'The selected file is not a supported image.','error');input.value='';return}const items=selected.map(file=>({file,localUrl:safeObjectUrl(file),status:'selected',error:''}));pending.push(...items);render();setStatus(`${items.length} photo${items.length===1?'':'s'} selected. Preparing upload…`);input.value='';requestAnimationFrame(()=>runQueue(items))}
async function retryPending(index){const item=pending[index];if(!item||uploading)return;item.status='selected';item.error='';render();await runQueue([item])}
function enhance(){
 const hidden=$('mod-images');if(!hidden)return false;
 const existing=$('mod-gallery-picker');if(existing)existing.remove();
 const field=hidden.closest('.field');if(!field)return false;const oldRow=hidden.closest('.mods-admin-preview-links')||hidden.parentElement;oldRow.style.display='none';hidden.setAttribute('aria-hidden','true');hidden.tabIndex=-1;
 const helper=[...field.querySelectorAll(':scope > small')].at(-1);if(helper)helper.textContent='Choose up to 12 photos. One photo stays static; two or more become a slider automatically.';
 const picker=document.createElement('div');picker.id='mod-gallery-picker';picker.className='mods-gallery-picker';picker.innerHTML=`<label class="mods-gallery-choose" id="mod-gallery-choose">${plusIcon()}<span class="mods-gallery-label">Choose photos</span><input id="mod-gallery-input" type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,.avif" multiple></label><span class="mods-gallery-summary" id="mod-gallery-summary">No photos selected</span><div class="mods-gallery-grid" id="mod-gallery-grid"></div>`;oldRow.before(picker);
 const input=$('mod-gallery-input'),handle=()=>pickFiles(input);input.addEventListener('change',handle);input.addEventListener('input',handle);hidden.addEventListener('input',render);$('mod-admin-form')?.addEventListener('reset',()=>{pending.forEach(x=>{if(x.localUrl)URL.revokeObjectURL(x.localUrl)});pending=[];setTimeout(render,0)});document.addEventListener('click',event=>{if(event.target.closest('[data-edit],#mod-reset'))setTimeout(render,40)},true);const help=field.closest('form')?.nextElementSibling;if(help?.classList.contains('mods-admin-help'))help.innerHTML='<strong>Easy upload:</strong> choose photos directly from Gallery. The preview appears immediately, then the image uploads automatically.';render();return true
}
function init(){if(enhance())return;const observer=new MutationObserver(()=>{if(enhance())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),12000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
