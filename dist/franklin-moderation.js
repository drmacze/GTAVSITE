(() => {
  'use strict';
  if(window.__franklinModerationLoaded)return;window.__franklinModerationLoaded=true;
  const STRIKE_KEY='ask-franklin-moderation-strikes',MAX_STRIKES=3;

  // Multilingual community moderation. GTA gameplay vocabulary (kill, gun, weapon,
  // police, heist, wanted, mission, etc.) is deliberately not blocked by itself.
  const STRONG=[
    // English
    'fuck','fucker','fucking','motherfucker','bitch','asshole','cunt','dickhead','shithead',
    // Indonesian / Malay
    'ngentot','kontol','memek','jembut','bangsat','bajingan','keparat','pukimak','puki','kimak','butoh',
    // Spanish
    'hijoputa','hijodeputa','gilipollas','cabron','cabrona','pendejo','pendeja','coño','mierda',
    // Portuguese
    'filhodaputa','fdp','caralho','porra','arrombado','arrombada','buceta',
    // French
    'connard','connasse','encule','enculé','salope','putain','merde',
    // German
    'hurensohn','wichser','arschloch','fotze','scheisse','scheiße',
    // Italian
    'vaffanculo','stronzo','stronza','coglione','cogliona','troia','merda',
    // Dutch
    'klootzak','hoerenzoon','teringlijer','kutwijf',
    // Polish
    'kurwa','skurwysyn','chuj','pizda','jebany','jebana',
    // Russian / Ukrainian common abuse
    'сука','блять','блядь','пидор','пидорас','хуй','ебать','мудак','довбоєб','йобаний',
    // Turkish
    'orospu','orospuçocuğu','siktir','amcık','piç','yarrak',
    // Filipino / Tagalog
    'putangina','tangina','gago','gaga','ulol','tarantado','tarantada','punyeta',
    // Vietnamese
    'đụ','địt','lồn','cặc','đĩ','điếm',
    // Thai
    'เหี้ย','ควย','เย็ด','สัส','อีดอก',
    // Japanese
    'くそ','クソ','死ね','しね','殺すぞ',
    // Korean
    '씨발','시발','개새끼','병신','좆','꺼져',
    // Chinese simplified/traditional common abuse
    '操你妈','草泥马','傻逼','煞筆','煞笔','妈的','媽的','他妈的','他媽的','狗娘养的','狗娘養的',
    // Hindi / Hinglish
    'मादरचोद','बहनचोद','भोसड़ीके','भोसड़ीके','चूतिया','madarchod','madarchod','bhenchod','behenchod','bhosdike','chutiya',
    // Arabic common abuse
    'كس','شرموط','شرموطة','قحبة','ابنالقحبة','يلعنأمك'
  ];
  const MILD=[
    'idiot','moron','stupid','dumbass','goblok','tolol','bodoh','anjing','babi','sialan',
    'idiota','imbecil','imbécil','estupido','estúpido','estupida','estúpida','tonto','tonta',
    'burro','burra','otario','otário','idiot','idiote','con','conne','dummkopf','idiotisch',
    'cretino','cretina','stupido','stupida','debiel','idiota','aptal','salak','gerizekali','gerizekalı',
    'bobo','boba','tanga','đần','ngu','โง่','ばか','バカ','馬鹿','アホ','바보','멍청이','笨蛋','白痴','蠢货','蠢貨','बेवकूफ','गधा','احمق','غبي'
  ];
  const DIRECT_WORDS=['you','u','your','ur','lu','lo','kamu','anda','kau','tu','usted','vos','eres','voce','você','tu','toi','vous','du','dich','ihr','sei','jij','je','ty','sen','ikaw','mày','may','มึง','คุณ','お前','おまえ','너','니','你','你们','你們','तू','तुम','आप','انت','أنت','انتي','أنتِ'];
  const PHRASES=[
    /\bkill\s+yourself\b/i,/\bgo\s+die\b/i,/\bkys\b/i,/\b(?:you|u)\s+(?:are|re|r)\s+(?:an?\s+)?(?:idiot|moron|stupid|dumbass|bitch|asshole)\b/i,
    /\b(?:dasar|lu|lo|kamu|kau)\s+(?:goblok|tolol|bodoh|anjing|babi|bangsat)\b/i,
    /\b(?:matate|mátate|vete\s+a\s+morir)\b/i,/\b(?:mata[- ]?te|vai\s+morrer)\b/i,/\b(?:tue[- ]?toi|va\s+mourir)\b/i,
    /\b(?:bring\s+dich\s+um|stirb)\b/i,/\b(?:ammazzati|vai\s+a\s+morire)\b/i,/\b(?:dood\s+jezelf|ga\s+dood)\b/i,
    /\b(?:zabij\s+sie|zabij\s+się)\b/i,/\b(?:kendini\s+oldur|kendini\s+öldür)\b/i,/\b(?:patayin\s+mo\s+sarili|mamatay\s+ka)\b/i,
    /(?:去死|你去死|去死吧)/,/死んで|自殺しろ/,/(?:죽어|자살해)/,/(?:ไปตาย|ฆ่าตัวตาย)/,/(?:chết\s+đi|tự\s+tử\s+đi)/i,
    /(?:मर\s*जा|खुदकुशी\s*कर)/,/(?:اقتل\s*نفسك|موت|روح\s*موت)/
  ];

  const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const stripInvisible=s=>s.replace(/[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g,'');
  function normalize(raw){return stripInvisible(String(raw||'')).normalize('NFKC').toLocaleLowerCase();}
  function latinSkeleton(raw){return normalize(raw).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[@4]/g,'a').replace(/3/g,'e').replace(/[1!|]/g,'i').replace(/0/g,'o').replace(/[5$]/g,'s').replace(/7/g,'t').replace(/8/g,'b').replace(/9/g,'g').replace(/[._~*`'"^:+\-]+/g,'').replace(/(.)\1{2,}/g,'$1$1').replace(/\s+/g,' ').trim();}
  const normStrong=STRONG.map(latinSkeleton),normMild=MILD.map(latinSkeleton);
  const containsTerm=(text,term)=>{if(!term)return false;if(/[a-z0-9]/i.test(term)&&!/[\u0080-\uFFFF]/.test(term)){return new RegExp('(?:^|\\s)'+escapeRE(term)+'(?:$|\\s)','iu').test(text.replace(/[^\p{L}\p{N}]+/gu,' '));}return text.includes(term);};
  const hits=(text,list)=>list.filter(term=>containsTerm(text,term));
  function getStrikes(){try{return Math.max(0,Math.min(MAX_STRIKES,Number(sessionStorage.getItem(STRIKE_KEY))||0));}catch{return 0;}}
  function setStrikes(v){const n=Math.max(0,Math.min(MAX_STRIKES,v));try{sessionStorage.setItem(STRIKE_KEY,String(n));}catch{}return n;}
  function repeatedSpam(raw){const t=normalize(raw);if(/(.)\1{10,}/iu.test(t))return true;const words=t.split(/\s+/u).filter(Boolean);if(words.length<6)return false;const c=new Map();for(const w of words)c.set(w,(c.get(w)||0)+1);return [...c.values()].some(n=>n>=6);}
  function analyze(raw){const original=String(raw||'').trim();if(!original)return{blocked:false,severity:0,reasons:[],language:'auto'};const unicode=normalize(original),skeleton=latinSkeleton(original);let severity=0;const reasons=[];
    for(const re of PHRASES){re.lastIndex=0;if(re.test(unicode)||re.test(skeleton)){severity=Math.max(severity,3);reasons.push('harassment');}}
    const strong=[...new Set([...hits(unicode,STRONG.map(normalize)),...hits(skeleton,normStrong)])];
    const mild=[...new Set([...hits(unicode,MILD.map(normalize)),...hits(skeleton,normMild)])];
    if(strong.length){severity=Math.max(severity,2);reasons.push('profanity');}
    const directed=DIRECT_WORDS.some(w=>containsTerm(unicode,normalize(w))||containsTerm(skeleton,latinSkeleton(w)));
    if(mild.length>=2||(mild.length&&directed)){severity=Math.max(severity,1);reasons.push('insult');}
    if(repeatedSpam(original)){severity=Math.max(severity,1);reasons.push('spam');}
    return{blocked:severity>0,severity,reasons:[...new Set(reasons)],language:'auto'};
  }
  function censor(raw){let out=String(raw||'');for(const re of PHRASES){re.lastIndex=0;out=out.replace(re,m=>'•'.repeat(Math.min(10,Math.max(4,[...m].length))));}const all=[...STRONG,...MILD].sort((a,b)=>b.length-a.length);for(const word of all){const re=new RegExp(escapeRE(word),'giu');out=out.replace(re,m=>'•'.repeat(Math.min(8,Math.max(4,[...m].length))));}return out;}
  function avatar(){const n=document.createElement('span');n.className='mini-avatar';n.textContent='F';return n;}
  function appendUser(text){const m=document.querySelector('.ask-franklin-messages');if(!m)return;const r=document.createElement('div');r.className='ask-franklin-message user franklin-moderated-message';const b=document.createElement('div');b.className='bubble';b.textContent=text;b.setAttribute('aria-label','Message censored by community moderation');r.append(b);m.append(r);requestAnimationFrame(()=>m.scrollTop=m.scrollHeight);}
  function appendWarning(strike){const m=document.querySelector('.ask-franklin-messages');if(!m)return;const r=document.createElement('div');r.className='ask-franklin-message bot franklin-moderation-warning';const b=document.createElement('div');b.className='bubble';const lines=["Yo, keep it respectful, homie. That message crossed the line. Ask me about GTA V or the iOS project without the toxic stuff.","Aight, that's the second warning. Keep the chat clean and follow the community rules. I can help, but not if the conversation stays toxic.","Nah, I'm not rolling with that. You've hit the warning limit for this session. Keep it respectful and stay within the community rules if you want help."];b.textContent=lines[Math.min(strike,3)-1];r.append(avatar(),b);m.append(r);requestAnimationFrame(()=>m.scrollTop=m.scrollHeight);}
  function style(){if(document.getElementById('franklin-moderation-style'))return;const e=document.createElement('style');e.id='franklin-moderation-style';e.textContent='.franklin-moderated-message .bubble{opacity:.62;letter-spacing:.035em}.franklin-moderation-warning .bubble{border-inline-start:2px solid var(--site-accent);padding-inline-start:14px}.franklin-moderation-warning .mini-avatar{box-shadow:0 0 0 1px color-mix(in srgb,var(--site-accent) 55%,transparent)}';document.head.append(e);}
  function moderateSubmission(event){const form=event.target instanceof Element?event.target.closest('.ask-franklin-form'):null;if(!form)return;const input=form.querySelector('.ask-franklin-input'),raw=input?.value||'',result=analyze(raw);if(!result.blocked)return;event.preventDefault();event.stopImmediatePropagation();const strike=setStrikes(getStrikes()+1),masked=censor(raw);appendUser(masked===raw?'•••• Message censored by moderation ••••':masked);appendWarning(strike);if(input){input.value='';input.style.height='auto';}form.querySelector('.ask-franklin-send')?.setAttribute('disabled','');window.gtavHaptics?.trigger?.('warning');}
  style();document.addEventListener('submit',moderateSubmission,true);window.FranklinModeration={analyze,censor,getStrikes,reset:()=>setStrikes(0),version:'multilingual-2026.10.27'};
})();