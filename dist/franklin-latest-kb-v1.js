(()=>{
'use strict';
if(window.__gtavFranklinLatestKBV3)return;
window.__gtavFranklinLatestKBV3=true;

const IOS_MIN=16.3;
const IOS_RECOMMENDED=18;
const CURRENT_MOBILE='30 Oct 2026';
const CURRENT_MOBILE_KEY='release-20261030-ios';
const CURRENT_MAC_KEY='release-20261030-macos';
const DISCORD='https://discord.gg/HgcbPjcyJ';
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+./-]+/g,' ').replace(/\s+/g,' ').trim();
const context=()=>{try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}};
const sessionBuild=()=>{
 const s=context();
 if(s.build?.label){const date=String(s.build.label).match(/(\d{1,2}\s+Oct)/i);return date?`${date[1]} 2026`:String(s.build.label)}
 if(s.releaseKey===CURRENT_MOBILE_KEY||s.releaseKey===CURRENT_MAC_KEY)return CURRENT_MOBILE;
 return'';
};
const reply=(text,topic='latest-project-knowledge',source='updates.html',extra={})=>({
 text,topic,grounded:true,
 source:{href:source,label:source.includes('downloads')?'Mods Library':source.includes('compatibility')?'Compatibility':'Updates'},
 suggestions:topic==='mods-guide'?['Which mod formats are supported?','What changed for mods on 30 Oct?']:topic==='ios-requirement'?['What build am I using?','Where do I get the current build?']:['What changed on 30 Oct?','How do I update?'],
 ...extra
});

function latestAnswer(){
 const s=context();const selected=sessionBuild();
 const platform=/macOS/i.test(s.os||'')?'Mac':'iPhone/iPad';
 const selectedLine=selected===CURRENT_MOBILE?' Your support session is already set to 30 Oct 2026.':'';
 return reply(`The current public ${platform} release is 30 Oct 2026.${selectedLine}\n\nGet the current app package through the project Discord. The website does not publish direct IPA or Mac ZIP download URLs. I do not have a verified GTA5 UUID or compat timestamp for the 30 Oct release, so I will not reuse an older UUID or invent one.\n\nIf your 30 Oct log contains a GTA5 UUID, Franklin can use the value from that log for troubleshooting.`,'latest-release','updates.html',{discord:true,discordUrl:DISCORD});
}
function iosRequirementAnswer(){
 const s=context();const os=String(s.os||'');const m=os.match(/\biOS\s*(\d{1,2}(?:\.\d{1,2})?)/i);const current=m?Number(m[1]):null;
 let note='';
 if(Number.isFinite(current)){
  if(current<IOS_MIN)note=` Your recorded iOS ${current} is below the technical minimum.`;
  else if(current<IOS_RECOMMENDED)note=` Your recorded iOS ${current} is above the technical minimum but below the current recommendation.`;
  else note=` Your recorded iOS ${current} meets the current recommendation.`;
 }
 return reply(`The audited app baseline declares iOS ${IOS_MIN} as the technical MinimumOSVersion. For the current community setup, iOS ${IOS_RECOMMENDED} or newer is recommended.${note}`,'ios-requirement','compatibility.html');
}
function buildIdentityAnswer(){
 const s=context();const build=sessionBuild();
 if(build)return reply(`Your current Franklin support session is set to ${build}${s.os?' on '+s.os:''}. I will use that build automatically when answering troubleshooting questions.`,'support-context','updates.html');
 return reply(`Your support session does not currently have an app build selected. Use Change and select the release you installed. The current public release is ${CURRENT_MOBILE} for iPhone, iPad and Mac.`,'support-context','updates.html');
}
function updateGuide(){
 const s=context();
 if(/macOS/i.test(s.os||''))return reply(`For the current Mac release, get GTAV-mac.zip from the project Discord, then install it over the current setup according to the release notes. The 30 Oct notes say existing saves and mods stay as they are. Do not use a direct app-package link from the website.`,'update-guide','guide.html',{discord:true,discordUrl:DISCORD});
 return reply(`For the current iPhone/iPad release, get GTAV-unsigned.ipa from the project Discord, sign it as before, and install it over the existing app. The 30 Oct notes say existing saves and mods stay as they are. Do not delete your game data just to update, and do not use a direct app-package link from the website.`,'update-guide','guide.html',{discord:true,discordUrl:DISCORD});
}

