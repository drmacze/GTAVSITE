(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return;const timers=new Map(),running=new Set();
  function type(node){if(node.dataset.typeStarted)return;node.dataset.typeStarted='true';const text=node.textContent.trim();if(!text)return;const accessible=document.createElement('span');accessible.className='type-accessible';accessible.textContent=text;const measure=document.createElement('span');measure.className='type-measure';measure.setAttribute('aria-hidden','true');measure.textContent=text;const visual=document.createElement('span');visual.setAttribute('aria-hidden','true');node.classList.add('type-frame','typing-active');node.replaceChildren(accessible,measure,visual);const chars=Array.from(text);let index=0;const finish=()=>{clearTimeout(timers.get(node));timers.delete(node);visual.textContent=text;node.classList.remove('typing-active');};node.finishTyping=finish;function step(){if(reduced.matches){finish();return;}visual.textContent=chars.slice(0,++index).join('');if(index>=chars.length){finish();return;}timers.set(node,setTimeout(step,Math.min(65,1800/chars.length)));}step();}
  function shine(node){if(node.dataset.shineStarted)return;node.dataset.shineStarted='true';running.add(node);node.classList.add('shine-running');node.addEventListener('animationend',event=>{if(event.animationName==='text-shine'){node.classList.remove('shine-running');running.delete(node);}},{once:true});}
  const nodes=[...document.querySelectorAll('[data-shine],[data-type]')];if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(reduced.matches)return;if(entry.target.hasAttribute('data-type'))type(entry.target);else shine(entry.target);}),{threshold:.3});nodes.forEach(node=>observer.observe(node));}reduced.addEventListener('change',event=>{if(event.matches){timers.forEach((timer,node)=>node.finishTyping?.());running.forEach(node=>node.classList.remove('shine-running'));running.clear();}});window.addEventListener('pagehide',()=>{timers.forEach((timer,node)=>node.finishTyping?.());});
})();

// Current GTA V iOS requirements shared across the site and Franklin.
(()=>{
  if(window.__gtavRequirementsSync)return;window.__gtavRequirementsSync=true;
  const requirements=Object.freeze({ramGB:4,ios:18});window.GTAVRequirements=requirements;

  // Keep the Compatibility checker baseline current without changing historical release notes.
  const originalFetch=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
    const response=await originalFetch(input,init);
    try{
      const raw=typeof input==='string'?input:input?.url||'';
      const url=new URL(raw,location.href);
      if(url.pathname.endsWith('/compatibility-data.json')){
        const data=await response.clone().json();
        if(data?.baseline){
          data.baseline.ramGB=requirements.ramGB;
          data.baseline.ios=requirements.ios;
          data.baseline.note='Current GTA V iOS minimum requirements: 4 GB RAM and iOS 18 or later. Release-specific instructions still take priority.';
          const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');headers.set('content-type','application/json; charset=utf-8');
          return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
        }
      }
    }catch{}
    return response;
  };

  const patchVisibleRequirements=()=>{
    const guide=document.querySelector('#requirements .guide-policy p');
    if(guide)guide.textContent='Current minimum requirements are 4 GB of installed RAM and iOS 18 or later. Keep about 30 GB of free storage available for installation and extraction. Release-specific instructions take priority.';

    const faqRam=document.querySelector('#faq-devices-1 .answer-body p');
    if(faqRam)faqRam.innerHTML='The current minimum is <strong>4 GB of RAM</strong>. Devices at the 4 GB minimum should begin with conservative graphics settings and low-memory mode enabled. Check the requirements for the exact build you install. <a href="technicalities.html#current-status">Read the hardware notes</a>';
    const faqIos=document.querySelector('#faq-devices-2 .answer-body p');
    if(faqIos)faqIos.innerHTML='The current minimum operating system is <strong>iOS 18 or later</strong>. Older release notes may mention earlier iOS support because they document historical builds; use iOS 18+ for the current requirement. <a href="guide.html#requirements">Read the installation requirements</a>';
    const faqMemoryQuestion=document.querySelector('#faq-devices-5 .question-text');
    if(faqMemoryQuestion)faqMemoryQuestion.textContent='Does a 4 GB iPhone meet the memory minimum?';
    const faqMemoryAnswer=document.querySelector('#faq-devices-5 .answer-body p');
    if(faqMemoryAnswer)faqMemoryAnswer.innerHTML='Yes. <strong>4 GB RAM is the current minimum</strong>, although memory headroom is limited compared with higher-memory devices. Start with conservative settings and keep low-memory mode enabled where available. <a href="compatibility.html">Review your device profile</a>';

    const currentStatus=document.querySelector('#current-status ul');
    if(currentStatus){
      const items=[...currentStatus.querySelectorAll('li')];
      const hardware=items.find(item=>/Minimum hardware described here:/i.test(item.textContent));
      if(hardware)hardware.innerHTML='<strong>Current minimum hardware:</strong> an A12-family chip (A12, A12X, or A12Z) and 4 GB of RAM.';
      let os=items.find(item=>/Current minimum iOS:/i.test(item.textContent));
      if(!os){os=document.createElement('li');currentStatus.append(os);}
      os.innerHTML='<strong>Current minimum iOS:</strong> iOS 18 or later.';
    }
    const iosTargetNote=document.querySelector('#ios-target .technical-note');
    if(iosTargetNote)iosTargetNote.innerHTML='The original development target was iOS 18+. Some historical release notes document earlier iOS support, but the <strong>current minimum requirement is iOS 18 or later</strong>.';

    const compatIntro=document.querySelector('.compat-heading p');
    if(compatIntro)compatIntro.innerHTML='Review your model’s hardware against the current minimums: <strong>4 GB RAM</strong> and <strong>iOS 18+</strong><br class="desktop-break"> before installing GTA V Port for iOS.';
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchVisibleRequirements,{once:true});else patchVisibleRequirements();

  // Give Franklin an explicit current-requirements answer before older historical notes can win retrieval.
  let attempts=0;const hook=setInterval(()=>{
    attempts++;
    const api=window.FranklinSupportContext;
    if(api?.consume&&!api.__requirementsPatched){
      const originalConsume=api.consume.bind(api);
      api.consume=async q=>{
        const text=String(q||'');
        const asksRequirement=/(minimum|requirement|required|need).*(ram|memory|ios)|(ram|memory|ios).*(minimum|requirement|required|need)/i.test(text);
        if(asksRequirement)return {text:'Current GTA V iOS minimum requirements are 4 GB of RAM and iOS 18 or later. Devices at the 4 GB minimum should use conservative settings and low-memory mode where available.',grounded:true,topic:'requirements'};
        return originalConsume(q);
      };
      api.__requirementsPatched=true;clearInterval(hook);
    }else if(attempts>120)clearInterval(hook);
  },250);
})();

