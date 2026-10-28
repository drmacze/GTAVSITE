(()=>{
const savedCard=document.querySelector('#saved-device-card');if(!savedCard)return;
let activeModel=null;
function phase(value){document.body.dataset.compatPhase=value;document.querySelector('.site-header').inert=false;document.querySelector('.site-footer').inert=false;document.querySelector('.compat-setup').inert=false;}
phase('setup');
const start=document.querySelector('#compat-start');const results=document.querySelector('#compat-results');const visual=document.querySelector('#compat-visual');const progress=document.querySelector('#compat-progress');const iosInput=document.querySelector('#compat-ios');const storageInput=document.querySelector('#compat-storage');const requiredBlock=document.querySelector('.optional-checks');const requiredInputs=[iosInput,storageInput].filter(Boolean);let data=null;let busy=false;let refreshPending=false;

// Remove the old planning strip. Compatibility v3 now derives its guidance from the audited port rules.
document.querySelector('.compat-reference')?.remove();
const headingShine=document.querySelector('.compat-heading [data-shine]');if(headingShine){headingShine.removeAttribute('data-shine');headingShine.classList.remove('shine-running');}

function installScanPresentation(){
 if(document.querySelector('#compat-scan-sheet-style'))return;
 const style=document.createElement('style');style.id='compat-scan-sheet-style';style.textContent=`
  body[data-page="compatibility"] .compat-visual{display:none!important}
  body[data-page="compatibility"] .compat-checker{grid-template-columns:minmax(0,760px)!important;justify-content:center!important}
  body[data-page="compatibility"] .compat-checker:before{display:none!important}
  body[data-page="compatibility"] .compat-setup{padding-right:0!important}
  body[data-page="compatibility"] .orbit-dot{display:none!important}
  body[data-page="compatibility"] .compat-heading .shine-running{animation:none!important;background:none!important;-webkit-text-fill-color:inherit!important}
  body.compat-scan-active{overflow:hidden!important}
  body.compat-scan-active .ask-franklin-launcher,body.compat-scan-active .franklin-nudge,body.compat-scan-active .franklin-sheet-dock{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
  .compat-scan-backdrop{position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.58);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;animation:compatScanBackdropIn .32s ease forwards}
  .compat-scan-backdrop.is-closing{animation:compatScanBackdropOut .42s ease forwards}
  .compat-scan-sheet{position:fixed;z-index:12001;left:50%;bottom:0;width:min(720px,100%);max-height:min(78svh,680px);box-sizing:border-box;overflow:hidden;padding:14px 32px calc(30px + env(safe-area-inset-bottom));color:var(--fg-f2f2f2,#f2f2f2);background:var(--panel,var(--tone-171717,#171717));border:1px solid var(--line,var(--tone-ffffff1c,#ffffff1c));border-bottom:0;border-radius:30px 30px 0 0;box-shadow:0 -24px 70px rgba(0,0,0,.34);transform:translate(-50%,105%);animation:compatScanSheetUp .55s cubic-bezier(.16,1,.3,1) forwards;outline:0}
  .compat-scan-sheet.is-closing{animation:compatScanSheetDown .46s cubic-bezier(.4,0,.8,.3) forwards}
  .compat-scan-grip{width:42px;height:4px;border-radius:5px;background:var(--tone-ffffff20,#ffffff20);margin:0 auto 24px}
  .compat-scan-kicker{display:flex;align-items:center;justify-content:space-between;gap:18px;padding-bottom:16px;border-bottom:1px solid var(--tone-ffffff13,#ffffff13);font-size:8px;letter-spacing:1.55px;color:var(--fg-8c8c8c,#8c8c8c)}
  .compat-scan-kicker strong{font-size:8px;font-weight:600;color:var(--fg-bfa66d,#bfa66d);letter-spacing:1.35px}
  .compat-scan-body{display:grid;grid-template-columns:150px minmax(0,1fr);align-items:center;gap:30px;padding:30px 0 26px}
  .compat-scan-chip{position:relative;width:132px;height:132px;display:grid;place-items:center;margin:auto;border:1px solid var(--tone-ffffff1c,#ffffff1c);border-radius:26px;background:var(--tone-ffffff03,#ffffff03);overflow:hidden}
  .compat-scan-chip:before{content:'';position:absolute;left:16px;right:16px;top:20px;height:1px;background:#d6b56b;opacity:.75;animation:compatScanLine 2s ease-in-out infinite alternate}
  .compat-scan-chip .icon{width:47px;height:47px;color:var(--fg-c8aa6a,#c8aa6a);stroke-width:1.15}
  .compat-scan-chip span{position:absolute;left:0;right:0;bottom:17px;text-align:center;font-size:6px;letter-spacing:1.25px;color:var(--fg-8d7d5f,#8d7d5f);text-transform:uppercase}
  .compat-scan-copy h2{font-size:clamp(24px,5vw,34px);font-weight:550;letter-spacing:-.9px;margin:0 0 10px}
  .compat-scan-copy>p{font-size:11px;line-height:1.75;color:var(--fg-858585,#858585);margin:0 0 22px;min-height:38px}
  .compat-scan-progress{height:2px;background:var(--tone-ffffff12,#ffffff12);overflow:hidden}
  .compat-scan-progress>span{display:block;width:0;height:100%;background:#d5b36a;transition:width .12s linear}
  .compat-scan-meta{display:flex;justify-content:space-between;gap:20px;margin-top:10px;font-size:8px;letter-spacing:.8px;color:var(--fg-6f6f6f,#6f6f6f)}
  .compat-scan-meta strong{font-weight:600;color:var(--fg-b8a06e,#b8a06e)}
  .compat-scan-stages{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:0;padding:0;border-top:1px solid var(--tone-ffffff11,#ffffff11);list-style:none}
  .compat-scan-stages li{position:relative;padding:16px 14px 0 0;font-size:8px;line-height:1.5;color:var(--fg-5f5f5f,#5f5f5f);transition:color .25s ease}
  .compat-scan-stages li+li{padding-left:14px;border-left:1px solid var(--tone-ffffff0d,#ffffff0d)}
  .compat-scan-stages li span{display:block;margin-bottom:5px;font-size:7px;letter-spacing:1px;color:inherit}
  .compat-scan-stages li.active{color:var(--fg-d4b66f,#d4b66f)}
  .compat-scan-stages li.done{color:var(--fg-91a185,#91a185)}
  @keyframes compatScanSheetUp{to{transform:translate(-50%,0)}}
  @keyframes compatScanSheetDown{from{transform:translate(-50%,0)}to{transform:translate(-50%,105%)}}
  @keyframes compatScanBackdropIn{to{opacity:1}}
  @keyframes compatScanBackdropOut{from{opacity:1}to{opacity:0}}
  @keyframes compatScanLine{from{transform:translateY(0);opacity:.35}to{transform:translateY(90px);opacity:.9}}
  @media(max-width:620px){
   body[data-page="compatibility"] .compat-checker{display:block!important}
   body[data-page="compatibility"] .compat-setup{padding-right:0!important}
   .compat-scan-sheet{width:100%;padding:12px 7% calc(24px + env(safe-area-inset-bottom));border-left:0;border-right:0;border-radius:28px 28px 0 0}
   .compat-scan-grip{margin-bottom:18px;width:38px;height:3px}
   .compat-scan-body{grid-template-columns:108px minmax(0,1fr);gap:20px;padding:25px 0 22px}
   .compat-scan-chip{width:104px;height:104px;border-radius:22px}.compat-scan-chip .icon{width:38px;height:38px}.compat-scan-chip span{bottom:13px;font-size:5px}
   .compat-scan-copy h2{font-size:25px}.compat-scan-copy>p{font-size:10px;margin-bottom:17px;min-height:34px}
   .compat-scan-stages li{font-size:7px;padding-right:8px}.compat-scan-stages li+li{padding-left:8px}
  }
  @media(max-width:390px){.compat-scan-body{grid-template-columns:1fr;text-align:center}.compat-scan-chip{width:96px;height:96px}.compat-scan-copy>p{min-height:0}.compat-scan-stages{display:none}}
  @media(prefers-reduced-motion:reduce){.compat-scan-backdrop,.compat-scan-sheet,.compat-scan-backdrop.is-closing,.compat-scan-sheet.is-closing{animation-duration:.01ms!important}.compat-scan-chip:before{animation:none!important;top:55px}.compat-scan-progress>span{transition:none!important}}
 `;document.head.append(style);
}
installScanPresentation();

function setupRequiredDetails(){
 if(!requiredBlock)return;
 requiredBlock.open=true;requiredBlock.classList.add('required-checks');requiredBlock.setAttribute('open','');
 const summary=requiredBlock.querySelector('summary');
 if(summary){const badge=summary.querySelector('span');summary.childNodes[0].nodeValue='iOS and storage details ';if(badge)badge.textContent='Required';summary.setAttribute('aria-label','iOS and storage details. Required.');summary.addEventListener('click',event=>event.preventDefault());}
 requiredBlock.addEventListener('toggle',()=>{if(!requiredBlock.open)requiredBlock.open=true});
 requiredInputs.forEach(input=>{input.required=true;input.setAttribute('aria-required','true')});
 const note=requiredBlock.querySelector(':scope>p');if(note)note.textContent='Required. Enter both values from Settings before scanning. The browser cannot read them.';
}
function requiredDetailsValid(){return requiredInputs.length===2&&requiredInputs.every(input=>input.value.trim()!==''&&input.checkValidity())}
function updateStartState(){const complete=requiredDetailsValid();if(requiredBlock)requiredBlock.classList.toggle('is-complete',complete);start.disabled=!(data&&activeModel&&!busy&&complete)}
setupRequiredDetails();start.firstChild.textContent='Scan ';updateStartState();

const el=(tag,className,text)=>{const item=document.createElement(tag);if(className)item.className=className;if(text)item.textContent=text;return item};
const svg=(name)=>{const node=document.createElementNS('http://www.w3.org/2000/svg','svg');node.classList.add('icon');node.setAttribute('aria-hidden','true');node.setAttribute('focusable','false');const use=document.createElementNS(node.namespaceURI,'use');use.setAttribute('href','assets/icons.svg#'+name);node.append(use);return node};
const badge=(state)=>{const node=el('span','hardware-badge '+state.level);node.append(svg(state.level==='critical'?'warning':state.level==='headroom'?'check':'info'),document.createTextNode(state.label));return node};
function sourceLink(label,url){const link=el('a','',label);link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.append(svg('arrow-up-right'));return link}
function card(label,value,note,iconName,state){const item=el('article','hardware-card '+(state?.level||'information'));const top=el('div','hardware-card-top');const name=el('span','hardware-label',label);top.append(svg(iconName),name);if(state)top.append(badge(state));item.append(top,el('h3','',value),el('p','',note));return item}

function render(model){
 phase('results');performanceAssistant.reset(model);const baseline=data.baseline;const memory=compatibilityRules.memory(model.ram,baseline.ramGB);const ios=compatibilityRules.entry(iosInput.value,baseline.ios,'iOS');const storage=compatibilityRules.entry(storageInput.value,baseline.freeStorageGB,'GB');const invalidIOS=iosInput.validity.valid;const invalidStorage=storageInput.validity.valid;
 if(!invalidIOS){ios.level='unknown';ios.label='Invalid entry';ios.value='Check your entry';ios.note='Use an iOS version between 1 and 99.'}
 if(!invalidStorage){storage.level='unknown';storage.label='Invalid entry';storage.value='Check your entry';storage.note='Use a valid non-negative storage value.'}
 document.querySelector('#compat-result-title').textContent=model.name;const verdict=document.querySelector('#compat-verdict');verdict.className='compat-verdict '+memory.level;const verdictIcon=el('div','verdict-icon');verdictIcon.append(svg(memory.level==='critical'?'warning':memory.level==='headroom'?'check':'info'));const summary=el('div');let heading=memory.title;let note=memory.note;
 if([ios,storage].some(check=>check.level==='critical')){heading='One or more checker guidelines are not met';note='Review the highlighted checks below. More RAM does not override an unsupported iOS version or insufficient storage.';verdict.className='compat-verdict critical'}else if(memory.level==='headroom'&&ios.level==='headroom'&&storage.level==='headroom'){heading='Meets the reference checks';note='Installed RAM and the iOS and storage values you provided meet the checker baseline. This is not a game test or certification.'}
 summary.append(el('h3','',heading),el('p','',note));verdict.replaceChildren(verdictIcon,summary);
 document.querySelector('#memory-support').hidden=memory.level!=='critical';
 const grid=document.querySelector('#hardware-grid');grid.replaceChildren(card('System on chip',model.chip||'Unverified','Apple silicon model. CPU, GPU, and Neural Engine are integrated into this chip.','cpu'),card('CPU',model.cpu?model.cpu+' cores':'Unverified','Central processing unit. Core counts are hardware specifications, not performance scores.','cpu'),card('GPU',model.gpu?model.gpu+' cores':'Unverified','Graphics processing unit. Rendering performance also depends on the port and its settings.','layers'),card('Installed RAM',model.ram!==null?model.ram+' GB':'Unverified',memory.note,'memory',memory),card('Neural Engine',model.neural||'Unverified','Machine-learning hardware. Its presence is not a GTA V compatibility requirement.','cpu'),card('Assessment type','Saved model profile','Hardware lookup from your welcome answer. No live RAM, temperature, or performance measurement.','info'));
 const runtime=document.querySelector('#runtime-grid');runtime.replaceChildren(card('Installed iOS',ios.value,ios.note,'gamepad',ios),card('Free storage',storage.value,storage.note,'storage',storage));
 const links=document.querySelector('#compat-source-links');links.replaceChildren(sourceLink('Apple: hardware specifications',model.appleSource));if(model.ramSource){const source=data.sources[model.ramSource];links.append(sourceLink(source.label,source.url))}else links.append(el('p','source-unknown','RAM source: not yet verified for this model.'));const reference=data.sources[baseline.source];links.append(sourceLink(reference.label,reference.url),el('p','source-review','Sources reviewed '+data.reviewed+'. '+baseline.note));
 results.hidden=false;results.querySelectorAll('.hardware-card').forEach((item,index)=>item.style.setProperty('--card-delay',index*45+'ms'));document.querySelector('#chip-preview').textContent=model.chip||'UNVERIFIED';document.querySelector('#compat-visual-title').textContent='Profile ready.';progress.textContent='Compatibility report prepared.';
}

const stages=[...document.querySelectorAll('[data-review-step]')];
function setStage(index,complete=false){stages.forEach((item,i)=>{item.classList.toggle('active',!complete&&i===index);item.classList.toggle('done',complete||i<index);});document.querySelector('#review-state').textContent=complete?'REVIEW COMPLETE':`PROFILE REVIEW / ${index+1} OF 3`;}
function invalidate(){phase('setup');results.hidden=true;visual.classList.remove('profile-ready');document.querySelector('#compat-visual-title').textContent='Ready to review.';progress.textContent='Press Scan to review your saved device.';start.firstChild.textContent='Scan ';stages.forEach(item=>item.classList.remove('active','done'));document.querySelector('#review-state').textContent='SAVED PROFILE';updateStartState();}

function createScanSheet(){
 const backdrop=el('div','compat-scan-backdrop');backdrop.setAttribute('aria-hidden','true');
 const sheet=el('section','compat-scan-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','compat-scan-title');sheet.tabIndex=-1;
 const grip=el('div','compat-scan-grip');grip.setAttribute('aria-hidden','true');
 const kicker=el('div','compat-scan-kicker');kicker.append(el('strong','', 'DEVICE COMPATIBILITY SCAN'),el('span','compat-scan-percent','0%'));
 const body=el('div','compat-scan-body');
 const chip=el('div','compat-scan-chip');chip.append(svg('cpu'),el('span','',activeModel?.chip||'APPLE SILICON'));
 const copy=el('div','compat-scan-copy');const title=el('h2','', 'Scanning your profile…');title.id='compat-scan-title';const status=el('p','', 'Reading your saved hardware profile and installation details.');const bar=el('div','compat-scan-progress');bar.setAttribute('role','progressbar');bar.setAttribute('aria-label','Compatibility scan progress');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');bar.setAttribute('aria-valuenow','0');const fill=el('span');bar.append(fill);const meta=el('div','compat-scan-meta');meta.append(el('span','', 'PORT-AWARE ANALYSIS'),el('strong','', '10 SEC'));
 copy.append(title,status,bar,meta);body.append(chip,copy);
 const stageList=el('ol','compat-scan-stages');['Load device profile','Review memory & GPU','Build compatibility report'].forEach((label,index)=>{const li=el('li');li.append(el('span','',`0${index+1}`),document.createTextNode(label));stageList.append(li)});
 sheet.append(grip,kicker,body,stageList);document.body.append(backdrop,sheet);return {backdrop,sheet,status,title,fill,bar,percent:kicker.querySelector('.compat-scan-percent'),stages:[...stageList.children]};
}
function updateSheetStage(ui,index){ui.stages.forEach((item,i)=>{item.classList.toggle('active',i===index);item.classList.toggle('done',i<index)});}
function closeScanSheet(ui){ui.sheet.classList.add('is-closing');ui.backdrop.classList.add('is-closing');setTimeout(()=>{ui.sheet.remove();ui.backdrop.remove();document.body.classList.remove('compat-scan-active');document.querySelector('main')?.removeAttribute('inert');document.querySelector('.site-header')?.removeAttribute('inert');document.querySelector('.site-footer')?.removeAttribute('inert');document.querySelector('#compat-result-title')?.focus({preventScroll:true});results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});},470)}

