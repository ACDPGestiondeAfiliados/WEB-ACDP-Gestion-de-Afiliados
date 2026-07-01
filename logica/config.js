// ===============================
// ACDP CONFIGURACION
// Cursos + Inscripciones + Notificaciones
// ===============================


import {

db,
collection,
addDoc,
getDocs,
deleteDoc,
updateDoc,
doc,
setDoc,
getDoc,
onSnapshot

} from "../firebase.js";





let cursoEditando=null;

let cursosCache=[];

let operadorActual="Administrador";









// ===============================
// INIT
// ===============================


iniciarConfig();



function iniciarConfig(){


const btnCursos =
document.getElementById("btnGestionCursos");


const btnNotif =
document.getElementById("btnEnviarNotificacion");




if(btnCursos){

btnCursos.onclick=nuevoCurso;

}



if(btnNotif){

btnNotif.onclick=abrirNotificacion;

}



mostrarCursos();

}









// ===============================
// TABLA CURSOS
// ===============================


async function mostrarCursos(){



const contenedor =
document.getElementById("listaCursosConfig");



if(!contenedor)return;



contenedor.innerHTML="";



const snap =
await getDocs(
collection(db,"cursos")
);



cursosCache=[];



for(const d of snap.docs){



const curso={

id:d.id,
...d.data()

};



await limpiarCursoVencido(
curso.id,
curso
);



cursosCache.push(curso);



}





cursosCache.sort(

(a,b)=>

new Date(b.fechaInicio)

-

new Date(a.fechaInicio)

);





cursosCache =
cursosCache.slice(0,10);






cursosCache.forEach(c=>{


const cupo =
Number(c.cupo||0);



const inscritos =
Number(c.inscriptos||0);



const disponibles =
Math.max(
0,
cupo-inscritos
);






contenedor.innerHTML+=`

<tr>


<td>

${c.titulo}

</td>



<td>

${formato(c.fechaInicio)}

</td>



<td>

${formato(c.fechaCierre)}

</td>



<td>

${cupo}

</td>



<td>

${inscritos}

</td>



<td>

${disponibles}

</td>



<td>



<button onclick="editarCurso('${c.id}')">

Editar

</button>



<button onclick="abrirInscripciones('${c.id}')">

Inscripciones

</button>



<button onclick="borrarCurso('${c.id}')">

Eliminar

</button>


</td>



</tr>

`;



});



}









// ===============================
// NUEVO CURSO
// ===============================


function nuevoCurso(){


cursoEditando=null;




document
.getElementById("modalContenido")
.innerHTML=`

<h3>
Nuevo Curso
</h3>



<input

id="cursoTitulo"

maxlength="100"

placeholder="Titulo"

>


<br><br>



<input

id="cursoInicio"

type="date"

>


<br><br>



<input

id="cursoCierre"

type="date"

>


<br><br>



<input

id="cursoCupo"

type="number"

min="50"

max="9999"

placeholder="Cupo"

>



<br><br>



<button id="guardarCurso">

Guardar

</button>



<button id="cancelarCurso">

Cancelar

</button>


`;





document
.getElementById("guardarCurso")
.onclick=guardarCurso;



document
.getElementById("cancelarCurso")
.onclick=()=>cerrar("modalFondo");




abrir("modalFondo");



}









// ===============================
// GUARDAR CURSO
// ===============================


async function guardarCurso(){



const titulo =
document
.getElementById("cursoTitulo")
.value.trim();



const inicio =
document
.getElementById("cursoInicio")
.value;



const cierre =
document
.getElementById("cursoCierre")
.value;



const cupo =
Number(
document
.getElementById("cursoCupo")
.value
);







if(

!titulo ||

!inicio ||

!cierre ||

!cupo

){

alert(
"Complete todos los campos"
);

return;

}






if(

cupo<50 ||

cupo>9999

){

alert(
"El cupo debe estar entre 50 y 9999"
);

return;

}







const datos={


titulo,


fechaInicio:
inicio,


fechaCierre:
cierre,


fechaCreacion:

cursoEditando

?

undefined

:

new Date()
.toISOString(),



cupo,


inscriptos:

cursoEditando

?

undefined

:

0,


disponibles:

cursoEditando

?

undefined

:

cupo


};







if(cursoEditando){



delete datos.fechaCreacion;

delete datos.inscriptos;

delete datos.disponibles;



await updateDoc(

doc(
db,
"cursos",
cursoEditando
),

datos

);



}else{



await addDoc(

collection(db,"cursos"),

datos

);



}






cerrar("modalFondo");



mostrarCursos();



}









