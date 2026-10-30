(()=>{
'use strict';
if(window.__siteUiPolishV2)return;
window.__siteUiPolishV2=true;

const DISCORD='https://discord.gg/HgcbPjcyJ';
const svg=name=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${name}"></use></svg>`;

function ensureCss(){
 if(document.querySelector('link[data-site-ui-polish-v2]'))return;
 const link=document.createElement('link');
 link.rel='stylesheet';
 link.href='site-ui-polish-v2.css?v=20261030ui2';
 link.dataset.siteUiPolishV2='true';
 document.head.append(link);
}

function cleanHome(){
 document.querySelector('.home-device-link')?.remove();
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
 details.style.setProperty('--order','5');
 if(compatibility.hasAttribute('aria-current')||guide.hasAttribute('aria-current')){
  details.classList.add('is-current');
  details.open=true;
 }

 const summary=document.createElement('summary');
 summary.innerHTML=`<span>Before You Start</span>${svg('chevron-down')}`;
 summary.querySelector('svg')?.classList.add('download-chevron');

 const submenu=document.createElement('div');
 submenu.className='download-submenu before-start-submenu';
 const makeLink=(href,title,iconName,current)=>{
  const link=document.createElement('a');
  link.href=href;
  if(current)link.setAttribute('aria-current','page');
  link.innerHTML=`<span class="before-start-copy"><span class="before-start-icon">${svg(iconName)}</span><span>${title}</span></span>${svg('arrow-right')}`;
  return link;
 };
 submenu.append(
  makeLink('compatibility.html','Device Compatibility','cpu',compatibility.hasAttribute('aria-current')),
  makeLink('guide.html','Installation Guide','check',guide.hasAttribute('aria-current'))
 );
 details.append(summary,submenu);

 const feedback=links.find(link=>/feedback\.html(?:$|[#?])/.test(link.getAttribute('href')||''));
 if(feedback)nav.insertBefore(details,feedback);else nav.append(details);
 compatibility.remove();
 guide.remove();
}

function createDownloadDialog(){
 let dialog=document.querySelector('#download-discord-gate');
 if(dialog)return dialog;
 dialog=document.createElement('dialog');
 dialog.id='download-discord-gate';
 dialog.className='download-discord-gate';
 dialog.setAttribute('aria-labelledby','download-gate-title');
 dialog.innerHTML=`
  <form method="dialog" class="download-gate-card">
   <button class="download-gate-close" value="cancel" aria-label="Close download dialog">${svg('close')}</button>
   <div class="download-gate-icon">${svg('download-modern')}</div>
   <p class="download-gate-kicker">DOWNLOAD ACCESS</p>
   <h2 id="download-gate-title">Continue to Discord?</h2>
   <p class="download-gate-copy">Current GTA V iOS builds are distributed through the community Discord. Continue only if you want to open Discord in a new tab.</p>
   <div class="download-gate-actions">
    <button type="submit" value="cancel" class="download-gate-cancel">Cancel</button>
    <a class="download-gate-continue" href="${DISCORD}" target="_blank" rel="noopener noreferrer"><span>Continue to Discord</span>${svg('arrow-up-right')}</a>
   </div>
  </form>`;
 document.body.append(dialog);
 dialog.addEventListener('click',event=>{
  if(event.target===dialog)dialog.close('cancel');
 });
 dialog.querySelector('.download-gate-continue')?.addEventListener('click',()=>{
  setTimeout(()=>{try{dialog.close('continue')}catch{}},0);
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

function modernizeDownload(link){
 if(!isDownloadAction(link)||link.dataset.downloadGate==='true')return;
 link.dataset.downloadGate='true';
 link.dataset.originalDownloadHref=link.getAttribute('href')||'';
 link.href=DISCORD;
 link.target='_blank';
 link.rel='noopener noreferrer';
 link.classList.add('download-gated-link');

 let label=(link.textContent||'Download').replace(/[↗↑⬆️🔗]+/g,'').replace(/\s+/g,' ').trim();
 if(!label)label='Download';
 if(!/discord/i.test(label)&&!/^download/i.test(label))label=`Download ${label}`;
 link.replaceChildren();
 const text=document.createElement('span');
 text.textContent=label;
 link.append(text);
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
 if(!dialog.open)dialog.showModal();
}

function boot(){
 ensureCss();
 cleanHome();
 polishSidebar();
 polishDownloads(document);
 createDownloadDialog();
 document.addEventListener('click',openDownloadGate,true);
 const observer=new MutationObserver(records=>{
  for(const record of records){
   for(const node of record.addedNodes){
    if(!(node instanceof Element))continue;
    if(node.matches('.home-device-link'))node.remove();
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
