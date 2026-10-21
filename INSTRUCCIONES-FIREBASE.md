# El Torito ASADOS — Cómo conectar la app con Firebase

Guía paso a paso para dejar la aplicación funcionando. Hazlo **en la computadora**, con la
cuenta de Google de la clienta. Todo lo que se configura aquí es gratuito dentro del plan
*gratuito* de Firebase (Spark), que alcanza de sobra para un negocio pequeño.

> Antes de empezar: ten a mano los **cuatro correos** del personal y una **contraseña temporal**
> para cada uno.

---

## 1. Crear el proyecto en la cuenta de la clienta

1. Entra a <https://console.firebase.google.com> con la cuenta de Google de la clienta.
2. Toca **Crear proyecto** (o *Agregar proyecto*).
3. Nombre del proyecto, por ejemplo: `el-torito-asados`.
4. Google Analytics: **no es necesario**, puedes desactivarlo.
5. **Crear proyecto** y espera a que termine.

---

## 2. Activar Authentication con correo y contraseña

1. Menú izquierdo → **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** (Métodos de acceso).
3. Habilita **Correo electrónico/contraseña**.
4. Deja **desactivada** la opción de "vínculo de correo" si aparece; no la necesitas.
5. **Guardar**.

> No hay registro público: los usuarios los creas tú, uno por uno (paso 7).

---

## 3. Crear la base de datos de Cloud Firestore

1. Menú izquierdo → **Compilación → Firestore Database** → **Crear base de datos**.
2. Elige la **región más cercana** disponible. Para El Salvador, la más habitual es
   `us-central1` (Iowa) o `us-east1`; cualquiera de las dos funciona bien.
   *La región no se puede cambiar después: si te equivocas, hay que crear otra base.*
3. Modo de seguridad: elige **Modo de producción** (las reglas del paso 4 son las que mandan).
4. **Crear**.

---

## 4. Pegar las reglas de `firestore.rules`

1. En Firestore, pestaña **Reglas**.
2. Abre el archivo `firestore.rules` que viene en este proyecto, **copia todo su contenido**.
3. Bórralo todo en el editor de la consola y **pega** el contenido copiado.
4. **Publicar**.

Las reglas hacen lo siguiente (está comentado dentro del archivo):
- Cualquiera puede **crear** un pedido, pero solo si cumple las validaciones (nombre, teléfono de
  8 dígitos, tipo, pago, platillos, total, notas, estado `recibido` y fecha del servidor).
- Solo el **personal autenticado** puede **leer** pedidos.
- El personal solo puede **cambiar el campo `estado`**, y solo a los valores de su rol.
- **Nadie** puede borrar pedidos.
- El **menú** se lee públicamente y solo lo escribe la administradora.
- Los **costos** solo los lee y escribe la administradora.
- `usuarios/{uid}`: cada quien lee el suyo; la administradora lee todos; **nadie escribe** desde la app.

---

## 5. Registrar la app web y copiar la configuración

1. En la consola, arriba a la izquierda, toca el engranaje **⚙ → Configuración del proyecto**.
2. Baja a **Tus apps** → toca el ícono **`</>`** (Web).
3. Apodo de la app: `El Torito Web`. **No** marques Hosting. → **Registrar app**.
4. Firebase muestra un bloque `const firebaseConfig = { ... }`.
   **Copia ese objeto completo.**
5. Abre el archivo `firebase-config.js` de este proyecto y **reemplaza** el objeto que está
   marcado con `[PEGAR CONFIGURACIÓN DE FIREBASE]` por el que copiaste.
   Debe quedar así (con tus datos reales):

   ```js
   export const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "el-torito-asados.firebaseapp.com",
     projectId: "el-torito-asados",
     storageBucket: "el-torito-asados.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

6. Guarda el archivo y súbelo a GitHub junto con los demás.

> La configuración se ve públicamente en GitHub Pages. Eso es **normal** en Firebase:
> lo que protege los datos son las reglas del paso 4 y los usuarios del paso 7.

---

## 6. Agregar el dominio de GitHub Pages a los dominios autorizados

**Este paso es obligatorio. Si falta, el inicio de sesión falla con un error de dominio no autorizado.**

1. **Authentication → Settings** (Configuración) → **Authorized domains** (Dominios autorizados).
2. **Add domain** y escribe tu dominio de GitHub Pages **sin** `https://` y **sin** la ruta, por ejemplo:
   `tu-usuario.github.io`
