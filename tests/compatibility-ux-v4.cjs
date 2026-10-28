const fs=require('fs');
const assert=require('assert');
const css=fs.readFileSync('dist/compatibility.css','utf8');
const js=fs.readFileSync('dist/compatibility.js','utf8');

assert(css.includes('body[data-compat-phase="results"] .compat-heading,body[data-compat-phase="results"] .compat-checker{display:none!important}'),'results must hide setup/form');
assert(css.includes('.result-nav a{display:none!important}'),'legacy result navigation must stay hidden');
assert(css.includes('.result-nav a[href="#performance-check"]{display:inline-flex!important'),'performance remains an explicit advanced action');
assert(css.includes('.hardware-grid .hardware-card:nth-child(2),.hardware-grid .hardware-card:nth-child(5),.hardware-grid .hardware-card:nth-child(6){display:none!important}'),'low-value hardware rows must not clutter default results');
assert(css.includes('grid-template-columns:1fr 1fr!important')&&css.includes('.runtime-grid [data-port-card]{display:none!important}'),'runtime results should stay compact');
assert(css.includes('--compat-scan:#78b7d7')&&css.includes('background:linear-gradient(180deg,#171a1d 0%,#121416 100%)!important'),'scan visual must use cool neutral palette');
assert(css.includes('.orbit-dot{')===false,'persistent orbit-dot styling must not return');
assert(css.includes('transform:none!important;rotate:0deg!important;writing-mode:horizontal-tb!important'),'Required badge must remain horizontal and restrained');
assert(js.includes('const duration=10000'),'scan duration must remain ten seconds');
assert(js.includes("results.scrollIntoView"),'scan completion must move the viewport to results');
assert(js.includes("start.firstChild.textContent='Scan '"),'primary action must remain Scan');
console.log('Compatibility UX v4 regression guard OK');
