const fs=require('fs');
const assert=require('assert');
const css=fs.readFileSync('dist/sunset-theme-v1.css','utf8');
const motion=fs.readFileSync('dist/motion.js','utf8');
const bg=fs.readFileSync('dist/assets/community-sunset-v1.svg','utf8');
const franklin=fs.readFileSync('dist/franklin.html','utf8');

assert.match(css,/--sunset-cream:#f8eb98/i,'sunset cream token missing');
assert.match(css,/--sunset-peach:#e69d5f/i,'sunset peach token missing');
assert.match(css,/--sunset-coral:#cc7352/i,'sunset coral token missing');
assert.match(css,/--sunset-deep:#120e0c/i,'sunset deep token missing');
assert.match(css,/home-intro-v4-message-phase[\s\S]*community-sunset-v1\.svg/,'welcome message phase must use the supplied sunset background');
assert.match(css,/:root\[data-mode="light"\]/,'light mode must keep a warm sunset palette');
assert.match(motion,/sunset-theme-v1\.css\?v=20261028sunset1/,'global bootstrap must load sunset theme');
assert.match(franklin,/sunset-theme-v1\.css\?v=20261028sunset1/,'Franklin direct must load sunset theme');
assert.match(bg,/data:image\/jpeg;base64/,'sunset background asset must embed the supplied image');
console.log('sunset theme regression checks passed');
