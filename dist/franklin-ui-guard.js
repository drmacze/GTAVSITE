(()=>{
  'use strict';
  if(window.__franklinUiGuardLoaded)return;
  window.__franklinUiGuardLoaded=true;

  const root=document.documentElement;
  const editable='input,textarea,select,[contenteditable="true"]';
  let blurTimer=0;
  root.classList.add('franklin-unified-entry');

  const ensureStyle=()=>{
    if(document.getElementById('franklin-ui-guard-style'))return;
    const style=document.createElement('style');
    style.id='franklin-ui-guard-style';
    style.textContent=`
      html.franklin-unified-entry .ask-franklin-launcher,
      html.franklin-unified-entry .franklin-sheet-dock,
      html.franklin-unified-entry .franklin-nudge{
        display:none!important;
      }
      html.franklin-external-keyboard .ask-franklin-panel,
      html.franklin-external-keyboard .lazy-franklin{
        opacity:0!important;
        visibility:hidden!important;
        pointer-events:none!important;
      }
      body[data-page="feedback"] #feedback-helper-slot{
        display:none!important;
      }
    `;
    document.head.append(style);
  };

  const externalEditable=()=>{
    const active=document.activeElement;
    return active instanceof Element && active.matches(editable) && !active.closest('.ask-franklin-panel');
  };

  const syncKeyboard=()=>{
    clearTimeout(blurTimer);
    root.classList.toggle('franklin-external-keyboard',externalEditable());
  };

  const openUnifiedChat=()=>{
    const panel=document.querySelector('.ask-franklin-panel');
    const launcher=document.querySelector('.ask-franklin-launcher');
    if(!launcher||panel?.classList.contains('is-open'))return;
    if(launcher.dataset.state==='compact')launcher.click();
    requestAnimationFrame(()=>{
      if(launcher.dataset.state==='expanded')launcher.click();
    });
  };

  const createPrimaryEntry=()=>{
    if(document.querySelector('.lazy-franklin'))return null;
    if(!document.querySelector('.ask-franklin-launcher'))return null;
    const button=document.createElement('button');
    button.type='button';
    button.className='lazy-franklin';
    button.textContent='Ask Franklin';
    button.setAttribute('aria-label','Open Ask Franklin');
    button.dataset.unifiedEntry='true';
    button.addEventListener('click',openUnifiedChat);
    document.body.append(button);
    return button;
  };

  const normalizeLaunchers=()=>{
    const primary=[...document.querySelectorAll('.lazy-franklin')];
    if(primary.length){
      primary.slice(1).forEach(el=>el.remove());
      const button=primary[0];
      if(button.parentElement?.id==='feedback-helper-slot')document.body.append(button);
      if(button.hidden)button.hidden=false;
    }else{
      createPrimaryEntry();
    }

    const launchers=[...document.querySelectorAll('.ask-franklin-launcher')];
    if(launchers.length>1)launchers.slice(1).forEach(el=>el.remove());
    if(launchers[0]?.parentElement?.id==='feedback-helper-slot')document.body.append(launchers[0]);

    document.querySelectorAll('.franklin-nudge').forEach(el=>el.remove());
  };

  ensureStyle();
  document.addEventListener('focusin',()=>{syncKeyboard();normalizeLaunchers();},true);
  document.addEventListener('focusout',()=>{
    clearTimeout(blurTimer);
    blurTimer=setTimeout(syncKeyboard,180);
  },true);
  window.visualViewport?.addEventListener('resize',syncKeyboard,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncKeyboard,{passive:true});
  window.addEventListener('pageshow',()=>{normalizeLaunchers();syncKeyboard();});

  const observer=new MutationObserver(()=>{normalizeLaunchers();syncKeyboard();});
  observer.observe(document.body,{childList:true,subtree:true});
  normalizeLaunchers();
  syncKeyboard();
})();
