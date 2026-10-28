(()=>{
'use strict';
if(window.__gtavUpdate28OctV1)return;
window.__gtavUpdate28OctV1=true;

const mount=()=>{
  const list=document.querySelector('.release-list');
  const jump=document.querySelector('.release-jump');
  if(!list||!jump||document.querySelector('#release-2026-10-28'))return;

  const toolbarCount=document.querySelector('.release-toolbar small');
  if(toolbarCount)toolbarCount.textContent='11 releases · Newest first';

  jump.querySelectorAll('a').forEach(a=>a.removeAttribute('aria-current'));
  const jumpLink=document.createElement('a');
  jumpLink.href='#release-2026-10-28';
  jumpLink.textContent='28 Oct';
  jumpLink.setAttribute('aria-current','location');
  jump.prepend(jumpLink);

  const article=document.createElement('article');
  article.className='release-entry release-entry-28';
  article.id='release-2026-10-28';
  article.style.setProperty('--entry','0');
  article.innerHTML=`
    <div class="release-date">
      <time datetime="2026-10-28"><strong>28</strong><span>OCT 2026</span></time>
    </div>
    <details class="release-card" open>
      <summary>
        <div class="release-intro">
          <span class="release-tag">Latest release</span>
          <h2>GTA Online DLC packs, Mac launcher and trainer updates</h2>
          <p>All 31 GTA Online updates through The Criminal Enterprises can now be used in story mode, alongside a launcher-first Mac flow and expanded trainer support.</p>
        </div>
        <span class="release-chevron"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg></span>
      </summary>
      <div class="release-body">
        <section class="release-part">
          <h3>GTA Online DLC Packs 1–4</h3>
          <ul>
            <li><strong>31 GTA Online updates for story mode:</strong> from Festive Surprise 2014 through The Criminal Enterprises, including <strong>436 vehicles</strong>, their weapons, clothing and tattoos for online characters.</li>
            <li><strong>Four downloads by release era:</strong> DLC Pack 1 (2014–2016), Pack 2 (2016–2018), Pack 3 (2018–2020), and Pack 4 (2020–2022). Each download is approximately 1.7–2 GB.</li>
            <li><strong>Install once per pack:</strong> use <strong>MODS › IMPORT MOD</strong> in the launcher. Each update then appears separately in the MODS tab, so individual updates can be switched off.</li>
            <li><strong>Story-mode persistence:</strong> DLC vehicles now remain in story mode instead of being removed after a few seconds. The trainer's <strong>All weapons</strong> option also includes their weapons.</li>
          </ul>
          <a class="release-inline-link" href="downloads.html#dlc">Open DLC Packs in Mods <svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-right"></use></svg></a>
        </section>

        <div class="release-callout"><strong>32 add-on pack limit:</strong> all four DLC packs use 31 slots. On 4 GB devices, keep only a few updates enabled. Importing on iPhone or iPad needs roughly twice the downloaded pack size in free storage. Disabling a pack removes its cars and weapons from your save the next time the game saves.</div>

        <section class="release-part">
          <h3>Mac</h3>
          <ul>
            <li><strong>The launcher opens first</strong>, matching the iPhone flow, with presets for your Mac, every graphics setting, MODS with IMPORT MOD, and save management. If you previously disabled it, hold <strong>Option</strong> while the game opens.</li>
            <li><strong>Trainer:</strong> press <strong>⌘T</strong> or <strong>F4</strong> in-game. With a controller, use <strong>View</strong> from the pause menu.</li>
            <li><strong>Exit Game</strong> in the pause menu now returns to the launcher.</li>
          </ul>
        </section>

        <section class="release-part">
          <h3>How to update</h3>
          <ol>
            <li><strong>iPhone / iPad:</strong> sign and install the new <code>GTAV-unsigned.ipa</code>. Existing data, saves and mods remain.</li>
            <li><strong>Mac:</strong> unzip <code>GTAV-mac.zip</code> and open <strong>GTA V.app</strong>.</li>
            <li><strong>New install, or skipped 18 Oct?</strong> Also set up <code>GTAV_patch</code> and <code>movies.zip</code> from the 22 Oct download once.</li>
          </ol>
        </section>

        <section class="release-part">
          <h3>Reporting problems</h3>
          <p>Send the entire <strong>GTA V › Logs</strong> folder. On Mac use <code>~/Library/Logs/GTA5</code>. Mention that you are using the <strong>28 Oct build</strong>.</p>
        </section>

        <div class="release-download release-download-28">
          <div class="release-platform-downloads">
            <a class="release-platform-button" href="https://gofile.io/d/ZtMFRLJE" target="_blank" rel="noopener noreferrer"><span><small>iPhone & iPad</small>Download iOS</span><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></a>
            <a class="release-platform-button" href="https://gofile.io/d/rBYaPK8L" target="_blank" rel="noopener noreferrer"><span><small>Apple silicon</small>Download MacOS</span><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-up-right"></use></svg></a>
          </div>
          <a href="#updates-top">Back to top ↑</a>
        </div>
      </div>
    </details>`;
  list.prepend(article);

  const oldLatest=document.querySelector('#release-2026-10-26 .release-tag');
  if(oldLatest&&/latest/i.test(oldLatest.textContent))oldLatest.textContent='Previous release';

  const details=article.querySelector('details');
  const markCurrent=()=>{
    jump.querySelectorAll('a').forEach(a=>{
      if(a.hash==='#release-2026-10-28')a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    });
  };
  jumpLink.addEventListener('click',()=>{details.open=true;markCurrent();});
  details.addEventListener('toggle',()=>{if(details.open)markCurrent();});
  if(location.hash==='#release-2026-10-28'){
    details.open=true;
    markCurrent();
    requestAnimationFrame(()=>article.scrollIntoView({block:'start'}));
  }
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();
