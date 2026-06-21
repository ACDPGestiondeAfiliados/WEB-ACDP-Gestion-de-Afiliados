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


window.BD_usuarios.push({

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



if(nuevo){

nuevo.onclick =
abrirNuevoUsuario;

}


}









// ===============================
// TABLA
// ===============================


function cargarUsuarios(){


const cuerpo =
document
.getElementById("tablaUsuarios")
?.querySelector("tbody");



if(!cuerpo)return;



cuerpo.innerHTML="";



(window.BD_usuarios||[])
.forEach((u,index)=>{


cuerpo.innerHTML+=`


<tr>

<td>${u.usuario}</td>

<td>${u.tipo}</td>


<td>


<img src="edit.png"
class="iconoHistorial"
onclick="abrirEditarUsuario(${index})">


<img src="delete.png"
class="iconoHistorial"
onclick="eliminarUsuario(${index})">


</td>

</tr>


`;

});


}









// ===============================
// NUEVO USUARIO
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


<button id="btnGuardarUsuario" disabled>

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



if(!usuario||!pin||!pin2||!boton)
return;




function validar(){


const lista =
window.BD_usuarios || [];



const existe =
lista.some(
u=>

String(u.usuario)
.toLowerCase()
===
usuario.value.trim()
.toLowerCase()

);



if(existe){

msg.textContent="Usuario ya existe";


}else if(
pin.value &&
pin2.value &&
pin.value!==pin2.value
){

msg.textContent="PIN no coincide";


}else{

msg.textContent="";

}



boton.disabled =
!(

usuario.value.trim().length>=4 &&

pin.value.length===4 &&

pin2.value.length===4 &&

pin.value===pin2.value &&

!existe

);



}




usuario.addEventListener(
"input",
()=>{


usuario.value =
usuario.value
.replace(
/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
""
)
.slice(0,20);


validar();


});





pin.addEventListener(
"input",
()=>{


pin.value =
pin.value
.replace(/\D/g,"")
.slice(0,4);


validar();


});





pin2.addEventListener(
"input",
()=>{


pin2.value =
pin2.value
.replace(/\D/g,"")
.slice(0,4);


validar();


});





boton.onclick =
async function(){

await guardarUsuario();

};



validar();


}









// ===============================
// GUARDAR
// ===============================


async function guardarUsuario(){


const boton =
document.getElementById(
"btnGuardarUsuario"
);



if(!boton || boton.disabled)
return;




const usuario =
document
.getElementById("usuarioNuevo")
.value.trim();


const pin =
document
.getElementById("pinNuevo")
.value.trim();


const confirmar =
document
.getElementById("pinConfirmar")
.value.trim();


const tipo =
document
.getElementById("tipoNuevo")
.value;





if(
usuario.length<4 ||
pin.length!==4 ||
pin!==confirmar
){

return;

}





const existe =
(window.BD_usuarios||[])
.some(

u=>

String(u.usuario)
.toLowerCase()
===
usuario.toLowerCase()

);



if(existe)
return;





try{


const ref =
await addDoc(

collection(db,"usuarios"),

{

usuario:usuario,

pin:pin,

tipo:tipo

}

);




window.BD_usuarios.push({

id:ref.id,

usuario:usuario,

pin:pin,

tipo:tipo

});





cargarUsuarios();


cerrarModal();



}catch(e){


console.error(
"ERROR CREANDO USUARIO",
e
);


alert(
"No se pudo guardar usuario"
);


}


}









// ===============================
// ELIMINAR
// ===============================


async function eliminarUsuario(index){


const u =
(window.BD_usuarios||[])[index];



if(!u)return;



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



window.BD_usuarios.splice(index,1);



cargarUsuarios();


}









// ===============================
// EDITAR
// ===============================


function abrirEditarUsuario(index){


const u =
(window.BD_usuarios||[])[index];


if(!u)return;



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
.onclick =
async()=>{


await updateDoc(

doc(
db,
"usuarios",
u.id
),

{

usuario:
document.getElementById("editUsuario").value,

pin:
document.getElementById("editPin").value,

tipo:
document.getElementById("editTipo").value

}

);



await cargarUsuariosFirebase();


cerrarModal();


};


}









function cerrarModal(){


document
.getElementById("modalFondo")
.classList.remove("activo");


}







window.abrirNuevoUsuario =
abrirNuevoUsuario;


window.abrirEditarUsuario =
abrirEditarUsuario;


window.eliminarUsuario =
eliminarUsuario;


window.guardarUsuario =
guardarUsuario;
