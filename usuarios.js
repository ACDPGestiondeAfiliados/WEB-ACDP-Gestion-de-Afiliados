/* =====================================
   ACDP - USUARIOS
===================================== */


let usuarioEditando = null;




document.addEventListener(
"DOMContentLoaded",
()=>{


iniciarUsuarios();


});








function iniciarUsuarios(){



document
.getElementById(
"btnNuevoUsuario")
.onclick =
abrirNuevoUsuario;



}









function cargarUsuarios(){



let tabla =
document
.querySelector(
"#tablaUsuarios tbody"
);



tabla.innerHTML="";






BD.usuarios.forEach(u=>{



let fila =
document.createElement(
"tr"
);



fila.innerHTML =
`

<td>${u.usuario}</td>

<td>${u.tipo}</td>

<td></td>

`;





let acciones =
fila.children[2];





acciones.appendChild(
crearBoton(
"Editar",
()=>editarUsuario(u.usuario)
)
);




if(
u.usuario!=="Admin"
){



acciones.appendChild(
crearBoton(
"Eliminar",
()=>eliminarUsuario(u.usuario)
)
);


}






tabla.appendChild(
fila
);



});



}









function abrirNuevoUsuario(){



abrirModal();



let caja =
document.getElementById(
"modalContenido"
);



caja.innerHTML="";





crearInputModal(
caja,
"Nombre",
"nuevoUsuario"
);



crearInputModal(
caja,
"PIN",
"nuevoPin",
true
);



crearInputModal(
caja,
"Reingrese PIN",
"nuevoPin2",
true
);





let select =
document.createElement(
"select"
);



select.id =
"nuevoTipo";



select.innerHTML =
`

<option>
Normal
</option>


<option>
Administrador
</option>


`;




caja.appendChild(
select
);





caja.appendChild(
crearBoton(
"Aceptar",
guardarNuevoUsuario
)
);





}









function guardarNuevoUsuario(){



let nombre =
document
.getElementById(
"nuevoUsuario")
.value;



let pin =
document
.getElementById(
"nuevoPin")
.value;



let pin2 =
document
.getElementById(
"nuevoPin2")
.value;



let tipo =
document
.getElementById(
"nuevoTipo")
.value;








if(
!nombre ||
!pin ||
!pin2
){


alert(
"Complete todos los datos"
);


return;

}



if(
!/^\d{4}$/.test(pin)
){


alert(
"PIN inválido"
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

usuario:
usuarioActivo,


accion:
"Usuario creado",


detalles:
nombre


});






guardarBD();


cerrarModal();


cargarUsuarios();



}









function editarUsuario(nombre){



autorizarAdmin(()=>{



usuarioEditando =
BD.usuarios.find(u=>

u.usuario===nombre

);






abrirModal();



let caja =
document.getElementById(
"modalContenido"
);



caja.innerHTML="";






crearInputModal(
caja,
"Nombre",
"editarUsuario"
);



document
.getElementById(
"editarUsuario")
.value =
usuarioEditando.usuario;







let select =
document.createElement(
"select"
);



select.id =
"editarTipo";



select.innerHTML =
`

<option>
Normal
</option>

<option>
Administrador
</option>

`;



select.value =
usuarioEditando.tipo;



caja.appendChild(
select
);





crearInputModal(
caja,
"Nuevo PIN",
"editarPin",
true
);







caja.appendChild(
crearBoton(
"Guardar",
guardarEdicionUsuario
)
);





});



}









function guardarEdicionUsuario(){



usuarioEditando.usuario =
document
.getElementById(
"editarUsuario")
.value;



usuarioEditando.tipo =
document
.getElementById(
"editarTipo")
.value;



let pin =
document
.getElementById(
"editarPin")
.value;






if(pin){



if(
!/^\d{4}$/.test(pin)
){


alert(
"PIN inválido"
);


return;


}


usuarioEditando.pin =
pin;



}






registrarHistorial({

usuario:
usuarioActivo,

accion:
"Usuario editado",

detalles:
usuarioEditando.usuario

});





guardarBD();


cerrarModal();


cargarUsuarios();



}









function eliminarUsuario(nombre){



autorizarAdmin(()=>{



if(
nombre==="Admin"
)
return;





BD.usuarios =
BD.usuarios.filter(u=>

u.usuario!==nombre

);






registrarHistorial({

usuario:
usuarioActivo,


accion:
"Usuario eliminado",


detalles:
nombre


});





guardarBD();


cargarUsuarios();



});



}









function autorizarAdmin(funcion){



let pin =
prompt(
"Ingrese PIN administrador"
);





if(
pin==="9999"
||
BD.usuarios.some(u=>

u.tipo==="Administrador"
&&
u.pin===pin

)
){



funcion();



}

else{


alert(
"PIN incorrecto"
);



}



}









function crearInputModal(
caja,
texto,
id,
password=false
){



let input =
document.createElement(
"input"
);



input.id=id;

input.placeholder=texto;



if(password)
input.type="password";



caja.appendChild(
input
);



}
