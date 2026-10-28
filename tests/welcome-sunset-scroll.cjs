const fs=require('fs');
const assert=require('assert');
const js=fs.readFileSync('dist/home-intro-v4.js','utf8');
const css=fs.readFileSync('dist/sunset-theme-v1.css','utf8');
const motion=fs.readFileSync('dist/motion.js','utf8');

assert.match(js,/home-intro-v4-message-kicker/,'welcome copy must expose staggered kicker');
assert.match(js,/home-intro-v4-message-line-1/,'welcome copy must expose first headline line');
assert.match(js,/home-intro-v4-message-line-2/,'welcome copy must expose second headline line');
assert.match(js,/--intro4-msg-line1/,'scroll engine must drive first headline line');
assert.match(js,/--intro4-msg-line2/,'scroll engine must drive second headline line');
assert.match(js,/delta\*\.075/,'scrub damping must remain slower than the previous implementation');
assert.match(css,/height:500svh!important/,'mobile welcome runway must remain long enough to read');
assert.match(css,/display:block!important/,'welcome paragraph must remain visible on small phones');
assert.match(css,/community-sunset-v1\.svg/,'sunset artwork must remain the welcome background');
assert.match(css,/home-intro-v4-message-phase:after/,'welcome background must include a softened lower handoff');
assert.match(motion,/sunset-theme-v1\.css\?v=20261028sunset2/,'sunset theme cache-buster must be current');
assert.match(motion,/home-intro-v4\.js\?v=20261028homeintro4r4/,'welcome motion cache-buster must be current');
console.log('welcome sunset scroll regression checks passed');
