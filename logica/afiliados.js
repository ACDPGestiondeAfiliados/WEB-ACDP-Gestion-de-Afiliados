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
// CREAR AFILIADO
// ===============================

function abrirCrearAfiliado() {
    abrirModal(`
        <h3>Nuevo Afiliado</h3>

        <input id="aNombre" placeholder="Nombre"><br><br>
        <input id="aApellido" placeholder="Apellido"><br><br>
        <input id="aDni" placeholder="DNI" maxlength="8"><br><br>
        <input id="aCelular" placeholder="Celular (opcional)" maxlength="10"><br><br>
        <input id="aCorreo" placeholder="Correo" maxlength="30"><br><br>

        <select id="aEstado">
            <option value="ADHERENTE" selected>ADHERENTE</option>
            <option value="ACTIVO">ACTIVO</option>
        </select>

        <br><br>
        <button id="btnGuardarAfiliado" disabled>Guardar</button>
    `);

    setTimeout(() => {
        const n = document.getElementById("aNombre");
        const a = document.getElementById("aApellido");
        const d = document.getElementById("aDni");
        const c = document.getElementById("aCelular");
        const e = document.getElementById("aCorreo");
        const btn = document.getElementById("btnGuardarAfiliado");

        const validar = () => {
            const okNombre = soloTexto(n.value.trim());
            const okApellido = soloTexto(a.value.trim());
            const okDni = soloNumeros(d.value) && d.value.length === 8;
            const okCel = c.value === "" || (soloNumeros(c.value) && c.value.length <= 10);
            const okEmail = e.value.length <= 30;

            btn.disabled = !(okNombre && okApellido && okDni && okCel && okEmail);
        };

        n.oninput = () => { n.value = n.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""); validar(); };
        a.oninput = () => { a.value = a.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""); validar(); };
        d.oninput = () => { d.value = d.value.replace(/[^0-9]/g, ""); validar(); };
        c.oninput = () => { c.value = c.value.replace(/[^0-9]/g, ""); validar(); };
        e.oninput = validar;

        btn.onclick = guardarAfiliado;
    }, 100);
}

// ===============================
// GUARDAR
// ===============================

async function guardarAfiliado() {
    await addDoc(collection(db, "afiliados"), {
        numeroAfiliado: generarNumeroAfiliado(),
        nombre: document.getElementById("aNombre").value.trim(),
        apellido: document.getElementById("aApellido").value.trim(),
        dni: document.getElementById("aDni").value,
        celular: document.getElementById("aCelular").value,
        correo: document.getElementById("aCorreo").value.trim(),
        estado: document.getElementById("aEstado").value,
        fechaAlta: new Date().toISOString()
    });

    cerrarModal();
    cargarAfiliados(true);
}

// ===============================
// RENDER TABLA
// ===============================

function renderAfiliados() {
    const tbody = document.querySelector("#tablaAfiliados tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const filtro = document.getElementById("filtroAfiliados")?.value.trim() || "";

    let data = [...CACHE_AFILIADOS];

    if (filtro.length === 8 && soloNumeros(filtro)) {
        const exists = data.some(a =>
            a.dni === filtro || a.numeroAfiliado === filtro
        );

        if (!exists) {
            alert("Afiliado no existe");
            return;
        }

        data = data.filter(a =>
            a.dni === filtro || a.numeroAfiliado === filtro
        );
    }

    const start = PAGINA_ACTUAL * PAGE_SIZE;
    const pageData = data.slice(start, start + PAGE_SIZE);

    pageData.forEach(a => {
        const f = formatearFechaHora(a.fechaAlta);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.numeroAfiliado}</td>
            <td>${a.dni}</td>
            <td>${a.nombre}</td>
            <td>${a.apellido}</td>
            <td>${a.celular || ""}</td>
            <td>${a.correo}</td>
            <td>${a.estado}</td>
            <td>${f.fecha} ${f.hora}</td>
            <td>
                <button onclick="AFILIADOS.editarAfiliado('${a.id}')">Editar</button>
                <button onclick="AFILIADOS.imprimir('${a.id}')">Imprimir</button>
                <button onclick="AFILIADOS.eliminarAfiliado('${a.id}')">Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ===============================
// EDITAR
// ===============================

async function editarAfiliado(id) {
    const snap = await getDocs(collection(db, "afiliados"));

    let af = null;
    snap.forEach(d => {
        if (d.id === id) af = { id: d.id, ...d.data() };
    });

    if (!af) return;

    abrirModal(`
        <h3>Editar Afiliado</h3>

        <input id="eNombre" value="${af.nombre}"><br><br>
        <input id="eApellido" value="${af.apellido}"><br><br>
        <input id="eDni" value="${af.dni}" maxlength="8"><br><br>
        <input id="eCelular" value="${af.celular || ""}" maxlength="10"><br><br>
        <input id="eCorreo" value="${af.correo}" maxlength="30"><br><br>

        <select id="eEstado">
            <option value="ADHERENTE" ${af.estado === "ADHERENTE" ? "selected" : ""}>ADHERENTE</option>
            <option value="ACTIVO" ${af.estado === "ACTIVO" ? "selected" : ""}>ACTIVO</option>
        </select>

        <br><br>
        <button id="btnEditarAfiliado">Guardar</button>
    `);

    document.getElementById("btnEditarAfiliado").onclick = async () => {
        await updateDoc(doc(db, "afiliados", id), {
            nombre: document.getElementById("eNombre").value.trim(),
            apellido: document.getElementById("eApellido").value.trim(),
            dni: document.getElementById("eDni").value,
            celular: document.getElementById("eCelular").value,
            correo: document.getElementById("eCorreo").value.trim(),
            estado: document.getElementById("eEstado").value
        });

        cerrarModal();
        cargarAfiliados(true);
    };
}

// ===============================
// ELIMINAR CON MOTIVO
// ===============================

async function eliminarAfiliado(id) {
    const snap = await getDocs(collection(db, "afiliados"));

    let af = null;
    snap.forEach(d => {
        if (d.id === id) af = { id: d.id, ...d.data() };
    });

    if (!af) return;

    abrirModal(`
        <h3>Eliminar Afiliado</h3>

        <p>Indique el motivo (máx 40 caracteres)</p>

        <textarea id="motivo" maxlength="40"
        style="width:100%;height:120px;resize:none;"></textarea>

        <br><br>

        <button id="btnConfirmar" disabled style="background:#c00;color:#fff;">
            Confirmar eliminación
        </button>
    `);

    setTimeout(() => {
        const input = document.getElementById("motivo");
        const btn = document.getElementById("btnConfirmar");

        input.oninput = () => {
            input.value = input.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
            btn.disabled = input.value.trim().length === 0;
        };

        btn.onclick = async () => {

            const log = crearLogEliminacion(af, input.value.trim());

            await deleteDoc(doc(db, "afiliados", id));

            // FUTURO HISTORIAL
            // await addDoc(collection(db, "historial"), log);

            cerrarModal();
            cargarAfiliados(true);
        };
    }, 50);
}

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
