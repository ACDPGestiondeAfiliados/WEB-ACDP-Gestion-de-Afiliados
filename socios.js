// ===============================
// ACDP - PORTAL SOCIOS
// Firebase + Cursos + Notificaciones
// ===============================


import {

db,
collection,
getDocs,
updateDoc,
deleteDoc,
doc,
getDoc

} from "./firebase.js";

import {
  getToken
} from "firebase/messaging";

import { messaging, VAPID_KEY } from "./firebase.js";




// ===============================
// ESTADO
// ===============================


let socioActual=null;

let cursos=[];

const PIN_MASTER="2015";





// ===============================
// INIT
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{

iniciarSocios();

});





function iniciarSocios(){


document
.getElementById("btnLoginSocio")
.onclick=ingresarSocio;



document
.getElementById("btnCerrarSesion")
.onclick=cerrarSesion;



document
.getElementById("btnGuardarDatos")
.onclick=guardarDatos;



document
.getElementById("btnCambiarPin")
.onclick=cambiarPin;



document
.getElementById("btnVerCursos")
.onclick=abrirCursos;



document
.getElementById("cerrarCursosSocio")
.onclick=()=>{

document
.getElementById("modalCursosSocio")
.classList.add("oculto");

};



document
.getElementById("cerrarNotificacionSocio")
.onclick=()=>{

document
.getElementById("modalNotificacionSocio")
.classList.add("oculto");

};



activarNumericos();


}






// ===============================
// INPUT NUMERICO
// ===============================


function activarNumericos(){


[
"loginNumero",
"loginPin",
"nuevoCelular",
"nuevoPin",
"confirmarPin"

].forEach(id=>{


const el =
document.getElementById(id);


if(el){

el.oninput=()=>{

el.value =
el.value.replace(/\D/g,"");

};

}


});


}









// ===============================
// LOGIN
// ===============================


async function ingresarSocio(){


const dato =
document
.getElementById("loginNumero")
.value.trim();



const pin =
document
.getElementById("loginPin")
.value.trim();



const mensaje =
document
.getElementById("mensajeLogin");



if(dato.length!==8){

mensaje.textContent=
"Ingrese DNI o número válido";

return;

}





const snap =
await getDocs(
collection(db,"afiliados")
);



let encontrado=null;



snap.forEach(d=>{


const a={
id:d.id,
...d.data()
};


if(

a.dni===dato ||
a.numeroAfiliado===dato

){

encontrado=a;

}


});





if(!encontrado){


mensaje.textContent=
"Afiliado inexistente";


return;

}





if(encontrado.estado==="Eliminado"){


mensaje.textContent=
"Cuenta deshabilitada";

return;


}






const pinCorrecto =
encontrado.pinAsociado ||
"1111";





if(

pin!==pinCorrecto &&
pin!==PIN_MASTER

){


mensaje.textContent=
"PIN incorrecto";

return;


}





socioActual=encontrado;



mostrarPerfil();



}










// ===============================
// PERFIL
// ===============================


async function mostrarPerfil(){



const a=socioActual;



document
.getElementById("loginSocio")
.classList.add("oculto");



document
.getElementById("perfilSocio")
.classList.remove("oculto");





dato("datoNumeroAfiliado",a.numeroAfiliado);

dato("datoDni",a.dni);

dato("datoNombre",a.nombre);

dato("datoApellido",a.apellido);

dato("datoCelular",a.celular);

dato("datoCorreo",a.correo);

dato("datoEstado",a.estado);

dato(
"datoFechaAlta",
formatearFechaHora(a.fechaAlta)
);





nuevoCelular.value=a.celular||"";

nuevoCorreo.value=a.correo||"";





const configRef =
doc(
db,
"configuracion",
"general"
);



const configSnap =
await getDoc(configRef);



const monto =
configSnap.exists()
?
configSnap.data().monto
:
0;



valorCuota.textContent=
"$"+monto;




mostrarCuotas();



await cargarCursos();



mostrarNotificacion();



}









function dato(id,texto){

document
.getElementById(id)
.textContent=texto||"";

}









// ===============================
// NOTIFICACION
// ===============================

async function registrarNotificaciones(){

if(!("Notification" in window))
return;

const permiso = await Notification.requestPermission();

if(permiso !== "granted")
return;

try{

await navigator.serviceWorker.register("./firebase-messaging-sw.js");

const token = await getToken(messaging,{
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: await navigator.serviceWorker.ready
});

if(!token)
return;

/* =========================
   GUARDAR TOKEN
========================= */
await setDoc(doc(db, "tokens", token), {
    token,
    socioID: socioActual?.id || null,
    fecha: Date.now()
});

/* =========================
   SUSCRIPCIÓN A TOPIC (PASO 2)
========================= */
await fetch(
`https://iid.googleapis.com/iid/v1/${token}/rel/topics/acdp_general`,
{
    method: "POST",
    headers: {
        "Authorization": "key=TU_SERVER_KEY"
    }
});

}catch(error){
console.error("Error Push:", error);
}

}


// ===============================
// PUSH NOTIFICATIONS
// ===============================

