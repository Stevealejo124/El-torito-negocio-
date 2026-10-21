/* ===========================================================
   El Torito ASADOS — Service Worker
   Caché básico para que la app abra sin conexión.
   Todas las rutas son relativas: la app vive en la RAÍZ del
   repositorio publicado con GitHub Pages.
   =========================================================== */

const VERSION = 'v1';
const CACHE = 'torito-' + VERSION;

/* Archivos que forman el "cascarón" de la app (app shell).
   Deben existir para que la app abra sin internet. */
const ARCHIVOS = [
  './index.html',
  './pedidos.html',
  './empleados.html',
  './administracion.html',
  './manifest.json',
  './estilos.css',
  './app.js',
  './icono-32.png',
  './icono-64.png',
  './icono-apple-180.png',
  './icono-192.png',
  './icono-512.png',
  './icono-maskable-192.png',
  './icono-maskable-512.png',
  './logo.jpg'
];

/* ---------- Instalación: guarda el cascarón en caché ---------- */
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => {
      // cache: 'reload' evita tomar versiones viejas del caché HTTP
      const peticiones = ARCHIVOS.map((url) => new Request(url, { cache: 'reload' }));
      return cache.addAll(peticiones);
    }).then(() => self.skipWaiting())
  );
});

/* ---------- Activación: borra cachés de versiones anteriores ---------- */
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) => {
      return Promise.all(
        claves
          .filter((clave) => clave.startsWith('torito-') && clave !== CACHE)
          .map((clave) => caches.delete(clave))
      );
    }).then(() => self.clients.claim())
  );
});

/* ---------- Estrategias de respuesta ---------- */
self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;

  // Solo GET y solo del mismo origen (GitHub Pages)
  if (peticion.method !== 'GET') return;
  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;

  // 1) Navegación entre páginas: red primero, caché si no hay internet
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(peticion, copia));
          return respuesta;
        })
        .catch(() => {
          return caches.match(peticion).then((enCache) => {
            if (enCache) return enCache;
            return caches.match('./index.html').then((inicio) => {
              return inicio || respuestaSinConexion();
            });
          });
        })
    );
    return;
  }

  // 2) Estáticos (css, js, imágenes): caché primero, luego red
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
        .catch(() => enCache || respuestaSinConexion());
    })
  );
});

/* Aviso mínimo cuando no hay internet ni copia en caché */
function respuestaSinConexion() {
  return new Response(
    '<!DOCTYPE html><html lang="es"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<body style="font-family:system-ui,sans-serif;background:#fae9cb;color:#4a1002;' +
    'text-align:center;padding:48px 24px">' +
    '<h1 style="font-size:1.4rem">Sin conexión</h1>' +
    '<p>Este contenido todavía no está guardado en el celular. ' +
    'Conéctate a internet e intenta de nuevo.</p>' +
    '<p><a href="./index.html" style="color:#7a1c08;font-weight:700">Volver al inicio</a></p>' +
    '</body></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
  );
}

/* ---------- Mensajes desde la app (por si luego se necesita) ---------- */
self.addEventListener('message', (evento) => {
  if (evento.data === 'actualizar') {
    self.skipWaiting();
  }
});
