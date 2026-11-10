import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const dir=process.env.FORMA_DATA_DIR || join(process.env.LOCALAPPDATA||tmpdir(),'FormaTraining');
let db;
function database(){
 if(db)return db;
 mkdirSync(dir,{recursive:true});
 db=new DatabaseSync(join(dir,'training.sqlite'));
 db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records(owner TEXT, kind TEXT, id TEXT, stamp INTEGER, body TEXT, PRIMARY KEY(owner,kind,id))');
 return db;
}
export async function trainingAPI(req,res,url){
 const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value))};
 if(url.pathname==='/api/status')return json(200,{service:'forma-sync',version:1});
 const key=(req.headers.authorization||'').replace(/^Bearer /,'');
 if(!/^[a-f0-9]{64}$/.test(key))return json(401,{error:'A private pairing key is required.'});
 const owner=createHash('sha256').update(key).digest('hex');
 const sql=database();
 const select=sql.prepare('SELECT body FROM records WHERE owner=? AND kind=? ORDER BY stamp');
 const rows=kind=>select.all(owner,kind).map(r=>JSON.parse(r.body));
 if(req.method==='GET'&&url.pathname==='/api/sync')return json(200,{logs:rows('log'),snapshot:rows('snapshot')[0],biometrics:rows('biometric').at(-1)});
 if(req.method!=='POST')return json(405,{error:'POST required'});
 let data;
 try{let n=0,chunks=[];for await(const chunk of req){n+=chunk.length;if(n>4000000)return json(413,{error:'Payload too large'});chunks.push(chunk)}data=JSON.parse(Buffer.concat(chunks))}catch{return json(400,{error:'Invalid JSON'})}
 const insert=sql.prepare('INSERT INTO records VALUES(?,?,?,?,?) ON CONFLICT(owner,kind,id) DO UPDATE SET stamp=excluded.stamp,body=excluded.body WHERE excluded.stamp>records.stamp');
 if(url.pathname==='/api/sync'){
  if(!Array.isArray(data.logs)||!Number.isSafeInteger(data.snapshot?.modified)||data.logs.some(l=>!l.session||!Number.isSafeInteger(l.at)||!/^\d-\d$/.test(l.id)||!Number.isFinite(l.kg)||!Number.isFinite(l.reps)))return json(400,{error:'Invalid session payload'});
  sql.exec('BEGIN');
  try{for(const l of data.logs)insert.run(owner,'log',l.session+'-'+l.at,l.at,JSON.stringify(l));insert.run(owner,'snapshot','current',data.snapshot.modified,JSON.stringify(data.snapshot));sql.exec('COMMIT')}catch(err){sql.exec('ROLLBACK');throw err}
  return json(200,{logs:rows('log'),snapshot:rows('snapshot')[0],biometrics:rows('biometric').at(-1)});
 }
 const match=url.pathname.match(/^\/api\/wearables\/(healthkit|garmin|oura|health-connect)$/);
 if(!match)return json(404,{error:'Unknown endpoint'});
 const valid=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
 if(!valid(data.hrv,1,400)||!valid(data.rhr,20,220)||!valid(data.sleep,0,24))return json(400,{error:'Expected hrv in ms, rhr in bpm, and sleep in hours'});
 const at=data.measuredAt?Date.parse(data.measuredAt):Date.now();
 if(!Number.isFinite(at)||at>Date.now()+300000)return json(400,{error:'Invalid measuredAt'});
 const stages=data.stages||{};
 if(Object.values(stages).some(v=>!valid(v,0,1440)))return json(400,{error:'Sleep stages must be minutes'});
 insert.run(owner,'biometric',match[1]+'-'+at,at,JSON.stringify({source:match[1],at,hrv:data.hrv,rhr:data.rhr,sleep:data.sleep,stages}));
 return json(200,{received:true});
}
