(()=>{
'use strict';
if(window.__franklinShellFix5)return;
window.__franklinShellFix5=true;
if(document.body?.dataset.page!=='home')return;

const AVATAR='assets/avatars/franklin.jpg';
const versionPickerStyle=document.createElement('style');
versionPickerStyle.textContent=`
.franklin-version-field{position:relative!important;display:block!important;margin-top:2px!important}
.franklin-version-trigger{box-sizing:border-box;width:100%;min-height:48px;margin:0;padding:0 42px 0 12px;border:1px solid #414141;border-radius:7px;background:#212121;color:#eee;font:500 12px/1.2 'DM Sans',Arial,sans-serif;text-align:left;position:relative;cursor:pointer;transition:border-color .18s ease,background .18s ease}
.franklin-version-trigger:hover,.franklin-version-trigger:focus-visible{border-color:color-mix(in srgb,var(--franklin-shell-accent) 68%,#414141);outline:none}
.franklin-version-trigger:disabled{opacity:.55;cursor:default}
.franklin-version-trigger::after{content:'';position:absolute;right:16px;top:50%;width:7px;height:7px;border-right:1.5px solid #d8d5d0;border-bottom:1.5px solid #d8d5d0;transform:translateY(-68%) rotate(45deg);transition:transform .2s ease}
.franklin-version-field[data-open="true"] .franklin-version-trigger::after{transform:translateY(-30%) rotate(225deg)}
.franklin-version-menu{display:none;grid-template-columns:1fr;gap:5px;max-height:min(248px,32vh);margin-top:8px;padding:6px;overflow:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(25,25,25,.96);box-shadow:0 18px 44px rgba(0,0,0,.36);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.franklin-version-menu::-webkit-scrollbar{display:none}
.franklin-version-field[data-open="true"] .franklin-version-menu{display:grid}
.franklin-version-option{position:relative;width:100%;min-height:42px;padding:10px 34px 10px 11px;border:1px solid transparent;border-radius:7px;background:transparent;color:#d9d6d1;font:500 11px/1.25 'DM Sans',Arial,sans-serif;text-align:left;cursor:pointer}
.franklin-version-option:hover,.franklin-version-option:focus-visible{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.045);outline:none}
.franklin-version-option.is-selected{border-color:color-mix(in srgb,var(--franklin-shell-accent) 42%,transparent);background:color-mix(in srgb,var(--franklin-shell-accent) 8%,transparent);color:#fff}
.franklin-version-option.is-selected::after{content:'';position:absolute;right:14px;top:50%;width:6px;height:6px;border-radius:50%;background:var(--franklin-shell-accent);transform:translateY(-50%)}
`;
document.head.append(versionPickerStyle);
let scheduled=false;
let connectRAF=0;

function syncViewport(){
 const h=Math.max(320,Math.round(window.visualViewport?.height||window.innerHeight||720));
 document.documentElement.style.setProperty('--franklin-visible-height',h+'px');
}
syncViewport();
addEventListener('resize',syncViewport,{passive:true});
addEventListener('pageshow',syncViewport,{passive:true});
visualViewport?.addEventListener('resize',syncViewport,{passive:true});

const connect=document.createElement('section');
connect.className='franklin-connect-card-v5';
connect.setAttribute('role','status');
connect.setAttribute('aria-live','polite');
connect.innerHTML=`
 <span class="franklin-connect-grip" aria-hidden="true"><i></i></span>
 <div class="franklin-connect-row">
  <span class="franklin-connect-avatar" aria-hidden="true"><img src="${AVATAR}" alt=""><i></i></span>
  <div class="franklin-connect-copy"><small>COMMUNITY HELPER</small><strong>Connecting to Franklin</strong><span>Preparing interface</span></div>
  <b class="franklin-connect-percent">0%</b>
 </div>
 <div class="franklin-connect-progress" aria-hidden="true"><i></i></div>`;
document.body.append(connect);
const connectStage=connect.querySelector('.franklin-connect-copy span');
const connectPercent=connect.querySelector('.franklin-connect-percent');
const connectFill=connect.querySelector('.franklin-connect-progress i');

function readLauncherProgress(){
 const launcher=document.querySelector('.franklin-shell-launcher');
 if(!launcher||launcher.dataset.state!=='connecting'){
  connect.classList.remove('is-open');
  cancelAnimationFrame(connectRAF);connectRAF=0;
  return;
 }
 connect.classList.add('is-open');
 const strong=launcher.querySelector('.franklin-shell-launcher-copy strong')?.textContent?.trim();
 const em=launcher.querySelector('.franklin-shell-launcher-copy em')?.textContent?.trim();
 const transform=launcher.querySelector('.franklin-shell-launcher-progress i')?.style.transform||'';
 const match=transform.match(/scaleX\(([-.\d]+)\)/);
 const raw=match?Math.max(0,Math.min(1,Number(match[1]))):0;
 connectStage.textContent=strong||'Preparing Franklin';
 connectPercent.textContent=/^\d+%$/.test(em||'')?em:Math.round(raw*100)+'%';
 connectFill.style.transform=`scaleX(${raw})`;
 connectRAF=requestAnimationFrame(readLauncherProgress);
}
function syncConnecting(){
 const launcher=document.querySelector('.franklin-shell-launcher');
 if(launcher?.dataset.state==='connecting'){
  if(!connectRAF)connectRAF=requestAnimationFrame(readLauncherProgress);
 }else connect.classList.remove('is-open');
}

function versionButtons(list){return [...list.querySelectorAll(':scope > .helper-setup-choice')];}
function optionLabel(button){return (button.textContent||'').replace(/✓/g,'').replace(/\s+/g,' ').trim();}
function uniqueVersionButtons(list){
 const seen=new Set();
 return versionButtons(list).filter(button=>{
  const label=optionLabel(button).toLowerCase();
  if(!label||seen.has(label))return false;
  seen.add(label);
  return true;
 });
}
function closeVersionPickers(except=null){
 document.querySelectorAll('.franklin-version-field[data-open="true"]').forEach(field=>{
  if(field===except)return;
  field.dataset.open='false';
  field.querySelector('.franklin-version-trigger')?.setAttribute('aria-expanded','false');
 });
}
function enhanceVersionPicker(){
 const list=document.querySelector('.helper-build-list');
 if(!list)return;
 const sourceButtons=versionButtons(list);
 const buttons=uniqueVersionButtons(list);
 const signature=buttons.map(optionLabel).join('|');
 let field=list.previousElementSibling;
 if(!field?.classList?.contains('franklin-version-field')){
  field=document.createElement('div');field.className='franklin-version-field';field.dataset.open='false';
  const label=document.createElement('label');label.textContent='App version';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='franklin-version-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
  const triggerText=document.createElement('span');triggerText.textContent='Select app version';trigger.append(triggerText);
  const menu=document.createElement('div');menu.className='franklin-version-menu';menu.setAttribute('role','listbox');menu.setAttribute('aria-label','App version');
  trigger.addEventListener('click',()=>{
   const willOpen=field.dataset.open!=='true';
   closeVersionPickers(field);
   field.dataset.open=String(willOpen);
   trigger.setAttribute('aria-expanded',String(willOpen));
   if(willOpen)requestAnimationFrame(()=>menu.querySelector('.is-selected')?.scrollIntoView({block:'nearest'}));
  });
  field.append(label,trigger,menu);list.before(field);
 }
 const trigger=field.querySelector('.franklin-version-trigger');
 const triggerText=trigger.querySelector('span');
 const menu=field.querySelector('.franklin-version-menu');
 list.classList.add('franklin-version-original');
 if(!buttons.length){
  triggerText.textContent='Loading versions…';
  trigger.disabled=true;
  menu.replaceChildren();
  window.FranklinSupportContext?.load?.().catch?.(()=>{});
  return;
 }
 if(signature!==field.dataset.signature){
  sourceButtons.forEach(button=>button.removeAttribute('data-franklin-select-value'));
  menu.replaceChildren();
  buttons.forEach((button,index)=>{
   const value='v'+index;
   const label=optionLabel(button);
   button.dataset.franklinSelectValue=value;
   const option=document.createElement('button');
   option.type='button';option.className='franklin-version-option';option.dataset.value=value;option.setAttribute('role','option');option.setAttribute('aria-selected','false');option.textContent=label;
   option.addEventListener('click',()=>{
    button.click();
    field.dataset.open='false';
    trigger.setAttribute('aria-expanded','false');
    requestAnimationFrame(()=>syncVersionPicker(list,field));
   });
   menu.append(option);
  });
  field.dataset.signature=signature;
 }
 trigger.disabled=false;
 syncVersionPicker(list,field);
}
function syncVersionPicker(list,field){
 const selected=list.querySelector('.helper-setup-choice[aria-pressed="true"]');
 const triggerText=field.querySelector('.franklin-version-trigger span');
 const options=[...field.querySelectorAll('.franklin-version-option')];
 if(!selected){
  triggerText.textContent='Select app version';
  options.forEach(option=>{option.classList.remove('is-selected');option.setAttribute('aria-selected','false');});
  return;
 }
 const selectedLabel=optionLabel(selected);
 triggerText.textContent=selectedLabel;
 options.forEach(option=>{
  const active=option.textContent===selectedLabel;
  option.classList.toggle('is-selected',active);
  option.setAttribute('aria-selected',String(active));
 });
}

document.addEventListener('pointerdown',event=>{
 const target=event.target instanceof Element?event.target:null;
 if(!target?.closest('.franklin-version-field'))closeVersionPickers();
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeVersionPickers();});

function cleanSavedOSDetails(){
 document.querySelector('.helper-setup-platform')?.remove();
 document.querySelector('.helper-profile-note')?.remove();
 document.querySelectorAll('.helper-setup-unsure').forEach(button=>{
  if(/forget saved os/i.test(button.textContent||''))button.remove();
 });
}
function tidyComposer(){
 const input=document.querySelector('.ask-franklin-input');
 if(input&&input.placeholder!=='Ask Franklin…')input.placeholder='Ask Franklin…';
}
function syncAll(){
 scheduled=false;
 syncViewport();
 syncConnecting();
 enhanceVersionPicker();
 cleanSavedOSDetails();
 tidyComposer();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(syncAll)}

const observer=new MutationObserver(schedule);
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-state','aria-pressed','data-support-phase']});
schedule();
addEventListener('pagehide',()=>{observer.disconnect();cancelAnimationFrame(connectRAF);}, {once:true});
})();
