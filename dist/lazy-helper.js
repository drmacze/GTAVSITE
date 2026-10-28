(()=>{if(!document.body.dataset.page||window.__lazyHelper)return;window.__lazyHelper=true;

// Keep Franklin's compact helper bubble attached to the launcher without ever covering it.
(()=>{
  if(document.body.dataset.page!=='home'||window.__franklinNudgePositionGuard)return;window.__franklinNudgePositionGuard=true;
  const style=document.createElement('style');style.textContent=`.franklin-nudge.nudge-left::after{right:-5px;left:auto;top:auto;bottom:9px;transform:rotate(45deg)}.franklin-nudge.nudge-right::after{left:-5px;right:auto;top:auto;bottom:9px;transform:rotate(225deg)}.franklin-nudge.nudge-above::after{right:22px;left:auto;top:auto;bottom:-6px;transform:rotate(135deg)}.franklin-nudge.nudge-below::after{right:22px;left:auto;top:-6px;bottom:auto;transform:rotate(-45deg)}`;document.head.append(style);
  let bubble=null,launcher=null,raf=0;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const place=()=>{
    raf=0;bubble=bubble||document.querySelector('.franklin-nudge');launcher=launcher||document.querySelector('.ask-franklin-launcher');
    if(!bubble||!launcher||!bubble.classList.contains('is-visible'))return;
    const r=launcher.getBoundingClientRect();
    bubble.style.left='0px';bubble.style.top='0px';
    const b=bubble.getBoundingClientRect();
    const vv=window.visualViewport;const vw=vv?.width||innerWidth;const vh=vv?.height||innerHeight;
    const gap=12,edge=10,leftRoom=r.left-edge,rightRoom=vw-r.right-edge;
    let left,top,placement;
    if(leftRoom>=b.width+gap){placement='left';left=r.left-b.width-gap;top=r.top+(r.height-b.height)/2}
    else if(rightRoom>=b.width+gap){placement='right';left=r.right+gap;top=r.top+(r.height-b.height)/2}
    else if(r.top>=b.height+gap+edge){placement='above';left=clamp(r.right-b.width,edge,vw-b.width-edge);top=r.top-b.height-gap}
    else{placement='below';left=clamp(r.right-b.width,edge,vw-b.width-edge);top=r.bottom+gap}
    top=clamp(top,edge,vh-b.height-edge);
    bubble.classList.remove('nudge-left','nudge-right','nudge-above','nudge-below');bubble.classList.add('nudge-'+placement);
    bubble.style.left=Math.round(left)+'px';bubble.style.top=Math.round(top)+'px';
  };
  const schedule=()=>{if(raf)return;raf=requestAnimationFrame(place)};
  const observe=()=>{bubble=document.querySelector('.franklin-nudge');launcher=document.querySelector('.ask-franklin-launcher');if(!bubble||!launcher)return false;new MutationObserver(schedule).observe(bubble,{attributes:true,attributeFilter:['class']});schedule();return true};
  if(!observe()){const mo=new MutationObserver(()=>{if(observe())mo.disconnect()});mo.observe(document.body,{childList:true,subtree:true})}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});window.visualViewport?.addEventListener('scroll',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule,{passive:true});
})();

const loaded=new Set();let running=false;const button=document.createElement('button');button.className='lazy-franklin';button.textContent='Ask Franklin';button.setAttribute('aria-label','Connect to Franklin');(document.querySelector('#feedback-helper-slot')||document.body).append(button);const panel=document.createElement('section');panel.className='asset-loader';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Loading Franklin');panel.innerHTML='<div><small>ASSISTANT CHANNEL</small><h2>Connecting to Franklin</h2><p role="status">Building the interface…</p><progress max="100" value="0" aria-label="Assets loaded"></progress><small class="asset-count"></small><button type="button">Close</button></div>';document.body.append(panel);panel.querySelector('button').onclick=()=>{panel.hidden=true};
const scripts=['franklin-conversation.js','ask-franklin.js','franklin-analytics.js','franklin-moderation.js','franklin-funding.js','franklin-typing.js','franklin-support-context.js','franklin-developer-kb.js','franklin-log-files.js','franklin-dataset-engine.js','franklin-claude-rag.js','franklin-site-rag.js','franklin-webllm.js','franklin-engine-extra.js','franklin-engine.js'];
const knowledgeNames=['FranklinDeveloperKB','FranklinDataset','FranklinClaudeRAG'];
function script(src){if(loaded.has(src))return Promise.resolve();return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v=20261028kb2';const timeout=setTimeout(()=>{s.remove();reject(Error('Connection timed out. Tap Retry.'))},20000);s.onload=()=>{clearTimeout(timeout);loaded.add(src);resolve()};s.onerror=()=>{clearTimeout(timeout);s.remove();reject(Error('An asset could not load. Check your connection and retry.'))};document.head.append(s)})}
button.onclick=async()=>{panel.hidden=false;if(running)return;running=true;button.disabled=true;const status=panel.querySelector('p'),progress=panel.querySelector('progress'),count=panel.querySelector('.asset-count');let done=0;const total=scripts.length+knowledgeNames.length;const update=()=>{progress.value=100*done/total;count.textContent=done+' / '+total+' assets ready'};try{update();for(const src of scripts){status.textContent=done<2?'Building the interface…':'Assembling assistant assets…';await script(src);done++;update()}status.textContent='Loading project knowledge…';for(const name of knowledgeNames){const api=window[name];if(!api?.load)throw Error('Knowledge module could not initialize. Reload the page to retry.');const data=await Promise.race([api.load(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Knowledge timed out. Reload the page to retry.')),20000))]);if(!data?.length)throw Error('Knowledge could not load. Reload the page to retry.');done++;update()}await Promise.all([...document.querySelectorAll('link[data-ask-franklin]')].map(link=>link.sheet?Promise.resolve():new Promise((resolve,reject)=>{link.addEventListener('load',resolve,{once:true});link.addEventListener('error',()=>reject(Error('Interface styles could not load. Reload to retry.')),{once:true});setTimeout(()=>link.sheet?resolve():reject(Error('Styles timed out. Reload to retry.')),20000)})));status.textContent='Ready';button.remove();const launcher=document.querySelector('.ask-franklin-launcher');if(!panel.hidden&&launcher){if(launcher.dataset.state==='compact')launcher.click();launcher.click()}panel.hidden=true;document.body.classList.remove('helper-assets-pending')}catch(e){status.textContent=e.message||'Unable to connect. Please retry.';button.textContent='Retry Franklin';button.disabled=false}finally{running=false}};document.body.classList.add('helper-assets-pending');})();
