let activityWeeks=8,activityMeasure='sets',activityPattern=null,activityLift=null,bodyMetric='weight',recoveryMetric='score';
const fmtProgress=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:1});
const shortDate=n=>new Date(n).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const longDate=n=>new Date(n).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
const bodyFields={weight:['Weight','kg',650],waist:['Waist','cm',400],hip:['Hips','cm',400],chest:['Chest','cm',400]};
function progressSelect(id,label,options,selected){return '<label class="progress-select">'+label+'<select id="'+id+'">'+options.map(([k,v])=>'<option value="'+esc(k)+'" '+(String(k)===String(selected)?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>'}
function graph(points,unit,bar=false){
 if(!points.length)return '<p class="empty">No entries in this period.</p>';
 const max=Math.max(...points.map(p=>p.v),1),min=bar?0:Math.max(0,Math.min(...points.map(p=>p.v))-Math.max(1,max*.03));
 const a=points[0].at,b=points.at(-1).at,xy=points.map(p=>[b===a?160:12+296*(p.at-a)/(b-a),76-66*(p.v-min)/(max-min||1)]);
 const coord=xy.map(p=>p.join(',')).join(' '),w=Math.min(16,180/points.length);
 const svg=bar?xy.map(([x,y])=>'<rect x="'+(x-w/2)+'" y="'+y+'" width="'+w+'" height="'+(76-y)+'" rx="2"/>').join(''):'<polyline fill="none" stroke="currentColor" stroke-width="2" points="'+coord+'"/>'+xy.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="3"/>').join('');
 return '<div class="progress-plot"><small>'+fmtProgress(max)+' '+unit+'</small><svg aria-hidden="true" viewBox="0 0 320 82" preserveAspectRatio="none"><path d="M0 10H320 M0 43H320 M0 76H320" stroke="#dbe4da" fill="none"/>'+svg+'</svg><small>'+fmtProgress(min)+' '+unit+'</small><div><span>'+shortDate(a)+'</span><span>'+shortDate(b)+'</span></div></div><details><summary>View chart values</summary><table><thead><tr><th>Date</th><th>'+unit+'</th></tr></thead><tbody>'+points.map(p=>'<tr><td>'+longDate(p.at)+'</td><td>'+fmtProgress(p.v)+'</td></tr>').join('')+'</tbody></table></details>';
}
const section=(title,sub,content)=>'<section class="card"><h2>'+icon(({'Training by week':'bar','Strength curve':'arrow','Personal records':'bolt','Volume landmarks':'layers','Readiness trend':'pulse','Body measurements':'sliders'})[title])+' '+title+'</h2><p>'+sub+'</p>'+content+'</section>';
function latestDaily(events,value){
 const map=new Map();for(const e of events){const v=value(e);if(Number.isFinite(v))map.set(Progress.day(e.at),{at:e.at,v})}return [...map.values()];
}
function activity(){
 const now=Date.now(),m=Progress.analyze(state.logs,now,activityWeeks,lookup),weeks=m.weeks,last=weeks.at(-1),events=(state.observations||[]).filter(e=>e.at>=weeks[0].at&&e.at<=now).slice().sort((a,b)=>a.at-b.at);
 const metrics={sets:['Working sets','sets'],volume:['Load × reps','kg'],minutes:['Cardio time','min'],prs:['New records','PRs'],sessions:['Sessions logged','sessions']};
 const weekly=progressSelect('activity-measure','Show',Object.entries(metrics).map(([k,v])=>[k,v[0]]),activityMeasure)+graph(weeks.map(w=>({at:w.at,v:activityMeasure==='sessions'?w.sessions.size:w[activityMeasure]})),metrics[activityMeasure][1],true);
 const weighted=m.entries.filter(l=>Progress.estimate(l)!==null),ids=[...new Set(weighted.map(l=>l.id))],pats=[...new Set(ids.map(id=>lookup(id).p))];
 if(!pats.includes(activityPattern))activityPattern=pats[0];const variants=ids.filter(id=>lookup(id).p===activityPattern);
 if(!variants.includes(activityLift))activityLift=variants[0];
 const peak=new Map();for(const l of weighted.filter(l=>l.id===activityLift)){const k=Progress.day(l.at),v=Progress.estimate(l);if(!peak.has(k)||v>peak.get(k).v)peak.set(k,{at:l.at,v})}
 const strength=ids.length?progressSelect('activity-pattern','Movement pattern',pats.map(p=>[p,patterns[p]]),activityPattern)+progressSelect('activity-lift','Movement',variants.map(id=>[id,lookup(id).name]),activityLift)+graph([...peak.values()],'kg'):'<p class="empty">Log a loaded strength lift for 1–10 reps to start a curve.</p>';
 const records=m.records.slice().reverse(),rec=records.map(r=>'<tr><td>'+esc(r.name)+'<small>'+longDate(r.at)+'</small></td><td>'+fmtProgress(r.value)+' '+r.metric+'</td><td><span class="record-change">'+(r.prev===undefined?'First mark':'+'+fmtProgress(r.value-r.prev)+' '+r.metric)+'</span></td></tr>').join('');
 const landmarks=Array.from(new Set(weeks.flatMap(w=>Object.keys(w.patterns)))).map(p=>{const historic=weeks.slice(-5,-1).map(w=>w.patterns[p]||0);return '<tr><td>'+patterns[p]+'</td><td>'+(last.patterns[p]||0)+'</td><td>'+Math.min(...historic)+'–'+Math.max(...historic)+'</td></tr>'}).join('');
 const recoveryFields={score:['Readiness','/100'],energy:['Energy','/10'],stress:['Stress','/10'],pain:['Joint soreness','/10'],hrv:['HRV','ms'],rhr:['Resting heart rate','bpm'],sleep:['Sleep','hours']};
 const readiness=latestDaily(events.filter(e=>e.kind==='readiness'),e=>e[recoveryMetric]);
 const measurements=latestDaily(events.filter(e=>e.kind==='body'),e=>e[bodyMetric]);
 return heading('Training activity','See what is changing in your training.')+'<div class="progress-head">'+progressSelect('activity-range','Period',[[8,'Last 8 weeks'],[12,'Last 12 weeks'],[26,'Last 26 weeks'],[52,'Last 52 weeks']],activityWeeks)+action('account','Account &amp; backup')+'</div><div class="progress-summary"><div><span class="stat-label">Consistency</span><strong>'+m.sessions+'</strong><small>Sessions logged</small></div><div><span class="stat-label">Routine</span><strong>'+weeks.filter(w=>w.sessions.size).length+' / '+weeks.length+'</strong><small>Weeks with training</small></div><div><span class="stat-label">Milestones</span><strong>'+weeks.reduce((a,w)=>a+w.prs,0)+'</strong><small>New personal records</small></div></div><div class="progress-grid">'+
 section('Training by week','Weeks start Monday. Cardio minutes are tracked separately from resistance sets and lifted load.',weekly)+
 section('Strength curve','Daily best estimated one-rep max for the selected lift. Epley estimate for 2–10 reps; singles use the logged load.',strength)+
 section('Personal records','Heaviest load, most unweighted reps, or longest cardio interval per movement. First marks establish a baseline.',rec?'<table><thead><tr><th>Movement</th><th>Best at the time</th><th>Change</th></tr></thead><tbody>'+rec+'</tbody></table>':'<p class="empty">Your first logged movement establishes a record.</p>')+
 section('Volume landmarks','Working sets by movement pattern. Compare this week with your observed range over the previous four weeks, including weeks with no logs.',landmarks?'<table><thead><tr><th>Pattern</th><th>This week</th><th>Prior range</th></tr></thead><tbody>'+landmarks+'</tbody></table>':'<p class="empty">Log resistance sets to see your personal weekly range.</p>')+
 section('Readiness trend','Latest saved check-in per day. Missing days have no score. Sample wearable readings are excluded.',progressSelect('recovery-metric','Signal',Object.entries(recoveryFields).map(([k,v])=>[k,v[0]]),recoveryMetric)+graph(readiness,recoveryFields[recoveryMetric][1])+action('check','Check in'))+
 section('Body measurements','Optional personal measurements. You can track training progress without entering any.',progressSelect('body-metric','Measurement',Object.entries(bodyFields).map(([k,v])=>[k,v[0]]),bodyMetric)+graph(measurements,bodyFields[bodyMetric][1])+action('measure-body','Log measurements'))+
 '</div><section class="card history-card"><div class="headrow"><h2>Set history</h2><span class="pill">'+m.entries.length+' entries</span></div>'+(m.entries.length?m.entries.slice().reverse().map(l=>row(lookup(l.id),longDate(l.at)+' · '+fmtProgress(l.reps)+(lookup(l.id).p===9?' min':' reps')+' · '+fmtProgress(l.kg)+' kg · RPE '+fmtProgress(l.rpe))).join(''):'<p class="empty">No sets logged in this period.</p>'+action('start','Start session','primary'))+'</section>';
}
function saveReadiness(){
 const score=rules().score;
 (state.observations??=[]).push({uid:crypto.randomUUID(),at:Date.now(),kind:'readiness',score,energy:state.energy,stress:state.stress,pain:state.pain,...(!state.sample?{hrv:state.bio.hrv,rhr:state.bio.rhr,sleep:state.bio.sleep}:{})});
}
document.addEventListener('change',e=>{
 const id=e.target.id,v=e.target.value;
 if(id==='recovery-metric')recoveryMetric=v;else if(id==='activity-range')activityWeeks=+v;else if(id==='activity-measure')activityMeasure=v;else if(id==='activity-pattern')activityPattern=+v;else if(id==='activity-lift')activityLift=v;else if(id==='body-metric')bodyMetric=v;else return;
 render();document.getElementById(id)?.focus();
});
document.addEventListener('click',e=>{
 if(e.target.closest('[data-act]')?.dataset.act!=='measure-body')return;
 show('Log measurements','<form id="body-form"><p>Enter any measurements you want to keep for today.</p>'+Object.entries(bodyFields).map(([k,[label,unit,max]])=>'<label for="body-'+k+'">'+label+' ('+unit+')</label><input id="body-'+k+'" name="'+k+'" type="number" step="0.1" min="0.1" max="'+max+'">').join('')+'<p role="alert" id="body-error"></p><button class="primary">Save measurements</button></form>');
});
document.addEventListener('submit',e=>{
 if(e.target.id!=='body-form')return;e.preventDefault();
 const entry={};for(const k of Object.keys(bodyFields)){const input=e.target.elements[k];if(input.value)entry[k]=input.valueAsNumber}
 if(!Object.keys(entry).length){$('body-error').textContent='Enter at least one measurement.';return}
 bodyMetric=Object.keys(entry)[0];(state.observations??=[]).push({uid:crypto.randomUUID(),kind:'body',at:Date.now(),...entry});persist();dialog.close();render();toast('Measurements saved');
});
