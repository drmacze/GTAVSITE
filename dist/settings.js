/* Pre-paint onboarding gate for every public HTML page. */
(()=>{
 'use strict';
 const KEY='gtav-community-onboarding';
 const path=(location.pathname||'/').replace(/\/+$/,'')||'/';
 const isWelcome=path==='/'||path.endsWith('/index.html');
 const isAdmin=path.includes('release-publisher-8c2f71d4');
 const isHome=path.endsWith('/home')||path.endsWith('/home.html');
 const params=new URLSearchParams(location.search);
 const isHomePath=value=>{try{const u=new URL(value,location.origin);const p=(u.pathname||'/').replace(/\/+$/,'')||'/';return p.endsWith('/home')||p.endsWith('/home.html')}catch{return false}};
 const poisonedReturn=value=>{if(!value)return false;try{const u=new URL(value,location.origin);return u.origin!==location.origin||isHomePath(u.href)||u.pathname.includes('release-publisher-8c2f71d4')||u.searchParams.has('return')}catch{return true}};
 if(isWelcome){
  const raw=params.get('return');
  if(raw&&poisonedReturn(raw)){
   try{sessionStorage.removeItem('gtav-onboarding-return')}catch{}
   try{history.replaceState(null,'','/')}catch{}
  }
  return;
 }
 if(isAdmin)return;
 let transitAt=0;
 try{transitAt=Number(sessionStorage.getItem('gtav-onboarding-transit')||0)}catch{}
 const transitAge=Date.now()-transitAt;
 const recentTransit=transitAt>0&&transitAge>=0&&transitAge<30000;
 if(transitAt&&!recentTransit){try{sessionStorage.removeItem('gtav-onboarding-transit')}catch{}}
 let cookieTransit=false;
 try{cookieTransit=document.cookie.split(';').some(part=>part.trim()==='gtav-onboarding-transit=1')}catch{}
 let referrerWelcome=false;
 try{const ref=new URL(document.referrer);const rp=(ref.pathname||'/').replace(/\/+$/,'')||'/';referrerWelcome=ref.origin===location.origin&&(rp==='/'||rp.endsWith('/index.html'))}catch{}
 const hashTransit=location.hash==='#onboarding'||location.hash==='#intro';
 const isOnboardingTransit=isHome&&(params.get('intro')==='1'||recentTransit||cookieTransit||referrerWelcome||hashTransit);
 if(isOnboardingTransit){
  try{document.cookie='gtav-onboarding-transit=; Max-Age=0; Path=/; SameSite=Lax; Secure'}catch{}
  return;
 }
 let completed=false;
 try{
  const raw=localStorage.getItem(KEY)||sessionStorage.getItem(KEY)||'';
  const saved=raw?JSON.parse(raw):null;
  completed=Boolean(saved&&['youtube','tiktok','browser','friends','other'].includes(saved.source)&&['android','ios'].includes(saved.device)&&(saved.device==='android'||saved.model));
 }catch{}
 if(completed)return;
 document.documentElement.style.background='#10100f';
 document.documentElement.style.colorScheme='dark';
 document.documentElement.style.visibility='hidden';
 if(isHome){
  try{sessionStorage.removeItem('gtav-onboarding-return')}catch{}
  location.replace('/');
  return;
 }
 const target=location.pathname+location.search+location.hash;
 if(poisonedReturn(target)){
  try{sessionStorage.removeItem('gtav-onboarding-return')}catch{}
  location.replace('/');
  return;
 }
 try{sessionStorage.setItem('gtav-onboarding-return',target)}catch{}
 location.replace('/?return='+encodeURIComponent(target));
})();

