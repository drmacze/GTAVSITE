(()=>{
'use strict';
if(window.__gtavRelease30SiteV2)return;
window.__gtavRelease30SiteV2=true;

const DISCORD='https://discord.gg/HgcbPjcyJ';
const PAGE=document.body?.dataset.page||'';
const el=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n};

function setAnswer(id,html){
 const q=document.getElementById(id);
 const body=q?.querySelector('.answer-body');
 if(body)body.innerHTML=html;
}

function patchFaq(){
 setAnswer('faq-start-2',`<p>The current public app release is <strong>30 Oct 2026</strong> for iPhone, iPad and Mac. All app packages are distributed through the project Discord. This website does not publish direct IPA or Mac ZIP download links. <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Open Discord</a></p>`);
 setAnswer('faq-devices-2','<p>The audited app baseline declares iOS 16.3 as the technical minimum. For the current community setup, iOS 18 or newer is recommended. Always check the notes for the exact build you install.</p>');
 setAnswer('faq-devices-4',`<p>Yes. The current 30 Oct release covers iPhone, iPad and Apple silicon Mac. Use the platform-specific package from the project Discord. <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Open Discord</a></p>`);
 setAnswer('faq-devices-5','<p>4 GB devices have much less memory headroom. In the 30 Oct release, heavy graphics mods should be disabled if the game runs short of memory. QuantV and the sharper car-texture package are intended for 6 GB devices, and only one graphics overhaul should be enabled at a time.</p>');
 setAnswer('faq-install-1',`<p>For the 30 Oct build, install the new app over the current installation. Existing saves and mods stay in place. On iPhone/iPad, sign <code>GTAV-unsigned.ipa</code> as before. On Mac, use <code>GTAV-mac.zip</code>. Get both app packages from Discord rather than a direct website download. <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Open Discord</a></p>`);
 const mods=[...document.querySelectorAll('.support-question')].find(q=>/mod/i.test(q.querySelector('.question-text')?.textContent||''));
 if(mods?.querySelector('.answer-body'))mods.querySelector('.answer-body').innerHTML='<p>The 30 Oct launcher supports up to 256 add-on packs, clothing mods for Michael, Franklin and Trevor, full mod descriptions in the MODS tab, and compatibility fixes for QuantV, VisualV, NaturalVision Remastered and MaxedV. Script Hook V, .asi and .dll mods are still outside the supported iOS launcher path.</p>';
}

function patchGuide(){
 const heading=document.querySelector('.guide-heading>p');
 if(heading)heading.innerHTML='Prepare your device, install the app, and set up your game files.<br>The current <strong>30 Oct 2026</strong> iPhone, iPad and Mac packages are distributed through our Discord server.';
 const firstInstall=document.querySelector('#installation .guide-steps li:first-child p');
 if(firstInstall)firstInstall.innerHTML=`Open our <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Discord server</a> and use the 30 Oct release post. App-package downloads are routed through Discord; this website does not publish direct IPA or Mac ZIP links.`;
 const memory=document.querySelector('#memory');
 if(memory&&!memory.querySelector('[data-release30-memory]')){
  const note=el('div','guide-caution');
  note.dataset.release30Memory='true';
  note.innerHTML='<p><strong>30 Oct mod guidance:</strong> use one graphics overhaul at a time. QuantV and the sharper car-texture package are intended for 6 GB devices. On 4 GB devices, switch heavy mods off in MODS if the game runs short of memory. GTA Online cars in traffic require the matching DLC packs.</p>';
  memory.append(note);
 }
 const updates=document.querySelector('#updates');
 if(updates){
  const paragraphs=updates.querySelectorAll(':scope > p');
  if(paragraphs[0])paragraphs[0].textContent='The 30 Oct release supports an in-place update: install the new build over the current installation and your existing saves and mods stay as they are.';
  if(paragraphs[1])paragraphs[1].innerHTML=`Get <code>GTAV-unsigned.ipa</code> for iPhone/iPad or <code>GTAV-mac.zip</code> for Mac from the project <a class="discord-link" href="${DISCORD}" target="_blank" rel="noopener noreferrer">Discord</a>. Keep a backup before changing signing methods or manually deleting app data.`;
 }
}

if(PAGE==='faq')patchFaq();
else if(PAGE==='guide')patchGuide();
})();