(()=>{
'use strict';
if(window.__franklinDialogueGuardV1)return;
window.__franklinDialogueGuardV1=true;

const state={lastQuestion:'',lastResult:null,lastAt:0};
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+._-]+/g,' ').replace(/\s+/g,' ').trim();
const crashIntent=q=>/\b(crash|crashes|crashing|crashed|freeze|frozen|freezes|stuck|hang|hung|black screen|force close|exits? to home|closes? itself|ngecrash|macet|layar hitam)\b/.test(norm(q));
const logEvidence=q=>{
 const s=String(q||'');
 return /GTA5 UUID\s+[A-F0-9-]{6,}|compat built\s+\w+\s+\d{1,2}\s+20\d{2}|SIG(?:SEGV|TRAP|ABRT|BUS)|Unable to find critical archive|Game hung for\s+[\d.]+\s*s|memory:\s*footprint|sample count.*supported|critical archive|\[RAGE\]|\[macport\]|guard word trashed|CVehicleStreamRenderGfx|0xdddd/i.test(s);
};
const asksLogLocation=q=>/(?:where|find|location|lokasi|dimana|di mana|open|buka|cari).{0,35}\b(?:logs?|logs folder)\b|^(?:logs?|logs folder|where are the logs)\??$/i.test(String(q||''));
const asksAttach=q=>/(?:what|which).{0,25}(?:log|file).{0,25}(?:attach|send|upload|need)|(?:what should i attach|which files should i attach|how do i attach|what logs do you need)/i.test(String(q||''));
const genericFollow=q=>{
 const n=norm(q);const words=n.split(' ').filter(Boolean);
 return words.length<=10&&(/^(?:and|so|then|also|what about|how about|what else|anything else|anything more|what next|then what|now what|should i|do i need|can i|does that|is that|why|how|where|when)\b/.test(n)||/\b(?:anything else|what else|what next|anything more|same issue|same problem|that one|this one|it|that)\b/.test(n));
};

function supportSummary(){
 try{return window.FranklinSupportContext?.summary?.()||''}catch{return''}
}
function logPath(){
 let os='';try{os=String(window.FranklinSupportContext?.get?.().os||'')}catch{}
 if(/macos/i.test(os))return '~/Library/Logs/GTA5';
 if(/ipados/i.test(os))return 'Files > On My iPad > GTA V > Logs';
 if(/ios/i.test(os))return 'Files > On My iPhone > GTA V > Logs';
 return 'iPhone/iPad: Files > On My iPhone/iPad > GTA V > Logs\nMac: ~/Library/Logs/GTA5';
}
function crashIntake(){
 const context=supportSummary();
 return {
  text:[
   context?`Using your session context: ${context}`:'',
   'I need the crash log before I diagnose the cause. A device/build match by itself is not enough evidence.',
   `Open ${logPath()} and attach run.log, run.prev.log, or the crash-*.txt file from the same incident using the paperclip beside Send. If you are not sure which one matters, start with run.log and the newest crash-*.txt.`,
   'After you send it, I will match the build UUID, fatal/signature lines, archive checks, memory state, and the action immediately before the crash against the developer KB.',
   'Do not change several settings at once before sending the first log. That can hide the original failure.'
  ].filter(Boolean).join('\n\n'),
  topic:'crash-intake',grounded:true,requiresLog:true,
  suggestions:['Where can I find the logs?','What files should I attach?']
 };
}
function logHelp(){
 return {
  text:`Crash logs are here:\n${logPath()}\n\nFor a crash, attach run.log, run.prev.log, or the newest crash-*.txt from the same incident. Use the paperclip beside Send. Franklin needs the log contents before assigning a cause.`,
  topic:'crash-intake',grounded:true,requiresLog:true,
  suggestions:['What files should I attach?','My game crashes']
 };
}
function attachHelp(){
 return {
  text:'For the first diagnosis, attach run.log and the newest crash-*.txt from the same crash if you have both. run.prev.log is useful when the current run.log was replaced after reopening the game. Use the paperclip beside Send. Franklin will read the diagnostic text locally and compare it with the developer KB.',
  topic:'crash-intake',grounded:true,requiresLog:true,
  suggestions:['Where can I find the logs?','My game crashes']
 };
}
function remember(q,r){
 if(!r||r.topic==='off-topic'||r.topic==='unknown')return;
 state.lastQuestion=String(q||'').trim().slice(0,1200);
 state.lastResult={topic:r.topic||'',knowledgeId:r.knowledgeId||'',source:r.source||null,requiresLog:!!r.requiresLog};
 state.lastAt=Date.now();
 try{window.FranklinConversation?.remember?.(q,r)}catch{}
}
function contextualReply(q){
 const last=state.lastResult;if(!last||Date.now()-state.lastAt>30*60*1000)return null;
 if(last.topic==='crash-intake'||last.requiresLog){
  return {text:'The next useful check is the log itself. Attach run.log or the newest crash-*.txt from that crash. Until I can read the failure lines, I should not guess whether the cause is memory, game data, a mod, signing, graphics, or something else.',topic:'crash-intake',grounded:true,requiresLog:true,suggestions:['Where can I find the logs?','What files should I attach?']};
 }
 if(/latest-release|release-30-oct|support-context|latest-project-knowledge/.test(last.topic)){
  return {text:'If you are only checking the current release, there is nothing else you need to change. If you are troubleshooting a problem, keep the selected build as 30 Oct 2026 and describe the exact symptom. For a crash or freeze, attach the log before I diagnose it. For a GTA Online join problem, copy the joining log from Trainer > GTA Online.',topic:last.topic,grounded:true,suggestions:['What changed on 30 Oct?','My game crashes']};
 }
 return null;
}

