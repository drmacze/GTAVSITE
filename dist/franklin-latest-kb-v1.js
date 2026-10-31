(()=>{
'use strict';
if(window.__gtavFranklinLatestKBV4)return;
window.__gtavFranklinLatestKBV4=true;

const DECLARED_IOS_MIN='16.3';
const CONFIRMED_IOS='18+';
const CURRENT_MOBILE='30 Oct 2026';
const CURRENT_MOBILE_KEY='release-20261030-ios';
const CURRENT_MAC_KEY='release-20261030-macos';
const DISCORD='https://discord.gg/HgcbPjcyJ';
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+./-]+/g,' ').replace(/\s+/g,' ').trim();
const context=()=>{try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}};
const sessionBuild=()=>{const s=context();if(s.build?.label){const date=String(s.build.label).match(/(\d{1,2}\s+Oct)/i);return date?`${date[1]} 2026`:String(s.build.label)}if(s.releaseKey===CURRENT_MOBILE_KEY||s.releaseKey===CURRENT_MAC_KEY)return CURRENT_MOBILE;return''};
const reply=(text,topic='latest-project-knowledge',source='updates.html',extra={})=>({text,topic,grounded:true,source:{href:source,label:source.includes('downloads')?'Mods Library':source.includes('compatibility')?'Compatibility':'Updates'},suggestions:topic==='mods-guide'?['Which mod formats are supported?','What changed for mods on 30 Oct?']:topic==='ios-requirement'?['What build am I using?','Which devices are supported?']:['What changed on 30 Oct?','How do I update?'],...extra});
function nativeBuild(){return window.FranklinReleaseStateV2?.resolveNativeBuild?.(context())||null}
function latestAnswer(){
 const s=context(),selected=sessionBuild(),platform=/macOS/i.test(s.os||'')?'Mac':'iPhone/iPad',b=nativeBuild();
 const selectedLine=selected===CURRENT_MOBILE?' Your support session is already set to 30 Oct 2026.':'';
 const id=b?` GTA5 UUID ${b.uuid}${b.compat?`, compat built ${b.compat}`:''}.`:'';
 return reply(`The current public ${platform} release is 30 Oct 2026 (batches 104-106).${selectedLine}${id}\n\nGet the current app package through the project Discord. The website does not publish direct IPA or Mac ZIP download URLs.`,'latest-release','updates.html',{discord:true,discordUrl:DISCORD});
}
function iosRequirementAnswer(){
 const s=context(),os=String(s.os||''),m=os.match(/\biOS\s*(\d{1,2}(?:\.\d{1,2})?)/i),current=m?Number(m[1]):null;
 let note='';
 if(Number.isFinite(current)){
  if(current<17)note=` Your recorded iOS ${current} is not supported by the runtime.`;
  else if(current<18)note=` Your recorded iOS ${current} is newer than iOS 16, but iOS 17 has not been confirmed in the developer reports.`;
  else note=` Your recorded iOS ${current} is within the confirmed runtime range.`;
 }
 return reply(`The IPA declares MinimumOSVersion ${DECLARED_IOS_MIN}, which is an installation metadata value, not the practical support floor. The developer KB says iOS 16 is not supported because its graphics compiler rejects the required shaders. iOS ${CONFIRMED_IOS} is confirmed working; iOS 17 is currently unconfirmed.${note}`,'ios-requirement','compatibility.html');
}
function deviceAnswer(){return reply('Current developer guidance:\n\n• Normal iPhone/iPad baseline: A13 and newer.\n• A12 / A12X / A12Z: experimental path; A12Z has been tested, but XS/XR reports are limited and the XR’s 3 GB RAM is probably too little.\n• 4 GB devices should start with Battery Saver, Normal textures, MSAA Off and Reflection MSAA Off.\n• A11 and older are not supported.\n• Mac: Apple silicon M1 or newer on macOS 14+. Intel Macs are not supported.\n• Runtime OS: iOS 18+ confirmed; iOS 16 unsupported; iOS 17 unconfirmed.','device-support','compatibility.html')}
function buildIdentityAnswer(){const s=context(),build=sessionBuild(),b=nativeBuild();if(build&&b)return reply(`Your Franklin support session is set to ${build}${s.os?' on '+s.os:''}. Matching native metadata: GTA5 UUID ${b.uuid}${b.compat?`, compat built ${b.compat}`:''}.`,'support-context','updates.html');if(build)return reply(`Your Franklin support session is set to ${build}${s.os?' on '+s.os:''}. I will use that build automatically when troubleshooting.`,'support-context','updates.html');return reply(`Your support session does not currently have an app build selected. Use Change and select the release you installed. The current public release is ${CURRENT_MOBILE}.`,'support-context','updates.html')}
function updateGuide(){const s=context();if(/macOS/i.test(s.os||''))return reply('Get the current Mac package from the project Discord and install the new app over the current setup according to the release notes. Existing saves and mods stay. Do not use a direct app-package link from the website.','update-guide','guide.html',{discord:true,discordUrl:DISCORD});return reply('Get the current GTAV-unsigned.ipa from the project Discord, sign it with the same signing setup and bundle identity you already use, then install it over the existing app. Do not delete the old app first because its data and saves live in its container.','update-guide','guide.html',{discord:true,discordUrl:DISCORD})}
function answer(raw){
 const q=norm(raw);if(!q)return null;
 if(/(?:minimum|supported|support|recommended|recommend).*(?:ios|ios version)|(?:ios|ios version).*(?:minimum|supported|recommended)|what ios should i use|which ios should i use/.test(q))return iosRequirementAnswer();
 if(/(?:which devices|supported devices|device support|will it run|can it run|iphone.*supported|ipad.*supported|mac.*supported|a12|a13|a11|m1 mac|intel mac)/.test(q))return deviceAnswer();
 if(/(?:what|which).{0,18}(?:build|app version|release).{0,18}(?:am i using|do i have|selected)|what build am i on|my current build|my app version/.test(q))return buildIdentityAnswer();
 const asksLatest=/(?:latest build|latest release|current build|current release|newest build|newest release|latest version|current version|where.*latest build|where.*current build|update terbaru|versi terbaru|rilis terbaru)/.test(q),asks30=/(?:30 oct|30 october|oct 30)/.test(q);
 if(asksLatest||asks30)return latestAnswer();
 if(/(?:29 oct|29 october|oct 29)/.test(q))return reply('The 29 Oct 2026 release is now the previous release. Verified metadata: iPhone/iPad GTA5 UUID 367053AC, compat built Oct 29 2026 20:09:28; Mac GTA5 UUID 5C9B8E26. The current public release is 30 Oct 2026.','release-29-oct','updates.html#release-2026-10-29');
 const modsIntent=/(?:mods?|import mod|oiv|dlc\.rpf|zip|rar|7z|add[- ]?on car|add[- ]?on ped|ymap|script hook|scripthook|\.asi|\.dll|language mod|handling\.meta|vehicles\.meta|quantv|visualv|naturalvision|maxedv|graphics mod|shader|wero|community mod pack)/.test(q);
 if(modsIntent){
  if(/(?:script hook|scripthook|\.asi|\.dll|enb|reshade)/.test(q))return reply('PC code mods such as Script Hook, .asi, .dll, ENB and ReShade do not run as normal launcher mods. Use launcher-compatible converted game-file mods or add-on/DLC content through MODS › IMPORT MOD.','mods-guide','downloads.html#mods');
  if(/(?:quantv|visualv|naturalvision|maxedv|graphics overhaul|car textures|4 gb|6 gb|memory)/.test(q))return reply('On the 30 Oct release, QuantV, VisualV, NaturalVision Remastered and MaxedV no longer hit the recorded startup crash. Use one graphics overhaul at a time. QuantV iOS Enhanced and the sharper car-texture package are intended for 6 GB devices; on 4 GB devices disable heavy mods if memory gets tight.','mods-guide','updates.html#release-2026-10-30');
  return reply('Use MODS › IMPORT MOD. The 30 Oct release supports up to 256 add-on packs, clothing mods for Michael, Franklin and Trevor, Community Mod Pack 2, Community Mod Pack 3 and Hungarian translation. Supported imports include common packaged game-file formats handled by the launcher; PC executable code mods are not supported.','mods-guide','downloads.html#mods');
 }
 if(/(?:how to update|cara update|update ipa|install.*ipa|gtav-unsigned|gtav-mac|download.*ipa|download.*mac)/.test(q))return updateGuide();
 return null;
}
window.FranklinLatestKB={answer,status:()=>({snapshot:'2026-10-31',mobileRelease:CURRENT_MOBILE,mobileReleaseKey:CURRENT_MOBILE_KEY,macReleaseKey:CURRENT_MAC_KEY,mobileUuid:'31927966',macUuid:'255B475E',declaredMinimumIOS:DECLARED_IOS_MIN,confirmedIOS:CONFIRMED_IOS})};
let attempts=0;const install=()=>{const kb=window.FranklinDeveloperKB;if(!kb||kb.__latestWrappedV4)return false;const original=kb.answer?.bind(kb);kb.answer=async raw=>answer(raw)||(original?await original(raw):null);kb.__latestWrappedV4=true;const oldStatus=kb.status?.bind(kb);kb.status=()=>({...oldStatus?.(),latestSnapshot:'2026-10-31',latestMobileRelease:CURRENT_MOBILE,latestMobileBuild:'31927966'});return true};
document.addEventListener('franklin-connected',install);if(!install()){const timer=setInterval(()=>{attempts++;if(install()||attempts>600)clearInterval(timer)},50)}
})();