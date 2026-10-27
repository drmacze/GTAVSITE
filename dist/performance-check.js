/* Port-aware configuration review v2. These rules model configuration risk
   from the current GTA5 binary; they are not an FPS benchmark or a native
   memory/thermal measurement. */
const performanceRules=Object.freeze({
 parse(text){
  if(typeof text!=='string'||!text.trim())throw Error('Paste your launcher settings or select a JSON file first.');
  if(new TextEncoder().encode(text).length>262144)throw Error('This configuration exceeds 256 KB. Export only the graphics settings.');
  let value;try{value=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw Error('This is not valid JSON. Use the complete launcher export, without code fences or script commands.');}
  if(!value||Array.isArray(value)||value.format!=='gtav-graphics-settings'||value.version!==1||!value.settings||typeof value.settings!=='object'||Array.isArray(value.settings))throw Error('Unsupported configuration. Use a version 1 gtav-graphics-settings export from the launcher.');
  return value;
 },
 physicalTier(ram){
  const value=Number(ram);if(!Number.isFinite(value)||value<=0)return null;
  if(value<=4.5)return 4;if(value<=6.5)return 6;if(value<=10)return 8;return 12;
 },
 tierBudget(tier){
  if(tier===4)return {textureCacheMB:400,streamingVirtualMB:400,streamingPhysicalMB:128};
  if(tier===6)return {textureCacheMB:850,streamingVirtualMB:600,streamingPhysicalMB:160};
  if(tier===8)return {textureCacheMB:1300,streamingVirtualMB:800,streamingPhysicalMB:200};
  return {textureCacheMB:1600,streamingVirtualMB:1000,streamingPhysicalMB:252};
 },
 recommendedTexture(ram){const value=Number(ram);if(!Number.isFinite(value))return null;if(value<6)return 0;if(value<8)return 1;return 2;},
 assess(config,model){
  const findings=[],missing=[];let score=0;const s=config.settings;
  const add=(title,value,points,advice)=>{score+=points;findings.push({title,value,points,advice});};
  const number=(key,allowed)=>{const raw=s[key];if((typeof raw!=='string'&&typeof raw!=='number')||String(raw).trim()===''||!Number.isFinite(Number(raw))||!allowed(Number(raw))){missing.push(key);return null;}return Number(raw);};
  const ram=model?.ram,tier=this.physicalTier(ram),budget=tier?this.tierBudget(tier):null;
  if(!Number.isFinite(ram)||ram<=0||!model?.chip)missing.push('verified device specifications');
  else{
   const points=ram<4?6:ram<=4.5?3:ram<=6.5?1:0;
   const advice=ram<4?'Installed RAM is below the community minimum. The port has a low-memory path, but app-memory entitlements cannot add physical RAM.':ram<=4.5?'The current GTA5 executable automatically enables Low-Memory Profile at or below 4.5 GB. Keep it enabled and use Normal textures.':`Physical RAM maps to port tier ${tier}. The effective tier may still be lower if iOS grants the app less memory.`;
   add('Port memory tier',`${ram} GB · tier ${tier}`,points,advice);
  }
  const resolution=typeof s.res==='string'&&/^(\d{2,5})x(\d{2,5})$/.exec(s.res);
  if(!resolution||+resolution[1]<240||+resolution[2]<240||+resolution[1]>8192||+resolution[2]>8192)missing.push('res');
  else{const pixels=+resolution[1]*+resolution[2];add('Render resolution',`${resolution[1]} × ${resolution[2]}`,pixels>1920*1080?3:pixels>1280*720?2:pixels>960*540?1:0,pixels>960*540?'Lower render resolution before increasing expensive effects if memory pressure, heat, or unstable frame delivery appears. Upscaling can change actual render cost.':'This is a relatively light pixel workload, but it does not predict FPS.');}
  const texture=number('TextureQuality',n=>[0,1,2].includes(n));
  if(texture!==null){const recommended=this.recommendedTexture(ram);const labels=['Normal','High','Very High'];const points=recommended===null?0:Math.max(0,texture-recommended);const recommendation=recommended===null?'Texture tier cannot be matched without verified RAM.':`The current port guidance maps this physical RAM to ${labels[recommended]} textures before considering the lower native app-memory allowance.`;add('Texture quality',labels[texture],points,recommendation);}
  const msaa=number('MSAA',n=>[0,1,2,4,8].includes(n));
  if(msaa!==null){const points=msaa>=8?3:msaa>=4?2:msaa>=2?1:0;add('MSAA',msaa===0?'Off':`${msaa}×`,points,msaa===0?'MSAA is disabled. The port notes that MSAA can multiply 3D frame memory/GPU work.':'The port warns that MSAA can cost roughly 2–8× the memory/GPU work of the 3D frame. Disable it before raising other expensive settings.');}
  const shadow=number('ShadowQuality',n=>[0,1,2,3].includes(n));if(shadow!==null)add('Shadow quality',`Launcher value ${shadow}`,shadow>1?1:0,shadow>1?'Reduce shadow quality when targeting lower-memory or thermally constrained devices.':'This shadow setting does not add a risk point.');
  if(!['on','off'].includes(s.lowmem))missing.push('lowmem');else add('Low-Memory Profile',s.lowmem==='on'?'On':'Off',Number.isFinite(ram)&&ram<=4.5&&s.lowmem==='off'?3:0,Number.isFinite(ram)&&ram<=4.5&&s.lowmem==='off'?'Enable Low-Memory Profile. The current executable automatically selects it at ≤4.5 GB unless explicitly overridden.':Number.isFinite(ram)&&ram<=4.5?'Correct for the port’s automatic low-memory threshold.':'Physical RAM is above the port’s automatic low-memory threshold.');
  const cache=number('memrestrict',n=>Number.isInteger(n)&&n>=0&&n<=65536);
  if(cache!==null){const cap=budget?.textureCacheMB??null;const points=cap!==null&&cache>cap?2:0;add('Texture cache',`${cache} MB`,points,cap===null?'A port memory-tier cache budget cannot be calculated without verified RAM.':cache>cap?`This exceeds the ${cap} MB texture-cache budget associated with physical tier ${tier}. The real cap can be lower if iOS grants a smaller app-memory allowance.`:`This is within the ${cap} MB texture-cache budget associated with physical tier ${tier}. Native app-memory allowance can still reduce the effective budget.`);}
  const rating=missing.length?'Not assessed':score>=7?'Critical':score>=3?'Serious':'Fair';
  return {rating,score,findings,missing,level:missing.length?'unknown':rating.toLowerCase(),description:missing.length?'A reliable port-aware rating cannot be produced from the available values.':rating==='Critical'?'The configuration conflicts with several port memory or graphics constraints and needs adjustment before a longer session.':rating==='Serious'?'The configuration can run into limited memory, expensive graphics work, or constrained port paths. Review the highlighted items.':'No major configuration conflicts were found in the settings this review can inspect. Native app-memory allowance, heat, and scene complexity can still limit stability.'};
 }
});
if(typeof module!=='undefined')module.exports=performanceRules;
if(typeof document!=='undefined')window.performanceAssistant=(()=>{
 const $=id=>document.getElementById(id);const input=$('performance-input'),file=$('performance-file'),run=$('performance-run'),output=$('performance-result'),error=$('performance-error');let model=null,revision=0;
 const studio=$('performance-check'),loading=$('performance-loading');const runLabel=run.innerHTML;
 function setStep(step){studio.dataset.step=step;loading.hidden=step!=='checking';studio.setAttribute('aria-busy',String(step==='checking'));document.querySelectorAll('[data-flow-step]').forEach(el=>{if(el.dataset.flowStep===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}
 function focusTool(){document.body.classList.add('performance-focus');studio.scrollIntoView({block:'start',behavior:'instant'});}
 $('performance-back').addEventListener('click',()=>{clearResult();document.body.classList.remove('performance-focus');$('compat-result-title').focus();$('compat-results').scrollIntoView({block:'start',behavior:'instant'});});
 $('performance-edit').addEventListener('click',()=>{clearResult();studio.scrollIntoView({block:'start',behavior:'instant'});document.querySelector('[data-input-mode][aria-pressed="true"]').focus();});
 $('performance-cancel').addEventListener('click',()=>{clearResult();run.focus();});
 document.querySelector('a[href="#performance-check"]').addEventListener('click',()=>focusTool());
 document.querySelectorAll('[data-input-mode]').forEach(button=>button.addEventListener('click',focusTool));setStep('input');
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
 try{const config=performanceRules.parse(input.value);run.disabled=true;focusTool();setStep('checking');loading.focus();const stages=['Reading the launcher export','Applying port memory and graphics rules','Preparing findings and recommendations'];let result;
 for(let i=0;i<stages.length;i++){if(id!==revision)return;$('performance-stage').textContent=stages[i];$('performance-stage-note').textContent=`Step ${i+1} of 3`;const bar=document.querySelector('.review-progress');bar.setAttribute('aria-valuenow',String(i+1));bar.firstElementChild.style.width=((i+1)/3*100)+'%';if(i===1)result=performanceRules.assess(config,model);await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?150:850));}if(id!==revision)return;setStep('done');output.dataset.level=result.level;$('performance-rating').textContent=result.rating;$('performance-description').textContent=result.description;
 const tier=performanceRules.physicalTier(model.ram);$('performance-context').textContent=`Reviewed for ${model.name} · ${model.chip||'Unverified chip'} · ${model.ram??'Unverified'} GB RAM${tier?` · physical tier ${tier}`:''}. `+(result.missing.length?`Missing or unsupported values: ${result.missing.join(', ')}. No overall rating assigned.`:`Port-aware score: ${result.score}. Native app-memory allowance is not available to the browser.`);
 const list=$('performance-findings');list.replaceChildren();result.findings.forEach(f=>{const row=text('article','performance-finding','');row.dataset.flag=f.points>0?'attention':'neutral';const head=text('div','finding-heading','');head.append(text('h4','',f.title),text('span','finding-value',f.value));row.append(head,text('p','',f.advice),text('span','finding-points',f.points?'Review':'Within guideline'));list.append(row);});output.hidden=false;$('performance-rating').focus();output.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 }catch(e){setStep('input');error.textContent=e.message;error.hidden=false;}
 finally{if(id===revision){run.disabled=false;run.innerHTML=runLabel;}}});
 return {reset};
})();
