// ===============================
// INICIO DEL SISTEMA ACDP
// Control general de interfaz
// ===============================

document.addEventListener("DOMContentLoaded",()=>{

    iniciarMenu();
    iniciarModal();
    limitarNumeros();
    iniciarSistema();

});


// Cambia las secciones principales

function iniciarMenu(){

    const botones=document.querySelectorAll(".menu button");
    const secciones=document.querySelectorAll(".seccion");

    botones.forEach(boton=>{

        boton.addEventListener("click",()=>{

            const destino=boton.dataset.seccion;

            secciones.forEach(seccion=>{
                seccion.classList.remove("activa");
            });

            const nueva=document.getElementById(destino);

            if(nueva){
                nueva.classList.add("activa");
            }

        });

    });

}



// Control del modal general

function iniciarModal(){

    const fondo=document.getElementById("modalFondo");
    const cerrar=document.getElementById("cerrarModal");

    cerrar.addEventListener("click",()=>{

        fondo.classList.remove("activo");

    });


    fondo.addEventListener("click",(e)=>{

        if(e.target===fondo){
            fondo.classList.remove("activo");
        }

    });

}



// Permite solo números en filtros

function limitarNumeros(){

    const inputs=document.querySelectorAll(".inputNumero");

    inputs.forEach(input=>{

        input.addEventListener("input",()=>{

            input.value=input.value.replace(/\D/g,"");

        });

    });

}



// Inicio general

function iniciarSistema(){

    const consola=document.getElementById("consolaSistema");

    if(consola){

        consola.innerHTML="Sistema ACDP iniciado correctamente.";

    }


    const usuario=document.getElementById("usuarioActivo");

    if(usuario){

        usuario.innerHTML="Sesión: Administrador";

    }

}
