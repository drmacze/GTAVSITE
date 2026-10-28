(()=>{
  'use strict';
  if(window.__franklinUiGuardLoaded)return;
  window.__franklinUiGuardLoaded=true;

  const root=document.documentElement;
  const editable='input,textarea,select,[contenteditable="true"]';
  const LOCAL_AVATAR='assets/avatars/franklin.jpg';
  const FALLBACK_AVATAR='https://cdn.corenexis.com/f/dJ4k8HeoKK9.jpeg';
  let blurTimer=0;
  root.classList.add('franklin-unified-entry');

  const avatarMarkup=()=>`<span class="lazy-franklin-avatar" aria-hidden="true"><img src="${LOCAL_AVATAR}" alt=""><i></i></span><span class="lazy-franklin-copy"><small>COMMUNITY HELPER</small><strong>Ask Franklin</strong></span><span class="lazy-franklin-arrow" aria-hidden="true">→</span>`;

  const decorateButton=button=>{
    if(!button)return;
    if(!button.querySelector('.lazy-franklin-avatar'))button.innerHTML=avatarMarkup();
    button.type='button';
    button.setAttribute('aria-label',button.dataset.ready==='true'?'Open Ask Franklin':'Connect to Franklin');
    const img=button.querySelector('.lazy-franklin-avatar img');
    if(img&&!img.dataset.fallbackBound){
      img.dataset.fallbackBound='true';
      img.addEventListener('error',()=>{
        if(img.dataset.fallbackTried==='true'){img.remove();return;}
        img.dataset.fallbackTried='true';
        img.src=FALLBACK_AVATAR;
      });
    }
  };

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
        width:auto!important;
        min-width:202px!important;
        min-height:62px!important;
        padding:6px 14px 6px 7px!important;
        display:flex!important;
        align-items:center!important;
        gap:11px!important;
        border:1px solid color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 48%,rgba(255,255,255,.22))!important;
        border-radius:999px!important;
        background:linear-gradient(110deg,color-mix(in srgb,var(--panel,#171717) 76%,transparent),color-mix(in srgb,var(--panel,#171717) 58%,var(--site-accent,var(--accent,#e8b65e)) 5%))!important;
        color:inherit!important;
        box-shadow:0 18px 48px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(0,0,0,.08)!important;
        backdrop-filter:blur(26px) saturate(1.3)!important;
        -webkit-backdrop-filter:blur(26px) saturate(1.3)!important;
        z-index:112!important;
        opacity:1!important;
        visibility:visible!important;
        pointer-events:auto!important;
        transform:none!important;
        overflow:hidden!important;
        isolation:isolate!important;
        transition:opacity .2s ease,transform .26s cubic-bezier(.2,.8,.2,1),border-color .2s ease,background .2s ease,box-shadow .2s ease!important;
      }
      html.franklin-unified-entry .lazy-franklin::before{
        content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
        background:linear-gradient(115deg,transparent 18%,rgba(255,255,255,.075) 48%,transparent 70%);
        transform:translateX(-120%);transition:transform .65s cubic-bezier(.2,.7,.2,1);
      }
      html.franklin-unified-entry .lazy-franklin:hover::before{transform:translateX(120%)}
      html.franklin-unified-entry .lazy-franklin:active{transform:scale(.975)!important}
      html.franklin-unified-entry .lazy-franklin:hover{border-color:color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 72%,rgba(255,255,255,.28))!important;box-shadow:0 20px 52px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.12),0 0 24px color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 10%,transparent)!important}
      .lazy-franklin-avatar{position:relative;width:48px;height:48px;flex:0 0 48px;border-radius:50%;overflow:visible;background:#28251f;border:1px solid color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 68%,#fff 12%);box-shadow:0 0 0 3px rgba(0,0,0,.22),0 5px 15px rgba(0,0,0,.3)}
      .lazy-franklin-avatar img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 12%;border-radius:50%}
      .lazy-franklin-avatar i{position:absolute;right:-1px;bottom:3px;width:10px;height:10px;border-radius:50%;background:#8a986d;border:2px solid color-mix(in srgb,var(--panel,#171717) 92%,#000);box-shadow:0 0 0 2px rgba(138,152,109,.16),0 0 10px rgba(138,152,109,.32);transition:background .25s,box-shadow .25s}
      .lazy-franklin[data-ready="true"] .lazy-franklin-avatar i{background:#79ad59;box-shadow:0 0 0 2px rgba(121,173,89,.18),0 0 12px rgba(121,173,89,.5)}
      .lazy-franklin-copy{min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;line-height:1}
      .lazy-franklin-copy small{font-size:6px;line-height:1;letter-spacing:1.45px;font-weight:700;color:color-mix(in srgb,currentColor 52%,transparent);white-space:nowrap}
      .lazy-franklin-copy strong{font-size:14px;line-height:1.05;font-weight:650;letter-spacing:-.2px;white-space:nowrap}
      .lazy-franklin-arrow{margin-left:auto;font-size:17px;line-height:1;color:color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 70%,currentColor);opacity:.78;transform:translateX(0);transition:transform .22s ease,opacity .22s ease}
      .lazy-franklin:hover .lazy-franklin-arrow{transform:translateX(3px);opacity:1}
      .lazy-franklin:disabled{opacity:.7!important;cursor:wait!important}
      .lazy-franklin:disabled .lazy-franklin-avatar i{animation:franklinPrimaryPulse 1.2s ease-in-out infinite}
      @keyframes franklinPrimaryPulse{0%,100%{opacity:.45;transform:scale(.85)}50%{opacity:1;transform:scale(1.12)}}
      html.franklin-unified-entry .ask-franklin-launcher,
      html.franklin-unified-entry .franklin-sheet-dock,
      html.franklin-unified-entry .franklin-nudge{display:none!important}
      html.franklin-open .lazy-franklin,
      html.franklin-external-keyboard .lazy-franklin,
      html.franklin-external-keyboard .ask-franklin-panel{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
      body[data-page="feedback"] #feedback-helper-slot{display:none!important}
      @media(max-width:760px){
        html.franklin-unified-entry .lazy-franklin{left:18px!important;bottom:max(82px,calc(env(safe-area-inset-bottom) + 64px))!important;min-width:196px!important;min-height:60px!important;padding:6px 13px 6px 7px!important}
        .lazy-franklin-avatar{width:46px;height:46px;flex-basis:46px}
        .lazy-franklin-copy strong{font-size:13px}
      }
      @media(prefers-reduced-motion:reduce){html.franklin-unified-entry .lazy-franklin,.lazy-franklin-arrow,.lazy-franklin-avatar i{transition:none!important;animation:none!important}.lazy-franklin::before{display:none!important}}
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

  const createFallback=()=>{
    const fallback=document.createElement('button');
    fallback.className='lazy-franklin';
    fallback.dataset.unifiedFallback='true';
    fallback.dataset.ready='true';
    decorateButton(fallback);
    fallback.dataset.bound='true';
    fallback.addEventListener('click',openUnifiedChat);
    document.body.append(fallback);
    return fallback;
  };

  const normalize=()=>{
    const primary=[...document.querySelectorAll('.lazy-franklin')];
    if(primary.length){
      primary.slice(1).forEach(el=>el.remove());
      const button=primary[0];
      decorateButton(button);
      if(button.parentElement!==document.body)document.body.append(button);
      if(button.hidden)button.hidden=false;
      if(button.dataset.unifiedFallback==='true'&&!button.dataset.bound){button.dataset.bound='true';button.addEventListener('click',openUnifiedChat);}
    }else if(document.querySelector('.ask-franklin-launcher'))createFallback();
  };

  ensureStyle();
  document.addEventListener('focusin',()=>{syncKeyboard();normalize();},true);
  document.addEventListener('focusout',()=>{clearTimeout(blurTimer);blurTimer=setTimeout(syncKeyboard,180);},true);
  window.visualViewport?.addEventListener('resize',syncKeyboard,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncKeyboard,{passive:true});
  window.addEventListener('pageshow',()=>{normalize();syncKeyboard();});

  const observer=new MutationObserver(()=>{normalize();syncKeyboard();});
  observer.observe(document.body,{childList:true,subtree:true});
  normalize();
  syncKeyboard();
})();