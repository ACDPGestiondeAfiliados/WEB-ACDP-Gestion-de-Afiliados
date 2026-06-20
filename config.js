// ===============================
// CONFIGURACIÓN DEL SISTEMA ACDP
// LOG + MONTO + RESET SEMANAL
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarConfiguracion();
    cargarConfiguracion();
    iniciarResetSemanal();

});


// ===============================
// INICIALIZAR EVENTOS
// ===============================
function iniciarConfiguracion() {

    const boton = document.getElementById("guardarConfiguracion");

    if (!boton) return;

    boton.addEventListener("click", guardarMonto);

}


// ===============================
// CARGAR CONFIG
// ===============================
function cargarConfiguracion() {

    const input = document.getElementById("montoConfiguracion");

    if (!input) return;

    if (typeof BD_configuracion === "undefined" || !BD_configuracion) {
        BD_configuracion = { monto: 0 };
    }

    input.value = BD_configuracion.monto ?? 0;

}


// ===============================
// GUARDAR MONTO
// ===============================
function guardarMonto() {

    const input = document.getElementById("montoConfiguracion");

    if (!input) return;

    const valor = Number(input.value.trim());

    if (isNaN(valor) || valor < 0) {
        escribirConsola("Monto inválido.");
        return;
    }

    if (typeof BD_configuracion === "undefined" || !BD_configuracion) {
        BD_configuracion = { monto: 0 };
    }

    BD_configuracion.monto = valor;

    guardarBD();

    registrarLog({
        accion: "CONFIGURACION",
        detalle: `Monto actualizado a $${valor}`
    });

    escribirConsola("Monto actualizado: $" + valor.toFixed(2));

    cargarConfiguracion();

}


// ===============================
// LOG GLOBAL (USO EN TODO EL SISTEMA)
// ===============================
function registrarLog({accion, detalle}){

    if (typeof BD_logsSistema === "undefined") {
        BD_logsSistema = [];
    }

    const ahora = new Date();

    const log = {
        fecha: ahora.toLocaleDateString(),
        hora: ahora.toLocaleTimeString(),
        usuario: window.usuarioActivo || "Sistema",
        rol: window.usuarioActivo === "Admin" ? "ADMIN" : "USER",
        accion,
        detalle
    };

    BD_logsSistema.push(log);

    guardarBD();

}


// ===============================
// RESET SEMANAL (DOMINGO)
// ===============================
function iniciarResetSemanal() {

    setInterval(() => {

        const ahora = new Date();

        const esDomingo = ahora.getDay() === 0;

        const esMedianoche =
            ahora.getHours() === 0 &&
            ahora.getMinutes() === 0;

        if (!esDomingo || !esMedianoche) return;

        resetLogs();

    }, 60000);

}


// ===============================
// BORRAR LOG SEMANAL
// ===============================
function resetLogs() {

    if (Array.isArray(BD_logsSistema)) {
        BD_logsSistema.length = 0;
    }

    guardarBD();

    registrarLog({
        accion: "SISTEMA",
        detalle: "Reset semanal de logs ejecutado"
    });

    escribirConsola("Reset semanal de logs ejecutado");

}
