/* Lightweight UI safety bootstrap. */
(()=>{
 const addScript=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.head.append(s)};
 const addStyle=(href,id)=>{if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.append(l)};
 addStyle('sunset-theme-v1.css?v=20261028sunset3','sunset-theme-v1-loader');
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
   addStyle('community-welcome-v3.css?v=20261028communitywelcome4','community-welcome-v3-style');
   addScript('home-intro-v4.js?v=20261028homeintro4r4','home-intro-v4-script');

   // Stories are mounted from the Home bootstrap that is actually active in production.
   window.__storyST5=true;
   addStyle('story-scrolltrigger-v3.css?v=20261029st7','story-scrolltrigger-v3-style');
   addScript('story-scrolltrigger-v3.js?v=20261029st7','story-scrolltrigger-v3-script');
   addStyle('home-scroll-refinements-v1.css?v=20261029refine1','home-scroll-refinements-v1-style');

   // Once the cinematic intro + Stories chapter is complete, Home becomes a one-way content chapter.
   addStyle('home-chapter-lock-v1.css?v=20261029chapter3','home-chapter-lock-v1-style');
   addScript('home-chapter-lock-v1.js?v=20261029chapter3','home-chapter-lock-v1-script');

   // Explicit versioned load prevents Safari from reusing the old unversioned music.js request from app.js.
   addScript('music.js?v=20261029scrollmusic1','home-music-scroll-loader');
 }
 if(document.body?.dataset.page==='downloads'){
   // downloads.html historically loaded static asset versions. Load the current Mods build explicitly.
   addStyle('downloads.css?v=20261029dlc3','downloads-dlc3-style');
   addScript('mods.js?v=20261029dlc3','mods-dlc3-script');
   addStyle('mods-ui-fix-v3.css?v=20261029modsui3','mods-ui-fix-v3-style');
   addScript('mods-ui-fix-v3.js?v=20261029modsui3','mods-ui-fix-v3-script');
 }
 if(document.body?.dataset.page==='updates'){
   // 28 Oct release is layered on top of the static archive so older release markup stays untouched.
   addStyle('update-28-oct-v1.css?v=20261029oct28r2','update-28-oct-v1-style');
   addScript('update-28-oct-v1.js?v=20261029oct28r2','update-28-oct-v1-script');
 }
 if(document.body?.dataset.page==='feedback'){
   if(!document.querySelector('link[data-feedback-fixes]')){const l=document.createElement('link');l.id='feedback-fixes-style';l.rel='stylesheet';l.href='feedback-fixes.css?v=20261028uifix1';l.dataset.feedbackFixes='true';document.head.append(l)}
   addScript('feedback-fixes.js?v=20261028uifix1','feedback-fixes-loader');
 }

 /* Safari/iOS browser chrome is outside the page, so tint it to the warm site surface. */
 const root=document.documentElement;
 const meta=document.querySelector('meta[name="theme-color"]')||(()=>{const m=document.createElement('meta');m.name='theme-color';document.head.append(m);return m})();
 const applyChromeTint=()=>{
   const light=root.dataset.mode==='light';
   const tint=light?'#c7956f':'#6b432f';
   if(meta.content!==tint)meta.content=tint;
   root.style.backgroundColor=tint;
 };
 applyChromeTint();
 new MutationObserver(applyChromeTint).observe(root,{attributes:true,attributeFilter:['data-mode']});
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