function installDeveloper(){
 const kb=window.FranklinDeveloperKB;
 if(!kb||kb.__dialogueGuardV1||typeof kb.answer!=='function')return false;
 const old=kb.answer.bind(kb);
 kb.answer=async raw=>{
  const q=String(raw||'');
  if(asksLogLocation(q))return logHelp();
  if(asksAttach(q))return attachHelp();
  if(crashIntent(q)&&!logEvidence(q))return crashIntake();
  return await old(raw);
 };
 kb.__dialogueGuardV1=true;
 return true;
}

function installExtended(){
 const ext=window.FranklinExtended;
 if(!ext||ext.__dialogueGuardV1||typeof ext.answer!=='function')return false;
 const old=ext.answer.bind(ext);
 ext.answer=async raw=>{
  const q=String(raw||'').trim();
  if(!q)return old(raw);
  if(asksLogLocation(q)){const r=logHelp();remember(q,r);return r;}
  if(asksAttach(q)){const r=attachHelp();remember(q,r);return r;}
  if(crashIntent(q)&&!logEvidence(q)){const r=crashIntake();remember(q,r);return r;}
  if(genericFollow(q)&&state.lastQuestion){
   const direct=contextualReply(q);
   if(direct){remember(q,direct);return direct;}
   const enriched=`Regarding my previous GTA V question: ${state.lastQuestion}. Follow-up: ${q}`;
   const r=await old(enriched);remember(q,r);return r;
  }
  const r=await old(q);remember(q,r);return r;
 };
 ext.__dialogueGuardV1=true;
 return true;
}

function install(){installDeveloper();installExtended();}
document.addEventListener('franklin-connected',()=>setTimeout(install,0));
document.addEventListener('franklin-disconnect',()=>{state.lastQuestion='';state.lastResult=null;state.lastAt=0;});
let tries=0;const timer=setInterval(()=>{tries++;install();if(tries>1200||(window.FranklinDeveloperKB?.__dialogueGuardV1&&window.FranklinExtended?.__dialogueGuardV1))clearInterval(timer)},50);
addEventListener('pagehide',()=>clearInterval(timer),{once:true});
window.FranklinDialogueGuard={crashIntent,logEvidence,status:()=>({developer:!!window.FranklinDeveloperKB?.__dialogueGuardV1,extended:!!window.FranklinExtended?.__dialogueGuardV1,lastTopic:state.lastResult?.topic||'',requiresLog:!!state.lastResult?.requiresLog})};
})();
