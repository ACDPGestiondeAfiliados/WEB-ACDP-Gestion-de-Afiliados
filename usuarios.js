(function () {

let modoUsuario = "nuevo";
let usuarioEditandoId = null;

// ===============================
// INIT
// ===============================
window.initUsuarios = function () {

    const btn = document.getElementById("btnNuevoUsuario");

    if (btn) {
        btn.onclick = () => abrirModalUsuario("nuevo");
    }

    esperarBD();
};

function esperarBD() {
    if (!Array.isArray(window.BD_usuarios)) {
        setTimeout(esperarBD, 150);
        return;
    }
    render();
}

// ===============================
// RENDER
// ===============================
function render() {

    const cont = document.querySelector("#tablaUsuarios tbody");
    if (!cont) return;

    cont.innerHTML = "";

    (window.BD_usuarios || []).forEach(u => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.usuario || ""}</td>
            <td>${u.tipo || "Normal"}</td>
            <td>
                <button onclick="editarUsuario('${u.id}')">Editar</button>
                <button onclick="eliminarUsuario('${u.id}')">Eliminar</button>
            </td>
        `;

        cont.appendChild(tr);
    });
}

// ===============================
// MODAL
// ===============================
window.abrirModalUsuario = function (modo, id = null) {

    modoUsuario = modo;
    usuarioEditandoId = id;

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    if (!fondo || !contenido) return;

    fondo.classList.add("activo");

    contenido.innerHTML = `
        <h3>${modo === "editar" ? "Editar usuario" : "Nuevo usuario"}</h3>

        <input id="usuarioNombre" placeholder="Nombre" maxlength="20">

        <select id="usuarioTipo">
            <option value="Normal">Normal</option>
            <option value="Administrador">Administrador</option>
        </select>

        <input id="usuarioPin" type="password" maxlength="4" placeholder="PIN">
        <input id="usuarioPin2" type="password" maxlength="4" placeholder="Confirmar PIN">

        <button id="btnGuardarUsuario" disabled>Guardar</button>
    `;

    setTimeout(() => {

        const nombre = document.getElementById("usuarioNombre");
        const tipo = document.getElementById("usuarioTipo");
        const pin = document.getElementById("usuarioPin");
        const pin2 = document.getElementById("usuarioPin2");
        const btn = document.getElementById("btnGuardarUsuario");

        const validar = () => {

            const nombreValido =
                /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,20}$/.test(nombre.value.trim());

            const pinValido =
                /^\d{4}$/.test(pin.value) &&
                pin.value === pin2.value;

            btn.disabled = !(nombreValido && tipo.value && pinValido);
        };

        [nombre, tipo, pin, pin2].forEach(el => {
            el.addEventListener("input", validar);
        });

        btn.onclick = guardarUsuario;

    }, 80);
};

// ===============================
// GUARDAR (FIX REAL FIREBASE)
// ===============================
async function guardarUsuario() {

    const nombre = document.getElementById("usuarioNombre").value.trim();
    const tipo = document.getElementById("usuarioTipo").value;
    const pin = document.getElementById("usuarioPin").value;

    if (!nombre || !tipo || !pin) return;

    const data = { usuario: nombre, tipo, pin };

    try {

        const { doc, setDoc } = await import("./firebase.js");

        const id = (modoUsuario === "nuevo")
            ? crypto.randomUUID()
            : usuarioEditandoId;

        await setDoc(doc(window.db, "usuarios", id), data);

        const actualizado = { id, ...data };

        if (modoUsuario === "nuevo") {
            window.BD_usuarios = [...(window.BD_usuarios || []), actualizado];
        } else {
            window.BD_usuarios = (window.BD_usuarios || []).map(u =>
                u.id === id ? actualizado : u
            );
        }

    } catch (e) {
        console.error("FIREBASE ERROR:", e);
    }

    cerrar();
    render();
}

// ===============================
// EDITAR / ELIMINAR
// ===============================
window.editarUsuario = function (id) {
    abrirModalUsuario("editar", id);
};

window.eliminarUsuario = async function (id) {

    try {
        const { doc, deleteDoc } = await import("./firebase.js");
        await deleteDoc(doc(window.db, "usuarios", id));
    } catch (e) {
        console.error(e);
    }

    window.BD_usuarios = window.BD_usuarios.filter(u => u.id !== id);
    render();
};

// ===============================
// CERRAR
// ===============================
function cerrar() {
    document.getElementById("modalFondo")?.classList.remove("activo");
}

// ===============================
document.addEventListener("DOMContentLoaded", () => {
    window.initUsuarios();
});

})();
