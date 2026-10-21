/* ===========================================================
   El Torito ASADOS — comun.js
   -----------------------------------------------------------
   Inicializa Firebase UNA sola vez y exporta auth y db.
   Aquí también viven las funciones que comparten las páginas:
   leer el rol del usuario, proteger páginas, formatear dólares
   y mostrar avisos.
   =========================================================== */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig, ROLES } from "./firebase-config.js";

/* ---------- 1. Inicialización única ---------- */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* Reexportamos lo que necesitan las páginas */
export {
  ROLES,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  serverTimestamp
};

/* Marca de que el módulo cargó (la usan las páginas para el aviso de sin conexión) */
window.TORITO_LISTO = true;

/* ---------- 2. ¿Ya se pegó la configuración? ---------- */
export const CONFIG_PENDIENTE = JSON.stringify(firebaseConfig).includes("PEGAR CONFIGURACI");

/* ---------- 3. Roles ---------- */
export const ROLES_VALIDOS = [ROLES.EMPLEADO, ROLES.REPARTIDOR, ROLES.ADMINISTRADORA];

export const NOMBRE_ROL = {
  [ROLES.EMPLEADO]: "Empleado",
  [ROLES.REPARTIDOR]: "Repartidor",
  [ROLES.ADMINISTRADORA]: "Administradora"
};

/* Estados posibles de un pedido */
export const ESTADOS = [
  { id: "recibido", etiqueta: "Recibido", clase: "estado--recibido" },
  { id: "en_preparacion", etiqueta: "En preparación", clase: "estado--preparacion" },
  { id: "en_ruta", etiqueta: "En ruta", clase: "estado--ruta" },
  { id: "entregado", etiqueta: "Entregado", clase: "estado--entregado" }
];

export function etiquetaEstado(id) {
  const encontrado = ESTADOS.find((estado) => estado.id === id);
  return encontrado ? encontrado.etiqueta : id;
}

export function claseEstado(id) {
  const encontrado = ESTADOS.find((estado) => estado.id === id);
  return encontrado ? encontrado.clase : "";
}

/* Estados que cada rol puede poner. La misma lógica está en firestore.rules. */
export function estadosPermitidosPara(rol, pedido) {
  if (rol === ROLES.ADMINISTRADORA) return ["recibido", "en_preparacion", "en_ruta", "entregado"];
  if (rol === ROLES.REPARTIDOR) return ["en_ruta", "entregado"];
  if (rol === ROLES.EMPLEADO) {
    /* El empleado marca "entregado" solo cuando el cliente pasa a traerlo. */
    return pedido && pedido.tipo === "recoger"
      ? ["en_preparacion", "entregado"]
      : ["en_preparacion"];
  }
  return [];
}

/* ---------- 4. Formato de montos ---------- */
const FORMATO_DOLARES = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function dinero(valor) {
  const numero = Number(valor);
  return FORMATO_DOLARES.format(Number.isFinite(numero) ? numero : 0);
}

/* ---------- 5. Fechas ---------- */
export function aFecha(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  if (typeof valor.toDate === "function") return valor.toDate(); // Timestamp de Firestore
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function fechaHora(valor) {
  const fecha = aFecha(valor);
  if (!fecha) return "—";
  return fecha.toLocaleString("es-SV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function soloHora(valor) {
  const fecha = aFecha(valor);
  if (!fecha) return "—";
  return fecha.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" });
}

/* Número de pedido basado en la fecha y hora: PED-AAAAMMDD-HHMM */
export function numeroDePedido(fecha) {
  const dos = (n) => String(n).padStart(2, "0");
  return (
    "PED-" +
    fecha.getFullYear() +
    dos(fecha.getMonth() + 1) +
    dos(fecha.getDate()) +
    "-" +
    dos(fecha.getHours()) +
    dos(fecha.getMinutes())
  );
}

/* ---------- 6. Sesión y rol ---------- */
export function esperarSesion() {
  return new Promise((resolver) => {
    const quitar = onAuthStateChanged(auth, (usuario) => {
      quitar();
      resolver(usuario);
    });
  });
}

/* Lee usuarios/{uid}. Devuelve { rol, nombre } o null. */
export async function leerPerfil(uid) {
  try {
    const instantanea = await getDoc(doc(db, "usuarios", uid));
    if (!instantanea.exists()) return null;
    const datos = instantanea.data();
    if (!datos || !ROLES_VALIDOS.includes(datos.rol)) return null;
    return { rol: datos.rol, nombre: datos.nombre || "" };
  } catch (error) {
    console.warn("[El Torito] No se pudo leer el perfil:", error);
    return null;
  }
}

/* Devuelve { usuario, perfil } si hay sesión con rol válido; si no, null. */
export async function sesionConRol() {
  const usuario = await esperarSesion();
  if (!usuario) return null;
  const perfil = await leerPerfil(usuario.uid);
  if (!perfil) return { usuario, perfil: null };
  return { usuario, perfil };
}

export async function salir() {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn("[El Torito] No se pudo cerrar sesión:", error);
  }
  window.location.replace("login.html");
}

/* Protege una página.
   rolesPermitidos: arreglo de roles.
   paginaAlterna: a dónde mandar a un rol válido pero sin permiso
   (por ejemplo, la administración manda a login.html). */
export async function protegerPagina(rolesPermitidos, paginaAlterna) {
  const sesion = await sesionConRol();

  if (!sesion) {
    window.location.replace("login.html");
    return null;
  }

  if (!sesion.perfil) {
    await signOut(auth);
    window.location.replace("login.html?sinrol=1");
    return null;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(sesion.perfil.rol)) {
    /* Rol válido pero sin permiso para esta página */
    window.location.replace(paginaAlterna || "empleados.html");
    return null;
  }

  return sesion;
}

/* ---------- 7. Avisos en pantalla ---------- */
export function mostrarAviso(elemento, mensaje, tipo) {
  if (!elemento) return;
  elemento.textContent = mensaje || "";
  elemento.className = "aviso aviso--" + (tipo || "info");
  elemento.hidden = !mensaje;
}

export function ocultarAviso(elemento) {
  if (elemento) elemento.hidden = true;
}

/* Texto de error de Firestore traducido a algo entendible */
export function mensajeDeError(error) {
  const codigo = (error && error.code) || "";
  if (codigo.includes("permission-denied")) return "No tienes permiso para hacer esta acción.";
  if (codigo.includes("unauthenticated")) return "Tu sesión terminó. Vuelve a iniciar sesión.";
  if (codigo.includes("unavailable") || codigo.includes("network")) {
    return "No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.";
  }
  if (codigo.includes("failed-precondition")) return "Falta un índice en la base de datos. Avisa a quien mantiene la app.";
  return "Ocurrió un problema. Intenta de nuevo en un momento.";
}
