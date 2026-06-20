/* =====================================
   ACDP - AFILIADOS
===================================== */


let paginaAfiliados = 0;

const limiteAfiliados = 20;





document.addEventListener(
"DOMContentLoaded",
()=>{


    iniciarAfiliados();


});








function iniciarAfiliados(){



let filtro =
document.getElementById(
"filtroAfiliados"
);



if(filtro){


filtro.addEventListener(
"input",
filtrarAfiliados
);


}




document
.getElementById(
"btnNuevoAfiliado")
.onclick =
abrirNuevoAfiliado;



document
.getElementById(
"afiliadosAnterior")
.onclick =
()=>{

if(paginaAfiliados>0){

paginaAfiliados--;

cargarAfiliados();

}

};




document
.getElementById(
"afiliadosSiguiente")
.onclick =
()=>{


let max =
Math.ceil(
BD.afiliados.length /
limiteAfiliados
);



if(
paginaAfiliados+1 < max
){

paginaAfiliados++;

cargarAfiliados();

}



};






}









function cargarAfiliados(){



let tabla =
document
.querySelector(
"#tablaAfiliados tbody"
);



tabla.innerHTML="";





let lista =
[...BD.afiliados]
.sort((a,b)=>

Number(b.numero)
-
Number(a.numero)

);






let inicio =
paginaAfiliados *
limiteAfiliados;



let pagina =
lista.slice(
inicio,
inicio+limiteAfiliados
);







pagina.forEach(a=>{



let fila =
document.createElement(
"tr"
);





fila.innerHTML = `

<td>${a.numero}</td>

<td>${a.dni}</td>

<td>${a.nombre}</td>

<td>${a.apellido}</td>

<td>${a.celular}</td>

<td>${a.correo}</td>

<td>${a.estado}</td>

<td>${a.fecha}</td>

<td></td>

`;




let acciones =
fila.children[8];





acciones.appendChild(
crearBoton(
"Editar",
()=>editarAfiliado(a.numero)
)
);



acciones.appendChild(
crearBoton(
"Eliminar",
()=>eliminarAfiliado(a.numero)
)
);



acciones.appendChild(
crearBoton(
"Imprimir",
()=>imprimirCarnet(a.numero)
)
);




tabla.appendChild(fila);



});





document
.getElementById(
"paginaAfiliados")
.textContent =
paginaAfiliados+1;



}









function filtrarAfiliados(){



let valor =
limpiarNumero(
document
.getElementById(
"filtroAfiliados")
.value
);




if(valor.length!==8){


cargarAfiliados();

return;


}






let encontrado =
BD.afiliados.filter(a=>

a.dni===valor
||
a.numero===valor

);




mostrarResultadoAfiliados(
encontrado
);



}








function mostrarResultadoAfiliados(lista){



let tabla =
document
.querySelector(
"#tablaAfiliados tbody"
);



tabla.innerHTML="";




lista.forEach(a=>{


let fila =
document.createElement(
"tr"
);



fila.innerHTML = `

<td>${a.numero}</td>

<td>${a.dni}</td>

<td>${a.nombre}</td>

<td>${a.apellido}</td>

<td>${a.celular}</td>

<td>${a.correo}</td>

<td>${a.estado}</td>

<td>${a.fecha}</td>

<td></td>

`;



tabla.appendChild(fila);



});



}









function abrirNuevoAfiliado(){



abrirModal();



let caja =
document.getElementById(
"modalContenido"
);



caja.innerHTML="";




let titulo =
document.createElement("h2");

titulo.textContent =
"Agregar Afiliado";





let campos =
[
["DNI","dniNuevo"],
["Nombre","nombreNuevo"],
["Apellido","apellidoNuevo"],
["Celular","celularNuevo"],
["Correo","correoNuevo"]
];






caja.appendChild(titulo);





campos.forEach(c=>{


let input =
document.createElement(
"input"
);


input.placeholder =
c[0];


input.id =
c[1];



caja.appendChild(input);


});





let select =
document.createElement(
"select"
);



select.id =
"estadoNuevo";



select.innerHTML =
`

<option>
ACTIVO
</option>

<option>
ADHERENTE
</option>

`;




caja.appendChild(select);






let boton =
crearBoton(
"Aceptar",
guardarNuevoAfiliado
);



caja.appendChild(boton);




}









function guardarNuevoAfiliado(){



let dni =
document
.getElementById(
"dniNuevo")
.value;



let nombre =
document
.getElementById(
"nombreNuevo")
.value;



let apellido =
document
.getElementById(
"apellidoNuevo")
.value;



let celular =
document
.getElementById(
"celularNuevo")
.value;



let correo =
document
.getElementById(
"correoNuevo")
.value;



let estado =
document
.getElementById(
"estadoNuevo")
.value;






if(
!/^\d{8}$/.test(dni)
){


alert(
"DNI inválido"
);


return;


}






if(
!nombre ||
!apellido
){


alert(
"Complete todos los datos"
);


return;


}







let afiliado = {


numero:
generarNumeroAfiliado(),


dni,


nombre,


apellido,


celular,


correo,


estado,



fecha:
obtenerFecha()
+" "
+obtenerHora()



};






BD.afiliados.push(
afiliado
);





registrarHistorial({

usuario:usuarioActivo,

afiliado:
nombre+" "+apellido,

dni,

numero:
afiliado.numero,

accion:
"Alta afiliado"


});





guardarBD();



cerrarModal();



cargarAfiliados();



}









function editarAfiliado(numero){



let a =
BD.afiliados.find(x=>
x.numero===numero
);




abrirModal();



let caja =
document.getElementById(
"modalContenido"
);



caja.innerHTML = "";





let titulo =
document.createElement(
"h2"
);



titulo.textContent =
"Editar afiliado";



caja.appendChild(titulo);






["dni",
"nombre",
"apellido",
"celular",
"correo"
]
.forEach(c=>{


let input =
document.createElement(
"input"
);


input.id =
"edit_"+c;


input.value =
a[c];


caja.appendChild(input);



});




let boton =
crearBoton(
"Guardar",
()=>guardarEdicionAfiliado(a)
);



caja.appendChild(boton);



}









function guardarEdicionAfiliado(a){



a.dni =
document.getElementById(
"edit_dni")
.value;


a.nombre =
document.getElementById(
"edit_nombre")
.value;


a.apellido =
document.getElementById(
"edit_apellido")
.value;


a.celular =
document.getElementById(
"edit_celular")
.value;


a.correo =
document.getElementById(
"edit_correo")
.value;






registrarHistorial({

usuario:usuarioActivo,

numero:a.numero,

accion:
"Afiliado editado"

});





guardarBD();


cerrarModal();


cargarAfiliados();



}









function eliminarAfiliado(numero){



let a =
BD.afiliados.find(x=>
x.numero===numero
);




let motivo =
prompt(
"Motivo de eliminación"
);



if(motivo===null)
return;






BD.afiliados =
BD.afiliados.filter(x=>
x.numero!==numero
);





registrarHistorial({

usuario:usuarioActivo,

afiliado:
a.nombre+" "+a.apellido,

numero,

accion:
"Afiliado eliminado",

detalles:
motivo || "SIN MOTIVOS"


});





guardarBD();


cargarAfiliados();



}









function crearBoton(texto,funcion){



let b =
document.createElement(
"button"
);



b.textContent =
texto;


b.onclick =
funcion;



return b;



}
