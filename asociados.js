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





const guardar =
document.getElementById("btnGuardarDatos");



if(guardar){

guardar.addEventListener(
"click",
guardarDatosPerfil
);

}




const cambiar =
document.getElementById("btnCambiarPin");



if(cambiar){

cambiar.addEventListener(
"click",
cambiarPin
);

}




activarNumericos();



}








// ===============================
// Solo números
// ===============================


function activarNumericos(){


const campos=[

"numeroAsociado",
"pinAsociado",
"editarCelular",
"pinActual",
"nuevoPin",
"confirmarPin"

];



campos.forEach(id=>{


const input=
document.getElementById(id);



if(input){


input.addEventListener(
"input",
()=>{


input.value =
input.value.replace(/\D/g,"");


}

);


}


});


}








// ===============================
// Login
// ===============================


function ingresarAsociado(){



const numero =
document.getElementById("numeroAsociado")
.value.trim();



const pin =
document.getElementById("pinAsociado")
.value.trim();



const mensaje =
document.getElementById("mensajeAsociado");





if(numero.length!==8){


mensaje.textContent=
"Ingrese un número válido";


return;

}





const afiliado =
BD_afiliados.find(a=>

a.numero===numero

);





if(
!afiliado ||
afiliado.estado==="Eliminado"

){


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





if(pin===PIN_GLOBAL){


alert(
"Acceso administrador. Puede recuperar el PIN del asociado."
);


asociadoActual=afiliado;


mostrarPerfil(afiliado);


return;


}






if(pin!==pinCorrecto){


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
.getElementById("datoCelular")
.textContent=a.celular||"";



document
.getElementById("datoCorreo")
.textContent=a.correo||"";



document
.getElementById("datoFecha")
.textContent=a.fecha||"";



document
.getElementById("datoEstado")
.textContent=a.estado||"";





document
.getElementById("editarCelular")
.value=
a.celular||"";





document
.getElementById("editarCorreo")
.value=
a.correo||"";





const cuota =
BD_configuracion?.monto || 0;



document
.getElementById("datoCuota")
.textContent=
"$"+cuota;




mostrarCuotas(a);


}









// ===============================
// Editar datos
// ===============================


function guardarDatosPerfil(){


if(!asociadoActual)return;




const celular =
document.getElementById("editarCelular")
.value.trim();




const correo =
document.getElementById("editarCorreo")
.value.trim();





asociadoActual.celular=celular;

asociadoActual.correo=correo;





guardarBD();





mostrarPerfil(
asociadoActual
);




alert(
"Datos actualizados correctamente"
);



}









// ===============================
// Cambiar PIN
// ===============================


function cambiarPin(){



if(!asociadoActual)return;




const actual =
document.getElementById("pinActual")
.value.trim();



const nuevo =
document.getElementById("nuevoPin")
.value.trim();



const confirmar =
document.getElementById("confirmarPin")
.value.trim();






let pinReal;



if(!asociadoActual.pinAsociado){


pinReal="1111";


}else{


pinReal=
asociadoActual.pinAsociado;


}







if(
actual!==pinReal &&
actual!==PIN_GLOBAL
){


alert(
"PIN actual incorrecto"
);


return;


}






if(
nuevo.length<4 ||
nuevo!==confirmar

){


alert(
"El nuevo PIN no coincide o es inválido"
);


return;


}






asociadoActual.pinAsociado=
nuevo;





guardarBD();





document.getElementById("pinActual").value="";

document.getElementById("nuevoPin").value="";

document.getElementById("confirmarPin").value="";




alert(
"PIN actualizado correctamente"
);



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
.getElementById("numeroAsociado")
.value="";



document
.getElementById("pinAsociado")
.value="";



}
