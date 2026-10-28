(()=>{
 if(!document.body.dataset.page||window.__lazyHelper)return;
 window.__lazyHelper=true;

 const loaded=new Set();
 let running=false;
 let ready=false;

 const button=document.createElement('button');
 button.type='button';
 button.className='lazy-franklin';
 button.textContent='Ask Franklin';
 button.setAttribute('aria-label','Connect to Franklin');
 button.dataset.franklinPrimary='true';
 document.body.append(button);

 const panel=document.createElement('section');
 panel.className='asset-loader';
 panel.hidden=true;
 panel.setAttribute('role','dialog');
 panel.setAttribute('aria-label','Loading Franklin');
 panel.innerHTML='<div><small>ASSISTANT CHANNEL</small><h2>Connecting to Franklin</h2><p role="status">Building the interface…</p><progress max="100" value="0" aria-label="Assets loaded"></progress><small class="asset-count"></small><button type="button">Close</button></div>';
 document.body.append(panel);
 panel.querySelector('button').onclick=()=>{panel.hidden=true};

 const scripts=['franklin-conversation.js','ask-franklin.js','franklin-analytics.js','franklin-funding.js','franklin-typing.js','franklin-support-context.js','franklin-developer-kb.js','franklin-log-files.js','franklin-dataset-engine.js','franklin-claude-rag.js','franklin-site-rag.js','franklin-policy.js','guard-core.js','franklin-i18n.js','franklin-guard.js','franklin-helper-v3.js','franklin-webllm.js','franklin-engine-extra.js','franklin-engine.js'];
 const knowledgeNames=['FranklinDeveloperKB','FranklinDataset','FranklinClaudeRAG'];
 const surfaceHref='ask-franklin-surface-v3.css?v=20261028composer1';

 function script(src){
  if(loaded.has(src))return Promise.resolve();
  return new Promise((resolve,reject)=>{
   const s=document.createElement('script');
   s.src=src+'?v=20261028helper4';
   const timeout=setTimeout(()=>{s.remove();reject(Error('Connection timed out. Tap Retry.'))},20000);
   s.onload=()=>{clearTimeout(timeout);loaded.add(src);resolve()};
   s.onerror=()=>{clearTimeout(timeout);s.remove();reject(Error('An asset could not load. Check your connection and retry.'))};
   document.head.append(s);
  });
 }

 function surfaceStyle(){
  const existing=document.querySelector('link[data-franklin-surface]');
  if(existing)return existing.sheet?Promise.resolve():new Promise((resolve,reject)=>{
   existing.addEventListener('load',resolve,{once:true});
   existing.addEventListener('error',()=>reject(Error('Interface surface could not load.')),{once:true});
  });
  return new Promise((resolve,reject)=>{
   const l=document.createElement('link');
   l.rel='stylesheet';
   l.href=surfaceHref;
   l.dataset.franklinSurface='true';
   l.onload=resolve;
   l.onerror=()=>reject(Error('Interface surface could not load.'));
   document.head.append(l);
  });
 }

 function openFranklin(){
  const chat=document.querySelector('.ask-franklin-panel');
  const controller=document.querySelector('.ask-franklin-launcher');
  if(!controller)return false;
  if(chat?.classList.contains('is-open'))return true;
  if(controller.dataset.state==='compact')controller.click();
  requestAnimationFrame(()=>{
   if(controller.dataset.state==='expanded')controller.click();
  });
  return true;
 }

 async function connect(){
  if(ready){
   openFranklin();
   return;
  }
  panel.hidden=false;
  if(running)return;
  running=true;
  button.disabled=true;
  const status=panel.querySelector('p');
  const progress=panel.querySelector('progress');
  const count=panel.querySelector('.asset-count');
  let done=0;
  const total=scripts.length+knowledgeNames.length+1;
  const update=()=>{progress.value=100*done/total;count.textContent=done+' / '+total+' assets ready'};
  try{
   update();
   for(const src of scripts){
    status.textContent=done<2?'Building the interface…':'Assembling assistant assets…';
    await script(src);done++;update();
   }
   status.textContent='Applying interface surface…';
   await surfaceStyle();done++;update();
   status.textContent='Loading project knowledge…';
   for(const name of knowledgeNames){
    const api=window[name];
    if(!api?.load)throw Error('Knowledge module could not initialize. Reload the page to retry.');
    const data=await Promise.race([api.load(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Knowledge timed out. Reload the page to retry.')),20000))]);
    if(!data?.length)throw Error('Knowledge could not load. Reload the page to retry.');
    done++;update();
   }
   await Promise.all([...document.querySelectorAll('link[data-ask-franklin]')].map(link=>link.sheet?Promise.resolve():new Promise((resolve,reject)=>{
    link.addEventListener('load',resolve,{once:true});
    link.addEventListener('error',()=>reject(Error('Interface styles could not load. Reload to retry.')),{once:true});
    setTimeout(()=>link.sheet?resolve():reject(Error('Styles timed out. Reload to retry.')),20000);
   })));
   status.textContent='Ready';
   ready=true;
   button.disabled=false;
   button.textContent='Ask Franklin';
   button.setAttribute('aria-label','Open Ask Franklin');
   button.dataset.ready='true';
   document.body.classList.remove('helper-assets-pending');
   if(!panel.hidden)openFranklin();
   panel.hidden=true;
  }catch(e){
   status.textContent=e.message||'Unable to connect. Please retry.';
   button.textContent='Retry Franklin';
   button.disabled=false;
  }finally{
   running=false;
  }
 }

 button.addEventListener('click',connect);
 document.addEventListener('franklin-disconnect',()=>{
  button.hidden=false;
  button.disabled=false;
 });
 document.body.classList.add('helper-assets-pending');
})();