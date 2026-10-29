(()=>{
'use strict';

const state={os:'',uuid:'',build:null,releaseKey:'',source:'user'};
const get=()=>({...state});
let builds=[],ready=null;
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const PROFILE_KEY='franklin-device-profile-v1';
const LATEST_BUILDS=[
  {
    key:'release-20261027-ios',
    uuid:'',
    label:'27 Oct release',
    platform:'iOS / iPadOS',
    compat:'',
    line:'27 Oct launcher release: Reflection MSAA safety limit added. GTA5 UUID is intentionally not asserted for this launcher-only release.'
  },
  {
    key:'release-20261028-ios',
    uuid:'031BBA86',
    label:'28 Oct release',
    platform:'iOS / iPadOS',
    compat:'Oct 27 2026 23:13:09',
    line:'28 Oct release: GTA5 031BBA86; compat built Oct 27 2026 23:13:09.'
  }
];

function savedProfile(){
 try{
  const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');
  return p&&['iOS','iPadOS','macOS'].includes(p.family)&&(p.version===''||/^\d{1,2}(?:\.\d{1,2}){0,2}$/.test(p.version))?p:null;
 }catch{return null;}
}
function saveProfile(family,version){
 if(!['iOS','iPadOS','macOS'].includes(family)||version&&!/^\d{1,2}(?:\.\d{1,2}){0,2}$/.test(version))return false;
 try{localStorage.setItem(PROFILE_KEY,JSON.stringify({family,version}));return true;}catch{return false;}
}
function forgetProfile(){try{localStorage.removeItem(PROFILE_KEY);}catch{}}
function restoreOS(){const p=savedProfile();state.os=p?p.family+(p.version?' '+p.version:' (version not specified)'):'';return p;}
restoreOS();

function buildKey(build){return build?.key||build?.uuid||'';}
function load(){
 return ready||(ready=fetch('knowledge/kb.json?v=20261029kb28',{cache:'no-store'}).then(r=>r.json()).then(data=>{
  const ref=data.find(e=>e.id==='REF-02');
  const legacy=(ref?.player_fix||[]).flatMap(line=>[...line.matchAll(/GTA5\s+([A-F0-9]{8})\b/g)].map(m=>({
   key:m[1],
   uuid:m[1],
   label:line.split(':')[0].replace(/, CURRENT/g,''),
   platform:/Mac app\s*$/.test(line.slice(0,m.index))?'macOS':'iOS / iPadOS',
   compat:line.match(/compat built ([^;]+)/)?.[1]||'',
   line
  })));
  const seen=new Set(legacy.map(b=>buildKey(b)));
  builds=[...legacy,...LATEST_BUILDS.filter(b=>!seen.has(buildKey(b)))];
  return builds;
 }).catch(()=>{builds=[...LATEST_BUILDS];return builds;}));
}
function match(uuid){const n=norm(uuid);return n?builds.find(b=>b.uuid&&n.startsWith(b.uuid))||null:null;}
function setUUID(id,source='user'){
 state.uuid=String(id||'').toUpperCase();
 state.build=match(id);
 state.releaseKey=state.build?buildKey(state.build):'';
 state.source=source;
 sync();
}
function summary(){
 const buildPart=state.build?(state.build.label+(state.uuid?' · '+state.uuid:'')):state.uuid?'Unknown build · '+state.uuid:'Build not specified';
 return [state.os||'OS not specified',buildPart].join(' · ');
}
async function consume(q){
 const generation=window.FranklinSession?.generation;
 await load();
 if(generation!==window.FranklinSession?.generation)return null;
 const text=String(q||'');
 const os=text.match(/\b(iOS|iPadOS|macOS)\s*(\d{1,2}(?:\.\d{1,2}){0,2})\b/i);
 const ids=[...text.matchAll(/(?:GTA5\s+(?:UUID\s*)?|UUID\s*[:=]?\s*)([a-f0-9]{8}(?:-[a-f0-9-]{4,})?)\b/ig)];
 const bare=text.trim().match(/^([a-f0-9]{8}(?:-[a-f0-9-]{4,})?)$/i);
 const id=ids[0]?.[1]||bare?.[1];
 const standalone=(os&&/^(?:(?:using|on|my os is|i use|i am using)\s+)?(?:ios|ipados|macos)\s*\d{1,2}(?:\.\d{1,2}){0,2}[.!]?$/i.test(text.trim()))||(id&&/^(?:(?:GTA5\s+(?:UUID\s*[:=]?\s*)?|UUID\s*[:=]?\s*))?[a-f0-9]{8}(?:-[a-f0-9-]{4,})?$/i.test(text.trim()));
 if(os&&standalone){
  state.os=os[1]+' '+os[2];state.source='user';
  saveProfile(({ios:'iOS',ipados:'iPadOS',macos:'macOS'})[os[1].toLowerCase()],os[2]);
 }
 if(id&&standalone)setUUID(id);
 if(os&&standalone)sync();
 if(!standalone)return null;
 if(id){
  const found=state.build;
  const intro=found?`Build identified from XDE's release list: ${found.label} (${found.platform}). GTA5 UUID prefix: ${found.uuid}.`:'This UUID is not in the supplied developer list. I will keep it as unverified; please include the compat built line or the full log.';
  return {text:intro+(state.os?'\n\nOS recorded: '+state.os+'.':'')+'\n\nWhat happens when you launch or play? If this follows an earlier issue, attach the log so we can check the actual failure.',grounded:true,topic:'support-context'};
 }
 return {text:`OS recorded: ${state.os}. I will use this for the current support session. Which build are you using, and what happens just before the issue?`,grounded:true,topic:'support-context'};
}
async function ingestLog(text){
 const generation=window.FranklinSession?.generation;
 await load();
 if(generation!==window.FranklinSession?.generation)return;
 const matchOS=String(text||'').match(/\b(iOS|iPadOS|macOS)\s*(\d{1,2}(?:\.\d{1,2}){0,2})\b/i);
 if(matchOS)state.os=matchOS[1]+' '+matchOS[2];
 const uuid=String(text||'').match(/GTA5\s+(?:UUID\s*[:=]?\s*)?([a-f0-9]{8}(?:-[a-f0-9-]{4,})?)/i);
 if(uuid)setUUID(uuid[1],'log');
 sync();
}
function shortLabel(b){
 const date=b?.label?.match(/^(\d+ Oct)/)?.[1]||b?.label||'Unknown build';
 return date+' 2026'+(/evening/i.test(b?.label||'')?' · Evening test':/morning/i.test(b?.label||'')?' · Morning':/second update/i.test(b?.label||'')?' · Second update':'');
}
function sync(){
 const label=document.querySelector('.helper-session-label');
 if(label)label.textContent=[state.os||'OS not specified',state.build?shortLabel(state.build):'Build not specified'].join(' · ');
}
function filteredBuilds(platform){return builds.filter(b=>platform==='macOS'?b.platform==='macOS':b.platform!=='macOS').slice().reverse();}

function init(){
 const form=document.querySelector('.ask-franklin-form');if(!form)return;
 const panel=document.querySelector('.ask-franklin-panel');panel.dataset.supportPhase='setup';
 const input=form.querySelector('textarea');if(document.activeElement===input)input.blur();input.placeholder='Ask Franklin…';
 const saved=savedProfile();
 let step=saved?3:1,family=saved?.family||'',version=saved?.version||'',unknownVersion=!!saved&&!saved.version,selected=null;
 const wizard=document.createElement('section');wizard.className='helper-setup';wizard.setAttribute('aria-label','Set up your support session');
 const session=document.createElement('div');session.className='helper-session';session.hidden=true;
 const label=document.createElement('span');label.className='helper-session-label';
 const edit=document.createElement('button');edit.type='button';edit.textContent='Change';edit.setAttribute('aria-label','Change support device details');
 session.append(label,edit);
 panel.insertBefore(wizard,document.querySelector('.ask-franklin-messages'));
 panel.insertBefore(session,wizard);
 edit.onclick=()=>{const savedNow=restoreOS();step=savedNow?3:1;family=savedNow?.family||'';version=savedNow?.version||'';unknownVersion=!!savedNow&&!savedNow.version;selected=null;panel.dataset.supportPhase='setup';session.hidden=true;wizard.hidden=false;render();};
 const focus=()=>wizard.querySelector('h2')?.focus({preventScroll:true});

 function render(){
  wizard.replaceChildren();
  const meta=document.createElement('p');meta.className='helper-setup-step';meta.textContent=step===3&&savedProfile()?'WELCOME BACK · SELECT APP VERSION':'SUPPORT SETUP · '+step+' OF 3';
  const title=document.createElement('h2');title.tabIndex=-1;title.textContent=step===1?'Which operating system?':step===2?'Which '+family+' version?':'Which app version?';
  const description=document.createElement('p');description.className='helper-setup-description';description.textContent=step===1?'Choose the system you use to play.':step===2?'Find the version in your device settings. You can continue if you are not sure.':'Showing releases for '+family+'. Choose the release you installed.';
  wizard.append(meta,title,description);
  const content=document.createElement('div');content.className='helper-setup-options';wizard.append(content);
  const actions=document.createElement('div');actions.className='helper-setup-actions';
  const back=document.createElement('button');back.type='button';back.textContent=step===3&&savedProfile()?'Edit saved OS':'Back';back.hidden=step===1;back.onclick=()=>{step=step===3&&savedProfile()?1:step-1;render();focus();};
  const next=document.createElement('button');next.type='button';next.className='helper-setup-next';next.textContent=step===3?'Start conversation':'Continue';actions.append(back,next);

  if(step===1){
   ['iOS','iPadOS','macOS'].forEach(value=>{const b=document.createElement('button');b.type='button';b.className='helper-setup-choice';b.setAttribute('aria-pressed',String(family===value));b.textContent=value;b.onclick=()=>{if(family!==value){version='';unknownVersion=false;selected=null;}family=value;content.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));next.disabled=false;};content.append(b);});
   next.disabled=!family;
  }
  if(step===2){
   const l=document.createElement('label');l.textContent=family+' version';
   const field=document.createElement('input');field.type='text';field.inputMode='text';field.autocomplete='off';field.spellcheck=false;field.setAttribute('autocapitalize','none');field.placeholder=family==='macOS'?'e.g. 14.7':'e.g. 27.2';field.maxLength=12;field.value=version;l.append(field);content.append(l);
   const unsure=document.createElement('button');unsure.type='button';unsure.className='helper-setup-unsure';unsure.textContent='I’m not sure';unsure.setAttribute('aria-pressed',String(unknownVersion));unsure.onclick=()=>{unknownVersion=true;version='';field.value='';field.setCustomValidity('');unsure.setAttribute('aria-pressed','true');next.disabled=false;};
   field.oninput=()=>{version=field.value.trim().replace(/,/g,'.');if(field.value.includes(','))field.value=field.value.replace(/,/g,'.');unknownVersion=false;unsure.setAttribute('aria-pressed','false');next.disabled=!/^\d{1,2}(?:\.\d{1,2}){0,2}$/.test(version);};content.append(unsure);
   next.disabled=!unknownVersion&&!/^\d{1,2}(?:\.\d{1,2}){0,2}$/.test(version);
  }
  if(step===3){
   const context=document.createElement('span');context.className='helper-setup-platform';context.textContent=family+(version?' '+version:' · Version not specified');content.append(context);
   if(savedProfile()){
    const memory=document.createElement('p');memory.className='helper-profile-note';memory.textContent='OS details are saved in this browser. Only your app version is needed for this session.';content.append(memory);
    const forget=document.createElement('button');forget.type='button';forget.className='helper-setup-unsure';forget.textContent='Forget saved OS';forget.onclick=()=>{forgetProfile();family='';version='';unknownVersion=false;selected=null;step=1;state.os='';render();};content.append(forget);
   }
   const list=document.createElement('div');list.className='helper-build-list';
   const make=(b,text)=>{const button=document.createElement('button');button.type='button';button.className='helper-setup-choice';const value=b?buildKey(b):'unknown';button.setAttribute('aria-pressed',String(selected===value));button.textContent=text;button.onclick=()=>{selected=value;list.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));next.disabled=false;};list.append(button);};
   filteredBuilds(family).forEach(b=>make(b,shortLabel(b)));
   make(null,'I’m not sure / another version');content.append(list);next.disabled=!selected;
  }
  next.onclick=()=>{
   if(step<3){if(step===2){saveProfile(family,version);state.os=family+(version?' '+version:' (version not specified)');}step++;render();focus();return;}
   state.os=family+(version?' '+version:' (version not specified)');state.source='user';
   const chosen=selected==='unknown'?null:builds.find(b=>buildKey(b)===selected)||null;
   state.build=chosen;state.releaseKey=chosen?buildKey(chosen):'';state.uuid=chosen?.uuid||'';
   panel.dataset.supportPhase='chat';wizard.hidden=true;session.hidden=false;sync();document.querySelector('.ask-franklin-messages')?.scrollTo(0,0);
  };
  wizard.append(actions);
 }

 document.addEventListener('franklin-disconnect',()=>{const savedNow=restoreOS();state.uuid='';state.build=null;state.releaseKey='';state.source='user';step=savedNow?3:1;family=savedNow?.family||'';version=savedNow?.version||'';unknownVersion=!!savedNow&&!savedNow.version;selected=null;panel.dataset.supportPhase='setup';session.hidden=true;wizard.hidden=false;render();sync();});
 load().then(()=>render());
 document.addEventListener('franklin-connected',()=>{if(panel.dataset.supportPhase==='setup')focus();});
 render();

 const messages=document.querySelector('.ask-franklin-messages');let scheduled=false;
 const decorate=()=>{scheduled=false;messages?.querySelectorAll('.bot .bubble').forEach(bubble=>{if(bubble.closest('[data-typing="true"]'))return;const walker=document.createTreeWalker(bubble,NodeFilter.SHOW_TEXT),nodes=[];let n;while(n=walker.nextNode())if(!n.parentElement.closest('button,a'))nodes.push(n);for(const node of nodes){const re=/\b[A-F0-9]{8}(?:-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12})?\b/g;const matches=[...node.textContent.matchAll(re)];if(!matches.length)continue;const frag=document.createDocumentFragment();let end=0;for(const m of matches){frag.append(document.createTextNode(node.textContent.slice(end,m.index)));const btn=document.createElement('button');btn.type='button';btn.className='helper-copy-uuid';btn.textContent=m[0];btn.setAttribute('aria-label','Copy UUID '+m[0]);btn.onclick=async()=>{try{await navigator.clipboard.writeText(m[0]);btn.textContent='Copied';setTimeout(()=>btn.textContent=m[0],1300);}catch{btn.textContent='Select to copy';btn.style.userSelect='text';}};frag.append(btn);end=m.index+m[0].length;}frag.append(document.createTextNode(node.textContent.slice(end)));node.replaceWith(frag);}});};
 if(messages)new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(decorate);}}).observe(messages,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-typing']});
 sync();
}

window.FranklinSupportContext={load,get,consume,ingestLog,summary,match,filteredBuilds,savedProfile,saveProfile,forgetProfile};
if(document.querySelector('.ask-franklin-form'))init();else{const o=new MutationObserver(()=>{if(document.querySelector('.ask-franklin-form')){o.disconnect();init();}});o.observe(document.body,{childList:true,subtree:true});}
})();
