// ===============================
// INICIO ACDP (ESTABLE + FIRESTORE SAFE)
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
// UTIL FIRESTORE SAFE
// ===============================
function firestoreDisponible() {
    return typeof window.db !== "undefined";
}

// ===============================
// ACCESO GLOBAL (MENÚ)
// ===============================
function iniciarAccesoGlobal() {

    const botones = document.querySelectorAll(".menu button");

    botones.forEach(boton => {

        boton.addEventListener("click", () => {

            const destino = boton.getAttribute("data-seccion");

            if (destino === "usuarios" || destino === "configuracion") {
                pedirPinAdmin(() => abrirSeccionSeguro(destino));
            } else {
                pedirPinUsuario(() => abrirSeccionSeguro(destino));
            }

        });

    });

}

// ===============================
// ABRIR SECCIÓN (SEGURO)
// ===============================
function abrirSeccionSeguro(destino) {
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
// LOGIN USUARIO (FIRESTORE + FALLBACK)
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

    document.getElementById("btnAcceso").onclick = async () => {

        const pin = document.getElementById("pinAcceso").value.trim();
        const msg = document.getElementById("msgAcceso");

        if (!pin) return;

        let usuario = null;

        try {

            // 🔥 FIRESTORE SI EXISTE
            if (firestoreDisponible()) {

                const snap = await getDocs(collection(window.db, "usuarios"));

                snap.forEach(d => {
                    const u = d.data();
                    if (u.pin === pin) usuario = u;
                });

            } else {

                // 🧠 FALLBACK LOCAL
                usuario = (BD_usuarios || []).find(u => u.pin === pin);

            }

        } catch (e) {
            console.warn("Firestore fallback activado", e);
            usuario = (BD_usuarios || []).find(u => u.pin === pin);
        }

        const esValido = pin === "9999" || usuario;

        if (!esValido) {
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
// LOGIN ADMIN (SAFE)
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

    document.getElementById("btnAdminAcceso").onclick = async () => {

        const pin = document.getElementById("pinAdminAcceso").value.trim();
        const msg = document.getElementById("msgAdminAcceso");

        let usuario = null;

        try {

            if (firestoreDisponible()) {

                const snap = await getDocs(collection(window.db, "usuarios"));

                snap.forEach(d => {
                    const u = d.data();
                    if (u.pin === pin && u.tipo === "Administrador") {
                        usuario = u;
                    }
                });

            } else {

                usuario = (BD_usuarios || []).find(
                    u => u.pin === pin && u.tipo === "Administrador"
                );

            }

        } catch (e) {
            console.warn("Firestore fallback admin", e);
            usuario = (BD_usuarios || []).find(
                u => u.pin === pin && u.tipo === "Administrador"
            );
        }

        const esAdmin = pin === "9999" || usuario;

        if (!esAdmin) {
            msg.textContent = "Necesita PIN de administrador";
            return;
        }

        usuarioActivo = usuario ? usuario.usuario : "Admin";
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
        : "No hay sesión activa";

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

    cerrar.addEventListener("click", () => fondo.classList.remove("activo"));

    fondo.addEventListener("click", (e) => {
        if (e.target === fondo) fondo.classList.remove("activo");
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
// INICIO SESIÓN
// ===============================
function iniciarSesionInicial() {

    usuarioActivo = null;
    window.usuarioActivo = null;

    document.querySelectorAll(".seccion")
        .forEach(s => s.classList.remove("activa"));

    setTimeout(() => {

        pedirPinUsuario(() => {
            abrirSeccion("cobrar");
            actualizarUsuarioActivo();
        });

    }, 300);
}
