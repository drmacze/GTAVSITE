/* Global UI bootstrap. This file is no-store so stability fixes reach Safari immediately. */
(()=>{
 const addScript=(src,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;document.head.append(s)};
 const addStyle=(href,key)=>{if(document.querySelector(`link[data-${key}]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'true');document.head.append(l)};
 addScript('franklin-ui-guard-v2.js?v=20261031release30state3','franklin-ui-guard-v2-loader');
 addScript('site-ui-polish-v2.js?v=20261031ui8','site-ui-polish-v2-loader');
 addStyle('ui-stability-v1.css?v=20261031stability2','ui-stability-v1');
 addScript('ui-stability-v1.js?v=20261031stability2','ui-stability-v1-loader');
 if(document.body?.dataset.page==='feedback'){
  addStyle('feedback-fixes.css?v=20261028unified5','feedback-fixes');
  addScript('feedback-fixes.js?v=20261028unified5','feedback-fixes-loader');
 }
})();

(()=>{
 const ONBOARDING_KEY='gtav-community-onboarding';
 const TRANSITION_KEY='gtav-page-transition-v6';
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:760px)').matches;
 function hasCompletedOnboarding(){try{const saved=JSON.parse(localStorage.getItem(ONBOARDING_KEY)||sessionStorage.getItem(ONBOARDING_KEY)||'null');return Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model))}catch{return false}}
 function shouldGate(){const path=(location.pathname||'/').replace(/\/+$/,'')||'/',isHome=path.endsWith('/home')||path.endsWith('/home.html');if(path==='/'||path.endsWith('/index.html')||isHome||path.includes('release-publisher-8c2f71d4'))return false;return !hasCompletedOnboarding()}
 if(shouldGate()){const target=location.pathname+location.search+location.hash;try{sessionStorage.setItem('gtav-onboarding-return',target)}catch{}location.replace('/?return='+encodeURIComponent(target));return}

 const prefetched=new Set();
 function eligible(anchor){if(!anchor||anchor.target||anchor.download||anchor.hasAttribute('data-no-transition'))return null;let url;try{url=new URL(anchor.href,location.href)}catch{return null}if(url.origin!==location.origin||!/^https?:$/.test(url.protocol))return null;const current=location.pathname+location.search;if(url.pathname+url.search===current)return null;return url}
 function prefetch(anchor){const url=eligible(anchor);if(!url||prefetched.has(url.href))return;prefetched.add(url.href);const link=document.createElement('link');link.rel='prefetch';link.href=url.href;document.head.append(link)}
 document.addEventListener('pointerover',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});
 document.addEventListener('touchstart',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});

 if(mobile||reduceMotion.matches)return;

 const overlay=document.createElement('div');
 overlay.className='page-transition';
 overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML='<div class="page-transition-mark" aria-hidden="true"><svg viewBox="0 0 512 512" role="presentation" focusable="false"><path class="page-v-outline" pathLength="100" d="M102 100L194 100L256 300L318 100L410 100L292 412L220 412Z"/><path class="page-v-inner" pathLength="100" d="M150 126L182 126L256 356L330 126L362 126"/></svg></div>';
 document.body.append(overlay);
 let navigating=false;
 const LEAVE_MS=220;
 const ARRIVE_HOLD_MS=70;
 function show(mode='leaving'){overlay.classList.remove('is-revealing','is-arriving');if(mode==='arriving')overlay.classList.add('is-arriving');overlay.classList.add('is-active')}
 function hide(){overlay.classList.add('is-revealing');setTimeout(()=>overlay.classList.remove('is-active','is-arriving','is-revealing'),170)}
 let arrived=false;
 try{arrived=sessionStorage.getItem(TRANSITION_KEY)==='1';sessionStorage.removeItem(TRANSITION_KEY)}catch{}
 if(arrived){show('arriving');setTimeout(hide,ARRIVE_HOLD_MS)}
 document.addEventListener('click',e=>{
  const a=e.target.closest?.('a[href]');
  if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button>0)return;
  const url=eligible(a);if(!url||navigating)return;
  e.preventDefault();navigating=true;prefetch(a);
  try{sessionStorage.setItem(TRANSITION_KEY,'1')}catch{}
  show();setTimeout(()=>{location.href=url.href},LEAVE_MS);
 });
 window.addEventListener('pageshow',e=>{navigating=false;if(e.persisted)overlay.classList.remove('is-active','is-arriving','is-revealing')});
 window.addEventListener('pagehide',()=>{navigating=false});
})();
