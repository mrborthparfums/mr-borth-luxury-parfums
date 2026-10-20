// Mr. Borth Tienda — caché para abrir rápido y sin conexión
const V='mb-tienda-v9-2';
const CORE=['./','index.html','manifest.json','catalogo.json','sp0.webp?v=2','sp1.webp?v=2','sp2.webp?v=2','sp3.webp?v=2','sp4.webp?v=2','sp5.webp?v=2','icons/icon-192.png','logo-mark.png','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return; // dólar del día y fuentes: siempre de la red
  // catálogo e index: red primero (para ver precios nuevos), caché si no hay conexión
  if(u.pathname.endsWith('/')||u.pathname.endsWith('.html')||u.pathname.endsWith('catalogo.json')){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(e.request,c));return n})));
});
