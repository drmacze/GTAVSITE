const fs=require('fs');
const assert=require('assert');
const guard=fs.readFileSync('dist/franklin-ui-guard.js','utf8');
const feedback=fs.readFileSync('dist/feedback-fixes.js','utf8');
const lazy=fs.readFileSync('dist/lazy-helper.js','utf8');

assert.match(guard,/franklin-unified-entry/,'unified entry mode missing');
assert.match(guard,/\.ask-franklin-launcher,[\s\S]*\.franklin-sheet-dock,[\s\S]*\.franklin-nudge/,'legacy launch surfaces must be hidden');
assert.match(guard,/className='lazy-franklin'/,'primary Ask Franklin entry must be recreated when needed');
assert.match(guard,/openUnifiedChat/,'primary entry must bridge into the existing chat panel');
assert.doesNotMatch(guard,/\.lazy-franklin'\)\.forEach\(el=>\{el\.hidden=true/,'primary entry must not be hidden when legacy launcher appears');
assert.doesNotMatch(feedback,/lazy-franklin'\)\.forEach\(el=>\{el\.hidden=true/,'feedback must not hide the primary entry');
assert.match(lazy,/franklin-developer-kb\.js/,'developer knowledge backend must remain loaded');
assert.match(lazy,/franklin-dataset-engine\.js/,'dataset backend must remain loaded');
assert.match(lazy,/franklin-claude-rag\.js/,'RAG backend must remain loaded');
assert.match(lazy,/franklin-site-rag\.js/,'site knowledge backend must remain loaded');
console.log('Franklin unified launcher regression guard OK');
