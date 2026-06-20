// ===============================
// PUENTE GLOBAL DE LOGS (CRÍTICO)
// ===============================

(function () {

    if (!Array.isArray(window.BD_logsSistema)) {
        window.BD_logsSistema = [];
    }

    // intercepta historial SI existe
    const originalHistorial = window.registrarHistorial;

    window.registrarHistorial = function (accion, afiliado, detalle) {

        if (typeof originalHistorial === "function") {
            originalHistorial(accion, afiliado, detalle);
        }

        if (typeof window.registrarLog === "function") {
            window.registrarLog({
                accion,
                detalle: detalle + " | HISTORIAL"
            });
        }

    };

})();

// ===============================
// CONFIGURACIÓN DEL SISTEMA ACDP
// LOG + MONTO + RESET SEMANAL + CONSOLA
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    window.BD_logsSistema = window.BD_logsSistema || [];

    iniciarConfiguracion();
    cargarConfiguracion();
    iniciarResetSemanal();

    // 🔥 ACTIVAR CONSOLA + INTERCEPTOR GLOBAL
    setTimeout(() => {

        iniciarConsolaLogs();
        activarInterceptoresGlobales();

    }, 300);

});


// ===============================
// CONFIG
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

    if (!window.BD_configuracion) {
        window.BD_configuracion = { monto: 0 };
    }

    input.value = window.BD_configuracion.monto ?? 0;

}


// ===============================
// GUARDAR MONTO (FIX ESTABLE)
// ===============================
function guardarMonto() {

    const input = document.getElementById("montoConfiguracion");

    if (!input) return;

    const valor = Number(input.value.trim());

    if (isNaN(valor) || valor < 0) {
        escribirConsola("Monto inválido.");
        return;
    }

    // asegurar config
    if (!window.BD_configuracion) {
        window.BD_configuracion = { monto: 0 };
    }

    window.BD_configuracion.monto = valor;

    guardarBD();

    // 1) LOG UNIFICADO (NO DEPENDE DE NADA MÁS)
    if (typeof registrarLog === "function") {
        registrarLog({
            accion: "CONFIGURACION",
            detalle: `Monto actualizado a $${valor}`
        });
    }

    // 2) FALLBACK DIRECTO (si registrarLog falla)
    if (typeof window.BD_logsSistema !== "undefined") {
        window.BD_logsSistema.push({
            fecha: new Date().toLocaleDateString(),
            hora: new Date().toLocaleTimeString(),
            usuario: window.usuarioActivo || "Sistema",
            rol: window.usuarioActivo === "Admin" ? "ADMIN" : "USER",
            accion: "CONFIGURACION",
            detalle: `Monto actualizado a $${valor}`
        });
    }

    // feedback UI
    escribirConsola("Monto actualizado: $" + valor.toFixed(2));

    // refrescar consola si existe
    if (typeof renderConsolaLogs === "function") {
        renderConsolaLogs(">todo");
    }

    // recargar input
    input.value = window.BD_configuracion.monto;

}

// ===============================
// LOG GLOBAL BASE
// ===============================
function registrarLog({ accion, detalle }) {

    if (!Array.isArray(window.BD_logsSistema)) {
        window.BD_logsSistema = [];
    }

    const ahora = new Date();

    window.BD_logsSistema.push({
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
// CONSOLA SYSTEM
// =====================================================


// ===============================
// INICIALIZAR CONSOLA
// ===============================
function iniciarConsolaLogs() {

    const input = document.getElementById("inputLogs");
    const consola = document.getElementById("consolaSistema");

    if (!input || !consola) return;

    renderConsolaLogs(">todo");

    input.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            const comando = (input.value || "").trim();

            if (!comando) return;

            renderConsolaLogs(comando);

            input.value = "";

        }

    });

}


