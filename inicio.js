/* =====================================
   ACDP - INICIO
===================================== */


let usuarioActivo = "Admin";



document.addEventListener(
"DOMContentLoaded",
()=>{


iniciarApp();


});






function iniciarApp(){



document
.getElementById(
"usuarioActivo"
)
.textContent =
"Usuario: "+usuarioActivo;





activarNavegacion();



activarCerrarModal();



mostrarSeccion("cobrar");



}









function activarNavegacion(){



document
.querySelectorAll(
".menu button"
)
.forEach(boton=>{


boton.onclick =
()=>{


let destino =
boton.dataset.seccion;



mostrarSeccion(
destino
);



};



});



}









function mostrarSeccion(id){



document
.querySelectorAll(
".seccion"
)
.forEach(seccion=>{


seccion.classList.remove(
"activa"
);


});





let seccion =
document.getElementById(id);





if(!seccion)
return;





seccion.classList.add(
"activa"
);






switch(id){


case "afiliados":

if(typeof cargarAfiliados==="function")
cargarAfiliados();

break;




case "cobrar":

if(typeof cargarCobrar==="function")
cargarCobrar();

break;




case "historial":

if(typeof cargarHistorial==="function")
cargarHistorial();

break;




case "usuarios":

if(typeof cargarUsuarios==="function")
cargarUsuarios();

break;




case "configuracion":

if(typeof cargarConfiguracion==="function")
cargarConfiguracion();

break;



}



}









function abrirModal(){



document
.getElementById(
"modalFondo"
)
.classList.add(
"visible"
);



}









function cerrarModal(){



document
.getElementById(
"modalFondo"
)
.classList.remove(
"visible"
);



document
.getElementById(
"modalContenido"
)
.innerHTML="";



}








function activarCerrarModal(){



let boton =
document.getElementById(
"cerrarModal"
);




if(boton){


boton.onclick =
cerrarModal;


}



}
