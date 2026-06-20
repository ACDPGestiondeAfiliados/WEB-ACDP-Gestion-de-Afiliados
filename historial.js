// ===============================
// HISTORIAL ACDP
// Registro de pagos y consultas
// ===============================

let fechaActual=new Date();
let historialVista=[];

document.addEventListener("DOMContentLoaded",()=>{

    iniciarHistorial();

});

// ===============================
// UTIL: normalizar texto (FIX [object Object])
// ===============================
function normalizarTexto(valor){

    if(valor===null || valor===undefined){
        return "";
    }

    if(typeof valor==="object"){
        return valor.usuario || valor.nombre || valor.afiliado || "Desconocido";
    }

    return String(valor);
}

// ===============================
// Inicialización del módulo
// ===============================
function iniciarHistorial(){

    cargarHistorial();
    eventosHistorial();

}

// ===============================
// Eventos del historial
// ===============================
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


// ===============================
// Carga registros
// ===============================
function cargarHistorial(){

    historialVista=[...BD_historial].reverse();
    mostrarHistorial();

}


// ===============================
// Filtra registros
// ===============================
function filtrarHistorial(valor){

    valor=valor.trim();

    if(!valor){

        historialVista=[...BD_historial].reverse();

    }else{

        historialVista=
        BD_historial.filter(h=>

            h.dni===valor ||
            h.numero===valor

        ).reverse();

    }

    mostrarHistorial();

}


// ===============================
// Render tabla
// ===============================
function mostrarHistorial(){

    const cuerpo=document
    .getElementById("tablaHistorial")
    .querySelector("tbody");


    cuerpo.innerHTML="";


    let montoTotal=0;


    if(historialVista.length===0){

        cuerpo.innerHTML=`

        <tr>

            <td colspan="8">
            SIN REGISTRO
            </td>

        </tr>

        `;

    }


    historialVista.forEach(h=>{


        montoTotal+=obtenerMonto(h.detalle);


        cuerpo.innerHTML+=`

        <tr>

            <td>${normalizarTexto(h.usuario)}</td>

            <td>${normalizarTexto(h.afiliado)}</td>

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


// ===============================
// Cambia fecha visible
// ===============================
function cambiarFecha(valor){


    const hoy=new Date();


    if(valor===1){

        if(
            fechaActual.toDateString() === hoy.toDateString()
        ){

            const siguiente=
            document.getElementById("historialSiguiente");

            if(siguiente){

                siguiente.disabled=true;

            }

            return;

        }

    }


    fechaActual.setDate(
        fechaActual.getDate()+valor
    );


    actualizarFecha();


    const registrosDia =
    BD_historial.filter(h=>{


        const fechaRegistro=
        new Date(h.fecha);


        return fechaRegistro.toLocaleDateString()
        === fechaActual.toLocaleDateString();


    });


    historialVista=
    registrosDia.reverse();


    mostrarHistorial();


    const siguiente=
    document.getElementById("historialSiguiente");


    if(siguiente){

        siguiente.disabled =
        fechaActual.toDateString() === hoy.toDateString();

    }


}


// ===============================
// Actualiza texto fecha
// ===============================
function actualizarFecha(){

    const fecha=document.getElementById("fechaHistorial");


    if(fecha){

        fecha.textContent=
        fechaActual.toLocaleDateString();

    }


    const siguiente=
    document.getElementById("historialSiguiente");


    if(siguiente){

        const hoy=new Date();

        siguiente.disabled =
        fechaActual.toDateString() === hoy.toDateString();

    }

}


// ===============================
// Obtiene monto desde texto
// ===============================
function obtenerMonto(texto){

    if(!texto) return 0;


    const numero=
    texto.replace(/\D/g,"");


    return Number(numero)||0;

}


// ===============================
// ACTUALIZAR BD - SE REGISTRA ACCION NUEVA
// ===============================
function registrarHistorial(accion, afiliado, detalle){

    if(!Array.isArray(BD_historial)) return;


    const ahora=new Date();


    const usuarioReal =
        (typeof window.usuarioActivo !== "undefined" && window.usuarioActivo && window.usuarioActivo !== "Admin")
        ? window.usuarioActivo
        : (typeof usuarioActivo !== "undefined" && usuarioActivo)
            ? usuarioActivo
            : "Sistema";


    BD_historial.push({

        usuario: usuarioReal,

        afiliado: afiliado?.nombre+" "+afiliado?.apellido || "",

        dni: afiliado?.dni || "",

        numero: afiliado?.numero || "",

        fecha: ahora.toLocaleDateString(),

        hora: ahora.toLocaleTimeString(),

        accion: accion,

        detalle: detalle || ""

    });


    guardarBD();


}


// ===============================
// Acción imprimir
// ===============================
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
