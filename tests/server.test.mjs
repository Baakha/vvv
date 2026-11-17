import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
await mkdir('.sites-runtime/test',{recursive:true});
const state={identity:null,rows:[],recent:0};globalThis.__qa=state;
const mocks={
 'cloudflare:workers':`export const env={ADMIN_EMAILS:'owner@example.test'};`,
 'next/headers':`export async function headers(){return new Headers(globalThis.__qa.identity||{})}`,
 'next/navigation':`export function redirect(){throw Error('redirect')}`,
 'database':`export function getDb(){return {select(fields){return {from(){return {where(){const rows=fields?.n?[{n:globalThis.__qa.recent}]:globalThis.__qa.rows;return Object.assign(Promise.resolve(rows),{limit:async()=>rows});},orderBy(){return {limit:async()=>globalThis.__qa.rows}}}}}},insert(){return {values(row){return {async onConflictDoNothing(){globalThis.__qa.rows.push(row)}}}}},update(){return {set(values){return {where(){return {async returning(){if(globalThis.__qa.rows.length){Object.assign(globalThis.__qa.rows[0],values);return [{id:globalThis.__qa.rows[0].id}]}return []}}}}}}}}}`
};
async function bundle(name,input){const out=`.sites-runtime/test/${name}.mjs`;await build({entryPoints:[input],outfile:out,bundle:true,platform:'node',format:'esm',plugins:[{name:'mocks',setup(b){b.onResolve({filter:/^(cloudflare:workers|next\/headers|next\/navigation)$/},a=>({path:a.path,namespace:'mock'}));b.onResolve({filter:/^\.\.\/\.\.\/\.\.\/db$/},()=>({path:'database',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}))}}]});return import(pathToFileURL(process.cwd()+'/'+out));}
const leads=await bundle('leads','app/api/leads/route.ts');const admin=await bundle('admin','app/api/admin/route.ts');
function req(data,origin='https://example.test',method='POST'){return new Request('https://example.test/api/leads',{method,headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)})}
assert.equal((await admin.GET()).status,403);console.log('PASS anonymous admin denied');
state.identity={'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@example.test'};assert.equal((await admin.GET()).status,403);console.log('PASS non-admin identity denied');
assert.equal((await leads.POST(req({},'https://evil.test'))).status,403);console.log('PASS cross-origin submission denied');
assert.equal((await leads.POST(req({}))).status,400);console.log('PASS invalid form denied');
const data={id:crypto.randomUUID(),name:'QA test',phone:'+70000000000',destination:'australia',purpose:'tourism',language:'kk',consent:true,consentVersion:'2026-11-16-v2-draft',website:'',source:'qa'};
assert.equal((await leads.POST(req({...data,consent:false}))).status,400);assert.equal((await leads.POST(req({...data,website:'spam'}))).status,400);assert.equal((await leads.POST(req({...data,consentVersion:'old'}))).status,400);console.log('PASS consent version and honeypot validation');
assert.equal((await leads.POST(req(data))).status,201);assert.equal(state.rows.length,1);assert.ok(state.rows[0].consentAt>0);assert.ok(state.rows[0].consentText.includes('VisaWorld'));console.log('PASS lead and consent evidence insert');assert.equal((await leads.POST(req(data))).status,200);assert.equal(state.rows.length,1);console.log('PASS duplicate retry idempotent');
state.identity={'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.test'};let response=await admin.GET();assert.equal(response.status,200);assert.equal((await response.json()).leads[0].id,data.id);console.log('PASS allowed admin read');
response=await admin.PATCH(req({id:data.id,status:'working',note:'checked'},'https://example.test','PATCH'));assert.equal(response.status,200);assert.equal(state.rows[0].status,'working');console.log('PASS status and note update');
assert.equal((await admin.PATCH(req({id:data.id,status:'hacked',note:''},'https://example.test','PATCH'))).status,400);assert.equal((await admin.PATCH(req({id:data.id,status:'closed',note:''},'https://evil.test','PATCH'))).status,403);console.log('PASS invalid status and cross-origin update denied');
state.rows=[];state.recent=3;assert.equal((await leads.POST(req({...data,id:crypto.randomUUID()}))).status,429);console.log('PASS repeated-phone rate limit');
