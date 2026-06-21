// ===============================
// HISTORIAL ACDP FIREBASE
// ===============================


import {

db,
collection,
getDocs,
addDoc,
updateDoc,
doc,
query,
orderBy

} from "./firebase.js";



let fechaActual=new Date();

let historialVista=[];

let BD_historial=[];





document.addEventListener(
"DOMContentLoaded",
()=>{

iniciarHistorial();

});





async function iniciarHistorial(){


await cargarHistorial();


eventosHistorial();


}







// ===============================
// CARGA FIREBASE
// ===============================


async function cargarHistorial(){


const q =
query(
collection(db,"historial"),
orderBy("fecha")
);



const snap =
await getDocs(q);



BD_historial=[];



snap.forEach(d=>{


BD_historial.push({

id:d.id,

...d.data()

});


});



window.BD_historial =
BD_historial;



cargarHistorialFecha();


}








// ===============================
// EVENTOS
// ===============================


function eventosHistorial(){


const filtro =
document.getElementById(
"filtroHistorial"
);



if(filtro)

filtro.oninput=()=>{

filtrarHistorial(
filtro.value
);

};



const anterior =
document.getElementById(
"historialAnterior"
);



if(anterior)

anterior.onclick=()=>{

cambiarFecha(-1);

};




const siguiente =
document.getElementById(
"historialSiguiente"
);



if(siguiente)

siguiente.onclick=()=>{

cambiarFecha(1);

};



}









function normalizarTexto(v){


if(!v)return "";

if(typeof v==="object")

return v.usuario ||
v.nombre ||
v.afiliado ||
"";


return String(v);


}









// ===============================
// FILTRO FECHA
// ===============================


function cargarHistorialFecha(){



const fecha =
fechaActual.toLocaleDateString();



historialVista =
BD_historial.filter(h=>{


return h.fecha===fecha;


})
.reverse();



mostrarHistorial();


}







function filtrarHistorial(valor){


valor=
valor.trim();



if(!valor){

cargarHistorialFecha();

return;

}



historialVista =
BD_historial.filter(h=>

String(h.dni)===valor ||

String(h.numero)===valor

)
.reverse();



mostrarHistorial();


}









// ===============================
// TABLA
// ===============================


function mostrarHistorial(){



const cuerpo =
document
.getElementById("tablaHistorial")
.querySelector("tbody");



cuerpo.innerHTML="";



let total=0;



if(!historialVista.length){


cuerpo.innerHTML=

`

<tr>

<td colspan="8">

SIN REGISTRO

</td>

</tr>

`;

}



historialVista.forEach(h=>{


if(h.estado!=="Anulado")

total+=obtenerMonto(h.detalle);




cuerpo.innerHTML+=`

<tr class="${h.estado==="Anulado"?"historialAnulado":""}">


<td>${normalizarTexto(h.usuario)}</td>

<td>${normalizarTexto(h.afiliado)}</td>

<td>${h.dni||""}</td>

<td>${h.numero||""}</td>

<td>${h.fecha||""}</td>

<td>${h.hora||""}</td>


<td>


${
h.accion==="Cobro" &&
h.estado!=="Anulado"

?

`

<img src="print.png"
class="iconoHistorial"
onclick="imprimirRegistro('${h.id}')">


<img src="delete.png"
class="iconoHistorial"
onclick="solicitarAnulacion('${h.id}')">


`

:""

}



</td>


<td>${h.detalle||""}</td>


</tr>

`;



});



document
.getElementById("montoHistorial")
.textContent=
"$"+total.toFixed(2);



}





function cambiarFecha(valor){


fechaActual.setDate(
fechaActual.getDate()+valor
);



cargarHistorialFecha();


}





function obtenerMonto(texto){


if(!text)return 0;


return Number(
String(texto)
.replace(/\D/g,"")
)
||0;


}









// ===============================
// REGISTRAR
// ===============================


async function registrarHistorial(
accion,
afiliado,
detalle
){



const ahora =
new Date();



const registro={


usuario:
window.usuarioActivo ||
"Administrador",



afiliado:

(afiliado?.nombre||"")
+
" "
+
(afiliado?.apellido||""),



dni:
afiliado?.dni||"",


numero:
afiliado?.numero||"",


fecha:
ahora.toLocaleDateString(),


hora:
ahora.toLocaleTimeString(),


accion,


detalle:
detalle||"",


anio:
ahora.getFullYear()



};





const ref =
await addDoc(

collection(db,"historial"),

registro

);




registro.id=ref.id;



BD_historial.push(registro);

window.BD_historial=BD_historial;



}





// ===============================
// IMPRESION
// ===============================


function imprimirRegistro(id){


const registro =
BD_historial.find(
h=>h.id===id
);



if(!registro)return;



if(
typeof generarComprobanteCobro==="function"
){



generarComprobanteCobro(

{

nombre:
registro.afiliado,

dni:
registro.dni

},

registro.meses||[],

registro.total ||
obtenerMonto(registro.detalle)

);


}


}









// ===============================
// ANULAR
// ===============================


function solicitarAnulacion(id){



if(typeof pedirPinAdmin==="function"){


pedirPinAdmin(()=>{

anularRegistro(id);

});


}


}







async function anularRegistro(id){



const registro =
BD_historial.find(
h=>h.id===id
);



if(!registro)return;



if(registro.estado==="Anulado")

return;





const año =
new Date().getFullYear();



if(
registro.anio &&
registro.anio<año
){

alert(
"No se puede anular un registro anterior"
);

return;

}




await updateDoc(

doc(
db,
"historial",
id
),

{

estado:"Anulado",

detalle:
registro.detalle+
" | ANULADO"

}

);




registro.estado="Anulado";



window.BD_historial=BD_historial;



mostrarHistorial();



alert(
"Registro anulado"
);



}






function imprimirHistorial(){


if(typeof generarPDF==="function")

generarPDF(historialVista);


}
