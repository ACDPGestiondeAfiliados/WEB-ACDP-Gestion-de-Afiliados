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
h.detalleHistorial?.startsWith("Pago realizado") &&
h.estado!=="Anulado"
){

const monto =
h.detalleHistorial.match(/\$(\d+)/);

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
h.detalleHistorial?.startsWith("Pago realizado") &&
h.estado!=="Anulado"

?

`

<img

src="./iconos/print.png"

class="iconoHistorial"

onclick="HISTORIAL.imprimir('${h.id}')"

>


<img

src="./iconos/delete.png"

class="iconoHistorial"

onclick="HISTORIAL.anular('${h.id}')"

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


// DATOS EXTRA PARA COBROS

meses:
datos.meses ||
[],


total:
datos.total ||
0,


codigoComprobante:
datos.codigoComprobante ||
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
CACHE_HISTORIAL.find(
h=>h.id===id
);



if(!registro)return;



if(
!confirm(
"¿Anular pago?"
)

)return;



// ANULA HISTORIAL

await updateDoc(

doc(
db,
"historial",
id
),

{

estado:"Anulado",

detalleHistorial:

registro.detalleHistorial+
" | ANULADO"

}

);



registro.estado="Anulado";




// SI ES COBRO LIBERA MESES

if(registro.accion==="Cobro"){


const snap =
await getDocs(
collection(db,"cobros")
);



snap.forEach(async d=>{


const cobro = d.data();



if(
cobro.codigoComprobante === 
registro.codigoComprobante
){


const nuevosMeses =

(cobro.meses || [])
.filter(m =>

!(registro.meses || [])
.includes(m)

);



await updateDoc(

doc(
db,
"cobros",
d.id
),

{

meses:
nuevosMeses

}

);


}


});


}



mostrarHistorial();



}

// ===============================
// IMPRIMIR
// ===============================

function imprimir(id){


const h =
CACHE_HISTORIAL.find(
x=>x.id===id
);



if(!h)return;



const win =
window.open(
"",
"_blank",
"width=300,height=400"
);



win.document.write(`

<html>

<body style="
font-family:Arial;
text-align:center;
font-size:12px;
">


<h3>ACDP</h3>

<h4>Registro</h4>


<p>
${h.afiliado}
</p>


<p>
DNI:
${h.dni}
</p>


<p>
${h.detalleHistorial}
</p>


<p>
${h.fecha}
${h.hora}
</p>



<script>

window.print();

</script>


</body>

</html>

`);



win.document.close();


}





// ===============================
// EXPORT
// ===============================

window.HISTORIAL={

registrar,

imprimir,

anular

};


// PUENTE GLOBAL PARA OTROS MODULOS

window.registrarHistorial = registrar;