// ===============================
// EDITAR
// ===============================


window.editarCurso =
async function(id){



const snap =
await getDoc(

doc(
db,
"cursos",
id
)

);



if(!snap.exists())
return;



const c =
snap.data();






if(estaBloqueado(c)){


alert(
"Este curso ya no puede editarse"
);


return;

}






cursoEditando=id;







document
.getElementById("modalContenido")
.innerHTML=`

<h3>
Editar Curso
</h3>



<input

id="cursoTitulo"

maxlength="100"

value="${c.titulo}"

>



<br><br>



<input

id="cursoInicio"

type="date"

value="${c.fechaInicio}"

>



<br><br>



<input

id="cursoCierre"

type="date"

value="${c.fechaCierre}"

>



<br><br>



<input

id="cursoCupo"

type="number"

min="50"

max="9999"

value="${c.cupo}"

>



<br><br>



<button id="guardarCurso">

Guardar

</button>



<button id="cancelarCurso">

Cancelar

</button>


`;





document
.getElementById("guardarCurso")
.onclick=guardarCurso;



document
.getElementById("cancelarCurso")
.onclick=()=>cerrar("modalFondo");



abrir("modalFondo");



}









// ===============================
// INSCRIPCIONES
// ===============================


window.abrirInscripciones =
async function(id){



const curso =
cursosCache.find(
c=>c.id===id
);



if(!curso)
return;





document
.getElementById("modalContenido")
.innerHTML=`

<h3>

${curso.titulo}

</h3>



<div>

Cupo total:
${curso.cupo}

<br>

Inscritos:
<span id="contadorInscritos">
${curso.inscriptos||0}
</span>


<br>

Disponibles:
<span id="contadorCupo">
${curso.disponibles||0}
</span>


<br><br>

Tiempo:
<span id="contadorTiempo">
calculando...
</span>

</div>




<br>



<input

id="buscarAfiliadoCurso"

placeholder="DNI o Nro Afiliado"

>



<button id="btnImprimirCurso">

Imprimir

</button>



<button id="btnCSVCurso">

CSV

</button>




<table>


<thead>

<tr>

<th>Nro Afiliado</th>

<th>DNI</th>

<th>Nombre</th>

<th>Apellido</th>

<th>Correo</th>

<th>Celular</th>

<th>Operador</th>

<th>Acción</th>

</tr>

</thead>



<tbody id="listaInscripcionesCurso">

</tbody>



</table>


`;





document
.getElementById("buscarAfiliadoCurso")
.oninput=

()=>cargarInscripciones(id);



document
.getElementById("btnImprimirCurso")
.onclick=

()=>imprimirCurso(id);



document
.getElementById("btnCSVCurso")
.onclick=

()=>exportarCSVCurso(id);




abrir("modalFondo");



escucharInscripciones(id);

cargarInscripciones(id);



};

// ===============================
// INSCRIPCIONES
// ===============================