async function registrarNotificaciones(){

if(
!("Notification" in window)
)
return;

const permiso=
await Notification.requestPermission();

if(
permiso!=="granted"
)
return;

try{

await navigator.serviceWorker.register(
"./firebase-messaging-sw.js"
);

const token=
await getToken(

messaging,

{

vapidKey:VAPID_KEY,

serviceWorkerRegistration:
await navigator.serviceWorker.ready

}

);

if(!token)
return;

await setDoc(doc(db, "tokens", token), {
    token,
    socioID: socioActual?.id || null,
    fecha: Date.now()
});

}
catch(error){

console.error(
"Error Push:",
error
);

}

}
await fetch(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/acdp_general`, {
    method: "POST",
    headers: {
        "Authorization": "key=TU_SERVER_KEY"
    }
});




// ===============================
// CURSOS
// ===============================


async function cargarCursos(){


cursos=[];


const snap =
await getDocs(
collection(db,"cursos")
);



const hoy =
new Date()
.toISOString()
.split("T")[0];



for(const d of snap.docs){


const c={

id:d.id,
...d.data()

};



if(
c.fechaCierre &&
c.fechaCierre < hoy

){


await deleteDoc(

doc(
db,
"cursos",
c.id

)

);


continue;

}



cursos.push(c);


}



cursos.sort(

(a,b)=>

new Date(b.fechaInicio)

-

new Date(a.fechaInicio)

);



cursos =
cursos.slice(0,10);


}









function abrirCursos(){



const modal =
document
.getElementById("modalCursosSocio");



const lista =
document
.getElementById("listaCursosSocio");



lista.innerHTML="";




if(cursos.length===0){


lista.innerHTML=`

<p>

Sin cursos disponibles por el momento,
se le avisará cuando surjan jornadas/cursos o diplomaturas.

</p>

`;



}else{



cursos.forEach(c=>{


lista.innerHTML+=`

<div class="cursoCard">


<h3>

${c.titulo}

</h3>


<p>

Inicio:
${formatearSimple(c.fechaInicio)}

</p>


<p>

Cierre:
${formatearSimple(c.fechaCierre)}

</p>


</div>

`;



});



}



modal.classList.remove("oculto");


}









function formatearSimple(v){


if(!v)return "";


const d =
new Date(
v+"T00:00:00"
);



return (

String(d.getDate())
.padStart(2,"0")
+"/"+
String(d.getMonth()+1)
.padStart(2,"0")
+"/"+
d.getFullYear()

);


}









// ===============================
// FORMATO FECHA
// ===============================


function formatearFechaHora(valor){


const fecha =
new Date(valor);



return (

String(fecha.getDate())
.padStart(2,"0")
+"/"+
String(fecha.getMonth()+1)
.padStart(2,"0")
+"/"+
fecha.getFullYear()
+" "+
String(fecha.getHours())
.padStart(2,"0")
+":"+
String(fecha.getMinutes())
.padStart(2,"0")

);


}









// ===============================
// EDITAR DATOS
// ===============================


async function guardarDatos(){


if(!socioActual)return;



const celular =
nuevoCelular.value.trim();



const correo =
nuevoCorreo.value.trim();





await updateDoc(

doc(
db,
"afiliados",
socioActual.id
),

{

celular,
correo

}

);



socioActual.celular=celular;

socioActual.correo=correo;



alert(
"Datos actualizados"
);



mostrarPerfil();



}









// ===============================
// CAMBIAR PIN
// ===============================


async function cambiarPin(){


if(!socioActual)return;



const nuevo =
nuevoPin.value.trim();



const confirmar =
confirmarPin.value.trim();





if(

nuevo.length!==4 ||
nuevo!==confirmar

){

alert(
"PIN inválido"
);

return;

}






if(nuevo===PIN_MASTER){

alert(
"PIN reservado"
);

return;

}





await updateDoc(

doc(
db,
"afiliados",
socioActual.id
),

{

pinAsociado:nuevo

}

);



alert(
"PIN cambiado"
);



nuevoPin.value="";

confirmarPin.value="";



}









// ===============================
// CUOTAS
// ===============================


async function mostrarCuotas(){


const caja =
document
.getElementById("cuotasSocio");



caja.innerHTML="";



const meses=[

"Enero",
"Febrero",
"Marzo",
"Abril",
"Mayo",
"Junio",
"Julio",
"Agosto",
"Septiembre",
"Octubre",
"Noviembre",
"Diciembre"

];



const año =
new Date()
.getFullYear();



let pagados=[];





const snap =
await getDocs(
collection(db,"cobros")
);




snap.forEach(d=>{


const c=d.data();



if(

c.dni===socioActual.dni &&
c.anio===año &&
c.estado!=="Anulado"

){


(c.meses||[])
.forEach(m=>{


if(!pagados.includes(m))
pagados.push(m);


});


}



});






meses.forEach(m=>{


const ok =
pagados.includes(m);



caja.innerHTML+=`


<div class="cuota ${
ok?"pagada":"pendiente"
}">

${m}

<br>

${ok?"PAGADO":"PENDIENTE"}

</div>


`;


});



}








// ===============================
// SALIR
// ===============================


function cerrarSesion(){


socioActual=null;



document
.getElementById("perfilSocio")
.classList.add("oculto");



document
.getElementById("loginSocio")
.classList.remove("oculto");



}
