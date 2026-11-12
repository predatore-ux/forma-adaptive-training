/* Deterministic block planning. Pure functions are shared by preview and execution. */
const Programming=(()=>{
 const goals={strength:{name:'Strength',reps:[8,6,5,6],sets:[3,3,4,2],effort:[7,8,8,6]},
 hypertrophy:{name:'Muscle development',reps:[10,12,12,8],sets:[3,3,4,2],effort:[7,8,8,6]},
 conditioning:{name:'Conditioning',reps:[2,2,3,2],sets:[2,3,3,2],effort:[6,7,7,5]},
 return:{name:'Return to training',reps:[6,8,8,6],sets:[2,2,3,1],effort:[5,6,6,5]}};
 const entries=(p,events)=>events.filter(e=>e.kind==='session'&&e.programId===p.id).slice().sort((a,b)=>a.at-b.at);
 function cursor(p,events){const done=new Set(entries(p,events).filter(e=>e.complete).map(e=>e.index));let i=0;while(done.has(i))i++;return Math.min(i,p.frequency*4)}
 const tired=e=>e.pain>=4||e.feeling==='drained'||e.fatigue;
 function context(p,events,recovery,index=cursor(p,events)){
  const week=Math.min(3,Math.floor(index/p.frequency)),past=entries(p,events),recent=past.slice(-2);
  const fatigue=recent.length===2&&recent.every(e=>!e.deload&&tired(e));
  const joint=!!past.at(-1)&&past.at(-1).pain>=4&&!past.at(-1).deload;
  const deload=week===3||recovery||fatigue||joint;
  return {index,week,deload,reason:joint?'Joint feedback: use a recovery workload.':recovery?'Recovery signals: reduced workload today.':fatigue?'Two demanding sessions: reduce the next session.':week===3?'Week 4: planned deload.':'Week '+(week+1)+': '+['build a baseline','build capacity','consolidate progress'][week]+'.'};
 }
 function prescribe({program:p,events,logs,items,low,novice,index}){
  const c=context(p,events,low,index),g=goals[p.goal],ended=entries(p,events);
  return {context:c,items:items.map(item=>{
   const cardio=item.id.startsWith('9-'),week=c.deload?3:c.week;
   let target=cardio?(p.goal==='conditioning'?g.reps[week]:Math.min(item.target,2)):p.goal==='conditioning'?8:g.reps[week];
   let sets=g.sets[week],rpe=g.effort[week],kg=0,reason='Establish a comfortable starting load; no previous completed exposure.';
   if(novice){sets=Math.min(sets,2);rpe=Math.min(rpe,6)}
   const relevant=ended.filter(e=>!e.deload&&logs.some(l=>l.session===e.session&&l.id===item.id));
   const last=relevant.at(-1),previous=last?logs.filter(l=>l.session===last.session&&l.id===item.id):[];
   if(previous.length){
    const loads=previous.map(l=>l.kg);kg=Math.min(...loads);
    const hard=previous.some(l=>l.rpe>=9||l.rpe>(l.targetRpe||8)+1||l.velocityFast>0&&l.velocityLast>0&&l.velocityLast/l.velocityFast<.8)||tired(last);
    const achieved=previous.every(l=>l.reps>=(l.targetReps||target)&&l.rpe<=(l.targetRpe||rpe));
    if(hard){kg=Math.floor(kg*.935*2)/2;target=Math.max(cardio?1:5,target-(cardio?1:2));reason='Previous effort, velocity loss or joint feedback: reduce demand.'}
    else if(achieved&&last.complete&&!c.deload){
     // Do not increase load while the block is also increasing reps.
     const priorTarget=Math.max(...previous.map(l=>l.targetReps||l.reps));
     if(kg>0&&target<=priorTarget){kg=Math.round(kg*1.025*2)/2;reason='All prior targets met within effort: suggest 2.5% more load.'}
     else if(kg===0){target=Math.min(target+1,cardio?10:20);reason='Prior targets met: add one '+(cardio?'minute':'rep')+' per set.'}
     else reason='Prior targets met: build the new rep target at the same load.';
    }else reason='Repeat the established load and meet the target with controlled effort.';
   }
   if(c.deload){sets=Math.max(1,Math.round(g.sets[Math.min(c.week,2)]*.5));rpe=Math.min(rpe,6);kg=Math.floor(kg*.85*2)/2;reason=c.reason+' Keep effort at or below '+rpe+'/10.'}
   return {...item,target,sets,rpe,kg,reason};
  })};
 }
 return {goals,cursor,context,prescribe};
})();
