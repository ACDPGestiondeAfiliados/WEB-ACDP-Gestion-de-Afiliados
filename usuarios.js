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

        <input id="usuarioNombre" placeholder="Nombre (solo letras, max 20)">
        
        <select id="usuarioTipo">
            <option value="">Tipo</option>
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

        const validar = () => {

            const nombreValido =
                /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,20}$/.test(nombre.value.trim());

            const tipoValido = tipo.value !== "";

            const pinValido =
                /^\d{4}$/.test(pin.value) &&
                pin.value === pin2.value;

            btn.disabled = !(nombreValido && tipoValido && pinValido);
        };

        [nombre, tipo, pin, pin2].forEach(el => {
            el.addEventListener("input", validar);
            el.addEventListener("change", validar);
        });

        document.getElementById("btnGuardarUsuario").onclick = guardarUsuario;

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

        // FIREBASE REST FIX
        try {
            await fetch(
                "https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/usuarios?documentId=" + id,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fields: {
                            usuario: { stringValue: nombre },
                            tipo: { stringValue: tipo },
                            pin: { stringValue: pin }
                        }
                    })
                }
            );
        } catch (e) {
            console.error(e);
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
    document.getElementById("modalFondo")?.classList.remove("activo");
};

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    window.initUsuarios();
});

})();
