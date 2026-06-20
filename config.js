// ===============================
// CONFIGURACIÓN DEL SISTEMA ACDP
// LOG + MONTO + RESET SEMANAL + CONSOLA
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarConfiguracion();
    cargarConfiguracion();
    iniciarResetSemanal();

    iniciarConsolaLogs(); // NUEVO

});


// ===============================
// INICIALIZAR CONFIG
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

    renderConsolaLogs(">todo"); // refresca consola

}


// ===============================
// LOG GLOBAL
// ===============================
function registrarLog({accion, detalle}){

    if (!Array.isArray(BD_logsSistema)) {
        BD_logsSistema = [];
    }

    const ahora = new Date();

    BD_logsSistema.push({
        fecha: ahora.toLocaleDateString(),
        hora: ahora.toLocaleTimeString(),
        usuario: window.usuarioActivo || "Sistema",
        rol: window.usuarioActivo === "Admin" ? "ADMIN" : "USER",
        accion,
        detalle
    });

    guardarBD();

}


// =====================================================
// CONSOLA LOG SYSTEM
// =====================================================

// ===============================
// INICIAR CONSOLA
// ===============================
function iniciarConsolaLogs(){

    const input = document.getElementById("inputLogs");

    const consola = document.getElementById("consolaSistema");

    if(!input || !consola) return;

    // render inicial
    renderConsolaLogs(">todo");


    input.addEventListener("keydown", (e)=>{

        if(e.key === "Enter"){

            const comando = input.value;

            renderConsolaLogs(comando);

        }

    });

}


// ===============================
// MOTOR DE FILTROS
// ===============================
function procesarFiltroLogs(comando){

    if(!Array.isArray(BD_logsSistema)) return [];

    comando = (comando || ">todo").toLowerCase().trim();

    const logs = [...BD_logsSistema];


    if(comando === ">todo") return logs;


    if(comando.startsWith(">filtrarusuario")){
        const user = comando.replace(">filtrarusuario","").trim();
        return logs.filter(l =>
            (l.usuario || "").toLowerCase() === user
        );
    }


    if(comando.startsWith(">buscardni")){
        const dni = comando.replace(">buscardni","").trim();
        return logs.filter(l =>
            (l.detalle || "").includes(dni)
        );
    }


    if(comando.startsWith(">buscarfecha")){
        const fecha = comando.replace(">buscarfecha","").trim();
        return logs.filter(l =>
            (l.fecha || "").includes(fecha)
        );
    }


    if(comando.startsWith(">buscaraccion")){
        const acc = comando.replace(">buscaraccion","").trim();
        return logs.filter(l =>
            (l.accion || "").toLowerCase().includes(acc)
        );
    }


    return logs;
}


// ===============================
// RENDER CONSOLA
// ===============================
function renderConsolaLogs(comando){

    const consola = document.getElementById("consolaSistema");

    const input = document.getElementById("inputLogs");

    if(!consola) return;

    const logs = procesarFiltroLogs(comando);

    let html = "";

    logs.forEach(l => {

        html += `
${l.fecha} ${l.hora} | ${l.usuario} (${l.rol}) | ${l.accion} → ${l.detalle}<br>
        `;
    });

    consola.innerHTML = html || "Sin registros";

    if(input){
        input.value = "";
    }

}


// ===============================
// RESET SEMANAL
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
// RESET LOGS
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

    renderConsolaLogs(">todo");

}
