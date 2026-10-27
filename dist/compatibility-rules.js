/* Site-level planning rules. No device detection, benchmark, or FPS estimation. */
const compatibilityRules=Object.freeze({
 memory(ram){
  const minimum=4;
  if(ram===null||!Number.isFinite(ram))return {level:'unknown',label:'Unverified',title:'Memory data not verified',note:'No verified RAM value is available for this profile. A compatibility conclusion cannot be made.'};
  if(ram<minimum)return {level:'critical',label:'Below minimum',title:'Below the checker memory minimum',note:`${ram} GB installed RAM is below the ${minimum} GB checker minimum. iRAM+ cannot add physical RAM and compatibility is not guaranteed.`};
  if(ram===minimum)return {level:'minimum',label:'iRAM+ required',title:'Minimum RAM — iRAM+ required',note:`${ram} GB is the checker minimum. For this profile, use iRAM+ to request Increased Memory Limit before running GTA V iOS. iRAM+ does not add physical RAM.`};
  return {level:'headroom',label:'Meets RAM check',title:'Memory check passed',note:`${ram} GB installed RAM is above the ${minimum} GB checker minimum. Available app memory still depends on iOS and signing entitlements.`};
 },
 ios(raw){
  const minimum=18;
  if(raw===''||raw===null||raw===undefined)return {level:'unknown',label:'Not checked',value:'Not provided',note:'Enter the installed iOS version from Settings.'};
  const value=Number(raw);
  if(!Number.isFinite(value)||value<1||value>99)return {level:'unknown',label:'Invalid entry',value:'Check your entry',note:'Enter a valid iOS version between 1 and 99.'};
  if(value<minimum)return {level:'critical',label:'Unsupported',value:'iOS '+value,note:`This checker requires iOS ${minimum} or later. Update iOS before using this compatibility path.`};
  return {level:'headroom',label:'Supported',value:'iOS '+value,note:`iOS ${value} meets the checker minimum of iOS ${minimum}+.`};
 },
 storage(raw){
  if(raw===''||raw===null||raw===undefined)return {level:'unknown',label:'Not checked',value:'Not provided',note:'Enter your current free storage from Settings.'};
  const value=Number(raw);
  if(!Number.isFinite(value)||value<0)return {level:'unknown',label:'Invalid entry',value:'Check your entry',note:'Enter a valid non-negative storage value.'};
  if(value<=20)return {level:'critical',label:'Insufficient',value:value+' GB free',note:'1–20 GB free is below the recommended working space for installation, extraction, game data, and updates.'};
  if(value<=30)return {level:'minimum',label:'Limited',value:value+' GB free',note:'21–30 GB free has limited headroom. More than 30 GB free is recommended.'};
  return {level:'headroom',label:'Good',value:value+' GB free',note:'More than 30 GB free provides the preferred storage headroom for this checker.'};
 },
 entry(raw,minimum,unit){return unit==='iOS'?this.ios(raw):this.storage(raw)}
});

/* Compatibility-page presentation policy. Keeps status colours explicit and
   prevents the Franklin launcher from covering content during pinch zoom. */
