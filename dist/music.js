/* Original, browser-synthesized ambient accompaniment. No external audio or tracking. */
(()=>{
 if(document.body.classList.contains('welcome-page')||!document.querySelector('.site-footer'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='music.css';document.head.append(css);
 const note='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg>';
 const play='<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 3.5v13l10-6.5z"/></svg>';
 const island=document.createElement('aside');island.className='music-island';island.hidden=true;island.setAttribute('aria-label','Background music');
 island.innerHTML=`<div class="music-mark">${note}</div><div class="music-copy"><strong>Set the atmosphere</strong><span>Ambient music · Optional</span></div><button class="music-play" type="button">${play}<span>Play music</span></button><button class="music-dismiss" type="button" aria-label="Dismiss music invitation"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg></button><div class="music-time" aria-hidden="true"><span></span></div>`;
 document.body.append(island);
 const control=document.createElement('button');control.type='button';control.className='music-footer-control';control.innerHTML=note+'<span>Play music</span>';control.setAttribute('aria-pressed','false');document.querySelector('.site-footer nav').append(control);
 let context=null,master=null,timer=null,playing=false,busy=false,shown=false,closed=false,last=performance.now(),remaining=12000,hovered=false;
 const midi=n=>440*Math.pow(2,(n-69)/12);
 function voice(freq,time,duration,gain){const osc=context.createOscillator(),amp=context.createGain();osc.type='sine';osc.frequency.value=freq;amp.gain.setValueAtTime(0,time);amp.gain.linearRampToValueAtTime(gain,time+1.2);amp.gain.setTargetAtTime(.0001,time+duration-2,.7);osc.connect(amp);amp.connect(master);osc.start(time);osc.stop(time+duration);osc.onended=()=>{osc.disconnect();amp.disconnect();};}
 let chord=0;const chords=[[45,52,60,64],[41,48,57,60],[48,55,62,64],[43,50,59,62]];
 function schedule(){if(!playing||!context)return;const start=context.currentTime+.05;const notes=chords[chord++%chords.length];notes.forEach((n,i)=>voice(midi(n),start+i*.12,9,i===0?.12:.065));voice(midi(notes[2]+12),start+3,5,.035);timer=setTimeout(schedule,7500);}
 function dismiss(){if(closed)return;closed=true;island.classList.add('is-closing');setTimeout(()=>{island.hidden=true;},450);}
 function update(){control.setAttribute('aria-pressed',String(playing));control.querySelector('span').textContent=playing?'Pause music':'Play music';}
 async function toggle(){if(busy)return;busy=true;try{if(playing){playing=false;clearTimeout(timer);if(master){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,.1);}const old=context;context=null;master=null;setTimeout(()=>old?.close().catch(()=>{}),500);update();return;}
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio unavailable');context=new Audio();await context.resume();if(context.state!=='running')throw Error('Audio permission required');master=context.createGain();master.gain.value=0;master.connect(context.destination);master.gain.linearRampToValueAtTime(.38,context.currentTime+1.6);playing=true;schedule();update();dismiss();
 }catch{if(context)context.close().catch(()=>{});context=null;playing=false;island.querySelector('.music-copy strong').textContent='Music could not start';island.querySelector('.music-copy span').textContent='Try Play music again';}finally{busy=false;}}
 island.querySelector('.music-play').addEventListener('click',event=>{event.stopPropagation();toggle();});island.querySelector('.music-dismiss').addEventListener('click',dismiss);island.addEventListener('click',event=>{if(!event.target.closest('.music-play'))dismiss();});control.addEventListener('click',toggle);
 island.addEventListener('pointerenter',()=>hovered=true);island.addEventListener('pointerleave',()=>hovered=false);
 function blocked(){return document.hidden||!!document.querySelector('dialog[open],.community-toast')||document.body.dataset.compatPhase==='scanning'||!!document.querySelector('#performance-check[data-step="checking"]');}
 const clock=setInterval(()=>{const now=performance.now(),elapsed=now-last;last=now;if(closed){clearInterval(clock);return;}if(!shown){if(!blocked()){shown=true;island.hidden=false;}return;}island.classList.toggle('is-obscured',blocked());if(blocked()||hovered||island.contains(document.activeElement))return;remaining-=elapsed;island.querySelector('.music-time span').style.transform=`scaleX(${Math.max(0,remaining/12000)})`;if(remaining<=0)dismiss();},100);
 document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden){clearTimeout(timer);context.suspend().catch(()=>{});}else if(playing){context.resume().catch(()=>{});timer=setTimeout(schedule,7500);}});
 // Keep a playing trailer and the accompaniment from competing for audio.
 document.addEventListener('play',event=>{if(event.target instanceof HTMLVideoElement&&!event.target.muted&&playing)toggle();},true);
 document.addEventListener('volumechange',event=>{if(event.target instanceof HTMLVideoElement&&!event.target.muted&&!event.target.paused&&playing)toggle();},true);
 window.addEventListener('pagehide',()=>{clearTimeout(timer);clearInterval(clock);context?.close().catch(()=>{});});
})();
