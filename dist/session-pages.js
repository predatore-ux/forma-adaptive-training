const instructions = [
  ['Stand with the bar above the middle of your feet and take a grip just outside your legs.|Brace and push the floor away, keeping the bar close. Stand tall, then hinge to return it to the floor.',
   'Stand with dumbbells in front of your thighs and soften your knees.|Send your hips back and slide the weights close to your legs. Stand tall when you reach your comfortable hinge depth.',
   'Lie on your back with feet flat and knees bent.|Press through your feet to lift your hips. Pause with ribs down, then lower slowly.',
   'Sit toward the front of a stable seat, feet supported.|Tip forward from the hips with a long back, then return upright.'],
  ['Set the bar across your upper back and plant your feet firmly.|Bend through hips and knees, then push through your feet to stand.',
   'Hold one dumbbell upright at your chest.|Lower between your hips with heels planted, then stand without shifting the weight away.',
   'Stand just in front of a stable chair with feet planted.|Reach your hips back to touch the seat, then stand with control.',
   'Support your back on the leg press and place your feet on the platform.|Press the platform away without locking your knees. Bend your knees to return within a comfortable range.'],
  ['Stand tall and step one foot back.|Bend both knees, then push through the front foot to return. Alternate sides.',
   'Stand in a split stance with a dumbbell in each hand.|Lower your back knee toward the floor and rise through your front foot. Finish the set before switching sides.',
   'Stand in a split stance beside a stable support.|Use your hand for balance as you bend both knees. Rise without changing your stance.',
   'Sit with the back of your thigh supported and your knee bent.|Straighten one knee, pause, then lower the foot slowly. Alternate legs.'],
  ['Lie on a bench with feet planted and grip the bar above your chest.|Lower it under control, then press it up with wrists stacked over elbows.',
   'Lie on the floor with bent knees and a dumbbell in each hand.|Lower until your upper arms gently meet the floor. Press both weights up.',
   'Place your hands on a stable raised surface and step back into a straight line.|Bend your elbows to bring your chest toward the support, then press away.',
   'Sit upright with palms together at chest height.|Press your palms together for a brief hold, then ease the pressure while keeping your hands aligned.'],
  ['Support your chest on an incline bench with weights hanging down.|Pull your elbows back toward your hips. Lower until your arms are long.',
   'Brace one hand on a stable surface and let the weight hang from the other.|Draw your elbow back beside your ribs, then lower slowly. Switch sides.',
   'Lie face down with bent elbows and arms forming a W.|Lift the hands and elbows slightly, keeping your neck long, then lower.',
   'Sit upright with arms relaxed.|Gently draw the shoulder blades back, hold briefly, and release.'],
  ['Anchor one end of the bar securely and hold the other at shoulder height.|Press up and forward along the arc of the bar, then return to your shoulder.',
   'Hold the dumbbells at shoulder height with palms facing each other.|Press up in a comfortable range and return with control.',
   'Place your palms on a wall and step back slightly.|Bend your elbows to move toward the wall, then press yourself back.',
   'Sit upright with your hands near your shoulders.|Reach overhead within a comfortable range. Lower without leaning back.'],
  ['Sit under the cable with thighs supported and grip the overhead bar.|Draw your elbows down to bring the bar toward your upper chest. Return slowly.',
   'Lie supported on a bench, holding a dumbbell above your chest.|Move the weight overhead in an arc with softly bent elbows, then draw it back.',
   'Lie face down with arms extended in front.|Sweep your arms out and down toward your sides, then return them overhead.',
   'Sit upright with both elbows bent.|Draw your elbows down toward your hips, hold the contraction briefly, then relax.'],
  ['Stand with one weight at each side and your shoulders level.|Walk with short, controlled steps. Count each step toward your target.',
   'Carry one weight beside your hip and keep your torso upright.|Walk without leaning toward the load. Switch hands halfway through.',
   'Stand tall near support if needed.|Lift one knee and lower it, then alternate. Count each knee lift.',
   'Sit upright on a stable seat with a manageable weight at your side.|Hold your torso level for a slow breath, then release. Alternate sides.'],
  ['Stand side-on to a cable and hold the handle with both hands.|Turn through a comfortable range against the cable, then return with control.',
   'Stand with both hands around one dumbbell near your hip.|Guide it diagonally across your body, letting your feet pivot, then reverse.',
   'Stand with feet planted and arms across your chest.|Turn gently to one side, return to center, and repeat on the other side.',
   'Sit with feet supported and arms folded.|Turn your upper body gently while keeping your hips stable, then return to center.'],
  ['Adjust the saddle so your knee remains slightly bent at the bottom of the pedal stroke.|Pedal smoothly at a pace you can maintain for the interval.',
   'Stand tall with arms relaxed and choose a clear walking route.|Walk at a purposeful pace with a natural arm swing.',
   'Stand beside support if needed.|Alternate gentle knee lifts at a comfortable rhythm.',
   'Sit with feet supported and hands near your chest.|Reach forward with one arm, draw it back, and alternate at a steady pace.']
];
function movementSteps(e){
  const [p,i]=e.id.split('-').map(Number);
  if(instructions[p]?.[i])return instructions[p][i].split('|');
  return [e.cue];
}
function sessionPicker(selected){
  return '<div class="session-picker" role="group" aria-label="Session type">'+Object.entries(sessionTypes).map(([id,type])=>
    '<button data-act="session-type" data-type="'+id+'" aria-pressed="'+(selected===id)+'">'+icon(type.icon)+type.name+'</button>').join('')+'</div>';
}
function heroCard(plan,items){
  const active=state.session && (state.session.planId===plan.id||(!state.session.planId&&!state.planId));
  return '<section class="hero hero-'+plan.type+'" style="background-image:url(assets/'+sessionTypes[plan.type].image+'.jpg)"><div class="hero-content"><div class="kicker"><i class="dot"></i>'+sessionTypes[plan.type].name+' session</div><h2>'+plan.name+'</h2><div class="meta"><span>'+icon('clock')+plan.duration+' min</span><span>'+icon('layers')+items.length+' movements</span></div>'+action('start',(active?'Resume session':'Start session')+icon('arrow'),'primary')+'</div></section>';
}
let recommendedLevel=null;
function recommendations(){
  const level=recommendedLevel??defaultLevel();
  const cards=plans.filter(p=>p.level===level).map(plan=>{
    const type=sessionTypes[plan.type];
    return '<article class="card session-card"><div class="cardtop"><span class="tile">'+icon(type.icon)+'</span><span class="tag">'+type.name+'</span></div><h2>'+plan.name+'</h2><p class="session-time">'+icon('clock')+plan.duration+' min</p><ul class="embedded-moves">'+resolvedItems(plan).map(item=>'<li><a href="#movement/'+item.id+'" data-act="detail" data-id="'+item.id+'">'+lookup(item.id).name+'</a><small>'+workload(item)+'</small></li>').join('')+'</ul><button class="outline" data-act="select-plan" data-id="'+plan.id+'">Use this session '+icon('arrow')+'</button></article>';
  });
  return heading('Recommended sessions','Choose your level and explore sessions adapted to your training setup.')+
    '<div class="session-picker level-picker" role="group" aria-label="Training level">'+levels.map((l,i)=>'<button data-act="level" data-level="'+i+'" aria-pressed="'+(level===i)+'">'+l+'</button>').join('')+'</div><div class="session-cards">'+cards.join('')+'</div>';
}
function referenceGallery(exercise){
  const reference = photoReferences[exercise.name];
  const figures = reference.files.map((file,index)=>{
    const caption = reference.captions[index];
    return '<figure><a href="'+file+'" aria-label="Open full-size photo of '+esc(exercise.name)+': '+esc(caption)+'"><img src="'+file+'" alt="'+esc(exercise.name)+' — '+esc(caption)+'"></a><figcaption>'+esc(caption)+'</figcaption></figure>';
  }).join('');
  const extra = reference.extraSource;
  const secondCredit = extra ? ' · <a href="'+esc(extra.url)+'" target="_blank" rel="noopener noreferrer">'+esc(extra.label)+'</a>' : '';
  return '<section class="card references" aria-label="Reference photos"><div class="headrow"><h2>Reference photos</h2></div><div class="photo-grid">'+figures+'</div><p class="photo-source">Source · <a href="'+esc(reference.source)+'" target="_blank" rel="noopener noreferrer">'+esc(reference.credit)+'</a>'+secondCredit+'</p></section>';
}
function movementPage(id){
  const e=lookup(id);
  if(!e)return heading('Movement unavailable','This movement could not be found.')+action('go-library','Browse movement library');
  const origin=history.state?.origin||'library';
  const backLabel=origin==='work'?'Active session':origin==='overview'?'Training overview':origin==='recommended'?'Recommended sessions':origin==='activity'?'Activity':'Movement library';
  const alternatives=[['Easier variation',e.regression],['More challenging variation',e.progression]]
    .filter(([,target])=>target!==id&&lookup(target)).map(([label,target])=>row(lookup(target),label)).join('');
  return '<a class="return-link" href="#'+origin+'">‹ &nbsp; '+backLabel+'</a>'+heading(e.name,patterns[e.p]+' · '+equipment(e))+
    '<div class="movement-layout"><section class="card player-card"><h2>Movement demonstration</h2>'+motionArt(e)+'</section>'+
    '<section class="card instructions"><h2>How to do it</h2><ol>'+movementSteps(e).map(step=>'<li>'+step+'</li>').join('')+'</ol><div class="guide-info"><b>Setup</b><p>'+
    (state.limbs==='Long arms'&&e.p===3?'Adjust your grip and pressing depth to keep your wrists comfortable.':state.limbs==='Long femurs'&&e.p===1?'Try a slightly wider stance and use support as needed.':'Choose a comfortable range you can control through the whole movement.')+'</p></div>'+
    (alternatives?'<div class="guide-info"><b>Related movements</b>'+alternatives+'</div>':'')+'</section>'+referenceGallery(e)+'</div>';
}
function startSelected(replace=false){
  const selected=currentPlan(), active=state.session;
  if(replace&&active?.programId){finishProgramSession();return}
  if(active&&active.planId!==selected.id&&(active.planId||state.planId)&&!replace){
    show('Switch sessions?','<p>Your logged sets will stay in Activity. Start '+selected.name+' or continue the current session.</p><div class="tools">'+action('replace-session','Start selected session','primary')+action('resume-session','Continue current session')+'</div>');return;
  }
  if(!active||replace)newSession(selected);
  navigate('work');
}
