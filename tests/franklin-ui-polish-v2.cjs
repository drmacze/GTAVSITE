const fs=require('fs');
const guard=fs.readFileSync('dist/franklin-ui-guard-v2.js','utf8');
const outline=fs.readFileSync('dist/page-loading-outline-v6.js','utf8');
const standard=fs.readFileSync('dist/page-loading.js','utf8');
for(const token of ['lazy-franklin-avatar','COMMUNITY HELPER','franklin-language-icon','franklin-language-select','opacity:0!important']){
 if(!guard.includes(token)) throw new Error('Missing Franklin UI token: '+token);
}
if(!outline.includes('franklin-ui-guard-v2.js?v=20261028polish2')) throw new Error('Outline loader not using guard v2');
if(!standard.includes('franklin-ui-guard-v2.js?v=20261028polish2')) throw new Error('Standard loader not using guard v2');
console.log('Franklin UI polish v2 regression guard OK');
