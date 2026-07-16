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
"Este curso ya no puede editarse porque está cerrado, consulte a un administrador"
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

placeholder="DNI"

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

if(window._timerCurso)
clearInterval(window._timerCurso);

window._timerCurso =
iniciarContadorTiempo(curso);

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
"No hay más cupos, el curso se cerró, por favor imprima. No se pueden hacer cambios ni inscripciones nuevas"
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
"Este afiliado debe cuotas: Tiene que ponerse al día para poder anotarse a este curso. Vaya a la sección COBRAR, y emita el pago correspondiente primero."
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
ACDP?.usuario || "Desconocido",

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


const cursoSnap =
await getDoc(doc(db,"cursos",id));

if(!cursoSnap.exists())
return;

const curso =
cursoSnap.data();



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



// ORDEN ALFABÉTICO POR APELLIDO
lista.sort((a,b)=>
(a.apellido||"").localeCompare(b.apellido||"")
);



// CSV HEADERS
let filas=[

[
"DNI",
"Apellido",
"Nombre",
"Correo",
"Celular"
]

];



lista.forEach(a=>{

filas.push([

a.dni||"",
a.apellido||"",
a.nombre||"",
a.correo||"",
a.celular||""

]);

});



// CSV FORMATO EXCEL
const csv =
filas
.map(row =>
row.map(v =>
`"${String(v).replace(/"/g,'""')}"`
).join(";")
)
.join("\n");



const blob =
new Blob(
["\uFEFF" + csv],
{
type:"text/csv;charset=utf-8;"
}
);



const url =
URL.createObjectURL(blob);



// ===============================
// NOMBRE DINÁMICO DEL ARCHIVO
// ===============================

const cupoTotal =
Number(curso.cupo || 0);

const inscriptos =
lista.length;

const restantes =
Math.max(0, cupoTotal - inscriptos);



const nombreLimpio =
(curso.titulo || "Curso")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-zA-Z0-9]/g,"_")
.replace(/_+/g,"_")
.replace(/^_|_$/g,"");



const fileName =
`${nombreLimpio}_Cupo_${restantes}.csv`;



const a =
document.createElement("a");



a.href=url;

a.download=fileName;

a.click();



URL.revokeObjectURL(url);

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

// ===============================
// ABRIR NOTIFICACION
// ===============================

async function abrirNotificacion(){


document
.getElementById("modalContenido")
.innerHTML=`

<div class="notificaciones-admin">


<div class="notif-nueva">


<h3>
Nueva Notificación
</h3>


<label>
Título
</label>


<input
id="tituloNotificacion"
maxlength="35"
placeholder="Título"
>


<br><br>


<label>
Cuerpo
</label>


<textarea
id="cuerpoNotificacion"
maxlength="200"
rows="5"
placeholder="Cuerpo"
></textarea>


<br>


<button id="guardarNotificacion">
Enviar
</button>


</div>





<div class="notif-ultima">


<h3>
Última enviada
</h3>


<div id="ultimaNotificacion">

Cargando...

</div>


</div>




<div class="acciones-notificaciones">


<button id="cancelarNotificacion">

Cancelar

</button>


</div>


</div>

`;



document
.getElementById("guardarNotificacion")
.onclick =
guardarNotificacion;



document
.getElementById("cancelarNotificacion")
.onclick =
()=>cerrar("modalFondo");



abrir("modalFondo");


await cargarUltimaNotificacion();


}


// ===============================
// CARGAR ÚLTIMA NOTIFICACION
// ===============================

async function cargarUltimaNotificacion(){


const contenedor =
document.getElementById(
"ultimaNotificacion"
);


if(!contenedor)
return;



try{


const snap =
await getDocs(

collection(
db,
"notificaciones"
)

);



if(snap.empty){


contenedor.innerHTML=
`

<p>
No hay notificaciones enviadas.
</p>

`;

return;


}



let lista=[];


snap.forEach(d=>{


lista.push({

id:d.id,

...d.data()

});


});



lista.sort(

(a,b)=>

new Date(b.fecha)
-
new Date(a.fecha)

);



const ultima =
lista[0];



contenedor.innerHTML=

`

<div>


<label>
Título
</label>


<input

id="editarTituloNotificacion"

maxlength="35"

value="${ultima.titulo || ""}"

>


<br><br>


<label>
Cuerpo
</label>


<textarea

id="editarCuerpoNotificacion"

maxlength="200"

rows="5"

>${ultima.cuerpo || ultima.mensaje || ""}</textarea>



<p>

Fecha:
${formatearFechaNotificacion(ultima.fecha)}

</p>



<p>

Operador:
${ultima.operador || "Desconocido"}

</p>



<button

id="guardarEdicionNotificacion"

>

Aceptar cambios

</button>



<button

id="borrarUltimaNotificacion"

>

Borrar

</button>



</div>

`;



document
.getElementById(
"guardarEdicionNotificacion"
)
.onclick =
()=>editarUltimaNotificacion(
ultima.id
);



document
.getElementById(
"borrarUltimaNotificacion"
)
.onclick =
()=>borrarUltimaNotificacion(
ultima.id
);



}



catch(error){


console.error(
"Error cargando notificaciones:",
error
);


contenedor.innerHTML=

`

<p>
No se pudieron cargar novedades.
</p>

`;


}


}






