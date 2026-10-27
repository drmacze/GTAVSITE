const vm=require('vm'),fs=require('fs'),assert=require('assert/strict');
const source=fs.readFileSync('dist/ask-franklin.js','utf8');const code=source.slice(source.indexOf('  const updateViewport ='),source.indexOf('  const open ='));
const vars={},classes=new Set(),bodyVars={};const window={innerHeight:844,scrollY:450,visualViewport:{height:500,offsetTop:70,addEventListener(){}},addEventListener(){},scrollTo(v){this.restored=v.top}};
const context={window,panel:{style:{setProperty(k,v){vars[k]=v}}},document:{body:{style:{setProperty(k,v){bodyVars[k]=v},removeProperty(k){delete bodyVars[k]}},classList:{add(k){classes.add(k)},remove(k){classes.delete(k)}}}},mobileSheet:()=>true};
vm.runInNewContext(code+'\nlockPage();unlockPage();',context);assert.equal(vars['--franklin-viewport'],'500px');assert.equal(vars['--franklin-viewport-top'],'70px');assert.equal(vars['--franklin-keyboard'],undefined);assert.equal(window.restored,450);assert.equal(classes.size,0);assert.equal(Object.keys(bodyVars).length,0);
console.log('PASS: visible viewport offset and height, no duplicate keyboard inset, restored page position.');
