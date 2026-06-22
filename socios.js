// ===============================
// ACDP - PORTAL SOCIOS
// Firebase + consulta afiliado
// ===============================


import {

db,
collection,
getDocs,
updateDoc,
doc

} from "../firebase.js";




// ===============================
// ESTADO
// ===============================


let socioActual=null;

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






if(pin===PIN_MASTER){

alert(
"Acceso administrador"
);

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

dato("datoFechaAlta",a.fechaAlta);





document
.getElementById("nuevoCelular")
.value=a.celular||"";



document
.getElementById("nuevoCorreo")
.value=a.correo||"";




const config =
localStorage.getItem("montoCuota")
||0;



document
.getElementById("valorCuota")
.textContent=
"$"+config;



mostrarCuotas();



}





function dato(id,texto){

document
.getElementById(id)
.textContent=texto||"";

}








// ===============================
// EDITAR DATOS
// ===============================


async function guardarDatos(){


if(!socioActual)return;



const celular =
document
.getElementById("nuevoCelular")
.value.trim();



const correo =
document
.getElementById("nuevoCorreo")
.value.trim();





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
document
.getElementById("nuevoPin")
.value.trim();



const confirmar =
document
.getElementById("confirmarPin")
.value.trim();





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



socioActual.pinAsociado=nuevo;



alert(
"PIN cambiado"
);



document
.getElementById("nuevoPin")
.value="";


document
.getElementById("confirmarPin")
.value="";



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



document
.getElementById("loginNumero")
.value="";


document
.getElementById("loginPin")
.value="";


}
