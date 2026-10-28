(()=>{
'use strict';
if(window.__gtavAdminModsGalleryV1)return;window.__gtavAdminModsGalleryV1=true;
const TOKEN_KEY='gtav-admin-token-v2',UPLOAD_API='/api/mod-images',MAX_PREVIEWS=12,TARGET_BYTES=520000;
const $=id=>document.getElementById(id);
const unique=values=>{const seen=new Set();return values.map(v=>String(v||'').trim()).filter(v=>{if(!v||seen.has(v))return false;seen.add(v);return true}).slice(0,MAX_PREVIEWS)};
const urls=()=>unique(($('mod-images')?.value||'').split(/\r?\n/));
const setStatus=(text,type='')=>{const el=$('mod-form-status');if(!el)return;el.textContent=text;el.className='mods-admin-status'+(type?' '+type:'')};
function setUrls(values){const input=$('mod-images');if(!input)return;input.value=unique(values).join('\n');input.dispatchEvent(new Event('input',{bubbles:true}));render()}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function fileButtonIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'}

async function decodeImage(file){const url=URL.createObjectURL(file);try{const img=new Image();img.decoding='async';img.src=url;if(img.decode)await img.decode();else await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject});return img}finally{setTimeout(()=>URL.revokeObjectURL(url),1500)}}
function canvasBlob(canvas,type,quality){return new Promise(resolve=>canvas.toBlob(resolve,type,quality))}
async function compressImage(file){
 const img=await decodeImage(file);let width=img.naturalWidth||img.width,height=img.naturalHeight||img.height;const maxSide=1600;if(Math.max(width,height)>maxSide){const scale=maxSide/Math.max(width,height);width=Math.max(1,Math.round(width*scale));height=Math.max(1,Math.round(height*scale))}
 let canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;let ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(img,0,0,width,height);
 let quality=.82,blob=await canvasBlob(canvas,'image/webp',quality);if(!blob)blob=await canvasBlob(canvas,'image/jpeg',.82);
 for(let pass=0;blob&&blob.size>TARGET_BYTES&&pass<6;pass++){
   quality=Math.max(.48,quality-.08);
   if(pass===2||pass===4){const nextW=Math.max(720,Math.round(canvas.width*.84)),nextH=Math.max(405,Math.round(canvas.height*.84));const next=document.createElement('canvas');next.width=nextW;next.height=nextH;next.getContext('2d',{alpha:false}).drawImage(canvas,0,0,nextW,nextH);canvas=next}
   blob=await canvasBlob(canvas,'image/webp',quality)||await canvasBlob(canvas,'image/jpeg',quality);
 }
 if(!blob)throw new Error('image_encode_failed');if(blob.size>680000)throw new Error('image_too_large');return blob;
}
async function uploadBlob(blob,index,total){
 const token=sessionStorage.getItem(TOKEN_KEY)||'';if(!token)throw new Error('unauthorized');setStatus(`Uploading photo ${index} of ${total}…`);
 const response=await fetch(UPLOAD_API,{method:'POST',headers:{'X-Admin-Token':token,'Content-Type':blob.type||'image/webp'},body:blob,cache:'no-store'});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data.error||'upload_failed');return data.url;
}
async function chooseFiles(event){
 const input=event.currentTarget;const files=[...(input.files||[])].filter(file=>file.type.startsWith('image/'));input.value='';if(!files.length)return;
 const current=urls();const room=MAX_PREVIEWS-current.length;if(room<=0){setStatus(`Maximum ${MAX_PREVIEWS} photos.`, 'error');return}
 const selected=files.slice(0,room);input.disabled=true;const picker=$('mod-gallery-picker');picker?.classList.add('is-uploading');try{
   const added=[];for(let i=0;i<selected.length;i++){setStatus(`Optimizing photo ${i+1} of ${selected.length}…`);const blob=await compressImage(selected[i]);const url=await uploadBlob(blob,i+1,selected.length);added.push(url);setUrls([...current,...added])}
   setStatus(`${added.length} photo${added.length===1?'':'s'} added.`, 'ok');
 }catch(error){const message=error.message==='unauthorized'?'Admin session expired.':error.message==='image_too_large'?'One photo could not be compressed enough.':'Could not upload the selected photo.';setStatus(message,'error')}
 finally{input.disabled=false;picker?.classList.remove('is-uploading');render()}
}
function removeAt(index){const list=urls();list.splice(index,1);setUrls(list);setStatus('Photo removed from this mod.','ok')}
function render(){
 const grid=$('mod-gallery-grid'),summary=$('mod-gallery-summary');if(!grid||!summary)return;const list=urls();summary.textContent=list.length===0?'No photos selected':list.length===1?'1 photo · static thumbnail':`${list.length} photos · slider enabled`;
 grid.replaceChildren();list.forEach((url,index)=>{const item=document.createElement('div');item.className='mods-gallery-item';item.innerHTML=`<img src="${escapeHtml(url)}" alt="Thumbnail ${index+1}" loading="lazy"><span>${index===0?'Primary':String(index+1).padStart(2,'0')}</span><button type="button" aria-label="Remove photo ${index+1}">×</button>`;item.querySelector('button').addEventListener('click',()=>removeAt(index));grid.append(item)});
 const choose=$('mod-gallery-choose');if(choose){choose.classList.toggle('is-full',list.length>=MAX_PREVIEWS);choose.querySelector('.mods-gallery-label').textContent=list.length?'Add photos':'Choose photos';choose.querySelector('input').disabled=list.length>=MAX_PREVIEWS||choose.closest('.is-uploading')!==null}
}
function enhance(){
 const hidden=$('mod-images');if(!hidden||$('mod-gallery-picker'))return false;const field=hidden.closest('.field');if(!field)return false;
 const oldRow=hidden.closest('.mods-admin-preview-links')||hidden.parentElement;oldRow.style.display='none';hidden.setAttribute('aria-hidden','true');hidden.tabIndex=-1;
 const helper=[...field.querySelectorAll(':scope > small')].at(-1);if(helper)helper.textContent='Choose up to 12 photos from your device. One photo stays static; two or more automatically become a slider.';
 const picker=document.createElement('div');picker.id='mod-gallery-picker';picker.className='mods-gallery-picker';picker.innerHTML=`<label class="mods-gallery-choose" id="mod-gallery-choose">${fileButtonIcon()}<span class="mods-gallery-label">Choose photos</span><input id="mod-gallery-input" type="file" accept="image/*" multiple></label><span class="mods-gallery-summary" id="mod-gallery-summary">No photos selected</span><div class="mods-gallery-grid" id="mod-gallery-grid"></div>`;oldRow.before(picker);
 $('mod-gallery-input').addEventListener('change',chooseFiles);hidden.addEventListener('input',render);$('mod-admin-form')?.addEventListener('reset',()=>setTimeout(render,0));
 document.addEventListener('click',event=>{if(event.target.closest('[data-edit]'))setTimeout(render,30);if(event.target.closest('#mod-reset'))setTimeout(render,30)},true);
 const help=field.closest('form')?.nextElementSibling;if(help?.classList.contains('mods-admin-help'))help.innerHTML='<strong>Easy upload:</strong> choose photos directly from your device. Images are optimized automatically before upload; multiple photos become a slider automatically.';
 render();return true;
}
function init(){if(enhance())return;const observer=new MutationObserver(()=>{if(enhance())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),8000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
