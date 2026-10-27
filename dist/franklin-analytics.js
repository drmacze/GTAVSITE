(()=>{
 'use strict';
 if(window.__franklinAnalyticsLoaded)return;window.__franklinAnalyticsLoaded=true;
 const USER_KEY='franklin-anon-user-v1',SESSION_KEY='franklin-session-v1';
 const makeId=()=>crypto.randomUUID?.()||('f-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
 const read=(store,key)=>{try{return store.getItem(key)||''}catch{return''}};
 const write=(store,key,value)=>{try{store.setItem(key,value)}catch{}return value};
 const userId=read(localStorage,USER_KEY)||write(localStorage,USER_KEY,makeId());
 const sessionId=read(sessionStorage,SESSION_KEY)||write(sessionStorage,SESSION_KEY,makeId());
 const ua=navigator.userAgent||'';
 const deviceType=/iPad|Tablet/i.test(ua)?'tablet':/iPhone|Android|Mobile/i.test(ua)?'mobile':'desktop';
 const language=(navigator.language||'unknown').slice(0,20);
 let opened=false,awaitingAnswer=false;
 function topic(text){
  const s=String(text||'').toLowerCase();
  const groups=[
   ['install',/install|sideload|ipa|esign|altstore|trollstore|setup|download/],
   ['performance',/fps|performance|lag|stutter|heat|thermal|gpu|metal|graphics|ram|memory/],
   ['crash',/crash|black screen|freeze|stuck|hang|force close|error/],
   ['compatibility',/compatible|compatibility|support|device|iphone|ipad|ios|chip|a12|a13|a14|a15|a16|a17|m1|m2|m3|m4/],
   ['controls',/control|controller|keyboard|mouse|touch|button|joystick/],
   ['mission',/mission|heist|prologue|story|franklin|michael|trevor/],
   ['update',/update|version|build|release|latest|new version/],
   ['save',/save|game data|progress|icloud/],
   ['funding',/donat|donate|payment|paid|free|wallet|crypto|btc|sol|ltc/],
   ['community',/discord|community|support server|report/]
  ];
  return groups.find(([,re])=>re.test(s))?.[0]||'other';
 }
 function send(eventType,extra={}){
  const payload={eventType,userId,sessionId,page:location.pathname,deviceType,language,...extra};
  fetch('/api/franklin-analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true,credentials:'same-origin'}).catch(()=>{});
 }
 document.addEventListener('click',event=>{
  const launcher=event.target instanceof Element?event.target.closest('.ask-franklin-launcher'):null;
  if(launcher&&!opened){opened=true;send('open');}
  const target=event.target instanceof Element?event.target.closest('button,[role="button"]'):null;
  if(target&&/disconnect/i.test(target.textContent||'')){send('disconnect');awaitingAnswer=false;}
 },true);
 document.addEventListener('submit',event=>{
  const form=event.target instanceof Element?event.target.closest('.ask-franklin-form'):null;if(!form)return;
  const input=form.querySelector('.ask-franklin-input');const value=input?.value?.trim();if(!value)return;
  if(!opened){opened=true;send('open');}
  awaitingAnswer=true;send('question',{topic:topic(value)});
 },true);
 const observer=new MutationObserver(records=>{
  if(!awaitingAnswer)return;
  for(const record of records){for(const node of record.addedNodes){if(!(node instanceof Element))continue;
   const bot=node.matches?.('.ask-franklin-message.bot')?node:node.querySelector?.('.ask-franklin-message.bot');
   if(bot){awaitingAnswer=false;send('answer');return;}
  }}
 });
 const start=()=>{const root=document.querySelector('.ask-franklin-messages');if(root)observer.observe(root,{childList:true,subtree:true});else setTimeout(start,300)};
 start();
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();