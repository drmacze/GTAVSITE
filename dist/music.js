/* Home trailer media controller: video playback stays available, audio is permanently disabled. */
(()=>{
 'use strict';
 if(document.body.dataset.page!=='home'||document.body.classList.contains('welcome-page')||!document.querySelector('.site-footer'))return;
 if(window.__gtavHomeMusicInitialized)return;
 window.__gtavHomeMusicInitialized=true;

 const video=document.querySelector('#hero-video');
 if(!video)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let manualPause=false;
 let recoveryTimer=0;

 function disableSoundControls(){
   document.querySelectorAll('.music-footer-control').forEach(control=>control.remove());
   const button=document.querySelector('#video-sound');
   if(!button)return;
   button.disabled=true;
   button.hidden=true;
   button.setAttribute('aria-hidden','true');
   button.setAttribute('aria-pressed','false');
   button.setAttribute('aria-label','Background video audio disabled');
   button.setAttribute('title','Background video audio is permanently disabled');
   button.style.setProperty('display','none','important');
   const label=button.querySelector('span');if(label)label.textContent='Sound disabled';
   const use=button.querySelector('use');if(use)use.setAttribute('href','assets/icons.svg#volume-off');
 }

 function enforceMute(){
   video.defaultMuted=true;
   video.muted=true;
   if(video.volume!==0)video.volume=0;
   video.setAttribute('muted','');
   disableSoundControls();
 }

 function primeVideo(){
   if(!video.getAttribute('src'))video.src='assets/trailer.mp4';
   if(!video.poster)video.poster='assets/los-santos-background.jpeg';
   video.hidden=false;
   video.loop=true;
   video.playsInline=true;
   video.setAttribute('playsinline','');
   video.preload='auto';
   enforceMute();
 }

 async function ensureVideoPlaying(){
   if(document.hidden||reduced.matches||manualPause)return false;
   primeVideo();
   try{await video.play();enforceMute();return true}catch{enforceMute();return false}
 }

 function recoverPlayback(delay=180){
   if(recoveryTimer||document.hidden||manualPause||reduced.matches)return;
   recoveryTimer=setTimeout(async()=>{
     recoveryTimer=0;
     primeVideo();
     await ensureVideoPlaying();
     enforceMute();
   },delay);
 }

 const blockSoundActivation=event=>{
   event.preventDefault();
   event.stopImmediatePropagation();
   enforceMute();
 };
 const soundButton=document.querySelector('#video-sound');
 soundButton?.addEventListener('click',blockSoundActivation,{capture:true});
 soundButton?.addEventListener('pointerdown',blockSoundActivation,{capture:true});
 soundButton?.addEventListener('touchstart',blockSoundActivation,{capture:true,passive:false});

 const playButton=document.querySelector('#video-play');
 playButton?.addEventListener('click',()=>{
   manualPause=!video.paused;
   if(!manualPause)recoverPlayback(0);
   enforceMute();
 },{capture:true});

 for(const eventName of ['loadedmetadata','loadeddata','canplay','playing','play','volumechange']){
   video.addEventListener(eventName,enforceMute);
 }
 video.addEventListener('pause',()=>{enforceMute();if(!document.hidden&&!manualPause)recoverPlayback(220)});
 video.addEventListener('waiting',()=>recoverPlayback(280));
 video.addEventListener('stalled',()=>recoverPlayback(420));
 video.addEventListener('error',enforceMute);
 document.addEventListener('visibilitychange',()=>{
   enforceMute();
   if(document.hidden){if(recoveryTimer){clearTimeout(recoveryTimer);recoveryTimer=0}return}
   recoverPlayback(20);
 });
 addEventListener('pageshow',()=>{enforceMute();recoverPlayback(20)});
 reduced.addEventListener?.('change',event=>{
   enforceMute();
   if(event.matches)video.pause();else{manualPause=false;recoverPlayback(0)}
 });

 const attrObserver=new MutationObserver(()=>{
   if(video.preload!=='auto')video.preload='auto';
   if(video.hidden)video.hidden=false;
   enforceMute();
 });
 attrObserver.observe(video,{attributes:true,attributeFilter:['src','preload','hidden','muted']});
 const bodyObserver=new MutationObserver(disableSoundControls);
 bodyObserver.observe(document.body,{childList:true,subtree:true});

 addEventListener('pagehide',()=>{
   attrObserver.disconnect();
   bodyObserver.disconnect();
   if(recoveryTimer)clearTimeout(recoveryTimer);
 },{once:true});

 window.gtavHomeMusic={
   play:async()=>{enforceMute();return ensureVideoPlaying()},
   pause:()=>{enforceMute();return false},
   toggle:()=>{enforceMute();return false},
   get playing(){return false},
   get mutedByUser(){return true},
   get permanentlyMuted(){return true}
 };

 primeVideo();
 disableSoundControls();
 if(!reduced.matches){try{video.load()}catch{}ensureVideoPlaying()}
})();
