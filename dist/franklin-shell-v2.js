(()=>{
'use strict';
if(window.__franklinShellV2)return;
window.__franklinShellV2=true;
if(document.body?.dataset.page!=='home')return;

const STORAGE='gtav_franklin_shell_position_v2';
const AVATAR='assets/avatars/franklin.jpg';
const LEGACY='.lazy-franklin,.franklin-connect-layer,.ask-franklin-launcher,.franklin-sheet-dock,.franklin-nudge';
const ENGINE_SCRIPTS=[
 'franklin-conversation.js?v=20261030shell4',
 'franklin-typing.js?v=20261030shell4',
 'franklin-dataset-engine.js?v=20261030shell4',
 'franklin-claude-rag.js?v=20261030shell4',
 'franklin-site-rag.js?v=20261030shell4',
 'franklin-webllm.js?v=20261030shell4',
 'franklin-support-context.js?v=20261030shell4',
 'franklin-release-29-v1.js?v=20261030release29',
 'franklin-developer-kb.js?v=20261030shell4',
 'franklin-log-files.js?v=20261030shell4',
 'franklin-engine-extra.js?v=20261030shell4',
 'franklin-engine.js?v=20261030shell4',
 'franklin-policy.js?v=20261030shell4'
];
let enginePromise=null;
let engineReady=false;
let drag=null;
let suppressClickUntil=0;
let sheetDrag=null;
let connecting=false;
let launcherState='compact';

const svg=name=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function purgeLegacy(root=document){
 const nodes=[];
 if(root instanceof Element&&root.matches(LEGACY))nodes.push(root);
 root.querySelectorAll?.(LEGACY).forEach(node=>nodes.push(node));
 nodes.forEach(node=>node.remove());
 document.querySelectorAll('.ask-franklin-panel:not([data-franklin-shell-v2])').forEach(node=>node.remove());
 [
  '#franklin-ui-guard-v2-style','#franklin-helper-glow-v1-style','#franklin-launcher-control-v1-style',
  '#franklin-glass-v2-style','#franklin-polish-v3-style'
 ].forEach(selector=>document.querySelector(selector)?.remove());
 document.querySelectorAll('link[href*="franklin-glass-v2.css"],link[href*="franklin-polish-v3.css"],link[href*="franklin-helper-glow-v1.css"]').forEach(node=>node.remove());
}

function script(src){
 return new Promise((resolve,reject)=>{
  const base=src.split('?')[0];
  const existing=[...document.scripts].find(s=>(s.getAttribute('src')||'').split('?')[0].endsWith(base));
  if(existing){
   if(existing.dataset.loaded==='true'||existing.readyState==='complete'){resolve();return;}
   let settled=false;
   const done=()=>{if(settled)return;settled=true;resolve()};
   existing.addEventListener('load',done,{once:true});
   existing.addEventListener('error',()=>{if(settled)return;settled=true;reject(new Error('Unable to load '+base))},{once:true});
   setTimeout(done,1200);
   return;
  }
  const el=document.createElement('script');
  el.src=src;
  el.async=false;
  el.onload=()=>{el.dataset.loaded='true';resolve()};
  el.onerror=()=>reject(new Error('Unable to load '+base));
  document.head.append(el);
 });
}

async function ensureEngine(onProgress=()=>{}){
 if(engineReady){onProgress(1,'Ready');return true;}
 if(enginePromise){await enginePromise;onProgress(1,'Ready');return true;}
 enginePromise=(async()=>{
  for(let i=0;i<ENGINE_SCRIPTS.length;i++){
   const file=ENGINE_SCRIPTS[i];
   const pct=i/ENGINE_SCRIPTS.length;
   const label=i<3?'Loading interface':i<8?'Loading support context':'Loading knowledge engine';
   onProgress(pct,label);
   await script(file);
  }
  onProgress(.94,'Preparing Franklin');
  try{await window.FranklinEngine?.preload?.()}catch{}
  engineReady=true;
  onProgress(1,'Ready');
  return true;
 })().catch(error=>{enginePromise=null;engineReady=false;throw error});
 return enginePromise;
}

purgeLegacy();

const launcher=document.createElement('button');
launcher.type='button';
launcher.className='franklin-shell-launcher';
launcher.dataset.state='compact';
launcher.setAttribute('aria-label','Expand Franklin helper. Drag to move.');
launcher.innerHTML=`
 <span class="franklin-shell-launcher-avatar" aria-hidden="true"><img src="${AVATAR}" alt=""><i></i></span>
 <span class="franklin-shell-launcher-copy"><small>COMMUNITY HELPER</small><strong>Ask Franklin</strong><em>Tap again to connect</em></span>
 <span class="franklin-shell-launcher-arrow" aria-hidden="true">${svg('arrow-right')}</span>
 <span class="franklin-shell-launcher-progress" aria-hidden="true"><i></i></span>`;
document.body.append(launcher);

const launcherCopy=launcher.querySelector('.franklin-shell-launcher-copy');
const launcherProgress=launcher.querySelector('.franklin-shell-launcher-progress i');

const backdrop=document.createElement('div');
backdrop.className='franklin-shell-backdrop';
backdrop.setAttribute('aria-hidden','true');
document.body.append(backdrop);

const panel=document.createElement('section');
panel.className='ask-franklin-panel';
panel.dataset.franklinShellV2='true';
panel.setAttribute('role','dialog');
panel.setAttribute('aria-modal','true');
panel.setAttribute('aria-labelledby','franklin-shell-title');
panel.innerHTML=`
 <div class="franklin-shell-grip" aria-hidden="true"><span></span></div>
 <header class="franklin-shell-header">
  <span class="franklin-shell-head-avatar" aria-hidden="true"><img src="${AVATAR}" alt=""><i></i></span>
  <div class="franklin-shell-title"><small>COMMUNITY HELPER</small><strong id="franklin-shell-title">Franklin</strong></div>
  <div class="franklin-shell-head-actions">
   <button type="button" class="franklin-shell-disconnect">Disconnect</button>
   <button type="button" class="franklin-shell-icon-button franklin-shell-close" aria-label="Close Franklin">${svg('close')}</button>
  </div>
 </header>
 <p class="franklin-shell-status" hidden></p>
 <div class="ask-franklin-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
 <form class="ask-franklin-form">
  <textarea class="ask-franklin-input" rows="1" maxlength="32000" placeholder="Ask Franklin about GTA V iOS…" aria-label="Message Franklin"></textarea>
  <button class="ask-franklin-send" type="submit" disabled aria-label="Send message">${svg('arrow-right')}</button>
 </form>`;
document.body.append(panel);

const input=panel.querySelector('.ask-franklin-input');
const send=panel.querySelector('.ask-franklin-send');
const status=panel.querySelector('.franklin-shell-status');
const grip=panel.querySelector('.franklin-shell-grip');
const header=panel.querySelector('.franklin-shell-header');

function setStatus(text,hidden=false){status.textContent=text;status.hidden=hidden}
function setLauncherState(state){
 launcherState=state;
 launcher.dataset.state=state;
 if(state==='compact'){
  launcher.setAttribute('aria-label','Expand Franklin helper. Drag to move.');
  launcherCopy.querySelector('small').textContent='COMMUNITY HELPER';
  launcherCopy.querySelector('strong').textContent='Ask Franklin';
  launcherCopy.querySelector('em').textContent='Tap again to connect';
  launcherProgress.style.transform='scaleX(0)';
 }
 if(state==='expanded'){
  launcher.setAttribute('aria-label','Connect to Franklin. Drag to move.');
  launcherCopy.querySelector('small').textContent='COMMUNITY HELPER';
  launcherCopy.querySelector('strong').textContent='Ask Franklin';
  launcherCopy.querySelector('em').textContent='Tap again to connect';
 }
 if(state==='connecting')launcher.setAttribute('aria-label','Connecting to Franklin');
 requestAnimationFrame(()=>keepLauncherInBounds());
}
function setConnectingProgress(value,label){
 launcherCopy.querySelector('small').textContent='CONNECTING TO FRANKLIN';
 launcherCopy.querySelector('strong').textContent=label||'Loading';
 launcherCopy.querySelector('em').textContent=Math.round(Math.max(0,Math.min(1,value))*100)+'%';
 launcherProgress.style.transform=`scaleX(${Math.max(0,Math.min(1,value))})`;
}
function openPanel(){
 if(panel.classList.contains('is-open'))return;
 panel.classList.add('is-open');
 backdrop.classList.add('is-open');
 document.documentElement.classList.add('franklin-shell-open');
 setStatus('',true);
 window.dispatchEvent(new CustomEvent('franklin-connected'));
 document.dispatchEvent(new CustomEvent('franklin-connected'));
 requestAnimationFrame(()=>panel.querySelector('.helper-setup:not([hidden]) h2')?.focus?.({preventScroll:true}));
}
async function connectAndOpen(){
 if(connecting)return;
 connecting=true;
 setLauncherState('connecting');
 const started=performance.now();
 try{
  await ensureEngine((progress,label)=>setConnectingProgress(progress,label));
  const elapsed=performance.now()-started;
  if(elapsed<560)await sleep(560-elapsed);
  setConnectingProgress(1,'Ready');
  await sleep(120);
  openPanel();
  setLauncherState('compact');
 }catch{
  launcherCopy.querySelector('small').textContent='CONNECTION FAILED';
  launcherCopy.querySelector('strong').textContent='Try again';
  launcherCopy.querySelector('em').textContent='Tap to retry';
  launcherProgress.style.transform='scaleX(0)';
  setLauncherState('expanded');
 }finally{connecting=false;}
}
function closePanel(){
 panel.style.removeProperty('transform');
 panel.classList.remove('is-dragging','is-open');
 backdrop.classList.remove('is-open');
 document.documentElement.classList.remove('franklin-shell-open');
 setLauncherState('compact');
}
function disconnect(){
 document.dispatchEvent(new CustomEvent('franklin-disconnect'));
 panel.querySelector('.ask-franklin-messages')?.replaceChildren();
 closePanel();
}

panel.querySelector('.franklin-shell-close').addEventListener('click',closePanel);
panel.querySelector('.franklin-shell-disconnect').addEventListener('click',disconnect);
backdrop.addEventListener('click',closePanel);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('is-open'))closePanel()});

