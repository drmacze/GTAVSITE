(()=>{
'use strict';
if(window.__gtavModsCatalogV4)return;
window.__gtavModsCatalogV4=true;

const main=document.querySelector('.mods-studio');
if(!main)return;
main.classList.add('mods-catalog-v4');

const heading=main.querySelector('.mods-heading');
const feature=main.querySelector('.mods-feature');
const dlc=main.querySelector('.mods-dlc');
const languages=main.querySelector('.mods-languages');
if(!heading||!feature||!dlc||!languages)return;

feature.id='mods';
dlc.id='dlc';
languages.id='languages';
main.querySelector('.mods-category-nav')?.remove();

function ensureGraphics(){
  let section=main.querySelector('#graphics');
  if(section)return section;
  section=document.createElement('section');
  section.className='mods-graphics';
  section.id='graphics';
  section.setAttribute('aria-labelledby','graphics-title');
  section.innerHTML=`
    <header class="graphics-heading">
      <span class="eyebrow">GRAPHICS</span>
      <div>
        <h2 id="graphics-title">Visual enhancements.</h2>
        <p>Rendering presets and graphics-focused packs are kept separate from gameplay mods and DLC.</p>
      </div>
    </header>
    <div class="graphics-row" data-mod-type="graphics" data-search-extra="graphics visual rendering preset color lighting">
      <span class="graphics-index">01</span>
      <div class="graphics-copy"><strong>Graphics packs</strong><p>No public graphics download is listed yet.</p></div>
      <span class="graphics-status">No release yet</span>
    </div>`;
  languages.before(section);
  return section;
}
const graphics=ensureGraphics();

function normalizeDlc(){
  main.querySelectorAll('.dlc-pack').forEach(pack=>{
    pack.classList.add('dlc-pack-v4');
    const summary=pack.querySelector(':scope > summary');
    if(!summary)return;
    summary.querySelectorAll('span,strong,small,b').forEach(node=>{
      node.style.removeProperty('transform');
      node.style.removeProperty('rotate');
      node.style.removeProperty('writing-mode');
    });
  });
}
normalizeDlc();

function addSectionCount(target,text){
  if(!target||target.querySelector('.catalog-section-count'))return;
  const badge=document.createElement('span');
  badge.className='catalog-section-count';
  badge.textContent=text;
  target.append(badge);
}
addSectionCount(feature.querySelector('.mod-editorial>.eyebrow'),'1 pack');
addSectionCount(dlc.querySelector('.dlc-heading>.eyebrow'),'4 packs');
addSectionCount(graphics.querySelector('.graphics-heading>.eyebrow'),'0 published');
const languageEyebrow=languages.querySelector('.language-label>.eyebrow');
addSectionCount(languageEyebrow,'5 packs');

const existingIntro=heading.querySelector('p');
if(existingIntro)existingIntro.textContent='Browse gameplay mods, GTA Online DLC archives, graphics packs and translations. Search by name, content or language.';

const searchPanel=document.createElement('section');
searchPanel.className='mods-search-panel';
searchPanel.setAttribute('aria-label','Search mod downloads');
searchPanel.innerHTML=`
  <label class="mods-search-label" for="mods-search">Find a download</label>
  <div class="mods-search-line">
    <svg class="mods-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
    <input id="mods-search" type="search" inputmode="search" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Search DLC, DriveV, Indonesian, vehicles…" aria-describedby="mods-results-status">
    <button class="mods-search-clear" type="button" hidden aria-label="Clear search">Clear</button>
  </div>`;
heading.after(searchPanel);

const filterRail=document.createElement('div');
filterRail.className='mods-filter-rail';
filterRail.innerHTML=`
  <nav class="mods-filter-nav" aria-label="Filter mod categories">
    <button type="button" data-filter="all" class="is-active" aria-pressed="true">All <span>10</span></button>
    <button type="button" data-filter="mods" aria-pressed="false">Mod Pack <span>1</span></button>
    <button type="button" data-filter="dlc" aria-pressed="false">DLC <span>4</span></button>
    <button type="button" data-filter="graphics" aria-pressed="false">Graphics <span>0</span></button>
    <button type="button" data-filter="languages" aria-pressed="false">Language <span>5</span></button>
  </nav>
  <p class="mods-results-status" id="mods-results-status" aria-live="polite">10 downloads</p>`;
searchPanel.after(filterRail);

const empty=document.createElement('section');
empty.className='mods-empty-state';
empty.hidden=true;
empty.innerHTML='<span>NO MATCHES</span><h2>Nothing found.</h2><p>Try a pack name, language, vehicle, weapon, graphics or gameplay term.</p><button type="button">Clear search</button>';
main.insertBefore(empty,main.querySelector('.mods-end'));

const searchInput=searchPanel.querySelector('#mods-search');
const clearButton=searchPanel.querySelector('.mods-search-clear');
const resultStatus=filterRail.querySelector('.mods-results-status');
const filterButtons=[...filterRail.querySelectorAll('[data-filter]')];
const languagePicker=languages.querySelector('.language-picker');

const items=[
  {node:feature,type:'mods',download:true,search:'community mod pack 1 improvements gore drivev realistic pedestrians traffic forests abandoned cabins gameplay realism'},
  ...[...dlc.querySelectorAll('.dlc-pack')].map((node,index)=>({node,type:'dlc',download:true,search:`dlc pack ${index+1} gta online updates vehicles weapons ${node.textContent}`})),
  {node:graphics.querySelector('.graphics-row'),type:'graphics',download:false,search:`graphics visual rendering preset lighting color ${graphics.textContent}`},
  ...[...languages.querySelectorAll('.language-option')].map(node=>({node,type:'languages',download:true,search:`language translation ${node.textContent}`}))
];
items.forEach(item=>item.search=(item.search+' '+(item.node.dataset.searchExtra||'')).toLowerCase().replace(/\s+/g,' '));

let activeFilter='all';
let previousLanguageOpen=languagePicker?.open||false;
const sectionMap={mods:feature,dlc,graphics,languages};

function words(value){return value.toLowerCase().trim().split(/\s+/).filter(Boolean)}
function matches(item,queryWords){return queryWords.every(word=>item.search.includes(word))}

function applyCatalog({announce=true}={}){
  const query=searchInput.value.trim();
  const queryWords=words(query);
  clearButton.hidden=!query;

  let visibleDownloads=0;
  const visibleByType={mods:0,dlc:0,graphics:0,languages:0};
  items.forEach(item=>{
    const categoryMatch=activeFilter==='all'||item.type===activeFilter;
    const searchMatch=!queryWords.length||matches(item,queryWords);
    const visible=categoryMatch&&searchMatch;
    item.node.hidden=!visible;
    item.node.classList.toggle('catalog-search-match',visible&&queryWords.length>0);
    if(visible){
      visibleByType[item.type]++;
      if(item.download)visibleDownloads++;
    }
  });

  feature.hidden=visibleByType.mods===0;
  dlc.hidden=visibleByType.dlc===0;
  graphics.hidden=visibleByType.graphics===0;
  languages.hidden=visibleByType.languages===0;

  if(languagePicker){
    if(queryWords.length||activeFilter==='languages')languagePicker.open=visibleByType.languages>0;
    else languagePicker.open=previousLanguageOpen;
  }

  const conceptualGraphics=visibleByType.graphics>0&&!items.find(item=>item.type==='graphics')?.download;
  const anyVisible=visibleDownloads>0||conceptualGraphics;
  empty.hidden=anyVisible;

  if(!anyVisible){
    resultStatus.textContent='No results';
  }else if(conceptualGraphics&&visibleDownloads===0){
    resultStatus.textContent='Graphics · no public download yet';
  }else{
    resultStatus.textContent=`${visibleDownloads} download${visibleDownloads===1?'':'s'}${query?` for “${query}”`:''}`;
  }

  main.classList.toggle('is-searching',queryWords.length>0);
  main.classList.toggle('is-filtered',activeFilter!=='all');
  if(announce)resultStatus.setAttribute('data-updated',String(Date.now()));
}

function setFilter(filter,scroll=false){
  activeFilter=filter;
  filterButtons.forEach(button=>{
    const active=button.dataset.filter===filter;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  if(languagePicker&&filter!=='languages'&&!searchInput.value.trim())previousLanguageOpen=languagePicker.open;
  applyCatalog();
  if(scroll&&filter!=='all'){
    const target=sectionMap[filter];
    if(target&&!target.hidden)requestAnimationFrame(()=>target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
  }
}

filterRail.addEventListener('click',event=>{
  const button=event.target.closest('[data-filter]');
  if(!button)return;
  setFilter(button.dataset.filter,true);
});

let searchTimer=0;
searchInput.addEventListener('input',()=>{
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>applyCatalog(),55);
});
searchInput.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&searchInput.value){searchInput.value='';applyCatalog();searchInput.blur();}
});
clearButton.addEventListener('click',()=>{searchInput.value='';applyCatalog();searchInput.focus();});
empty.querySelector('button').addEventListener('click',()=>{searchInput.value='';setFilter('all');searchInput.focus();});
languagePicker?.addEventListener('toggle',()=>{if(!searchInput.value.trim()&&activeFilter!=='languages')previousLanguageOpen=languagePicker.open;});

// Keep the compact filter rail useful while browsing, without occupying the whole mobile viewport.
if('IntersectionObserver'in window){
  const sections=[feature,dlc,graphics,languages];
  const observer=new IntersectionObserver(entries=>{
    if(activeFilter!=='all'||searchInput.value.trim())return;
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    const type=visible.target===feature?'mods':visible.target===dlc?'dlc':visible.target===graphics?'graphics':'languages';
    filterButtons.forEach(button=>button.classList.toggle('is-reading',button.dataset.filter===type));
  },{rootMargin:'-24% 0px -62% 0px',threshold:[0,.12,.35,.6]});
  sections.forEach(section=>observer.observe(section));
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}

applyCatalog({announce:false});
})();
