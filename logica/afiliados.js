// ===============================
// ACDP - AFILIADOS CONTROLLER
// Firebase CRUD + UI + impresión + paginación real + eliminación con motivo
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
// ESTADO PAGINACIÓN
// ===============================

let CACHE_AFILIADOS = [];
let PAGE_SIZE = 20;
let PAGINA_ACTUAL = 0;


// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    bindAfiliadosUI();

    cargarAfiliados(true);

});



// ===============================
// HELPERS
// ===============================

function generarNumeroAfiliado(){

    return String(
        Math.floor(Math.random()*99999999)+1
    ).padStart(8,"0");

}



function formatearFechaHora(date){

    const d=new Date(date);

    const dia=String(d.getDate()).padStart(2,"0");
    const mes=String(d.getMonth()+1).padStart(2,"0");
    const anio=String(d.getFullYear()).slice(-2);

    const horas=String(d.getHours()).padStart(2,"0");
    const minutos=String(d.getMinutes()).padStart(2,"0");


    return {

        fecha:
        `${dia}/${mes}/${anio}`,

        hora:
        `${horas}:${minutos}`

    };

}


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
            afiliado.nombre+" "+afiliado.apellido,


            dni:
            afiliado.dni,


            numeroAfiliado:
            afiliado.numeroAfiliado

        },

        detalle

    );

}



// ===============================
// UI
// ===============================

function bindAfiliadosUI(){


const btnNuevo =
document.getElementById("btnNuevoAfiliado");


if(btnNuevo)
btnNuevo.onclick=abrirCrearAfiliado;



const filtro =
document.getElementById("filtroAfiliados");


if(filtro){

filtro.oninput=()=>{

const val=filtro.value.trim();


if(val.length===8 || val.length===0){

renderAfiliados();
    
}

};

}



const anterior =
document.getElementById("afiliadosAnterior");


const siguiente =
document.getElementById("afiliadosSiguiente");



if(anterior)
anterior.onclick=()=>cambiarPagina(-1);


if(siguiente)
siguiente.onclick=()=>cambiarPagina(1);


}



// ===============================
// CARGAR
// ===============================

