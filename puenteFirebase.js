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



BD_configuracion =
d.configuracion || BD_configuracion;



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


await setDoc(

referencia,

{


usuarios:
BD_usuarios || [],


afiliados:
BD_afiliados || [],


historial:
BD_historial || [],


cobros:
BD_cobros || [],


configuracion:
BD_configuracion || {}

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

referencia,

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

BD_configuracion =
d.configuracion || {};




console.log(
"CAMBIO RECIBIDO FIREBASE"
);



}


);



}
