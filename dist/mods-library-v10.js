(()=>{
'use strict';
if(window.__gtavModsLibraryV10)return;
window.__gtavModsLibraryV10=true;

const DLC=[
 {title:'DLC Pack 1',meta:'Dec 2014 — Oct 2016',note:'15 updates · 133 vehicles · 21 weapons',url:'https://gofile.io/d/RdZWkpX8'},
 {title:'DLC Pack 2',meta:'Dec 2016 — Sep 2018',note:'8 updates · 126 vehicles · 14 weapons',url:'https://gofile.io/d/mkM4gKvY'},
 {title:'DLC Pack 3',meta:'Dec 2018 — Aug 2020',note:'4 updates · 103 vehicles · 6 weapons',url:'https://gofile.io/d/x7ltGZrC'},
 {title:'DLC Pack 4',meta:'Dec 2020 — Jul 2022',note:'4 updates · 74 vehicles · 8 weapons',url:'https://gofile.io/d/6LJ3NLlG'}
];
const LANG=[
 {title:'Romanian',code:'RO',url:'https://gofile.io/d/UBFyquIl'},
 {title:'Vietnamese',code:'VI',url:'https://gofile.io/d/inDXtUnp'},
 {title:'Thai',code:'TH',url:'https://gofile.io/d/hSyKxoiG'},
 {title:'Arabic',code:'AR',url:'https://gofile.io/d/0KdSmVMg'},
 {title:'Indonesian',code:'ID',url:'https://gofile.io/d/9u6eONPa'}
];
const ITEMS=[
 {id:'community',type:'modpack',category:'Mod Pack',icon:'package',title:'Community Mod Pack 1',subtitle:'Gameplay & realism',description:'Gore improvements, DriveV, realistic pedestrians and traffic, plus new forests and abandoned cabins.',count:1,url:'https://gofile.io/d/RNlatXEi',tags:['4 improvements','Gameplay'],visual:'community'},
 {id:'dlc',type:'dlc',category:'DLC',icon:'archive',title:'DLC Collection',subtitle:'Four release-era packs',description:'GTA Online content grouped into four downloadable packs from 2014 through 2022.',count:4,children:DLC,tags:['4 packs','31 updates'],visual:'dlc'},
 {id:'awesomekills',type:'graphics',category:'Graphics',icon:'palette',title:'Awesomekills Graphics iOS',subtitle:'Lighting & timecycle',description:'Improves nighttime lighting and the timecycle for GTA V on iOS.',count:1,url:'https://gofile.io/d/e726b04a-a872-4ab3-a5b5-d877e05fa422',preset:'assets/mods/awesomekills/GTA-V-graphics-settings-iPhone11.json',tags:['Night lighting','Timecycle'],visual:'image',image:'https://user13692.na.imgto.link/public/20261028/e2fc4facdafeabc469b5c8e2-img-8405.avif'},
 {id:'language',type:'language',category:'Language',icon:'languages',title:'Language Packs',subtitle:'Five translations',description:'Choose one translation pack for your preferred language.',count:5,children:LANG,tags:['5 packs','Translation'],visual:'language'}
];

const icon=name=>`<svg class="lib-icon" aria-hidden="true"><use href="assets/icons.svg#${name}"></use></svg>`;
const gridIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.3"/><rect x="14" y="4" width="6" height="6" rx="1.3"/><rect x="4" y="14" width="6" height="6" rx="1.3"/><rect x="14" y="14" width="6" height="6" rx="1.3"/></svg>';
const listIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h1M4 12h1M4 18h1"/></svg>';

function childRows(item){
 if(item.id==='dlc') return item.children.map((x,i)=>`<a class="collection-row" href="${x.url}" target="_blank" rel="noopener noreferrer"><span class="collection-index">0${i+1}</span><span class="collection-copy"><strong>${x.title}</strong><small>${x.meta}</small><em>${x.note}</em></span><span class="collection-action">${icon('download-modern')}</span></a>`).join('');
 return item.children.map(x=>`<a class="collection-row language-row" href="${x.url}" target="_blank" rel="noopener noreferrer"><span class="language-code">${x.code}</span><span class="collection-copy"><strong>${x.title}</strong><small>Language Pack</small></span><span class="collection-action">${icon('download-modern')}</span></a>`).join('');
}

function media(item){
 if(item.visual==='image')return `<div class="library-media image-media"><img src="${item.image}" alt="${item.title} preview" loading="lazy" decoding="async"><span class="media-label">${icon(item.icon)} ${item.category}</span></div>`;
 if(item.visual==='community')return `<div class="library-media community-media"><img src="assets/los-santos-background.jpeg" alt="" loading="lazy" decoding="async"><span class="media-overlay"></span><span class="media-icon">${icon('package')}</span><small>COMMUNITY PACK</small></div>`;
 if(item.visual==='dlc')return `<div class="library-media abstract-media"><span class="media-icon">${icon('archive')}</span><strong>04</strong><small>DLC PACKS</small></div>`;
 return `<div class="library-media abstract-media language-media"><span class="media-icon">${icon('languages')}</span><strong>05</strong><small>LANGUAGE PACKS</small></div>`;
}

function card(item){
 const childSearch=(item.children||[]).map(x=>Object.values(x).join(' ')).join(' ');
 const search=[item.category,item.title,item.subtitle,item.description,...item.tags,childSearch].join(' ').toLowerCase();
 const hasChildren=!!item.children;
 return `<article class="library-card${hasChildren?' has-children':''}" data-id="${item.id}" data-type="${item.type}" data-search="${search.replace(/"/g,'&quot;')}">
  ${media(item)}
  <div class="library-card-body">
   <div class="library-card-meta"><span>${icon(item.icon)}${item.category}</span><span>${item.count} download${item.count===1?'':'s'}</span></div>
   <h3>${item.title}</h3>
   <p class="library-card-subtitle">${item.subtitle}</p>
   <p class="library-card-description">${item.description}</p>
   <div class="library-tags">${item.tags.map(t=>`<span>${t}</span>`).join('')}</div>
   <div class="library-actions">
    ${hasChildren?`<button class="collection-toggle" type="button" aria-expanded="false"><span>View ${item.count} ${item.id==='dlc'?'packs':'languages'}</span>${icon('chevron-down')}</button>`:`<a class="primary-action" href="${item.url}" target="_blank" rel="noopener noreferrer">${icon('download-modern')}<span>Download</span></a>${item.preset?`<a class="secondary-action" href="${item.preset}" download="GTA-V-graphics-settings-iPhone11.json">${icon('sliders')}<span>Preset</span></a>`:''}`}
   </div>
  </div>
  ${hasChildren?`<div class="collection-panel" hidden>${childRows(item)}</div>`:''}
 </article>`;
}

function mount(){
 const main=document.querySelector('.mods-studio');
 if(!main||main.dataset.libraryV10==='1')return;
 main.dataset.libraryV10='1';
 main.className='mods-studio mods-library-v10';
 main.innerHTML=`
  <section class="library-hero" aria-labelledby="library-title">
   <div class="library-hero-bg" aria-hidden="true"></div>
   <div class="library-breadcrumb"><a href="home.html">Home</a><span>/</span><span>Mods</span></div>
   <div class="library-hero-main">
    <img class="library-logo" src="https://user13692.na.imgto.link/public/20261028/a7a06b1488b4b44342b0cf18-img-8148.avif" alt="GTA V iOS Mods logo">
    <div class="library-hero-copy"><span>COMMUNITY LIBRARY</span><h1 id="library-title">GTA V iOS Mods</h1><p>Mods, DLC, graphics and translations for the native iOS project.</p></div>
   </div>
   <div class="library-stats"><span><strong>11</strong><small>Downloads</small></span><span><strong>4</strong><small>Categories</small></span><span><strong>iOS</strong><small>Platform</small></span></div>
  </section>
  <section class="library-toolbar" aria-label="Mod library controls">
   <div class="library-search">${icon('search')}<input id="library-search" type="search" inputmode="search" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Search library" aria-label="Search mod library"><button type="button" class="search-clear" hidden>Clear</button></div>
   <div class="library-filters" role="group" aria-label="Filter categories">
    <button type="button" data-filter="all" class="is-active">All <span>11</span></button><button type="button" data-filter="modpack">Mod Pack <span>1</span></button><button type="button" data-filter="dlc">DLC <span>4</span></button><button type="button" data-filter="graphics">Graphics <span>1</span></button><button type="button" data-filter="language">Language <span>5</span></button>
   </div>
  </section>
  <section class="library-content" aria-labelledby="library-heading">
   <header class="library-heading"><div class="heading-copy"><span class="heading-icon">${icon('layers')}</span><div><small>LIBRARY</small><h2 id="library-heading">Featured Mods</h2></div></div><div class="heading-tools"><span class="result-count">11 downloads</span><div class="view-toggle"><button type="button" data-view="grid" aria-label="Grid view">${gridIcon}</button><button type="button" data-view="list" aria-label="List view">${listIcon}</button></div></div></header>
   <div class="library-feed">${ITEMS.map(card).join('')}</div>
   <div class="library-empty" hidden>${icon('search')}<h3>No results</h3><p>Try another search or category.</p></div>
  </section>`;

 const feed=main.querySelector('.library-feed');
 const cards=[...main.querySelectorAll('.library-card')];
 const filters=[...main.querySelectorAll('.library-filters button')];
 const search=main.querySelector('#library-search');
 const clear=main.querySelector('.search-clear');
 const count=main.querySelector('.result-count');
 const empty=main.querySelector('.library-empty');
 const heading=main.querySelector('#library-heading');
 const views=[...main.querySelectorAll('.view-toggle button')];
 let active='all';
 let stored='grid';
 try{stored=localStorage.getItem('gtav-mod-library-view')||'grid'}catch{}
 if(!['grid','list'].includes(stored))stored='grid';
 const setView=view=>{feed.dataset.view=view;views.forEach(b=>{const on=b.dataset.view===view;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});try{localStorage.setItem('gtav-mod-library-view',view)}catch{}};
 setView(stored);views.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));

 const setOpen=(card,open)=>{const panel=card.querySelector('.collection-panel');const btn=card.querySelector('.collection-toggle');if(!panel||!btn)return;card.classList.toggle('is-open',open);panel.hidden=!open;btn.setAttribute('aria-expanded',String(open));};
 main.querySelectorAll('.collection-toggle').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.library-card');setOpen(card,!card.classList.contains('is-open'));}));

 const apply=()=>{
  const q=search.value.trim().toLowerCase();clear.hidden=!q;let downloads=0;let visibleCards=0;
  cards.forEach(card=>{const show=(active==='all'||card.dataset.type===active)&&(!q||card.dataset.search.includes(q));card.hidden=!show;if(show){visibleCards++;const item=ITEMS.find(x=>x.id===card.dataset.id);downloads+=item?.count||0;if(q&&item?.children){const childHit=item.children.some(x=>Object.values(x).join(' ').toLowerCase().includes(q));if(childHit)setOpen(card,true);}}});
  count.textContent=`${downloads} download${downloads===1?'':'s'}`;empty.hidden=visibleCards!==0;feed.hidden=visibleCards===0;const label=filters.find(b=>b.dataset.filter===active)?.childNodes[0]?.textContent?.trim();heading.textContent=active==='all'?'Featured Mods':label||'Featured Mods';
 };
 filters.forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.filter;filters.forEach(b=>b.classList.toggle('is-active',b===btn));apply();}));
 search.addEventListener('input',apply);search.addEventListener('keydown',e=>{if(e.key==='Escape'&&search.value){search.value='';apply();search.blur();}});clear.addEventListener('click',()=>{search.value='';apply();search.focus({preventScroll:true});});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,80),{once:true});else setTimeout(mount,80);
})();