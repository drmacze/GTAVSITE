(()=>{
'use strict';
if(window.__gtaOnlineCleanPreviewV4)return;
window.__gtaOnlineCleanPreviewV4=true;
if(document.body?.dataset.page!=='home')return;

const VIDEO_URL='https://videotourl.com/videos/1793387568695-adde3f65-ff50-4516-a407-884f3f95a24e.mov';
let mountObserver=null,sheetObserver=null,releaseTimer=0,wasOpen=false,video=null,sheet=null,media=null;

function setReady(ready){sheet?.classList.toggle('media-ready',ready);if(ready)sheet?.classList.remove('media-loading')}
function ensureVideo(){
 const frame=sheet?.querySelector('.gta-online-menu-media-frame');
 media=sheet?.querySelector('.gta-online-menu-media');
 if(!sheet||!frame||!media)return false;
 video=frame.querySelector('video.gta-online-native-preview');
 if(video)return true;
 frame.querySelector('iframe')?.remove();
 video=document.createElement('video');video.className='gta-online-native-preview';
 video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.setAttribute('muted','');video.setAttribute('preload','metadata');video.setAttribute('controlsList','nodownload');
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;video.controls=false;video.dataset.src=VIDEO_URL;video.setAttribute('aria-hidden','true');
 video.addEventListener('loadeddata',()=>setReady(true));
 video.addEventListener('canplay',()=>setReady(true));
 video.addEventListener('playing',()=>{setReady(true);sheet?.classList.add('media-playing')});
 video.addEventListener('pause',()=>sheet?.classList.remove('media-playing'));
 video.addEventListener('error',()=>{setReady(false);sheet?.classList.remove('media-playing','media-loading')});
 frame.append(video);
 media.tabIndex=0;media.setAttribute('role','button');media.setAttribute('aria-label','Play or pause the GTA Online video preview');
 const toggle=()=>{if(!video)return;if(video.paused)startPreview(false);else video.pause()};
 media.addEventListener('click',toggle);
 media.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}});
 return true;
}

function startPreview(reset=true){
 if(!video||!sheet)return;
 clearTimeout(releaseTimer);sheet.classList.add('media-loading');
 if(!video.src){video.src=video.dataset.src||VIDEO_URL;video.load()}
 video.muted=true;if(reset){try{video.currentTime=0}catch{}}
 const play=video.play();play?.catch?.(()=>{sheet?.classList.remove('media-playing');if(video.readyState>=2)setReady(true)});
}
function releasePreview(){
 if(!video||wasOpen)return;try{video.pause()}catch{}try{video.currentTime=0}catch{}video.removeAttribute('src');try{video.load()}catch{}setReady(false);sheet?.classList.remove('media-playing','media-loading');
}
function stopPreview(){
 if(!video)return;try{video.pause()}catch{}try{video.currentTime=0}catch{}clearTimeout(releaseTimer);releaseTimer=setTimeout(releasePreview,4500);
}
function sync(){
 if(!sheet||!ensureVideo())return;
 const open=sheet.classList.contains('is-open')&&sheet.getAttribute('aria-hidden')!=='true';
 if(open&&!wasOpen)startPreview(true);if(!open&&wasOpen)stopPreview();wasOpen=open;
}
function attach(found){
 if(!found)return false;sheet=found;mountObserver?.disconnect();mountObserver=null;ensureVideo();sync();sheetObserver?.disconnect();sheetObserver=new MutationObserver(sync);sheetObserver.observe(sheet,{attributes:true,attributeFilter:['class','aria-hidden']});return true;
}
function boot(){
 if(attach(document.querySelector('.gta-online-menu-promo')))return;
 mountObserver=new MutationObserver(()=>{const found=document.querySelector('.gta-online-menu-promo');if(found)attach(found)});mountObserver.observe(document.body,{childList:true,subtree:true});setTimeout(()=>mountObserver?.disconnect(),7000);
}
boot();
window.addEventListener('pageshow',sync,{passive:true});
window.addEventListener('pagehide',()=>{clearTimeout(releaseTimer);mountObserver?.disconnect();sheetObserver?.disconnect();try{video?.pause()}catch{}},{once:true});
})();
