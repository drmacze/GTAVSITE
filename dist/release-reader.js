(() => {
  const heading = document.querySelector('.updates-heading');
  if (!heading) return;
  const fallback = 'assets/los-santos-background.jpeg';
  const grid = document.createElement('section');
  grid.className = 'release-gallery';
  grid.setAttribute('aria-label', 'Browse releases');
  heading.insertAdjacentElement('afterend', grid);
  const dialog = document.createElement('dialog');
  dialog.className = 'release-reader';
  dialog.setAttribute('aria-labelledby', 'reader-title');
  dialog.innerHTML = '<div class="reader-paper"><div class="reader-top"><span>RELEASE NOTES</span><button type="button" class="reader-close" autofocus aria-label="Close release and return to list"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#arrow-right"></use></svg> Back to releases</button></div><img class="reader-hero" alt=""><article class="reader-article"><time class="reader-date"></time><h1 id="reader-title"></h1><div class="reader-copy"></div></article></div>';
  document.body.append(dialog);
  const paper = dialog.querySelector('.reader-paper');
  const closeButton = dialog.querySelector('.reader-close');
  const hero = dialog.querySelector('.reader-hero');
  const copy = dialog.querySelector('.reader-copy');
  let entries = [], trigger = null, closing = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatDate = value => { const d = new Date(value+'T12:00:00'); return Number.isNaN(d.valueOf()) ? value : new Intl.DateTimeFormat('en',{day:'numeric',month:'short',year:'numeric'}).format(d); };
  const make = (tag, cls, text) => {const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
  function restore() {
    if (!dialog.open || closing) return;
    closing = true;
    const finish = () => { dialog.close(); document.documentElement.classList.remove('reader-open'); closing=false; trigger?.focus({preventScroll:true}); };
    if (reduced()) { finish(); return; }
    paper.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(28px)'}],{duration:200,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}).onfinish=finish;
  }
  function close() {
    if (history.state?.gtavReleaseReader) history.back();
    else { history.replaceState(history.state,'',location.pathname+location.search); restore(); }
  }
  function open(entry, button, push = true) {
    if (closing) return;
    trigger = button;
    paper.getAnimations().forEach(a=>a.cancel());
    hero.src=entry.image; hero.onerror=()=>{hero.onerror=null;hero.src=fallback;};
    dialog.querySelector('#reader-title').textContent=entry.title;
    const time=dialog.querySelector('.reader-date'); time.textContent=entry.dateLabel;time.dateTime=entry.date;
    copy.replaceChildren(...entry.nodes.map(n=>n.cloneNode(true)));
    copy.querySelectorAll('a[href^="#"]').forEach(a=>a.remove());
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('reader-open');
    dialog.scrollTop=0;
    if(push)history.pushState({...history.state,gtavReleaseReader:entry.id},'', '#'+entry.id);
    if(!reduced()) {
      paper.animate([{opacity:0,transform:'translateY(38px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)'});
      hero.animate([{transform:'scale(1.045)'},{transform:'scale(1)'}],{duration:700,easing:'cubic-bezier(.22,1,.36,1)'});
    }
    closeButton.focus({preventScroll:true});
  }
  closeButton.addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  window.addEventListener('popstate',()=>{
    const entry=entries.find(x=>'#'+x.id===location.hash);
    if(entry&&history.state?.gtavReleaseReader)open(entry,entry.button,false);
    else restore();
  });
  function rebuild() {
    entries=[];
    document.querySelectorAll('.managed-update-card').forEach((card,index)=>{
      const time=card.querySelector('time');
      entries.push({id:'published-release-'+(card.dataset.releaseId||index),title:card.querySelector('h3').textContent,date:time?.dateTime||'',dateLabel:formatDate(time?.dateTime||''),image:card.querySelector('img')?.getAttribute('src')||fallback,nodes:[...card.querySelectorAll('.managed-update-version,.managed-update-summary,.managed-update-body,.managed-update-download')]});
    });
    document.querySelectorAll('.release-entry').forEach(card=>{
      const time=card.querySelector('time');
      entries.push({id:card.id,title:card.querySelector('h2').textContent,date:time?.dateTime||'',dateLabel:formatDate(time?.dateTime||''),image:fallback,nodes:[card.querySelector('.release-intro p'),card.querySelector('.release-body')].filter(Boolean)});
    });
    grid.replaceChildren();
    entries.forEach((entry,index)=>{
      const button=make('button','release-tile');button.type='button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label','Read full release: '+entry.title);
      const media=make('span','release-tile-media');
      const img=make('img','');img.src=entry.image;img.alt='';img.loading=index<2?'eager':'lazy';img.decoding='async';img.onerror=()=>{img.onerror=null;img.src=fallback;};
      const mark=make('span','release-tile-open');mark.setAttribute('aria-hidden','true');mark.innerHTML='<svg class="icon"><use href="assets/icons.svg#arrow-up-right"></use></svg>';
      media.append(img,mark);const title=make('h2','',entry.title);button.append(media,title);button.addEventListener('click',()=>open(entry,button));grid.append(button);entry.button=button;
      if(!reduced())button.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,delay:Math.min(index*45,225),easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
    });
    document.querySelectorAll('.managed-updates,.release-toolbar,.release-jump,.release-timeline').forEach(el=>{el.hidden=true;});
    // Hide the original archive regardless of its wrapper class, keeping it as the full-text source.
    document.querySelectorAll('.release-entry').forEach(el=>{el.hidden=true;});
    if(dialog.open&&history.state?.gtavReleaseReader)trigger=entries.find(x=>x.id===history.state.gtavReleaseReader)?.button||trigger;
    const hash=entries.find(x=>'#'+x.id===location.hash);
    if(hash&&!dialog.open)open(hash,hash.button,false);
  }
  document.addEventListener('releases:updated',rebuild);
  rebuild();
})();
