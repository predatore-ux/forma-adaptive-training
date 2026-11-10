const paths={recommended:'M3 4h8v15H3z M11 4h10v15H11z M5 8h4m4 0h6',overview:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',library:'M3 5h5v15H3z M10 5h4v15h-4z M16 5l4-1 3 15-4 1z',activity:'M2 17l6-6 4 3 8-10 M15 4h5v5',sliders:'M3 7h7m5 0h6M3 17h12m4 0h2 M10 4v6m5 4v6',calendar:'M4 5h16v16H4z M8 2v6m8-6v6M4 11h16',clock:'M12 2a10 10 0 1 0 .01 0 M12 6v6l4 2',layers:'M2 8l10-5 10 5-10 5z M2 12l10 5 10-5 M2 16l10 5 10-5',arrow:'M4 12h15m-6-6 6 6-6 6',chevron:'M9 5l7 7-7 7',pulse:'M1 12h6l3-8 4 16 3-8h6',heart:'M12 20C-4 10 5-2 12 7c8-9 16 3 0 13z',moon:'M20 16A9 9 0 0 1 8 4a9 9 0 1 0 12 12z',check:'M4 12l5 5L20 6',bar:'M3 16v4m5-8v8m5-12v12m5-16v16',bolt:'M14 2 4 14h7l-1 8 10-13h-7z',swap:'M3 7h17l-4-4m5 14H4l4 4'};
const icon=k=>'<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="'+paths[k]+'"/></svg>';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=document.querySelector('#main'),dialog=document.querySelector('#dialog'),modal=document.querySelector('#modal');
let page='overview',filter='',query='',activeDetail=null;
const navItems=[['overview','Overview'],['recommended','Recommended'],['library','Movement library'],['activity','Activity']];
const lookup=id=>catalog.find(e=>e.id===id);
const action=(key,label,cls='outline')=>'<button type="button" class="'+cls+'" data-act="'+key+'">'+label+'</button>';
const dateStr=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'short',day:'numeric'}).format(new Date());
function heading(title,sub){return '<div class="intro"><div><h1>'+title+'</h1><p>'+sub+'</p></div><span class="date">'+icon('calendar')+dateStr+'</span></div>'}
function toast(s){const t=document.querySelector('#toast');t.textContent=s;t.className='show';setTimeout(()=>t.className='',3000)}
function show(title,body){dialog.setAttribute('aria-label',title);modal.innerHTML='<div class="cardtop"><h2>'+title+'</h2>'+action('close','×','close')+'</div>'+body;if(!dialog.open)dialog.showModal()}
const select=(id,label,choices,val)=>'<label for="'+id+'">'+label+'</label><select id="'+id+'">'+choices.map(c=>'<option '+(val===c?'selected':'')+'>'+esc(c)+'</option>').join('')+'</select>';
const num=(id,label,val,min,max,step=1)=>'<label for="'+id+'">'+label+'</label><input required type="number" id="'+id+'" value="'+val+'" min="'+min+'" max="'+max+'" step="'+step+'">';
function row(e,summary,idx){const thumbnail=demoFrames[e.name]?.[0];
const preview=thumbnail?'<img class="thumb" src="'+thumbnail+'" alt="">':'<span class="thumb thumb-symbol" aria-hidden="true">'+icon(e.p===9?'pulse':e.category==='CrossFit'?'bolt':'layers')+'</span>';return '<a class="row" href="#movement/'+e.id+'" data-act="detail" data-id="'+e.id+'">'+preview+'<div class="rowtitle"><strong>'+e.name+'</strong><small>'+summary+'</small></div><span class="tag">'+patterns[e.p]+'</span>'+icon('chevron')+'</a>'}
function overview(){const r=rules(),score=r.score;const plan=currentPlan(),items=resolvedItems(plan),hero=heroCard(plan,items);
const read='<section class="card readiness"><div class="cardtop"><div class="kicker">'+icon('pulse')+' Readiness index</div><span class="pill">'+(r.low?'Recovery':r.high?'High readiness':'Baseline')+'</span></div><div class="readbody"><div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="43" fill="none" stroke="#d9e4d0" stroke-width="7"/><circle cx="50" cy="50" r="43" fill="none" stroke="#65934e" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+(score*2.702)+' 270.2"/></svg><div><strong>'+score+'</strong><small>/ 100</small></div></div><div><h3>'+(r.low?'Take it lighter':r.high?'Ready to train':'Steady today')+'</h3><p>'+(r.low?'Your plan uses fewer sets and lower effort today.':r.high?'Your recovery signals support a strong session today.':'Your plan follows your usual training volume.')+'</p></div></div>'+action('check',icon('sliders')+'Readiness check-in','check')+'</section>';
const lineup='<section class="card"><div class="headrow"><h2>Session lineup</h2>'+action('plan','View plan '+icon('arrow'),'textbtn')+'</div><div class="rows">'+items.slice(0,3).map(item=>row(lookup(item.id),workload(item))).join('')+'</div></section>';
const signals=[['pulse','Heart rate variability','HRV',state.bio.hrv,'ms','1,21 8,17 13,19 18,13 24,16 31,10 37,12 44,8 50,10 59,3'],['heart','Resting heart rate','RHR',state.bio.rhr,'bpm','1,5 8,9 15,7 22,13 28,10 36,16 42,13 49,19 55,16 60,20'],['moon','Sleep duration','Last night',Math.floor(state.bio.sleep)+'h '+Math.round(state.bio.sleep%1*60),'m','1,20 7,16 13,19 19,11 25,14 33,9 40,12 47,7 52,10 59,5']];
return heading('Training overview','Your session, readiness, and recovery in one place.')+sessionPicker(plan.type)+'<div class="grid">'+hero+read+lineup+'<section class="card"><div class="headrow"><h2>Recovery signals</h2>'+'<button class="textbtn" aria-label="Edit recovery signals" data-act="signals">'+icon('sliders')+'</button>'+'</div>'+signals.map(([i,title,sub,val,unit,pts])=>'<div class="metric"><span class="tile">'+icon(i)+'</span><div><b>'+title+'</b><small>'+sub+'</small></div><strong>'+val+' <small>'+unit+'</small></strong>'+(state.sample?'<svg class="spark" aria-hidden="true" viewBox="0 0 62 26"><polyline points="'+pts+'" fill="none" stroke="#84a56f" stroke-width="2"/></svg>':'')+'</div>').join('')+'<div class="foot"><i class="dot"></i>'+(state.sample?'Sample recovery data':'Saved recovery measurements')+'</div></section></div>'}
function libRows(){return catalog.filter(e=>(!filter||patterns[e.p]===filter||e.category===filter||(filter==='Cardio'&&e.p===9))&&e.name.toLowerCase().includes(query.toLowerCase())).map(e=>row(e,equipment(e))).join('')||'<p>No matching movements.</p>'}
function library(){return heading('Movement library','Explore exercises by movement pattern and equipment.')+'<section class="card"><div class="tools"><input id="search" aria-label="Search movements" placeholder="Search movements" value="'+esc(query)+'"><select id="pattern" aria-label="Filter by pattern"><option value="">All patterns</option>'+[...patterns,'CrossFit','Cardio'].map(x=>'<option '+(filter===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div><div class="library" id="results">'+libRows()+'</div></section>'}
function activity(){const vol=state.logs.reduce((n,l)=>n+l.reps*l.kg,0);const sessions=new Set(state.logs.map(l=>l.session)).size;const best=Math.max(0,...state.logs.filter(l=>lookup(l.id).p===0&&l.reps<=12).map(l=>Math.round(l.kg*(1+l.reps/30))));const metrics=state.logs.length?'<div class="stats"><div><strong>'+sessions+'</strong><small>Sessions logged</small></div><div><strong>'+Math.round(vol).toLocaleString()+' kg</strong><small>Total load lifted</small></div>'+(state.mode==='Advanced'&&best?'<div><strong>'+best+' kg</strong><small>Hinge e1RM · Epley</small></div>':'')+'</div>':'';return heading('Training activity','Your training history across sessions.')+'<div class="tools">'+action('account','Account &amp; backup')+'</div>'+metrics+'<section class="card"><div class="headrow"><h2>Logged sets</h2><span class="tag">'+state.logs.length+' sets</span></div>'+(state.logs.length?[...state.logs].reverse().map(l=>row(lookup(l.id),new Date(l.at).toLocaleDateString()+' · '+l.reps+(lookup(l.id).p===9?' min':' reps')+' · '+l.kg+' kg · RPE '+l.rpe)).join(''):'<p class="empty">Start a session and log your first set. Your training history will appear here.</p>'+action('start','Start session '+icon('arrow'),'primary'))+'</section>'}
function work(){const performance=state.mode==='Advanced'?'<details class="advanced"><summary>Velocity &amp; movement quality</summary><div class="entry"><div><label for="fast">Fastest rep (m/s)</label><input id="fast" type="number" min="0.01" max="10" step="0.01"></div><div><label for="last">Final rep (m/s)</label><input id="last" type="number" min="0.01" max="10" step="0.01"></div></div><p id="velocityhint">Power target · keep velocity loss below 20%.</p></details>':'';const s=state.session;if(!s){page='overview';return overview()}const a=s.items[s.i],e=lookup(a.id);return heading(plans.find(p=>p.id===s.planId)?.name||'Active session','Movement '+(s.i+1)+' of '+s.items.length+' · '+patterns[e.p])+'<section class="card wide work"><div class="cardtop"><h2>'+e.name+'</h2>'+action('swap',icon('swap')+' Swap')+'</div><p>'+(e.cue||cues[e.p])+'</p><div class="stats"><div><strong>'+s.n+' / '+a.sets+'</strong><small>Working set</small></div><div><strong>'+(a.target?(a.target+(e.p===9?' min':'')):(e.p===9?'2 min':'8–10'))+'</strong><small>'+(e.p===9?'Duration':'Target reps')+'</small></div><div><strong>'+a.kg+' kg</strong><small>Target load</small></div></div><p>'+ (state.mode==='Advanced'?'RPE '+a.rpe+' · RIR '+(10-a.rpe):'Effort '+a.rpe+'/10 · Leave '+(10-a.rpe)+' reps in the tank.')+'</p><form id="logform"><div class="entry"><div>'+num('reps',e.p===9?'Minutes':'Reps',a.target||(e.p===9?2:8),1,999)+'</div><div>'+num('kg','Load (kg)',a.kg,0,1500,.1)+'</div><div>'+num('effort','Effort (1–10)',a.rpe,1,10,.5)+'</div></div>'+performance+'<div class="tools"><button class="primary">Log set '+icon('check')+'</button>'+action('tempo','Tempo guide','outline')+'<button type="button" class="outline" data-act="detail" data-id="'+e.id+'">Movement guide</button>'+'</div></form><div class="timer" id="timer"></div><div class="tools">'+action('swap','Machine taken')+action('discomfort','Joint discomfort')+action('strong','Feeling strong')+'</div>'+action('finish','Finish session','textbtn')+'</section>'}
function render(){document.querySelector('#nav').innerHTML=navItems.map(([k,l])=>action('go-'+k,icon(k)+l,(page===k||(k==='library'&&page.startsWith('movement/')))?'active':'')).join('');document.querySelector('.avatar').textContent=state.name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();main.innerHTML=page.startsWith('movement/')?movementPage(page.slice(9)):page==='recommended'?recommendations():page==='library'?library():page==='activity'?activity():page==='work'?work():overview();if(page==='work'&&guideDraft&&state.session){
  const session=state.session;
  if(guideDraft.key===[session.id,session.i,session.n,session.items[session.i].id].join('/')){
    for(const [key,value] of Object.entries(guideDraft.values))if($(key))$(key).value=value;
  }
  guideDraft=null;
}
updateTimer()}
function navigate(to,origin){
  if(dialog.open)dialog.close();
  if(page!==to)history.pushState({origin:origin||null},'','#'+to);
  page=to;render();window.scrollTo(0,0);
  const title=main.querySelector('h1');
  if(title){title.tabIndex=-1;title.focus({preventScroll:true})}
}
function setup(){show('Training setup','<form id="setup"><label for="name">Athlete name</label><input id="name" maxlength="45" required value="'+esc(state.name)+'">'+select('experience','Training experience',['New to training','Trained','Return to training'],state.experience)+select('gear','Available equipment',['Full gym','Garage gym','Hotel gym','Bodyweight only'],state.gear)+select('track','Training track',['Strength','Endurance','Seated'],state.track)+select('limbs','Limb proportions',['Balanced','Long femurs','Long arms','Short arms'],state.limbs)+select('joint','Joint constraints',['Unrestricted','Limited shoulder or wrist','Limited knee'],state.joint)+'<label for="injury">Injury or recovery notes</label><input id="injury" value="'+esc(state.injury)+'">'+select('mode','Terminology',['Beginner','Advanced'],state.mode)+num('rest','Rest duration (seconds)',state.rest,5,600)+'<button class="primary">Save setup</button></form>')}
const $=id=>document.getElementById(id);
function checkin(){show('Readiness check-in','<form id="checkform">'+[['energy','Energy'],['stress','Stress'],['pain','Joint soreness']].map(([id,label])=>'<label for="'+id+'">'+label+' · <output>'+state[id]+'</output>/10</label><input type="range" id="'+id+'" min="0" max="10" value="'+state[id]+'">').join('')+'<button class="primary">Adapt my session '+icon('arrow')+'</button></form>')}
function signals(){show('Recovery signals','<form id="bioform">'+num('hrv','Heart rate variability (ms)',state.bio.hrv,1,400)+num('base','Usual HRV (ms)',state.bio.base,1,400)+num('sd','Baseline standard deviation',state.bio.sd,1,100)+num('rhr','Resting heart rate (bpm)',state.bio.rhr,20,220)+num('sleep','Sleep duration (hours)',state.bio.sleep,0,24,.1)+'<button class="primary">Save measurements</button></form><label for="import">Import normalized wearable JSON</label><input type="file" id="import" accept=".json,application/json"><small>Fields: hrv, base, sd, rhr, sleep (hours).</small><div class="tools">'+action('connections','Wearable connections')+'</div>')}
let guideDraft=null;
function detail(id){
  if(page==='work'&&state.session){
    const session=state.session;
    guideDraft={key:[session.id,session.i,session.n,session.items[session.i].id].join('/'), values:{}};
    for(const key of ['kg','reps','effort','fast','last'])if($(key))guideDraft.values[key]=$(key).value;
  }
  const origin=page.startsWith('movement/')?(history.state?.origin||'library'):page;
  navigate('movement/'+id,origin);
}
function swap(){const s=state.session,a=s.items[s.i],e=lookup(a.id),opts=options(e.p).filter(o=>o.id!==e.id);show('Swap movement','<p>Available alternatives for '+patterns[e.p].toLowerCase()+'.</p>'+(opts.map(o=>'<button class="row" data-act="choose" data-id="'+o.id+'"><div class="rowtitle"><strong>'+o.name+'</strong></div>'+icon('arrow')+'</button>').join('')||'<p>Your setup has one matching movement. Update your setup or skip this movement.</p>')+action('skip','Skip movement'))}
function advance(){const s=state.session;s.n=1;s.i++;if(s.i>=s.items.length){state.session=null;state.phase='Baseline';navigate('activity');toast('Session complete')}persist();render()}
function modulate(){
  const session=state.session;
  if(!session)return;
  const plan=plans.find(p=>p.id===session.planId);
  const adapted=plan?resolvedItems(plan):[];
  const r=rules();
  session.items.slice(session.i).forEach((item,index)=>{
    const position=session.i+index,desired=adapted[position];
    const movement=lookup(item.id),allowed=options(movement.p);
    if(!allowed.some(e=>e.id===item.id)){
      item.id=desired?.id||allowed[0]?.id||'9-3';
      item.kg=0;
      if(desired)item.target=desired.target;
    }
    item.sets=Math.max(index===0?session.n:1,desired?.sets||r.sets);
    item.rpe=desired?.rpe||(state.experience==='Trained'?r.rpe:Math.min(6,r.rpe));
    if(r.low&&!session.low)item.kg=Math.round(item.kg*.8*2)/2;
  });
  session.low=r.low;
}
function updateTimer(){const t=$('timer');if(!t||!state.session)return;const left=Math.max(0,Math.ceil((state.session.end-Date.now())/1000));t.textContent=left?'Rest · '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):'Ready for your next set';if(!left&&state.session.end){state.session.end=0;persist();navigator.vibrate?.([150,80,150])}}
let tempoTick;dialog.addEventListener('close',()=>clearInterval(tempoTick));
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-act]');if(!b||(b.tagName==='A'&&(ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey)))return;ev.preventDefault();const a=b.dataset.act;if(a.startsWith('go-'))return navigate(a.slice(3));const s=state.session;
if(a==='close')dialog.close();
if(a==='profile')setup();
if(a==='signals')signals();
if(a==='check')checkin();
if(a==='detail')detail(b.dataset.id);
if(a==='plan')show(currentPlan().name,resolvedItems(currentPlan()).map(item=>row(lookup(item.id),workload(item))).join(''));
if(a==='session-type'){const selected=plans.find(p=>p.type===b.dataset.type&&p.level===currentPlan().level);state.planId=selected.id;persist();render();main.querySelector('[data-type="'+selected.type+'"]').focus()}
if(a==='level'){recommendedLevel=Number(b.dataset.level);render();main.querySelector('[data-level="'+recommendedLevel+'"]').focus()}
if(a==='select-plan'){state.planId=b.dataset.id;persist();navigate('overview')}
if(a==='replace-session')startSelected(true);
if(a==='resume-session')navigate('work');
if(a==='start')startSelected();
if(a==='swap')swap();
if(a==='skip'){dialog.close();advance()}
if(a==='choose'){let m=s.items[s.i];m.id=b.dataset.id;m.kg=0;persist();dialog.close();render();toast('Movement updated. Enter your working load.')}
if(a==='finish'){show('Finish session?','<p>Your logged sets will stay in Activity. Finishing ends this session and its rest timer.</p>'+action('finish-now','Finish session','primary'))}if(a==='finish-now'){state.session=null;state.phase='Baseline';persist();dialog.close();navigate('activity')}if(a==='discomfort'){s.items[s.i].rpe=Math.min(6,s.items[s.i].rpe);s.items[s.i].sets=Math.max(s.n,2);s.items[s.i].kg=0;persist();render();show('Joint discomfort','<p>Pause this movement. Choose a comfortable alternative or skip it for today.</p><div class="tools">'+action('swap','Find alternative')+action('skip','Skip movement')+'</div>')}
if(a==='strong'){if(!s.items[s.i].kg)return toast('For bodyweight work, keep a controlled tempo.');if(rules().low)return toast('Recovery limits remain active today');show('Increase next set load?','<p>Raise your next working load by 2.5% if the previous set felt comfortable.</p>'+action('increase','Apply increase','primary'))}
if(a==='increase'){let m=s.items[s.i];if(m.kg>0)m.kg=Math.ceil(m.kg*1.025*2)/2;persist();dialog.close();render()}
if(a==='tempo'){show('Tempo guide','<p>3 seconds lowering · 1 second lifting</p><h2 id="beat">Lower · 3</h2>');let n=0;tempoTick=setInterval(()=>{n=(n+1)%4;if($('beat'))$('beat').textContent=n===3?'Lift · 1':'Lower · '+(3-n)},1000)}
});
document.addEventListener('input',e=>{if(['fast','last'].includes(e.target.id)&&+$('fast').value&&+$('last').value){const drop=Math.max(0,Math.round(100*(1-+$('last').value/+$('fast').value)));$('velocityhint').textContent=drop+'% velocity loss · '+(drop>=20?'End this power set.':'Within power target.')}if(e.target.type==='range')e.target.previousElementSibling.querySelector('output').value=e.target.value;if(e.target.id==='search'){query=e.target.value;$('results').innerHTML=libRows()}});
document.addEventListener('change',async e=>{if(e.target.id==='pattern'){filter=e.target.value;$('results').innerHTML=libRows()}if(e.target.id==='import'){try{const b=JSON.parse(await e.target.files[0].text());for(const [k,max] of Object.entries({hrv:400,base:400,sd:100,rhr:220,sleep:24})){if(!Number.isFinite(b[k])||b[k]<0||b[k]>max)throw Error();$(k).value=b[k]}toast('Measurements loaded for review')}catch{toast('Use numeric hrv, base, sd, rhr and sleep fields.')}}});
document.addEventListener('submit',ev=>{ev.preventDefault();const id=ev.target.id;if(!['setup','bioform','checkform','logform'].includes(id))return;
if(id==='setup'){if(state.track!==$('track').value||state.experience!==$('experience').value)delete state.planId;for(const k of ['name','gear','track','limbs','joint','injury','mode','experience'])state[k]=$(k).value.trim();state.name=state.name||'Athlete';state.rest=+$('rest').value;modulate()}
if(id==='bioform'){for(const k of Object.keys(initial.bio))state.bio[k]=+$(k).value;state.sample=false;modulate()}
if(id==='checkform'){state.phase='Evaluated';for(const k of ['energy','pain','stress'])state[k]=+$(k).value;modulate();state.phase=state.session?'In-Workout':'Modulated'}
if(id==='logform'){const s=state.session,a=s.items[s.i],kg=+$('kg').value,rpe=+$('effort').value;state.logs.push({session:s.id,id:a.id,n:s.n,reps:+$('reps').value,kg,rpe,velocityFast:+($('fast')?.value||0),velocityLast:+($('last')?.value||0),at:Date.now()});s.end=Date.now()+state.rest*1000;a.kg=rpe>=a.rpe+1.5?Math.round(kg*.935*2)/2:kg;if(s.n>=a.sets){advance();return} s.n++;persist();render();if(rpe<=a.rpe-2&&!rules().low&&kg>0)show('Next set adjustment','<p>Your set felt easier than planned. Increase your next load by 2.5%?</p>'+action('increase','Apply increase','primary'));else toast(rpe>=a.rpe+1.5?'Set logged · next load reduced':'Set logged');return}
persist();dialog.close();render();toast(id==='checkform'?'Readiness saved · plan updated':'Changes saved')});
window.addEventListener('hashchange',()=>{page=location.hash.slice(1)||'overview';render();window.scrollTo(0,0)});window.addEventListener('storage',e=>{if(e.key===accountSlot){location.reload();return}if(e.key===stateKey()&&e.newValue){state=JSON.parse(e.newValue);render()}});
document.querySelectorAll('[data-i]').forEach(n=>n.outerHTML=icon(n.dataset.i));page=location.hash.slice(1)||page;render();setInterval(updateTimer,1000);if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});






