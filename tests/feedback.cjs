const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gtav-feedback-')),file=path.join(dir,'test.sqlite');
const sql=`import sys,json,sqlite3\nb=json.load(sys.stdin); c=sqlite3.connect(b['file']);c.row_factory=sqlite3.Row\ntry:\n r=[]\n for q in b['queries']:\n  x=c.execute(q['sql'],q['args']);r.append([dict(z) for z in x.fetchall()])\n c.commit();print(json.dumps(r))\nfinally:c.close()`;
function query(queries){const r=cp.spawnSync('python',['-c',sql],{input:JSON.stringify({file,queries}),encoding:'utf8'});if(r.status)throw Error(r.stderr);return JSON.parse(r.stdout)}
const db={prepare(sql){return{sql,args:[],bind(...args){this.args=args;return this},async run(){query([this]);return{success:true}},async first(){return query([this])[0][0]||null},async all(){return{results:query([this])[0]}}}},async batch(queries){return query(queries)}};
(async()=>{const source=fs.readFileSync('functions/api/feedback.js','utf8').replace(/const ADMIN_HASH='[^']+'/,"const ADMIN_HASH='"+require('node:crypto').createHash('sha256').update('test-only-token').digest('hex')+"'"),{onRequest}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));const invoke=(method='GET',body,extra={})=>onRequest({env:{VISITS_DB:db},request:new Request('https://example.test/api/feedback'+(extra.admin?'?admin=1':''),{method,headers:{Origin:'https://example.test','Content-Type':'application/json','CF-Connecting-IP':extra.ip||'127.0.0.1',...extra.headers},...(body?{body:JSON.stringify(body)}:{})})});
let r=await invoke();assert.deepEqual((await r.json()).ratings,[]);
const payload={id:crypto.randomUUID(),target:'helper',kind:'issue',rating:4,title:'Answer relevance',message:'The answer was unrelated to my crash question.',steps:'Open helper, ask about a crash.'};
assert.equal((await invoke('POST',{...payload,rating:7})).status,400);
assert.equal((await invoke('POST',payload,{headers:{Origin:'https://evil.test'}})).status,403);
r=await invoke('POST',payload);assert.equal(r.status,201);const cookie=r.headers.get('set-cookie').split(';')[0];assert.match((await r.json()).reference,/^GTA-/);
assert.equal((await invoke('POST',payload,{headers:{Cookie:cookie}})).status,200);
assert.equal(query([{sql:'SELECT COUNT(*) count FROM community_feedback',args:[]}])[0][0].count,1);
await invoke('POST',{...payload,id:crypto.randomUUID(),rating:2},{headers:{Cookie:cookie}});
let publicData=await (await invoke()).json();assert.equal(publicData.ratings[0].count,1);assert.equal(publicData.ratings[0].average,2);assert(!JSON.stringify(publicData).includes(payload.message));
await invoke('POST',{...payload,id:crypto.randomUUID(),rating:4},{ip:'127.0.0.2'});publicData=await (await invoke()).json();assert.equal(publicData.ratings[0].count,2);assert.equal(publicData.ratings[0].average,3);
assert.equal((await invoke('GET',null,{admin:true})).status,401);
const auth={admin:true,headers:{'X-Admin-Token':'test-only-token'}};let adminResult=await (await invoke('GET',null,auth)).json();assert.equal(adminResult.summary.reports,3);assert.equal(adminResult.summary.issues,3);assert.equal(adminResult.items.length,3);assert.equal(adminResult.summary.ratings[0].count,2);
const bulk=[];for(let i=0;i<201;i++)bulk.push({sql:`INSERT INTO community_feedback(id,visitor,ip_hash,target,kind,rating,title,message,steps) VALUES(?,?,?,?,?,?,?,?,?)`,args:[crypto.randomUUID(),'fixture','test','launcher','feedback',5,'Test fixture','Only in temporary SQLite test database','']});query(bulk);
adminResult=await (await invoke('GET',null,auth)).json();assert.equal(adminResult.items.length,200);assert.equal(adminResult.total,204);assert.equal(adminResult.nextOffset,200);
query([{sql:`INSERT INTO community_feedback(id,visitor,ip_hash,target,kind,rating,title,message) VALUES(?,?,?,?,?,?,?,?)`,args:[crypto.randomUUID(),'fixture','test','helper','feedback',1,'New after snapshot','Snapshot exclusion test']}]);
const page2=await onRequest({env:{VISITS_DB:db},request:new Request('https://example.test/api/feedback?admin=1&offset=200&snapshot='+adminResult.snapshot,{headers:auth.headers})});const second=await page2.json();assert.equal(second.items.length,4);assert.equal(second.total,204);assert.equal(second.nextOffset,null);assert.equal(new Set([...adminResult.items,...second.items].map(r=>r.id)).size,204);

for(let i=0;i<3;i++)await invoke('POST',{...payload,id:crypto.randomUUID()},{headers:{Cookie:cookie}});
assert.equal((await invoke('POST',{...payload,id:crypto.randomUUID()},{headers:{Cookie:cookie}})).status,429);
assert.equal((await onRequest({request:new Request('https://example.test/api/feedback'),env:{}})).status,503);
console.log('Feedback: real SQLite persistence, latest rating per browser, averages, idempotency, validation, origin, rate limit, privacy and unavailable storage passed.');
})().finally(()=>fs.rmSync(dir,{recursive:true,force:true})).catch(e=>{console.error(e);process.exitCode=1});
