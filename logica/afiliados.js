// ===============================
// ACDP - AFILIADOS CONTROLLER
// Firebase CRUD + columnas dinámicas + exportación
// HISTORIAL INTEGRADO
// ===============================


import {
    db,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "../firebase.js";



// ===============================
// ESTADO
// ===============================


let CACHE_AFILIADOS = [];

let PAGE_SIZE = 20;

let PAGINA_ACTUAL = 0;



// ===============================
// COLUMNAS TABLA
// ===============================


const COLUMNAS = {



dni:{
    titulo:"DNI",
    mostrar:true
},


nombre:{
    titulo:"Nombre",
    mostrar:true
},


apellido:{
    titulo:"Apellido",
    mostrar:true
},


celular:{
    titulo:"Celular",
    mostrar:false
},


correo:{
    titulo:"Correo",
    mostrar:false
},


estado:{
    titulo:"Estado",
    mostrar:true
},


direccion:{
    titulo:"Dirección",
    mostrar:false
},


cargo:{
    titulo:"Cargo",
    mostrar:false
},


provincia:{
    titulo:"Provincia",
    mostrar:false
},


localidad:{
    titulo:"Localidad",
    mostrar:false
},


fechaNacimiento:{
    titulo:"Nacimiento",
    mostrar:false
},


estadoCivil:{
    titulo:"Estado Civil",
    mostrar:false
}


};




// ===============================
// INIT
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


bindAfiliadosUI();

cargarAfiliados(true);


});





// ===============================
// HELPERS
// ===============================

function formatearFechaHora(date){


const d =
new Date(date);



if(isNaN(d))
return {
fecha:"",
hora:""
};



return {


fecha:

`${String(d.getDate()).padStart(2,"0")}/${
String(d.getMonth()+1).padStart(2,"0")
}/${
String(d.getFullYear()).slice(-2)
}`,


hora:

`${String(d.getHours()).padStart(2,"0")}:${
String(d.getMinutes()).padStart(2,"0")
}`


};


}





function fechaInput(fecha){


if(!fecha)
return "";



const partes =
fecha.split("/");



if(partes.length!==3)
return "";



return `${partes[2]}-${partes[1]}-${partes[0]}`;


}






function normalizarFechaNacimiento(valor){


if(!valor)
return "";



if(valor.includes("-")){


const p =
valor.split("-");


return `${p[2]}/${p[1]}/${p[0]}`;


}


return valor;


}





const validarTexto =

v=>

/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/;



const validarNumero =

v=>

/^[0-9]+$/;





// ===============================
// HISTORIAL
// ===============================

function enviarHistorial(
accion,
afiliado,
detalle
){

if(!window.HISTORIAL?.registrar)
return;

window.HISTORIAL.registrar(

accion,

{

afiliado:
`${afiliado.nombre} ${afiliado.apellido}`,

dni:
afiliado.dni

},

detalle

);

}



// ===============================
// MODAL GLOBAL
// ===============================


function abrirModal(html){


document
.getElementById("modalContenido")
.innerHTML =
html;



document
.getElementById("modalFondo")
.classList.add("activo");



document
.getElementById("cerrarModal")
.onclick =
cerrarModal;


}





function cerrarModal(){


document
.getElementById("modalContenido")
.innerHTML="";



document
.getElementById("modalFondo")
.classList.remove("activo");


}





// ===============================
// UI
// ===============================


function bindAfiliadosUI(){



const btnNuevo =
document.getElementById(
"btnNuevoAfiliado"
);



if(btnNuevo)

btnNuevo.onclick =
abrirCrearAfiliado;





const filtro =
document.getElementById(
"filtroAfiliados"
);



if(filtro){


filtro.oninput=()=>{


const v =
filtro.value.trim();



if(
v.length===8 ||
v.length===0
)

renderAfiliados();



};


}





const anterior =
document.getElementById(
"afiliadosAnterior"
);



const siguiente =
document.getElementById(
"afiliadosSiguiente"
);




if(anterior)

anterior.onclick =
()=>cambiarPagina(-1);




if(siguiente)

siguiente.onclick =
()=>cambiarPagina(1);





const columnas =
document.getElementById(
"configColumnasAfiliados"
);



if(columnas)

columnas.onclick =
abrirSelectorColumnas;






const exportar =
document.getElementById(
"exportarAfiliados"
);



if(exportar)

exportar.onclick =
abrirExportarAfiliados;



}







