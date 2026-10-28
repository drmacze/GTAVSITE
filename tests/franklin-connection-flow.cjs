const fs=require('fs');
const assert=require('assert');
const lazy=fs.readFileSync('dist/lazy-helper.js','utf8');
const guard=fs.readFileSync('dist/franklin-ui-guard-v2.js','utf8');

assert.match(lazy,/button\.dataset\.state='expanded'/,'Franklin must start expanded before auto-collapse');
assert.match(lazy,/button\.dataset\.state='compact'/,'Franklin must support avatar-only compact state');
assert.match(lazy,/if\(state==='compact'\)\{expand\(\);return\}/,'first compact tap must expand instead of connecting');
assert.match(lazy,/if\(ready\)\{openFranklin\(\);return\}connect\(\)/,'second expanded tap must connect/open');
assert.match(lazy,/FranklinDeveloperKB/);
assert.match(lazy,/FranklinDataset/);
assert.match(lazy,/FranklinClaudeRAG/);
assert.match(lazy,/FranklinSiteRAG/,'Site RAG must be loaded during the real connection sequence');
assert.match(lazy,/await api\.load\(\)/,'connection progress must wait for real knowledge loading');
assert.match(lazy,/franklin-connect-stages/,'connection UI must expose runtime, knowledge and ready stages');
assert.match(guard,/\[data-state="compact"\]/,'guard must style the avatar-only compact state');
assert.match(guard,/franklin-language-icon/,'guard must render the language control as an icon');
assert.match(guard,/franklin-head-actions>\.ask-franklin-close/,'language and minimize controls must share a clean aligned header treatment');
console.log('Franklin connection flow regression checks passed.');
