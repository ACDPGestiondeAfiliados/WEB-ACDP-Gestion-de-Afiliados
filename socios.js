// ======================================================
// ACDP - PORTAL DE AFILIADOS
// socios.js
// PARTE 1A
// Inicio + Login + Navegación Base
// ======================================================

import {
    db,
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    getDoc
} from "./firebase.js";


// ======================================================
// ESTADO
// ======================================================

let socioActual = null;
let cursos = [];
let novedades = [];

const PIN_MASTER = "2015";


// ======================================================
// ELEMENTOS
// ======================================================

const $ = (id) => document.getElementById(id);


// ======================================================
// INICIO
// ======================================================

document.addEventListener("DOMContentLoaded", iniciarPortal);

function iniciarPortal() {

    activarSoloNumeros();

    // Login
    $("btnLoginSocio").addEventListener("click", ingresarSocio);

    // Cuenta
    $("btnGuardarCuenta").addEventListener("click", guardarCuenta);

    // Menú
    $("btnOpciones").addEventListener("click", toggleMenu);

    // Navegación
    document
        .querySelectorAll("[data-seccion]")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                mostrarSeccion(btn.dataset.seccion);

                ocultarMenu();

            });

        });

    // Salir

    $("btnCerrarSesion")
        .addEventListener("click", cerrarSesion);

}


// ======================================================
// INPUTS NUMÉRICOS
// ======================================================

function activarSoloNumeros() {

    [

        "loginNumero",
        "loginPin",
        "nuevoPin",
        "nuevoCelular"

    ].forEach(id => {

        const input = $(id);

        if (!input) return;

        input.addEventListener("input", () => {

            input.value =
                input.value.replace(/\D/g, "");

        });

    });

}


// ======================================================
// LOGIN
// ======================================================

async function ingresarSocio() {

    const dni =
        $("loginNumero").value.trim();

    const pin =
        $("loginPin").value.trim();

    const mensaje =
        $("mensajeLogin");

    mensaje.textContent = "";

    if (dni.length !== 8) {

        mensaje.textContent =
            "Ingrese un DNI válido.";

        return;

    }

    try {

        const snap =
            await getDocs(
                collection(db, "afiliados")
            );

        let encontrado = null;

        snap.forEach(docu => {

            const socio = {

                id: docu.id,
                ...docu.data()

            };

            if (socio.dni === dni) {

                encontrado = socio;

            }

        });

        if (!encontrado) {

            mensaje.textContent =
                "Afiliado inexistente.";

            return;

        }

        if (encontrado.estado === "Eliminado") {

            mensaje.textContent =
                "La cuenta está deshabilitada.";

            return;

        }

        const pinCorrecto =
            encontrado.pinAsociado || "1111";

        if (
            pin !== pinCorrecto &&
            pin !== PIN_MASTER
        ) {

            mensaje.textContent =
                "PIN incorrecto.";

            return;

        }

        socioActual = encontrado;

        await mostrarPerfil();

        await cargarPortalCompleto();

    }

    catch (error) {

        console.error(error);

        mensaje.textContent =
            "No fue posible iniciar sesión.";

    }

}


// ======================================================
// PERFIL
// ======================================================

async function mostrarPerfil(){

    $("loginSocio")
    .classList.add("oculto");


    $("menuOpciones")
    .classList.remove("oculto");


    // Al ingresar, mostrar novedades primero
    mostrarSeccion("novedades");


    cargarDatosPerfil();


    cargarDatosCuenta();


    await cargarValorCuota();


    actualizarEstadoCuotas();

}


// ======================================================
// DATOS DEL PERFIL
// ======================================================

function cargarDatosPerfil() {

    if (!socioActual) return;

    escribir("datoDni", socioActual.dni);

    escribir("datoNombre", socioActual.nombre);

    escribir("datoApellido", socioActual.apellido);

    escribir("datoCelular", socioActual.celular);

    escribir("datoCorreo", socioActual.correo);

    escribir("datoEstado", socioActual.estado);

    escribir(

        "datoFechaAlta",

        formatearFechaHora(
            socioActual.fechaAlta
        )

    );

}


// ======================================================
// DATOS CUENTA
// ======================================================

function cargarDatosCuenta() {

    if (!socioActual) return;

    $("nuevoCorreo").value =
        socioActual.correo || "";

    $("nuevoCelular").value =
        socioActual.celular || "";

    $("nuevoPin").value = "";

}


// ======================================================
// VALOR CUOTA
// ======================================================

