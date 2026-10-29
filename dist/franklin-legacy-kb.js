(()=>{'use strict';
if(window.__franklinLegacyKBLoaded)return;window.__franklinLegacyKBLoaded=true;
const FILES=Array.from({length:8},(_,i)=>`franklin-legacy-knowledge-${i+1}.json?v=20261030legacy351`);
let entries=null,promise=null,lastId=null,lastTopic=null;

const STOP=new Set('a an the is are was were be been being to of in on at for from with without and or but if then than so do does did can could would should will may might i me my mine you your yours we our ours they their it its this that these those what why how when where who which about please tell explain give show yang dan atau di ke dari untuk pada dengan ini itu saya aku gue kamu anda tentang apa bagaimana gimana kenapa apakah bisa tidak nggak ga gak tolong kasih jelaskan dong nya'.split(/\s+/));
const ALIAS={
  mobil:'vehicle',car:'vehicle',cars:'vehicle',kendaraan:'vehicle',
  motor:'motorcycle',bike:'motorcycle',motorbike:'motorcycle',
  pesawat:'aircraft',plane:'aircraft',jet:'aircraft',
  helikopter:'helicopter',chopper:'helicopter',
  misi:'mission',missions:'mission',
  karakter:'character',tokoh:'character',
  peta:'map',lokasi:'location',tempat:'location',
  geng:'gang',gangs:'gang',faksi:'faction',
  senjata:'weapon',gun:'weapon',guns:'weapon',
  terbaik:'best',terbagus:'best',bagus:'best',
  tercepat:'fastest',cepat:'fastest',
  murah:'cheap',termurah:'cheap',
  polisi:'police',bintang:'wanted',buronan:'wanted',
  saham:'stock',duit:'money',uang:'money',
  properti:'property',bisnis:'property',
  aktivitas:'activity',kegiatan:'activity',
  tamat:'ending',akhir:'ending',
  kemampuan:'ability',skill:'ability',
  nyetir:'driving',mengemudi:'driving',
  nembak:'shooting',tembak:'shooting',
  terbang:'flying',
  story:'storymode',campaign:'storymode',legacy:'storymode',
  michael:'michael',franklin:'franklin',trevor:'trevor',
  final:'ending',ending:'ending',
  heist:'heist',heists:'heist',
  collectibles:'collectible',koleksi:'collectible'
};
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/gta\s*5/g,'gta v').replace(/[^a-z0-9+$'.-]+/g,' ').replace(/\s+/g,' ').trim();
const tokens=v=>[...new Set(norm(v).split(' ').flatMap(t=>{if(!t||STOP.has(t))return[];const a=ALIAS[t];return a&&a!==t?[t,a]:[t]}))];
const overlap=(a,b)=>{if(!a.length||!b.length)return 0;const s=new Set(b);return a.filter(x=>s.has(x)).length/Math.max(1,a.length)};

const QUERY_GATE=/\b(gta|grand theft auto|story|legacy|michael|franklin|trevor|lester|lamar|chop|amanda|jimmy|tracey|simeon|madrazo|merryweather|fib|iaa|ballas|families|vagos|aztecas|lost mc|o'?neil|los santos|blaine|vinewood|rockford|vespucci|sandy shores|paleto|grapeseed|chiliad|zancudo|mission|misi|character|karakter|map|peta|gang|geng|vehicle|mobil|car|motor|weapon|senjata|wanted|police|polisi|stock|saham|heist|property|properti|collectible|stunt|race|golf|tennis|darts|epsilon|altruist|z-type|adder|zentorno|entity|buffalo|tailgater|bodhi|bati|buzzard|lazer|carbine|sniper|minigun|rpg)\b/;
const ONLINE_ONLY=/\b(gta online|online mode|multiplayer|bunker|nightclub|kosatka|agency|acid lab|salvage yard|bail office|garment factory|career builder|gta\+|cayo perico|diamond casino|ls car meet|terrorbyte|oppressor|securoserv|motorcycle club|mc business)\b/;
const PROJECT=/\b(ios|iphone|ipad|macos|launcher|native port|port ios|gtav unsigned|session code|enter code|nearby|local network|upnp)\b/;
const LEGACY_EXPLICIT=/\b(story mode|storymode|single player|singleplayer|legacy|campaign|michael|franklin|trevor|lester assassination|the big score|jewel store|paleto score|bureau raid|north yankton)\b/;

function unpack(row){
 const[id,topic,scope,patterns,keywords,answer,src]=row;
 return{id,topic,scope,patterns,keywords,answer,src,_patterns:(patterns||[]).map(norm),_keywords:tokens((keywords||[]).join(' ')),_answerTerms:tokens(answer)};
}
function load(){
 if(promise)return promise;
 promise=Promise.all(FILES.map(file=>fetch(file,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error(file);return r.json()})))
 .then(groups=>{
   const seen=new Set();
   entries=groups.flatMap(g=>(g.entries||[]).map(unpack)).filter(e=>!seen.has(e.id)&&seen.add(e.id));
   return entries;
 }).catch(()=>{promise=null;entries=[];return entries});
 return promise;
}
function scoreEntry(e,q){
 const n=norm(q),qt=tokens(q);let score=0,exact=false;
 for(const p of e._patterns){
   if(!p)continue;
   if(n===p){score+=60;exact=true;continue}
   if(n.length>=4&&(n.includes(p)||p.includes(n)))score+=Math.min(22,7+p.length/8);
   const pt=tokens(p),ov=overlap(qt,pt),rev=overlap(pt,qt);
   score+=ov*9.2+rev*5.2;
 }
 for(const t of qt){
   if(e._keywords.includes(t))score+=t.length>=7?4.2:2.8;
   else if(e._answerTerms.includes(t))score+=1.15;
 }
 if(LEGACY_EXPLICIT.test(n))score+=e.scope==='story-legacy'?4:0;
 if(lastId===e.id&&qt.length<=5)score+=3;
 if(lastTopic===e.topic&&qt.length<=4)score+=1.5;
 return{e,score,exact};
}
function related(topic){
 return({
  characters:['Who is Lester Crest?','What is Franklin good at?'],
  missions:['How many Story Mode missions are there?','What is The Big Score?'],
  locations:['Where is Sandy Shores?','What is Fort Zancudo?'],
  factions:['Who are the Ballas?','Who are The Families?'],
  vehicles:['What is the fastest Story Mode car?','What car is best for missions?'],
  recommendations:['What is the fastest Story Mode car?','What is the best cheap car?'],
  weapons:['What is the best rifle in Story Mode?','When does the RPG unlock?'],
  completion:['What counts for 100% completion?','Do Gold Medals matter for 100%?'],
  economy:['When should I do Lester assassinations?','How does the stock market work?'],
  activities:['What activities count for 100%?','How many stunt jumps are there?'],
  'special-abilities':['What is Franklin’s special ability?','Who is the best pilot?'],
  wanted:['How do I lose a wanted level?','What is the maximum wanted level?']
 }[topic]||[]);
}
function recommendationGuard(text,q){
 const n=norm(q);
 if(/\b(best|terbaik|terbagus)\b/.test(n)&&!/\b(fastest|tercepat)\b/.test(n)&&/\b(vehicle|mobil|car)\b/.test(n)){
   return text.replace(/^There is no single best Story Mode car for every use\./,'There is no single best Story Mode car for every use.');
 }
 return text;
}
async function answer(raw){
 const q=String(raw||'').trim(); if(!q)return null;
 const n=norm(q);
 if(PROJECT.test(n))return null;
 if(ONLINE_ONLY.test(n)&&!LEGACY_EXPLICIT.test(n))return null;
 if(!QUERY_GATE.test(n)&&!lastId)return null;
 await load(); if(!entries?.length)return null;
 let ranked=entries.map(e=>scoreEntry(e,q)).sort((a,b)=>b.score-a.score);
 let best=ranked[0],next=ranked[1]; if(!best)return null;
 const qt=tokens(q);
 if(lastId&&/^(and|what about|how about|bagaimana|gimana|lalu|terus|kalau|yang)/.test(n)){
   const previous=entries.find(e=>e.id===lastId);
   if(previous){
     const expanded=`${previous.patterns?.[0]||''} ${q}`;
     const contextual=entries.map(e=>scoreEntry(e,expanded)).sort((a,b)=>b.score-a.score);
     if(contextual[0]?.score>best.score){ranked=contextual;best=contextual[0];next=contextual[1];}
   }
 }
 const floor=qt.length<=1?7.2:qt.length===2?8.2:Math.min(13.5,6.2+qt.length*.8);
 if(!best.exact&&(best.score<floor||(next&&best.score-next.score<.65&&best.score<14)))return null;
 lastId=best.e.id;lastTopic=best.e.topic;
 return{text:recommendationGuard(best.e.answer,q),topic:best.e.topic||'gta-v-legacy',grounded:true,knowledgeId:best.e.id,suggestions:related(best.e.topic)};
}
function rank(q){return(entries||[]).map(e=>scoreEntry(e,q)).sort((a,b)=>b.score-a.score)}
function intent(q){
 const n=norm(q);
 return{project:PROJECT.test(n),online:ONLINE_ONLY.test(n),legacy:LEGACY_EXPLICIT.test(n)||QUERY_GATE.test(n)};
}
document.addEventListener('franklin-disconnect',()=>{lastId=null;lastTopic=null});
window.FranklinLegacyKB={load,answer,rank,intent,status:()=>({loaded:!!entries,entries:entries?.length||0,lastId,lastTopic,version:'2026-10-30-legacy351'})};
})();