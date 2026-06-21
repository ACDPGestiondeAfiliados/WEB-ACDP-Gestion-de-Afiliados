// ===============================
// USUARIOS.JS - ACDP
// CRUD USUARIOS + ROLES + PIN CONTROL
// ===============================

(function () {

let modoUsuario = "nuevo";
let usuarioEditandoId = null;

// ===============================
// INIT
// ===============================
window.initUsuarios = function () {
    if (!window.BD_usuarios) window.BD_usuarios = [];

    const btnNuevo = document.getElementById("btnNuevoUsuario");
    if (btnNuevo) {
        btnNuevo.onclick = () => abrirModalUsuario("nuevo");
    }

    renderUsuarios();
};

// ===============================
// RENDER TABLA
// ===============================
window.renderUsuarios = function () {
    const cont = document.getElementById("tablaUsuarios");
    if (!cont) return;

    cont.innerHTML = "";

    (window.BD_usuarios || []).forEach(u => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.usuario}</td>
            <td>${u.rol}</td>
            <td>${u.pin}</td>
            <td>
                <button onclick="editarUsuario('${u.id}')">Editar</button>
                <button onclick="eliminarUsuario('${u.id}')">Eliminar</button>
            </td>
        `;

        cont.appendChild(tr);
    });
};

// ===============================
// ABRIR MODAL
// ===============================
window.abrirModalUsuario = function (modo, id = null) {
    modoUsuario = modo;
    usuarioEditandoId = id;

    const modal = document.getElementById("modalUsuario");
    if (modal) modal.style.display = "flex";

    if (modo === "editar" && id) {
        const u = (window.BD_usuarios || []).find(x => x.id === id);
        if (!u) return;

        setValue("usuarioNombre", u.usuario);
        setValue("usuarioRol", u.rol);
        setValue("usuarioPin", u.pin);
    } else {
        setValue("usuarioNombre", "");
        setValue("usuarioRol", "NORMAL");
        setValue("usuarioPin", "");
    }
};

// ===============================
// GUARDAR USUARIO
// ===============================
window.guardarUsuario = function () {
    const nombre = getValue("usuarioNombre");
    const rol = getValue("usuarioRol");
    const pin = getValue("usuarioPin");

    if (!nombre || !pin) return alert("Datos incompletos");

    if (modoUsuario === "nuevo") {
        const nuevo = {
            id: crypto.randomUUID(),
            usuario: nombre,
            rol: rol,
            pin: pin
        };

        window.BD_usuarios.push(nuevo);
    }

    if (modoUsuario === "editar") {
        const idx = window.BD_usuarios.findIndex(x => x.id === usuarioEditandoId);
        if (idx !== -1) {
            window.BD_usuarios[idx].usuario = nombre;
            window.BD_usuarios[idx].rol = rol;
            window.BD_usuarios[idx].pin = pin;
        }
    }

    cerrarModalUsuario();
    renderUsuarios();
};

// ===============================
// EDITAR
// ===============================
window.editarUsuario = function (id) {
    abrirModalUsuario("editar", id);
};

// ===============================
// ELIMINAR
// ===============================
window.eliminarUsuario = function (id) {
    if (!confirm("Eliminar usuario?")) return;

    window.BD_usuarios = window.BD_usuarios.filter(u => u.id !== id);
    renderUsuarios();
};

// ===============================
// CERRAR MODAL
// ===============================
window.cerrarModalUsuario = function () {
    const modal = document.getElementById("modalUsuario");
    if (modal) modal.style.display = "none";
};

// ===============================
// HELPERS
// ===============================
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

// ===============================
// SEGURIDAD SIMPLE (ADMIN PIN)
// ===============================
window.validarAdmin = function (pin) {
    return pin === "9999";
};

// ===============================
// AUTO INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.initUsuarios === "function") {
        window.initUsuarios();
    }
});

})();
