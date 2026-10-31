(()=>{
'use strict';
if(window.__release30ModsV1||document.body?.dataset.page!=='downloads')return;
window.__release30ModsV1=true;
const DISCORD='https://discord.gg/HgcbPjcyJ';

function mount(){
 const main=document.querySelector('.mods-studio');
 const languages=main?.querySelector('.mods-languages');
 if(!main||!languages)return false;
 if(!main.querySelector('.mods-release30')){
  const section=document.createElement('section');
  section.className='mods-dlc mods-release30';
  section.setAttribute('aria-labelledby','release30-mods-title');
  section.innerHTML=`
   <header class="dlc-heading">
    <span class="eyebrow">30 OCT ADDITIONS</span>
    <div>
     <h2 id="release30-mods-title">New community packs,<br>built for the launcher.</h2>
     <p>Import these through <strong>MODS › IMPORT MOD</strong>. The 30 Oct launcher also raises the add-on limit to 256 packs and adds full mod descriptions.</p>
    </div>
   </header>
   <div class="dlc-list">
    <details class="dlc-pack">
     <summary>
      <span class="dlc-index">02</span>
      <span class="dlc-identity"><strong>Community Mod Pack 2</strong><small>Physics + world improvements</small></span>
      <span class="dlc-summary-stats"><span><b>3</b> included mods</span></span>
      <svg class="icon dlc-chevron" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg>
     </summary>
     <div class="dlc-content">
      <ul class="release30-mod-list"><li>W.E.R.O. ragdolls</li><li>Forests of San Andreas</li><li>GTA 5 World Improvement</li></ul>
      <a class="dlc-download discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer"><span>Get from release post</span><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></a>
     </div>
    </details>
    <details class="dlc-pack">
     <summary>
      <span class="dlc-index">03</span>
      <span class="dlc-identity"><strong>Community Mod Pack 3</strong><small>Visuals + traffic + readability</small></span>
      <span class="dlc-summary-stats"><span><b>5</b> improvements</span></span>
      <svg class="icon dlc-chevron" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg>
     </summary>
     <div class="dlc-content">
      <ul class="release30-mod-list"><li>QuantV iOS</li><li>Sharper car textures</li><li>Fuller roadside bushes</li><li>Bigger subtitles</li><li>GTA Online cars in traffic</li></ul>
      <p class="release30-mod-note">Use one graphics overhaul at a time. QuantV and the sharper car textures are intended for 6 GB devices. GTA Online cars in traffic require the matching DLC packs.</p>
      <a class="dlc-download discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer"><span>Get from release post</span><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></a>
     </div>
    </details>
   </div>`;
  languages.before(section);
 }
 const picker=main.querySelector('.language-picker');
 if(picker&&!picker.querySelector('[data-language-hu]')){
  const hint=picker.querySelector('.language-hint');if(hint)hint.textContent='6 packs available';
  const options=picker.querySelector('.language-options');
  if(options){
   const a=document.createElement('a');
   a.className='language-option discord-link';a.dataset.languageHu='true';a.href=DISCORD;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Open Discord for the Hungarian language pack');
   a.innerHTML='<span class="language-abbr">HU</span><span class="language-name">Hungarian</span><span class="language-action">Release post <svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></span>';
   options.append(a);
  }
 }
 if(!document.getElementById('release30-mods-style')){
  const style=document.createElement('style');style.id='release30-mods-style';style.textContent='.release30-mod-list{margin:0 0 18px;padding-left:20px;color:var(--muted);line-height:1.8}.release30-mod-note{font-size:11px;color:var(--muted);line-height:1.75;margin:0 0 18px}.mods-release30 .dlc-heading strong{color:inherit}';document.head.append(style);
 }
 return true;
}
if(!mount()){
 const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
 observer.observe(document.querySelector('#main')||document.body,{childList:true,subtree:true});
 setTimeout(()=>observer.disconnect(),6000);
}
})();