const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/franklin-conversation.js','utf8');
const listeners={};
const context={window:{},document:{addEventListener:(name,fn)=>{listeners[name]=fn}},console};
vm.createContext(context);
vm.runInContext(source,context);
const fc=context.window.FranklinConversation;
assert.ok(fc,'FranklinConversation must be exposed');
for(const query of ['how to increase memory?','how to increase RAM?','how do I use iRAM+?','can I get more RAM?','cara tambah ram']){
  const result=fc.social(query);
  assert.ok(result,`${query} must be handled as GTA V iOS memory knowledge`);
  assert.equal(result.topic,'memory',`${query} must route to memory topic`);
  assert.match(result.text,/iRAM\+/,'answer must name iRAM+');
  assert.match(result.text,/does not add physical RAM/i,'answer must distinguish entitlement from physical RAM');
  assert.match(result.text,/Apple Account/i,'answer must explain Apple Account signing requirement');
  assert.match(result.text,/public enterprise certificates are not supported/i,'answer must explain enterprise certificate limitation');
  assert.equal(result.source?.href,'guide.html#memory','answer must link to the Memory & iRAM+ guide');
}
assert.equal(fc.expand('memory'),'How can I increase the app memory limit with iRAM+?');
assert.equal(fc.expand('iram+'),'How do I use iRAM+?');
console.log('PASS: Franklin routes RAM and iRAM+ questions to grounded memory guidance.');
