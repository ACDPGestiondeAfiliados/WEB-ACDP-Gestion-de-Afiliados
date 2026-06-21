// ===============================
// ACDP - AFILIADOS CONTROLLER
// Firebase CRUD + UI + validaciones
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

function soloTexto(valor) {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor);
}

function soloNumeros(valor) {
    return /^[0-9]+$/.test(valor);
}

function soloEmail(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

// ===============================
// MODAL BASE (usa global ACDP_user)
// ===============================

function abrirModal(html) {
    const fondo = document.getElementById("modalFondo");
    const cont = document.getElementById("modalContenido");

    cont.innerHTML = html;
    fondo.classList.add("activo");

    document.getElementById("cerrarModal").onclick = cerrarModal;
}

function cerrarModal() {
    const cont = document.getElementById("modalContenido");
    const fondo = document.getElementById("modalFondo");

    cont.innerHTML = "";
    fondo.classList.remove("activo");
}

// ===============================
// CREAR AFILIADO
// ===============================

function abrirCrearAfiliado() {
    abrirModal(`
        <h3>Nuevo Afiliado</h3>

        <input id="aNombre" placeholder="Nombre">
        <br><br>

        <input id="aApellido" placeholder="Apellido">
        <br><br>

        <input id="aDni" placeholder="DNI" maxlength="8">
        <br><br>

        <input id="aCelular" placeholder="Celular">
        <br><br>

        <input id="aCorreo" placeholder="Correo">
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

        function validar() {
            const okNombre = soloTexto(n.value.trim());
            const okApellido = soloTexto(a.value.trim());
            const okDni = soloNumeros(d.value) && d.value.length === 8;
            const okCel = soloNumeros(c.value);
            const okEmail = soloEmail(e.value.trim());

            btn.disabled = !(okNombre && okApellido && okDni && okCel && okEmail);
        }

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
// GUARDAR
// ===============================

async function guardarAfiliado() {
    await addDoc(collection(db, "afiliados"), {
        nombre: document.getElementById("aNombre").value.trim(),
        apellido: document.getElementById("aApellido").value.trim(),
        dni: document.getElementById("aDni").value,
        celular: document.getElementById("aCelular").value,
        correo: document.getElementById("aCorreo").value.trim(),
        fecha: new Date().toISOString(),
        estado: "ACTIVO"
    });

    cerrarModal();
    renderAfiliados();
}

// ===============================
// RENDER TABLA
// ===============================

async function renderAfiliados() {
    const tbody = document.querySelector("#tablaAfiliados tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const filtro = document.getElementById("filtroAfiliados")?.value || "";

    const snap = await getDocs(collection(db, "afiliados"));

    snap.forEach(d => {
        const a = d.data();

        const match =
            a.dni.includes(filtro) ||
            a.nombre.toLowerCase().includes(filtro.toLowerCase());

        if (!match) return;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.dni}</td>
            <td>${a.nombre}</td>
            <td>${a.apellido}</td>
            <td>${a.celular}</td>
            <td>${a.correo}</td>
            <td>${a.estado}</td>
            <td>${a.fecha.split("T")[0]}</td>
            <td>
                <button onclick="AFILIADOS.editarAfiliado('${d.id}')">Editar</button>
                <button onclick="AFILIADOS.eliminarAfiliado('${d.id}')">Eliminar</button>
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

        <input id="eNombre" value="${af.nombre}">
        <br><br>

        <input id="eApellido" value="${af.apellido}">
        <br><br>

        <input id="eDni" value="${af.dni}" maxlength="8">
        <br><br>

        <input id="eCelular" value="${af.celular}">
        <br><br>

        <input id="eCorreo" value="${af.correo}">
        <br><br>

        <button id="btnEditarAfiliado">Guardar</button>
    `);

    document.getElementById("btnEditarAfiliado").onclick = () => guardarEdicionAfiliado(id);
}

// ===============================
// GUARDAR EDICIÓN
// ===============================

async function guardarEdicionAfiliado(id) {
    await updateDoc(doc(db, "afiliados", id), {
        nombre: document.getElementById("eNombre").value.trim(),
        apellido: document.getElementById("eApellido").value.trim(),
        dni: document.getElementById("eDni").value,
        celular: document.getElementById("eCelular").value,
        correo: document.getElementById("eCorreo").value.trim()
    });

    cerrarModal();
    renderAfiliados();
}

// ===============================
// ELIMINAR
// ===============================

async function eliminarAfiliado(id) {
    await deleteDoc(doc(db, "afiliados", id));
    renderAfiliados();
}

// ===============================
// EXPORT GLOBAL
// ===============================

window.AFILIADOS = {
    editarAfiliado,
    eliminarAfiliado
};
