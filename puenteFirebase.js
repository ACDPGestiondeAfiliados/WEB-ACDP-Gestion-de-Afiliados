// ===============================
// PUENTE FIREBASE ACDP
// FIREBASE MODULAR
// SIN TOCAR LA APP
// ===============================


import {
    doc,
    getDoc,
    setDoc,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";




// ===============================
// INICIO
// ===============================

window.addEventListener(
"load",
()=>{

    iniciarFirebaseACDP();

});





async function iniciarFirebaseACDP(){


try{


const referencia =
doc(
    window.dbFirebase,
    "ACDP",
    "BASE"
);



const snap =
await getDoc(referencia);



if(!snap.exists()){


    await subirFirebase();

}
else{


    aplicarDatosFirebase(
        snap.data()
    );


}




escucharFirebase(
    referencia
);



interceptarGuardado();



console.log(
"Firebase ACDP conectado correctamente"
);



}catch(e){


console.error(
"Firebase ACDP error",
e
);


}



}









// ===============================
// CARGAR DESDE FIREBASE
// ===============================


function aplicarDatosFirebase(datos){



window.BD_usuarios =
datos.usuarios || [];



window.BD_afiliados =
datos.afiliados || [];



window.BD_historial =
datos.historial || [];



window.BD_cobros =
datos.cobros || [];



window.BD_configuracion =
datos.configuracion || {};





// refrescar tablas si existen

if(typeof cargarUsuarios==="function")
cargarUsuarios();



if(typeof cargarAfiliados==="function")
cargarAfiliados();



if(typeof cargarHistorial==="function")
cargarHistorial();



if(typeof cargarCobros==="function")
cargarCobros();



}









// ===============================
// ESCUCHA EN TIEMPO REAL
// ===============================


function escucharFirebase(referencia){



onSnapshot(

referencia,

(snapshot)=>{



if(!snapshot.exists())
return;



aplicarDatosFirebase(
snapshot.data()
);



console.log(
"Datos sincronizados desde Firebase"
);



}

);



}









// ===============================
// SUBIR DATOS
// ===============================


async function subirFirebase(){



const referencia =
doc(
window.dbFirebase,
"ACDP",
"BASE"
);



await setDoc(

referencia,

{


usuarios:
window.BD_usuarios || [],


afiliados:
window.BD_afiliados || [],


historial:
window.BD_historial || [],


cobros:
window.BD_cobros || [],


configuracion:
window.BD_configuracion || {}

}


);



}









// ===============================
// INTERCEPTAR GUARDADO LOCAL
// ===============================


function interceptarGuardado(){



const original =
window.guardarBD;



if(!original)
return;





window.guardarBD = function(){



// primero mantiene funcionamiento actual

original();



// después nube

subirFirebase();



};



}
