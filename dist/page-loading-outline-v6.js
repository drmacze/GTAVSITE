/* UI safety bootstrap. */
(()=>{
 const addScript=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;document.head.append(s)};
 addScript('franklin-ui-guard-v2.js?v=20261028polish2','franklin-ui-guard-loader');
 if(document.body?.dataset.page==='feedback'){
  if(!document.querySelector('link[data-feedback-fixes]')){const l=document.createElement('link');l.rel='stylesheet';l.href='feedback-fixes.css?v=20261028unified5';l.dataset.feedbackFixes='true';document.head.append(l)}
  addScript('feedback-fixes.js?v=20261028unified5','feedback-fixes-loader');
 }
})();

(()=>{
 const ONBOARDING_KEY='gtav-community-onboarding';
 const TRANSITION_KEY='gtav-page-transition-outline-v7';
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const ARRIVE_HOLD_MS=120;
 const SHINE_FALLBACK_MS=3400;
 function hasCompletedOnboarding(){try{const saved=JSON.parse(localStorage.getItem(ONBOARDING_KEY)||sessionStorage.getItem(ONBOARDING_KEY)||'null');return Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model))}catch{return false}}
 function shouldGate(){const path=(location.pathname||'/').replace(/\/+$/,'')||'/',isHome=path.endsWith('/home')||path.endsWith('/home.html');if(path==='/'||path.endsWith('/index.html')||isHome||path.includes('release-publisher-8c2f71d4'))return false;return !hasCompletedOnboarding()}
 if(shouldGate()){const target=location.pathname+location.search+location.hash;try{sessionStorage.setItem('gtav-onboarding-return',target)}catch{}location.replace('/?return='+encodeURIComponent(target));return}
 const overlay=document.createElement('div');
 overlay.className='page-transition page-transition-outline-v6';
 overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="page-transition-mark" aria-hidden="true"><svg viewBox="0 0 512 512" role="presentation" focusable="false"><defs><filter id="outline-v6-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4"/></filter></defs><path class="page-v6-halo" pathLength="100" d="M102 100L194 100L256 300L318 100L410 100L292 412L220 412Z"/><path class="page-v6-outline" pathLength="100" d="M102 100L194 100L256 300L318 100L410 100L292 412L220 412Z"/><path class="page-v6-inner" pathLength="100" d="M153 127L181 127L256 356L331 127L359 127"/><path class="page-v6-glint" pathLength="100" d="M102 100L194 100L256 300L318 100L410 100L292 412L220 412Z"/></svg></div>`;
 document.body.append(overlay);
 const glint=overlay.querySelector('.page-v6-glint');
 let navigating=false;
 function show(mode='leaving'){
  overlay.classList.remove('is-revealing','is-arriving','is-leaving');
  if(mode==='arriving')overlay.classList.add('is-arriving');
  overlay.classList.add('is-active');
 }
 function hide(){overlay.classList.add('is-revealing');setTimeout(()=>overlay.classList.remove('is-active','is-arriving','is-leaving','is-revealing'),reduceMotion.matches?0:420)}
 let arrived=false;
 try{arrived=sessionStorage.getItem(TRANSITION_KEY)==='1';sessionStorage.removeItem(TRANSITION_KEY)}catch{}
 if(arrived){show('arriving');if(reduceMotion.matches)hide();else setTimeout(hide,ARRIVE_HOLD_MS)}
 const prefetched=new Set();
 function eligible(anchor){if(!anchor||anchor.target||anchor.download||anchor.hasAttribute('data-no-transition'))return null;let url;try{url=new URL(anchor.href,location.href)}catch{return null}if(url.origin!==location.origin)return null;if(!/^https?:$/.test(url.protocol))return null;const current=location.pathname+location.search;if(url.pathname+url.search===current)return null;return url}
 function prefetch(anchor){const url=eligible(anchor);if(!url||prefetched.has(url.href))return;prefetched.add(url.href);const link=document.createElement('link');link.rel='prefetch';link.href=url.href;link.as='document';document.head.append(link)}
 document.addEventListener('pointerover',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});
 document.addEventListener('touchstart',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});
 document.addEventListener('click',e=>{
  const a=e.target.closest?.('a[href]');
  if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button>0)return;
  const url=eligible(a);
  if(!url||navigating)return;
  e.preventDefault();navigating=true;prefetch(a);
  try{sessionStorage.setItem(TRANSITION_KEY,'1')}catch{}
  show();
  const go=()=>{location.href=url.href};
  if(reduceMotion.matches){go();return}
  let finished=false;let fallback=0;
  const finish=()=>{if(finished)return;finished=true;if(fallback)clearTimeout(fallback);go()};
  const onAnimationEnd=event=>{if(event.animationName!=='outline-v6-shine-once')return;glint.removeEventListener('animationend',onAnimationEnd);finish()};
  glint.addEventListener('animationend',onAnimationEnd);
  void glint.getBoundingClientRect();
  requestAnimationFrame(()=>overlay.classList.add('is-leaving'));
  fallback=setTimeout(()=>{glint.removeEventListener('animationend',onAnimationEnd);finish()},SHINE_FALLBACK_MS);
 });
 window.addEventListener('pageshow',e=>{navigating=false;if(e.persisted)overlay.classList.remove('is-active','is-arriving','is-leaving','is-revealing')});
 window.addEventListener('pagehide',()=>{navigating=false});
})();