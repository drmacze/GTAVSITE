const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let entering=false;
document.querySelectorAll('[data-enter]').forEach(link=>link.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reducedMotion.matches)return;event.preventDefault();if(entering)return;entering=true;document.body.classList.add('leaving');window.setTimeout(()=>window.location.assign(link.href),450)}));
window.addEventListener('pageshow',()=>{entering=false;document.body.classList.remove('leaving')});
async function connectWelcomeDiscord(){try{const response=await fetch('community.json',{cache:'no-cache'});if(!response.ok)return;const config=await response.json();if(typeof config.discordInvite!=='string'||!config.discordInvite)return;const url=new URL(config.discordInvite);if(url.protocol!=='https:'||!['discord.gg','discord.com','www.discord.com'].includes(url.hostname))return;const link=document.querySelector('#welcome-discord');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer'}catch{}}
connectWelcomeDiscord();
