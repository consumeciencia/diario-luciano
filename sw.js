const C='diario-luciano-v10';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(C).then(c=>c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  // La app misma siempre se pide fresca al servidor (sin caché del navegador) para recibir versiones nuevas.
  const fresh=e.request.mode==='navigate'||(url.origin===location.origin&&/\.(html|webmanifest|js)$|\/$/.test(url.pathname));
  const req=fresh?fetch(url.href,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request);
  e.respondWith(req.then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(C).then(c=>c.put(e.request,cp)); } return r; })
    .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
self.addEventListener('notificationclick',e=>{ e.notification.close(); e.waitUntil(clients.openWindow('./')); });
