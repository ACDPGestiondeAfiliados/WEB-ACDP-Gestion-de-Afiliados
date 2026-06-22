// ===============================
// ACDP - HISTORIAL CONTROLLER
// Firebase + movimientos + registros
// ===============================


import {
    db,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc
} from "../firebase.js";



// ===============================
// ESTADO
// ===============================

let CACHE_HISTORIAL = [];
let historialVista = [];

let fechaActual = new Date();



// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded",()=>{

    iniciarHistorial();

});



// ===============================
// INICIO
// ===============================

async function iniciarHistorial(){

    await cargarHistorial();

    eventosHistorial();

    mostrarHistorial();

}



// ===============================
// EVENTOS
// ===============================

function eventosHistorial(){


const filtro =
document.getElementById("filtroHistorial");


const anterior =
document.getElementById("historialAnterior");


const siguiente =
document.getElementById("historialSiguiente");
const fechaPicker =
document.getElementById("fechaHistorial");


const imprimirBtn =
document.getElementById("imprimirHistorial");


if(filtro){

    filtro.addEventListener("input",()=>{

        filtrarHistorial(
            filtro.value
        );

    });

}



if(anterior){

    anterior.onclick=()=>{

        cambiarFecha(-1);

    };

}



if(siguiente){

    siguiente.onclick=()=>{

        cambiarFecha(1);

    };

}

if(fechaPicker){


fechaPicker.value =
formatearInputFecha(fechaActual);



fechaPicker.onchange=()=>{


const partes =
fechaPicker.value.split("-");


fechaActual =
new Date(
partes[0],
partes[1]-1,
partes[2]
);



cargarHistorialFecha();


};


}



if(imprimirBtn){

imprimirBtn.addEventListener(
"click",
imprimirTablaActual
);

}

}



// ===============================
// FIREBASE CARGAR
// ===============================

async function cargarHistorial(){


CACHE_HISTORIAL=[];


const snap =
await getDocs(
collection(db,"historial")
);



snap.forEach(d=>{


CACHE_HISTORIAL.push({

id:d.id,

...d.data()

});


});


cargarHistorialFecha();


}



// ===============================
// FILTRAR FECHA
// ===============================

function cargarHistorialFecha(){


const fecha =
fechaActual.toLocaleDateString();



historialVista =

CACHE_HISTORIAL.filter(h=>{


return h.fecha===fecha;


})
.reverse();



mostrarHistorial();



}




// ===============================
// BUSCAR
// ===============================

function filtrarHistorial(valor){


valor =
valor.trim();



if(!valor){


cargarHistorialFecha();

return;


}



historialVista =

CACHE_HISTORIAL.filter(h=>{


return (

String(h.dni)
.includes(valor)

||

String(h.numeroAfiliado)
.includes(valor)

);



})
.reverse();



mostrarHistorial();


}




// ===============================
// TABLA
// ===============================

function mostrarHistorial(){


const cuerpo =
document.querySelector(
"#tablaHistorial tbody"
);



if(!cuerpo)return;



cuerpo.innerHTML="";



let total=0;



if(historialVista.length===0){


cuerpo.innerHTML=`

<tr>

<td colspan="8">

SIN REGISTROS

</td>

</tr>

`;

}



historialVista.forEach(h=>{


if(
h.accion==="Cobro" &&
h.estado!=="Anulado"
){

const monto =
h.detalleHistorial?.match(/\$(\d+)/);

if(monto){

total += Number(monto[1]);

}

}



const clase =
h.estado==="Anulado"
?
"historialAnulado"
:
"";




cuerpo.innerHTML+=`

<tr class="${clase}">


<td>

${h.usuario||""}

</td>


<td>

${h.afiliado||""}

</td>


<td>

${h.dni||""}

</td>


<td>

${h.numeroAfiliado||""}

</td>


<td>

${h.fecha||""}

</td>


<td>

${h.hora||""}

</td>


<td>


${
h.accion==="Cobro" &&
h.estado!=="Anulado"

?

`

<img

src="./iconos/print.png"

class="iconoHistorial"

onclick="imprimirHistorial('${h.id}')"

>


<img

src="./iconos/delete.png"

class="iconoHistorial"

onclick="anularHistorial('${h.id}')"

>

`

:
""
}



${h.accion||""}


</td>



<td>

${h.detalleHistorial||h.detalle||""}

</td>


</tr>

`;



});


const monto =
document.getElementById("montoHistorial");


if(monto){

monto.textContent =
"$"+total;

}


}


