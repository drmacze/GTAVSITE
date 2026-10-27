/* Shared preferences are applied before paint; no scroll listeners or animation loop. */
(()=>{
 'use strict';
 const key='gtav-site-preferences',root=document.documentElement;
 const defaults={mode:'dark',theme:'launcher',color:'sun',haptics:false};
 const colors={sun:['Sandy Shores Sun','#FFD07A','#7b4b00'],green:['Blaine County Green','#4E6B3D','#38542b'],ocean:['Pacific Ocean','#1E3D59','#1E3D59'],grey:['Concrete Grey','#B2B1A9','#55554e'],night:['Los Santos Night','#1A1B1F','#1A1B1F']};
 let prefs={...defaults};
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved){if(['dark','light'].includes(saved.mode))prefs.mode=saved.mode;if(['launcher','gtav'].includes(saved.theme))prefs.theme=saved.theme;if(colors[saved.color])prefs.color=saved.color;prefs.haptics=saved.haptics===true;}}catch{}
 function apply(){
  root.dataset.mode=prefs.mode;root.dataset.theme=prefs.theme;
  const c=colors[prefs.color], light=prefs.mode==='light';
  const accent=prefs.theme==='launcher'?(light?'#805000':'#e8b65e'):(light?c[2]:({green:'#a6c88b',ocean:'#8fbddd',night:'#b0b5c8'}[prefs.color]||c[1]));
  root.style.setProperty('--site-accent',accent);root.style.setProperty('--palette-color',prefs.theme==='launcher'?'#e8b65e':c[1]);
  root.style.colorScheme=prefs.mode;
 }
 apply();
 const svg=(paths)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
 const icons={settings:svg('<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="var(--settings-bg)"/><circle cx="16" cy="17" r="3" fill="var(--settings-bg)"/>'),sun:svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'),moon:svg('<path d="M20 14A8.5 8.5 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z"/>'),launcher:svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16m0-11h13"/>'),gtav:svg('<path d="m4 5 8 15 8-15h-5l-3 7-3-7Z"/>'),haptic:svg('<rect x="8" y="4" width="8" height="16" rx="2"/><path d="m4 8-2 4 2 4m16-8 2 4-2 4M11 17h2"/>'),close:svg('<path d="m6 6 12 12M18 6 6 18"/>')};
 const supported=typeof navigator.vibrate==='function';let lastPulse=0;
 function pulse(){if(!prefs.haptics||!supported||Date.now()-lastPulse<90)return;lastPulse=Date.now();try{navigator.vibrate(12);}catch{}}
 function init(){
  if(!document.querySelector('.site-header'))return;
  const button=document.createElement('button');button.type='button';button.className='settings-trigger';button.setAttribute('aria-label','Open settings');button.setAttribute('aria-haspopup','dialog');button.innerHTML=icons.settings;
  document.querySelector('.header-actions')?.insertBefore(button,document.querySelector('.menu-toggle'));
  const dialog=document.createElement('dialog');dialog.className='site-settings';dialog.id='site-settings';dialog.setAttribute('aria-labelledby','settings-title');
  dialog.innerHTML=`<div class="settings-heading"><div><span class="settings-kicker">MAKE IT YOURS</span><h2 id="settings-title">Settings</h2></div><button type="button" class="settings-close" aria-label="Close settings">${icons.close}</button></div><p class="settings-intro">Your website, your preferences.</p><fieldset><legend>Appearance</legend><div class="settings-segment">${['dark','light'].map(v=>`<button type="button" data-mode-choice="${v}" aria-pressed="false">${icons[v==='dark'?'moon':'sun']}${v==='dark'?'Dark':'Light'}</button>`).join('')}</div></fieldset><fieldset><legend>Theme</legend><div class="settings-segment">${['launcher','gtav'].map(v=>`<button type="button" data-theme-choice="${v}" aria-pressed="false">${icons[v]}${v==='launcher'?'Launcher':'GTA V'}</button>`).join('')}</div><p class="settings-help">Launcher gold or a palette inspired by Los Santos.</p></fieldset><fieldset id="settings-palette"><legend>GTA V colour</legend><div class="settings-swatches">${Object.entries(colors).map(([id,c])=>`<button type="button" data-color-choice="${id}" aria-label="${c[0]}" aria-pressed="false" style="--swatch:${c[1]}"><span></span></button>`).join('')}</div><p class="settings-color-label"></p></fieldset><div class="settings-haptic"><div class="settings-haptic-label">${icons.haptic}<div><h3 id="haptic-label">Haptic feedback</h3><p id="haptic-help">${supported?'A subtle vibration when you interact.':'Not available in this browser. Safari on iPhone does not support web vibration.'}</p></div></div><button type="button" class="settings-switch" role="switch" aria-checked="false" aria-labelledby="haptic-label" aria-describedby="haptic-help"><span></span></button></div><div class="settings-preview"><span></span><div>GTA V <small>iOS COMMUNITY</small></div><b>Preview</b></div><p class="settings-saved" role="status" aria-live="polite">Preferences are saved on this browser.</p>`;
  document.body.append(dialog);
  let opener;function open(e){opener=e.currentTarget;dialog.showModal();document.body.classList.add('settings-open');}
  function close(){dialog.close();}
  button.addEventListener('click',open);dialog.querySelector('.settings-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>{document.body.classList.remove('settings-open');opener?.focus();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  const menu=document.querySelector('.menu-bottom');if(menu){const link=document.createElement('button');link.type='button';link.className='settings-menu-link';link.innerHTML=icons.settings+'Settings';link.addEventListener('click',e=>{document.querySelector('#site-menu')?.close();document.body.classList.remove('menu-open');document.querySelector('.menu-toggle')?.setAttribute('aria-expanded','false');open(e);});menu.append(link);}
  function sync(){['mode','theme','color'].forEach(k=>dialog.querySelectorAll(`[data-${k}-choice]`).forEach(b=>b.setAttribute('aria-pressed',String(prefs[k]===b.dataset[k+'Choice']))));dialog.querySelector('#settings-palette').hidden=prefs.theme!=='gtav';dialog.querySelector('.settings-color-label').textContent=colors[prefs.color][0];dialog.querySelector('.settings-switch').setAttribute('aria-checked',String(prefs.haptics));}
  function save(){apply();sync();try{localStorage.setItem(key,JSON.stringify(prefs));dialog.querySelector('.settings-saved').textContent='Preferences saved.';}catch{dialog.querySelector('.settings-saved').textContent='Applied for this visit. Browser storage is unavailable.';}}
  dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;for(const k of ['mode','theme','color']){if(b.dataset[k+'Choice']){prefs[k]=b.dataset[k+'Choice'];save();}}if(b.classList.contains('settings-switch')){prefs.haptics=!prefs.haptics;save();pulse();}});
  document.addEventListener('click',e=>{if(e.isTrusted&&e.target.closest('button,a,summary,input[type=radio],input[type=checkbox]'))pulse();});
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{const next=JSON.parse(e.newValue);if(next&&['light','dark'].includes(next.mode)&&['gtav','launcher'].includes(next.theme)&&colors[next.color]){prefs={...next,haptics:next.haptics===true};apply();sync();}}catch{}});
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
