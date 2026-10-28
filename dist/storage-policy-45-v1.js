(()=>{
'use strict';
if(window.__gtavStorage45Loaded)return;
window.__gtavStorage45Loaded=true;
const MIN=45;
const policy=Object.freeze({minimumFreeGB:45,installedDataApproxGB:22,source:'Current developer game-files setup instructions'});
window.GTAVStoragePolicy=policy;

const addStyle=()=>{if(document.getElementById('storage-policy-45-style'))return;const s=document.createElement('style');s.id='storage-policy-45-style';s.textContent=`
.storage-45-note{display:block;margin-top:7px;color:#b89e6f;font-size:8px;line-height:1.55;letter-spacing:.1px}.storage-45-callout{margin:20px 0;padding:18px 19px;border:1px solid color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 28%,rgba(255,255,255,.12));border-radius:8px;background:color-mix(in srgb,var(--site-accent,var(--accent,#e8b65e)) 4%,transparent)}.storage-45-callout h3{margin:0 0 8px;font-size:12px;font-weight:650}.storage-45-callout p{margin:0;color:var(--fg-999999,#999);font-size:10px;line-height:1.8}.storage-45-callout p+p{margin-top:8px}.storage-45-path{display:block;margin-top:10px;padding:9px 10px;border:1px solid rgba(255,255,255,.08);border-radius:6px;background:rgba(255,255,255,.025);font:600 9px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--fg-cfcfcf,#cfcfcf)}
`;document.head.append(s)};

function patchCompatibility(){
 const input=document.querySelector('#compat-storage');if(!input)return;
 input.placeholder='45 minimum';
 const label=input.closest('label');
 if(label&&!label.querySelector('.storage-45-note')){const n=document.createElement('small');n.className='storage-45-note';n.textContent='45 GB free minimum before downloading or extracting the game files.';label.append(n)}
 const apply=()=>{
  const value=Number(input.value);if(!Number.isFinite(value)||input.value==='')return;
  const cards=[...document.querySelectorAll('#runtime-grid .hardware-card')];
  const card=cards.find(c=>/free storage/i.test(c.querySelector('.hardware-label')?.textContent||c.textContent||''));
  if(!card)return;
  const ok=value>=MIN,level=ok?'headroom':'critical';
  card.classList.remove('critical','minimum','headroom','unknown');card.classList.add(level);card.dataset.level=level;
  const title=card.querySelector('h3');if(title)title.textContent=`${value} GB free`;
  const note=card.querySelector('p');if(note)note.textContent=ok?'Meets the current 45 GB free-space minimum for game-file setup.':'Insufficient for setup. At least 45 GB free is required before downloading or extracting the game files. The installed data is smaller, but setup needs working space for the zip and extracted GTAV folder.';
  const badge=card.querySelector('.hardware-badge');if(badge){badge.classList.remove('critical','minimum','headroom','unknown');badge.classList.add(level);badge.textContent=ok?'Meets minimum':'Insufficient'}
  document.querySelectorAll('.compat-summary-card').forEach(summary=>{const name=summary.querySelector('span')?.textContent||'';if(!/storage/i.test(name))return;summary.dataset.level=level;const strong=summary.querySelector('strong');const small=summary.querySelector('small');if(strong)strong.textContent=`${value} GB free`;if(small)small.textContent=ok?'45 GB minimum met.':'45 GB minimum not met.'});
  if(!ok){const verdict=document.querySelector('#compat-verdict');if(verdict){verdict.classList.remove('minimum','headroom');verdict.classList.add('critical');const h=verdict.querySelector('h3');const p=verdict.querySelector('p');if(h)h.textContent='Not ready to install';if(p)p.textContent='Free storage is below the current 45 GB minimum required before downloading or extracting the GTA V game files.'}}
 };
 if(input.dataset.storage45Bound==='true'){apply();return}
 input.dataset.storage45Bound='true';input.addEventListener('input',()=>requestAnimationFrame(apply));
 const results=document.querySelector('#compat-results')||document.body;if(results.dataset.storage45Observed!=='true'){results.dataset.storage45Observed='true';new MutationObserver(()=>requestAnimationFrame(apply)).observe(results,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']})}
 apply();
}

function patchGuide(){
 const req=document.querySelector('#requirements');if(req){
  const list=req.querySelector('.guide-checklist');if(list&&!list.querySelector('[data-storage45]')){const li=document.createElement('li');li.dataset.storage45='true';li.innerHTML='<strong>Have at least 45 GB of free storage before downloading or extracting the game files.</strong> This is the current minimum setup requirement.';list.prepend(li)}
  const policyBox=req.querySelector('.guide-policy');if(policyBox){const h=policyBox.querySelector('h3'),p=policyBox.querySelector('p');if(h)h.textContent='Current storage requirement';if(p)p.textContent='The current developer setup requires at least 45 GB free before downloading or extracting the game files. The installed data is smaller, but the setup temporarily needs room for the archive and the extracted GTAV folder.'}
 }
 const section=document.querySelector('#game-files');if(section&&!section.querySelector('[data-storage45-guide]')){
  const box=document.createElement('div');box.className='storage-45-callout';box.dataset.storage45Guide='true';box.innerHTML='<h3>45 GB free minimum before you start</h3><p>For the on-iPhone setup, save the game-files zip in <strong>Files → On My iPhone</strong> — not iCloud Drive. Keep Files open while it unpacks, then move the resulting <strong>GTAV</strong> folder into <strong>On My iPhone → GTA V</strong>.</p><span class="storage-45-path">GTA V › GTAV › common.rpf</span><p>Avoid <strong>GTA V › GTAV › GTAV › common.rpf</strong> and avoid placing <strong>common.rpf</strong> directly inside <strong>GTA V</strong>. After the folder is in the correct place and verified, delete the downloaded zip to reclaim roughly 22 GB. The website still uses 45 GB free as the minimum before setup.</p>';
  const h=section.querySelector('h2');h?.insertAdjacentElement('afterend',box)
 }
}

function patchGetStarted(){
 const panel=document.querySelector('#start-panel-1');if(!panel)return;
 const note=panel.querySelector('.start-note p');if(note)note.textContent='Have at least 45 GB free before downloading or extracting the game files. Installed RAM and app-memory allowance are separate checks.';
 const intro=panel.querySelector(':scope > p');if(intro&&!/45 GB/.test(intro.textContent))intro.textContent+=' The current game-file setup requires at least 45 GB of free storage.';
}

function patchFAQ(){
 const own=document.querySelector('#faq-start-3 .answer-body p');if(own&&!/45 GB/.test(own.textContent))own.append(document.createTextNode(' Before starting the game-file setup, have at least 45 GB of free storage on the iPhone.'));
 const install=document.querySelector('#faq-install-1 .answer-body p');if(install&&!/45 GB/.test(install.textContent))install.append(document.createTextNode(' Before downloading or extracting the game files, make sure the iPhone has at least 45 GB free.'));
}

function patchTechnicalities(){
 const sec=document.querySelector('#install-size');if(!sec||sec.querySelector('[data-storage45-tech]'))return;
 const box=document.createElement('div');box.className='storage-45-callout';box.dataset.storage45Tech='true';box.innerHTML='<h3>Setup free-space requirement</h3><p>The installed data size shown above is not the amount of free space needed to perform the setup. The current requirement is <strong>45 GB free minimum</strong> before downloading or extracting the game files so the archive and extracted GTAV folder can coexist temporarily.</p>';
 (sec.querySelector(':scope > div')||sec).append(box)
}

function patchVisibleLegacyCopy(){
 document.querySelectorAll('main p,main li,main small').forEach(node=>{
  if(node.closest('#install-size')&&/21\.6|29\.5/i.test(node.textContent||''))return;
  if(node.children.length)return;
  const t=node.textContent||'';
  if(/about 30 GB free/i.test(t))node.textContent=t.replace(/about 30 GB free/ig,'at least 45 GB free');
  else if(/more than 30 GB free/i.test(t))node.textContent=t.replace(/more than 30 GB free/ig,'at least 45 GB free');
  else if(/~30 GB/i.test(t))node.textContent=t.replace(/~30 GB/ig,'45 GB minimum');
 });
}

const storageIntent=q=>/\b(storage|free space|disk space|space needed|how much space|gb free|game files?|common\.rpf|gtav folder|unpack|extract|zip)\b/i.test(String(q||''));
function storageAnswer(){return {text:'Before starting the game-file setup, have at least 45 GB of free storage on the iPhone. Keep the game-files zip in Files → On My iPhone, not iCloud Drive. Unpack it there, move the resulting GTAV folder into On My iPhone › GTA V, and verify GTA V › GTAV › common.rpf. After verification, delete the zip to reclaim roughly 22 GB. The installed data is smaller, but 45 GB free is the current minimum setup requirement.',topic:'installation',grounded:true,source:{href:'guide.html#game-files',label:'Game files guide'},suggestions:['How do I add the game files?','Check my storage']}}
function hookFranklin(){
 const fc=window.FranklinConversation;if(!fc||fc.__storage45Wrapped)return false;
 const old=fc.social?.bind(fc);fc.social=q=>storageIntent(q)?storageAnswer():(old?old(q):null);fc.__storage45Wrapped=true;return true
}

function applyAll(){addStyle();patchCompatibility();patchGuide();patchGetStarted();patchFAQ();patchTechnicalities();patchVisibleLegacyCopy();hookFranklin()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyAll,{once:true});else applyAll();
let attempts=0;const timer=setInterval(()=>{attempts++;patchCompatibility();hookFranklin();if(attempts>120||window.FranklinConversation?.__storage45Wrapped)clearInterval(timer)},250);
})();
