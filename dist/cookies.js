(() => {
  const COOKIE='gtav_cookie_consent';
  const KEYS=['gtav-compatibility-model','gtav-community-update-interest'];
  const memory=new Map();
  let consent=null;
  try{const raw=document.cookie.split('; ').find(part=>part.startsWith(COOKIE+'='));if(raw){const data=JSON.parse(decodeURIComponent(raw.slice(COOKIE.length+1)));if(data.v===1&&typeof data.functional==='boolean'&&Date.parse(data.expiresAt)>Date.now())consent=data}}catch{}
  function clearPreferences(){KEYS.forEach(key=>{try{localStorage.removeItem(key)}catch{}memory.delete(key)})}
  if(!consent?.functional)clearPreferences();
  window.sitePrivacy={
    allowsPreferences:()=>Boolean(consent?.functional),
    getPreference(key){if(!KEYS.includes(key))return null;if(consent?.functional){try{return localStorage.getItem(key)}catch{}}return memory.get(key)||null;},
    setPreference(key,value){if(!KEYS.includes(key))return;memory.set(key,String(value));if(consent?.functional){try{localStorage.setItem(key,String(value))}catch{}}}
  };
  const banner=document.createElement('aside');banner.className='cookie-banner';banner.hidden=true;banner.setAttribute('aria-label','Cookie notice');
  banner.innerHTML='<div class="cookie-banner-copy"><span class="cookie-kicker">YOUR PRIVACY</span><h2>Cookies & device storage</h2><p>We use essential storage for your welcome choices and site settings. Optional storage remembers your update preferences. No analytics or advertising trackers are installed.</p></div><div class="cookie-banner-actions"><button type="button" data-cookie-choice="accept">Accept preferences</button><button type="button" data-cookie-choice="reject">Essential only</button><button type="button" data-cookie-settings>Manage settings</button></div>';
  const dialog=document.createElement('dialog');dialog.className='cookie-dialog';dialog.id='cookie-dialog';dialog.setAttribute('aria-labelledby','cookie-title');
  dialog.innerHTML='<form method="dialog"><div class="cookie-dialog-heading"><span class="cookie-kicker">PRIVACY PREFERENCES</span><button type="button" class="cookie-close" aria-label="Close cookie settings">×</button></div><h2 id="cookie-title">Your storage choices</h2><p class="cookie-intro">Choose what this website remembers on your device. These settings apply to this website only.</p><div class="cookie-category"><div><h3>Essential storage</h3><p>Remembers your privacy choice and required welcome answers, including your source, device, and completion status. Needed to continue without repeating the questions.</p></div><span class="cookie-required">Always active</span></div><label class="cookie-category cookie-option"><div><span class="cookie-category-title">Remember preferences</span><p>Save your interest in project updates. Your required device answer is part of welcome storage. If disabled, these preferences stay in memory for the current page only.</p></div><input type="checkbox" id="cookie-functional"><span class="cookie-switch" aria-hidden="true"></span></label><div class="cookie-details"><h3>What is stored?</h3><p>Your privacy choice is stored in a first-party cookie for 180 days. Welcome answers use local storage until you clear site data. Optional preferences also use local storage when enabled. Nothing here subscribes you to email or push notifications.</p><p>No analytics or advertising trackers are installed by this website. Discord member counts are fetched from Discord. Clicking external links opens those services, which use their own privacy settings.</p></div><p class="cookie-feedback" role="status"></p><div class="cookie-dialog-actions"><button type="button" data-cookie-choice="reject">Essential only</button><button type="button" data-cookie-choice="save">Save preferences</button></div></form>';
  document.body.append(banner,dialog);
  let returnFocus=null;
  const toggle=dialog.querySelector('#cookie-functional');
  function updateBanner(){const busy=!!document.querySelector('dialog[open],.community-toast');const visible=!consent&&!busy;if(banner.hidden===visible)banner.hidden=!visible;}
  function openSettings(button){returnFocus=button;toggle.checked=Boolean(consent?.functional);dialog.querySelector('.cookie-feedback').textContent='';dialog.showModal();document.documentElement.classList.add('privacy-open');updateBanner();}
  function closeSettings(){dialog.close();}
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('privacy-open');updateBanner();if(returnFocus?.isConnected&&!returnFocus.closest('[hidden]'))returnFocus.focus({preventScroll:true});else document.querySelector('[data-cookie-settings]')?.focus({preventScroll:true});});
  dialog.querySelector('.cookie-close').addEventListener('click',closeSettings);
  function save(functional){
    const now=Date.now();consent={v:1,functional,updatedAt:new Date(now).toISOString(),expiresAt:new Date(now+180*86400000).toISOString()};
    let persisted=false;
    try{document.cookie=COOKIE+'='+encodeURIComponent(JSON.stringify(consent))+'; Path=/; Max-Age=15552000; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');persisted=document.cookie.split('; ').some(part=>part.startsWith(COOKIE+'='));}catch{}
    if(!functional)clearPreferences();else memory.forEach((value,key)=>{try{localStorage.setItem(key,value)}catch{}});
    document.dispatchEvent(new CustomEvent('site:privacy-change',{detail:{functional}}));
    if(dialog.open){if(persisted)dialog.close();else dialog.querySelector('.cookie-feedback').textContent='Your browser could not save this choice. It applies for this visit. You can close this panel.';}
    updateBanner();
  }
  document.addEventListener('click',event=>{const target=event.target.closest('button');if(!target)return;if(target.hasAttribute('data-cookie-settings'))openSettings(target);const choice=target.dataset.cookieChoice;if(choice)save(choice==='accept'||(choice==='save'&&toggle.checked));});
  document.addEventListener('toggle',updateBanner,true);
  new MutationObserver(updateBanner).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pageshow',updateBanner);
  updateBanner();
})();

// Load the fan-made Ask Franklin helper on normal site pages, not the welcome screen.
if(document.body?.dataset?.page&&!window.__askFranklinLoaderAdded){
  window.__askFranklinLoaderAdded=true;
  const script=document.createElement('script');
  script.src='ask-franklin.js';
  script.defer=true;
  document.head.append(script);
}
