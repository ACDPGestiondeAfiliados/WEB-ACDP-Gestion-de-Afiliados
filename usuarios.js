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

        <input id="usuarioNombre" placeholder="Nombre (solo letras, max 20)" maxlength="20">

        <select id="usuarioTipo">
            <option value="">Tipo</option>
            <option value="Normal">Normal</option>
            <option value="Administrador">Administrador</option>
        </select>

        <input id="usuarioPin" type="password" inputmode="numeric" maxlength="4" placeholder="PIN 4 dígitos">
        <input id="usuarioPin2" type="password" inputmode="numeric" maxlength="4" placeholder="Confirmar PIN">

        <button id="btnGuardarUsuario" disabled>Guardar</button>
    `;

    setTimeout(() => {

        const nombre = document.getElementById("usuarioNombre");
        const tipo = document.getElementById("usuarioTipo");
        const pin = document.getElementById("usuarioPin");
        const pin2 = document.getElementById("usuarioPin2");
        const btn = document.getElementById("btnGuardarUsuario");

        // 🔥 BLOQUEO DE TECLAS (anti números en nombre)
        nombre.addEventListener("input", () => {
            nombre.value = nombre.value
                .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "")
                .slice(0, 20);
        });

        pin.addEventListener("input", () => {
            pin.value = pin.value.replace(/\D/g, "").slice(0, 4);
        });

        pin2.addEventListener("input", () => {
            pin2.value = pin2.value.replace(/\D/g, "").slice(0, 4);
        });

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

        btn.onclick = guardarUsuario;

    }, 50);
};

// ===============================
// GUARDAR (FIREBASE REAL FIX)
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

    try {

        const { doc, setDoc, deleteDoc } = await import("./firebase.js");

        if (modoUsuario === "nuevo") {

            const id = crypto.randomUUID();

            window.BD_usuarios.push({ id, ...data });

            await setDoc(doc(window.db, "usuarios", id), data);

        } else {

            const idx = window.BD_usuarios.findIndex(x => x.id === usuarioEditandoId);

            if (idx !== -1) {
                window.BD_usuarios[idx] = {
                    ...window.BD_usuarios[idx],
                    ...data
                };

                await setDoc(doc(window.db, "usuarios", usuarioEditandoId), data);
            }
        }

    } catch (e) {
        console.error("Firebase error:", e);
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
window.eliminarUsuario = async function (id) {

    if (!confirm("Eliminar usuario?")) return;

    try {
        const { doc, deleteDoc } = await import("./firebase.js");

        await deleteDoc(doc(window.db, "usuarios", id));

    } catch (e) {
        console.error(e);
    }

    window.BD_usuarios = window.BD_usuarios.filter(u => u.id !== id);
    renderUsuarios();
};

// ===============================
// CERRAR
// ===============================
window.cerrarModalUsuario = function () {
    document.getElementById("modalFondo")?.classList.remove("activo");
};

// ===============================
document.addEventListener("DOMContentLoaded", () => {
    window.initUsuarios();
});

})();
