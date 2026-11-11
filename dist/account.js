const logKey=l=>l.session+'-'+l.at;
let accountPending=null,accountTimer,statusMessage='';
const metaKey=()=>stateKey()+'.sync';
function syncMeta(){return JSON.parse(localStorage.getItem(metaKey())||'{"fields":{},"at":0}')}
async function accountRequest(route,data,owner=activeAccount?.id||''){
 const r=await fetch('/api/account/'+route,{method:data?'POST':'GET',headers:{'Content-Type':'application/json','X-Forma-Request':'1','X-Forma-Owner':owner},body:data?JSON.stringify(data):undefined});
 const result=await r.json().catch(()=>({error:'The account server is unavailable.'}));
 if(!r.ok||result.error)throw Error(result.error||'The account server is unavailable.');
 return result;
}
function syncAccount(){
 if(!activeAccount)return Promise.resolve(false);
 if(accountPending)return accountPending;
 accountPending=exchange().finally(()=>accountPending=null);return accountPending;
}
async function exchange(){
 const owner=activeAccount.id,meta=syncMeta(),sent=structuredClone(state),changes=[];
 for(const key of new Set([...Object.keys(meta.fields),...Object.keys(sent)])){
  if(['logs','modified','observations'].includes(key))continue;
  const value=sent[key]??null,prev=meta.fields[key];
  if(!prev||JSON.stringify(prev.value)!==JSON.stringify(value))changes.push({key,value,base:prev?.stamp||0});
 }
 try{
  const remote=await accountRequest('sync',{changes,observations:(sent.observations||[]).filter(e=>!meta.seen?.includes(e.uid)),logs:sent.logs.filter(l=>!meta.known?.includes(logKey(l)))},owner);
  if(activeAccount?.id!==owner||JSON.parse(localStorage.getItem(accountSlot)||'null')?.id!==owner)return false;
  const fields={},merged=new Map([...remote.logs,...state.logs].map(l=>[logKey(l),l]));
  let conflict=false;
  for(const f of remote.fields){
   fields[f.key]={stamp:f.stamp,value:f.value};
   const proposed=changes.find(c=>c.key===f.key);
   if(proposed&&JSON.stringify(proposed.value)!==JSON.stringify(f.value)&&proposed.base>0)conflict=true;
   if(JSON.stringify(state[f.key]??null)===JSON.stringify(sent[f.key]??null)){if(f.value===null&&!(f.key in initial))delete state[f.key];else state[f.key]=f.value}
  }
  const before=JSON.stringify(sent);
  state.observations=[...new Map([...(remote.observations||[]),...(state.observations||[])].map(e=>[e.uid,e])).values()].sort((a,b)=>a.at-b.at);
  state.logs=[...merged.values()].sort((a,b)=>a.at-b.at);
  cacheTraining();localStorage.setItem(metaKey(),JSON.stringify({fields,at:Date.now(),seen:(remote.observations||[]).map(e=>e.uid),known:remote.logs.map(logKey)}));
  statusMessage=conflict?'A concurrent edit was kept from the other device. Both set logs are saved.':'Up to date';
  if(conflict)toast(statusMessage);
  if(before!==JSON.stringify(state)&&!dialog.open&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))render();
  return true;
 }catch(e){statusMessage=navigator.onLine?e.message:'Offline · changes saved on this device';return false}
}
function accountPanel(){
 const account=activeAccount;
 const backup='<div class="tools">'+action('export-data','Download training backup')+'</div><small>JSON includes your setup, recovery measurements, active session and set history.</small>';
 if(account){
  const at=syncMeta().at;
  show('Account & backup','<p>Signed in as <strong>'+esc(account.username)+'</strong></p><p role="status">'+esc(statusMessage||'Saved on this device')+(at?' · Last synced '+esc(new Date(at).toLocaleString()):' · Awaiting first sync')+'</p><div class="tools">'+action('account-sync','Sync now')+action('auth-login','Renew sign-in')+action('account-logout','Sign out')+'</div>'+backup);
 }else show('Account & backup','<p>You’re training as a guest. Create an account to continue on another device.</p><div class="tools">'+action('auth-register','Create account','primary')+action('auth-login','Sign in')+action('auth-recover','Recover account')+'</div>'+backup);
}
function authForm(mode){
 const register=mode==='register',recover=mode==='recover';
 const title=register?'Create account':recover?'Recover account':'Sign in';
 show(title,'<form id="account-form" data-mode="'+mode+'"><label for="acct-name">Username</label><input id="acct-name" autocomplete="username" minlength="3" maxlength="40" required value="'+esc(activeAccount?.username||'')+'"><label for="acct-password">'+(recover?'New password':'Password')+'</label><input id="acct-password" type="password" minlength="12" maxlength="128" autocomplete="'+(mode==='login'?'current-password':'new-password')+'" required>'+(recover?'<label for="acct-code">Saved recovery code</label><input id="acct-code" required minlength="64" maxlength="64">':'')+(register?'<label><input type="checkbox" id="acct-import" checked> Copy this device’s guest training into my account</label>':'')+'<button class="primary">'+title+'</button><p role="alert" id="acct-error"></p></form>');
}
document.addEventListener('submit',async e=>{
 if(e.target.id!=='account-form')return;e.preventDefault();
 const form=e.target,button=form.querySelector('button'),mode=form.dataset.mode,copy=$('acct-import')?.checked,username=$('acct-name').value.trim().toLowerCase();
 if(activeAccount&&username!==activeAccount.username){$('acct-error').textContent='Sign out before switching accounts.';return}
 button.disabled=true;
 try{
  const result=await accountRequest(mode,{username,password:$('acct-password').value,code:$('acct-code')?.value});
  const guest=state;activeAccount={id:result.id,username:result.username};localStorage.setItem(accountSlot,JSON.stringify(activeAccount));
  state=copy?structuredClone(guest):loadTraining();cacheTraining();statusMessage='';await syncAccount();guideDraft=null;page='overview';location.hash='overview';render();
  if(result.recoveryCode)show('Save your recovery code','<p>Keep this private code in a password manager. It lets you reset your password and is only shown once.</p><label for="recovery-secret">Recovery code</label><input id="recovery-secret" readonly value="'+result.recoveryCode+'">'+action('account','I saved my code','primary'));
  else accountPanel();
 }catch(err){if($('acct-error'))$('acct-error').textContent=err.message}finally{button.disabled=false}
});
document.addEventListener('click',async e=>{
 const a=e.target.closest('[data-act]')?.dataset.act;
 if(a==='account')accountPanel();
 if(a?.startsWith('auth-'))authForm(a.slice(5));
 if(a==='account-sync'){await syncAccount();accountPanel()}
 if(a==='account-logout'){
  if(!await syncAccount()){toast('Sync before signing out. Your offline training is still saved.');return}
  try{await accountRequest('logout',{});const key=stateKey();localStorage.removeItem(metaKey());localStorage.removeItem(key);opened.then(d=>d?.transaction('snapshots','readwrite').objectStore('snapshots').delete(key));localStorage.removeItem(accountSlot);activeAccount=null;state=loadTraining();guideDraft=null;statusMessage='';navigate('overview');accountPanel()}catch(err){toast(err.message)}
 }
 if(a==='export-data'){
  const blob=new Blob([JSON.stringify({format:'forma-training',version:1,exportedAt:new Date().toISOString(),training:state},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='forma-training-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
});
function scheduleAccount(){clearTimeout(accountTimer);accountTimer=setTimeout(syncAccount,350)}
window.addEventListener('forma-saved',scheduleAccount);window.addEventListener('online',scheduleAccount);window.addEventListener('focus',scheduleAccount);
setInterval(syncAccount,30000);scheduleAccount();