async function runScan(){
 if(!data||!activeModel||busy||!requiredDetailsValid())return;
 busy=true;updateStartState();start.firstChild.textContent='Scanning ';
 document.body.classList.add('compat-scan-active');document.querySelector('main')?.setAttribute('inert','');document.querySelector('.site-header')?.setAttribute('inert','');document.querySelector('.site-footer')?.setAttribute('inert','');
 const ui=createScanSheet();ui.sheet.focus({preventScroll:true});
 const duration=10000;const started=performance.now();let rendered=false;let lastStage=-1;
 const messages=['Reading your saved hardware profile and installation details.','Matching RAM, app-memory, GPU and port rules.','Preparing the compatibility report and recommendations.','Scan complete.'];
 await new Promise(resolve=>{
  const tick=now=>{
   const elapsed=Math.min(duration,now-started);const ratio=elapsed/duration;const pct=Math.min(100,Math.round(ratio*100));ui.fill.style.width=pct+'%';ui.percent.textContent=pct+'%';ui.bar.setAttribute('aria-valuenow',String(pct));
   const stage=ratio<.34?0:ratio<.68?1:2;if(stage!==lastStage){lastStage=stage;updateSheetStage(ui,stage);ui.status.textContent=messages[stage];setStage(stage)}
   if(elapsed>=duration){ui.fill.style.width='100%';ui.percent.textContent='100%';ui.bar.setAttribute('aria-valuenow','100');ui.title.textContent='Scan complete';ui.status.textContent=messages[3];ui.stages.forEach(item=>{item.classList.remove('active');item.classList.add('done')});setStage(2,true);if(!rendered){rendered=true;render(activeModel)}setTimeout(resolve,180);return}
   requestAnimationFrame(tick);
  };requestAnimationFrame(tick);
 });
 closeScanSheet(ui);busy=false;start.firstChild.textContent='Scan again ';updateStartState();if(refreshPending){refreshPending=false;invalidate();init();}
}
start.addEventListener('click',runScan);
requiredInputs.forEach(input=>input.addEventListener('input',()=>{updateStartState();if(!results.hidden){invalidate();progress.textContent='Details changed. Press Scan to update your results.';}}));
document.querySelector('#compat-details').addEventListener('click',()=>{invalidate();requiredBlock.open=true;iosInput.focus();requiredBlock.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});});
function readWelcome(){try{return JSON.parse(localStorage.getItem('gtav-community-onboarding')||sessionStorage.getItem('gtav-community-onboarding')||'null')}catch{try{return JSON.parse(sessionStorage.getItem('gtav-community-onboarding')||'null')}catch{return null}}}
function showUnavailable(state){activeModel=null;start.hidden=true;requiredBlock.hidden=true;document.querySelector('.review-steps').hidden=true;document.querySelector('#profile-notice').hidden=false;savedCard.dataset.state=state.status;const android=state.status==='android';document.querySelector('#saved-device-name').textContent=android?'Android device':state.name||'No saved iPhone';document.querySelector('#saved-device-label').textContent=android?'DEVICE NOT SUPPORTED':'WELCOME PROFILE REQUIRED';document.querySelector('#saved-device-note').textContent=android?'Your welcome answer is Android. This project supports iOS devices.':'An exact iPhone model is needed for a reliable hardware lookup.';document.querySelector('#profile-notice-text').textContent=android?'You can still browse the project and community. If your welcome answer was incorrect, update it through the welcome form.':state.status==='unknown'?'The saved model is not in this catalog. Please update your welcome answer; no replacement model has been assumed.':'Complete the welcome form to record your device before reviewing its hardware.';document.querySelector('#profile-notice a').firstChild.textContent=android?'Update welcome answers ':'Complete welcome setup ';document.querySelector('#chip-preview').textContent=android?'ANDROID':'NO PROFILE';document.querySelector('#compat-visual-title').textContent=android?'iOS only.':'Profile needed.';progress.textContent=android?'No iPhone hardware profile has been assigned.':'Your device will appear here after welcome setup.';document.querySelector('#review-state').textContent=android?'UNSUPPORTED PLATFORM':'SETUP REQUIRED';updateStartState();}
async function init(){
 try{const response=await fetch('compatibility-data.json',{cache:'no-cache'});if(!response.ok)throw Error('Profiles unavailable');data=await response.json();const saved=savedDeviceProfile.resolve(readWelcome(),data.models);if(saved.status!=='ready'){showUnavailable(saved);return;}start.hidden=false;requiredBlock.hidden=false;requiredBlock.open=true;document.querySelector('.review-steps').hidden=false;document.querySelector('#profile-notice').hidden=true;activeModel=saved.model;savedCard.dataset.state='ready';document.querySelector('#saved-device-name').textContent=activeModel.name;document.querySelector('#saved-device-label').textContent='SAVED FROM WELCOME';document.querySelector('#saved-device-note').textContent='This is the model you provided. Hardware details come from the source-based catalog.';document.querySelector('#chip-preview').textContent=activeModel.chip||'UNVERIFIED';updateStartState();}
 catch{savedCard.dataset.state='error';document.querySelector('#saved-device-name').textContent='Profile unavailable';const error=document.querySelector('#compat-error');error.textContent='Device profiles could not be loaded. Refresh the page to try again. Your saved welcome answer has not changed.';error.hidden=false;progress.textContent='Waiting for the hardware catalog.';updateStartState();}
}
window.addEventListener('storage',event=>{if(event.key==='gtav-community-onboarding'){if(busy)refreshPending=true;else{invalidate();init();}}});
init();
})();