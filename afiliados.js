// ===============================
// AFILIADOS.JS — ACDP
// Altas, búsqueda, edición,
// eliminación e impresión
// Versión Firebase Modular v9+
// ===============================

let paginaActual   = 1;
const cantidadPagina = 10;
let listaAfiliados = [];

document.addEventListener("DOMContentLoaded", () => {
    iniciarAfiliados();
});

// ===============================
// INICIALIZACIÓN
// ===============================

function iniciarAfiliados() {
    eventosAfiliados();
}

// ===============================
// EVENTOS
// ===============================

function eventosAfiliados() {

    const filtro    = document.getElementById("filtroAfiliados");
    const nuevo     = document.getElementById("btnNuevoAfiliado");
    const anterior  = document.getElementById("afiliadosAnterior");
    const siguiente = document.getElementById("afiliadosSiguiente");

    if (filtro) {
        filtro.addEventListener("input", () => {
            filtrarAfiliados(filtro.value);
        });
    }

    if (nuevo) {
        nuevo.addEventListener("click", abrirNuevoAfiliado);
    }

    if (anterior) {
        anterior.addEventListener("click", () => {
            if (paginaActual > 1) {
                paginaActual--;
                mostrarTabla();
            }
        });
    }

    if (siguiente) {
        siguiente.addEventListener("click", () => {
            const total = Math.ceil(listaAfiliados.length / cantidadPagina);
            if (paginaActual < total) {
                paginaActual++;
                mostrarTabla();
            }
        });
    }

}

// ===============================
// CARGAR AFILIADOS DESDE FIRESTORE
// ===============================

async function cargarAfiliados() {

    mostrarCargando("tablaAfiliados");

    try {

        const todos    = await DB.getAfiliados();
        listaAfiliados = [...todos].reverse();
        paginaActual   = 1;
        mostrarTabla();

    } catch(e) {

        console.error("Error cargando afiliados:", e);
        mostrarErrorTabla("tablaAfiliados", "Error al cargar afiliados.");

    }

}

// ===============================
// FILTRAR / BUSCAR
// ===============================

async function filtrarAfiliados(valor) {

    valor = valor.trim();

    if (!valor) {
        await cargarAfiliados();
        return;
    }

    mostrarCargando("tablaAfiliados");

    try {

        const resultados = await DB.buscarAfiliado(valor);
        listaAfiliados   = resultados;
        paginaActual     = 1;
        mostrarTabla();

    } catch(e) {

        console.error("Error buscando afiliado:", e);

    }

}

// ===============================
// TABLA CON PAGINACIÓN
// ===============================

