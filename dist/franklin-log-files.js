(()=>{
'use strict';
if(window.__franklinLogFilesV3)return;
window.__franklinLogFilesV3=true;
window.__franklinLogFilesV2=true;

const svg=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${n}"></use></svg>`;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let toastTimer;

function injectStyles(){
 if(document.getElementById('franklin-log-progress-v3-style'))return;
 const style=document.createElement('style');
 style.id='franklin-log-progress-v3-style';
 style.textContent=`
 .helper-log-progress.bot>.bubble{grid-column:2;position:relative;overflow:hidden;min-width:0;width:100%;padding:15px 16px!important;border-color:color-mix(in srgb,var(--site-accent) 24%,var(--settings-line))!important;background:color-mix(in srgb,var(--settings-bg) 90%,transparent)!important}
 .franklin-analysis-status{display:grid;grid-template-columns:20px minmax(0,1fr);gap:5px 10px;align-items:center;min-height:40px}
 .franklin-analysis-spinner{grid-row:1/3;width:18px;height:18px;border-radius:50%;border:2px solid color-mix(in srgb,var(--site-accent) 18%,transparent);border-top-color:var(--site-accent);animation:franklin-analysis-spin .8s linear infinite}
 .franklin-analysis-label{display:block;min-width:0;color:var(--settings-text);font-size:12px;line-height:1.35;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .franklin-analysis-sub{display:block;color:var(--settings-muted);font-size:9px;line-height:1.35;letter-spacing:.02em}
 .franklin-analysis-track{grid-column:1/-1;height:2px;margin-top:7px;overflow:hidden;border-radius:99px;background:color-mix(in srgb,var(--settings-line) 80%,transparent)}
 .franklin-analysis-track>i{display:block;width:100%;height:100%;background:var(--site-accent);transform:scaleX(var(--analysis-progress,.08));transform-origin:left;transition:transform .42s cubic-bezier(.22,1,.36,1)}
 .helper-log-progress.is-typing .franklin-analysis-spinner{display:none}
 .helper-log-progress.is-typing .franklin-analysis-status{grid-template-columns:1fr}
 .helper-log-progress.is-typing .franklin-analysis-label{font-weight:600}
 .franklin-typing-dots{display:inline-flex;align-items:center;gap:4px;margin-left:7px;vertical-align:middle}
 .franklin-typing-dots i{width:4px;height:4px;border-radius:50%;background:var(--site-accent);animation:franklin-analysis-dot .9s ease-in-out infinite}
 .franklin-typing-dots i:nth-child(2){animation-delay:.14s}.franklin-typing-dots i:nth-child(3){animation-delay:.28s}
 .ask-franklin-message.bot>.bubble{position:relative}
 .helper-copy-answer{position:absolute;top:8px;right:8px;z-index:4;width:30px;height:30px;display:grid;place-items:center;padding:0;border:1px solid color-mix(in srgb,var(--settings-line) 88%,transparent);border-radius:8px;background:color-mix(in srgb,var(--settings-bg) 82%,transparent);color:var(--settings-muted);opacity:.72;cursor:pointer;transition:opacity .18s ease,color .18s ease,border-color .18s ease,background .18s ease}
 .helper-copy-answer:hover,.helper-copy-answer:focus-visible{opacity:1;color:var(--settings-text);border-color:color-mix(in srgb,var(--site-accent) 38%,var(--settings-line));background:color-mix(in srgb,var(--site-accent) 7%,var(--settings-bg))}
 .helper-copy-answer:active{transform:scale(.94)}
 .helper-copy-answer svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
 .helper-copy-answer.is-copied{color:var(--site-accent);border-color:color-mix(in srgb,var(--site-accent) 45%,var(--settings-line))}
 .ask-franklin-message.bot:has(.helper-copy-answer)>.bubble{padding-right:44px!important}
 @keyframes franklin-analysis-spin{to{transform:rotate(360deg)}}
 @keyframes franklin-analysis-dot{0%,70%,100%{opacity:.32;transform:translateY(0)}35%{opacity:1;transform:translateY(-2px)}}
 @media(max-width:760px){.helper-copy-answer{top:7px;right:7px;width:28px;height:28px}.ask-franklin-message.bot:has(.helper-copy-answer)>.bubble{padding-right:41px!important}.franklin-analysis-label{font-size:11px}}
 @media(prefers-reduced-motion:reduce){.franklin-analysis-spinner,.franklin-typing-dots i{animation:none}.franklin-analysis-track>i{transition:none}}
 `;
 document.head.append(style);
}

function toast(text){
 document.querySelector('.helper-file-toast')?.remove();
 clearTimeout(toastTimer);
 const el=document.createElement('div');
 el.className='helper-file-toast';
 el.setAttribute('role','status');
 const p=document.createElement('p');p.textContent=text;
 const close=document.createElement('button');close.type='button';close.setAttribute('aria-label','Dismiss notification');close.innerHTML=svg('close');close.onclick=()=>el.remove();
 el.append(p,close);document.body.append(el);
 toastTimer=setTimeout(()=>el.remove(),2600);
}

const copyIcon=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
const checkIcon=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';

async function writeClipboard(text){
 if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;}
 const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();
}

function answerText(bubble){
 const clone=bubble.cloneNode(true);
 clone.querySelectorAll('.helper-copy-answer,.franklin-analysis-status').forEach(node=>node.remove());
 return (clone.innerText||clone.textContent||'').trim();
}

function decorateAnswer(row){
 if(!(row instanceof Element)||!row.matches('.ask-franklin-message.bot'))return;
 if(row.classList.contains('is-thinking')||row.classList.contains('helper-log-progress')||row.dataset.typing==='true')return;
 const bubble=row.querySelector(':scope > .bubble');
 if(!bubble||bubble.querySelector('.helper-copy-answer'))return;
 const text=answerText(bubble);
 if(!text)return;
 const button=document.createElement('button');
 button.type='button';button.className='helper-copy-answer';button.setAttribute('aria-label','Copy Franklin answer');button.title='Copy answer';button.innerHTML=copyIcon();
 button.addEventListener('click',async()=>{
  const value=answerText(bubble);if(!value)return;
  try{await writeClipboard(value);button.classList.add('is-copied');button.innerHTML=checkIcon();button.setAttribute('aria-label','Copied');window.gtavHaptics?.trigger?.('soft');toast('Answer copied.');setTimeout(()=>{if(!button.isConnected)return;button.classList.remove('is-copied');button.innerHTML=copyIcon();button.setAttribute('aria-label','Copy Franklin answer');},1500);}catch{toast('Could not copy this answer.');}
 });
 bubble.append(button);
}

function setupCopyActions(){
 const scan=root=>{
  if(root instanceof Element&&root.matches('.ask-franklin-message.bot'))setTimeout(()=>decorateAnswer(root),180);
  root.querySelectorAll?.('.ask-franklin-message.bot').forEach(row=>setTimeout(()=>decorateAnswer(row),180));
 };
 scan(document);
 const observer=new MutationObserver(records=>{
  for(const record of records){
   record.addedNodes.forEach(node=>{if(node instanceof Element)scan(node)});
   const row=record.target instanceof Element?record.target.closest?.('.ask-franklin-message.bot'):null;
   if(row&&!row.classList.contains('helper-log-progress'))setTimeout(()=>decorateAnswer(row),220);
  }
 });
 observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','data-typing']});
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}

const valid=text=>!/\0/.test(text)&&/(GTA5 UUID|\[RAGE\]|\[macport\]|GTA V.*crash|Game hung for|Unable to find critical archive|compat built|ReflectionMSAA|sample count.*supported|memory:\s*footprint|d3d11\.dylib|CreateDXMTDevice|D3D11CreateDevice|datapatch:|no movies\/|terminated by signal|fatal error:|streamer:)/i.test(text);

function fallback(text,filename=''){
 const a=window.FranklinLogIntelligence?.analyze?.(text,{filename});
 return a?window.FranklinLogIntelligence.format(a):'I received the log, but I cannot identify the cause confidently yet. Please send run.log or run.prev.log from the same incident and ask in #support if the problem continues.';
}

function makeMessage(text,role,extra=''){
 const list=document.querySelector('.ask-franklin-messages');if(!list)return null;
 const row=document.createElement('div');row.className=`ask-franklin-message ${role} helper-log-result ${extra}`.trim();
 if(role==='bot'){const avatar=document.createElement('span');avatar.className='mini-avatar';avatar.textContent='F';row.append(avatar);}
 const bubble=document.createElement('div');bubble.className='bubble';bubble.style.whiteSpace='pre-wrap';bubble.textContent=text;row.append(bubble);list.append(row);list.scrollTop=list.scrollHeight;return {row,bubble,list};
}

function makeProgress(filename){
 const msg=makeMessage('', 'bot', 'helper-log-progress');if(!msg)return null;
 msg.bubble.style.whiteSpace='normal';
 msg.bubble.innerHTML=`<div class="franklin-analysis-status"><span class="franklin-analysis-spinner" aria-hidden="true"></span><strong class="franklin-analysis-label"></strong><small class="franklin-analysis-sub">Local log analysis</small><span class="franklin-analysis-track" aria-hidden="true"><i></i></span></div>`;
 const label=msg.bubble.querySelector('.franklin-analysis-label');
 const sub=msg.bubble.querySelector('.franklin-analysis-sub');
 const set=(text,progress,detail='Local log analysis')=>{label.textContent=text;sub.textContent=detail;msg.bubble.style.setProperty('--analysis-progress',String(progress));msg.list.scrollTop=msg.list.scrollHeight;};
 set(`Franklin is reading ${filename}`, .08, 'Opening the attached file');
 return {...msg,set,label,sub};
}

async function runAnalysisSequence(progress,filename){
 const stages=[
  [`Franklin is reading ${filename}`,.14,'Reading diagnostic lines'],
  ['Franklin is scanning crash signatures',.34,'Checking signals, errors and call stacks'],
  ['Franklin is analyzing the problem',.56,'Separating the primary cause from supporting evidence'],
  ['Franklin is opening the knowledge library',.78,'Comparing against developer knowledge and known fixes'],
  ['Franklin is preparing the diagnosis',.96,'Building the most useful next steps']
 ];
 const started=performance.now();
 for(let i=0;i<stages.length;i++){
  progress.set(...stages[i]);
  const target=(i+1)*940;
  const wait=Math.max(0,target-(performance.now()-started));
  if(wait)await sleep(wait);
 }
 const remaining=Math.max(0,4700-(performance.now()-started));
 if(remaining)await sleep(remaining);
}

async function typingBeat(progress){
 progress.row.classList.add('is-typing');
 progress.bubble.innerHTML='<div class="franklin-analysis-status"><strong class="franklin-analysis-label">Franklin is typing <span class="franklin-typing-dots" aria-hidden="true"><i></i><i></i><i></i></span></strong><small class="franklin-analysis-sub">Diagnosis ready</small></div>';
 await sleep(matchMedia('(prefers-reduced-motion: reduce)').matches?180:620);
 progress.row.classList.remove('helper-log-progress','is-typing');
 progress.bubble.style.removeProperty('--analysis-progress');
 progress.bubble.textContent='';
}

function attach(){
 const form=document.querySelector('.ask-franklin-form');
 if(!form||form.querySelector('.helper-attach'))return false;
 const send=form.querySelector('.ask-franklin-send'),question=form.querySelector('.ask-franklin-input');
 if(!send||!question)return false;
 let file=null,excerpt='',fullText='',busy=false,revision=0;

 const input=document.createElement('input');input.type='file';input.accept='.log,.txt,text/plain';input.hidden=true;input.setAttribute('aria-label','Choose GTA V log');
 const pick=document.createElement('button');pick.type='button';pick.className='helper-attach';pick.setAttribute('aria-label','Attach GTA V log');pick.title='Attach GTA V log (.log or .txt)';pick.innerHTML=svg('paperclip');
 const paste=document.createElement('button');paste.type='button';paste.className='helper-paste';paste.setAttribute('aria-label','Paste into message');paste.title='Paste';paste.innerHTML='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="4" width="8" height="4" rx="1"/><path d="M8 6H5v15h14V6h-3M8 12h8M8 16h6"/></svg>';
 form.insertBefore(paste,send);form.insertBefore(pick,send);form.append(input);form.classList.add('has-log-attachment');

 const bar=document.createElement('div');bar.className='helper-attached-file';bar.hidden=true;
 const name=document.createElement('span'),share=document.createElement('button'),remove=document.createElement('button');share.type=remove.type='button';share.innerHTML=svg('arrow-up-right');share.setAttribute('aria-label','Share original log file outside Franklin');share.title='Share original file outside Franklin';remove.innerHTML=svg('close');remove.setAttribute('aria-label','Remove attached log');bar.append(name,share,remove);form.before(bar);
 const note=document.createElement('p');note.className='helper-attachment-note';note.hidden=true;note.textContent='Press the yellow Send button. Franklin will read the file, analyze diagnostic evidence, cross-check the knowledge library, then return a diagnosis.';bar.after(note);

 const clear=()=>{revision++;file=null;excerpt='';fullText='';delete form.dataset.logAttached;input.value='';bar.hidden=note.hidden=true;send.disabled=busy||!question.value.trim();pick.setAttribute('aria-label','Attach GTA V log');};

 paste.onclick=async()=>{try{const value=await navigator.clipboard.readText();if(!value){toast('Your clipboard is empty.');return;}const start=question.selectionStart??question.value.length,end=question.selectionEnd??start,next=question.value.slice(0,start)+value+question.value.slice(end);if(next.length>question.maxLength){toast('This text is too long. Attach a .log or .txt file instead.');return;}question.value=next;question.focus({preventScroll:true});question.setSelectionRange(start+value.length,start+value.length);question.dispatchEvent(new Event('input',{bubbles:true}));}catch{question.focus({preventScroll:true});toast('Clipboard access was blocked. Touch and hold the message field, then choose Paste.');}};
 pick.onclick=()=>input.click();remove.onclick=clear;
 document.addEventListener('franklin-disconnect',()=>{busy=false;clear();pick.disabled=false;document.querySelector('.helper-file-toast')?.remove();});

 input.onchange=async()=>{
  const selected=input.files?.[0];clear();if(!selected)return;
  if(!/\.(log|txt)$/i.test(selected.name)||selected.size>524288||selected.size===0){toast('Choose a GTA V .log or .txt file, up to 512 KB.');return;}
  const version=revision;
  try{
   const text=await selected.text();if(version!==revision)return;
   if(!valid(text)){toast('This file does not look like a GTA V diagnostic log. Choose run.log, run.prev.log, or crash-*.txt from GTA V > Logs.');return;}
   file=selected;form.dataset.logAttached='true';
   fullText=text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig,'[email removed]').replace(/(authorization\s*[:=]\s*|token\s*[:=]\s*|api[_-]?key\s*[:=]\s*)\S+/ig,'$1[removed]');
   const lines=fullText.split(/\r?\n/),indexes=new Set();
   lines.forEach((line,i)=>{if(i<40||i>=lines.length-90||/fatal|error|crash|exception|signal|memory|thermal|sample count|critical archive|compat built|GTA5 UUID|stalled|Game hung|SIG(?:SEGV|TRAP|ABRT|BUS)|d3d11|dxmt|metal|InternalCommandLibrary|CreateDXMTDevice|D3D11CreateDevice|SettingsDefaults|GetDisplayInfo|GenerateDefaultSettings|CVehicleStreamRenderGfx|guard word trashed|HasExpired|cloud hat|d3dr1|posthook|datapatch|no movies\/|previous run|terminated by signal|0xdddd|trevor3|docks_heista|fbi3|gunclub_shop/i.test(line))for(let j=Math.max(0,i-2);j<=Math.min(lines.length-1,i+2);j++)indexes.add(j);});
   excerpt=[...indexes].sort((a,b)=>a-b).map(i=>lines[i]).join('\n').slice(0,120000);
   name.textContent=`${selected.name} · ${Math.ceil(selected.size/1024)} KB`;name.title=selected.name;bar.hidden=note.hidden=false;send.disabled=busy;share.hidden=!(navigator.canShare&&navigator.canShare({files:[selected]}));pick.setAttribute('aria-label','Replace attached GTA V log');
  }catch{toast('Unable to read this file. Please choose a text log.');}
 };

 question.addEventListener('input',()=>queueMicrotask(()=>{if(file&&!busy)send.disabled=false;}));
 share.onclick=async()=>{if(!file)return;try{await navigator.share({files:[file],title:'GTA V support log'});}catch(error){if(error.name!=='AbortError')toast('Unable to share. Attach the log manually in Discord.');}};

 async function submit(event){
  const generation=window.FranklinSession?.generation;
  if(!file){
   if(/(?:check|review|analy[sz]e|cek|periksa).*\blog\b/i.test(question.value)){event.preventDefault();event.stopImmediatePropagation();toast('Attach run.log, run.prev.log, or crash-*.txt using the paperclip beside Send.');makeMessage('Please attach your GTA V log using the paperclip beside Send. Once selected, press Send to analyze it.','bot');}
   return;
  }
  event.preventDefault();event.stopImmediatePropagation();if(busy)return;
  busy=true;send.disabled=pick.disabled=true;
  const text=excerpt,localText=fullText,filename=file.name,q=question.value.trim();
  makeMessage((q?q+'\n':'')+'Attached log: '+filename,'user');question.value='';
  const progress=makeProgress(filename);clear();

  const analysisPromise=(async()=>{
   try{await window.FranklinSupportContext?.ingestLog(localText);}catch{}
   const analysis=window.FranklinLogIntelligence?.analyze?.(localText,{filename})||null;
   if(analysis&&analysis.kind!=='unknown')return window.FranklinLogIntelligence.format(analysis);
   try{
    const answer=await window.FranklinDeveloperKB?.answer((q||'GTA V diagnostic log')+'\n'+text);
    if(answer?.topic==='developer-troubleshooting'||answer?.topic==='developer-triage')return answer.text;
   }catch{}
   return analysis?window.FranklinLogIntelligence.format(analysis):fallback(localText,filename);
  })();

  try{
   await Promise.all([analysisPromise.then(()=>{}),runAnalysisSequence(progress,filename)]);
   if(generation!==window.FranklinSession?.generation)return;
   const finalText=await analysisPromise;
   await typingBeat(progress);
   if(generation!==window.FranklinSession?.generation)return;
   if(window.FranklinTyping?.reveal)await window.FranklinTyping.reveal(progress.bubble,finalText);else progress.bubble.textContent=finalText;
   setTimeout(()=>decorateAnswer(progress.row),120);
  }catch{
   if(generation!==window.FranklinSession?.generation)return;
   await typingBeat(progress);
   const finalText=fallback(localText,filename);
   if(window.FranklinTyping?.reveal)await window.FranklinTyping.reveal(progress.bubble,finalText);else progress.bubble.textContent=finalText;
   setTimeout(()=>decorateAnswer(progress.row),120);
  }finally{
   if(generation!==window.FranklinSession?.generation)return;
   busy=false;pick.disabled=false;send.disabled=!file&&!question.value.trim();const list=document.querySelector('.ask-franklin-messages');if(list)list.scrollTop=list.scrollHeight;
  }
 }

 send.addEventListener('click',event=>{if(file)submit(event);},true);
 question.addEventListener('keydown',event=>{if(file&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing)submit(event);},true);
 document.addEventListener('submit',event=>{if(event.target===form)submit(event);},true);
 return true;
}

injectStyles();
setupCopyActions();
const link=document.createElement('link');link.rel='stylesheet';link.href='franklin-log-files.css?v=20261031logflow5';document.head.append(link);
if(!attach()){
 const observer=new MutationObserver(()=>{if(attach())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),30000);
}
})();