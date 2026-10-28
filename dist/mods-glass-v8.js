(()=>{
'use strict';
if(window.__gtavModsGlassV8)return;
window.__gtavModsGlassV8=true;

const main=document.querySelector('.mods-studio');
if(!main)return;
main.classList.add('mods-glass-v8');

const svg=(id,cls='glass-icon')=>`<svg class="${cls}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${id}"></use></svg>`;

const heading=main.querySelector('.mods-heading');
if(heading){
  const eyebrow=heading.querySelector('.eyebrow');
  const title=heading.querySelector('h1');
  const copy=heading.querySelector('p');
  if(eyebrow)eyebrow.innerHTML=`${svg('sparkles','heading-kicker-icon')}<span>MOD LIBRARY</span>`;
  if(title)title.textContent='Mods';
  if(copy)copy.textContent='Browse, preview and download community content for GTA V on iOS.';
}

const searchLine=main.querySelector('.mods-search-line');
if(searchLine){
  const old=searchLine.querySelector('.mods-search-icon');
  if(old)old.outerHTML=svg('search','mods-search-icon');
}

const filterIcons={all:'layers',mods:'package',dlc:'archive',graphics:'palette',languages:'languages'};
main.querySelectorAll('.mods-filter-nav [data-filter]').forEach(button=>{
  if(button.querySelector('.filter-icon'))return;
  const id=filterIcons[button.dataset.filter]||'layers';
  button.insertAdjacentHTML('afterbegin',svg(id,'filter-icon'));
});

function enhanceSectionHeader(section,selector,iconId,label){
  const header=section?.querySelector(selector);
  if(!header||header.querySelector('.glass-section-icon'))return;
  const eyebrow=header.querySelector('.eyebrow');
  const textWrap=header.querySelector('div')||header;
  const icon=document.createElement('span');
  icon.className='glass-section-icon';
  icon.innerHTML=svg(iconId);
  header.prepend(icon);
  if(eyebrow){
    const count=eyebrow.querySelector('.catalog-section-count')?.outerHTML||'';
    eyebrow.innerHTML=`${label}${count}`;
  }
  textWrap.classList.add('glass-section-copy');
}

const feature=main.querySelector('#mods');
if(feature){
  const card=feature.querySelector('.mod-editorial');
  if(card&&!card.querySelector('.glass-card-topline')){
    const top=document.createElement('div');
    top.className='glass-card-topline';
    top.innerHTML=`<span class="glass-section-icon is-small">${svg('package')}</span><span>Gameplay Mod</span>`;
    card.prepend(top);
  }
  const eyebrow=card?.querySelector(':scope>.eyebrow');
  if(eyebrow)eyebrow.style.display='none';
  const download=card?.querySelector('.mods-download');
  if(download){
    const icon=download.querySelector('.icon');
    if(icon)icon.outerHTML=svg('download-modern','icon');
  }
}

const dlc=main.querySelector('#dlc');
if(dlc){
  enhanceSectionHeader(dlc,'.dlc-heading','archive','DLC');
  dlc.querySelectorAll('.dlc-pack').forEach((pack,index)=>{
    const summary=pack.querySelector(':scope>summary');
    if(!summary)return;
    let marker=summary.querySelector('.dlc-index');
    if(marker){
      marker.classList.add('dlc-icon-slot');
      marker.innerHTML=svg('archive','dlc-card-icon');
      marker.setAttribute('aria-hidden','true');
    }
    const download=pack.querySelector('.dlc-download .icon');
    if(download)download.outerHTML=svg('download-modern','icon');
  });
}

const graphics=main.querySelector('#graphics');
if(graphics){
  enhanceSectionHeader(graphics,'.graphics-heading','palette','GRAPHICS');
  const meta=graphics.querySelector('.awesomekills-meta');
  if(meta){
    const first=meta.querySelector('span');
    if(first)first.innerHTML=`${svg('palette','meta-inline-icon')}<span>Graphics · iOS</span>`;
    const last=meta.querySelector('span:last-child');
    if(last)last.remove();
  }
  graphics.querySelectorAll('.awesomekills-download').forEach((link,index)=>{
    const b=link.querySelector('b');
    if(b)b.innerHTML=svg(index===0?'download-modern':'sliders','action-icon');
  });
}

const languages=main.querySelector('#languages');
if(languages){
  const summary=languages.querySelector('.language-picker>summary');
  if(summary&&!summary.querySelector('.language-summary-icon')){
    summary.insertAdjacentHTML('afterbegin',`<span class="glass-section-icon language-summary-icon">${svg('languages')}</span>`);
  }
  languages.querySelectorAll('.language-action .icon').forEach(icon=>icon.outerHTML=svg('download-modern','icon'));
}

const endLink=main.querySelector('.mods-end a .icon');
if(endLink)endLink.outerHTML=svg('arrow-right','icon');
})();
