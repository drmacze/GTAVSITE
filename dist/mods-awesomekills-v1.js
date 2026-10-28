(()=>{
'use strict';
if(window.__awesomekillsGraphicsV2)return;
window.__awesomekillsGraphicsV2=true;

const BASE='assets/mods/awesomekills/';
const SEARCH_TEXT='awesomekills graphics ios night fix lighting nighttime lighting timecycle visual graphics preset settings';
const DOWNLOAD_URL='https://gofile.io/d/e726b04a-a872-4ab3-a5b5-d877e05fa422';
const PRESET_URL=BASE+'GTA-V-graphics-settings-iPhone11.json';
const PREVIEW_ONE='https://user13692.na.imgto.link/public/20261028/e2fc4facdafeabc469b5c8e2-img-8405.avif';
const PREVIEW_TWO='https://user13692.na.imgto.link/public/20261028/ae37373de6e09c391ff08a60-img-8408.avif';

function mount(){
  const section=document.querySelector('#graphics');
  const row=section?.querySelector('.graphics-row');
  if(!section||!row)return false;
  if(row.querySelector('.awesomekills-graphics'))return true;

  const count=section.querySelector('.catalog-section-count');
  if(count)count.textContent='1 published';
  const intro=section.querySelector('.graphics-heading p');
  if(intro)intro.textContent='Graphics-focused enhancements and visual fixes for GTA V on iOS.';

  row.className='graphics-row awesomekills-row';
  row.dataset.searchExtra=SEARCH_TEXT;
  row.innerHTML=`
    <article class="awesomekills-graphics" aria-labelledby="awesomekills-title">
      <div class="awesomekills-preview" data-index="0">
        <div class="awesomekills-track" tabindex="0" aria-label="Awesomekills Graphics iOS preview screenshots">
          <figure class="awesomekills-slide">
            <img src="${PREVIEW_ONE}" alt="Awesomekills Graphics iOS preview 1" decoding="async" referrerpolicy="no-referrer">
            <figcaption><span>Preview 01</span><small>Graphics showcase</small></figcaption>
          </figure>
          <figure class="awesomekills-slide">
            <img src="${PREVIEW_TWO}" alt="Awesomekills Graphics iOS preview 2" loading="lazy" decoding="async" referrerpolicy="no-referrer">
            <figcaption><span>Preview 02</span><small>Graphics showcase</small></figcaption>
          </figure>
        </div>
        <button class="awesomekills-arrow is-prev" type="button" aria-label="Previous preview">‹</button>
        <button class="awesomekills-arrow is-next" type="button" aria-label="Next preview">›</button>
        <div class="awesomekills-dots" aria-label="Preview position">
          <button type="button" class="is-active" aria-label="Show preview 1" aria-current="true"></button>
          <button type="button" aria-label="Show preview 2"></button>
        </div>
      </div>
      <div class="awesomekills-info">
        <div class="awesomekills-meta"><span>GRAPHICS · iOS</span><span>01</span></div>
        <h3 id="awesomekills-title">Awesomekills Graphics iOS</h3>
        <ul class="awesomekills-features">
          <li>Improves nighttime lighting</li>
          <li>Improves the timecycle</li>
        </ul>
        <div class="awesomekills-actions">
          <a class="awesomekills-download" href="${DOWNLOAD_URL}" target="_blank" rel="noopener noreferrer">
            <span><small>Mod file</small>Download OIV</span><b>↗</b>
          </a>
          <a class="awesomekills-download is-secondary" href="${PRESET_URL}" download="GTA-V-graphics-settings-iPhone11.json">
            <span><small>Settings file</small>Graphics Preset</span><b>↓</b>
          </a>
        </div>
      </div>
    </article>`;

  const preview=row.querySelector('.awesomekills-preview');
  const track=preview.querySelector('.awesomekills-track');
  const slides=[...preview.querySelectorAll('.awesomekills-slide')];
  const dots=[...preview.querySelectorAll('.awesomekills-dots button')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf=0;

  const setIndex=index=>{
    index=Math.max(0,Math.min(slides.length-1,index));
    preview.dataset.index=String(index);
    dots.forEach((dot,i)=>{
      const active=i===index;
      dot.classList.toggle('is-active',active);
      if(active)dot.setAttribute('aria-current','true'); else dot.removeAttribute('aria-current');
    });
  };
  const go=index=>{
    index=Math.max(0,Math.min(slides.length-1,index));
    slides[index].scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest',inline:'start'});
    setIndex(index);
  };
  track.addEventListener('scroll',()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>setIndex(Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));
  },{passive:true});
  preview.querySelector('.is-prev').addEventListener('click',()=>go(Number(preview.dataset.index)-1));
  preview.querySelector('.is-next').addEventListener('click',()=>go(Number(preview.dataset.index)+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));

  const allCount=document.querySelector('.mods-filter-nav [data-filter="all"] .filter-count');
  const graphicsCount=document.querySelector('.mods-filter-nav [data-filter="graphics"] .filter-count');
  if(allCount)allCount.textContent='11';
  if(graphicsCount)graphicsCount.textContent='1';
  const status=document.querySelector('.mods-results-status');
  const search=document.querySelector('#mods-search');
  if(status&&!search?.value.trim())status.textContent='11 downloads';

  const reconcile=()=>{
    const query=(search?.value||'').trim().toLowerCase();
    const terms=query.split(/\s+/).filter(Boolean);
    const active=document.querySelector('.mods-filter-nav [data-filter].is-active')?.dataset.filter||'all';
    const categoryOK=active==='all'||active==='graphics';
    const queryOK=!terms.length||terms.every(term=>SEARCH_TEXT.includes(term));
    const show=categoryOK&&queryOK;
    if(active==='graphics'||terms.length){
      section.hidden=!show;
      row.hidden=!show;
    }
    if(show&&query&&status)status.textContent=`1 download for “${search.value.trim()}”`;
  };
  search?.addEventListener('input',()=>setTimeout(reconcile,120));
  document.querySelectorAll('.mods-filter-nav [data-filter]').forEach(button=>button.addEventListener('click',()=>setTimeout(reconcile,40)));

  return true;
}

if(!mount()){
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(()=>observer.disconnect(),12000);
}
})();
