/* ===========================================================
   El Torito ASADOS — Configuración de Firebase
   -----------------------------------------------------------
   Proyecto: el-torito-asados  (plan Spark)
   Estos datos NO son secretos: van publicados en GitHub Pages.
   Lo que protege la información son las reglas de
   firestore.rules y los usuarios de Authentication.
   =========================================================== */

export const firebaseConfig = {
  apiKey: "AIzaSyB6_QTtW5FmeQlKh-qa3523yWM2Inx9d_0",
  authDomain: "el-torito-asados.firebaseapp.com",
  projectId: "el-torito-asados",
  storageBucket: "el-torito-asados.firebasestorage.app",
  messagingSenderId: "704991896160",
  appId: "1:704991896160:web:a07cbe8c8b1c5721ef1905"
};

/* Roles del negocio. Si cambian, se editan aquí y en firestore.rules. */
export const ROLES = {
  EMPLEADO: "empleado",
  REPARTIDOR: "repartidor",
  ADMINISTRADORA: "administradora"
};
