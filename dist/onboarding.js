(() => {
let finished=false;
const survey=document.querySelector('#onboarding-dialog');
const form=document.querySelector('#onboarding-form');
const title=document.querySelector('#onboarding-title');
const description=document.querySelector('#onboarding-description');
const options=document.querySelector('#onboarding-options');
const next=document.querySelector('#onboarding-next');
const back=document.querySelector('#onboarding-back');
const privacy=document.querySelector('.onboarding-privacy');
const API='/api/onboarding-analytics',SYNC_KEY='gtav-onboarding-sync-v3';
let step='source';
const answers={source:'',device:'',model:''};
function textElement(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el}
function saveChoice(key,value,session=false){try{(session?sessionStorage:localStorage).setItem(key,JSON.stringify(value));return true}catch{return false}}
function readStore(key){try{return localStorage.getItem(key)||''}catch{return''}}
function writeStore(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
function sendAnalytics(result){if(!result)return;const signature=JSON.stringify([result.source,result.device,result.model||'']);if(readStore(SYNC_KEY)===signature)return;fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',keepalive:true,body:JSON.stringify({source:result.source,device:result.device,model:result.model||''})}).then(r=>{if(r.ok)writeStore(SYNC_KEY,signature)}).catch(()=>{})}
function safeReturnTarget(){
 let raw='';
 try{raw=new URL(location.href).searchParams.get('return')||sessionStorage.getItem('gtav-onboarding-return')||''}catch{}
 if(!raw)return'';
 try{
  const target=new URL(raw,location.origin);
  const path=(target.pathname||'/').replace(/\/+$/,'')||'/';
  const isHome=path.endsWith('/home')||path.endsWith('/home.html');
  const isWelcome=path==='/'||path.endsWith('/index.html');
  const invalid=target.origin!==location.origin||isHome||isWelcome||target.pathname.includes('release-publisher-8c2f71d4')||target.searchParams.has('return');
  try{sessionStorage.removeItem('gtav-onboarding-return')}catch{}
  if(invalid)return'';
  return target.pathname+target.search+target.hash;
 }catch{
  try{sessionStorage.removeItem('gtav-onboarding-return')}catch{}
  return'';
 }
}
function finish(){const result={...answers,model:answers.device==='ios'?answers.model:'',completedAt:new Date().toISOString()};if(saveChoice('gtav-community-onboarding',result)){try{sessionStorage.removeItem('gtav-community-onboarding')}catch{}}else saveChoice('gtav-community-onboarding',result,true);sendAnalytics(result);finished=true;survey.close();const returnTarget=safeReturnTarget();if(returnTarget){location.assign(returnTarget);return;}const heading=document.querySelector('.home-content h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}if(typeof showWelcomeNotifications==='function')showWelcomeNotifications(result);else location.assign('/home?welcome='+answers.device)}
function radioOptions(name,items,value){const group=textElement('fieldset','onboarding-choices');const legend=textElement('legend','sr-only',title.textContent);group.append(legend);items.forEach(([id,label])=>{const choice=textElement('label','onboarding-choice');const input=document.createElement('input');input.type='radio';input.name=name;input.value=id;input.checked=value===id;input.addEventListener('change',()=>{answers[name]=id;next.disabled=false});choice.append(input,textElement('span','',label),textElement('span','choice-mark'));group.append(choice)});return group}
function renderStep(focus=true){options.replaceChildren();survey.dataset.step=step;back.hidden=step==='source';next.disabled=true;const label=next.firstChild;label.textContent=step==='android'?'Continue anyway':step==='model'?'Continue':'Next';if(privacy)privacy.hidden=step==='android';
if(step==='source'){title.textContent='How did you hear about this project?';description.textContent='Choose the source that introduced you to the project.';options.append(radioOptions('source',[['youtube','YouTube'],['tiktok','TikTok'],['browser','Browser'],['friends','Friends'],['other','Other']],answers.source));next.disabled=!answers.source}
if(step==='device'){title.textContent='Which device will you use to play?';description.textContent='Select the operating system on your device.';options.append(radioOptions('device',[['android','Android'],['ios','iOS']],answers.device));next.disabled=!answers.device}
if(step==='android'){title.textContent='This project is for iOS only.';description.textContent='Android devices are not supported. You can still browse the website and join the community.';const note=textElement('div','android-notice');note.append(textElement('span','notice-dot'),textElement('p','','Browsing the website does not require a supported device.'));options.append(note);next.disabled=false}
if(step==='model'){title.textContent='Which iPhone will you use?';description.textContent='Select your model. This does not confirm device compatibility.';const labelEl=textElement('label','model-label','iPhone model');labelEl.htmlFor='iphone-model';const select=document.createElement('select');select.id='iphone-model';select.name='model';select.required=true;const placeholder=textElement('option','','Select your iPhone');placeholder.value='';placeholder.disabled=true;select.append(placeholder);select.disabled=true;
fetch('compatibility-data.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error('Profiles unavailable');return response.json()}).then(catalog=>{if(step!=='model'||!select.isConnected)return;const groups=new Map();catalog.models.forEach(model=>{if(!groups.has(model.family)){const group=document.createElement('optgroup');group.label=model.family==='X / XS / XR'?'iPhone X / XS / XR':'iPhone '+model.family+' series';groups.set(model.family,group);select.append(group);}const opt=textElement('option','',model.name);opt.value=model.name;groups.get(model.family).append(opt);});select.disabled=false;select.value=answers.model;next.disabled=!select.value;}).catch(()=>{if(step!=='model'||!select.isConnected)return;description.textContent='The iPhone catalog could not be loaded. Go Back and try this step again.';next.disabled=true;});
select.addEventListener('change',()=>{answers.model=select.value;next.disabled=!select.value});options.append(labelEl,select);next.disabled=true}
const current=step==='source'?1:step==='device'?2:3;document.querySelector('#onboarding-step').textContent=step==='android'?'Device availability':`Step ${current} of ${answers.device==='ios'?3:2}`;if(focus)title.focus()}
form.addEventListener('submit',event=>{event.preventDefault();if(next.disabled)return;if(step==='source'){step='device';renderStep()}else if(step==='device'){step=answers.device==='android'?'android':'model';renderStep()}else finish()});
back.addEventListener('click',()=>{step=step==='device'?'source':'device';renderStep()});
survey.addEventListener('cancel',event=>event.preventDefault());
survey.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation()}},true);
survey.addEventListener('close',()=>{if(!finished){survey.showModal();document.documentElement.classList.add('survey-open')}else document.documentElement.classList.remove('survey-open')});
if(privacy)privacy.textContent='Your choices are saved on this browser and counted anonymously in site analytics.';
const arrival=new URL(location.href);let completed=false,savedResult=null;try{savedResult=JSON.parse(localStorage.getItem('gtav-community-onboarding')||sessionStorage.getItem('gtav-community-onboarding')||'null');completed=Boolean(savedResult&&['youtube','tiktok','browser','friends','other'].includes(savedResult.source)&&['android','ios'].includes(savedResult.device)&&(savedResult.device==='android'||savedResult.model))}catch{}
let cleanArrival=false;if(arrival.searchParams.get('intro')==='1'){arrival.searchParams.delete('intro');cleanArrival=true}if(arrival.hash==='#onboarding'||arrival.hash==='#intro'){arrival.hash='';cleanArrival=true}if(cleanArrival)history.replaceState(null,'',arrival.pathname+arrival.search+arrival.hash);
try{document.cookie='gtav-onboarding-transit=; Max-Age=0; Path=/; SameSite=Lax; Secure'}catch{}
if(!completed){step='source';renderStep(false);survey.showModal();document.documentElement.classList.add('survey-open');title.focus()}else sendAnalytics(savedResult);
if(document.body.dataset.page==='home'&&!document.querySelector('script[data-home-music]')){const music=document.createElement('script');music.src='music.js';music.dataset.homeMusic='true';document.head.append(music)}
})();
