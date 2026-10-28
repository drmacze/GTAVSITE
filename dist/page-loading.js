(()=>{
 const ONBOARDING_KEY='gtav-community-onboarding';
 const TRANSITION_KEY='gtav-page-transition-v3';
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 function hasCompletedOnboarding(){try{const saved=JSON.parse(localStorage.getItem(ONBOARDING_KEY)||sessionStorage.getItem(ONBOARDING_KEY)||'null');return Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model))}catch{return false}}
 function shouldGate(){const path=(location.pathname||'/').replace(/\/+$/,'')||'/',isHome=path.endsWith('/home')||path.endsWith('/home.html');if(path==='/'||path.endsWith('/index.html')||isHome||path.includes('release-publisher-8c2f71d4'))return false;return !hasCompletedOnboarding()}
 if(shouldGate()){const target=location.pathname+location.search+location.hash;try{sessionStorage.setItem('gtav-onboarding-return',target)}catch{}location.replace('/?return='+encodeURIComponent(target));return}

 const overlay=document.createElement('div');
 overlay.className='page-transition';
 overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="page-transition-mark"><svg viewBox="0 0 512 512" role="presentation" focusable="false"><defs><linearGradient id="page-v-shine" x1="-1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/><stop offset=".58" stop-color="#fff" stop-opacity=".95"/><stop offset=".68" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/><animate attributeName="x1" values="-1;1" dur="1.05s" repeatCount="indefinite"/><animate attributeName="x2" values="0;2" dur="1.05s" repeatCount="indefinite"/></linearGradient></defs><path class="page-v-base" d="M112 128H196L256 292L316 128H400L283 384H229Z"/><path class="page-v-accent" d="M220 128H292L256 229Z"/><path class="page-v-shine" d="M112 128H196L256 292L316 128H400L283 384H229Z" fill="url(#page-v-shine)"/></svg></div>`;
 document.body.append(overlay);
 let navigating=false;

 function show(mode='leaving'){overlay.classList.remove('is-revealing','is-arriving');if(mode==='arriving')overlay.classList.add('is-arriving');overlay.classList.add('is-active')}
 function hide(){overlay.classList.add('is-revealing');setTimeout(()=>{overlay.classList.remove('is-active','is-arriving','is-revealing')},reduceMotion.matches?0:430)}

 let arrived=false;
 try{arrived=sessionStorage.getItem(TRANSITION_KEY)==='1';sessionStorage.removeItem(TRANSITION_KEY)}catch{}
 if(arrived){show('arriving');requestAnimationFrame(()=>requestAnimationFrame(hide))}

 const prefetched=new Set();
 function eligible(anchor){if(!anchor||anchor.target||anchor.download||anchor.hasAttribute('data-no-transition'))return null;let url;try{url=new URL(anchor.href,location.href)}catch{return null}if(url.origin!==location.origin)return null;if(!/^https?:$/.test(url.protocol))return null;const current=location.pathname+location.search;if(url.pathname+url.search===current)return null;return url}
 function prefetch(anchor){const url=eligible(anchor);if(!url||prefetched.has(url.href))return;prefetched.add(url.href);const link=document.createElement('link');link.rel='prefetch';link.href=url.href;link.as='document';document.head.append(link)}
 document.addEventListener('pointerover',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});
 document.addEventListener('touchstart',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});

 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button>0)return;const url=eligible(a);if(!url||navigating)return;e.preventDefault();navigating=true;try{sessionStorage.setItem(TRANSITION_KEY,'1')}catch{}show();const go=()=>{location.href=url.href};if(reduceMotion.matches){go();return}setTimeout(go,300)});

 window.addEventListener('pageshow',e=>{navigating=false;if(e.persisted)overlay.classList.remove('is-active','is-arriving','is-revealing')});
 window.addEventListener('pagehide',()=>{navigating=false});
})();