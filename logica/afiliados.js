// ===============================
// ACDP - AFILIADOS CONTROLLER
// Firebase CRUD + UI + paginación + impresión
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
// ESTADO LOCAL
// ===============================

let AFILIADOS_CACHE = [];
let PAGINA = 0;
const POR_PAGINA = 20;

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    bindAfiliadosUI();
    renderAfiliados();
});

// ===============================
// UI BIND
// ===============================

function bindAfiliadosUI() {
    document.getElementById("btnNuevoAfiliado")?.addEventListener("click", abrirCrearAfiliado);
    document.getElementById("filtroAfiliados")?.addEventListener("input", () => {
        PAGINA = 0;
        renderAfiliados();
    });

    document.getElementById("afiliadosAnterior")?.addEventListener("click", () => {
        if (PAGINA > 0) PAGINA--;
        renderAfiliados();
    });

    document.getElementById("afiliadosSiguiente")?.addEventListener("click", () => {
        PAGINA++;
        renderAfiliados();
    });
}

// ===============================
// VALIDACIONES
// ===============================

const soloTexto = v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v);
const soloNum = v => /^[0-9]*$/.test(v);
const soloEmail = v => v.length <= 30;

// ===============================
// GENERAR NRO AFILIADO ÚNICO
// ===============================

function generarNumero() {
    const existente = new Set(AFILIADOS_CACHE.map(a => a.numero));
    let num;

    do {
        num = String(Math.floor(Math.random() * 99999999) + 1).padStart(8, "0");
    } while (existente.has(num));

    return num;
}

// ===============================
// MODAL
// ===============================

function abrirModal(html) {
    const f = document.getElementById("modalFondo");
    document.getElementById("modalContenido").innerHTML = html;
    f.classList.add("activo");
    document.getElementById("cerrarModal").onclick = cerrarModal;
}

function cerrarModal() {
    document.getElementById("modalContenido").innerHTML = "";
    document.getElementById("modalFondo").classList.remove("activo");
}

// ===============================
// CREAR
// ===============================

function abrirCrearAfiliado() {
    abrirModal(`
        <h3>Nuevo Afiliado</h3>

        <input id="aNombre" placeholder="Nombre"><br><br>
        <input id="aApellido" placeholder="Apellido"><br><br>
        <input id="aDni" placeholder="DNI" maxlength="8"><br><br>

        <input id="aCelular" placeholder="Celular (opcional)" maxlength="10"><br><br>

        <input id="aCorreo" placeholder="Correo (max 30)" maxlength="30"><br><br>

        <select id="aEstado">
            <option value="ADHERENTE" selected>ADHERENTE</option>
            <option value="ACTIVO">ACTIVO</option>
        </select>

        <br><br>

        <button id="btnGuardarAfiliado" disabled>Guardar</button>
    `);

    setTimeout(() => {
        const n = a("aNombre");
        const ap = a("aApellido");
        const d = a("aDni");
        const c = a("aCelular");
        const e = a("aCorreo");
        const b = a("btnGuardarAfiliado");

        function a(id){return document.getElementById(id);}

        function validar() {
            const ok =
                soloTexto(n.value) &&
                soloTexto(ap.value) &&
                d.value.length === 8 &&
                soloNum(d.value) &&
                (c.value === "" || c.value.length <= 10) &&
                e.value.length <= 30;

            b.disabled = !ok;
        }

        n.oninput = () => { n.value = n.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""); validar(); };
        ap.oninput = () => { ap.value = ap.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""); validar(); };
        d.oninput = () => { d.value = d.value.replace(/[^0-9]/g, ""); validar(); };
        c.oninput = () => { c.value = c.value.replace(/[^0-9]/g, ""); validar(); };
        e.oninput = validar;

        b.onclick = guardarAfiliado;
    }, 100);
}

// ===============================
// GUARDAR
// ===============================

async function guardarAfiliado() {
    const numero = generarNumero();

    await addDoc(collection(db, "afiliados"), {
        numero,
        nombre: v("aNombre"),
        apellido: v("aApellido"),
        dni: v("aDni"),
        celular: v("aCelular"),
        correo: v("aCorreo"),
        estado: document.getElementById("aEstado").value,
        fecha: Date.now()
    });

    cerrarModal();
    renderAfiliados();
}

function v(id){return document.getElementById(id).value.trim();}

// ===============================
// RENDER + PAGINACIÓN
// ===============================

async function renderAfiliados() {
    const tbody = document.querySelector("#tablaAfiliados tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const snap = await getDocs(collection(db, "afiliados"));

    AFILIADOS_CACHE = [];

    snap.forEach(d => {
        AFILIADOS_CACHE.push({ id: d.id, ...d.data() });
    });

    AFILIADOS_CACHE.sort((a,b) => b.fecha - a.fecha);

    const filtro = (document.getElementById("filtroAfiliados")?.value || "").toLowerCase();

    let filtrados = AFILIADOS_CACHE.filter(a =>
        a.dni.includes(filtro) ||
        a.nombre.toLowerCase().includes(filtro)
    );

    const inicio = PAGINA * POR_PAGINA;
    const page = filtrados.slice(inicio, inicio + POR_PAGINA);

    page.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.numero}</td>
            <td>${a.dni}</td>
            <td>${a.nombre}</td>
            <td>${a.apellido}</td>
            <td>${a.celular || ""}</td>
            <td>${a.correo}</td>
            <td>${a.estado}</td>
            <td>
                <button onclick="AFILIADOS.editar('${a.id}')">Editar</button>
                <button onclick="AFILIADOS.eliminar('${a.id}')">Eliminar</button>
                <button onclick="AFILIADOS.imprimir('${a.id}')">Imprimir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ===============================
// EDITAR / ELIMINAR
// ===============================

async function editar(id){ /* igual simple */ }
async function eliminar(id){ await deleteDoc(doc(db,"afiliados",id)); renderAfiliados(); }

// ===============================
// IMPRESIÓN PNG
// ===============================

function imprimir(id) {
    const a = AFILIADOS_CACHE.find(x => x.id === id);
    if (!a) return;

    const color = a.estado === "ACTIVO" ? "#A602AB" : "#FFB700";

    const div = document.createElement("div");

    div.style = `
        width:8cm;
        height:6cm;
        border:3px solid ${color};
        display:flex;
        font-family:Arial;
        background:white;
    `;

    div.innerHTML = `
        <div style="width:35%;display:flex;align-items:center;justify-content:center;">
            <img src="logo.jpg" style="width:80%;height:auto;">
        </div>

        <div style="width:65%;font-size:10px;padding:5px;">
            <b>DNI:</b> ${a.dni}<br>
            <b>Nombre:</b> ${a.nombre}<br>
            <b>Apellido:</b> ${a.apellido}<br>
            <b>Celular:</b> ${a.celular || ""}<br>
            <b>Correo:</b> ${a.correo}<br>
            <b>Nro:</b> ${a.numero}<br>
            <div id="barcode"></div>
        </div>
    `;

    document.body.appendChild(div);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 200;
    canvas.height = 50;

    ctx.fillText(a.numero, 10, 30);

    div.querySelector("#barcode").appendChild(canvas);

    setTimeout(() => {
        const img = new Image();
        img.src = canvas.toDataURL("image/png");

        const w = window.open("");
        w.document.write(div.outerHTML);
        w.print();

        document.body.removeChild(div);
    }, 300);
}

// ===============================
// EXPORT
// ===============================

window.AFILIADOS = {
    editar,
    eliminar,
    imprimir
};
