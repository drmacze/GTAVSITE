const fs=require('fs');
const assert=require('assert');

const read=p=>fs.readFileSync(p,'utf8');
const guard=read('dist/franklin-ui-guard.js');
const feedback=read('dist/feedback-fixes.js');
const css=read('dist/feedback-fixes.css');
const motion=read('dist/motion.js');
const loading=read('dist/page-loading.js');
const outline=read('dist/page-loading-outline-v6.js');

assert(guard.includes('franklin-external-keyboard'),'keyboard guard class missing');
assert(guard.includes("document.querySelectorAll('.lazy-franklin')"),'pending helper singleton guard missing');
assert(guard.includes("launcher.parentElement?.id==='feedback-helper-slot'"),'feedback launcher normalization missing');
assert(feedback.includes('feedback-inline-error'),'inline validation missing');
assert(feedback.includes('stopImmediatePropagation'),'legacy validation is not intercepted');
assert(feedback.includes('showFormError(message)'),'network warnings are not converted inline');
assert(css.includes('#feedback-toast{display:none!important}'),'legacy feedback toast is still visible');
assert(css.includes('color:#ff6468'),'inline error styling is missing');
for(const source of [motion,loading,outline]){
  assert(source.includes('franklin-ui-guard.js'),'a page bootstrap does not load the Franklin guard');
}
assert(loading.includes('feedback-fixes.js'),'feedback fixes missing from no-store page loader');
console.log('mobile feedback/helper UI regression checks passed');
