const fs=require('node:fs'),assert=require('node:assert/strict');

const read=path=>fs.readFileSync(path,'utf8');
const settings=read('dist/settings.js');
const welcome=read('dist/welcome.js');
const welcomeCss=read('dist/welcome.css');
const onboarding=read('dist/onboarding.js');
const pageLoading=read('dist/page-loading.js');
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
assert.match(gate,/const isWelcome=/,'gate must explicitly identify Welcome');
assert.match(gate,/const isAdmin=/,'gate must explicitly exempt the private admin dashboard');
assert.match(gate,/const isHome=/,'gate must explicitly identify Home');
assert.match(gate,/isOnboardingTransit=/,'gate must explicitly allow Home onboarding transit');
assert.match(gate,/params\.get\('intro'\)==='1'/,'Home transit should accept intro=1');
assert.match(gate,/recentTransit/,'Home transit must survive a canonical redirect that drops intro=1');
assert.match(gate,/cookieTransit/,'Home transit must have a cookie fallback');
assert.match(gate,/referrerWelcome/,'Home transit must accept a same-origin Welcome referrer');
assert.match(gate,/hashTransit/,'Home transit must have a URL-fragment fallback');
assert.match(gate,/poisonedReturn/,'gate must detect malformed or recursive return targets');
assert.match(gate,/u\.searchParams\.has\('return'\)/,'nested return parameters must be rejected');
assert.match(gate,/if\(isHome\)/,'Home must be handled separately from returnable public pages');
assert.match(gate,/sessionStorage\.removeItem\('gtav-onboarding-return'\)/,'stale recursive return state must be cleared');
assert.match(gate,/sessionStorage\.setItem\('gtav-onboarding-return',target\)/,'valid direct-link destination must be preserved');
assert.match(gate,/document\.documentElement\.style\.visibility='hidden'/,'public target must be hidden before redirect');
assert.match(gate,/location\.replace\('\/\?return='/,'gate must replace a valid direct public URL with Welcome');

// Welcome must use the gesture itself on iOS instead of depending on Safari scrollY.
assert.match(welcome,/if \(entering \|\| window\.__gtavWelcomeNavigating\) return;/,'Welcome navigation must be single-fire across inline and external handlers');
assert.match(welcome,/document\.body\.setAttribute\('aria-busy', 'true'\)/,'Welcome should expose navigation state without hiding the page');
assert.match(welcome,/const next = '\/home\?intro=1'/,'Welcome must use the canonical Home onboarding transit URL');
assert.match(welcome,/#onboarding/,'Welcome transit must keep a fragment fallback');
assert.match(welcome,/gtav-onboarding-transit=1/,'Welcome must stamp the cookie transit fallback before navigation');
assert.match(welcome,/target\.searchParams\.has\('return'\)/,'Welcome must reject nested return parameters');
assert.match(welcome,/isHome/,'Welcome must reject Home as a return target');
assert.match(welcome,/touchstart/,'Welcome must capture the beginning of a touch gesture');
assert.match(welcome,/touchmove/,'Welcome must intercept the touch gesture before Safari overscroll');
assert.match(welcome,/event\.preventDefault\(\)/,'Welcome must suppress native vertical overscroll after gesture intent is clear');
assert.match(welcome,/distance >= 28/,'Welcome must require a deliberate upward swipe during touchmove');
assert.doesNotMatch(welcome,/scrollY >=/,'iOS continuation must not depend on reaching a scrollY threshold');
assert.doesNotMatch(welcome,/classList\.add\(['"]leaving['"]\)/,'Welcome must not fade to a blank screen before navigation');
assert.match(welcome,/window\.addEventListener\('pageshow'/,'Welcome must recover cleanly from back-forward cache');
assert.match(welcomeCss,/overscroll-behavior-y:none/,'Welcome must suppress pull-to-refresh overscroll');
assert.match(welcomeCss,/overflow:hidden/,'Welcome must stay a single-screen gesture surface');

// The post-DOM loading gate must never bounce clean /home back to Welcome.
assert.match(pageLoading,/const isHome=path\.endsWith\('\/home'\)\|\|path\.endsWith\('\/home\.html'\)/,'secondary gate must recognize both clean and .html Home URLs');
assert.match(pageLoading,/path==='\/'\|\|path\.endsWith\('\/index\.html'\)\|\|isHome/,'secondary gate must exempt Home before checking onboarding completion');
assert.doesNotMatch(pageLoading,/path\.endsWith\('\/home\.html'\)\)return false/,'secondary gate must not protect only the .html Home form');

// Completing onboarding must never restore Home, Welcome, admin, or a nested return loop.
assert.match(onboarding,/function safeReturnTarget\(\)/,'onboarding must validate a saved return target');
assert.match(onboarding,/target\.origin!==location\.origin/,'return target must remain same-origin');
assert.match(onboarding,/const isHome=/,'onboarding must reject Home as a return target');
assert.match(onboarding,/const isWelcome=/,'onboarding must reject Welcome as a return target');
assert.match(onboarding,/target\.searchParams\.has\('return'\)/,'onboarding must reject nested return targets');
assert.match(onboarding,/release-publisher-8c2f71d4/,'admin dashboard must never become an onboarding return target');
assert.match(onboarding,/sessionStorage\.removeItem\('gtav-onboarding-return'\)/,'onboarding must clear stale stored return state');
assert.match(onboarding,/if\(returnTarget\)\{location\.assign\(returnTarget\);return;\}/,'completed onboarding may return only to a validated public page');

// Rating observer must only mount missing badges. Re-rendering stars inside the observer can create a mutation loop.
const observerMatch=ratings.match(/const observer=new MutationObserver\(\(\)=>\{([^}]*)\}\);/);
assert.ok(observerMatch,'community rating MutationObserver must exist');
assert.match(observerMatch[1],/mountLauncher\(\)/,'observer should mount launcher badge');
assert.match(observerMatch[1],/mountHelper\(\)/,'observer should mount Franklin helper badge');
assert.doesNotMatch(observerMatch[1],/renderAll\(|render\(/,'observer callback must not redraw rating stars');

console.log('PASS: clean Home transit, recursive onboarding returns, iOS Welcome transit, direct-link return, and rating observer invariants are protected.');
