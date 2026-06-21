// ===============================
// PUENTE FIREBASE ACDP
// VERSION COMPATIBILIDAD GLOBAL
// ===============================

import {
doc,
getDoc,
setDoc,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



const referencia =
doc(
window.dbFirebase,
"ACDP",
"BASE"
);





window.addEventListener(
"load",
()=>{


console.log(
"PUENTE FIREBASE INICIADO"
);



cargarInicial();



interceptarGuardado();



escucharCambios();



});







async function cargarInicial(){


try{


const snap =
await getDoc(referencia);



if(snap.exists()){


const d =
snap.data();



BD_usuarios =
d.usuarios || BD_usuarios;



BD_afiliados =
d.afiliados || BD_afiliados;



BD_historial =
d.historial || BD_historial;



BD_cobros =
d.cobros || BD_cobros;



// FIX IMPORTANTE: asegurar objeto + monto numérico
BD_configuracion = {
    monto: Number(d.configuracion?.monto || 0)
};



guardarBD();



console.log(
"BD cargada desde Firebase"
);



}else{


await subir();


console.log(
"Firebase inicializado vacío"
);



}



}catch(e){

console.error(
"CARGA FIREBASE ERROR",
e
);


}


}








function interceptarGuardado(){



const original =
guardarBD;



if(!original){

console.error(
"No existe guardarBD"
);

return;

}



window.guardarBD =
function(){


original();



setTimeout(
()=>{

subir();

},
100
);



};


console.log(
"GuardarBD interceptado"
);



}









async function subir(){



try{


// FIX CRÍTICO: evitar referencia rota o undefined silencioso
if(!window.dbFirebase){
console.error("Firebase no inicializado");
return;
}



// FIX: leer SIEMPRE valor actual en ejecución
const configSeguro = {
    monto: Number(BD_configuracion?.monto ?? 0)
};



await setDoc(

doc(window.dbFirebase, "ACDP", "BASE"),

{


usuarios:
BD_usuarios || [],


afiliados:
BD_afiliados || [],


historial:
BD_historial || [],


cobros:
BD_cobros || [],


configuracion: configSeguro

}


);



console.log(
"DATOS SUBIDOS A FIREBASE"
);



}catch(e){


console.error(
"ERROR SUBIENDO",
e
);


}



}









function escucharCambios(){



onSnapshot(

doc(window.dbFirebase, "ACDP", "BASE"),

snap=>{


if(!snap.exists())
return;



const d =
snap.data();



BD_usuarios =
d.usuarios || [];

BD_afiliados =
d.afiliados || [];

BD_historial =
d.historial || [];

BD_cobros =
d.cobros || [];



// FIX: consistencia de tipo (evita que quede objeto roto)
BD_configuracion = {
    monto: Number(d.configuracion?.monto || 0)
};




console.log(
"CAMBIO RECIBIDO FIREBASE"
);



}


);



}
