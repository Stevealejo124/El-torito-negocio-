# El Torito ASADOS — PWA

Aplicación web instalable (PWA) para **El Torito ASADOS**.
Vive **directamente en la raíz del repositorio**: no hay carpetas, así que cada archivo se puede
subir por separado desde la web de GitHub. Sin servidor ni base de datos.

## Archivos (16 + 1 opcional)

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Pantalla principal: logo, lema y menú a los 3 módulos |
| `pedidos.html` | Módulo de pedidos (*en construcción*) |
| `empleados.html` | Módulo de empleados (*en construcción*) |
| `administracion.html` | Módulo de administración (*en construcción*) |
| `manifest.json` | Manifiesto PWA: nombre, colores, íconos, `start_url` relativo |
| `sw.js` | Service Worker: caché para abrir sin internet |
| `estilos.css` | Estilos compartidos por las 4 páginas |
| `app.js` | Registra el service worker, botón "Instalar app" y aviso sin conexión |
| `icono-192.png` | Ícono 192×192 (`any`) |
| `icono-512.png` | Ícono 512×512 (`any`) |
| `icono-maskable-192.png` | Ícono adaptable Android 192×192 |
| `icono-maskable-512.png` | Ícono adaptable Android 512×512 |
| `icono-apple-180.png` | Ícono para iPhone/iPad (`apple-touch-icon`) |
| `icono-32.png` / `icono-64.png` | Favicons del navegador |
| `logo.jpg` | Logo de la portada (ligero) |
| `logo.png` | Logo en alta resolución |
| `.nojekyll` | *(opcional)* evita que GitHub procese el sitio con Jekyll |

Todas las rutas son **relativas**: la app funciona igual en
`https://TU-USUARIO.github.io/TU-REPO/`.

## Subir los archivos (sin carpetas)

1. Entra al repositorio nuevo en GitHub → **Add file → Upload files**.
2. Arrastra **todos los archivos sueltos** (no carpetas) o selecciónalos con *choose your files*.
3. Escribe el mensaje (`El Torito ASADOS: PWA inicial`) → **Commit changes**.
4. Repite solo si falta alguno: **Add file → Create new file** y pega el contenido.

> `.nojekyll` empieza con punto: si el explorador de archivos no lo muestra, créalo con
> **Create new file**, nombre `.nojekyll`, contenido vacío → *Commit*. No es obligatorio.

## Activar GitHub Pages

1. **Settings → Pages**.
2. *Source*: **Deploy from a branch**.
3. *Branch*: `main` y carpeta **`/ (root)`** → **Save**.
4. Espera 1–2 minutos y abre: `https://TU-USUARIO.github.io/TU-REPO/`

## Probar la instalación en el celular

### Android (Chrome)
1. Abre la URL en Chrome.
2. Toca el botón **“Instalar app”** de la portada (o menú ⋮ → *Instalar aplicación*).
3. Acepta: el ícono del torito queda en la pantalla de inicio.
4. Ábrela desde el ícono y prueba con **modo avión**: debe abrir igual.

### iPhone / iPad (Safari)
1. Abre la URL en **Safari** (no en el Chrome de iOS).
2. Botón **Compartir** → **“Agregar a pantalla de inicio”** → *Agregar*.
3. Ábrela desde el ícono y prueba en modo avión.

### Computadora
Chrome/Edge muestran el ícono de instalar en la barra de direcciones.

> La instalación y el service worker solo funcionan en **HTTPS** (GitHub Pages ya lo da) o en
> `localhost`. Abriendo los archivos con doble clic (`file://`) no habrá instalación.

## Notas para la siguiente etapa

- Al cambiar archivos, sube la versión en `sw.js`: `const VERSION = 'v1'` → `'v2'`, `'v3'`…
  para que los celulares tomen la versión nueva.
- `pedidos.html`, `empleados.html` y `administracion.html` son marcadores listos: solo hay que
  reemplazar el bloque `<section class="obras">` por el contenido real.
- Sin servidor ni base de datos: cuando se guarden datos, usar `localStorage` o `IndexedDB`.
  Si después se agregan archivos nuevos, hay que añadirlos a la lista `ARCHIVOS` de `sw.js`.
