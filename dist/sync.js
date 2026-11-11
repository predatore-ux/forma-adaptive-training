const syncKey='forma.pairing.v1';
let syncing=false;
async function syncNow(){
 const key=localStorage.getItem(syncKey);
 if(activeAccount||!key||syncing||!navigator.onLine)return;
 syncing=true;
 try{
  const {logs,...snapshot}=state;
  const response=await fetch('/api/sync',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({snapshot,logs})});
  if(!response.ok)throw Error();
  const remote=await response.json();
  if(activeAccount)return;
  const current=state;
  const observations=[...new Map([...(remote.snapshot?.observations||[]),...(current.observations||[])].map(e=>[e.uid,e])).values()];
  const merged=new Map([...remote.logs,...current.logs].map(l=>[l.session+'-'+l.at,l]));
  if(remote.snapshot.modified>state.modified)state={...initial,...remote.snapshot,logs:[]};
  state.observations=observations;
  state.logs=[...merged.values()].sort((a,b)=>a.at-b.at);
  const bio=remote.biometrics;
  if(bio&&bio.at>(state.bioReceived||0)){state.bioReceived=bio.at;state.bio={...state.bio,hrv:bio.hrv,rhr:bio.rhr,sleep:bio.sleep};state.sample=false;state.source=bio.source;state.stages=bio.stages;modulate();saveReadiness();state.modified=Date.now()}
  localStorage.setItem('forma.v1',JSON.stringify(state));
  if(!dialog.open&&!page.startsWith('movement/')&&document.activeElement?.tagName!=='INPUT')render();
  localStorage.setItem('forma.lastsync',String(Date.now()));
 }catch{/* Offline records remain queued on this device. */}finally{syncing=false}
}
async function connections(){
 if(activeAccount){show("Recovery connections","<p>Use manual measurements or import wearable JSON for this account.</p>"+action("signals","Recovery signals"));return}
 const service=await fetch('/api/status').then(r=>r.json()).catch(()=>null);
 const key=localStorage.getItem(syncKey);
 if(service?.service!=='forma-sync'){show('Wearable connections','<p>This hosted edition supports JSON imports. Run the included Forma server to enable private device sync and wearable bridge endpoints.</p>'+action('signals','Import measurements'));return}
 show('Wearable connections','<p>Pair devices with a private key to sync your profile, recovery measurements and training logs to this Forma server.</p><form id="pairform"><label for="pairkey">Pairing key</label><input type="password" id="pairkey" pattern="[a-f0-9]{64}" minlength="64" maxlength="64" value="'+(key||'')+'" placeholder="Enter an existing key"><button class="primary">'+(key?'Sync now':'Pair device')+'</button></form>'+(!key?'<div class="tools">'+action('newkey','Create private pairing key')+'</div>':'<div class="tools">'+action('copykey','Copy pairing key')+action('unlink','Disconnect device')+'</div>')+'<p><b>Wearable bridge</b><br>POST normalized HRV, resting heart rate and sleep data to <code>/api/wearables/{provider}</code> with the pairing key as a bearer token.</p><small>Providers: healthkit, garmin, oura, health-connect. HealthKit and Health Connect require a native bridge.</small>');
}
document.addEventListener('click',async e=>{
 const a=e.target.closest('[data-act]')?.dataset.act;
 if(a==='connections')connections();
 if(a==='newkey'){const key=Array.from(crypto.getRandomValues(new Uint8Array(32)),i=>i.toString(16).padStart(2,'0')).join('');$('pairkey').value=key;$('pairkey').type='text'}
 if(a==='copykey'){try{await navigator.clipboard.writeText(localStorage.getItem(syncKey));toast('Pairing key copied')}catch{$('pairkey').type='text';$('pairkey').select()}}
 if(a==='unlink'){localStorage.removeItem(syncKey);connections()}
});
document.addEventListener('submit',async e=>{
 if(e.target.id!=='pairform')return;e.preventDefault();
 const key=$('pairkey').value;if(!/^[a-f0-9]{64}$/.test(key))return;
 const response=await fetch('/api/sync',{headers:{Authorization:'Bearer '+key}}).then(r=>r.ok?r.json():null).catch(()=>null);
 if(!response)return toast('Server unavailable. Your local records are saved.');
 localStorage.setItem(syncKey,key);
 if(response.snapshot){state={...initial,...response.snapshot,logs:[...new Map([...state.logs,...response.logs].map(l=>[l.session+'-'+l.at,l])).values()]}}
 persist();await syncNow();dialog.close();render();toast('Device paired');
});
window.addEventListener('online',syncNow);
setInterval(syncNow,30000);
