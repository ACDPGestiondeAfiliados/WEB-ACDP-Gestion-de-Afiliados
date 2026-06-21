// ===============================
// GESTIÓN DE AFILIADOS ACDP (FIRESTORE)
// ===============================

let paginaActual = 1;
const cantidadPagina = 10;
let listaAfiliados = [];

const COL = "afiliados";

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarAfiliados();
});

function iniciarAfiliados() {
    cargarAfiliados();
    eventosAfiliados();
}

// ===============================
// FIRESTORE HELPERS
// ===============================

function colRef() {
    return window.db.collection ? window.db.collection(COL) : null;
}

// compat modular SDK (v9+)
function getCol() {
    return window.db;
}

// ===============================
// CARGAR
// ===============================

async function cargarAfiliados() {
    try {
        const snapshot = await getDocs(collection(window.db, COL));

        listaAfiliados = [];

        snapshot.forEach(doc => {
            listaAfiliados.push(doc.data());
        });

        listaAfiliados.reverse();
        mostrarTabla();

    } catch (e) {
        console.error("Error cargando afiliados:", e);
    }
}

// ===============================
// EVENTOS
// ===============================

function eventosAfiliados() {

    const filtro = document.getElementById("filtroAfiliados");
    const nuevo = document.getElementById("btnNuevoAfiliado");
    const anterior = document.getElementById("afiliadosAnterior");
    const siguiente = document.getElementById("afiliadosSiguiente");

    if (filtro) {
        filtro.addEventListener("input", () => filtrarAfiliados(filtro.value));
    }

    if (nuevo) nuevo.addEventListener("click", abrirNuevoAfiliado);

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
// FILTRO (LOCAL CACHE)
// ===============================

function filtrarAfiliados(valor) {
    valor = valor.trim().toLowerCase();

    if (!valor) {
        cargarAfiliados();
        return;
    }

    listaAfiliados = listaAfiliados.filter(a =>
        (a.dni || "").includes(valor) ||
        (a.nombre || "").toLowerCase().includes(valor) ||
        (a.apellido || "").toLowerCase().includes(valor)
    );

    paginaActual = 1;
    mostrarTabla();
}

// ===============================
// TABLA
// ===============================

function mostrarTabla() {

    const tabla = document
        .getElementById("tablaAfiliados")
        .querySelector("tbody");

    tabla.innerHTML = "";

    const inicio = (paginaActual - 1) * cantidadPagina;

    listaAfiliados
        .slice(inicio, inicio + cantidadPagina)
        .forEach(a => {

            tabla.innerHTML += `
            <tr>
                <td>${a.numero || ""}</td>
                <td>${a.dni || ""}</td>
                <td>${a.nombre || ""}</td>
                <td>${a.apellido || ""}</td>
                <td>${a.celular || ""}</td>
                <td>${a.correo || ""}</td>
                <td>${a.estado || "Activo"}</td>
                <td>${a.fecha || ""}</td>

                <td>
                    <img src="edit.png" class="iconoHistorial" onclick="editarAfiliado('${a.dni}')">
                    <img src="delete.png" class="iconoHistorial" onclick="eliminarAfiliado('${a.dni}')">
                    <img src="print.png" class="iconoHistorial" onclick="imprimirAfiliado('${a.dni}')">
                </td>
            </tr>`;
        });

    document.getElementById("paginaAfiliados").textContent = paginaActual;
}

// ===============================
// NUEVO
// ===============================

function abrirNuevoAfiliado() {

    document.getElementById("modalContenido").innerHTML = `
    <h3>Nuevo afiliado</h3>

    <input id="nuevoDni" placeholder="DNI" maxlength="8" inputmode="numeric">
    <input id="nuevoNombre" placeholder="Nombre" maxlength="20">
    <input id="nuevoApellido" placeholder="Apellido" maxlength="20">
    <input id="nuevoCelular" placeholder="Celular" maxlength="10" inputmode="numeric">
    <input id="nuevoCorreo" placeholder="Correo" maxlength="30">

    <select id="nuevoEstado">
        <option value="Activo">Activo</option>
        <option value="Adherente">Adherente</option>
    </select>

    <button onclick="guardarNuevoAfiliado()">Guardar</button>
    `;

    document.getElementById("modalFondo").classList.add("activo");

    aplicarValidaciones(
        ["nuevoDni", "nuevoCelular"],
        ["nuevoNombre", "nuevoApellido"]
    );
}

// ===============================
// GUARDAR (FIRESTORE)
// ===============================

async function guardarNuevoAfiliado() {

    const dni = nuevoDni.value;

    const ultimo = listaAfiliados.reduce(
        (m, a) => Math.max(m, Number(a.numero) || 0),
        0
    );

    const numero = String(ultimo + 1).padStart(8, "0");

    const nuevo = {
        dni,
        numero,
        nombre: nuevoNombre.value,
        apellido: nuevoApellido.value,
        celular: nuevoCelular.value,
        correo: nuevoCorreo.value,
        estado: nuevoEstado.value,
        fecha: new Date().toLocaleDateString()
    };

    try {
        await setDoc(doc(window.db, COL, dni), nuevo);

        cerrarModal();
        await cargarAfiliados();

        if (typeof registrarHistorial === "function") {
            registrarHistorial("ALTA", nuevo, "Alta de afiliado");
        }

    } catch (e) {
        console.error("Error guardando:", e);
    }
}

// ===============================
// EDITAR
// ===============================

function editarAfiliado(dni) {

    const a = listaAfiliados.find(x => x.dni === dni);
    if (!a) return;

    document.getElementById("modalContenido").innerHTML = `
    <h3>Editar afiliado</h3>

    <input id="editarDni" value="${a.dni}" maxlength="8">
    <input id="editarNombre" value="${a.nombre}">
    <input id="editarApellido" value="${a.apellido}">
    <input id="editarCelular" value="${a.celular || ""}">
    <input id="editarCorreo" value="${a.correo || ""}">

    <select id="editarEstado">
        <option value="Activo">Activo</option>
        <option value="Adherente">Adherente</option>
    </select>

    <button onclick="guardarEdicion('${dni}')">Guardar cambios</button>
    `;

    editarEstado.value = a.estado || "Activo";

    document.getElementById("modalFondo").classList.add("activo");
}

// ===============================
// GUARDAR EDICIÓN (FIRESTORE)
// ===============================

async function guardarEdicion(dni) {

    const ref = doc(window.db, COL, dni);

    const actualizado = {
        dni: editarDni.value,
        nombre: editarNombre.value,
        apellido: editarApellido.value,
        celular: editarCelular.value,
        correo: editarCorreo.value,
        estado: editarEstado.value
    };

    try {
        await updateDoc(ref, actualizado);

        cerrarModal();
        await cargarAfiliados();

        if (typeof registrarHistorial === "function") {
            registrarHistorial("EDICION", actualizado, "Modificación de afiliado");
        }

    } catch (e) {
        console.error("Error editando:", e);
    }
}

// ===============================
// ELIMINAR
// ===============================

function eliminarAfiliado(dni) {

    const a = listaAfiliados.find(x => x.dni === dni);
    if (!a) return;

    document.getElementById("modalContenido").innerHTML = `
    <h3>Eliminar afiliado</h3>

    <input id="motivoEliminar" maxlength="40">
    <div id="msgEliminar" style="color:red;font-size:12px;"></div>

    <button id="btnConfirmarEliminar">Confirmar</button>
    `;

    document.getElementById("modalFondo").classList.add("activo");

    document.getElementById("btnConfirmarEliminar").onclick = async () => {

        const motivo = motivoEliminar.value.trim();

        if (motivo.length < 5) {
            msgEliminar.textContent = "Motivo inválido";
            return;
        }

        try {
            await deleteDoc(doc(window.db, COL, dni));

            cerrarModal();
            await cargarAfiliados();

            if (typeof registrarHistorial === "function") {
                registrarHistorial("BAJA", a, motivo);
            }

        } catch (e) {
            console.error("Error eliminando:", e);
        }
    };
}

// ===============================
// IMPRIMIR (SIN CAMBIOS)
// ===============================

function imprimirAfiliado(dni) {

    const afiliado = listaAfiliados.find(a => a.dni === dni);
    if (!afiliado) return;

    generarPDF(afiliado);
}

// ===============================
// MODAL
// ===============================

function cerrarModal() {
    document.getElementById("modalFondo").classList.remove("activo");
}
