const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');

const source=fs.readFileSync('dist/compatibility-rules.js','utf8');
const sandbox={module:{exports:{}},exports:{},console};
vm.runInNewContext(source,sandbox,{filename:'compatibility-rules.js'});
const rules=sandbox.module.exports;

assert.equal(rules.memory(3,6).level,'critical','RAM below 4 GB must be critical');
assert.equal(rules.memory(4,6).level,'minimum','4 GB must remain the minimum tier even if legacy baseline data says 6 GB');
assert.match(rules.memory(4,6).label,/iRAM\+ required/i,'4 GB must explicitly require iRAM+');
assert.equal(rules.memory(6,6).level,'headroom','RAM above 4 GB must pass the memory check');

assert.equal(rules.ios('17.9',16).level,'critical','iOS below 18 must be unsupported');
assert.equal(rules.ios('18',16).level,'headroom','iOS 18 must pass');
assert.equal(rules.ios('27.2',16).level,'headroom','iOS above 18 must pass');

assert.equal(rules.storage('1').level,'critical','1–20 GB must be red/critical');
assert.equal(rules.storage('20').level,'critical','20 GB must be red/critical');
assert.equal(rules.storage('21').level,'minimum','21–30 GB must be yellow/minimum');
assert.equal(rules.storage('30').level,'minimum','30 GB must be yellow/minimum');
assert.equal(rules.storage('30.1').level,'headroom','Above 30 GB must be green/headroom');

assert.match(source,/visualViewport\?\.scale/,'compatibility policy must detect pinch zoom');
assert.match(source,/compat-pinch-zoom/,'compatibility policy must hide Franklin launch UI while zoomed');
assert.match(source,/REQUIRED MEMORY TOOL/,'4 GB result must expose iRAM+ as a required memory tool');

console.log('PASS: compatibility policy uses 4 GB + iRAM+, iOS 18+, storage traffic-light tiers, and zoom-safe Franklin UI.');
