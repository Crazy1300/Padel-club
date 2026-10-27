// Service worker di Padel Stats & Rankings.
// Prova sempre la rete (così vedi subito le partite nuove) e, se non c'è connessione, usa l'ultima copia salvata.
// Quando modifichi questo file o le icone, cambia il numero di versione qui sotto.
const VERSION = 'padel-v1';
const FILES = [
  './',
  'index.html',
  'partite.json',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  if(new URL(req.url).origin !== self.location.origin) return; // i font di Google li gestisce il browser
  event.respondWith(
    fetch(req)
      .then(res => {
        if(res.ok){
          const copy = res.clone();
          caches.open(VERSION).then(cache => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, {ignoreSearch: true}).then(hit =>
          hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())
        )
      )
  );
});
