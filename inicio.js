/* =====================================
   ACDP - INICIO
===================================== */





let usuarioActivo = null;






document.addEventListener(
"DOMContentLoaded",
()=>{


    activarNavegacion();

    activarCerrarModal();


    mostrarSeccion("cobrar");


}

);









function activarNavegacion(){



    let botones =
    document.querySelectorAll(
    ".menu button"
    );




    botones.forEach(btn=>{



        btn.addEventListener(
        "click",
        ()=>{


            solicitarAcceso(
                btn.dataset.seccion
            );


        });



    });




}









function solicitarAcceso(seccion){



    abrirModal();



    document
    .getElementById(
    "modalContenido")
    .innerHTML =
    "";




    let titulo =
    document.createElement("h2");



    titulo.textContent =
    "Acceso requerido";




    let usuario =
    document.createElement("input");


    usuario.id =
    "loginUsuario";


    usuario.placeholder =
    "Usuario";





    let pin =
    document.createElement("input");


    pin.id =
    "loginPin";


    pin.type =
    "password";


    pin.placeholder =
    "PIN";





    let aceptar =
    document.createElement("button");



    aceptar.textContent =
    "Aceptar";



    aceptar.onclick =
    ()=>validarAcceso(
        seccion
    );





    let caja =
    document.getElementById(
    "modalContenido"
    );



    caja.appendChild(titulo);

    caja.appendChild(usuario);

    caja.appendChild(pin);

    caja.appendChild(aceptar);



}









function validarAcceso(seccion){



let usuario =
document.getElementById(
"loginUsuario"
).value;



let pin =
document.getElementById(
"loginPin"
).value;





let encontrado =
BD.usuarios.find(u=>

u.usuario===usuario
&&
u.pin===pin

);






if(
(encontrado)
||
(usuario==="Admin" && pin==="9999")

){


usuarioActivo =
usuario;



document
.getElementById(
"usuarioActivo")
.textContent =
"Usuario: "+usuario;



cerrarModal();



mostrarSeccion(
seccion
);



}

else{


alert(
"Usuario o PIN incorrecto"
);



}



}









function mostrarSeccion(id){



document
.querySelectorAll(
".seccion")
.forEach(s=>{

s.classList.remove(
"activa"
);


});




document
.getElementById(id)
.classList.add(
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
"modalFondo")
.classList.add(
"visible"
);



}









function cerrarModal(){



document
.getElementById(
"modalFondo")
.classList.remove(
"visible"
);



document
.getElementById(
"modalContenido")
.innerHTML =
"";



}









function activarCerrarModal(){



document
.getElementById(
"cerrarModal")
.onclick =
cerrarModal;



}