if(document.body?.dataset?.page){
  const s=document.createElement('script');s.src='lazy-helper.js?v=20261028lazy';s.defer=true;document.head.append(s);
  const avatarStyle=document.createElement('style');avatarStyle.dataset.franklinAvatar='local';avatarStyle.textContent=".ask-franklin-launcher .ask-franklin-avatar{background:#111 url('/assets/avatars/franklin.jpg?v=20261028portrait5') center 18%/cover no-repeat!important}.ask-franklin-launcher .ask-franklin-avatar img,.ask-franklin-launcher .ask-franklin-fallback{opacity:0!important}";document.head.append(avatarStyle);
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
  style.textContent=`.franklin-nudge{position:fixed;z-index:9990;display:flex;align-items:center;gap:9px;max-width:min(230px,calc(100vw - 96px));padding:10px 13px 10px 11px;border:1px solid color-mix(in srgb,var(--site-accent,var(--accent)) 34%,var(--line));border-radius:18px 18px 18px 7px;background:linear-gradient(135deg,color-mix(in srgb,var(--panel) 96%,transparent),color-mix(in srgb,var(--panel) 86%,var(--site-accent,var(--accent)) 6%));color:var(--text);box-shadow:0 16px 42px rgba(0,0,0,.28),0 0 0 1px color-mix(in srgb,var(--site-accent,var(--accent)) 8%,transparent);backdrop-filter:blur(16px) saturate(1.08);-webkit-backdrop-filter:blur(16px) saturate(1.08);font-size:11px;font-weight:650;line-height:1.25;letter-spacing:.01em;opacity:0;filter:blur(2px);transform:translateY(9px) translateX(5px) scale(.94);transform-origin:100% 100%;transition:opacity .28s cubic-bezier(.2,.8,.2,1),transform .36s cubic-bezier(.16,1,.3,1),filter .28s ease;pointer-events:none;white-space:nowrap}.franklin-nudge::after{content:"";position:absolute;right:-5px;bottom:9px;width:11px;height:11px;background:inherit;border-top:1px solid color-mix(in srgb,var(--site-accent,var(--accent)) 30%,var(--line));border-right:1px solid color-mix(in srgb,var(--site-accent,var(--accent)) 30%,var(--line));transform:rotate(45deg);border-radius:0 3px 0 0}.franklin-nudge.is-visible{opacity:1;filter:none;transform:translateY(0) translateX(0) scale(1)}.franklin-nudge.is-leaving{opacity:0;filter:blur(1.5px);transform:translateY(7px) translateX(4px) scale(.96)}.franklin-nudge-icon{position:relative;z-index:1;display:grid;place-items:center;width:24px;height:24px;flex:0 0 24px;border-radius:9px;background:color-mix(in srgb,var(--site-accent,var(--accent)) 14%,transparent);color:var(--site-accent,var(--accent));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--site-accent,var(--accent)) 18%,transparent)}.franklin-nudge-icon svg{width:13px;height:13px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.franklin-nudge-text{position:relative;z-index:1;overflow:hidden;text-overflow:ellipsis}@media(max-width:760px){.franklin-nudge{font-size:10.5px;padding:9px 12px 9px 10px;border-radius:17px 17px 17px 7px;max-width:200px}.franklin-nudge-icon{width:22px;height:22px;flex-basis:22px;border-radius:8px}.franklin-nudge-icon svg{width:12px;height:12px}}@media(prefers-reduced-motion:reduce){.franklin-nudge{transition:none;filter:none}}`;
  document.head.append(style);
  const bubble=document.createElement('div');bubble.className='franklin-nudge';bubble.setAttribute('aria-hidden','true');bubble.innerHTML='<span class="franklin-nudge-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 5.75h14a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-7.1L7.5 20v-2.75H5a2 2 0 0 1-2-2v-7.5a2 2 0 0 1 2-2Z"/><path d="M7.5 10h9M7.5 13.25h6"/></svg></span><span class="franklin-nudge-text"></span>';document.body.append(bubble);
  let hideTimer=0,last=-1,interval=0,raf=0,activeLauncher=null;
  const place=launcher=>{if(!launcher||!bubble.classList.contains('is-visible'))return;const r=launcher.getBoundingClientRect();bubble.style.top='0px';bubble.style.left='0px';const br=bubble.getBoundingClientRect();let left=r.left-br.width-12;if(left<10)left=Math.min(innerWidth-br.width-10,r.right+12);let top=r.top+(r.height-br.height)/2;top=Math.max(10,Math.min(innerHeight-br.height-10,top));bubble.style.left=Math.round(left)+'px';bubble.style.top=Math.round(top)+'px'};
  const schedulePlace=()=>{if(!activeLauncher||!bubble.classList.contains('is-visible'))return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>place(activeLauncher))};
  const hide=()=>{clearTimeout(hideTimer);bubble.classList.add('is-leaving');bubble.classList.remove('is-visible');activeLauncher=null;setTimeout(()=>bubble.classList.remove('is-leaving'),360)};
  const show=()=>{const launcher=document.querySelector('.ask-franklin-launcher');if(!launcher||document.hidden||launcher.dataset.state!=='compact'||document.querySelector('.ask-franklin-panel.is-open')){hide();return}let index=Math.floor(Math.random()*phrases.length);if(index===last)index=(index+1)%phrases.length;last=index;bubble.querySelector('.franklin-nudge-text').textContent=phrases[index];bubble.classList.remove('is-visible','is-leaving');activeLauncher=launcher;requestAnimationFrame(()=>{bubble.classList.add('is-visible');schedulePlace()});clearTimeout(hideTimer);hideTimer=setTimeout(hide,3600)};
  const start=()=>{if(interval)return;interval=setInterval(show,10000)};
  const stop=()=>{if(interval){clearInterval(interval);interval=0}hide()};
  start();
  addEventListener('scroll',schedulePlace,{passive:true});addEventListener('resize',schedulePlace,{passive:true});
  window.visualViewport?.addEventListener('scroll',schedulePlace,{passive:true});window.visualViewport?.addEventListener('resize',schedulePlace,{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?hide():void 0);addEventListener('pagehide',stop,{once:true});
})();

// Shared rating badge is mounted only inside Franklin chat headers.
if(document.body?.dataset?.page){const s=document.createElement("script");s.src="community-ratings.js?v=20261028observerfix";s.defer=true;document.head.append(s);}