input.addEventListener('input',()=>{
 send.disabled=!input.value.trim();
 input.style.height='auto';
 input.style.height=Math.min(input.scrollHeight,112)+'px';
});
input.addEventListener('keydown',event=>{
 if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();if(!send.disabled)panel.querySelector('.ask-franklin-form').requestSubmit();}
});

const viewport=()=>({w:visualViewport?.width||innerWidth,h:visualViewport?.height||innerHeight});
const clamp=(v,min,max)=>Math.min(Math.max(v,min),Math.max(min,max));
function applyLauncher(left,top){
 const rect=launcher.getBoundingClientRect();
 const {w,h}=viewport();
 const width=rect.width||62,height=rect.height||62;
 const pos={left:clamp(left,12,w-width-12),top:clamp(top,12,h-height-12)};
 launcher.style.setProperty('left',Math.round(pos.left)+'px');
 launcher.style.setProperty('top',Math.round(pos.top)+'px');
 launcher.style.setProperty('right','auto');
 launcher.style.setProperty('bottom','auto');
 return pos;
}
function savedPosition(){try{const value=JSON.parse(localStorage.getItem(STORAGE)||'null');return value&&Number.isFinite(value.left)&&Number.isFinite(value.top)?value:null}catch{return null}}
function savePosition(pos){try{localStorage.setItem(STORAGE,JSON.stringify(pos))}catch{}}
function restorePosition(){
 const saved=savedPosition();
 if(saved){requestAnimationFrame(()=>applyLauncher(saved.left,saved.top));return}
 launcher.style.removeProperty('left');launcher.style.removeProperty('top');launcher.style.removeProperty('right');launcher.style.removeProperty('bottom');
}
restorePosition();

