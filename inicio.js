// ===============================
// INICIO.JS — ACDP
// Control general de interfaz,
// sesión y acceso por PIN
// Versión Firebase Modular v9+
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

    iniciarModal();
    limitarNumeros();
    iniciarSistema();
    await iniciarSesionInicial();

});

// ===============================
// SESIÓN ACTIVA
// ===============================

window.usuarioActivo     = null;
window.usuarioActivoTipo = null;

// ===============================
// ARRANQUE GENERAL
// ===============================

async function iniciarSistema() {

    // Ocultar todas las secciones hasta login
    document.querySelectorAll(".seccion")
        .forEach(s => s.classList.remove("activa"));

    actualizarUsuarioActivo();

    // Crear Admin por defecto si Firestore está vacío
    try {
        await DB.inicializarAdminSiVacio();
    } catch(e) {
        console.error("Error inicializando admin:", e);
    }
}

// ===============================
// SESIÓN INICIAL AL CARGAR
// ===============================

async function iniciarSesionInicial() {

    window.usuarioActivo     = null;
    window.usuarioActivoTipo = null;

    setTimeout(() => {

        pedirPinUsuario(() => {

            abrirSeccion("cobrar");
            actualizarUsuarioActivo();
            iniciarMenuNavegacion();

        });

    }, 300);

}

// ===============================
// MENÚ CON CONTROL DE ACCESO
// ===============================

function iniciarMenuNavegacion() {

    const botones = document.querySelectorAll(".menu button");

    botones.forEach(boton => {

        // Evitar duplicar listeners si se llama más de una vez
        const nuevo = boton.cloneNode(true);
        boton.parentNode.replaceChild(nuevo, boton);

        nuevo.addEventListener("click", () => {

            const destino = nuevo.getAttribute("data-seccion");

            if (destino === "usuarios" || destino === "configuracion") {
                pedirPinAdmin(() => loginYabrir(destino));
            } else {
                // Cobrar, historial, afiliados — cualquier usuario válido
                if (window.usuarioActivo) {
                    loginYabrir(destino);
                } else {
                    pedirPinUsuario(() => loginYabrir(destino));
                }
            }

        });

    });

}

// ===============================
// LOGIN + ABRIR SECCIÓN
// ===============================

function loginYabrir(destino) {
    abrirSeccion(destino);
    actualizarUsuarioActivo();
}

// ===============================
// ABRIR SECCIÓN
// ===============================

function abrirSeccion(destino) {

    document.querySelectorAll(".seccion")
        .forEach(s => s.classList.remove("activa"));

    const nueva = document.getElementById(destino);
    if (nueva) nueva.classList.add("activa");

}

// ===============================
// LOGIN USUARIO NORMAL O ADMIN
// ===============================

function pedirPinUsuario(callback) {

    const fondo    = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `

        <h3>Acceso requerido</h3>

        <p>Ingrese su PIN de usuario</p>

        <input
            id="pinAcceso"
            type="password"
            maxlength="4"
            inputmode="numeric"
            placeholder="PIN"
            autocomplete="off"
        >

        <div
            id="msgAcceso"
            style="font-size:12px;color:#c00;margin-top:6px;min-height:16px;">
        </div>

        <button id="btnAcceso">Ingresar</button>

    `;

    fondo.classList.add("activo");

    // Foco automático
    setTimeout(() => {
        const inp = document.getElementById("pinAcceso");
        if (inp) inp.focus();
    }, 100);

    // Solo números
    document.getElementById("pinAcceso")
        .addEventListener("input", e => {
            e.target.value = e.target.value.replace(/\D/g, "");
        });

    // Enter también confirma
    document.getElementById("pinAcceso")
        .addEventListener("keydown", e => {
            if (e.key === "Enter") confirmarPinUsuario(callback);
        });

    document.getElementById("btnAcceso")
        .addEventListener("click", () => confirmarPinUsuario(callback));

}

async function confirmarPinUsuario(callback) {

    const pin = document.getElementById("pinAcceso").value.trim();
    const msg = document.getElementById("msgAcceso");

    if (!pin) {
        msg.textContent = "Ingrese un PIN";
        return;
    }

    msg.textContent = "Verificando...";

    try {

        const usuario = await DB.validarPin(pin);

        if (!usuario) {
            msg.textContent = "PIN incorrecto";
            document.getElementById("pinAcceso").value = "";
            return;
        }

        window.usuarioActivo     = usuario.usuario;
        window.usuarioActivoTipo = usuario.tipo;

        cerrarModal();
        callback();

        await DB.addLog({
            accion  : "LOGIN",
            detalle : `Acceso de ${usuario.usuario} (${usuario.tipo})`
        });

    } catch(e) {

        msg.textContent = "Error de conexión. Reintentá.";
        console.error("Error validando PIN:", e);

    }

}

