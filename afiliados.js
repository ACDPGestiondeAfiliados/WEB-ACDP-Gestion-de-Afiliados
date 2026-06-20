// ===============================
// GESTIÓN DE AFILIADOS ACDP
// Altas, búsqueda, edición y páginas
// ===============================

let paginaActual=1;
const cantidadPagina=10;
let listaAfiliados=[];

document.addEventListener("DOMContentLoaded",()=>{

    iniciarAfiliados();

});

// ===============================
// UTIL: usuario activo
// ===============================
function getUsuarioActivo(){
    return window.usuarioActivo || sesion?.usuario || "Desconocido";
}

// ===============================
// UTIL: historial
// ===============================
function registrarHistorial(accion,afiliado,detalle){

    if(!Array.isArray(BD_historial)) return;

    const now=new Date();

    BD_historial.push({
        usuario:getUsuarioActivo(),
        afiliado:afiliado?.nombre+" "+afiliado?.apellido || "",
        dni:afiliado?.dni || "",
        numero:afiliado?.numero || "",
        fecha:now.toLocaleDateString(),
        hora:now.toLocaleTimeString(),
        accion:accion,
        detalle:detalle || ""
    });

    guardarBD();
}


// ===============================
// Inicialización
// ===============================

function iniciarAfiliados(){

    cargarAfiliados();

    eventosAfiliados();

    registrarHistorial("CONSULTA",null,"Ingreso a afiliados"); // NUEVO

}



// ===============================
// Eventos
// ===============================

function eventosAfiliados(){

    const filtro=document.getElementById("filtroAfiliados");
    const nuevo=document.getElementById("btnNuevoAfiliado");
    const anterior=document.getElementById("afiliadosAnterior");
    const siguiente=document.getElementById("afiliadosSiguiente");


    if(filtro){

        filtro.addEventListener("input",()=>{

            filtrarAfiliados(filtro.value);

        });

    }


    if(nuevo){

        nuevo.addEventListener("click",abrirNuevoAfiliado);

    }


    if(anterior){

        anterior.addEventListener("click",()=>{

            if(paginaActual>1){

                paginaActual--;

                mostrarTabla();

            }

        });

    }


    if(siguiente){

        siguiente.addEventListener("click",()=>{

            const total=Math.ceil(
                listaAfiliados.length/cantidadPagina
            );


            if(paginaActual<total){

                paginaActual++;

                mostrarTabla();

            }

        });

    }

}



// ===============================
// Cargar datos
// ===============================

function cargarAfiliados(){

    listaAfiliados=
    [...BD_afiliados].reverse();

    mostrarTabla();

}



// ===============================
// Buscar
// ===============================

function filtrarAfiliados(valor){

    valor=valor.trim();


    listaAfiliados=
    valor ? buscarAfiliado(valor) : BD_afiliados;


    paginaActual=1;

    mostrarTabla();

}



// ===============================
// Tabla
// ===============================

