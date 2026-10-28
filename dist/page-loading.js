(()=>{
 const ONBOARDING_KEY='gtav-community-onboarding';
 function hasCompletedOnboarding(){try{const saved=JSON.parse(localStorage.getItem(ONBOARDING_KEY)||sessionStorage.getItem(ONBOARDING_KEY)||'null');return Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model))}catch{return false}}
 function shouldGate(){const path=(location.pathname||'/').replace(/\/+$/,'')||'/',isHome=path.endsWith('/home')||path.endsWith('/home.html');if(path==='/'||path.endsWith('/index.html')||isHome||path.includes('release-publisher-8c2f71d4'))return false;return !hasCompletedOnboarding()}
 if(shouldGate()){const target=location.pathname+location.search+location.hash;try{sessionStorage.setItem('gtav-onboarding-return',target)}catch{}location.replace('/?return='+encodeURIComponent(target));return}
 const signal=document.createElement('div');signal.className='page-load-signal';signal.setAttribute('role','status');signal.textContent='Opening page…';signal.hidden=true;document.body.append(signal);
 let showTimer=0,hideTimer=0;
 const finish=()=>{clearTimeout(showTimer);clearTimeout(hideTimer);showTimer=hideTimer=0;signal.hidden=true};
 window.addEventListener('pageshow',finish);window.addEventListener('pagehide',finish);document.addEventListener('visibilitychange',()=>{if(document.hidden)finish()});
 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target||a.download)return;let u;try{u=new URL(a.href,location.href)}catch{return}if(u.origin!==location.origin||u.pathname===location.pathname)return;finish();showTimer=setTimeout(()=>{signal.hidden=false;hideTimer=setTimeout(finish,1600)},180)});
})();