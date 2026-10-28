(()=>{
'use strict';
if(window.__gtavAdminModsGalleryV1)return;window.__gtavAdminModsGalleryV1=true;
const TOKEN_KEY='gtav-admin-token-v2',UPLOAD_API='/api/mod-images',MAX_PREVIEWS=12,TARGET_BYTES=520000;
const $=id=>document.getElementById(id);
let pending=[],uploading=false;
const unique=values=>{const seen=new Set();return values.map(v=>String(v||'').trim()).filter(v=>{if(!v||seen.has(v))return false;seen.add(v);return true}).slice(0,MAX_PREVIEWS)};
const urls=()=>unique(($('mod-images')?.value||'').split(/\r?\n/));
const setStatus=(text,type='')=>{const el=$('mod-form-status');if(!el)return;el.textContent=text;el.className='mods-admin-status'+(type?' '+type:'')};
function setUrls(values){const input=$('mod-images');if(!input)return;input.value=unique(values).join('\n');input.dispatchEvent(new Event('input',{bubbles:true}));render()}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function fileButtonIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'}
function isImageFile(file){const type=String(file?.type||'').toLowerCase(),name=String(file?.name||'').toLowerCase();return type.startsWith('image/')||/\.(jpe?g|png|webp|heic|heif|avif)$/i.test(name)}
function setUploading(value){uploading=!!value;const picker=$('mod-gallery-picker'),submit=$('mod-submit');picker?.classList.toggle('is-uploading',uploading);if(submit)submit.disabled=uploading;render()}

async function decodeImage(file){
 if('createImageBitmap'in window){try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch{}}
 const url=URL.createObjectURL(file);try{const img=new Image();img.decoding='async';img.src=url;if(img.decode)await img.decode();else await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject});return img}finally{setTimeout(()=>URL.revokeObjectURL(url),2500)}
}
function canvasBlob(canvas,type,quality){return new Promise(resolve=>canvas.toBlob(resolve,type,quality))}
async function compressImage(file){
 let img;try{img=await decodeImage(file)}catch(error){
   const safe=/^image\/(jpeg|png|webp)$/i.test(file.type||'')&&file.size<=680000;
   if(safe)return file;
   throw new Error('image_decode_failed');
 }
 let width=img.naturalWidth||img.width,height=img.naturalHeight||img.height;if(!width||!height){img.close?.();throw new Error('image_decode_failed')}
 const maxSide=1600;if(Math.max(width,height)>maxSide){const scale=maxSide/Math.max(width,height);width=Math.max(1,Math.round(width*scale));height=Math.max(1,Math.round(height*scale))}
 let canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;let ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(img,0,0,width,height);img.close?.();
 let quality=.84,blob=await canvasBlob(canvas,'image/webp',quality);if(!blob)blob=await canvasBlob(canvas,'image/jpeg',.84);
 for(let pass=0;blob&&blob.size>TARGET_BYTES&&pass<7;pass++){
   quality=Math.max(.46,quality-.07);
   if(pass===2||pass===4||pass===6){const nextW=Math.max(640,Math.round(canvas.width*.84)),nextH=Math.max(360,Math.round(canvas.height*.84));const next=document.createElement('canvas');next.width=nextW;next.height=nextH;next.getContext('2d',{alpha:false}).drawImage(canvas,0,0,nextW,nextH);canvas=next}
   blob=await canvasBlob(canvas,'image/webp',quality)||await canvasBlob(canvas,'image/jpeg',quality);
 }
 if(!blob)throw new Error('image_encode_failed');if(blob.size>680000)throw new Error('image_too_large');return blob;
}
async function uploadBlob(blob,index,total){
 const token=sessionStorage.getItem(TOKEN_KEY)||'';if(!token)throw new Error('unauthorized');setStatus(`Uploading photo ${index} of ${total}…`);
 const response=await fetch(UPLOAD_API,{method:'POST',headers:{'X-Admin-Token':token,'Content-Type':blob.type||'image/jpeg'},body:blob,cache:'no-store'});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||'upload_failed');if(!data.url)throw new Error('upload_failed');return data.url;
}
async function processPending(item,index,total){
 item.status='optimizing';render();setStatus(`Optimizing photo ${index} of ${total}…`);
 try{const blob=await compressImage(item.file);item.status='uploading';render();const url=await uploadBlob(blob,index,total);item.status='done';URL.revokeObjectURL(item.localUrl);pending=pending.filter(x=>x!==item);setUrls([...urls(),url]);return true}
 catch(error){item.status='error';item.error=error.message;render();throw error}
}
async function chooseFiles(event){
 const input=event.currentTarget;const picked=[...(input.files||[])];input.value='';
 const files=picked.filter(isImageFile);if(!picked.length)return;if(!files.length){setStatus('The selected file is not a supported image.','error');return}
 const current=urls();const room=MAX_PREVIEWS-current.length-pending.length;if(room<=0){setStatus(`Maximum ${MAX_PREVIEWS} photos.`,'error');return}
 const selected=files.slice(0,room);
 const items=selected.map(file=>({file,localUrl:URL.createObjectURL(file),status:'queued',error:''}));pending.push(...items);render();setUploading(true);
 let added=0,failed=0,lastError='';
 for(let i=0;i<items.length;i++){
   try{if(await processPending(items[i],i+1,items.length))added++}
   catch(error){failed++;lastError=error.message}
 }
 setUploading(false);
 if(added&&failed)setStatus(`${added} photo${added===1?'':'s'} added · ${failed} failed.`,'error');
 else if(added)setStatus(`${added} photo${added===1?'':'s'} added.`,'ok');
 else{
   const message=lastError==='unauthorized'?'Admin session expired.':lastError==='image_decode_failed'?'Safari could not decode this photo. Try selecting it again or use a JPEG/PNG screenshot.':lastError==='image_too_large'?'The photo could not be compressed enough.':'Photo upload failed. Please select it again.';
   setStatus(message,'error');
 }
}
async function retryPending(index){const item=pending[index];if(!item||uploading)return;setUploading(true);try{await processPending(item,1,1);setStatus('Photo added.','ok')}catch(error){const message=error.message==='image_decode_failed'?'Safari could not decode this photo. Try a JPEG/PNG screenshot.':'Photo upload failed. Tap Retry.';setStatus(message,'error')}finally{setUploading(false)}}
function removePending(index){const item=pending[index];if(!item)return;URL.revokeObjectURL(item.localUrl);pending.splice(index,1);render()}
function removeAt(index){const list=urls();list.splice(index,1);setUrls(list);setStatus('Photo removed from this mod.','ok')}
function render(){
 const grid=$('mod-gallery-grid'),summary=$('mod-gallery-summary');if(!grid||!summary)return;const list=urls(),total=list.length+pending.length;
 summary.textContent=pending.length?`${list.length} uploaded · ${pending.length} processing/failed`:list.length===0?'No photos selected':list.length===1?'1 photo · static thumbnail':`${list.length} photos · slider enabled`;
 grid.replaceChildren();
 list.forEach((url,index)=>{const item=document.createElement('div');item.className='mods-gallery-item';item.innerHTML=`<img src="${escapeHtml(url)}" alt="Thumbnail ${index+1}" loading="lazy"><span>${index===0?'Primary':String(index+1).padStart(2,'0')}</span><button type="button" aria-label="Remove photo ${index+1}">×</button>`;item.querySelector('button').addEventListener('click',()=>removeAt(index));grid.append(item)});
 pending.forEach((entry,index)=>{const item=document.createElement('div');item.className='mods-gallery-item is-pending '+(entry.status==='error'?'has-error':'');const status=entry.status==='error'?'Upload failed':entry.status==='uploading'?'Uploading…':entry.status==='optimizing'?'Optimizing…':'Selected';item.innerHTML=`<img src="${escapeHtml(entry.localUrl)}" alt="Selected photo"><span>${status}</span><button type="button" aria-label="Remove selected photo">×</button>${entry.status==='error'?'<button class="mods-gallery-retry" type="button">Retry</button>':''}`;item.querySelector('button[aria-label]').addEventListener('click',()=>removePending(index));item.querySelector('.mods-gallery-retry')?.addEventListener('click',event=>{event.stopPropagation();retryPending(index)});grid.append(item)});
 const choose=$('mod-gallery-choose');if(choose){const full=total>=MAX_PREVIEWS;choose.classList.toggle('is-full',full);choose.querySelector('.mods-gallery-label').textContent=list.length||pending.length?'Add photos':'Choose photos';choose.querySelector('input').disabled=full||uploading}
}
function enhance(){
 const hidden=$('mod-images');if(!hidden||$('mod-gallery-picker'))return false;const field=hidden.closest('.field');if(!field)return false;
 const oldRow=hidden.closest('.mods-admin-preview-links')||hidden.parentElement;oldRow.style.display='none';hidden.setAttribute('aria-hidden','true');hidden.tabIndex=-1;
 const helper=[...field.querySelectorAll(':scope > small')].at(-1);if(helper)helper.textContent='Choose up to 12 photos from your device. One photo stays static; two or more automatically become a slider.';
 const picker=document.createElement('div');picker.id='mod-gallery-picker';picker.className='mods-gallery-picker';picker.innerHTML=`<label class="mods-gallery-choose" id="mod-gallery-choose">${fileButtonIcon()}<span class="mods-gallery-label">Choose photos</span><input id="mod-gallery-input" type="file" accept="image/*,.heic,.heif,.avif" multiple></label><span class="mods-gallery-summary" id="mod-gallery-summary">No photos selected</span><div class="mods-gallery-grid" id="mod-gallery-grid"></div>`;oldRow.before(picker);
 $('mod-gallery-input').addEventListener('change',chooseFiles);hidden.addEventListener('input',render);$('mod-admin-form')?.addEventListener('reset',()=>{pending.forEach(x=>URL.revokeObjectURL(x.localUrl));pending=[];setTimeout(render,0)});
 document.addEventListener('click',event=>{if(event.target.closest('[data-edit]'))setTimeout(render,30);if(event.target.closest('#mod-reset'))setTimeout(render,30)},true);
 const help=field.closest('form')?.nextElementSibling;if(help?.classList.contains('mods-admin-help'))help.innerHTML='<strong>Easy upload:</strong> choose photos directly from your device. A local preview appears immediately while the image is optimized and uploaded.';
 render();return true;
}
function init(){if(enhance())return;const observer=new MutationObserver(()=>{if(enhance())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),8000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
