import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import net from 'node:net';
import {once} from 'node:events';
const delay=n=>new Promise(r=>setTimeout(r,n));
const dir=await mkdtemp(join(tmpdir(),'forma-ui-')), sock=net.createServer().listen(0,'127.0.0.1');await once(sock,'listening');const port=sock.address().port;await new Promise(r=>sock.close(r));
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),FORMA_DATA_DIR:dir},windowsHide:true});
const chrome=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+dir,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;
try{
 let debug;for(let n=0;n<100&&!debug;n++){try{debug=(await readFile(join(dir,'DevToolsActivePort'),'utf8')).split('\n')[0]}catch{await delay(100)}}
 const targets=await fetch('http://127.0.0.1:'+debug+'/json/list').then(r=>r.json());
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let seq=0;const handlers=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);handlers.get(m.id)?.(m)};
 const cmd=(method,params={})=>new Promise(r=>{const id=++seq;handlers.set(id,r);ws.send(JSON.stringify({id,method,params}))});
 const run=async expression=>{const m=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(m.result.exceptionDetails)throw Error(m.result.exceptionDetails.exception.description);return m.result.result.value};
 await cmd('Page.navigate',{url:'http://127.0.0.1:'+port});const until=async exp=>{for(let i=0;i<80;i++){if(await run(exp))return;await delay(100)}throw Error('Timeout: '+exp)};
 await until("document.querySelector('#nav')?.children.length>0");
 await run("document.querySelector('.avatar').click();document.querySelector('[data-act=auth-register]').click();document.querySelector('#acct-name').value='browser.test';document.querySelector('#acct-password').value='long browser password';document.querySelector('#account-form').requestSubmit()");
 await until("!!document.querySelector('#recovery-secret')");
 await run("document.querySelector('[data-act=account].primary').click();document.querySelector('[data-act=account-logout]').click()");
 await until("!!document.querySelector('[data-act=auth-register]')");
 await run("document.querySelector('[data-act=auth-login]').click();document.querySelector('#acct-name').value='browser.test';document.querySelector('#acct-password').value='long browser password';document.querySelector('#account-form').requestSubmit()");
 await until("!!document.querySelector('[data-act=account-sync]')");assert.match(await run("document.querySelector('#modal').innerText"),/Up to date/);console.log('Browser: registration, recovery code, logout, sign-in and sync status passed.');
 await run("dialog.close();navigate('activity')");
 assert.match(await run("main.innerText"),/No sets logged/);
 await run("document.querySelector('[data-act=measure-body]').click();document.querySelector('#body-weight').value='75.5';document.querySelector('#body-form').requestSubmit()");
 assert.match(await run("main.innerText"),/75.5/);
 await run("document.querySelector('[data-act=check]').click();document.querySelector('#checkform').requestSubmit()");
 assert.equal(await run("state.observations.length"),2);
 await run("state.logs=[{session:'one',id:'0-0',kg:60,reps:5,rpe:8,at:Date.now()-7*86400000},{session:'two',id:'0-0',kg:65,reps:5,rpe:8,at:Date.now()-1000},{session:'two',id:'9-0',kg:0,reps:12,rpe:6,at:Date.now()}];persist();render()");
 assert.match(await run("main.innerText"),/Barbell deadlift/);
 await run("document.querySelector('#activity-measure').value='minutes';document.querySelector('#activity-measure').dispatchEvent(new Event('change',{bubbles:true}))");
 assert.equal(await run("activityMeasure"),'minutes');
 await run("syncAccount()");await cmd('Page.reload');await until("document.querySelector('#activity-range')");
 assert.equal(await run("state.logs.length"),3);
 assert.match(await run("main.innerText"),/\+5 kg/);
 assert.equal(await run("state.observations.length"),2);
 await cmd('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await run("document.documentElement.scrollWidth<=window.innerWidth"),true);
 await run("document.querySelector('#recovery-metric').value='hrv';document.querySelector('#recovery-metric').dispatchEvent(new Event('change',{bubbles:true}))");
 assert.equal(await run("recoveryMetric"),'hrv');
 if(process.env.FORMA_SCREENSHOT){const capture=await cmd('Page.captureScreenshot',{captureBeyondViewport:true});await writeFile(process.env.FORMA_SCREENSHOT,Buffer.from(capture.result.data,'base64'))}

 await cmd('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 if(process.env.FORMA_SCREENSHOT){const shot=await cmd('Page.captureScreenshot',{captureBeyondViewport:true});await writeFile(process.env.FORMA_SCREENSHOT+'.desktop.png',Buffer.from(shot.result.data,'base64'))}
 for(const target of ['overview','recommended','library']){
  await run("navigate('"+target+"')");
  assert.equal(await run("document.documentElement.scrollWidth<=window.innerWidth"),true);
  assert.ok(await run("main.innerText.length>100"));
 }
 await run("navigate('overview')");
 if(process.env.FORMA_SCREENSHOT){const shot=await cmd('Page.captureScreenshot',{captureBeyondViewport:true});await writeFile(process.env.FORMA_SCREENSHOT+'.overview.png',Buffer.from(shot.result.data,'base64'))}
 console.log('App: overview, recommendations and library layout checks passed.');
 console.log('Activity: empty state, measurements, check-in, loaded charts, filters, reload and 390px layout passed.');

 await run("navigate('program');document.querySelector('[data-act=program-create]').click();document.querySelector('#program-form').requestSubmit()");
 assert.equal(await run("state.program.goal"),'strength');
 await run("document.querySelector('[data-act=program-start]').click()");
 assert.equal(await run("state.session.programIndex"),0);
 // Submit actual set forms through the browser, including the automatic final review.
 for(let i=0;i<30;i++){
  if(await run("!!document.querySelector('#program-review')"))break;
  await run("document.querySelector('#kg').value='20';document.querySelector('#effort').value=state.session.items[state.session.i].rpe;document.querySelector('#logform').requestSubmit()");
  await delay(15);
 }
 assert.equal(await run("document.querySelector('#program-review')?.dataset.complete"),'true');
 await run("document.querySelector('#program-review').requestSubmit()");
 assert.equal(await run("programState().index"),1);
 assert.equal(await run("resolvedItems(plans.find(p=>p.id===state.program.planId))[0].kg"),20.5);
 await run("document.querySelector('[data-act=program-start]').click();document.querySelector('#logform').requestSubmit();if(dialog.open)dialog.close();document.querySelector('[data-act=finish]').click();document.querySelector('[data-act=finish-now]').click();document.querySelector('#session-pain').value='5';document.querySelector('#program-review').requestSubmit()");
 assert.equal(await run("programState().index"),1);assert.equal(await run("programState().deload"),true);
 await run("syncAccount()");await cmd('Page.reload');await until("main.innerText.includes('Next session')");
 assert.equal(await run("programState().index"),1);
 assert.equal(await run("state.observations.filter(e=>e.kind==='session').length"),2);
 await cmd('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await run("document.documentElement.scrollWidth<=window.innerWidth"),true);
 if(process.env.FORMA_SCREENSHOT){const shot=await cmd('Page.captureScreenshot',{captureBeyondViewport:true});await writeFile(process.env.FORMA_SCREENSHOT+'.program.png',Buffer.from(shot.result.data,'base64'))}
 await run("document.querySelector('[data-act=program-create]').click();document.querySelector('#program-goal').value='return';document.querySelector('#program-form').requestSubmit()");
 assert.equal(await run("state.program.frequency"),2);
 assert.equal(await run("resolvedItems(plans.find(p=>p.id===state.program.planId)).every(i=>!lookup(i.id).axial&&i.rpe<=6)"),true);
 console.log('Program: create, complete actual sets, progress load, partial finish, joint deload, sync, reload and mobile passed.');

}finally{ws?.close();chrome.kill();server.kill();await delay(300);await rm(dir,{recursive:true,force:true,maxRetries:6,retryDelay:300})}
