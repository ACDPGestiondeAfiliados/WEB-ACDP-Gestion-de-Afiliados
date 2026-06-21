// ===============================
// CONFIGURACION ACDP
// MONTO + LOG INTERNO
// SIN CONSOLA
// ===============================


document.addEventListener("DOMContentLoaded",()=>{

    iniciarConfiguracion();

    cargarConfiguracion();

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
// CARGAR CONFIG
// ===============================

function cargarConfiguracion(){


    const input =
    document.getElementById("montoConfiguracion");


    if(!input) return;



    if(!window.BD_configuracion){


        window.BD_configuracion={
            monto:0
        };


    }



    input.value =
    BD_configuracion.monto ?? 0;


}




// ===============================
// GUARDAR MONTO
// ===============================

function guardarMonto(){


    const input =
    document.getElementById("montoConfiguracion");


    if(!input) return;



    const valor =
    Number(input.value.trim());



    if(isNaN(valor) || valor < 0){

        alert("Monto inválido");

        return;

    }




    BD_configuracion.monto =
    valor;



    // GUARDA TODA LA BD
    guardarBD();




    registrarLog({

        accion:"CONFIGURACION",

        detalle:
        "Monto actualizado a $" + valor

    });




    input.value =
    BD_configuracion.monto;


}





// ===============================
// LOG INTERNO
// ===============================

function registrarLog(data){


    if(!Array.isArray(window.BD_logsSistema)){

        window.BD_logsSistema=[];

    }




    const fecha =
    new Date();



    window.BD_logsSistema.push({

        fecha:
        fecha.toLocaleDateString(),

        hora:
        fecha.toLocaleTimeString(),

        usuario:
        window.usuarioActivo || "Sistema",

        rol:
        window.usuarioActivo==="Admin"
        ? "ADMIN"
        : "USER",

        accion:
        data.accion || "",


        detalle:
        data.detalle || ""

    });



    // persiste BD completa
    guardarBD();


}




// ===============================
// RESET SEMANAL LOGS
// ===============================

function iniciarResetSemanal(){


    setInterval(()=>{


        const ahora=new Date();



        if(

            ahora.getDay()===0 &&

            ahora.getHours()===0 &&

            ahora.getMinutes()===0

        ){

            resetLogs();

        }


    },60000);


}




// ===============================
// LIMPIAR LOGS
// ===============================

function resetLogs(){


    if(Array.isArray(BD_logsSistema)){


        BD_logsSistema.length=0;


    }



    guardarBD();



    registrarLog({

        accion:"SISTEMA",

        detalle:
        "Reset semanal ejecutado"

    });


}
