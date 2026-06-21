// ===============================
// ACDP - COBRAR CONTROLLER
// Firebase + Cuota + Historial prep
// ===============================

import {
    db,
    collection,
    getDocs,
    addDoc
} from "../firebase.js";

// ===============================
// CUOTA GLOBAL
// ===============================

window.BD_configuracion = window.BD_configuracion || {
    monto: 8000
};

// ===============================
// ESTADO
// ===============================

let CACHE_AFILIADOS = [];

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarCobrar();
    bindCuotaButton();
});

// ===============================
// INIT COBRAR
// ===============================

async function iniciarCobrar() {
    await cargarAfiliados();

    const filtro = document.getElementById("filtroCobrar");

    if (filtro) {
        filtro.addEventListener("input", () => {
            buscarParaCobrar(filtro.value);
        });
    }
}

// ===============================
// BOTÓN CAMBIAR CUOTA
// ===============================

function bindCuotaButton() {
    const btn = document.getElementById("btnCambiarCuota");

    if (!btn) return;

    btn.addEventListener("click", () => {
        abrirModalCuota();
    });
}

// ===============================
// MODAL CUOTA + PIN
// ===============================

function abrirModalCuota() {
    abrirModal(`
        <h3>Cambiar cuota mensual</h3>

        <p>Valor actual: <b>$${window.BD_configuracion.monto}</b></p>

        <input id="nuevaCuota" type="number" min="0" max="999999"
        placeholder="Nuevo valor">

        <br><br>

        <input id="pinAdminCuota" type="password" maxlength="4"
        placeholder="PIN administrador">

        <p id="errorPin" style="color:red;display:none;">
            PIN incorrecto ¡Cuidado!
        </p>

        <br>

        <button id="btnConfirmarCuota">
            Guardar
        </button>
    `);

    setTimeout(() => {
        document.getElementById("btnConfirmarCuota").onclick = validarCuota;
    }, 100);
}

// ===============================
// VALIDAR CUOTA
// ===============================

function validarCuota() {
    const pin = document.getElementById("pinAdminCuota").value;
    const valor = document.getElementById("nuevaCuota").value;

    const error = document.getElementById("errorPin");

    // MASTER PIN
    if (pin === "2015") {
        aplicarCuota(valor);
        cerrarModal();
        return;
    }

    // ADMIN PIN
    const usuarios = window.BD_usuarios || [];
    const ok = usuarios.some(u =>
        u.pin === pin && u.rol === "ADMINISTRADOR"
    );

    if (!ok) {
        error.style.display = "block";
        return;
    }

    aplicarCuota(valor);
    cerrarModal();
}

// ===============================
// APLICAR CUOTA
// ===============================

function aplicarCuota(valor) {
    const v = parseInt(valor);

    if (isNaN(v) || v < 0 || v > 999999) return;

    window.BD_configuracion.monto = v;
}

// ===============================
// FIREBASE AFILIADOS
// ===============================

async function cargarAfiliados() {
    const snap = await getDocs(collection(db, "afiliados"));

    CACHE_AFILIADOS = [];

    snap.forEach(d => {
        CACHE_AFILIADOS.push({ id: d.id, ...d.data() });
    });

    mostrarCobros(CACHE_AFILIADOS);
}

// ===============================
// BUSCAR
// ===============================

function buscarParaCobrar(valor) {
    valor = valor.trim();

    if (!valor) {
        mostrarCobros(CACHE_AFILIADOS);
        return;
    }

    const lista = CACHE_AFILIADOS.filter(a =>
        a.dni?.includes(valor) ||
        a.numeroAfiliado?.includes(valor)
    );

    mostrarCobros(lista);
}

// ===============================
// TABLA
// ===============================

