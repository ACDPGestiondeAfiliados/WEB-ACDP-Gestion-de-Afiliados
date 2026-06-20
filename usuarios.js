// ===============================
// USUARIOS ACDP
// Gestión de cuentas y permisos
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarUsuarios();
});

// Inicializa módulo
function iniciarUsuarios() {
    cargarUsuarios();
    eventosUsuarios();
}

// Eventos principales
function eventosUsuarios() {
    const nuevo = document.getElementById("btnNuevoUsuario");

    if (nuevo) {
        nuevo.addEventListener("click", abrirNuevoUsuario);
    }
}

// ===============================
// CARGA TABLA USUARIOS
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
                <button onclick="eliminarUsuario(${index})">Eliminar</button>
            </td>
        </tr>
        `;
    });
}

// ===============================
// MODAL NUEVO USUARIO
// ===============================
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

        <div id="msgPin" style="font-size:12px;color:#c00;margin-top:5px;"></div>

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
// VALIDACIONES EN TIEMPO REAL
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

        // usuario duplicado
        const existe = BD_usuarios.some(
            u => u.usuario.toLowerCase() === usuario.toLowerCase()
        );

        const usuarioOk = usuario.length >= 4 && !existe;
        const pinOk = pin.length === 4;
        const pinCoincide = pin === pin2;

        // mensaje en vivo
        if (pin.length > 0 && pin2.length > 0 && !pinCoincide) {
            msg.textContent = "PIN no coincide";
        } else if (existe) {
            msg.textContent = "Usuario ya existe";
        } else {
            msg.textContent = "";
        }

        boton.disabled = !(usuarioOk && pinOk && pinCoincide);
    }

    // usuario: solo letras + acentos + espacios
    usuarioInput.addEventListener("input", () => {
        usuarioInput.value = usuarioInput.value
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
            .slice(0, 20);

        validar();
    });

    // PIN solo números
    pinInput.addEventListener("input", () => {
        pinInput.value = pinInput.value
            .replace(/\D/g, "")
            .slice(0, 4);

        validar();
    });

    confirmInput.addEventListener("input", () => {
        confirmInput.value = confirmInput.value
            .replace(/\D/g, "")
            .slice(0, 4);

        validar();
    });

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
    if (pin.length !== 4) return;
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

    const usuario = BD_usuarios[index];

    if (usuario.usuario === "Admin") {
        alert("El usuario Admin no puede eliminarse");
        return;
    }

    BD_usuarios.splice(index, 1);

    guardarBD();
    cargarUsuarios();

    escribirConsola("Usuario eliminado");
}

// ===============================
// CIERRE MODAL
// ===============================
function cerrarModal() {
    document.getElementById("modalFondo").classList.remove("activo");
}
