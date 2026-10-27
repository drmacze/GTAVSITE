/* User-provided GTA V trailer audio. Playback starts only after a user gesture. */
(()=>{
 if(document.body.dataset.page!=='home'||document.body.classList.contains('welcome-page')||!document.querySelector('.site-footer'))return;
 if(window.__gtavHomeMusicInitialized)return;
 window.__gtavHomeMusicInitialized=true;
 const css=document.createElement('link');css.rel='stylesheet';css.href='music.css?v=20261027elegant1';document.head.append(css);
 const note='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg>';
 const control=document.createElement('button');control.type='button';control.className='music-footer-control';control.innerHTML=note+'<span>Play music</span>';control.setAttribute('aria-pressed','false');document.querySelector('.site-footer nav').append(control);
 const background=document.querySelector('video');const player=background||new Audio('assets/trailer.mp4');if(!background){player.preload='none';player.loop=true;}
 let playing=false,busy=false;
 function update(){control.setAttribute('aria-pressed',String(playing));control.querySelector('span').textContent=playing?'Pause music':'Play music';}
 async function toggle(){if(busy)return;busy=true;try{if(playing){if(background)player.muted=true;else player.pause();playing=false;update();return;}
 player.muted=false;player.volume=.5;await player.play();playing=true;update();window.gtavHaptics?.trigger?.('soft');
 }catch{playing=false;update();}finally{busy=false;}}
 control.addEventListener('click',toggle);
 player.addEventListener('volumechange',()=>{playing=!player.paused&&!player.muted;update();});player.addEventListener('pause',()=>{playing=false;update();});player.addEventListener('play',()=>{playing=!player.muted;update();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(background)player.muted=true;else player.pause();playing=false;update();}});
 window.addEventListener('pagehide',()=>{player.pause();});
})();
