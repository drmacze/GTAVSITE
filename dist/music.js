/* Home trailer media controller: start video early, keep it stable, enable sound from a real scroll gesture. */
(()=>{
 'use strict';
 if(document.body.dataset.page!=='home'||document.body.classList.contains('welcome-page')||!document.querySelector('.site-footer'))return;
 if(window.__gtavHomeMusicInitialized)return;
 window.__gtavHomeMusicInitialized=true;

 const css=document.createElement('link');css.rel='stylesheet';css.href='music.css?v=20261029media2';document.head.append(css);
 const note='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg>';
 const control=document.createElement('button');
 control.type='button';control.className='music-footer-control';control.innerHTML=note+'<span>Play music</span>';control.setAttribute('aria-pressed','false');
 document.querySelector('.site-footer nav')?.append(control);

 const video=document.querySelector('#hero-video');
 if(!video)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let soundWanted=false;
 let soundOn=false;
 let mediaBusy=false;
 let manualPause=false;
 let recoveryTimer=0;

 function primeVideo(){
   if(!video.getAttribute('src'))video.src='assets/trailer.mp4';
   if(!video.poster)video.poster='assets/los-santos-background.jpeg';
   video.hidden=false;
   video.loop=true;
   video.playsInline=true;
   video.setAttribute('playsinline','');
   video.preload='auto';
   if(!soundWanted){video.muted=true;video.defaultMuted=true;}
 }

 function syncControls(){
   const heroButton=document.querySelector('#video-sound');
   soundOn=!video.paused&&!video.muted;
   if(control){
     control.setAttribute('aria-pressed',String(soundOn));
     const label=control.querySelector('span');if(label)label.textContent=soundOn?'Pause music':'Play music';
   }
   if(heroButton){
     heroButton.setAttribute('aria-label',soundOn?'Mute background music':'Unmute background music');
     heroButton.setAttribute('aria-pressed',String(soundOn));
     const label=heroButton.querySelector('span');if(label)label.textContent=soundOn?'Sound on':'Sound off';
     const use=heroButton.querySelector('use');if(use)use.setAttribute('href',`assets/icons.svg#${soundOn?'volume':'volume-off'}`);
   }
 }

 async function ensureVideoPlaying(){
   if(document.hidden||reduced.matches||manualPause)return false;
   primeVideo();
   try{
     await video.play();
     return true;
   }catch{return false;}
 }

 async function enableSoundFromGesture(){
   if(mediaBusy||soundOn)return soundOn;
   mediaBusy=true;
   soundWanted=true;
   try{
     primeVideo();
     video.defaultMuted=false;
     video.muted=false;
     video.volume=.5;
     await video.play();
     soundOn=true;
     syncControls();
     removeAutoGestureListeners();
     window.gtavHaptics?.trigger?.('soft');
     window.dispatchEvent(new CustomEvent('gtav:home-music-started'));
     return true;
   }catch{
     /* Keep the listener armed. The next real gesture retries after buffering/source setup. */
     soundOn=false;
     if(video.paused&&!manualPause){video.muted=true;await ensureVideoPlaying();}
     syncControls();
     return false;
   }finally{mediaBusy=false;}
 }

 function muteSound(){
   soundWanted=false;
   video.muted=true;
   soundOn=false;
   syncControls();
   addAutoGestureListeners();
 }

 async function toggle(){
   if(soundOn){muteSound();return;}
   await enableSoundFromGesture();
 }

 function recoverPlayback(delay=220){
   if(recoveryTimer||document.hidden||manualPause||reduced.matches)return;
   recoveryTimer=setTimeout(async()=>{
     recoveryTimer=0;
     const wasMuted=video.muted;
     await ensureVideoPlaying();
     if(soundWanted&&!wasMuted)video.muted=false;
     syncControls();
   },delay);
 }

 const onScrollGesture=()=>{
   if(document.body.classList.contains('home-chapter-locked')&&soundOn)return;
   enableSoundFromGesture();
 };
 const wheelGesture=event=>{if(Math.abs(event.deltaY)>0)onScrollGesture();};
 const keyGesture=event=>{if(['ArrowDown','PageDown',' ','Spacebar'].includes(event.key))onScrollGesture();};
 let gesturesBound=false;
 function addAutoGestureListeners(){
   if(gesturesBound||soundOn)return;
   gesturesBound=true;
   addEventListener('touchmove',onScrollGesture,{passive:true});
   addEventListener('pointerup',onScrollGesture,{passive:true});
   addEventListener('wheel',wheelGesture,{passive:true});
   addEventListener('keydown',keyGesture);
 }
 function removeAutoGestureListeners(){
   if(!gesturesBound)return;
   gesturesBound=false;
   removeEventListener('touchmove',onScrollGesture);
   removeEventListener('pointerup',onScrollGesture);
   removeEventListener('wheel',wheelGesture);
   removeEventListener('keydown',keyGesture);
 }

 const playButton=document.querySelector('#video-play');
 playButton?.addEventListener('click',()=>{manualPause=!video.paused; if(!manualPause)recoverPlayback(0);},{capture:true});
 control?.addEventListener('click',toggle);

 video.addEventListener('loadedmetadata',()=>{video.preload='auto';recoverPlayback(0);});
 video.addEventListener('canplay',()=>recoverPlayback(0));
 video.addEventListener('playing',()=>{manualPause=false;syncControls();});
 video.addEventListener('volumechange',syncControls);
 video.addEventListener('pause',()=>{syncControls();if(!document.hidden&&!manualPause)recoverPlayback(280);});
 video.addEventListener('waiting',()=>recoverPlayback(360));
 video.addEventListener('stalled',()=>recoverPlayback(520));
 video.addEventListener('error',()=>{soundOn=false;syncControls();});

 document.addEventListener('visibilitychange',()=>{
   if(document.hidden){if(recoveryTimer){clearTimeout(recoveryTimer);recoveryTimer=0;}return;}
   recoverPlayback(40);
 });
 addEventListener('pageshow',()=>recoverPlayback(40));
 reduced.addEventListener?.('change',event=>{if(event.matches){video.pause();}else{manualPause=false;recoverPlayback(0);}});

 const attrObserver=new MutationObserver(()=>{
   if(video.preload!=='auto')video.preload='auto';
   if(video.hidden)video.hidden=false;
 });
 attrObserver.observe(video,{attributes:true,attributeFilter:['src','preload','hidden']});

 addEventListener('pagehide',()=>{
   removeAutoGestureListeners();
   attrObserver.disconnect();
   if(recoveryTimer)clearTimeout(recoveryTimer);
 },{once:true});

 window.gtavHomeMusic={play:enableSoundFromGesture,pause:muteSound,toggle,get playing(){return soundOn;}};

 primeVideo();
 if(!reduced.matches){video.load();ensureVideoPlaying();}
 addAutoGestureListeners();
 syncControls();
})();
