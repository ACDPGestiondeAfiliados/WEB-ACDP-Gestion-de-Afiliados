// ===============================
// COBRAR.JS — ACDP
// Gestión de cuotas y pagos
// Versión Firebase Modular v9+
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarCobrar();
});

// ===============================
// INICIALIZACIÓN
// ===============================

function iniciarCobrar() {

    const filtro = document.getElementById("filtroCobrar");

    if (filtro) {
        filtro.addEventListener("input", () => {
            buscarParaCobrar(filtro.value);
        });
    }

}

// ===============================
// CARGAR TABLA PRINCIPAL
// ===============================

async function cargarTablaCobrar() {

    mostrarCargandoCobrar();

    try {

        const afiliados = await DB.getAfiliados();
        mostrarCobros(afiliados);

    } catch(e) {

        console.error("Error cargando tabla cobrar:", e);
        mostrarErrorCobrar("Error al cargar los afiliados.");

    }

}

// ===============================
// BUSCAR AFILIADO EN TABLA
// ===============================

async function buscarParaCobrar(valor) {

    valor = valor.trim();

    if (!valor) {
        await cargarTablaCobrar();
        return;
    }

    mostrarCargandoCobrar();

    try {

        const resultados = await DB.buscarAfiliado(valor);
        mostrarCobros(resultados);

    } catch(e) {

        console.error("Error buscando para cobrar:", e);

    }

}

// ===============================
// RENDER TABLA
// ===============================

