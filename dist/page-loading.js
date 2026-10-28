(()=>{
 const ONBOARDING_KEY='gtav-community-onboarding';
 const TRANSITION_KEY='gtav-page-transition-v4';
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const LEAVE_MS=900;
 const ARRIVE_HOLD_MS=360;
 function hasCompletedOnboarding(){try{const saved=JSON.parse(localStorage.getItem(ONBOARDING_KEY)||sessionStorage.getItem(ONBOARDING_KEY)||'null');return Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model))}catch{return false}}
 function shouldGate(){const path=(location.pathname||'/').replace(/\/+$/,'')||'/',isHome=path.endsWith('/home')||path.endsWith('/home.html');if(path==='/'||path.endsWith('/index.html')||isHome||path.includes('release-publisher-8c2f71d4'))return false;return !hasCompletedOnboarding()}
 if(shouldGate()){const target=location.pathname+location.search+location.hash;try{sessionStorage.setItem('gtav-onboarding-return',target)}catch{}location.replace('/?return='+encodeURIComponent(target));return}

 const overlay=document.createElement('div');
 overlay.className='page-transition';
 overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="page-transition-mark" aria-hidden="true"><svg viewBox="0 0 512 512" role="presentation" focusable="false"><defs><clipPath id="page-v-clip"><path d="M91 82H205L256 245L307 82H421L299 426H213Z"/></clipPath><linearGradient id="page-v-sweep-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".96"/><stop offset=".58" stop-color="#fff6d8" stop-opacity=".72"/><stop offset=".72" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path class="page-v-shadow" d="M91 82H205L256 245L307 82H421L299 426H213Z"/><path class="page-v-base" d="M104 94H196L256 284L316 94H408L290 412H222Z"/><path class="page-v-inner" d="M151 122H181L256 345L331 122H361L277 383H235Z"/><g class="page-v-banner"><path d="M133 258L378 238L386 315L143 337Z"/><path class="page-v-banner-edge" d="M143 270L366 252L372 304L151 323Z"/><text x="258" y="295" text-anchor="middle" dominant-baseline="middle">FIVE</text></g><g clip-path="url(#page-v-clip)" transform="rotate(12 256 256)"><rect class="page-v-sweep" x="-230" y="40" width="155" height="455" fill="url(#page-v-sweep-gradient)"/></g></svg></div>`;
 document.body.append(overlay);
 let navigating=false;

 function show(mode='leaving'){overlay.classList.remove('is-revealing','is-arriving');if(mode==='arriving')overlay.classList.add('is-arriving');overlay.classList.add('is-active')}
 function hide(){overlay.classList.add('is-revealing');setTimeout(()=>{overlay.classList.remove('is-active','is-arriving','is-revealing')},reduceMotion.matches?0:520)}

 let arrived=false;
 try{arrived=sessionStorage.getItem(TRANSITION_KEY)==='1';sessionStorage.removeItem(TRANSITION_KEY)}catch{}
 if(arrived){show('arriving');if(reduceMotion.matches)hide();else setTimeout(hide,ARRIVE_HOLD_MS)}

 const prefetched=new Set();
 function eligible(anchor){if(!anchor||anchor.target||anchor.download||anchor.hasAttribute('data-no-transition'))return null;let url;try{url=new URL(anchor.href,location.href)}catch{return null}if(url.origin!==location.origin)return null;if(!/^https?:$/.test(url.protocol))return null;const current=location.pathname+location.search;if(url.pathname+url.search===current)return null;return url}
 function prefetch(anchor){const url=eligible(anchor);if(!url||prefetched.has(url.href))return;prefetched.add(url.href);const link=document.createElement('link');link.rel='prefetch';link.href=url.href;link.as='document';document.head.append(link)}
 document.addEventListener('pointerover',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});
 document.addEventListener('touchstart',e=>{const a=e.target.closest?.('a[href]');if(a)prefetch(a)},{passive:true});

 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button>0)return;const url=eligible(a);if(!url||navigating)return;e.preventDefault();navigating=true;prefetch(a);try{sessionStorage.setItem(TRANSITION_KEY,'1')}catch{}show();const go=()=>{location.href=url.href};if(reduceMotion.matches){go();return}setTimeout(go,LEAVE_MS)});

 window.addEventListener('pageshow',e=>{navigating=false;if(e.persisted)overlay.classList.remove('is-active','is-arriving','is-revealing')});
 window.addEventListener('pagehide',()=>{navigating=false});
})();