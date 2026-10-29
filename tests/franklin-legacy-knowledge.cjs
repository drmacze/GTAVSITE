const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const files=Array.from({length:8},(_,i)=>`dist/franklin-legacy-knowledge-${i+1}.json`);
const groups=files.map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
const entries=groups.flatMap(g=>g.entries||[]);
assert.equal(entries.length,351,'expected 351 Legacy entries');
assert.equal(new Set(entries.map(e=>e[0])).size,351,'Legacy knowledge IDs must be unique');
for(const [i,e] of entries.entries()){
 assert(Array.isArray(e)&&e.length===7,`entry ${i} must have 7 fields`);
 assert(e[0]&&e[1]&&e[2]&&Array.isArray(e[3])&&e[3].length&&Array.isArray(e[4])&&e[5],`invalid entry ${e[0]||i}`);
}
const listeners={},window={};
const fetch=async url=>{const path='dist/'+String(url).split('?')[0];return{ok:fs.existsSync(path),json:async()=>JSON.parse(fs.readFileSync(path,'utf8'))}};
vm.runInNewContext(fs.readFileSync('dist/franklin-legacy-kb.js','utf8'),{window,fetch,document:{addEventListener:(n,f)=>listeners[n]=f}});
const api=window.FranklinLegacyKB;
(async()=>{
 await api.load();
 assert.equal(api.status().entries,351);
 const cases=[
  ['mobil terbaik gta v apa','legacy-vehicle-best-car-overall'],
  ['mobil tercepat gta v','legacy-vehicle-fastest-car'],
  ['siapa Lester Crest','legacy-char-lester'],
  ['siapa Ballas','legacy-faction-ballas'],
  ['dimana Grove Street','legacy-location-grove-street'],
  ['misi The Big Score itu apa','legacy-mission-big-score'],
  ['cara 100% gta v','legacy-100-overview'],
  ['kemampuan Franklin gta v','legacy-special-franklin'],
  ['senjata rifle terbaik gta v','legacy-best-rifle']
 ];
 for(const [q,id] of cases){const r=await api.answer(q);assert(r,`no answer for ${q}`);assert.equal(r.knowledgeId,id,`${q} -> ${r.knowledgeId}`);}
 assert.equal(await api.answer('bunker gta online'),null,'explicit GTA Online query must not be claimed by Legacy KB');
 assert.equal(await api.answer('gta online ios session code'),null,'iOS project query must not be claimed by Legacy KB');
 console.log('PASS: 351 GTA V Legacy entries, unique IDs, representative Indonesian/English retrieval, Online/iOS separation.');
})().catch(e=>{console.error(e);process.exitCode=1});