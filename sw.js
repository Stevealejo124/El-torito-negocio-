/* ===========================================================
   El Torito ASADOS — Service Worker
   v2: el código se pide primero a la red, imágenes desde caché.
   =========================================================== */

const VERSION = 'v2';
const CACHE = 'el-torito-' + VERSION;

const ARCHIVOS = [
  './index.html',
  './pedidos.html',
  './login.html',
  './empleados.html',
  './administracion.html',
  './firebase-config.js',
  './comun.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* Código que puede cambiar: se pide primero a la red */
function esCodigo(url) {
  return /\.(html|js|json)$/i.test(url.pathname) || url.pathname.endsWith('/');
}

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.warn('[El Torito] Caché incompleto:', error);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves
          .filter((clave) => clave.startsWith('el-torito-') && clave !== CACHE)
          .map((clave) => caches.delete(clave))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;

  if (peticion.mode === 'navigate' || esCodigo(url)) {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          if (respuesta && respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(CACHE).then((cache) => cache.put(peticion, copia));
          }
          return respuesta;
        })
        .catch(() => {
          return caches.match(peticion).then((enCache) => {
            if (enCache) return enCache;
            if (peticion.mode === 'navigate') return caches.match('./index.html');
            return new Response('', { status: 503, statusText: 'Sin conexión' });
          });
        })
    );
    return;
  }

  evento.respondWith(
    caches.match(peticion).then((enCache) => {
      if (enCache) return enCache;
      return fetch(peticion)
        .then((respuesta) => {
          if (respuesta && respuesta.ok && respuesta.type === 'basic') {
            const copia = respuesta.clone();
            caches.open(CACHE).then((cache) => cache.put(peticion, copia));
          }
          return respuesta;
        })
        .catch(() => enCache);
    })
  );
});