// ===============================
// FILTROS
// ===============================
function procesarFiltroLogs(comando) {

    if (!Array.isArray(window.BD_logsSistema)) return [];

    comando = (comando || ">todo").toLowerCase().trim();

    const logs = [...window.BD_logsSistema];

    if (comando === ">todo") return logs;


    if (comando.startsWith(">filtrarusuario")) {
        const user = comando.replace(">filtrarusuario", "").trim();
        return logs.filter(l =>
            (l.usuario || "").toLowerCase() === user
        );
    }


    if (comando.startsWith(">buscardni")) {
        const dni = comando.replace(">buscardni", "").trim();
        return logs.filter(l =>
            (l.detalle || "").includes(dni)
        );
    }


    if (comando.startsWith(">buscarfecha")) {
        const fecha = comando.replace(">buscarfecha", "").trim();
        return logs.filter(l =>
            (l.fecha || "").includes(fecha)
        );
    }


    if (comando.startsWith(">buscaraccion")) {
        const acc = comando.replace(">buscaraccion", "").trim();
        return logs.filter(l =>
            (l.accion || "").toLowerCase().includes(acc)
        );
    }

    return logs;
}


// ===============================
// RENDER CONSOLA (ROBUSTA + COLORES)
// ===============================
function renderConsolaLogs(comando) {

    const consola = document.getElementById("consolaSistema");

    if (!consola) return;

    const logs = procesarFiltroLogs(comando);

    let html = "";

    logs.forEach(l => {

        let color = "#00ff66";

        const accion = (l.accion || "").toUpperCase();

        if (accion.includes("CONFIGURACION")) color = "#00b7ff";
        else if (accion.includes("USUARIO")) color = "#ffd000";
        else if (accion.includes("COBRO")) color = "#00ff66";
        else if (accion.includes("ELIMINACION")) color = "#ff3b3b";
        else if (accion.includes("SISTEMA")) color = "#b36bff";
        else if (accion.includes("AFILIADOS")) color = "#00ffd5";
        else if (accion.includes("HISTORIAL")) color = "#ffb347";


        let detalle = (l.detalle || "").toString();

        // 🔥 resaltar DNI / números largos
        detalle = detalle.replace(
            /(\d{6,12})/g,
            `<b style="color:#ffffff">$1</b>`
        );


        html += `
<div style="color:${color}; margin-bottom:2px; font-family:monospace;">
${l.fecha || ""} ${l.hora || ""} |
${l.usuario || ""} (${l.rol || ""}) |
${l.accion || ""} →
${detalle}
</div>
        `;
    });

    consola.innerHTML = html || "<span style='color:#999'>Sin registros</span>";
    consola.scrollTop = consola.scrollHeight;

}


// ===============================
// RESET SEMANAL (DOMINGO 00:00)
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

    if (Array.isArray(window.BD_logsSistema)) {
        window.BD_logsSistema.length = 0;
    }

    guardarBD();

    registrarLog({
        accion: "SISTEMA",
        detalle: "Reset semanal de logs ejecutado"
    });

    escribirConsola("Reset semanal de logs ejecutado");

    renderConsolaLogs(">todo");

}


// =====================================================
// 🔥 INTERCEPTORES GLOBALES (CLAVE DEL SISTEMA)
// =====================================================
function activarInterceptoresGlobales() {

    // ===============================
    // AFILIADOS
    // ===============================
    if (Array.isArray(window.BD_afiliados)) {

        const original = window.BD_afiliados.push;

        window.BD_afiliados.push = function (...args) {

            const result = original.apply(this, args);

            registrarLog({
                accion: "AFILIADOS",
                detalle: "Nuevo registro: " + JSON.stringify(args[0])
            });

            return result;
        };
    }

    // ===============================
    // USUARIOS
    // ===============================
    if (Array.isArray(window.BD_usuarios)) {

        const original = window.BD_usuarios.push;

        window.BD_usuarios.push = function (...args) {

            const result = original.apply(this, args);

            registrarLog({
                accion: "USUARIO",
                detalle: "Usuario creado: " + (args[0]?.usuario || "")
            });

            return result;
        };
    }

    // ===============================
    // COBROS
    // ===============================
    if (Array.isArray(window.BD_cobros)) {

        const original = window.BD_cobros.push;

        window.BD_cobros.push = function (...args) {

            const result = original.apply(this, args);

            registrarLog({
                accion: "COBRO",
                detalle: "Nuevo cobro registrado"
            });

            return result;
        };
    }

    // ===============================
    // HISTORIAL
    // ===============================
    if (Array.isArray(window.BD_historial)) {

        const original = window.BD_historial.push;

        window.BD_historial.push = function (...args) {

            const result = original.apply(this, args);

            registrarLog({
                accion: "HISTORIAL",
                detalle: args[0]?.detalle || "Movimiento en historial"
            });

            return result;
        };
    }
}
