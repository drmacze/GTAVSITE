(()=>{
'use strict';
if(window.__gtaOnlineCleanPreviewV2)return;
window.__gtaOnlineCleanPreviewV2=true;
if(document.body?.dataset.page!=='home')return;

const VIDEO_URL='https://videotourl.com/videos/1793387568695-adde3f65-ff50-4516-a407-884f3f95a24e.mov';
let observer=null;
let wasOpen=false;
let video=null;
let sheet=null;

function ensureVideo(){
 sheet=document.querySelector('.gta-online-menu-promo');
 const frame=sheet?.querySelector('.gta-online-menu-media-frame');
 if(!sheet||!frame)return false;

 video=frame.querySelector('video.gta-online-native-preview');
 if(!video){
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
 }
 return true;
}

function startPreview(){
 if(!video||!sheet)return;
 if(!video.src){
  video.src=video.dataset.src||VIDEO_URL;
  video.load();
 }
 video.muted=true;
 try{video.currentTime=0}catch{}
 const play=video.play();
 play?.catch?.(()=>{});
}

function stopPreview(){
 if(!video)return;
 video.pause();
 try{video.currentTime=0}catch{}
}

function sync(){
 if(!ensureVideo())return;
 const open=sheet.classList.contains('is-open')&&sheet.getAttribute('aria-hidden')!=='true';
 if(open&&!wasOpen)startPreview();
 if(!open&&wasOpen)stopPreview();
 wasOpen=open;
}

sync();
observer=new MutationObserver(sync);
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
window.addEventListener('pageshow',sync,{passive:true});
window.addEventListener('pagehide',()=>{observer?.disconnect();stopPreview();},{once:true});
})();
