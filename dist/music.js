/* Lightweight permanent mute guard. Keeps Home loading/playback logic untouched. */
(()=>{
 'use strict';
 if(document.body.dataset.page!=='home'||document.body.classList.contains('welcome-page'))return;
 if(window.__gtavHomeMusicInitialized)return;
 window.__gtavHomeMusicInitialized=true;

 const video=document.querySelector('#hero-video');
 const soundButton=document.querySelector('#video-sound');

 function hideSoundUi(){
   document.querySelectorAll('.music-footer-control').forEach(el=>el.remove());
   if(!soundButton)return;
   soundButton.hidden=true;
   soundButton.disabled=true;
   soundButton.setAttribute('aria-hidden','true');
   soundButton.setAttribute('aria-pressed','false');
   soundButton.setAttribute('tabindex','-1');
   soundButton.style.setProperty('display','none','important');
 }

 function enforceMute(){
   if(video){
     video.defaultMuted=true;
     if(!video.muted)video.muted=true;
     if(video.volume!==0)video.volume=0;
     video.setAttribute('muted','');
   }
   hideSoundUi();
 }

 enforceMute();

 if(video){
   ['loadedmetadata','loadeddata','canplay','play','playing','volumechange'].forEach(type=>{
     video.addEventListener(type,enforceMute,{passive:true});
   });
 }

 document.addEventListener('visibilitychange',enforceMute,{passive:true});
 window.addEventListener('pageshow',enforceMute,{passive:true});

 window.gtavHomeMusic={
   play:()=>{enforceMute();return false},
   pause:()=>{enforceMute();return false},
   toggle:()=>{enforceMute();return false},
   get playing(){return false},
   get mutedByUser(){return true},
   get permanentlyMuted(){return true}
 };
})();
