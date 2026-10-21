/* ===========================================================
   El Torito ASADOS — Service Worker
   -----------------------------------------------------------
   Guarda en caché solo archivos PROPIOS de la app (HTML, JS,
   manifest e íconos) para que las pantallas abran rápido y se
   puedan ver aunque el internet esté lento.

   NO intercepta peticiones a Firebase ni a otros dominios:
   los pedidos y el inicio de sesión necesitan internet.

   Nota sobre Tailwind: esta app NO usa Tailwind por CDN; los
   estilos van dentro de cada página, así que sin internet las
   pantallas sí se ven con su diseño. Aun así, los pedidos y el
   panel del personal NO funcionan sin conexión.
   =========================================================== */

const VERSION = 'v1';
const CACHE = 'el-torito-' + VERSION;

/* Archivos propios de la app que conviene tener en caché */
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

/* ---------- Instalación ---------- */
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch((error) => {
        /* Si un archivo falta, la app igual funciona: no bloqueamos la instalación */
        console.warn('[El Torito] Caché incompleto:', error);
        return self.skipWaiting();
      })
  );
});

/* ---------- Activación: borra versiones anteriores ---------- */
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

/* ---------- Peticiones ---------- */
self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;

  /* Solo GET */
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);

  /* Solo el mismo origen. Firebase (firestore.googleapis.com),
     gstatic, Google y cualquier otro dominio pasan de largo:
     esas peticiones requieren internet y no se cachean. */
  if (url.origin !== self.location.origin) return;

  /* Navegación entre páginas: red primero, caché si no hay internet */
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(peticion, copia));
          return respuesta;
        })
        .catch(() => caches.match(peticion).then((enCache) => enCache || caches.match('./index.html')))
    );
    return;
  }

  /* Archivos estáticos: caché primero, luego red */
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
