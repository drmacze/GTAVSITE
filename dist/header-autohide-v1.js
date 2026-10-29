(()=>{
'use strict';
if(window.__gtavHeaderAutohideV1)return;
window.__gtavHeaderAutohideV1=true;
const header=document.querySelector('.site-header');
if(!header)return;
const body=document.body;
const isHome=body?.dataset.page==='home';
let lastY=Math.max(0,scrollY);
let ticking=false;
let locked=false;
const threshold=10;
const topZone=72;
const homeReady=()=>!isHome||body.classList.contains('home-chapter-locked');
const show=()=>{
  if(!homeReady())return;
  header.classList.remove('header-is-hidden');
  header.classList.add('header-is-visible');
};
const hide=()=>{
  header.classList.remove('header-is-visible');
  header.classList.add('header-is-hidden');
};
const sync=()=>{
 ticking=false;
 const y=Math.max(0,scrollY);
 header.classList.toggle('header-has-scrolled',y>12);
 if(!homeReady()){
   hide();
   lastY=y;
   return;
 }
 if(y<=topZone){show();lastY=y;return}
 const delta=y-lastY;
 if(Math.abs(delta)<threshold)return;
 if(delta>0&&!locked)hide();else show();
 lastY=y;
};
const schedule=()=>{if(ticking)return;ticking=true;requestAnimationFrame(sync)};
addEventListener('scroll',schedule,{passive:true});
addEventListener('pageshow',()=>{lastY=Math.max(0,scrollY);if(homeReady())show();else hide();schedule()},{passive:true});
header.addEventListener('focusin',show);

if(isHome){
 window.addEventListener('gtav:home-chapter-locked',()=>{
   lastY=0;
   requestAnimationFrame(()=>{show();schedule()});
 },{passive:true});
 const bodyObserver=new MutationObserver(()=>schedule());
 bodyObserver.observe(body,{attributes:true,attributeFilter:['class']});
 addEventListener('pagehide',()=>bodyObserver.disconnect(),{once:true});
}

const menu=document.querySelector('.menu-dialog');
if(menu){
 const observer=new MutationObserver(()=>{locked=menu.open;if(locked)show()});
 observer.observe(menu,{attributes:true,attributeFilter:['open']});
 addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}
document.addEventListener('toggle',event=>{if(event.target?.matches?.('.download-menu'))show()},true);
sync();
})();
