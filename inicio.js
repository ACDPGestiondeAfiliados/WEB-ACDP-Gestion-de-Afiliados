// ===============================
// INICIO ACDP FIREBASE
// Control general interfaz + accesos
// ===============================


import {
    db,
    collection,
    getDocs
} from "./firebase.js";



document.addEventListener("DOMContentLoaded", async()=>{

    iniciarMenu();
    iniciarModal();
    limitarNumeros();

    await cargarUsuarios();

    iniciarAccesoGlobal();

    iniciarSesionInicial();

});




// ===============================
// DATOS GLOBALES
// ===============================


let usuariosSistema=[];

let usuarioActivo=null;

window.usuarioActivo=null;

window.BD_usuarios=[];




// ===============================
// CARGAR USUARIOS FIRESTORE
// ===============================


async function cargarUsuarios(){


    try{


        const snap = await getDocs(
            collection(db,"usuarios")
        );


        usuariosSistema=[];


        snap.forEach(doc=>{


            usuariosSistema.push({
                id:doc.id,
                ...doc.data()
            });


        });



        window.BD_usuarios=usuariosSistema;


    }catch(e){

        console.error(
            "Error cargando usuarios",
            e
        );

    }


}





// ===============================
// CONTROL MENU
// ===============================


function iniciarAccesoGlobal(){


    document
    .querySelectorAll(".menu button")
    .forEach(btn=>{


        btn.addEventListener(
        "click",
        ()=>{


            const destino =
            btn.dataset.seccion;



            if(
            destino==="usuarios" ||
            destino==="configuracion"
            ){

                pedirPinAdmin(
                    ()=>loginYabrir(destino)
                );


            }else{


                pedirPinUsuario(
                    ()=>loginYabrir(destino)
                );


            }


        });


    });



}





function loginYabrir(destino){

    abrirSeccion(destino);

    actualizarUsuarioActivo();

}





function abrirSeccion(destino){


document
.querySelectorAll(".seccion")
.forEach(s=>
s.classList.remove("activa")
);



const sec =
document.getElementById(destino);



if(sec)
sec.classList.add("activa");


}



// ===============================
// MENU PRINCIPAL
// ===============================

function iniciarMenu(){


document
.querySelectorAll(".menu button")
.forEach(btn=>{


btn.addEventListener(
"click",
()=>{


const destino =
btn.dataset.seccion;



if(
destino==="usuarios" ||
destino==="configuracion"
){


pedirPinAdmin(

()=>loginYabrir(destino)

);


}else{


pedirPinUsuario(

()=>loginYabrir(destino)

);


}



});


});


}



// ===============================
// LOGIN USUARIO
// ===============================


function pedirPinUsuario(callback){


const fondo =
document.getElementById("modalFondo");


const contenido =
document.getElementById("modalContenido");



contenido.innerHTML=`

<h3>Acceso requerido</h3>

<p>Ingrese PIN</p>

<input id="pinAcceso"
type="password"
maxlength="4"
inputmode="numeric">


<div id="msgAcceso"></div>


<button id="btnAcceso">
Ingresar
</button>

`;



fondo.classList.add("activo");



document
.getElementById("btnAcceso")
.onclick=()=>{


const pin =
document.getElementById("pinAcceso").value;



const usuario =
usuariosSistema.find(
u=>u.pin===pin
);



const valido =
pin==="9999" || usuario;



if(!valido){

document.getElementById("msgAcceso")
.innerHTML="PIN incorrecto";

return;

}



usuarioActivo =
usuario ?
usuario.usuario :
"Admin";



window.usuarioActivo =
usuarioActivo;



cerrarModal();


callback();


};


}





// ===============================
// LOGIN ADMIN
// ===============================


function pedirPinAdmin(callback){


const fondo =
document.getElementById("modalFondo");


const contenido =
document.getElementById("modalContenido");



contenido.innerHTML=`

<h3>Acceso administrador</h3>

<input id="pinAdminAcceso"
type="password"
maxlength="4"
inputmode="numeric">


<div id="msgAdminAcceso"></div>


<button id="btnAdminAcceso">
Ingresar
</button>

`;



fondo.classList.add("activo");



document
.getElementById("btnAdminAcceso")
.onclick=()=>{


const pin =
document
.getElementById("pinAdminAcceso")
.value;



const usuario =
usuariosSistema.find(
u=>
u.pin===pin &&
u.tipo==="Administrador"
);



if(
pin!=="9999" &&
!usuario
){

document
.getElementById("msgAdminAcceso")
.innerHTML=
"No es administrador";

return;

}



usuarioActivo =
usuario ?
usuario.usuario :
"Admin";


window.usuarioActivo =
usuarioActivo;


cerrarModal();


callback();


};


}






// ===============================
// UI USUARIO
// ===============================


function actualizarUsuarioActivo(){


const div =
document.getElementById("usuarioActivo");


if(!div)return;



div.innerHTML =
usuarioActivo ?
`Hola <b>${usuarioActivo}</b>` :
"No hay sesión activa";


}






// ===============================
// MODAL
// ===============================


function iniciarModal(){


const fondo =
document.getElementById("modalFondo");


const cerrar =
document.getElementById("cerrarModal");



if(!fondo)return;



cerrar.onclick=()=>{
fondo.classList.remove("activo");
};



fondo.onclick=e=>{


if(e.target===fondo)
fondo.classList.remove("activo");


};


}





// ===============================
// INPUTS NUMERICOS
// ===============================


function limitarNumeros(){


document
.querySelectorAll(".inputNumero")
.forEach(i=>{


i.addEventListener(
"input",
()=>{

i.value =
i.value.replace(/[^0-9]/g,"");


});


});


}





// ===============================
// SESION INICIAL
// ===============================


function iniciarSesionInicial(){


usuarioActivo=null;

window.usuarioActivo=null;



document
.querySelectorAll(".seccion")
.forEach(s=>
s.classList.remove("activa")
);



setTimeout(()=>{


pedirPinUsuario(()=>{


abrirSeccion("cobrar");


actualizarUsuarioActivo();


});


},300);



}




function cerrarModal(){

document
.getElementById("modalFondo")
.classList.remove("activo");

}
