import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const P=vm.runInNewContext(readFileSync('dist/programming.js','utf8')+';Programming');
const program={id:'p',goal:'strength',frequency:2};
const event=(index,extra={})=>({kind:'session',programId:'p',session:'s'+index,index,at:index+1,complete:true,deload:false,pain:0,feeling:'steady',fatigue:false,...extra});
const items=[{id:'0-0',target:8,sets:3,rpe:8,kg:100}];
const logs=[{id:'0-0',session:'s0',kg:100,reps:8,targetReps:8,targetRpe:7,rpe:7}];
const prescribe=(extra={})=>P.prescribe({program,events:[event(0)],logs,items,low:false,novice:false,...extra});
test('only sequential completed slots advance; duplicate device completions count once',()=>{
 assert.equal(P.cursor(program,[event(0),event(0),event(1,{complete:false}),event(2)]),1);
 assert.equal(P.cursor(program,[event(0),event(1),event(2)]),3);
});
test('achieved targets increase load; high effort and velocity loss reduce it',()=>{
 assert.equal(prescribe().items[0].kg,102.5);
 assert.equal(prescribe({logs:[{...logs[0],rpe:9.5}]}).items[0].kg,93.5);
 assert.equal(prescribe({logs:[{...logs[0],velocityFast:1,velocityLast:.7}]}).items[0].kg,93.5);
});
test('no transfer to new variations, no progression from partial sessions or missed targets',()=>{
 assert.equal(prescribe({items:[{...items[0],id:'0-1'}]}).items[0].kg,0);
 assert.equal(prescribe({events:[event(0,{complete:false})]}).items[0].kg,100);
 assert.equal(prescribe({logs:[{...logs[0],reps:4}]}).items[0].kg,100);
});
test('scheduled, recovery, joint and repeated fatigue deloads cap effort and reduce volume',()=>{
 for(const extra of [{index:6},{low:true},{events:[event(0,{pain:5})]},{events:[event(0,{fatigue:true}),event(1,{feeling:'drained'})]}]){
  const r=prescribe(extra);assert.equal(r.context.deload,true);assert.ok(r.items[0].rpe<=6);assert.ok(r.items[0].sets<=2);
 }
 assert.equal(P.context(program,[event(0,{fatigue:true}),event(1,{deload:true})],false).deload,false);
});
test('goals differ, novice limits apply and a block ends after four weeks',()=>{
 const h=prescribe({program:{...program,goal:'hypertrophy'}});assert.equal(h.items[0].target,10);assert.equal(h.items[0].kg,100);
 const n=prescribe({novice:true,index:4});assert.ok(n.items[0].sets<=2);assert.ok(n.items[0].rpe<=6);
 assert.equal(P.cursor(program,Array.from({length:8},(_,i)=>event(i))),8);
 const r=prescribe({program:{...program,goal:'return'},events:[]});assert.equal(r.items[0].rpe,5);
});
