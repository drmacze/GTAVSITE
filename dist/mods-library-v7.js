(()=>{
'use strict';
if(window.__gtavModsLibraryV7)return;
window.__gtavModsLibraryV7=true;

const main=document.querySelector('.mods-studio');
if(!main)return;
main.classList.add('mods-library-v7');

const heading=main.querySelector('.mods-heading');
if(heading){
  const eyebrow=heading.querySelector('.eyebrow');
  const title=heading.querySelector('h1');
  const copy=heading.querySelector('p');
  if(eyebrow)eyebrow.textContent='DOWNLOADS / MOD LIBRARY';
  if(title)title.textContent='Mod Library';
  if(copy)copy.textContent='Browse gameplay mods, DLC packs, graphics mods and language packs in one place.';
}

const feature=main.querySelector('#mods');
if(feature){
  const editorial=feature.querySelector('.mod-editorial');
  const eyebrow=editorial?.querySelector('.eyebrow');
  const title=editorial?.querySelector('h2');
  if(eyebrow)eyebrow.innerHTML='GAMEPLAY <span class="catalog-section-count">1 pack</span>';
  if(title)title.innerHTML='Community Mod Pack 1';
  if(editorial&&!editorial.querySelector('.library-item-meta')){
    const meta=document.createElement('div');
    meta.className='library-item-meta';
    meta.innerHTML='<span>Community pack</span><span>4 improvements</span>';
    title?.after(meta);
  }
}

const dlc=main.querySelector('#dlc');
if(dlc){
  const eyebrow=dlc.querySelector('.dlc-heading>.eyebrow');
  const title=dlc.querySelector('.dlc-heading h2');
  const copy=dlc.querySelector('.dlc-heading p');
  if(eyebrow)eyebrow.innerHTML='DLC <span class="catalog-section-count">4 packs</span>';
  if(title)title.textContent='DLC Packs';
  if(copy)copy.textContent='GTA Online content grouped by release period. Open a pack to view its contents and download it.';
}

const graphics=main.querySelector('#graphics');
if(graphics){
  const eyebrow=graphics.querySelector('.graphics-heading>.eyebrow');
  const title=graphics.querySelector('.graphics-heading h2');
  const copy=graphics.querySelector('.graphics-heading p');
  if(eyebrow)eyebrow.innerHTML='GRAPHICS <span class="catalog-section-count">1 mod</span>';
  if(title)title.textContent='Graphics Mods';
  if(copy)copy.textContent='Visual enhancements and graphics fixes built for GTA V on iOS.';
}

const languages=main.querySelector('#languages');
if(languages){
  const eyebrow=languages.querySelector('.language-label>.eyebrow');
  const title=languages.querySelector('.language-title');
  const hint=languages.querySelector('.language-hint');
  if(eyebrow)eyebrow.innerHTML='LANGUAGE <span class="catalog-section-count">5 packs</span>';
  if(title)title.textContent='Language Packs';
  if(hint)hint.textContent='Choose one translation pack';
}

const status=main.querySelector('.mods-results-status');
if(status&&!main.querySelector('#mods-search')?.value.trim())status.textContent='11 downloads';
})();
