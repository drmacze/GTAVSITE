const fs=require('fs');
const assert=require('assert');
const motion=fs.readFileSync('dist/motion.js','utf8');
const css=fs.readFileSync('dist/home-intro-v4-polish.css','utf8');
const js=fs.readFileSync('dist/home-intro-v4.js','utf8');

assert.match(motion,/home-intro-v4\.css\?v=20261028homeintro4r2/,'Home must load restored v4 intro');
assert.match(motion,/home-intro-v4-polish\.css\?v=20261028v4polish1/,'Home must load v4 branding polish');
assert.doesNotMatch(motion,/home-intro-v5\.js/,'v5 single-cover intro must not be loaded');
assert.match(js,/home-intro-v4-grid/,'restored cover must use the previous collage layout');
assert.match(js,/GTA V iOS/,'title must stay GTA V iOS');
assert.match(css,/brightness\(0\).*invert\(94%\)/s,'Apple mark must be forced to silver-white');
assert.match(css,/v4-mark-outer\{stroke-width:4\.7\}/,'V mark must remain bold');
assert.match(css,/font-weight:760/,'GTA V iOS title must remain bold');
console.log('home intro v4 restore regression checks passed');
