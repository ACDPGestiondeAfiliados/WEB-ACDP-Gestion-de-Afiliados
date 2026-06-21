// ===============================
// INICIO ACDP (FIREBASE COMPATIBLE SIN ROMPER BD)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarMenu();
    iniciarModal();
    limitarNumeros();
    iniciarSistema();
    iniciarAccesoGlobal();
    iniciarSesionInicial();

});

// ===============================
// SESIÓN GLOBAL
// ===============================
let usuarioActivo = null;
window.usuarioActivo = null;

// ===============================
// UTIL FIREBASE OPCIONAL
// ===============================
function firebaseActivo() {
    return typeof window.db !== "undefined";
}

// ===============================
// MENÚ (NO CAMBIA)
// ===============================
function iniciarAccesoGlobal() {

    document.querySelectorAll(".menu button").forEach(boton => {

        boton.addEventListener("click", () => {

            const destino = boton.getAttribute("data-seccion");

            if (destino === "usuarios" || destino === "configuracion") {
                pedirPinAdmin(() => abrirSeccion(destino));
            } else {
                pedirPinUsuario(() => abrirSeccion(destino));
            }

        });

    });

}

// ===============================
// ABRIR SECCIÓN (SIN CAMBIOS)
// ===============================
function abrirSeccion(destino) {

    document.querySelectorAll(".seccion")
        .forEach(s => s.classList.remove("activa"));

    const sec = document.getElementById(destino);
    if (sec) sec.classList.add("activa");

    actualizarUsuarioActivo();
}

// ===============================
// LOGIN USUARIO (COMPATIBLE BD + FIREBASE)
// ===============================
function pedirPinUsuario(callback) {

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <h3>Acceso requerido</h3>
        <p>Ingrese PIN de usuario o administrador</p>

        <input id="pinAcceso" type="password" maxlength="4" inputmode="numeric">
        <div id="msgAcceso" style="font-size:12px;color:#c00;margin-top:6px;"></div>

        <button id="btnAcceso">Ingresar</button>
    `;

    fondo.classList.add("activo");

    document.getElementById("btnAcceso").onclick = () => {

        const pin = document.getElementById("pinAcceso").value.trim();
        const msg = document.getElementById("msgAcceso");

        if (!pin) return;

        let usuario = null;

        // 🔥 PRIORIDAD: BD LOCAL (NO ROMPER SISTEMA)
        if (Array.isArray(BD_usuarios)) {
            usuario = BD_usuarios.find(u => u.pin === pin);
        }

        // 🔁 OPCIONAL FIREBASE (solo si existe)
        if (!usuario && firebaseActivo()) {
            console.warn("Firebase activo pero BD local no encontró usuario");
        }

        const valido = pin === "9999" || usuario;

        if (!valido) {
            msg.textContent = "PIN incorrecto";
            return;
        }

        usuarioActivo = usuario ? usuario.usuario : "Admin";
        window.usuarioActivo = usuarioActivo;

        cerrarModal();
        callback();
    };
}

// ===============================
// LOGIN ADMIN
// ===============================
function pedirPinAdmin(callback) {

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <h3>Acceso administrador</h3>

        <input id="pinAdminAcceso" type="password" maxlength="4" inputmode="numeric">
        <div id="msgAdminAcceso" style="font-size:12px;color:#c00;margin-top:6px;"></div>

        <button id="btnAdminAcceso">Ingresar</button>
    `;

    fondo.classList.add("activo");

    document.getElementById("btnAdminAcceso").onclick = () => {

        const pin = document.getElementById("pinAdminAcceso").value.trim();
        const msg = document.getElementById("msgAdminAcceso");

        let admin = null;

        if (Array.isArray(BD_usuarios)) {
            admin = BD_usuarios.find(u =>
                u.pin === pin && u.tipo === "Administrador"
            );
        }

        const valido = pin === "9999" || admin;

        if (!valido) {
            msg.textContent = "Necesita PIN de administrador";
            return;
        }

        usuarioActivo = admin ? admin.usuario : "Admin";
        window.usuarioActivo = usuarioActivo;

        cerrarModal();
        callback();
    };
}

// ===============================
// UI USUARIO
// ===============================
function actualizarUsuarioActivo() {

    const cont = document.getElementById("usuarioActivo");
    if (!cont) return;

    cont.innerHTML = usuarioActivo
        ? `Hola <b>${usuarioActivo}</b>`
        : "";
}

// ===============================
// SISTEMA
// ===============================
function iniciarSistema() {

    if (!window.BD_configuracion) {
        window.BD_configuracion = { monto: 0 };
    }

    const consola = document.getElementById("consolaSistema");
    if (consola) {
        consola.innerHTML = "Sistema ACDP iniciado correctamente.";
    }

    actualizarUsuarioActivo();
}

// ===============================
// MODAL
// ===============================
function iniciarModal() {

    const fondo = document.getElementById("modalFondo");
    const cerrar = document.getElementById("cerrarModal");

    if (!fondo || !cerrar) return;

    cerrar.onclick = () => fondo.classList.remove("activo");

    fondo.onclick = (e) => {
        if (e.target === fondo) fondo.classList.remove("activo");
    };
}

// ===============================
// NUMÉRICOS
// ===============================
function limitarNumeros() {

    document.querySelectorAll(".inputNumero")
        .forEach(i => {
            i.oninput = () => {
                i.value = i.value.replace(/[^0-9]/g, "");
            };
        });

}

// ===============================
// INICIO AUTOMÁTICO
// ===============================
function iniciarSesionInicial() {

    usuarioActivo = null;
    window.usuarioActivo = null;

    document.querySelectorAll(".seccion")
        .forEach(s => s.classList.remove("activa"));

    setTimeout(() => {

        pedirPinUsuario(() => {
            abrirSeccion("cobrar");
        });

    }, 300);
}
