importScripts('demos.js');
const cacheName='forma-offline-v6';
self.addEventListener('install',e=>e.waitUntil(caches.open(cacheName).then(c=>c.addAll(['./','index.html','engine.js','demos.js','plans.js','session-pages.js','motion.js','app.js','sync.js','account.js','style.css','assets/hero.jpg','assets/hinge.jpg','assets/lift.jpg','assets/push.jpg','assets/ropes.jpg',...Object.values(demoFrames).flat()])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('forma-offline-')&&k!==cacheName).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(!new URL(e.request.url).pathname.startsWith('/api/')&&e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('./'):Response.error()))))});