async function cargarValorCuota() {

    try {

        const ref =
            doc(
                db,
                "configuracion",
                "general"
            );

        const snap =
            await getDoc(ref);

        if (!snap.exists()) {

            $("valorCuota").textContent =
                "$0";

            return;

        }

        const datos = snap.data();

        $("valorCuota").textContent =
            "$" + (datos.monto || 0);

    }

    catch {

        $("valorCuota").textContent =
            "$0";

    }

}


// ======================================================
// ESCRIBIR TEXTO
// ======================================================

function escribir(id, valor) {

    const elemento = $(id);

    if (!elemento) return;

    elemento.textContent =
        valor ?? "";

}

// ======================================================
// PARTE 1B
// Navegación + Menú + Helpers
// Continuación de la Parte 1A
// ======================================================


// ======================================================
// MOSTRAR SECCIONES
// ======================================================

function mostrarSeccion(seccion) {

    const secciones = {

        perfil: $("seccionPerfil"),
        cuenta: $("seccionCuenta"),
        cursos: $("seccionCursos"),
        novedades: $("seccionNovedades")

    };

    Object.values(secciones).forEach(sec => {

        if (sec) {

            sec.classList.add("oculto");

        }

    });

    if (secciones[seccion]) {

        secciones[seccion]
            .classList.remove("oculto");

    }

}


// ======================================================
// MENÚ FLOTANTE
// ======================================================

function toggleMenu() {

    $("panelOpciones")
        .classList.toggle("oculto");

}

function ocultarMenu() {

    $("panelOpciones")
        .classList.add("oculto");

}


// ======================================================
// CERRAR MENÚ AL HACER CLICK AFUERA
// ======================================================

document.addEventListener("click", e => {

    const menu = $("menuOpciones");
    const panel = $("panelOpciones");
    const boton = $("btnOpciones");

    if (!menu || !panel || !boton) return;

    if (

        !menu.contains(e.target) &&
        !boton.contains(e.target)

    ) {

        ocultarMenu();

    }

});


// ======================================================
// CERRAR SESIÓN
// ======================================================

function cerrarSesion() {

    socioActual = null;

    cursos = [];

    novedades = [];

    $("loginNumero").value = "";
    $("loginPin").value = "";
    $("mensajeLogin").textContent = "";

    $("loginSocio")
        .classList.remove("oculto");

    $("menuOpciones")
        .classList.add("oculto");

    ocultarMenu();

    [

        "seccionPerfil",
        "seccionCuenta",
        "seccionCursos",
        "seccionNovedades"

    ].forEach(id => {

        const sec = $(id);

        if (sec) {

            sec.classList.add("oculto");

        }

    });

}


// ======================================================
// FORMATEAR FECHA Y HORA
// ======================================================

function formatearFechaHora(valor) {

    if (!valor) return "";

    const fecha = new Date(valor);

    if (isNaN(fecha)) return "";

    const dia =
        String(fecha.getDate())
        .padStart(2, "0");

    const mes =
        String(fecha.getMonth() + 1)
        .padStart(2, "0");

    const anio =
        fecha.getFullYear();

    const hora =
        String(fecha.getHours())
        .padStart(2, "0");

    const minuto =
        String(fecha.getMinutes())
        .padStart(2, "0");

    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;

}


// ======================================================
// FORMATEAR FECHA SIMPLE
// ======================================================

function formatearFecha(valor) {

    if (!valor) return "";

    const fecha =
        new Date(valor + "T00:00:00");

    if (isNaN(fecha)) return "";

    const dia =
        String(fecha.getDate())
        .padStart(2, "0");

    const mes =
        String(fecha.getMonth() + 1)
        .padStart(2, "0");

    const anio =
        fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;

}


// ======================================================
// MOSTRAR / OCULTAR CUOTAS
// ======================================================

function actualizarEstadoCuotas() {

    if (!socioActual) return;

    const contenedor =
        $("contenedorCuotas");

    if (!contenedor) return;

    if (

        String(socioActual.estado)
            .trim()
            .toUpperCase() === "ADHERENTE"

    ) {

        contenedor
            .classList.remove("oculto");

    }

    else {

        contenedor
            .classList.add("oculto");

    }

}


// ======================================================
// REFRESCAR PERFIL
// ======================================================

function refrescarPerfil() {

    if (!socioActual) return;

    cargarDatosPerfil();

    cargarDatosCuenta();

    actualizarEstadoCuotas();

}


// ======================================================
// UTILIDAD
// ======================================================