// ===============================
// CARGAR FIREBASE
// ===============================

async function cargarAfiliados(reset=false){

const snap=
await getDocs(
collection(
db,
"afiliados"
)
);

CACHE_AFILIADOS=[];

snap.forEach(d=>{

CACHE_AFILIADOS.push({

id:d.id,

...d.data()

});

});

CACHE_AFILIADOS.sort((a,b)=>

new Date(b.fechaAlta)
-
new Date(a.fechaAlta)

);

if(reset)
PAGINA_ACTUAL=0;

renderAfiliados();

actualizarResumenAfiliados();

}







// ===============================
// PAGINACION
// ===============================


function cambiarPagina(valor){



const max =

Math.max(

0,

Math.ceil(
CACHE_AFILIADOS.length/PAGE_SIZE
)-1

);




PAGINA_ACTUAL += valor;




if(PAGINA_ACTUAL<0)

PAGINA_ACTUAL=0;




if(PAGINA_ACTUAL>max)

PAGINA_ACTUAL=max;





renderAfiliados();



}





// ===============================
// COLUMNAS
// ===============================


function abrirSelectorColumnas(){


let html = `

<h3>Columnas visibles</h3>

<label>

<input type="checkbox" id="mostrarTodasColumnas">

Mostrar todas

</label>

<br><br>

`;





Object.keys(COLUMNAS)
.forEach(c=>{


html+=`


<label>


<input

type="checkbox"

class="checkColumna"

data-col="${c}"

${COLUMNAS[c].mostrar?"checked":""}

>


${COLUMNAS[c].titulo}


</label>


<br>


`;


});




html+=`

<br>

<button id="guardarColumnas">

Aceptar

</button>

`;




abrirModal(html);





document
.getElementById(
"mostrarTodasColumnas"
)
.onchange=e=>{


document
.querySelectorAll(
".checkColumna"
)
.forEach(c=>{


c.checked =
e.target.checked;


});
renderAfiliados();

};





document
.getElementById(
"guardarColumnas"
)
.onclick=()=>{


document
.querySelectorAll(
".checkColumna"
)
.forEach(c=>{


COLUMNAS[
c.dataset.col
]
.mostrar =
c.checked;



});



cerrarModal();



renderAfiliados();


};


}

// ===============================
// CREAR AFILIADO
// ===============================


function abrirCrearAfiliado(){


abrirModal(`


<h3>Nuevo Afiliado</h3>



<input id="aNombre" placeholder="Nombre">


<br><br>


<input id="aApellido" placeholder="Apellido">


<br><br>


<input id="aDni" placeholder="DNI" maxlength="8">


<br><br>


<input id="aCelular" placeholder="Celular" maxlength="10">


<br><br>


<input id="aCorreo" placeholder="Correo">


<br><br>


<input

id="aDireccion"

placeholder="Dirección"

maxlength="30"

>


<br><br>


<input

id="aCargo"

placeholder="Cargo"

maxlength="15"

>


<br><br>



<p>Provincia</p><br><select id="aProvincia">


<option>OTRO</option>
<option>Buenos Aires</option>
<option>Capital Federal</option>
<option>Catamarca</option>
<option>Chaco</option>
<option>Chubut</option>
<option>Córdoba</option>
<option>Corrientes</option>
<option>Entre Ríos</option>
<option>Formosa</option>
<option>Jujuy</option>
<option>La Pampa</option>
<option>La Rioja</option>
<option>Mendoza</option>
<option>Misiones</option>
<option>Neuquén</option>
<option>Río Negro</option>
<option>Salta</option>
<option>San Juan</option>
<option>San Luis</option>
<option>Santa Cruz</option>
<option>Santa Fe</option>
<option>Santiago del Estero</option>
<option>Tierra del Fuego</option>
<option>Tucumán</option>


</select>


<br><br>



<input

id="aLocalidad"

placeholder="Localidad"

maxlength="15"

>


<br><br>


<p>Fecha de Nacimiento</p><br>
<input

type="date"

id="aNacimiento"

>



<br><br>


<p>Estado Civil</p><br>
<select id="aEstadoCivil">


<option>Soltero/a</option>

<option>Casado/a</option>

<option>Concubino/a</option>


</select>



<br><br>


<p>Situación</p><br>
<select id="aEstado">


<option value="ADHERENTE">

ADHERENTE

</option>


<option value="ACTIVO">

ACTIVO

</option>


</select>




<br><br>



<button id="btnGuardarAfiliado">

Guardar

</button>


`);



document
.getElementById(
"btnGuardarAfiliado"
)
.onclick =
guardarAfiliado;


}