function mostrarTabla(){

    const tabla=document
    .getElementById("tablaAfiliados")
    .querySelector("tbody");


    tabla.innerHTML="";


    const inicio=(paginaActual-1)*cantidadPagina;


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

        <button onclick="editarAfiliado('${a.dni}')">
        Editar
        </button>


        <button onclick="eliminarAfiliado('${a.dni}')">
        Eliminar
        </button>

        <button onclick="imprimirAfiliado('${a.dni}')">
        Imprimir
        </button>

        </td>

        </tr>

        `;

    });


    document.getElementById("paginaAfiliados")
    .textContent=paginaActual;

}



// ===============================
// Nuevo afiliado
// ===============================

function abrirNuevoAfiliado(){

const contenido=document.getElementById("modalContenido");
const fondo=document.getElementById("modalFondo");


contenido.innerHTML=`

<h3>Nuevo afiliado</h3>


<input id="nuevoDni"
placeholder="DNI"
maxlength="8"
inputmode="numeric">


<input id="nuevoNombre"
placeholder="Nombre"
maxlength="20">


<input id="nuevoApellido"
placeholder="Apellido"
maxlength="20">


<input id="nuevoCelular"
placeholder="Celular"
maxlength="10"
inputmode="numeric">


<input id="nuevoCorreo"
placeholder="Correo"
maxlength="30">


<select id="nuevoEstado">

<option value="Activo">Activo</option>

<option value="Adherente">Adherente</option>

</select>


<button onclick="guardarNuevoAfiliado()">
Guardar
</button>

`;

fondo.classList.add("activo");


aplicarValidaciones(
["nuevoDni","nuevoCelular"],
["nuevoNombre","nuevoApellido"]
);

}



// ===============================
// Validaciones
// ===============================

function aplicarValidaciones(numeros,textos){


numeros.forEach(id=>{

const campo=document.getElementById(id);

if(campo){

campo.addEventListener("input",()=>{

campo.value=
campo.value.replace(/\D/g,"");

});

}

});



textos.forEach(id=>{

const campo=document.getElementById(id);

if(campo){

campo.addEventListener("input",()=>{

campo.value=
campo.value
.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g,"")
.slice(0,20);

});

}

});


}



// ===============================
// Guardar nuevo
// ===============================

function guardarNuevoAfiliado(){


const ultimo=BD_afiliados.reduce(
(m,a)=>Math.max(m,Number(a.numero)||0),
0
);


const numero=
String(ultimo+1).padStart(8,"0");



const nuevo={

dni:nuevoDni.value,

numero,

nombre:nuevoNombre.value,

apellido:nuevoApellido.value,

celular:nuevoCelular.value,

correo:nuevoCorreo.value,

estado:nuevoEstado.value,

fecha:new Date().toLocaleDateString()

};


BD_afiliados.push(nuevo);

guardarBD();

cerrarModal();

cargarAfiliados();

registrarHistorial("ALTA",nuevo,"Alta de afiliado"); // NUEVO

}



// ===============================
// Editar
// ===============================

function guardarEdicion(dni){


const a=BD_afiliados.find(x=>x.dni===dni);

if(!a)return;


a.dni=editarDni.value;

a.nombre=editarNombre.value;

a.apellido=editarApellido.value;

a.celular=editarCelular.value;

a.correo=editarCorreo.value;

a.estado=editarEstado.value;


guardarBD();

cerrarModal();

cargarAfiliados();

registrarHistorial("EDICION",a,"Modificación de afiliado"); // NUEVO

}



// ===============================
// Eliminar (MODAL CON MOTIVO)
// ===============================

function eliminarAfiliado(dni){

const a=BD_afiliados.find(x=>x.dni===dni);

if(!a)return;


const fondo=document.getElementById("modalFondo");
const contenido=document.getElementById("modalContenido");

contenido.innerHTML=`
<h3>Eliminar afiliado</h3>

<p>Motivo (5 a 40 caracteres)</p>

<input id="motivoEliminar" maxlength="40">

<div id="msgEliminar" style="color:red;font-size:12px;"></div>

<button id="btnConfirmarEliminar">Confirmar</button>
`;

fondo.classList.add("activo");


document.getElementById("btnConfirmarEliminar").onclick=()=>{

    const motivo=document.getElementById("motivoEliminar").value.trim();

    if(motivo.length<5 || motivo.length>40){
        document.getElementById("msgEliminar").textContent="Motivo inválido";
        return;
    }

    BD_afiliados=BD_afiliados.filter(x=>x.dni!==dni);

    guardarBD();
    cerrarModal();
    cargarAfiliados();

    registrarHistorial("BAJA",a,motivo); // NUEVO

};

}



// ===============================
// IMPRIMIR
// ===============================

function imprimirAfiliado(dni){

const afiliado=
BD_afiliados.find(a=>a.dni===dni);

if(!afiliado)return;


registrarHistorial("IMPRESION",afiliado,"Impresión de carnet"); // NUEVO


generarPDF({

    numero:afiliado.numero||"",
    dni:afiliado.dni||"",
    nombre:afiliado.nombre||"",
    apellido:afiliado.apellido||"",
    celular:afiliado.celular||"",
    correo:afiliado.correo||"",
    estado:afiliado.estado||"Activo",
    fecha:afiliado.fecha||""

});

}



// ===============================
// Cerrar modal
// ===============================

function cerrarModal(){

document
.getElementById("modalFondo")
.classList.remove("activo");

}
