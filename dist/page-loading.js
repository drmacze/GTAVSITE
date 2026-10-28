(()=>{
 const ONBOARDING_KEY='gtav-community-onboarding';
 const TRANSITION_KEY='gtav-page-transition-v2';
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 function hasCompletedOnboarding(){try{const saved=JSON.parse(localStorage.getItem(ONBOARDING_KEY)||sessionStorage.getItem(ONBOARDING_KEY)||'null');return Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model))}catch{return false}}
 function shouldGate(){const path=(location.pathname||'/').replace(/\/+$/,'')||'/',isHome=path.endsWith('/home')||path.endsWith('/home.html');if(path==='/'||path.endsWith('/index.html')||isHome||path.includes('release-publisher-8c2f71d4'))return false;return !hasCompletedOnboarding()}
 if(shouldGate()){const target=location.pathname+location.search+location.hash;try{sessionStorage.setItem('gtav-onboarding-return',target)}catch{}location.replace('/?return='+encodeURIComponent(target));return}

 const overlay=document.createElement('div');
 overlay.className='page-transition';
 overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML='<div class="page-transition-core"><div class="page-transition-brand"><strong>GTA V</strong><span>iOS COMMUNITY</span></div><div class="page-transition-track" aria-hidden="true"><i></i></div><small class="page-transition-label">Loading</small></div>';
 document.body.append(overlay);
 const label=overlay.querySelector('.page-transition-label');
 let navigating=false;

 function destinationLabel(anchor,url){const text=(anchor?.dataset?.transitionLabel||anchor?.textContent||'').replace(/\s+/g,' ').trim();if(text&&text.length<=42)return text;const part=url.pathname.split('/').filter(Boolean).pop()||'Home';return part.replace(/\.html$/,'').replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
 function show(name,mode='leaving'){label.textContent=name||'Loading';overlay.classList.remove('is-revealing','is-arriving');if(mode==='arriving')overlay.classList.add('is-arriving');overlay.classList.add('is-active')}
 function hide(){overlay.classList.add('is-revealing');setTimeout(()=>{overlay.classList.remove('is-active','is-arriving','is-revealing');},reduceMotion.matches?0:420)}

 let arrived=false;
 try{arrived=sessionStorage.getItem(TRANSITION_KEY)==='1';sessionStorage.removeItem(TRANSITION_KEY)}catch{}
 if(arrived){show(document.title.split('|')[0].trim()||'Loading','arriving');requestAnimationFrame(()=>requestAnimationFrame(hide))}

 const prefetched=new Set();
 function eligible(anchor){if(!anchor||anchor.target||anchor.download||anchor.hasAttribute('data-no-transition'))return null;let url;try{url=new URL(anchor.href,location.href)}catch{return null}if(url.origin!==location.origin)return null;if(!/^https?:$/.test(url.protocol))return null;const current=location.pathname+location.search;if(url.pathname+url.search===current)return null;return url}
 function prefetch(anchor){const url=eligible(anchor);if(!url||prefetched.has(url.href))return;prefetched.add(url.href);const link=document.createElement('link');link.rel='prefetch';link.href=url.href;link.as='document';document.head.append(link)}
 document.addEventListener('pointerover',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});
 document.addEventListener('touchstart',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});

 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button>0)return;const url=eligible(a);if(!url||navigating)return;e.preventDefault();navigating=true;try{sessionStorage.setItem(TRANSITION_KEY,'1')}catch{}show(destinationLabel(a,url));const go=()=>{location.href=url.href};if(reduceMotion.matches){go();return}setTimeout(go,220)});

 window.addEventListener('pageshow',e=>{navigating=false;if(e.persisted){overlay.classList.remove('is-active','is-arriving','is-revealing')}});
 window.addEventListener('pagehide',()=>{navigating=false});
})();