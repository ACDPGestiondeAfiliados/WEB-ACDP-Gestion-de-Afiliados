import {
    db,
    collection,
    getDocs,
    doc,
    getDoc
} from "./firebase.js";

// ===============================
// BD GLOBAL
// ===============================

window.BD_usuarios = window.BD_usuarios || [];
window.BD_afiliados = window.BD_afiliados || [];
window.BD_historial = window.BD_historial || [];
window.BD_cobros = window.BD_cobros || [];
window.BD_configuracion = window.BD_configuracion || { monto: 0 };

// ===============================
// CARGA FIREBASE
// ===============================

async function cargarBD() {

    try {

        const usuarios = await getDocs(collection(db, "usuarios"));
        window.BD_usuarios = usuarios.docs.map(d => ({ id: d.id, ...d.data() }));
window.dispatchEvent(new Event("BD_USUARIOS_CARGADA"));

        const afiliados = await getDocs(collection(db, "afiliados"));
        window.BD_afiliados = afiliados.docs.map(d => ({ id: d.id, ...d.data() }));

        const historial = await getDocs(collection(db, "historial"));
        window.BD_historial = historial.docs.map(d => ({ id: d.id, ...d.data() }));

        const cobros = await getDocs(collection(db, "cobros"));
        window.BD_cobros = cobros.docs.map(d => ({ id: d.id, ...d.data() }));

        const config = await getDoc(doc(db, "configuracion", "principal"));

        if (config.exists()) {
            window.BD_configuracion = {
                ...window.BD_configuracion,
                ...config.data()
            };
        }

        console.log("ACDP Firebase cargado");

        window.dispatchEvent(new Event("BD_CARGADA"));

    } catch (e) {
        console.error("Error cargando Firebase", e);
    }
}

cargarBD();

// ===============================
// BUSCAR
// ===============================

window.buscarAfiliado = function (valor) {
    valor = String(valor);

    return window.BD_afiliados.filter(a =>
        String(a.dni) === valor ||
        String(a.numero) === valor
    );
};

// ===============================
// COMPAT
// ===============================

window.guardarBD = () => console.warn("Firestore activo");
window.guardarCambios = () => console.warn("Firestore activo");
