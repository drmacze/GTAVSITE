/* GTA V iOS port-aware compatibility policy v2.
   Evidence is derived from the current arm64 GTA5 build and compatibility layer.
   The browser cannot read native Jetsam/app-memory allowance, Metal allocation,
   thermal state, or signing entitlements at runtime, so those remain explicitly
   unverified in this web checker. */
const compatibilityRules=Object.freeze({
 evidence:Object.freeze({
  minimumIOS:16.3,
  recommendedIOS:18,
  architecture:'arm64',
  requiresMetal:true,
  lowMemoryAutoGB:4.5,
  practicalRamMinimumGB:4,
  increasedMemoryEntitlement:true,
  gpuBaseline:'A13',
  gpuExperimental:'A12',
  enhancedEffects:'A14'
 }),
 physicalMemoryTier(ram){
  const value=Number(ram);
  if(!Number.isFinite(value)||value<=0)return null;
  if(value<=4.5)return 4;
  if(value<=6.5)return 6;
  if(value<=10)return 8;
  return 12;
 },
 appMemoryTier(limitMB){
  const value=Number(limitMB);
  if(!Number.isFinite(value)||value<0)return null;
  if(value<3000)return 4;
  if(value<4400)return 6;
  if(value<5800)return 8;
  return 12;
 },
 effectiveMemoryTier(ram,limitMB){
  const physical=this.physicalMemoryTier(ram),app=this.appMemoryTier(limitMB);
  if(physical===null)return app;
  if(app===null)return physical;
  return Math.min(physical,app);
 },
 memoryCaps(limitMB){
  const value=Number(limitMB);
  if(!Number.isFinite(value)||value<0)return null;
  if(value<3000)return {textureCacheMB:400,streamingVirtualMB:400,streamingPhysicalMB:128};
  if(value<3700)return {textureCacheMB:850,streamingVirtualMB:600,streamingPhysicalMB:160};
  if(value<4400)return {textureCacheMB:1300,streamingVirtualMB:800,streamingPhysicalMB:200};
  if(value<5800)return {textureCacheMB:1600,streamingVirtualMB:1000,streamingPhysicalMB:252};
  return null;
 },
 tierBudgets(tier){
  if(tier===4)return {textureCacheMB:400,streamingVirtualMB:400,streamingPhysicalMB:128};
  if(tier===6)return {textureCacheMB:850,streamingVirtualMB:600,streamingPhysicalMB:160};
  if(tier===8)return {textureCacheMB:1300,streamingVirtualMB:800,streamingPhysicalMB:200};
  return {textureCacheMB:1600,streamingVirtualMB:1000,streamingPhysicalMB:252};
 },
 memory(ram){
  const value=Number(ram),minimum=this.evidence.practicalRamMinimumGB;
  if(ram===null||!Number.isFinite(value))return {level:'unknown',label:'Unverified',title:'Memory data not verified',note:'No verified RAM value is available for this profile.'};
  if(value<minimum)return {level:'critical',label:'Below minimum',title:'Below the practical RAM minimum',tier:this.physicalMemoryTier(value),lowMemory:true,note:`${value} GB installed RAM is below the ${minimum} GB community minimum. The port has a low-memory path, but iRAM+ cannot add physical RAM.`};
  if(value<=this.evidence.lowMemoryAutoGB)return {level:'minimum',label:'Low-memory required',title:'Port low-memory path required',tier:this.physicalMemoryTier(value),lowMemory:true,note:`${value} GB falls inside the port's automatic Low-Memory Profile threshold (≤ ${this.evidence.lowMemoryAutoGB} GB). Use Normal textures. This checker also requires iRAM+ / Increased Memory Limit for 4 GB community setups when eligible.`};
  const tier=this.physicalMemoryTier(value);
  const texture=tier>=8?'Very High':tier>=6?'High':'Normal';
  return {level:'headroom',label:`Tier ${tier}`,title:'Physical-memory check passed',tier,lowMemory:false,note:`${value} GB maps to the port's physical memory tier ${tier}. ${texture} textures are the highest tier suggested by the port's RAM guidance, but the actual app-memory allowance can lower the effective tier.`};
 },
 ios(raw){
  const technical=this.evidence.minimumIOS,recommended=this.evidence.recommendedIOS;
  if(raw===''||raw===null||raw===undefined)return {level:'unknown',label:'Not checked',value:'Not provided',note:'Enter the installed iOS version from Settings.'};
  const value=Number(raw);
  if(!Number.isFinite(value)||value<1||value>99)return {level:'unknown',label:'Invalid entry',value:'Check your entry',note:'Enter a valid iOS version between 1 and 99.'};
  if(value<technical)return {level:'critical',label:'Below app minimum',value:'iOS '+value,note:`The current GTA5 build declares iOS ${technical} as its MinimumOSVersion.`};
  if(value<recommended)return {level:'minimum',label:'Technical minimum',value:'iOS '+value,note:`The binary permits iOS ${technical}+, but this community checker recommends iOS ${recommended}+ for the current setup path.`};
  return {level:'headroom',label:'Recommended',value:'iOS '+value,note:`iOS ${value} is above the build minimum and meets the community recommendation of iOS ${recommended}+.`};
 },
 storage(raw){
  if(raw===''||raw===null||raw===undefined)return {level:'unknown',label:'Not checked',value:'Not provided',note:'Enter your current free storage from Settings.'};
  const value=Number(raw);
  if(!Number.isFinite(value)||value<0)return {level:'unknown',label:'Invalid entry',value:'Check your entry',note:'Enter a valid non-negative storage value.'};
  if(value<=20)return {level:'critical',label:'Insufficient',value:value+' GB free',note:'1–20 GB free is below this site’s working-space policy for game data, installation, extraction, and updates.'};
  if(value<=30)return {level:'minimum',label:'Limited',value:value+' GB free',note:'21–30 GB free has limited working headroom. More than 30 GB is preferred.'};
  return {level:'headroom',label:'Good',value:value+' GB free',note:'More than 30 GB free meets this site’s preferred storage headroom.'};
 },
 soc(chip,gpuCores){
  const value=String(chip||'').trim();
  if(!value)return {level:'unknown',label:'Unverified',title:'Unknown graphics path',note:'No verified Apple SoC is available for this profile.'};
  const a=/\bA(\d{1,2})\b/i.exec(value),m=/\bM(\d{1,2})\b/i.exec(value);
  if(m){const generation=Number(m[1]);return {level:'headroom',label:'Supported',title:`Apple M${generation} path`,note:generation>=3?'M3 or later maps to the port’s highest documented GPU class.':'M1/M2 map to a high GPU class in the compatibility layer.'};}
  if(!a)return {level:'unknown',label:'Unverified',title:'Unverified Apple GPU class',note:`${value} is not mapped by this checker.`};
  const generation=Number(a[1]);
  if(generation<=11)return {level:'critical',label:'Unsupported',title:`A${generation} is below the port GPU floor`,note:'The current port logic identifies hardware older than A12/A13 paths as below its supported graphics route.'};
  if(generation===12)return {level:'minimum',label:'Experimental',title:'A12 experimental path',note:'The port contains a separate experimental A12 route using the lighter DirectX 10 path. Stability and feature coverage are limited.'};
  if(generation===13)return {level:'headroom',label:'Baseline',title:'A13 supported baseline',note:'A13 is the normal supported baseline. The port notes that corona glints and bokeh require A14.'};
  if(generation===14)return {level:'headroom',label:'Enhanced',title:'A14 supported',note:'A14 meets the baseline and enables effects that the A13 path omits.'};
  if(generation===15&&Number(gpuCores)===4)return {level:'headroom',label:'Supported',title:'A15 4-core GPU path',note:'The compatibility layer distinguishes the 4-core A15 GPU from higher A15/A16 classes.'};
  if(generation<=16)return {level:'headroom',label:'Supported',title:`A${generation} supported`,note:'This SoC maps above the A13 baseline in the port compatibility layer.'};
  if(generation<=18)return {level:'headroom',label:'High tier',title:`A${generation} Pro-class path`,note:'A17/A18-family hardware maps to a higher GPU class in the port compatibility layer.'};
  return {level:'headroom',label:'High tier',title:`A${generation} supported`,note:'This generation maps to one of the port’s highest documented Apple GPU classes.'};
 },
 textureRecommendation(ram){
  const value=Number(ram);
  if(!Number.isFinite(value))return 'Unverified';
  if(value<6)return 'Normal';
  if(value<8)return 'High';
  return 'Very High';
 },
 entry(raw,minimum,unit){return unit==='iOS'?this.ios(raw):this.storage(raw)}
});

