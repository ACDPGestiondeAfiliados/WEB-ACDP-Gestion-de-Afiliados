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



function getRef(){
    return doc(window.dbFirebase, "ACDP", "BASE");
}



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
await getDoc(getRef());



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
d.configuracion || {monto:0};



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
window.guardarBD;



if(!original){

console.error(
"No existe guardarBD"
);

return;

}



window.originalGuardarBD = original;



window.guardarBD =
function(){


window.originalGuardarBD();



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


if(!window.dbFirebase){
console.error("Firebase no inicializado");
return;
}



await setDoc(

getRef(),

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
{
monto: Number(BD_configuracion?.monto || 0)
}


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

getRef(),

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
{
monto: Number(d.configuracion?.monto || 0)
};




console.log(
"CAMBIO RECIBIDO FIREBASE"
);



}


);



}
