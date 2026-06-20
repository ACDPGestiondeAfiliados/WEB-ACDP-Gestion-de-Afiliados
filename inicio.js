// ===============================
// INICIO ACDP
// Control general de interfaz + accesos + sesión
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarMenu();
    iniciarModal();
    limitarNumeros();
    iniciarSistema();
    iniciarAccesoGlobal();

});

// ===============================
// SESIÓN ACTIVA
// ===============================
let usuarioActivo = null;

// ===============================
// CONTROL DE ACCESO GLOBAL
// ===============================
function iniciarAccesoGlobal() {

    const botones = document.querySelectorAll(".menu button");

    botones.forEach(boton => {

        boton.addEventListener("click", () => {

            const destino = boton.getAttribute("data-seccion");

            if (destino === "usuarios" || destino === "configuracion") {
                pedirPinAdmin(() => loginYabrir(destino));
            } else {
                pedirPinUsuario(() => loginYabrir(destino));
            }

        });

    });

}

// ===============================
// LOGIN + CAMBIO DE SECCIÓN
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
// LOGIN USUARIO (NORMAL O ADMIN)
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

        const pin = document.getElementById("pinAcceso").value;

        const usuario = BD_usuarios.find(u => u.pin === pin);

        const esValido = pin === "9999" || usuario;

        if (!esValido) {
            document.getElementById("msgAcceso").textContent =
                "PIN incorrecto";
            return;
        }

        usuarioActivo = usuario ? usuario.usuario : "Admin";

        cerrarModal();
        callback();
    };
}

// ===============================
// LOGIN SOLO ADMIN
// ===============================
function pedirPinAdmin(callback) {

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <h3>Acceso administrador</h3>

        <p>Ingrese PIN de administrador</p>

        <input id="pinAdminAcceso" type="password" maxlength="4" inputmode="numeric">

        <div id="msgAdminAcceso" style="font-size:12px;color:#c00;margin-top:6px;"></div>

        <button id="btnAdminAcceso">Ingresar</button>
    `;

    fondo.classList.add("activo");

    document.getElementById("btnAdminAcceso").onclick = () => {

        const pin = document.getElementById("pinAdminAcceso").value;

        const usuario = BD_usuarios.find(
            u => u.pin === pin && u.tipo === "Administrador"
        );

        const esAdmin = pin === "9999" || usuario;

        if (!esAdmin) {
            document.getElementById("msgAdminAcceso").textContent =
                "Necesita un PIN de administrador";
            return;
        }

        usuarioActivo = usuario ? usuario.usuario : "Admin";

        cerrarModal();
        callback();
    };
}

// ===============================
// ACTUALIZAR UI USUARIO ACTIVO
// ===============================
function actualizarUsuarioActivo() {

    const cont = document.getElementById("usuarioActivo");

    if (!cont) return;

    if (!usuarioActivo) {
        cont.innerHTML = "No hay sesión activa";
        return;
    }

    cont.innerHTML = `Hola <b>${usuarioActivo}</b>`;
}

// ===============================
// MENÚ BASE
// ===============================
function iniciarMenu() {
    // control manejado por acceso global
}

// ===============================
// MODAL GLOBAL
// ===============================
function iniciarModal() {

    const fondo = document.getElementById("modalFondo");
    const cerrar = document.getElementById("cerrarModal");

    if (!fondo || !cerrar) return;

    cerrar.addEventListener("click", () => {
        fondo.classList.remove("activo");
    });

    fondo.addEventListener("click", (e) => {
        if (e.target === fondo) {
            fondo.classList.remove("activo");
        }
    });
}

// ===============================
// NUMÉRICOS
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
// SISTEMA
// ===============================
function iniciarSistema() {

    const consola = document.getElementById("consolaSistema");

    if (consola) {
        consola.innerHTML = "Sistema ACDP iniciado correctamente.";
    }

    actualizarUsuarioActivo();
}

// ===============================
// CIERRE MODAL
// ===============================
function cerrarModal() {
    document.getElementById("modalFondo").classList.remove("activo");
}
