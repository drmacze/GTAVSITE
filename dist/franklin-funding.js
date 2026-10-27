(() => {
  'use strict';
  if (window.__franklinFundingLoaded) return;
  window.__franklinFundingLoaded = true;

  const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const isFunding=q=>/\b(free|paid|pay|paying|payment|price|cost|fee|charge|charged|donate|donates|donated|donating|donation|donations|crypto|wallet|erc20|ethereum|sol|solana|btc|bitcoin|ltc|litecoin|tip|tips|tipping|fund|funding|support developer|support project|support you)\b/.test(norm(q));
  const wantsWallet=q=>/\b(donate|donates|donated|donating|donation|donations|crypto|wallet|erc20|ethereum|sol|solana|btc|bitcoin|ltc|litecoin|tip|tips|tipping|support developer|support project|support you)\b/.test(norm(q));
  function answer(q){
    const base="Nope — the GTA V iOS Project is completely free. You will NEVER be asked to pay for an update, to play the game, or to unlock project features. Donations are totally voluntary.";
    if(!wantsWallet(q))return{text:base+" If you want to support the developer, you can do that voluntarily via crypto, but payment is never required.",topic:'funding',suggestions:['Show crypto donation addresses','Where can I join Discord?']};
    return{text:base+"\n\nIf you want to support the developer voluntarily:\n\nERC20: 0x2df6a507b418637D465fA3402Aa05D2cdF1BDb91\nSOL: J6CtXd23tQakYhRxqu6Q31HY5RmwGwkKNPdvNarD8iqm\nBTC: bc1qk3a8jq6zr3yy6e3yg035c4lmel08l3g53nskut\nLTC: ltc1qcw0qwdqepwyqwzf8x5exdhzgpxtzmjva49ke8a\n\nThank you!",topic:'funding',suggestions:['Is donating required?','Where can I join Discord?']};
  }
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function type(b,text,m){if(window.FranklinTyping)return window.FranklinTyping.reveal(b,text);b.textContent=text;}
  async function render(q){const generation=window.FranklinSession?.generation;
    const m=document.querySelector('.ask-franklin-messages'),input=document.querySelector('.ask-franklin-input'),send=document.querySelector('.ask-franklin-send');if(!m||!input||!send)return;
    send.disabled=true;const u=document.createElement('div');u.className='ask-franklin-message user';u.innerHTML='<div class="bubble"></div>';u.querySelector('.bubble').textContent=q;m.append(u);input.value='';input.style.height='auto';
    const wait=document.createElement('div');wait.className='ask-franklin-message bot is-thinking';wait.innerHTML='<span class="mini-avatar">F</span><div class="bubble"><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i><i class="ask-franklin-dot"></i></div>';m.append(wait);m.scrollTop=m.scrollHeight;await sleep(350);if(generation!==window.FranklinSession?.generation)return;wait.remove();
    const r=answer(q),row=document.createElement('div');row.className='ask-franklin-message bot';row.innerHTML='<span class="mini-avatar">F</span>';const b=document.createElement('div');b.className='bubble';row.append(b);m.append(row);await type(b,r.text,m);if(generation!==window.FranklinSession?.generation)return;
    if(r.suggestions?.length){const w=document.createElement('div');w.className='ask-franklin-actions ask-franklin-related';r.suggestions.slice(0,2).forEach(x=>{const c=document.createElement('button');c.type='button';c.className='ask-franklin-chip';c.textContent=x;w.append(c);});m.append(w);}m.scrollTop=m.scrollHeight;send.disabled=!input.value.trim();input.focus({preventScroll:true});window.gtavHaptics?.trigger?.('soft');
  }
  document.addEventListener('submit',e=>{const f=e.target instanceof Element?e.target.closest('.ask-franklin-form'):null;if(!f)return;const q=f.querySelector('.ask-franklin-input')?.value?.trim()||'';if(!isFunding(q))return;e.preventDefault();e.stopImmediatePropagation();render(q);},true);
  document.addEventListener('click',e=>{if(!(e.target instanceof Element))return;const c=e.target.closest('.ask-franklin-chip');if(!c||!isFunding(c.textContent||''))return;e.preventDefault();e.stopImmediatePropagation();render(c.textContent||'');},true);
  window.FranklinFunding={matches:isFunding,answer};
})();