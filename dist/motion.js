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
 addStyle('settings-minimal-v1.css?v=20261029settingsminimal1','settings-minimal-v1-style');
 if(document.body?.dataset.page==='get-started'){
   addStyle('get-started-black-glass-v1.css?v=20261029blackglass1','get-started-black-glass-v1-style');
 }
 if(document.body?.dataset.page==='home'){
   if(typeof window.showWelcomeNotifications!=='function')window.showWelcomeNotifications=result=>{
     window.dispatchEvent(new CustomEvent('gtav:onboarding-complete',{detail:result||{}}));
     requestAnimationFrame(()=>document.querySelector('.home-intro-v4')?.scrollIntoView({block:'start',behavior:'auto'}));
   };
   addStyle('home-intro-v4.css?v=20261028homeintro4r3','home-intro-v4-style');
   addStyle('home-intro-v4-polish.css?v=20261028v4polish2','home-intro-v4-polish-style');
   addStyle('home-intro-sidebar-scope-v1.css?v=20261029intro-nav1','home-intro-sidebar-scope-v1-style');
   addStyle('community-welcome-v3.css?v=20261028communitywelcome4','community-welcome-v3-style');
   addScript('home-intro-v4.js?v=20261028homeintro4r4','home-intro-v4-script');

   window.__storyST5=true;
   addStyle('story-scrolltrigger-v3.css?v=20261029st7','story-scrolltrigger-v3-style');
   addScript('story-scrolltrigger-v3.js?v=20261029st7','story-scrolltrigger-v3-script');
   addStyle('home-scroll-refinements-v1.css?v=20261029refine1','home-scroll-refinements-v1-style');

   addStyle('home-chapter-lock-v1.css?v=20261029chapter4','home-chapter-lock-v1-style');
   addScript('home-chapter-lock-v1.js?v=20261029chapter3','home-chapter-lock-v1-script');

   addScript('music.js?v=20261029media3','home-music-scroll-loader');
 }
 if(document.body?.dataset.page==='downloads'){
   addStyle('mods-library-v10.css?v=20261029library11','mods-library-v10-style');
   addScript('mods-library-v11.js?v=20261029library11','mods-library-v11-script');
   addScript('mods-additional-v1.js?v=20261029additional1','mods-additional-v1-script');
   addStyle('mods-description-v1.css?v=20261029description1','mods-description-v1-style');
   addScript('mods-description-v1.js?v=20261029description1','mods-description-v1-script');
   addStyle('mods-preview-slider-v1.css?v=20261029preview1','mods-preview-slider-v1-style');
   addScript('mods-preview-slider-v1.js?v=20261029preview1','mods-preview-slider-v1-script');
   addStyle('mods-share-v1.css?v=20261029share2','mods-share-v1-style');
   addScript('mods-share-v1.js?v=20261029share2','mods-share-v1-script');
   addStyle('mods-feedback-gate-v1.css?v=20261029feedbackgate1','mods-feedback-gate-v1-style');
   addScript('mods-feedback-gate-v1.js?v=20261029feedbackgate2','mods-feedback-gate-v1-script');
 }
 if(document.body?.dataset.page==='updates'){
   addStyle('managed-updates.css?v=20261029latest28b','managed-updates-latest28-style');
   addScript('updates.js?v=20261029latest28b','updates-latest28-script');
 }
 if(document.body?.dataset.page==='feedback'){
   if(!document.querySelector('link[data-feedback-fixes]')){const l=document.createElement('link');l.id='feedback-fixes-style';l.rel='stylesheet';l.href='feedback-fixes.css?v=20261028uifix1';l.dataset.feedbackFixes='true';document.head.append(l)}
   addScript('feedback-fixes.js?v=20261028uifix1','feedback-fixes-loader');
 }

 const root=document.documentElement;
 const meta=document.querySelector('meta[name="theme-color"]')||(()=>{const m=document.createElement('meta');m.name='theme-color';document.head.append(m);return m})();
 const applyChromeTint=()=>{
   const page=document.body?.dataset.page||'';
   const forceBlack=page==='downloads'||page==='get-started';
   const light=root.dataset.mode==='light';
   const tint=forceBlack?'#000000':(light?'#c7956f':'#6b432f');
   if(meta.content!==tint)meta.content=tint;
   root.style.backgroundColor=tint;
 };
 applyChromeTint();
 new MutationObserver(applyChromeTint).observe(root,{attributes:true,attributeFilter:['data-mode']});
})();

(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const touch=matchMedia('(pointer: coarse)').matches;
 if(document.querySelector('.welcome-page')||reduced)return;
 if(touch||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);entry.target.animate([{opacity:.65,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:340,easing:'ease-out'});}}, {threshold:.08});
 document.querySelectorAll('.technical-section,.guide-section,.project-credits,.support-group').forEach(section=>observer.observe(section));
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
