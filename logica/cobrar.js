// ===============================
// ACDP - COBRAR CONTROLLER
// Firebase + cuotas + historial log
// ===============================

import {
    db,
    collection,
    getDocs,
    addDoc
} from "../firebase.js";

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarCobrar();
});

// ===============================
// ESTADO LOCAL
// ===============================

let CACHE_AFILIADOS = [];

// ===============================
// INICIO
// ===============================

async function iniciarCobrar() {
    await cargarAfiliados();

    const filtro = document.getElementById("filtroCobrar");

    if (filtro) {
        filtro.addEventListener("input", () => {
            buscarParaCobrar(filtro.value);
        });
    }
}

// ===============================
// FIREBASE - AFILIADOS
// ===============================

async function cargarAfiliados() {
    const snap = await getDocs(collection(db, "afiliados"));

    CACHE_AFILIADOS = [];

    snap.forEach(d => {
        CACHE_AFILIADOS.push({ id: d.id, ...d.data() });
    });

    mostrarCobros(CACHE_AFILIADOS);
}

// ===============================
// BUSCAR
// ===============================

function buscarParaCobrar(valor) {
    valor = valor.trim();

    if (!valor) {
        mostrarCobros(CACHE_AFILIADOS);
        return;
    }

    const lista = CACHE_AFILIADOS.filter(a => {
        return (
            a.dni?.includes(valor) ||
            a.numeroAfiliado?.includes(valor)
        );
    });

    mostrarCobros(lista);
}

// ===============================
// TABLA
// ===============================

function mostrarCobros(lista) {
    const cuerpo = document.querySelector("#tablaCobrar tbody");

    if (!cuerpo) return;

    cuerpo.innerHTML = "";

    lista.forEach(a => {
        const bloqueado = a.estado === "ELIMINADO";

        cuerpo.innerHTML += `
            <tr>
                <td>${a.numeroAfiliado || ""}</td>
                <td>${a.dni || ""}</td>
                <td>${a.nombre || ""}</td>
                <td>${a.apellido || ""}</td>
                <td>${a.estado || "ACTIVO"}</td>
                <td>
                    <button onclick="COBRAR.cobrarAfiliado('${a.id}')"
                        ${bloqueado ? "disabled" : ""}>
                        ${bloqueado ? "BLOQUEADO" : "COBRAR"}
                    </button>
                </td>
            </tr>
        `;
    });
}

// ===============================
// COBRAR AFILIADO
// ===============================

function cobrarAfiliado(id) {
    const afiliado = CACHE_AFILIADOS.find(a => a.id === id);

    if (!afiliado) return;

    if (afiliado.estado === "ELIMINADO") {
        alert("Este afiliado fue eliminado.");
        return;
    }

    crearModalCobro(afiliado);
}

// ===============================
// MESES PAGADOS
// ===============================

function obtenerMesesPagados(dni) {
    let meses = [];

    const anioActual = new Date().getFullYear();

    if (!window.BD_cobros) return meses;

    window.BD_cobros.forEach(c => {
        if (
            c.dni === dni &&
            c.estado !== "ANULADO" &&
            Array.isArray(c.meses)
        ) {
            const anio = c.anio || anioActual;

            if (anio !== anioActual) return;

            c.meses.forEach(m => {
                const clave = m + "-" + anio;
                if (!meses.includes(clave)) meses.push(clave);
            });
        }
    });

    return meses;
}

// ===============================
// MODAL COBRO
// ===============================

function crearModalCobro(afiliado) {
    const anterior = document.getElementById("modalCobro");
    if (anterior) anterior.remove();

    const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    const anioActual = new Date().getFullYear();

    const pagados = obtenerMesesPagados(afiliado.dni);

    let html = "";

    meses.forEach(m => {
        const clave = m + "-" + anioActual;
        const existe = pagados.includes(clave);

        html += `
            <label>
                <input type="checkbox"
                    class="checkMes"
                    value="${m}"
                    ${existe ? "checked disabled" : ""}>
                ${m}
            </label><br>
        `;
    });

    const div = document.createElement("div");

    div.id = "modalCobro";
    div.className = "modal-fondo activo";

    div.innerHTML = `
        <div class="modal">
            <h3>Cobrar afiliado</h3>

            <p>${afiliado.nombre} ${afiliado.apellido}</p>

            ${html}

            <br>

            <button onclick="COBRAR.confirmarCobro('${afiliado.id}')">
                Aceptar
            </button>

            <button onclick="COBRAR.cerrarModal()">
                Cancelar
            </button>
        </div>
    `;

    document.body.appendChild(div);
}

// ===============================
// CERRAR MODAL
// ===============================

function cerrarModal() {
    const m = document.getElementById("modalCobro");
    if (m) m.remove();
}

// ===============================
// CONFIRMAR COBRO
// ===============================

async function confirmarCobro(id) {
    const afiliado = CACHE_AFILIADOS.find(a => a.id === id);

    if (!afiliado) return;

    const checks = document.querySelectorAll(".checkMes");

    let nuevos = [];

    checks.forEach(c => {
        if (c.checked && !c.disabled) {
            nuevos.push(c.value);
        }
    });

    if (nuevos.length === 0) {
        alert("Seleccione al menos un mes.");
        return;
    }

    const monto = window.BD_configuracion?.monto || 0;
    const total = monto * nuevos.length;

    const fecha = new Date();

    const usuario =
        window.ACDP?.usuario ||
        "Sistema";

    const cobro = {
        usuario,
        afiliado: `${afiliado.nombre} ${afiliado.apellido}`,
        dni: afiliado.dni,
        numeroAfiliado: afiliado.numeroAfiliado,
        fecha: fecha.toLocaleDateString(),
        hora: fecha.toLocaleTimeString().slice(0,5),
        accion: "COBRO",
        detalle: `Meses: ${nuevos.join(", ")} | Total: $${total}`,
        meses: nuevos,
        total
    };

    // ===============================
    // FIREBASE - COBROS
    // ===============================

    await addDoc(collection(db, "cobros"), cobro);

    // ===============================
    // HISTORIAL (PREPARADO)
    // ===============================

    if (window.addHistorial) {
        window.addHistorial({
            usuario,
            afiliado: cobro.afiliado,
            dni: afiliado.dni,
            numero: afiliado.numeroAfiliado,
            fecha: cobro.fecha,
            hora: cobro.hora,
            accion: "COBRO",
            detalle: cobro.detalle
        });
    }

    cerrarModal();

    alert("Cobro registrado correctamente");

    generarTicket(afiliado, nuevos, total);
}

// ===============================
// TICKET
// ===============================

function generarTicket(afiliado, meses, total) {
    const win = window.open("", "_blank", "width=400,height=600");

    if (!win) return;

    win.document.write(`
        <html>
        <body style="font-family:Arial;text-align:center">

            <h2>ACDP - COMPROBANTE</h2>

            <p>
                ${afiliado.nombre} ${afiliado.apellido}<br>
                DNI: ${afiliado.dni}
            </p>

            <p>${meses.join("<br>")}</p>

            <h3>Total: $${total}</h3>

            <script>
                window.print();
            </script>

        </body>
        </html>
    `);

    win.document.close();
}

// ===============================
// EXPORT GLOBAL
// ===============================

window.COBRAR = {
    cobrarAfiliado,
    confirmarCobro,
    cerrarModal
};
