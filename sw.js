const C='diario-luciano-v13';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(C).then(c=>c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='diario-cfg').map(x=>caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return;
  // La app misma siempre se pide fresca al servidor (sin caché del navegador) para recibir versiones nuevas.
  const fresh=e.request.mode==='navigate'||(url.origin===location.origin&&/\.(html|webmanifest|js)$|\/$/.test(url.pathname));
  const req=fresh?fetch(url.href,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request);
  e.respondWith(req.then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(C).then(c=>c.put(e.request,cp)); } return r; })
    .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
self.addEventListener('push',e=>{ e.waitUntil((async()=>{
  let body='Hay novedades en el diario de Luciano';
  try{ const c=await caches.open('diario-cfg'), r=await c.match('cfg');
    if(r){ const cfg=await r.json(); const l=await (await fetch(cfg.api+'/f/'+cfg.code+'/last',{cache:'no-store'})).json(); if(l.last&&l.last.msg) body=l.last.msg; } }catch(_){}
  await self.registration.showNotification('Diario de Luciano',{body,icon:'icon-192.png',badge:'icon-192.png',tag:'diario',renotify:true});
})()); });
self.addEventListener('notificationclick',e=>{ e.notification.close(); e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow('./'))); });
