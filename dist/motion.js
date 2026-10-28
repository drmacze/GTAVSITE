/* Lightweight UI safety bootstrap. */
(()=>{
 const addScript=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.head.append(s)};
 addScript('franklin-ui-guard.js?v=20261028uifix1','franklin-ui-guard-loader');
 if(document.body?.dataset.page==='feedback'){
   if(!document.querySelector('link[data-feedback-fixes]')){const l=document.createElement('link');l.rel='stylesheet';l.href='feedback-fixes.css?v=20261028uifix1';l.dataset.feedbackFixes='true';document.head.append(l)}
   addScript('feedback-fixes.js?v=20261028uifix1','feedback-fixes-loader');
 }
})();

/* Native scroll with bounded, one-shot reveals. No perpetual animation ticker. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const touch=matchMedia('(pointer: coarse)').matches;
 // Welcome stays native and stationary; welcome.js owns the transition at the end.
 if(document.querySelector('.welcome-page')||reduced)return;
 // Touch devices retain native momentum without section transforms or layout refreshes.
 if(touch||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);entry.target.animate([{opacity:.65,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:340,easing:'ease-out'});}}, {threshold:.08});
 // Animate only top-level editorial sections, never nested text, controls, or dynamic results.
 document.querySelectorAll('.technical-section,.guide-section,.project-credits,.support-group').forEach(section=>observer.observe(section));
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
