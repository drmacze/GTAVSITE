(() => {
  const search=document.querySelector('#support-search');if(!search)return;
  const groups=[...document.querySelectorAll('.support-group')];
  const questions=[...document.querySelectorAll('.support-question')];
  const filters=[...document.querySelectorAll('[data-support-category]')];
  const collapse=document.querySelector('#support-collapse');
  let category='all';let timer;
  const normalize=text=>text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function updateCollapse(){collapse.disabled=!questions.some(item=>!item.hidden&&item.open);}
  function apply(){
    const term=normalize(search.value.trim());let found=0;let topics=0;
    groups.forEach(group=>{
      let visible=0;
      group.querySelectorAll('details').forEach(item=>{
        const match=(category==='all'||category===group.dataset.supportGroup)&&normalize(item.textContent).includes(term);
        item.hidden=!match;if(match){visible++;found++;}
      });group.hidden=visible===0;if(visible)topics++;
    });
    filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.supportCategory===category)));
    document.querySelector('#support-count').textContent=`${found} ${found===1?'answer':'answers'} across ${topics} ${topics===1?'topic':'topics'}`;
    document.querySelector('#support-empty').hidden=found>0;
    updateCollapse();window.ScrollTrigger?.refresh();
  }
  filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.supportCategory;apply();}));
  search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(apply,100)});
  document.querySelector('#support-reset').addEventListener('click',()=>{search.value='';category='all';apply();search.focus()});
  collapse.addEventListener('click',()=>{questions.forEach(item=>item.open=false);updateCollapse()});
  questions.forEach(item=>item.addEventListener('toggle',()=>{
    updateCollapse();
    if(item.open&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&window.gsap){gsap.fromTo(item.querySelector('.answer-body'),{opacity:0,y:-5},{opacity:1,y:0,duration:.25,clearProps:'opacity,transform'});}
  }));
  document.addEventListener('keydown',event=>{
    if(event.key==='/'&&!document.querySelector('dialog[open]')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!document.activeElement.isContentEditable){event.preventDefault();search.focus()}
    if(event.key==='Escape'&&document.activeElement===search){search.value='';apply()}
  });
  function openHash(){const question=questions.find(item=>'#'+item.id===location.hash);if(question){category='all';search.value='';apply();question.open=true;}}
  window.addEventListener('hashchange',openHash);apply();openHash();
})();
