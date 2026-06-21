// ===============================
// HISTORIAL ACDP (FIRESTORE)
// ===============================

const COL_HISTORIAL = "historial";
const COL_AFILIADOS = "afiliados";
const COL_COBROS = "cobros";

let fechaActual = new Date();
let historialVista = [];

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarHistorial();
});

// ===============================
// UTIL
// ===============================

function normalizarTexto(valor) {

    if (valor === null || valor === undefined) return "";

    if (typeof valor === "object") {
        return valor.usuario || valor.nombre || valor.afiliado || "Desconocido";
    }

    return String(valor);
}

// ===============================
// INIT
// ===============================

function iniciarHistorial() {
    cargarHistorial();
    eventosHistorial();
}

// ===============================
// EVENTOS
// ===============================

function eventosHistorial() {

    const filtro = document.getElementById("filtroHistorial");
    const anterior = document.getElementById("historialAnterior");
    const siguiente = document.getElementById("historialSiguiente");
    const selector = document.getElementById("fechaHistorial");

    if (filtro) {
        filtro.addEventListener("input", () => filtrarHistorial(filtro.value));
    }

    if (anterior) anterior.addEventListener("click", () => cambiarFecha(-1));
    if (siguiente) siguiente.addEventListener("click", () => cambiarFecha(1));

    if (selector) {

        selector.addEventListener("change", () => {
            if (!selector.value) return;

            const partes = selector.value.split("-");
            fechaActual = new Date(partes[0], partes[1] - 1, partes[2]);

            cargarHistorialFecha();
            actualizarFecha();
        });

        selector.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const partes = selector.value.split("-");
                fechaActual = new Date(partes[0], partes[1] - 1, partes[2]);

                cargarHistorialFecha();
                actualizarFecha();
            }
        });
    }
}

// ===============================
// CARGA FIRESTORE
// ===============================

async function cargarHistorial() {
    await cargarHistorialFecha();
}

// ===============================
// POR FECHA
// ===============================

async function cargarHistorialFecha() {

    try {

        const snap = await getDocs(collection(window.db, COL_HISTORIAL));

        const fechaBuscada = fechaActual.toLocaleDateString();

        historialVista = [];

        snap.forEach(d => {

            const h = d.data();

            if (!h.fecha) return;

            if (h.fecha === fechaBuscada) {
                historialVista.push(h);
            }
        });

        historialVista.reverse();
        mostrarHistorial();

    } catch (e) {
        console.error("Error historial:", e);
    }
}

// ===============================
// FILTRO
// ===============================

async function filtrarHistorial(valor) {

    valor = valor.trim().toLowerCase();

    if (!valor) {
        cargarHistorialFecha();
        return;
    }

    try {

        const snap = await getDocs(collection(window.db, COL_HISTORIAL));

        historialVista = [];

        snap.forEach(d => {

            const h = d.data();

            if (
                (h.dni || "").includes(valor) ||
                (h.numero || "").includes(valor)
            ) {
                historialVista.push(h);
            }
        });

        historialVista.reverse();
        mostrarHistorial();

    } catch (e) {
        console.error("Error filtro historial:", e);
    }
}

// ===============================
// TABLA
// ===============================