launcher.addEventListener('pointerdown',event=>{
 if(event.button!==undefined&&event.button!==0)return;
 const rect=launcher.getBoundingClientRect();
 drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,moved:false};
 try{launcher.setPointerCapture(event.pointerId)}catch{}
});
launcher.addEventListener('pointermove',event=>{
 if(!drag||drag.id!==event.pointerId)return;
 const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
 if(!drag.moved&&Math.hypot(dx,dy)<6)return;
 drag.moved=true;launcher.dataset.dragging='true';event.preventDefault();
 applyLauncher(drag.left+dx,drag.top+dy);
});
function endLauncherDrag(event){
 if(!drag||drag.id!==event.pointerId)return;
 try{launcher.releasePointerCapture(event.pointerId)}catch{}
 if(drag.moved){const rect=launcher.getBoundingClientRect();savePosition(applyLauncher(rect.left,rect.top));suppressClickUntil=performance.now()+400}
 launcher.dataset.dragging='false';drag=null;
}
launcher.addEventListener('pointerup',endLauncherDrag);
launcher.addEventListener('pointercancel',endLauncherDrag);
launcher.addEventListener('click',event=>{
 if(performance.now()<suppressClickUntil){event.preventDefault();return;}
 if(launcherState==='compact'){setLauncherState('expanded');return;}
 if(launcherState==='expanded'){connectAndOpen();return;}
});

