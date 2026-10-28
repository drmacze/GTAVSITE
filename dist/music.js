/* GTA V trailer audio. On Home, scrolling the cinematic intro is the playback gesture. */
(()=>{
 if(document.body.dataset.page!=='home'||document.body.classList.contains('welcome-page')||!document.querySelector('.site-footer'))return;
 if(window.__gtavHomeMusicInitialized)return;
 window.__gtavHomeMusicInitialized=true;
 const css=document.createElement('link');css.rel='stylesheet';css.href='music.css?v=20261029scrollmusic1';document.head.append(css);
 const note='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg>';
 const control=document.createElement('button');control.type='button';control.className='music-footer-control';control.innerHTML=note+'<span>Play music</span>';control.setAttribute('aria-pressed','false');document.querySelector('.site-footer nav').append(control);
 const background=document.querySelector('#hero-video')||document.querySelector('video');
 const player=background||new Audio('assets/trailer.mp4');
 if(!background){player.preload='auto';player.loop=true;player.load();}
 let playing=false,busy=false,gestureStartScroll=scrollY;

 function syncHeroSound(){
   const button=document.querySelector('#video-sound');
   if(!button)return;
   const on=playing;
   button.setAttribute('aria-label',on?'Mute background music':'Unmute background music');
   button.setAttribute('aria-pressed',String(on));
   const label=button.querySelector('span');if(label)label.textContent=on?'Sound on':'Sound off';
   const use=button.querySelector('use');if(use)use.setAttribute('href',`assets/icons.svg#${on?'volume':'volume-off'}`);
 }
 function update(){
   control.setAttribute('aria-pressed',String(playing));
   control.querySelector('span').textContent=playing?'Pause music':'Play music';
   syncHeroSound();
 }
 async function playMusic(){
   if(busy||playing)return playing;
   busy=true;
   try{
     player.muted=false;
     player.volume=.5;
     await player.play();
     playing=true;
     update();
     removeAutoGestureListeners();
     window.gtavHaptics?.trigger?.('soft');
     window.dispatchEvent(new CustomEvent('gtav:home-music-started'));
     return true;
   }catch{
     playing=false;
     update();
     return false;
   }finally{busy=false;}
 }
 function pauseMusic(){
   if(background)player.muted=true;else player.pause();
   playing=false;update();
 }
 async function toggle(){
   if(busy)return;
   if(playing){pauseMusic();return;}
   await playMusic();
 }

 // A completed scroll gesture is a reliable transient user activation on iOS Safari.
 // If media/config is not ready yet, listeners stay installed and retry on the next scroll gesture.
 const scrollKeys=new Set(['ArrowDown','PageDown',' ','Spacebar']);
 const markGesture=()=>{gestureStartScroll=scrollY};
 const finishGesture=()=>{
   if(document.body.classList.contains('home-chapter-locked'))return;
   if(Math.abs(scrollY-gestureStartScroll)>2)playMusic();
 };
 const wheelGesture=event=>{
   if(document.body.classList.contains('home-chapter-locked'))return;
   if(Math.abs(event.deltaY)>0)playMusic();
 };
 const keyGesture=event=>{
   if(document.body.classList.contains('home-chapter-locked'))return;
   if(scrollKeys.has(event.key))playMusic();
 };
 function addAutoGestureListeners(){
   addEventListener('touchstart',markGesture,{passive:true});
   addEventListener('touchend',finishGesture,{passive:true});
   addEventListener('pointerdown',markGesture,{passive:true});
   addEventListener('pointerup',finishGesture,{passive:true});
   addEventListener('wheel',wheelGesture,{passive:true});
   addEventListener('keydown',keyGesture);
 }
 function removeAutoGestureListeners(){
   removeEventListener('touchstart',markGesture);
   removeEventListener('touchend',finishGesture);
   removeEventListener('pointerdown',markGesture);
   removeEventListener('pointerup',finishGesture);
   removeEventListener('wheel',wheelGesture);
   removeEventListener('keydown',keyGesture);
 }

 control.addEventListener('click',toggle);
 player.addEventListener('volumechange',()=>{playing=!player.paused&&!player.muted;update();});
 player.addEventListener('pause',()=>{playing=false;update();});
 player.addEventListener('play',()=>{playing=!player.muted;update();});
 player.addEventListener('loadeddata',()=>{if(!playing&&scrollY>4&&!document.body.classList.contains('home-chapter-locked')){/* retry waits for a real gesture */}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseMusic();});
 window.addEventListener('pagehide',()=>{removeAutoGestureListeners();player.pause();},{once:true});
 window.gtavHomeMusic={play:playMusic,pause:pauseMusic,toggle,get playing(){return playing;}};
 addAutoGestureListeners();
 update();
})();
