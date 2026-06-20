// =====================================
// ACDP - USUARIOS
// =====================================



let usuarioEditando = null;




function cargarUsuarios(){



let contenedor =
document.getElementById(
"contenidoUsuarios"
);



let html = `



<h2>

Usuarios

</h2>



<p class="centrado">

Cree, edite o elimine usuarios.
Solo los administradores pueden realizar estas acciones.

</p>





<button onclick="modalNuevoUsuario()">

Agregar usuario nuevo

</button>




<br><br>





<table>


<thead>


<tr>

<th>

Usuario

</th>


<th>

Tipo

</th>


<th>

Acción

</th>


</tr>


</thead>



<tbody>

`;





BD.usuarios.forEach(u=>{


html += `



<tr>


<td>

${u.usuario}

</td>



<td>

${u.tipo}

</td>



<td>



<button onclick="editarUsuario('${u.usuario}')">

Editar

</button>



<button onclick="eliminarUsuario('${u.usuario}')">

Eliminar

</button>



</td>



</tr>



`;



});






html += `


</tbody>


</table>


`;





contenedor.innerHTML =
html;



}









function modalNuevoUsuario(){



abrirModal(`


<h2>

Agregar usuario nuevo

</h2>




<input

id="nuevoUsuario"

placeholder="Nombre"

>


<br><br>




<select id="nuevoTipo">


<option>

Normal

</option>


<option>

Administrador

</option>


</select>



<br><br>




<input

id="nuevoPin"

type="password"

maxlength="4"

placeholder="PIN"


>



<br><br>



<input

id="nuevoPin2"

type="password"

maxlength="4"

placeholder="REINGRESE PIN"


>



<br><br>




<button onclick="crearUsuario()">

Aceptar

</button>



<button onclick="cerrarModal()">

Cancelar

</button>




`);




}









function crearUsuario(){



let nombre =
document.getElementById(
"nuevoUsuario"
).value;



let tipo =
document.getElementById(
"nuevoTipo"
).value;



let pin =
document.getElementById(
"nuevoPin"
).value;



let pin2 =
document.getElementById(
"nuevoPin2"
).value;





if(
!nombre ||
!pin ||
!pin2
){


alert(
"Por favor complete todos los datos"
);


return;


}







if(pin!==pin2){


alert(
"Los PIN no coinciden"
);


return;


}








BD.usuarios.push({


usuario:nombre,

tipo,

pin



});




registrarHistorial({


usuario:usuarioActivo,

accion:
"Usuario creado",


detalles:
"Usuario: "+nombre


});





guardarBD();


cerrarModal();


cargarUsuarios();



}









function verificarAdministrador(callback){



abrirModal(`


<h2>

Autorización

</h2>



<input

id="pinAdmin"

type="password"

maxlength="4"

placeholder="PIN administrador"


>



<br><br>



<button onclick="validarAdministrador()">

Aceptar

</button>


<button onclick="cerrarModal()">

Cancelar

</button>


`);




window.funcionPendiente =
callback;




}









function validarAdministrador(){



let pin =
document.getElementById(
"pinAdmin"
).value;





let correcto =
(pin==="9999")
||
BD.usuarios.some(u=>

u.tipo==="Administrador"
&&
u.pin===pin


);





if(!correcto){


alert(
"PIN incorrecto"
);


return;


}





cerrarModal();





if(window.funcionPendiente){


window.funcionPendiente();


}



}









function editarUsuario(nombre){



verificarAdministrador(()=>{



let usuario =
BD.usuarios.find(u=>

u.usuario===nombre

);




usuarioEditando =
usuario;






abrirModal(`


<h2>

Editar usuario

</h2>



<input

id="editarNombre"

value="${usuario.usuario}"

>


<br><br>



<select id="editarTipo">


<option>

Normal

</option>


<option>

Administrador

</option>


</select>



<br><br>




<input

id="editarPin"

maxlength="4"

type="password"

placeholder="Nuevo PIN"



>



<br><br>



<button onclick="guardarEdicionUsuario()">

Aceptar

</button>



<button onclick="cerrarModal()">

Cancelar

</button>



`);



});



}









function guardarEdicionUsuario(){



let nombre =
document.getElementById(
"editarNombre"
).value;



let tipo =
document.getElementById(
"editarTipo"
).value;



let pin =
document.getElementById(
"editarPin"
).value;





usuarioEditando.usuario =
nombre;


usuarioEditando.tipo =
tipo;



if(pin){

usuarioEditando.pin =
pin;

}





registrarHistorial({


usuario:usuarioActivo,

accion:
"Usuario editado",


detalles:
nombre


});




guardarBD();


cerrarModal();


cargarUsuarios();


}









function eliminarUsuario(nombre){



verificarAdministrador(()=>{



if(nombre==="Admin"){


alert(
"No se puede eliminar Admin"
);


return;


}






BD.usuarios =
BD.usuarios.filter(u=>

u.usuario!==nombre

);




registrarHistorial({

usuario:usuarioActivo,

accion:
"Usuario eliminado",


detalles:
nombre


});




guardarBD();



cargarUsuarios();



});



}
