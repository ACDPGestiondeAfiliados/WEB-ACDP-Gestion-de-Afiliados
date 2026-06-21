// ===============================
// USUARIOS.JS — ACDP
// Gestión de cuentas y permisos
// Versión Firebase Modular v9+
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarUsuarios();
});

// ===============================
// INICIALIZACIÓN
// ===============================

function iniciarUsuarios() {
    eventosUsuarios();
}

// ===============================
// EVENTOS
// ===============================

function eventosUsuarios() {

    const btnNuevo = document.getElementById("btnNuevoUsuario");

    if (btnNuevo) {
        btnNuevo.addEventListener("click", abrirNuevoUsuario);
    }

}

// ===============================
// CARGAR TABLA DESDE FIRESTORE
// ===============================

async function cargarUsuarios() {

    mostrarCargandoUsuarios();

    try {

        const lista = await DB.getUsuarios();
        renderTablaUsuarios(lista);

    } catch(e) {

        console.error("Error cargando usuarios:", e);
        mostrarErrorUsuarios("Error al cargar los usuarios.");

    }

}

// ===============================
// RENDER TABLA
// ===============================

function renderTablaUsuarios(lista) {

    const tbody = document
        .getElementById("tablaUsuarios")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (lista.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3"
                    style="text-align:center;padding:20px;color:#888;">
                    Sin usuarios registrados
                </td>
            </tr>`;

        return;

    }

    lista.forEach(u => {

        const esAdmin = u.usuario === "Admin";

        tbody.innerHTML += `
            <tr>
                <td>${u.usuario || ""}</td>
                <td>${u.tipo    || ""}</td>
                <td>
                    <img src="edit.png"
                        class="iconoHistorial"
                        title="Editar usuario"
                        onclick="abrirEditarUsuario('${u.id}')">
                    ${esAdmin ? "" : `
                    <img src="delete.png"
                        class="iconoHistorial"
                        title="Eliminar usuario"
                        onclick="eliminarUsuario('${u.id}','${u.usuario}')">`}
                </td>
            </tr>`;

    });

}

// ===============================
// HELPERS VISUALES
// ===============================

function mostrarCargandoUsuarios() {

    const tbody = document
        .getElementById("tablaUsuarios")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="3"
                style="text-align:center;padding:20px;color:#888;">
                Cargando...
            </td>
        </tr>`;

}

function mostrarErrorUsuarios(mensaje) {

    const tbody = document
        .getElementById("tablaUsuarios")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="3"
                style="text-align:center;padding:20px;color:#c00;">
                ${mensaje}
            </td>
        </tr>`;

}

// ===============================
// NUEVO USUARIO — MODAL
// ===============================

function abrirNuevoUsuario() {

    const fondo     = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `

        <h3>Nuevo usuario</h3>

        <input
            id="usuarioNuevo"
            placeholder="Nombre de usuario"
            maxlength="20"
            autocomplete="off">

        <input
            id="pinNuevo"
            type="password"
            placeholder="PIN (4 dígitos)"
            maxlength="4"
            inputmode="numeric">

        <input
            id="pinConfirmar"
            type="password"
            placeholder="Confirmar PIN"
            maxlength="4"
            inputmode="numeric">

        <select id="tipoNuevo">
            <option value="Normal">Normal</option>
            <option value="Administrador">Administrador</option>
        </select>

        <div id="msgNuevoUsuario"
            style="font-size:12px;color:#c00;
                   min-height:16px;margin-top:6px;">
        </div>

        <button id="btnGuardarUsuario" disabled>
            Guardar
        </button>

    `;

    fondo.classList.add("activo");

    aplicarValidacionesNuevoUsuario();

}

// ===============================
// VALIDACIONES — NUEVO USUARIO
// ===============================

function aplicarValidacionesNuevoUsuario() {

    const inputUsuario  = document.getElementById("usuarioNuevo");
    const inputPin      = document.getElementById("pinNuevo");
    const inputConfirm  = document.getElementById("pinConfirmar");
    const btnGuardar    = document.getElementById("btnGuardarUsuario");
    const msg           = document.getElementById("msgNuevoUsuario");

    // Solo letras y espacios en nombre
    inputUsuario.addEventListener("input", () => {
        inputUsuario.value = inputUsuario.value
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
            .slice(0, 20);
        validarFormNuevo();
    });

    // Solo números en PINs
    inputPin.addEventListener("input", () => {
        inputPin.value = inputPin.value.replace(/\D/g, "").slice(0, 4);
        validarFormNuevo();
    });

    inputConfirm.addEventListener("input", () => {
        inputConfirm.value = inputConfirm.value.replace(/\D/g, "").slice(0, 4);
        validarFormNuevo();
    });

    // Enter en confirmar PIN guarda directamente
    inputConfirm.addEventListener("keydown", e => {
        if (e.key === "Enter" && !btnGuardar.disabled) {
            guardarNuevoUsuario();
        }
    });

    btnGuardar.addEventListener("click", guardarNuevoUsuario);

    async function validarFormNuevo() {

        const usuario = inputUsuario.value.trim();
        const pin     = inputPin.value.trim();
        const pin2    = inputConfirm.value.trim();

        if (usuario.length < 4) {
            msg.textContent   = "El nombre debe tener al menos 4 caracteres";
            btnGuardar.disabled = true;
            return;
        }

        // Verificar duplicado en Firestore
        try {

            const lista  = await DB.getUsuarios();
            const existe = lista.some(
                u => u.usuario.toLowerCase() === usuario.toLowerCase()
            );

            if (existe) {
                msg.textContent   = "Ese nombre de usuario ya existe";
                btnGuardar.disabled = true;
                return;
            }

        } catch(e) {
            // Si falla la consulta, no bloqueamos
        }

        if (pin.length !== 4) {
            msg.textContent   = "El PIN debe tener exactamente 4 dígitos";
            btnGuardar.disabled = true;
            return;
        }

        if (pin !== pin2) {
            msg.textContent   = "Los PINs no coinciden";
            btnGuardar.disabled = true;
            return;
        }

        // Todo válido
        msg.textContent     = "";
        btnGuardar.disabled = false;

    }

}

// ===============================
// GUARDAR NUEVO USUARIO
// ===============================

async function guardarNuevoUsuario() {

    const usuario = document.getElementById("usuarioNuevo").value.trim();
    const pin     = document.getElementById("pinNuevo").value.trim();
    const pin2    = document.getElementById("pinConfirmar").value.trim();
    const tipo    = document.getElementById("tipoNuevo").value;
    const msg     = document.getElementById("msgNuevoUsuario");

    // Validaciones finales
    if (!usuario || usuario.length < 4) {
        msg.textContent = "Nombre de usuario inválido";
        return;
    }

    if (pin.length !== 4 || pin !== pin2) {
        msg.textContent = "PIN inválido o no coincide";
        return;
    }

    msg.textContent = "Guardando...";

    try {

        // Doble verificación de duplicado
        const lista  = await DB.getUsuarios();
        const existe = lista.some(
            u => u.usuario.toLowerCase() === usuario.toLowerCase()
        );

        if (existe) {
            msg.textContent = "Ese nombre de usuario ya existe";
            return;
        }

        await DB.addUsuario({ usuario, pin, tipo });

        await DB.addLog({
            accion  : "USUARIO",
            detalle : `Nuevo usuario creado: ${usuario} (${tipo})`
        });

        if (typeof escribirConsola === "function") {
            escribirConsola("Usuario creado: " + usuario);
        }

        cerrarModal();
        await cargarUsuarios();

    } catch(e) {

        console.error("Error guardando usuario:", e);
        msg.textContent = "Error al guardar. Intentá de nuevo.";

    }

}

// ===============================
// EDITAR USUARIO — MODAL
// ===============================

async function abrirEditarUsuario(id) {

    let usuario;

    try {

        const lista = await DB.getUsuarios();
        usuario     = lista.find(u => u.id === id);

    } catch(e) {

        alert("Error al cargar el usuario.");
        return;

    }

    if (!usuario) return;

    const fondo     = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `

        <h3>Editar usuario</h3>

        <input
            id="editUsuarioNombre"
            value="${usuario.usuario || ""}"
            maxlength="20"
            placeholder="Nombre de usuario"
            ${usuario.usuario === "Admin" ? "readonly" : ""}>

        <input
            id="editUsuarioPin"
            type="password"
            placeholder="Nuevo PIN (dejar vacío para no cambiar)"
            maxlength="4"
            inputmode="numeric">

        <input
            id="editUsuarioPinConfirm"
            type="password"
            placeholder="Confirmar nuevo PIN"
            maxlength="4"
            inputmode="numeric">

        <select id="editUsuarioTipo"
            ${usuario.usuario === "Admin" ? "disabled" : ""}>
            <option value="Normal"
                ${usuario.tipo === "Normal" ? "selected" : ""}>
                Normal
            </option>
            <option value="Administrador"
                ${usuario.tipo === "Administrador" ? "selected" : ""}>
                Administrador
            </option>
        </select>

        <div id="msgEditUsuario"
            style="font-size:12px;color:#c00;
                   min-height:16px;margin-top:6px;">
        </div>

        <button id="btnGuardarEdicionUsuario">
            Guardar cambios
        </button>

    `;

    fondo.classList.add("activo");

    // Solo números en PINs
    ["editUsuarioPin","editUsuarioPinConfirm"].forEach(inputId => {
        document.getElementById(inputId)
            ?.addEventListener("input", e => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
            });
    });

    document.getElementById("btnGuardarEdicionUsuario")
        .addEventListener("click", () => guardarEdicionUsuario(id, usuario));

}

// ===============================
// GUARDAR EDICIÓN DE USUARIO
// ===============================

async function guardarEdicionUsuario(id, original) {

    const nuevoNombre = document.getElementById("editUsuarioNombre").value.trim();
    const nuevoPin    = document.getElementById("editUsuarioPin").value.trim();
    const confirPin   = document.getElementById("editUsuarioPinConfirm").value.trim();
    const nuevoTipo   = document.getElementById("editUsuarioTipo").value;
    const msg         = document.getElementById("msgEditUsuario");

    if (!nuevoNombre || nuevoNombre.length < 4) {
        msg.textContent = "El nombre debe tener al menos 4 caracteres";
        return;
    }

    // Validar PIN solo si se quiere cambiar
    if (nuevoPin || confirPin) {

        if (nuevoPin.length !== 4) {
            msg.textContent = "El nuevo PIN debe tener 4 dígitos";
            return;
        }

        if (nuevoPin !== confirPin) {
            msg.textContent = "Los PINs no coinciden";
            return;
        }

    }

    msg.textContent = "Guardando...";

    try {

        // Verificar nombre duplicado (ignorando el propio usuario)
        const lista  = await DB.getUsuarios();
        const existe = lista.some(
            u => u.id !== id &&
                 u.usuario.toLowerCase() === nuevoNombre.toLowerCase()
        );

        if (existe) {
            msg.textContent = "Ese nombre de usuario ya existe";
            return;
        }

        const cambios = {
            usuario : nuevoNombre,
            tipo    : nuevoTipo
        };

        // Solo actualizar PIN si se ingresó uno nuevo
        if (nuevoPin && nuevoPin.length === 4) {
            cambios.pin = nuevoPin;
        }

        await DB.updateUsuario(id, cambios);

        await DB.addLog({
            accion  : "USUARIO",
            detalle : `Usuario editado: ${nuevoNombre} (${nuevoTipo})`
        });

        if (typeof escribirConsola === "function") {
            escribirConsola("Usuario editado: " + nuevoNombre);
        }

        cerrarModal();
        await cargarUsuarios();

    } catch(e) {

        console.error("Error editando usuario:", e);
        msg.textContent = "Error al guardar. Intentá de nuevo.";

    }

}

// ===============================
// ELIMINAR USUARIO
// ===============================

function eliminarUsuario(id, nombreUsuario) {

    if (nombreUsuario === "Admin") {
        alert("El usuario Admin no puede eliminarse.");
        return;
    }

    const fondo     = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `

        <h3>Eliminar usuario</h3>

        <p>
            ¿Confirmás la eliminación del usuario
            <b>${nombreUsuario}</b>?
        </p>

        <p style="font-size:13px;color:#c00;">
            Esta acción no se puede deshacer.
        </p>

        <div id="msgEliminarUsuario"
            style="font-size:12px;color:#c00;min-height:16px;">
        </div>

        <div style="display:flex;gap:10px;margin-top:12px;">

            <button id="btnConfirmarEliminarUsuario"
                style="flex:1;background:#c00;color:white;
                       border:none;border-radius:8px;
                       padding:12px;font-weight:bold;cursor:pointer;">
                Eliminar
            </button>

            <button onclick="cerrarModal()"
                style="flex:1;background:#eee;border:none;
                       border-radius:8px;padding:12px;cursor:pointer;">
                Cancelar
            </button>

        </div>

    `;

    fondo.classList.add("activo");

    document.getElementById("btnConfirmarEliminarUsuario")
        .addEventListener("click", () => confirmarEliminarUsuario(id, nombreUsuario));

}

// ===============================
// CONFIRMAR ELIMINACIÓN
// ===============================

async function confirmarEliminarUsuario(id, nombreUsuario) {

    const msg = document.getElementById("msgEliminarUsuario");
    if (msg) msg.textContent = "Eliminando...";

    try {

        await DB.deleteUsuario(id);

        await DB.addLog({
            accion  : "USUARIO",
            detalle : `Usuario eliminado: ${nombreUsuario}`
        });

        if (typeof escribirConsola === "function") {
            escribirConsola("Usuario eliminado: " + nombreUsuario);
        }

        cerrarModal();
        await cargarUsuarios();

    } catch(e) {

        console.error("Error eliminando usuario:", e);
        if (msg) msg.textContent = "Error al eliminar. Intentá de nuevo.";

    }

}

// ===============================
// HOOK: carga al abrir sección
// ===============================

document.addEventListener("seccionAbierta", async (e) => {
    if (e.detail === "usuarios") {
        await cargarUsuarios();
    }
});

// Exponer globalmente
window.abrirEditarUsuario = abrirEditarUsuario;
window.eliminarUsuario    = eliminarUsuario;
window.cargarUsuarios     = cargarUsuarios;
