const fs=require('fs');
const assert=require('assert');
const policy=fs.readFileSync('dist/storage-policy-45-v1.js','utf8');
const motion=fs.readFileSync('dist/motion.js','utf8');
const franklin=fs.readFileSync('dist/franklin.html','utf8');

assert.match(policy,/const MIN=45/,'storage policy must use 45 GB minimum');
assert.match(policy,/value>=MIN/,'45 GB must qualify and values below it must fail');
assert.match(policy,/storage45Level/,'compatibility storage card must be forced to the 45 GB policy state');
assert.match(policy,/level=ok\?'headroom':'critical'/,'values below 45 GB must be critical');
assert.match(policy,/45 GB free storage minimum before game-file setup/,'compatibility source review must state the current storage minimum');
assert.match(policy,/Files → On My iPhone/,'game-file guide must require local iPhone storage');
assert.match(policy,/GTA V › GTAV › common\.rpf/,'correct GTAV folder layout must be documented');
assert.match(policy,/delete the downloaded zip to reclaim roughly 22 GB/i,'post-extraction cleanup must remain documented');
assert.match(policy,/45 GB free is the current minimum setup requirement/,'Franklin answer must use current minimum');
assert.match(motion,/storage-policy-45-v1\.js\?v=20261028storage45b/,'site bootstrap must load storage policy');
assert.match(franklin,/storage-policy-45-v1\.js\?v=20261028storage45b/,'Franklin direct must load storage policy');
console.log('storage 45 GB policy regression checks passed');