/* Shared preferences are applied before paint; no scroll listeners or animation loop. */
(()=>{
 'use strict';
 const key='gtav-site-preferences',root=document.documentElement;
 const defaults={mode:'dark',theme:'launcher',color:'sun',haptics:false};
 const colors={sun:['Sandy Shores Sun','#FFD07A','#7b4b00'],green:['Blaine County Green','#4E6B3D','#38542b'],ocean:['Pacific Ocean','#1E3D59','#1E3D59'],grey:['Concrete Grey','#B2B1A9','#55554e'],night:['Los Santos Night','#1A1B1F','#1A1B1F']};
 let prefs={...defaults};
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved){if(['dark','light'].includes(saved.mode))prefs.mode=saved.mode;if(['launcher','gtav'].includes(saved.theme))prefs.theme=saved.theme;if(colors[saved.color])prefs.color=saved.color;prefs.haptics=saved.haptics===true;}}catch{}
 function apply(){root.dataset.mode=prefs.mode;root.dataset.theme=prefs.theme;const c=colors[prefs.color],light=prefs.mode==='light';const accent=prefs.theme==='launcher'?(light?'#805000':'#e8b65e'):(light?c[2]:({green:'#a6c88b',ocean:'#8fbddd',night:'#b0b5c8'}[prefs.color]||c[1]));root.style.setProperty('--site-accent',accent);root.style.setProperty('--palette-color',prefs.theme==='launcher'?'#e8b65e':c[1]);root.style.colorScheme=prefs.mode;}
 apply();
 const svg=(paths)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
 const icons={settings:svg('<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="var(--settings-bg)"/><circle cx="16" cy="17" r="3" fill="var(--settings-bg)"/>'),sun:svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'),moon:svg('<path d="M20 14A8.5 8.5 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z"/>'),launcher:svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16m0-11h13"/>'),gtav:svg('<path d="m4 5 8 15 8-15h-5l-3 7-3-7Z"/>'),haptic:svg('<rect x="8" y="4" width="8" height="16" rx="2"/><path d="m4 8-2 4 2 4m16-8 2 4-2 4M11 17h2"/>'),close:svg('<path d="m6 6 12 12M18 6 6 18"/>')};
 const supported=typeof navigator.vibrate==='function';let lastPulse=0;const patterns={tap:7,soft:10,selection:12,medium:18,open:[8,24,12],close:9,success:[9,34,15],warning:[22,38,22]};
 function haptic(type='tap'){if(!prefs.haptics||!supported)return false;const now=Date.now();if(now-lastPulse<65)return false;lastPulse=now;try{return navigator.vibrate(patterns[type]||patterns.tap)!==false}catch{return false}}
 window.gtavHaptics={trigger:haptic,isEnabled:()=>prefs.haptics,isSupported:()=>supported};window.addEventListener('gtav:haptic',e=>haptic(e.detail?.type||'tap'));
 function classifyHaptic(target){if(target.closest('.settings-switch'))return null;if(target.closest('.ask-franklin-launcher,.menu-toggle,.settings-trigger'))return 'open';if(target.closest('.ask-franklin-close,.menu-close,.menu-backdrop,.settings-close,.toast-close,.push-toast-close'))return 'close';if(target.closest('#onboarding-next,.toast-subscribe,.ask-franklin-send,.push-toast-enable'))return 'medium';if(target.closest('.gameplay-next,.gameplay-prev,.gameplay-thumb,[data-filter],[data-mode-choice],[data-theme-choice],[data-color-choice]'))return 'selection';if(target.closest('summary,.faq-list details'))return 'soft';if(target.closest('button,a,input[type=radio],input[type=checkbox]'))return 'tap';return null;}
 function init(){if(!document.querySelector('.site-header'))return;const button=document.createElement('button');button.type='button';button.className='settings-trigger';button.setAttribute('aria-label','Open settings');button.setAttribute('aria-haspopup','dialog');button.innerHTML=icons.settings;document.querySelector('.header-actions')?.insertBefore(button,document.querySelector('.menu-toggle'));const dialog=document.createElement('dialog');dialog.className='site-settings';dialog.id='site-settings';dialog.setAttribute('aria-labelledby','settings-title');dialog.innerHTML=`<div class="settings-heading"><div><span class="settings-kicker">MAKE IT YOURS</span><h2 id="settings-title">Settings</h2></div><button type="button" class="settings-close" aria-label="Close settings">${icons.close}</button></div><p class="settings-intro">Your website, your preferences.</p><fieldset><legend>Appearance</legend><div class="settings-segment">${['dark','light'].map(v=>`<button type="button" data-mode-choice="${v}" aria-pressed="false">${icons[v==='dark'?'moon':'sun']}${v==='dark'?'Dark':'Light'}</button>`).join('')}</div></fieldset><fieldset><legend>Theme</legend><div class="settings-segment">${['launcher','gtav'].map(v=>`<button type="button" data-theme-choice="${v}" aria-pressed="false">${icons[v]}${v==='launcher'?'Launcher':'GTA V'}</button>`).join('')}</div><p class="settings-help">Launcher gold or a palette inspired by Los Santos.</p></fieldset><fieldset id="settings-palette"><legend>GTA V colour</legend><div class="settings-swatches">${Object.entries(colors).map(([id,c])=>`<button type="button" data-color-choice="${id}" aria-label="${c[0]}" aria-pressed="false" style="--swatch:${c[1]}"><span></span></button>`).join('')}</div><p class="settings-color-label"></p></fieldset><div class="settings-haptic"><div class="settings-haptic-label">${icons.haptic}<div><h3 id="haptic-label">Haptic feedback</h3><p id="haptic-help">${supported?'Contextual feedback for navigation, selections and important actions.':'Not available in this browser.'}</p></div></div><button type="button" class="settings-switch" role="switch" aria-checked="false" aria-labelledby="haptic-label" aria-describedby="haptic-help"><span></span></button></div><p class="settings-saved" role="status" aria-live="polite">Preferences are saved on this browser.</p>`;document.body.append(dialog);let opener;function open(e){opener=e.currentTarget;dialog.showModal();document.body.classList.add('settings-open')}function close(){dialog.close()}button.addEventListener('click',open);dialog.querySelector('.settings-close').addEventListener('click',close);dialog.addEventListener('close',()=>{document.body.classList.remove('settings-open');opener?.focus()});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});function sync(){['mode','theme','color'].forEach(k=>dialog.querySelectorAll(`[data-${k}-choice]`).forEach(b=>b.setAttribute('aria-pressed',String(prefs[k]===b.dataset[k+'Choice']))));dialog.querySelector('#settings-palette').hidden=prefs.theme!=='gtav';dialog.querySelector('.settings-color-label').textContent=colors[prefs.color][0];dialog.querySelector('.settings-switch:not(.notification-switch)')?.setAttribute('aria-checked',String(prefs.haptics))}function save(){apply();sync();try{localStorage.setItem(key,JSON.stringify(prefs));dialog.querySelector('.settings-saved').textContent='Preferences saved.'}catch{dialog.querySelector('.settings-saved').textContent='Applied for this visit. Browser storage is unavailable.'}}dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;for(const k of ['mode','theme','color'])if(b.dataset[k+'Choice']){prefs[k]=b.dataset[k+'Choice'];save()}if(b.classList.contains('settings-switch')&&!b.classList.contains('notification-switch')){const enabling=!prefs.haptics;prefs.haptics=enabling;save();if(enabling)haptic('success')}});document.addEventListener('click',e=>{if(!e.isTrusted||!(e.target instanceof Element))return;const type=classifyHaptic(e.target);if(type)haptic(type)},{capture:true});window.addEventListener('storage',e=>{if(e.key!==key)return;try{const next=JSON.parse(e.newValue);if(next&&['light','dark'].includes(next.mode)&&['gtav','launcher'].includes(next.theme)&&colors[next.color]){prefs={...next,haptics:next.haptics===true};apply();sync()}}catch{}});sync()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* Web Push / PWA + admin extensions bootstrap. */