function limpiarHTML(id) {

    const el = $(id);

    if (el) {

        el.innerHTML = "";

    }

}


// ======================================================
// FIN PARTE 1B
// ======================================================
// ======================================================
// PARTE 2
// MI CUENTA
// Edición de datos del afiliado
// ======================================================


// ======================================================
// GUARDAR CAMBIOS DE CUENTA
// ======================================================

async function guardarCuenta() {

    if (!socioActual) {

        return;

    }


    const nuevoPin =
        $("nuevoPin")
        .value
        .trim();


    const nuevoCorreo =
        $("nuevoCorreo")
        .value
        .trim();


    const nuevoCelular =
        $("nuevoCelular")
        .value
        .trim();



    // ===============================
    // VALIDACIONES
    // ===============================


    if (nuevoPin !== "") {


        if (nuevoPin.length !== 4) {


            alert(
                "El PIN debe tener 4 números."
            );


            return;


        }



        if (nuevoPin === PIN_MASTER) {


            alert(
                "Ese PIN está reservado."
            );


            return;


        }


    }



    if (

        nuevoCelular !== "" &&
        nuevoCelular.length < 6

    ) {


        alert(
            "Ingrese un celular válido."
        );


        return;


    }



    if (

        nuevoCorreo !== "" &&
        !validarCorreo(nuevoCorreo)

    ) {


        alert(
            "Ingrese un correo válido."
        );


        return;


    }



    try {


        const datosActualizar = {

            correo:
                nuevoCorreo,


            celular:
                nuevoCelular

        };



        if (nuevoPin !== "") {


            datosActualizar.pinAsociado =
                nuevoPin;


        }



        await updateDoc(

            doc(
                db,
                "afiliados",
                socioActual.id
            ),

            datosActualizar

        );



        // Actualizar memoria local


        socioActual.correo =
            nuevoCorreo;


        socioActual.celular =
            nuevoCelular;



        if (nuevoPin !== "") {


            socioActual.pinAsociado =
                nuevoPin;


        }



        alert(
            "Datos actualizados correctamente."
        );



        $("nuevoPin").value = "";



        refrescarPerfil();


    }


    catch(error) {


        console.error(
            "Error guardando cuenta:",
            error
        );


        alert(
            "No fue posible guardar los cambios."
        );


    }


}




// ======================================================
// VALIDAR CORREO
// ======================================================

function validarCorreo(correo) {


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(correo);


}




// ======================================================
// CAMBIAR SECCIÓN DESDE CUENTA
// ======================================================

function abrirCuenta() {


    mostrarSeccion(
        "cuenta"
    );


}




// ======================================================
// ACTUALIZAR PERFIL DESDE FIREBASE
// ======================================================

async function recargarDatosSocio() {


    if (!socioActual)
        return;



    try {


        const snap =
            await getDoc(

                doc(
                    db,
                    "afiliados",
                    socioActual.id
                )

            );



        if (
            snap.exists()
        ) {


            socioActual = {

                id:
                    snap.id,

                ...snap.data()

            };



            refrescarPerfil();


        }


    }


    catch(error) {


        console.error(
            error
        );


    }


}


// ======================================================
// FIN PARTE 2
// ======================================================

// ======================================================
// PARTE 3
// CURSOS + NOVEDADES + CUOTAS
// ======================================================


// ======================================================
// CURSOS
// ======================================================

async function cargarCursos() {


    cursos = [];


    const lista =
        $("listaCursosSocio");


    if (!lista)
        return;



    lista.innerHTML =
        "";



    try {


        const snap =
            await getDocs(

                collection(
                    db,
                    "cursos"
                )

            );



        const hoy =
            new Date()
                .toISOString()
                .split("T")[0];



        for (const item of snap.docs) {



            const curso = {

                id:
                    item.id,

                ...item.data()

            };




            // eliminar cursos vencidos

            if (

                curso.fechaCierre &&
                curso.fechaCierre < hoy

            ) {



                await deleteDoc(

                    doc(
                        db,
                        "cursos",
                        curso.id
                    )

                );



                continue;

            }



            cursos.push(
                curso
            );


        }




        cursos.sort(
            (a,b)=>

                new Date(a.fechaInicio)
                -
                new Date(b.fechaInicio)

        );



        mostrarCursos();


    }


    catch(error) {


        console.error(
            "Error cursos:",
            error
        );


        lista.innerHTML =
        `

        <p>
        No se pudieron cargar los cursos.
        </p>

        `;


    }


}



