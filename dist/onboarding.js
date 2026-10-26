(() => {
let finished=false;
const survey=document.querySelector('#onboarding-dialog');
const form=document.querySelector('#onboarding-form');
const title=document.querySelector('#onboarding-title');
const description=document.querySelector('#onboarding-description');
const options=document.querySelector('#onboarding-options');
const next=document.querySelector('#onboarding-next');
const back=document.querySelector('#onboarding-back');
let step='source';
const answers={source:'',device:'',model:''};
function textElement(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el}
function saveChoice(key,value,session=false){try{(session?sessionStorage:localStorage).setItem(key,JSON.stringify(value));return true}catch{return false}}
function finish(){const result={...answers,model:answers.device==='ios'?answers.model:'',completedAt:new Date().toISOString()};if(saveChoice('gtav-community-onboarding',result)){try{sessionStorage.removeItem('gtav-community-onboarding')}catch{}}else saveChoice('gtav-community-onboarding',result,true);finished=true;survey.close();if(new URL(location.href).searchParams.get('return')==='compatibility.html'){location.assign('compatibility.html');return;}const heading=document.querySelector('.home-content h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}if(typeof showWelcomeNotifications==='function')showWelcomeNotifications(result);else location.assign('home.html?welcome='+answers.device)}
function radioOptions(name,items,value){const group=textElement('fieldset','onboarding-choices');const legend=textElement('legend','sr-only',title.textContent);group.append(legend);items.forEach(([id,label])=>{const choice=textElement('label','onboarding-choice');const input=document.createElement('input');input.type='radio';input.name=name;input.value=id;input.checked=value===id;input.addEventListener('change',()=>{answers[name]=id;next.disabled=false});choice.append(input,textElement('span','',label),textElement('span','choice-mark'));group.append(choice)});return group}
function renderStep(focus=true){options.replaceChildren();survey.dataset.step=step;back.hidden=step==='source';next.disabled=true;const label=next.firstChild;label.textContent=step==='android'?'Continue anyway':step==='model'?'Continue':'Next';document.querySelector('.onboarding-privacy').hidden=step==='android';
if(step==='source'){title.textContent='How did you hear about this project?';description.textContent='Choose the source that introduced you to the project.';options.append(radioOptions('source',[['youtube','YouTube'],['tiktok','TikTok'],['browser','Browser'],['friends','Friends'],['other','Other']],answers.source));next.disabled=!answers.source}
if(step==='device'){title.textContent='Which device will you use to play?';description.textContent='Select the operating system on your device.';options.append(radioOptions('device',[['android','Android'],['ios','iOS']],answers.device));next.disabled=!answers.device}
if(step==='android'){title.textContent='This project is for iOS only.';description.textContent='Android devices are not supported. You can still browse the website and join the community.';const note=textElement('div','android-notice');note.append(textElement('span','notice-dot'),textElement('p','','Browsing the website does not require a supported device.'));options.append(note);next.disabled=false}
if(step==='model'){title.textContent='Which iPhone will you use?';description.textContent='Select your model. This does not confirm device compatibility.';const labelEl=textElement('label','model-label','iPhone model');labelEl.htmlFor='iphone-model';const select=document.createElement('select');select.id='iphone-model';select.name='model';select.required=true;const placeholder=textElement('option','','Select your iPhone');placeholder.value='';placeholder.disabled=true;select.append(placeholder);select.disabled=true;
fetch('compatibility-data.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error('Profiles unavailable');return response.json()}).then(catalog=>{
 if(step!=='model'||!select.isConnected)return;const groups=new Map();catalog.models.forEach(model=>{if(!groups.has(model.family)){const group=document.createElement('optgroup');group.label=model.family==='X / XS / XR'?'iPhone X / XS / XR':'iPhone '+model.family+' series';groups.set(model.family,group);select.append(group);}const opt=textElement('option','',model.name);opt.value=model.name;groups.get(model.family).append(opt);});select.disabled=false;select.value=answers.model;next.disabled=!select.value;
}).catch(()=>{if(step!=='model'||!select.isConnected)return;description.textContent='The iPhone catalog could not be loaded. Go Back and try this step again.';next.disabled=true;});
select.addEventListener('change',()=>{answers.model=select.value;next.disabled=!select.value});options.append(labelEl,select);next.disabled=true}
const current=step==='source'?1:step==='device'?2:3;document.querySelector('#onboarding-step').textContent=step==='android'?'Device availability':`Step ${current} of ${answers.device==='ios'?3:2}`;if(focus)title.focus()}
form.addEventListener('submit',event=>{event.preventDefault();if(next.disabled)return;if(step==='source'){step='device';renderStep()}else if(step==='device'){step=answers.device==='android'?'android':'model';renderStep()}else finish()});
back.addEventListener('click',()=>{step=step==='device'?'source':'device';renderStep()});
survey.addEventListener('cancel',event=>event.preventDefault());
survey.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation()}},true);
survey.addEventListener('close',()=>{if(!finished){survey.showModal();document.documentElement.classList.add('survey-open')}else document.documentElement.classList.remove('survey-open')});

const arrival=new URL(location.href);
let completed=false;try{const saved=JSON.parse(localStorage.getItem('gtav-community-onboarding')||sessionStorage.getItem('gtav-community-onboarding')||'null');completed=Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model))}catch{}
if(arrival.searchParams.get('intro')==='1'){
 arrival.searchParams.delete('intro');history.replaceState(null,'',arrival.pathname+arrival.search+arrival.hash);
}
if(!completed){
 step='source';renderStep(false);survey.showModal();document.documentElement.classList.add('survey-open');title.focus();
}
if(document.body.dataset.page==='home'&&!document.querySelector('script[data-home-music]')){
 const music=document.createElement('script');music.src='music.js';music.dataset.homeMusic='true';document.head.append(music);
}

})();
