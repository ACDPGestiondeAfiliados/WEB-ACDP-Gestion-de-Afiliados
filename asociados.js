// ===============================
// PORTAL ASOCIADOS ACDP (FIRESTORE)
// ===============================

let asociadoActual = null;

const PIN_GLOBAL = "2015";

const COL_AFILIADOS = "afiliados";
const COL_COBROS = "cobros";

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    iniciarAsociados();
});

// ===============================
// INICIALIZAR
// ===============================

function iniciarAsociados() {

    const boton = document.getElementById("btnIngresarAsociado");
    if (boton) boton.addEventListener("click", ingresarAsociado);

    const cerrar = document.getElementById("btnCerrarSesionAsociado");
    if (cerrar) cerrar.addEventListener("click", cerrarSesionAsociado);

    const guardar = document.getElementById("btnGuardarDatos");
    if (guardar) guardar.addEventListener("click", guardarDatosPerfil);

    const cambiar = document.getElementById("btnCambiarPin");
    if (cambiar) cambiar.addEventListener("click", cambiarPin);

    activarNumericos();
}

// ===============================
// SOLO NÚMEROS
// ===============================

function activarNumericos() {

    const campos = [
        "numeroAsociado",
        "pinAsociado",
        "editarCelular",
        "pinActual",
        "nuevoPin",
        "confirmarPin"
    ];

    campos.forEach(id => {
        const input = document.getElementById(id);

        if (input) {
            input.addEventListener("input", () => {
                input.value = input.value.replace(/\D/g, "");
            });
        }
    });
}

// ===============================
// LOGIN FIRESTORE
// ===============================

async function ingresarAsociado() {

    const numero = numeroAsociado.value.trim();
    const pin = pinAsociado.value.trim();
    const mensaje = document.getElementById("mensajeAsociado");

    if (numero.length !== 8) {
        mensaje.textContent = "Ingrese un número válido";
        return;
    }

    try {

        const snap = await getDocs(collection(window.db, COL_AFILIADOS));

        let afiliado = null;

        snap.forEach(d => {
            const a = d.data();
            if (a.numero === numero) {
                afiliado = a;
            }
        });

        if (!afiliado || afiliado.estado === "Eliminado") {
            mensaje.textContent = "Afiliado no existe";
            return;
        }

        let pinCorrecto = afiliado.pinAsociado || "1111";

        if (pin === PIN_GLOBAL) {
            alert("Acceso administrador. Puede recuperar el PIN del asociado.");
            asociadoActual = afiliado;
            mostrarPerfil(afiliado);
            return;
        }

        if (pin !== pinCorrecto) {
            mensaje.textContent = "Error de PIN";
            return;
        }

        asociadoActual = afiliado;
        mostrarPerfil(afiliado);

    } catch (e) {
        console.error("Error login asociado:", e);
    }
}

// ===============================
// PERFIL
// ===============================

async function mostrarPerfil(a) {

    document.getElementById("loginAsociado").classList.add("oculto");
    document.getElementById("perfilAsociado").classList.remove("oculto");

    document.getElementById("datoNumero").textContent = a.numero || "";
    document.getElementById("datoDni").textContent = a.dni || "";
    document.getElementById("datoNombre").textContent = a.nombre || "";
    document.getElementById("datoApellido").textContent = a.apellido || "";
    document.getElementById("datoCelular").textContent = a.celular || "";
    document.getElementById("datoCorreo").textContent = a.correo || "";
    document.getElementById("datoFecha").textContent = a.fecha || "";
    document.getElementById("datoEstado").textContent = a.estado || "";

    editarCelular.value = a.celular || "";
    editarCorreo.value = a.correo || "";

    const confSnap = await getDoc(doc(window.db, "configuracion", "global"));
    const cuota = confSnap.exists() ? confSnap.data().monto || 0 : 0;

    datoCuota.textContent = "$" + cuota;

    mostrarCuotas(a);
}

// ===============================
// EDITAR PERFIL
// ===============================

async function guardarDatosPerfil() {

    if (!asociadoActual) return;

    const celular = editarCelular.value.trim();
    const correo = editarCorreo.value.trim();

    try {

        await updateDoc(doc(window.db, COL_AFILIADOS, asociadoActual.dni), {
            celular,
            correo
        });

        asociadoActual.celular = celular;
        asociadoActual.correo = correo;

        alert("Datos actualizados correctamente");

        mostrarPerfil(asociadoActual);

    } catch (e) {
        console.error("Error perfil:", e);
    }
}

// ===============================
// CAMBIAR PIN
// ===============================

async function cambiarPin() {

    if (!asociadoActual) return;

    const nuevo = nuevoPin.value.trim();
    const confirmar = confirmarPin.value.trim();

    if (nuevo.length < 4 || nuevo !== confirmar) {
        alert("PIN inválido");
        return;
    }

    if (nuevo === PIN_GLOBAL) {
        alert("El PIN 2015 está reservado.");
        return;
    }

    try {

        await updateDoc(doc(window.db, COL_AFILIADOS, asociadoActual.dni), {
            pinAsociado: nuevo
        });

        asociadoActual.pinAsociado = nuevo;

        nuevoPin.value = "";
        confirmarPin.value = "";

        alert("PIN actualizado correctamente");

    } catch (e) {
        console.error("Error PIN:", e);
    }
}

// ===============================
// CUOTAS
// ===============================

async function mostrarCuotas(a) {

    const contenedor = document.getElementById("cuotasAsociado");
    contenedor.innerHTML = "";

    const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    const año = new Date().getFullYear();

    try {

        const snap = await getDocs(collection(window.db, COL_COBROS));

        let pagados = [];

        snap.forEach(d => {

            const c = d.data();

            if (
                c.dni === a.dni &&
                c.estado !== "Anulado" &&
                c.anio === año
            ) {
                (c.meses || []).forEach(m => {
                    if (!pagados.includes(m)) pagados.push(m);
                });
            }
        });

        meses.forEach(m => {

            const pagado = pagados.includes(m);

            contenedor.innerHTML += `
            <div class="cuotaMes ${pagado ? "cuotaPagada" : "cuotaPendiente"}">
                ${m}<br>
                ${pagado ? "PAGADO" : "PENDIENTE"}
            </div>`;
        });

    } catch (e) {
        console.error("Error cuotas:", e);
    }
}

// ===============================
// LOGOUT
// ===============================

function cerrarSesionAsociado() {

    asociadoActual = null;

    document.getElementById("perfilAsociado").classList.add("oculto");
    document.getElementById("loginAsociado").classList.remove("oculto");

    numeroAsociado.value = "";
    pinAsociado.value = "";
}
