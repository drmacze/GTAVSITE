/* Lightweight UI safety bootstrap. */
(()=>{
 const addScript=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.head.append(s)};
 const addStyle=(href,id)=>{if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.append(l)};
 addStyle('sunset-theme-v1.css?v=20261028sunset2','sunset-theme-v1-loader');
 addScript('franklin-ui-guard-v2.js?v=20261028polish3','franklin-ui-guard-v2-loader');
 addScript('franklin-primary-state-fix.js?v=20261028primary1','franklin-primary-state-fix-loader');
 addScript('franklin-flow-fix.js?v=20261028flowfix1','franklin-flow-fix-loader');
 addScript('storage-policy-45-v1.js?v=20261028storage45b','storage-policy-45-loader');
 addStyle('profile-glass-v1.css?v=20261028profileglass1','profile-glass-v1-loader');
 if(document.body?.dataset.page==='home'){
   if(typeof window.showWelcomeNotifications!=='function')window.showWelcomeNotifications=result=>{
     window.dispatchEvent(new CustomEvent('gtav:onboarding-complete',{detail:result||{}}));
     requestAnimationFrame(()=>document.querySelector('.home-intro-v4')?.scrollIntoView({block:'start',behavior:'auto'}));
   };
   addStyle('home-intro-v4.css?v=20261028homeintro4r3','home-intro-v4-style');
   addStyle('home-intro-v4-polish.css?v=20261028v4polish2','home-intro-v4-polish-style');
   addStyle('community-welcome-v2.css?v=20261028communitywelcome2','community-welcome-v2-style');
   addScript('home-intro-v4.js?v=20261028homeintro4r4','home-intro-v4-script');
 }
 if(document.body?.dataset.page==='feedback'){
   if(!document.querySelector('link[data-feedback-fixes]')){const l=document.createElement('link');l.id='feedback-fixes-style';l.rel='stylesheet';l.href='feedback-fixes.css?v=20261028uifix1';l.dataset.feedbackFixes='true';document.head.append(l)}
   addScript('feedback-fixes.js?v=20261028uifix1','feedback-fixes-loader');
 }
})();

/* Native scroll with bounded, one-shot reveals. No perpetual animation ticker. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const touch=matchMedia('(pointer: coarse)').matches;
 if(document.querySelector('.welcome-page')||reduced)return;
 if(touch||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);entry.target.animate([{opacity:.65,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:340,easing:'ease-out'});}}, {threshold:.08});
 document.querySelectorAll('.technical-section,.guide-section,.project-credits,.support-group').forEach(section=>observer.observe(section));
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
