(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduced.matches)return;
  const timers=new Map();
  const running=new Set();
  function type(node){
    if(node.dataset.typeStarted)return;node.dataset.typeStarted='true';
    const text=node.textContent.trim();if(!text)return;
    const accessible=document.createElement('span');accessible.className='type-accessible';accessible.textContent=text;
    const measure=document.createElement('span');measure.className='type-measure';measure.setAttribute('aria-hidden','true');measure.textContent=text;
    const visual=document.createElement('span');visual.className='type-visual';visual.setAttribute('aria-hidden','true');
    node.classList.add('type-frame','typing-active');node.replaceChildren(accessible,measure,visual);
    const chars=Array.from(text);let index=0;
    const finish=()=>{clearTimeout(timers.get(node));timers.delete(node);visual.textContent=text;node.classList.remove('typing-active');};
    node.finishTyping=finish;
    function step(){if(reduced.matches){finish();return;}visual.textContent=chars.slice(0,++index).join('');if(index>=chars.length){finish();return;}timers.set(node,setTimeout(step,Math.min(65,1800/chars.length)));}
    step();
  }
  function shine(node){
    if(node.dataset.shineStarted)return;node.dataset.shineStarted='true';running.add(node);node.classList.add('shine-running');
    node.addEventListener('animationend',event=>{if(event.animationName==='text-shine'){node.classList.remove('shine-running');running.delete(node);}},{once:true});
  }
  const nodes=[...document.querySelectorAll('[data-shine],[data-type]')];
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(reduced.matches)return;if(entry.target.hasAttribute('data-type'))type(entry.target);else shine(entry.target);}),{threshold:.3});nodes.forEach(node=>observer.observe(node));}
  reduced.addEventListener('change',event=>{if(event.matches){timers.forEach((timer,node)=>node.finishTyping?.());running.forEach(node=>node.classList.remove('shine-running'));running.clear();}});
  window.addEventListener('pagehide',()=>{timers.forEach((timer,node)=>node.finishTyping?.());});
})();

// Reliable loader for Ask Franklin. The extended free knowledge layer registers first,
// then the base V2 engine remains available as a fallback for site retrieval and small talk.
if(document.body?.dataset?.page&&!window.__askFranklinLoaderAdded){
  window.__askFranklinLoaderAdded=true;
  const loadBaseEngine=()=>{
    if(window.__franklinEngineLoaderAdded)return;
    window.__franklinEngineLoaderAdded=true;
    const engine=document.createElement('script');
    engine.src='franklin-engine.js';
    engine.defer=true;
    document.head.append(engine);
  };
  const loadExtended=()=>{
    if(window.__franklinExtendedLoaderAdded){loadBaseEngine();return;}
    window.__franklinExtendedLoaderAdded=true;
    const extended=document.createElement('script');
    extended.src='franklin-engine-extra.js';
    extended.defer=true;
    extended.addEventListener('load',loadBaseEngine,{once:true});
    extended.addEventListener('error',loadBaseEngine,{once:true});
    document.head.append(extended);
  };
  const script=document.createElement('script');
  script.src='ask-franklin.js';
  script.defer=true;
  script.addEventListener('load',loadExtended,{once:true});
  script.addEventListener('error',loadExtended,{once:true});
  document.head.append(script);
}

// Keep the helper subtitle concise regardless of which loader initializes it first.
(() => {
  const apply=()=>{
    const label=document.querySelector('.ask-franklin-title span');
    if(!label)return false;
    label.textContent='Community helper';
    return true;
  };
  if(apply())return;
  const observer=new MutationObserver(()=>{if(apply())observer.disconnect();});
  observer.observe(document.body,{childList:true,subtree:true});
})();
