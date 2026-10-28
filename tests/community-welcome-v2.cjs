const fs=require('fs');
const assert=require('assert');
const motion=fs.readFileSync('dist/motion.js','utf8');
const css=fs.readFileSync('dist/community-welcome-v2.css','utf8');
const strip=fs.readFileSync('dist/assets/community-strip-v2.svg','utf8');

assert.match(motion,/community-welcome-v2\.css\?v=20261028communitywelcome2/,'Home must load community welcome v2');
assert.match(css,/community-strip-v2\.svg/,'announcement strip must use uploaded community collage');
assert.match(css,/text-align:center!important/,'welcome composition must be centered');
assert.match(css,/Impact,'Arial Black','DM Sans'/,'welcome must use a heavy GTA-like display stack');
assert.match(css,/-webkit-text-stroke/,'welcome typography must preserve contrast on the sunset image');
assert.match(css,/color:#2a160f!important/,'primary headline must use high-contrast warm dark ink');
assert.match(css,/color:#fff0c6!important/,'secondary headline must use high-contrast cream ink');
assert.match(strip,/data:image\/jpeg;base64/,'uploaded collage must be embedded as a local asset');
console.log('community welcome v2 regression checks passed');
