const sessionTypes = {
  strength: { name: 'Strength', icon: 'bar', image: 'hero' },
  cardio: { name: 'Cardio', icon: 'pulse', image: 'ropes' },
  crossfit: { name: 'CrossFit', icon: 'bolt', image: 'lift' },
  seated: { name: 'Seated', icon: 'layers', image: 'push' },
  recovery: { name: 'Recovery', icon: 'heart', image: 'hinge' }
};
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const additions = [
  ['0-4','Kettlebell swing','gym','CrossFit','Kettlebell',2,'Hinge, guide the bell between your legs, then stand tall to swing it to chest height.'],
  ['1-4','Dumbbell thruster','db','CrossFit','Dumbbells',2,'Hold the weights at your shoulders. Stand up from the squat and continue into an overhead press.'],
  ['1-5','Wall ball shot','gym','CrossFit','Medicine ball and wall',2,'Squat with the ball at your chest. Extend your legs and toss it toward the wall target, then catch and reset.'],
  ['2-4','Box step-up','gym','CrossFit','Stable box',1,'Plant your whole foot on the box. Step up, stand tall, and step down with control.'],
  ['3-4','Burpee','none','CrossFit','Bodyweight',2,'Place your hands down, step or jump back to a plank, lower and press up, then bring your feet in and stand.'],
  ['5-4','Dumbbell push press','db','CrossFit','Dumbbells',2,'Dip slightly at the knees, drive through your legs, and press the weights overhead.'],
  ['9-4','Jump rope','gym','Cardio','Skipping rope',2,'Turn the rope from your wrists and make a small hop as it passes beneath your feet.'],
  ['9-5','Rowing ergometer','gym','Cardio','Rowing machine',1,'Drive with your legs, lean back slightly, then pull the handle. Reverse that order to return.'],
  ['9-6','Shuttle run','none','Cardio','Clear floor space',2,'Run between two markers. Slow down before each turn and push off in the other direction.'],
  ['9-7','Step jack','none','Cardio','Bodyweight',0,'Step one foot out as your arms rise, return to center, then switch sides.'],
  ['9-8','High knees','none','Cardio','Bodyweight',2,'Alternate knee lifts and opposite-arm drives. Land lightly below your hips.'],
  ['9-9','Elliptical trainer','gym','Cardio','Elliptical machine',0,'Keep your feet on the pedals and follow their oval path as the handles travel back and forth.']
];
for (const [id,name,gear,category,equipment,demand,cue] of additions) {
  const p = Number(id.split('-')[0]);
  catalog.push({id,name,p,gear,category,equipment,demand,cue,seated:false,
    axial: p !== 9 && demand > 0 ? 2 : 0, shear:demand,flex:[1,5].includes(p)?2:0,
    regression:p+'-2',progression:p+'-0'});
}
const plans = [];
function plan(id, type, level, name, duration, sets, effort, movements) {
  plans.push({id,type,level,name,duration,sets,effort,slots:movements.map(([id,target,kg=0])=>({
    p:Number(id.split('-')[0]),preferred:id,target,kg
  }))});
}
plan('first-strength','strength',0,'Strength foundations','20–25',2,6,[['1-2',8],['3-2',6],['0-2',8],['4-2',8]]);
plan('full-strength','strength',1,'Full body strength','45–55',3,8,[['0-0',8,60],['3-0',8,30],['1-0',8,40],['4-0',10,25],['7-0',12,16]]);
plan('heavy-strength','strength',2,'Compound strength','45–60',4,8,[['1-0',5,40],['3-0',6,30],['0-0',5,60],['4-0',8,25]]);
plan('steady-start','cardio',0,'Easy aerobic intervals','15–20',2,5,[['9-1',3],['9-7',1],['9-2',2]]);
plan('cardio-mix','cardio',1,'Engine builder','25–35',3,7,[['9-5',2],['9-4',1],['9-9',3]]);
plan('pace-work','cardio',2,'Pace intervals','30–40',4,8,[['9-6',1],['9-5',2],['9-8',1],['9-0',2]]);
plan('crossfit-basics','crossfit',0,'CrossFit foundations','18–25',2,6,[['2-4',6],['1-1',8],['3-2',6],['9-1',2]]);
plan('mixed-conditioning','crossfit',1,'Mixed conditioning','25–35',3,7,[['0-4',10],['1-4',6],['9-5',2],['2-4',8]]);
plan('power-conditioning','crossfit',2,'Power conditioning','30–40',4,8,[['1-5',10],['3-4',6],['5-4',8],['9-4',1]]);
plan('seated-basics','seated',0,'Seated foundations','15–20',2,5,[['4-3',8],['3-3',6],['9-3',1]]);
plan('seated-strength','seated',1,'Seated strength','20–30',3,6,[['4-3',10],['3-3',8],['8-3',8],['9-3',2]]);
plan('seated-capacity','seated',2,'Seated work capacity','25–35',4,7,[['4-3',12],['3-3',10],['8-3',10],['9-3',2]]);
plan('easy-reset','recovery',0,'Gentle reset','10–15',1,4,[['9-1',3],['0-2',6],['8-2',6]]);
plan('active-reset','recovery',1,'Active recovery','15–20',2,5,[['9-0',3],['0-2',8],['4-3',8]]);
plan('recovery-flow','recovery',2,'Recovery flow','20–25',2,5,[['9-9',4],['8-2',8],['0-2',10],['9-1',2]]);
function defaultLevel(){return state.experience==='Trained'?1:0}
function currentPlan(){
  return plans.find(p=>p.id===state.planId)||plans.find(p=>p.level===defaultLevel()&&p.type===({Seated:'seated',Endurance:'cardio'}[state.track]||'strength'));
}
function equipment(e){return e.equipment||({gym:'Gym equipment',db:'Dumbbell',none:'Bodyweight'})[e.gear]}
function eligible(e, seatedOnly){
  if(seatedOnly&&!e.seated)return false;
  if(state.gear!=='Full gym'&&e.gear==='gym')return false;
  if(state.gear==='Bodyweight only'&&e.gear==='db')return false;
  const gentle=rules().low||state.experience==='Return to training';
  if(gentle&&(e.axial||e.demand>0))return false;
  if(state.experience==='New to training'&&e.demand>1)return false;
  if(state.joint==='Limited knee'&&(e.demand>0||([1,2].includes(e.p)&&e.axial)))return false;
  if(state.joint==='Limited shoulder or wrist'&&((e.demand&&e.p!==2)||['3-0','5-0'].includes(e.id)))return false;
  return !(state.limbs==='Long femurs'&&e.id==='1-0');
}
function resolvedItems(plan){
  const seated=state.track==='Seated'||plan.type==='seated';
  const used=new Set();
  return plan.slots.map(slot=>{
    let candidates=catalog.filter(e=>e.p===slot.p&&eligible(e,seated));
    if(seated&&(![3,4,5,6,7,8,9].includes(slot.p)||!candidates.some(e=>!used.has(e.id)))){
      candidates=catalog.filter(e=>[3,4,8,9].includes(e.p)&&e.seated&&eligible(e,true)&&!used.has(e.id));
    }
    if(!candidates.length)candidates=catalog.filter(e=>e.seated&&eligible(e,true)&&[3,4,8,9].includes(e.p));
    let movement=candidates.find(e=>e.id===slot.preferred&&!used.has(e.id));
    if(!movement&&slot.p===1&&rules().low)movement=candidates.find(e=>e.id==='1-3');
    movement ||= candidates.find(e=>!used.has(e.id)&&state.experience!=='Trained'&&e.gear==='none');
    movement ||= candidates.find(e=>!used.has(e.id))||candidates[0];
    used.add(movement.id);
    const low=rules().low;
    const learned=state.logs.filter(l=>l.id===movement.id).at(-1)?.kg;
    const baseline=state.experience==='Trained'&&movement.gear!=='none'?(learned??(movement.id===slot.preferred?slot.kg:0)):0;
    return {id:movement.id,preferred:slot.preferred,target:movement.p===9&&slot.p!==9?1:movement.p!==9&&slot.p===9?8:slot.target,
      sets:low?Math.max(1,Math.round(plan.sets*.6)):plan.sets,
      rpe:Math.min(plan.effort,low||state.experience!=='Trained'?6:8),
      kg:Math.round(baseline*(plan.type==='recovery'?1:rules().scale)*2)/2};
  });
}
function workload(item){return item.sets+' × '+item.target+' '+(catalog.find(e=>e.id===item.id).p===9?'min':'reps')}
function newSession(plan=currentPlan()){
  state.phase='Evaluated';
  const items=resolvedItems(plan);
  state.phase='Modulated';
  state.session={id:crypto.randomUUID(),planId:plan.id,low:rules().low,i:0,n:1,end:0,start:Date.now(),items};
  state.phase='In-Workout';persist();
}
