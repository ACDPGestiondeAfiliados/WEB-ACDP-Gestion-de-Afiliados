// ===============================
// INICIO ACDP
// Control general de interfaz
// ===============================

document.addEventListener("DOMContentLoaded",()=>{

    iniciarMenu();
    iniciarModal();
    limitarNumeros();
    iniciarSistema();

});


// ===============================
// Navegación entre pestañas
// ===============================

function iniciarMenu(){

    const botones=document.querySelectorAll(".menu button");
    const secciones=document.querySelectorAll(".seccion");


    if(!botones.length || !secciones.length) return;


    botones.forEach(boton=>{

        boton.addEventListener("click",()=>{

            const destino=boton.getAttribute("data-seccion");


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



// ===============================
// Modal global
// ===============================

function iniciarModal(){

    const fondo=document.getElementById("modalFondo");
    const cerrar=document.getElementById("cerrarModal");


    if(!fondo || !cerrar) return;


    cerrar.addEventListener("click",()=>{

        fondo.classList.remove("activo");

    });


    fondo.addEventListener("click",(evento)=>{

        if(evento.target===fondo){

            fondo.classList.remove("activo");

        }

    });

}



// ===============================
// Inputs numéricos
// ===============================

function limitarNumeros(){

    const inputs=document.querySelectorAll(".inputNumero");


    inputs.forEach(input=>{

        input.addEventListener("input",()=>{

            input.value=input.value.replace(/[^0-9]/g,"");

        });

    });

}



// ===============================
// Inicio visual del sistema
// ===============================

function iniciarSistema(){

    const consola=document.getElementById("consolaSistema");
    const usuario=document.getElementById("usuarioActivo");


    if(consola){

        consola.innerHTML=
        "Sistema ACDP iniciado correctamente.";

    }


    if(usuario){

        usuario.innerHTML=
        "Sesión: Administrador";

    }

}
