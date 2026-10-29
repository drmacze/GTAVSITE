(()=>{
'use strict';
if(window.__gtavAdminModDescriptionEditorV1)return;window.__gtavAdminModDescriptionEditorV1=true;

const TOOLBAR=[
 {id:'bold',label:'Bold',title:'Bold',markup:'B'},
 {id:'italic',label:'Italic',title:'Italic',markup:'I'},
 {id:'underline',label:'Underline',title:'Underline',markup:'U'},
 {id:'link',label:'Link',title:'Insert link',markup:'↗'},
 {id:'list',label:'List',title:'Bullet list',markup:'≡'},
 {id:'divider',label:'Line',title:'Divider line',markup:'—'}
];

function setSelection(textarea,start,end){
 requestAnimationFrame(()=>{textarea.focus({preventScroll:true});textarea.setSelectionRange(start,end)});
}
function replace(textarea,start,end,value,selStart,selEnd){
 textarea.setRangeText(value,start,end,'end');
 textarea.dispatchEvent(new Event('input',{bubbles:true}));
 setSelection(textarea,selStart??(start+value.length),selEnd??(start+value.length));
}
function wrap(textarea,left,right,placeholder){
 const start=textarea.selectionStart,end=textarea.selectionEnd,selected=textarea.value.slice(start,end),body=selected||placeholder;
 const value=left+body+right;
 replace(textarea,start,end,value,start+left.length,start+left.length+body.length);
}
function applyList(textarea){
 const start=textarea.selectionStart,end=textarea.selectionEnd;
 const before=textarea.value.lastIndexOf('\n',Math.max(0,start-1))+1;
 const next=textarea.value.indexOf('\n',end);
 const finish=next===-1?textarea.value.length:next;
 const source=textarea.value.slice(before,finish);
 const lines=source.split('\n');
 const already=lines.every(line=>!line.trim()||/^\s*-\s+/.test(line));
 const formatted=lines.map(line=>{
  if(!line.trim())return line;
  return already?line.replace(/^(\s*)-\s+/,'$1'):line.replace(/^(\s*)/,'$1- ');
 }).join('\n');
 replace(textarea,before,finish,formatted,before,before+formatted.length);
}
function applyLink(textarea){
 const start=textarea.selectionStart,end=textarea.selectionEnd,selected=textarea.value.slice(start,end)||'link text';
 const value=`[${selected}](https://)`;
 const urlStart=start+selected.length+3;
 replace(textarea,start,end,value,urlStart,urlStart+8);
}
function applyDivider(textarea){
 const start=textarea.selectionStart,end=textarea.selectionEnd;
 let value='---';
 const before=textarea.value.slice(0,start),after=textarea.value.slice(end);
 if(before&&!before.endsWith('\n'))value='\n'+value;
 if(after&&!after.startsWith('\n'))value=value+'\n';
 replace(textarea,start,end,value);
}
function applyTool(textarea,id){
 if(id==='bold')return wrap(textarea,'**','**','bold text');
 if(id==='italic')return wrap(textarea,'*','*','italic text');
 if(id==='underline')return wrap(textarea,'__','__','underlined text');
 if(id==='link')return applyLink(textarea);
 if(id==='list')return applyList(textarea);
 if(id==='divider')return applyDivider(textarea);
}
function mount(){
 const textarea=document.getElementById('mod-description');
 if(!textarea||textarea.dataset.richEditor==='1')return false;
 textarea.dataset.richEditor='1';
 const shell=document.createElement('div');shell.className='mod-description-editor';
 const toolbar=document.createElement('div');toolbar.className='mod-description-toolbar';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Description formatting');
 TOOLBAR.forEach(tool=>{
  const button=document.createElement('button');button.type='button';button.className='mod-description-tool';button.dataset.tool=tool.id;button.title=tool.title;button.setAttribute('aria-label',tool.label);
  button.innerHTML=`<span aria-hidden="true">${tool.markup}</span><small>${tool.label}</small>`;
  button.addEventListener('mousedown',e=>e.preventDefault());
  button.addEventListener('click',()=>applyTool(textarea,tool.id));
  toolbar.append(button);
 });
 const hint=document.createElement('small');hint.className='mod-description-editor-hint';hint.textContent='Format text with bold, italic, underline, links, lists or divider lines.';
 textarea.parentNode.insertBefore(shell,textarea);shell.append(toolbar,textarea,hint);
 return true;
}
function init(){if(mount())return;const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
