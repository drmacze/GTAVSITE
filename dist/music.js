/* Home trailer media controller: stable video playback + iOS-safe sound activation from a real gesture. */
(()=>{
 'use strict';
 if(document.body.dataset.page!=='home'||document.body.classList.contains('welcome-page')||!document.querySelector('.site-footer'))return;
 if(window.__gtavHomeMusicInitialized)return;
 window.__gtavHomeMusicInitialized=true;

 const css=document.createElement('link');css.rel='stylesheet';css.href='music.css?v=20261029media4';document.head.append(css);
 const note='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg>';
 const control=document.createElement('button');
 control.type='button';control.className='music-footer-control';control.innerHTML=note+'<span>Play music</span>';control.setAttribute('aria-pressed','false');
 document.querySelector('.site-footer nav')?.append(control);

 const video=document.querySelector('#hero-video');
 if(!video)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let soundWanted=false;
 let soundOn=false;
 let userMuted=false;
 let mediaBusy=false;
 let manualPause=false;
 let recoveryTimer=0;
 let touchStartY=null;
 let touchStartScroll=scrollY;
 let gesturesBound=false;

 function primeVideo(){
   if(!video.getAttribute('src'))video.src='assets/trailer.mp4';
   if(!video.poster)video.poster='assets/los-santos-background.jpeg';
   video.hidden=false;video.loop=true;video.playsInline=true;video.setAttribute('playsinline','');video.preload='auto';
   if(!soundWanted||userMuted){video.muted=true;video.defaultMuted=true;}
 }

 function syncControls(){
   const heroButton=document.querySelector('#video-sound');
   soundOn=!video.paused&&!video.muted&&video.volume>0;
   if(control){
     control.setAttribute('aria-pressed',String(soundOn));
     const label=control.querySelector('span');if(label)label.textContent=soundOn?'Pause music':'Play music';
   }
   if(heroButton){
     heroButton.setAttribute('aria-label',soundOn?'Mute background sound':'Turn on background sound');
     heroButton.setAttribute('title',soundOn?'Mute sound':'Turn on sound');
     heroButton.setAttribute('aria-pressed',String(soundOn));
     const label=heroButton.querySelector('span');if(label)label.textContent=soundOn?'Sound on':'Sound off';
     const use=heroButton.querySelector('use');if(use)use.setAttribute('href',`assets/icons.svg#${soundOn?'volume':'volume-off'}`);
   }
 }

 async function ensureVideoPlaying(){
   if(document.hidden||reduced.matches||manualPause)return false;
   primeVideo();
   try{await video.play();return true}catch{return false}
 }

 async function enableSoundFromGesture({manual=false}={}){
   if(userMuted&&!manual)return false;
   if(soundOn)return true;
   if(mediaBusy)return false;
   if(manual)userMuted=false;
   mediaBusy=true;soundWanted=true;
   try{
     primeVideo();
     video.defaultMuted=false;video.muted=false;video.volume=.55;
     await video.play();
     if(video.paused||video.muted)throw new Error('audio_not_active');
     soundOn=true;syncControls();removeAutoGestureListeners();
     window.gtavHaptics?.trigger?.('soft');
     window.dispatchEvent(new CustomEvent('gtav:home-music-started'));
     return true;
   }catch{
     soundWanted=false;soundOn=false;video.muted=true;video.defaultMuted=true;
     if(video.paused&&!manualPause)await ensureVideoPlaying();
     syncControls();
     if(!userMuted)addAutoGestureListeners();
     return false;
   }finally{mediaBusy=false}
 }

 function muteSound({manual=true}={}){
   if(manual)userMuted=true;
   soundWanted=false;video.muted=true;video.defaultMuted=true;soundOn=false;
   removeAutoGestureListeners();
   syncControls();
 }

 async function toggle(){
   if(soundOn){muteSound({manual:true});return}
   await enableSoundFromGesture({manual:true});
 }

 function recoverPlayback(delay=180){
   if(recoveryTimer||document.hidden||manualPause||reduced.matches)return;
   recoveryTimer=setTimeout(async()=>{
     recoveryTimer=0;primeVideo();
     if(soundWanted&&!userMuted){video.defaultMuted=false;video.muted=false;video.volume=.55}
     let ok=await ensureVideoPlaying();
     if(!ok&&soundWanted&&!userMuted){
       video.muted=true;video.defaultMuted=true;ok=await ensureVideoPlaying();soundOn=false;
       if(!userMuted)addAutoGestureListeners();
     }
     if(userMuted){video.muted=true;video.defaultMuted=true;soundWanted=false;soundOn=false}
     syncControls();
   },delay);
 }

 function beginTouchGesture(event){
   if(userMuted)return;
   const point=event.touches?.[0];touchStartY=point?point.clientY:null;touchStartScroll=scrollY;primeVideo();
   if(video.readyState===0)try{video.load()}catch{}
 }
 function finishTouchGesture(event){
   if(userMuted)return;
   const point=event.changedTouches?.[0];
   const movedByFinger=touchStartY!==null&&point?Math.abs(point.clientY-touchStartY):0;
   const movedByPage=Math.abs(scrollY-touchStartScroll);touchStartY=null;
   if(movedByFinger>6||movedByPage>2)enableSoundFromGesture();
 }
 function wheelGesture(event){if(!userMuted&&Math.abs(event.deltaY)>0)enableSoundFromGesture()}
 function keyGesture(event){if(!userMuted&&['ArrowDown','PageDown',' ','Spacebar'].includes(event.key))enableSoundFromGesture()}
 function pointerGesture(event){if(!userMuted&&event.pointerType==='mouse'&&event.isPrimary)enableSoundFromGesture()}
 function addAutoGestureListeners(){
   if(gesturesBound||soundOn||userMuted)return;
   gesturesBound=true;
   addEventListener('touchstart',beginTouchGesture,{passive:true,capture:true});
   addEventListener('touchend',finishTouchGesture,{passive:true,capture:true});
   addEventListener('wheel',wheelGesture,{passive:true,capture:true});
   addEventListener('keydown',keyGesture,{capture:true});
   addEventListener('pointerup',pointerGesture,{passive:true,capture:true});
 }
 function removeAutoGestureListeners(){
   if(!gesturesBound)return;gesturesBound=false;
   removeEventListener('touchstart',beginTouchGesture,true);removeEventListener('touchend',finishTouchGesture,true);
   removeEventListener('wheel',wheelGesture,true);removeEventListener('keydown',keyGesture,true);removeEventListener('pointerup',pointerGesture,true);
 }

 const playButton=document.querySelector('#video-play');
 const heroButton=document.querySelector('#video-sound');
 playButton?.addEventListener('click',()=>{manualPause=!video.paused;if(!manualPause)recoverPlayback(0)},{capture:true});
 control?.addEventListener('click',toggle);
 heroButton?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();toggle()});

 video.addEventListener('loadedmetadata',()=>{video.preload='auto';recoverPlayback(0)});
 video.addEventListener('canplay',()=>recoverPlayback(0));
 video.addEventListener('playing',()=>{manualPause=false;syncControls()});
 video.addEventListener('volumechange',()=>{if(userMuted&&!video.muted){video.muted=true;video.defaultMuted=true}syncControls()});
 video.addEventListener('pause',()=>{syncControls();if(!document.hidden&&!manualPause)recoverPlayback(220)});
 video.addEventListener('waiting',()=>recoverPlayback(280));
 video.addEventListener('stalled',()=>recoverPlayback(420));
 video.addEventListener('error',()=>{soundOn=false;soundWanted=false;syncControls();if(!userMuted)addAutoGestureListeners()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(recoveryTimer){clearTimeout(recoveryTimer);recoveryTimer=0}return}recoverPlayback(20)});
 addEventListener('pageshow',()=>recoverPlayback(20));
 reduced.addEventListener?.('change',event=>{if(event.matches){video.pause()}else{manualPause=false;recoverPlayback(0)}});
 const attrObserver=new MutationObserver(()=>{if(video.preload!=='auto')video.preload='auto';if(video.hidden)video.hidden=false;if(soundWanted&&!userMuted&&!video.muted)recoverPlayback(0)});
 attrObserver.observe(video,{attributes:true,attributeFilter:['src','preload','hidden']});
 addEventListener('pagehide',()=>{removeAutoGestureListeners();attrObserver.disconnect();if(recoveryTimer)clearTimeout(recoveryTimer)},{once:true});
 window.gtavHomeMusic={play:()=>enableSoundFromGesture({manual:true}),pause:()=>muteSound({manual:true}),toggle,get playing(){return soundOn},get mutedByUser(){return userMuted}};
 primeVideo();if(!reduced.matches){try{video.load()}catch{}ensureVideoPlaying()}addAutoGestureListeners();syncControls();
})();
