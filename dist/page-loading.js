(()=>{
 const ONBOARDING_KEY='gtav-community-onboarding';
 function hasCompletedOnboarding(){
  try{
   const saved=JSON.parse(localStorage.getItem(ONBOARDING_KEY)||sessionStorage.getItem(ONBOARDING_KEY)||'null');
   return Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model));
  }catch{return false}
 }
 function shouldGate(){
  const path=(location.pathname||'/').replace(/\/+$/,'')||'/';
  if(path==='/'||path.endsWith('/index.html')||path.endsWith('/home.html'))return false;
  if(path.includes('release-publisher-8c2f71d4'))return false;
  return !hasCompletedOnboarding();
 }
 if(shouldGate()){
  const target=location.pathname+location.search+location.hash;
  try{sessionStorage.setItem('gtav-onboarding-return',target)}catch{}
  location.replace('/?return='+encodeURIComponent(target));
  return;
 }
 const signal=document.createElement('div');signal.className='page-load-signal';signal.setAttribute('role','status');signal.textContent='Opening page…';signal.hidden=true;document.body.append(signal);let timer=0;const finish=()=>{clearTimeout(timer);timer=0;signal.hidden=true};window.addEventListener('load',finish,{once:true});window.addEventListener('pageshow',finish);document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||a.target||a.download)return;const u=new URL(a.href);if(u.origin===location.origin&&u.pathname!==location.pathname){signal.textContent='Opening page…';signal.hidden=false;clearTimeout(timer);timer=setTimeout(finish,8000)}});
})();
