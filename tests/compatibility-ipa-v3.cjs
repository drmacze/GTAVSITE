const assert=require('node:assert/strict');
const fs=require('node:fs');
const rules=require('../dist/compatibility-rules.js');

assert.equal(rules.evidence.minimumIOS,16.3);
assert.equal(rules.evidence.recommendedIOS,18);
assert.equal(rules.evidence.lowMemoryAutoGB,4.5);
assert.equal(rules.evidence.increasedMemoryEntitlement,true);
assert.equal(rules.evidence.unsignedAdhocBuild,true);

assert.equal(rules.physicalMemoryTier(4),4);
assert.equal(rules.physicalMemoryTier(4.5),4);
assert.equal(rules.physicalMemoryTier(6),6);
assert.equal(rules.physicalMemoryTier(6.5),6);
assert.equal(rules.physicalMemoryTier(8),8);
assert.equal(rules.physicalMemoryTier(10),8);
assert.equal(rules.physicalMemoryTier(12),12);

assert.equal(rules.appMemoryTier(2999),4);
assert.equal(rules.appMemoryTier(3000),6);
assert.equal(rules.appMemoryTier(4399),6);
assert.equal(rules.appMemoryTier(4400),8);
assert.equal(rules.appMemoryTier(5799),8);
assert.equal(rules.appMemoryTier(5800),12);
assert.equal(rules.effectiveMemoryTier(8,3500),6);
assert.equal(rules.effectiveMemoryTier(4,6000),4);

assert.deepEqual(rules.memoryCaps(2999),{textureCacheMB:400,streamingVirtualMB:400,streamingPhysicalMB:128,capped:true});
assert.deepEqual(rules.memoryCaps(3000),{textureCacheMB:850,streamingVirtualMB:600,streamingPhysicalMB:160,capped:true});
assert.deepEqual(rules.memoryCaps(3700),{textureCacheMB:1300,streamingVirtualMB:800,streamingPhysicalMB:200,capped:true});
assert.deepEqual(rules.memoryCaps(4400),{textureCacheMB:1600,streamingVirtualMB:1000,streamingPhysicalMB:252,capped:true});
assert.deepEqual(rules.memoryCaps(5800),{textureCacheMB:1600,streamingVirtualMB:1000,streamingPhysicalMB:252,capped:false});

assert.equal(rules.memory(4).level,'minimum');
assert.match(rules.memory(4).label,/iRAM\+/i);
assert.equal(rules.memory(3).level,'critical');
assert.equal(rules.ios(16.2).level,'critical');
assert.equal(rules.ios(16.3).level,'minimum');
assert.equal(rules.ios(18).level,'headroom');
assert.equal(rules.storage(20).level,'critical');
assert.equal(rules.storage(21).level,'minimum');
assert.equal(rules.storage(30).level,'minimum');
assert.equal(rules.storage(30.1).level,'headroom');
assert.equal(rules.soc('A11 Bionic',3).level,'critical');
assert.equal(rules.soc('A12 Bionic',4).level,'minimum');
assert.equal(rules.soc('A13 Bionic',4).level,'headroom');
assert.equal(rules.soc('A14 Bionic',4).level,'headroom');

const source=fs.readFileSync('dist/compatibility-rules.js','utf8');
assert.match(source,/compat-app-memory/);
assert.match(source,/App memory allowance/);
assert.match(source,/Audited IPA compatibility evidence/);
assert.match(source,/Increased Memory Limit/);
assert.match(source,/A12 experimental DirectX 10 path/);
assert.match(source,/A13 supported baseline/);
assert.match(source,/MetalFX/);

console.log('PASS: Compatibility v3 matches audited GTAV IPA thresholds and exposes app-memory accuracy input.');