// ===============================
// GUARDAR
// ===============================


async function guardarAfiliado(){



const nuevo = {


nombre:

document
.getElementById("aNombre")
.value.trim(),



apellido:

document
.getElementById("aApellido")
.value.trim(),



dni:

document
.getElementById("aDni")
.value.trim(),



celular:

document
.getElementById("aCelular")
.value.trim(),



correo:

document
.getElementById("aCorreo")
.value.trim(),



direccion:

document
.getElementById("aDireccion")
.value.trim(),



cargo:

document
.getElementById("aCargo")
.value.trim(),



provincia:

document
.getElementById("aProvincia")
.value,



localidad:

document
.getElementById("aLocalidad")
.value.trim(),



fechaNacimiento:

normalizarFechaNacimiento(

document
.getElementById("aNacimiento")
.value

),



estadoCivil:

document
.getElementById("aEstadoCivil")
.value,



estado:

document
.getElementById("aEstado")
.value,



fechaAlta:

new Date().toISOString()


};




await addDoc(

collection(
db,
"afiliados"
),

nuevo

);




enviarHistorial(

"Alta afiliado",

nuevo,

"Afiliado dado de alta"

);




cerrarModal();



cargarAfiliados(true);



}







// ===============================
// EDITAR AFILIADO
// ===============================


async function editarAfiliado(id){



const af =

CACHE_AFILIADOS.find(

a=>a.id===id

);



if(!af)return;





abrirModal(`


<h3>Editar Afiliado</h3><br>


<p>Nombre</p><br>
<input id="eNombre" value="${af.nombre||""}">


<br><br>

<p>Apellido</p><br>
<input id="eApellido" value="${af.apellido||""}">


<br><br>

<p>DNI</p><br>
<input id="eDni" value="${af.dni||""}">


<br><br>

<p>Celular</p><br>
<input id="eCelular" value="${af.celular||""}">


<br><br>

<p>Correo</p><br>
<input id="eCorreo" value="${af.correo||""}">


<br><br>

<p>Dirección</p><br>
<input id="eDireccion" value="${af.direccion||""}">


<br><br>

<p>Cargo</p><br>
<input id="eCargo" value="${af.cargo||""}">


<br><br>


<p>Provincia</p><br>
<select id="eProvincia">


<option ${af.provincia==="OTRO"?"selected":""}>
OTRO
</option>


<option ${af.provincia==="Buenos Aires"?"selected":""}>
Buenos Aires
</option>


<option ${af.provincia==="Capital Federal"?"selected":""}>
Capital Federal
</option>


<option ${af.provincia==="Córdoba"?"selected":""}>
Córdoba
</option>


<option ${af.provincia==="Santa Fe"?"selected":""}>
Santa Fe
</option>


</select>



<br><br>


<p>Localidad</p><br>
<input

id="eLocalidad"

value="${af.localidad||""}"

>



<br><br>


<p>Fecha de Nacimiento</p><br>
<input

type="date"

id="eNacimiento"

value="${fechaInput(
af.fechaNacimiento
)}"

>



<br><br>


<p>Estado Civil</p><br>
<select id="eEstadoCivil">


<option ${af.estadoCivil==="Soltero/a"?"selected":""}>

Soltero/a

</option>


<option ${af.estadoCivil==="Casado/a"?"selected":""}>

Casado/a

</option>


<option ${af.estadoCivil==="Concubino/a"?"selected":""}>

Concubino/a

</option>


</select>



<br><br>



<p>Situación</p><br>
<select id="eEstado">


<option ${af.estado==="ADHERENTE"?"selected":""}>

ADHERENTE

</option>


<option ${af.estado==="ACTIVO"?"selected":""}>

ACTIVO

</option>


</select>




<br><br>



<button id="btnEditarAfiliado">

Guardar

</button>



`);







document
.getElementById(
"btnEditarAfiliado"
)
.onclick =
async()=>{





const actualizado={



nombre:

eNombre.value.trim(),



apellido:

eApellido.value.trim(),



dni:

eDni.value.trim(),



celular:

eCelular.value.trim(),



correo:

eCorreo.value.trim(),



direccion:

eDireccion.value.trim(),



cargo:

eCargo.value.trim(),



provincia:

eProvincia.value,



localidad:

eLocalidad.value.trim(),



fechaNacimiento:

normalizarFechaNacimiento(
eNacimiento.value
),



estadoCivil:

eEstadoCivil.value,



estado:

eEstado.value



};






await updateDoc(

doc(

db,

"afiliados",

id

),

actualizado

);





enviarHistorial(

"Edicion afiliado",

actualizado,

"Afiliado editado"

);



cerrarModal();



cargarAfiliados(true);



};




}







