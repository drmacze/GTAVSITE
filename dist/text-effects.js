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
  const phrases=['Siap membantu','Franklin di sini','Ada masalah?','Butuh bantuan?','Tanya saya','Ada yang bisa dibantu?','Mau cek sesuatu?','Saya siap','Perlu bantuan?','Mari kita selesaikan'];
  const style=document.createElement('style');
  style.textContent=`.franklin-nudge{position:fixed;z-index:9990;display:flex;align-items:center;gap:8px;max-width:min(220px,calc(100vw - 100px));padding:9px 12px;border:1px solid color-mix(in srgb,var(--site-accent,var(--accent)) 28%,var(--line));border-radius:16px;background:color-mix(in srgb,var(--panel) 92%,transparent);color:var(--text);box-shadow:0 12px 32px rgba(0,0,0,.24);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);font-size:11px;font-weight:600;line-height:1.25;letter-spacing:.01em;opacity:0;transform:translateY(5px) scale(.97);transition:opacity .22s ease,transform .22s ease;pointer-events:none;white-space:nowrap}.franklin-nudge.is-visible{opacity:1;transform:none}.franklin-nudge-icon{font-size:14px;line-height:1}.franklin-nudge-text{overflow:hidden;text-overflow:ellipsis}@media(max-width:760px){.franklin-nudge{font-size:10.5px;padding:8px 11px;border-radius:15px;max-width:190px}}@media(prefers-reduced-motion:reduce){.franklin-nudge{transition:none}}`;
  document.head.append(style);
  const bubble=document.createElement('div');bubble.className='franklin-nudge';bubble.setAttribute('aria-hidden','true');bubble.innerHTML='<span class="franklin-nudge-icon">💬</span><span class="franklin-nudge-text"></span>';document.body.append(bubble);
  let hideTimer=0,last=-1,interval=0;
  const hide=()=>{clearTimeout(hideTimer);bubble.classList.remove('is-visible')};
  const place=launcher=>{const r=launcher.getBoundingClientRect();bubble.style.top='0px';bubble.style.left='0px';const br=bubble.getBoundingClientRect();let left=r.left-br.width-10;if(left<10)left=Math.min(innerWidth-br.width-10,r.right+10);let top=r.top+(r.height-br.height)/2;top=Math.max(10,Math.min(innerHeight-br.height-10,top));bubble.style.left=Math.round(left)+'px';bubble.style.top=Math.round(top)+'px'};
  const show=()=>{const launcher=document.querySelector('.ask-franklin-launcher');if(!launcher||document.hidden||launcher.dataset.state!=='compact'||document.querySelector('.ask-franklin-panel.is-open')){hide();return}let index=Math.floor(Math.random()*phrases.length);if(index===last)index=(index+1)%phrases.length;last=index;bubble.querySelector('.franklin-nudge-text').textContent=phrases[index];bubble.classList.remove('is-visible');requestAnimationFrame(()=>{place(launcher);requestAnimationFrame(()=>bubble.classList.add('is-visible'))});clearTimeout(hideTimer);hideTimer=setTimeout(hide,3400)};
  const start=()=>{if(interval)return;interval=setInterval(show,10000)};
  const stop=()=>{if(interval){clearInterval(interval);interval=0}hide()};
  start();addEventListener('resize',hide,{passive:true});document.addEventListener('visibilitychange',()=>document.hidden?hide():void 0);addEventListener('pagehide',stop,{once:true});
})();

// Shared rating badge is mounted only inside Franklin chat headers.
if(document.body?.dataset?.page){const s=document.createElement("script");s.src="community-ratings.js?v=20261028observerfix";s.defer=true;document.head.append(s);}
