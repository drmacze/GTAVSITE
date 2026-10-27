const FALLBACK={title:'GTA V IOS Website',body:'A new website update is available.',url:'/updates.html',icon:'/assets/notification-logo.jpeg'};
self.addEventListener('push',event=>{
 event.waitUntil((async()=>{
  let data=FALLBACK;
  try{const r=await fetch('/api/push?mode=latest',{cache:'no-store'});if(r.ok)data={...FALLBACK,...await r.json()}}catch{}
  await self.registration.showNotification('GTA V IOS Website',{
   body:data.body||FALLBACK.body,
   icon:data.icon||FALLBACK.icon,
   badge:data.icon||FALLBACK.icon,
   tag:data.id?`gtav-ios-${data.id}`:'gtav-ios-update',
   renotify:true,
   data:{url:data.url||FALLBACK.url}
  });
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=new URL(event.notification.data?.url||'/updates.html',self.location.origin).href;
 event.waitUntil((async()=>{
  const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){if('focus'in client){await client.focus();if('navigate'in client)await client.navigate(target);return}}
  if(clients.openWindow)return clients.openWindow(target);
 })());
});
