// ===============================
// GESTIÓN AFILIADOS ACDP FIREBASE
// ===============================


import {

db,
collection,
doc,
addDoc,
updateDoc,
deleteDoc,
getDocs

} from "./firebase.js";



let paginaActual=1;
const cantidadPagina=10;

let listaAfiliados=[];



document.addEventListener("DOMContentLoaded",()=>{

    iniciarAfiliados();

});





async function iniciarAfiliados(){

    await cargarAfiliados();

    eventosAfiliados();

}






async function cargarAfiliados(){


const snap =
await getDocs(
collection(db,"afiliados")
);



window.BD_afiliados=[];



snap.forEach(d=>{

window.BD_afiliados.push({

id:d.id,

...d.data()

});


});



listaAfiliados =
[...window.BD_afiliados].reverse();



mostrarTabla();


}







function eventosAfiliados(){


const filtro=document.getElementById("filtroAfiliados");

const nuevo=document.getElementById("btnNuevoAfiliado");

const anterior=document.getElementById("afiliadosAnterior");

const siguiente=document.getElementById("afiliadosSiguiente");



if(filtro)

filtro.addEventListener("input",()=>{

filtrarAfiliados(filtro.value);

});



if(nuevo)

nuevo.onclick=abrirNuevoAfiliado;



if(anterior)

anterior.onclick=()=>{

if(paginaActual>1){

paginaActual--;

mostrarTabla();

}

};





if(siguiente)

siguiente.onclick=()=>{


const total=Math.ceil(
listaAfiliados.length/cantidadPagina
);



if(paginaActual<total){

paginaActual++;

mostrarTabla();

}


};


}







function filtrarAfiliados(valor){


valor=valor.trim();



listaAfiliados =
valor ?

buscarAfiliado(valor)

:

window.BD_afiliados;



paginaActual=1;

mostrarTabla();


}







function buscarAfiliado(valor){


return window.BD_afiliados.filter(a=>

String(a.dni)===valor ||

String(a.numero)===valor

);


}







function mostrarTabla(){


const tabla=
document
.getElementById("tablaAfiliados")
.querySelector("tbody");



tabla.innerHTML="";



const inicio =
(paginaActual-1)*cantidadPagina;



listaAfiliados
.slice(inicio,inicio+cantidadPagina)
.forEach(a=>{



tabla.innerHTML+=`


<tr>


<td>${a.numero||""}</td>

<td>${a.dni||""}</td>

<td>${a.nombre||""}</td>

<td>${a.apellido||""}</td>

<td>${a.celular||""}</td>

<td>${a.correo||""}</td>

<td>${a.estado||"Activo"}</td>

<td>${a.fecha||""}</td>



<td>


<img src="edit.png"
class="iconoHistorial"
onclick="editarAfiliado('${a.id}')">


<img src="delete.png"
class="iconoHistorial"
onclick="eliminarAfiliado('${a.id}')">


<img src="print.png"
class="iconoHistorial"
onclick="imprimirAfiliado('${a.id}')">


</td>


</tr>


`;



});



document.getElementById("paginaAfiliados")
.textContent=paginaActual;


}









function abrirNuevoAfiliado(){


modalContenido.innerHTML=`


<h3>Nuevo afiliado</h3>


<input id="nuevoDni" placeholder="DNI" maxlength="8">

<input id="nuevoNombre" placeholder="Nombre" maxlength="20">

<input id="nuevoApellido" placeholder="Apellido" maxlength="20">

<input id="nuevoCelular" placeholder="Celular" maxlength="10">

<input id="nuevoCorreo" placeholder="Correo" maxlength="30">


<select id="nuevoEstado">

<option>Activo</option>

<option>Adherente</option>

</select>


<button onclick="guardarNuevoAfiliado()">

Guardar

</button>


`;



modalFondo.classList.add("activo");


aplicarValidaciones(

["nuevoDni","nuevoCelular"],

["nuevoNombre","nuevoApellido"]

);


}







async function guardarNuevoAfiliado(){


const ultimo =
window.BD_afiliados.reduce(

(m,a)=>
Math.max(m,Number(a.numero)||0),

0

);



const nuevo={


dni:nuevoDni.value,

numero:
String(ultimo+1).padStart(8,"0"),

nombre:nuevoNombre.value,

apellido:nuevoApellido.value,

celular:nuevoCelular.value,

correo:nuevoCorreo.value,

estado:nuevoEstado.value,

fecha:new Date().toLocaleDateString()


};




const ref =
await addDoc(

collection(db,"afiliados"),

nuevo

);



nuevo.id=ref.id;



window.BD_afiliados.push(nuevo);



cerrarModal();

await cargarAfiliados();




if(typeof registrarHistorial==="function")

registrarHistorial(
"ALTA",
nuevo,
"Alta afiliado"
);


}







function editarAfiliado(id){


const a =
window.BD_afiliados.find(x=>x.id===id);


if(!a)return;



modalContenido.innerHTML=`


<h3>Editar afiliado</h3>


<input id="editarDni" value="${a.dni}">

<input id="editarNombre" value="${a.nombre}">

<input id="editarApellido" value="${a.apellido}">

<input id="editarCelular" value="${a.celular||""}">

<input id="editarCorreo" value="${a.correo||""}">


<select id="editarEstado">

<option>Activo</option>

<option>Adherente</option>

</select>


<button onclick="guardarEdicion('${id}')">

Guardar cambios

</button>


`;



editarEstado.value =
a.estado||"Activo";


modalFondo.classList.add("activo");


}





async function guardarEdicion(id){


const cambios={

dni:editarDni.value,

nombre:editarNombre.value,

apellido:editarApellido.value,

celular:editarCelular.value,

correo:editarCorreo.value,

estado:editarEstado.value


};



await updateDoc(

doc(db,"afiliados",id),

cambios

);



await cargarAfiliados();


cerrarModal();


}








async function eliminarAfiliado(id){



const a =
window.BD_afiliados.find(x=>x.id===id);



if(!a)return;



if(!confirm("Eliminar afiliado?"))

return;



await deleteDoc(

doc(db,"afiliados",id)

);



window.BD_afiliados =
window.BD_afiliados.filter(x=>x.id!==id);



cerrarModal();

mostrarTabla();



if(typeof registrarHistorial==="function")

registrarHistorial(
"BAJA",
a,
"Eliminado"
);



}







function imprimirAfiliado(id){


const a =
window.BD_afiliados.find(x=>x.id===id);


if(!a)return;



generarPDF(a);


}






function aplicarValidaciones(numeros,textos){


numeros.forEach(id=>{

let c=document.getElementById(id);

if(c)

c.oninput=()=>{

c.value=c.value.replace(/\D/g,"");

};

});



textos.forEach(id=>{

let c=document.getElementById(id);


if(c)

c.oninput=()=>{

c.value=
c.value.replace(
/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g,
""
);

};


});


}






function cerrarModal(){

modalFondo.classList.remove("activo");

}
