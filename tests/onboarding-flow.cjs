const fs=require('node:fs'),assert=require('node:assert/strict');

const read=path=>fs.readFileSync(path,'utf8');
const settings=read('dist/settings.js');
const welcome=read('dist/welcome.js');
const onboarding=read('dist/onboarding.js');
const ratings=read('dist/community-ratings.js');
const publicPages=['feedback.html','technicalities.html','updates.html','community.html','faq.html','compatibility.html','get-started.html','guide.html'];

// Public direct links must execute the onboarding gate before page markup can paint.
for(const page of publicPages){
  const html=read('dist/'+page);
  const head=html.slice(0,Math.min(html.length,500));
  assert.match(head,/<head><script src="settings\.js\?v=[^"]+"><\/script>/,`${page} must load settings.js first in <head>`);
}

const gateEnd=settings.indexOf('/* Shared preferences are applied before paint');
assert.ok(gateEnd>0,'settings.js must keep the pre-paint gate before preference/bootstrap code');
const gate=settings.slice(0,gateEnd);
assert.match(gate,/const isWelcome=/,'gate must explicitly exempt Welcome');
assert.match(gate,/const isAdmin=/,'gate must explicitly exempt the private admin dashboard');
assert.match(gate,/isOnboardingTransit=/,'gate must explicitly allow Home onboarding transit');
assert.match(gate,/params\.get\('intro'\)==='1'/,'Home transit must require intro=1');
assert.match(gate,/sessionStorage\.setItem\('gtav-onboarding-return',target\)/,'direct-link destination must be preserved');
assert.match(gate,/document\.documentElement\.style\.visibility='hidden'/,'public target must be hidden before redirect');
assert.match(gate,/location\.replace\('\/\?return='/,'gate must replace the direct public URL with Welcome');

// Welcome must stay visible until navigation commits and must not fade itself to blank.
assert.match(welcome,/if \(entering\) return;/,'Welcome navigation must be single-fire');
assert.match(welcome,/document\.body\.setAttribute\('aria-busy', 'true'\)/,'Welcome should expose navigation state without hiding the page');
assert.match(welcome,/home\.html\?intro=1/,'Welcome must enter Home through the onboarding transit URL');
assert.doesNotMatch(welcome,/classList\.add\(['"]leaving['"]\)/,'Welcome must not fade to a blank screen before navigation');
assert.match(welcome,/window\.addEventListener\('pageshow'/,'Welcome must recover cleanly from back-forward cache');

// Completing onboarding must restore the original same-origin direct link.
assert.match(onboarding,/function safeReturnTarget\(\)/,'onboarding must validate a saved return target');
assert.match(onboarding,/target\.origin!==location\.origin/,'return target must remain same-origin');
assert.match(onboarding,/release-publisher-8c2f71d4/,'admin dashboard must never become an onboarding return target');
assert.match(onboarding,/if\(returnTarget\)\{location\.assign\(returnTarget\);return;\}/,'completed onboarding must return to the requested public page');

// Rating observer must only mount missing badges. Re-rendering stars inside the observer can create a mutation loop.
const observerMatch=ratings.match(/const observer=new MutationObserver\(\(\)=>\{([^}]*)\}\);/);
assert.ok(observerMatch,'community rating MutationObserver must exist');
assert.match(observerMatch[1],/mountLauncher\(\)/,'observer should mount launcher badge');
assert.match(observerMatch[1],/mountHelper\(\)/,'observer should mount Franklin helper badge');
assert.doesNotMatch(observerMatch[1],/renderAll\(|render\(/,'observer callback must not redraw rating stars');

console.log('PASS: onboarding gate, Welcome transition, direct-link return, and rating observer invariants are protected.');
