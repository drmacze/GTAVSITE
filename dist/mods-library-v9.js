(()=>{
'use strict';
if(window.__gtavModsLibraryV9)return;
window.__gtavModsLibraryV9=true;

const MODS=[
  {id:'community-pack-1',type:'modpack',category:'Mod Pack',icon:'package',title:'Community Mod Pack 1',subtitle:'Gameplay & realism',description:'Gore improvements, DriveV, realistic pedestrians and traffic, plus new forests and abandoned cabins.',download:'https://gofile.io/d/RNlatXEi',tags:['4 improvements','Gameplay'],visual:'community'},
  {id:'dlc-pack-1',type:'dlc',category:'DLC',icon:'archive',title:'DLC Pack 1',subtitle:'Dec 2014 — Oct 2016',description:'15 updates with 133 vehicles and 21 weapons.',download:'https://gofile.io/d/RdZWkpX8',tags:['15 updates','133 vehicles','21 weapons'],visual:'dlc',number:'01'},
  {id:'dlc-pack-2',type:'dlc',category:'DLC',icon:'archive',title:'DLC Pack 2',subtitle:'Dec 2016 — Sep 2018',description:'8 updates with 126 vehicles and 14 weapons.',download:'https://gofile.io/d/mkM4gKvY',tags:['8 updates','126 vehicles','14 weapons'],visual:'dlc',number:'02'},
  {id:'dlc-pack-3',type:'dlc',category:'DLC',icon:'archive',title:'DLC Pack 3',subtitle:'Dec 2018 — Aug 2020',description:'4 updates with 103 vehicles and 6 weapons.',download:'https://gofile.io/d/x7ltGZrC',tags:['4 updates','103 vehicles','6 weapons'],visual:'dlc',number:'03'},
  {id:'dlc-pack-4',type:'dlc',category:'DLC',icon:'archive',title:'DLC Pack 4',subtitle:'Dec 2020 — Jul 2022',description:'4 updates with 74 vehicles and 8 weapons.',download:'https://gofile.io/d/6LJ3NLlG',tags:['4 updates','74 vehicles','8 weapons'],visual:'dlc',number:'04'},
  {id:'awesomekills',type:'graphics',category:'Graphics',icon:'palette',title:'Awesomekills Graphics iOS',subtitle:'Lighting & timecycle',description:'Improves nighttime lighting and the timecycle for GTA V on iOS.',download:'https://gofile.io/d/e726b04a-a872-4ab3-a5b5-d877e05fa422',preset:'assets/mods/awesomekills/GTA-V-graphics-settings-iPhone11.json',tags:['Night lighting','Timecycle'],visual:'image',image:'https://user13692.na.imgto.link/public/20261028/e2fc4facdafeabc469b5c8e2-img-8405.avif'},
  {id:'lang-ro',type:'language',category:'Language',icon:'languages',title:'Romanian Language Pack',subtitle:'Romanian',description:'Romanian translation pack for GTA V.',download:'https://gofile.io/d/UBFyquIl',tags:['RO','Translation'],visual:'language',code:'RO'},
  {id:'lang-vi',type:'language',category:'Language',icon:'languages',title:'Vietnamese Language Pack',subtitle:'Vietnamese',description:'Vietnamese translation pack for GTA V.',download:'https://gofile.io/d/inDXtUnp',tags:['VI','Translation'],visual:'language',code:'VI'},
  {id:'lang-th',type:'language',category:'Language',icon:'languages',title:'Thai Language Pack',subtitle:'Thai',description:'Thai translation pack for GTA V.',download:'https://gofile.io/d/hSyKxoiG',tags:['TH','Translation'],visual:'language',code:'TH'},
  {id:'lang-ar',type:'language',category:'Language',icon:'languages',title:'Arabic Language Pack',subtitle:'Arabic',description:'Arabic translation pack for GTA V.',download:'https://gofile.io/d/0KdSmVMg',tags:['AR','Translation'],visual:'language',code:'AR'},
  {id:'lang-id',type:'language',category:'Language',icon:'languages',title:'Indonesian Language Pack',subtitle:'Indonesian',description:'Indonesian translation pack for GTA V.',download:'https://gofile.io/d/9u6eONPa',tags:['ID','Translation'],visual:'language',code:'ID'}
];

const icon=name=>`<svg class="nexus-icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;
const kebab=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`;
const gridIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`;
const listIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="5" cy="6" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="18" r="1"/></svg>`;

function visual(item){
  if(item.visual==='image') return `<div class="nexus-card-media has-image"><img src="${item.image}" alt="${item.title} preview" loading="lazy" decoding="async"><span class="nexus-media-badge">${icon(item.icon)} ${item.category}</span></div>`;
  if(item.visual==='community') return `<div class="nexus-card-media visual-community"><img src="assets/los-santos-background.jpeg" alt="" loading="lazy" decoding="async"><span class="nexus-media-shade"></span><span class="nexus-media-symbol">${icon('package')}</span><span class="nexus-media-label">Community Pack</span></div>`;
  if(item.visual==='dlc') return `<div class="nexus-card-media visual-dlc"><span class="nexus-media-symbol">${icon('archive')}</span><strong>${item.number}</strong><small>DLC PACK</small></div>`;
  return `<div class="nexus-card-media visual-language"><span class="nexus-language-code">${item.code}</span><span class="nexus-media-symbol">${icon('languages')}</span><small>LANGUAGE PACK</small></div>`;
}

function card(item){
  const search=[item.title,item.subtitle,item.description,item.category,...item.tags].join(' ').toLowerCase();
  return `<article class="nexus-mod-card" data-type="${item.type}" data-search="${search.replace(/"/g,'&quot;')}">
    ${visual(item)}
    <div class="nexus-card-body">
      <div class="nexus-card-topline"><span>${icon(item.icon)} ${item.category}</span><button class="nexus-more" type="button" aria-label="More information about ${item.title}">${kebab}</button></div>
      <h3>${item.title}</h3>
      <p class="nexus-card-subtitle">${item.subtitle}</p>
      <p class="nexus-card-description">${item.description}</p>
      <div class="nexus-card-tags">${item.tags.slice(0,3).map(t=>`<span>${t}</span>`).join('')}</div>
      <div class="nexus-card-actions">
        <a class="nexus-download" href="${item.download}" target="_blank" rel="noopener noreferrer">${icon('download-modern')}<span>Download</span></a>
        ${item.preset?`<a class="nexus-preset" href="${item.preset}" download="GTA-V-graphics-settings-iPhone11.json">${icon('sliders')}<span>Preset</span></a>`:''}
      </div>
    </div>
  </article>`;
}

function mount(){
  const main=document.querySelector('.mods-studio');
  if(!main||main.dataset.libraryV9==='1')return;
  main.dataset.libraryV9='1';
  main.className='mods-studio nexus-library-v9';
  main.innerHTML=`
    <section class="nexus-game-hero" aria-labelledby="nexus-title">
      <div class="nexus-hero-bg" aria-hidden="true"></div>
      <div class="nexus-breadcrumb"><a href="home.html">Home</a><span>›</span><span>GTA V iOS Mods</span></div>
      <div class="nexus-hero-content">
        <img class="nexus-cover" src="assets/home-intro-cover-v5.svg" alt="GTA V iOS artwork">
        <div class="nexus-hero-copy">
          <span class="nexus-overline">COMMUNITY MOD LIBRARY</span>
          <h1 id="nexus-title">GTA V iOS Mods</h1>
          <p>Gameplay mods, DLC packs, graphics enhancements and translations for the native GTA V iOS project.</p>
        </div>
      </div>
      <div class="nexus-stats" aria-label="Library statistics">
        <span><strong>11</strong><small>Downloads</small></span>
        <span><strong>4</strong><small>Categories</small></span>
        <span><strong>iOS</strong><small>Platform</small></span>
      </div>
    </section>

    <section class="nexus-tools" aria-label="Mod library tools">
      <div class="nexus-search-wrap">
        ${icon('search')}
        <input id="nexus-mod-search" type="search" inputmode="search" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Search mods, DLC, graphics, languages…" aria-label="Search mods">
        <button class="nexus-search-clear" type="button" hidden>Clear</button>
      </div>
      <div class="nexus-categories" role="group" aria-label="Filter categories">
        <button type="button" class="is-active" data-filter="all">All <span>11</span></button>
        <button type="button" data-filter="modpack">Mod Pack <span>1</span></button>
        <button type="button" data-filter="dlc">DLC <span>4</span></button>
        <button type="button" data-filter="graphics">Graphics <span>1</span></button>
        <button type="button" data-filter="language">Language <span>5</span></button>
      </div>
    </section>

    <section class="nexus-library-section" aria-labelledby="nexus-library-heading">
      <div class="nexus-library-heading">
        <div><span class="nexus-section-icon">${icon('sparkles')}</span><div><span class="nexus-section-kicker">LIBRARY</span><h2 id="nexus-library-heading">Featured Mods</h2></div></div>
        <div class="nexus-heading-actions">
          <span class="nexus-result-count" aria-live="polite">11 items</span>
          <div class="nexus-view-toggle" role="group" aria-label="Library view">
            <button type="button" data-view="grid" aria-label="Grid view">${gridIcon}</button>
            <button type="button" data-view="list" aria-label="List view">${listIcon}</button>
          </div>
        </div>
      </div>
      <div class="nexus-mod-feed">${MODS.map(card).join('')}</div>
      <div class="nexus-empty" hidden><span>${icon('search')}</span><h3>No mods found</h3><p>Try another search or category.</p></div>
    </section>
  `;

  const feed=main.querySelector('.nexus-mod-feed');
  const cards=[...main.querySelectorAll('.nexus-mod-card')];
  const categoryButtons=[...main.querySelectorAll('.nexus-categories button')];
  const viewButtons=[...main.querySelectorAll('.nexus-view-toggle button')];
  const search=main.querySelector('#nexus-mod-search');
  const clear=main.querySelector('.nexus-search-clear');
  const count=main.querySelector('.nexus-result-count');
  const empty=main.querySelector('.nexus-empty');
  const heading=main.querySelector('#nexus-library-heading');
  let active='all';

  let stored='grid';
  try{stored=localStorage.getItem('gtav-mod-library-view')||'grid'}catch{}
  if(!['grid','list'].includes(stored))stored='grid';
  const setView=view=>{
    feed.dataset.view=view;
    viewButtons.forEach(button=>{
      const on=button.dataset.view===view;
      button.classList.toggle('is-active',on);
      button.setAttribute('aria-pressed',String(on));
    });
    try{localStorage.setItem('gtav-mod-library-view',view)}catch{}
  };
  setView(stored);
  viewButtons.forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));

  const apply=()=>{
    const q=search.value.trim().toLowerCase();
    clear.hidden=!q;
    let visible=0;
    cards.forEach(card=>{
      const show=(active==='all'||card.dataset.type===active)&&(!q||card.dataset.search.includes(q));
      card.hidden=!show;
      if(show)visible++;
    });
    count.textContent=`${visible} item${visible===1?'':'s'}`;
    empty.hidden=visible!==0;
    feed.hidden=visible===0;
    const activeLabel=categoryButtons.find(b=>b.dataset.filter===active)?.childNodes[0]?.textContent?.trim()||'Featured Mods';
    heading.textContent=active==='all'?'Featured Mods':activeLabel;
  };
  categoryButtons.forEach(button=>button.addEventListener('click',()=>{
    active=button.dataset.filter;
    categoryButtons.forEach(b=>b.classList.toggle('is-active',b===button));
    apply();
  }));
  search.addEventListener('input',apply);
  search.addEventListener('keydown',event=>{if(event.key==='Escape'&&search.value){search.value='';apply();search.blur();}});
  clear.addEventListener('click',()=>{search.value='';apply();search.focus({preventScroll:true});});

  main.querySelectorAll('.nexus-more').forEach(button=>button.addEventListener('click',()=>{
    const card=button.closest('.nexus-mod-card');
    card.classList.toggle('is-expanded');
  }));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,140),{once:true});
else setTimeout(mount,140);
})();
