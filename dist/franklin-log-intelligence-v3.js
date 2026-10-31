(()=>{
'use strict';
if(window.__franklinLogIntelligenceV3)return;
window.__franklinLogIntelligenceV3=true;

const state={last:null,lastAt:0,history:[]};
const clean=v=>String(v||'').replace(/\r/g,'');
const one=(text,re)=>text.match(re)?.[1]||'';
const context=()=>{try{return window.FranklinSupportContext?.get?.()||{}}catch{return{}}};
const uniq=a=>[...new Set(a.filter(Boolean))];
const cap=(s,n=180)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s;};
const confidenceLabel=n=>n>=.9?'high':n>=.68?'medium':'low';
function all(text,re,group=1){const out=[];for(const m of text.matchAll(re))out.push((m[group]||m[0]||'').trim());return uniq(out);}
function parseFrames(text){return text.split('\n').map(line=>{const m=line.match(/^\s*\d+\s+([^\s]+)\s+0x[0-9a-f]+\s+(.+)$/i);return m?{module:m[1],symbol:m[2].trim()}:null;}).filter(Boolean);}
function fileType(text,filename=''){
 const n=String(filename||'').toLowerCase();
 if(/^crash-.*\.txt$/.test(n)||/\*\*\*\s*GTA V\s*\([^)]+\)\s*crashed:/i.test(text))return'crash-report';
 if(/run\.prev\.log$/.test(n))return'run-prev';
 if(/run\.log$/.test(n))return'run-log';
 if(!/\*\*\*\s*GTA V\s*\([^)]+\)\s*crashed:/i.test(text)&&/(?:\[macport\]|\[RAGE\]|GTA5 UUID|compat built|memory:\s*footprint)/i.test(text))return'run-log';
 return'log';
}
function supportContext(){const c=context();return{sessionOS:c.os||'',sessionBuild:c.build?.label||'',sessionBuildPlatform:c.build?.platform||'',sessionUUID:c.uuid||''};}
function base(text,opts={}){
 const frames=parseFrames(text),ctx=supportContext();
 const detectedBuild=window.FranklinDeveloperKB?.detectBuild?.(text)||null;
 const signal=one(text,/crashed:\s*(SIG[A-Z0-9]+)/i)||one(text,/\b(SIG(?:SEGV|TRAP|ABRT|BUS|ILL|FPE))\b/i);
 const headerPlatform=one(text,/\*\*\*\s*GTA V\s*\(([^)]+)\)\s*crashed/i);
 const thread=one(text,/crashed:\s*SIG[A-Z0-9]+[^\n]*thread\s+(\d+)/i);
 const uuid=one(text,/GTA5\s+(?:UUID\s*[:=]?\s*)?([A-F0-9]{8}(?:-[A-F0-9-]{4,})?)/i);
 const compatBuilt=one(text,/compat built\s+([^\n;]+)/i);
 const memoryMatches=[...text.matchAll(/memory:\s*footprint\s+(\d+)\s*MB.*?(\d+)\s*MB left/ig)];
 const memory=memoryMatches.length?{footprint:Number(memoryMatches.at(-1)[1]),left:Number(memoryMatches.at(-1)[2])}:null;
 const thermalMatches=[...text.matchAll(/thermal\s*[:=]?\s*(nominal|fair|serious|critical)/ig)];
 const thermal=thermalMatches.length?thermalMatches.at(-1)[1].toLowerCase():'';
 return{
  kind:'unknown',title:'Crash signature not identified',diagnosis:'No confirmed root cause yet',confidenceScore:.25,confidence:'low',
  fileType:fileType(text,opts.filename),filename:opts.filename||'',signal,thread,headerPlatform,uuid,compatBuilt,
  modules:uniq(frames.map(x=>x.module)),frames, ...ctx, memory,thermal,logBuild:detectedBuild,
  evidence:[],supporting:[],notIndicated:[],meaning:'The log is valid GTA V diagnostic data, but there is not enough evidence yet to identify the root cause confidently.',
  next:['Attach run.log from the same incident.','If run.log was replaced after reopening the game, attach run.prev.log instead.'],
  needsRunLog:true,rootCauseKnown:false,developerMatch:'',severity:'diagnostic',exactFiles:[],notableLines:[]
 };
}
function finish(r,score){r.confidenceScore=score;r.confidence=confidenceLabel(score);return r;}
function environmentalNotes(r){
 if(r.memory){
  if(r.memory.left>=700)r.notIndicated.push(`Low-memory pressure is not indicated by this snapshot: ${r.memory.left} MB remained.`);
  else if(r.memory.left<150)r.supporting.push(`Memory headroom was very low: ${r.memory.left} MB remained. This may contribute to instability, but it is not automatically the primary cause.`);
  else r.supporting.push(`Recorded memory headroom: ${r.memory.left} MB.`);
 }
 if(r.thermal==='nominal'||r.thermal==='fair')r.notIndicated.push(`Thermal state was ${r.thermal}; overheating is not indicated by this snapshot.`);
 else if(/serious|critical/.test(r.thermal))r.supporting.push(`Thermal state was ${r.thermal}, which can worsen stability.`);
 return r;
}
function correlate(r,text){
 const recent=[...state.history].reverse().find(x=>Date.now()-x.at<30*60*1000&&x.result!==r);
 if(!recent)return r;
 const p=recent.result;
 if(r.fileType.startsWith('run')&&p.kind==='dxmt-device-init'){
  const lines=text.split('\n').filter(l=>/(dxmt|metal|d3d11|shader|command library|pipeline|gpu)/i.test(l)&&/(error|fatal|fail|unsupported|abort|assert)/i.test(l)).slice(-6).map(cap);
  if(lines.length){
   r.kind='dxmt-run-context';r.title='DXMT / Metal startup error found in run log';r.diagnosis='Graphics initialization failure is reinforced by the run log';r.rootCauseKnown=false;r.needsRunLog=false;r.evidence.push('A recent crash report in this support session failed inside DXMT/D3D11 device creation.');r.evidence.push(...lines.map(x=>'run.log: '+x));r.meaning='The crash report and run log point to the same graphics initialization path. The exact error line is now visible, but Franklin will not invent a lower-level cause beyond what that line states.';r.next=['Use the exact run.log error when reporting the issue in #support.','If a graphics overhaul or third-party hook is installed, reproduce once on the plain build or with only one supported overhaul enabled.'];finish(r,.91);
  }
 }
 return r;
}
function analyze(raw,opts={}){
 const text=clean(raw);if(!text.trim())return null;
 let r=base(text,opts);
 const missingArchives=all(text,/Unable to find critical archive\s+['\"]?([^'\"\n,]+)['\"]?/ig);
 const missingMovies=all(text,/\bno\s+(movies\/[\w./ -]+\.mp4)\b/ig);
 const dataPatchNo=/datapatch:\s*no patches(?:\s+and\s+no\s+\.macport_decrypted\s+marker)?/i.test(text);
 const stalls=all(text,/streamer:\s*([^\n]+?\s+stalled(?:\s*\([^)]+\))?)(?:\n|$)/ig);
 const fatalLines=all(text,/^.*fatal error:\s*([^\n]+)$/gim);
 const terminated15=/terminated by signal\s*15/i.test(text);
 const previousNoReport=/\[macport\]\s*previous run:.*no report/i.test(text);
 const dd=/0x[dD]{8,16}|freed memory\s*\(0xDD fill\)/i.test(text);
 const dxmtInit=/d3d11\.dylib/i.test(text)&&/(InternalCommandLibrary|CreateDXMTDevice|D3D11CreateDevice(?:AndSwapChain)?)/i.test(text)&&/(SettingsDefaults|GetDisplayInfo|GenerateDefaultSettings|CSettingsManager)/i.test(text);
 const thirdParty=/(d3dr1\.dylib|libposthook\.dylib|metalshade\.log|\[proxy\])/i.test(text);
 const wheel=/CVehicleStreamRenderGfx/i.test(text)&&/SIGTRAP/i.test(text);
 const overhaul=/(guard word trashed|HasExpired|cloud hat)/i.test(text);
 const hang=one(text,/Game hung for\s+([\d.]+)\s*s/i);
 const sample=text.match(/sample count[^\n]*/i)?.[0]||'';
 const missionMap=[['trevor3','Friends Reunited'],['docks_heista','The Merryweather Heist'],['fbi3','By the Book'],['gunclub_shop','Ammu-Nation']];
 const missions=missionMap.filter(([id])=>new RegExp('\\b'+id+'\\b','i').test(text)).map(([,name])=>name);
 if(missions.length)r.supporting.push('Running-script context points to: '+uniq(missions).join(', ')+'.');

 if(missingArchives.length){
  r.kind='missing-archive';r.title='Required game archive is missing';r.diagnosis=`Cause found: ${missingArchives.length===1?missingArchives[0]:'required game archives'} could not be found`;r.exactFiles=missingArchives;r.rootCauseKnown=true;r.needsRunLog=false;r.developerMatch='DATA-02';
  r.evidence.push(...missingArchives.map(x=>`The log explicitly says the critical archive “${x}” cannot be found.`));
  if(/SIGTRAP|__debugbreak|CFileMgr::SetupDevices|MountAudioPacks/i.test(text))r.evidence.push('The crash path also reaches the file-mount/debugbreak path documented for incomplete game data.');
  r.meaning='This is a direct data-installation failure. GTA V stops because required game data is absent, incomplete, misplaced, or was not copied successfully.';
  r.next=[`Restore or recopy the complete game data${missingArchives.length===1?` so “${missingArchives[0]}” is present`:''}.`,'Do not delete your saves; this is a game-data problem, not a save-data diagnosis.'];
  if(!/macos/i.test(r.sessionOS))r.next.push('Check the DATA set against the developer baseline: 113 archives, about 21.6 GB.');
  r.next.push('After fixing the data, launch once and send the new run.log only if the problem remains.');
  finish(r,.995);
 }else if(dataPatchNo){
  r.kind='datapatch-not-applied';r.title='GTAV_patch was not applied';r.diagnosis='Cause found: the required data patch is missing';r.rootCauseKnown=true;r.needsRunLog=false;r.developerMatch='DATA-03';
  r.evidence.push('The log contains “datapatch: no patches” / missing .macport_decrypted marker.');if(stalls.length)r.evidence.push(...stalls.slice(0,3).map(x=>'Streamer stall: '+x));
  r.meaning='The game data is present, but the compatibility patch was not applied. This can leave scripts/resources in a state that stalls or crashes later.';
  r.next=['Apply GTAV_patch once using the project installation flow.','Relaunch and reproduce the same area or mission.','If it still fails, send the new run.log and crash report from that attempt.'];finish(r,.99);
 }else if(missingMovies.length){
  r.kind='missing-movie';r.title='Required movie file is missing';r.diagnosis=`Cause found: ${missingMovies[0]} is missing`;r.exactFiles=missingMovies;r.rootCauseKnown=true;r.needsRunLog=false;r.developerMatch='DATA-05';
  r.evidence.push(...missingMovies.map(x=>`The log reports missing movie file “${x}”.`));r.meaning='A required movie/cutscene asset is absent from the installed game data.';
  r.next=['Restore the missing movie files or reinstall the complete movies package.','Retry the same mission/cutscene.'];finish(r,.99);
 }else if(terminated15){
  r.kind='terminated-signal-15';r.title='App termination, not a GTA V crash';r.diagnosis='The process was terminated with signal 15';r.rootCauseKnown=false;r.needsRunLog=false;r.evidence.push('The report says “terminated by signal 15”.');r.meaning='Developer KB treats signal 15 as the app being closed by the player or system rather than an internal crash signature.';r.next=['If you did not close the app yourself, send run.prev.log so the last memory/background state can be checked.'];finish(r,.95);
 }else if(previousNoReport){
  r.kind='ios-kill-no-report';r.title='Previous run ended without a crash report';r.diagnosis='iOS ended the previous run without producing an in-app crash report';r.rootCauseKnown=false;r.needsRunLog=false;r.evidence.push('run.prev.log says the previous run ended with no report.');
  if(r.memory&&r.memory.left<150){r.diagnosis='Likely memory-limit termination';r.supporting.push(`Only ${r.memory.left} MB app memory remained near the end of the run.`);finish(r,.84);}else finish(r,.72);
  r.meaning='This pattern can happen when iOS kills the app, the app is swiped away, or it is terminated in the background. The last memory lines help distinguish memory pressure from other exits.';r.next=['Check the last 30-60 lines of run.prev.log for memory and background/termination clues.'];
 }else if(wheel){
  r.kind='vehicle-wheel-crash';r.title='Vehicle wheel rendering crash';r.diagnosis='Known Benny’s/Open Wheel/online-rim crash signature';r.rootCauseKnown=true;r.needsRunLog=false;r.developerMatch='CRASH-09';r.evidence.push('The log contains CVehicleStreamRenderGfx together with SIGTRAP.');r.meaning='This matches the developer-KB wheel-index crash fixed in the 30 Oct release.';r.next=['Confirm the 30 Oct release or newer is installed.','If it still reproduces on the current build, send the new run.log and crash report to #support.'];finish(r,.97);
 }else if(overhaul){
  r.kind='graphics-overhaul-crash';r.title='Graphics overhaul startup crash';r.diagnosis='Known graphics-overhaul crash signature';r.rootCauseKnown=true;r.needsRunLog=false;r.developerMatch='CRASH-08';r.evidence.push('The log contains a developer-KB signature used for QuantV / NaturalVision Remastered / MaxedV startup crashes.');r.meaning='This matches the graphics-overhaul fault family documented as fixed in the 30 Oct release.';r.next=['Use the 30 Oct release or newer.','Enable only one graphics overhaul at a time.','If the crash remains, send run.log from the same launch.'];finish(r,.96);
 }else if(thirdParty){
  r.kind='third-party-hook';r.title='Third-party graphics hook detected';r.diagnosis='A MetalShade/posthook-style third-party hook is present';r.rootCauseKnown=false;r.needsRunLog=false;r.developerMatch='THIRD-01';r.evidence.push('The log contains d3dr1/posthook/MetalShade/proxy markers.');r.meaning='The developer KB treats these hooks as third-party modifications outside the supported port.';r.next=['Install the plain public release over the current app so saves/data remain.','Reproduce once without the hook.','If the plain build still crashes, send that new run.log and crash report.'];finish(r,.94);
 }else if(dd){
  r.kind='use-after-free';r.title='Use-after-free style crash signature';r.diagnosis='The crash references freed-memory 0xDD fill';r.rootCauseKnown=true;r.needsRunLog=false;r.developerMatch='CRASH-02';r.evidence.push('The report contains a 0xDD freed-memory pattern.');r.meaning='The developer KB uses this pattern for a use-after-free in game code.';r.next=['Record what mission/action was happening immediately before the crash.','Send the crash report plus run.log to #support so the exact game path can be matched.'];finish(r,.93);
 }else if(dxmtInit&&r.signal==='SIGABRT'){
  r.kind='dxmt-device-init';r.title='DXMT / D3D11 graphics-device initialization crash';r.diagnosis='Failing subsystem found: DXMT/D3D11 device creation';r.rootCauseKnown=false;r.needsRunLog=true;
  r.evidence.push('Crash signal is SIGABRT.','The stack enters d3d11.dylib through InternalCommandLibrary / CommandQueue / CreateDXMTDevice.','GTA V is still in SettingsDefaults / GetDisplayInfo / GenerateDefaultSettings, before normal gameplay.');
  r.meaning='The crash report identifies the graphics initialization subsystem, but it does not contain the DXMT/Metal message that explains why the code called abort().';
  r.next=['Attach run.log from the exact same launch. If it was overwritten, attach run.prev.log.'];if(/macos/i.test(r.sessionOS))r.next.push('Confirm the Mac is Apple silicon M1 or newer and macOS 14 or newer, the developer-KB support baseline.');r.next.push('If a graphics overhaul is installed, test with only one overhaul enabled.','Do not delete saves; this failure occurs before gameplay.');finish(r,.96);
 }else if(hang&&stalls.length){
  r.kind='streamer-hang';r.title='Game hang with stalled streamer';r.diagnosis='The hang is associated with a stalled streamed resource';r.rootCauseKnown=false;r.needsRunLog=false;r.evidence.push(`The game hung for ${hang} seconds.`,...stalls.slice(0,4).map(x=>'Stalled resource: '+x));r.meaning='The hang detector fired while the streamer was waiting on a resource. If the stall is a deflate/script resource, developer KB says an unapplied GTAV_patch is an important check.';r.next=['Check the same run.log for “datapatch: no patches”.','If present, apply GTAV_patch. Otherwise send the full run.log to #support with the stalled resource name.'];finish(r,.86);
 }else if(hang){
  r.kind='hang';r.title='Game hang detected';r.diagnosis=`The game stopped responding for ${hang} seconds`;r.rootCauseKnown=false;r.needsRunLog=true;r.evidence.push(`The log records a ${hang}-second hang.`);r.meaning='Hang duration alone does not identify whether the blocker is streaming, graphics, scripting, I/O, or another subsystem.';r.next=['Attach run.log from the same launch and keep the lines around any “streamer: ... stalled” message.'];finish(r,.73);
 }else if(sample){
  r.kind='graphics-sample-count';r.title='Unsupported graphics sample-count configuration';r.diagnosis='Graphics initialization requested an unsupported MSAA/sample-count combination';r.rootCauseKnown=true;r.needsRunLog=false;r.evidence.push(cap(sample));r.meaning='The graphics configuration asks for a sample count that the current path does not support.';r.next=['Disable MSAA and Reflection MSAA.','Relaunch once and send the new run.log if it still fails.'];finish(r,.88);
 }else if(fatalLines.length){
  r.kind='fatal-error';r.title='RAGE fatal error reported';r.diagnosis='A fatal error is present in the log';r.rootCauseKnown=false;r.needsRunLog=false;r.evidence.push(...fatalLines.slice(0,4).map(x=>'fatal error: '+cap(x)));r.meaning='The fatal line is the strongest evidence in this log, but this engine does not have a safe mapping for its exact message yet.';r.next=['Send the fatal-error text and the surrounding 20-30 lines to #support.','Keep the full run.log available so the developer can map a new signature.'];finish(r,.78);
 }else if(r.memory&&r.memory.left<150){
  r.kind='memory-pressure';r.title='Very low recorded memory headroom';r.diagnosis='Memory pressure is a plausible contributor, not a confirmed root cause';r.rootCauseKnown=false;r.needsRunLog=true;r.evidence.push(`Only ${r.memory.left} MB app memory remained; footprint ${r.memory.footprint} MB.`);r.meaning='Low remaining app memory can destabilize the game, but a memory line alone does not prove that memory caused the crash.';r.next=['Use the lowest launcher preset, Normal textures, MSAA Off, Reflection MSAA Off, then reproduce once.','Send the crash report together with run.log so the failure line can be compared with the memory state.'];finish(r,.78);
 }

 environmentalNotes(r);correlate(r,text);
 r.evidence=uniq(r.evidence);r.supporting=uniq(r.supporting);r.notIndicated=uniq(r.notIndicated);r.next=uniq(r.next);
 state.last=r;state.lastAt=Date.now();state.history.push({at:state.lastAt,result:r});if(state.history.length>6)state.history.shift();
 window.dispatchEvent(new CustomEvent('franklin-log-analysis',{detail:r}));return r;
}
function platformNote(a){const selected=String(a.sessionOS||'');if(!a.headerPlatform||!selected)return'';const selectedMac=/macos/i.test(selected),headerMac=/macos/i.test(a.headerPlatform);if(selectedMac===headerMac)return'';return `Platform note: your support session is set to ${selected}, while the crash header says “${a.headerPlatform}”. I will not treat that label alone as proof of the wrong build; the GTA5 UUID/build lines are stronger evidence.`;}
function format(a){
 if(!a)return'I could not read this log.';
 const b=[];b.push(`Diagnosis: ${a.diagnosis}\nConfidence: ${a.confidence}.`);
 const session=[a.sessionOS,a.sessionBuild].filter(Boolean).join(' · ');if(session)b.push(`Session context: ${session}.`);
 if(a.logBuild)b.push(`Build detected from log: ${a.logBuild.label} · ${a.logBuild.platform} · GTA5 UUID ${a.logBuild.uuid}.${a.logBuild.current?' Current public build.':' Older build.'}`);
 if(a.signal||a.thread)b.push(`Crash: ${[a.signal,a.thread?`thread ${a.thread}`:''].filter(Boolean).join(' · ')}`);
 if(a.evidence.length)b.push('Evidence:\n'+a.evidence.map((x,i)=>`${i+1}. ${x}`).join('\n'));
 if(a.supporting.length)b.push('Supporting context:\n'+a.supporting.map(x=>'• '+x).join('\n'));
 if(a.notIndicated.length)b.push('Not indicated by this log:\n'+a.notIndicated.map(x=>'• '+x).join('\n'));
 b.push('What it means:\n'+a.meaning);
 if(a.logBuild&&a.sessionBuild&&a.logBuild.label!==a.sessionBuild)b.push(`Build note: the selected session build is ${a.sessionBuild}, but the log identifies ${a.logBuild.label}. I use the log build as stronger evidence for this incident.`);
 const note=platformNote(a);if(note)b.push(note);
 if(a.next.length)b.push('What to do next:\n'+a.next.map((x,i)=>`${i+1}. ${x}`).join('\n'));
 if(a.needsRunLog)b.push('Still needed: run.log or run.prev.log from the same incident can contain the message immediately before the failure.');
 if(a.developerMatch)b.push(`Developer KB match: ${a.developerMatch}.`);
 return b.join('\n\n');
}
function followUp(q){
 if(!state.last||Date.now()-state.lastAt>30*60*1000)return null;
 const n=String(q||'').toLowerCase();
 if(/which file|what file|file missing|nama file|file apa/.test(n)&&state.last.exactFiles?.length)return{text:`The log names ${state.last.exactFiles.length===1?'this file':'these files'}:\n${state.last.exactFiles.map(x=>'• '+x).join('\n')}\n\n${state.last.meaning}`,topic:'log-analysis',grounded:true,requiresLog:false};
 if(/ram|memory/.test(n)&&state.last.memory)return{text:`The log recorded ${state.last.memory.footprint} MB footprint and ${state.last.memory.left} MB remaining app memory. ${state.last.memory.left>=700?'That does not support low-memory pressure as the primary cause of this incident.':state.last.memory.left<150?'That is very low headroom and may contribute, but I still separate it from the primary crash signature.':'That is context, not proof of the primary cause.'}`,topic:'log-analysis',grounded:true,requiresLog:!!state.last.needsRunLog};
 if(!/(what next|what should i do|anything else|how to fix|fix it|why|what does|meaning|cause|diagnos|maksud|selanjutnya|harus apa|perbaiki|penyebab|solusi)/i.test(n))return null;
 const a=state.last;return{text:format(a),topic:'log-analysis',grounded:true,requiresLog:!!a.needsRunLog,suggestions:a.needsRunLog?['Where can I find run.log?','What should I attach next?']:[]};
}
function reset(){state.last=null;state.lastAt=0;state.history=[];}
document.addEventListener('franklin-disconnect',reset);
window.FranklinLogIntelligence={analyze,format,followUp,getLast:()=>state.last,getHistory:()=>state.history.map(x=>x.result),reset,status:()=>({lastKind:state.last?.kind||'',lastConfidence:state.last?.confidence||'',lastAt:state.lastAt,history:state.history.length})};
})();