// ===============================
// GUARDAR NUEVA NOTIFICACION
// ===============================

async function guardarNotificacion(){


const titulo =
normalizarTexto(
document
.getElementById(
"tituloNotificacion"
)
.value
);



const cuerpo =
normalizarCuerpo(
document
.getElementById(
"cuerpoNotificacion"
)
.value
);



if(!titulo || !cuerpo){


alert(
"Complete título y cuerpo."
);


return;


}




await addDoc(

collection(
db,
"notificaciones"
),

{


titulo,


cuerpo,


fecha:

new Date()
.toISOString(),



operador:

window.ACDP?.usuario ||
"Desconocido"



}

);

// ===============================
// HISTORIAL - CREAR NOTIFICACION
// ===============================

if(window.registrarHistorial){

await window.registrarHistorial(

"Notificación",

{},

`Creó notificación: ${titulo}`

);

}


cerrar("modalFondo");



alert(
"Notificación enviada."
);



}






// ===============================
// EDITAR ÚLTIMA NOTIFICACION
// ===============================

async function editarUltimaNotificacion(id){


const titulo =
normalizarTexto(

document
.getElementById(
"editarTituloNotificacion"
)
.value

);



const cuerpo =
normalizarCuerpo(

document
.getElementById(
"editarCuerpoNotificacion"
)
.value

);




if(!titulo || !cuerpo){


alert(
"Complete título y cuerpo."
);


return;


}




await updateDoc(

doc(
db,
"notificaciones",
id
),

{


titulo,


cuerpo


}


);


// ===============================
// HISTORIAL - EDITAR NOTIFICACION
// ===============================

if(window.registrarHistorial){

await window.registrarHistorial(

"Notificación",

{},

`Editó notificación: ${titulo}`

);

}



alert(
"Notificación editada"
);



cargarUltimaNotificacion();


}






// ===============================
// BORRAR ÚLTIMA NOTIFICACION
// ===============================

async function borrarUltimaNotificacion(id){


if(
!confirm(
"¿Eliminar esta notificación?"
)

)

return;



await deleteDoc(

doc(
db,
"notificaciones",
id
)

);



alert(
"Notificación eliminada."
);



cargarUltimaNotificacion();


}







// ===============================
// NORMALIZAR TEXTO
// ===============================

function normalizarTexto(texto){


return texto

.toLowerCase()

.replace(
/[^a-z0-9áéíóúñü ]/gi,
""
)

.trim()

.replace(

/(^|\s)(\S)/g,

(m,p,l)=>

p+l.toUpperCase()

)

.substring(
0,
35
);


}





// ===============================
// NORMALIZAR CUERPO
// ===============================

function normalizarCuerpo(texto){


return texto

.toLowerCase()

.replace(
/(^|\n|\s)(\S)/g,

(m,p,l)=>

p+l.toUpperCase()

)

.trim()

.substring(
0,
200
);


}







// ===============================
// FECHA NOTIFICACION
// ===============================

function formatearFechaNotificacion(valor){


if(!valor)
return "";



const d =
new Date(valor);



return (

String(
d.getDate()
)
.padStart(2,"0")

+

"/"

+

String(
d.getMonth()+1
)
.padStart(2,"0")

+

"/"

+

d.getFullYear()

);


}


// ===============================
// CONTROL TIEMPO - CURSOS
// ===============================

function iniciarContadorTiempo(curso){

const el =
document.getElementById("contadorTiempo");

if(!el || !curso.fechaCreacion || !curso.fechaCierre)
return;


function bloquearUI(){

document.querySelectorAll("#listaInscripcionesCurso button")
.forEach(b=>b.disabled = true);

}


function actualizar(){

const ahora =
new Date();


const cierre =
new Date(curso.fechaCierre + "T23:59:59");


const finBloqueo =
new Date(cierre);

finBloqueo.setHours(finBloqueo.getHours() + 72);


const diff =
finBloqueo - ahora;


if(diff <= 0){

el.textContent =
"Bloqueado";

bloquearUI();

return;

}


const horas =
Math.floor(diff / (1000 * 60 * 60));

const dias =
Math.floor(horas / 24);

const horasRestantes =
horas % 24;


el.textContent =
`${dias}d ${horasRestantes}h restantes`;

}


actualizar();

return setInterval(actualizar, 60000);

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

// ===============================
// EXPORT
// ===============================

window.CURSOS = {
    actualizar: mostrarCursos
};
