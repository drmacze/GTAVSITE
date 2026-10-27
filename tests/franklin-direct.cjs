const fs=require('node:fs'),assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');

const html=read('dist/franklin.html');
const css=read('dist/franklin-direct.css');
const js=read('dist/franklin-direct.js');
const redirects=read('dist/_redirects');
const headers=read('dist/_headers');

assert.match(html,/data-page="franklin-direct"/,'direct page must opt into the Franklin loader without normal onboarding');
assert.doesNotMatch(html,/settings\.js|onboarding\.js/,'direct Franklin entry must not trigger the regular Welcome/onboarding gate');
assert.match(html,/<h1 id="franklin-direct-title">Franklin<\/h1>/,'popup header must be Franklin');
assert.match(html,/Tanyakan apa pun tentang GTA V iOS\./,'popup footer prompt must describe GTA V iOS questions');
assert.match(html,/class="franklin-swipe" role="slider"/,'continue control must be a real swipe slider');
assert.match(html,/lazy-helper\.js/,'direct page must reuse the existing Franklin asset loader');
assert.match(html,/franklin-direct\.js/,'direct page must load the swipe controller');

assert.match(js,/startsOnKnob/,'drag must begin on the circular knob');
assert.match(js,/pointerdown/,'slider must use pointer drag input');
assert.match(js,/pointermove/,'slider must track a real drag gesture');
assert.match(js,/progress\(\)>=\.88/,'slider must require a deliberate near-complete swipe');
assert.match(js,/track\.addEventListener\('click',event=>event\.preventDefault\(\)\)/,'tap must not unlock Franklin');
assert.match(js,/loader\.click\(\)/,'successful swipe must start the existing Franklin loader');
assert.match(js,/ask-franklin-panel\.is-open/,'intro must remain until the real Franklin panel is open');

assert.match(css,/touch-action:none/,'native scrolling must not steal the horizontal slider gesture');
assert.match(css,/\.franklin-swipe-knob/,'slider must render a dedicated circular knob');
assert.match(css,/\.asset-loader\{display:none!important\}/,'legacy loader UI must stay hidden behind the new direct entry experience');

assert.match(redirects,/^\/franklin \/franklin\.html 200/m,'clean /franklin URL must rewrite to the direct page');
assert.match(redirects,/^\/franklin\/ \/franklin 301/m,'trailing slash must normalize so Franklin relative assets resolve from root');
assert.match(headers,/\/franklin\n\s+Cache-Control: no-store/,'direct link must not serve stale HTML');
assert.match(headers,/\/franklin-direct\.js\n\s+Cache-Control: no-store/,'swipe controller must not be stale');

console.log('PASS: Franklin direct link, swipe-only gate, clean routing, and loader handoff are protected.');
