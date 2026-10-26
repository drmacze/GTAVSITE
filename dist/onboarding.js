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
function finish(){const result={...answers,model:answers.device==='ios'?answers.model:'',completedAt:new Date().toISOString()};saveChoice('gtav-community-onboarding',result);finished=true;survey.close();const heading=document.querySelector('.home-content h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}if(typeof showWelcomeNotifications==='function')showWelcomeNotifications(result);else location.assign('home.html?welcome='+answers.device)}
function radioOptions(name,items,value){const group=textElement('fieldset','onboarding-choices');const legend=textElement('legend','sr-only',title.textContent);group.append(legend);items.forEach(([id,label])=>{const choice=textElement('label','onboarding-choice');const input=document.createElement('input');input.type='radio';input.name=name;input.value=id;input.checked=value===id;input.addEventListener('change',()=>{answers[name]=id;next.disabled=false});choice.append(input,textElement('span','',label),textElement('span','choice-mark'));group.append(choice)});return group}
function renderStep(focus=true){options.replaceChildren();survey.dataset.step=step;back.hidden=step==='source';next.disabled=true;const label=next.firstChild;label.textContent=step==='android'?'Continue anyway':step==='model'?'Continue':'Next';document.querySelector('.onboarding-privacy').hidden=step==='android';
if(step==='source'){title.textContent='How did you hear about this project?';description.textContent='Choose the source that introduced you to the project.';options.append(radioOptions('source',[['youtube','YouTube'],['tiktok','TikTok'],['browser','Browser'],['friends','Friends'],['other','Other']],answers.source));next.disabled=!answers.source}
if(step==='device'){title.textContent='Which device will you use to play?';description.textContent='Select the operating system on your device.';options.append(radioOptions('device',[['android','Android'],['ios','iOS']],answers.device));next.disabled=!answers.device}
if(step==='android'){title.textContent='This project is for iOS only.';description.textContent='Android devices are not supported. You can still browse the website and join the community.';const note=textElement('div','android-notice');note.append(textElement('span','notice-dot'),textElement('p','','Browsing the website does not require a supported device.'));options.append(note);next.disabled=false}
if(step==='model'){title.textContent='Which iPhone will you use?';description.textContent='Select your model. This does not confirm device compatibility.';const labelEl=textElement('label','model-label','iPhone model');labelEl.htmlFor='iphone-model';const select=document.createElement('select');select.id='iphone-model';select.name='model';select.required=true;const placeholder=textElement('option','','Select your iPhone');placeholder.value='';placeholder.disabled=true;select.append(placeholder);['iPhone X','iPhone XR','iPhone XS','iPhone XS Max','iPhone 11','iPhone 12','iPhone 13','iPhone 14','iPhone 15','iPhone 16','iPhone 17','iPhone 18'].forEach(model=>{const opt=textElement('option','',model);opt.value=model;select.append(opt)});select.value=answers.model;select.addEventListener('change',()=>{answers.model=select.value;next.disabled=!select.value});options.append(labelEl,select);next.disabled=!answers.model}
const current=step==='source'?1:step==='device'?2:3;document.querySelector('#onboarding-step').textContent=step==='android'?'Device availability':`Step ${current} of ${answers.device==='ios'?3:2}`;if(focus)title.focus()}
form.addEventListener('submit',event=>{event.preventDefault();if(next.disabled)return;if(step==='source'){step='device';renderStep()}else if(step==='device'){step=answers.device==='android'?'android':'model';renderStep()}else finish()});
back.addEventListener('click',()=>{step=step==='device'?'source':'device';renderStep()});
survey.addEventListener('cancel',event=>event.preventDefault());
survey.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation()}},true);
survey.addEventListener('close',()=>{if(!finished){survey.showModal();document.documentElement.classList.add('survey-open')}else document.documentElement.classList.remove('survey-open')});

const arrival=new URL(location.href);
let completed=false;try{const saved=JSON.parse(localStorage.getItem('gtav-community-onboarding')||'null');completed=Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model))}catch{}
if(arrival.searchParams.get('intro')==='1'||!completed){
 arrival.searchParams.delete('intro');history.replaceState(null,'',arrival.pathname+arrival.search+arrival.hash);
 step='source';renderStep(false);survey.showModal();document.documentElement.classList.add('survey-open');title.focus();
}

})();
