(()=>{
'use strict';
if(window.__franklinLauncherReturnFixV1)return;
window.__franklinLauncherReturnFixV1=true;
if(document.body?.dataset.page!=='home')return;

const STORAGE='gtav_franklin_shell_position_v2';
let returnPos=null;
let wasOpen=false;
let restoreTimer=0;

const launcher=()=>document.querySelector('.franklin-shell-launcher');
const panel=()=>document.querySelector('.ask-franklin-panel[data-franklin-shell-v2]');
const isOpen=()=>!!panel()?.classList.contains('is-open');
const viewport=()=>({w:window.visualViewport?.width||innerWidth,h:window.visualViewport?.height||innerHeight});
const clamp=(value,min,max)=>Math.min(Math.max(value,min),Math.max(min,max));

function snapshot(){
 const el=launcher();
 if(!el||isOpen())return;
 const rect=el.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 returnPos={left:rect.left,top:rect.top};
}
function save(pos){
 try{localStorage.setItem(STORAGE,JSON.stringify(pos))}catch{}
}
function restore(){
 const el=launcher();
 if(!el||!returnPos||isOpen())return;
 const {w,h}=viewport();
 const rect=el.getBoundingClientRect();
 const width=rect.width||62;
 const height=rect.height||62;
 const pos={
  left:clamp(returnPos.left,12,w-width-12),
  top:clamp(returnPos.top,12,h-height-12)
 };
 el.style.setProperty('left',Math.round(pos.left)+'px');
 el.style.setProperty('top',Math.round(pos.top)+'px');
 el.style.setProperty('right','auto');
 el.style.setProperty('bottom','auto');
 save(pos);
 returnPos=pos;
}
function scheduleRestore(){
 clearTimeout(restoreTimer);
 document.activeElement instanceof HTMLElement&&document.activeElement.closest?.('.ask-franklin-panel')&&document.activeElement.blur();
 requestAnimationFrame(()=>requestAnimationFrame(restore));
 restoreTimer=setTimeout(restore,260);
}
function sync(){
 const open=isOpen();
 if(open&&!wasOpen){
  const el=launcher();
  if(el){
   const rect=el.getBoundingClientRect();
   if(rect.width&&rect.height)returnPos={left:rect.left,top:rect.top};
  }
 }
 if(!open&&wasOpen)scheduleRestore();
 wasOpen=open;
}

function boot(){
 const el=launcher();
 const p=panel();
 if(!el||!p)return false;
 snapshot();
 wasOpen=p.classList.contains('is-open');
 const observer=new MutationObserver(sync);
 observer.observe(p,{attributes:true,attributeFilter:['class']});
 el.addEventListener('pointerup',()=>setTimeout(snapshot,0),{passive:true});
 el.addEventListener('click',()=>{if(!isOpen())setTimeout(snapshot,0)},{passive:true});
 document.addEventListener('franklin-connected',()=>{
  const rect=el.getBoundingClientRect();
  if(rect.width&&rect.height)returnPos={left:rect.left,top:rect.top};
 });
 addEventListener('pageshow',()=>setTimeout(snapshot,0),{passive:true});
 addEventListener('pagehide',()=>{observer.disconnect();clearTimeout(restoreTimer)},{once:true});
 return true;
}

let tries=0;
const timer=setInterval(()=>{tries++;if(boot()||tries>400)clearInterval(timer)},25);
})();
