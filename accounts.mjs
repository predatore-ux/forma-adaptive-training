import {randomBytes,createHash,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt), token=()=>randomBytes(32).toString('hex'), hash=v=>createHash('sha256').update(v).digest('hex');
const ttl=30*86400000;
export function initAccounts(db){
 db.exec(`CREATE TABLE IF NOT EXISTS athletes(id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, verifier TEXT NOT NULL, recovery TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS devices(token TEXT PRIMARY KEY, athlete TEXT NOT NULL, expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS fields(athlete TEXT, field TEXT, stamp INTEGER, value TEXT, PRIMARY KEY(athlete,field));`);
}
const attempts=new Map();
function allowed(ip){
 const now=Date.now();for(const [k,v] of attempts)if(v.end<=now)attempts.delete(k);
 const v=attempts.get(ip)||{count:0,end:now+600000};attempts.set(ip,v);return ++v.count<=30;
}
export async function accountAPI({req,res,url,sql,json,data}){
 const route=url.pathname.slice('/api/account/'.length);
 if(req.method==='POST'&&(req.headers['x-forma-request']!=='1'||req.headers['sec-fetch-site']==='cross-site'))return json(403,{error:'Same-site request required.'});
 const cookie=(req.headers.cookie||'').match(/(?:^|;\s*)forma_device=([a-f0-9]{64})(?:;|$)/)?.[1];
 const athlete=cookie&&sql.prepare('SELECT a.id,a.username FROM devices d JOIN athletes a ON d.athlete=a.id WHERE d.token=? AND d.expires>?').get(hash(cookie),Date.now());
 function setCookie(value,age){res.setHeader('Set-Cookie','forma_device='+value+'; Path=/api/account/; HttpOnly; SameSite=Strict; Max-Age='+age+(process.env.NODE_ENV==='production'?'; Secure':''))}
 function login(id,username,extra={}){
  const secret=token();sql.prepare('DELETE FROM devices WHERE expires<=?').run(Date.now());sql.prepare('INSERT INTO devices VALUES(?,?,?)').run(hash(secret),id,Date.now()+ttl);setCookie(secret,ttl/1000);return json(200,{id,username,...extra});
 }
 if(['register','login','recover'].includes(route)&&req.method==='POST'){
  if(!allowed(req.socket.remoteAddress))return json(429,{error:'Too many attempts. Try again in ten minutes.'});
  const name=String(data.username||'').trim().toLowerCase(),pw=data.password;
  if(!/^[a-z0-9_.-]{3,40}$/.test(name)||typeof pw!=='string'||pw.length<12||pw.length>128)return json(400,{error:'Use a 3–40 character username and a 12–128 character password.'});
  const a=sql.prepare('SELECT * FROM athletes WHERE username=?').get(name);
  if(route==='login'){
   const result=await derive(pw,a?.salt||'forma-missing-account',64);
   if(!a||!timingSafeEqual(result,Buffer.from(a.verifier,'hex')))return json(401,{error:'Incorrect username or password.'});
   return login(a.id,name);
  }
  if(route==='recover'&&(!a||typeof data.code!=='string'||hash(data.code)!==a.recovery))return json(403,{error:'Incorrect username or recovery code.'});
  const salt=token(),verifier=(await derive(pw,salt,64)).toString('hex'),code=token();
  const id=route==='register'?token():a.id;
  if(route==='register'){
   if(!sql.prepare('INSERT OR IGNORE INTO athletes VALUES(?,?,?,?,?)').run(id,name,salt,verifier,hash(code)).changes)return json(409,{error:'Choose another username.'});
  }else{
   if(!sql.prepare('UPDATE athletes SET salt=?,verifier=?,recovery=? WHERE id=? AND recovery=?').run(salt,verifier,hash(code),id,hash(data.code)).changes)return json(403,{error:'Code already used.'});
   sql.prepare('DELETE FROM devices WHERE athlete=?').run(id);
  }
  return login(id,name,{recoveryCode:code});
 }
 if(!athlete||req.headers['x-forma-owner']!==athlete.id)return json(401,{error:'Sign in again to sync this account.'});
 if(route==='logout'&&req.method==='POST'){sql.prepare('DELETE FROM devices WHERE token=?').run(hash(cookie));setCookie('',0);return json(200,{ok:true})}
 if(route!=='sync'||!['GET','POST'].includes(req.method))return json(404,{error:'Unknown account endpoint.'});
 const id=athlete.id;
 if(req.method==='POST'){
  const {changes,logs,observations=[]}=data;
  if(!Array.isArray(observations)||observations.some(e=>!validObservation(e)))return json(400,{error:'Invalid progress observation.'});
  if(!Array.isArray(logs)||!Array.isArray(changes)||changes.length>64||changes.some(c=>!c||!/^\w{1,32}$/.test(c.key)||['__proto__','constructor','prototype','logs','modified','observations'].includes(c.key)||!Number.isSafeInteger(c.base)||c.base<0)||logs.some(l=>!l||typeof l.session!=='string'||!Number.isSafeInteger(l.at)||!/^\d+-\d+$/.test(l.id)||!Number.isFinite(l.kg)||!Number.isFinite(l.reps)))return json(400,{error:'Invalid training data.'});
  sql.exec('BEGIN');
  try{
   const save=sql.prepare('INSERT INTO fields VALUES(?,?,1,?) ON CONFLICT(athlete,field) DO UPDATE SET stamp=fields.stamp+1,value=excluded.value WHERE fields.stamp=?');
   for(const c of changes)save.run(id,c.key,JSON.stringify(c.value??null),c.base);
   const append=sql.prepare('INSERT OR IGNORE INTO records VALUES(?,?,?,?,?)');
   for(const e of observations)append.run(id,'observation',e.uid,e.at,JSON.stringify(e));
   for(const l of logs)append.run(id,'set',l.session+'-'+l.at,l.at,JSON.stringify(l));
   sql.exec('COMMIT');
  }catch(err){sql.exec('ROLLBACK');throw err}
 }
 return json(200,{observations:sql.prepare("SELECT body FROM records WHERE owner=? AND kind='observation' ORDER BY stamp").all(id).map(e=>JSON.parse(e.body)),fields:sql.prepare('SELECT field AS key,stamp,value FROM fields WHERE athlete=?').all(id).map(f=>({...f,value:JSON.parse(f.value)})),logs:sql.prepare("SELECT body FROM records WHERE owner=? AND kind='set' ORDER BY stamp").all(id).map(l=>JSON.parse(l.body))});
}

function validObservation(e){
 if(!e||typeof e.uid!=='string'||!/^[a-f0-9-]{36}$/i.test(e.uid)||!Number.isSafeInteger(e.at)||e.at<=0)return false;
 const limits=e.kind==='body'?{weight:[0.1,650],waist:[0.1,400],hip:[0.1,400],chest:[0.1,400]}:e.kind==='readiness'?{score:[0,100],stress:[0,10],energy:[0,10],pain:[0,10],hrv:[1,400],rhr:[20,220],sleep:[0,24]}:null;
 if(!limits||e.kind==='readiness'&&!Number.isFinite(e.score))return false;
 const keys=Object.keys(e).filter(k=>!['uid','at','kind'].includes(k));
 return keys.length>0&&keys.every(k=>Object.hasOwn(limits,k)&&Number.isFinite(e[k])&&e[k]>=limits[k][0]&&e[k]<=limits[k][1]);
}
