// ===============================
// USUARIOS.JS - ACDP (FIXED)
// ===============================

(function () {

let modoUsuario = "nuevo";
let usuarioEditandoId = null;

// ===============================
// INIT
// ===============================
window.initUsuarios = function () {

    const esperarBD = () => {
        if (!window.BD_usuarios) {
            setTimeout(esperarBD, 150);
            return;
        }
        renderUsuarios();
    };

    const btnNuevo = document.getElementById("btnNuevoUsuario");

    if (btnNuevo) {
        btnNuevo.onclick = () => abrirModalUsuario("nuevo");
    }

    esperarBD();
};

// ===============================
// RENDER TABLA
// ===============================
window.renderUsuarios = function () {

    const cont = document.querySelector("#tablaUsuarios tbody");
    if (!cont) return;

    cont.innerHTML = "";

    (window.BD_usuarios || []).forEach(u => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.usuario || ""}</td>
            <td>${u.tipo || u.rol || "Normal"}</td>
            <td>
                <button onclick="editarUsuario('${u.id}')">Editar</button>
                <button onclick="eliminarUsuario('${u.id}')">Eliminar</button>
            </td>
        `;

        cont.appendChild(tr);
    });
};

// ===============================
// ABRIR MODAL (GLOBAL FIX)
// ===============================
window.abrirModalUsuario = function (modo, id = null) {

    modoUsuario = modo;
    usuarioEditandoId = id;

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    if (!fondo || !contenido) return;

    fondo.classList.add("activo");

    if (modo === "editar" && id) {

        const u = (window.BD_usuarios || []).find(x => x.id === id);
        if (!u) return;

        contenido.innerHTML = `
            <h3>Editar usuario</h3>

            <input id="usuarioNombre" placeholder="Usuario" value="${u.usuario || ""}">
            <input id="usuarioRol" placeholder="Tipo" value="${u.tipo || u.rol || "NORMAL"}">
            <input id="usuarioPin" placeholder="PIN" value="${u.pin || ""}">

            <button onclick="guardarUsuario()">Guardar</button>
        `;

    } else {

        contenido.innerHTML = `
            <h3>Nuevo usuario</h3>

            <input id="usuarioNombre" placeholder="Usuario">
            <input id="usuarioRol" placeholder="Tipo (Normal/Administrador)" value="NORMAL">
            <input id="usuarioPin" placeholder="PIN">

            <button onclick="guardarUsuario()">Guardar</button>
        `;
    }
};

// ===============================
// GUARDAR
// ===============================
window.guardarUsuario = function () {

    const nombre = getValue("usuarioNombre");
    const rol = getValue("usuarioRol");
    const pin = getValue("usuarioPin");

    if (!nombre || !pin) return alert("Datos incompletos");

    if (modoUsuario === "nuevo") {

        window.BD_usuarios.push({
            id: crypto.randomUUID(),
            usuario: nombre,
            tipo: rol,
            pin: pin
        });

    } else {

        const idx = window.BD_usuarios.findIndex(x => x.id === usuarioEditandoId);

        if (idx !== -1) {
            window.BD_usuarios[idx].usuario = nombre;
            window.BD_usuarios[idx].tipo = rol;
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

    const fondo = document.getElementById("modalFondo");
    if (fondo) fondo.classList.remove("activo");
};

// ===============================
// HELPERS
// ===============================
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

// ===============================
// AUTO INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    window.initUsuarios();
});

})();