async function cargarInscripciones(id){


const tabla =
document.getElementById(
"listaInscripcionesCurso"
);



if(!tabla)return;




const cursoSnap =
await getDoc(
doc(db,"cursos",id)
);



if(!cursoSnap.exists())
return;




const curso =
cursoSnap.data();




const insSnap =
await getDocs(

collection(
db,
"cursos",
id,
"inscripciones"
)

);




let inscriptos=[];



insSnap.forEach(d=>{


inscriptos.push({

id:d.id,
...d.data()

});


});





const afiliadosSnap =
await getDocs(
collection(db,"afiliados")
);




const filtro =
(
document.getElementById(
"buscarAfiliadoCurso"
)?.value || ""
)
.trim();





tabla.innerHTML="";



let filas=0;





afiliadosSnap.forEach(d=>{



if(filas>=15)
return;





const a={

id:d.id,
...d.data()

};






if(

filtro &&

!String(a.dni)
.includes(filtro)

&&

!String(a.numeroAfiliado)
.includes(filtro)

){

return;

}





const agregado =
inscriptos.find(
x=>x.afiliadoID===a.id
);





tabla.innerHTML+=`


<tr>


<td>
${a.numeroAfiliado||""}
</td>


<td>
${a.dni||""}
</td>


<td>
${a.nombre||""}
</td>


<td>
${a.apellido||""}
</td>


<td>
${a.correo||""}
</td>


<td>
${a.celular||""}
</td>



<td>

${agregado?.operador||""}

</td>



<td>


${
agregado

?

`

<button onclick="quitarAfiliadoCurso('${id}','${agregado.id}')">

Quitar

</button>

`

:

`

<button onclick="agregarAfiliadoCurso('${id}','${a.id}')">

Añadir

</button>

`

}


</td>



</tr>


`;



filas++;


});





const libres =
Math.max(

0,

Number(curso.cupo||0)
-
inscriptos.length

);




await updateDoc(

doc(db,"cursos",id),

{

inscriptos:
inscriptos.length,

disponibles:
libres

}

);





document
.getElementById("contadorCupo")
.textContent=libres;



document
.getElementById("contadorInscritos")
.textContent=
inscriptos.length;



}









// ===============================
// AÑADIR
// ===============================


window.agregarAfiliadoCurso =
async function(
cursoID,
afiliadoID
){



const cursoSnap =
await getDoc(
doc(db,"cursos",cursoID)
);



const curso =
cursoSnap.data();




if(

Number(curso.disponibles)<=0

){

alert(
"No hay más cupos, por favor imprima"
);

return;

}






const afSnap =
await getDoc(
doc(db,"afiliados",afiliadoID)
);



if(!afSnap.exists())
return;




const afiliado =
afSnap.data();





if(

afiliado.estado!=="ACTIVO"

){



const cobros =
await getDocs(
collection(db,"cobros")
);



let ok=false;



cobros.forEach(d=>{


const c=d.data();



if(

c.dni===afiliado.dni &&

c.estado!=="Anulado" &&

c.meses?.length

){

ok=true;

}


});





if(!ok){


alert(
"Este afiliado no está al día con las cuotas"
);


return;


}



}







await setDoc(

doc(

db,

"cursos",

cursoID,

"inscripciones",

afiliadoID

),

{

afiliadoID,

numeroAfiliado:
afiliado.numeroAfiliado,

dni:
afiliado.dni,

nombre:
afiliado.nombre,

apellido:
afiliado.apellido,

correo:
afiliado.correo||"",

celular:
afiliado.celular||"",

operador:
operadorActual,

fecha:
new Date()
.toISOString()

}

);





cargarInscripciones(cursoID);



};









// ===============================
// QUITAR
// ===============================


window.quitarAfiliadoCurso =
async function(
cursoID,
id
){



if(

!confirm(
"¿Quitar este afiliado del curso?"
)

)

return;





await deleteDoc(

doc(

db,

"cursos",

cursoID,

"inscripciones",

id

)

);



cargarInscripciones(cursoID);



};









// ===============================
// REALTIME
// ===============================


function escucharInscripciones(id){



onSnapshot(

collection(

db,

"cursos",

id,

"inscripciones"

),

()=>{

cargarInscripciones(id);

}

);



}









// ===============================
// IMPRESION
// ===============================


