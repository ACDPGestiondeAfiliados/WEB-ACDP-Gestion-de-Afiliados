// ===============================
// PUENTE FIREBASE ACDP
// FIREBASE MODULAR
// NO MODIFICA LA APP
// ===============================


import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



window.addEventListener(
"load",
()=>{

    sincronizarFirebase();

});





async function sincronizarFirebase(){


try{


const referencia =
doc(
    window.dbFirebase,
    "ACDP",
    "BASE"
);



const snap =
await getDoc(referencia);




if(snap.exists()){



const datos =
snap.data();



window.BD_usuarios =
datos.usuarios ||
window.BD_usuarios;



window.BD_afiliados =
datos.afiliados ||
window.BD_afiliados;



window.BD_historial =
datos.historial ||
window.BD_historial;



window.BD_cobros =
datos.cobros ||
window.BD_cobros;



window.BD_configuracion =
datos.configuracion ||
window.BD_configuracion;




guardarBD();



}else{


await subirFirebase();


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


});


}






function interceptarGuardado(){


const original =
window.guardarBD;



if(!original)return;




window.guardarBD =
function(){


original();



subirFirebase();


};



}
