const fs=require('node:fs');
const assert=require('node:assert/strict');
const js=fs.readFileSync('dist/compatibility.js','utf8');

assert.doesNotThrow(()=>new Function(js),'compatibility.js must remain valid JavaScript');
assert.match(js,/document\.querySelector\('\.compat-reference'\)\?\.remove\(\)/,'old Planning guidelines strip must be removed');
assert.match(js,/start\.firstChild\.textContent='Scan '/,'primary action must be Scan');
assert.match(js,/const duration=10000/,'compatibility scan must run for 10 seconds');
assert.match(js,/compat-scan-sheet/,'scan must use a bottom sheet');
assert.match(js,/compatScanSheetUp/,'bottom sheet must animate upward');
assert.match(js,/compatScanSheetDown/,'bottom sheet must animate downward after completion');
assert.match(js,/body\[data-page="compatibility"\] \.compat-visual\{display:none!important\}/,'old persistent scan visual must stay hidden');
assert.match(js,/body\[data-page="compatibility"\] \.orbit-dot\{display:none!important\}/,'rotating orbit dot must stay hidden');
assert.match(js,/headingShine\.removeAttribute\('data-shine'\)/,'compatibility heading shine must be disabled');
assert.match(js,/render\(activeModel\)/,'results must render when scan completes');
assert.match(js,/closeScanSheet\(ui\)/,'scan sheet must dismiss automatically');
assert.match(js,/results\.scrollIntoView/,'results must become the foreground view after the sheet closes');

console.log('PASS: compatibility uses a 10-second automatic bottom-sheet scan with simplified visuals.');
