(()=>{
  'use strict';
  const gate=document.querySelector('.franklin-direct-gate');
  const track=document.querySelector('.franklin-swipe');
  const knob=document.querySelector('.franklin-swipe-knob');
  const status=document.querySelector('.franklin-direct-status');
  if(!gate||!track||!knob||!status)return;

  let dragging=false;
  let pointerId=null;
  let startX=0;
  let startOffset=0;
  let offset=0;
  let complete=false;
  let loadTimer=0;
  let statusTimer=0;

  const maxOffset=()=>Math.max(0,track.clientWidth-knob.offsetWidth-10);
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const progress=()=>maxOffset()?offset/maxOffset():0;
  const render=()=>{
    const p=clamp(progress(),0,1);
    track.style.setProperty('--swipe-x',`${offset}px`);
    track.style.setProperty('--swipe-progress',String(p));
    track.setAttribute('aria-valuenow',String(Math.round(p*100)));
  };
  const setOffset=value=>{offset=clamp(value,0,maxOffset());render()};
  const snapHome=()=>{
    track.classList.add('is-snapping');
    setOffset(0);
    window.setTimeout(()=>track.classList.remove('is-snapping'),240);
  };
  const resetForRetry=message=>{
    window.clearTimeout(loadTimer);
    window.clearInterval(statusTimer);
    complete=false;
    dragging=false;
    pointerId=null;
    gate.classList.remove('is-unlocking');
    track.classList.remove('is-complete');
    status.textContent=message||'Swipe again to retry.';
    snapHome();
  };
  const helperIsOpen=()=>document.querySelector('.ask-franklin-panel.is-open');
  const finishGate=()=>{
    window.clearTimeout(loadTimer);
    window.clearInterval(statusTimer);
    status.textContent='Franklin is ready.';
    gate.classList.add('is-ready');
    gate.setAttribute('aria-hidden','true');
    window.setTimeout(()=>{gate.hidden=true},320);
  };
  const watchHelper=()=>{
    if(helperIsOpen()){finishGate();return}
    const observer=new MutationObserver(()=>{
      if(helperIsOpen()){
        observer.disconnect();
        finishGate();
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
    statusTimer=window.setInterval(()=>{
      const loaderStatus=document.querySelector('.asset-loader p[role="status"]');
      const retry=document.querySelector('.lazy-franklin');
      if(loaderStatus?.textContent)status.textContent=loaderStatus.textContent;
      if(retry?.textContent?.trim()==='Retry Franklin'){
        observer.disconnect();
        resetForRetry('Franklin connection failed. Swipe again to retry.');
      }
    },250);
    loadTimer=window.setTimeout(()=>{
      observer.disconnect();
      if(!helperIsOpen())resetForRetry('Franklin is not connected yet. Swipe again to retry.');
    },26000);
  };
  const connect=()=>{
    if(complete)return;
    complete=true;
    dragging=false;
    track.classList.remove('is-dragging');
    track.classList.add('is-complete','is-snapping');
    setOffset(maxOffset());
    window.setTimeout(()=>track.classList.remove('is-snapping'),220);
    gate.classList.add('is-unlocking');
    status.textContent='Connecting to Franklin…';
    const loader=document.querySelector('.lazy-franklin');
    if(!loader){
      resetForRetry('Franklin loader is not ready. Swipe again to retry.');
      return;
    }
    watchHelper();
    loader.click();
  };
  const startsOnKnob=event=>{
    const rect=knob.getBoundingClientRect();
    const pad=7;
    return event.clientX>=rect.left-pad&&event.clientX<=rect.right+pad&&event.clientY>=rect.top-pad&&event.clientY<=rect.bottom+pad;
  };

  track.addEventListener('pointerdown',event=>{
    if(complete||dragging||event.button!==undefined&&event.button!==0||!startsOnKnob(event))return;
    dragging=true;
    pointerId=event.pointerId;
    startX=event.clientX;
    startOffset=offset;
    track.classList.remove('is-snapping');
    track.classList.add('is-dragging');
    try{track.setPointerCapture(pointerId)}catch{}
    event.preventDefault();
  });
  track.addEventListener('pointermove',event=>{
    if(!dragging||event.pointerId!==pointerId||complete)return;
    setOffset(startOffset+(event.clientX-startX));
    event.preventDefault();
  });
  const release=event=>{
    if(!dragging||event.pointerId!==pointerId||complete)return;
    dragging=false;
    track.classList.remove('is-dragging');
    try{track.releasePointerCapture(pointerId)}catch{}
    pointerId=null;
    if(progress()>=.88)connect();
    else snapHome();
    event.preventDefault();
  };
  track.addEventListener('pointerup',release);
  track.addEventListener('pointercancel',event=>{
    if(!dragging||event.pointerId!==pointerId||complete)return;
    dragging=false;
    pointerId=null;
    track.classList.remove('is-dragging');
    snapHome();
  });
  track.addEventListener('click',event=>event.preventDefault());
  track.addEventListener('contextmenu',event=>event.preventDefault());
  track.addEventListener('keydown',event=>{
    if(complete)return;
    if(event.key==='ArrowRight'){
      event.preventDefault();
      setOffset(offset+Math.max(18,maxOffset()*.12));
      if(progress()>=.88)connect();
    }else if(event.key==='Home'||event.key==='ArrowLeft'){
      event.preventDefault();
      snapHome();
    }else if(event.key==='End'){
      event.preventDefault();
      setOffset(maxOffset());
      connect();
    }
  });
  window.addEventListener('resize',()=>{if(complete)setOffset(maxOffset());else setOffset(0)},{passive:true});
  render();
})();
