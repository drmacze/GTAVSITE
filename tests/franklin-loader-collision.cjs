const fs = require('fs');
const assert = require('assert');

const read = p => fs.readFileSync(p, 'utf8');
const motion = read('dist/motion.js');
const standard = read('dist/page-loading.js');
const outline = read('dist/page-loading-outline-v6.js');
const legacy = read('dist/franklin-ui-guard.js');
const v2 = read('dist/franklin-ui-guard-v2.js');
const lazy = read('dist/lazy-helper.js');

for (const [name, src] of [['motion', motion], ['standard loader', standard], ['outline loader', outline]]) {
  assert(src.includes("franklin-ui-guard-v2.js?v=20261028polish3"), `${name} must load Franklin UI guard v2 polish3`);
  assert(src.includes("'franklin-ui-guard-v2-loader'"), `${name} must use the unique v2 script id`);
  assert(!src.includes("'franklin-ui-guard-loader'"), `${name} must not reuse the legacy guard script id`);
}

assert(legacy.includes('franklin-ui-guard-v2.js?v=20261028polish3'), 'legacy guard must forward to v2');
assert(legacy.includes("s.id='franklin-ui-guard-v2-loader'"), 'legacy guard shim must use the v2 id');
assert(v2.includes('lazy-franklin-avatar'), 'v2 must decorate the primary helper with Franklin avatar');
assert(v2.includes('franklin-language-icon'), 'v2 must render the compact globe language control');
assert(v2.includes("opacity:0!important"), 'v2 must keep the native language select invisible over the globe button');
assert(lazy.includes('assets/avatars/franklin.jpg'), 'primary helper must use the local Franklin avatar');

console.log('Franklin loader collision regression checks passed.');