function mostrarCobros(lista) {

    const tbody = document
        .getElementById("tablaCobrar")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (lista.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:20px;color:#888;">
                    Sin resultados
                </td>
            </tr>`;

        return;

    }

    lista.forEach(a => {

        const eliminado = a.estado === "Eliminado";

        const boton = eliminado
            ? `<button disabled
                style="opacity:0.5;cursor:not-allowed;">
                Bloqueado
               </button>`
            : `<button onclick="cobrarAfiliado('${a.id}')">
                Cobrar
               </button>`;

        tbody.innerHTML += `
            <tr>
                <td>${a.numero   || ""}</td>
                <td>${a.dni      || ""}</td>
                <td>${a.nombre   || ""}</td>
                <td>${a.apellido || ""}</td>
                <td>${a.estado   || "Activo"}</td>
                <td>${boton}</td>
            </tr>`;

    });

}

// ===============================
// HELPERS VISUALES
// ===============================

function mostrarCargandoCobrar() {

    const tbody = document
        .getElementById("tablaCobrar")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6"
                style="text-align:center;padding:20px;color:#888;">
                Cargando...
            </td>
        </tr>`;

}

function mostrarErrorCobrar(mensaje) {

    const tbody = document
        .getElementById("tablaCobrar")
        ?.querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6"
                style="text-align:center;padding:20px;color:#c00;">
                ${mensaje}
            </td>
        </tr>`;

}

// ===============================
// ABRIR MODAL DE COBRO
// ===============================

async function cobrarAfiliado(id) {

    let afiliado;

    try {

        const todos = await DB.getAfiliados();
        afiliado    = todos.find(a => a.id === id);

    } catch(e) {

        alert("Error al cargar el afiliado.");
        return;

    }

    if (!afiliado) return;

    if (afiliado.estado === "Eliminado") {
        alert("Este afiliado fue dado de baja y no puede recibir cobros.");
        return;
    }

    await crearModalCobro(afiliado);

}

// ===============================
// MODAL DE COBRO
// ===============================

async function crearModalCobro(afiliado) {

    // Remover modal previo si existe
    document.getElementById("modalCobro")?.remove();

    const meses = [
        "Enero","Febrero","Marzo","Abril",
        "Mayo","Junio","Julio","Agosto",
        "Septiembre","Octubre","Noviembre","Diciembre"
    ];

    const anioActual = new Date().getFullYear();

    // Obtener meses ya pagados desde Firestore
    let pagados = [];

    try {
        pagados = await DB.getMesesPagadosActivos(afiliado.dni);
    } catch(e) {
        console.error("Error obteniendo meses pagados:", e);
    }

    // Construir checkboxes
    let htmlMeses = "";

    meses.forEach(m => {

        const clave  = m + "-" + anioActual;
        const pagado = pagados.includes(clave);

        htmlMeses += `
            <label style="display:block;margin:6px 0;">
                <input
                    type="checkbox"
                    class="checkMes"
                    value="${m}"
                    ${pagado ? "checked disabled" : ""}
                >
                ${m}
                ${pagado
                    ? `<span style="color:#2a7a2a;font-size:11px;margin-left:4px;">
                        ✓ pagado
                       </span>`
                    : ""}
            </label>`;

    });

    const div       = document.createElement("div");
    div.id          = "modalCobro";
    div.className   = "modal-fondo activo";

    div.innerHTML = `
        <div class="modal">

            <button
                onclick="cerrarModalCobro()"
                style="position:absolute;right:10px;top:10px;
                       background:#c00;color:white;border:0;
                       border-radius:50%;width:28px;height:28px;
                       cursor:pointer;font-weight:bold;">
                X
            </button>

            <h3>Registrar cobro</h3>

            <p>
                <b>${afiliado.nombre} ${afiliado.apellido}</b><br>
                <span style="font-size:13px;color:#666;">
                    N° ${afiliado.numero} · DNI ${afiliado.dni}
                </span>
            </p>

            <div style="max-height:320px;overflow-y:auto;
                        border:1px solid #ddd;border-radius:8px;
                        padding:12px;margin:12px 0;">
                ${htmlMeses}
            </div>

            <div id="resumenCobro"
                style="text-align:center;font-size:15px;
                       font-weight:bold;margin:10px 0;
                       color:#A602AB;">
            </div>

            <div id="msgCobro"
                style="font-size:12px;color:#c00;
                       min-height:16px;text-align:center;">
            </div>

            <div style="display:flex;gap:10px;margin-top:10px;">

                <button
                    onclick="confirmarCobro('${afiliado.id}')"
                    style="flex:1;background:#A602AB;
                           color:white;border:none;
                           border-radius:8px;padding:12px;
                           font-weight:bold;cursor:pointer;">
                    Confirmar cobro
                </button>

                <button
                    onclick="cerrarModalCobro()"
                    style="flex:1;background:#eee;
                           border:none;border-radius:8px;
                           padding:12px;cursor:pointer;">
                    Cancelar
                </button>

            </div>

        </div>`;

    document.body.appendChild(div);

    // Actualizar resumen al marcar/desmarcar
    actualizarResumenCobro();

    div.querySelectorAll(".checkMes:not(:disabled)")
        .forEach(cb => {
            cb.addEventListener("change", actualizarResumenCobro);
        });

}

// ===============================
// RESUMEN DINÁMICO EN EL MODAL
// ===============================

async function actualizarResumenCobro() {

    const checks  = document.querySelectorAll(".checkMes:not(:disabled)");
    const resumen = document.getElementById("resumenCobro");

    if (!resumen) return;

    let seleccionados = 0;

    checks.forEach(c => {
        if (c.checked) seleccionados++;
    });

    let monto = 0;

    try {
        const config = await DB.getConfiguracion();
        monto        = config.monto || 0;
    } catch(e) {
        monto = 0;
    }

    const total = monto * seleccionados;

    resumen.textContent = seleccionados > 0
        ? `${seleccionados} mes${seleccionados > 1 ? "es" : ""} · Total: $${total.toLocaleString("es-AR")}`
        : "Seleccioná al menos un mes";

}

// ===============================
// CERRAR MODAL DE COBRO
// ===============================

function cerrarModalCobro() {
    document.getElementById("modalCobro")?.remove();
}

// ===============================
// CONFIRMAR Y REGISTRAR COBRO
// ===============================

async function confirmarCobro(id) {

    const msg = document.getElementById("msgCobro");

    // Meses nuevos seleccionados (no disabled)
    const checks  = document.querySelectorAll(".checkMes");
    const nuevos  = [];

    checks.forEach(c => {
        if (c.checked && !c.disabled) nuevos.push(c.value);
    });

    if (nuevos.length === 0) {
        msg.textContent = "Seleccioná al menos un mes.";
        return;
    }

    msg.textContent = "Registrando...";

    try {

        // Obtener afiliado actualizado
        const todos    = await DB.getAfiliados();
        const afiliado = todos.find(a => a.id === id);

        if (!afiliado) {
            msg.textContent = "Afiliado no encontrado.";
            return;
        }

        // Obtener monto de configuración
        const config = await DB.getConfiguracion();
        const monto  = config.monto || 0;
        const total  = monto * nuevos.length;

        const fecha      = new Date();
        const anioActual = fecha.getFullYear();

        const cobroNuevo = {
            usuario  : window.usuarioActivo || "Sistema",
            afiliado : afiliado.nombre + " " + afiliado.apellido,
            dni      : afiliado.dni,
            numero   : afiliado.numero,
            fecha    : fecha.toLocaleDateString(),
            hora     : fecha.toLocaleTimeString(),
            anio     : anioActual,
            accion   : "Cobro",
            detalle  : "Meses: " + nuevos.join(", ") + " | Total: $" + total,
            meses    : nuevos,
            total,
            estado   : "Activo"
        };

        // Guardar cobro en Firestore
        await DB.addCobro(cobroNuevo);

        // Registrar en historial
        await DB.addHistorial(
            "Cobro",
            afiliado,
            "Meses: " + nuevos.join(", ") + " | Total: $" + total
        );

        // Log del sistema
        await DB.addLog({
            accion  : "COBRO",
            detalle : `Cobro: ${afiliado.nombre} ${afiliado.apellido} | DNI: ${afiliado.dni} | Meses: ${nuevos.join(", ")} | $${total}`
        });

        cerrarModalCobro();

        // Generar comprobante imprimible
        if (typeof generarComprobanteCobro === "function") {
            generarComprobanteCobro(afiliado, nuevos, total);
        }

    } catch(e) {

        console.error("Error registrando cobro:", e);
        if (msg) msg.textContent = "Error al registrar. Intentá de nuevo.";

    }

}

// ===============================
// HOOK: carga al abrir sección
// ===============================

document.addEventListener("seccionAbierta", async (e) => {
    if (e.detail === "cobrar") {
        await cargarTablaCobrar();
    }
});

// Exponer globalmente
window.cobrarAfiliado    = cobrarAfiliado;
window.confirmarCobro    = confirmarCobro;
window.cerrarModalCobro  = cerrarModalCobro;
window.cargarTablaCobrar = cargarTablaCobrar;