// ===============================
// ELIMINAR
// ===============================


async function eliminarAfiliado(id){



const af =

CACHE_AFILIADOS.find(

a=>a.id===id

);



if(!af)return;





abrirModal(`


<h3>Eliminar Afiliado: Describí un motivo válido, porfavor</h3>



<textarea

id="motivo"

maxlength="40"

style="width:100%;height:100px"

></textarea>



<br><br>



<button id="btnConfirmarEliminar">

Confirmar

</button>



`);






document
.getElementById(
"btnConfirmarEliminar"
)
.onclick =
async()=>{



const motivo =

document
.getElementById("motivo")
.value.trim();



if(!motivo){

alert("Ingrese motivo");

return;

}





await deleteDoc(

doc(

db,

"afiliados",

id

)

);





enviarHistorial(

"Eliminacion afiliado",

af,

"Motivo: "+motivo

);




cerrarModal();



cargarAfiliados(true);



};



}

// ===============================
// TABLA DINAMICA
// ===============================


function renderAfiliados(){


const tbody =
document.querySelector(
"#tablaAfiliados tbody"
);



if(!tbody)return;



tbody.innerHTML="";



const filtro =
document.getElementById(
"filtroAfiliados"
)?.value.trim() || "";



let data =
[...CACHE_AFILIADOS];





if(
filtro.length===8 &&
validarNumero(filtro)
){


data =
data = data.filter(a=>
a.dni===filtro
);


}





const inicio =
PAGINA_ACTUAL *
PAGE_SIZE;



const lista =
data.slice(
inicio,
inicio+PAGE_SIZE
);






let columnas = "";



Object.keys(COLUMNAS)
.forEach(c=>{


if(
COLUMNAS[c].mostrar
)

columnas+=`

<th>

${COLUMNAS[c].titulo}

</th>

`;

});




columnas += "<th>Acciones</th>";





document
.querySelector(
"#tablaAfiliados thead tr"
)
.innerHTML =
columnas;





lista.forEach(a=>{



let fila="";



Object.keys(COLUMNAS)
.forEach(c=>{



if(
!COLUMNAS[c].mostrar
)
return;




let valor =
a[c] || "";



if(c==="fechaNacimiento")

valor =
a.fechaNacimiento||"";



fila+=`

<td>

${valor}

</td>

`;



});







fila+=`


<td>


<button onclick="AFILIADOS.editarAfiliado('${a.id}')">


<img

src="./iconos/edit.png"

class="iconoHistorial"


>


</button>




<button onclick="AFILIADOS.imprimir('${a.id}')">


<img

src="./iconos/print.png"


>


</button>





<button onclick="AFILIADOS.eliminarAfiliado('${a.id}')">


<img

src="./iconos/delete.png"


>


</button>


</td>


`;





tbody.innerHTML +=

`<tr>${fila}</tr>`;



});



}





// ===============================
// EXPORTAR AFILIADOS
// ===============================


function abrirExportarAfiliados(){



abrirModal(`


<h3>

Exportar Afiliados

</h3>



<label>

<input

type="checkbox"

id="exportTodo"

checked

>

Todo

</label>



<br>



<label>

<input

type="checkbox"

id="exportActivos"

>

Activos

</label>



<br>



<label>

<input

type="checkbox"

id="exportAdherentes"

>

Adherentes

</label>



<br><br>


<button id="btnExportarAfiliados">

Exportar

</button>


`);




document
.getElementById(
"btnExportarAfiliados"
)
.onclick =
exportarAfiliados;



}





