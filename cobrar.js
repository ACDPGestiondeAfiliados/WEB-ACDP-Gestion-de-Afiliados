// ===============================
// MÓDULO COBRAR ACDP (FIRESTORE)
// ===============================

const COL_AFILIADOS = "afiliados";
const COL_COBROS = "cobros";
const CONFIG_ID = "global";

let cacheAfiliados = [];
let cacheCobros = [];

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarCobrar();
});

// ===============================
// INICIALIZAR
// ===============================

async function iniciarCobrar() {
    await cargarDatos();
    cargarTablaCobrar();

    const filtro = document.getElementById("filtroCobrar");

    if (filtro) {
        filtro.addEventListener("input", () => {
            buscarParaCobrar(filtro.value);
        });
    }
}

// ===============================
// CARGAR DATOS FIRESTORE
// ===============================

async function cargarDatos() {

    try {

        const afSnap = await getDocs(collection(window.db, COL_AFILIADOS));
        const coSnap = await getDocs(collection(window.db, COL_COBROS));

        cacheAfiliados = [];
        cacheCobros = [];

        afSnap.forEach(d => cacheAfiliados.push(d.data()));
        coSnap.forEach(d => cacheCobros.push(d.data()));

    } catch (e) {
        console.error("Error cargando datos:", e);
    }
}

// ===============================
// TABLA
// ===============================

function cargarTablaCobrar() {
    mostrarCobros(cacheAfiliados);
}

function buscarParaCobrar(valor) {

    valor = valor.trim().toLowerCase();

    if (!valor) {
        mostrarCobros(cacheAfiliados);
        return;
    }

    const filtrados = cacheAfiliados.filter(a =>
        (a.dni || "").includes(valor) ||
        (a.nombre || "").toLowerCase().includes(valor) ||
        (a.apellido || "").toLowerCase().includes(valor)
    );

    mostrarCobros(filtrados);
}

// ===============================
// MOSTRAR TABLA
// ===============================

function mostrarCobros(lista) {

    const cuerpo = document
        .getElementById("tablaCobrar")
        .querySelector("tbody");

    cuerpo.innerHTML = "";

    lista.forEach(a => {

        let boton = `
        <button onclick="cobrarAfiliado('${a.dni}')">
        Cobrar
        </button>`;

        if (a.estado === "Eliminado") {
            boton = `
            <button disabled>
            Bloqueado
            </button>`;
        }

        cuerpo.innerHTML += `
        <tr>
            <td>${a.numero || ""}</td>
            <td>${a.dni || ""}</td>
            <td>${a.nombre || ""}</td>
            <td>${a.apellido || ""}</td>
            <td>${a.estado || "Activo"}</td>
            <td>${boton}</td>
        </tr>`;
    });
}

// ===============================
// COBRAR
// ===============================

function cobrarAfiliado(dni) {

    const afiliado = cacheAfiliados.find(a => a.dni === dni);

    if (!afiliado) return;

    if (afiliado.estado === "Eliminado") {
        alert("Este afiliado fue eliminado.");
        return;
    }

    crearModalCobro(afiliado);
}

// ===============================
// MESES PAGADOS
// ===============================

function obtenerMesesPagadosActivos(dni) {

    let meses = [];
    const anioActual = new Date().getFullYear();

    cacheCobros.forEach(c => {

        if (
            c.dni === dni &&
            c.estado !== "Anulado" &&
            Array.isArray(c.meses)
        ) {

            const anioCobro = c.anio || anioActual;

            if (anioCobro !== anioActual) return;

            c.meses.forEach(m => {
                const clave = m + "-" + anioCobro;

                if (!meses.includes(clave)) {
                    meses.push(clave);
                }
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
    const pagados = obtenerMesesPagadosActivos(afiliado.dni);

    let html = "";

    meses.forEach(m => {

        const clave = m + "-" + anioActual;
        const existe = pagados.includes(clave);

        html += `
        <label>
            <input type="checkbox" class="checkMes" value="${m}" ${existe ? "checked disabled" : ""}>
            ${m}
        </label><br>`;
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

        <button onclick="confirmarCobro('${afiliado.dni}')">Aceptar</button>
        <button onclick="cerrarModalCobro()">Cancelar</button>
    </div>`;

    document.body.appendChild(div);
}

// ===============================
// CERRAR
// ===============================

function cerrarModalCobro() {
    const m = document.getElementById("modalCobro");
    if (m) m.remove();
}

// ===============================
// CONFIRMAR COBRO (FIRESTORE)
// ===============================

async function confirmarCobro(dni) {

    const afiliado = cacheAfiliados.find(a => a.dni === dni);
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

    try {

        // 1. cargar monto config
        const confRef = doc(window.db, "configuracion", CONFIG_ID);
        const confSnap = await getDoc(confRef);

        const monto = confSnap.exists() ? confSnap.data().monto || 0 : 0;
        const total = monto * nuevos.length;

        const fecha = new Date();
        const anioActual = fecha.getFullYear();

        const cobroNuevo = {
            usuario: window.usuarioActivo || "Sistema",
            afiliado: afiliado.nombre + " " + afiliado.apellido,
            dni: afiliado.dni,
            numero: afiliado.numero,
            fecha: fecha.toLocaleDateString(),
            hora: fecha.toLocaleTimeString(),
            anio: anioActual,
            accion: "Cobro",
            meses: nuevos,
            total: total,
            detalle: "Meses: " + nuevos.join(", ") + " | Total: $" + total
        };

        // 2. guardar cobro
        await addDoc(collection(window.db, COL_COBROS), cobroNuevo);

        // 3. actualizar cache local meses pagados (opcional UI)
        if (!afiliado.mesesPagados) afiliado.mesesPagados = [];

        nuevos.forEach(m => {
            const clave = m + "-" + anioActual;
            if (!afiliado.mesesPagados.includes(clave)) {
                afiliado.mesesPagados.push(clave);
            }
        });

        cerrarModalCobro();

        await cargarDatos();
        cargarTablaCobrar();

        if (typeof registrarHistorial === "function") {
            registrarHistorial("Cobro", afiliado, cobroNuevo.detalle);
        }

        alert("Cobro registrado correctamente");

        generarComprobanteCobro(afiliado, nuevos, total);

    } catch (e) {
        console.error("Error en cobro:", e);
    }
}

// ===============================
// TICKET (igual)
// ===============================

function generarComprobanteCobro(afiliado, meses, total) {

    const ventana = window.open("", "_blank", "width=400,height=600");
    if (!ventana) return;

    ventana.document.write(`
    <html>
    <body style="font-family:Arial;text-align:center">

    <h2>ACDP - Comprobante</h2>

    <p>${afiliado.nombre} ${afiliado.apellido}</p>
    <p>DNI: ${afiliado.dni}</p>

    <p>Meses:<br>${meses.join("<br>")}</p>

    <h3>Total: $${total}</h3>

    <p>Muchas gracias!</p>

    <script>window.print();</script>

    </body>
    </html>
    `);

    ventana.document.close();
}
