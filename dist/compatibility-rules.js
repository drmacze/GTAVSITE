/* GTA V iOS port-aware compatibility policy v3.
   Audited from GTAV-unsigned.ipa (current GTA5 + libgtacompat build).
   The web checker can model the native rules, but it cannot query iOS Jetsam,
   Metal allocation, thermal state, or final re-sign entitlements by itself. */
const compatibilityRules=Object.freeze({
 evidence:Object.freeze({
  minimumIOS:16.3,
  recommendedIOS:18,
  architecture:'arm64',
  requiresMetal:true,
  lowMemoryAutoGB:4.5,
  practicalRamMinimumGB:4,
  increasedMemoryEntitlement:true,
  unsignedAdhocBuild:true,
  gpuBaseline:'A13',
  gpuExperimental:'A12',
  enhancedEffects:'A14',
  metalFXExtraMemoryMB:100
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
  if(!Number.isFinite(value)||value<=0)return null;
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
  if(!Number.isFinite(value)||value<=0)return null;
  if(value<3000)return {textureCacheMB:400,streamingVirtualMB:400,streamingPhysicalMB:128,capped:true};
  if(value<3700)return {textureCacheMB:850,streamingVirtualMB:600,streamingPhysicalMB:160,capped:true};
  if(value<4400)return {textureCacheMB:1300,streamingVirtualMB:800,streamingPhysicalMB:200,capped:true};
  if(value<5800)return {textureCacheMB:1600,streamingVirtualMB:1000,streamingPhysicalMB:252,capped:true};
  return {textureCacheMB:1600,streamingVirtualMB:1000,streamingPhysicalMB:252,capped:false};
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
  if(value<minimum)return {level:'critical',label:'Below minimum',title:'Below the practical RAM minimum',tier:this.physicalMemoryTier(value),lowMemory:true,note:`${value} GB installed RAM is below the ${minimum} GB community minimum. The port has a low-memory path, but Increased Memory Limit cannot add physical RAM.`};
  if(value<=this.evidence.lowMemoryAutoGB)return {level:'minimum',label:'iRAM+ required',title:'Low-memory setup required',tier:this.physicalMemoryTier(value),lowMemory:true,note:`${value} GB falls inside the port's automatic Low-Memory Profile threshold (≤ ${this.evidence.lowMemoryAutoGB} GB). Use Normal textures. For this checker, a 4 GB setup must preserve Increased Memory Limit; iRAM+ is the supported community path when eligible.`};
  const tier=this.physicalMemoryTier(value);
  const texture=tier>=8?'Very High':tier>=6?'High':'Normal';
  return {level:'headroom',label:`Tier ${tier}`,title:'Physical-memory check passed',tier,lowMemory:false,note:`${value} GB maps to physical memory tier ${tier}. ${texture} is the highest texture tier suggested by the port's RAM guidance, but iOS app-memory allowance can lower the effective tier.`};
 },
 appMemory(raw,ram){
  if(raw===''||raw===null||raw===undefined)return {level:'unknown',label:'Native metric',value:'Not entered',tier:null,effectiveTier:this.physicalMemoryTier(ram),note:'Optional advanced accuracy. Enter the memory allowance shown by the launcher/game to reproduce the native tier calculation more closely.'};
  const value=Number(raw);
  if(!Number.isFinite(value)||value<=0||value>65536)return {level:'unknown',label:'Invalid entry',value:'Check your entry',tier:null,effectiveTier:this.physicalMemoryTier(ram),note:'Enter a valid app-memory allowance in MB.'};
  const tier=this.appMemoryTier(value),effectiveTier=this.effectiveMemoryTier(ram,value),caps=this.memoryCaps(value);
  return {level:tier===4?'minimum':'headroom',label:`Tier ${tier}`,value:`${Math.round(value)} MB`,tier,effectiveTier,caps,note:`The native port combines this iOS app-memory allowance with physical RAM and uses the lower tier. Effective tier here: ${effectiveTier}.`};
 },
 ios(raw){
  const technical=this.evidence.minimumIOS,recommended=this.evidence.recommendedIOS;
  if(raw===''||raw===null||raw===undefined)return {level:'unknown',label:'Not checked',value:'Not provided',note:'Enter the installed iOS version from Settings.'};
  const value=Number(raw);
  if(!Number.isFinite(value)||value<1||value>99)return {level:'unknown',label:'Invalid entry',value:'Check your entry',note:'Enter a valid iOS version between 1 and 99.'};
  if(value<technical)return {level:'critical',label:'Unsupported',value:'iOS '+value,note:`The audited GTA5 build declares iOS ${technical} as MinimumOSVersion.`};
  if(value<recommended)return {level:'minimum',label:'Technical minimum',value:'iOS '+value,note:`The binary permits iOS ${technical}+, but this checker recommends iOS ${recommended}+ for the current community setup path.`};
  return {level:'headroom',label:'Recommended',value:'iOS '+value,note:`iOS ${value} is above the binary minimum and meets the community recommendation of iOS ${recommended}+.`};
 },
 storage(raw){
  if(raw===''||raw===null||raw===undefined)return {level:'unknown',label:'Not checked',value:'Not provided',note:'Enter your current free storage from Settings.'};
  const value=Number(raw);
  if(!Number.isFinite(value)||value<0)return {level:'unknown',label:'Invalid entry',value:'Check your entry',note:'Enter a valid non-negative storage value.'};
  if(value<=20)return {level:'critical',label:'Insufficient',value:value+' GB free',note:'1–20 GB free is below the working-space policy for game data, extraction, updates, and temporary files.'};
  if(value<=30)return {level:'minimum',label:'Limited',value:value+' GB free',note:'21–30 GB free has limited working headroom. More than 30 GB is preferred.'};
  return {level:'headroom',label:'Good',value:value+' GB free',note:'More than 30 GB free meets the preferred storage headroom.'};
 },
 soc(chip,gpuCores){
  const value=String(chip||'').trim();
  if(!value)return {level:'unknown',label:'Unverified',title:'Unknown graphics path',note:'No verified Apple SoC is available for this profile.'};
  const a=/\bA(\d{1,2})\b/i.exec(value),m=/\bM(\d{1,2})\b/i.exec(value);
  if(m){const generation=Number(m[1]);return {level:'headroom',label:generation>=3?'Highest class':'High class',title:`Apple M${generation} path`,note:generation>=3?'The launcher groups M3 or later in its highest documented GPU class.':'The launcher groups M1/M2 with the A19-class path.'};}
  if(!a)return {level:'unknown',label:'Unverified',title:'Unverified Apple GPU class',note:`${value} is not mapped by this checker.`};
  const generation=Number(a[1]);
  if(generation<=11)return {level:'critical',label:'Unsupported',title:`A${generation} below GPU floor`,note:'The launcher states that GPUs older than the A13 normal path will probably not start; only A12 has a separate experimental route.'};
  if(generation===12)return {level:'minimum',label:'Experimental',title:'A12 experimental DirectX 10 path',note:'The port has a separate A12 route using DirectX 10 and the lowest presets. Stability and feature coverage are limited.'};
  if(generation===13)return {level:'headroom',label:'Baseline',title:'A13 supported baseline',note:'A13 is the normal supported baseline. The launcher notes that corona glints and bokeh require A14.'};
  if(generation===14)return {level:'headroom',label:'Enhanced',title:'A14 supported',note:'A14 meets the normal path and enables effects omitted on A13.'};
  if(generation===15&&Number(gpuCores)===4)return {level:'headroom',label:'Supported',title:'A15 4-core GPU class',note:'The launcher distinguishes the A15 4-core GPU as its own supported class.'};
  if(generation<=16)return {level:'headroom',label:'Supported',title:'A15 / A16 GPU class',note:'The launcher groups higher A15 and A16 devices into a supported GPU class.'};
  if(generation<=18)return {level:'headroom',label:'High tier',title:'A17 Pro / A18 GPU class',note:'The launcher groups A17 Pro and A18-family hardware into a higher GPU class.'};
  return {level:'headroom',label:'High tier',title:`A${generation} high GPU class`,note:'Current launcher strings group A19 with the M1/M2 class; later generations remain above the A13 baseline.'};
 },
 textureRecommendationFromTier(tier){return tier>=8?'Very High':tier>=6?'High':'Normal'},
 textureRecommendation(ram,limitMB){return this.textureRecommendationFromTier(this.effectiveMemoryTier(ram,limitMB)||this.physicalMemoryTier(ram)||4)},
 entry(raw,minimum,unit){return unit==='iOS'?this.ios(raw):this.storage(raw)}
});

if(typeof document!=='undefined'){
 const boot=()=>{
  if(document.body?.dataset.page!=='compatibility')return;
  const style=document.createElement('style');
  style.id='compatibility-policy-v3-style';
  style.textContent=`
   .hardware-card.critical,.runtime-grid .hardware-card.critical{border-color:rgba(229,77,77,.62)!important;background:rgba(184,45,45,.09)!important}.hardware-card.critical h3,.hardware-badge.critical,.compat-verdict.critical .verdict-icon{color:#f07b7b!important}.hardware-badge.critical{border-color:rgba(229,77,77,.5)!important;background:rgba(184,45,45,.1)!important}.compat-verdict.critical{border-color:rgba(229,77,77,.5)!important;background:rgba(184,45,45,.085)!important}
   .hardware-card.minimum,.runtime-grid .hardware-card.minimum{border-color:rgba(232,182,94,.55)!important;background:rgba(232,182,94,.065)!important}.hardware-card.minimum h3,.hardware-badge.minimum,.compat-verdict.minimum .verdict-icon{color:#e8b65e!important}.hardware-badge.minimum{border-color:rgba(232,182,94,.44)!important;background:rgba(232,182,94,.08)!important}.compat-verdict.minimum{border-color:rgba(232,182,94,.44)!important;background:rgba(232,182,94,.06)!important}
   .hardware-card.headroom,.runtime-grid .hardware-card.headroom{border-color:rgba(112,183,105,.48)!important;background:rgba(91,161,84,.055)!important}.hardware-card.headroom h3,.hardware-badge.headroom,.compat-verdict.headroom .verdict-icon{color:#9dcc91!important}.hardware-badge.headroom{border-color:rgba(112,183,105,.42)!important;background:rgba(91,161,84,.075)!important}.compat-verdict.headroom{border-color:rgba(112,183,105,.4)!important;background:rgba(91,161,84,.055)!important}
   html.compat-pinch-zoom .lazy-franklin,html.compat-pinch-zoom .ask-franklin-launcher,html.compat-pinch-zoom .franklin-nudge,html.compat-pinch-zoom .franklin-sheet-dock{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transition:none!important}
   .compat-app-memory-field{grid-column:1/-1}.compat-app-memory-field small{display:block;margin-top:7px;color:var(--fg-666666,#666);font-size:8px;line-height:1.55}.port-evidence{margin-top:22px;border:1px solid var(--tone-ffffff16,#ffffff16);border-radius:9px;background:var(--tone-151515,#151515);overflow:hidden}.port-evidence>summary{padding:18px 20px;border:0;font-size:10px;color:var(--fg-a8a8a8,#a8a8a8);letter-spacing:.3px}.port-evidence-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--tone-ffffff12,#ffffff12)}.port-evidence-grid>div{padding:17px 19px;border-right:1px solid var(--tone-ffffff12,#ffffff12);border-bottom:1px solid var(--tone-ffffff12,#ffffff12)}.port-evidence-grid>div:nth-child(3n){border-right:0}.port-evidence-grid span{display:block;font-size:7px;letter-spacing:1.2px;color:var(--fg-777,#777);margin-bottom:7px}.port-evidence-grid strong{display:block;font-size:12px;font-weight:600;color:var(--fg-dadada,#dadada);margin-bottom:6px}.port-evidence-grid p{font-size:9px;line-height:1.65;color:var(--fg-777,#777);margin:0}.port-evidence-note{padding:15px 19px;font-size:9px!important;color:var(--fg-777,#777)!important;margin:0!important}.runtime-grid.port-runtime{grid-template-columns:repeat(2,minmax(0,1fr))}.hardware-card[data-port-card]{animation:none}.memory-support[data-mode=required]{border-color:rgba(232,182,94,.42)}
   @media(max-width:750px){.port-evidence-grid{grid-template-columns:1fr 1fr}.port-evidence-grid>div:nth-child(3n){border-right:1px solid var(--tone-ffffff12,#ffffff12)}.port-evidence-grid>div:nth-child(2n){border-right:0}}
   @media(max-width:430px){.port-evidence-grid,.runtime-grid.port-runtime{grid-template-columns:1fr}.port-evidence-grid>div{border-right:0!important}}
  `;
  document.head.append(style);

  const syncZoom=()=>document.documentElement.classList.toggle('compat-pinch-zoom',(window.visualViewport?.scale||1)>1.02);
  syncZoom();
  window.visualViewport?.addEventListener('resize',syncZoom,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncZoom,{passive:true});

  const advancedFields=document.querySelector('.optional-fields');
  let appMemoryInput=document.querySelector('#compat-app-memory');
  if(advancedFields&&!appMemoryInput){
   const label=document.createElement('label');label.className='compat-app-memory-field';label.htmlFor='compat-app-memory';label.append(document.createTextNode('App memory allowance (MB)'));
   appMemoryInput=document.createElement('input');appMemoryInput.id='compat-app-memory';appMemoryInput.type='number';appMemoryInput.min='1';appMemoryInput.max='65536';appMemoryInput.step='1';appMemoryInput.placeholder='Optional · e.g. 3700';appMemoryInput.inputMode='numeric';appMemoryInput.autocomplete='off';
   const help=document.createElement('small');help.textContent='Advanced accuracy. Enter the memory amount shown by the launcher/game. This is different from physical RAM.';
   label.append(appMemoryInput,help);advancedFields.append(label);
  }

  const setText=(node,text)=>{if(node&&node.textContent!==text)node.textContent=text};
  const iconName=level=>level==='critical'?'warning':level==='headroom'?'check':'info';
  const makeIcon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','assets/icons.svg#'+name);svg.append(use);return svg};
  const makeBadge=state=>{const badge=document.createElement('span');badge.className='hardware-badge '+state.level;badge.append(makeIcon(iconName(state.level)),document.createTextNode(state.label));return badge};
  const setState=(card,state)=>{if(!card)return;const current=['critical','minimum','headroom','unknown'].find(x=>card.classList.contains(x));if(current!==state.level){card.classList.remove('critical','minimum','headroom','unknown');card.classList.add(state.level)}const old=card.querySelector('.hardware-badge');if(!old||old.className!==`hardware-badge ${state.level}`||old.textContent!==state.label){old?.remove();card.querySelector('.hardware-card-top')?.append(makeBadge(state))}};
  const upsertCard=(root,key,label,value,note,state,icon='info')=>{let card=root.querySelector(`[data-port-card="${key}"]`);if(!card){card=document.createElement('article');card.dataset.portCard=key;const top=document.createElement('div');top.className='hardware-card-top';const name=document.createElement('span');name.className='hardware-label';name.textContent=label;top.append(makeIcon(icon),name);const h=document.createElement('h3');const p=document.createElement('p');card.append(top,h,p);root.append(card)}card.classList.add('hardware-card');setState(card,state);setText(card.querySelector('h3'),value);setText(card.querySelector('p'),note);return card};
  const evidenceItem=(label,value,note)=>{const div=document.createElement('div'),s=document.createElement('span'),strong=document.createElement('strong'),p=document.createElement('p');s.textContent=label;strong.textContent=value;p.textContent=note;div.append(s,strong,p);return div};
  const setVerdictIcon=(verdict,name)=>{const use=verdict?.querySelector('.verdict-icon use');const href='assets/icons.svg#'+name;if(use&&use.getAttribute('href')!==href)use.setAttribute('href',href)};

  function mountEvidence(){
   if(document.querySelector('.port-evidence'))return;
   const runtime=document.querySelector('#runtime-grid');if(!runtime)return;
   const details=document.createElement('details');details.className='port-evidence';
   const summary=document.createElement('summary');summary.textContent='Audited IPA compatibility evidence';
   const grid=document.createElement('div');grid.className='port-evidence-grid';
   grid.append(
    evidenceItem('BUILD TARGET','iOS 16.3+','GTA5 and every bundled dylib declare minos 16.3.'),
    evidenceItem('ARCHITECTURE','ARM64 + Metal','Info.plist requires arm64 and metal; every Mach-O in the IPA is arm64.'),
    evidenceItem('SIGNATURE','Ad-hoc / unsigned','CodeDirectory flags are ad-hoc (0x2); no embedded.mobileprovision is bundled.'),
    evidenceItem('MEMORY ENTITLEMENT','Requested','GTA5 embeds com.apple.developer.kernel.increased-memory-limit = true. Final signing must preserve it.'),
    evidenceItem('LOW-MEMORY AUTO','≤ 4.5 GB','The native MemoryTier function and launcher strings use the 4.5 GB threshold.'),
    evidenceItem('APP MEMORY TIERS','3.0 / 4.4 / 5.8 GB','Native thresholds are <3000 → tier 4, <4400 → tier 6, <5800 → tier 8, otherwise tier 12.'),
    evidenceItem('GPU PATH','A12 experimental · A13 baseline','A12 uses the lighter DirectX 10 path. Launcher strings say older than A13 will probably not start.'),
    evidenceItem('A14 EFFECTS','Enhanced','Corona glints and bokeh are explicitly noted as requiring A14.'),
    evidenceItem('METALFX','Native framework','winemetal links MetalFX; launcher notes spatial upscaling uses about 100 MB extra memory.')
   );
   const note=document.createElement('p');note.className='port-evidence-note';note.textContent='This web page reproduces the audited policy logic. Only the native app can read os_proc_available_memory, task_info, Metal allocation, thermal state, and the entitlement state after re-signing.';
   details.append(summary,grid,note);runtime.after(details);
  }

  let raf=0;
  function syncResults(){
   raf=0;
   const result=document.querySelector('#compat-results');if(!result||result.hidden)return;
   const hardware=[...document.querySelectorAll('#hardware-grid .hardware-card')];
   const findHardware=label=>hardware.find(card=>card.querySelector('.hardware-label')?.textContent.trim()===label);
   const ramCard=findHardware('Installed RAM'),socCard=findHardware('System on chip'),gpuCard=findHardware('GPU');
   const ram=Number.parseFloat(ramCard?.querySelector('h3')?.textContent||'');
   const chip=socCard?.querySelector('h3')?.textContent.trim()||'';
   const gpuCores=Number.parseFloat(gpuCard?.querySelector('h3')?.textContent||'');
   const memory=compatibilityRules.memory(ram),soc=compatibilityRules.soc(chip,gpuCores);
   setState(ramCard,memory);setText(ramCard?.querySelector('p'),memory.note);
   setState(socCard,soc);setText(socCard?.querySelector('p'),soc.note);

   const app=compatibilityRules.appMemory(appMemoryInput?.value||'',ram);
   const effectiveTier=app.effectiveTier||compatibilityRules.physicalMemoryTier(ram);
   const budget=app.caps||compatibilityRules.tierBudgets(effectiveTier||4);
   const texture=compatibilityRules.textureRecommendationFromTier(effectiveTier||4);

   const support=document.querySelector('#memory-support');
   if(support&&Number.isFinite(ram)){
    const label=support.querySelector('.memory-support-label'),title=support.querySelector('#memory-support-title'),copy=support.querySelector('p');
    if(ram>=4&&ram<=4.5){support.hidden=false;support.dataset.mode='required';setText(label,'REQUIRED 4 GB MEMORY SETUP');setText(title,'Low-Memory Profile + Increased Memory Limit.');setText(copy,'The port automatically enables Low-Memory Profile at 4.5 GB RAM or less. This audited GTA5 binary requests Increased Memory Limit. Because the IPA is ad-hoc/unsigned, the final signing method must preserve that entitlement; use iRAM+ for eligible 4 GB community installs when needed.')}
    else if(ram<4){support.hidden=false;support.dataset.mode='warning';setText(label,'MEMORY LIMIT WARNING');setText(title,'Physical RAM is below the community minimum.');setText(copy,'The port has a low-memory path, but Increased Memory Limit only changes the app allowance. It cannot add physical RAM.')}
    else{support.hidden=true;support.removeAttribute('data-mode')}
   }

   const runtime=document.querySelector('#runtime-grid');
   if(runtime){
    runtime.classList.add('port-runtime');
    const existing=[...runtime.querySelectorAll('.hardware-card')];
    const iosCard=existing.find(card=>card.querySelector('.hardware-label')?.textContent.trim()==='Installed iOS');
    const storageCard=existing.find(card=>card.querySelector('.hardware-label')?.textContent.trim()==='Free storage');
    const lowState=Number.isFinite(ram)&&ram<=4.5?{level:'minimum',label:'Automatic'}:{level:'headroom',label:'Standard'};
    upsertCard(runtime,'low-memory','Low-Memory Profile',Number.isFinite(ram)&&ram<=4.5?'Enabled by port':'Standard profile',Number.isFinite(ram)&&ram<=4.5?'The native code automatically enters Low-Memory Profile at 4.5 GB physical RAM or less.':'Physical RAM is above the automatic Low-Memory threshold.',lowState,'memory');
    upsertCard(runtime,'memory-entitlement','Increased Memory Limit','Requested by build','The uploaded IPA embeds the Increased Memory Limit entitlement, but it is ad-hoc/unsigned. Verify that your final signer preserves the entitlement.',{level:'minimum',label:'Verify signing'},'info');
    upsertCard(runtime,'app-memory','App memory allowance',app.value,app.note,app,'memory');
    const tierState=app.tier===null?{level:'minimum',label:'Physical estimate'}:{level:effectiveTier<=4?'minimum':'headroom',label:`Effective tier ${effectiveTier}`};
    upsertCard(runtime,'effective-tier','Effective memory tier',`Tier ${effectiveTier||'?'}`,app.tier===null?'Based on physical RAM only. Enter App memory allowance above for the same min(physical tier, app tier) calculation used by the native port.':`Physical tier ${compatibilityRules.physicalMemoryTier(ram)} and app tier ${app.tier}; the port uses the lower value.`,tierState,'memory');
    const budgetState={level:effectiveTier<=4?'minimum':'headroom',label:'Port budget'};
    upsertCard(runtime,'memory-budget','Texture / streaming budget',`${budget.textureCacheMB} · ${budget.streamingVirtualMB}+${budget.streamingPhysicalMB} MB`,`Texture cache ${budget.textureCacheMB} MB; streaming virtual ${budget.streamingVirtualMB} MB + physical ${budget.streamingPhysicalMB} MB.${app.caps&&app.caps.capped===false?' At ≥5800 MB app allowance the explicit app-limit cap is removed; these are tier defaults.':''}`,budgetState,'storage');
    upsertCard(runtime,'texture-tier','Recommended texture tier',texture,`Launcher guidance: 4 GB devices need Normal, 6 GB or more can use High, and 8 GB or more can use Very High. Effective app-memory tier can lower this recommendation.`,{level:effectiveTier<=4?'minimum':'headroom',label:'Port guidance'},'layers');
    upsertCard(runtime,'graphics-path','Port graphics path',soc.title,soc.note,soc,'layers');

    const verdict=document.querySelector('#compat-verdict');
    if(verdict){
     const heading=verdict.querySelector('h3'),note=verdict.querySelector('p');
     const critical=memory.level==='critical'||soc.level==='critical'||iosCard?.classList.contains('critical')||storageCard?.classList.contains('critical');
     const allowanceConstrains=app.tier!==null&&effectiveTier<compatibilityRules.physicalMemoryTier(ram);
     const attention=memory.level==='minimum'||soc.level==='minimum'||iosCard?.classList.contains('minimum')||storageCard?.classList.contains('minimum')||allowanceConstrains;
     const level=critical?'critical':attention?'minimum':'headroom';
     if(!verdict.classList.contains(level)){verdict.classList.remove('critical','minimum','headroom','unknown');verdict.classList.add(level)}
     if(critical){setVerdictIcon(verdict,'warning');setText(heading,'One or more port requirements need attention');setText(note,'Review the red checks below. This result combines audited IPA requirements, model hardware, your iOS entry, and the storage policy.')}
     else if(attention){setVerdictIcon(verdict,'info');setText(heading,'Compatible with conditions');setText(note,allowanceConstrains?'The iOS app-memory allowance lowers this device below its physical-RAM tier. Use the effective tier and budgets shown below.':'The device reaches a supported port path, but one or more yellow checks require a constrained, experimental, or minimum setup.')}
     else{setVerdictIcon(verdict,'check');setText(heading,'Meets the port-aware reference checks');setText(note,app.tier===null?'The visible checks pass. For maximum accuracy, enter the app-memory allowance reported by the launcher/game.':'The model, iOS, storage, and effective memory tier pass the web checks. Thermal behavior still requires native runtime data.')}
    }
   }

   mountEvidence();
   const sourceReview=document.querySelector('.source-review');
   setText(sourceReview,'Compatibility v3 is audited against GTAV-unsigned.ipa: iOS 16.3 technical minimum, iOS 18+ recommended, A12 experimental / A13 baseline, Low-Memory Profile at ≤4.5 GB, native app-memory tiers at 3000/4400/5800 MB, and >30 GB free storage preferred.');
  }
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(syncResults)};
  const root=document.querySelector('#compat-results');if(root)new MutationObserver(schedule).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
  document.querySelector('#compat-start')?.addEventListener('click',()=>setTimeout(schedule,80));
  appMemoryInput?.addEventListener('input',schedule);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}

if(typeof module!=='undefined'&&module.exports)module.exports=compatibilityRules;
