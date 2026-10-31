(()=>{
'use strict';
if(window.__feedbackSheetMobileFixV1||document.body?.dataset.page!=='feedback')return;
window.__feedbackSheetMobileFixV1=true;

const sheet=document.querySelector('.feedback-sheet');
if(!sheet)return;
const mq=matchMedia('(max-width:760px)');
const handles=[sheet.querySelector('.sheet-grip'),sheet.querySelector('.sheet-top')].filter(Boolean);
let drag=null;

function clear(){
 drag=null;
 sheet.style.removeProperty('--feedback-mobile-drag-y');
}
function start(event){
 if(!mq.matches||!sheet.classList.contains('is-open'))return;
 if(event.button!==undefined&&event.button!==0)return;
 if(event.target instanceof Element&&event.target.closest('button,a,input,textarea,select,label'))return;
 drag={id:event.pointerId,startY:event.clientY};
}
function move(event){
 if(!mq.matches||!drag||event.pointerId!==drag.id)return;
 const dy=Math.max(0,event.clientY-drag.startY);
 sheet.style.setProperty('--feedback-mobile-drag-y',`${Math.round(dy)}px`);
}
function end(event){
 if(!drag||event.pointerId!==drag.id)return;
 requestAnimationFrame(clear);
}

handles.forEach(handle=>{
 handle.addEventListener('pointerdown',start,{passive:true});
 handle.addEventListener('pointermove',move,{passive:true});
 handle.addEventListener('pointerup',end,{passive:true});
 handle.addEventListener('pointercancel',end,{passive:true});
});

new MutationObserver(()=>{
 if(!sheet.classList.contains('is-dragging'))sheet.style.removeProperty('--feedback-mobile-drag-y');
}).observe(sheet,{attributes:true,attributeFilter:['class']});

mq.addEventListener?.('change',clear);
window.addEventListener('pagehide',clear,{once:true});
})();
