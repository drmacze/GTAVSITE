(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return;const timers=new Map(),running=new Set();
  function type(node){if(node.dataset.typeStarted)return;node.dataset.typeStarted='true';const text=node.textContent.trim();if(!text)return;const accessible=document.createElement('span');accessible.className='type-accessible';accessible.textContent=text;const measure=document.createElement('span');measure.className='type-measure';measure.setAttribute('aria-hidden','true');measure.textContent=text;const visual=document.createElement('span');visual.setAttribute('aria-hidden','true');node.classList.add('type-frame','typing-active');node.replaceChildren(accessible,measure,visual);const chars=Array.from(text);let index=0;const finish=()=>{clearTimeout(timers.get(node));timers.delete(node);visual.textContent=text;node.classList.remove('typing-active');};node.finishTyping=finish;function step(){if(reduced.matches){finish();return;}visual.textContent=chars.slice(0,++index).join('');if(index>=chars.length){finish();return;}timers.set(node,setTimeout(step,Math.min(65,1800/chars.length)));}step();}
  function shine(node){if(node.dataset.shineStarted)return;node.dataset.shineStarted='true';running.add(node);node.classList.add('shine-running');node.addEventListener('animationend',event=>{if(event.animationName==='text-shine'){node.classList.remove('shine-running');running.delete(node);}},{once:true});}
  const nodes=[...document.querySelectorAll('[data-shine],[data-type]')];if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(reduced.matches)return;if(entry.target.hasAttribute('data-type'))type(entry.target);else shine(entry.target);}),{threshold:.3});nodes.forEach(node=>observer.observe(node));}reduced.addEventListener('change',event=>{if(event.matches){timers.forEach((timer,node)=>node.finishTyping?.());running.forEach(node=>node.classList.remove('shine-running'));running.clear();}});window.addEventListener('pagehide',()=>{timers.forEach((timer,node)=>node.finishTyping?.());});
})();
if(document.body?.dataset?.page){
  const s=document.createElement('script');s.src='lazy-helper.js?v=20261028lazy';s.defer=true;document.head.append(s);
  const avatarStyle=document.createElement('style');avatarStyle.dataset.franklinAvatar='local';avatarStyle.textContent=".ask-franklin-launcher .ask-franklin-avatar{background:#111 url('/assets/avatars/franklin.jpg?v=20261028portrait3') center 18%/cover no-repeat!important}.ask-franklin-launcher .ask-franklin-avatar img,.ask-franklin-launcher .ask-franklin-fallback{opacity:0!important}";document.head.append(avatarStyle);
}
(()=>{const apply=()=>{const title=document.querySelector('.ask-franklin-title strong'),label=document.querySelector('.ask-franklin-title span');if(!title||!label)return false;title.textContent='Franklin';label.textContent='Community helper';return true;};if(apply())return;const observer=new MutationObserver(()=>{if(apply())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});})();

// Keep the expanded Franklin launcher visible long enough to be understood.
(()=>{
  if(document.body?.dataset?.page!=='home'||window.__franklinTimingGuard)return;window.__franklinTimingGuard=true;
  const HOLD_MS=15000;let launcher=null,deadline=0,timer=0,restoring=false;
  const collapse=()=>{if(!launcher||document.querySelector('.ask-franklin-panel.is-open'))return;launcher.classList.remove('is-dock-open');launcher.dataset.state='compact';launcher.setAttribute('aria-label','Expand Ask Franklin helper')};
  const hold=()=>{if(!launcher)return;clearTimeout(timer);deadline=performance.now()+HOLD_MS;timer=setTimeout(collapse,HOLD_MS)};
  const attach=node=>{if(launcher===node)return;launcher=node;hold();const observer=new MutationObserver(()=>{if(!launcher)return;const state=launcher.dataset.state;if(state==='compact'&&performance.now()<deadline){restoring=true;launcher.classList.add('is-dock-open');launcher.dataset.state='expanded';launcher.setAttribute('aria-label','Open Ask Franklin chat');queueMicrotask(()=>{restoring=false})}else if(state==='expanded'&&!restoring&&performance.now()>=deadline-50){hold()}});observer.observe(launcher,{attributes:true,attributeFilter:['class','data-state']})};
  const existing=document.querySelector('.ask-franklin-launcher');if(existing)attach(existing);else{const observer=new MutationObserver(()=>{const node=document.querySelector('.ask-franklin-launcher');if(node){observer.disconnect();attach(node)}});observer.observe(document.body,{childList:true,subtree:true})}
  addEventListener('pagehide',()=>clearTimeout(timer),{once:true});
})();

