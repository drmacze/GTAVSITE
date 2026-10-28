(()=>{
'use strict';
const path=(location.pathname||'').replace(/\/+$/,'');
if(!(path.endsWith('/compatibility')||path.endsWith('/compatibility.html')))return;
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
ready(()=>{
 const results=document.querySelector('#compat-results');
 const hardware=document.querySelector('#hardware-grid');
 const runtime=document.querySelector('#runtime-grid');
 const required=document.querySelector('.optional-checks');
 if(!results||!hardware||!runtime||!required)return;
 const icon=name=>`<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#${name}"></use></svg>`;
 const heading=document.querySelector('.compat-heading h1');
 if(heading){heading.textContent='Can this iPhone run it?';heading.removeAttribute('data-shine')}
 const intro=document.querySelector('.compat-heading p');if(intro)intro.textContent='Enter your iOS version and free storage, then scan your saved iPhone against the current GTA V iOS port requirements.';
 const eyebrow=document.querySelector('.compat-heading .eyebrow span');if(eyebrow)eyebrow.textContent='COMPATIBILITY';
 const step=document.querySelector('.compat-step');if(step)step.textContent='YOUR IPHONE';
 const lookup=document.querySelector('.lookup-tag');if(lookup)lookup.textContent='Saved from Welcome';
 const summary=required.querySelector('summary');if(summary){summary.childNodes[0].nodeValue='Device details ';const badge=summary.querySelector('span');if(badge)badge.textContent=''}
 const note=required.querySelector(':scope>p');if(note)note.textContent='iOS version and free storage are required for the scan.';
 const caption=document.querySelector('.compat-caption');if(caption)caption.textContent='Uses your saved iPhone model. The browser does not perform live hardware access.';
 const advanced=document.createElement('details');advanced.className='compat-advanced';advanced.innerHTML='<summary>Advanced memory (optional)</summary>';
 required.insertAdjacentElement('afterend',advanced);
 const moveMemory=()=>{const field=document.querySelector('.compat-app-memory-field');if(field&&field.parentElement!==advanced)advanced.append(field)};moveMemory();
 const verdict=document.querySelector('#compat-verdict');
 const title=document.createElement('div');title.className='compat-summary-title';title.innerHTML='<h3>Compatibility checks</h3><span>Current port</span>';
 const grid=document.createElement('div');grid.className='compat-summary-grid';grid.id='compat-summary-grid';
 const actions=document.createElement('div');actions.className='compat-result-actions';actions.innerHTML=`<button type="button" class="primary" id="compat-fps-action">FPS Benchmark${icon('arrow-right')}</button><button type="button" id="compat-edit-action">Edit details${icon('arrow-right')}</button>`;
 const tech=document.createElement('details');tech.className='compat-tech';tech.innerHTML='<summary>Technical details</summary><div class="compat-tech-body"></div>';
 if(verdict){verdict.insertAdjacentElement('afterend',title);title.insertAdjacentElement('afterend',grid)}
 const memory=document.querySelector('#memory-support');(memory||grid).insertAdjacentElement('afterend',actions);actions.insertAdjacentElement('afterend',tech);
 const techBody=tech.querySelector('.compat-tech-body');
 [hardware,document.querySelector('.runtime-heading'),runtime,document.querySelector('.port-evidence'),document.querySelector('.compat-footnote'),document.querySelector('.compat-sources')].forEach(n=>{if(n)techBody.append(n)});
 const perf=document.querySelector('#performance-check');if(perf)perf.hidden=true;
 const labelOf=c=>c?.querySelector('.hardware-label')?.textContent.trim()||'';
 const find=(root,label)=>[...root.querySelectorAll('.hardware-card')].find(c=>labelOf(c).toLowerCase()===label.toLowerCase());
 const level=c=>c?.classList.contains('critical')?'critical':c?.classList.contains('minimum')?'minimum':c?.classList.contains('headroom')?'headroom':'information';
 const card=(label,c)=>{const el=document.createElement('article');el.className='compat-summary-card';el.dataset.level=level(c);const value=c?.querySelector('h3')?.textContent.trim()||'—';const badge=c?.querySelector('.hardware-badge')?.textContent.trim()||'';el.innerHTML=`<span>${label}</span><strong>${value}</strong>${badge?`<small>${badge}</small>`:''}`;return el};
 let queued=false;function rebuild(){queued=false;grid.replaceChildren(card('Chip',find(hardware,'System on chip')),card('GPU',find(hardware,'GPU')),card('RAM',find(hardware,'Installed RAM')),card('iOS',find(runtime,'Installed iOS')),card('Free storage',find(runtime,'Free storage')))}
 const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(rebuild)};new MutationObserver(schedule).observe(hardware,{childList:true,subtree:true});new MutationObserver(schedule).observe(runtime,{childList:true,subtree:true});rebuild();
 document.querySelector('#compat-edit-action')?.addEventListener('click',()=>document.querySelector('#compat-details')?.click());
 const fps=document.querySelector('#compat-fps-action');let loading=false;
 fps?.addEventListener('click',()=>{
  if(window.GTAVBenchmarkLab?.open){window.GTAVBenchmarkLab.open();return}
  if(loading)return;loading=true;fps.disabled=true;const node=fps.firstChild;const old=node?.nodeValue||'FPS Benchmark';if(node)node.nodeValue='Loading benchmark…';
  const s=document.createElement('script');s.src='/compatibility-benchmark-lab.js?v=20261028fast1';s.async=true;
  s.onload=()=>{loading=false;fps.disabled=false;if(node)node.nodeValue=old;window.GTAVBenchmarkLab?.open?.()};
  s.onerror=()=>{loading=false;fps.disabled=false;if(node)node.nodeValue='FPS Benchmark';alert('Benchmark tools could not be loaded. Please try again.')};
  document.head.append(s);
 });
});
})();