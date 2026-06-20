/* =====================================
   ACDP - INICIO
===================================== */


let usuarioActivo = "Admin";



window.onload = function(){


iniciarApp();


};






function iniciarApp(){


document
.getElementById("usuarioActivo")
.textContent =
"Usuario: "+usuarioActivo;




document
.querySelectorAll(".menu button")
.forEach(boton=>{


boton.addEventListener(
"click",
function(){


mostrarSeccion(
this.dataset.seccion
);


});


});




mostrarSeccion("cobrar");


};








function mostrarSeccion(id){



document
.querySelectorAll(".seccion")
.forEach(s=>{


s.classList.remove(
"activa"
);


});





let objetivo =
document.getElementById(id);




if(objetivo){


objetivo.classList.add(
"activa"
);


}



}



function abrirModal(){


document
.getElementById("modalFondo")
.classList.add("visible");


}



function cerrarModal(){


document
.getElementById("modalFondo")
.classList.remove("visible");


}



document
.addEventListener(
"click",
function(e){


if(
e.target.id==="cerrarModal"
){

cerrarModal();

}


});
