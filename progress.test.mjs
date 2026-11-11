import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const P=vm.runInNewContext(readFileSync('dist/progress.js','utf8')+';Progress',{Date,Map,Set});
const now=+new Date(2026,10,11,12),get=id=>({p:Number(id.split('-')[0]),name:id});
test('weekly load excludes cardio; first marks are not PR improvements; sessions deduplicate',()=>{
 const logs=[
 {id:'0-0',session:'a',at:now-14*86400000,kg:40,reps:5},
 {id:'0-0',session:'b',at:now,kg:50,reps:5},
 {id:'0-0',session:'b',at:now+1,kg:999,reps:5},
 {id:'9-0',session:'b',at:now,kg:10,reps:20}];
 const m=P.analyze(logs,now,8,get),w=m.weeks.at(-1);
 assert.equal(w.sets,1);assert.equal(w.volume,250);assert.equal(w.minutes,20);assert.equal(w.prs,1);assert.equal(m.sessions,2);
 assert.equal(m.weeks.length,8);assert.equal(m.weeks[0].volume,0);
});
test('a record outside the filter remains the baseline; same-load sets do not earn another PR',()=>{
 const m=P.analyze([{id:'0-0',session:'a',at:now-70*86400000,kg:100,reps:3},{id:'0-0',session:'b',at:now,kg:100,reps:5}],now,8,get);
 assert.equal(m.records.length,0);assert.equal(m.weeks.at(-1).prs,0);
});
test('estimates exclude endurance, carries, ballistic work, unloaded and high-rep sets',()=>{
 assert.equal(P.estimate({id:'0-0',kg:100,reps:6}),120);
 assert.equal(P.estimate({id:'0-0',kg:100,reps:1}),100);
 for(const id of ['9-0','7-0','0-4','1-4','3-4'])assert.equal(P.estimate({id,kg:100,reps:6}),null);
 assert.equal(P.estimate({id:'0-0',kg:100,reps:11}),null);
 assert.equal(P.estimate({id:'0-0',kg:0,reps:6}),null);
});
test('weeks use local Monday midnight',()=>{
 const d=new Date(P.monday(now));assert.equal(d.getDay(),1);assert.equal(d.getHours(),0);
 assert.equal(P.day(+new Date(2026,0,1,23)),'2026-01-01');
});
