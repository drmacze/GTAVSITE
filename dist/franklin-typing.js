(()=>{'use strict';
const active=new Map();
// A preparation indicator, never a character-by-character answer animation.
function duration(value){return Math.min(6000,850+Array.from(String(value||'')).length*6);}
async function reveal(target,value){
 const full=String(value||''),row=target.closest?.('.ask-franklin-message'),container=target.closest?.('.ask-franklin-messages');
 if(row)row.dataset.typing='true';target.setAttribute('aria-busy','true');
 target.replaceChildren();const status=document.createElement('div');status.className='franklin-typing-status';status.setAttribute('role','status');status.setAttribute('aria-label','Franklin is typing');
 const label=document.createElement('span');label.textContent='Franklin is typing';status.append(label);
 for(let i=0;i<3;i++){const dot=document.createElement('i');dot.className='ask-franklin-dot';dot.setAttribute('aria-hidden','true');status.append(dot);}target.append(status);
 if(container)container.scrollTop=container.scrollHeight;
 await new Promise(resolve=>{
  let done=false;let timer;const finish=()=>{if(done)return;done=true;clearTimeout(timer);active.delete(target);target.textContent=full;target.setAttribute('aria-busy','false');if(row)delete row.dataset.typing;if(container&&container.scrollHeight-container.scrollTop-container.clientHeight<160)container.scrollTop=container.scrollHeight;resolve();};
  active.set(target,finish);timer=setTimeout(finish,document.hidden?0:duration(full));
 });
}
window.FranklinTyping={reveal,duration,finish:()=>active.forEach(f=>f())};document.addEventListener('visibilitychange',()=>{if(document.hidden)window.FranklinTyping.finish();});
})();