// ===============================
// CAMBIO FECHA
// ===============================

function cambiarFecha(valor){


fechaActual.setDate(
fechaActual.getDate()+valor
);



const picker =
document.getElementById("fechaHistorial");


if(picker){

picker.value =
formatearInputFecha(fechaActual);

}



cargarHistorialFecha();


}

// ===============================
// REGISTRAR
// ===============================

async function registrar(
accion,
datos={},
detalle=""
){


const ahora =
new Date();



const registro={


usuario:
window.ACDP?.usuario ||
"Sistema",


accion,


afiliado:
datos.afiliado ||
"",


dni:
datos.dni ||
"",


numeroAfiliado:
datos.numeroAfiliado ||
"",


fecha:
ahora.toLocaleDateString(),


hora:
ahora.toLocaleTimeString()
.slice(0,5),


detalleHistorial:
detalle,


meses:
datos.meses ||
[],


total:
datos.total ||
0,


codigoComprobante:
datos.codigoComprobante ||
"",

medioPago:
datos.medioPago ||
"",

anio:
ahora.getFullYear(),


estado:
"Activo"


};



await addDoc(

collection(db,"historial"),

registro

);



CACHE_HISTORIAL.push(registro);



cargarHistorialFecha();


}



// ===============================
// ANULAR
// ===============================

async function anular(id){

const registro =
CACHE_HISTORIAL.find(h=>h.id===id);

if(!registro) return;

if(!confirm("¿Anular pago?")) return;

await updateDoc(
doc(db,"historial",id),
{
    estado:"Anulado",
    detalleHistorial:
        registro.detalleHistorial + " | ANULADO"
}
);

registro.estado="Anulado";


// revertir cobros si era Cobro
if(registro.accion === "Cobro"){

const snap =
await getDocs(collection(db,"cobros"));

snap.forEach(async d=>{

const cobro = d.data();

if(cobro.codigoComprobante === registro.codigoComprobante){

const nuevosMeses =
(cobro.meses || []).filter(m =>
    !(registro.meses || []).includes(m)
);

await updateDoc(
doc(db,"cobros", d.id),
{ meses: nuevosMeses }
);

}
});

}

// 🔥 SYNC COBRAR (IMPORTANTE)
if(window.COBRAR?.recargarCobros){
    await window.COBRAR.recargarCobros();
}

mostrarHistorial();
}


// ===============================
// IMPRIMIR
// ===============================

function imprimir(id){

const h =
CACHE_HISTORIAL.find(x=>x.id===id);


if(!h)return;



// ===============================
// REGENERAR TICKET REAL
// ===============================

if(
window.COBRAR?.generarTicket &&
h.accion==="Cobro"
){


window.COBRAR.generarTicket(

{
    nombre:h.afiliado || "",
    apellido:"",
    dni:h.dni || ""
},


h.meses || [],


h.total || 0,


h.medioPago || "",


h.codigoComprobante || "",


// conservar fecha/hora original

h.fecha || "",

h.hora || ""

);


return;

}



}

// ===============================
// FECHA INPUT
// ===============================

function formatearInputFecha(fecha){


const anio =
fecha.getFullYear();


const mes =
String(fecha.getMonth()+1).padStart(2,"0");


const dia =
String(fecha.getDate()).padStart(2,"0");


return `${anio}-${mes}-${dia}`;

}




// ===============================
// IMPRIMIR TABLA ACTUAL
// ===============================

function imprimirTablaActual(){


const tabla =
document.getElementById("tablaHistorial");


if(!tabla)return;



const ventana =
window.open(
"",
"_blank",
"width=900,height=600"
);



ventana.document.write(`

<html>

<head>

<title>Historial ACDP</title>

<style>

body{
font-family:Arial;
}

table{
width:100%;
border-collapse:collapse;
}

td,th{
border:1px solid #000;
padding:5px;
}

</style>


</head>


<body>


<h2>ACDP - Historial</h2>


${tabla.outerHTML}


<script>

window.print();

</script>


</body>


</html>

`);


ventana.document.close();


}

// ===============================
// EXPORT
// ===============================

window.HISTORIAL = {
    registrar,
    imprimir,
    anular
};


window.imprimirHistorial = imprimir;
window.anularHistorial = anular;


// PUENTE GLOBAL PARA OTROS MODULOS

window.registrarHistorial = registrar;