async function imprimirCurso(id){



const snap =
await getDocs(

collection(

db,

"cursos",

id,

"inscripciones"

)

);



let lista=[];



snap.forEach(d=>{

lista.push(d.data());

});




lista.sort(

(a,b)=>

(a.nombre+" "+a.apellido)
.localeCompare(
(b.nombre+" "+b.apellido)
)

);





let html=`


<h2>

Listado Curso

</h2>


<table border="1">


<tr>

<th>Nro</th>
<th>DNI</th>
<th>Nombre</th>
<th>Apellido</th>
<th>Correo</th>
<th>Celular</th>

</tr>


`;




lista.forEach(a=>{


html+=`

<tr>

<td>${a.numeroAfiliado}</td>

<td>${a.dni}</td>

<td>${a.nombre}</td>

<td>${a.apellido}</td>

<td>${a.correo}</td>

<td>${a.celular}</td>

</tr>


`;



});



html+="</table>";





const w =
window.open("");



w.document.write(`

<style>

@page{

size:A4 portrait;

}


body{

font-family:Arial;

font-size:11px;

}


th{

font-size:12px;

}


table{

border-collapse:collapse;

width:100%;

}


td,th{

padding:5px;

}

</style>


${html}

`);




w.print();



}









// ===============================
// CSV
// ===============================


async function exportarCSVCurso(id){



const snap =
await getDocs(

collection(

db,

"cursos",

id,

"inscripciones"

)

);





let filas=[

[
"DNI",
"Nombre",
"Apellido",
"Correo",
"Celular"
]

];




snap.forEach(d=>{


const a=d.data();


filas.push([

a.dni,
a.nombre,
a.apellido,
a.correo,
a.celular

]);



});





const csv =
filas
.map(x=>x.join(","))
.join("\n");





const blob =
new Blob(
[csv],
{
type:"text/csv"
}
);



const url =
URL.createObjectURL(blob);



const a =
document.createElement("a");



a.href=url;

a.download="curso.csv";

a.click();



}









// ===============================
// CONTROL TIEMPO
// ===============================


function estaBloqueado(c){


if(!c.fechaCreacion)
return false;




const cierre =
new Date(
c.fechaCierre+"T23:59:59"
);



cierre.setHours(
cierre.getHours()+72
);



return new Date()>=cierre;


}









async function limpiarCursoVencido(id,c){



if(!c.fechaCreacion)
return;





const limite =
new Date(
c.fechaCreacion
);



limite.setDate(
limite.getDate()+63
);





if(

new Date() < limite

)

return;






const ins =
await getDocs(

collection(

db,

"cursos",

id,

"inscripciones"

)

);




for(const d of ins.docs){

await deleteDoc(d.ref);

}





await deleteDoc(
doc(db,"cursos",id)
);



}









// ===============================
// ELIMINAR
// ===============================


window.borrarCurso =
async function(id){



if(

!confirm(
"¿Eliminar curso?"
)

)

return;





await deleteDoc(

doc(
db,
"cursos",
id
)

);



mostrarCursos();



};









// ===============================
// NOTIFICACIONES
// ===============================


function abrirNotificacion(){



document
.getElementById("modalContenido")
.innerHTML=`

<h3>
Nueva Notificación
</h3>



<textarea

id="textoNotificacion"

maxlength="1000"

></textarea>



<br><br>


<button id="guardarNotificacion">

Enviar

</button>



<button id="cancelarNotificacion">

Cancelar

</button>


`;




document
.getElementById("guardarNotificacion")
.onclick=guardarNotificacion;



document
.getElementById("cancelarNotificacion")
.onclick=
()=>cerrar("modalFondo");



abrir("modalFondo");


}








async function guardarNotificacion(){



const texto =
document
.getElementById("textoNotificacion")
.value.trim();




if(!texto)
return;





await setDoc(

doc(
db,
"notificaciones",
"principal"
),

{

mensaje:texto,

fecha:
new Date()
.toISOString()

}

);




cerrar("modalFondo");


alert(
"Notificación enviada"
);


}









// ===============================
// UTILIDADES
// ===============================


function abrir(id){


const e =
document.getElementById(id);



if(e)
e.classList.add("activo");


}





function cerrar(id){


const e =
document.getElementById(id);



if(e)
e.classList.remove("activo");


}






function formato(v){


if(!v)
return "";



const d =
new Date(
v+"T00:00:00"
);



return (

String(d.getDate())
.padStart(2,"0")
+
"/"+
String(d.getMonth()+1)
.padStart(2,"0")
+
"/"+
d.getFullYear()

);


}