function mostrarTabla() {

    const tbody = document
        .getElementById("tablaAfiliados")
        .querySelector("tbody");

    tbody.innerHTML = "";

    if (listaAfiliados.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:20px;color:#888;">
                    Sin resultados
                </td>
            </tr>`;

        document.getElementById("paginaAfiliados").textContent = "1";
        return;

    }

    const inicio = (paginaActual - 1) * cantidadPagina;

    listaAfiliados
        .slice(inicio, inicio + cantidadPagina)
        .forEach(a => {

            tbody.innerHTML += `
            <tr>
                <td>${a.numero  || ""}</td>
                <td>${a.dni     || ""}</td>
                <td>${a.nombre  || ""}</td>
                <td>${a.apellido|| ""}</td>
                <td>${a.celular || ""}</td>
                <td>${a.correo  || ""}</td>
                <td>${a.estado  || "Activo"}</td>
                <td>${a.fecha   || ""}</td>
                <td>
                    <img src="edit.png"
                        class="iconoHistorial"
                        title="Editar"
                        onclick="editarAfiliado('${a.id}')">
                    <img src="delete.png"
                        class="iconoHistorial"
                        title="Eliminar"
                        onclick="eliminarAfiliado('${a.id}','${a.nombre} ${a.apellido}')">
                    <img src="print.png"
                        class="iconoHistorial"
                        title="Imprimir carnet"
                        onclick="imprimirAfiliado('${a.id}')">
                </td>
            </tr>`;

        });

    document.getElementById("paginaAfiliados")
        .textContent = paginaActual;

}

// ===============================
// HELPERS DE TABLA
// ===============================

function mostrarCargando(tablaId) {

    const tbody = document
        .getElementById(tablaId)
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align:center;padding:20px;color:#888;">
                Cargando...
            </td>
        </tr>`;

}

function mostrarErrorTabla(tablaId, mensaje) {

    const tbody = document
        .getElementById(tablaId)
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align:center;padding:20px;color:#c00;">
                ${mensaje}
            </td>
        </tr>`;

}

// ===============================
// NUEVO AFILIADO — MODAL
// ===============================

function abrirNuevoAfiliado() {

    const contenido = document.getElementById("modalContenido");
    const fondo     = document.getElementById("modalFondo");

    contenido.innerHTML = `

        <h3>Nuevo afiliado</h3>

        <input id="nuevoDni"
            placeholder="DNI"
            maxlength="8"
            inputmode="numeric">

        <input id="nuevoNombre"
            placeholder="Nombre"
            maxlength="20">

        <input id="nuevoApellido"
            placeholder="Apellido"
            maxlength="20">

        <input id="nuevoCelular"
            placeholder="Celular"
            maxlength="10"
            inputmode="numeric">

        <input id="nuevoCorreo"
            placeholder="Correo"
            maxlength="40">

        <select id="nuevoEstado">
            <option value="Activo">Activo</option>
            <option value="Adherente">Adherente</option>
        </select>

        <div id="msgNuevo"
            style="font-size:12px;color:#c00;min-height:16px;margin-top:4px;">
        </div>

        <button id="btnGuardarNuevo">Guardar</button>

    `;

    fondo.classList.add("activo");

    aplicarValidaciones(
        ["nuevoDni", "nuevoCelular"],
        ["nuevoNombre", "nuevoApellido"]
    );

    document.getElementById("btnGuardarNuevo")
        .addEventListener("click", guardarNuevoAfiliado);

}

// ===============================
// VALIDACIONES DE CAMPOS
// ===============================

function aplicarValidaciones(numericos, textos) {

    numericos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener("input", () => {
                campo.value = campo.value.replace(/\D/g, "");
            });
        }
    });

    textos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener("input", () => {
                campo.value = campo.value
                    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
                    .slice(0, 20);
            });
        }
    });

}

// ===============================
// GUARDAR NUEVO AFILIADO
// ===============================

async function guardarNuevoAfiliado() {

    const dni      = document.getElementById("nuevoDni").value.trim();
    const nombre   = document.getElementById("nuevoNombre").value.trim();
    const apellido = document.getElementById("nuevoApellido").value.trim();
    const celular  = document.getElementById("nuevoCelular").value.trim();
    const correo   = document.getElementById("nuevoCorreo").value.trim();
    const estado   = document.getElementById("nuevoEstado").value;
    const msg      = document.getElementById("msgNuevo");

    // Validaciones básicas
    if (dni.length < 7) {
        msg.textContent = "DNI inválido (mínimo 7 dígitos)";
        return;
    }
    if (!nombre || !apellido) {
        msg.textContent = "Nombre y apellido son obligatorios";
        return;
    }

    msg.textContent = "Guardando...";

    try {

        // Verificar DNI duplicado
        const existentes = await DB.buscarAfiliado(dni);
        if (existentes.length > 0) {
            msg.textContent = "Ya existe un afiliado con ese DNI";
            return;
        }

        const numero = await DB.proximoNumeroAfiliado();

        const nuevo = {
            dni,
            numero,
            nombre,
            apellido,
            celular,
            correo,
            estado,
            fecha : new Date().toLocaleDateString()
        };

        await DB.addAfiliado(nuevo);

        await DB.addHistorial("ALTA", nuevo, "Alta de afiliado");

        await DB.addLog({
            accion  : "AFILIADOS",
            detalle : `Alta: ${nombre} ${apellido} | DNI: ${dni} | N°: ${numero}`
        });

        cerrarModal();
        await cargarAfiliados();

    } catch(e) {

        console.error("Error guardando afiliado:", e);
        msg.textContent = "Error al guardar. Intentá de nuevo.";

    }

}

// ===============================
// EDITAR AFILIADO — MODAL
// ===============================

async function editarAfiliado(id) {

    let afiliado;

    try {

        const todos = await DB.getAfiliados();
        afiliado    = todos.find(a => a.id === id);

    } catch(e) {

        alert("Error al cargar los datos del afiliado.");
        return;

    }

    if (!afiliado) return;

    const contenido = document.getElementById("modalContenido");
    const fondo     = document.getElementById("modalFondo");

    contenido.innerHTML = `

        <h3>Editar afiliado</h3>

        <input id="editarDni"
            value="${afiliado.dni || ""}"
            maxlength="8"
            placeholder="DNI">

        <input id="editarNombre"
            value="${afiliado.nombre || ""}"
            maxlength="20"
            placeholder="Nombre">

        <input id="editarApellido"
            value="${afiliado.apellido || ""}"
            maxlength="20"
            placeholder="Apellido">

        <input id="editarCelular"
            value="${afiliado.celular || ""}"
            maxlength="10"
            placeholder="Celular">

        <input id="editarCorreo"
            value="${afiliado.correo || ""}"
            maxlength="40"
            placeholder="Correo">

        <select id="editarEstado">
            <option value="Activo"    ${afiliado.estado === "Activo"    ? "selected" : ""}>Activo</option>
            <option value="Adherente" ${afiliado.estado === "Adherente" ? "selected" : ""}>Adherente</option>
        </select>

        <div id="msgEditar"
            style="font-size:12px;color:#c00;min-height:16px;margin-top:4px;">
        </div>

        <button id="btnGuardarEdicion">Guardar cambios</button>

    `;

    fondo.classList.add("activo");

    aplicarValidaciones(
        ["editarDni", "editarCelular"],
        ["editarNombre", "editarApellido"]
    );

    document.getElementById("btnGuardarEdicion")
        .addEventListener("click", () => guardarEdicion(id, afiliado));

}

// ===============================
// GUARDAR EDICIÓN
// ===============================

async function guardarEdicion(id, original) {

    const dni      = document.getElementById("editarDni").value.trim();
    const nombre   = document.getElementById("editarNombre").value.trim();
    const apellido = document.getElementById("editarApellido").value.trim();
    const celular  = document.getElementById("editarCelular").value.trim();
    const correo   = document.getElementById("editarCorreo").value.trim();
    const estado   = document.getElementById("editarEstado").value;
    const msg      = document.getElementById("msgEditar");

    if (!dni || !nombre || !apellido) {
        msg.textContent = "DNI, nombre y apellido son obligatorios";
        return;
    }

    msg.textContent = "Guardando...";

    try {

        const cambios = { dni, nombre, apellido, celular, correo, estado };

        await DB.updateAfiliado(id, cambios);

        await DB.addHistorial(
            "EDICION",
            { ...original, ...cambios },
            "Modificación de afiliado"
        );

        await DB.addLog({
            accion  : "AFILIADOS",
            detalle : `Edición: ${nombre} ${apellido} | DNI: ${dni}`
        });

        cerrarModal();
        await cargarAfiliados();

    } catch(e) {

        console.error("Error editando afiliado:", e);
        msg.textContent = "Error al guardar. Intentá de nuevo.";

    }

}

// ===============================
// ELIMINAR AFILIADO — MODAL
// ===============================

function eliminarAfiliado(id, nombreCompleto) {

    const fondo     = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `

        <h3>Eliminar afiliado</h3>

        <p><b>${nombreCompleto}</b></p>

        <p>Ingresá el motivo de la baja (5 a 40 caracteres)</p>

        <input id="motivoEliminar"
            maxlength="40"
            placeholder="Motivo de baja"
            autocomplete="off">

        <div id="msgEliminar"
            style="font-size:12px;color:#c00;min-height:16px;margin-top:4px;">
        </div>

        <button id="btnConfirmarEliminar"
            style="background:#c00;color:white;">
            Confirmar eliminación
        </button>

    `;

    fondo.classList.add("activo");

    document.getElementById("btnConfirmarEliminar")
        .addEventListener("click", () => confirmarEliminar(id));

}

// ===============================
// CONFIRMAR ELIMINACIÓN
// ===============================

async function confirmarEliminar(id) {

    const motivo = document.getElementById("motivoEliminar").value.trim();
    const msg    = document.getElementById("msgEliminar");

    if (motivo.length < 5 || motivo.length > 40) {
        msg.textContent = "El motivo debe tener entre 5 y 40 caracteres";
        return;
    }

    msg.textContent = "Eliminando...";

    try {

        // Guardar datos antes de borrar para el historial
        const todos    = await DB.getAfiliados();
        const afiliado = todos.find(a => a.id === id);

        if (!afiliado) {
            msg.textContent = "Afiliado no encontrado.";
            return;
        }

        await DB.deleteAfiliado(id);

        await DB.addHistorial(
            "BAJA",
            afiliado,
            motivo
        );

        await DB.addLog({
            accion  : "AFILIADOS",
            detalle : `Baja: ${afiliado.nombre} ${afiliado.apellido} | DNI: ${afiliado.dni} | Motivo: ${motivo}`
        });

        cerrarModal();
        await cargarAfiliados();

    } catch(e) {

        console.error("Error eliminando afiliado:", e);
        msg.textContent = "Error al eliminar. Intentá de nuevo.";

    }

}

// ===============================
// IMPRIMIR CARNET
// ===============================

async function imprimirAfiliado(id) {

    try {

        const todos    = await DB.getAfiliados();
        const afiliado = todos.find(a => a.id === id);

        if (!afiliado) {
            alert("No se encontró el afiliado.");
            return;
        }

        if (typeof generarPDF === "function") {
            generarPDF(afiliado);
        }

    } catch(e) {

        console.error("Error imprimiendo afiliado:", e);
        alert("Error al generar el carnet.");

    }

}

// ===============================
// HOOK: se llama desde inicio.js
// cuando se abre la sección
// ===============================

// La sección "afiliados" carga sus datos
// cuando el usuario navega a ella.
// Se conecta en index.html vía data-seccion.
document.addEventListener("seccionAbierta", async (e) => {
    if (e.detail === "afiliados") {
        await cargarAfiliados();
    }
});

// Exponer globalmente lo que el HTML
// necesita llamar desde onclick
window.editarAfiliado   = editarAfiliado;
window.eliminarAfiliado = eliminarAfiliado;
window.imprimirAfiliado = imprimirAfiliado;
window.cargarAfiliados  = cargarAfiliados;
