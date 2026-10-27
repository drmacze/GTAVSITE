/* User-provided GTA V trailer audio. Playback starts only after a user gesture. */
(()=>{
 if(document.body.dataset.page!=='home'||document.body.classList.contains('welcome-page')||!document.querySelector('.site-footer'))return;
 if(window.__gtavHomeMusicInitialized)return;
 window.__gtavHomeMusicInitialized=true;
 const css=document.createElement('link');css.rel='stylesheet';css.href='music.css?v=20261027elegant1';document.head.append(css);
 const note='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg>';
 const play='<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 3.5v13l10-6.5z"/></svg>';
 const island=document.createElement('aside');island.className='music-island';island.hidden=true;island.setAttribute('aria-label','Background music');
 island.innerHTML=`<div class="music-mark">${note}</div><div class="music-copy"><strong>GTA V soundtrack</strong><span>Trailer ambience</span></div><button class="music-play" type="button" aria-label="Play background music">${play}<span>Play</span></button><button class="music-dismiss" type="button" aria-label="Dismiss music invitation"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg></button><div class="music-time" aria-hidden="true"><span></span></div>`;
 document.body.append(island);
 const control=document.createElement('button');control.type='button';control.className='music-footer-control';control.innerHTML=note+'<span>Play music</span>';control.setAttribute('aria-pressed','false');document.querySelector('.site-footer nav').append(control);
 const background=document.querySelector('video');const player=background||new Audio('assets/trailer.mp4');if(!background){player.preload='none';player.loop=true;}
 let playing=false,busy=false,shown=false,closed=false,last=performance.now(),remaining=12000,hovered=false;
 function dismiss(){if(closed)return;closed=true;island.classList.add('is-closing');setTimeout(()=>{island.hidden=true;},300);}
 function update(){control.setAttribute('aria-pressed',String(playing));control.querySelector('span').textContent=playing?'Pause music':'Play music';}
 async function toggle(){if(busy)return;busy=true;try{if(playing){if(background)player.muted=true;else player.pause();playing=false;update();return;}
 player.muted=false;player.volume=.5;await player.play();playing=true;update();window.gtavHaptics?.trigger?.('soft');dismiss();
 }catch{playing=false;update();island.querySelector('.music-copy strong').textContent='Audio unavailable';island.querySelector('.music-copy span').textContent='Tap Play to try again';}finally{busy=false;}}
 island.querySelector('.music-play').addEventListener('click',event=>{event.stopPropagation();toggle();});
 island.querySelector('.music-dismiss').addEventListener('click',event=>{event.stopPropagation();dismiss();});
 control.addEventListener('click',toggle);
 island.addEventListener('pointerenter',()=>hovered=true);island.addEventListener('pointerleave',()=>hovered=false);
 function blocked(){return document.hidden||!!document.querySelector('dialog[open]')||document.body.dataset.compatPhase==='scanning'||!!document.querySelector('#performance-check[data-step="checking"]');}
 const clock=setInterval(()=>{const now=performance.now(),elapsed=now-last;last=now;if(closed){clearInterval(clock);return;}if(!shown){if(!blocked()){shown=true;island.hidden=false;}return;}island.classList.toggle('is-obscured',blocked());if(blocked()||hovered||island.contains(document.activeElement))return;remaining-=elapsed;island.querySelector('.music-time span').style.transform=`scaleX(${Math.max(0,remaining/12000)})`;if(remaining<=0)dismiss();},100);
 player.addEventListener('volumechange',()=>{playing=!player.paused&&!player.muted;update();});player.addEventListener('pause',()=>{playing=false;update();});player.addEventListener('play',()=>{playing=!player.muted;update();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(background)player.muted=true;else player.pause();playing=false;update();}});
 window.addEventListener('pagehide',()=>{clearInterval(clock);player.pause();});
})();
