(()=>{
'use strict';
if(window.__gtavModsDLC20261029)return;
window.__gtavModsDLC20261029=true;

const main=document.querySelector('.mods-studio');
if(!main)return;

const heading=main.querySelector('.mods-heading p');
if(heading)heading.textContent='Community mods, DLC archives and translations. Choose what you want to add.';

const languages=main.querySelector('.mods-languages');
if(languages&&!main.querySelector('.mods-dlc')){
  const section=document.createElement('section');
  section.className='mods-dlc';
  section.setAttribute('aria-labelledby','dlc-archive-title');
  section.innerHTML=`
    <header class="dlc-heading">
      <span class="eyebrow">DLC ARCHIVE</span>
      <div>
        <h2 id="dlc-archive-title">Additional content,<br>organized by era.</h2>
        <p>Four packs covering GTA V content releases from December 2014 through July 2022.</p>
      </div>
    </header>
    <div class="dlc-list">
      <details class="dlc-pack">
        <summary>
          <span class="dlc-index">01</span>
          <span class="dlc-identity"><strong>DLC Pack 1</strong><small>December 2014 — October 2016</small></span>
          <span class="dlc-summary-stats"><span><b>15</b> updates</span><span><b>133</b> vehicles</span><span><b>21</b> weapons</span></span>
          <svg class="icon dlc-chevron" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg>
        </summary>
        <div class="dlc-content">
          <div class="dlc-breakdown" aria-label="DLC Pack 1 contents"><span><strong>15</strong><small>Updates</small></span><span><strong>133</strong><small>Vehicles</small></span><span><strong>21</strong><small>Weapons</small></span></div>
          <a class="dlc-download" href="https://gofile.io/d/RdZWkpX8" target="_blank" rel="noopener noreferrer" aria-label="Download DLC Pack 1 in a new tab"><span>Download DLC Pack 1</span><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></a>
        </div>
      </details>
      <details class="dlc-pack">
        <summary>
          <span class="dlc-index">02</span>
          <span class="dlc-identity"><strong>DLC Pack 2</strong><small>December 2016 — September 2018</small></span>
          <span class="dlc-summary-stats"><span><b>8</b> updates</span><span><b>126</b> vehicles</span><span><b>14</b> weapons</span></span>
          <svg class="icon dlc-chevron" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg>
        </summary>
        <div class="dlc-content">
          <div class="dlc-breakdown" aria-label="DLC Pack 2 contents"><span><strong>8</strong><small>Updates</small></span><span><strong>126</strong><small>Vehicles</small></span><span><strong>14</strong><small>Weapons</small></span></div>
          <a class="dlc-download" href="https://gofile.io/d/mkM4gKvY" target="_blank" rel="noopener noreferrer" aria-label="Download DLC Pack 2 in a new tab"><span>Download DLC Pack 2</span><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></a>
        </div>
      </details>
      <details class="dlc-pack">
        <summary>
          <span class="dlc-index">03</span>
          <span class="dlc-identity"><strong>DLC Pack 3</strong><small>December 2018 — August 2020</small></span>
          <span class="dlc-summary-stats"><span><b>4</b> updates</span><span><b>103</b> vehicles</span><span><b>6</b> weapons</span></span>
          <svg class="icon dlc-chevron" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg>
        </summary>
        <div class="dlc-content">
          <div class="dlc-breakdown" aria-label="DLC Pack 3 contents"><span><strong>4</strong><small>Updates</small></span><span><strong>103</strong><small>Vehicles</small></span><span><strong>6</strong><small>Weapons</small></span></div>
          <a class="dlc-download" href="https://gofile.io/d/x7ltGZrC" target="_blank" rel="noopener noreferrer" aria-label="Download DLC Pack 3 in a new tab"><span>Download DLC Pack 3</span><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></a>
        </div>
      </details>
      <details class="dlc-pack">
        <summary>
          <span class="dlc-index">04</span>
          <span class="dlc-identity"><strong>DLC Pack 4</strong><small>December 2020 — July 2022</small></span>
          <span class="dlc-summary-stats"><span><b>4</b> updates</span><span><b>74</b> vehicles</span><span><b>8</b> weapons</span></span>
          <svg class="icon dlc-chevron" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg>
        </summary>
        <div class="dlc-content">
          <div class="dlc-breakdown" aria-label="DLC Pack 4 contents"><span><strong>4</strong><small>Updates</small></span><span><strong>74</strong><small>Vehicles</small></span><span><strong>8</strong><small>Weapons</small></span></div>
          <a class="dlc-download" href="https://gofile.io/d/6LJ3NLlG" target="_blank" rel="noopener noreferrer" aria-label="Download DLC Pack 4 in a new tab"><span>Download DLC Pack 4</span><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></a>
        </div>
      </details>
    </div>`;
  languages.before(section);
}

let languagePicker=main.querySelector('.language-picker');
if(languagePicker){
  // Replace the node once so a stale pre-cache script cannot leave a second click handler attached.
  const cleanPicker=languagePicker.cloneNode(true);
  languagePicker.replaceWith(cleanPicker);
  languagePicker=cleanPicker;
  const hint=languagePicker.querySelector('.language-hint');
  if(hint)hint.textContent='5 packs available';
  const options=languagePicker.querySelector('.language-options');
  if(options)options.innerHTML=`
    <p class="language-note">Choose a translation. Keep one language pack enabled at a time.</p>
    <a class="language-option" href="https://gofile.io/d/UBFyquIl" target="_blank" rel="noopener noreferrer" aria-label="Download Romanian language pack in a new tab"><span class="language-abbr">RO</span><span class="language-name">Romanian</span><span class="language-action">Download <svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></span></a>
    <a class="language-option" href="https://gofile.io/d/inDXtUnp" target="_blank" rel="noopener noreferrer" aria-label="Download Vietnamese language pack in a new tab"><span class="language-abbr">VI</span><span class="language-name">Vietnamese</span><span class="language-action">Download <svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></span></a>
    <a class="language-option" href="https://gofile.io/d/hSyKxoiG" target="_blank" rel="noopener noreferrer" aria-label="Download Thai language pack in a new tab"><span class="language-abbr">TH</span><span class="language-name">Thai</span><span class="language-action">Download <svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></span></a>
    <a class="language-option" href="https://gofile.io/d/0KdSmVMg" target="_blank" rel="noopener noreferrer" aria-label="Download Arabic language pack in a new tab"><span class="language-abbr">AR</span><span class="language-name">Arabic</span><span class="language-action">Download <svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></span></a>
    <a class="language-option" href="https://gofile.io/d/9u6eONPa" target="_blank" rel="noopener noreferrer" aria-label="Download Indonesian language pack in a new tab"><span class="language-abbr">ID</span><span class="language-name">Indonesian</span><span class="language-action">Download <svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></span></a>`;
}

function animateDetails(details,contentSelector){
  const summary=details.querySelector('summary');
  const content=details.querySelector(contentSelector);
  if(!summary||!content)return;
  let animation=null;
  summary.addEventListener('click',event=>{
    event.preventDefault();
    if(animation)return;
    const opening=!details.open;
    if(opening)details.open=true;
    const height=content.scrollHeight;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){details.open=opening;return;}
    animation=content.animate(
      opening?[{height:'0px',opacity:0,transform:'translateY(-8px)'},{height:height+'px',opacity:1,transform:'translateY(0)'}]:[{height:height+'px',opacity:1,transform:'translateY(0)'},{height:'0px',opacity:0,transform:'translateY(-8px)'}],
      {duration:opening?380:280,easing:'cubic-bezier(.22,1,.36,1)'}
    );
    animation.onfinish=()=>{details.open=opening;animation=null;};
    animation.oncancel=()=>{animation=null;};
  });
}

main.querySelectorAll('.dlc-pack').forEach(item=>animateDetails(item,'.dlc-content'));
if(languagePicker)animateDetails(languagePicker,'.language-options');
})();
