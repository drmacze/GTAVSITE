(()=>{
'use strict';
if(window.__gtavFranklinLatestKBV1)return;
window.__gtavFranklinLatestKBV1=true;

const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+./-]+/g,' ').trim();
const reply=(text,topic='latest-project-knowledge',source='updates.html')=>({
  text,
  topic,
  grounded:true,
  source:{href:source,label:source.includes('downloads')?'Mods Library':'Updates'},
  suggestions:topic==='mods-guide'?['Which mod formats are supported?','How do I import a mod?']:['What changed on 28 Oct?','How do I update?']
});

function answer(raw){
 const q=norm(raw);
 if(!q)return null;

 if(/(?:28 oct|28 october|latest build|latest release|current release|newest release|update terbaru|versi terbaru|rilis terbaru)/.test(q)){
  return reply(
`The current public release is 28 Oct 2026 for iPhone, iPad and Mac.

On iPhone/iPad, the uploaded 28 Oct package contains GTA5 UUID prefix 031BBA86 and compat built Oct 27 2026 23:13:09.

Key changes:
• GTA Online DLC Packs 1–4: 31 updates through The Criminal Enterprises, including 436 vehicles plus their weapons, clothing and tattoos.
• MODS › IMPORT MOD is available in the launcher and individual imported updates can be enabled or disabled.
• DLC vehicles persist in story mode, and Trainer › All weapons includes DLC weapons.
• Mac now opens through the launcher first; Trainer is available with ⌘T/F4, and Exit Game returns to the launcher.

Updating iPhone/iPad by signing and installing the new GTAV-unsigned.ipa over the existing app keeps existing data, saves and mods.`,
  'latest-release','updates.html#release-2026-10-28');
 }

 if(/(?:27 oct|27 october|reflection msaa|msaa 8x|8x msaa|reflection.*8x)/.test(q)){
  return reply(
`The 27 Oct launcher update added a safety limit for Reflection MSAA on iPhone/iPad.

Reflection MSAA options are Off, 2x and 4x. If an older saved configuration contains 8x, the launcher displays it as 4x and writes 4x when Play is pressed. Apple GPUs should not be configured for 8x Reflection MSAA here.

Main-frame MSAA is still not recommended; use FXAA or Temporal AA instead.`,
  'launcher-27-oct','updates.html');
 }

 const modsIntent=/(?:mods?|import mod|oiv|dlc\.rpf|zip|rar|7z|add[- ]?on car|add[- ]?on ped|ymap|script hook|scripthook|\.asi|\.dll|language mod|handling\.meta|vehicles\.meta|carcols\.meta|carvariations\.meta|popcycle|popgroups)/.test(q);
 if(modsIntent){
  if(/(?:script hook|scripthook|\.asi|\.dll|custom audio|audio archive|dlc_patch|dlc patch)/.test(q)){
   return reply(
`For the current iOS launcher:

• Script Hook V, .asi and .dll mods do not run in the current iOS build.
• Custom audio archives are not read from the mods folder yet.
• dlc_patch title-update patches are not read yet.
• Some encrypted or PC-specific RPF archives need conversion on a computer before the launcher can use them.

The supported path is launcher-compatible add-on/DLC content or converted game-file mods imported through MODS › IMPORT MOD.`,
   'mods-guide','downloads.html#mods');
  }
  return reply(
`To install a mod, open the GTA V launcher and use MODS › IMPORT MOD.

The current importer accepts ZIP, RAR, 7Z, OIV and dlc.rpf. Large imports can take several minutes, so do not close the app while an import is running.

Supported launcher-oriented content includes add-on cars/DLC packs, add-on peds, YMAP world/props mods, population mods such as popcycle/popgroups, many OIV game-file mods such as gore or handling changes, language text packs, and vehicle metadata such as handling.meta, vehicles.meta, carcols.meta and carvariations.meta.

Imported mods are stored under Files › On My iPhone/iPad › GTA V › GTAV › mods. A mod can be disabled without deleting its files; Delete removes it from the Mods folder.

Script Hook V/.asi/.dll mods are not supported on the current iOS build.`,
  'mods-guide','downloads.html#mods');
 }

 if(/(?:dlc pack|online dlc|436 vehicles|31 updates|32 add[- ]?on|criminal enterprises)/.test(q)){
  return reply(
`The 28 Oct release provides GTA Online DLC Packs 1–4 for story mode: 31 updates through The Criminal Enterprises with 436 vehicles, plus their weapons, clothing and tattoos.

All four packs use 31 of the 32 available add-on pack slots. On 4 GB devices, keep only a few updates enabled. Importing on iPhone/iPad needs roughly twice the downloaded pack size in free storage. If a pack is disabled, its cars and weapons are removed from the save the next time the game saves.`,
  'dlc-guide','updates.html#release-2026-10-28');
 }

 if(/(?:how to update|cara update|update ipa|install.*ipa|gtav-unsigned|gtav-mac|movies\.zip|gtav_patch)/.test(q)){
  return reply(
`For the 28 Oct build:

1. iPhone/iPad: sign and install the new GTAV-unsigned.ipa over the existing app. Existing game data, saves and mods remain.
2. Mac: unzip GTAV-mac.zip and open GTA V.app.
3. If this is a new install or you skipped the 18 Oct setup, also set up GTAV_patch and movies.zip from the 22 Oct download once.`,
  'update-guide','updates.html#release-2026-10-28');
 }

 if(/(?:mac launcher|trainer mac|command t|⌘t|f4|exit game|hold option)/.test(q)){
  return reply(
`On the 28 Oct Mac build, the launcher opens first. If it was previously disabled, hold Option while GTA V opens to show it again.

Trainer: use ⌘T or F4 in game. With a controller, use View from the pause menu. Exit Game in the pause menu returns to the launcher.`,
  'mac-latest','updates.html#release-2026-10-28');
 }

 return null;
}

window.FranklinLatestKB={answer,status:()=>({snapshot:'2026-10-28',build:'031BBA86',compat:'Oct 27 2026 23:13:09'})};

let attempts=0;
const install=()=>{
 const kb=window.FranklinDeveloperKB;
 if(!kb||kb.__latestWrapped)return false;
 const original=kb.answer?.bind(kb);
 kb.answer=async raw=>answer(raw)||(original?await original(raw):null);
 kb.__latestWrapped=true;
 const oldStatus=kb.status?.bind(kb);
 kb.status=()=>({...oldStatus?.(),latestSnapshot:'2026-10-28',latestBuild:'031BBA86'});
 return true;
};
if(!install()){
 const timer=setInterval(()=>{attempts++;if(install()||attempts>600)clearInterval(timer)},50);
}
})();
