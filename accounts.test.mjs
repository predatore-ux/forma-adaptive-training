import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import net from 'node:net';
test('account continuity, isolation, concurrent offline edits, restart and recovery',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'forma-test-')),socket=net.createServer();
 socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
 const origin='http://127.0.0.1:'+port;let child;
 async function start(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,HOST:'127.0.0.1',PORT:String(port),FORMA_DATA_DIR:dir},stdio:'inherit'});for(let n=0;n<100;n++){if(await fetch(origin+'/api/status').catch(()=>null))return;await new Promise(r=>setTimeout(r,40))}throw Error('Server did not start')}
 async function stop(){if(child&&child.exitCode===null){const closed=once(child,'exit');child.kill();await closed}}
 t.after(async()=>{await stop();await rm(dir,{recursive:true,force:true})});await start();
 async function call(route,body,device={}){const r=await fetch(origin+'/api/account/'+route,{method:body?'POST':'GET',headers:{cookie:device.cookie||'','x-forma-owner':device.id||'','x-forma-request':'1'},body:body&&JSON.stringify(body)});return {status:r.status,...await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
 const auth={username:'athlete.1',password:'a private test phrase'};
 const a=await call('register',auth),b=await call('login',auth),other=await call('register',{...auth,username:'athlete.2'});
 assert.equal(a.status,200);assert.equal(b.id,a.id);assert.notEqual(b.cookie,a.cookie);
 assert.equal((await call('sync',null,{...b,id:other.id})).status,401);
 const log={id:'0-0',kg:45,reps:6,at:10,session:'workout'};
 const save=(dev,changes,logs=[])=>call('sync',{changes,logs},dev);
 await save(a,[{key:'gear',value:'Garage gym',base:0},{key:'session',value:{id:'workout'},base:0}],[log]);
 assert.equal((await call('sync',null,b)).logs.length,1);
 await save(a,[{key:'gear',base:1,value:'Hotel gym'}]);
 const merged=await save(b,[{key:'gear',base:1,value:'Full gym'},{key:'pain',base:0,value:4}],[log,{...log,at:11}]);
 assert.equal(merged.logs.length,2);assert.equal(merged.fields.find(f=>f.key==='gear').value,'Hotel gym');assert.equal(merged.fields.find(f=>f.key==='pain').value,4);

 const eventA={uid:'11111111-1111-1111-1111-111111111111',at:Date.now(),kind:'body',weight:75};
 const eventB={uid:'22222222-2222-2222-2222-222222222222',at:Date.now(),kind:'readiness',score:76};
 await call('sync',{changes:[],logs:[],observations:[eventA]},a);
 const progress=await call('sync',{changes:[],logs:[],observations:[eventA,eventB]},b);
 assert.equal(progress.observations.length,2);
 assert.equal((await call('sync',null,other)).observations.length,0);
 assert.equal((await call('sync',{changes:[],logs:[],observations:[{...eventA,weight:-2}]},a)).status,400);
 const backup=join(dir,'backup.sqlite');execFileSync(process.execPath,['backup.mjs',backup],{env:{...process.env,FORMA_DATA_DIR:dir}});
 const restored=new DatabaseSync(backup,{readOnly:true});assert.equal(restored.prepare("SELECT COUNT(*) AS n FROM records WHERE kind='set'").get().n,2);restored.close();
 await stop();await start();assert.equal((await call('sync',null,b)).logs.length,2);assert.equal((await call('sync',null,b)).observations.length,2);
 assert.deepEqual((await call('sync',null,other)).logs,[]);await call('logout',{},a);assert.equal((await call('sync',null,a)).status,401);assert.equal((await call('sync',null,b)).status,200);
 const reset=await call('recover',{...auth,password:'a different secret phrase',code:a.recoveryCode});assert.equal(reset.status,200);assert.equal((await call('sync',null,b)).status,401);assert.equal((await call('login',auth)).status,401);assert.equal((await call('sync',null,reset)).logs.length,2);
});
