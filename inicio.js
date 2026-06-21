// ===============================
// INICIO ACDP FIREBASE (FIX LIMPIO)
// ===============================

import {
    db,
    collection,
    getDocs
} from "./firebase.js";

// ===============================
// ESTADO GLOBAL
// ===============================

let usuariosSistema = [];
let usuarioActivo = null;
let rolActivo = null;
let seccionActual = null;

// export global sync
window.usuarioActivo = null;
window.rolActivo = null;

// IMPORTANTE: NO resetear BD_usuarios aquí
// window.BD_usuarios se maneja en bd.js

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

    iniciarMenu();
    iniciarModal();
    limitarNumeros();

    await cargarUsuarios();

    iniciarSesionInicial();
});

// ===============================
// USUARIOS
// ===============================

async function cargarUsuarios() {

    try {

        const snap = await getDocs(collection(db, "usuarios"));

        usuariosSistema = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        window.BD_usuarios = usuariosSistema;

    } catch (e) {
        console.error("Error cargando usuarios", e);
    }
}

// ===============================
// MENU
// ===============================

function iniciarMenu() {

    document.querySelectorAll(".menu button").forEach(btn => {

        btn.addEventListener("click", () => {

            const destino = btn.dataset.seccion;

            if (destino === "cerrarsesion") {
                cerrarSesion();
                return;
            }

            const esAdmin =
                destino === "usuarios" ||
                destino === "configuracion";

            if (esAdmin) {
                pedirPinAdmin(() => abrirConSesion(destino));
            } else {
                pedirPinUsuario(() => abrirConSesion(destino));
            }
        });
    });
}

// ===============================
// ABRIR SECCION
// ===============================

function abrirConSesion(destino) {
    abrirSeccion(destino);
    actualizarUsuarioActivo();
}

function abrirSeccion(destino) {

    document.querySelectorAll(".seccion")
        .forEach(s => s.classList.remove("activa"));

    const sec = document.getElementById(destino);
    if (sec) sec.classList.add("activa");

    seccionActual = destino;
}

// ===============================
// LOGIN USUARIO
// ===============================

function pedirPinUsuario(callback) {

    mostrarModal(`
        <h3>Acceso requerido</h3>
        <p>Ingrese PIN</p>
        <input id="pinAcceso" type="password" maxlength="4" inputmode="numeric">
        <div id="msgAcceso"></div>
        <button id="btnAcceso">Ingresar</button>
    `);

    document.getElementById("btnAcceso").onclick = () => {

        const pin = document.getElementById("pinAcceso").value;

        const usuario = usuariosSistema.find(u => u.pin === pin);

        if (pin !== "9999" && !usuario) {
            document.getElementById("msgAcceso").innerHTML = "PIN incorrecto";
            return;
        }

        if (pin === "9999") {
            usuarioActivo = "Admin";
            rolActivo = "Administrador";
        } else {
            usuarioActivo = usuario.usuario;
            rolActivo = usuario.tipo || "Normal";
        }

        window.usuarioActivo = usuarioActivo;
        window.rolActivo = rolActivo;

        cerrarModal();
        callback();
    };
}

// ===============================
// LOGIN ADMIN
// ===============================

function pedirPinAdmin(callback) {

    mostrarModal(`
        <h3>Acceso administrador</h3>
        <input id="pinAdminAcceso" type="password" maxlength="4" inputmode="numeric">
        <div id="msgAdminAcceso"></div>
        <button id="btnAdminAcceso">Ingresar</button>
    `);

    document.getElementById("btnAdminAcceso").onclick = () => {

        const pin = document.getElementById("pinAdminAcceso").value;

        const usuario = usuariosSistema.find(
            u => u.pin === pin && u.tipo === "Administrador"
        );

        if (pin !== "9999" && !usuario) {
            document.getElementById("msgAdminAcceso").innerHTML = "No es administrador";
            return;
        }

        if (pin === "9999") {
            usuarioActivo = "Admin";
            rolActivo = "Administrador";
        } else {
            usuarioActivo = usuario.usuario;
            rolActivo = "Administrador";
        }

        window.usuarioActivo = usuarioActivo;
        window.rolActivo = rolActivo;

        cerrarModal();
        callback();
    };
}

// ===============================
// MODAL
// ===============================

function mostrarModal(html) {
    document.getElementById("modalContenido").innerHTML = html;
    document.getElementById("modalFondo").classList.add("activo");
}

function iniciarModal() {

    const fondo = document.getElementById("modalFondo");
    const cerrar = document.getElementById("cerrarModal");

    cerrar.onclick = cerrarModal;

    fondo.onclick = (e) => {
        if (e.target === fondo) cerrarModal();
    };
}

function cerrarModal() {
    document.getElementById("modalFondo").classList.remove("activo");
}

// ===============================
// SESION
// ===============================

function iniciarSesionInicial() {

    cerrarSesion();

    setTimeout(() => {

        pedirPinUsuario(() => {
            abrirSeccion("cobrar");
        });

    }, 300);
}

function cerrarSesion() {

    usuarioActivo = null;
    rolActivo = null;
    seccionActual = null;

    window.usuarioActivo = null;
    window.rolActivo = null;

    document.querySelectorAll(".seccion")
        .forEach(s => s.classList.remove("activa"));

    actualizarUsuarioActivo();
}

// ===============================
// UI
// ===============================

function actualizarUsuarioActivo() {

    const div = document.getElementById("usuarioActivo");

    if (!div) return;

    div.innerHTML = usuarioActivo
        ? `Hola <b>${usuarioActivo}</b>`
        : "No hay sesión activa";
}

// ===============================
// INPUT NUMEROS
// ===============================

function limitarNumeros() {

    document.querySelectorAll(".inputNumero").forEach(i => {

        i.addEventListener("input", () => {
            i.value = i.value.replace(/[^0-9]/g, "");
        });

    });
}
