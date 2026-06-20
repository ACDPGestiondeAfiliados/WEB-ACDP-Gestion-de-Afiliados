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

    listaAfiliados=BD_afiliados;

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

    <input 
    id="nuevoDni" 
    placeholder="DNI"
    maxlength="8"
    inputmode="numeric">


    <input 
    id="nuevoNombre" 
    placeholder="Nombre"
    maxlength="20">


    <input 
    id="nuevoApellido" 
    placeholder="Apellido"
    maxlength="20">


    <button onclick="guardarNuevoAfiliado()">
        Guardar
    </button>

    `;


    fondo.classList.add("activo");


    aplicarValidacionesAfiliado();

}



// Validaciones de campos del modal

function aplicarValidacionesAfiliado(){

    const dni=document.getElementById("nuevoDni");
    const nombre=document.getElementById("nuevoNombre");
    const apellido=document.getElementById("nuevoApellido");


    dni.addEventListener("input",()=>{

        dni.value=dni.value
        .replace(/[^0-9]/g,"")
        .slice(0,8);

    });



    const validarTexto=(campo)=>{

        campo.value=campo.value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g,"")
        .slice(0,20);

    };


    nombre.addEventListener("input",()=>{

        validarTexto(nombre);

    });


    apellido.addEventListener("input",()=>{

        validarTexto(apellido);

    });

}



// Guarda afiliado nuevo

function guardarNuevoAfiliado(){

    const ultimoNumero=BD.afiliados.reduce(

        (max,a)=>{

            const numero=Number(a.numero)||0;

            return numero>max?numero:max;

        },

        0

    );


    const nuevoNumero=
    String(ultimoNumero+1).padStart(8,"0");



    const afiliado={


        dni:
        document.getElementById("nuevoDni").value,


        numero:
        nuevoNumero,


        nombre:
        document.getElementById("nuevoNombre").value,


        apellido:
        document.getElementById("nuevoApellido").value,


        estado:"Activo",


        fecha:
        new Date().toLocaleDateString()

    };



    BD_afiliados.push(afiliado);


    guardarBD();


    cerrarModal();


    cargarAfiliados();


    escribirConsola(
        "Nuevo afiliado registrado N° "+nuevoNumero
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
