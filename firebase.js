// ===============================
// FIREBASE.JS — ACDP
// Base de datos en la nube
// Reemplaza bd.js completamente
// Firebase Modular v9+
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===============================
// CONFIGURACIÓN
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyBuXoGjEGxmGXuvrWSGbJW_-i8NDydJX38",
    authDomain: "acdp-afiliados.firebaseapp.com",
    projectId: "acdp-afiliados",
    storageBucket: "acdp-afiliados.firebasestorage.app",
    messagingSenderId: "67829346831",
    appId: "1:67829346831:web:2abdb4c55b504b752ce97a"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ===============================
// SESIÓN ACTIVA
// (sustituye a usuarioActivo global)
// ===============================

window.usuarioActivo = null;

// ===============================
// REFERENCIAS DE COLECCIONES
// ===============================

const COL = {
    afiliados     : "afiliados",
    cobros        : "cobros",
    historial     : "historial",
    usuarios      : "usuarios",
    configuracion : "configuracion",
    logs          : "logs"
};

// ===============================
// AFILIADOS
// ===============================

/**
 * Devuelve todos los afiliados como array de objetos.
 * Cada objeto incluye el campo "id" (docId de Firestore).
 */
async function getAfiliados() {
    const snap = await getDocs(collection(db, COL.afiliados));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Busca afiliados por DNI o número (exacto).
 */
async function buscarAfiliado(valor) {
    valor = String(valor).trim();
    const todos = await getAfiliados();
    return todos.filter(a => a.dni === valor || a.numero === valor);
}

/**
 * Agrega un afiliado nuevo.
 * Devuelve el docRef creado.
 */
async function addAfiliado(datos) {
    return await addDoc(collection(db, COL.afiliados), {
        ...datos,
        creadoEn: serverTimestamp()
    });
}

/**
 * Actualiza campos de un afiliado por su docId.
 */
async function updateAfiliado(id, cambios) {
    await updateDoc(doc(db, COL.afiliados, id), cambios);
}

/**
 * Elimina un afiliado por su docId.
 */
async function deleteAfiliado(id) {
    await deleteDoc(doc(db, COL.afiliados, id));
}

/**
 * Genera el próximo número de afiliado (8 dígitos, autoincremental).
 */
async function proximoNumeroAfiliado() {
    const todos = await getAfiliados();
    const ultimo = todos.reduce((m, a) => Math.max(m, Number(a.numero) || 0), 0);
    return String(ultimo + 1).padStart(8, "0");
}

// ===============================
// COBROS
// ===============================

/**
 * Devuelve todos los cobros.
 */
async function getCobros() {
    const snap = await getDocs(collection(db, COL.cobros));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Devuelve cobros de un DNI específico.
 */
async function getCobrosPorDni(dni) {
    const q = query(
        collection(db, COL.cobros),
        where("dni", "==", dni)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Agrega un cobro nuevo.
 */
async function addCobro(datos) {
    return await addDoc(collection(db, COL.cobros), {
        ...datos,
        creadoEn: serverTimestamp()
    });
}

/**
 * Actualiza un cobro (ej: anulación).
 */
async function updateCobro(id, cambios) {
    await updateDoc(doc(db, COL.cobros, id), cambios);
}

/**
 * Devuelve los meses ya pagados (activos) de un DNI en el año actual.
 * Retorna array de strings tipo ["Enero-2025", "Febrero-2025"]
 */
async function getMesesPagadosActivos(dni) {
    const anioActual = new Date().getFullYear();
    const cobros     = await getCobrosPorDni(dni);
    const pagados    = [];

    cobros.forEach(c => {
        if (c.estado === "Anulado") return;
        if ((c.anio || anioActual) !== anioActual) return;
        (c.meses || []).forEach(m => {
            const clave = m + "-" + anioActual;
            if (!pagados.includes(clave)) pagados.push(clave);
        });
    });

    return pagados;
}

// ===============================
// HISTORIAL
// ===============================

/**
 * Devuelve todos los registros del historial.
 */
async function getHistorial() {
    const snap = await getDocs(collection(db, COL.historial));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Devuelve historial filtrado por fecha (string "dd/mm/aaaa").
 */
async function getHistorialPorFecha(fechaStr) {
    const todos = await getHistorial();
    return todos.filter(h => h.fecha === fechaStr).reverse();
}

/**
 * Devuelve historial de un DNI o número de afiliado.
 */
async function getHistorialPorDni(valor) {
    valor = String(valor).trim();
    const todos = await getHistorial();
    return todos.filter(h => h.dni === valor || h.numero === valor).reverse();
}

/**
 * Registra una acción en el historial.
 */
async function addHistorial(accion, afiliado, detalle) {
    const ahora = new Date();
    return await addDoc(collection(db, COL.historial), {
        usuario  : window.usuarioActivo || "Sistema",
        afiliado : (afiliado?.nombre || "") + " " + (afiliado?.apellido || ""),
        dni      : afiliado?.dni    || "",
        numero   : afiliado?.numero || "",
        fecha    : ahora.toLocaleDateString(),
        hora     : ahora.toLocaleTimeString(),
        accion,
        detalle  : detalle || "",
        anio     : ahora.getFullYear(),
        estado   : "Activo",
        creadoEn : serverTimestamp()
    });
}

/**
 * Actualiza un registro del historial (ej: anulación).
 */
async function updateHistorial(id, cambios) {
    await updateDoc(doc(db, COL.historial, id), cambios);
}

// ===============================
// USUARIOS DEL SISTEMA
// ===============================

/**
 * Devuelve todos los usuarios.
 */
async function getUsuarios() {
    const snap = await getDocs(collection(db, COL.usuarios));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Valida PIN de usuario. Devuelve el objeto usuario o null.
 */
async function validarPin(pin) {
    const todos = await getUsuarios();
    return todos.find(u => u.pin === pin) || null;
}

/**
 * Valida PIN solo de administrador.
 */
async function validarPinAdmin(pin) {
    const todos = await getUsuarios();
    return todos.find(u => u.pin === pin && u.tipo === "Administrador") || null;
}

/**
 * Agrega un usuario nuevo.
 */
async function addUsuario(datos) {
    return await addDoc(collection(db, COL.usuarios), {
        ...datos,
        creadoEn: serverTimestamp()
    });
}

/**
 * Actualiza un usuario.
 */
async function updateUsuario(id, cambios) {
    await updateDoc(doc(db, COL.usuarios, id), cambios);
}

/**
 * Elimina un usuario.
 */
async function deleteUsuario(id) {
    await deleteDoc(doc(db, COL.usuarios, id));
}

/**
 * Inicializa el usuario Admin por defecto si no existe ninguno.
 * Se llama una sola vez al cargar la app.
 */
async function inicializarAdminSiVacio() {
    const todos = await getUsuarios();
    if (todos.length === 0) {
        await addDoc(collection(db, COL.usuarios), {
            usuario  : "Admin",
            pin      : "9999",
            tipo     : "Administrador",
            creadoEn : serverTimestamp()
        });
        console.log("Usuario Admin creado por defecto.");
    }
}

// ===============================
// CONFIGURACIÓN
// ===============================

/**
 * Devuelve la configuración actual { monto, ... }.
 */
async function getConfiguracion() {
    const ref  = doc(db, COL.configuracion, "general");
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    return { monto: 0 };
}

/**
 * Guarda/actualiza la configuración.
 */
async function setConfiguracion(datos) {
    const ref = doc(db, COL.configuracion, "general");
    await setDoc(ref, { ...datos, actualizadoEn: serverTimestamp() }, { merge: true });
}

// ===============================
// LOGS DEL SISTEMA
// ===============================

/**
 * Registra un log de sistema.
 */
async function addLog({ accion, detalle }) {
    const ahora = new Date();
    return await addDoc(collection(db, COL.logs), {
        fecha    : ahora.toLocaleDateString(),
        hora     : ahora.toLocaleTimeString(),
        usuario  : window.usuarioActivo || "Sistema",
        rol      : "SISTEMA",
        accion   : accion || "",
        detalle  : detalle || "",
        creadoEn : serverTimestamp()
    });
}

/**
 * Devuelve todos los logs.
 */
async function getLogs() {
    const snap = await getDocs(collection(db, COL.logs));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Elimina todos los logs (reset semanal).
 */
async function resetLogs() {
    const snap = await getDocs(collection(db, COL.logs));
    const borrados = snap.docs.map(d => deleteDoc(doc(db, COL.logs, d.id)));
    await Promise.all(borrados);
    await addLog({ accion: "SISTEMA", detalle: "Reset semanal de logs ejecutado" });
}

// ===============================
// EXPORTS GLOBALES
// (accesibles desde los demás .js sin módulos)
// ===============================

window.DB = {
    // Afiliados
    getAfiliados,
    buscarAfiliado,
    addAfiliado,
    updateAfiliado,
    deleteAfiliado,
    proximoNumeroAfiliado,
    // Cobros
    getCobros,
    getCobrosPorDni,
    addCobro,
    updateCobro,
    getMesesPagadosActivos,
    // Historial
    getHistorial,
    getHistorialPorFecha,
    getHistorialPorDni,
    addHistorial,
    updateHistorial,
    // Usuarios
    getUsuarios,
    validarPin,
    validarPinAdmin,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    inicializarAdminSiVacio,
    // Configuración
    getConfiguracion,
    setConfiguracion,
    // Logs
    addLog,
    getLogs,
    resetLogs
};

console.log("✅ Firebase ACDP conectado correctamente.");
