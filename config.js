// ===============================
// CONFIGURACION ACDP OFFLINE
// MONTO + LOGS INTERNOS
// SIN CONSOLA
// ===============================


// ===============================
// INICIO
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    cargarConfiguracion();

    iniciarConfiguracion();

    iniciarResetSemanal();

});



// ===============================
// CONFIG
// ===============================

function iniciarConfiguracion(){

    const boton =
    document.getElementById("guardarConfiguracion");


    if(!boton) return;


    boton.addEventListener(
        "click",
        guardarMonto
    );

}



// ===============================
// CARGAR CONFIGURACION
// ===============================

function cargarConfiguracion(){

    const input =
    document.getElementById("montoConfiguracion");


    if(!input) return;



    let datos =
    localStorage.getItem("BD_configuracion");



    if(datos){

        try{

            window.BD_configuracion =
            JSON.parse(datos);

        }catch(e){

            window.BD_configuracion = {
                monto:0
            };

        }


    }else{


        window.BD_configuracion = {
            monto:0
        };


        guardarConfiguracionLocal();

    }



    input.value =
    window.BD_configuracion.monto ?? 0;

}



// ===============================
// GUARDAR CONFIG LOCAL
// ===============================

function guardarConfiguracionLocal(){

    localStorage.setItem(
        "BD_configuracion",
        JSON.stringify(window.BD_configuracion)
    );


}



// ===============================
// GUARDAR MONTO
// ===============================

function guardarMonto(){


    const input =
    document.getElementById("montoConfiguracion");


    if(!input) return;



    const valor =
    Number(
        input.value.trim()
    );



    if(isNaN(valor) || valor < 0){

        alert("Monto inválido");

        return;

    }



    if(!window.BD_configuracion){

        window.BD_configuracion = {
            monto:0
        };

    }



    window.BD_configuracion.monto =
    valor;



    // GUARDA EN LOCALSTORAGE
    guardarConfiguracionLocal();



    // COMPATIBILIDAD CON BD GENERAL
    if(typeof guardarBD === "function"){

        guardarBD();

    }



    registrarLog({

        accion:"CONFIGURACION",

        detalle:
        "Monto actualizado a $" + valor

    });



    input.value = valor;


}



// ===============================
// LOG INTERNO
// ===============================

function registrarLog(datos){


    if(!Array.isArray(window.BD_logsSistema)){

        window.BD_logsSistema = [];

    }



    const ahora =
    new Date();



    window.BD_logsSistema.push({

        fecha:
        ahora.toLocaleDateString(),

        hora:
        ahora.toLocaleTimeString(),

        usuario:
        window.usuarioActivo || "Sistema",

        rol:
        window.usuarioActivo === "Admin"
        ? "ADMIN"
        : "USER",

        accion:
        datos.accion || "",

        detalle:
        datos.detalle || ""

    });



    if(typeof guardarBD === "function"){

        guardarBD();

    }


}



// ===============================
// RESET SEMANAL LOGS
// ===============================

function iniciarResetSemanal(){


    setInterval(()=>{


        const ahora =
        new Date();



        if(

            ahora.getDay() === 0 &&

            ahora.getHours() === 0 &&

            ahora.getMinutes() === 0

        ){

            resetLogs();

        }


    },60000);


}



// ===============================
// LIMPIAR LOGS
// ===============================

function resetLogs(){


    if(Array.isArray(window.BD_logsSistema)){

        window.BD_logsSistema.length = 0;

    }



    if(typeof guardarBD === "function"){

        guardarBD();

    }


    registrarLog({

        accion:"SISTEMA",

        detalle:
        "Reset semanal ejecutado"

    });


}
