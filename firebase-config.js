/* ===========================================================
   El Torito ASADOS — Configuración de Firebase
   -----------------------------------------------------------
   REEMPLAZAR: pega aquí el objeto que te da Firebase.
   Consola de Firebase → Configuración del proyecto → Tus apps
   → app web (</>) → Configuración del SDK → "Config".

   Ejemplo de cómo se ve (NO copies este, copia el tuyo):

   export const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "el-torito-asados.firebaseapp.com",
     projectId: "el-torito-asados",
     storageBucket: "el-torito-asados.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };

   Nota: este archivo se publica en GitHub Pages, así que la
   configuración es visible para cualquiera. Eso es normal en
   Firebase: lo que protege los datos son las reglas de
   firestore.rules y los usuarios de Authentication, no esta clave.
   =========================================================== */

export const firebaseConfig = {
  apiKey: "[PEGAR CONFIGURACIÓN DE FIREBASE]",
  authDomain: "[PEGAR CONFIGURACIÓN DE FIREBASE]",
  projectId: "[PEGAR CONFIGURACIÓN DE FIREBASE]",
  storageBucket: "[PEGAR CONFIGURACIÓN DE FIREBASE]",
  messagingSenderId: "[PEGAR CONFIGURACIÓN DE FIREBASE]",
  appId: "[PEGAR CONFIGURACIÓN DE FIREBASE]"
};

/* Roles del negocio. Si cambian, se editan aquí y en firestore.rules. */
export const ROLES = {
  EMPLEADO: "empleado",
  REPARTIDOR: "repartidor",
  ADMINISTRADORA: "administradora"
};
