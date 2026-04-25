// Mude este número toda vez que atualizar o app
const CACHE = 'jacke-run-v13';
const FILES = ['/Pace-trainer/', '/Pace-trainer/index.html', '/Pace-trainer/manifest.json', '/Pace-trainer/corrida.png', '/Pace-trainer/icon-192.png', '/Pace-trainer/icon-512.png'];

self.addEventListener('install', e => {
  // Força instalação imediata sem esperar aba fechar
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first para o index.html — sempre busca versão mais nova
  if(e.request.url.endsWith('index.html') || e.request.url.endsWith('/Pace-trainer/') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Atualiza cache com versão nova
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)) // Offline: usa cache
    );
    return;
  }
  // Cache first para demais recursos
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Notifica clientes quando nova versão está pronta
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
