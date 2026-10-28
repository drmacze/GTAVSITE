(()=>{
'use strict';
if(window.__gtavModsUiFixV3)return;
window.__gtavModsUiFixV3=true;

const main=document.querySelector('.mods-studio');
if(!main)return;
main.classList.add('mods-ui-v3');

const feature=main.querySelector('.mods-feature');
const dlc=main.querySelector('.mods-dlc');
const languages=main.querySelector('.mods-languages');
const heading=main.querySelector('.mods-heading');

if(feature&&!feature.id)feature.id='mods';
if(dlc&&!dlc.id)dlc.id='dlc';
if(languages&&!languages.id)languages.id='languages';

function addCategoryNav(){
  if(!heading||heading.querySelector('.mods-category-nav'))return;
  const nav=document.createElement('nav');
  nav.className='mods-category-nav';
  nav.setAttribute('aria-label','Mod categories');
  nav.innerHTML=`
    <a href="#mods" data-mod-category="mods"><span>01</span>Mod Pack</a>
    <a href="#dlc" data-mod-category="dlc"><span>02</span>DLC</a>
    <a href="#graphics" data-mod-category="graphics"><span>03</span>Graphics</a>
    <a href="#languages" data-mod-category="languages"><span>04</span>Language</a>`;
  heading.append(nav);

  nav.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link)return;
    const target=document.querySelector(link.getAttribute('href'));
    if(!target)return;
    event.preventDefault();
    target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
  });
}

function addGraphicsSection(){
  if(main.querySelector('#graphics'))return;
  const section=document.createElement('section');
  section.className='mods-graphics';
  section.id='graphics';
  section.setAttribute('aria-labelledby','graphics-title');
  section.innerHTML=`
    <header class="graphics-heading">
      <span class="eyebrow">GRAPHICS</span>
      <div>
        <h2 id="graphics-title">Visual enhancements.</h2>
        <p>Graphics presets and rendering-focused mods will live here, separate from gameplay and DLC packs.</p>
      </div>
    </header>
    <div class="graphics-row">
      <span class="graphics-index">01</span>
      <div class="graphics-copy">
        <strong>Graphics packs</strong>
        <p>No graphics download has been published here yet.</p>
      </div>
      <span class="graphics-status">Ready for packs</span>
    </div>`;
  if(languages)languages.before(section);
  else main.append(section);
}

function normalizeDlc(){
  main.querySelectorAll('.dlc-pack').forEach(pack=>{
    pack.classList.add('dlc-pack-v3');
    const summary=pack.querySelector(':scope > summary');
    if(!summary)return;
    summary.querySelectorAll('span,strong,small,b').forEach(node=>{
      node.style.removeProperty('transform');
      node.style.removeProperty('rotate');
      node.style.removeProperty('writing-mode');
    });
  });
}

function trackCategories(){
  if(!('IntersectionObserver'in window))return;
  const links=[...main.querySelectorAll('.mods-category-nav a')];
  const sections=links.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if(!links.length||!sections.length)return;
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    links.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')==='#'+visible.target.id));
  },{rootMargin:'-25% 0px -58% 0px',threshold:[0,.1,.35,.65]});
  sections.forEach(section=>observer.observe(section));
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}

addGraphicsSection();
addCategoryNav();
normalizeDlc();
trackCategories();
})();
