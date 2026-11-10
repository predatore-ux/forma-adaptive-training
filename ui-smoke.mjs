import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
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
}finally{ws?.close();chrome.kill();server.kill();await delay(300);await rm(dir,{recursive:true,force:true,maxRetries:6,retryDelay:300})}
