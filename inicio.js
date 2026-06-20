// =====================================
// ACDP - INICIO Y NAVEGACIÓN
// =====================================



let usuarioActivo = null;



document.addEventListener(
"DOMContentLoaded",
()=>{


    iniciarMenu();


});





function iniciarMenu(){


    let botones =
    document.querySelectorAll(
        ".menu button"
    );



    botones.forEach(btn=>{


        btn.addEventListener(
        "click",
        ()=>{


            cambiarSeccion(
                btn.dataset.section
            );


        });


    });



}





function cambiarSeccion(nombre){


    if(!usuarioActivo){


        abrirLogin(nombre);

        return;

    }




    document
    .querySelectorAll(".seccion")
    .forEach(s=>{

        s.classList.remove("activa");

    });




    document
    .getElementById(nombre)
    .classList.add("activa");



}





function abrirLogin(seccion){


    let contenido = `

    <h2>Acceso requerido</h2>

    <input id="loginUsuario"
    placeholder="Usuario">


    <br><br>


    <input id="loginPin"
    placeholder="PIN"
    type="password">


    <br><br>


    <button onclick="validarLogin('${seccion}')">

    Aceptar

    </button>


    `;


    abrirModal(contenido);



}





function validarLogin(seccion){



    let u =
    document.getElementById(
    "loginUsuario").value;



    let p =
    document.getElementById(
    "loginPin").value;




    let encontrado =
    BD.usuarios.find(x=>

        x.usuario===u &&
        x.pin===p

    );




    if(

        encontrado ||
        (u==="Admin" && p==="9999")

    ){


        usuarioActivo=u;


        cerrarModal();


        cambiarSeccion(seccion);


    }
    else{


        alert(
        "Usuario o PIN incorrecto"
        );


    }



}






// MODALES GENERALES



function abrirModal(html){


    document
    .getElementById(
    "modalContenido")
    .innerHTML=html;



    document
    .getElementById(
    "modalFondo")
    .classList.add("visible");



}




function cerrarModal(){


    document
    .getElementById(
    "modalFondo")
    .classList.remove("visible");



    document
    .getElementById(
    "modalContenido")
    .innerHTML="";


}