3. **Agregar**.
4. Para probar en la computadora también sirve `localhost` (ya viene en la lista).

> Si usas un dominio propio (ej. `eltorito.com`), agrégalo también aquí.

---

## 7. Crear los cuatro usuarios en Authentication

1. **Authentication → Users** → **Add user** (Agregar usuario).
2. Correo y **contraseña temporal** (mínimo 6 caracteres). Repite para los cuatro:
   - `empleado@...`
   - `repartidor@...`
   - `administradora@...`
   - el cuarto usuario que definió el negocio (empleado, repartidor o administradora, según corresponda)
3. Después de crear cada uno, copia su **UID** (columna *User UID*). Lo necesitas en el paso 8.

> Las contraseñas temporales se entregan **en persona** o por un medio seguro. No se mandan por
> WhatsApp ni por correo sin cifrar.

---

## 8. Crear el documento `usuarios/{uid}` de cada persona

En **Firestore Database → Datos**:

1. **Iniciar colección**: `usuarios` → ID del documento: **el UID copiado** (no el correo).
2. Agrega dos campos:

   | Campo | Tipo | Valor |
   |---|---|---|
   | `rol` | string | `empleado`, `repartidor` o `administradora` |
   | `nombre` | string | Nombre de la persona |

3. **Guardar** y repite para cada usuario.

Roles y lo que puede hacer cada uno:

| Rol | Qué puede hacer |
|---|---|
| `empleado` | Ve pedidos. Pasa a **en preparación** y marca **entregado** solo los pedidos de **recoger**. |
| `repartidor` | Ve pedidos. Pasa a **en ruta** y marca **entregado**. |
| `administradora` | Ve y edita todo: precios, costos, disponibilidad y cualquier estado. |

> El valor de `rol` debe escribirse **exactamente** así, en minúsculas y sin acentos.
> Si un usuario no tiene documento o el rol está mal escrito, la app lo cierra y le muestra un aviso.

---

## 9. Cargar los platillos en `menu` y sus costos en `costos`

**Colección `menu`** — un documento por platillo (ID libre, por ejemplo `sopa-gallina`):

| Campo | Tipo | Ejemplo |
|---|---|---|
| `nombre` | string | `Sopa de gallina india` |
| `precio` | number | `4.5` |
| `categoria` | string | `sopas` o `asados` |
| `disponible` | boolean | `true` |

**Colección `costos`** — un documento por platillo, con **el mismo ID** que usaste en `menu`:

| Campo | Tipo | Ejemplo |
|---|---|---|
| `costo` | number | `2.10` |

> Solo aparecen en la página de pedidos los platillos con `disponible: true`.
> El precio y el costo se editan después desde `administracion.html`; para **agregar o quitar
> platillos** sí hay que hacerlo desde la consola.

---

## 10. Probar con un pedido de prueba y cambiar su estado

1. Abre la app publicada, entra a **Hacer mi pedido**, llena todo y envía.
2. Debe aparecer la pantalla de confirmación con el número (por ejemplo `PED-20261021-1832`).
3. Entra a **Acceso del personal** con la cuenta de la administradora → verás el pedido en la lista.
4. Cambia el estado a **en preparación**, luego **en ruta** y por último **entregado**.
5. Repite con la cuenta de empleado: solo debe ver los botones que su rol permite.
6. En `administracion.html`, cambia un precio y un costo, y revisa que las **estimaciones** del día
   coincidan con el pedido entregado.
7. Borra el pedido de prueba desde la consola de Firestore (la app no puede borrar pedidos; la
   consola sí, y las reglas no afectan al propietario del proyecto).