function answer(raw){
 const q=norm(raw);if(!q)return null;
 if(/(?:what|which).{0,18}(?:ios|ios version).{0,18}(?:recommended|recommend)|recommended ios|ios recommendation|minimum ios|minimum ios version|ios minimum|what ios should i use|which ios should i use/.test(q))return iosRequirementAnswer();
 if(/(?:what|which).{0,18}(?:build|app version|release).{0,18}(?:am i using|do i have|selected)|what build am i on|my current build|my app version/.test(q))return buildIdentityAnswer();
 const asksLatest=/(?:latest build|latest release|current build|current release|newest build|newest release|latest version|current version|where.*latest build|where.*current build|update terbaru|versi terbaru|rilis terbaru)/.test(q);
 const asks30=/(?:30 oct|30 october|oct 30)/.test(q);
 if(asksLatest||asks30)return latestAnswer();
 if(/(?:29 oct|29 october|oct 29)/.test(q))return reply(`The 29 Oct 2026 release is now the previous release. It introduced GTA Online characters, free roam, jobs, peer-to-peer sessions for up to 32 players, session codes, Nearby discovery, touch-opacity controls and related fixes. The current public release is 30 Oct 2026.`,'release-29-oct','updates.html#release-2026-10-29');
 if(/(?:28 oct|28 october|oct 28)/.test(q))return reply(`The 28 Oct 2026 release is older. Its verified mobile metadata includes GTA5 UUID prefix 031BBA86 and compat built Oct 27 2026 23:13:09. That UUID belongs to the 28 Oct build only and must not be presented as the UUID for 29 or 30 Oct.`,'release-28-oct','updates.html#release-2026-10-28');
 const modsIntent=/(?:mods?|import mod|oiv|dlc\.rpf|zip|rar|7z|add[- ]?on car|add[- ]?on ped|ymap|script hook|scripthook|\.asi|\.dll|language mod|handling\.meta|vehicles\.meta|carcols\.meta|carvariations\.meta|popcycle|popgroups|quantv|visualv|naturalvision|maxedv|graphics mod|shader)/.test(q);
 if(modsIntent){
  if(/(?:script hook|scripthook|\.asi|\.dll|custom audio|audio archive|dlc_patch|dlc patch)/.test(q))return reply(`For the current iOS launcher, Script Hook V, .asi and .dll mods do not run. Custom audio archives and dlc_patch title-update patches also remain outside the supported mods-folder path. Use launcher-compatible add-on/DLC content or converted game-file mods imported through MODS › IMPORT MOD.`,'mods-guide','downloads.html#mods');
  if(/(?:quantv|visualv|naturalvision|maxedv|graphics overhaul|car textures|4 gb|6 gb|memory)/.test(q))return reply(`For the 30 Oct release, use one graphics overhaul at a time. QuantV and the sharper car-texture package are intended for 6 GB devices. On 4 GB devices, disable heavy mods in MODS if the game runs short of memory. QuantV, VisualV, NaturalVision Remastered and MaxedV are covered by the 30 Oct startup-crash compatibility fix.`,'mods-guide','updates.html#release-2026-10-30');
  return reply(`On the 30 Oct launcher, use MODS › IMPORT MOD. The release expands support to as many as 256 add-on packs, adds clothing mods for Michael, Franklin and Trevor, and lets you tap a mod in the MODS tab to read its full description. New community content includes Mod Pack 2, Mod Pack 3 and a Hungarian translation. GTA Online cars in traffic require the matching DLC packs.`,'mods-guide','downloads.html#mods');
 }
 if(/(?:how to update|cara update|update ipa|install.*ipa|gtav-unsigned|gtav-mac|download.*ipa|download.*mac)/.test(q))return updateGuide();
 return null;
}

window.FranklinLatestKB={answer,status:()=>({snapshot:'2026-10-30',mobileRelease:CURRENT_MOBILE,mobileReleaseKey:CURRENT_MOBILE_KEY,macReleaseKey:CURRENT_MAC_KEY,uuid:'unasserted',minimumIOS:IOS_MIN,recommendedIOS:IOS_RECOMMENDED})};
let attempts=0;
const install=()=>{
 const kb=window.FranklinDeveloperKB;if(!kb||kb.__latestWrappedV3)return false;
 const original=kb.answer?.bind(kb);
 kb.answer=async raw=>answer(raw)||(original?await original(raw):null);
 kb.__latestWrappedV3=true;
 const oldStatus=kb.status?.bind(kb);
 kb.status=()=>({...oldStatus?.(),latestSnapshot:'2026-10-30',latestMobileRelease:CURRENT_MOBILE,latestMobileBuild:'unasserted'});
 return true;
};
document.addEventListener('franklin-connected',install);
if(!install()){const timer=setInterval(()=>{attempts++;if(install()||attempts>600)clearInterval(timer)},50);}
})();