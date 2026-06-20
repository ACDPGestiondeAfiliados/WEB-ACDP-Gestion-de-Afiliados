// ===============================
// GESTIÓN DE AFILIADOS ACDP
// Altas, búsqueda, tabla, edición y páginas
// ===============================


let paginaActual=1;
const cantidadPagina=10;
let listaAfiliados=[];



document.addEventListener("DOMContentLoaded",()=>{

    iniciarAfiliados();

});



// ===============================
// Inicialización
// ===============================

function iniciarAfiliados(){

    cargarAfiliados();

    eventosAfiliados();

}



// ===============================
// Eventos principales
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
// Carga datos
// ===============================

function cargarAfiliados(){

    listaAfiliados=BD_afiliados;

    mostrarTabla();

}



// ===============================
// Filtro
// ===============================

function filtrarAfiliados(valor){


    valor=valor.trim();



    if(!valor){

        listaAfiliados=BD_afiliados;

    }else{

        listaAfiliados=buscarAfiliado(valor);

    }



    paginaActual=1;


    mostrarTabla();

}



// ===============================
// Tabla afiliados
// ===============================

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


                <button onclick="eliminarAfiliado('${a.dni}')">

                Eliminar

                </button>


            </td>


        </tr>


        `;


    });



    document.getElementById("paginaAfiliados")
    .textContent=paginaActual;


}



// ===============================
// Modal nuevo afiliado
// ===============================

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


    <input
    id="nuevoCelular"
    placeholder="Celular"
    maxlength="15"
    inputmode="numeric">


    <input
    id="nuevoCorreo"
    placeholder="Correo"
    maxlength="20">


    <select id="nuevoEstado">

        <option value="Activo">
        Activo
        </option>

        <option value="Adherente">
        Adherente
        </option>

    </select>


    <button onclick="guardarNuevoAfiliado()">

    Guardar

    </button>


    `;



    fondo.classList.add("activo");


    aplicarValidacionesAfiliado();

}



// ===============================
// Validaciones nuevo
// ===============================

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

// ===============================
// GESTIÓN DE AFILIADOS ACDP
// Altas, búsqueda, tabla, edición y páginas
// ===============================


let paginaActual=1;
const cantidadPagina=10;
let listaAfiliados=[];



document.addEventListener("DOMContentLoaded",()=>{

    iniciarAfiliados();

});



// ===============================
// Inicialización
// ===============================

function iniciarAfiliados(){

    cargarAfiliados();

    eventosAfiliados();

}



// ===============================
// Eventos principales
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
// Carga datos
// ===============================

function cargarAfiliados(){

    listaAfiliados=BD_afiliados;

    mostrarTabla();

}



// ===============================
// Filtro
// ===============================

function filtrarAfiliados(valor){


    valor=valor.trim();



    if(!valor){

        listaAfiliados=BD_afiliados;

    }else{

        listaAfiliados=buscarAfiliado(valor);

    }



    paginaActual=1;


    mostrarTabla();

}



// ===============================
// Tabla afiliados
// ===============================

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


                <button onclick="eliminarAfiliado('${a.dni}')">

                Eliminar

                </button>


            </td>


        </tr>


        `;


    });



    document.getElementById("paginaAfiliados")
    .textContent=paginaActual;


}



// ===============================
// Modal nuevo afiliado
// ===============================

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


    <input
    id="nuevoCelular"
    placeholder="Celular"
    maxlength="15"
    inputmode="numeric">


    <input
    id="nuevoCorreo"
    placeholder="Correo"
    maxlength="20">


    <select id="nuevoEstado">

        <option value="Activo">
        Activo
        </option>

        <option value="Adherente">
        Adherente
        </option>

    </select>


    <button onclick="guardarNuevoAfiliado()">

    Guardar

    </button>


    `;



    fondo.classList.add("activo");


    aplicarValidacionesAfiliado();

}



// ===============================
// Validaciones nuevo
// ===============================

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
