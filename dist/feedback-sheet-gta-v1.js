(()=>{
'use strict';
if(window.__feedbackGtaSheetV1||document.body?.dataset.page!=='feedback')return;
window.__feedbackGtaSheetV1=true;

const sheet=document.querySelector('.feedback-sheet');
const form=document.getElementById('feedback-form');
const success=document.getElementById('feedback-success');
if(!sheet||!form||!success)return;

const svg=name=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let drag=null;
let successTimer=0;
let closedBySuccess=false;

sheet.classList.add('feedback-gta-sheet');
sheet.setAttribute('role','dialog');
sheet.setAttribute('aria-modal','true');
sheet.setAttribute('aria-label','Feedback and Issues');
if(sheet.parentElement!==document.body)document.body.append(sheet);

const backdrop=document.createElement('button');
backdrop.type='button';
backdrop.className='feedback-sheet-backdrop';
backdrop.setAttribute('aria-label','Close Feedback and Issues');
document.body.append(backdrop);

const close=document.createElement('button');
close.type='button';
close.className='feedback-sheet-close';
close.setAttribute('aria-label','Close Feedback and Issues');
close.innerHTML=svg('close');
sheet.append(close);

const dock=document.createElement('button');
dock.type='button';
dock.className='feedback-sheet-dock';
dock.setAttribute('aria-label','Open Feedback and Issues');
dock.innerHTML=`<span class="feedback-dock-grip" aria-hidden="true"></span><strong>Feedback &amp; Issues</strong><small>Tap to reopen</small>${svg('arrow-up-right').replace('class="icon"','class="feedback-dock-arrow"')}`;
document.body.append(dock);

const dockTitle=dock.querySelector('strong');
const dockHint=dock.querySelector('small');
const grip=sheet.querySelector('.sheet-grip');
const top=sheet.querySelector('.sheet-top');
if(grip)grip.classList.add('feedback-sheet-handle');

function setDock(successState=false){
 if(successState){
  dockTitle.textContent='Feedback sent';
  dockHint.textContent='Tap to view receipt';
 }else{
  dockTitle.textContent='Feedback & Issues';
  dockHint.textContent='Tap to reopen';
 }
}

function openSheet({focus=false}={}){
 clearTimeout(successTimer);
 sheet.style.removeProperty('transform');
 sheet.classList.remove('is-dragging');
 grip?.classList.remove('is-dragging');
 top?.classList.remove('is-dragging');
 sheet.classList.add('is-open');
 backdrop.classList.add('is-open');
 dock.classList.remove('is-visible');
 sheet.removeAttribute('aria-hidden');
 document.documentElement.classList.add('feedback-sheet-open');
 if(focus)requestAnimationFrame(()=>close.focus({preventScroll:true}));
}

function closeSheet(reason='manual'){
 clearTimeout(successTimer);
 sheet.style.removeProperty('transform');
 sheet.classList.remove('is-dragging','is-open');
 grip?.classList.remove('is-dragging');
 top?.classList.remove('is-dragging');
 backdrop.classList.remove('is-open');
 sheet.setAttribute('aria-hidden','true');
 document.documentElement.classList.remove('feedback-sheet-open');
 closedBySuccess=reason==='success';
 setDock(closedBySuccess);
 requestAnimationFrame(()=>dock.classList.add('is-visible'));
 if(reason!=='success')requestAnimationFrame(()=>dock.focus({preventScroll:true}));
}

function reopen(){
 openSheet({focus:true});
}

close.addEventListener('click',()=>closeSheet('manual'));
backdrop.addEventListener('click',()=>closeSheet('manual'));
dock.addEventListener('click',reopen);
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&sheet.classList.contains('is-open'))closeSheet('manual');
});

function beginDrag(event){
 if(!sheet.classList.contains('is-open'))return;
 if(event.button!==undefined&&event.button!==0)return;
 if(event.target instanceof Element&&event.target.closest('button,a,input,textarea,select,label'))return;
 drag={id:event.pointerId,startY:event.clientY,lastY:event.clientY,lastT:performance.now(),dy:0,velocity:0};
 try{sheet.setPointerCapture(event.pointerId)}catch{}
 sheet.classList.add('is-dragging');
 grip?.classList.add('is-dragging');
 top?.classList.add('is-dragging');
}
function moveDrag(event){
 if(!drag||event.pointerId!==drag.id)return;
 const now=performance.now();
 const dy=Math.max(0,event.clientY-drag.startY);
 const dt=Math.max(1,now-drag.lastT);
 drag.velocity=(event.clientY-drag.lastY)/dt;
 drag.lastY=event.clientY;
 drag.lastT=now;
 drag.dy=dy;
 if(dy<2)return;
 sheet.style.transform=`translate(-50%,${Math.round(dy)}px)`;
 event.preventDefault();
}
function endDrag(event){
 if(!drag||event.pointerId!==drag.id)return;
 try{sheet.releasePointerCapture(event.pointerId)}catch{}
 const shouldClose=drag.dy>110||(drag.dy>42&&drag.velocity>.55);
 drag=null;
 sheet.style.removeProperty('transform');
 sheet.classList.remove('is-dragging');
 grip?.classList.remove('is-dragging');
 top?.classList.remove('is-dragging');
 if(shouldClose)closeSheet('manual');
}
[grip,top].filter(Boolean).forEach(handle=>{
 handle.addEventListener('pointerdown',beginDrag);
 handle.addEventListener('pointermove',moveDrag);
 handle.addEventListener('pointerup',endDrag);
 handle.addEventListener('pointercancel',endDrag);
});

// Keep each form step at the top of the sheet rather than scrolling the page behind it.
document.addEventListener('click',event=>{
 if(!(event.target instanceof Element))return;
 if(!event.target.closest('.feedback-next,.feedback-back,#new-report'))return;
 requestAnimationFrame(()=>sheet.scrollTo({top:0,behavior:'auto'}));
},true);

// feedback.js only reveals #feedback-success after /api/feedback confirms success.
// Close after that state, never on the submit gesture itself, so failed requests keep the draft open.
const onSuccess=()=>{
 if(success.hidden)return;
 closedBySuccess=true;
 sheet.scrollTo({top:0,behavior:'auto'});
 setDock(true);
 clearTimeout(successTimer);
 successTimer=setTimeout(()=>closeSheet('success'),reduced?450:1050);
};
const successObserver=new MutationObserver(onSuccess);
successObserver.observe(success,{attributes:true,attributeFilter:['hidden']});

const newReport=document.getElementById('new-report');
newReport?.addEventListener('click',()=>{
 closedBySuccess=false;
 setDock(false);
 openSheet();
 requestAnimationFrame(()=>sheet.scrollTo({top:0,behavior:'auto'}));
});

window.addEventListener('pagehide',()=>{
 clearTimeout(successTimer);
 successObserver.disconnect();
},{once:true});

requestAnimationFrame(()=>openSheet());
window.FeedbackGtaSheet={open:reopen,close:()=>closeSheet('manual'),status:()=>({open:sheet.classList.contains('is-open'),success:closedBySuccess})};
})();
