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
      html.franklin-unified-entry .lazy-franklin{
        position:fixed!important;
        left:max(18px,env(safe-area-inset-left))!important;
        right:auto!important;
        bottom:max(24px,calc(env(safe-area-inset-bottom) + 18px))!important;
        min-width:142px!important;
        min-height:50px!important;
        padding:0 20px!important;
        border:1px solid color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 52%,rgba(255,255,255,.22))!important;
        border-radius:999px!important;
        background:color-mix(in srgb,var(--panel,#171717) 68%,transparent)!important;
        color:inherit!important;
        box-shadow:0 14px 36px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.08)!important;
        backdrop-filter:blur(22px) saturate(1.2)!important;
        -webkit-backdrop-filter:blur(22px) saturate(1.2)!important;
        z-index:112!important;
        opacity:1!important;
        visibility:visible!important;
        pointer-events:auto!important;
        transform:none!important;
        transition:opacity .2s ease,transform .25s ease,border-color .2s ease,background .2s ease!important;
      }
      html.franklin-unified-entry .lazy-franklin:active{transform:scale(.97)!important}
      html.franklin-unified-entry .ask-franklin-launcher,
      html.franklin-unified-entry .franklin-sheet-dock,
      html.franklin-unified-entry .franklin-nudge{
        display:none!important;
      }
      html.franklin-open .lazy-franklin,
      html.franklin-external-keyboard .lazy-franklin,
      html.franklin-external-keyboard .ask-franklin-panel{
        opacity:0!important;
        visibility:hidden!important;
        pointer-events:none!important;
      }
      body[data-page="feedback"] #feedback-helper-slot{display:none!important}
      @media(max-width:760px){
        html.franklin-unified-entry .lazy-franklin{
          left:18px!important;
          bottom:max(82px,calc(env(safe-area-inset-bottom) + 64px))!important;
          min-width:150px!important;
          min-height:52px!important;
          font-size:13px!important;
        }
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
    const controller=document.querySelector('.ask-franklin-launcher');
    if(!controller||panel?.classList.contains('is-open'))return;
    if(controller.dataset.state==='compact')controller.click();
    requestAnimationFrame(()=>{if(controller.dataset.state==='expanded')controller.click();});
  };

  const normalize=()=>{
    const primary=[...document.querySelectorAll('.lazy-franklin')];
    if(primary.length){
      primary.slice(1).forEach(el=>el.remove());
      const button=primary[0];
      if(button.parentElement!==document.body)document.body.append(button);
      if(button.hidden)button.hidden=false;
      if(button.dataset.unifiedFallback==='true'&&!button.dataset.bound){
        button.dataset.bound='true';
        button.addEventListener('click',openUnifiedChat);
      }
    }else if(document.querySelector('.ask-franklin-launcher')){
      const fallback=document.createElement('button');
      fallback.type='button';
      fallback.className='lazy-franklin';
      fallback.textContent='Ask Franklin';
      fallback.setAttribute('aria-label','Open Ask Franklin');
      fallback.dataset.unifiedFallback='true';
      fallback.dataset.bound='true';
      fallback.addEventListener('click',openUnifiedChat);
      document.body.append(fallback);
    }
  };

  ensureStyle();
  document.addEventListener('focusin',()=>{syncKeyboard();normalize();},true);
  document.addEventListener('focusout',()=>{
    clearTimeout(blurTimer);
    blurTimer=setTimeout(syncKeyboard,180);
  },true);
  window.visualViewport?.addEventListener('resize',syncKeyboard,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncKeyboard,{passive:true});
  window.addEventListener('pageshow',()=>{normalize();syncKeyboard();});

  const observer=new MutationObserver(()=>{normalize();syncKeyboard();});
  observer.observe(document.body,{childList:true,subtree:true});
  normalize();
  syncKeyboard();
})();