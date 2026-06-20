// ===============================
// CONFIGURACIÓN DEL SISTEMA ACDP
// Control de monto de cuota y consola
// ===============================

document.addEventListener("DOMContentLoaded",()=>{

    cargarConfiguracion();

    iniciarConfiguracion();

});


// Inicializa eventos de configuración

function iniciarConfiguracion(){

    const boton=document.getElementById("guardarConfiguracion");

    if(!boton) return;


    boton.addEventListener("click",()=>{

        guardarMonto();

    });

}



// Carga el monto actual guardado

function cargarConfiguracion(){

    const input=document.getElementById("montoConfiguracion");

    if(!input) return;


    const config=obtenerConfiguracion();

    input.value=config.monto || 0;

}



// Guarda nuevo monto de cuota

function guardarMonto(){

    const input=document.getElementById("montoConfiguracion");

    const valor=Number(input.value);


    if(valor<0){

        escribirConsola("Monto inválido.");

        return;

    }


    actualizarConfiguracion({

        monto:valor

    });


    escribirConsola(
        "Monto actualizado: $" + valor.toFixed(2)
    );

}



// Escribe mensajes del sistema

function escribirConsola(texto){

    const consola=document.getElementById("consolaSistema");

    if(!consola) return;


    const fecha=new Date()
    .toLocaleString();


    consola.innerHTML +=
    `[${fecha}] ${texto}<br>`;

}
