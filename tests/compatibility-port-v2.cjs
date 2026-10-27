const assert=require('node:assert/strict');
const rules=require('../dist/compatibility-rules.js');
const performance=require('../dist/performance-check.js');

// iOS: binary technical minimum is 16.3; community recommended path is 18+.
assert.equal(rules.ios(16.2).level,'critical');
assert.equal(rules.ios(16.3).level,'minimum');
assert.equal(rules.ios(17.9).level,'minimum');
assert.equal(rules.ios(18).level,'headroom');

// GPU paths observed in the current compatibility layer.
assert.equal(rules.soc('A11 Bionic',3).level,'critical');
assert.equal(rules.soc('A12 Bionic',4).level,'minimum');
assert.match(rules.soc('A12 Bionic',4).title,/experimental/i);
assert.equal(rules.soc('A13 Bionic',4).level,'headroom');
assert.match(rules.soc('A13 Bionic',4).title,/baseline/i);
assert.equal(rules.soc('A14 Bionic',4).level,'headroom');

// Physical-memory tiers and automatic low-memory threshold.
assert.equal(rules.memory(3).level,'critical');
assert.equal(rules.memory(4).level,'minimum');
assert.equal(rules.memory(4).lowMemory,true);
assert.equal(rules.physicalMemoryTier(4.5),4);
assert.equal(rules.physicalMemoryTier(6),6);
assert.equal(rules.physicalMemoryTier(8),8);
assert.equal(rules.physicalMemoryTier(12),12);

// Native app-memory tier thresholds recovered from compat_MemoryTier().
assert.equal(rules.appMemoryTier(2999),4);
assert.equal(rules.appMemoryTier(3000),6);
assert.equal(rules.appMemoryTier(4399),6);
assert.equal(rules.appMemoryTier(4400),8);
assert.equal(rules.appMemoryTier(5799),8);
assert.equal(rules.appMemoryTier(5800),12);
assert.equal(rules.effectiveMemoryTier(8,3200),6);

// Dynamic caps recovered from compat_MemoryCaps().
assert.deepEqual(rules.memoryCaps(2999),{textureCacheMB:400,streamingVirtualMB:400,streamingPhysicalMB:128});
assert.deepEqual(rules.memoryCaps(3000),{textureCacheMB:850,streamingVirtualMB:600,streamingPhysicalMB:160});
assert.deepEqual(rules.memoryCaps(3700),{textureCacheMB:1300,streamingVirtualMB:800,streamingPhysicalMB:200});
assert.deepEqual(rules.memoryCaps(4400),{textureCacheMB:1600,streamingVirtualMB:1000,streamingPhysicalMB:252});
assert.equal(rules.memoryCaps(5800),null);

// Site storage policy requested for the checker.
assert.equal(rules.storage(20).level,'critical');
assert.equal(rules.storage(21).level,'minimum');
assert.equal(rules.storage(30).level,'minimum');
assert.equal(rules.storage(30.1).level,'headroom');

// Configuration review must use port tier budgets, not the old 10%-of-RAM rule.
const config={format:'gtav-graphics-settings',version:1,settings:{res:'1280x720',TextureQuality:2,MSAA:4,ShadowQuality:2,lowmem:'off',memrestrict:800}};
const result=performance.assess(config,{name:'iPhone 11',chip:'A13 Bionic',ram:4});
const cache=result.findings.find(item=>item.title==='Texture cache');
const lowmem=result.findings.find(item=>item.title==='Low-Memory Profile');
assert.ok(cache&&cache.points>0,'4 GB / tier-4 cache over 400 MB must be flagged');
assert.ok(lowmem&&lowmem.points>0,'Low-Memory Profile off at 4 GB must be flagged');
assert.match(cache.advice,/400 MB/);

console.log('PASS: Compatibility v2 preserves GTA5 binary-derived iOS, SoC, low-memory, tier and cap rules.');
