/* Calendar bucketing uses local dates, including weeks crossing a DST boundary. */
const Progress = (() => {
 const day=(n)=>{const d=new Date(n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const monday=(n,offset=0)=>{const d=new Date(n);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7+offset*7);return +d};
 // Conventional externally loaded strength lifts only. Never infer a max for carries, timed or ballistic work.
 const lifts=new Set(['0-0','0-1','1-0','1-1','1-3','2-0','2-1','3-0','3-1','4-0','4-1','5-0','5-1','6-0']);
 const estimate=l=>lifts.has(l.id)&&l.kg>0&&l.reps>=1&&l.reps<=10?Math.round(10*(l.reps===1?l.kg:l.kg*(1+l.reps/30)))/10:null;
 function analyze(logs,now,count,get){
  const weeks=Array.from({length:count},(_,i)=>({at:monday(now,i-count+1),sets:0,volume:0,minutes:0,prs:0,sessions:new Set(),patterns:{}}));
  const byWeek=new Map(weeks.map(w=>[w.at,w])),best=new Map(),records=[],entries=[],sessions=new Set();
  for(const l of logs.filter(l=>l.at<=now).slice().sort((a,b)=>a.at-b.at)){
   const e=get(l.id);if(!e)continue;const w=byWeek.get(monday(l.at)),timed=e.p===9;
   const metric=timed?'min':l.kg>0?'kg':'reps',value=timed||metric==='reps'?l.reps:l.kg,key=l.id+metric,prev=best.get(key);
   if(value>0&&(prev===undefined||value>prev)){
    best.set(key,value);if(w){records.push({at:l.at,name:e.name,value,metric,prev});if(prev!==undefined)w.prs++}
   }
   if(!w)continue;
   entries.push(l);sessions.add(l.session);w.sessions.add(l.session);
   if(timed)w.minutes+=l.reps;else{w.sets++;w.volume+=l.kg*l.reps;w.patterns[e.p]=(w.patterns[e.p]||0)+1}
  }
  return {weeks,records,entries,sessions:sessions.size};
 }
 return {day,monday,estimate,analyze};
})();
