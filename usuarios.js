// ===============================
// USUARIOS ACDP
// Gestión de cuentas y permisos
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarUsuarios();
});

// ===============================
// INICIALIZACIÓN
// ===============================
function iniciarUsuarios() {
    cargarUsuarios();
    eventosUsuarios();
}

// ===============================
// EVENTOS GENERALES
// ===============================
function eventosUsuarios() {
    const nuevo = document.getElementById("btnNuevoUsuario");

    if (nuevo) {
        nuevo.addEventListener("click", abrirNuevoUsuario);
    }
}

// ===============================
// RENDER TABLA
// ===============================
function cargarUsuarios() {

    const cuerpo = document
        .getElementById("tablaUsuarios")
        .querySelector("tbody");

    cuerpo.innerHTML = "";

    BD_usuarios.forEach((u, index) => {

        cuerpo.innerHTML += `
        <tr>
            <td>${u.usuario}</td>
            <td>${u.tipo}</td>
            <td>

                <img 
                    src="editar.png"
                    class="iconoUsuarios"
                    title="Editar usuario"
                    onclick="abrirEditarUsuario(${index})"
                >

                <img 
                    src="eliminar.png"
                    class="iconoUsuarios"
                    title="Eliminar usuario"
                    onclick="eliminarUsuario(${index})"
                >

            </td>
        </tr>
        `;
    });
}

//
// ======================================================
// CREAR USUARIO
// ======================================================
//
function abrirNuevoUsuario() {

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <h3>Nuevo usuario</h3>

        <input id="usuarioNuevo"
            placeholder="Usuario"
            maxlength="20"
            autocomplete="off"
        >

        <input id="pinNuevo"
            type="password"
            placeholder="PIN"
            maxlength="4"
            inputmode="numeric"
        >

        <input id="pinConfirmar"
            type="password"
            placeholder="Confirmar PIN"
            maxlength="4"
            inputmode="numeric"
        >

        <div id="msgPin" style="font-size:12px;color:#c00;margin-top:6px;"></div>

        <select id="tipoNuevo">
            <option value="Normal">Normal</option>
            <option value="Administrador">Administrador</option>
        </select>

        <button id="btnGuardarUsuario" disabled>
            Guardar
        </button>
    `;

    fondo.classList.add("activo");

    aplicarValidacionesUsuario();
}

// ===============================
// VALIDACIÓN CREAR
// ===============================
function aplicarValidacionesUsuario() {

    const usuarioInput = document.getElementById("usuarioNuevo");
    const pinInput = document.getElementById("pinNuevo");
    const confirmInput = document.getElementById("pinConfirmar");
    const boton = document.getElementById("btnGuardarUsuario");
    const msg = document.getElementById("msgPin");

    function validar() {

        const usuario = usuarioInput.value.trim();
        const pin = pinInput.value.trim();
        const pin2 = confirmInput.value.trim();

        const existe = BD_usuarios.some(
            u => u.usuario.toLowerCase() === usuario.toLowerCase()
        );

        const usuarioOk = usuario.length >= 4 && !existe;
        const pinOk = pin.length === 4;
        const pinMatch = pin === pin2;

        if (existe) msg.textContent = "Usuario ya existe";
        else if (pin && pin2 && !pinMatch) msg.textContent = "PIN no coincide";
        else msg.textContent = "";

        boton.disabled = !(usuarioOk && pinOk && pinMatch);
    }

    usuarioInput.oninput = () => {
        usuarioInput.value = usuarioInput.value
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
            .slice(0, 20);
        validar();
    };

    pinInput.oninput = () => {
        pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 4);
        validar();
    };

    confirmInput.oninput = () => {
        confirmInput.value = confirmInput.value.replace(/\D/g, "").slice(0, 4);
        validar();
    };

    boton.onclick = guardarUsuario;

    validar();
}

// ===============================
// GUARDAR USUARIO
// ===============================
function guardarUsuario() {

    const usuario = document.getElementById("usuarioNuevo").value.trim();
    const pin = document.getElementById("pinNuevo").value.trim();
    const pin2 = document.getElementById("pinConfirmar").value.trim();
    const tipo = document.getElementById("tipoNuevo").value;

    const existe = BD_usuarios.some(
        u => u.usuario.toLowerCase() === usuario.toLowerCase()
    );

    if (!usuario || !pin || !pin2) return;
    if (usuario.length < 4) return;
    if (pin !== pin2) return;
    if (existe) return;

    BD_usuarios.push({
        usuario,
        pin,
        tipo
    });

    guardarBD();
    cerrarModal();
    cargarUsuarios();

    escribirConsola("Usuario creado: " + usuario);
}

// ===============================
// ELIMINAR USUARIO
// ===============================
function eliminarUsuario(index) {

    const u = BD_usuarios[index];

    if (u.usuario === "Admin") {
        alert("El usuario Admin no puede eliminarse");
        return;
    }

    BD_usuarios.splice(index, 1);

    guardarBD();
    cargarUsuarios();

    escribirConsola("Usuario eliminado: " + u.usuario);
}

// ===============================
// EDITAR USUARIO
// ===============================
function abrirEditarUsuario(index) {

    const u = BD_usuarios[index];

    const fondo = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <h3>Editar usuario</h3>

        <input id="editUsuario" value="${u.usuario}" maxlength="20">

        <input id="editPin" type="password" value="${u.pin}" maxlength="4" inputmode="numeric">

        <select id="editTipo">
            <option value="Normal" ${u.tipo === "Normal" ? "selected" : ""}>Normal</option>
            <option value="Administrador" ${u.tipo === "Administrador" ? "selected" : ""}>Administrador</option>
        </select>

        <div id="msgEdit" style="font-size:12px;color:#c00;margin-top:6px;"></div>

        <button id="btnGuardarEdit">Guardar cambios</button>
    `;

    fondo.classList.add("activo");

    document.getElementById("btnGuardarEdit").onclick = () => {

        const nuevoUsuario = document.getElementById("editUsuario").value.trim();
        const nuevoPin = document.getElementById("editPin").value.trim();
        const nuevoTipo = document.getElementById("editTipo").value;

        const existe = BD_usuarios.some(
            (x, i) =>
                i !== index &&
                x.usuario.toLowerCase() === nuevoUsuario.toLowerCase()
        );

        if (existe) {
            document.getElementById("msgEdit").textContent =
                "Usuario ya existe";
            return;
        }

        BD_usuarios[index] = {
            usuario: nuevoUsuario,
            pin: nuevoPin,
            tipo: nuevoTipo
        };

        guardarBD();
        cerrarModal();
        cargarUsuarios();

        escribirConsola("Usuario editado: " + nuevoUsuario);
    };
}

// ===============================
// CIERRE MODAL
// ===============================
function cerrarModal() {
    document.getElementById("modalFondo").classList.remove("activo");
}
