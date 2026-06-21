// ===============================
// USUARIOS ACDP (FIRESTORE)
// ===============================

const COL_USUARIOS = "usuarios";

let cacheUsuarios = [];

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarUsuarios();
});

// ===============================
// INICIALIZACIÓN
// ===============================

async function iniciarUsuarios() {
    await cargarUsuarios();
    eventosUsuarios();
}

// ===============================
// EVENTOS
// ===============================

function eventosUsuarios() {
    const nuevo = document.getElementById("btnNuevoUsuario");
    if (nuevo) nuevo.addEventListener("click", abrirNuevoUsuario);
}

// ===============================
// CARGAR USUARIOS
// ===============================

async function cargarUsuarios() {

    const cuerpo = document
        .getElementById("tablaUsuarios")
        .querySelector("tbody");

    cuerpo.innerHTML = "";

    try {

        const snap = await getDocs(collection(window.db, COL_USUARIOS));

        cacheUsuarios = [];

        snap.forEach(d => cacheUsuarios.push(d.data()));

        cacheUsuarios.forEach((u) => {

            cuerpo.innerHTML += `
            <tr>
                <td>${u.usuario}</td>
                <td>${u.tipo}</td>
                <td>

                    <img src="edit.png"
                        class="iconoHistorial"
                        title="Editar usuario"
                        onclick="abrirEditarUsuario('${u.usuario}')"
                    >

                    <img src="delete.png"
                        class="iconoHistorial"
                        title="Eliminar usuario"
                        onclick="eliminarUsuario('${u.usuario}')"
                    >

                </td>
            </tr>`;
        });

    } catch (e) {
        console.error("Error usuarios:", e);
    }
}

// ===============================
// NUEVO USUARIO
// ===============================

function abrirNuevoUsuario() {

    document.getElementById("modalContenido").innerHTML = `
    <h3>Nuevo usuario</h3>

    <input id="usuarioNuevo" placeholder="Usuario" maxlength="20">

    <input id="pinNuevo" type="password" placeholder="PIN" maxlength="4" inputmode="numeric">

    <input id="pinConfirmar" type="password" placeholder="Confirmar PIN" maxlength="4" inputmode="numeric">

    <div id="msgPin" style="font-size:12px;color:#c00;margin-top:6px;"></div>

    <select id="tipoNuevo">
        <option value="Normal">Normal</option>
        <option value="Administrador">Administrador</option>
    </select>

    <button id="btnGuardarUsuario" disabled>Guardar</button>
    `;

    document.getElementById("modalFondo").classList.add("activo");

    aplicarValidacionesUsuario();
}

// ===============================
// VALIDACIÓN
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

        const existe = cacheUsuarios.some(
            u => u.usuario.toLowerCase() === usuario.toLowerCase()
        );

        const okUsuario = usuario.length >= 4 && !existe;
        const okPin = pin.length === 4;
        const match = pin === pin2;

        if (existe) msg.textContent = "Usuario ya existe";
        else if (pin && pin2 && !match) msg.textContent = "PIN no coincide";
        else msg.textContent = "";

        boton.disabled = !(okUsuario && okPin && match);
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

    document.getElementById("btnGuardarUsuario").onclick = guardarUsuario;

    validar();
}

// ===============================
// GUARDAR USUARIO
// ===============================

async function guardarUsuario() {

    const usuario = usuarioNuevo.value.trim();
    const pin = pinNuevo.value.trim();
    const pin2 = pinConfirmar.value.trim();
    const tipo = tipoNuevo.value;

    if (!usuario || !pin || pin !== pin2) return;

    const existe = cacheUsuarios.some(
        u => u.usuario.toLowerCase() === usuario.toLowerCase()
    );

    if (existe) return;

    try {

        await setDoc(doc(window.db, COL_USUARIOS, usuario), {
            usuario,
            pin,
            tipo
        });

        cerrarModal();
        await cargarUsuarios();

        escribirConsola("Usuario creado: " + usuario);

    } catch (e) {
        console.error("Error creando usuario:", e);
    }
}

// ===============================
// EDITAR
// ===============================

function abrirEditarUsuario(usuario) {

    const u = cacheUsuarios.find(x => x.usuario === usuario);
    if (!u) return;

    document.getElementById("modalContenido").innerHTML = `
    <h3>Editar usuario</h3>

    <input id="editUsuario" value="${u.usuario}" maxlength="20">

    <input id="editPin" type="password" value="${u.pin}" maxlength="4">

    <select id="editTipo">
        <option value="Normal" ${u.tipo === "Normal" ? "selected" : ""}>Normal</option>
        <option value="Administrador" ${u.tipo === "Administrador" ? "selected" : ""}>Administrador</option>
    </select>

    <div id="msgEdit"></div>

    <button id="btnGuardarEdit">Guardar cambios</button>
    `;

    document.getElementById("modalFondo").classList.add("activo");

    document.getElementById("btnGuardarEdit").onclick = async () => {

        const nuevoUsuario = editUsuario.value.trim();
        const nuevoPin = editPin.value.trim();
        const nuevoTipo = editTipo.value;

        try {

            if (nuevoUsuario !== usuario) {
                await deleteDoc(doc(window.db, COL_USUARIOS, usuario));
            }

            await setDoc(doc(window.db, COL_USUARIOS, nuevoUsuario), {
                usuario: nuevoUsuario,
                pin: nuevoPin,
                tipo: nuevoTipo
            });

            cerrarModal();
            await cargarUsuarios();

        } catch (e) {
            console.error("Error editando usuario:", e);
        }
    };
}

// ===============================
// ELIMINAR
// ===============================

async function eliminarUsuario(usuario) {

    if (usuario === "Admin") {
        alert("El usuario Admin no puede eliminarse");
        return;
    }

    try {

        await deleteDoc(doc(window.db, COL_USUARIOS, usuario));

        await cargarUsuarios();

        escribirConsola("Usuario eliminado: " + usuario);

    } catch (e) {
        console.error("Error eliminando usuario:", e);
    }
}

// ===============================
// MODAL
// ===============================

function cerrarModal() {
    document.getElementById("modalFondo").classList.remove("activo");
}
