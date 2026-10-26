/* Site review policy v1. These thresholds estimate configuration load, not measured performance. */
const performanceRules=Object.freeze({
 parse(text){
  if(typeof text!=='string'||!text.trim())throw Error('Paste your launcher settings or select a JSON file first.');
  if(new TextEncoder().encode(text).length>262144)throw Error('This configuration exceeds 256 KB. Export only the graphics settings.');
  let value;try{value=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw Error('This is not valid JSON. Use the complete launcher export, without code fences or script commands.');}
  if(!value||Array.isArray(value)||value.format!=='gtav-graphics-settings'||value.version!==1||!value.settings||typeof value.settings!=='object'||Array.isArray(value.settings))throw Error('Unsupported configuration. Use a version 1 gtav-graphics-settings export from the launcher.');
  return value;
 },
 assess(config,model){
  const findings=[],missing=[];let score=0;const s=config.settings;
  const add=(title,value,points,advice)=>{score+=points;findings.push({title,value,points,advice});};
  const number=(key,allowed)=>{const raw=s[key];if((typeof raw!=='string'&&typeof raw!=='number')||String(raw).trim()===''||!Number.isFinite(Number(raw))||!allowed(Number(raw))){missing.push(key);return null;}return Number(raw);};
  const ram=model?.ram;
  if(!Number.isFinite(ram)||ram<=0||!model?.chip)missing.push('verified device specifications');
  else add('Device memory',`${ram} GB installed`,ram<4?6:ram<=4?3:ram<=6?1:0,ram<=4?'Memory headroom is limited. Start with the launcher’s lowest preset and keep low-memory mode enabled.':'Installed RAM is not the app’s memory allowance. Check your signing entitlements and in-game memory counter.');
  const resolution=typeof s.res==='string'&&/^(\d{2,5})x(\d{2,5})$/.exec(s.res);
  if(!resolution||+resolution[1]<240||+resolution[2]<240||+resolution[1]>8192||+resolution[2]>8192)missing.push('res');
  else{const pixels=+resolution[1]*+resolution[2];add('Render resolution',`${resolution[1]} × ${resolution[2]}`,pixels>1920*1080?3:pixels>1280*720?2:pixels>960*540?1:0,pixels>960*540?'Lower the resolution first if the game feels slow or heats up. Upscaling and frame scaling can change the actual render load; they are not modeled here.':'Low output resolution limits pixel workload. This does not predict FPS.');}
  const texture=number('TextureQuality',n=>[0,1,2].includes(n));if(texture!==null)add('Texture quality',['Normal','High','Very high'][texture],texture,texture>0?'Try Normal textures to reduce graphics memory pressure.':'Normal textures are the lowest recognized texture setting.');
  const msaa=number('MSAA',n=>[0,1,2,4,8].includes(n));if(msaa!==null)add('MSAA',msaa===0?'Off':`Enabled (value ${msaa})`,msaa===0?0:2,msaa===0?'MSAA adds no extra load in this configuration.':'Disable MSAA before increasing resolution or other quality settings.');
  const shadow=number('ShadowQuality',n=>[0,1,2,3].includes(n));if(shadow!==null)add('Shadow quality',`Launcher value ${shadow}`,shadow>1?1:0,shadow>1?'Reduce shadow quality if frame delivery becomes uneven.':'This setting does not add points under the review policy. Advanced shadow options are not scored.');
  if(!['on','off'].includes(s.lowmem))missing.push('lowmem');else add('Low-memory mode',s.lowmem==='on'?'On':'Off',ram<=4&&s.lowmem==='off'?2:0,s.lowmem==='off'&&ram<=4?'Enable low-memory mode for this device.':'The launcher’s actual memory budget still depends on iOS and signing.');
  const cache=number('memrestrict',n=>Number.isInteger(n)&&n>=0&&n<=65536);if(cache!==null)add('Texture cache',`${cache} MB`,Number.isFinite(ram)&&cache>ram*1024*.1?2:0,Number.isFinite(ram)&&cache>ram*1024*.1?'This cache exceeds the review policy’s 10% RAM threshold. Try the launcher’s lowest preset.':'Cache size is only one part of the game’s memory use.');
  const rating=missing.length?'Not assessed':score>=6?'Critical':score>=3?'Serious':'Fair';
  return {rating,score,findings,missing,level:missing.length?'unknown':rating.toLowerCase(),description:missing.length?'A reliable rule-based rating cannot be produced from the available values.':rating==='Critical'?'Several settings or memory constraints need attention before a longer play session.':rating==='Serious'?'This configuration has limited headroom or settings that may add substantial load.':'No major load flags were found in the settings this review checks. Gameplay may still be limited by heat, memory allowance, or unscored settings.'};
 }
});
if(typeof module!=='undefined')module.exports=performanceRules;
if(typeof document!=='undefined')window.performanceAssistant=(()=>{
 const $=id=>document.getElementById(id);const input=$('performance-input'),file=$('performance-file'),run=$('performance-run'),output=$('performance-result'),error=$('performance-error');let model=null,revision=0;

 const studio=$('performance-check'),loading=$('performance-loading');
 const runLabel=run.innerHTML;
 function setStep(step){studio.dataset.step=step;loading.hidden=step!=='checking';studio.setAttribute('aria-busy',String(step==='checking'));document.querySelectorAll('[data-flow-step]').forEach(el=>{if(el.dataset.flowStep===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}
 function focusTool(){document.body.classList.add('performance-focus');studio.scrollIntoView({block:'start',behavior:'instant'});}
 $('performance-back').addEventListener('click',()=>{clearResult();document.body.classList.remove('performance-focus');$('compat-result-title').focus();$('compat-results').scrollIntoView({block:'start',behavior:'instant'});});
 $('performance-edit').addEventListener('click',()=>{clearResult();studio.scrollIntoView({block:'start',behavior:'instant'});document.querySelector('[data-input-mode][aria-pressed="true"]').focus();});
 $('performance-cancel').addEventListener('click',()=>{clearResult();run.focus();});
 document.querySelector('a[href="#performance-check"]').addEventListener('click',()=>focusTool());
 document.querySelectorAll('[data-input-mode]').forEach(button=>button.addEventListener('click',focusTool));
 setStep('input');
 document.querySelectorAll('[data-input-mode]').forEach(button=>button.addEventListener('click',()=>{const isFile=button.dataset.inputMode==='file';document.querySelector('.performance-upload').hidden=!isFile;document.querySelector('.performance-text').hidden=isFile;document.querySelectorAll('[data-input-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(!isFile)input.focus();}));
 const text=(tag,className,content)=>{const e=document.createElement(tag);if(className)e.className=className;e.textContent=content;return e;};
 function clearResult(){revision++;setStep('input');output.hidden=true;error.hidden=true;run.disabled=false;run.innerHTML=runLabel;}
 function reset(next){document.body.classList.remove('performance-focus');model=next;clearResult();$('performance-device').textContent=next.name;}
 input.addEventListener('input',()=>{clearResult();file.value='';$('performance-file-note').textContent='Using pasted settings.';});
 file.addEventListener('change',async()=>{clearResult();const id=revision;input.value='';const selected=file.files[0];if(!selected){$('performance-file-note').textContent='';return;}
 try{if(!/\.(json|txt)$/i.test(selected.name))throw Error('Choose a .json or .txt launcher export.');if(selected.size>262144)throw Error('Choose a settings file smaller than 256 KB.');run.disabled=true;const value=await selected.text();if(id!==revision)return;input.value=value;$('performance-file-note').textContent=selected.name+' · Ready to analyze';}
 catch(e){if(id===revision){error.hidden=false;error.textContent=e.message;$('performance-file-note').textContent='File not loaded.';}}
 finally{if(id===revision)run.disabled=false;}});
 $('performance-clear').addEventListener('click',()=>{clearResult();input.value='';file.value='';$('performance-file-note').textContent='';(document.querySelector('.performance-text').hidden?file:input).focus();});
 $('performance-form').addEventListener('submit',async event=>{event.preventDefault();clearResult();const id=revision;
 try{const config=performanceRules.parse(input.value);run.disabled=true;focusTool();setStep('checking');loading.focus();const stages=['Reading the launcher export','Reviewing memory and graphics settings','Preparing findings and recommendations'];let result;
 for(let i=0;i<stages.length;i++){if(id!==revision)return;$('performance-stage').textContent=stages[i];$('performance-stage-note').textContent=`Step ${i+1} of 3`;const bar=document.querySelector('.review-progress');bar.setAttribute('aria-valuenow',String(i+1));bar.firstElementChild.style.width=((i+1)/3*100)+'%';if(i===1)result=performanceRules.assess(config,model);await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?150:850));}if(id!==revision)return;setStep('done');output.dataset.level=result.level;$('performance-rating').textContent=result.rating;$('performance-description').textContent=result.description;
 $('performance-context').textContent=`Reviewed for ${model.name} · ${model.chip||'Unverified chip'} · ${model.ram??'Unverified'} GB RAM. `+(result.missing.length?`Missing or unsupported values: ${result.missing.join(', ')}. No overall rating assigned.`:`Policy score: ${result.score}. File device metadata does not affect this assessment.`);
 const list=$('performance-findings');list.replaceChildren();result.findings.forEach(f=>{const row=text('article','performance-finding','');row.dataset.flag=f.points>0?'attention':'neutral';const head=text('div','finding-heading','');head.append(text('h4','',f.title),text('span','finding-value',f.value));row.append(head,text('p','',f.advice),text('span','finding-points',f.points?'Review':'Within guideline'));list.append(row);});output.hidden=false;$('performance-rating').focus();output.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 }catch(e){setStep('input');error.textContent=e.message;error.hidden=false;}
 finally{if(id===revision){run.disabled=false;run.innerHTML=runLabel;}}});
 return {reset};
})();