// Lightweight compact-state micro messages for the Home Franklin launcher.
(()=>{
  if(document.body?.dataset?.page!=='home'||window.__franklinNudgesLoaded)return;
  window.__franklinNudgesLoaded=true;
  const phrases=['Ready when you are','Franklin here','Need a hand?','Got a problem?','Ask me anything','Need help with something?','Want me to check it?','I’m here to help','Need a quick answer?','Let’s sort it out'];
  const style=document.createElement('style');
  style.textContent=`
    .franklin-nudge{position:fixed;z-index:9990;display:flex;align-items:center;gap:9px;max-width:min(236px,calc(100vw - 96px));padding:10px 14px 10px 11px;border:1px solid color-mix(in srgb,var(--site-accent,var(--accent)) 34%,var(--line));border-radius:20px 20px 7px 20px;background:linear-gradient(135deg,color-mix(in srgb,var(--panel) 96%,transparent),color-mix(in srgb,var(--panel) 88%,var(--site-accent,var(--accent)) 12%));color:var(--text);box-shadow:0 14px 34px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.05);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font-size:11px;font-weight:650;line-height:1.25;letter-spacing:.01em;opacity:0;transform-origin:100% 100%;pointer-events:none;white-space:nowrap;overflow:visible;will-change:transform,opacity,filter}
    .franklin-nudge::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(120deg,transparent 18%,color-mix(in srgb,var(--site-accent,var(--accent)) 58%,white 20%) 50%,transparent 82%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.28;pointer-events:none}
    .franklin-nudge::after{content:"";position:absolute;right:-5px;bottom:7px;width:12px;height:12px;border-right:1px solid color-mix(in srgb,var(--site-accent,var(--accent)) 34%,var(--line));border-bottom:1px solid color-mix(in srgb,var(--site-accent,var(--accent)) 34%,var(--line));background:color-mix(in srgb,var(--panel) 93%,var(--site-accent,var(--accent)) 7%);transform:rotate(-45deg);border-radius:0 0 3px 0}
    .franklin-nudge-icon{position:relative;z-index:1;width:24px;height:24px;display:grid;place-items:center;flex:0 0 24px;border-radius:9px;background:color-mix(in srgb,var(--site-accent,var(--accent)) 15%,transparent);color:var(--site-accent,var(--accent));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--site-accent,var(--accent)) 24%,transparent)}
    .franklin-nudge-icon svg{width:14px;height:14px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .franklin-nudge-text{position:relative;z-index:1;overflow:hidden;text-overflow:ellipsis}
    .franklin-nudge.is-entering{animation:franklinNudgeIn .42s cubic-bezier(.2,.86,.3,1.18) both}
    .franklin-nudge.is-visible{opacity:1;transform:none;filter:none}
    .franklin-nudge.is-leaving{animation:franklinNudgeOut .3s cubic-bezier(.4,0,.2,1) both}
    @keyframes franklinNudgeIn{0%{opacity:0;transform:translate(10px,9px) scale(.88);filter:blur(3px)}58%{opacity:1;transform:translate(-2px,-1px) scale(1.02);filter:blur(0)}100%{opacity:1;transform:none;filter:none}}
    @keyframes franklinNudgeOut{0%{opacity:1;transform:none;filter:none}100%{opacity:0;transform:translate(8px,7px) scale(.9);filter:blur(2px)}}
    @media(max-width:760px){.franklin-nudge{font-size:10.5px;padding:9px 13px 9px 10px;border-radius:19px 19px 6px 19px;max-width:205px}.franklin-nudge-icon{width:22px;height:22px;flex-basis:22px;border-radius:8px}.franklin-nudge-icon svg{width:13px;height:13px}}
    @media(prefers-reduced-motion:reduce){.franklin-nudge.is-entering,.franklin-nudge.is-leaving{animation:none}.franklin-nudge{transition:none}}
  `;
  document.head.append(style);
  const bubble=document.createElement('div');bubble.className='franklin-nudge';bubble.setAttribute('aria-hidden','true');bubble.innerHTML='<span class="franklin-nudge-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 18.5 3 21l.8-4.2A8.5 8.5 0 1 1 12 20a8.8 8.8 0 0 1-3.7-.8"/><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01"/></svg></span><span class="franklin-nudge-text"></span>';document.body.append(bubble);
  let hideTimer=0,last=-1,interval=0,leaveTimer=0;
  const finishHide=()=>{bubble.classList.remove('is-visible','is-entering','is-leaving')};
  const hide=()=>{clearTimeout(hideTimer);clearTimeout(leaveTimer);if(!bubble.classList.contains('is-visible')&&!bubble.classList.contains('is-entering')){finishHide();return}bubble.classList.remove('is-entering','is-visible');bubble.classList.add('is-leaving');leaveTimer=setTimeout(finishHide,320)};
  const place=launcher=>{const r=launcher.getBoundingClientRect();bubble.style.top='0px';bubble.style.left='0px';const br=bubble.getBoundingClientRect();let left=r.left-br.width-12;if(left<10)left=Math.min(innerWidth-br.width-10,r.right+12);let top=r.top+(r.height-br.height)/2;top=Math.max(10,Math.min(innerHeight-br.height-10,top));bubble.style.left=Math.round(left)+'px';bubble.style.top=Math.round(top)+'px'};
  const show=()=>{const launcher=document.querySelector('.ask-franklin-launcher');if(!launcher||document.hidden||launcher.dataset.state!=='compact'||document.querySelector('.ask-franklin-panel.is-open')){hide();return}let index=Math.floor(Math.random()*phrases.length);if(index===last)index=(index+1)%phrases.length;last=index;bubble.querySelector('.franklin-nudge-text').textContent=phrases[index];clearTimeout(hideTimer);clearTimeout(leaveTimer);finishHide();requestAnimationFrame(()=>{place(launcher);bubble.classList.add('is-entering');requestAnimationFrame(()=>bubble.classList.add('is-visible'))});hideTimer=setTimeout(hide,3600)};
  const start=()=>{if(interval)return;interval=setInterval(show,10000)};
  const stop=()=>{if(interval){clearInterval(interval);interval=0}hide()};
  start();addEventListener('resize',hide,{passive:true});document.addEventListener('visibilitychange',()=>document.hidden?hide():void 0);addEventListener('pagehide',stop,{once:true});
})();

// Shared rating badge is mounted only inside Franklin chat headers.
if(document.body?.dataset?.page){const s=document.createElement("script");s.src="community-ratings.js?v=20261028observerfix";s.defer=true;document.head.append(s);}