---

## 11. Cuidado con las contraseñas

- Las contraseñas **no se comparten por WhatsApp ni por correo sin cifrar**.
- Se entregan en persona o por un canal seguro, y cada persona la cambia al entrar
  (Firebase no obliga a cambiarla, pero conviene pedirlo).
- Si alguien olvida su contraseña, usa **"Olvidé mi contraseña"** en `login.html`; llega un correo
  con un enlace para restablecerla.
- Si alguien deja de trabajar ahí: **desactiva o borra su usuario** en Authentication y borra su
  documento en `usuarios`.

---

## Cómo subir los archivos (sin carpetas)

GitHub no permite arrastrar carpetas cuando subes archivos por la web. Por eso este proyecto
**no tiene ninguna carpeta**: son 13 archivos sueltos, y los íconos (`icon-192.png`,
`icon-512.png`) están en la raíz igual que las páginas.

1. En el repositorio: **Add file → Upload files**.
2. Selecciona **los 13 archivos** con *choose your files* (Ctrl+A en la ventana de selección).
3. Mensaje del commit → **Commit changes**.
4. **Settings → Pages → Deploy from a branch → `main` + `/ (root)` → Save**.

No subas una carpeta contenedora: si el repositorio queda como `tu-repo/el-torito-asados/index.html`,
la app se publicaría en `tu-usuario.github.io/tu-repo/el-torito-asados/` y se vería igual, pero es más
fácil equivocarse con las rutas. Lo correcto es `tu-repo/index.html`.

---

## Limitaciones que debes conocer

Escríbelas o tenlas presentes antes de mostrar la app:

1. **Las reglas no verifican que el precio de cada platillo coincida con el menú.**
   La app calcula el total con los precios que carga desde `menu`, pero las reglas solo comprueban
   que `total` sea un número entre 0 y 10000 y que los `items` tengan la forma correcta. Alguien con
   conocimientos técnicos podría enviar un pedido con un precio inventado usando la consola del
   navegador. Para cerrar ese hueco haría falta una Cloud Function (plan Blaze) que recalcule el
   total en el servidor. **Mientras tanto, revisa el total del pedido al confirmarlo por teléfono.**
2. **Cualquiera con el enlace puede enviar pedidos.** La página `pedidos.html` es pública a propósito
   (así la clienta no necesita cuenta), y las reglas permiten crear pedidos sin iniciar sesión. Eso
   también significa que alguien podría mandar pedidos falsos o spam. Recomendación: revisar el
   teléfono antes de preparar, y si pasa seguido, activar **App Check** o agregar un captcha.
3. **Los costos y las estimaciones son estimaciones.** Se calculan con la cantidad de platillos
   vendidos en pedidos con estado *entregado*. No consideran pedidos cancelados, merma, propinas,
   impuestos ni gastos fijos. El texto que se muestra en la app lo dice: *"Cifras estimadas a partir
   de platillos vendidos. No es contabilidad."*
4. **Sin internet no hay pedidos.** El service worker guarda las pantallas para que abran rápido,
   pero los pedidos, el menú y el panel necesitan conexión.
5. **Los pedidos no se borran desde la app**, solo desde la consola de Firebase, para no perder el
   historial por error.

---

## Checklist rápido

- [ ] Proyecto creado en la cuenta de la clienta
- [ ] Authentication activado (correo y contraseña)
- [ ] Firestore creado en la región elegida
- [ ] Reglas de `firestore.rules` publicadas
- [ ] App web registrada y configuración pegada en `firebase-config.js`
- [ ] Dominio `tu-usuario.github.io` agregado en Dominios autorizados
- [ ] Cuatro usuarios creados en Authentication
- [ ] Cuatro documentos en `usuarios/{uid}` con su `rol` y `nombre`
- [ ] Platillos en `menu` y costos en `costos`
- [ ] Pedido de prueba enviado y estados cambiados
- [ ] Archivos subidos a GitHub Pages y app instalada en el celular
