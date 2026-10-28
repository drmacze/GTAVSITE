(()=>{
'use strict';
const path=(location.pathname||'').replace(/\/+$/,'');
if(!(path.endsWith('/compatibility')||path.endsWith('/compatibility.html')))return;
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
ready(()=>{
 const results=document.querySelector('#compat-results');
 const hardwareGrid=document.querySelector('#hardware-grid');
 const runtimeGrid=document.querySelector('#runtime-grid');
 const required=document.querySelector('.optional-checks');
 if(!results||!hardwareGrid||!runtimeGrid||!required)return;

 const icon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','assets/icons.svg#'+name);svg.append(use);return svg};
 const text=(tag,className,value)=>{const n=document.createElement(tag);if(className)n.className=className;if(value!==undefined)n.textContent=value;return n};

 /* Plain-language setup copy. */
 const eyebrow=document.querySelector('.compat-heading .eyebrow span');if(eyebrow)eyebrow.textContent='COMPATIBILITY';
 const heading=document.querySelector('.compat-heading h1');if(heading){heading.textContent='Can this iPhone run it?';heading.removeAttribute('data-shine')}
 const intro=document.querySelector('.compat-heading p');if(intro)intro.textContent='Enter your iOS version and free storage. We’ll compare your saved iPhone with the current GTA V iOS port requirements.';
 const step=document.querySelector('.compat-step');if(step)step.textContent='YOUR IPHONE';
 const lookup=document.querySelector('.lookup-tag');if(lookup)lookup.textContent='Saved from Welcome';
 const summary=required.querySelector('summary');if(summary){summary.childNodes[0].nodeValue='Device details ';const badge=summary.querySelector('span');if(badge)badge.textContent=''}
 const requiredNote=required.querySelector(':scope>p');if(requiredNote)requiredNote.textContent='iOS version and free storage are needed for an accurate result.';
 const caption=document.querySelector('.compat-caption');if(caption)caption.textContent='Uses your saved iPhone model. No live hardware access is performed by the browser.';

 /* App-memory is useful, but it is an advanced native metric. Keep it out of the main task. */
 const advanced=document.createElement('details');advanced.className='compat-advanced';
 const advancedSummary=document.createElement('summary');advancedSummary.textContent='Advanced memory (optional)';advanced.append(advancedSummary);
 required.insertAdjacentElement('afterend',advanced);
 function collectAdvancedField(){const field=document.querySelector('.compat-app-memory-field');if(field&&field.parentElement!==advanced)advanced.append(field)}
 collectAdvancedField();

 /* One concise result dashboard. The original detailed cards remain as technical data. */
 const title=text('div','compat-summary-title');title.append(text('h3','', 'Compatibility checks'),text('span','', 'Current port'));
 const summaryGrid=text('div','compat-summary-grid');summaryGrid.id='compat-summary-grid';
 const actions=text('div','compat-result-actions');
 const benchmarkButton=text('button','primary','FPS Benchmark');benchmarkButton.type='button';benchmarkButton.append(icon('arrow-right'));
 const editButton=text('button','','Edit details');editButton.type='button';editButton.append(icon('arrow-right'));
 actions.append(benchmarkButton,editButton);
 const tech=document.createElement('details');tech.className='compat-tech';
 const techSummary=document.createElement('summary');techSummary.textContent='Technical details';
 const techBody=text('div','compat-tech-body');tech.append(techSummary,techBody);
 const verdict=document.querySelector('#compat-verdict');
 if(verdict){verdict.insertAdjacentElement('afterend',title);title.insertAdjacentElement('afterend',summaryGrid)}
 const memorySupport=document.querySelector('#memory-support');
 if(memorySupport)memorySupport.insertAdjacentElement('afterend',actions);else summaryGrid.insertAdjacentElement('afterend',actions);
 actions.insertAdjacentElement('afterend',tech);

 function moveTechnicalNodes(){
  collectAdvancedField();
  const candidates=[hardwareGrid,document.querySelector('.runtime-heading'),runtimeGrid,document.querySelector('.port-evidence'),document.querySelector('.compat-footnote'),document.querySelector('.compat-sources')];
  candidates.forEach(node=>{if(node&&node.parentElement!==techBody)techBody.append(node)});
 }
 moveTechnicalNodes();

 const labelOf=card=>card?.querySelector('.hardware-label')?.textContent.trim()||'';
 const findCard=(root,label)=>[...root.querySelectorAll('.hardware-card')].find(card=>labelOf(card).toLowerCase()===label.toLowerCase());
 const levelOf=card=>card?.classList.contains('critical')?'critical':card?.classList.contains('minimum')?'minimum':card?.classList.contains('headroom')?'headroom':'information';
 const stateOf=card=>card?.querySelector('.hardware-badge')?.textContent.trim()||'';
 function makeSummaryCard(label,card,fallback='Not available'){
  const item=text('article','compat-summary-card');item.dataset.level=levelOf(card);
  const value=card?.querySelector('h3')?.textContent.trim()||fallback;
  const status=stateOf(card);
  item.append(text('span','',label),text('strong','',value));
  if(status)item.append(text('small','',status));
  return item;
 }
 function rebuildSummary(){
  const soc=findCard(hardwareGrid,'System on chip');
  const gpu=findCard(hardwareGrid,'GPU');
  const ram=findCard(hardwareGrid,'Installed RAM');
  const ios=findCard(runtimeGrid,'Installed iOS');
  const storage=findCard(runtimeGrid,'Free storage');
  summaryGrid.replaceChildren(
   makeSummaryCard('Chip',soc),
   makeSummaryCard('GPU',gpu),
   makeSummaryCard('RAM',ram),
   makeSummaryCard('iOS',ios),
   makeSummaryCard('Free storage',storage)
  );
 }
 rebuildSummary();

 let structuring=false;
 const observer=new MutationObserver(()=>{
  if(structuring)return;structuring=true;
  queueMicrotask(()=>{moveTechnicalNodes();rebuildSummary();structuring=false});
 });
 observer.observe(results,{childList:true,subtree:true});

 editButton.addEventListener('click',()=>{
  document.body.classList.remove('benchmark-open');
  document.querySelector('#compat-details')?.click();
 });

 /* Native GTA V benchmark: real game output, not a browser FPS estimate. */
 const presets={
  saver:{name:'Battery Saver',caption:'Lowest load',description:'Prioritize stability, temperature and memory headroom.'},
  balanced:{name:'Balanced',caption:'Recommended start',description:'A practical starting point for most supported devices.'},
  performance:{name:'Performance',caption:'60 FPS target',description:'Lower image cost to chase higher frame rate on stronger devices.'},
  quality:{name:'Quality',caption:'Image quality',description:'Higher resolution and visual quality with a lower frame-rate target.'},
  custom:{name:'Custom',caption:'Your settings',description:'Test the exact configuration you already use in the launcher.'}
 };
 const lab=text('section','fps-lab');lab.id='fps-benchmark-lab';
 lab.innerHTML=`
  <div class="fps-lab-head"><div><span class="fps-lab-kicker">NATIVE GAME TEST</span><h3>FPS Benchmark</h3><p>Choose a preset, run GTA V’s built-in Benchmark in the launcher, then import the result. Safari does not generate the FPS numbers.</p></div><button type="button" class="fps-back">Back to compatibility</button></div>
  <div class="fps-flow"><span>1&nbsp; Choose preset</span><span>2&nbsp; Run Benchmark</span><span>3&nbsp; Import result</span></div>
  <div class="fps-presets" role="group" aria-label="Graphics preset"></div>
  <div class="fps-preset-detail"><div><span class="fps-small">SELECTED PRESET</span><h4 id="fps-preset-title"></h4><p id="fps-preset-copy"></p></div><div class="fps-setting-grid" id="fps-setting-grid"></div></div>
  <div class="fps-import"><div><strong>Import benchmark result</strong><p>Choose <code>Benchmark-*.txt</code>. You may also add <code>FrameTimes-Pass*.txt</code> for 1% low FPS.</p></div><input id="fps-benchmark-files" type="file" accept=".txt,.log,text/plain" multiple><div id="fps-benchmark-error" class="fps-error" role="alert" hidden></div></div>
  <div class="fps-output" id="fps-output" hidden><div class="fps-output-head"><div><span class="fps-small">RESULT</span><h4 id="fps-rating"></h4><p id="fps-output-context"></p></div></div><div class="fps-metrics"><div><span>Average</span><strong id="fps-avg">—</strong></div><div><span>1% low</span><strong id="fps-low">—</strong></div><div><span>Minimum</span><strong id="fps-min">—</strong></div><div><span>30 FPS pacing</span><strong id="fps-30">—</strong></div></div><p class="fps-recommend" id="fps-recommend"></p></div>`;
 tech.insertAdjacentElement('beforebegin',lab);

 const benchStyle=document.createElement('style');benchStyle.id='compat-simple-benchmark-style';benchStyle.textContent=`
 .fps-lab-head{display:flex;align-items:flex-start;justify-content:space-between;gap:22px;padding:4px 0 20px;border-bottom:1px solid var(--cx-line)}.fps-lab-kicker,.fps-small{display:block;color:#707070;font-size:7px;letter-spacing:1.25px}.fps-lab h3{margin:8px 0 6px;font-size:28px;letter-spacing:-.8px}.fps-lab-head p{margin:0;max-width:600px;color:#818181;font-size:9px;line-height:1.65}.fps-back{flex:none;padding:8px 0;border:0;background:none;color:#9a9a9a;font:500 9px/1.4 'DM Sans',sans-serif}.fps-flow{display:flex;gap:20px;padding:14px 0;color:#666;font-size:8px;border-bottom:1px solid var(--cx-line)}.fps-presets{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;padding:18px 0}.fps-preset{appearance:none;text-align:left;padding:13px;border:1px solid var(--cx-line);border-radius:7px;background:var(--cx-panel);color:#ddd;cursor:pointer}.fps-preset[aria-pressed=true]{border-color:rgba(120,183,215,.42);background:rgba(120,183,215,.045)}.fps-preset b{display:block;font-size:10px}.fps-preset small{display:block;margin-top:5px;color:#666;font-size:7px;line-height:1.4}.fps-preset-detail{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.8fr);gap:22px;padding:17px 0;border-top:1px solid var(--cx-line);border-bottom:1px solid var(--cx-line)}.fps-preset-detail h4{margin:6px 0;font-size:15px}.fps-preset-detail p{margin:0;color:#777;font-size:8px;line-height:1.6}.fps-setting-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px}.fps-setting-grid span{color:#656565;font-size:7px}.fps-setting-grid b{display:block;margin-top:3px;color:#c9c9c9;font-size:9px;font-weight:500}.fps-import{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:19px 0}.fps-import strong{font-size:10px}.fps-import p{margin:5px 0 0;color:#686868;font-size:8px;line-height:1.55}.fps-import input{max-width:260px;color:#777;font-size:8px}.fps-import input::file-selector-button{margin-right:8px;padding:7px 9px;border:1px solid var(--cx-line);border-radius:5px;background:#1b1b1b;color:#bbb}.fps-error{grid-column:1/-1;color:var(--cx-bad);font-size:8px}.fps-output{padding:18px 0 0;border-top:1px solid var(--cx-line)}.fps-output[hidden]{display:none!important}.fps-output-head h4{margin:6px 0 4px;font-size:18px}.fps-output-head p{margin:0;color:#737373;font-size:8px}.fps-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}.fps-metrics>div{padding:13px;border:1px solid var(--cx-line);border-radius:7px;background:var(--cx-panel)}.fps-metrics span{display:block;color:#656565;font-size:7px;text-transform:uppercase;letter-spacing:.6px}.fps-metrics strong{display:block;margin-top:6px;font-size:19px;font-weight:550}.fps-recommend{margin:13px 0 0;color:#858585;font-size:8px;line-height:1.6}.fps-recommend b{color:#ccc}@media(max-width:760px){.fps-presets{grid-template-columns:1fr 1fr}.fps-preset:last-child{grid-column:1/-1}.fps-preset-detail,.fps-import{grid-template-columns:1fr}.fps-import input{max-width:100%}.fps-metrics{grid-template-columns:1fr 1fr}.fps-lab-head{display:block}.fps-back{margin-top:12px}}`;
 document.head.append(benchStyle);

 const presetBox=lab.querySelector('.fps-presets');let selected='balanced';
 Object.entries(presets).forEach(([id,p])=>{const b=text('button','fps-preset');b.type='button';b.dataset.preset=id;b.setAttribute('aria-pressed',String(id===selected));b.innerHTML=`<b>${p.name}</b><small>${p.caption}</small>`;presetBox.append(b)});

 const readCard=(root,label)=>{const c=findCard(root,label);return c?.querySelector('h3')?.textContent.trim()||''};
 const hardware=()=>{const chip=readCard(hardwareGrid,'System on chip');const ram=parseFloat(readCard(hardwareGrid,'Installed RAM'))||0;const m=/A(\d+)/i.exec(chip);return {chip,ram,a:m?Number(m[1]):0}};
 function suggestedPreset(){const h=hardware();if(h.a===12||h.ram<4)return'saver';if(h.ram<=4.5||h.a===13||h.a===14)return'balanced';if(h.ram>=8&&h.a>=17)return'quality';if(h.ram>=6&&h.a>=15)return'performance';return'balanced'}
 function presetSettings(id){const h=hardware(),low=h.ram>0&&h.ram<=4.5;const texture=h.ram>=8?'Very High':h.ram>=6?'High':'Normal';let resolution='960×540',cap='30 FPS',aa='Off',metalFX='Auto';if(id==='saver'){resolution='854×480 / 960×540';cap='30 FPS'}if(id==='balanced'){resolution=h.a>=15&&h.ram>=6?'1280×720':'960×540';cap=h.a>=15?'40 FPS':'30 FPS'}if(id==='performance'){resolution=h.a>=17?'1280×720':'960×540';cap='60 FPS'}if(id==='quality'){resolution=h.a>=17&&h.ram>=8?'1600×900':'1280×720';cap='30–40 FPS';aa='TAA'}if(id==='custom'){resolution='Current value';cap='Current value';aa='Current value';metalFX='Current value'}return {Resolution:resolution,Textures:id==='custom'?'Current value':texture,'Low-memory':id==='custom'?'Current value':low?'On':'Auto',AA:aa,MetalFX:metalFX,'Frame cap':cap}}
 function selectPreset(id){selected=id;presetBox.querySelectorAll('.fps-preset').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===id)));lab.querySelector('#fps-preset-title').textContent=presets[id].name;lab.querySelector('#fps-preset-copy').textContent=presets[id].description;const grid=lab.querySelector('#fps-setting-grid');grid.replaceChildren();Object.entries(presetSettings(id)).forEach(([k,v])=>{const span=text('span','',k);span.append(text('b','',v));grid.append(span)})}
 presetBox.addEventListener('click',e=>{const b=e.target.closest('.fps-preset');if(!b)return;lab.dataset.userPreset='1';selectPreset(b.dataset.preset)});
 const syncPreset=()=>{if(!lab.dataset.userPreset)selectPreset(suggestedPreset())};
 const presetObserver=new MutationObserver(syncPreset);presetObserver.observe(hardwareGrid,{childList:true,subtree:true});syncPreset();

 benchmarkButton.addEventListener('click',()=>{document.body.classList.add('benchmark-open');selectPreset(lab.dataset.userPreset?selected:suggestedPreset());lab.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})});
 lab.querySelector('.fps-back').addEventListener('click',()=>{document.body.classList.remove('benchmark-open');document.querySelector('#compat-result-title')?.scrollIntoView({behavior:'smooth',block:'start'})});

 function parseSummary(raw){const passes=[];let section='';for(const source of raw.split(/\r?\n/)){const line=source.trim();if(/Frames Per Second/i.test(line)){section='fps';continue}if(/Frames under 16ms/i.test(line)){section='60';continue}if(/Frames under 33ms/i.test(line)){section='30';continue}let m;if(section==='fps'&&(m=/^Pass\s+(\d+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(line))){passes.push({pass:+m[1],min:+m[2],max:+m[3],avg:+m[4]});continue}if((section==='60'||section==='30')&&(m=/^Pass\s+(\d+):\s*(\d+)\/(\d+)\s+frames\s*\(([\d.]+)%\)/i.exec(line))){let p=passes.find(x=>x.pass===+m[1]);if(!p){p={pass:+m[1]};passes.push(p)}p[section==='60'?'under16':'under33']=+m[4]}}return passes.filter(p=>Number.isFinite(p.avg))}
 function parseFrameTimes(raw){const values=[];for(const source of raw.split(/\r?\n/)){const nums=source.trim().split(/[,\s]+/).map(Number).filter(Number.isFinite);if(!nums.length)continue;let value=nums[nums.length-1];if(value>0&&value<1)value*=1000;if(value>0&&value<1000)values.push(value)}return values}
 const average=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null;
 const lowerPreset=id=>({quality:'performance',performance:'balanced',balanced:'saver',custom:'balanced',saver:'saver'})[id]||'balanced';
 const higherPreset=id=>({saver:'balanced',balanced:'performance',performance:'quality',custom:'quality',quality:'quality'})[id]||'balanced';
 function analyze(passes,frameTimes){
  const avg=average(passes.map(p=>p.avg));const min=passes.length?Math.min(...passes.map(p=>p.min)):null;let pacing=average(passes.filter(p=>Number.isFinite(p.under33)).map(p=>p.under33));let low=null;
  if(frameTimes.length){const fps=frameTimes.map(ms=>1000/ms).filter(v=>Number.isFinite(v)&&v>0).sort((a,b)=>a-b);const count=Math.max(1,Math.floor(fps.length*.01));low=average(fps.slice(0,count));if(pacing===null)pacing=frameTimes.filter(ms=>ms<=33.333).length/frameTimes.length*100}
  return {avg,min,low,pacing};
 }
 function ratingFor(m){if(m.avg===null)return'Not assessed';if(m.avg>=55&&(m.low===null||m.low>=40))return'Strong';if(m.avg>=40)return'Playable';if(m.avg>=30)return'30 FPS target';return'Heavy'}
 function recommendation(m){if(m.avg===null)return'Import a valid GTA V Benchmark result.';if(m.avg<28){const next=lowerPreset(selected);return`Performance is below a comfortable 30 FPS target. Try ${presets[next].name} and benchmark again.`}if(m.avg<40&&selected!=='saver'){const next=lowerPreset(selected);return`The current preset is demanding. ${presets[next].name} is the safer next test.`}if(m.avg>=55&&(m.low===null||m.low>=40)&&selected!=='quality'){const next=higherPreset(selected);return`There is measurable headroom. You can try ${presets[next].name}, then benchmark again.`}return'This preset is a reasonable match for the measured result. Re-test after graphics or thermal changes.'}
 function fmt(value,suffix=' FPS'){return value===null?'—':value.toFixed(1)+suffix}
 const fileInput=lab.querySelector('#fps-benchmark-files'),error=lab.querySelector('#fps-benchmark-error'),output=lab.querySelector('#fps-output');
 fileInput.addEventListener('change',async()=>{
  error.hidden=true;output.hidden=true;const files=[...fileInput.files];if(!files.length)return;let passes=[],frameTimes=[];
  try{for(const file of files){if(file.size>1024*1024)throw new Error('Benchmark files must be 1 MB or smaller.');const raw=await file.text();const parsed=parseSummary(raw);if(parsed.length)passes.push(...parsed);if(/FrameTimes/i.test(file.name)||(!parsed.length&&/\d/.test(raw)))frameTimes.push(...parseFrameTimes(raw))}if(!passes.length)throw new Error('No GTA V benchmark FPS summary was found. Choose Benchmark-*.txt.');const metrics=analyze(passes,frameTimes);lab.querySelector('#fps-rating').textContent=ratingFor(metrics);lab.querySelector('#fps-output-context').textContent=presets[selected].name+' · '+passes.length+' benchmark pass'+(passes.length===1?'':'es');lab.querySelector('#fps-avg').textContent=fmt(metrics.avg);lab.querySelector('#fps-low').textContent=fmt(metrics.low);lab.querySelector('#fps-min').textContent=fmt(metrics.min);lab.querySelector('#fps-30').textContent=metrics.pacing===null?'—':metrics.pacing.toFixed(1)+'%';lab.querySelector('#fps-recommend').textContent=recommendation(metrics);output.hidden=false;output.scrollIntoView({behavior:'smooth',block:'nearest'})}catch(err){error.textContent=err.message||'Could not read this benchmark file.';error.hidden=false}
 });
});
})();