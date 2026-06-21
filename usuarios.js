// ===============================
// USUARIOS ACDP FIREBASE MODULAR
// Mantiene estructura original ACDP
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



// ===============================
// INICIO
// ===============================


function iniciarModuloUsuarios(){

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


eventosUsuarios();


await cargarUsuariosFirebase();


}






// ===============================
// CARGAR FIREBASE
// ===============================


async function cargarUsuariosFirebase(){


const snap =
await getDocs(
collection(db,"usuarios")
);



window.BD_usuarios=[];



snap.forEach(d=>{


BD_usuarios.push({

id:d.id,

...d.data()

});


});



cargarUsuarios();


}









// ===============================
// EVENTOS
// ===============================


function eventosUsuarios(){


const nuevo =
document.getElementById(
"btnNuevoUsuario"
);



if(nuevo)

nuevo.onclick =
abrirNuevoUsuario;


}









// ===============================
// TABLA
// ===============================


function cargarUsuarios(){


const cuerpo =
document
.getElementById("tablaUsuarios")
.querySelector("tbody");



if(!cuerpo)return;



cuerpo.innerHTML="";



BD_usuarios.forEach((u,index)=>{


cuerpo.innerHTML+=`


<tr>

<td>${u.usuario}</td>

<td>${u.tipo}</td>


<td>


<img
src="edit.png"
class="iconoHistorial"
onclick="abrirEditarUsuario(${index})">


<img
src="delete.png"
class="iconoHistorial"
onclick="eliminarUsuario(${index})">


</td>


</tr>


`;


});


}









// ===============================
// CREAR
// ===============================


function abrirNuevoUsuario(){


const fondo =
document.getElementById("modalFondo");


const contenido =
document.getElementById("modalContenido");



contenido.innerHTML=`

<h3>Nuevo usuario</h3>


<input id="usuarioNuevo"
placeholder="Usuario"
maxlength="20">


<input id="pinNuevo"
type="password"
maxlength="4"
inputmode="numeric"
placeholder="PIN">


<input id="pinConfirmar"
type="password"
maxlength="4"
inputmode="numeric"
placeholder="Confirmar PIN">


<div id="msgPin"></div>


<select id="tipoNuevo">


<option value="Normal">
Normal
</option>


<option value="Administrador">
Administrador
</option>


</select>


<button id="btnGuardarUsuario">

Guardar

</button>


`;



fondo.classList.add("activo");


validarNuevo();


}









function validarNuevo(){


const usuario =
document.getElementById("usuarioNuevo");


const pin =
document.getElementById("pinNuevo");


const pin2 =
document.getElementById("pinConfirmar");


const boton =
document.getElementById("btnGuardarUsuario");


const msg =
document.getElementById("msgPin");




function validar(){


const lista =
window.BD_usuarios || [];



const existe =
lista.some(

u=>

u.usuario.toLowerCase()
===
usuario.value.toLowerCase()

);



if(existe){

msg.textContent =
"Usuario ya existe";


}else if(
pin.value &&
pin2.value &&
pin.value!==pin2.value
){

msg.textContent =
"PIN no coincide";


}else{

msg.textContent="";

}



}



usuario.oninput=()=>{


usuario.value =
usuario.value
.replace(
/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
""
)
.slice(0,20);



validar();


};





pin.oninput=()=>{


pin.value =
pin.value
.replace(/\D/g,"")
.slice(0,4);



validar();


};





pin2.oninput=()=>{


pin2.value =
pin2.value
.replace(/\D/g,"")
.slice(0,4);



validar();


};





boton.onclick =
async()=>{


const nombre =
usuario.value.trim();


const clave =
pin.value.trim();


const confirmar =
pin2.value.trim();


const tipo =
document.getElementById("tipoNuevo")
.value;



if(
nombre.length < 4 ||
clave.length !== 4 ||
clave !== confirmar
){

msg.textContent =
"Datos inválidos";

return;

}




const existe =
(window.BD_usuarios || [])
.some(

u=>

u.usuario.toLowerCase()
===
nombre.toLowerCase()

);



if(existe){

msg.textContent =
"Usuario ya existe";

return;

}





try{


const ref =
await addDoc(

collection(db,"usuarios"),

{

usuario:nombre,

pin:clave,

tipo:tipo

}

);




window.BD_usuarios.push({

id:ref.id,

usuario:nombre,

pin:clave,

tipo:tipo

});



cerrarModal();


cargarUsuarios();



if(typeof escribirConsola==="function")

escribirConsola(
"Usuario creado: "+nombre
);



}catch(error){


console.error(
"ERROR CREANDO USUARIO",
error
);


alert(
"Error guardando usuario"
);


}


};



validar();


}

// ===============================
// ELIMINAR
// ===============================


async function eliminarUsuario(index){


const u =
BD_usuarios[index];



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



BD_usuarios.splice(index,1);



cargarUsuarios();


}









// ===============================
// EDITAR
// ===============================


function abrirEditarUsuario(index){


const u =
BD_usuarios[index];



const fondo =
document.getElementById("modalFondo");


const contenido =
document.getElementById("modalContenido");



contenido.innerHTML=`


<h3>Editar usuario</h3>


<input id="editUsuario"
value="${u.usuario}"
maxlength="20">


<input id="editPin"
value="${u.pin}"
maxlength="4">


<select id="editTipo">


<option value="Normal">

Normal

</option>


<option value="Administrador">

Administrador

</option>


</select>



<button id="btnGuardarEdit">

Guardar cambios

</button>


`;



fondo.classList.add("activo");



document
.getElementById("btnGuardarEdit")
.onclick=
async()=>{


await updateDoc(

doc(
db,
"usuarios",
u.id
),

{

usuario:
editUsuario.value,

pin:
editPin.value,

tipo:
editTipo.value

}

);



cargarUsuariosFirebase();

cerrarModal();


};


}









function cerrarModal(){


document
.getElementById("modalFondo")
.classList.remove("activo");


}







window.abrirEditarUsuario =
abrirEditarUsuario;


window.eliminarUsuario =
eliminarUsuario;
