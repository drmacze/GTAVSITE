(()=>{
'use strict';
if(window.__franklinLauncherControlV1)return;
window.__franklinLauncherControlV1=true;
if(document.body?.dataset.page!=='home')return;

const STORAGE_KEY='gtav_franklin_launcher_pos_v1';
const PRIMARY='.lazy-franklin[data-franklin-primary="true"]';
const ANY='.lazy-franklin';
const SECONDARY='.ask-franklin-launcher,.franklin-sheet-dock,.franklin-nudge';
const MARGIN=12;
const DEFAULT_RAISE=30;
let activeButton=null;
let suppressClickUntil=0;
let drag=null;

const style=document.createElement('style');
style.id='franklin-launcher-control-v1-style';
style.textContent=`
html.franklin-unified-entry body[data-page="home"] .lazy-franklin{touch-action:none!important;user-select:none!important;-webkit-user-select:none!important;cursor:grab!important}
html.franklin-unified-entry body[data-page="home"] .lazy-franklin[data-dragging="true"]{cursor:grabbing!important;transition:none!important;transform:none!important}
html.franklin-unified-entry body[data-page="home"] .lazy-franklin[data-state="compact"]{width:60px!important;min-width:60px!important;height:60px!important;min-height:60px!important;padding:4px!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;animation:none!important;overflow:visible!important}
html.franklin-unified-entry body[data-page="home"] .lazy-franklin[data-state="compact"]::before,html.franklin-unified-entry body[data-page="home"] .lazy-franklin[data-state="compact"]::after{display:none!important;content:none!important}
html.franklin-unified-entry body[data-page="home"] .lazy-franklin[data-state="compact"] .lazy-franklin-avatar{width:52px!important;height:52px!important;flex-basis:52px!important;margin:auto!important;border:1px solid color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 72%,#fff 10%)!important;box-shadow:0 10px 26px rgba(0,0,0,.34),0 0 0 2px rgba(0,0,0,.18)!important}
body[data-page="home"] .ask-franklin-launcher,body[data-page="home"] .franklin-sheet-dock,body[data-page="home"] .franklin-nudge{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;overflow:hidden!important}
`;
document.head.append(style);

const viewport=()=>({w:window.visualViewport?.width||window.innerWidth,h:window.visualViewport?.height||window.innerHeight});
const clamp=(value,min,max)=>Math.min(Math.max(value,min),Math.max(min,max));
const safeRect=(button,left,top)=>{
 const {w,h}=viewport();
 const rect=button.getBoundingClientRect();
 const width=rect.width||60;
 const height=rect.height||60;
 return {
  left:clamp(left,MARGIN,w-width-MARGIN),
  top:clamp(top,MARGIN,h-height-MARGIN)
 };
};
const applyPosition=(button,left,top)=>{
 const pos=safeRect(button,left,top);
 button.style.setProperty('left',`${Math.round(pos.left)}px`,'important');
 button.style.setProperty('top',`${Math.round(pos.top)}px`,'important');
 button.style.setProperty('right','auto','important');
 button.style.setProperty('bottom','auto','important');
 return pos;
};
const savePosition=pos=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(pos))}catch{}};
const readPosition=()=>{try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return value&&Number.isFinite(value.left)&&Number.isFinite(value.top)?value:null}catch{return null}};

function hideSecondaryControllers(){
 document.querySelectorAll(SECONDARY).forEach(node=>{
  node.setAttribute('aria-hidden','true');
  node.tabIndex=-1;
 });
}

function keepSingleVisual(){
 const buttons=[...document.querySelectorAll(ANY)];
 if(!buttons.length)return null;
 const primary=buttons.find(el=>el.matches(PRIMARY))||buttons.find(el=>el.dataset.unifiedFallback!=='true')||buttons[0];
 buttons.forEach(el=>{if(el!==primary&&el.dataset.franklinPrimary!=='true')el.remove()});
 return primary;
}

function initialPlace(button){
 if(!button||button.dataset.launcherPlaced==='true')return;
 if(document.body.classList.contains('intro4-active'))return;
 const rect=button.getBoundingClientRect();
 if(rect.width<1||rect.height<1)return;
 button.dataset.launcherPlaced='true';
 const saved=readPosition();
 if(saved){applyPosition(button,saved.left,saved.top);return}
 applyPosition(button,rect.left,rect.top-DEFAULT_RAISE);
}

function finishDrag(event,button){
 if(!drag||drag.pointerId!==event.pointerId)return;
 const moved=drag.moved;
 try{button.releasePointerCapture?.(event.pointerId)}catch{}
 button.dataset.dragging='false';
 if(moved){
  const rect=button.getBoundingClientRect();
  const pos=applyPosition(button,rect.left,rect.top);
  savePosition(pos);
  suppressClickUntil=performance.now()+420;
 }
 drag=null;
}

function bindDrag(button){
 if(!button||button.dataset.franklinDragBound==='true')return;
 button.dataset.franklinDragBound='true';
 button.addEventListener('pointerdown',event=>{
  if(event.button!==undefined&&event.button!==0)return;
  const rect=button.getBoundingClientRect();
  drag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,startLeft:rect.left,startTop:rect.top,moved:false};
  try{button.setPointerCapture?.(event.pointerId)}catch{}
 });
 button.addEventListener('pointermove',event=>{
  if(!drag||drag.pointerId!==event.pointerId)return;
  const dx=event.clientX-drag.startX;
  const dy=event.clientY-drag.startY;
  if(!drag.moved&&Math.hypot(dx,dy)<6)return;
  drag.moved=true;
  button.dataset.dragging='true';
  event.preventDefault();
  applyPosition(button,drag.startLeft+dx,drag.startTop+dy);
 });
 button.addEventListener('pointerup',event=>finishDrag(event,button));
 button.addEventListener('pointercancel',event=>finishDrag(event,button));
 button.addEventListener('click',event=>{
  if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}
 },true);
 const stateObserver=new MutationObserver(()=>{
  if(button.dataset.launcherPlaced!=='true')return;
  const rect=button.getBoundingClientRect();
  if(rect.width>0&&rect.height>0)applyPosition(button,rect.left,rect.top);
 });
 stateObserver.observe(button,{attributes:true,attributeFilter:['data-state']});
 window.addEventListener('pagehide',()=>stateObserver.disconnect(),{once:true});
}

function sync(){
 hideSecondaryControllers();
 const button=keepSingleVisual();
 if(!button)return;
 activeButton=button;
 bindDrag(button);
 initialPlace(button);
}

const observer=new MutationObserver(()=>requestAnimationFrame(sync));
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('resize',()=>{
 if(!activeButton?.isConnected||activeButton.dataset.launcherPlaced!=='true')return;
 const rect=activeButton.getBoundingClientRect();
 applyPosition(activeButton,rect.left,rect.top);
},{passive:true});
window.visualViewport?.addEventListener('resize',()=>{
 if(!activeButton?.isConnected||activeButton.dataset.launcherPlaced!=='true')return;
 const rect=activeButton.getBoundingClientRect();
 applyPosition(activeButton,rect.left,rect.top);
},{passive:true});
window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});

sync();
})();
