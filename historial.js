// ===============================
// HISTORIAL.JS — ACDP
// Registro de pagos y acciones
// Versión Firebase Modular v9+
// ===============================

let fechaActual   = new Date();
let historialVista = [];

document.addEventListener("DOMContentLoaded", () => {
    iniciarHistorial();
});

// ===============================
// INICIALIZACIÓN
// ===============================

function iniciarHistorial() {
    eventosHistorial();
    actualizarFecha();
}

// ===============================
// EVENTOS
// ===============================

function eventosHistorial() {

    const filtro    = document.getElementById("filtroHistorial");
    const anterior  = document.getElementById("historialAnterior");
    const siguiente = document.getElementById("historialSiguiente");
    const selector  = document.getElementById("fechaHistorial");
    const btnImpr   = document.getElementById("btnImprimirHistorial");

    if (filtro) {
        filtro.addEventListener("input", () => {
            filtrarHistorial(filtro.value);
        });
    }

    if (anterior) {
        anterior.addEventListener("click", () => {
            cambiarFecha(-1);
        });
    }

    if (siguiente) {
        siguiente.addEventListener("click", () => {
            cambiarFecha(1);
        });
    }

    if (selector) {
        selector.addEventListener("change", () => {
            if (!selector.value) return;
            const partes  = selector.value.split("-");
            fechaActual   = new Date(partes[0], partes[1] - 1, partes[2]);
            actualizarFecha();
            cargarHistorialFecha();
        });

        selector.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                const partes  = selector.value.split("-");
                fechaActual   = new Date(partes[0], partes[1] - 1, partes[2]);
                actualizarFecha();
                cargarHistorialFecha();
            }
        });
    }

    if (btnImpr) {
        btnImpr.addEventListener("click", () => {
            if (typeof imprimirHistorial === "function") {
                imprimirHistorial();
            }
        });
    }

}

// ===============================
// CARGAR POR FECHA
// ===============================

async function cargarHistorialFecha() {

    mostrarCargandoHistorial();

    const fechaBuscada = fechaActual.toLocaleDateString();

    try {

        const todos = await DB.getHistorialPorFecha(fechaBuscada);
        historialVista = todos;
        mostrarHistorial();

    } catch(e) {

        console.error("Error cargando historial:", e);
        mostrarErrorHistorial("Error al cargar el historial.");

    }

}

// ===============================
// FILTRAR POR DNI O NÚMERO
// ===============================

async function filtrarHistorial(valor) {

    valor = valor.trim();

    if (!valor) {
        await cargarHistorialFecha();
        return;
    }

    mostrarCargandoHistorial();

    try {

        const resultados = await DB.getHistorialPorDni(valor);
        historialVista   = resultados;
        mostrarHistorial();

    } catch(e) {

        console.error("Error filtrando historial:", e);

    }

}

// ===============================
// RENDER TABLA
// ===============================