function exportarAfiliados(){



let lista =
[...CACHE_AFILIADOS];




if(
document.getElementById(
"exportActivos"
).checked
){


lista =
lista.filter(
a=>a.estado==="ACTIVO"
);


}



if(
document.getElementById(
"exportAdherentes"
).checked
){


lista =
lista.filter(
a=>a.estado==="ADHERENTE"
);


}





let csv =

"\ufeffDNI;Nombre;Apellido;Celular;Correo;Estado;Dirección;Cargo;Provincia;Localidad;Nacimiento;Estado Civil\n";





lista.forEach(a=>{



csv +=


`${a.dni||""};`+

`${a.nombre||""};`+

`${a.apellido||""};`+

`${a.celular||""};`+

`${a.correo||""};`+

`${a.estado||""};`+

`${a.direccion||""};`+

`${a.cargo||""};`+

`${a.provincia||""};`+

`${a.localidad||""};`+

`${a.fechaNacimiento||""};`+

`${a.estadoCivil||""}\n`;



});





const blob =

new Blob(

[csv],

{

type:
"text/csv;charset=utf-8;"

}

);





const url =

URL.createObjectURL(blob);





const a =
document.createElement("a");



a.href=url;



a.download =
"ACDP_Afiliados.csv";



a.click();





setTimeout(()=>{

URL.revokeObjectURL(url);

cerrarModal();

},300);



}



// ===============================
// IMPRIMIR FICHA
// ===============================

async function imprimir(id){


const af =
CACHE_AFILIADOS.find(
a=>a.id===id
);


if(!af)return;



const fecha =
formatearFechaHora(
af.fechaAlta
);



const win =
window.open(
"",
"_blank",
"width=300,height=250"
);



win.document.write(`


<html>


<body style="
font-family:Arial;
text-align:center;
padding:5px;
font-size:10px;
">



<div style="

width:8cm;
height:4.5cm;

border:3px solid #A602AB;

border-radius:25px;

padding:6px;

box-sizing:border-box;

display:flex;

flex-direction:column;

">





<div style="

display:flex;

align-items:center;

height:100px;

">





<img

src="./iconos/logo.jpg"

style="

width:100px;
height:100px;

object-fit:cover;

border-radius:15px;

"



>





<div style="

flex:1;

text-align:left;

font-size:10px;

line-height:14px;

padding-left:8px;

">



<b style="font-size:12px;">

${af.nombre}
${af.apellido}

</b>


<br>

DNI: ${af.dni || ""}

<br>

Celular: ${af.celular || ""}

<br>

${af.correo || ""}

<br>

${af.estado || ""}

<br>

Fecha alta: ${fecha.fecha}



</div>



</div>






<p style="
font-size:9px;
text-align:center;
letter-spacing:5px;
margin:0;
line-height:10px;
">
${af.dni}
</p>

<img 
src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${af.dni}&scale=2&height=10"
style="
width:150px;
height:35px;
margin:2px auto 0 auto;
display:block;
">

</div>




<script>

window.onload=()=>{

window.print();

window.close();

}

</script>



</body>


</html>


`);



win.document.close();


}



// ===============================
// RESUMEN
// ===============================

function actualizarResumenAfiliados(){

const contar =
estado=>
CACHE_AFILIADOS.filter(
a=>a.estado===estado
).length;



const contarDuplicados =
campo=>{

const mapa={};

CACHE_AFILIADOS.forEach(a=>{

const valor=
String(a[campo]||"")
.trim()
.toLowerCase();

if(!valor)
return;

mapa[valor]=
(mapa[valor]||0)+1;

});

return Object
.values(mapa)
.filter(v=>v>1)
.reduce((t,v)=>t+v,0);

};



const set =
(id,v)=>{

const e=
document.querySelector(
id+" span"
);

if(e)
e.textContent=v;

};



set(
"#contadorActivos",
contar("ACTIVO")
);

set(
"#contadorAdherentes",
contar("ADHERENTE")
);

set(
"#contadorCorreosRepetidos",
contarDuplicados("correo")
);

set(
"#contadorDniRepetidos",
contarDuplicados("dni")
);

set(
"#contadorCelularesRepetidos",
contarDuplicados("celular")
);

}



// ===============================
// EXPORT
// ===============================


window.AFILIADOS = {


editarAfiliado,

eliminarAfiliado,

imprimir

};