function startSheetDrag(event){
 if(event.target.closest('button,a,input,textarea,select'))return;
 const rect=panel.getBoundingClientRect();
 sheetDrag={id:event.pointerId,startY:event.clientY,startTop:rect.top,dy:0};
 try{panel.setPointerCapture(event.pointerId)}catch{}
}
function moveSheetDrag(event){
 if(!sheetDrag||sheetDrag.id!==event.pointerId)return;
 const dy=Math.max(0,event.clientY-sheetDrag.startY);sheetDrag.dy=dy;
 if(dy<3)return;
 panel.classList.add('is-dragging');
 panel.style.transform=`translate(-50%, ${dy}px)`;
 event.preventDefault();
}
function endSheetDrag(event){
 if(!sheetDrag||sheetDrag.id!==event.pointerId)return;
 try{panel.releasePointerCapture(event.pointerId)}catch{}
 const shouldClose=sheetDrag.dy>90;
 sheetDrag=null;panel.classList.remove('is-dragging');panel.style.removeProperty('transform');
 if(shouldClose)closePanel();
}
[grip,header].forEach(handle=>{
 handle.addEventListener('pointerdown',startSheetDrag);
 handle.addEventListener('pointermove',moveSheetDrag);
 handle.addEventListener('pointerup',endSheetDrag);
 handle.addEventListener('pointercancel',endSheetDrag);
});

const legacyObserver=new MutationObserver(records=>{
 for(const record of records){
  for(const node of record.addedNodes){if(node instanceof Element)purgeLegacy(node)}
 }
});
legacyObserver.observe(document.body,{childList:true,subtree:true});

function keepLauncherInBounds(){
 if(!launcher.style.top)return;
 const rect=launcher.getBoundingClientRect();
 applyLauncher(rect.left,rect.top);
}
addEventListener('resize',keepLauncherInBounds,{passive:true});
visualViewport?.addEventListener('resize',keepLauncherInBounds,{passive:true});
addEventListener('pagehide',()=>legacyObserver.disconnect(),{once:true});
})();