// ===============================
// LOGIN SOLO ADMIN
// ===============================

function pedirPinAdmin(callback) {

    const fondo     = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `

        <h3>Acceso administrador</h3>

        <p>Solo administradores pueden acceder a esta sección</p>

        <input
            id="pinAdminAcceso"
            type="password"
            maxlength="4"
            inputmode="numeric"
            placeholder="PIN administrador"
            autocomplete="off"
        >

        <div
            id="msgAdminAcceso"
            style="font-size:12px;color:#c00;margin-top:6px;min-height:16px;">
        </div>

        <button id="btnAdminAcceso">Ingresar</button>

    `;

    fondo.classList.add("activo");

    setTimeout(() => {
        const inp = document.getElementById("pinAdminAcceso");
        if (inp) inp.focus();
    }, 100);

    document.getElementById("pinAdminAcceso")
        .addEventListener("input", e => {
            e.target.value = e.target.value.replace(/\D/g, "");
        });

    document.getElementById("pinAdminAcceso")
        .addEventListener("keydown", e => {
            if (e.key === "Enter") confirmarPinAdmin(callback);
        });

    document.getElementById("btnAdminAcceso")
        .addEventListener("click", () => confirmarPinAdmin(callback));

}

async function confirmarPinAdmin(callback) {

    const pin = document.getElementById("pinAdminAcceso").value.trim();
    const msg = document.getElementById("msgAdminAcceso");

    if (!pin) {
        msg.textContent = "Ingrese un PIN";
        return;
    }

    msg.textContent = "Verificando...";

    try {

        const usuario = await DB.validarPinAdmin(pin);

        if (!usuario) {
            msg.textContent = "PIN de administrador incorrecto";
            document.getElementById("pinAdminAcceso").value = "";
            return;
        }

        window.usuarioActivo     = usuario.usuario;
        window.usuarioActivoTipo = usuario.tipo;

        cerrarModal();
        callback();

        await DB.addLog({
            accion  : "LOGIN_ADMIN",
            detalle : `Acceso admin de ${usuario.usuario}`
        });

    } catch(e) {

        msg.textContent = "Error de conexión. Reintentá.";
        console.error("Error validando PIN admin:", e);

    }

}

// ===============================
// ACTUALIZAR UI USUARIO ACTIVO
// ===============================

function actualizarUsuarioActivo() {

    const cont = document.getElementById("usuarioActivo");
    if (!cont) return;

    if (!window.usuarioActivo) {
        cont.innerHTML = "";
        return;
    }

    const tipo = window.usuarioActivoTipo || "";

    cont.innerHTML = `Hola <b>${window.usuarioActivo}</b>${tipo ? " · " + tipo : ""}`;

}

// ===============================
// MODAL GLOBAL
// ===============================

function iniciarModal() {

    const fondo  = document.getElementById("modalFondo");
    const cerrar = document.getElementById("cerrarModal");

    if (!fondo || !cerrar) return;

    cerrar.addEventListener("click", () => {
        fondo.classList.remove("activo");
    });

    fondo.addEventListener("click", e => {
        if (e.target === fondo) {
            fondo.classList.remove("activo");
        }
    });

}

// ===============================
// CERRAR MODAL (global)
// ===============================

function cerrarModal() {
    document.getElementById("modalFondo")
        .classList.remove("activo");
}

// ===============================
// SOLO NÚMEROS en inputs .inputNumero
// ===============================

function limitarNumeros() {

    document.querySelectorAll(".inputNumero")
        .forEach(input => {
            input.addEventListener("input", () => {
                input.value = input.value.replace(/[^0-9]/g, "");
            });
        });

}

// ===============================
// ESCRIBIR EN CONSOLA (global)
// Mantiene compatibilidad con
// llamadas de otros módulos
// ===============================

function escribirConsola(texto) {

    const consola = document.getElementById("consolaSistema");

    if (!consola) return;

    const linea = document.createElement("div");

    linea.style.cssText =
        "color:#00ff66;font-family:monospace;margin-bottom:2px;";

    linea.textContent =
        new Date().toLocaleTimeString() + " → " + texto;

    consola.appendChild(linea);

    consola.scrollTop = consola.scrollHeight;

}

// Exponer globalmente
window.cerrarModal          = cerrarModal;
window.pedirPinAdmin        = pedirPinAdmin;
window.pedirPinUsuario      = pedirPinUsuario;
window.abrirSeccion         = abrirSeccion;
window.actualizarUsuarioActivo = actualizarUsuarioActivo;
window.escribirConsola      = escribirConsola;