(()=>{
 'use strict';
 const addMeta=(name,content)=>{if(document.head.querySelector(`meta[name="${name}"]`))return;const m=document.createElement('meta');m.name=name;m.content=content;document.head.append(m)};
 const loadScript=src=>{if([...document.scripts].some(s=>s.src.includes(src.split('?')[0])))return;const s=document.createElement('script');s.src=src;s.defer=true;document.head.append(s)};
 // Installation metadata is declared once in HTML; never inject stale duplicate links.
 addMeta('apple-mobile-web-app-capable','yes');addMeta('apple-mobile-web-app-title','GTA V IOS');
 const admin=location.pathname.includes('release-publisher-8c2f71d4');
 if(admin){loadScript('/admin-push.js?v=20261027push2');loadScript('/admin-onboarding.js?v=20261027survey1');loadScript('/admin-download-stats-v1.js?v=20261029downloads1');return}
 const css=document.createElement('link');css.rel='stylesheet';css.href='/push-notifications.css?v=20261027push2';document.head.append(css);loadScript('/push-client.js?v=20261027push2');
 const loadFeedbackCommunity=()=>{if(!location.pathname.includes('feedback'))return;if(!document.head.querySelector('link[href^="/feedback-community.css"]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/feedback-community.css?v=20261027voices1';document.head.append(link)}loadScript('/feedback-community.js?v=20261027voices1')};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadFeedbackCommunity,{once:true});else loadFeedbackCommunity();
})();

/* Compatibility-only result grid and native benchmark analyzer. */
(()=>{
 'use strict';
 const path=(location.pathname||'').replace(/\/+$/,'');
 if(!(path.endsWith('/compatibility')||path.endsWith('/compatibility.html')))return;
 if(!document.head.querySelector('link[href^="/compatibility-results-grid.css"]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/compatibility-results-grid.css?v=20261028grid1';document.head.append(link)}
 if(![...document.scripts].some(s=>s.src.includes('/compatibility-benchmark.js'))){const s=document.createElement('script');s.src='/compatibility-benchmark.js?v=20261028bench1';s.defer=true;document.head.append(s)}
})();