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
    if (btnNuevo) {
        btnNuevo.addEventListener("click", abrirCrearUsuario);
    }
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

    // ===============================
    // MASTER PIN (SIN FIRESTORE)
    // ===============================

    if (pin === "2015") {
        ACDP.usuario = "ADMIN MASTER";
        ACDP.rol = "administrador";
        ACDP.master = true;
        ACDP.logeado = true;

        cerrarModal();
        desbloquearUI();
        actualizarUsuarioUI();
        cambiarSeccion("cobrar");
        return;
    }

    // ===============================
    // FIRESTORE LOGIN
    // ===============================

    const snap = await getDocs(collection(db, "usuarios"));

    let userFound = null;

    snap.forEach(d => {
        const u = d.data();
        if (u.pin === pin) {
            userFound = { id: d.id, ...u };
        }
    });

    if (!userFound) {
        alert("PIN incorrecto");
        return;
    }

    ACDP.usuario = userFound.nombre;
    ACDP.rol = userFound.rol;
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
// CONTROL DE ACCESO
// ===============================

function protegerSeccion(seccion) {
    if (!ACDP.logeado) return;

    if (
        (seccion === "usuarios" || seccion === "configuracion") &&
        !ACDP.master
    ) {
        alert("Solo administrador master");
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
    document.querySelectorAll("button, input, select").forEach(el => {
        el.disabled = true;
    });
}

function desbloquearUI() {
    document.querySelectorAll("button, input, select").forEach(el => {
        el.disabled = false;
    });
}

// ===============================
// MODAL
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
// FIRESTORE - USUARIOS
// ===============================

async function renderUsuariosTable() {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const snap = await getDocs(collection(db, "usuarios"));

    snap.forEach(d => {
        const u = d.data();

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.nombre}</td>
            <td>${u.rol}</td>
            <td>
                <button onclick="ACDP_user.editarUsuario('${d.id}')">Editar</button>
                <button onclick="ACDP_user.eliminarUsuario('${d.id}')">Eliminar</button>
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

// ===============================
// GUARDAR USUARIO
// ===============================

async function guardarUsuario() {
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

    await addDoc(collection(db, "usuarios"), {
        nombre,
        rol,
        pin
    });

    cerrarModal();
    renderUsuariosTable();
}

// ===============================
// EDITAR
// ===============================

async function editarUsuario(id) {
    const snap = await getDocs(collection(db, "usuarios"));

    let user = null;

    snap.forEach(d => {
        if (d.id === id) user = { id: d.id, ...d.data() };
    });

    if (!user) return;

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

// ===============================
// GUARDAR EDICIÓN
// ===============================

async function guardarEdicion(id) {
    const nombre = document.getElementById("eNombre").value;
    const rol = document.getElementById("eRol").value;
    const pin = document.getElementById("ePin").value;

    await updateDoc(doc(db, "usuarios", id), {
        nombre,
        rol,
        pin
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
