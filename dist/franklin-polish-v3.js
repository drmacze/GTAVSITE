(()=>{
'use strict';
if(window.__franklinPolishV3)return;
window.__franklinPolishV3=true;

/* Website UI language stays English by default. */
try{localStorage.setItem('franklin_lang_v1','en')}catch{}

const speakerOn=`<svg class="sound-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z"/><path d="M15 9.2a4 4 0 0 1 0 5.6"/><path d="M17.8 6.7a7.3 7.3 0 0 1 0 10.6"/></svg>`;
const speakerOff=`<svg class="sound-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z"/><path d="m16 9 5 5"/><path d="m21 9-5 5"/></svg>`;

function polishSound(){
 const button=document.querySelector('#video-sound');
 if(!button)return;
 const on=button.getAttribute('aria-pressed')==='true';
 let icon=button.querySelector('.sound-inline-icon');
 if(!icon){
   const old=button.querySelector('svg');
   if(old)old.outerHTML=on?speakerOn:speakerOff;
   else button.insertAdjacentHTML('afterbegin',on?speakerOn:speakerOff);
 }else{
   const wanted=on?speakerOn:speakerOff;
   const current=icon.outerHTML;
   if((on&&!current.includes('17.8'))||(!on&&current.includes('17.8')))icon.outerHTML=wanted;
 }
 const label=button.querySelector('span');
 if(label)label.textContent=on?'Sound on':'Sound off';
 button.setAttribute('aria-label',on?'Mute background sound':'Enable background sound');
}

function forceEnglishComposer(root=document){
 const inputs=root.querySelectorAll?.('.ask-franklin-input, .ask-franklin-form textarea')||[];
 inputs.forEach(input=>{
   if(input.placeholder!=='Ask Franklin about GTA V iOS…')input.placeholder='Ask Franklin about GTA V iOS…';
   input.setAttribute('lang','en');
   input.setAttribute('aria-label','Ask Franklin about GTA V iOS');
 });
 const send=root.querySelectorAll?.('.ask-franklin-send')||[];
 send.forEach(button=>button.setAttribute('aria-label','Send message'));
}

polishSound();
forceEnglishComposer();

const sound=document.querySelector('#video-sound');
if(sound)new MutationObserver(polishSound).observe(sound,{attributes:true,attributeFilter:['aria-pressed']});

const observer=new MutationObserver(records=>{
 for(const record of records){
   if(record.type==='attributes'&&record.target.matches?.('.ask-franklin-input')){
     forceEnglishComposer(record.target.closest('.ask-franklin-compose')||document);
     continue;
   }
   record.addedNodes.forEach(node=>{
     if(node.nodeType!==1)return;
     forceEnglishComposer(node);
     if(node.matches?.('#video-sound')||node.querySelector?.('#video-sound'))polishSound();
   });
 }
});
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['placeholder']});

window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
