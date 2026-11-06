// Mr. Borth Tienda — caché para abrir rápido y sin conexión
const V='mb-tienda-v11';
const CORE=['./','index.html','manifest.json','catalogo.json','icons/icon-192.png','logo-mark.png','logo.png'];
// Fotos de los perfumes recortadas sin fondo (img/<id>.webp): la lista sale del propio catálogo (campo "img"),
// así siempre coincide con los perfumes publicados. Se guardan en segundo plano sin frenar la instalación.
const fotos=()=>fetch('catalogo.json',{cache:'no-store'}).then(r=>r.json()).then(d=>[...new Set(d.map(p=>(p.img||('img/'+p.id+'.jpg')).replace(/\.(jpe?g|png)$/i,'.webp')))]);
async function guardarFotos(){
  try{
    const c=await caches.open(V),lista=await fotos();
    for(let i=0;i<lista.length;i+=12){
      await Promise.all(lista.slice(i,i+12).map(u=>c.match(u).then(h=>h||c.add(u)).catch(()=>{})));
    }
  }catch(e){}
}
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()).then(()=>{guardarFotos()}))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return; // dólar del día y fuentes: siempre de la red
  // catálogo e index: red primero (para ver precios nuevos), caché si no hay conexión
  if(u.pathname.endsWith('/')||u.pathname.endsWith('.html')||u.pathname.endsWith('catalogo.json')){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(e.request,c))}return n})));
});
