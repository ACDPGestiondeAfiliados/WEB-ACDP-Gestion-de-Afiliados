// ===============================
// CONFIGURACIÓN ACDP (LIMPIO)
// SOLO MONTO + FIRESTORE
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarConfiguracion();
    cargarConfiguracion();

});


// ===============================
// INICIAR
// ===============================
function iniciarConfiguracion() {

    const boton = document.getElementById("guardarConfiguracion");
    if (!boton) return;

    boton.addEventListener("click", guardarMonto);

}


// ===============================
// CARGAR CONFIG DESDE BD
// ===============================
function cargarConfiguracion() {

    const input = document.getElementById("montoConfiguracion");
    if (!input) return;

    if (!window.BD_configuracion) {
        window.BD_configuracion = { monto: 0 };
    }

    input.value = Number(window.BD_configuracion.monto || 0);

}


// ===============================
// GUARDAR MONTO (FIRESTORE)
// ===============================
function guardarMonto() {

    const input = document.getElementById("montoConfiguracion");
    if (!input) return;

    const valor = Number((input.value || "").trim());

    if (isNaN(valor) || valor < 0) return;

    window.BD_configuracion = window.BD_configuracion || {};
    window.BD_configuracion.monto = valor;

    console.log("💾 MONTO ACTUALIZADO:", valor);

    if (typeof guardarBD === "function") {
        guardarBD(); // 🔥 aquí debe subir a Firestore
    }

}