// ======================================================
// MOSTRAR CURSOS
// ======================================================

function mostrarCursos() {


    const lista =
        $("listaCursosSocio");



    if (!lista)
        return;



    lista.innerHTML =
        "";



    if (cursos.length === 0) {


        lista.innerHTML =
        `

        <p>
        No hay cursos disponibles
        actualmente.
        </p>

        `;


        return;

    }



    cursos.forEach(c => {



        lista.innerHTML +=

        `

        <div class="cursoCard">


            <h3>
            ${c.titulo || "Curso ACDP"}
            </h3>


            <p>

            Inicio:
            ${formatearFecha(c.fechaInicio)}

            </p>


            <p>

            Cierre:
            ${formatearFecha(c.fechaCierre)}

            </p>


            ${
                c.descripcion
                ?
                `<p>${c.descripcion}</p>`
                :
                ""
            }


        </div>


        `;


    });


}




// ======================================================
// NOVEDADES
// Notificaciones acumulativas
// ======================================================


async function cargarNovedades(){


    novedades = [];


    const lista =
        $("listaNovedades");



    if(!lista)
        return;



    lista.innerHTML = "";



    try {


        const snap =
            await getDocs(

                collection(
                    db,
                    "notificaciones"
                )

            );



        snap.forEach(d=>{


            novedades.push({

                id:d.id,

                ...d.data()

            });


        });



        // Más recientes primero

        novedades.sort((a,b)=>{


            return new Date(b.fecha)
            -
            new Date(a.fecha);


        });

        // Mostrar solamente las últimas 5 novedades

novedades =
    novedades.slice(0,5);




        if(novedades.length===0){


            lista.innerHTML = `

            <p>
            No hay novedades disponibles.
            </p>

            `;


            return;


        }





        novedades.forEach(n=>{



            lista.innerHTML += `


            <div class="novedadCard">


                <h3>

                ${n.titulo || "ACDP"}

                </h3>



                <p class="fechaNovedad">

                ${formatearFechaHoraSimple(n.fecha)}

                </p>



                <p>

                ${n.cuerpo || ""}

                </p>


            </div>


            `;



        });



    }


    catch(error){


        console.error(
            "Error cargando novedades:",
            error
        );


        lista.innerHTML = `

        <p>
        No se pudieron cargar las novedades.
        </p>

        `;


    }



}





// ======================================================
// FECHA NOTIFICACIONES
// Solo fecha sin hora
// ======================================================

function formatearFechaHoraSimple(valor){


    if(!valor)
        return "";



    const fecha =
        new Date(valor);



    if(isNaN(fecha))
        return "";



    const dia =
        String(fecha.getDate())
        .padStart(2,"0");



    const mes =
        String(fecha.getMonth()+1)
        .padStart(2,"0");



    const anio =
        fecha.getFullYear();



    return `${dia}/${mes}/${anio}`;


}




// ======================================================
// CUOTAS
// ======================================================

async function mostrarCuotas() {


    if (!socioActual)
        return;



    const caja =
        $("cuotasSocio");



    if (!caja)
        return;



    caja.innerHTML =
        "";



    const meses = [

        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"

    ];



    const año =
        new Date()
        .getFullYear();



    let pagados = [];



    try {


        const snap =
            await getDocs(

                collection(
                    db,
                    "cobros"
                )

            );



        snap.forEach(d => {



            const cobro =
                d.data();



            if (

                cobro.dni === socioActual.dni &&
                cobro.anio === año &&
                cobro.estado !== "Anulado"

            ) {



                (cobro.meses || [])
                .forEach(m => {



                    if (
                        !pagados.includes(m)
                    )

                        pagados.push(m);



                });


            }


        });




        meses.forEach(m => {



            const pagado =
                pagados.includes(m);



            caja.innerHTML +=


            `

            <div class="
cuotaMes
${pagado ? "cuotaPagada" : "cuotaPendiente"}
">


            ${m}


            <br>


            ${
                pagado
                ?
                "PAGADO"
                :
                "PENDIENTE"

            }


            </div>


            `;



        });



    }


    catch(error) {


        console.error(
            "Error cuotas:",
            error
        );


    }



}




// ======================================================
// CARGA COMPLETA DEL PORTAL
// ======================================================

async function cargarPortalCompleto() {


    await cargarCursos();


    await cargarNovedades();


    await mostrarCuotas();


    actualizarEstadoCuotas();


}



// ======================================================
// FIN SOCIOS.JS
// ======================================================
