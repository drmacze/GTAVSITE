(()=>{
'use strict';
if(window.__gtavRelease30SiteV1)return;
window.__gtavRelease30SiteV1=true;

const DISCORD='https://discord.gg/HgcbPjcyJ';
const PAGE=document.body?.dataset.page||'';
const RELEASE={
 date:'2026-10-30',
 title:'GTA V for iPhone, iPad & Mac: 30 Oct update',
 version:'30 Oct build',
 summary:'GTA Online interiors and persistent weapons, stricter host controls, expanded Trainer clothing and weapon tools, support for up to 256 add-on packs, new community mod packs, and stability fixes.',
 body:[
  ['GTA Online',[
   'Walk into apartment towers and 34 additional interiors, including homes, police stations, the hospital, banks, clubs and the FIB. Entrances use yellow door markers and map blips.',
   'Your weapons are saved and restored the next time you play.',
   'In a session, only the host can start jobs and use God mode.',
   'Joining now shows the support path clearly: Trainer › GTA Online › Copy the joining log. Include that log when reporting a connection problem.'
  ]],
  ['Trainer',[
   'Weapons and attachments stay equipped when you change skin.',
   'New weapon controls include Attachments and tint, plus All weapons with attachments.',
   'The Clothes page lets you change outfits piece by piece.',
   'GTA Online DLC cars now appear in their vehicle classes in the spawner.'
  ]],
  ['Mods',[
   'The launcher now supports up to 256 add-on packs, so add-on cars no longer disappear simply because all GTA Online DLC packs are enabled.',
   'Clothing mods are supported for Michael, Franklin and Trevor.',
   'QuantV, VisualV, NaturalVision Remastered and MaxedV no longer crash at startup in the supported launcher flow.',
   'In the MODS tab, tap a mod to read its full description.'
  ]],
  ['New mods',[
   'Community Mod Pack 2: W.E.R.O. ragdolls, Forests of San Andreas and GTA 5 World Improvement.',
   'Community Mod Pack 3: QuantV iOS, sharper car textures, fuller roadside bushes, bigger subtitles and GTA Online cars in traffic.',
   'Hungarian translation.'
  ]],
  ['Fixes',[
   "Fixed a crash involving Benny's wheels and GTA Online wheels."
  ]],
  ['Performance notes',[
   'Use one graphics overhaul at a time.',
   'QuantV and the sharper car-texture package are intended for 6 GB devices.',
   'On 4 GB devices, disable heavy mods in MODS if the game runs short of memory.',
   'GTA Online cars in traffic require the corresponding DLC packs.'
  ]],
  ['How to update',[
   'Your saves and mods stay as they are. Install the new build over the current installation.',
   'iPhone / iPad: get GTAV-unsigned.ipa from the project Discord and sign it as before.',
   'Mac: get GTAV-mac.zip from the project Discord.',
   'The website does not publish direct app-package download URLs. App downloads are routed through Discord.'
  ]]
 ]
};

const el=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n};

function redirectAppDownloads(root=document){
 root.querySelectorAll?.('a').forEach(a=>{
  const href=a.getAttribute('href')||'';
  const text=(a.textContent||'').toLowerCase();
  const appDownload=/gofile\.io/i.test(href)||a.classList.contains('managed-update-download')||a.classList.contains('updates-download')||(a.closest('.release-download')&&/(download|ios|iphone|ipad|mac|package|build)/i.test(text));
  if(!appDownload)return;
  a.href=DISCORD;
  a.target='_blank';
  a.rel='noopener noreferrer';
  a.classList.add('discord-link');
  if(/download ios/i.test(a.textContent||''))a.textContent='Get iOS on Discord ↗';
  else if(/download mac|open download/i.test(a.textContent||''))a.textContent='Get app on Discord ↗';
 });
}

function addBodySections(container,sections){
 sections.forEach(([heading,items])=>{
  const h=el('h4','',heading);container.append(h);
  const ul=el('ul');
  items.forEach(item=>ul.append(el('li','',item)));
  container.append(ul);
 });
}

function buildFeatured30(){
 const heading=document.querySelector('.updates-heading');
 if(!heading)return null;
 let shell=document.querySelector('.managed-updates.latest-release-29');
 if(shell)shell.remove();
 shell=el('section','managed-updates latest-release-29 latest-release-30');
 shell.setAttribute('aria-label','Latest published update');
 const titleRow=el('div','managed-updates-heading');
 titleRow.innerHTML='<div><span>LIVE RELEASE FEED</span><h2>Latest update</h2></div>';
 shell.append(titleRow);
 const card=el('article','managed-update-card is-latest');card.id='release-2026-10-30';
 const meta=el('div','managed-update-meta');
 meta.append(el('span','managed-update-category','Latest release'),el('span','managed-update-new','NEW'));
 const time=el('time','','30 Oct 2026');time.dateTime=RELEASE.date;meta.append(time);
 card.append(meta,el('h3','',RELEASE.title),el('div','managed-update-version',RELEASE.version));
 const summary=el('div','managed-update-summary');summary.append(el('p','',RELEASE.summary));card.append(summary);
 const details=el('details','managed-update-details');details.open=true;
 details.append(el('summary','','Release details'));
 const body=el('div','managed-update-body');addBodySections(body,RELEASE.body);details.append(body);card.append(details);
 const downloads=el('div','managed-update-downloads');
 [['iPhone & iPad','Get iOS on Discord'],['Apple silicon Mac','Get Mac on Discord']].forEach(([metaText,label])=>{
  const a=el('a','button outline compact managed-update-download');a.href=DISCORD;a.target='_blank';a.rel='noopener noreferrer';a.classList.add('discord-link');
  const span=el('span');span.append(el('small','',metaText),document.createTextNode(label));a.append(span);downloads.append(a);
 });
 card.append(downloads);shell.append(card);heading.insertAdjacentElement('afterend',shell);return shell;
}

function ensureArchive29(){
 const list=document.querySelector('.release-list');if(!list||document.getElementById('release-2026-10-29'))return;
 const article=el('article','release-entry managed-archive-entry');article.id='release-2026-10-29';
 article.innerHTML='<div class="release-date"><time datetime="2026-10-29"><strong>29</strong><span>OCT 2026</span></time></div><details class="release-card"><summary><div class="release-intro"><span class="release-tag">Previous release</span><h2>GTA Online launch</h2><p>Online characters, free roam, jobs, peer-to-peer sessions for up to 32 players, session codes, Nearby discovery and launcher improvements.</p></div><span class="release-chevron"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#chevron-down"></use></svg></span></summary><div class="release-body"><div class="release-callout">29 Oct build</div><section class="release-part"><h3>Release notes</h3><ul><li>GTA Online character creator, free roam, races, deathmatches, survivals and contact missions.</li><li>Peer-to-peer sessions for up to 32 players, session-code joining and Nearby discovery on the same Wi-Fi.</li><li>Host-led jobs, individual trainer car upgrades, touch-button opacity and pinch-to-zoom on the pause map.</li><li>Fixed DLC-clothing crashes, race respawn loops and truncated mod-import errors.</li><li>Existing saves and mods remain when updating over the current installation.</li></ul></section><div class="release-download"><a class="subtle-link discord-link" target="_blank" rel="noopener noreferrer">Get app on Discord ↗</a><a href="#updates-top">Back to top ↑</a></div></div></details>';
 article.querySelector('.discord-link').href=DISCORD;
 list.prepend(article);
}

function normalizeReleaseNavigation(){
 const jump=document.querySelector('.release-jump');if(!jump)return;
 const add=(id,label)=>{let a=jump.querySelector(`a[href="#${id}"]`);if(!a){a=el('a','',label);a.href=`#${id}`;}return a};
 const a30=add('release-2026-10-30','30 Oct');
 const a29=add('release-2026-10-29','29 Oct');
 jump.prepend(a29);jump.prepend(a30);
 jump.querySelectorAll('a').forEach(a=>a.removeAttribute('aria-current'));a30.setAttribute('aria-current','location');
 a30.onclick=()=>document.getElementById('release-2026-10-30')?.scrollIntoView({block:'start'});
 a29.onclick=()=>{const d=document.querySelector('#release-2026-10-29 details');if(d)d.open=true;};
 const count=document.querySelector('.release-toolbar small');
 if(count){const total=document.querySelectorAll('.release-list > .release-entry').length+1;count.textContent=`${total} releases · Newest first`;}
}

function patchUpdates(){
 let settled=false;
 const apply=()=>{
  const heading=document.querySelector('.updates-heading');if(!heading)return false;
  if(!document.querySelector('.managed-updates.latest-release-29'))return false;
  buildFeatured30();ensureArchive29();normalizeReleaseNavigation();redirectAppDownloads(document.querySelector('#main')||document);settled=true;return true;
 };
 if(!apply()){
  const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
  observer.observe(document.querySelector('#main')||document.body,{childList:true,subtree:true});
  setTimeout(()=>{observer.disconnect();if(!settled)apply()},5000);
 }
 const guard=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n instanceof Element)redirectAppDownloads(n)})));
 guard.observe(document.querySelector('#main')||document.body,{childList:true,subtree:true});
 setTimeout(()=>guard.disconnect(),12000);
}

