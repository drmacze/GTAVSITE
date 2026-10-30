(()=>{
'use strict';
if(window.__franklinShellFix5)return;
window.__franklinShellFix5=true;
if(document.body?.dataset.page!=='home')return;

const AVATAR='assets/avatars/franklin.jpg';
let scheduled=false;
let connectRAF=0;
let versionSignature='';

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
function enhanceVersionPicker(){
 const list=document.querySelector('.helper-build-list');
 if(!list)return;
 const sourceButtons=versionButtons(list);
 const buttons=uniqueVersionButtons(list);
 const signature=buttons.map(optionLabel).join('|');
 let field=list.previousElementSibling;
 if(!field?.classList?.contains('franklin-version-field')){
  field=document.createElement('div');field.className='franklin-version-field';
  const label=document.createElement('label');label.textContent='App version';
  const select=document.createElement('select');select.className='franklin-version-select';select.setAttribute('aria-label','App version');
  field.append(label,select);list.before(field);
 }
 const select=field.querySelector('.franklin-version-select');
 list.classList.add('franklin-version-original');
 if(!buttons.length){
  if(select.options.length!==1||select.options[0].textContent!=='Loading versions…'){
   select.replaceChildren(new Option('Loading versions…',''));
  }
  select.disabled=true;
  window.FranklinSupportContext?.load?.().catch?.(()=>{});
  return;
 }
 if(signature!==field.dataset.signature){
  const selectedButton=sourceButtons.find(b=>b.getAttribute('aria-pressed')==='true');
  const currentLabel=selectedButton?optionLabel(selectedButton):'';
  sourceButtons.forEach(button=>button.removeAttribute('data-franklin-select-value'));
  select.replaceChildren();
  const placeholder=new Option('Select app version','');placeholder.disabled=true;placeholder.selected=!currentLabel;select.append(placeholder);
  buttons.forEach((button,index)=>{
   const value='v'+index;
   button.dataset.franklinSelectValue=value;
   const option=new Option(optionLabel(button),value);
   if(currentLabel&&optionLabel(button)===currentLabel)option.selected=true;
   select.append(option);
  });
  field.dataset.signature=signature;
  field.dataset.ready='true';
  select.disabled=false;
  select.onchange=()=>{
   const button=list.querySelector(`[data-franklin-select-value="${CSS.escape(select.value)}"]`);
   if(button){button.click();requestAnimationFrame(()=>syncVersionSelect(list,select));}
  };
 }
 syncVersionSelect(list,select);
 versionSignature=signature;
}
function syncVersionSelect(list,select){
 const selected=list.querySelector('.helper-setup-choice[aria-pressed="true"]');
 if(!selected)return;
 const selectedLabel=optionLabel(selected);
 const matching=[...select.options].find(option=>option.textContent===selectedLabel);
 if(matching&&select.value!==matching.value)select.value=matching.value;
}

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
