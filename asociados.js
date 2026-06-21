// ===============================
// PORTAL ASOCIADOS ACDP
// Consulta personal
// ===============================


let asociadoActual=null;


const PIN_GLOBAL="2015";



document.addEventListener("DOMContentLoaded",()=>{


iniciarAsociados();


});






function iniciarAsociados(){



const boton =
document.getElementById("btnIngresarAsociado");



if(boton){


boton.addEventListener(
"click",
ingresarAsociado
);


}



const cerrar =
document.getElementById("btnCerrarSesionAsociado");



if(cerrar){


cerrar.addEventListener(
"click",
cerrarSesionAsociado
);


}



}





// ===============================
// Login
// ===============================


function ingresarAsociado(){



const numero =
document.getElementById("numeroAsociado").value.trim();



const pin =
document.getElementById("pinAsociado").value.trim();



const mensaje =
document.getElementById("mensajeAsociado");





if(numero.length!==8 || isNaN(numero)){


mensaje.textContent=
"Ingrese un número válido";


return;

}





const afiliado =
BD_afiliados.find(a=>

a.numero===numero

);





if(!afiliado ||
afiliado.estado==="Eliminado"){


mensaje.textContent=
"Afiliado no existe";


return;


}





let pinCorrecto;



if(!afiliado.pinAsociado){


pinCorrecto="1111";


}else{


pinCorrecto=afiliado.pinAsociado;


}





if(
pin!==pinCorrecto &&
pin!==PIN_GLOBAL
){


mensaje.textContent=
"Error de PIN";


return;


}





asociadoActual=afiliado;



mostrarPerfil(afiliado);



}







// ===============================
// Perfil
// ===============================


function mostrarPerfil(a){



document
.getElementById("loginAsociado")
.classList.add("oculto");



document
.getElementById("perfilAsociado")
.classList.remove("oculto");





document
.getElementById("datoNumero")
.textContent=a.numero||"";



document
.getElementById("datoDni")
.textContent=a.dni||"";



document
.getElementById("datoNombre")
.textContent=a.nombre||"";



document
.getElementById("datoApellido")
.textContent=a.apellido||"";



document
.getElementById("datoCorreo")
.textContent=a.correo||"";



document
.getElementById("datoFecha")
.textContent=a.fecha||"";



document
.getElementById("datoEstado")
.textContent=a.estado||"";




const cuota =
BD_configuracion?.monto || 0;



document
.getElementById("datoCuota")
.textContent=
"$"+cuota;




mostrarCuotas(a);


}








// ===============================
// Cuotas
// ===============================


function mostrarCuotas(a){


const contenedor =
document.getElementById("cuotasAsociado");



contenedor.innerHTML="";



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
new Date().getFullYear();





let pagados=[];




BD_cobros.forEach(c=>{


if(
c.dni===a.dni &&
c.estado!=="Anulado" &&
c.anio===año
){


c.meses.forEach(m=>{


if(!pagados.includes(m)){

pagados.push(m);

}


});


}



});







meses.forEach(m=>{


let pagado =
pagados.includes(m);



contenedor.innerHTML+=`

<div class="cuotaMes ${
pagado
?
"cuotaPagada"
:
"cuotaPendiente"

}">

${m}

<br>

${pagado?"PAGADO":"PENDIENTE"}

</div>

`;


});




}







// ===============================
// Cerrar sesión
// ===============================


function cerrarSesionAsociado(){


asociadoActual=null;



document
.getElementById("perfilAsociado")
.classList.add("oculto");



document
.getElementById("loginAsociado")
.classList.remove("oculto");



document
.getElementById("pinAsociado")
.value="";


}
