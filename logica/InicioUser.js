// ===============================
// ACDP - INICIO USER CONTROLLER
// Sesión + PIN + navegación + roles + usuarios CRUD (FIREBASE REAL)
// ===============================

import {
    db,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "../firebase.js";

// ===============================
// ESTADO GLOBAL
// ===============================

window.ACDP = {
    usuario: null,
    rol: null,
    logeado: false,
    master: false
};

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    bloquearUI();
    mostrarModalLogin();
    configurarMenu();
    bindUIActions();
});

// ===============================
// BIND UI
// ===============================

function bindUIActions() {
    const btnNuevo = document.getElementById("btnNuevoUsuario");
    if (btnNuevo) btnNuevo.addEventListener("click", abrirCrearUsuario);
}

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

async function validarLogin() {
    const pin = document.getElementById("pinLogin").value;

    if (pin === "2015") {
        ACDP.usuario = "ADMIN MASTER";
        ACDP.rol = "ADMINISTRADOR";
        ACDP.master = true;
        ACDP.logeado = true;

        cerrarModal();
        desbloquearUI();
        actualizarUsuarioUI();
        cambiarSeccion("cobrar");
        return;
    }

    const snap = await getDocs(collection(db, "usuarios"));

    let userFound = null;

    snap.forEach(d => {
        if (d.data().pin === pin) {
            userFound = { id: d.id, ...d.data() };
        }
    });

    if (!userFound) {
        alert("PIN incorrecto");
        return;
    }

    ACDP.usuario = userFound.nombre;
    ACDP.rol = String(userFound.rol).toUpperCase();
    ACDP.master = false;
    ACDP.logeado = true;

    cerrarModal();
    desbloquearUI();
    actualizarUsuarioUI();
    cambiarSeccion("cobrar");
}

// ===============================
// SESIÓN
// ===============================

function cerrarSesion() {
    ACDP.usuario = null;
    ACDP.rol = null;
    ACDP.logeado = false;
    ACDP.master = false;

    bloquearUI();
    mostrarModalLogin();
    actualizarUsuarioUI();
}

// ===============================
// UI
// ===============================

function actualizarUsuarioUI() {
    const div = document.getElementById("usuarioActivo");
    if (!div) return;

    div.textContent = ACDP.usuario
        ? `${ACDP.usuario} (${ACDP.rol})`
        : "Sin sesión";
}

// ===============================
// MENU
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
// CONTROL ACCESO
// ===============================

function protegerSeccion(seccion) {
    if (!ACDP.logeado) return;

    if ((seccion === "usuarios" || seccion === "configuracion" || seccion === "historial") && !ACDP.master && ACDP.rol !== "ADMINISTRADOR") {
        alert("Acceso solo administrador o master");
        return;
    }

    cambiarSeccion(seccion);
}

// ===============================
// SECCIONES
// ===============================

function cambiarSeccion(seccion) {
    document.querySelectorAll(".seccion").forEach(s => s.style.display = "none");

    const target = document.getElementById(seccion);
    if (target) target.style.display = "block";

    if (seccion === "usuarios") renderUsuariosTable();
}

// ===============================
// UI LOCK
// ===============================

function bloquearUI() {
    document.querySelectorAll("button, input, select").forEach(el => el.disabled = true);
}

function desbloquearUI() {
    document.querySelectorAll("button, input, select").forEach(el => el.disabled = false);
}

// ===============================
// MODAL
// ===============================

function abrirModal(html) {
    document.getElementById("modalContenido").innerHTML = html;
    document.getElementById("modalFondo").classList.add("activo");
    document.getElementById("cerrarModal").onclick = cerrarModal;
}

function cerrarModal() {
    document.getElementById("modalContenido").innerHTML = "";
    document.getElementById("modalFondo").classList.remove("activo");
}

// ===============================
// VALIDACIONES
// ===============================

function soloTextoValido(valor) {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor);
}

// ===============================
// CREAR USUARIO (VALIDACIÓN EN VIVO)
// ===============================

