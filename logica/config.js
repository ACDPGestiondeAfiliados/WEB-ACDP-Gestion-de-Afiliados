// ===============================
// ACDP CONFIGURACION
// Cursos + Notificaciones
// ===============================


// ===============================
// ACDP CONFIGURACION
// Cursos + Notificaciones
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
getDoc

} from "../firebase.js";





let cursoEditando=null;



// ===============================
// INIT
// ===============================


iniciarConfig();



function iniciarConfig(){


console.log("CONFIG JS CARGADO");



const btnCursos =
document.getElementById("btnGestionCursos");



const btnNotif =
document.getElementById("btnEnviarNotificacion");





console.log(
"BOTONES",
btnCursos,
btnNotif
);





if(!btnCursos || !btnNotif){

console.log(
"No se encontraron botones CONFIG"
);

return;

}





btnCursos.addEventListener(
"click",
nuevoCurso
);



btnNotif.addEventListener(
"click",
abrirNotificacion
);



mostrarCursos();



}



// ===============================
// MODAL CURSO NUEVO
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
// LISTAR CURSOS
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




let cursos=[];



const hoy =
new Date()
.toISOString()
.split("T")[0];





for(const d of snap.docs){



let curso={

id:d.id,
...d.data()

};





if(

curso.fechaCierre &&
curso.fechaCierre < hoy

){



await deleteDoc(

doc(
db,
"cursos",
curso.id

)

);



continue;


}




cursos.push(curso);



}







cursos.sort(

(a,b)=>

new Date(b.fechaInicio)

-

new Date(a.fechaInicio)

);






cursos =
cursos.slice(0,10);







cursos.forEach(c=>{


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


<button onclick="editarCurso('${c.id}')">

Editar

</button>



<button onclick="borrarCurso('${c.id}')">

Eliminar

</button>


</td>


</tr>

`;



<div>

${c.titulo}

</div>



<div>

${formato(c.fechaInicio)}

</div>



<div>

${formato(c.fechaCierre)}

</div>





<button onclick="editarCurso('${c.id}')">

Editar

</button>




<button onclick="borrarCurso('${c.id}')">

Eliminar

</button>



</div>


`;



});



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






if(

!titulo ||
!inicio ||
!cierre

){


alert(
"Complete todos los campos"
);


return;

}







let datos={


titulo,

fechaInicio:inicio,

fechaCierre:cierre


};









if(cursoEditando){



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
// EDITAR CURSO
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



};









// ===============================
// ELIMINAR CURSO
// ===============================


window.borrarCurso =
async function(id){



if(
!confirm("Eliminar curso?")
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

placeholder="Mensaje"

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
.onclick=()=>cerrar("modalFondo");





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


fecha:new Date()
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



const elemento =
document.getElementById(id);



if(elemento){

elemento.classList.add("activo");

}



}







function cerrar(id){



const elemento =
document.getElementById(id);



if(elemento){

elemento.classList.remove("activo");

}



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

"/"

+

String(d.getMonth()+1)
.padStart(2,"0")

+

"/"

+

d.getFullYear()

);



}
