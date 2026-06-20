// ===============================
// ACDP LOG BRIDGE (AUTO-CAPTURA)
// Convierte todo el sistema viejo a logs nuevos
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarBridgeLogs();

});


function iniciarBridgeLogs(){

    interceptarEscribirConsola();
    interceptarHistorial();
    interceptarGuardarBD();

}


// ===============================
// CAPTURA escribirConsola()
// ===============================
function interceptarEscribirConsola(){

    if(typeof window.escribirConsolaOriginal !== "undefined") return;

    window.escribirConsolaOriginal = window.escribirConsola;

    window.escribirConsola = function(msg){

        if(window.escribirConsolaOriginal){
            window.escribirConsolaOriginal(msg);
        }

        registrarLog({
            accion: "SISTEMA",
            detalle: String(msg)
        });

    };

}


// ===============================
// CAPTURA registrarHistorial()
// ===============================
function interceptarHistorial(){

    if(typeof window.registrarHistorialOriginal !== "undefined") return;

    window.registrarHistorialOriginal = window.registrarHistorial;

    window.registrarHistorial = function(accion, afiliado, detalle){

        if(window.registrarHistorialOriginal){
            window.registrarHistorialOriginal(accion, afiliado, detalle);
        }

        registrarLog({
            accion: accion || "HISTORIAL",
            detalle: detalle || "",
        });

    };

}


// ===============================
// CAPTURA guardarBD()
// ===============================
function interceptarGuardarBD(){

    if(typeof window.guardarBDOriginal !== "undefined") return;

    window.guardarBDOriginal = window.guardarBD;

    window.guardarBD = function(){

        if(window.guardarBDOriginal){
            window.guardarBDOriginal();
        }

        registrarLog({
            accion: "SISTEMA",
            detalle: "Persistencia de base de datos"
        });

    };

}
