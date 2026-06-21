// ===============================
// ACDP - AFILIADOS CONTROLLER
// Firebase CRUD + UI + impresión + paginación real + eliminación con motivo (HISTORIAL READY)
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

function generarNumeroAfiliado() {
    return String(Math.floor(Math.random() * 99999999) + 1).padStart(8, "0");
}

function formatearFechaHora(date) {
    const d = new Date(date);

    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = String(d.getFullYear()).slice(-2);

    const horas = String(d.getHours()).padStart(2, "0");
    const minutos = String(d.getMinutes()).padStart(2, "0");

    return {
        fecha: `${dia}/${mes}/${anio}`,
        hora: `${horas}:${minutos}`
    };
}

// ===============================
// LOG (LISTO PARA HISTORIAL.JS)
// ===============================

function crearLogEliminacion(af, motivo) {
    return {
        tipo: "ELIMINACION_AFILIADO",
        fecha: new Date().toISOString(),
        usuario: window.ACDP?.usuario || "SIN_USUARIO",
        rol: window.ACDP?.rol || "SIN_ROL",
        detalle: {
            numeroAfiliado: af.numeroAfiliado,
            dni: af.dni,
            nombre: af.nombre,
            apellido: af.apellido,
            motivo
        }
    };
}

// ===============================
// UI BIND
// ===============================

function bindAfiliadosUI() {
    const btnNuevo = document.getElementById("btnNuevoAfiliado");
    if (btnNuevo) btnNuevo.addEventListener("click", abrirCrearAfiliado);

    const filtro = document.getElementById("filtroAfiliados");

    if (filtro) {
        filtro.addEventListener("input", () => {
            const val = filtro.value.trim();

            if (val.length === 8 || val.length === 0) {
                renderAfiliados();
            }
        });
    }

    const btnPrev = document.getElementById("btnPrevAfiliados");
    const btnNext = document.getElementById("btnNextAfiliados");

    if (btnPrev) btnPrev.onclick = () => cambiarPagina(-1);
    if (btnNext) btnNext.onclick = () => cambiarPagina(1);
}

// ===============================
// CARGA FIRESTORE
// ===============================

async function cargarAfiliados(reset = false) {
    const snap = await getDocs(collection(db, "afiliados"));

    CACHE_AFILIADOS = [];

    snap.forEach(d => {
        CACHE_AFILIADOS.push({ id: d.id, ...d.data() });
    });

    CACHE_AFILIADOS.sort((a, b) =>
        new Date(b.fechaAlta) - new Date(a.fechaAlta)
    );

    if (reset) PAGINA_ACTUAL = 0;

    renderAfiliados();
}

// ===============================
// PAGINACIÓN
// ===============================

function cambiarPagina(dir) {
    const maxPage = Math.floor(CACHE_AFILIADOS.length / PAGE_SIZE);

    PAGINA_ACTUAL += dir;

    if (PAGINA_ACTUAL < 0) PAGINA_ACTUAL = 0;
    if (PAGINA_ACTUAL > maxPage) PAGINA_ACTUAL = maxPage;

    renderAfiliados();
}

// ===============================
// VALIDACIONES
// ===============================

const soloTexto = v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v);
const soloNumeros = v => /^[0-9]+$/.test(v);

// ===============================
// MODAL
// ===============================

function abrirModal(html) {
    const fondo = document.getElementById("modalFondo");
    const cont = document.getElementById("modalContenido");

    cont.innerHTML = html;
    fondo.classList.add("activo");

    document.getElementById("cerrarModal").onclick = cerrarModal;
}

function cerrarModal() {
    document.getElementById("modalContenido").innerHTML = "";
    document.getElementById("modalFondo").classList.remove("activo");
}

// ===============================
// GUARDAR
// ===============================

async function guardarAfiliado() {

    const nuevo = {

        numeroAfiliado: generarNumeroAfiliado(),

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


    if(window.registrarHistorial){

        window.registrarHistorial({

            afiliado:
            nuevo.nombre+" "+nuevo.apellido,

            dni:
            nuevo.dni,

            numeroAfiliado:
            nuevo.numeroAfiliado,

            detalleHistorial:
            "Afiliado dado de alta"

        });

    }


    cerrarModal();

    cargarAfiliados(true);

// ===============================
// IMPRESIÓN
// ===============================

async function imprimir(id) {
    const snap = await getDocs(collection(db, "afiliados"));

    let af = null;
    snap.forEach(d => {
        if (d.id === id) af = { id: d.id, ...d.data() };
    });

    const color = af.estado === "ACTIVO" ? "#A602AB" : "#FFB700";

    const win = window.open("", "_blank");

    win.document.write(`
<html>
<body>
<div style="width:8cm;height:6cm;border:3px solid ${color};
display:flex;padding:10px;font-family:Arial;">
    <div style="width:40%;display:flex;align-items:center;justify-content:center;">
        <img src="./iconos/logo.jpg" style="width:35%;">
    </div>

    <div style="width:60%;font-size:12px;">
        <div>${af.dni}</div>
        <div>${af.nombre}</div>
        <div>${af.apellido}</div>
        <div>${af.celular || ""}</div>
        <div>${af.correo}</div>
        <div>${af.numeroAfiliado}</div>

        <svg id="barcode"></svg>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

<script>
JsBarcode("#barcode","${af.numeroAfiliado}",{
    format:"CODE128",
    displayValue:false,
    width:1.5,
    height:40
});
window.onload = () => window.print();
</script>
</body>
</html>
    `);

    win.document.close();
}

// ===============================
// EXPORT
// ===============================

window.AFILIADOS = {
    editarAfiliado,
    eliminarAfiliado,
    imprimir
};
