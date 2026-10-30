(()=>{
'use strict';
if(window.__gtavFranklinLatestKBV2)return;
window.__gtavFranklinLatestKBV2=true;

const IOS_MIN=16.3;
const IOS_RECOMMENDED=18;
const CURRENT_MOBILE='29 Oct 2026';
const CURRENT_MOBILE_KEY='release-20261029-ios';
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+./-]+/g,' ').replace(/\s+/g,' ').trim();
const context=()=>{try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}};
const sessionBuild=()=>{
 const s=context();
 if(s.build?.label){const date=String(s.build.label).match(/(\d{1,2}\s+Oct)/i);return date?`${date[1]} 2026`:String(s.build.label)}
 if(s.releaseKey===CURRENT_MOBILE_KEY)return CURRENT_MOBILE;
 return'';
};
const reply=(text,topic='latest-project-knowledge',source='updates.html',extra={})=>({
 text,topic,grounded:true,
 source:{href:source,label:source.includes('downloads')?'Mods Library':source.includes('compatibility')?'Compatibility':'Updates'},
 suggestions:topic==='mods-guide'?['Which mod formats are supported?','How do I import a mod?']:topic==='ios-requirement'?['What build am I using?','Where do I get the current build?']:['What iOS version is recommended?','How do I update?'],
 ...extra
});

function latestMobileAnswer(){
 const selected=sessionBuild();
 const selectedLine=selected===CURRENT_MOBILE?' Your support session is already set to 29 Oct 2026.':'';
 return reply(`The current public iPhone/iPad release is 29 Oct 2026.${selectedLine}\n\nGet the current build through the project Updates page or Discord. I do not have a verified GTA5 UUID or compat timestamp for the 29 Oct release in the supplied release metadata, so I will not reuse the 28 Oct UUID or invent one.\n\nIf a log from your installed 29 Oct build contains a GTA5 UUID, Franklin can use that log value for troubleshooting.`,'latest-release','updates.html',{discord:true});
}
function iosRequirementAnswer(){
 const s=context();
 const os=String(s.os||'');
 const m=os.match(/\biOS\s*(\d{1,2}(?:\.\d{1,2})?)/i);
 const current=m?Number(m[1]):null;
 let note='';
 if(Number.isFinite(current)){
  if(current<IOS_MIN)note=` Your recorded iOS ${current} is below the minimum, so that OS version is unsupported.`;
  else if(current<IOS_RECOMMENDED)note=` Your recorded iOS ${current} is above the binary minimum but below the current recommendation.`;
  else note=` Your recorded iOS ${current} meets the current recommendation.`;
 }
 return reply(`The audited GTA V build declares iOS ${IOS_MIN} as its technical MinimumOSVersion. For the current community setup, iOS ${IOS_RECOMMENDED} or newer is recommended.${note}`,'ios-requirement','compatibility.html');
}
function buildIdentityAnswer(){
 const s=context();const build=sessionBuild();
 if(build)return reply(`Your current Franklin support session is set to ${build}${s.os?' on '+s.os:''}. I will use that build automatically when answering troubleshooting questions.`,'support-context','updates.html');
 return reply(`Your support session does not currently have an app build selected. Use Change and select the release you installed. For iPhone/iPad, the current public release is ${CURRENT_MOBILE}.`,'support-context','updates.html');
}