if(typeof document!=='undefined'){
 const boot=()=>{
  if(document.body?.dataset.page!=='compatibility')return;
  const style=document.createElement('style');
  style.id='compatibility-policy-style';
  style.textContent=`
   .hardware-card.critical,.runtime-grid .hardware-card.critical{border-color:rgba(224,86,86,.58)!important;background:rgba(177,45,45,.08)!important}
   .hardware-card.critical h3,.hardware-badge.critical,.compat-verdict.critical .verdict-icon{color:#ef7d7d!important}
   .hardware-badge.critical{border-color:rgba(224,86,86,.48)!important;background:rgba(177,45,45,.09)!important}
   .compat-verdict.critical{border-color:rgba(224,86,86,.48)!important;background:rgba(177,45,45,.08)!important}
   .hardware-card.minimum,.runtime-grid .hardware-card.minimum{border-color:rgba(232,182,94,.48)!important;background:rgba(232,182,94,.055)!important}
   .hardware-card.minimum h3,.hardware-badge.minimum,.compat-verdict.minimum .verdict-icon{color:#e8b65e!important}
   .hardware-badge.minimum{border-color:rgba(232,182,94,.4)!important;background:rgba(232,182,94,.07)!important}
   .compat-verdict.minimum{border-color:rgba(232,182,94,.4)!important;background:rgba(232,182,94,.05)!important}
   .hardware-card.headroom,.runtime-grid .hardware-card.headroom{border-color:rgba(126,179,108,.42)!important;background:rgba(126,179,108,.045)!important}
   .hardware-card.headroom h3,.hardware-badge.headroom,.compat-verdict.headroom .verdict-icon{color:#9fc58f!important}
   .hardware-badge.headroom{border-color:rgba(126,179,108,.38)!important;background:rgba(126,179,108,.06)!important}
   .compat-verdict.headroom{border-color:rgba(126,179,108,.35)!important;background:rgba(126,179,108,.045)!important}
   html.compat-pinch-zoom .lazy-franklin,html.compat-pinch-zoom .ask-franklin-launcher,html.compat-pinch-zoom .franklin-nudge,html.compat-pinch-zoom .franklin-sheet-dock{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transition:none!important}
  `;
  document.head.append(style);

  const syncZoom=()=>document.documentElement.classList.toggle('compat-pinch-zoom',(window.visualViewport?.scale||1)>1.02);
  syncZoom();
  window.visualViewport?.addEventListener('resize',syncZoom,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncZoom,{passive:true});

  const setText=(node,text)=>{if(node&&node.textContent!==text)node.textContent=text};
  const setVerdictIcon=(verdict,name)=>{
   const use=verdict?.querySelector('.verdict-icon use');
   const href='assets/icons.svg#'+name;
   if(use&&use.getAttribute('href')!==href)use.setAttribute('href',href);
  };
  let raf=0;
  const syncResults=()=>{
   raf=0;
   const result=document.querySelector('#compat-results');
   if(!result||result.hidden)return;
   const cards=[...document.querySelectorAll('#hardware-grid .hardware-card')];
   const ramCard=cards.find(card=>card.querySelector('.hardware-label')?.textContent.trim()==='Installed RAM');
   const ram=Number.parseFloat(ramCard?.querySelector('h3')?.textContent||'');
   const support=document.querySelector('#memory-support');
   if(support&&Number.isFinite(ram)){
    const label=support.querySelector('.memory-support-label');
    const title=support.querySelector('#memory-support-title');
    const copy=support.querySelector('p');
    if(ram===4){
     if(support.hidden)support.hidden=false;
     setText(label,'REQUIRED MEMORY TOOL');
     setText(title,'Use iRAM+ for this 4 GB profile.');
     setText(copy,'4 GB is the checker minimum. iRAM+ is required here to request Increased Memory Limit for an eligible Apple Account-signed installation. It does not add physical RAM or guarantee compatibility.');
    }else if(ram<4){
     if(support.hidden)support.hidden=false;
     setText(label,'MEMORY LIMIT WARNING');
     setText(title,'Installed RAM is below the checker minimum.');
     setText(copy,'iRAM+ may request a higher app memory limit on eligible signed apps, but it cannot compensate for missing physical RAM or guarantee that this device can run the project.');
    }else if(!support.hidden){
     support.hidden=true;
    }
   }

   const runtime=[...document.querySelectorAll('#runtime-grid .hardware-card')];
   const iosCard=runtime.find(card=>card.querySelector('.hardware-label')?.textContent.trim()==='Installed iOS');
   const storageCard=runtime.find(card=>card.querySelector('.hardware-label')?.textContent.trim()==='Free storage');
   const verdict=document.querySelector('#compat-verdict');
   if(verdict){
    const heading=verdict.querySelector('h3');
    const note=verdict.querySelector('p');
    const critical=ram<4||iosCard?.classList.contains('critical')||storageCard?.classList.contains('critical');
    const attention=ram===4||storageCard?.classList.contains('minimum');
    const level=critical?'critical':attention?'minimum':'headroom';
    if(!verdict.classList.contains(level)){
     verdict.classList.remove('critical','minimum','headroom','unknown');
     verdict.classList.add(level);
    }
    if(critical){
     setVerdictIcon(verdict,'warning');
     setText(heading,'One or more required checks are not met');
     setText(note,'Review the red checks below. iOS below 18, very low free storage, or RAM below 4 GB requires action before continuing.');
    }else if(attention){
     setVerdictIcon(verdict,'info');
     setText(heading,ram===4?'Minimum RAM — iRAM+ required':'Storage headroom is limited');
     setText(note,ram===4?'This 4 GB profile meets the RAM minimum, but the checker requires iRAM+ for Increased Memory Limit. Yellow storage checks also indicate limited headroom.':'The device passes the core checks, but 21–30 GB free storage leaves limited working space. More than 30 GB is preferred.');
    }else{
     setVerdictIcon(verdict,'check');
     setText(heading,'Meets the reference checks');
     setText(note,'RAM is above 4 GB, iOS is 18 or later, and free storage is above 30 GB. This is still a planning check, not a performance guarantee.');
    }
   }
   const sourceReview=document.querySelector('.source-review');
   setText(sourceReview,'Checker policy: 4 GB RAM minimum (iRAM+ required at exactly 4 GB), iOS 18+, and more than 30 GB free storage preferred.');
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(syncResults)};
  const root=document.querySelector('#compat-results');
  if(root)new MutationObserver(schedule).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
  document.querySelector('#compat-start')?.addEventListener('click',()=>setTimeout(schedule,50));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}

if(typeof module!=='undefined'&&module.exports)module.exports=compatibilityRules;