function abrirCrearUsuario() {
    abrirModal(`
        <h3>Crear Usuario</h3>

        <input id="uNombre" placeholder="Nombre">
        <br><br>

        <select id="uRol">
            <option value="NORMAL">NORMAL</option>
            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
        </select>

        <br><br>

        <input id="uPin" type="password" maxlength="4" placeholder="PIN">
        <input id="uPin2" type="password" maxlength="4" placeholder="Repetir PIN">

        <br><br>

        <button id="btnGuardarUser" disabled>Aceptar</button>
    `);

    setTimeout(() => {
        const n = document.getElementById("uNombre");
        const p1 = document.getElementById("uPin");
        const p2 = document.getElementById("uPin2");
        const btn = document.getElementById("btnGuardarUser");
        const rol = document.getElementById("uRol");

        function validar() {
            const nombreOk = soloTextoValido(n.value.trim());
            const pinOk = p1.value.length === 4;
            const pinMatch = p1.value === p2.value && pinOk;

            btn.disabled = !(nombreOk && pinMatch);

            rol.value = rol.value.toUpperCase();
        }

        n.addEventListener("input", () => {
            n.value = n.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
            validar();
        });

        p1.addEventListener("input", validar);
        p2.addEventListener("input", validar);

        btn.onclick = guardarUsuario;
    }, 100);
}

// ===============================
// GUARDAR USUARIO
// ===============================

async function guardarUsuario() {
    const nombre = document.getElementById("uNombre").value.trim();
    const rol = document.getElementById("uRol").value.toUpperCase();
    const pin = document.getElementById("uPin").value;

    await addDoc(collection(db, "usuarios"), {
        nombre,
        rol,
        pin
    });

    cerrarModal();
    renderUsuariosTable();
}

// ===============================
// EDITAR USUARIO (MISMA VALIDACIÓN)
// ===============================

async function editarUsuario(id) {
    const snap = await getDocs(collection(db, "usuarios"));

    let user = null;
    snap.forEach(d => {
        if (d.id === id) user = { id: d.id, ...d.data() };
    });

    abrirModal(`
        <h3>Editar Usuario</h3>

        <input id="eNombre" value="${user.nombre}">
        <br><br>

        <select id="eRol">
            <option value="NORMAL">NORMAL</option>
            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
        </select>

        <br><br>

        <input id="ePin" type="password" maxlength="4" value="${user.pin}">

        <br><br>

        <button id="btnEditUser">Guardar</button>
    `);

    setTimeout(() => {
        const n = document.getElementById("eNombre");
        const p = document.getElementById("ePin");
        const btn = document.getElementById("btnEditUser");

        function validar() {
            const nombreOk = soloTextoValido(n.value.trim());
            const pinOk = p.value.length === 4;

            btn.disabled = !(nombreOk && pinOk);
        }

        n.addEventListener("input", () => {
            n.value = n.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
            validar();
        });

        p.addEventListener("input", validar);

        btn.onclick = () => guardarEdicion(id);
    }, 100);
}

// ===============================
// GUARDAR EDICIÓN
// ===============================

async function guardarEdicion(id) {
    await updateDoc(doc(db, "usuarios", id), {
        nombre: document.getElementById("eNombre").value.trim(),
        rol: document.getElementById("eRol").value.toUpperCase(),
        pin: document.getElementById("ePin").value
    });

    cerrarModal();
    renderUsuariosTable();
}

// ===============================
// ELIMINAR
// ===============================

async function eliminarUsuario(id) {
    await deleteDoc(doc(db, "usuarios", id));
    renderUsuariosTable();
}

// ===============================
// TABLE
// ===============================

async function renderUsuariosTable() {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const snap = await getDocs(collection(db, "usuarios"));

    snap.forEach(d => {
        const u = d.data();

        tbody.innerHTML += `
            <tr>
                <td>${u.nombre}</td>
                <td>${String(u.rol).toUpperCase()}</td>
                <td>
                    <button onclick="ACDP_user.editarUsuario('${d.id}')"><img src="./iconos/edit.png"></button>
                    <button onclick="ACDP_user.eliminarUsuario('${d.id}')"><img src="./iconos/delete.png"></button>
                </td>
            </tr>
        `;
    });
}

// ===============================
// EXPORT
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
