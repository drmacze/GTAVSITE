const assert=require('node:assert/strict');const rules=require('../dist/performance-check.js');
const fixture={format:'gtav-graphics-settings',version:1,from:'Different device',ramGB:99,settings:{res:'960x540',TextureQuality:'0',MSAA:'0',ShadowQuality:'1',lowmem:'on',memrestrict:'400'}};
const low={name:'iPhone 11',chip:'A13 Bionic',ram:4},high={name:'iPhone 16 Pro',chip:'A18 Pro',ram:8};
assert.equal(rules.assess(fixture,low).rating,'Serious');assert.equal(rules.assess(fixture,high).rating,'Fair');
const heavy=JSON.parse(JSON.stringify(fixture));Object.assign(heavy.settings,{res:'2560x1440',TextureQuality:'2',MSAA:'4',lowmem:'off',memrestrict:'2048'});assert.equal(rules.assess(heavy,high).rating,'Critical');
assert.equal(rules.assess(fixture,{...high,ram:null}).rating,'Not assessed');
const incomplete=JSON.parse(JSON.stringify(fixture));delete incomplete.settings.res;assert.equal(rules.assess(incomplete,low).rating,'Not assessed');incomplete.settings.res='no';assert.equal(rules.assess(incomplete,low).rating,'Not assessed');
for(const value of [null,'',false,'NaN','100']){const invalid=JSON.parse(JSON.stringify(fixture));invalid.settings.TextureQuality=value;assert.equal(rules.assess(invalid,low).rating,'Not assessed');}
assert.throws(()=>rules.parse('alert(1)'));assert.throws(()=>rules.parse('{"format":"other"}'));assert.throws(()=>rules.parse(JSON.stringify({...fixture,version:2})));assert.throws(()=>rules.parse('x'.repeat(262145)));assert.deepEqual(rules.parse('\uFEFF'+JSON.stringify(fixture)),fixture);
assert.equal(rules.assess(rules.parse(JSON.stringify({...fixture,ramGB:128,from:'iPhone 18'})),low).score,3);
console.log('PASS: device-dependent ratings, high-load flags, unverified models, missing and invalid values, metadata spoofing, JSON schema and size limits.');
