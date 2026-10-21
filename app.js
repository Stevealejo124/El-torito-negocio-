/* ===========================================================
   El Torito ASADOS — app.js
   • Registra el service worker (sw.js) en cada página
   • Detecta si hay conexión y lo avisa en pantalla
   • Muestra el botón "Instalar app" cuando el navegador lo permite
   Rutas relativas: funciona en GitHub Pages dentro de /torito/
   =========================================================== */

(function () {
  'use strict';

  /* ---------- 1. Service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { scope: './' })
        .then(function (registro) {
          // Si hay una versión nueva del sw.js, avisamos a la página
          registro.addEventListener('updatefound', function () {
            var nuevo = registro.installing;
            if (!nuevo) return;
            nuevo.addEventListener('statechange', function () {
              if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
                document.dispatchEvent(new CustomEvent('torito:nueva-version'));
              }
            });
          });
        })
        .catch(function (error) {
          console.warn('[El Torito] No se pudo registrar el service worker:', error);
        });
    });
  }

  /* ---------- 2. Estado de la conexión ---------- */
  var aviso = document.getElementById('estadoConexion');
  var avisoTexto = document.getElementById('estadoConexionTexto');

  function pintarConexion() {
    if (!aviso) return;
    var enLinea = navigator.onLine;
    // Solo se muestra el aviso cuando NO hay conexión
    aviso.hidden = enLinea;
    aviso.classList.toggle('estado--offline', !enLinea);
    if (avisoTexto) {
      avisoTexto.textContent = enLinea
        ? 'Con conexión'
        : 'Sin conexión: la app sigue funcionando con lo guardado';
    }
  }

  window.addEventListener('online', pintarConexion);
  window.addEventListener('offline', pintarConexion);

  document.addEventListener('DOMContentLoaded', function () {
    pintarConexion();

    /* ---------- 3. Instalación (Android / Chrome / Edge) ---------- */
    var panel = document.getElementById('panelInstalar');
    var boton = document.getElementById('botonInstalar');
    var nota = document.getElementById('notaInstalar');
    var promptDiferido = null;

    window.addEventListener('beforeinstallprompt', function (evento) {
      evento.preventDefault();
      promptDiferido = evento;
      if (panel) panel.hidden = false;
      if (nota) nota.textContent = 'Toca el botón para agregar El Torito a tu pantalla de inicio.';
    });

    if (boton) {
      boton.addEventListener('click', function () {
        if (!promptDiferido) {
          if (nota) nota.textContent = 'Busca la opción "Instalar aplicación" o "Agregar a pantalla de inicio" en el menú de tu navegador.';
          return;
        }
        promptDiferido.prompt();
        promptDiferido.userChoice.then(function (resultado) {
          promptDiferido = null;
          if (panel && resultado.outcome === 'accepted') {
            panel.hidden = true;
          }
        });
      });
    }

    window.addEventListener('appinstalled', function () {
      if (panel) panel.hidden = true;
    });

    /* ---------- 4. Instalación en iPhone / iPad (instrucciones) ---------- */
    var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var esSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
    var instalada = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true;

    if (panel && esIOS && esSafari && !instalada) {
      panel.hidden = false;
      if (boton) boton.hidden = true;
      if (nota) {
        nota.textContent = 'En iPhone o iPad: toca el botón Compartir de Safari y elige "Agregar a pantalla de inicio".';
      }
    }

    /* ---------- 5. Año del pie de página ---------- */
    var anio = document.getElementById('anio');
    if (anio) anio.textContent = String(new Date().getFullYear());
  });
})();
