// ===============================
// USUARIOS ACDP
// Gestión de cuentas y permisos
// ===============================


document.addEventListener("DOMContentLoaded",()=>{

    iniciarUsuarios();

});


// Inicializa módulo

function iniciarUsuarios(){

    cargarUsuarios();

    eventosUsuarios();

}



// Eventos principales

function eventosUsuarios(){

    const nuevo=document.getElementById("btnNuevoUsuario");


    if(nuevo){

        nuevo.addEventListener("click",()=>{

            abrirNuevoUsuario();

        });

    }

}



// Carga tabla usuarios

function cargarUsuarios(){

    const cuerpo=document
    .getElementById("tablaUsuarios")
    .querySelector("tbody");


    cuerpo.innerHTML="";


    BD.usuarios.forEach((u,index)=>{


        cuerpo.innerHTML+=`

        <tr>

            <td>${u.usuario}</td>

            <td>${u.tipo}</td>

            <td>

                <button onclick="eliminarUsuario(${index})">
                Eliminar
                </button>

            </td>

        </tr>

        `;

    });

}



// Modal nuevo usuario

function abrirNuevoUsuario(){

    const fondo=document.getElementById("modalFondo");
    const contenido=document.getElementById("modalContenido");


    contenido.innerHTML=`

    <h3>Nuevo usuario</h3>

    <input id="usuarioNuevo" placeholder="Usuario">

    <input id="pinNuevo" 
    placeholder="PIN"
    maxlength="4">

    <select id="tipoNuevo">

        <option value="Operador">
        Operador
        </option>

        <option value="Administrador">
        Administrador
        </option>

    </select>


    <button onclick="guardarUsuario()">

        Guardar

    </button>

    `;


    fondo.classList.add("activo");

}



// Guarda usuario

function guardarUsuario(){

    const usuario=
    document.getElementById("usuarioNuevo").value.trim();


    const pin=
    document.getElementById("pinNuevo").value.trim();


    const tipo=
    document.getElementById("tipoNuevo").value;



    if(!usuario || !pin){

        return;

    }



    BD.usuarios.push({

        usuario,
        pin,
        tipo

    });



    guardarBD();


    cerrarModal();


    cargarUsuarios();


    escribirConsola(
        "Usuario creado: "+usuario
    );

}



// Elimina usuario

function eliminarUsuario(index){

    const usuario=BD.usuarios[index];


    // El administrador principal no puede eliminarse

    if(usuario.usuario==="Admin"){

        alert(
            "El usuario Admin no puede eliminarse"
        );

        return;

    }


    BD.usuarios.splice(index,1);


    guardarBD();


    cargarUsuarios();


    escribirConsola(
        "Usuario eliminado"
    );

}



// Cierre modal compartido

function cerrarModal(){

    document
    .getElementById("modalFondo")
    .classList.remove("activo");

}