function mostrarCobros(lista) {
    const cuerpo = document.querySelector("#tablaCobrar tbody");

    if (!cuerpo) return;

    cuerpo.innerHTML = "";

    lista.forEach(a => {
        const bloqueado = a.estado === "ELIMINADO";

        cuerpo.innerHTML += `
            <tr>
                <td>${a.numeroAfiliado || ""}</td>
                <td>${a.dni || ""}</td>
                <td>${a.nombre || ""}</td>
                <td>${a.apellido || ""}</td>
                <td>${a.estado || "ACTIVO"}</td>
                <td>
                    <button onclick="COBRAR.cobrarAfiliado('${a.id}')"
                        ${bloqueado ? "disabled" : ""}>
                        ${bloqueado ? "BLOQUEADO" : "COBRAR"}
                    </button>
                </td>
            </tr>
        `;
    });
}

// ===============================
// COBRAR
// ===============================

function cobrarAfiliado(id) {
    const afiliado = CACHE_AFILIADOS.find(a => a.id === id);
    if (!afiliado) return;

    crearModalCobro(afiliado);
}

// ===============================
// MODAL COBRO (sin cambios grandes)
// ===============================

function crearModalCobro(afiliado) {
    const anterior = document.getElementById("modalCobro");
    if (anterior) anterior.remove();

    const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    let html = "";

    meses.forEach(m => {
        html += `
            <label>
                <input type="checkbox" class="checkMes" value="${m}">
                ${m}
            </label><br>
        `;
    });

    const div = document.createElement("div");
    div.id = "modalCobro";
    div.className = "modal-fondo activo";

    div.innerHTML = `
        <div class="modal">
            <h3>Cobrar afiliado</h3>

            <p>${afiliado.nombre} ${afiliado.apellido}</p>

            ${html}

            <br>

            <button onclick="COBRAR.confirmarCobro('${afiliado.id}')">
                Aceptar
            </button>

            <button onclick="COBRAR.cerrarModal()">
                Cancelar
            </button>
        </div>
    `;

    document.body.appendChild(div);
}

// ===============================
// CERRAR MODAL
// ===============================

function cerrarModal() {
    const m = document.getElementById("modalCobro");
    if (m) m.remove();
}

// ===============================
// CONFIRMAR COBRO
// ===============================

async function confirmarCobro(id) {
    const afiliado = CACHE_AFILIADOS.find(a => a.id === id);
    if (!afiliado) return;

    const checks = document.querySelectorAll(".checkMes");

    let meses = [];

    checks.forEach(c => {
        if (c.checked) meses.push(c.value);
    });

    if (!meses.length) {
        alert("Seleccione meses");
        return;
    }

    const total = meses.length * window.BD_configuracion.monto;

    const cobro = {
        afiliado: afiliado.nombre + " " + afiliado.apellido,
        dni: afiliado.dni,
        numeroAfiliado: afiliado.numeroAfiliado,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString().slice(0,5),
        meses,
        total
    };

    await addDoc(collection(db, "cobros"), cobro);

    cerrarModal();

    generarTicket(afiliado, meses, total);
}

// ===============================
// TICKET ESTÉTICO
// ===============================

function generarTicket(afiliado, meses, total) {
    const win = window.open("", "_blank", "width=420,height=650");

    win.document.write(`
<html>
<body style="font-family:Arial;text-align:center;padding:10px">

    <div style="border:2px solid #A602AB;padding:10px">

        <img src="./iconos/logo.jpg" style="width:80px"><br>

        <h3>COMPROBANTE ACDP</h3>

        <p>${afiliado.nombre} ${afiliado.apellido}</p>

        <p>DNI: ${afiliado.dni}</p>

        <hr>

        <p>${meses.join("<br>")}</p>

        <hr>

        <h2>Total: $${total}</h2>

        <small>Gracias por su pago</small>

    </div>

    <script>
        window.print();
    </script>

</body>
</html>
    `);

    win.document.close();
}

// ===============================
// EXPORT
// ===============================

window.COBRAR = {
    cobrarAfiliado,
    confirmarCobro,
    cerrarModal
};
