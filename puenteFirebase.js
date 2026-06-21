import {
doc,
getDoc,
setDoc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

let referencia = null;


// ===============================
// INIT SEGURO (SIN LOAD ROTO)
// ===============================
function initFirebaseBridge() {

    if (!window.dbFirebase) return;

    referencia = doc(window.dbFirebase, "ACDP", "BASE");

    cargarInicial();
    interceptarGuardado();
    escucharCambios();

}


// auto-init seguro
if (document.readyState === "complete") {
    initFirebaseBridge();
} else {
    window.addEventListener("load", initFirebaseBridge);
}



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
            monto: Number(d.configuracion?.monto ?? 0)
        };

        guardarBD();

    } catch (e) {
        console.error("FIREBASE LOAD ERROR", e);
    }

}



// ===============================
// INTERCEPTAR GUARDADO (FIX REAL)
// ===============================
function interceptarGuardado() {

    if (typeof window.guardarBD !== "function") return;

    const original = window.guardarBD;

    window.guardarBD = function () {

        original();

        if (!referencia) return;

        clearTimeout(window.__fbSync);

        window.__fbSync = setTimeout(() => {
            subir();
        }, 100);

    };

}



// ===============================
// SUBIR A FIRESTORE
// ===============================
async function subir() {

    try {

        if (!window.dbFirebase || !referencia) return;

        await setDoc(referencia, {
            usuarios: BD_usuarios || [],
            afiliados: BD_afiliados || [],
            historial: BD_historial || [],
            cobros: BD_cobros || [],
            configuracion: {
                monto: Number(BD_configuracion?.monto ?? 0)
            }
        });

    } catch (e) {
        console.error("FIREBASE WRITE ERROR", e);
    }

}



// ===============================
// ESCUCHA REALTIME
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
            monto: Number(d.configuracion?.monto ?? 0)
        };

        guardarBD();

    });

}
