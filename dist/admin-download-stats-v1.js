(()=>{
'use strict';
if(window.__gtavAdminDownloadStatsV1)return;window.__gtavAdminDownloadStatsV1=true;
const extra=document.createElement('script');extra.id='admin-additional-mods-loader';extra.src='/admin-additional-mods-v1.js?v=20261029additional1';extra.defer=true;document.head.append(extra);
if(!document.getElementById('admin-mod-description-editor-style')){const link=document.createElement('link');link.id='admin-mod-description-editor-style';link.rel='stylesheet';link.href='/admin-mod-description-editor-v1.css?v=20261029richeditor1';document.head.append(link)}
if(!document.getElementById('admin-mod-description-editor-script')){const script=document.createElement('script');script.id='admin-mod-description-editor-script';script.src='/admin-mod-description-editor-v1.js?v=20261029richeditor1';script.defer=true;document.head.append(script)}
const TOKEN_KEY='gtav-admin-token-v2',API='/api/mod-downloads';
const $=id=>document.getElementById(id);
function token(){return sessionStorage.getItem(TOKEN_KEY)||''}
function mount(){
 const overview=$('panel-overview');if(!overview||$('m-downloads'))return;
 const metrics=overview.querySelector('.metrics');
 if(metrics){
  const metric=document.createElement('div');metric.className='metric';metric.innerHTML='<small>Mod downloads</small><strong id="m-downloads">0</strong><span id="m-downloads-today">0 today</span>';metrics.append(metric);
 }
 const feedback=overview.querySelector('#feedback-overview')?.closest('.card');
 const card=document.createElement('section');card.className='card';card.id='mod-downloads-card';card.innerHTML=`<div class="card-head"><div><h2>Mod downloads</h2><small>Downloads continued from the Mods Library</small></div><span class="pill" id="download-7d">0 / 7D</span></div><div class="download-stats-summary"><span><small>Total</small><strong id="download-total">0</strong></span><span><small>Today</small><strong id="download-today">0</strong></span><span><small>Last 7 days</small><strong id="download-week">0</strong></span></div><div class="download-rank-list" id="download-rank-list"><p class="muted">No download data yet.</p></div>`;
 if(feedback)feedback.after(card);else overview.prepend(card);
 const style=document.createElement('style');style.textContent=`@media(min-width:1101px){#panel-overview>.metrics{grid-template-columns:repeat(7,minmax(0,1fr))}}.download-stats-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 14px}.download-stats-summary>span{padding:12px 13px;border:1px solid color-mix(in srgb,currentColor 8%,transparent);border-radius:13px;background:color-mix(in srgb,currentColor 2%,transparent);display:grid;gap:3px}.download-stats-summary small{font-size:.6rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted,#888)}.download-stats-summary strong{font-size:1.25rem}.download-rank-list{display:grid;gap:8px}.download-rank-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid color-mix(in srgb,currentColor 7%,transparent)}.download-rank-row:first-child{border-top:0}.download-rank-copy{min-width:0}.download-rank-copy strong{display:block;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.download-rank-copy small{font-size:.62rem;color:var(--muted,#888)}.download-rank-value{text-align:right}.download-rank-value strong{display:block;font-size:.9rem}.download-rank-value small{font-size:.6rem;color:var(--muted,#888)}@media(max-width:560px){.download-stats-summary{grid-template-columns:1fr 1fr}.download-stats-summary>span:last-child{grid-column:1/-1}}`;
 document.head.append(style);
}
function render(data){
 const total=Number(data.total||0),today=Number(data.today||0),week=Number(data.last7Days||0);
 if($('m-downloads'))$('m-downloads').textContent=total.toLocaleString();if($('m-downloads-today'))$('m-downloads-today').textContent=`${today.toLocaleString()} today`;
 if($('download-total'))$('download-total').textContent=total.toLocaleString();if($('download-today'))$('download-today').textContent=today.toLocaleString();if($('download-week'))$('download-week').textContent=week.toLocaleString();if($('download-7d'))$('download-7d').textContent=`${week.toLocaleString()} / 7D`;
 const root=$('download-rank-list');if(!root)return;root.replaceChildren();const rows=Array.isArray(data.perMod)?data.perMod:[];
 if(!rows.length){root.innerHTML='<p class="muted">No download data yet. Counts start when users continue a mod download.</p>';return}
 rows.slice(0,12).forEach((item,index)=>{const row=document.createElement('div');row.className='download-rank-row';const left=document.createElement('div');left.className='download-rank-copy';const name=document.createElement('strong');name.textContent=`${index+1}. ${item.title||item.id}`;const note=document.createElement('small');note.textContent=item.today?`${Number(item.today).toLocaleString()} today`:'No downloads today';left.append(name,note);const right=document.createElement('div');right.className='download-rank-value';const count=document.createElement('strong');count.textContent=Number(item.downloads||0).toLocaleString();const label=document.createElement('small');label.textContent='downloads';right.append(count,label);row.append(left,right);root.append(row)});
}
async function load(){const t=token();if(!t)return;try{const response=await fetch(API,{headers:{'X-Admin-Token':t},cache:'no-store'});if(!response.ok)throw new Error();render(await response.json())}catch{if($('download-rank-list'))$('download-rank-list').innerHTML='<p class="muted">Could not load download stats.</p>'}}
function init(){mount();window.addEventListener('project-admin-unlocked',load);window.addEventListener('project-admin-refreshed',load);$('refresh-all')?.addEventListener('click',load);$('lock-out')?.addEventListener('click',()=>render({}));if(token()&&!$('dashboard')?.hidden)load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
