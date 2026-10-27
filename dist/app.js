const $=(selector)=>document.querySelector(selector);
const menu=$('#site-menu');
const toggle=$('.menu-toggle');
let closingTimer;
function openMenu(){clearTimeout(closingTimer);menu.classList.remove('closing');if(!menu.open)menu.showModal();document.documentElement.classList.add('menu-open');toggle.setAttribute('aria-expanded','true')}
function closeMenu(){if(!menu.open||menu.classList.contains('closing'))return;menu.classList.add('closing');toggle.setAttribute('aria-expanded','false');const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;closingTimer=setTimeout(()=>{menu.close();menu.classList.remove('closing');document.documentElement.classList.remove('menu-open');toggle.focus()},reduced?0:260)}
toggle.addEventListener('click',openMenu);
$('.menu-close').addEventListener('click',closeMenu);
$('.menu-backdrop').addEventListener('click',closeMenu);
menu.addEventListener('cancel',event=>{event.preventDefault();closeMenu()});
menu.addEventListener('close',()=>{document.documentElement.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false')});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{clearTimeout(closingTimer);menu.close()}));
const search=$('#faq-search');
if(search){const questions=[...document.querySelectorAll('.faq-list details')];search.addEventListener('input',event=>{const term=event.target.value.trim().toLowerCase();let found=0;questions.forEach(item=>{const match=item.textContent.toLowerCase().includes(term);item.hidden=!match;if(match)found++});$('#faq-empty').hidden=found>0});document.addEventListener('keydown',event=>{if(event.key==='/'&&!menu.open&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!document.activeElement.isContentEditable){event.preventDefault();search.focus()}})}
function webUrl(value){if(typeof value!=='string'||!value)return null;try{const url=new URL(value,window.location.href);if(url.protocol!=='https:'&&url.origin!==window.location.origin)return null;return url}catch{return null}}
function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el}
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('icon');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','assets/icons.svg#'+name);svg.append(use);return svg}
function iconBadge(className,name){const badge=element('span',className);badge.append(icon(name));return badge}
function videoButton(button,name,label){button.replaceChildren(icon(name),element('span','',label))}
let posts=[];let filter=document.body.dataset.page==='updates'?'update':'news';
const filters=[...document.querySelectorAll('[data-filter]')];
function renderPosts(){const list=$('#news-list');if(!list)return;list.replaceChildren();const visible=posts.filter(post=>filter==='all'||post.type===filter);if(!visible.length){const empty=element('div','empty-state');empty.append(iconBadge('empty-icon','newspaper'),element('h3','',filter==='all'?'No announcements yet':filter==='news'?'No community news yet':'No project updates yet'),element('p','','New posts will appear here when they are published. Visit Discord for community discussions.'));list.append(empty);return}visible.forEach(post=>{const card=element('article','post');const meta=element('div','post-meta');meta.append(element('span','',post.type==='update'?'PROJECT UPDATE':'COMMUNITY NEWS'));const date=new Date(post.date);if(Number.isFinite(date.getTime())){const time=element('time','',new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric'}).format(date));time.dateTime=date.toISOString();meta.append(time)}card.append(meta,element('h3','',post.title),element('p','',post.summary));const url=webUrl(post.url);if(url){const link=element('a','','Read announcement ');link.append(icon('arrow-up-right'));link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';card.append(link)}list.append(card)})}
filters.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;filters.forEach(item=>{const selected=item===button;item.classList.toggle('selected',selected);item.setAttribute('aria-pressed',String(selected))});renderPosts()}));
function renderStaff(staff){if(!$('#staff-list')||!staff.length)return;$('#staff-count').textContent=new Intl.NumberFormat('en').format(staff.length);const grid=element('div','staff-grid');staff.forEach(person=>{const card=element('article','staff-card');const avatar=element('div','avatar',person.name.slice(0,1).toUpperCase());const imageUrl=webUrl(person.avatar);if(imageUrl){const image=element('img');image.src=imageUrl.href;image.alt='';image.loading='lazy';image.addEventListener('error',()=>{image.remove();avatar.textContent=person.name.slice(0,1).toUpperCase()},{once:true});avatar.replaceChildren(image)}const info=element('div');info.append(element('h4','',person.name),element('p','',person.role||'Community staff'));if(/^\d{17,20}$/.test(person.discordUserId||'')){const link=element('a','','Discord profile ');link.append(icon('arrow-up-right'));link.href='https://discord.com/users/'+person.discordUserId;link.target='_blank';link.rel='noopener noreferrer';info.append(link)}card.append(avatar,info);grid.append(card)});$('#staff-list').replaceChildren(grid)}
function prepareVideo(config){if(!$('#hero-video'))return;const url=webUrl(config.trailerUrl);if(!url)return;const video=$('#hero-video');const poster=webUrl(config.trailerPoster);if(poster)video.poster=poster.href;video.src=url.href;video.hidden=false;video.preload='metadata';const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const controls=$('.video-controls');const play=$('#video-play');function updatePlay(){videoButton(play,video.paused?'play':'pause',video.paused?'Play video':'Pause video');play.setAttribute('aria-label',video.paused?'Play background video':'Pause background video')}
video.addEventListener('loadeddata',()=>{$('.hero').classList.add('has-video');controls.hidden=false;updatePlay()});video.addEventListener('playing',()=>{$('.hero').classList.add('has-video');controls.hidden=false;updatePlay()});video.addEventListener('pause',updatePlay);video.addEventListener('error',()=>{video.hidden=true;controls.hidden=true;$('.hero').classList.remove('has-video')});video.autoplay=!reduced.matches;if(!reduced.matches)video.play().catch(()=>{controls.hidden=false;updatePlay()});else{video.load();controls.hidden=false;updatePlay()}
play.addEventListener('click',()=>{if(video.paused)video.play().catch(()=>{play.textContent='Video unavailable'});else video.pause()});$('#video-sound').addEventListener('click',()=>{video.muted=!video.muted;videoButton($('#video-sound'),video.muted?'volume-off':'volume',video.muted?'Sound off':'Sound on');$('#video-sound').setAttribute('aria-label',video.muted?'Unmute background video':'Mute background video');$('#video-sound').setAttribute('aria-pressed',String(!video.muted))});document.addEventListener('visibilitychange',()=>{if(document.hidden&&!video.paused){video.dataset.resume='true';video.pause()}else if(!document.hidden&&video.dataset.resume==='true'&&!reduced.matches){delete video.dataset.resume;video.play().catch(()=>{})}});reduced.addEventListener('change',event=>{if(event.matches)video.pause()});}
function discordInvite(value){const url=webUrl(value);if(!url)return null;const host=url.hostname.toLowerCase();let code;if(host==='discord.gg')code=url.pathname.split('/')[1];else if(['discord.com','www.discord.com'].includes(host)&&url.pathname.startsWith('/invite/'))code=url.pathname.split('/')[2];if(!code||!/^[a-zA-Z0-9-]+$/.test(code))return null;return {url:'https://discord.gg/'+code,code}}
function setDiscordNote(message){const note=$('#discord-note');if(note)note.textContent=message}
async function loadDiscord(invite){document.querySelectorAll('.discord-link').forEach(link=>{link.href=invite.url;link.target='_blank';link.rel='noopener noreferrer';if(link.classList.contains('button')){link.replaceChildren(document.createTextNode('Join Discord '),icon('arrow-up-right'))}});setDiscordNote('Join our Discord server');if(!$('#server-status'))return;$('#server-status').replaceChildren(element('i'),document.createTextNode('Discord community'));try{const response=await fetch('https://discord.com/api/v10/invites/'+encodeURIComponent(invite.code)+'?with_counts=true',{signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Invite unavailable');const data=await response.json();if($('#member-count')&&Number.isFinite(data.approximate_member_count))$('#member-count').textContent='~'+new Intl.NumberFormat('en').format(data.approximate_member_count);if($('#online-count')&&Number.isFinite(data.approximate_presence_count))$('#online-count').textContent='~'+new Intl.NumberFormat('en').format(data.approximate_presence_count);if($('.stats'))$('.stats').title='Discord member and online counts are approximate.';if(data.guild?.name)$('#server-name').textContent=data.guild.name;if(data.guild?.description)$('#server-description').textContent=data.guild.description;if(/^\d+$/.test(data.guild?.id||'')&&/^[a-zA-Z0-9_]+$/.test(data.guild?.icon||'')){$('#server-icon').style.backgroundImage='url("https://cdn.discordapp.com/icons/'+data.guild.id+'/'+data.guild.icon+'.png?size=128")';$('#server-icon').classList.add('has-icon')}$('#server-status').replaceChildren(element('i'),document.createTextNode('Discord connected'));$('#server-status').classList.add('connected');setDiscordNote('Member counts provided by Discord')}catch{$('#server-status').replaceChildren(element('i'),document.createTextNode('Join us on Discord'));setDiscordNote('Member counts currently unavailable')}}
async function init(){try{const response=await fetch('community.json',{cache:'no-cache'});if(!response.ok)throw Error('Community information unavailable');const config=await response.json();if($('#server-name')&&typeof config.name==='string'&&config.name.trim())$('#server-name').textContent=config.name;posts=(Array.isArray(config.posts)?config.posts:[]).filter(post=>post&&typeof post.title==='string'&&typeof post.summary==='string'&&['news','update'].includes(post.type)).sort((a,b)=>(Date.parse(b.date)||0)-(Date.parse(a.date)||0));renderPosts();renderStaff((Array.isArray(config.staff)?config.staff:[]).filter(person=>person&&typeof person.name==='string'&&person.name.trim()));prepareVideo(config);const invite=discordInvite(config.discordInvite);if(invite)await loadDiscord(invite)}catch{renderPosts()}}
init();

// Timed, non-blocking notifications after the required welcome questions.
function showWelcomeNotifications(resultOverride=null){
  if(document.body.dataset.page!=='home')return;
  let result=resultOverride;
  try{result=result||JSON.parse(sessionStorage.getItem('gtav-community-welcome')||'null');sessionStorage.removeItem('gtav-community-welcome')}catch{}
  const url=new URL(location.href);const fallback=url.searchParams.get('welcome');
  if(['android','ios'].includes(fallback)){result=result||{device:fallback};url.searchParams.delete('welcome');history.replaceState(null,'',url.pathname+url.search+url.hash)}
  if(!result||!['android','ios'].includes(result.device))return;
  let region=document.querySelector('.toast-region');
  if(!region){region=element('aside','toast-region');region.setAttribute('aria-label','Community notifications');document.body.append(region)}
  function toast(message,kind='info',duration=8000){
    const card=element('section','community-toast '+kind);const mark=element('span','toast-mark');
    mark.append(icon(kind==='warning'?'warning':'check'));
    const content=element('div','toast-content');const label=element('p','toast-label',kind==='warning'?'DEVICE NOTICE':'COMMUNITY');
    const status=element('p','toast-message',message);status.setAttribute('role','status');status.setAttribute('aria-atomic','true');
    const close=element('button','toast-close');close.type='button';close.setAttribute('aria-label','Dismiss notification');close.append(icon('close'));
    const footer=element('div','toast-timer');const clock=element('span','',`Closing in ${Math.ceil(duration/1000)}s`);clock.setAttribute('aria-hidden','true');
    footer.append(clock);const rail=element('div','toast-progress');rail.setAttribute('aria-hidden','true');const fill=element('span');rail.append(fill);
    content.append(label,status);card.append(mark,content,close,footer,rail);region.append(card);
    let remaining=duration,total=duration,last=performance.now(),dismissed=false;
    const pauses=new Set();
    function dismiss(){
      if(dismissed)return;dismissed=true;clearInterval(timer);
      if(card.contains(document.activeElement)){const nextCard=[...region.children].find(item=>item!==card);const focus=nextCard?.querySelector('button')||document.querySelector('.home-content h1');focus?.focus({preventScroll:true})}
      card.classList.add('toast-leaving');
      setTimeout(()=>{card.remove();if(!region.children.length)region.remove()},matchMedia('(prefers-reduced-motion: reduce)').matches?0:220);
    }
    close.addEventListener('click',dismiss);
    card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')pauses.add('hover')});
    card.addEventListener('pointerleave',()=>pauses.delete('hover'));
    card.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')pauses.add('touch')});
    ['pointerup','pointercancel'].forEach(type=>card.addEventListener(type,()=>pauses.delete('touch')));
    card.addEventListener('focusin',()=>pauses.add('focus'));
    card.addEventListener('focusout',()=>setTimeout(()=>{if(!card.contains(document.activeElement))pauses.delete('focus')},0));
    const timer=setInterval(()=>{
      const now=performance.now();const paused=pauses.size>0||document.hidden;
      if(!paused)remaining-=Math.min(now-last,250);
      last=now;fill.style.transform=`scaleX(${Math.max(0,remaining/total)})`;
      clock.textContent=paused?'Timer paused':`Closing in ${Math.max(0,Math.ceil(remaining/1000))}s`;
      if(remaining<=0)dismiss();
    },100);
    return {card,content,status,reset(ms){remaining=total=ms;last=performance.now();},mark};
  }
  if(result.device==='android'){
    const notice=toast('Your device is not supported.','warning',10000);
    notice.content.append(element('p','toast-note','You can still explore the project and join the community.'));return;
  }
  const welcome=toast('Welcome to the community.');
  welcome.content.append(element('p','toast-note','Explore the latest releases and gameplay from the community.'));
  let subscribed=false;try{subscribed=window.sitePrivacy?.getPreference('gtav-community-update-interest')==='true'}catch{}
  if(subscribed)return;
  const prompt=toast('Stay connected to the project.','subscribe',20000);
  prompt.content.append(element('p','toast-note',window.sitePrivacy?.allowsPreferences()?'Remember your interest in project updates on this device.':'Save your interest in project updates for this visit.'));
  const subscribe=element('button','toast-subscribe','Subscribe');subscribe.type='button';
  subscribe.addEventListener('click',()=>{
    try{window.sitePrivacy?.setPreference('gtav-community-update-interest','true')}catch{}
    prompt.status.textContent='Thank you for your support.';
    prompt.content.querySelector('.toast-note').textContent=window.sitePrivacy?.allowsPreferences()?'Your interest has been saved on this device.':'Your interest has been saved for this visit.';
    prompt.card.classList.add('subscribed');prompt.mark.replaceChildren(icon('check'));subscribe.remove();prompt.reset(6000);
  });prompt.content.append(subscribe);
}
showWelcomeNotifications();

// User-provided trailer soundtrack, enabled by a user gesture.
{const musicScript=document.createElement("script");musicScript.src="music.js";document.head.append(musicScript);}

// Discourage casual content copying while preserving editable tools and forms.
(()=>{const editable=target=>target instanceof Element&&!!target.closest('input,textarea,[contenteditable="true"],.ask-franklin-panel');
document.addEventListener('contextmenu',event=>{if(!editable(event.target))event.preventDefault();});
document.addEventListener('copy',event=>{if(!editable(event.target))event.preventDefault();});
document.addEventListener('dragstart',event=>{if(event.target instanceof Element&&event.target.closest('img,video'))event.preventDefault();});
document.querySelectorAll('img').forEach(image=>image.draggable=false);
})();
