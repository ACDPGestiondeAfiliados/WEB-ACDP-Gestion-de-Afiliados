(function () {

let modoUsuario = "nuevo";
let usuarioEditandoId = null;

// ===============================
// INIT
// ===============================
window.initUsuarios = function () {

    const btnNuevo = document.getElementById("btnNuevoUsuario");

    if (btnNuevo) {
        btnNuevo.onclick = () => abrirModalUsuario("nuevo");
    }

    esperarBD();
};

function esperarBD() {
    if (!window.BD_usuarios) {
        setTimeout(esperarBD, 150);
        return;
    }
    renderUsuarios();
}

// ===============================
// RENDER
// ===============================
window.renderUsuarios = function () {

    const cont = document.querySelector("#tablaUsuarios tbody");
    if (!cont) return;

    cont.innerHTML = "";

    (window.BD_usuarios || []).forEach(u => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.usuario}</td>
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

        <input id="usuarioNombre" placeholder="Nombre (max 20 letras)">
        
        <select id="usuarioTipo">
            <option value="Normal">Normal</option>
            <option value="Administrador">Administrador</option>
        </select>

        <input id="usuarioPin" type="password" maxlength="4" placeholder="PIN 4 dígitos">
        <input id="usuarioPin2" type="password" maxlength="4" placeholder="Confirmar PIN">

        <button id="btnGuardarUsuario" disabled>Guardar</button>
    `;

    setTimeout(() => {

        const nombre = document.getElementById("usuarioNombre");
        const tipo = document.getElementById("usuarioTipo");
        const pin = document.getElementById("usuarioPin");
        const pin2 = document.getElementById("usuarioPin2");
        const btn = document.getElementById("btnGuardarUsuario");

        function validar() {

            const nombreValido =
                /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,20}$/.test(nombre.value.trim());

            const pinValido =
                /^\d{4}$/.test(pin.value) &&
                pin.value === pin2.value;

            const tipoValido = tipo.value !== "";

            const ok = nombreValido && pinValido && tipoValido;

            btn.disabled = !ok;
        }

        [nombre, pin, pin2, tipo].forEach(el => {
            el.addEventListener("input", validar);
            el.addEventListener("change", validar);
        });

        btn.onclick = guardarUsuario;

    }, 50);
};

// ===============================
// GUARDAR
// ===============================
async function guardarUsuario() {

    const nombre = document.getElementById("usuarioNombre").value.trim();
    const tipo = document.getElementById("usuarioTipo").value;
    const pin = document.getElementById("usuarioPin").value;

    const data = {
        usuario: nombre,
        tipo,
        pin
    };

    if (modoUsuario === "nuevo") {

        const id = crypto.randomUUID();

        window.BD_usuarios.push({ id, ...data });

        // FIREBASE
        if (window.db) {
            try {
                const { doc, setDoc } = await import("./firebase.js");
                await setDoc(doc(window.db, "usuarios", id), data);
            } catch (e) {
                console.error(e);
            }
        }

    } else {

        const idx = window.BD_usuarios.findIndex(x => x.id === usuarioEditandoId);

        if (idx !== -1) {
            window.BD_usuarios[idx] = {
                ...window.BD_usuarios[idx],
                ...data
            };
        }
    }

    cerrarModalUsuario();
    renderUsuarios();
}

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
// INIT AUTO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    window.initUsuarios();
});

})();
