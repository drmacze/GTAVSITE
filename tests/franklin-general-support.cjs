const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const packs=Array.from({length:4},(_,i)=>`dist/franklin-general-support-${i+1}.json`);
const groups=packs.map(path=>JSON.parse(fs.readFileSync(path,'utf8')));
const entries=groups.flatMap(group=>group.entries||[]);
assert.equal(entries.length,136,'expected 136 general-support intents');
assert.equal(new Set(entries.map(entry=>entry.id)).size,136,'general-support IDs must be unique');
for(const entry of entries){
 assert(entry.id&&entry.topic&&Array.isArray(entry.patterns)&&entry.patterns.length,`invalid patterns for ${entry.id||'unknown entry'}`);
 assert(Array.isArray(entry.keywords),`invalid keywords for ${entry.id}`);
 assert(typeof entry.answer==='string'&&entry.answer.trim(),`missing answer for ${entry.id}`);
}
const compatibility=JSON.parse(fs.readFileSync('dist/compatibility-data.json','utf8'));
assert(Array.isArray(compatibility.models)&&compatibility.models.length,'compatibility catalog is required');
const listeners={};
const document={
 addEventListener:(name,fn)=>{listeners[name]=fn;},
 querySelector:()=>null,
 createElement:()=>({dataset:{},set src(value){this._src=value;},set async(value){},setAttribute(){},addEventListener(){}}),
 head:{append(){}}
};
const fetch=async url=>{
 const file=String(url).split('?')[0];
 const path='dist/'+file;
 return{ok:fs.existsSync(path),json:async()=>JSON.parse(fs.readFileSync(path,'utf8'))};
};
const window={};
vm.runInNewContext(fs.readFileSync('dist/franklin-general-support.js','utf8'),{window,document,fetch,setInterval,clearInterval,console,CustomEvent:function(){}});
(async()=>{
 const api=window.FranklinGeneralSupport;
 await api.load();
 assert.equal(api.status().entries,136,'runtime must load all support intents');
 assert.equal(api.status().devices,compatibility.models.length,'runtime must reuse the full compatibility device catalog');
 const cases=[
  ['launcher tidak bisa dibuka','support-launcher-open'],
  ['crash pas cutscene','support-crash-cutscene'],
  ['layar hitam','support-black-screen'],
  ['audio crackling','support-audio-crackle'],
  ['4gb iphone settings','support-device-4gb'],
  ['fps drops after few minutes','support-performance-after-minutes'],
  ['factory reset for gta','support-random-reset-all'],
  ['which log should i send','support-meta-which-log'],
  ['mod import error','support-mod-import-error'],
  ['save hilang setelah reinstall','support-save-after-reinstall']
 ];
 for(const [question,id] of cases){
  const result=await api.answer(question);
  assert(result,`no answer for: ${question}`);
  assert.equal(result.knowledgeId,id,`${question} -> ${result.knowledgeId}`);
 }
 let result=await api.answer('can iPhone 11 iOS 27.2 run it');
 assert.equal(result.knowledgeId,'device:iphone-11');
 assert.match(result.text,/A13 Bionic/);
 assert.match(result.text,/4 GB RAM/);
 assert.match(result.text,/iOS 27.2/);
 result=await api.answer('iphone 15 pro best settings');
 assert.equal(result.knowledgeId,'device:iphone-15-pro');
 assert.match(result.text,/8 GB RAM/);
 result=await api.answer('A12 support gta v ios');
 assert.equal(result.topic,'device');
 assert.match(result.text,/experimental A12 path/);
 for(const greeting of ['halo franklin','tes','Franklin','bro','😂']){
  const social=api.social(greeting);
  assert(social&&social.topic==='small-talk',`social handling failed for ${greeting}`);
 }
 assert.equal(await api.answer('siapa lester'),null,'Legacy character questions must remain available to Legacy KB');
 assert.equal(await api.answer('mobil tercepat gta v'),null,'Legacy vehicle questions must remain available to Legacy KB');
 console.log(`PASS: ${entries.length} general-support intents, ${compatibility.models.length} device profiles, casual conversation, crash/bug, launcher, device, and domain-separation retrieval.`);
 process.exit(0);
})().catch(error=>{console.error(error);process.exit(1);});
