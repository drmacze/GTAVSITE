(()=>{
'use strict';if(window.__gtavPushClientLoaded)return;window.__gtavPushClientLoaded=true;
const API='/api/push';
const bell=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>`;
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function b64ToBytes(value){const pad='='.repeat((4-value.length%4)%4),base=(value+pad).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
function supports(){return location.protocol==='https:'&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window}
let registration,subscription,config,settingsSwitch,settingsHelp,toast,toastStatus;
async function request(url,options={}){const r=await fetch(url,{cache:'no-store',...options});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||'request_failed');return data}
function setSettingsState(on){if(settingsSwitch){settingsSwitch.setAttribute('aria-checked',String(!!on));settingsSwitch.disabled=false}if(settingsHelp){if(!supports())settingsHelp.textContent='Not available in this browser.';else if(isIOS&&!standalone)settingsHelp.textContent='On iPhone/iPad, add this website to Home Screen first.';else if(Notification.permission==='denied')settingsHelp.textContent='Blocked in browser notification settings.';else settingsHelp.textContent=on?'Notifications are enabled on this device.':'Receive website updates and important announcements.'}}
function setToastStatus(text){if(toastStatus)toastStatus.textContent=text||''}
function hideToast(){if(toast)toast.hidden=true}
function showToast(){if(!toast||subscription)return;toast.hidden=false}
async function syncState(){if(!supports()){setSettingsState(false);return}try{registration=await navigator.serviceWorker.register('/push-sw.js',{scope:'/'});config=await request(API+'?mode=config');subscription=await registration.pushManager.getSubscription();setSettingsState(!!subscription);if(subscription){await request(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',subscription:subscription.toJSON()})});hideToast()}else{showToast()}}catch{setSettingsState(false);showToast()}}
async function subscribe(){
 if(!supports()){setSettingsState(false);setToastStatus('Push notifications are not supported here.');return false}
 if(isIOS&&!standalone){setSettingsState(false);setToastStatus('Add this website to your Home Screen, then open it from the icon to enable notifications.');return false}
 try{
  if(settingsSwitch)settingsSwitch.disabled=true;setToastStatus('Enabling…');registration=registration||await navigator.serviceWorker.register('/push-sw.js',{scope:'/'});config=config||await request(API+'?mode=config');
  const permission=await Notification.requestPermission();if(permission!=='granted'){setSettingsState(false);setToastStatus(permission==='denied'?'Notifications are blocked in browser settings.':'Notification permission was not granted.');return false}
  subscription=await registration.pushManager.getSubscription();if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(config.vapidPublicKey)});
  await request(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',subscription:subscription.toJSON()})});setSettingsState(true);setToastStatus('Notifications enabled.');window.gtavHaptics?.trigger?.('success');setTimeout(hideToast,650);return true
 }catch(error){console.error('push subscribe error',error);setSettingsState(false);setToastStatus('Could not enable notifications on this device.');return false}finally{if(settingsSwitch)settingsSwitch.disabled=false}
}
async function unsubscribe(){
 try{if(settingsSwitch)settingsSwitch.disabled=true;registration=registration||await navigator.serviceWorker.ready;subscription=await registration.pushManager.getSubscription();if(subscription){const endpoint=subscription.endpoint;await subscription.unsubscribe();await request(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'unsubscribe',endpoint})}).catch(()=>{})}subscription=null;setSettingsState(false);setToastStatus('Notifications disabled.');showToast();return true}catch{setToastStatus('Could not disable notifications.');return false}finally{if(settingsSwitch)settingsSwitch.disabled=false}
}
function mountSettings(){
 const dialog=document.querySelector('#site-settings');if(!dialog)return false;if(dialog.querySelector('.settings-notifications'))return true;
 const haptic=dialog.querySelector('.settings-haptic');if(!haptic)return false;
 const row=document.createElement('div');row.className='settings-haptic settings-notifications';row.innerHTML=`<div class="settings-haptic-label">${bell}<div><h3 id="notification-label">Notifications</h3><p id="notification-help">Checking notification status…</p></div></div><button type="button" class="settings-switch notification-switch" role="switch" aria-checked="false" aria-labelledby="notification-label" aria-describedby="notification-help"><span></span></button>`;
 haptic.insertAdjacentElement('afterend',row);settingsSwitch=row.querySelector('.notification-switch');settingsHelp=row.querySelector('#notification-help');settingsSwitch.disabled=true;
 settingsSwitch.addEventListener('click',async()=>{const on=settingsSwitch.getAttribute('aria-checked')==='true';on?await unsubscribe():await subscribe()});setSettingsState(!!subscription);return true
}
function mountToast(){
 if(document.querySelector('.push-subscribe-toast')){toast=document.querySelector('.push-subscribe-toast');return}
 toast=document.createElement('aside');toast.className='push-subscribe-toast';toast.hidden=true;toast.setAttribute('aria-live','polite');toast.innerHTML=`<img src="/assets/notification-logo.jpeg" alt=""><div class="push-toast-copy"><strong>Get website updates</strong><span>Enable notifications for new releases.</span><small class="push-toast-status"></small></div><button type="button" class="push-toast-enable">Enable</button><button type="button" class="push-toast-close" aria-label="Close">×</button>`;
 document.body.append(toast);toastStatus=toast.querySelector('.push-toast-status');toast.querySelector('.push-toast-enable').addEventListener('click',subscribe);toast.querySelector('.push-toast-close').addEventListener('click',hideToast)
}
function start(){mountToast();if(!mountSettings()){const o=new MutationObserver(()=>{if(mountSettings())o.disconnect()});o.observe(document.body,{childList:true,subtree:true})}syncState()}
window.gtavPush={subscribe,unsubscribe,sync:syncState,isSubscribed:()=>!!subscription};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

/* Shared launcher rating: visible beneath the GTA V iOS brand on every public page. */
(()=>{
 if(location.pathname.includes('release-publisher-8c2f71d4'))return;
 const load=()=>{
  if(!document.head.querySelector('link[href*="rating-summary.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='/rating-summary.css?v=20261027global2';document.head.append(css)}
  if([...document.scripts].some(script=>script.src.includes('/community-ratings.js')))return;
  const script=document.createElement('script');script.src='/community-ratings.js?v=20261027global2';script.defer=true;document.head.append(script);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();

/* Community ID profile is shared across all public pages. */
(()=>{
 if(location.pathname.includes('release-publisher-8c2f71d4'))return;
 const load=()=>{
  if(!document.head.querySelector('link[href*="profile.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='/profile.css?v=20261028profile2';document.head.append(css)}
  if([...document.scripts].some(script=>script.src.includes('/profile.js')))return;
  const script=document.createElement('script');script.src='/profile.js?v=20261028profile2';script.defer=true;document.head.append(script);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
