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

} from "./firebase.js";





let cursoEditando=null;





document.addEventListener(
"DOMContentLoaded",
()=>{

iniciarConfig();

});







function iniciarConfig(){


document
.getElementById("btnGestionCursos")
.onclick=abrirCursos;



document
.getElementById("btnEnviarNotificacion")
.onclick=abrirNotificacion;



document
.getElementById("guardarCurso")
.onclick=guardarCurso;



document
.getElementById("cancelarCurso")
.onclick=()=>cerrar("modalCursos");



document
.getElementById("guardarNotificacion")
.onclick=guardarNotificacion;



document
.getElementById("cancelarNotificacion")
.onclick=()=>cerrar("modalNotificacion");



}









// ===============================
// CURSOS
// ===============================


async function abrirCursos(){


cursoEditando=null;


document
.getElementById("tituloModalCurso")
.textContent=
"Nuevo Curso";



limpiarCurso();



mostrarCursos();



abrir("modalCursos");


}







async function mostrarCursos(){



let contenedor =
document.getElementById("listaCursosConfig");



if(!contenedor)return;



contenedor.innerHTML="";



const snap =
await getDocs(
collection(db,"cursos")
);




let cursos=[];



snap.forEach(d=>{


cursos.push({

id:d.id,
...d.data()

});


});




cursos.sort(

(a,b)=>
new Date(b.fechaInicio)
-
new Date(a.fechaInicio)

);






cursos.forEach(c=>{



let estado =
calcularEstado(c);




contenedor.innerHTML+=`

<div class="filaCurso">


<div>
${c.titulo}
</div>


<div>
${formato(c.fechaInicio)}
</div>


<div>
${formato(c.fechaCierre)}
</div>


<div>
${estado}
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





if(!titulo || !inicio || !cierre){

alert("Complete todos los campos");

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




cerrar("modalCursos");

mostrarCursos();



}









window.editarCurso=
async function(id){



const snap =
await getDoc(

doc(
db,
"cursos",
id

)

);



if(!snap.exists())return;



const c=snap.data();



cursoEditando=id;



document
.getElementById("tituloModalCurso")
.textContent=
"Editar Curso";



document
.getElementById("cursoTitulo")
.value=c.titulo;


document
.getElementById("cursoInicio")
.value=c.fechaInicio;


document
.getElementById("cursoCierre")
.value=c.fechaCierre;



abrir("modalCursos");

}








window.borrarCurso=
async function(id){


if(!confirm("Eliminar curso?"))
return;



await deleteDoc(

doc(
db,
"cursos",
id

)

);



mostrarCursos();


}









function calcularEstado(c){


const hoy =
new Date()
.toISOString()
.split("T")[0];



return hoy<=c.fechaCierre
?
"Abierto"
:
"Cerrado";


}







// ===============================
// NOTIFICACIONES
// ===============================


function abrirNotificacion(){


document
.getElementById("textoNotificacion")
.value="";


abrir(
"modalNotificacion"
);


}






async function guardarNotificacion(){



const texto =
document
.getElementById("textoNotificacion")
.value.trim();



if(!texto)return;



await setDoc(

doc(
db,
"notificaciones",
"principal"

),

{

mensaje:texto,
fecha:new Date().toISOString()

}

);



cerrar(
"modalNotificacion"
);



alert(
"Notificación enviada"
);



}









// ===============================
// UTILIDADES
// ===============================


function abrir(id){

document
.getElementById(id)
.classList.add("activo");

}



function cerrar(id){

document
.getElementById(id)
.classList.remove("activo");

}





function limpiarCurso(){


document
.getElementById("cursoTitulo")
.value="";


document
.getElementById("cursoInicio")
.value="";


document
.getElementById("cursoCierre")
.value="";


}





function formato(v){

if(!v)return "";

const d =
new Date(v+"T00:00:00");


return (

String(d.getDate())
.padStart(2,"0")
+"/"+
String(d.getMonth()+1)
.padStart(2,"0")
+"/"+
d.getFullYear()

);


}
