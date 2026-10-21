/* Service worker Rapikan Resi. Naikkan nomor CACHE kalau index.html diganti supaya semua pemakai dapat versi baru. */
const CACHE='rapikan-resi-v3';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];

self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.protocol!=='http:'&&url.protocol!=='https:')return;
 /* Halaman utama: ambil yang terbaru dari jaringan, kalau offline pakai simpanan */
 if(req.mode==='navigate'){
  e.respondWith(fetch(req).then(r=>{
   if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));}
   return r;
  }).catch(()=>caches.match('./index.html')));
  return;
 }
 /* File lain (ikon, pdf.js, pdf-lib, font): pakai simpanan dulu, perbarui diam-diam di latar belakang */
 e.respondWith(caches.open(CACHE).then(async c=>{
  const hit=await c.match(req);
  const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r;}).catch(()=>hit);
  return hit||net;
 }));
});
