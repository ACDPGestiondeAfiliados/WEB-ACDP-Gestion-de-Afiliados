// ===============================
// CONFIGURACIÓN ACDP (FIRESTORE REAL)
// SOLO MONTO GLOBAL
// ===============================

const CONFIG_COL = "configuracion";
const CONFIG_ID = "global";

document.addEventListener("DOMContentLoaded", () => {
    iniciarConfiguracion();
    cargarConfiguracion();
});

// ===============================
// INICIAR EVENTOS
// ===============================

function iniciarConfiguracion() {

    const boton = document.getElementById("guardarConfiguracion");
    if (!boton) return;

    boton.addEventListener("click", guardarMonto);
}

// ===============================
// CARGAR DESDE FIRESTORE
// ===============================

async function cargarConfiguracion() {

    const input = document.getElementById("montoConfiguracion");
    if (!input) return;

    try {

        const ref = doc(window.db, CONFIG_COL, CONFIG_ID);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();
            input.value = Number(data.monto || 0);
        } else {
            input.value = 0;
        }

    } catch (e) {
        console.error("Error cargando configuración:", e);
        input.value = 0;
    }
}

// ===============================
// GUARDAR EN FIRESTORE
// ===============================

async function guardarMonto() {

    const input = document.getElementById("montoConfiguracion");
    if (!input) return;

    const valor = Number((input.value || "").trim());

    if (isNaN(valor) || valor < 0) return;

    try {

        const ref = doc(window.db, CONFIG_COL, CONFIG_ID);

        await setDoc(ref, {
            monto: valor,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log("💾 MONTO ACTUALIZADO EN FIRESTORE:", valor);

    } catch (e) {
        console.error("Error guardando configuración:", e);
    }
}
