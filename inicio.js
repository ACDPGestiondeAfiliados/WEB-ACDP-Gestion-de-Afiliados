// ===============================
// INICIO ACDP
// Control general de interfaz + accesos
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarMenu();
    iniciarModal();
    limitarNumeros();
    iniciarSistema();
    iniciarAccesoGlobal();

});

// ===============================
// SESIÓN SIMPLE
// ===============================
let sesion = {
    tipo: null // "Normal" | "Administrador"
};

// ===============================
// CONTROL DE ACCESO GLOBAL
// ===============================
function iniciarAccesoGlobal() {

    const botones = document.querySelectorAll(".menu button");
    const secciones = document.querySelectorAll(".seccion");

    botones.forEach(boton => {

        boton.addEventListener("click", () => {

            const destino = boton.getAttribute("data-seccion");

            if (destino === "usuarios" || destino === "configuracion") {
                pedirPinAdmin(() => abrirSeccion(destino));
            }
            else {
                pedirPinUsuario(() => abrirSeccion(destino));
            }

        });

    });

}

// ===============================
// ABRIR SECCIÓN
// ===============================
function abrirSeccion(destino) {

    const secciones = document.querySelectorAll(".seccion");

    secciones.forEach(s => s.classList.remove("activa"));

    const nueva = document.getElementById(destino);

    if (nueva) nueva.classList.add("activa");
}

// ===============================
// PIN USUARIO (NORMAL O ADMIN)
// ===============================
function pedirPinUsuario(callback) {

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <h3>Acceso requerido</h3>

        <p>Ingrese PIN de usuario o administrador</p>

        <input id="pinAcceso"
            type="password"
            placeholder="PIN"
            maxlength="4"
            inputmode="numeric"
        >

        <div id="msgAcceso" style="font-size:12px;color:#c00;margin-top:6px;"></div>

        <button id="btnAcceso">Ingresar</button>
    `;

    fondo.classList.add("activo");

    document.getElementById("btnAcceso").onclick = () => {

        const pin = document.getElementById("pinAcceso").value;

        const esValido =
            pin === "9999" ||
            BD_usuarios.some(u => u.pin === pin);

        if (!esValido) {
            document.getElementById("msgAcceso").textContent =
                "PIN incorrecto";
            return;
        }

        cerrarModal();
        callback();
    };
}

// ===============================
// PIN SOLO ADMIN
// ===============================
function pedirPinAdmin(callback) {

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <h3>Acceso administrador</h3>

        <p>Ingrese PIN de administrador</p>

        <input id="pinAdminAcceso"
            type="password"
            placeholder="PIN admin"
            maxlength="4"
            inputmode="numeric"
        >

        <div id="msgAdminAcceso" style="font-size:12px;color:#c00;margin-top:6px;"></div>

        <button id="btnAdminAcceso">Ingresar</button>
    `;

    fondo.classList.add("activo");

    document.getElementById("btnAdminAcceso").onclick = () => {

        const pin = document.getElementById("pinAdminAcceso").value;

        const esAdmin =
            pin === "9999" ||
            BD_usuarios.some(u => u.tipo === "Administrador" && u.pin === pin);

        if (!esAdmin) {
            document.getElementById("msgAdminAcceso").textContent =
                "Necesita un PIN de administrador";
            return;
        }

        cerrarModal();
        callback();
    };
}

// ===============================
// MENÚ BASE (sin seguridad)
// ===============================
function iniciarMenu() {
    // se deja vacío a propósito
    // ahora el control lo maneja iniciarAccesoGlobal
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
// INPUTS NUMÉRICOS
// ===============================
function limitarNumeros() {

    const inputs = document.querySelectorAll(".inputNumero");

    inputs.forEach(input => {
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
    const usuario = document.getElementById("usuarioActivo");

    if (consola) {
        consola.innerHTML = "Sistema ACDP iniciado correctamente.";
    }

    if (usuario) {
        usuario.innerHTML = "Sesión: Sistema protegido por PIN";
    }
}

// ===============================
// CIERRE MODAL
// ===============================
function cerrarModal() {
    document.getElementById("modalFondo").classList.remove("activo");
}
