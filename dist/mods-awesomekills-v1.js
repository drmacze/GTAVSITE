(()=>{
'use strict';
if(window.__awesomekillsGraphicsV2)return;
window.__awesomekillsGraphicsV2=true;

const BASE='assets/mods/awesomekills/';
const PRESET=BASE+'GTA-V-graphics-settings-iPhone11.json';
const SEARCH_TEXT='awesomekills graphics ios night fix lighting pencahayaan malam timecycle visual preset iphone 11 a13 4 gb 960 540 50 fps';

async function loadPreview(path,img){
  try{
    const res=await fetch(BASE+path,{cache:'force-cache'});
    if(!res.ok)throw new Error(String(res.status));
    const encoded=(await res.text()).trim();
    if(!encoded)throw new Error('empty');
    img.src='data:image/webp;base64,'+encoded;
  }catch{
    img.closest('.awesomekills-slide')?.classList.add('preview-unavailable');
  }
}

function mount(){
  const section=document.querySelector('#graphics');
  const row=section?.querySelector('.graphics-row');
  if(!section||!row)return false;
  if(row.querySelector('.awesomekills-graphics'))return true;

  const count=section.querySelector('.catalog-section-count');
  if(count)count.textContent='1 published';
  const intro=section.querySelector('.graphics-heading p');
  if(intro)intro.textContent='Graphics-focused enhancements, visual fixes and optional presets for GTA V on iOS.';

  row.className='graphics-row awesomekills-row';
  row.dataset.searchExtra=SEARCH_TEXT;
  row.innerHTML=`
    <article class="awesomekills-graphics" aria-labelledby="awesomekills-title">
      <div class="awesomekills-preview" data-index="0">
        <div class="awesomekills-track" tabindex="0" aria-label="Awesomekills Graphics iOS preview screenshots">
          <figure class="awesomekills-slide">
            <img alt="Awesomekills Graphics iOS night lighting preview" decoding="async">
            <figcaption><span>Night</span><small>Lighting fix</small></figcaption>
          </figure>
          <figure class="awesomekills-slide">
            <img alt="Awesomekills Graphics iOS daytime preview" loading="lazy" decoding="async">
            <figcaption><span>Day</span><small>Timecycle preview</small></figcaption>
          </figure>
        </div>
        <button class="awesomekills-arrow is-prev" type="button" aria-label="Previous preview">‹</button>
        <button class="awesomekills-arrow is-next" type="button" aria-label="Next preview">›</button>
        <div class="awesomekills-dots" aria-label="Preview position">
          <button type="button" class="is-active" aria-label="Show night preview" aria-current="true"></button>
          <button type="button" aria-label="Show day preview"></button>
        </div>
      </div>
      <div class="awesomekills-info">
        <div class="awesomekills-meta"><span>GRAPHICS · iOS</span><span>01</span></div>
        <h3 id="awesomekills-title">Awesomekills Graphics iOS</h3>
        <ul class="awesomekills-features">
          <li>Memperbaiki pencahayaan malam</li>
          <li>Memperbaiki timecycle</li>
        </ul>
        <div class="awesomekills-preset-note">
          <span>OPTIONAL PRESET</span>
          <p>iPhone 11 (A13, 4 GB) · 960 × 540 · 50 FPS</p>
        </div>
        <div class="awesomekills-actions">
          <button class="awesomekills-download is-pending" type="button" aria-disabled="true">
            <span><small>Mod file</small>Download OIV</span><b>Public link pending</b>
          </button>
          <a class="awesomekills-download is-secondary" href="${PRESET}" download="GTA V graphics settings.json">
            <span><small>Optional</small>Preset JSON</span><b>↓</b>
          </a>
        </div>
      </div>
    </article>`;

  const images=[...row.querySelectorAll('.awesomekills-slide img')];
  loadPreview('night-1.b64',images[0]);
  loadPreview('day-1.b64',images[1]);

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

  const pending=row.querySelector('.is-pending');
  pending.addEventListener('click',()=>{
    const label=pending.querySelector('b');
    const old=label.textContent;
    label.textContent='Need public file URL';
    setTimeout(()=>label.textContent=old,1800);
  });

  return true;
}

if(!mount()){
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(()=>observer.disconnect(),12000);
}
})();
