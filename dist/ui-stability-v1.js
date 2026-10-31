(()=>{
'use strict';
if(window.__gtavUiStabilityV1)return;
window.__gtavUiStabilityV1=true;

const mobile=()=>matchMedia('(max-width:760px)').matches;
const ios=/iP(?:hone|ad|od)/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
const safari=/Safari/i.test(navigator.userAgent)&&!/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);
if(ios&&safari)document.documentElement.dataset.mobileSafari='true';
document.documentElement.dataset.uiStable='true';

function restoreFeedbackPage(){
 if(document.body?.dataset.page!=='feedback'||!mobile())return;
 const body=document.body;
 const savedTop=parseFloat(getComputedStyle(body).getPropertyValue('--feedback-page-top'))||0;
 body.classList.remove('feedback-page-locked');
 body.style.removeProperty('--feedback-page-top');
 const sheet=document.querySelector('.feedback-sheet');
 if(sheet){
  sheet.classList.remove('is-open','is-dragging');
  sheet.inert=false;
  sheet.removeAttribute('aria-hidden');
  for(const prop of ['transform','top','bottom','height','max-height','will-change'])sheet.style.removeProperty(prop);
 }
 document.querySelectorAll('.feedback-sheet-dock').forEach(node=>node.remove());
 if(savedTop<0&&Math.abs(window.scrollY)<2)requestAnimationFrame(()=>scrollTo({top:-savedTop,behavior:'instant'}));
}

function stabilizeFeedback(){
 if(document.body?.dataset.page!=='feedback')return;
 restoreFeedbackPage();
 document.addEventListener('pointerdown',event=>{
  if(!mobile()||!(event.target instanceof Element))return;
  if(event.target.closest('.feedback-sheet .sheet-grip,.feedback-sheet .sheet-top'))event.stopImmediatePropagation();
 },true);
 const mq=matchMedia('(max-width:760px)');
 mq.addEventListener?.('change',()=>requestAnimationFrame(restoreFeedbackPage));
 window.addEventListener('pageshow',()=>requestAnimationFrame(restoreFeedbackPage),{passive:true});
 window.addEventListener('resize',()=>requestAnimationFrame(restoreFeedbackPage),{passive:true});
 setTimeout(restoreFeedbackPage,0);
 setTimeout(restoreFeedbackPage,180);
}

function compactUpdates(){
 if(document.body?.dataset.page!=='updates'||!mobile())return;
 const apply=()=>{
  document.querySelectorAll('.managed-update-details').forEach(details=>{details.open=false});
  document.querySelectorAll('.release-list .release-card').forEach(details=>{details.open=false});
 };
 apply();
 requestAnimationFrame(apply);
 setTimeout(apply,250);
}

function stabilizeAnimations(){
 const sync=()=>{
  document.body?.toggleAttribute('data-ui-hidden',document.hidden);
  if(document.hidden){
   document.querySelectorAll('video').forEach(video=>{if(!video.paused){video.dataset.uiResume='true';video.pause();}});
  }else{
   document.querySelectorAll('video[data-ui-resume="true"]').forEach(video=>{
    delete video.dataset.uiResume;
    const rect=video.getBoundingClientRect();
    if(rect.bottom>0&&rect.top<innerHeight)video.play().catch(()=>{});
   });
  }
 };
 document.addEventListener('visibilitychange',sync,{passive:true});
 sync();
}

function boot(){
 stabilizeFeedback();
 compactUpdates();
 stabilizeAnimations();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
