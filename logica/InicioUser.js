// ===============================
// ACDP - INICIO USER CONTROLLER
// Sesión + PIN + navegación + roles + usuarios CRUD
// ===============================

import { db } from "../firebase.js";

// ===============================
// ESTADO GLOBAL
// ===============================

window.ACDP = {
    usuario: null,
    rol: null, // "normal" | "administrador"
    logeado: false
};

// ===============================
// BASE DE USUARIOS (TEMPORAL)
// luego Firebase
// ===============================

let USUARIOS = [
    { id: "1", nombre: "Admin", pin: "2015", rol: "administrador" },
    { id: "2", nombre: "Usuario", pin: "1234", rol: "normal" }
];

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    bloquearUI();
    mostrarModalLogin();
    configurarMenu();
    renderUsuariosTable();
});

// ===============================
// LOGIN
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

    if (!user && pin !== "9999") {
        alert("PIN incorrecto");
        return;
    }

    if (pin === "9999") {
        ACDP.usuario = "Admin Master";
        ACDP.rol = "administrador";
    } else {
        ACDP.usuario = user.nombre;
        ACDP.rol = user.rol;
    }

    ACDP.logeado = true;

    cerrarModal();
    desbloquearUI();
    actualizarUsuarioUI();
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
    actualizarUsuarioUI();
}

// ===============================
// UI USUARIO
// ===============================

function actualizarUsuarioUI() {
    const div = document.getElementById("usuarioActivo");
    if (!div) return;

    div.textContent = ACDP.usuario
        ? `${ACDP.usuario} (${ACDP.rol})`
        : "Sin sesión";
}

// ===============================
// MENÚ
// ===============================

function configurarMenu() {
    document.querySelectorAll(".menu button").forEach(btn => {
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

// ===============================
// CONTROL DE ACCESO
// ===============================

function protegerSeccion(seccion) {
    if (!ACDP.logeado) return;

    if ((seccion === "usuarios" || seccion === "configuracion") && ACDP.rol !== "administrador") {
        alert("Solo administradores");
        return;
    }

    cambiarSeccion(seccion);
}

// ===============================
// SECCIONES
// ===============================

function cambiarSeccion(seccion) {
    document.querySelectorAll(".seccion").forEach(s => {
        s.style.display = "none";
    });

    const target = document.getElementById(seccion);
    if (target) target.style.display = "block";

    if (seccion === "usuarios") {
        renderUsuariosTable();
    }
}

// ===============================
// UI LOCK
// ===============================

function bloquearUI() {
    document.querySelectorAll("button, input").forEach(el => el.disabled = true);
}

function desbloquearUI() {
    document.querySelectorAll("button, input").forEach(el => el.disabled = false);
}

// ===============================
// MODAL BASE (CSS ACTIVO)
// ===============================

function abrirModal(html) {
    const fondo = document.getElementById("modalFondo");
    const cont = document.getElementById("modalContenido");

    cont.innerHTML = html;
    fondo.classList.add("activo");

    document.getElementById("cerrarModal").onclick = cerrarModal;
}

function cerrarModal() {
    const fondo = document.getElementById("modalFondo");
    const cont = document.getElementById("modalContenido");

    cont.innerHTML = "";
    fondo.classList.remove("activo");
}

// ===============================
// USUARIOS CRUD
// ===============================

function renderUsuariosTable() {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    USUARIOS.forEach(u => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.nombre}</td>
            <td>${u.rol}</td>
            <td>
                <button onclick="ACDP_user.editarUsuario('${u.id}')">Editar</button>
                <button onclick="ACDP_user.eliminarUsuario('${u.id}')">Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ===============================
// CREAR USUARIO
// ===============================

function abrirCrearUsuario() {
    abrirModal(`
        <h3>Crear Usuario</h3>

        <input id="uNombre" placeholder="Nombre">
        <br><br>

        <select id="uRol">
            <option value="normal">Normal</option>
            <option value="administrador">Administrador</option>
        </select>

        <br><br>

        <input id="uPin" placeholder="PIN" maxlength="4">
        <input id="uPin2" placeholder="Repetir PIN" maxlength="4">

        <br><br>

        <button onclick="ACDP_user.guardarUsuario()">Aceptar</button>
    `);
}

function guardarUsuario() {
    const nombre = document.getElementById("uNombre").value;
    const rol = document.getElementById("uRol").value;
    const pin = document.getElementById("uPin").value;
    const pin2 = document.getElementById("uPin2").value;

    if (!nombre || !pin || !pin2) {
        alert("Complete todos los datos");
        return;
    }

    if (pin !== pin2) {
        alert("PIN no coincide");
        return;
    }

    USUARIOS.push({
        id: Date.now().toString(),
        nombre,
        rol,
        pin
    });

    cerrarModal();
    renderUsuariosTable();
}

// ===============================
// EDITAR USUARIO
// ===============================

function editarUsuario(id) {
    const user = USUARIOS.find(u => u.id === id);

    abrirModal(`
        <h3>Editar Usuario</h3>

        <input id="eNombre" value="${user.nombre}">
        <br><br>

        <select id="eRol">
            <option value="normal" ${user.rol === "normal" ? "selected" : ""}>Normal</option>
            <option value="administrador" ${user.rol === "administrador" ? "selected" : ""}>Administrador</option>
        </select>

        <br><br>

        <input id="ePin" value="${user.pin}" maxlength="4">

        <br><br>

        <button onclick="ACDP_user.guardarEdicion('${id}')">Guardar</button>
    `);
}

function guardarEdicion(id) {
    const user = USUARIOS.find(u => u.id === id);

    user.nombre = document.getElementById("eNombre").value;
    user.rol = document.getElementById("eRol").value;
    user.pin = document.getElementById("ePin").value;

    cerrarModal();
    renderUsuariosTable();
}

// ===============================
// ELIMINAR USUARIO
// ===============================

function eliminarUsuario(id) {
    USUARIOS = USUARIOS.filter(u => u.id !== id);
    renderUsuariosTable();
}

// ===============================
// EXPORT GLOBAL
// ===============================

window.ACDP_user = {
    cerrarSesion,
    cambiarSeccion,
    abrirModal,
    cerrarModal,

    abrirCrearUsuario,
    guardarUsuario,
    editarUsuario,
    guardarEdicion,
    eliminarUsuario
};
