(()=>{
  'use strict';
  if(window.__franklinUiGuardLoaded)return;
  window.__franklinUiGuardLoaded=true;

  const root=document.documentElement;
  const editable='input,textarea,select,[contenteditable="true"]';
  let blurTimer=0;

  const ensureStyle=()=>{
    if(document.getElementById('franklin-ui-guard-style'))return;
    const style=document.createElement('style');
    style.id='franklin-ui-guard-style';
    style.textContent=`
      html.franklin-external-keyboard .ask-franklin-launcher,
      html.franklin-external-keyboard .ask-franklin-panel,
      html.franklin-external-keyboard .franklin-sheet-dock,
      html.franklin-external-keyboard .franklin-nudge,
      html.franklin-external-keyboard .lazy-franklin{
        opacity:0!important;
        visibility:hidden!important;
        pointer-events:none!important;
      }
      body[data-page="feedback"] .franklin-nudge{display:none!important}
      body[data-page="feedback"] #feedback-helper-slot:has(.ask-franklin-launcher){display:none!important}
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

  const normalizeLaunchers=()=>{
    const launchers=[...document.querySelectorAll('.ask-franklin-launcher')];
    if(launchers.length){
      document.querySelectorAll('.lazy-franklin').forEach(el=>{el.hidden=true;});
      launchers.slice(1).forEach(el=>el.remove());
      const launcher=launchers[0];
      if(document.body?.dataset.page==='feedback' && launcher.parentElement?.id==='feedback-helper-slot'){
        document.body.append(launcher);
      }
    }
    if(document.body?.dataset.page==='feedback'){
      document.querySelectorAll('.franklin-nudge').forEach(el=>el.remove());
    }
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
