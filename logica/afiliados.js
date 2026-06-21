// ===============================
// ACDP - AFILIADOS CONTROLLER
// Firebase CRUD + UI + validaciones + impresión
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
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    bindAfiliadosUI();
    renderAfiliados();
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
// BIND UI
// ===============================

function bindAfiliadosUI() {
    const btnNuevo = document.getElementById("btnNuevoAfiliado");
    if (btnNuevo) btnNuevo.addEventListener("click", abrirCrearAfiliado);

    const filtro = document.getElementById("filtroAfiliados");
    if (filtro) filtro.addEventListener("input", renderAfiliados);
}

// ===============================
// VALIDACIONES
// ===============================

const soloTexto = v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v);
const soloNumeros = v => /^[0-9]+$/.test(v);
const soloEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

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

        n.addEventListener("input", () => {
            n.value = n.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
            validar();
        });

        a.addEventListener("input", () => {
            a.value = a.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
            validar();
        });

        d.addEventListener("input", () => {
            d.value = d.value.replace(/[^0-9]/g, "");
            validar();
        });

        c.addEventListener("input", () => {
            c.value = c.value.replace(/[^0-9]/g, "");
            validar();
        });

        e.addEventListener("input", validar);

        btn.onclick = guardarAfiliado;
    }, 100);
}

// ===============================
// GUARDAR AFILIADO
// ===============================

async function guardarAfiliado() {
    const now = new Date();

    await addDoc(collection(db, "afiliados"), {
        numeroAfiliado: generarNumeroAfiliado(),
        nombre: document.getElementById("aNombre").value.trim(),
        apellido: document.getElementById("aApellido").value.trim(),
        dni: document.getElementById("aDni").value,
        celular: document.getElementById("aCelular").value,
        correo: document.getElementById("aCorreo").value.trim(),
        estado: document.getElementById("aEstado").value,
        fechaAlta: now.toISOString()
    });

    cerrarModal();
    renderAfiliados();
}

// ===============================
// RENDER TABLA (orden + fecha + hora)
// ===============================

async function renderAfiliados() {
    const tbody = document.querySelector("#tablaAfiliados tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const filtro = document.getElementById("filtroAfiliados")?.value || "";
    const snap = await getDocs(collection(db, "afiliados"));

    let data = [];

    snap.forEach(d => data.push({ id: d.id, ...d.data() }));

    // más recientes primero
    data.sort((a, b) => new Date(b.fechaAlta) - new Date(a.fechaAlta));

    data.forEach(a => {
        const ok =
            a.dni.includes(filtro) ||
            a.nombre.toLowerCase().includes(filtro.toLowerCase());

        if (!ok) return;

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
                <button onclick="AFILIADOS.imprimir('${a.id}')">Imprimir</button>
                <button onclick="AFILIADOS.eliminarAfiliado('${a.id}')">Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ===============================
// IMPRESIÓN (PNG EN MEMORIA)
// ===============================

async function imprimir(id) {
    const snap = await getDocs(collection(db, "afiliados"));

    let af = null;
    snap.forEach(d => {
        if (d.id === id) af = { id: d.id, ...d.data() };
    });

    if (!af) return;

    const color = af.estado === "ACTIVO" ? "#A602AB" : "#FFB700";

    const win = window.open("", "_blank", "width=400,height=300");

    win.document.write(`
        <html>
        <body>
        <div id="ficha" style="
            width:8cm;
            height:6cm;
            border:3px solid ${color};
            display:flex;
            padding:10px;
            font-family:Arial;
        ">

            <div style="width:40%;display:flex;align-items:center;justify-content:center;">
                <img src="logo.jpg" style="width:100%;height:auto;">
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
            JsBarcode("#barcode", "${af.numeroAfiliado}", {
                format: "CODE128",
                width: 1.5,
                height: 40,
                displayValue: false
            });

            window.onload = () => window.print();
        </script>

        </body>
        </html>
    `);

    win.document.close();
}

// ===============================
// ELIMINAR
// ===============================

async function eliminarAfiliado(id) {
    await deleteDoc(doc(db, "afiliados", id));
    renderAfiliados();
}

// ===============================
// EXPORT
// ===============================

window.AFILIADOS = {
    imprimir,
    eliminarAfiliado
};
