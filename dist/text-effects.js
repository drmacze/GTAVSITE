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
  // Without IntersectionObserver the original, complete text stays visible.
  reduced.addEventListener('change',event=>{if(event.matches){timers.forEach((timer,node)=>node.finishTyping?.());running.forEach(node=>node.classList.remove('shine-running'));running.clear();}});
  window.addEventListener('pagehide',()=>{timers.forEach((timer,node)=>node.finishTyping?.());});
})();
