// ===============================
// CONFIG ACDP FIREBASE
// Monto + Logs + Consola
// ===============================


import {

db,
doc,
getDoc,
setDoc,
collection,
addDoc,
getDocs

} from "./firebase.js";




// ===============================
// VARIABLES
// ===============================


window.BD_logsSistema =
window.BD_logsSistema || [];





document.addEventListener(
"DOMContentLoaded",
()=>{


iniciarConfiguracion();

cargarConfiguracion();

cargarLogs();

iniciarConsolaLogs();


});








// ===============================
// CONFIG
// ===============================


function iniciarConfiguracion(){


const boton =
document.getElementById(
"guardarConfiguracion"
);



if(boton)

boton.onclick =
guardarMonto;



}








// ===============================
// CARGAR CONFIG FIREBASE
// ===============================


async function cargarConfiguracion(){



const ref =
doc(
db,
"configuracion",
"principal"
);



const snap =
await getDoc(ref);



if(
snap.exists()
){

window.BD_configuracion =
snap.data();

}

else{


window.BD_configuracion={

monto:0

};



await setDoc(
ref,
window.BD_configuracion
);


}



const input =
document.getElementById(
"montoConfiguracion"
);



if(input)

input.value =
window.BD_configuracion.monto || 0;



}









// ===============================
// GUARDAR MONTO
// ===============================


async function guardarMonto(){



const input =
document.getElementById(
"montoConfiguracion"
);



const valor =
Number(input.value);



if(
isNaN(valor) ||
valor<0
){

escribirConsola(
"Monto inválido"
);

return;

}




window.BD_configuracion.monto =
valor;




await setDoc(

doc(
db,
"configuracion",
"principal"
),

window.BD_configuracion

);





registrarLog({

accion:"CONFIGURACION",

detalle:
"Monto actualizado a $"+valor

});



escribirConsola(
"Monto actualizado $" +
valor.toFixed(2)
);



}








// ===============================
// LOG FIREBASE
// ===============================


async function registrarLog(datos){



const ahora =
new Date();



const log={


fecha:
ahora.toLocaleDateString(),


hora:
ahora.toLocaleTimeString(),


usuario:
window.usuarioActivo ||
"Sistema",


rol:
window.usuarioActivo==="Admin"
?
"ADMIN"
:
"USER",


accion:
datos.accion,


detalle:
datos.detalle || ""

};





window.BD_logsSistema.push(log);





await addDoc(

collection(db,"logs"),

log

);



if(
typeof renderConsolaLogs==="function"
)

renderConsolaLogs(">todo");



}






// ===============================
// COMPATIBILIDAD HISTORIAL
// ===============================


const historialOriginal =
window.registrarHistorial;



window.registrarHistorial =
function(
accion,
afiliado,
detalle
){


if(
typeof historialOriginal==="function"
)

historialOriginal(
accion,
afiliado,
detalle
);



registrarLog({

accion,

detalle:
(detalle||"")+" | HISTORIAL"

});


};








// ===============================
// CARGAR LOGS
// ===============================


async function cargarLogs(){



const snap =
await getDocs(
collection(db,"logs")
);



window.BD_logsSistema=[];



snap.forEach(d=>{

window.BD_logsSistema.push({

id:d.id,

...d.data()

});


});


}









// ===============================
// CONSOLA
// ===============================


function iniciarConsolaLogs(){



const input =
document.getElementById(
"inputLogs"
);


const consola =
document.getElementById(
"consolaSistema"
);



if(!input || !consola)

return;



renderConsolaLogs(">todo");



input.onkeydown=e=>{


if(e.key==="Enter"){


renderConsolaLogs(
input.value
);


input.value="";


}


};



}









function procesarFiltroLogs(comando){



let logs =
[...window.BD_logsSistema];



comando =
(comando||">todo")
.toLowerCase();



if(
comando===">todo"
)

return logs;




if(
comando.startsWith(">filtrarusuario")
){

let u =
comando.replace(
">filtrarusuario",
""
)
.trim();



return logs.filter(
l=>
(l.usuario||"")
.toLowerCase()===u
);


}




if(
comando.startsWith(">buscardni")
){


let dni =
comando.replace(
">buscardni",
""
)
.trim();



return logs.filter(
l=>
(l.detalle||"")
.includes(dni)
);



}





if(
comando.startsWith(">buscaraccion")
){


let a =
comando.replace(
">buscaraccion",
""
)
.trim();



return logs.filter(
l=>
(l.accion||"")
.toLowerCase()
.includes(a)
);


}




return logs;


}








function renderConsolaLogs(comando){



const consola =
document.getElementById(
"consolaSistema"
);



if(!consola)return;



const logs =
procesarFiltroLogs(comando);



let html="";



logs.forEach(l=>{


html+=`


<div style="font-family:monospace">


${l.fecha||""}
${l.hora||""}
|
${l.usuario||""}
|
${l.accion||""}

→

${l.detalle||""}


</div>


`;


});



consola.innerHTML =
html ||
"Sin registros";



consola.scrollTop =
consola.scrollHeight;


}






function escribirConsola(texto){


const consola =
document.getElementById(
"consolaSistema"
);



if(consola)

consola.innerHTML +=
"<br>"+texto;


}
