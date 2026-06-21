// ===============================
// ACDP - INICIO USER CONTROLLER
// Sesión + PIN + navegación + roles
// ===============================

import { db } from "../firebase.js";

// ===============================
// ESTADO GLOBAL DE SESIÓN
// ===============================

window.ACDP = {
    usuario: null,
    rol: null, // "normal" | "administrador"
    logeado: false
};

// ===============================
// USUARIOS MOCK (TEMPORAL)
// luego se moverá a Firestore
// ===============================

const USUARIOS = [
    { nombre: "Admin", pin: "2015", rol: "administrador" }
];

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    bloquearUI();
    mostrarModalLogin();
    configurarMenu();
});

// ===============================
// MODAL LOGIN (PIN)
// ===============================

function mostrarModalLogin() {
    abrirModal(`
        <h2>Ingreso al sistema</h2>
        <p>Ingrese su PIN</p>
        <input id="pinLogin" type="password" maxlength="4" placeholder="PIN">
        <br><br>
        <button id="btnLoginAceptar">Aceptar</button>
    `);

    setTimeout(() => {
        document.getElementById("btnLoginAceptar").onclick = validarLogin;
    }, 100);
}

function validarLogin() {
    const pin = document.getElementById("pinLogin").value;

    const user = USUARIOS.find(u => u.pin === pin);

    if (!user) {
        alert("PIN incorrecto");
        return;
    }

    ACDP.usuario = user.nombre;
    ACDP.rol = user.rol;
    ACDP.logeado = true;

    cerrarModal();
    desbloquearUI();
    actualizarUsuarioUI();

    console.log("Login OK:", user);
}

// ===============================
// SESIÓN
// ===============================

function cerrarSesion() {
    ACDP.usuario = null;
    ACDP.rol = null;
    ACDP.logeado = false;

    bloquearUI();
    mostrarModalLogin();

    actualizarUsuarioUI("Sin sesión");
}

// ===============================
// UI USUARIO ACTIVO
// ===============================

function actualizarUsuarioUI() {
    const div = document.getElementById("usuarioActivo");
    if (!div) return;

    div.textContent = ACDP.usuario
        ? `${ACDP.usuario} (${ACDP.rol})`
        : "Sin sesión";
}

// ===============================
// MENÚ + CONTROL DE PESTAÑAS
// ===============================

function configurarMenu() {
    const botones = document.querySelectorAll(".menu button");

    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            const seccion = btn.dataset.seccion;

            if (seccion === "cerrarsesion") {
                cerrarSesion();
                return;
            }

            protegerSeccion(seccion);
        });
    });
}

function protegerSeccion(seccion) {
    if (!ACDP.logeado) return;

    // SOLO ADMIN
    if (
        (seccion === "usuarios" || seccion === "configuracion") &&
        ACDP.rol !== "administrador"
    ) {
        alert("Acceso solo para administrador");
        return;
    }

    cambiarSeccion(seccion);
}

// ===============================
// CAMBIO DE SECCIÓN
// ===============================

function cambiarSeccion(seccion) {
    document.querySelectorAll(".seccion").forEach(s => {
        s.style.display = "none";
    });

    const target = document.getElementById(seccion);
    if (target) target.style.display = "block";
}

// ===============================
// BLOQUEO UI
// ===============================

function bloquearUI() {
    document.querySelectorAll("button, input").forEach(el => {
        el.disabled = true;
    });
}

function desbloquearUI() {
    document.querySelectorAll("button, input").forEach(el => {
        el.disabled = false;
    });
}

// ===============================
// MODAL BASE
// ===============================

function abrirModal(html) {
    const fondo = document.getElementById("modalFondo");
    const cont = document.getElementById("modalContenido");

    cont.innerHTML = html;
    fondo.style.display = "flex";

    document.getElementById("cerrarModal").onclick = cerrarModal;
}

function cerrarModal() {
    const fondo = document.getElementById("modalFondo");
    const cont = document.getElementById("modalContenido");

    cont.innerHTML = "";
    fondo.style.display = "none";
}

// ===============================
// EXPONER GLOBAL (DEBUG)
// ===============================

window.ACDP_user = {
    cerrarSesion,
    cambiarSeccion,
    abrirModal,
    cerrarModal
};
