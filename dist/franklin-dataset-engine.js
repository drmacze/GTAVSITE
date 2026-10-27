(()=>{'use strict';let data=null,promise=null,last=null;
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/gta\s*5/g,'gta v').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set('a an the is are was were i my me you your it to of for in on with and or please tell explain what who where when how do does can could would about saya aku kamu apa siapa dimana bagaimana kenapa tolong yang dan di ke untuk itu ini gta v ios'.split(' '));
const terms=v=>[...new Set(norm(v).split(' ').filter(t=>t.length>1&&!stop.has(t)))];
function outside(q){const n=norm(q);if(/[\r\n]/.test(q)&&/gta5|GTA5|Game hung|critical archive|sample count/.test(q))return false;
 const project=/gta v|grand theft auto|launcher|project|proyek|donat|support developer|sideload|dxmt/.test(n);
 if(/\b(recipe|resep|cook|masak|football|soccer|politic|presiden|president|homework|matematika|calculus|relationship|pacar|dating|medical|medicine|diagnose|horoscope|zodiak|translate|terjemahkan)\b/.test(n))return true;
 if(/\b(python|javascript|sql|html|code a|write code|buat kode)\b/.test(n)&&!/settings|configuration|config|json|launcher/.test(n))return true;
 if(/\b(bitcoin|btc|ethereum|crypto|stock price|harga saham)\b/.test(n)&&!(/donat|support developer|support project|wallet address/.test(n)&&project)&&!/gta v.*stock|stock.*gta v/.test(n))return true;
 if(/\b(weather|cuaca|temperature|suhu)\b/.test(n)&&!/gta v|game|ingame|in game|thermal|phone|iphone|perangkat|hp|panas/.test(n))return true;
 if(/(?:iphone|ipad|macbook).*\b(price|harga|buy|beli)\b/.test(n)&&!project)return true;
 if(/ignore.*instructions|ignore.*rules|pretend.*unrestricted|abaikan.*aturan/.test(n))return true;
 return false;}
function refusal(){return{text:'I can only help with GTA V and the GTA V iOS Project, so I cannot answer that unrelated question. You can ask about gameplay, installation, the launcher, compatibility or troubleshooting.',topic:'off-topic',grounded:true};}
function load(){return promise||(promise=fetch('franklin-dataset.json?v=20261027dataset').then(r=>{if(!r.ok)throw Error('dataset');return r.json()}).then(d=>data=d.entries.map(e=>({...e,_patterns:e.patterns.map(norm),_terms:e.patterns.map(terms)}))).catch(()=>{promise=null;return data=[]}));}
function rank(q){const n=norm(q),qt=terms(q);return(data||[]).map(e=>{let score=0,exact=false;for(let i=0;i<e._patterns.length;i++){const p=e._patterns[i];if(n===p){score=100;exact=true;break;}const pt=e._terms[i],overlap=qt.filter(t=>pt.includes(t)).length;if(!overlap)continue;const coverage=overlap/Math.max(1,qt.length),patternCoverage=overlap/Math.max(1,pt.length);let value=coverage*.65+patternCoverage*.35;if(coverage<.7)value*=.5;if(qt.length===1&&!p.split(' ').includes(qt[0]))value=0;score=Math.max(score,value*10);}return{e,score,exact}}).sort((a,b)=>b.score-a.score);}
async function answer(q){if(outside(q))return refusal();await load();if(!data?.length)return null;let ranked=rank(q),best=ranked[0],next=ranked[1];if(!best)return null;
 // Follow-ups use only the last matched subject, never the full chat as instructions.
 if(last&&/^(and |what about |how about |bagaimana |lalu |terus )/.test(norm(q))){const contextual=rank(last+' '+q);if(contextual[0]?.score>best.score){ranked=contextual;best=ranked[0];next=ranked[1];}}
 if(!best.exact&&(best.score<8.4||next&&best.score-next.score<1.15))return null;
 last=best.e.patterns[0];return{text:best.e.answer,topic:best.e.topic||'knowledge',grounded:true,knowledgeId:best.e.id,suggestions:['What information do you need?','Where can I find the logs?']};}
function clarify(){return{text:'I do not have a reliable answer for that specific GTA V question yet. Which mission, launcher setting or error do you mean? For a technical problem, include the selected app build and the exact symptom or attach a log. I will not guess missing details.',topic:'clarification',grounded:true};}
document.addEventListener('franklin-disconnect',()=>{last=null;});window.FranklinDataset={load,answer,outside,refusal,clarify,rank};
})();
