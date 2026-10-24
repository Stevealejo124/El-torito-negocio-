/* ===========================================================
   El Torito ASADOS — Service Worker
   -----------------------------------------------------------
   v2 (21/10/2026): los archivos de código (HTML, JS, manifest)
   ahora se piden PRIMERO a la red. Así, cuando se sube un
   cambio, se ve en la siguiente visita sin tener que borrar
   la caché ni subir la versión a mano. Las imágenes sí salen
   de caché porque cambian poco.

   NO intercepta peticiones a Firebase ni a otros dominios:
   los pedidos y el inicio de sesión necesitan internet.

   Nota sobre Tailwind: esta app NO usa Tailwind por CDN; los
   estilos van dentro de cada página, así que sin internet las
   pantallas sí se ven con su diseño. Aun así, los pedidos y el
   panel del personal NO funcionan sin conexión.
   =========================================================== */

const VERSION = 'v3';
const CACHE = 'el-torito-' + VERSION;

/* Archivos propios de la app que conviene tener en caché */
const ARCHIVOS = [
  './index.html',
  './pedidos.html',
  './login.html',
  './empleados.html',
  './administracion.html',
  './cargar-menu.html',
  './firebase-config.js',
  './comun.js',
  './apoyo.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* Lo que se pide primero a la red (código que puede cambiar) */
function esCodigo(url) {
  return /\.(html|js|json)$/i.test(url.pathname) || url.pathname.endsWith('/');
}

/* ---------- Instalación ---------- */
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
     gstatic, Google y cualquier otro dominio pasan de largo. */
  if (url.origin !== self.location.origin) return;

  /* Navegación y archivos de código: RED PRIMERO, caché si no hay internet.
     Así los cambios que se suben a GitHub se ven de inmediato. */
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

  /* Imágenes y demás: caché primero, luego red */
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