function setAnswer(id,html){const q=document.getElementById(id);const body=q?.querySelector('.answer-body');if(body)body.innerHTML=html;}
function patchFaq(){
 setAnswer('faq-start-2',`<p>The current public app release is <strong>30 Oct 2026</strong> for iPhone, iPad and Mac. All app packages are distributed through the project Discord. This website does not publish direct IPA or Mac ZIP download links. <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Open Discord</a></p>`);
 setAnswer('faq-devices-2','<p>The audited app baseline declares iOS 16.3 as the technical minimum. For the current community setup, iOS 18 or newer is recommended. Always check the notes for the exact build you install.</p>');
 setAnswer('faq-devices-4',`<p>Yes. The current 30 Oct release covers iPhone, iPad and Apple silicon Mac. Use the platform-specific package from the project Discord. <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Open Discord</a></p>`);
 setAnswer('faq-devices-5','<p>4 GB devices have much less memory headroom. In the 30 Oct release, heavy graphics mods should be disabled if the game runs short of memory. QuantV and the sharper car-texture package are intended for 6 GB devices, and only one graphics overhaul should be enabled at a time.</p>');
 setAnswer('faq-install-1',`<p>For the 30 Oct build, install the new app over the current installation. Existing saves and mods stay in place. On iPhone/iPad, sign GTAV-unsigned.ipa as before. On Mac, use GTAV-mac.zip. Get both app packages from Discord rather than a direct website download. <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Open Discord</a></p>`);
 const mods=[...document.querySelectorAll('.support-question')].find(q=>/mod/i.test(q.querySelector('.question-text')?.textContent||''));
 if(mods?.querySelector('.answer-body'))mods.querySelector('.answer-body').innerHTML='<p>The 30 Oct launcher supports up to 256 add-on packs, clothing mods for Michael, Franklin and Trevor, full mod descriptions in the MODS tab, and current compatibility fixes for QuantV, VisualV, NaturalVision Remastered and MaxedV. Script Hook V, .asi and .dll mods are still outside the supported iOS launcher path.</p>';
 redirectAppDownloads(document);
}