function mostrarHistorial() {

    const tbody = document
        .getElementById("tablaHistorial")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    let montoTotal = 0;

    if (historialVista.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;padding:20px;color:#888;">
                    Sin registros para esta fecha
                </td>
            </tr>`;

        actualizarMontoTotal(0);
        return;

    }

    historialVista.forEach(h => {

        if (h.estado !== "Anulado") {
            montoTotal += obtenerMonto(h.detalle);
        }

        const anulado = h.estado === "Anulado";
        const clase   = anulado ? "historialAnulado" : "";

        const acciones = (h.accion === "Cobro" && !anulado)
            ? `
                <img src="print.png"
                    class="iconoHistorial"
                    title="Reimprimir comprobante"
                    onclick="imprimirRegistro('${h.id}')">
                <img src="delete.png"
                    class="iconoHistorial"
                    title="Anular cobro"
                    onclick="solicitarAnulacion('${h.id}')">
              `
            : (anulado
                ? `<span style="font-size:11px;color:#999;">ANULADO</span>`
                : "");

        tbody.innerHTML += `
            <tr class="${clase}">
                <td>${normalizarTexto(h.usuario)}</td>
                <td>${normalizarTexto(h.afiliado)}</td>
                <td>${h.dni    || ""}</td>
                <td>${h.numero || ""}</td>
                <td>${h.fecha  || ""}</td>
                <td>${h.hora   || ""}</td>
                <td>${acciones}</td>
                <td>${h.detalle || ""}</td>
            </tr>`;

    });

    actualizarMontoTotal(montoTotal);
    actualizarFecha();

}

// ===============================
// UTILIDADES
// ===============================

function normalizarTexto(valor) {

    if (valor === null || valor === undefined) return "";

    if (typeof valor === "object") {
        return valor.usuario  ||
               valor.nombre   ||
               valor.afiliado ||
               "Desconocido";
    }

    return String(valor);

}

function obtenerMonto(texto) {

    if (!texto) return 0;

    // Busca el último número en el texto (el total)
    const matches = String(texto).match(/\d+/g);
    if (!matches) return 0;

    return Number(matches[matches.length - 1]) || 0;

}

function actualizarMontoTotal(monto) {

    const elem = document.getElementById("montoHistorial");
    if (elem) {
        elem.textContent = "$" + monto.toLocaleString("es-AR", {
            minimumFractionDigits: 2
        });
    }

}

// ===============================
// HELPERS VISUALES
// ===============================

function mostrarCargandoHistorial() {

    const tbody = document
        .getElementById("tablaHistorial")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="8"
                style="text-align:center;padding:20px;color:#888;">
                Cargando...
            </td>
        </tr>`;

}

function mostrarErrorHistorial(mensaje) {

    const tbody = document
        .getElementById("tablaHistorial")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="8"
                style="text-align:center;padding:20px;color:#c00;">
                ${mensaje}
            </td>
        </tr>`;

}

// ===============================
// CONTROL DE FECHA
// ===============================

function cambiarFecha(valor) {
    fechaActual.setDate(fechaActual.getDate() + valor);
    actualizarFecha();
    cargarHistorialFecha();
}

function actualizarFecha() {

    const selector = document.getElementById("fechaHistorial");

    if (!selector) return;

    const anio = fechaActual.getFullYear();
    const mes  = String(fechaActual.getMonth() + 1).padStart(2, "0");
    const dia  = String(fechaActual.getDate()).padStart(2, "0");

    if (selector.tagName === "INPUT") {
        selector.value = `${anio}-${mes}-${dia}`;
    } else {
        selector.textContent = fechaActual.toLocaleDateString();
    }

    // Deshabilitar botón "siguiente" si ya es hoy
    const btnSig = document.getElementById("historialSiguiente");
    if (btnSig) {
        const hoy = new Date();
        btnSig.disabled =
            fechaActual.toDateString() === hoy.toDateString();
    }

}

// ===============================
// REIMPRIMIR COMPROBANTE
// ===============================

async function imprimirRegistro(id) {

    try {

        const todos     = await DB.getHistorial();
        const registro  = todos.find(h => h.id === id);

        if (!registro) return;

        if (typeof generarComprobanteCobro === "function") {

            const partes   = String(registro.afiliado || "").split(" ");
            const afiliado = {
                nombre   : partes[0] || "",
                apellido : partes.slice(1).join(" ") || "",
                dni      : registro.dni
            };

            const meses = registro.meses || [];
            const total = registro.total || obtenerMonto(registro.detalle);

            generarComprobanteCobro(afiliado, meses, total);

        }

    } catch(e) {

        console.error("Error reimprimiendo registro:", e);
        alert("Error al reimprimir el comprobante.");

    }

}

// ===============================
// SOLICITAR ANULACIÓN
// (pide PIN admin primero)
// ===============================

function solicitarAnulacion(id) {

    if (typeof pedirPinAdmin === "function") {

        pedirPinAdmin(() => {
            abrirModalAnulacion(id);
        });

    } else {

        alert("No se pudo abrir el acceso de administrador.");

    }

}

// ===============================
// MODAL DE ANULACIÓN
// ===============================

async function abrirModalAnulacion(id) {

    let registro;

    try {

        const todos = await DB.getHistorial();
        registro    = todos.find(h => h.id === id);

    } catch(e) {

        alert("Error al cargar el registro.");
        return;

    }

    if (!registro) return;

    // Bloqueo: no anular registros de años anteriores
    const anioActual = new Date().getFullYear();

    if (registro.anio && registro.anio < anioActual) {
        alert("No se pueden anular registros de años anteriores.");
        return;
    }

    if (registro.estado === "Anulado") {
        alert("Este registro ya fue anulado.");
        return;
    }

    const fondo     = document.getElementById("modalFondo");
    const contenido = document.getElementById("modalContenido");

    const meses   = registro.meses?.join(", ") || "";
    const total   = registro.total
        ? "$" + Number(registro.total).toLocaleString("es-AR")
        : "";

    contenido.innerHTML = `

        <h3>Anular cobro</h3>

        <p>
            <b>${normalizarTexto(registro.afiliado)}</b><br>
            <span style="font-size:13px;color:#666;">
                DNI: ${registro.dni || ""}<br>
                Fecha: ${registro.fecha || ""} ${registro.hora || ""}<br>
                Meses: ${meses}<br>
                Total: ${total}
            </span>
        </p>

        <p style="color:#c00;font-size:13px;">
            Esta acción revertirá los meses pagados y no se puede deshacer.
        </p>

        <div id="msgAnulacion"
            style="font-size:12px;color:#c00;min-height:16px;">
        </div>

        <div style="display:flex;gap:10px;margin-top:12px;">

            <button id="btnConfirmarAnulacion"
                style="flex:1;background:#c00;color:white;
                       border:none;border-radius:8px;
                       padding:12px;font-weight:bold;cursor:pointer;">
                Confirmar anulación
            </button>

            <button onclick="cerrarModal()"
                style="flex:1;background:#eee;border:none;
                       border-radius:8px;padding:12px;cursor:pointer;">
                Cancelar
            </button>

        </div>

    `;

    fondo.classList.add("activo");

    document.getElementById("btnConfirmarAnulacion")
        .addEventListener("click", () => confirmarAnulacion(id, registro));

}

// ===============================
// CONFIRMAR ANULACIÓN
// ===============================

async function confirmarAnulacion(id, registro) {

    const msg = document.getElementById("msgAnulacion");
    if (msg) msg.textContent = "Anulando...";

    try {

        // 1. Marcar historial como anulado
        await DB.updateHistorial(id, {
            estado  : "Anulado",
            detalle : (registro.detalle || "") + " | ANULADO"
        });

        // 2. Marcar cobro relacionado como anulado
        //    Buscamos por dni + fecha + hora
        const cobros  = await DB.getCobros();
        const cobro   = cobros.find(c =>
            c.dni   === registro.dni  &&
            c.fecha === registro.fecha &&
            c.hora  === registro.hora
        );

        if (cobro) {
            await DB.updateCobro(cobro.id, { estado: "Anulado" });
        }

        // 3. Log del sistema
        await DB.addLog({
            accion  : "ANULACION",
            detalle : `Anulación cobro: ${normalizarTexto(registro.afiliado)} | DNI: ${registro.dni} | Meses: ${registro.meses?.join(", ") || ""}`
        });

        cerrarModal();

        // Recargar historial
        await cargarHistorialFecha();

        alert("Cobro anulado correctamente.");

    } catch(e) {

        console.error("Error anulando registro:", e);
        if (msg) msg.textContent = "Error al anular. Intentá de nuevo.";

    }

}

// ===============================
// HOOK: carga al abrir sección
// ===============================

document.addEventListener("seccionAbierta", async (e) => {
    if (e.detail === "historial") {
        actualizarFecha();
        await cargarHistorialFecha();
    }
});

// Exponer globalmente
window.imprimirRegistro   = imprimirRegistro;
window.solicitarAnulacion = solicitarAnulacion;
window.cargarHistorialFecha = cargarHistorialFecha;
