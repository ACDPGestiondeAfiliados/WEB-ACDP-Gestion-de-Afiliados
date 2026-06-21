// ===============================
// USUARIOS ACDP FIREBASE
// Gestión de cuentas y permisos
// FIREBASE MODULAR
// ===============================


import {
db,
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc
} from "./firebase.js";



let usuarios = [];


let modalContenido = null;
let modalFondo = null;





// ===============================
// INICIO
// ===============================


function iniciarModuloUsuarios(){


modalContenido =
document.getElementById("modalContenido");


modalFondo =
document.getElementById("modalFondo");



iniciarUsuarios();


}



if(document.readyState==="loading"){

document.addEventListener(
"DOMContentLoaded",
iniciarModuloUsuarios
);

}else{

iniciarModuloUsuarios();

}







async function iniciarUsuarios(){


await cargarUsuarios();


eventosUsuarios();


}









// ===============================
// CARGAR FIREBASE
// ===============================


async function cargarUsuarios(){


const snap =
await getDocs(
collection(db,"usuarios")
);



usuarios=[];



snap.forEach(d=>{


usuarios.push({

id:d.id,

...d.data()

});


});



window.BD_usuarios = usuarios;



renderUsuarios();


}









// ===============================
// EVENTOS
// ===============================


function eventosUsuarios(){


const boton =
document.getElementById(
"btnNuevoUsuario"
);



if(!boton){

console.error(
"No existe btnNuevoUsuario"
);

return;

}



boton.onclick =
abrirNuevoUsuario;



}









// ===============================
// TABLA
// ===============================


function renderUsuarios(){


const cuerpo =
document
.getElementById("tablaUsuarios")
.querySelector("tbody");



if(!cuerpo)return;



cuerpo.innerHTML="";



usuarios.forEach((u,index)=>{


cuerpo.innerHTML+=`


<tr>


<td>${u.usuario}</td>


<td>${u.tipo}</td>



<td>



<img
src="edit.png"
class="iconoHistorial"
onclick="abrirEditarUsuario(${index})"
>



<img
src="delete.png"
class="iconoHistorial"
onclick="eliminarUsuario(${index})"
>



</td>


</tr>


`;



});


}









// ===============================
// NUEVO USUARIO
// ===============================


function abrirNuevoUsuario(){



modalContenido.innerHTML = `


<h3>Nuevo usuario</h3>


<input
id="usuarioNuevo"
placeholder="Usuario"
maxlength="20"
>



<input
id="pinNuevo"
type="password"
maxlength="4"
inputmode="numeric"
placeholder="PIN"
>



<input
id="pinConfirmar"
type="password"
maxlength="4"
inputmode="numeric"
placeholder="Confirmar PIN"
>



<div id="msgPin"></div>



<select id="tipoNuevo">


<option value="Normal">
Normal
</option>


<option value="Administrador">
Administrador
</option>


</select>



<button id="btnGuardarUsuario" disabled>

Guardar

</button>


`;



modalFondo.classList.add("activo");



validarUsuarioNuevo();


}









function validarUsuarioNuevo(){


const usuarioInput =
document.getElementById("usuarioNuevo");


const pinInput =
document.getElementById("pinNuevo");


const confirmarInput =
document.getElementById("pinConfirmar");


const boton =
document.getElementById("btnGuardarUsuario");


const mensaje =
document.getElementById("msgPin");





function validar(){



const usuario =
usuarioInput.value.trim();


const pin =
pinInput.value;


const pin2 =
confirmarInput.value;



const existe =
usuarios.some(u=>

u.usuario.toLowerCase()
===
usuario.toLowerCase()

);




if(existe){

mensaje.textContent =
"Usuario ya existe";


}else if(
pin &&
pin2 &&
pin!==pin2
){

mensaje.textContent =
"PIN no coincide";


}else{

mensaje.textContent="";

}




boton.disabled =
!(

usuario.length>=4 &&

pin.length===4 &&

pin===pin2 &&

!existe

);



}





usuarioInput.oninput=()=>{


usuarioInput.value =
usuarioInput.value
.replace(
/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
""
)
.slice(0,20);



validar();


};





pinInput.oninput=()=>{


pinInput.value =
pinInput.value
.replace(/\D/g,"")
.slice(0,4);



validar();


};





confirmarInput.oninput=()=>{


confirmarInput.value =
confirmarInput.value
.replace(/\D/g,"")
.slice(0,4);



validar();


};





boton.onclick =
guardarUsuario;



}









// ===============================
// CREAR
// ===============================


async function guardarUsuario(){


const usuario =
document.getElementById("usuarioNuevo")
.value.trim();



const pin =
document.getElementById("pinNuevo")
.value.trim();



const tipo =
document.getElementById("tipoNuevo")
.value;





const existe =
usuarios.some(u=>

u.usuario.toLowerCase()
===
usuario.toLowerCase()

);



if(existe)return;



const ref =
await addDoc(
collection(db,"usuarios"),
{

usuario,

pin,

tipo

}

);





usuarios.push({

id:ref.id,

usuario,

pin,

tipo

});




window.BD_usuarios =
usuarios;



cerrarModal();



renderUsuarios();



}









// ===============================
// ELIMINAR
// ===============================


async function eliminarUsuario(index){



const u =
usuarios[index];



if(u.usuario==="Admin"){

alert(
"El usuario Admin no puede eliminarse"
);

return;

}



await deleteDoc(
doc(
db,
"usuarios",
u.id
)
);




usuarios.splice(index,1);



window.BD_usuarios =
usuarios;



renderUsuarios();



}









// ===============================
// EDITAR
// ===============================


function abrirEditarUsuario(index){



const u =
usuarios[index];




modalContenido.innerHTML = `


<h3>Editar usuario</h3>



<input
id="editUsuario"
value="${u.usuario}"
maxlength="20"
>



<input
id="editPin"
type="password"
value="${u.pin}"
maxlength="4"
>



<select id="editTipo">


<option value="Normal"
${u.tipo==="Normal"?"selected":""}
>

Normal

</option>



<option value="Administrador"
${u.tipo==="Administrador"?"selected":""}
>

Administrador

</option>


</select>



<div id="msgEdit"></div>



<button id="btnGuardarEdit">

Guardar cambios

</button>


`;




modalFondo.classList.add("activo");





document
.getElementById("btnGuardarEdit")
.onclick =
async()=>{



const nuevoUsuario =
document
.getElementById("editUsuario")
.value.trim();



const nuevoPin =
document
.getElementById("editPin")
.value.trim();



const nuevoTipo =
document
.getElementById("editTipo")
.value;





const existe =
usuarios.some((x,i)=>

i!==index &&

x.usuario.toLowerCase()
===
nuevoUsuario.toLowerCase()

);




if(existe){

document
.getElementById("msgEdit")
.textContent =
"Usuario ya existe";


return;

}





await updateDoc(

doc(
db,
"usuarios",
u.id
),

{

usuario:nuevoUsuario,

pin:nuevoPin,

tipo:nuevoTipo

}

);





usuarios[index]={

...u,

usuario:nuevoUsuario,

pin:nuevoPin,

tipo:nuevoTipo

};




window.BD_usuarios =
usuarios;



cerrarModal();


renderUsuarios();



};



}









// ===============================
// MODAL
// ===============================


function cerrarModal(){


if(modalFondo)

modalFondo.classList.remove("activo");


}









// ===============================
// EXPORTAR PARA HTML
// ===============================


window.abrirNuevoUsuario =
abrirNuevoUsuario;


window.abrirEditarUsuario =
abrirEditarUsuario;


window.eliminarUsuario =
eliminarUsuario;