function mostrarHistorial() {

    const cuerpo = document
        .getElementById("tablaHistorial")
        .querySelector("tbody");

    cuerpo.innerHTML = "";

    let montoTotal = 0;

    if (historialVista.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="8">SIN REGISTRO</td></tr>`;
    }

    historialVista.forEach(h => {

        if (h.estado !== "Anulado") {
            montoTotal += obtenerMonto(h.detalle);
        }

        const clase = h.estado === "Anulado" ? "historialAnulado" : "";

        cuerpo.innerHTML += `
        <tr class="${clase}">
            <td>${normalizarTexto(h.usuario)}</td>
            <td>${normalizarTexto(h.afiliado)}</td>
            <td>${h.dni || ""}</td>
            <td>${h.numero || ""}</td>
            <td>${h.fecha || ""}</td>
            <td>${h.hora || ""}</td>

            <td>
                ${h.accion === "Cobro" && h.estado !== "Anulado" ? `
                <img src="print.png" class="iconoHistorial" onclick="imprimirRegistro('${h.dni}','${h.fecha}','${h.hora}')">
                <img src="delete.png" class="iconoHistorial" onclick="solicitarAnulacion('${h.dni}','${h.fecha}','${h.hora}')">
                ` : ""}
            </td>

            <td>${h.detalle || ""}</td>
        </tr>`;
    });

    document.getElementById("montoHistorial").textContent =
        "$" + montoTotal.toFixed(2);

    actualizarFecha();
}

// ===============================
// FECHA
// ===============================

function cambiarFecha(valor) {
    fechaActual.setDate(fechaActual.getDate() + valor);
    actualizarFecha();
    cargarHistorialFecha();
}

function actualizarFecha() {

    const fecha = document.getElementById("fechaHistorial");

    if (fecha) {
        const y = fechaActual.getFullYear();
        const m = String(fechaActual.getMonth() + 1).padStart(2, "0");
        const d = String(fechaActual.getDate()).padStart(2, "0");

        if (fecha.tagName === "INPUT") {
            fecha.value = `${y}-${m}-${d}`;
        } else {
            fecha.textContent = fechaActual.toLocaleDateString();
        }
    }

    const siguiente = document.getElementById("historialSiguiente");

    if (siguiente) {
        const hoy = new Date();
        siguiente.disabled = fechaActual.toDateString() === hoy.toDateString();
    }
}

// ===============================
// MONTO
// ===============================

function obtenerMonto(texto) {
    if (!texto) return 0;
    return Number(texto.replace(/\D/g, "")) || 0;
}

// ===============================
// REGISTRAR (FIRESTORE REAL)
// ===============================

async function registrarHistorial(accion, afiliado, detalle) {

    try {

        const ahora = new Date();

        const usuarioReal =
            window.usuarioActivo || "Administrador";

        const registro = {
            usuario: usuarioReal,
            afiliado: afiliado?.nombre + " " + afiliado?.apellido || "",
            dni: afiliado?.dni || "",
            numero: afiliado?.numero || "",
            fecha: ahora.toLocaleDateString(),
            hora: ahora.toLocaleTimeString(),
            accion,
            detalle: detalle || "",
            anio: ahora.getFullYear(),
            estado: "Activo"
        };

        await addDoc(collection(window.db, COL_HISTORIAL), registro);

    } catch (e) {
        console.error("Error historial:", e);
    }
}

// ===============================
// ANULAR
// ===============================

async function anularRegistro(dni, fecha, hora) {

    try {

        const snap = await getDocs(collection(window.db, COL_HISTORIAL));

        let docId = null;
        let registro = null;

        snap.forEach(d => {
            const h = d.data();

            if (h.dni === dni && h.fecha === fecha && h.hora === hora) {
                docId = d.id;
                registro = h;
            }
        });

        if (!registro || !docId) return;

        if (registro.estado === "Anulado") return;

        const anioActual = new Date().getFullYear();

        if (registro.anio && registro.anio < anioActual) {
            alert("No se pueden anular registros de años anteriores.");
            return;
        }

        await updateDoc(doc(window.db, COL_HISTORIAL, docId), {
            estado: "Anulado",
            detalle: registro.detalle + " | ANULADO"
        });

        // revertir cobro si existe
        const cobrosSnap = await getDocs(collection(window.db, COL_COBROS));

        cobrosSnap.forEach(async d => {
            const c = d.data();
            if (c.dni === dni && c.fecha === fecha && c.hora === hora) {
                await updateDoc(doc(window.db, COL_COBROS, d.id), {
                    estado: "Anulado"
                });
            }
        });

        alert("Registro anulado correctamente");

        cargarHistorialFecha();

    } catch (e) {
        console.error("Error anulación:", e);
    }
}

// ===============================
// ANULACIÓN UI
// ===============================

function solicitarAnulacion(dni, fecha, hora) {

    if (typeof pedirPinAdmin === "function") {

        pedirPinAdmin(() => {
            anularRegistro(dni, fecha, hora);
        });

    } else {
        alert("No se pudo abrir acceso admin");
    }
}

// ===============================
// IMPRIMIR
// ===============================

function imprimirRegistro(dni, fecha, hora) {

    const registro = historialVista.find(h =>
        h.dni === dni &&
        h.fecha === fecha &&
        h.hora === hora
    );

    if (!registro) return;

    if (typeof generarComprobanteCobro === "function") {

        const afiliado = {
            nombre: registro.afiliado.split(" ")[0],
            apellido: registro.afiliado.split(" ")[1] || "",
            dni: registro.dni
        };

        generarComprobanteCobro(
            afiliado,
            registro.meses || [],
            registro.total || 0
        );
    }
}
