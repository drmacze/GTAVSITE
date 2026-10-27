(()=>{
'use strict';if(window.__gtavPushClientLoaded)return;window.__gtavPushClientLoaded=true;
const API='/api/push';
const bell=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>`;
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function b64ToBytes(value){const pad='='.repeat((4-value.length%4)%4),base=(value+pad).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
function supports(){return location.protocol==='https:'&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window}
let trigger,popover,statusNode,primary,secondary,registration,subscription,config;
function setStatus(text){if(statusNode)statusNode.textContent=text||''}
function openPopover(){if(popover)popover.hidden=false}
function closePopover(){if(popover)popover.hidden=true}
function setEnabled(on){trigger?.setAttribute('data-state',on?'enabled':'off');trigger?.setAttribute('aria-label',on?'Notifications enabled':'Enable notifications')}
async function request(url,options={}){const r=await fetch(url,{cache:'no-store',...options});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||'request_failed');return data}
async function syncState(){if(!supports())return;try{registration=await navigator.serviceWorker.register('/push-sw.js',{scope:'/'});config=await request(API+'?mode=config');subscription=await registration.pushManager.getSubscription();setEnabled(!!subscription);if(subscription)await request(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',subscription:subscription.toJSON()})})}catch{}}
async function subscribe(){
 if(!supports()){setStatus('Push notifications are not supported in this browser.');return}
 if(isIOS&&!standalone){setStatus('On iPhone/iPad: add this website to your Home Screen first, open it from the new icon, then tap the bell again.');return}
 try{
  setStatus('Preparing notifications…');registration=registration||await navigator.serviceWorker.register('/push-sw.js',{scope:'/'});config=config||await request(API+'?mode=config');
  const permission=await Notification.requestPermission();if(permission!=='granted'){setStatus(permission==='denied'?'Notification permission is blocked in browser settings.':'Notification permission was not granted.');return}
  subscription=await registration.pushManager.getSubscription();if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(config.vapidPublicKey)});
  await request(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',subscription:subscription.toJSON()})});setEnabled(true);setStatus('Notifications are enabled for this device.');window.gtavHaptics?.trigger?.('success');
 }catch(error){console.error('push subscribe error',error);setStatus('Could not enable notifications on this device.')}
}
async function unsubscribe(){
 try{registration=registration||await navigator.serviceWorker.ready;subscription=await registration.pushManager.getSubscription();if(subscription){const endpoint=subscription.endpoint;await subscription.unsubscribe();await request(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'unsubscribe',endpoint})}).catch(()=>{})}setEnabled(false);setStatus('Notifications are disabled on this device.')}catch{setStatus('Could not disable notifications.')}
}
function build(){
 const actions=document.querySelector('.header-actions');if(!actions)return;
 trigger=document.createElement('button');trigger.type='button';trigger.className='push-trigger';trigger.setAttribute('aria-label','Enable notifications');trigger.innerHTML=bell;
 const before=actions.querySelector('.settings-trigger,.menu-toggle');actions.insertBefore(trigger,before||null);
 popover=document.createElement('aside');popover.className='push-popover';popover.hidden=true;popover.setAttribute('aria-live','polite');popover.innerHTML=`<div class="push-popover-head"><img class="push-popover-logo" src="/assets/notification-logo.jpeg" alt=""><div><h3>GTA V IOS Website</h3><p>Get notified when a new site update or important announcement is published.</p></div></div><div class="push-popover-actions"><button type="button" class="primary" data-push-enable>Enable notifications</button><button type="button" data-push-disable>Disable</button><button type="button" data-push-close>Close</button></div><div class="push-popover-status"></div>`;
 document.body.append(popover);statusNode=popover.querySelector('.push-popover-status');primary=popover.querySelector('[data-push-enable]');secondary=popover.querySelector('[data-push-disable]');
 trigger.addEventListener('click',()=>{openPopover();setStatus(subscription?'Notifications are currently enabled.':isIOS&&!standalone?'Install this site to your Home Screen to enable push notifications on iPhone/iPad.':'Tap Enable notifications to subscribe.')});primary.addEventListener('click',subscribe);secondary.addEventListener('click',unsubscribe);popover.querySelector('[data-push-close]').addEventListener('click',closePopover);
 syncState();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();