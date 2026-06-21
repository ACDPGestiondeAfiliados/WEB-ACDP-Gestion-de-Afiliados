// ===============================
// BASE DE DATOS ACDP FIREBASE
// Estado global compartido
// APP MANDA - FIREBASE PERSISTE
// ===============================


import {
    db,
    collection,
    getDocs,
    doc,
    getDoc
} from "./firebase.js";




// ===============================
// VARIABLES GLOBALES
// ===============================


window.BD_usuarios =
window.BD_usuarios || [];


window.BD_afiliados =
window.BD_afiliados || [];


window.BD_historial =
window.BD_historial || [];


window.BD_cobros =
window.BD_cobros || [];


window.BD_configuracion =
window.BD_configuracion || {
    monto:0
};






// ===============================
// INICIO CARGA FIREBASE
// ===============================


async function cargarBD(){


try{



// ===============================
// USUARIOS
// ===============================


const usuarios =
await getDocs(
collection(db,"usuarios")
);



window.BD_usuarios =
usuarios.docs.map(d=>({

id:d.id,

...d.data()

}));







// ===============================
// AFILIADOS
// ===============================


const afiliados =
await getDocs(
collection(db,"afiliados")
);



window.BD_afiliados =
afiliados.docs.map(d=>({

id:d.id,

...d.data()

}));







// ===============================
// HISTORIAL
// ===============================


const historial =
await getDocs(
collection(db,"historial")
);



window.BD_historial =
historial.docs.map(d=>({

id:d.id,

...d.data()

}));







// ===============================
// COBROS
// ===============================


const cobros =
await getDocs(
collection(db,"cobros")
);



window.BD_cobros =
cobros.docs.map(d=>({

id:d.id,

...d.data()

}));







// ===============================
// CONFIGURACION
// ===============================


const config =
await getDoc(

doc(
db,
"configuracion",
"principal"
)

);



if(config.exists()){


window.BD_configuracion =
{

...window.BD_configuracion,

...config.data()

};


}





console.log(
"ACDP Firebase cargado"
);





window.dispatchEvent(
new Event("BD_CARGADA")
);





}catch(e){


console.error(
"Error cargando Firebase",
e
);


}


}






cargarBD();








// ===============================
// BUSCAR AFILIADO
// ===============================


window.buscarAfiliado=function(valor){


valor =
String(valor);



return window.BD_afiliados.filter(a=>


String(a.dni)===valor ||

String(a.numero)===valor


);


};








// ===============================
// COMPATIBILIDAD
// ===============================


window.guardarBD=function(){


console.warn(
"guardarBD reemplazado por Firestore"
);


};





window.guardarCambios=function(){


console.warn(
"guardarCambios reemplazado por Firestore"
);


};