function patchGuide(){
 const heading=document.querySelector('.guide-heading>p');if(heading)heading.innerHTML='Prepare your device, install the app, and set up your game files.<br>The current <strong>30 Oct 2026</strong> iPhone, iPad and Mac packages are distributed through our Discord server.';
 const firstInstall=document.querySelector('#installation .guide-steps li:first-child p');if(firstInstall)firstInstall.innerHTML=`Open our <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Discord server</a> and use the 30 Oct release post. App-package downloads are routed through Discord; this website does not publish direct IPA or Mac ZIP links.`;
 const memory=document.querySelector('#memory');
 if(memory&&!memory.querySelector('[data-release30-memory]')){
  const note=el('div','guide-caution');note.dataset.release30Memory='true';note.innerHTML='<p><strong>30 Oct mod guidance:</strong> use one graphics overhaul at a time. QuantV and the sharper car-texture package are intended for 6 GB devices. On 4 GB devices, switch heavy mods off in MODS if the game runs short of memory. GTA Online cars in traffic require the matching DLC packs.</p>';
  memory.append(note);
 }
 const updates=document.querySelector('#updates');if(updates){
  const paragraphs=updates.querySelectorAll(':scope > p');
  if(paragraphs[0])paragraphs[0].textContent='The 30 Oct release supports an in-place update: install the new build over the current installation and your existing saves and mods stay as they are.';
  if(paragraphs[1])paragraphs[1].innerHTML=`Get GTAV-unsigned.ipa for iPhone/iPad or GTAV-mac.zip for Mac from the project <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Discord</a>. Keep a backup before changing signing methods or manually deleting app data.`;
 }
 redirectAppDownloads(document);
}

if(PAGE==='updates')patchUpdates();
else if(PAGE==='faq')patchFaq();
else if(PAGE==='guide')patchGuide();
})();