const fs=require('node:fs'),assert=require('node:assert/strict');
const css=fs.readFileSync('dist/compatibility.css','utf8');

assert.match(css,/diagnostic console redesign/i,'compatibility stylesheet should keep the diagnostic-console redesign marker');
assert.match(css,/\.compat-checker\{[^}]*border:0/,'checker shell should be flat rather than a rounded card');
assert.match(css,/\.hardware-grid,\.runtime-grid/,'hardware and runtime sections should share the flat diagnostic-row layout');
assert.match(css,/\.hardware-card[^}]*border-radius:0!important/,'diagnostic rows must not regress to rounded cards');
assert.match(css,/\.port-evidence\{[^}]*border:0!important/,'port evidence should remain an editorial section instead of a boxed panel');
assert.match(css,/@keyframes compatAmbientPass/,'ambient light sweep animation must remain available');
assert.match(css,/@keyframes compatScanSweep/,'full-screen scan animation must remain available');
assert.match(css,/@keyframes compatRowIn/,'result rows should keep stagger/reveal motion');
assert.match(css,/@keyframes compatResultsIn/,'results transition should remain animated');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'motion must retain a reduced-motion fallback');
assert.match(css,/@media\(max-width:650px\)/,'mobile reflow rules must remain present');

console.log('PASS: compatibility diagnostic UI hierarchy, motion, and mobile fallbacks are protected.');
