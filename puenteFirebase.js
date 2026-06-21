// ===============================
// PUENTE FIREBASE ACDP
// VERSION ESTABLE SIN LOGS BASURA
// ===============================

import {
doc,
getDoc,
setDoc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



let referencia;



window.addEventListener("load", async () => {

    if (!window.dbFirebase) {
        console.error("Firebase no inicializado");
        return;
    }

    referencia = doc(window.dbFirebase, "ACDP", "BASE");

    await cargarInicial();
    interceptarGuardado();
    escucharCambios();

});



// ===============================
// CARGA INICIAL
// ===============================
async function cargarInicial() {

    try {

        const snap = await getDoc(referencia);

        if (!snap.exists()) {
            await subir();
            return;
        }

        const d = snap.data();

        BD_usuarios = d.usuarios || BD_usuarios;
        BD_afiliados = d.afiliados || BD_afiliados;
        BD_historial = d.historial || BD_historial;
        BD_cobros = d.cobros || BD_cobros;

        BD_configuracion = {
            monto: Number(d.configuracion?.monto || 0)
        };

        guardarBD();

    } catch (e) {
        console.error("ERROR CARGA FIRESTORE", e);
    }

}



// ===============================
// INTERCEPTAR GUARDADO GLOBAL
// ===============================
function interceptarGuardado() {

    const original = window.guardarBD;

    if (typeof original !== "function") {
        console.error("guardarBD no existe");
        return;
    }

    window.guardarBD = function () {

        original();

        // debounce simple para evitar spam de escrituras
        clearTimeout(window.__firestoreTimeout);

        window.__firestoreTimeout = setTimeout(() => {
            subir();
        }, 150);

    };

}



// ===============================
// SUBIR A FIRESTORE
// ===============================
async function subir() {

    try {

        if (!window.dbFirebase || !referencia) return;

        const data = {
            usuarios: BD_usuarios || [],
            afiliados: BD_afiliados || [],
            historial: BD_historial || [],
            cobros: BD_cobros || [],
            configuracion: {
                monto: Number(BD_configuracion?.monto || 0)
            }
        };

        await setDoc(referencia, data);

    } catch (e) {
        console.error("ERROR SUBIENDO FIRESTORE", e);
    }

}



// ===============================
// ESCUCHA TIEMPO REAL
// ===============================
function escucharCambios() {

    onSnapshot(referencia, (snap) => {

        if (!snap.exists()) return;

        const d = snap.data();

        BD_usuarios = d.usuarios || [];
        BD_afiliados = d.afiliados || [];
        BD_historial = d.historial || [];
        BD_cobros = d.cobros || [];

        BD_configuracion = {
            monto: Number(d.configuracion?.monto || 0)
        };

        guardarBD();

    });

}
