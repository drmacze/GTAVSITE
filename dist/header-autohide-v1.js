(()=>{
'use strict';
if(window.__gtavHeaderAutohideV1)return;
window.__gtavHeaderAutohideV1=true;
const header=document.querySelector('.site-header');
if(!header)return;
let lastY=Math.max(0,scrollY);
let ticking=false;
let locked=false;
const threshold=10;
const topZone=72;
const show=()=>{header.classList.remove('header-is-hidden');header.classList.add('header-is-visible')};
const hide=()=>{if(locked)return;header.classList.remove('header-is-visible');header.classList.add('header-is-hidden')};
const sync=()=>{
 ticking=false;
 const y=Math.max(0,scrollY);
 header.classList.toggle('header-has-scrolled',y>12);
 if(y<=topZone){show();lastY=y;return}
 const delta=y-lastY;
 if(Math.abs(delta)<threshold)return;
 if(delta>0)hide();else show();
 lastY=y;
};
const schedule=()=>{if(ticking)return;ticking=true;requestAnimationFrame(sync)};
addEventListener('scroll',schedule,{passive:true});
addEventListener('pageshow',()=>{lastY=Math.max(0,scrollY);show();schedule()},{passive:true});
header.addEventListener('focusin',show);
const menu=document.querySelector('.menu-dialog');
if(menu){
 const observer=new MutationObserver(()=>{locked=menu.open; if(locked)show()});
 observer.observe(menu,{attributes:true,attributeFilter:['open']});
}
document.addEventListener('toggle',event=>{if(event.target?.matches?.('.download-menu'))show()},true);
sync();
})();
