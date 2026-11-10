/* Original schematic movement studies. Coordinates are sagittal, vertical, and lateral. */
const FormaMotion = (() => {
  const point = (x, y, z = 0) => [x, y, z];
  const at = (v, z) => [v[0], v[1], v[2] ?? z];
  const stance = {
    hip:[0,54], shoulder:[1,96], head:[2,111],
    knee:[3,29], foot:[2,3], elbow:[3,76], hand:[5,58]
  };
  const sit = {...stance, hip:[-9,49], shoulder:[-9,91], head:[-8,106], knee:[15,48], foot:[15,4], elbow:[-4,69], hand:[12,57]};
  const hinge = {...stance,hip:[-15,45],shoulder:[13,76],head:[24,86],knee:[4,27],foot:[1,3],elbow:[12,54],hand:[9,33]};
  const squat = {...stance,hip:[-16,35],shoulder:[-1,75],head:[3,89],knee:[11,32],foot:[0,3]};
  const rack = {elbow:[12,82],hand:[7,97]};
  const overhead = {elbow:[3,115],hand:[3,136]};
  const seatedChair = ['chair'];
  const motion = {};
  function set(id, poses, props, labels, target, additions={}) {
    motion[id] = {poses,props,labels,target,...additions};
  }
  function posture(base, edits={}) { return {...base,...edits}; }
  const loweredBar = posture(hinge,{hip:[-15,40],shoulder:[10,66],head:[19,77],elbow:[11,46],hand:[10,24]});
  set('0-0',[loweredBar,stance],['barbell'],['Floor','Lockout'],'hip');
  set('0-1',[stance,posture(hinge,{knee:[1,28],hip:[-16,48],hand:[12,34]})],['dumbbells'],['Stand','Hinge'],'hip');
  const bridge = posture(stance,{hip:[-9,11],shoulder:[-34,10],head:[-49,10],knee:[11,33],foot:[28,5],elbow:[-17,7],hand:[-1,6]});
  set('0-2',[bridge,posture(bridge,{hip:[-4,29],knee:[16,34]})],[],['Lower','Lift hips'],'hip');
  set('0-3',[sit,posture(sit,{shoulder:[12,80],head:[23,91],elbow:[10,62],hand:[19,50]})],seatedChair,['Sit tall','Hinge'],'hip');
  const bell = {elbow:[10,77],hand:[13,59,0]};
  set('0-4',[posture(hinge,{elbow:[2,57],hand:[-8,37,0]}),posture(stance,{elbow:[20,94],hand:[39,94,0]})],['kettlebell'],['Backswing','Float'],'hip');
  set('1-0',[posture(stance,{elbow:[-10,81],hand:[-3,97]}),posture(squat,{elbow:[-11,61],hand:[-4,77]})],['backBar'],['Stand','Squat'],'thigh');
  set('1-1',[posture(stance,{elbow:[8,78],hand:[12,93,0]}),posture(squat,{elbow:[9,59],hand:[12,74,0]})],['goblet'],['Stand','Lower'],'thigh');
  set('1-2',[posture(stance,{elbow:[15,87],hand:[31,86]}),posture(sit,{elbow:[10,83],hand:[26,78]})],seatedChair,['Stand','Touch seat'],'thigh');
  const legPress = posture(sit,{hip:[-16,32],shoulder:[-42,64],head:[-49,76],elbow:[-36,44],hand:[-22,35],knee:[-3,53],foot:[19,49]});
  set('1-3',[legPress,posture(legPress,{knee:[12,47],foot:[35,60]})],['legPress'],['Bend','Press sled'],'thigh');
  set('1-4',[posture(squat,{elbow:[14,62],hand:[7,77]}),posture(stance,overhead)],['dumbbells'],['Front squat','Press overhead'],'thigh');
  set('1-5',[posture(squat,{elbow:[12,64],hand:[11,78,0]}),posture(stance,{elbow:[15,112],hand:[21,130,0]})],['wallBall'],['Catch low','Throw high'],'thigh');
  const split=posture(stance,{hip:[-3,51],shoulder:[-2,93],head:[0,108],knee:[13,27],foot:[19,3],farKnee:[-16,26],farFoot:[-25,4]});
  const lunge=posture(split,{hip:[-6,33],shoulder:[-4,75],head:[-2,90],knee:[17,31],farKnee:[-21,11],elbow:[-1,55],hand:[1,38]});
  set('2-0',[stance,lunge],[],['Stand','Step back'],'thigh');
  set('2-1',[split,lunge],['dumbbells'],['Split stance','Lower'],'thigh');
  set('2-2',[posture(split,{elbow:[14,78],hand:[32,79]}),posture(lunge,{elbow:[14,69],hand:[32,79]})],['rail'],['Supported stance','Lower'],'thigh');
  set('2-3',[sit,posture(sit,{knee:[15,48],foot:[44,47]})],seatedChair,['Bend knee','Extend knee'],'thigh');
  const step0=posture(stance,{hip:[-18,52],shoulder:[-17,94],head:[-16,109],knee:[1,48],foot:[14,26],farKnee:[-20,28],farFoot:[-22,4],elbow:[-14,74],hand:[-12,55]});
  const step1=posture(stance,{hip:[13,77],shoulder:[13,119],head:[14,134],knee:[15,51],foot:[14,26],farKnee:[5,51],farFoot:[4,27],elbow:[14,99],hand:[16,79]});
  set('2-4',[step0,step1],['box'],['Plant foot','Step up'],'thigh');
  const bench=posture(stance,{hip:[-5,39],shoulder:[-39,40],head:[-51,40],knee:[17,35],foot:[18,3],elbow:[-32,34,23],hand:[-33,55,14]});
  set('3-0',[bench,posture(bench,{elbow:[-36,61,12],hand:[-35,82,12]})],['bench','barbell'],['Lower bar','Press'],'chest');
  const floor=posture(bridge,{elbow:[-27,6,22],hand:[-26,26,23]});
  set('3-1',[floor,posture(floor,{elbow:[-32,31,12],hand:[-31,51,10]})],['dumbbells'],['Elbows down','Press'],'chest');
  const incline=posture(stance,{hip:[-3,40],shoulder:[27,67],head:[36,76],knee:[-24,22],foot:[-43,4],elbow:[28,48],hand:[29,29]});
  set('3-2',[incline,posture(incline,{hip:[0,31],shoulder:[32,51],head:[45,58],elbow:[15,38]})],['pushBench'],['Arms straight','Lower chest'],'chest');
  const palm=posture(sit,{elbow:[-3,74,21],hand:[12,86,0]});
  set('3-3',[palm,posture(palm,{elbow:[0,78,20],hand:[13,87,0],shoulder:[-8,92]})],['chair','palmPulse'],['Set palms','Press palms'],'chest');
  const plank=posture(stance,{foot:[-54,5],knee:[-28,16],hip:[-3,26],shoulder:[32,42],head:[44,48],elbow:[32,24],hand:[32,4]});
  const crouch=posture(squat,{hip:[0,27],shoulder:[20,49],head:[29,59],knee:[22,27],foot:[11,4],elbow:[24,28],hand:[28,6]});
  const jump=posture(stance,{hip:[0,66],shoulder:[0,108],head:[1,123],knee:[0,40],foot:[0,15],elbow:[6,124],hand:[9,140]});
  set('3-4',[stance,crouch,plank,crouch,jump],[],['Stand','Squat','Plank','Step in','Jump'],'chest');
  const row=posture(hinge,{hip:[-14,46],shoulder:[10,74],head:[19,86],elbow:[11,54],hand:[12,35]});
  set('4-0',[row,posture(row,{elbow:[-10,63],hand:[-1,48]})],['inclineBench','dumbbells'],['Reach','Row'],'back');
  set('4-1',[posture(row,{farHand:[21,38],farElbow:[18,56],farKnee:[-8,38],farFoot:[-30,37]}),posture(row,{elbow:[-9,69],hand:[-4,50],farHand:[21,38],farElbow:[18,56],farKnee:[-8,38],farFoot:[-30,37]})],['rowBench','oneDumbbell'],['Hang','Pull elbow'],'back');
  const prone=posture(stance,{hip:[-4,10],shoulder:[30,11],head:[43,11],knee:[-29,7],foot:[-56,5],elbow:[20,7,22],hand:[36,6,23]});
  set('4-2',[prone,posture(prone,{elbow:[21,17,23],hand:[36,19,25],shoulder:[30,13]})],[],['Set W','Lift arms'],'back');
  const squeeze=posture(sit,{elbow:[-7,71],hand:[9,67]});
  set('4-3',[squeeze,posture(squeeze,{shoulder:[-12,93],elbow:[-14,72,7],hand:[2,68,7]})],seatedChair,['Relax','Draw blades back'],'back');
  set('5-0',[posture(stance,{elbow:[8,81],hand:[12,98,0]}),posture(stance,{elbow:[16,109],hand:[32,124,0]})],['landmine'],['Rack','Press forward'],'arm');
  set('5-1',[posture(stance,{elbow:[7,82,15],hand:[8,100,15]}),posture(stance,overhead)],['dumbbells'],['Rack','Press'],'arm');
  const wall=posture(stance,{hip:[1,53],shoulder:[12,92],head:[17,106],knee:[-4,28],foot:[-9,3],elbow:[30,91],hand:[49,90]});
  set('5-2',[wall,posture(wall,{hip:[7,51],shoulder:[30,85],head:[39,96],elbow:[27,68]})],['wall'],['Arms straight','Lean in'],'arm');
  set('5-3',[posture(sit,{elbow:[0,73],hand:[2,90]}),posture(sit,{elbow:[-7,110],hand:[-6,128]})],seatedChair,['Set hands','Reach up'],'arm');
  set('5-4',[posture(squat,{hip:[-6,45],shoulder:[0,86],head:[2,101],elbow:[11,73],hand:[7,88]}),posture(stance,overhead)],['dumbbells'],['Dip','Drive and press'],'arm');
  const lat=posture(sit,{elbow:[-3,109,17],hand:[0,125,21]});
  set('6-0',[lat,posture(lat,{elbow:[-11,76,15],hand:[-3,96,19]})],['chair','latCable'],['Reach up','Pull down'],'back');
  const pullover=posture(bench,{elbow:[-40,60,7],hand:[-39,80,0]});
  set('6-1',[pullover,posture(pullover,{elbow:[-56,47,6],hand:[-75,43,0]})],['bench','oneDumbbell'],['Over chest','Lower overhead'],'back');
  set('6-2',[posture(prone,{elbow:[48,14,11],hand:[68,15,13]}),posture(prone,{elbow:[12,15,20],hand:[-4,15,16]})],[],['Reach forward','Sweep to sides'],'back',{cycles:'sweep'});
  set('6-3',[posture(sit,{elbow:[-2,77,15],hand:[7,91,14]}),posture(sit,{elbow:[-9,72,10],hand:[0,87,10],shoulder:[-10,90]})],seatedChair,['Set arms','Draw elbows down'],'back');
  const gaitA=posture(stance,{hip:[0,51],shoulder:[1,93],head:[2,108],knee:[11,28],foot:[21,5],farKnee:[-12,29],farFoot:[-22,7]});
  const gaitB=posture(gaitA,{knee:[-12,29],foot:[-22,7],farKnee:[11,28],farFoot:[21,5]});
  const gaitMid=posture(stance,{farKnee:[12,29],farFoot:[-8,12]});
  const gaitMidB=posture(stance,{knee:[12,29],foot:[-8,12]});
  set('7-0',[gaitA,gaitMid,gaitB,gaitMidB],['dumbbells'],['Left step','Pass','Right step','Pass'],'core');
  set('7-1',[gaitA,gaitMid,gaitB,gaitMidB],['oneDumbbell'],['Left step','Pass','Right step','Pass'],'core');
  const marchA=posture(stance,{knee:[19,48],foot:[18,24],elbow:[-8,80],hand:[6,69],farElbow:[13,83],farHand:[25,90]});
  const marchB=posture(stance,{farKnee:[19,48],farFoot:[18,24],farElbow:[-8,80],farHand:[6,69],elbow:[13,83],hand:[25,90]});
  set('7-2',[marchA,stance,marchB,stance],[],['Left knee','Lower','Right knee','Lower'],'core');
  set('7-3',[posture(sit,{elbow:[-8,70],hand:[-6,50]}),posture(sit,{elbow:[-9,70],hand:[-7,50],shoulder:[-10,92]})],['chair','dumbbells','bracePulse'],['Set grip','Brace and hold'],'core');
  const rotating=posture(stance,{elbow:[17,89,8],hand:[32,86,0]});
  const twist=(base,deg)=>posture(base,{twist:deg});
  set('8-0',[twist(rotating,-40),twist(rotating,50)],['sideCable'],['Face anchor','Rotate away'],'core');
  set('8-1',[twist(posture(stance,{elbow:[9,103,13],hand:[14,118,16]}),-35),twist(posture(squat,{elbow:[13,60,-9],hand:[20,48,-14]}),38)],['oneDumbbell'],['Start high','Chop low'],'core');
  const torso=posture(stance,{elbow:[7,78,16],hand:[11,89,-1]});
  set('8-2',[twist(torso,-40),twist(torso,40)],[],['Turn left','Turn right'],'core');
  const seatedTurn=posture(sit,{elbow:[-4,74,15],hand:[1,84,-1]});
  set('8-3',[twist(seatedTurn,-40),twist(seatedTurn,40)],seatedChair,['Turn left','Turn right'],'core');
  const rider=posture(stance,{hip:[-17,53],shoulder:[9,84],head:[19,95],elbow:[21,69],hand:[34,73],knee:[9,49],foot:[17,29],farKnee:[-5,31],farFoot:[-8,9]});
  set('9-0',[rider,posture(rider,{knee:[8,34],foot:[6,7],farKnee:[2,54],farFoot:[4,31]}),posture(rider,{knee:[-5,31],foot:[-8,9],farKnee:[9,49],farFoot:[17,29]}),posture(rider,{knee:[2,54],foot:[4,31],farKnee:[8,34],farFoot:[6,7]})],['bike'],['Push','Bottom','Recover','Top'],'thigh');
  const walkA=posture(gaitA,{elbow:[-7,74],hand:[-2,59],farElbow:[12,80],farHand:[26,76]});
  const walkB=posture(gaitB,{farElbow:[-7,74],farHand:[-2,59],elbow:[12,80],hand:[26,76]});
  set('9-1',[walkA,gaitMid,walkB,gaitMidB],[],['Left stride','Pass','Right stride','Pass'],'thigh');
  set('9-2',[posture(marchA,{knee:[12,35],foot:[8,11]}),stance,posture(marchB,{farKnee:[12,35],farFoot:[8,11]}),stance],[],['Lift left','Lower','Lift right','Lower'],'thigh');
  set('9-3',[posture(sit,{elbow:[1,100],hand:[13,115]}),posture(sit,{farElbow:[1,100],farHand:[13,115]})],seatedChair,['Reach left','Reach right'],'arm');
  const skip=posture(stance,{elbow:[-2,75,15],hand:[6,68,18],hip:[-1,49],shoulder:[0,91],head:[2,106],knee:[5,28]});
  const airborne=posture(jump,{hip:[0,62],shoulder:[0,104],head:[1,119],elbow:[-3,83,16],hand:[3,75,18],knee:[2,37],foot:[-4,14]});
  set('9-4',[skip,airborne],['rope'],['Swing overhead','Jump rope'],'thigh');
  const erg=posture(sit,{hip:[6,23],shoulder:[26,59],head:[34,71],knee:[28,41],foot:[40,18],elbow:[43,53],hand:[55,49]});
  set('9-5',[erg,posture(erg,{hip:[-12,23],shoulder:[-25,63],head:[-28,78],knee:[14,25],elbow:[-27,44],hand:[-10,44]})],['erg'],['Catch','Drive'],'back');
  const run=posture(gaitA,{hip:[-2,57],shoulder:[8,98],head:[12,112],knee:[20,53],foot:[11,29],farKnee:[-23,35],farFoot:[-33,10],elbow:[-8,81],hand:[8,78],farElbow:[20,85],farHand:[29,99]});
  const runReturn=posture(run,{knee:run.farKnee,foot:run.farFoot,farKnee:run.knee,farFoot:run.foot,elbow:run.farElbow,hand:run.farHand,farElbow:run.elbow,farHand:run.hand});
  set('9-6',[run,runReturn,posture(lunge,{shoulder:[9,71],head:[17,83],elbow:[18,54],hand:[20,35]}),posture(run,{mirror:true}),posture(runReturn,{mirror:true})],['cones'],['Run out','Stride','Plant','Turn','Run back'],'thigh');
  const jack=posture(stance,{hip:[0,50],shoulder:[2,92],head:[3,107],foot:[0,3,32],knee:[2,27,22],elbow:[1,109,18],hand:[1,126,10],farElbow:[1,109,-18],farHand:[1,126,-10]});
  const jackR=posture(jack,{foot:[1,3,8],knee:[2,27,8],farFoot:[0,3,-32],farKnee:[2,27,-22]});
  set('9-7',[stance,jack,stance,jackR],[],['Stand','Step left','Return','Step right'],'thigh');
  set('9-8',[posture(marchA,{knee:[24,56],foot:[22,31],farFoot:[-1,6]}),posture(marchB,{farKnee:[24,56],farFoot:[22,31],foot:[-1,6]})],[],['Drive left knee','Drive right knee'],'thigh');
  const ell=posture(walkA,{hip:[0,58],shoulder:[3,99],head:[6,114],knee:[18,40],foot:[20,18],farKnee:[-12,33],farFoot:[-20,13],elbow:[11,81],hand:[25,83],farElbow:[-5,83],farHand:[7,94]});
  set('9-9',[ell,posture(ell,{knee:ell.farKnee,foot:ell.farFoot,farKnee:ell.knee,farFoot:ell.foot,elbow:ell.farElbow,hand:ell.farHand,farElbow:ell.elbow,farHand:ell.hand})],['elliptical'],['Left glide','Right glide'],'thigh');

  const colors = {ink:'#233a32',skin:'#d0ab8b',shirt:'#668878',primary:'#e6a854',secondary:'#96bbac',metal:'#546b61',pad:'#93a598',floor:'#dce4da'};
  const durations = {2:3.2,3:3.8,4:3.2,5:4.5};
  const escaped = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function skeleton(p) {
    const body={};
    for(const [side,z] of [['n',7],['f',-7]]) {
      for(const key of ['hip','shoulder','knee','foot','elbow','hand']) {
        const custom=side==='f' && p['far'+key[0].toUpperCase()+key.slice(1)];
        const src=custom || p[key];
        const pos=at(src, key==='shoulder'?z*1.35:z);
        if (!custom && side==='f' && src.length===3) pos[2]=-pos[2];
        if(p.twist && ['shoulder','elbow','hand'].includes(key)){
          const t=p.twist*Math.PI/180,x=pos[0]-p.hip[0],d=pos[2];
          pos[0]=p.hip[0]+x*Math.cos(t)-d*Math.sin(t);
          pos[2]=x*Math.sin(t)+d*Math.cos(t);
        }
        if(p.mirror) pos[0]=-pos[0];
        body[side+key]=pos;
      }
    }
    ['head','hip','shoulder'].forEach(k=>{body[k]=at(p[k],0); if(p.mirror) body[k][0]*=-1;});
    body.face=p.mirror?-1:1;
    return body;
  }
  const mid=(a,b)=>a.map((v,i)=>(v+b[i])/2);
  const add=(a,x=0,y=0,z=0)=>[a[0]+x,a[1]+y,a[2]+z];
  function drawing(m,angle,name) {
    const frames=m.poses.map(skeleton);
    const count=frames.length;
    const tilt=angle==='Front'?1.42:angle==='Side'?.19:.78;
    const scale=1.17;
    const project=([x,y,z])=>[(150+(x*Math.cos(tilt)+z*Math.sin(tilt))*scale).toFixed(2),(183-y*scale+(x*Math.sin(tilt)-z*Math.cos(tilt))*.15*scale).toFixed(2)];
    const dur=durations[count]||4;
    const sequence=count===2?[0,1,0]:[...frames.keys(),0];
    const get=(value,i)=>typeof value==='function'?value(frames[i],i):value;
    const attrs=(k,vals)=>{
      const initial=k+'="'+vals[0]+'"';
      if(vals.every(v=>v===vals[0])) return [initial,''];
      const anim='<animate attributeName="'+k+'" values="'+sequence.map(i=>vals[i]).join(';')+'" dur="'+dur+'s" repeatCount="indefinite" calcMode="spline" keySplines="'+sequence.slice(1).map(()=>'.35 0 .65 1').join(';')+'"/>';
      return [initial,anim];
    };
    const path=(builder,stroke,width,fill='none',opacity=1,close=false)=>{
      const vals=frames.map((f,i)=>get(builder,i).map((v,n)=>(n?'L':'M')+project(v).join(' ')).join(' ')+(close?' Z':''));
      const [attribute,anim]=attrs('d',vals);
      return '<path '+attribute+' fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+opacity+'">'+anim+'</path>';
    };
    const round=(center,r,fill,stroke='none',sw=0)=>{
      const coords=frames.map((f,i)=>project(get(center,i)));
      const [x,ax]=attrs('cx',coords.map(c=>c[0])),[y,ay]=attrs('cy',coords.map(c=>c[1]));
      return '<circle '+x+' '+y+' r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'">'+ax+ay+'</circle>';
    };
    const beam=(a,b,c=colors.metal,w=4)=>path((f,i)=>[get(a,i),get(b,i)],c,w);
    const plate=(x,y,z,l,d,c)=>path([point(x,y,z),point(x+l,y,z),point(x+l,y,z+d),point(x,y,z+d)],c,2,c,1,true);
    const P=point,E=colors.metal,B=colors.pad;
    const fixed=[],held=[];
    const rear=p=>fixed.push(p),front=p=>held.push(p);
    const chair=(x=-10,y=44)=>{rear(plate(x-13,y,-17,27,34,B));for(const z of [-12,12]){rear(beam(P(x-10,y,z),P(x-12,1,z)));rear(beam(P(x+10,y,z),P(x+13,1,z)));} rear(beam(P(x-13,y,-13),P(x-13,y+23,-13),B,5));};
    const wheel=(x,y,r)=>rear(round(P(x,y),r,'#bfcbc0',E,3));
    for(const type of m.props){
      if(type==='chair')chair();
      if(type==='bench'||type==='rowBench'){
        const y=type==='bench'?34:35,x=type==='bench'?-56:-34;
        rear(plate(x,y,-14,65,28,B));
        for(const pos of [x+8,x+56])rear(beam(P(pos,y),P(pos,2),E,5));
      }
      if(type==='inclineBench'){
        rear(beam(P(-19,31),P(22,67),B,9));rear(beam(P(1,45),P(0,2),E,6));rear(beam(P(-27,2),P(28,2),E,6));
      }
      if(type==='rail'){rear(beam(P(33,1,-6),P(33,79,-6)));rear(beam(P(33,79,-14),P(33,79,17),B,6));}
      if(type==='box'||type==='pushBench'){
        const y=type==='box'?24:28,x=type==='box'?0:20;
        rear(path([P(x,0,14),P(x,y,14),P(x+39,y,14),P(x+39,0,14)],E,1.5,'#acbcae',1,true));
        rear(path([P(x+39,0,14),P(x+39,y,14),P(x+39,y,-14),P(x+39,0,-14)],E,1.5,'#819887',1,true));
        rear(plate(x,y,-14,39,28,'#c2cec0'));
      }
      if(type==='legPress'){
        rear(beam(P(-44,64),P(-17,26),B,8));rear(beam(P(-17,26),P(-1,28),B,8));
        for(const z of [-14,14])rear(beam(P(0,23,z),P(56,66,z),E,4));
        rear(path(f=>[add(f.nfoot,2,-8,-20),add(f.nfoot,2,-8,9),add(f.nfoot,5,11,9),add(f.nfoot,5,11,-20)],E,2,B,1,true));
      }
      if(type==='wall'||type==='wallBall'){
        const x=type==='wall'?52:59;
        rear(path([P(x,0,-24),P(x,145,-24),P(x,145,22),P(x,0,22)],'#b4c3b7',1,'#d7e1d6',.8,true));
        if(type==='wallBall')rear(round(P(x,133),7,'#b5c7b8',E,1.5));
      }
      if(type==='barbell'||type==='backBar'){
        const center=f=>type==='backBar'?add(f.shoulder,-4,1):mid(f.nhand,f.fhand);
        const ends=[-29,29];front(beam(f=>add(center(f),0,0,-37),f=>add(center(f),0,0,37),'#53665f',3));
        for(const z of ends)front(beam(f=>add(center(f),0,-8,z),f=>add(center(f),0,8,z),colors.ink,7));
      }
      if(type==='dumbbells'||type==='oneDumbbell'){
        for(const s of type==='oneDumbbell'?['n']:['f','n']){
          const h=f=>f[s+'hand'];
          front(beam(f=>add(h(f),-6),f=>add(h(f),6),'#53625b',3));
          for(const x of [-6,6])front(beam(f=>add(h(f),x,-3.4),f=>add(h(f),x,3.4),colors.ink,5));
        }
      }
      if(type==='kettlebell'||type==='goblet'){
        const h=f=>mid(f.nhand,f.fhand);
        front(round(f=>add(h(f),0,-3),5,'none',colors.ink,2.5));
        front(round(f=>add(h(f),0,-10),7,colors.ink));
      }
      if(type==='landmine'){
        rear(round(P(67,3),6,E));front(beam(P(67,3),f=>mid(f.nhand,f.fhand),E,3.8));
        front(round(f=>add(mid(f.nhand,f.fhand),1,-5),6,colors.ink));
      }
      if(type==='latCable'||type==='sideCable'){
        const anchor=type==='latCable'?P(-3,146):P(-9,86,-64);
        rear(beam(add(anchor,0,-anchor[1]+1),anchor,E,5));rear(round(anchor,4,E));
        rear(beam(anchor,f=>mid(f.nhand,f.fhand),E,1.3));
        if(type==='latCable')front(beam(f=>add(f.fhand,0,1,-4),f=>add(f.nhand,0,1,4),E,3));
      }
      if(type==='wallBall')front(round((f,i)=>i?P(46,140):add(mid(f.nhand,f.fhand),3,1),7.5,'#ad7950',colors.ink,1));
      if(type==='palmPulse'||type==='bracePulse'){
        const ref=type==='palmPulse'?f=>mid(f.nhand,f.fhand):f=>mid(f.hip,f.shoulder);
        const [rad,anim]=attrs('r',frames.map((_,i)=>i?'13':'7'));
        const coords=frames.map(f=>project(ref(f))),[x,ax]=attrs('cx',coords.map(c=>c[0])),[y,ay]=attrs('cy',coords.map(c=>c[1]));
        front('<circle '+x+' '+y+' '+rad+' fill="none" stroke="#bc7e31" stroke-width="1.5">'+ax+ay+anim+'</circle>');
      }
      if(type==='bike'){
        wheel(11,21,17);rear(beam(P(-36,3),P(44,3),E,6));rear(beam(P(-22,3),P(-17,48),E,5));rear(beam(P(-25,48),P(-9,48),colors.ink,5));
        rear(beam(P(20,13),P(34,73),E,4));rear(beam(P(31,73,-10),P(34,73,12),colors.ink,4));
        rear(beam(P(5,20),f=>f.nfoot,E,3));rear(beam(P(5,20),f=>f.ffoot,E,3));
      }
      if(type==='erg'){
        wheel(54,22,15);rear(beam(P(-49,8),P(52,12),E,4));rear(beam(P(-42,1),P(-42,8),E,6));rear(beam(P(46,1),P(46,10),E,6));
        rear(beam(f=>add(f.hip,-7,-5),f=>add(f.hip,7,-5),B,6));
        rear(beam(P(52,29),f=>mid(f.nhand,f.fhand),E,1.3));front(beam(f=>f.nhand,f=>f.fhand,E,3));
      }
      if(type==='elliptical'){
        wheel(-25,17,13);rear(beam(P(-39,2),P(48,2),E,5));rear(beam(P(37,4),P(25,69),E,4));rear(beam(P(25,69),P(38,78),E,4));
        for(const s of ['n','f']){
          rear(beam(f=>add(f[s+'foot'],-8,-2),f=>add(f[s+'foot'],8,-2),B,5));
          rear(beam(P(24,23),f=>f[s+'hand'],E,2.8));
          rear(beam(P(-25,17),f=>f[s+'foot'],E,2.5));
        }
      }
      if(type==='rope'){
        const vals=frames.map((f,i)=>{
          const a=project(f.nhand),b=project(f.fhand);
          const c1=project(i?P(-4,0,36):P(-25,145,35)),c2=project(i?P(-4,0,-36):P(-25,145,-35));
          return 'M'+a.join(' ')+' C'+c1.join(' ')+' '+c2.join(' ')+' '+b.join(' ');
        });
        const [attr,an]=attrs('d',vals);rear('<path '+attr+' stroke="#9c7147" stroke-width="2.6" fill="none">'+an+'</path>');
      }
      if(type==='cones')for(const x of [-64,64])rear(path([P(x-5,1),P(x,13),P(x+5,1)],'#c68642',1,'#d6a165',1,true));
    }
    const art=[];
    art.push('<rect width="300" height="204" rx="12" fill="#e9eee6"/>');
    for(let n=-72;n<=72;n+=24){
      art.push(beam(P(n,0,-29),P(n,0,29),'#d0dbcf',.8));
      art.push(beam(P(-78,0,n*.4),P(78,0,n*.4),'#d0dbcf',.8));
    }
    art.push(...fixed);
    const seg=(a,b,c,w)=>art.push(beam(f=>f[a],f=>f[b],c,w));
    const limb=(s)=>{
      const far=s==='f', muted=far?'#8c9b90':colors.skin;
      const leg= far?'#6d8479':m.target==='thigh'||m.target==='hip'?colors.primary:colors.secondary;
      seg(s+'hip',s+'knee',leg,far?9:10.5);seg(s+'knee',s+'foot',muted,far?6:7.2);
      art.push(beam(f=>f[s+'foot'],f=>add(f[s+'foot'],7*f.face,0),far?'#73867a':colors.ink,5));
    };
    const arm=s=>{
      const far=s==='f', c=far?'#8ca294':m.target==='arm'||m.target==='chest'||m.target==='back'?colors.primary:colors.secondary;
      seg(s+'shoulder',s+'elbow',c,far?6.8:7.7);
      seg(s+'elbow',s+'hand',far?'#ae9e89':colors.skin,far?4.5:5.3);
      art.push(round(f=>f[s+'hand'],far?2.8:3.1,far?'#ae9e89':colors.skin));
    };
    limb('f');arm('f');
    art.push(beam(f=>f.hip,f=>f.shoulder,colors.shirt,15));
    art.push(path(f=>[f.fshoulder,f.nshoulder,f.nhip,f.fhip],colors.shirt,7,colors.shirt,1,true));
    if(['core','hip','chest','back'].includes(m.target)){
      const a=f=>m.target==='hip'?f.nhip:mid(f.nhip,f.nshoulder);
      const b=f=>m.target==='hip'?add(f.nhip,0,5):m.target==='core'?add(f.nhip,0,4):f.nshoulder;
      art.push(beam(a,b,colors.primary,6));
    }
    limb('n');
    art.push(beam(f=>f.shoulder,f=>f.head,colors.skin,5.6));
    art.push(round(f=>f.head,8,colors.skin,colors.ink,.6));
    art.push(beam(f=>add(f.head,-3*f.face,4),f=>add(f.head,2*f.face,6),colors.ink,4.9));
    art.push(round(f=>add(f.head,4*f.face,1,4),.9,colors.ink));
    arm('n');art.push(...held);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 204" role="img" aria-label="'+escaped(name)+' movement illustration, '+escaped(angle)+' view" data-motion-svg="true" style="display:block;width:100%;height:auto;max-height:340px">'+art.join('')+'</svg>';
  }

  const angles=['45°','Front','Side'];
  const style='<style>.forma-motion{display:block;margin:0;color:#273d31}.forma-motion button,.forma-motion select{min-height:33px;border:1px solid #c6d1c4;background:#fff;border-radius:7px;padding:4px 9px;margin:0;color:#263c32;font:inherit;font-size:12px;cursor:pointer}.forma-motion button:focus-visible,.forma-motion select:focus-visible{outline:2px solid #345e47;outline-offset:2px}.forma-motion [aria-pressed="true"]{background:#304c3c;color:white}.forma-motion-tools{display:flex;flex-wrap:wrap;align-items:center;gap:5px;padding-top:8px}.forma-motion figcaption{font-size:11px;line-height:1.5;margin:5px 0 0;color:#496052}</style>';
  function render(exercise,options={}){
    const id=String(exercise.id),m=motion[id];
    if(!m)return '';
    const angle=angles.includes(options.angle)?options.angle:'45°', phase=Math.max(0,Math.min(m.poses.length-1,Number(options.phase)||0));
    const paused=options.paused===true||options.phase!==undefined||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const controls=options.controls===false?'':'<div class="forma-motion-tools"><button type="button" data-motion-action="toggle" aria-label="'+(paused?'Play':'Pause')+' demonstration">'+(paused?'Play':'Pause')+'</button><select aria-label="Demonstration angle" data-motion-angle>'+angles.map(a=>'<option '+(a===angle?'selected':'')+'>'+a+'</option>').join('')+'</select>'+m.labels.map((p,i)=>'<button type="button" data-motion-step="'+i+'" aria-pressed="'+(paused&&i===phase)+'">'+escaped(p)+'</button>').join('')+'</div>';
    return style+'<figure class="forma-motion" data-motion-id="'+escaped(id)+'" data-motion-name="'+escaped(exercise.name||'Exercise')+'" data-motion-initial="'+(paused?phase:'play')+'">'+drawing(m,angle,exercise.name||'Exercise')+controls+'<figcaption><span style="color:#9a611c">●</span> Working region &nbsp; <span style="color:#607d6b">●</span> Supporting region</figcaption></figure>';
  }
  function setPhase(fig,index){
    const m=motion[fig.dataset.motionId],svg=fig.querySelector('svg');
    if(!svg || !m)return;
    svg.pauseAnimations();svg.setCurrentTime((durations[m.poses.length]||4)*index/m.poses.length);
    fig.querySelectorAll('[data-motion-step]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.motionStep===index)));
    updateToggle(fig,true);
  }
  function updateToggle(fig,paused){
    const b=fig.querySelector('[data-motion-action]');
    if(b){b.textContent=paused?'Play':'Pause';b.setAttribute('aria-label',b.textContent+' demonstration');}
  }
  function init(node){
    if(node.nodeType!==1)return;
    const figures=node.matches('.forma-motion')?[node]:node.querySelectorAll('.forma-motion');
    for(const fig of figures)if(fig.dataset.motionInitial!=='play')setPhase(fig,Number(fig.dataset.motionInitial)||0);
  }
  if(typeof document!=='undefined'){
    new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(init))).observe(document.documentElement,{subtree:true,childList:true});
    document.addEventListener('click',e=>{
      const b=e.target.closest?.('[data-motion-action],[data-motion-step]');if(!b)return;
      const fig=b.closest('.forma-motion');if(!fig)return;
      if(b.dataset.motionStep!==undefined){setPhase(fig,Number(b.dataset.motionStep));return;}
      const svg=fig.querySelector('svg');
      if(svg.animationsPaused())svg.unpauseAnimations();else svg.pauseAnimations();
      fig.querySelectorAll('[data-motion-step]').forEach(s=>s.setAttribute('aria-pressed','false'));
      updateToggle(fig,svg.animationsPaused());
    });
    document.addEventListener('change',e=>{
      if(!e.target.matches('[data-motion-angle]'))return;
      const fig=e.target.closest('.forma-motion'),svg=fig.querySelector('svg'),paused=svg.animationsPaused(),time=svg.getCurrentTime();
      svg.outerHTML=drawing(motion[fig.dataset.motionId],e.target.value,fig.dataset.motionName);
      const fresh=fig.querySelector('svg');fresh.setCurrentTime(time);if(paused)fresh.pauseAnimations();
    });
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',e=>{
      if(e.matches)document.querySelectorAll('.forma-motion').forEach(f=>setPhase(f,0));
    });
  }
  return {render};
})();
function motionArt(exercise, options={}) { return FormaMotion.render(exercise,options); }
