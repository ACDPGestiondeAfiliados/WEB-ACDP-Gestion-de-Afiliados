// ===============================
// PUENTE FIREBASE ACDP
// NO MODIFICA LA APP
// ===============================


window.addEventListener(
"load",
()=>{


sincronizarFirebase();


});




async function sincronizarFirebase(){


try{


const ref =
dbFirebase
.collection("ACDP")
.doc("BASE");



const snap =
await ref.get();



if(snap.exists){


const datos=snap.data();



BD_usuarios =
datos.usuarios || BD_usuarios;


BD_afiliados =
datos.afiliados || BD_afiliados;


BD_historial =
datos.historial || BD_historial;


BD_cobros =
datos.cobros || BD_cobros;


BD_configuracion =
datos.configuracion || BD_configuracion;



guardarBD();


}



else{


subirFirebase();


}



interceptarGuardado();



console.log(
"Firebase ACDP conectado"
);



}catch(e){

console.error(
"Firebase error",
e
);


}



}




async function subirFirebase(){


await dbFirebase
.collection("ACDP")
.doc("BASE")
.set({


usuarios:BD_usuarios,

afiliados:BD_afiliados,

historial:BD_historial,

cobros:BD_cobros,

configuracion:BD_configuracion


});


}





function interceptarGuardado(){


const original =
window.guardarBD;



window.guardarBD =
function(){


original();



subirFirebase();


};


}