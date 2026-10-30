(()=>{
'use strict';
if(window.__siteUiPolishV10)return;
window.__siteUiPolishV10=true;

const DISCORD='https://discord.gg/HgcbPjcyJ';
const svg=name=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

function ensureCss(){
 if(!document.querySelector('link[data-site-ui-polish-v2]')){
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='site-ui-polish-v2.css?v=20261030ui7';
  link.dataset.siteUiPolishV2='true';
  document.head.append(link);
 }
 if(!document.querySelector('link[data-discord-gate-online]')){
  const gate=document.createElement('link');
  gate.rel='stylesheet';
  gate.href='discord-gate-online-v1.css?v=20261030gate1';
  gate.dataset.discordGateOnline='true';
  document.head.append(gate);
 }
 if(document.body?.dataset.page==='updates'&&!document.getElementById('release-27-polish-v2')){
  document.querySelector('link[data-release-27-redesign]')?.remove();
  const releaseScript=document.createElement('script');
  releaseScript.id='release-27-polish-v2';
  releaseScript.src='release-27-polish-v1.js?v=20261030r27b';
  document.head.append(releaseScript);
 }
}

function cleanHome(){
 document.querySelector('.home-device-link')?.remove();
 const heroTitle=document.querySelector('.home-content h1 span');
 if(heroTitle)heroTitle.textContent='iOS & macOS.';
}

function cleanUpdates(root=document){
 const targets=[];
 if(root instanceof Element&&root.matches('.updates-heading .updates-download'))targets.push(root);
 root.querySelectorAll?.('.updates-heading .updates-download').forEach(node=>targets.push(node));
 targets.forEach(node=>node.remove());
}

function cleanCommunityLinks(root=document){
 const links=[];
 if(root instanceof Element&&root.matches('a[href]'))links.push(root);
 root.querySelectorAll?.('a[href]').forEach(link=>links.push(link));
 links.forEach(link=>{
  const href=(link.getAttribute('href')||'').trim();
  if(!/^(?:\.\/)?community\.html(?:$|[#?])/.test(href))return;
  if(link.closest('.desktop-nav')||link.closest('#site-menu .drawer-nav')||link.closest('.site-footer nav')){
   link.remove();
   return;
  }
  link.href=DISCORD;
  link.target='_blank';
  link.rel='noopener noreferrer';
 });
}

function polishSidebar(){
 const nav=document.querySelector('#site-menu .drawer-nav');
 if(!nav||nav.querySelector('.before-start-menu'))return;
 const links=[...nav.querySelectorAll(':scope > a[href]')];
 const compatibility=links.find(link=>/compatibility\.html(?:$|[#?])/.test(link.getAttribute('href')||''));
 const guide=links.find(link=>/guide\.html(?:$|[#?])/.test(link.getAttribute('href')||''));
 if(!compatibility||!guide)return;

 const details=document.createElement('details');
 details.className='download-menu before-start-menu';
 details.style.setProperty('--order','99');
 details.style.order='99';
 if(compatibility.hasAttribute('aria-current')||guide.hasAttribute('aria-current')){
  details.classList.add('is-current');
  details.open=true;
 }

 const summary=document.createElement('summary');
 summary.textContent='Before You Start';

 const submenu=document.createElement('div');
 submenu.className='download-submenu before-start-submenu';
 const makeLink=(href,title,current)=>{
  const link=document.createElement('a');
  link.href=href;
  if(current)link.setAttribute('aria-current','page');
  link.textContent=title;
  return link;
 };
 submenu.append(
  makeLink('compatibility.html','Device Compatibility',compatibility.hasAttribute('aria-current')),
  makeLink('guide.html','Installation Guide',guide.hasAttribute('aria-current'))
 );
 details.append(summary,submenu);

 compatibility.remove();
 guide.remove();
 nav.append(details);
}

function closeDownloadDialog(dialog,result='cancel'){
 if(!dialog?.open||dialog.classList.contains('is-closing'))return;
 dialog.classList.add('is-closing');
 dialog.classList.remove('is-visible');
 const finish=()=>{
  if(!dialog.open)return;
  try{dialog.close(result)}catch{}
 };
 if(reduceMotion.matches){finish();return}
 clearTimeout(dialog.__closeTimer);
 dialog.__closeTimer=setTimeout(finish,360);
}

function showDownloadDialog(dialog){
 clearTimeout(dialog.__closeTimer);
 dialog.classList.remove('is-closing','is-visible');
 if(!dialog.open)dialog.showModal();
 requestAnimationFrame(()=>requestAnimationFrame(()=>dialog.classList.add('is-visible')));
}

function createDownloadDialog(){
 let dialog=document.querySelector('#download-discord-gate');
 if(dialog)return dialog;
 dialog=document.createElement('dialog');
 dialog.id='download-discord-gate';
 dialog.className='download-discord-gate';
 dialog.setAttribute('aria-labelledby','download-gate-title');
 dialog.innerHTML=`
  <form class="download-gate-card">
   <div class="download-gate-inner">
    <div class="download-gate-grip" aria-hidden="true"><span></span></div>
    <button type="button" class="download-gate-close" aria-label="Close download dialog">${svg('close')}</button>
    <div class="download-gate-icon">${svg('download-modern')}</div>
    <p class="download-gate-kicker">DOWNLOAD ACCESS</p>
    <h2 id="download-gate-title">Continue to Discord?</h2>
    <p class="download-gate-copy">Current GTA V iOS builds are distributed through the community Discord. Continue only if you want to open Discord in a new tab.</p>
    <div class="download-gate-actions">
     <a class="download-gate-continue" href="${DISCORD}" target="_blank" rel="noopener noreferrer"><span>Continue to Discord</span>${svg('arrow-up-right')}</a>
     <button type="button" class="download-gate-cancel">Cancel</button>
    </div>
   </div>
  </form>`;
 document.body.append(dialog);
 dialog.addEventListener('cancel',event=>{
  event.preventDefault();
  closeDownloadDialog(dialog,'cancel');
 });
 dialog.addEventListener('click',event=>{
  if(event.target===dialog)closeDownloadDialog(dialog,'cancel');
 });
 dialog.querySelector('.download-gate-close')?.addEventListener('click',()=>closeDownloadDialog(dialog,'cancel'));
 dialog.querySelector('.download-gate-cancel')?.addEventListener('click',()=>closeDownloadDialog(dialog,'cancel'));
 dialog.querySelector('.download-gate-continue')?.addEventListener('click',()=>{
  setTimeout(()=>closeDownloadDialog(dialog,'continue'),0);
 });
 dialog.addEventListener('close',()=>{
  clearTimeout(dialog.__closeTimer);
  dialog.classList.remove('is-visible','is-closing');
 });
 return dialog;
}

function isDownloadAction(link){
 if(!(link instanceof HTMLAnchorElement))return false;
 if(link.closest('.download-discord-gate'))return false;
 const label=(link.textContent||'').trim();
 if(link.matches('.updates-download,.managed-update-download'))return true;
 if(link.classList.contains('discord-link')&&/download/i.test(label))return true;
 if(link.closest('.release-download')&&!/^#/.test(link.getAttribute('href')||'')&&!/back to top/i.test(label))return true;
 const href=link.getAttribute('href')||'';
 return /gofile\.io/i.test(href);
}

function cleanedLabel(link){
 const clone=link.cloneNode(true);
 clone.querySelectorAll('small,svg,.download-gated-icon').forEach(node=>node.remove());
 let label=(clone.textContent||'Download').replace(/[↗↑⬆️🔗]+/g,'').replace(/\s+/g,' ').trim();
 if(!label)label='Download';
 if(!/discord/i.test(label)&&!/^download/i.test(label))label=`Download ${label}`;
 return label;
}

function modernizeDownload(link){
 if(!isDownloadAction(link)||link.dataset.downloadGate==='true')return;
 const meta=link.querySelector('small')?.textContent?.trim()||'';
 const label=cleanedLabel(link);
 link.dataset.downloadGate='true';
 link.dataset.originalDownloadHref=link.getAttribute('href')||'';
 link.href=DISCORD;
 link.target='_blank';
 link.rel='noopener noreferrer';
 link.classList.add('download-gated-link');
 link.replaceChildren();

 if(meta){
  const copy=document.createElement('span');
  const small=document.createElement('small');
  small.textContent=meta;
  copy.append(small,document.createTextNode(label));
  link.append(copy);
 }else{
  const text=document.createElement('span');
  text.textContent=label;
  link.append(text);
 }
 const iconWrap=document.createElement('span');
 iconWrap.className='download-gated-icon';
 iconWrap.innerHTML=svg('download-modern');
 link.append(iconWrap);
}

function polishDownloads(root=document){
 const links=root instanceof Element&&root.matches('a[href]')?[root]:[...(root.querySelectorAll?.('a[href]')||[])];
 links.forEach(modernizeDownload);
}

function openDownloadGate(event){
 const link=event.target.closest?.('a[data-download-gate="true"]');
 if(!link)return;
 if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 const dialog=createDownloadDialog();
 showDownloadDialog(dialog);
}

function boot(){
 ensureCss();
 cleanHome();
 cleanUpdates();
 cleanCommunityLinks();
 polishSidebar();
 polishDownloads(document);
 createDownloadDialog();
 document.addEventListener('click',openDownloadGate,true);
 const observer=new MutationObserver(records=>{
  for(const record of records){
   for(const node of record.addedNodes){
    if(!(node instanceof Element))continue;
    if(node.matches('.home-device-link'))node.remove();
    cleanUpdates(node);
    cleanCommunityLinks(node);
    polishDownloads(node);
   }
  }
  polishSidebar();
 });
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
