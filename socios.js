// ===============================
// ACDP - PORTAL SOCIOS
// Firebase + Cursos + Notificaciones
// ===============================


import {

db,
collection,
getDocs,
updateDoc,
doc,
getDoc

} from "./firebase.js";




// ===============================
// ESTADO
// ===============================


let socioActual=null;

let cursos=[];

let mesCursosActual=new Date();

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
.getElementById("cursoAnterior")
.onclick=()=>cambiarMes(-1);



document
.getElementById("cursoSiguiente")
.onclick=()=>cambiarMes(1);



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



cargarCursos();



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


async function mostrarNotificacion(){


const snap =
await getDoc(

doc(
db,
"notificaciones",
"principal"

)

);



if(!snap.exists())
return;



const data =
snap.data();



textoNotificacionSocio.textContent =
data.mensaje;



modalNotificacionSocio
.classList.remove("oculto");



}









// ===============================
// CURSOS
// ===============================


async function cargarCursos(){



cursos=[];



const snap =
await getDocs(
collection(db,"cursos")
);




snap.forEach(d=>{


cursos.push({

id:d.id,
...d.data()

});


});





cursos.sort(

(a,b)=>
new Date(b.fechaInicio)
-
new Date(a.fechaInicio)

);



cursos=
cursos.slice(0,10);



renderCursos();


}









function abrirCursos(){


document
.getElementById("cuotasSocio")
.classList.add("oculto");



document
.getElementById("cursosSocio")
.classList.remove("oculto");



renderCursos();


}








function cambiarMes(valor){


mesCursosActual.setMonth(

mesCursosActual.getMonth()+valor

);


renderCursos();


}








function renderCursos(){



const lista =
document
.getElementById("listaCursos");



if(!lista)return;



lista.innerHTML="";




const mes =
mesCursosActual.getMonth();



const año =
mesCursosActual.getFullYear();





mesCursos.textContent =

new Intl.DateTimeFormat(
"es",
{
month:"long",
year:"numeric"
}

).format(mesCursosActual);







let encontrados =
cursos.filter(c=>{


let ini =
new Date(c.fechaInicio+"T00:00:00");

let fin =
new Date(c.fechaCierre+"T00:00:00");



let inicioMes =
new Date(año,mes,1);



let finMes =
new Date(año,mes+1,0);



return ini<=finMes &&
fin>=inicioMes;


});






if(encontrados.length===0){


lista.innerHTML=

`
<p>
No existen cursos/jornadas o diplomaturas para inscripción este mes,
por favor, mirá el mes anterior, o esperá al próximo mes
</p>
`;

return;


}








encontrados.forEach(c=>{


let estado =
new Date()<=
new Date(c.fechaCierre+"T00:00:00")
?
"Abierto"
:
"Cerrado";



lista.innerHTML+=`

<div class="cursoCard">


<h3>
${c.titulo}
</h3>


<p>
Estado: ${estado}
</p>


<p>
Fecha de apertura:
${formatearSimple(c.fechaInicio)}
</p>


<p>
Fecha de cierre:
${formatearSimple(c.fechaCierre)}
</p>


</div>

`;



});


}









function formatearSimple(v){


let d =
new Date(v+"T00:00:00");


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
document.getElementById("cuotasSocio");



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
