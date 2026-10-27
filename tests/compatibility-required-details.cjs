const fs=require('node:fs'),assert=require('node:assert/strict');
const js=fs.readFileSync('dist/compatibility.js','utf8');

assert.match(js,/classList\.add\('required-checks'\)/,'compatibility details panel must be promoted to required state');
assert.match(js,/badge\.textContent='Required'/,'required badge must be visible');
assert.match(js,/requiredBlock\.open=true/,'iOS and storage details must stay visibly open');
assert.match(js,/input\.required=true/,'iOS and storage inputs must use native required validation');
assert.match(js,/requiredDetailsValid\(\)/,'required details validity gate must exist');
assert.match(js,/start\.disabled=!\(data&&activeModel&&!busy&&complete\)/,'Start must remain disabled until required details are complete');
assert.match(js,/!requiredDetailsValid\(\)\)return/,'Start handler must refuse incomplete details');
assert.match(js,/Required\. Enter both values from Settings before starting/,'required helper copy must explain what the user needs to enter');

console.log('PASS: compatibility iOS and storage details are visible and required before Start.');
