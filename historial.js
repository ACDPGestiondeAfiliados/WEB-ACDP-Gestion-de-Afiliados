// ===============================
// HISTORIAL ACDP
// Registro de pagos y consultas
// ===============================


let fechaActual=new Date();
let historialVista=[];


document.addEventListener("DOMContentLoaded",()=>{

    iniciarHistorial();

});


// Inicialización del módulo

function iniciarHistorial(){

    cargarHistorial();

    eventosHistorial();

}



// Eventos del historial

function eventosHistorial(){

    const filtro=document.getElementById("filtroHistorial");
    const anterior=document.getElementById("historialAnterior");
    const siguiente=document.getElementById("historialSiguiente");
    const imprimir=document.getElementById("btnImprimirHistorial");


    if(filtro){

        filtro.addEventListener("input",()=>{

            filtrarHistorial(
                filtro.value
            );

        });

    }


    if(anterior){

        anterior.addEventListener("click",()=>{

            cambiarFecha(-1);

        });

    }


    if(siguiente){

        siguiente.addEventListener("click",()=>{

            cambiarFecha(1);

        });

    }


    if(imprimir){

        imprimir.addEventListener("click",()=>{

            imprimirHistorial();

        });

    }

}



// Carga registros

function cargarHistorial(){

    historialVista=BD.historial;

    mostrarHistorial();

}



// Filtra registros

function filtrarHistorial(valor){

    valor=valor.trim();


    if(!valor){

        historialVista=BD.historial;

    }else{

        historialVista=
        BD.historial.filter(h=>

            h.dni===valor ||
            h.numero===valor

        );

    }


    mostrarHistorial();

}



// Render tabla

function mostrarHistorial(){

    const cuerpo=document
    .getElementById("tablaHistorial")
    .querySelector("tbody");


    cuerpo.innerHTML="";


    let montoTotal=0;


    historialVista.forEach(h=>{


        montoTotal+=obtenerMonto(h.detalle);



        cuerpo.innerHTML+=`

        <tr>

            <td>${h.usuario||""}</td>

            <td>${h.afiliado||""}</td>

            <td>${h.dni||""}</td>

            <td>${h.numero||""}</td>

            <td>${h.fecha||""}</td>

            <td>${h.hora||""}</td>

            <td>${h.accion||""}</td>

            <td>${h.detalle||""}</td>

        </tr>

        `;

    });



    document.getElementById("montoHistorial")
    .textContent=
    "$"+montoTotal.toFixed(2);



    actualizarFecha();

}



// Cambia fecha visible

function cambiarFecha(valor){

    fechaActual.setDate(
        fechaActual.getDate()+valor
    );


    actualizarFecha();

}



// Actualiza texto fecha

function actualizarFecha(){

    const fecha=document.getElementById("fechaHistorial");


    if(fecha){

        fecha.textContent=
        fechaActual.toLocaleDateString();

    }

}



// Obtiene monto desde texto

function obtenerMonto(texto){

    if(!texto) return 0;


    const numero=
    texto.replace(/\D/g,"");


    return Number(numero)||0;

}



// Acción imprimir

function imprimirHistorial(){

    escribirConsola(
        "Solicitud de impresión de historial"
    );


    if(typeof generarPDF==="function"){

        generarPDF(
            historialVista
        );

    }

}
