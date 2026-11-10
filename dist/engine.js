const patterns=['Hinge','Squat','Lunge','Horizontal push','Horizontal pull','Vertical push','Vertical pull','Carry','Rotation','Endurance'];
const groups=[
['Barbell deadlift','Dumbbell Romanian deadlift','Glute bridge','Seated hip hinge'],
['Barbell back squat','Goblet squat','Chair squat','Supported leg press'],
['Reverse lunge','Dumbbell split squat','Supported split squat','Seated knee extension'],
['Barbell bench press','Dumbbell floor press','Incline push-up','Seated palm press'],
['Chest-supported row','Dumbbell row','Prone W raise','Seated scapular squeeze'],
['Landmine press','Neutral-grip dumbbell press','Incline wall press','Seated overhead reach'],
['Lat pulldown','Dumbbell pullover','Prone lat sweep','Seated lat contraction'],
['Farmer carry','Suitcase carry','March in place','Seated loaded hold'],
['Cable rotation','Dumbbell chop','Standing torso turn','Seated torso turn'],
['Stationary bike','Brisk walk','Easy march','Seated rhythmic reach']];
const images=['hinge','lift','lift','push','lift','lift','lift','lift','ropes','ropes'];
const cues=['Move your hips back, keeping the load close.','Keep your feet planted and lower with control.','Use a stable support and a comfortable stride.','Keep wrists aligned and use a comfortable pressing range.','Draw elbows back without lifting your shoulders.','Press within a comfortable overhead range.','Draw the upper arms down with control.','Stay tall and breathe evenly.','Rotate slowly within your comfortable range.','Maintain a steady pace and relaxed breathing.'];
function equalitySeated(p,j){return j===0&&[4,6,9].includes(p)}
const catalog=groups.flatMap((names,p)=>names.map((name,j)=>({id:p+'-'+j,name,p,gear:(p===1&&j===3)||j===0?'gym':(p===7&&j===3)||j===1&&p!==9?'db':'none',axial:j<2&&[0,1,2,7].includes(p)?2:0,shear:[1,2].includes(p)?2:1,flex:[5,6].includes(p)?2:0,seated:j===3||equalitySeated(p,j),regression:p+'-'+Math.min(3,j+1),progression:p+'-'+Math.max(0,j-1)})));
const defaultSlots=[{p:0,kg:60},{p:3,kg:30},{p:1,kg:40},{p:4,kg:25},{p:7,kg:16}];
const initial={name:'Jordan Davis',gear:'Full gym',mode:'Advanced',limbs:'Balanced',joint:'Unrestricted',track:'Strength',experience:'Trained',injury:'',rest:120,energy:8,pain:1,stress:2,bio:{hrv:64,base:54,sd:8,rhr:52,sleep:7.7},sample:true,phase:'Baseline',logs:[],session:null};
let state;try{state={...initial,...JSON.parse(localStorage.getItem('forma.v1')||'{}')}}catch{state=structuredClone(initial)}
let db;const opened=new Promise(resolve=>{const r=indexedDB.open('forma-training',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots');r.onsuccess=()=>{db=r.result;resolve(db)};r.onerror=()=>resolve(null)});
function persist(){state.modified=Date.now();localStorage.setItem('forma.v1',JSON.stringify(state));opened.then(d=>{if(d)d.transaction('snapshots','readwrite').objectStore('snapshots').put(structuredClone(state),'current')})}
function rules(){const b=state.bio,z=(b.hrv-b.base)/Math.max(1,b.sd),low=z< -1.5||state.pain>=7||state.energy<=3,high=!low&&z>1&&state.pain<=3&&state.energy>=6&&state.stress<7;return{low,high,score:Math.max(5,Math.min(99,Math.round(57+state.energy*3-state.pain*2-state.stress*2+z*6+(b.sleep-7)*4))),sets:low?2:3,rpe:low?6:8,scale:low?.8:high?1.025:1}}

function options(p) {
  const plan = plans.find(plan => plan.id === state.session?.planId);
  const seatedOnly = state.track === 'Seated' || plan?.type === 'seated';
  return catalog.filter(exercise => exercise.p === p && eligible(exercise, seatedOnly));
}