function answer(raw){
 const q=norm(raw);if(!q)return null;

 if(/(?:what|which).{0,18}(?:ios|ios version).{0,18}(?:recommended|recommend)|recommended ios|ios recommendation|minimum ios|minimum ios version|ios minimum|what ios should i use|which ios should i use/.test(q))return iosRequirementAnswer();
 if(/(?:what|which).{0,18}(?:build|app version|release).{0,18}(?:am i using|do i have|selected)|what build am i on|my current build|my app version/.test(q))return buildIdentityAnswer();

 const asksLatest=/(?:latest build|latest release|current build|current release|newest build|newest release|latest version|current version|where.*latest build|where.*current build|update terbaru|versi terbaru|rilis terbaru)/.test(q);
 const asks29=/(?:29 oct|29 october|oct 29)/.test(q);
 if(asksLatest||asks29)return latestMobileAnswer();

 if(/(?:28 oct|28 october|oct 28)/.test(q)){
  return reply(`The 28 Oct 2026 release is the previous iPhone/iPad release, not the current one.\n\nIts verified mobile metadata in Franklin includes GTA5 UUID prefix 031BBA86 and compat built Oct 27 2026 23:13:09. That UUID must not be presented as the UUID for the 29 Oct release.\n\nThe 28 Oct release added GTA Online DLC Packs 1–4 support, launcher mod importing, persistent DLC vehicles in story mode, DLC weapons in Trainer, and the Mac launcher-first flow.`,'release-28-oct','updates.html#release-2026-10-28');
 }
 if(/(?:27 oct|27 october|reflection msaa|msaa 8x|8x msaa|reflection.*8x)/.test(q)){
  return reply(`The 27 Oct launcher update added a safety limit for Reflection MSAA on iPhone/iPad.\n\nReflection MSAA options are Off, 2x and 4x. If an older saved configuration contains 8x, the launcher displays it as 4x and writes 4x when Play is pressed. Main-frame MSAA is still not recommended; use FXAA or Temporal AA instead.`,'launcher-27-oct','updates.html');
 }

 const modsIntent=/(?:mods?|import mod|oiv|dlc\.rpf|zip|rar|7z|add[- ]?on car|add[- ]?on ped|ymap|script hook|scripthook|\.asi|\.dll|language mod|handling\.meta|vehicles\.meta|carcols\.meta|carvariations\.meta|popcycle|popgroups|quantv|rweu|rhancer|r☆hancer|graphics mod|shader)/.test(q);
 if(modsIntent){
  if(/(?:script hook|scripthook|\.asi|\.dll|custom audio|audio archive|dlc_patch|dlc patch)/.test(q)){
   return reply(`For the current iOS launcher:\n\n• Script Hook V, .asi and .dll mods do not run in the current iOS build.\n• Custom audio archives are not read from the mods folder yet.\n• dlc_patch title-update patches are not read yet.\n• Some encrypted or PC-specific RPF archives need conversion on a computer before the launcher can use them.\n\nThe supported path is launcher-compatible add-on/DLC content or converted game-file mods imported through MODS › IMPORT MOD.`,'mods-guide','downloads.html#mods');
  }
  return reply(`To install a mod, open the GTA V launcher and use MODS › IMPORT MOD.\n\nThe current importer accepts ZIP, RAR, 7Z, OIV and dlc.rpf. Large imports can take several minutes, so do not close the app while an import is running.\n\nSupported launcher-oriented content includes add-on cars/DLC packs, add-on peds, YMAP world/props mods, population mods, many OIV game-file mods, language text packs, and vehicle metadata such as handling.meta, vehicles.meta, carcols.meta and carvariations.meta.\n\nImported mods are stored under Files › On My iPhone/iPad › GTA V › GTAV › mods. Script Hook V/.asi/.dll mods are not supported on the current iOS build.`,'mods-guide','downloads.html#mods');
 }
 if(/(?:dlc pack|online dlc|436 vehicles|31 updates|32 add[- ]?on|criminal enterprises)/.test(q)){
  return reply(`The 28 Oct release introduced GTA Online DLC Packs 1–4 for story mode: 31 updates through The Criminal Enterprises with 436 vehicles, plus their weapons, clothing and tattoos. This feature remains part of the current project knowledge, but 28 Oct is no longer the newest iPhone/iPad release.`,'dlc-guide','updates.html#release-2026-10-28');
 }
 if(/(?:how to update|cara update|update ipa|install.*ipa|gtav-unsigned|gtav-mac|movies\.zip|gtav_patch)/.test(q)){
  const s=context();
  if(/macOS/i.test(s.os||''))return reply(`For Mac, use the newest Mac-specific package shown by the project Updates page. Do not assume the iPhone/iPad 29 Oct build has the same build metadata. Preserve your existing GTA V data folder unless the release notes explicitly require a clean setup.`,'update-guide','updates.html');
  return reply(`For the current iPhone/iPad release, use the 29 Oct 2026 package from the project Updates page or Discord. Sign and install the new GTAV-unsigned.ipa over the existing app so existing game data, saves and mods remain. If the release notes for your setup include one-time GTAV_patch or movies.zip steps, keep those files in place rather than repeating a clean install.`,'update-guide','updates.html',{discord:true});
 }
 if(/(?:mac launcher|trainer mac|command t|⌘t|f4|exit game|hold option)/.test(q)){
  return reply(`On the latest verified Mac-specific launcher flow in this knowledge snapshot, the launcher opens first. If it was previously disabled, hold Option while GTA V opens to show it again. Trainer can be opened with ⌘T or F4, and Exit Game returns to the launcher.`,'mac-latest','updates.html');
 }
 return null;
}

window.FranklinLatestKB={answer,status:()=>({snapshot:'2026-10-29',mobileRelease:CURRENT_MOBILE,mobileReleaseKey:CURRENT_MOBILE_KEY,uuid:'unasserted',minimumIOS:IOS_MIN,recommendedIOS:IOS_RECOMMENDED})};
let attempts=0;
const install=()=>{
 const kb=window.FranklinDeveloperKB;if(!kb||kb.__latestWrappedV2)return false;
 const original=kb.answer?.bind(kb);
 kb.answer=async raw=>answer(raw)||(original?await original(raw):null);
 kb.__latestWrappedV2=true;
 const oldStatus=kb.status?.bind(kb);
 kb.status=()=>({...oldStatus?.(),latestSnapshot:'2026-10-29',latestMobileRelease:CURRENT_MOBILE,latestMobileBuild:'unasserted'});
 return true;
};
document.addEventListener('franklin-connected',install);
if(!install()){const timer=setInterval(()=>{attempts++;if(install()||attempts>600)clearInterval(timer)},50);}
})();
