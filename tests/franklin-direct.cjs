const fs=require('node:fs'),assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');

const html=read('dist/franklin.html');
const css=read('dist/franklin-direct.css');
const js=read('dist/franklin-direct.js');
const headers=read('dist/_headers');

assert.match(html,/data-page="franklin-direct"/,'direct page must opt into the Franklin loader without normal onboarding');
assert.doesNotMatch(html,/settings\.js|onboarding\.js/,'direct Franklin entry must not trigger the regular Welcome/onboarding gate');
assert.match(html,/<base href="\/">/,'direct page must resolve dynamic Franklin assets from site root even on a trailing slash URL');
assert.match(html,/rel="canonical" href="https:\/\/playgta5-1k8\.pages\.dev\/franklin"/,'direct page must declare one canonical share URL');
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

assert.equal(fs.existsSync('dist/_redirects'),false,'Franklin must not use custom redirect rules that can conflict with Cloudflare Pages pretty URLs');
assert.match(headers,/\/franklin\n\s+Cache-Control: no-store/,'direct link must not serve stale HTML');
assert.match(headers,/\/franklin\.html\n\s+Cache-Control: no-store/,'direct HTML file must not be stale');
assert.match(headers,/\/franklin-direct\.js\n\s+Cache-Control: no-store/,'swipe controller must not be stale');

console.log('PASS: Franklin direct link, swipe-only gate, redirect-loop protection, and loader handoff are protected.');
