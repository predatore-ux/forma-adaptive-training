function programState(){const p=state.program;return p?Programming.context(p,state.observations||[],rules().low):null}
function resolvedItems(plan){
 const base=baselineResolvedItems(plan),p=state.program;
 if(!p||p.planId!==plan.id||Programming.cursor(p,state.observations||[])>=p.frequency*4)return base;
 return Programming.prescribe({program:p,events:state.observations||[],logs:state.logs,items:base,low:rules().low,novice:state.experience!=='Trained',index:state.session?.programId===p.id?state.session.programIndex:undefined}).items;
}
function programPage(){
 const p=state.program;
 if(!p)return heading('Your training block','A plan that learns from the sessions you actually complete.')+'<section class="card wide"><span class="kicker">Four weeks · Your pace</span><h2 style="margin-top:12px">Build with a purpose</h2><p>Choose a goal and weekly frequency. Each session adapts to completed sets, effort, recovery and joint feedback. Missed sessions stay in place so you can continue without cramming.</p>'+action('program-create','Build my program','primary')+'</section>';
 const c=programState(),total=p.frequency*4,done=c.index>=total,plan=plans.find(x=>x.id===p.planId);
 const cards=Array.from({length:4},(_,w)=>'<div class="card '+(w===c.week&&!done?'program-current':'')+'"><span class="kicker">Week '+(w+1)+'</span><h2>'+['Foundation','Build','Consolidate','Deload'][w]+'</h2><p>'+Math.max(0,Math.min(p.frequency,c.index-w*p.frequency))+' / '+p.frequency+' sessions</p><small>Effort up to '+Math.min(Programming.goals[p.goal].effort[w],state.experience==='Trained'?8:6)+'/10</small></div>').join('');
 const next=done?'':resolvedItems(plan).map(i=>'<div class="program-movement"><div class="headrow"><strong>'+esc(lookup(i.id).name)+'</strong><span class="pill">'+workload(i)+'</span></div><p>'+i.kg+' kg · Effort '+i.rpe+'/10</p><small>'+esc(i.reason)+'</small><button type="button" class="textbtn" data-act="detail" data-id="'+i.id+'" style="margin-top:10px">Movement guide '+icon('arrow')+'</button></div>').join('');
 const history=(state.observations||[]).filter(e=>e.kind==='session'&&e.programId===p.id).slice().reverse().map(e=>'<div class="row"><div class="rowtitle"><strong>'+longDate(e.at)+' · '+(e.complete?'Completed':'Partial session')+'</strong><small>'+esc(e.feeling)+' · Joint discomfort '+e.pain+'/10'+(e.deload?' · Deload':'')+'</small></div></div>').join('');
 return heading(Programming.goals[p.goal].name+' block','Four weeks · '+p.frequency+' sessions per week · '+plan.name)+'<div class="progress-summary"><div><span class="stat-label">Progress</span><strong>'+c.index+' / '+total+'</strong><small>Sessions completed</small></div><div><span class="stat-label">Phase</span><strong>'+(done?'Done':c.deload?'Deload':'Build')+'</strong><small>'+(done?'Start a new block when ready':esc(c.reason))+'</small></div><div><span class="stat-label">Next step</span><strong>'+(done?'✓':c.index+1)+'</strong><small>'+(done?'Block complete':'Session in sequence')+'</small></div></div><div class="program-weeks">'+cards+'</div><section class="card wide"><div class="headrow"><h2>'+(done?'Block complete':'Next session')+'</h2></div><p>Loads are suggestions. Adjust them before logging. A new variation starts at zero added load; loads are never transferred between variations.</p>'+next+'<div class="tools">'+(done?'':action('program-start',state.session?'Resume current session':'Start next session','primary'))+action('program-create',done?'Build next block':'Replace program')+'</div></section>'+(history?'<section class="card wide" style="margin-top:20px"><h2>Block history</h2>'+history+'</section>':'');
}
function createProgramForm(){
 if(state.session)return toast('Finish the active session before replacing your program.');
 show('Build a four-week block','<form id="program-form"><label for="program-goal">Primary goal</label><select id="program-goal">'+Object.entries(Programming.goals).map(([k,v])=>'<option value="'+k+'">'+v.name+'</option>').join('')+'</select><label for="program-frequency">Sessions per week</label><select id="program-frequency"><option value="2">2 sessions</option><option value="3" selected>3 sessions</option><option value="4">4 sessions</option></select><p>Your current equipment, experience and joint constraints apply. Return-to-training blocks use two sessions per week.</p>'+(state.program?'<p>This replaces your active block. Logged training and block history are retained.</p>':'')+'<button class="primary">Create program</button></form>');
}
function finishProgramSession(){
 const s=state.session;if(!s)return;
 const logs=state.logs.filter(l=>l.session===s.id);
 if(!s.programId){state.session=null;state.phase='Baseline';persist();dialog.close();navigate('activity');return}
 const counts=new Map();for(const l of logs){const key=l.slot??l.id;counts.set(key,(counts.get(key)||0)+1)}
 const complete=s.items.every((item,i)=>(counts.get(i)||0)>=item.sets)&&!s.skipped;
 show('Session review','<form id="program-review" data-complete="'+complete+'"><p>'+logs.length+' sets saved. '+(complete?'This advances your block by one session.':'This was a partial session. Your next program session stays in place.')+'</p><label for="session-feeling">How did it feel?</label><select id="session-feeling"><option value="steady">Steady</option><option value="strong">Strong</option><option value="drained">Drained</option></select><label for="session-pain">Joint discomfort · 0–10</label><input id="session-pain" type="number" min="0" max="10" value="'+(s.discomfort?7:state.pain)+'" required><label for="session-notes">Session notes (optional)</label><input id="session-notes" maxlength="500"><button class="primary">Save review &amp; finish</button></form>');
}
document.addEventListener('click',e=>{
 const a=e.target.closest('[data-act]')?.dataset.act;
 if(a==='review-program')finishProgramSession();
 if(a==='program-create')createProgramForm();
 if(a==='program-start'){if(state.session)return navigate('work');state.planId=state.program.planId;newSession();navigate('work')}
});
document.addEventListener('submit',e=>{
 if(e.target.id==='program-form'){
  e.preventDefault();const goal=$('program-goal').value,frequency=goal==='return'?2:+$('program-frequency').value;
  const type=state.track==='Seated'?'seated':goal==='conditioning'?'cardio':'strength',level=goal==='return'||state.experience!=='Trained'?0:goal==='strength'?2:1;
  const plan=plans.find(p=>p.type===type&&p.level===level);
  state.program={id:crypto.randomUUID(),goal,frequency,planId:plan.id,createdAt:Date.now()};state.planId=plan.id;persist();dialog.close();navigate('program');
 }
 if(e.target.id==='program-review'){
  e.preventDefault();const s=state.session;if(!s?.programId)return;
  const logs=state.logs.filter(l=>l.session===s.id),fatigue=logs.some(l=>l.rpe>=9||l.velocityFast>0&&l.velocityLast>0&&l.velocityLast/l.velocityFast<.8);
  if(!(state.observations||[]).some(o=>o.kind==='session'&&o.session===s.id))(state.observations??=[]).push({uid:crypto.randomUUID(),kind:'session',at:Date.now(),session:s.id,programId:s.programId,index:s.programIndex,complete:e.target.dataset.complete==='true',deload:!!s.programDeload,feeling:$('session-feeling').value,pain:+$('session-pain').value,notes:$('session-notes').value.trim(),fatigue});
  state.session=null;state.phase='Baseline';persist();dialog.close();navigate('program');toast('Session saved · next prescription updated');
 }
});
