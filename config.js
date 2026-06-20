// ===============================
// CONFIGURACIÓN DEL SISTEMA ACDP
// Control de monto de cuota + reset diario (MEMORIA GLOBAL)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarConfiguracion();
    cargarConfiguracion();
    iniciarResetDiario();

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

    if (typeof BD_configuracion === "undefined" || !BD_configuracion) {

        window.BD_configuracion = {
            monto: 0
        };

    }

    input.value = BD_configuracion.monto;

}


// ===============================
// GUARDAR MONTO EN MEMORIA GLOBAL
// ===============================
function guardarMonto() {

    const input = document.getElementById("montoConfiguracion");

    if (!input) return;


    const valor = Number(
        input.value.trim()
    );


    if (isNaN(valor) || valor < 0) {

        escribirConsola(
            "Monto inválido."
        );

        return;

    }


    if (typeof BD_configuracion === "undefined" || !BD_configuracion) {

        window.BD_configuracion = {
            monto: 0
        };

    }


    BD_configuracion.monto = valor;


    escribirConsola(
        "Monto actualizado: $" + BD_configuracion.monto.toFixed(2)
    );


    input.value = BD_configuracion.monto;


}


// ===============================
// RESET DIARIO (00:00 ARG)
// ===============================
function iniciarResetDiario() {

    setInterval(() => {

        const ahora = new Date();

        const esMedianoche =
            ahora.getHours() === 0 &&
            ahora.getMinutes() === 0;


        if (!esMedianoche) return;


        resetLogsDiarios();


    },60000);

}


// ===============================
// BORRAR LOG CADA 24HS (00:00)
// ===============================
function resetLogsDiarios(){

    if(typeof BD_logsSistema !== "undefined" && Array.isArray(BD_logsSistema)){

        BD_logsSistema.length = 0;

    }


    escribirConsola(
        "Reset diario ejecutado (00:00)"
    );

}