/* Compatibility-page v2 presentation. The native app can query app-memory
   allowance and Metal state; a web page cannot, so the UI keeps those facts
   separate from model-based conclusions. */
if(typeof document!=='undefined'){
 const boot=()=>{
  if(document.body?.dataset.page!=='compatibility')return;
  const style=document.createElement('style');
  style.id='compatibility-policy-v2-style';
  style.textContent=`
   .hardware-card.critical,.runtime-grid .hardware-card.critical{border-color:rgba(229,77,77,.62)!important;background:rgba(184,45,45,.09)!important}.hardware-card.critical h3,.hardware-badge.critical,.compat-verdict.critical .verdict-icon{color:#f07b7b!important}.hardware-badge.critical{border-color:rgba(229,77,77,.5)!important;background:rgba(184,45,45,.1)!important}.compat-verdict.critical{border-color:rgba(229,77,77,.5)!important;background:rgba(184,45,45,.085)!important}
   .hardware-card.minimum,.runtime-grid .hardware-card.minimum{border-color:rgba(232,182,94,.55)!important;background:rgba(232,182,94,.065)!important}.hardware-card.minimum h3,.hardware-badge.minimum,.compat-verdict.minimum .verdict-icon{color:#e8b65e!important}.hardware-badge.minimum{border-color:rgba(232,182,94,.44)!important;background:rgba(232,182,94,.08)!important}.compat-verdict.minimum{border-color:rgba(232,182,94,.44)!important;background:rgba(232,182,94,.06)!important}
   .hardware-card.headroom,.runtime-grid .hardware-card.headroom{border-color:rgba(112,183,105,.48)!important;background:rgba(91,161,84,.055)!important}.hardware-card.headroom h3,.hardware-badge.headroom,.compat-verdict.headroom .verdict-icon{color:#9dcc91!important}.hardware-badge.headroom{border-color:rgba(112,183,105,.42)!important;background:rgba(91,161,84,.075)!important}.compat-verdict.headroom{border-color:rgba(112,183,105,.4)!important;background:rgba(91,161,84,.055)!important}
   html.compat-pinch-zoom .lazy-franklin,html.compat-pinch-zoom .ask-franklin-launcher,html.compat-pinch-zoom .franklin-nudge,html.compat-pinch-zoom .franklin-sheet-dock{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transition:none!important}
   .port-evidence{margin-top:22px;border:1px solid var(--tone-ffffff16,#ffffff16);border-radius:9px;background:var(--tone-151515,#151515);overflow:hidden}.port-evidence>summary{padding:18px 20px;border:0;font-size:10px;color:var(--fg-a8a8a8,#a8a8a8);letter-spacing:.3px}.port-evidence-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--tone-ffffff12,#ffffff12)}.port-evidence-grid>div{padding:17px 19px;border-right:1px solid var(--tone-ffffff12,#ffffff12);border-bottom:1px solid var(--tone-ffffff12,#ffffff12)}.port-evidence-grid>div:nth-child(3n){border-right:0}.port-evidence-grid span{display:block;font-size:7px;letter-spacing:1.2px;color:var(--fg-777,#777);margin-bottom:7px}.port-evidence-grid strong{display:block;font-size:12px;font-weight:600;color:var(--fg-dadada,#dadada);margin-bottom:6px}.port-evidence-grid p{font-size:9px;line-height:1.65;color:var(--fg-777,#777);margin:0}.port-evidence-note{padding:15px 19px;font-size:9px!important;color:var(--fg-777,#777)!important;margin:0!important}.runtime-grid.v2-runtime{grid-template-columns:repeat(2,minmax(0,1fr))}.hardware-card[data-v2-card]{animation:none}.memory-support[data-mode=required]{border-color:rgba(232,182,94,.42)}
   @media(max-width:750px){.port-evidence-grid{grid-template-columns:1fr 1fr}.port-evidence-grid>div:nth-child(3n){border-right:1px solid var(--tone-ffffff12,#ffffff12)}.port-evidence-grid>div:nth-child(2n){border-right:0}}
   @media(max-width:430px){.port-evidence-grid,.runtime-grid.v2-runtime{grid-template-columns:1fr}.port-evidence-grid>div{border-right:0!important}}
  `;
  document.head.append(style);

  const syncZoom=()=>document.documentElement.classList.toggle('compat-pinch-zoom',(window.visualViewport?.scale||1)>1.02);
  syncZoom();
  window.visualViewport?.addEventListener('resize',syncZoom,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncZoom,{passive:true});

  const setText=(node,text)=>{if(node&&node.textContent!==text)node.textContent=text};
  const iconName=level=>level==='critical'?'warning':level==='headroom'?'check':'info';
  const setVerdictIcon=(verdict,name)=>{const use=verdict?.querySelector('.verdict-icon use');const href='assets/icons.svg#'+name;if(use&&use.getAttribute('href')!==href)use.setAttribute('href',href)};
  const makeIcon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','assets/icons.svg#'+name);svg.append(use);return svg};
  const makeBadge=state=>{const badge=document.createElement('span');badge.className='hardware-badge '+state.level;badge.append(makeIcon(iconName(state.level)),document.createTextNode(state.label));return badge};
  const makeCard=(label,value,note,state,icon='info',key='')=>{const card=document.createElement('article');card.className='hardware-card '+state.level;card.dataset.v2Card=key||label;const top=document.createElement('div');top.className='hardware-card-top';const name=document.createElement('span');name.className='hardware-label';name.textContent=label;top.append(makeIcon(icon),name,makeBadge(state));const h=document.createElement('h3');h.textContent=value;const p=document.createElement('p');p.textContent=note;card.append(top,h,p);return card};
  const evidenceItem=(label,value,note)=>{const div=document.createElement('div');const s=document.createElement('span');s.textContent=label;const strong=document.createElement('strong');strong.textContent=value;const p=document.createElement('p');p.textContent=note;div.append(s,strong,p);return div};

  function mountEvidence(){
   if(document.querySelector('.port-evidence'))return;
   const runtime=document.querySelector('#runtime-grid');if(!runtime)return;
   const details=document.createElement('details');details.className='port-evidence';
   const summary=document.createElement('summary');summary.textContent='Port-aware compatibility evidence';
   const grid=document.createElement('div');grid.className='port-evidence-grid';
   grid.append(
    evidenceItem('BUILD TARGET','iOS 16.3+','MinimumOSVersion embedded in the current GTA5 build.'),
    evidenceItem('ARCHITECTURE','ARM64 + Metal','The current build targets arm64 and requires the Metal graphics path.'),
    evidenceItem('GPU BASELINE','A13 normal path','A12 has a separate experimental DirectX 10 route; A14 enables additional effects.'),
    evidenceItem('LOW-MEMORY','≤ 4.5 GB RAM','The executable automatically enables its Low-Memory Profile at or below this threshold.'),
    evidenceItem('MEMORY LIMIT','Native runtime check','The port combines physical RAM tier with the app memory allowance granted by iOS.'),
    evidenceItem('ENTITLEMENT','Increased memory','The current signed build requests com.apple.developer.kernel.increased-memory-limit.')
   );
   const note=document.createElement('p');note.className='port-evidence-note';note.textContent='Web limitation: Safari/Edge cannot read the native app memory allowance, Metal allocation, Jetsam limit, or whether a re-signed IPA retained the entitlement. Those checks remain unverified until measured inside the installed app.';
   details.append(summary,grid,note);runtime.parentNode.insertBefore(details,runtime.nextSibling);
  }

  let raf=0;
  const syncResults=()=>{
   raf=0;
   const result=document.querySelector('#compat-results');if(!result||result.hidden)return;
   const cards=[...document.querySelectorAll('#hardware-grid .hardware-card')];
   const findCard=label=>cards.find(card=>card.querySelector('.hardware-label')?.textContent.trim()===label);
   const ramCard=findCard('Installed RAM'),socCard=findCard('System on chip'),gpuCard=findCard('GPU');
   const ram=Number.parseFloat(ramCard?.querySelector('h3')?.textContent||'');
   const chip=socCard?.querySelector('h3')?.textContent?.trim()||'';
   const gpuCores=Number.parseFloat(gpuCard?.querySelector('h3')?.textContent||'');
   const memory=compatibilityRules.memory(Number.isFinite(ram)?ram:null);
   const soc=compatibilityRules.soc(chip,Number.isFinite(gpuCores)?gpuCores:null);

   if(ramCard){ramCard.classList.remove('critical','minimum','headroom','unknown');ramCard.classList.add(memory.level);const old=ramCard.querySelector('.hardware-badge');if(old?.className!==`hardware-badge ${memory.level}`||old?.textContent!==memory.label){old?.remove();ramCard.querySelector('.hardware-card-top')?.append(makeBadge(memory))}setText(ramCard.querySelector('p'),memory.note)}
   if(socCard){socCard.classList.remove('critical','minimum','headroom','unknown');socCard.classList.add(soc.level);const old=socCard.querySelector('.hardware-badge');if(old?.className!==`hardware-badge ${soc.level}`||old?.textContent!==soc.label){old?.remove();socCard.querySelector('.hardware-card-top')?.append(makeBadge(soc))}setText(socCard.querySelector('p'),soc.note)}

   const support=document.querySelector('#memory-support');
   if(support&&Number.isFinite(ram)){
    const label=support.querySelector('.memory-support-label'),title=support.querySelector('#memory-support-title'),copy=support.querySelector('p');
    if(ram<=4.5&&ram>=4){support.hidden=false;support.dataset.mode='required';setText(label,'LOW-MEMORY SETUP');setText(title,'Low-Memory Profile + increased memory allowance.');setText(copy,`The current port automatically enables Low-Memory Profile at ≤ 4.5 GB physical RAM and recommends Normal textures. For 4 GB community setups, this checker requires iRAM+ / Increased Memory Limit when the signing method supports it. iRAM+ does not add physical RAM.`)}
    else if(ram<4){support.hidden=false;support.dataset.mode='warning';setText(label,'MEMORY LIMIT WARNING');setText(title,'Physical RAM is below the community minimum.');setText(copy,'The port has a low-memory path, but iRAM+ only affects the app memory allowance. It cannot add physical RAM or turn a 3 GB device into a 4 GB device.')}
    else{support.hidden=true;support.removeAttribute('data-mode')}
   }

   const runtime=document.querySelector('#runtime-grid');
   if(runtime){
    runtime.classList.add('v2-runtime');
    const existing=[...runtime.querySelectorAll('.hardware-card')];
    const iosCard=existing.find(card=>card.querySelector('.hardware-label')?.textContent.trim()==='Installed iOS');
    const storageCard=existing.find(card=>card.querySelector('.hardware-label')?.textContent.trim()==='Free storage');
    const lowState=Number.isFinite(ram)&&ram<=4.5?{level:'minimum',label:'Automatic'}:{level:'headroom',label:'Not required'};
    const lowValue=Number.isFinite(ram)&&ram<=4.5?'Enabled by port':'Standard profile';
    const lowNote=Number.isFinite(ram)&&ram<=4.5?'The GTA5 executable automatically enters Low-Memory Profile on devices at or below 4.5 GB physical RAM.':'Physical RAM is above the port’s automatic Low-Memory Profile threshold.';
    if(!runtime.querySelector('[data-v2-card="low-memory"]'))runtime.append(makeCard('Low-Memory Profile',lowValue,lowNote,lowState,'memory','low-memory'));
    const entState={level:'minimum',label:'Verify signing'};
    if(!runtime.querySelector('[data-v2-card="memory-entitlement"]'))runtime.append(makeCard('App memory entitlement','Requested by build','The current GTA5 signature requests Increased Memory Limit. A web page cannot verify whether the entitlement is preserved after your IPA is re-signed.',entState,'info','memory-entitlement'));
    const pathState=soc;
    if(!runtime.querySelector('[data-v2-card="graphics-path"]'))runtime.append(makeCard('Port graphics path',soc.title,soc.note,pathState,'layers','graphics-path'));

    const verdict=document.querySelector('#compat-verdict');
    if(verdict){
     const heading=verdict.querySelector('h3'),note=verdict.querySelector('p');
     const critical=memory.level==='critical'||soc.level==='critical'||iosCard?.classList.contains('critical')||storageCard?.classList.contains('critical');
     const attention=memory.level==='minimum'||soc.level==='minimum'||iosCard?.classList.contains('minimum')||storageCard?.classList.contains('minimum');
     const level=critical?'critical':attention?'minimum':'headroom';
     if(!verdict.classList.contains(level)){verdict.classList.remove('critical','minimum','headroom','unknown');verdict.classList.add(level)}
     if(critical){setVerdictIcon(verdict,'warning');setText(heading,'One or more port requirements need attention');setText(note,'Review the red checks below. The result combines model hardware, the current port’s embedded requirements, your entered iOS version, and the site storage policy.')}
     else if(attention){setVerdictIcon(verdict,'info');setText(heading,'Compatible with conditions');setText(note,'The device reaches the port path, but one or more yellow checks require a constrained or experimental setup. Follow the Low-Memory/iRAM+ guidance and the exact release instructions.')}
     else{setVerdictIcon(verdict,'check');setText(heading,'Meets the port-aware reference checks');setText(note,'The model, iOS entry, RAM tier, and storage entry pass the web checks. Native app-memory allowance and thermal behavior still cannot be verified from the browser.')}
    }
   }

   mountEvidence();
   const sourceReview=document.querySelector('.source-review');
   setText(sourceReview,'Compatibility v2 combines the current GTA5 binary rules with the model catalog: iOS 16.3 technical minimum, iOS 18+ recommended, A12 experimental / A13 baseline, Low-Memory Profile at ≤4.5 GB, and the site storage policy of >30 GB preferred.');

   const method=document.querySelector('.performance-method');
   if(method&&!method.dataset.v2){
    method.dataset.v2='true';
    const paragraphs=method.querySelectorAll('p');
    if(paragraphs[0])paragraphs[0].textContent='Port-aware review v2. It checks installed RAM, the port’s automatic Low-Memory threshold, output resolution, texture tier, MSAA, shadows, low-memory mode, and texture cache. It still does not benchmark FPS, temperature, or the native app memory allowance.';
    if(paragraphs[1])paragraphs[1].textContent='Memory guidance follows the current port: ≤4.5 GB uses Low-Memory Profile; 4 GB should use Normal textures, 6 GB can use High, and 8 GB+ can use Very High when the actual app-memory allowance supports it. MSAA is treated as increasingly expensive at 2×/4×/8×. Texture-cache guidance uses the port’s memory-tier budgets instead of a generic percentage of physical RAM.';
    if(paragraphs[2])paragraphs[2].textContent='The result is a configuration-risk review, not a performance guarantee. iOS may grant less memory than physical RAM suggests, re-signing can change entitlements, and heat or unmodeled game scenes can still reduce stability.';
   }
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(syncResults)};
  const root=document.querySelector('#compat-results');if(root)new MutationObserver(schedule).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
  document.querySelector('#compat-start')?.addEventListener('click',()=>setTimeout(schedule,80));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}

if(typeof module!=='undefined'&&module.exports)module.exports=compatibilityRules;
