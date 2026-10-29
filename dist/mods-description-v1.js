(()=>{
'use strict';
if(window.__gtavModsDescriptionV2)return;window.__gtavModsDescriptionV2=true;

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function emphasis(source){
 let html=escapeHtml(source);
 html=html.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
 html=html.replace(/\*([^*\n]+)\*/g,'<em>$1</em>');
 return html;
}
function inline(source){
 const text=String(source??'');
 const re=/\[([^\]\n]{1,160})\]\((https?:\/\/[^\s)]+)\)/gi;
 let html='',last=0,match;
 while((match=re.exec(text))){
  html+=emphasis(text.slice(last,match.index));
  let href='';try{const url=new URL(match[2]);if(url.protocol==='https:'||url.protocol==='http:')href=url.href}catch{}
  if(href)html+=`<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${emphasis(match[1])}</a>`;
  else html+=emphasis(match[0]);
  last=re.lastIndex;
 }
 return html+emphasis(text.slice(last));
}
function renderMarkdown(source){
 const lines=String(source??'').replace(/\r\n?/g,'\n').split('\n');
 const out=[];let paragraph=[],list=[];
 const flushParagraph=()=>{if(!paragraph.length)return;out.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);paragraph=[]};
 const flushList=()=>{if(!list.length)return;out.push(`<ul>${list.map(item=>`<li>${inline(item)}</li>`).join('')}</ul>`);list=[]};
 for(const raw of lines){
  const trimmed=raw.trim();
  if(!trimmed){flushParagraph();flushList();continue}
  if(/^(---|___)$/.test(trimmed)){flushParagraph();flushList();out.push('<hr>');continue}
  const bullet=raw.match(/^\s*-\s+(.+)$/);
  if(bullet){flushParagraph();list.push(bullet[1]);continue}
  flushList();paragraph.push(raw);
 }
 flushParagraph();flushList();
 return out.join('');
}
function prepare(description){
 if(!description||description.dataset.richReady==='1')return description;
 const source=description.textContent||'';
 let node=description;
 if(description.tagName==='P'){
  node=document.createElement('div');
  node.className=description.className;
  for(const attr of [...description.attributes])if(attr.name!=='class')node.setAttribute(attr.name,attr.value);
  description.replaceWith(node);
 }
 node.dataset.richReady='1';
 node.classList.add('is-rich-description');
 node.innerHTML=renderMarkdown(source);
 return node;
}
function enhance(original){
 const description=prepare(original);
 if(!description||description.dataset.readMoreReady==='1')return;
 description.dataset.readMoreReady='1';
 if(!description.textContent.trim())return;
 const wrap=document.createElement('div');wrap.className='library-description-wrap';
 description.parentNode.insertBefore(wrap,description);wrap.append(description);
 description.classList.add('is-collapsible');
 const button=document.createElement('button');button.type='button';button.className='library-description-toggle';button.textContent='Read more';button.setAttribute('aria-expanded','false');button.hidden=true;wrap.append(button);
 const sync=()=>{
  if(description.classList.contains('is-expanded')){button.hidden=false;return}
  requestAnimationFrame(()=>{button.hidden=description.scrollHeight<=description.clientHeight+2});
 };
 button.addEventListener('click',()=>{
  const expanded=!description.classList.contains('is-expanded');
  description.classList.toggle('is-expanded',expanded);
  button.textContent=expanded?'Show less':'Read more';
  button.setAttribute('aria-expanded',String(expanded));
  if(!expanded)description.scrollIntoView({block:'nearest',behavior:'smooth'});
 });
 sync();
 if('ResizeObserver'in window)new ResizeObserver(sync).observe(description);
}
function scan(root=document){root.querySelectorAll?.('.library-card-description').forEach(enhance)}
function init(){if(document.body?.dataset.page!=='downloads')return;scan();const target=document.querySelector('.mods-studio')||document.body;new MutationObserver(mutations=>{for(const mutation of mutations){mutation.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.('.library-card-description'))enhance(node);scan(node)})}}).observe(target,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
