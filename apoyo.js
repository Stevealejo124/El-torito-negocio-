/* ===========================================================
   Sopas y Asados El Torito — apoyo visual y botones de ayuda
   -----------------------------------------------------------
   Este archivo se carga en TODAS las páginas y hace tres cosas:

   1. Agrega un botón flotante de WhatsApp para pedir ayuda
      cuando el sitio no funciona o hay un problema.
   2. Agrega el botón «Descargar aplicación», que aparece
      SIEMPRE, aunque la app ya esté instalada.
   3. Aplica mejoras visuales generales (bordes, sombras,
      transiciones, foco del teclado, categorías del menú).

   No guarda nada en el celular ni toca Firebase.
   =========================================================== */

(function () {
  'use strict';

  /* ------- Datos del negocio ------- */
  var WHATSAPP = '50375619821';           // +503 7561 9821
  var MENSAJE_AYUDA = 'Hola, necesito ayuda con el sitio web de Sopas y Asados El Torito.';

  /* =========================================================
     1. ESTILOS
     ========================================================= */
  var CSS = [
    /* --- mejoras visuales generales --- */
    'html{scroll-behavior:smooth}',
    '@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}',
    'body{padding-bottom:90px}',

    ':focus-visible{outline:3px solid #f3b020;outline-offset:2px;border-radius:6px}',

    '.barra{backdrop-filter:saturate(1.1)}',
    '.barra__logo{border-radius:12px;box-shadow:0 3px 10px rgba(0,0,0,.35)}',
    '.barra__titulo{letter-spacing:.01em}',

    '.tarjeta{transition:box-shadow .18s ease, transform .18s ease}',
    '.boton{transition:transform .12s ease, box-shadow .12s ease, filter .12s ease}',
    '@media (hover:hover){.boton:hover{filter:brightness(1.05);transform:translateY(-1px)}}',

    '.categoria{display:flex;align-items:center;gap:10px}',
    '.categoria::after{content:"";flex:1 1 auto;height:2px;border-radius:2px;'
      + 'background:linear-gradient(90deg,rgba(243,176,32,.95),rgba(243,176,32,0))}',

    '.platillo{transition:background .15s ease,padding-left .15s ease;border-radius:10px}',
    '@media (hover:hover){.platillo:hover{background:rgba(250,233,203,.5);padding-left:8px}}',
    '.platillo__precio{font-variant-numeric:tabular-nums}',

    '.pie{margin-top:26px}',
    '.pie p{opacity:.85}',

    /* --- contenedor de los botones flotantes --- */
    '.apoyo-flotantes{position:fixed;right:14px;'
      + 'bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;'
      + 'align-items:flex-end;gap:10px;z-index:70}',

    '.apoyo-boton{display:inline-flex;align-items:center;justify-content:center;gap:8px;'
      + 'width:50px;height:50px;padding:0;border-radius:50%;border:0;cursor:pointer;opacity:.97;'
      + 'font:inherit;font-weight:800;text-decoration:none;'
      + 'box-shadow:0 8px 20px rgba(42,20,5,.30);transition:transform .14s ease,box-shadow .14s ease}',
    '.apoyo-boton:active{transform:scale(.94);box-shadow:0 3px 10px rgba(42,20,5,.35)}',
    '.apoyo-boton svg{display:block}',

    '.apoyo-boton--wa{background:#25d366;color:#fff}',
    '.apoyo-boton--instalar{background:linear-gradient(180deg,#ffd166,#f3b020);color:#3b1e08;'
      + 'border:2px solid #b98111;width:auto;height:44px;border-radius:999px;padding:0 14px;font-size:12.5px}',
    '.apoyo-boton--instalar .apoyo-texto{white-space:nowrap}',

    '@media (max-width:360px){.apoyo-boton--instalar .apoyo-texto{display:none}'
      + '.apoyo-boton--instalar{width:54px;padding:0;border-radius:50%;height:54px}}',

    /* --- ventana de instrucciones para instalar --- */
    '.apoyo-fondo{position:fixed;inset:0;z-index:95;display:flex;align-items:center;'
      + 'justify-content:center;padding:18px;background:rgba(20,10,3,.62);'
      + 'backdrop-filter:blur(2px)}',
    '.apoyo-caja{width:100%;max-width:440px;max-height:88vh;overflow:auto;'
      + 'background:#fbf4e6;border:2px solid #f3b020;border-radius:18px;padding:20px;'
      + 'box-shadow:0 22px 50px rgba(0,0,0,.4);color:#2b1a0f;font-size:15px;line-height:1.5}',
    '.apoyo-caja h2{margin:0 0 4px;font-size:19px;color:#4a1002}',
    '.apoyo-caja p{margin:0 0 10px}',
    '.apoyo-caja ol{margin:0 0 12px;padding-left:20px}',
    '.apoyo-caja li{margin:0 0 8px}',
    '.apoyo-caja strong{color:#4a1002}',
    '.apoyo-caja__nota{font-size:13px;color:#6d5443;background:rgba(243,176,32,.16);'
      + 'border-left:4px solid #f3b020;border-radius:8px;padding:10px 12px;margin:0 0 14px}',
    '.apoyo-cerrar{display:block;width:100%;padding:13px 16px;border:0;border-radius:12px;'
      + 'background:linear-gradient(180deg,#ffd166,#f3b020);color:#3b1e08;font:inherit;'
      + 'font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 3px 0 #b98111}',

    /* --- aviso pequeño --- */
    '.apoyo-aviso{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));'
      + 'transform:translateX(-50%);max-width:92vw;background:#2a1405;color:#fae9cb;'
      + 'padding:12px 18px;border-radius:999px;font-size:14px;font-weight:700;z-index:99;'
      + 'box-shadow:0 10px 26px rgba(0,0,0,.35);border:1px solid rgba(243,176,32,.5)}'
  ].join('');

  function inyectarEstilos() {
    if (document.getElementById('apoyo-estilos')) return;
    var estilo = document.createElement('style');
    estilo.id = 'apoyo-estilos';
    estilo.textContent = CSS;
    document.head.appendChild(estilo);
  }

  /* =========================================================
     2. ICONOS
     ========================================================= */
  var ICONO_WA = '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
    + '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38'
    + 'c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02'
    + 'h-.01c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.34c0-4.54 '
    + '3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.16 8.16 0 0 1 2.41 5.83c0 4.54-3.7 8.2-8.18 8.2zm'
    + '4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.96-.14.17-.29.19-.54.06'
    + '-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44'
    + '.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47'
    + 'c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.23 3.74'
    + '.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18'
    + '-.06-.11-.23-.17-.48-.29z"/></svg>';

  var ICONO_DESCARGAR = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" '
    + 'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" '
    + 'aria-hidden="true"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/>'
    + '<path d="M5 21h14"/></svg>';

  /* =========================================================
     3. AVISO PEQUEÑO
     ========================================================= */
  var avisoActual = null;
  function avisar(texto) {
    if (avisoActual) avisoActual.remove();
    var elemento = document.createElement('div');
    elemento.className = 'apoyo-aviso';
    elemento.setAttribute('role', 'status');
    elemento.textContent = texto;
    document.body.appendChild(elemento);
    avisoActual = elemento;
    setTimeout(function () {
      if (elemento.parentNode) elemento.remove();
      if (avisoActual === elemento) avisoActual = null;
    }, 3800);
  }

  /* =========================================================
     4. INSTALAR LA APLICACIÓN
     ---------------------------------------------------------
     El botón se muestra SIEMPRE. Si el navegador ofrece el
     aviso automático, se usa; si no (por ejemplo en iPhone, o
     porque la app ya está instalada), se muestran las
     instrucciones paso a paso.
     ========================================================= */
  var eventoInstalacion = null;

  window.addEventListener('beforeinstallprompt', function (evento) {
    evento.preventDefault();
    eventoInstalacion = evento;
  });

  window.addEventListener('appinstalled', function () {
    eventoInstalacion = null;
    avisar('¡Listo! La aplicación quedó instalada.');
  });

  function yaInstalada() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
      || window.navigator.standalone === true;
  }

  function esIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function esAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  function pedirInstalacion() {
    if (eventoInstalacion) {
      eventoInstalacion.prompt();
      eventoInstalacion.userChoice.then(function (resultado) {
        if (resultado && resultado.outcome === 'accepted') {
          avisar('Instalando la aplicación…');
        }
        eventoInstalacion = null;
      }).catch(function () {
        eventoInstalacion = null;
      });
      return;
    }
    mostrarInstrucciones();
  }

  function mostrarInstrucciones() {
    var pasos;
    var titulo;

    if (yaInstalada()) {
      titulo = 'Ya la tienes instalada';
      pasos = '<p class="apoyo-caja__nota">Esta aplicación ya está instalada en este celular. '
        + 'Búscala en la pantalla de inicio con el ícono del torito y ábrela desde ahí.</p>'
        + '<p>Si no la encuentras, desliza hacia arriba en la pantalla de inicio y usa el buscador '
        + 'del celular escribiendo <strong>El Torito</strong>.</p>';
    } else if (esIOS()) {
      titulo = 'Instalar en iPhone';
      pasos = '<ol>'
        + '<li>Abre esta página en <strong>Safari</strong> (no en Chrome).</li>'
        + '<li>Toca el botón <strong>Compartir</strong>: el cuadro con la flecha hacia arriba, '
        + 'abajo en el centro.</li>'
        + '<li>Baja en la lista y toca <strong>«Agregar a inicio»</strong>.</li>'
        + '<li>Toca <strong>«Agregar»</strong> arriba a la derecha.</li>'
        + '</ol>'
        + '<p>El ícono del torito quedará en tu pantalla de inicio, como una app más.</p>';
    } else if (esAndroid()) {
      titulo = 'Instalar en Android';
      pasos = '<ol>'
        + '<li>Abre esta página en <strong>Chrome</strong>.</li>'
        + '<li>Toca los <strong>tres puntos</strong> arriba a la derecha.</li>'
        + '<li>Toca <strong>«Instalar aplicación»</strong> o <strong>«Agregar a la pantalla '
        + 'principal»</strong>.</li>'
        + '<li>Confirma tocando <strong>«Instalar»</strong>.</li>'
        + '</ol>'
        + '<p>El ícono del torito quedará en tu pantalla de inicio, como una app más.</p>';
    } else {
      titulo = 'Instalar en esta computadora';
      pasos = '<ol>'
        + '<li>En <strong>Chrome o Edge</strong>, busca el ícono de instalar en la barra de '
        + 'direcciones (una flecha dentro de un cuadro) o abre el menú de tres puntos.</li>'
        + '<li>Elige <strong>«Instalar Sopas y Asados El Torito»</strong>.</li>'
        + '</ol>'
        + '<p class="apoyo-caja__nota">Para instalarla en el celular, abre esta misma dirección '
        + 'desde el navegador del celular y sigue los pasos de la pantalla.</p>';
    }

    abrirVentana(titulo, pasos);
  }

  function abrirVentana(titulo, contenidoHtml) {
    cerrarVentana();

    var fondo = document.createElement('div');
    fondo.className = 'apoyo-fondo';
    fondo.id = 'apoyo-ventana';
    fondo.setAttribute('role', 'dialog');
    fondo.setAttribute('aria-modal', 'true');
    fondo.setAttribute('aria-label', titulo);

    var caja = document.createElement('div');
    caja.className = 'apoyo-caja';

    var encabezado = document.createElement('h2');
    encabezado.textContent = titulo;

    var cuerpo = document.createElement('div');
    cuerpo.innerHTML = contenidoHtml;

    var boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'apoyo-cerrar';
    boton.textContent = 'Entendido';

    caja.appendChild(encabezado);
    caja.appendChild(cuerpo);
    caja.appendChild(boton);
    fondo.appendChild(caja);
    document.body.appendChild(fondo);

    boton.focus();
    boton.addEventListener('click', cerrarVentana);
    fondo.addEventListener('click', function (evento) {
      if (evento.target === fondo) cerrarVentana();
    });
    document.addEventListener('keydown', cerrarConEscape);
  }

  function cerrarConEscape(evento) {
    if (evento.key === 'Escape') cerrarVentana();
  }

  function cerrarVentana() {
    var ventana = document.getElementById('apoyo-ventana');
    if (ventana) ventana.remove();
    document.removeEventListener('keydown', cerrarConEscape);
  }

  /* =========================================================
     5. BOTONES FLOTANTES
     ========================================================= */
  function crearBotones() {
    if (document.querySelector('.apoyo-flotantes')) return;

    /* No poner botones en la pantalla de acceso del personal:
       ahí solo se piden correo y contraseña. */
    var pagina = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var esIndex = pagina === '' || pagina === 'index.html';

    var contenedor = document.createElement('div');
    contenedor.className = 'apoyo-flotantes';

    /* --- WhatsApp (ayuda con el sitio) --- */
    var enlaceWa = document.createElement('a');
    enlaceWa.className = 'apoyo-boton apoyo-boton--wa';
    enlaceWa.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(MENSAJE_AYUDA);
    enlaceWa.target = '_blank';
    enlaceWa.rel = 'noopener';
    enlaceWa.title = 'Ayuda por WhatsApp';
    enlaceWa.setAttribute('aria-label', 'Pedir ayuda por WhatsApp');
    enlaceWa.innerHTML = ICONO_WA;
    contenedor.appendChild(enlaceWa);

    /* --- Descargar aplicación (en la portada ya hay un botón grande) --- */
    if (!esIndex) {
      var botonInstalar = document.createElement('button');
      botonInstalar.type = 'button';
      botonInstalar.className = 'apoyo-boton apoyo-boton--instalar';
      botonInstalar.title = 'Descargar la aplicación';
      botonInstalar.setAttribute('aria-label', 'Descargar la aplicación');
      botonInstalar.innerHTML = ICONO_DESCARGAR
        + '<span class="apoyo-texto">Descargar app</span>';
      botonInstalar.addEventListener('click', pedirInstalacion);
      contenedor.appendChild(botonInstalar);
    }

    document.body.appendChild(contenedor);
  }

  /* Conectar cualquier botón marcado con data-instalar */
  function conectarBotonesMarcados() {
    var botones = document.querySelectorAll('[data-instalar]');
    for (var i = 0; i < botones.length; i++) {
      botones[i].addEventListener('click', function (evento) {
        evento.preventDefault();
        pedirInstalacion();
      });
    }
  }

  /* =========================================================
     6. ARRANQUE
     ========================================================= */
  function iniciar() {
    inyectarEstilos();
    crearBotones();
    conectarBotonesMarcados();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
