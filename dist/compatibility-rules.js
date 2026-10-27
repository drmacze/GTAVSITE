/* Site-level planning rules. No device detection, benchmark, or FPS estimation. */
const compatibilityRules=Object.freeze({
 memory(ram,minimum=4){
  if(ram===null||!Number.isFinite(ram))return {level:'unknown',label:'Unverified',title:'Memory data not verified',note:'No verified RAM value is available for this profile. A compatibility conclusion cannot be made.'};
  if(ram<minimum)return {level:'critical',label:'Below minimum',title:'Below the checker memory minimum',note:`${ram} GB installed RAM is below the ${minimum} GB checker minimum. iRAM+ cannot add physical RAM and compatibility is not guaranteed.`};
  if(ram===minimum)return {level:'minimum',label:'iRAM+ required',title:'Minimum RAM — iRAM+ required',note:`${ram} GB is the checker minimum. For this profile, use iRAM+ to request Increased Memory Limit before running GTA V iOS. iRAM+ does not add physical RAM.`};
  return {level:'headroom',label:'Meets RAM check',title:'Memory check passed',note:`${ram} GB installed RAM is above the ${minimum} GB checker minimum. Available app memory still depends on iOS and signing entitlements.`};
 },
 ios(raw,minimum=18){
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
  if(value<=30)return {level:'minimum',label:'Limited',value:value+' GB free',note:'21–30 GB free is usable with limited headroom. More than 30 GB free is recommended.'};
  return {level:'headroom',label:'Good',value:value+' GB free',note:'More than 30 GB free provides the preferred storage headroom for this checker.'};
 },
 entry(raw,minimum,unit){return unit==='iOS'?this.ios(raw,minimum):this.storage(raw)}
});
if(typeof module!=='undefined'&&module.exports)module.exports=compatibilityRules;
