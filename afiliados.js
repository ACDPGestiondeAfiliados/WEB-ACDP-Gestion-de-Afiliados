// ===============================
// GESTIÓN DE AFILIADOS ACDP
// Altas, búsqueda, tabla y páginas
// ===============================


let paginaActual=1;
const cantidadPagina=10;
let listaAfiliados=[];


document.addEventListener("DOMContentLoaded",()=>{

    iniciarAfiliados();

});


// Inicialización del módulo

function iniciarAfiliados(){

    cargarAfiliados();

    eventosAfiliados();

}



// Eventos principales

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

        nuevo.addEventListener("click",()=>{

            abrirNuevoAfiliado();

        });

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

            const total=Math.ceil(listaAfiliados.length/cantidadPagina);

            if(paginaActual<total){

                paginaActual++;

                mostrarTabla();

            }

        });

    }

}



// Carga datos desde BD

function cargarAfiliados(){

    listaAfiliados=BD.afiliados;

    mostrarTabla();

}



// Filtrado por DNI o número

function filtrarAfiliados(valor){

    valor=valor.trim();


    if(!valor){

        listaAfiliados=BD.afiliados;

    }else{

        listaAfiliados=buscarAfiliado(valor);

    }


    paginaActual=1;

    mostrarTabla();

}



// Render de tabla

function mostrarTabla(){

    const tabla=document
    .getElementById("tablaAfiliados")
    .querySelector("tbody");


    tabla.innerHTML="";


    const inicio=(paginaActual-1)*cantidadPagina;

    const datos=listaAfiliados.slice(
        inicio,
        inicio+cantidadPagina
    );


    datos.forEach(a=>{


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
            </td>
        </tr>

        `;

    });


    document.getElementById("paginaAfiliados")
    .textContent=paginaActual;

}



// Abre modal para nuevo afiliado

function abrirNuevoAfiliado(){

    const fondo=document.getElementById("modalFondo");
    const contenido=document.getElementById("modalContenido");


    contenido.innerHTML=`

    <h3>Nuevo afiliado</h3>

    <input id="nuevoDni" placeholder="DNI">

    <input id="nuevoNumero" placeholder="Nro afiliado">

    <input id="nuevoNombre" placeholder="Nombre">

    <input id="nuevoApellido" placeholder="Apellido">

    <button onclick="guardarNuevoAfiliado()">
        Guardar
    </button>

    `;


    fondo.classList.add("activo");

}



// Guarda afiliado nuevo

function guardarNuevoAfiliado(){

    const afiliado={

        dni:
        document.getElementById("nuevoDni").value,

        numero:
        document.getElementById("nuevoNumero").value,

        nombre:
        document.getElementById("nuevoNombre").value,

        apellido:
        document.getElementById("nuevoApellido").value,

        estado:"Activo",

        fecha:
        new Date().toLocaleDateString()

    };


    BD.afiliados.push(afiliado);

    guardarBD();


    cerrarModal();

    cargarAfiliados();

    escribirConsola(
        "Nuevo afiliado registrado"
    );

}



// Cierra modal global

function cerrarModal(){

    document
    .getElementById("modalFondo")
    .classList.remove("activo");

}



// Preparado para edición futura

function editarAfiliado(dni){

    console.log(
        "Editar afiliado:",
        dni
    );

}