async function cargarAfiliados(reset=false){


const snap =
await getDocs(collection(db,"afiliados"));


CACHE_AFILIADOS=[];



snap.forEach(d=>{

CACHE_AFILIADOS.push({

id:d.id,
...d.data()

});

});



CACHE_AFILIADOS.sort((a,b)=>

new Date(b.fechaAlta) -
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

function cambiarPagina(dir){


const max =
Math.floor(
CACHE_AFILIADOS.length/PAGE_SIZE
);



PAGINA_ACTUAL+=dir;


if(PAGINA_ACTUAL<0)
PAGINA_ACTUAL=0;


if(PAGINA_ACTUAL>max)
PAGINA_ACTUAL=max;



renderAfiliados();


}



// ===============================
// VALIDACION
// ===============================

const soloTexto =
v=>/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v);


const soloNumeros =
v=>/^[0-9]+$/.test(v);



// ===============================
// MODAL
// ===============================

function abrirModal(html){


document
.getElementById("modalContenido")
.innerHTML=html;



document
.getElementById("modalFondo")
.classList.add("activo");



document
.getElementById("cerrarModal")
.onclick=cerrarModal;


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
// CREAR
// ===============================

function abrirCrearAfiliado(){


abrirModal(`

<h3>Nuevo Afiliado</h3>


<input id="aNombre" placeholder="Nombre"><br><br>

<input id="aApellido" placeholder="Apellido"><br><br>

<input id="aDni" placeholder="DNI" maxlength="8"><br><br>

<input id="aCelular" placeholder="Celular" maxlength="10"><br><br>

<input id="aCorreo" placeholder="Correo"><br><br>


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


setTimeout(()=>{


document
.getElementById("btnGuardarAfiliado")
.onclick=guardarAfiliado;


},100);


}



// ===============================
// GUARDAR
// ===============================

async function guardarAfiliado(){


const nuevo={


numeroAfiliado:
generarNumeroAfiliado(),


nombre:
document.getElementById("aNombre").value.trim(),


apellido:
document.getElementById("aApellido").value.trim(),


dni:
document.getElementById("aDni").value,


celular:
document.getElementById("aCelular").value,


correo:
document.getElementById("aCorreo").value.trim(),


estado:
document.getElementById("aEstado").value,


fechaAlta:
new Date().toISOString()


};



await addDoc(
collection(db,"afiliados"),
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
// TABLA
// ===============================

function renderAfiliados(){

const tbody =
document.querySelector("#tablaAfiliados tbody");


if(!tbody)return;


tbody.innerHTML="";



const filtro =
document.getElementById("filtroAfiliados")
?.value.trim() || "";



let data=[...CACHE_AFILIADOS];



if(
filtro.length===8 &&
soloNumeros(filtro)
){


data=data.filter(a=>

a.dni===filtro ||
a.numeroAfiliado===filtro

);


}



const inicio =
PAGINA_ACTUAL*PAGE_SIZE;



const lista =
data.slice(
inicio,
inicio+PAGE_SIZE
);




lista.forEach(a=>{


const f =
formatearFechaHora(a.fechaAlta);



tbody.innerHTML+=`


<tr>


<td>${a.numeroAfiliado||""}</td>


<td>${a.dni||""}</td>


<td>${a.nombre||""}</td>


<td>${a.apellido||""}</td>


<td>${a.celular||""}</td>


<td>${a.correo||""}</td>


<td>${a.estado||""}</td>


<td>
${f.fecha}
${f.hora}
</td>


<td>


<button onclick="AFILIADOS.editarAfiliado('${a.id}')">

Editar

</button>



<button onclick="AFILIADOS.imprimir('${a.id}')">

Imprimir

</button>



<button onclick="AFILIADOS.eliminarAfiliado('${a.id}')">

Eliminar

</button>


</td>


</tr>


`;


});


}




// ===============================
// EDITAR
// ===============================

async function editarAfiliado(id){


const af =
CACHE_AFILIADOS.find(
a=>a.id===id
);



if(!af)return;



abrirModal(`


<h3>Editar Afiliado</h3>


<input id="eNombre" value="${af.nombre}">


<br><br>


<input id="eApellido" value="${af.apellido}">


<br><br>


<input id="eDni" value="${af.dni}">


<br><br>


<input id="eCelular" value="${af.celular||""}">


<br><br>


<input id="eCorreo" value="${af.correo||""}">


<br><br>


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
.getElementById("btnEditarAfiliado")
.onclick=async()=>{


const actualizado={


nombre:
document.getElementById("eNombre").value.trim(),


apellido:
document.getElementById("eApellido").value.trim(),


dni:
document.getElementById("eDni").value,


celular:
document.getElementById("eCelular").value,


correo:
document.getElementById("eCorreo").value.trim(),


estado:
document.getElementById("eEstado").value


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

{

...actualizado,

numeroAfiliado:
af.numeroAfiliado

},

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


<h3>Eliminar Afiliado</h3>


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
.getElementById("btnConfirmarEliminar")
.onclick=async()=>{


const motivo =
document.getElementById("motivo")
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
// IMPRIMIR
// ===============================

async function imprimir(id){


const af =
CACHE_AFILIADOS.find(
a=>a.id===id
);



if(!af)return;



const win =
window.open(
"",
"_blank",
"width=300,height=400"
);



win.document.write(`

<html>

<body style="font-family:Arial;text-align:center">


<h3>ACDP</h3>


<p>
${af.nombre}
${af.apellido}
</p>


<p>
DNI:
${af.dni}
</p>


<p>
N°:
${af.numeroAfiliado}
</p>


<script>

window.print();

</script>


</body>

</html>

`);



win.document.close();


}

// ===============================
// VERIFICACIÓN DE DATOS REPETIDOS Y CONTEO
// ===============================


function actualizarResumenAfiliados(){


const activos =
CACHE_AFILIADOS.filter(a=>
a.estado==="ACTIVO"
).length;



const adherentes =
CACHE_AFILIADOS.filter(a=>
a.estado==="ADHERENTE"
).length;



const obtenerRepetidos=(campo)=>{


const mapa={};


CACHE_AFILIADOS.forEach(a=>{


const valor =
a[campo]?.trim();


if(!valor)return;


if(!mapa[valor])
mapa[valor]=[];


mapa[valor].push(a);


});


return Object.values(mapa)
.filter(x=>x.length>1)
.flat();


};



const correos =
obtenerRepetidos("correo");


const dnis =
obtenerRepetidos("dni");


const celulares =
obtenerRepetidos("celular");




const setTexto=(id,valor)=>{


const el =
document.querySelector(id+" span");


if(el)
el.textContent=valor;


};



setTexto("#contadorActivos",activos);


setTexto("#contadorAdherentes",adherentes);


setTexto("#contadorCorreosRepetidos",correos.length);


setTexto("#contadorDniRepetidos",dnis.length);


setTexto("#contadorCelularesRepetidos",celulares.length);




document
.getElementById("contadorActivos")
.onclick=null;


document
.getElementById("contadorAdherentes")
.onclick=null;



document
.getElementById("contadorCorreosRepetidos")
.onclick=()=>mostrarSoloRepetidos(correos);



document
.getElementById("contadorDniRepetidos")
.onclick=()=>mostrarSoloRepetidos(dnis);



document
.getElementById("contadorCelularesRepetidos")
.onclick=()=>mostrarSoloRepetidos(celulares);



}



function mostrarSoloRepetidos(lista){


const tbody =
document.querySelector("#tablaAfiliados tbody");


if(!tbody)return;


tbody.innerHTML="";



lista.forEach(a=>{


const f =
formatearFechaHora(a.fechaAlta);



tbody.innerHTML+=`


<tr>


<td>${a.numeroAfiliado||""}</td>

<td>${a.dni||""}</td>

<td>${a.nombre||""}</td>

<td>${a.apellido||""}</td>

<td>${a.celular||""}</td>

<td>${a.correo||""}</td>

<td>${a.estado||""}</td>

<td>${f.fecha} ${f.hora}</td>


<td>


<button onclick="AFILIADOS.editarAfiliado('${a.id}')">

Editar

</button>


<button onclick="AFILIADOS.imprimir('${a.id}')">

Imprimir

</button>


<button onclick="AFILIADOS.eliminarAfiliado('${a.id}')">

Eliminar

</button>


</td>


</tr>

`;

});


}

// ===============================
// EXPORT
// ===============================

window.AFILIADOS={


editarAfiliado,


eliminarAfiliado,


imprimir


};
