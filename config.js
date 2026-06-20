// ===============================
// CONFIGURACIÓN DEL SISTEMA ACDP
// Control de monto de cuota (MEMORIA GLOBAL)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarConfiguracion();
    cargarConfiguracion();

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
// CARGAR CONFIG EN INPUT
// ===============================
function cargarConfiguracion() {

    const input = document.getElementById("montoConfiguracion");

    if (!input) return;

    input.value = BD_configuracion.monto ?? 0;

}

// ===============================
// GUARDAR MONTO EN MEMORIA GLOBAL
// ===============================
function guardarMonto() {

    const input = document.getElementById("montoConfiguracion");

    if (!input) return;

    const valor = Number(input.value);

    if (isNaN(valor) || valor < 0) {
        escribirConsola("Monto inválido.");
        return;
    }

    BD_configuracion.monto = valor;

    escribirConsola(
        "Monto actualizado: $" + valor.toFixed(2)
    );

    // refrescar UI si está abierta
    cargarConfiguracion();

}
