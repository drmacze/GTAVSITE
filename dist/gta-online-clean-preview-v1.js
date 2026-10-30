(()=>{
'use strict';
if(window.__gtaOnlineCleanPreviewV3)return;
window.__gtaOnlineCleanPreviewV3=true;
if(document.body?.dataset.page!=='home')return;

const VIDEO_URL='https://videotourl.com/videos/1793387568695-adde3f65-ff50-4516-a407-884f3f95a24e.mov';
let mountObserver=null;
let sheetObserver=null;
let releaseTimer=0;
let wasOpen=false;
let video=null;
let sheet=null;

function ensureVideo(){
 const frame=sheet?.querySelector('.gta-online-menu-media-frame');
 if(!sheet||!frame)return false;
 video=frame.querySelector('video.gta-online-native-preview');
 if(video)return true;
 frame.querySelector('iframe')?.remove();
 video=document.createElement('video');
 video.className='gta-online-native-preview';
 video.setAttribute('playsinline','');
 video.setAttribute('webkit-playsinline','');
 video.setAttribute('muted','');
 video.setAttribute('controls','');
 video.setAttribute('preload','metadata');
 video.setAttribute('controlsList','nodownload');
 video.muted=true;
 video.defaultMuted=true;
 video.playsInline=true;
 video.loop=true;
 video.dataset.src=VIDEO_URL;
 video.addEventListener('loadeddata',()=>sheet?.classList.add('media-ready'));
 video.addEventListener('canplay',()=>sheet?.classList.add('media-ready'));
 video.addEventListener('error',()=>sheet?.classList.remove('media-ready'));
 frame.append(video);
 return true;
}

function startPreview(){
 if(!video||!sheet)return;
 clearTimeout(releaseTimer);
 if(!video.src){
  video.src=video.dataset.src||VIDEO_URL;
  video.load();
 }
 video.muted=true;
 try{video.currentTime=0}catch{}
 const play=video.play();
 play?.catch?.(()=>{});
}

function releasePreview(){
 if(!video||wasOpen)return;
 try{video.pause()}catch{}
 try{video.currentTime=0}catch{}
 video.removeAttribute('src');
 try{video.load()}catch{}
 sheet?.classList.remove('media-ready');
}

function stopPreview(){
 if(!video)return;
 try{video.pause()}catch{}
 try{video.currentTime=0}catch{}
 clearTimeout(releaseTimer);
 releaseTimer=setTimeout(releasePreview,5000);
}

function sync(){
 if(!sheet||!ensureVideo())return;
 const open=sheet.classList.contains('is-open')&&sheet.getAttribute('aria-hidden')!=='true';
 if(open&&!wasOpen)startPreview();
 if(!open&&wasOpen)stopPreview();
 wasOpen=open;
}

function attach(found){
 if(!found)return false;
 sheet=found;
 mountObserver?.disconnect();
 mountObserver=null;
 ensureVideo();
 sync();
 sheetObserver?.disconnect();
 sheetObserver=new MutationObserver(sync);
 sheetObserver.observe(sheet,{attributes:true,attributeFilter:['class','aria-hidden']});
 return true;
}

function boot(){
 if(attach(document.querySelector('.gta-online-menu-promo')))return;
 mountObserver=new MutationObserver(()=>{
  const found=document.querySelector('.gta-online-menu-promo');
  if(found)attach(found);
 });
 mountObserver.observe(document.body,{childList:true,subtree:true});
 setTimeout(()=>mountObserver?.disconnect(),12000);
}

boot();
window.addEventListener('pageshow',sync,{passive:true});
window.addEventListener('pagehide',()=>{
 clearTimeout(releaseTimer);
 mountObserver?.disconnect();
 sheetObserver?.disconnect();
 try{video?.pause()}catch{}
},{once:true});
})();
