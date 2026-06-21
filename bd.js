// ===============================
// BASE DE DATOS ACDP FIREBASE
// Estado global compartido
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


window.BD_usuarios = [];

window.BD_afiliados = [];

window.BD_historial = [];

window.BD_cobros = [];

window.BD_configuracion = {
    monto:0
};




// ===============================
// INICIO CARGA FIREBASE
// ===============================


async function cargarBD(){


    try{


        const usuarios =
        await getDocs(
            collection(db,"usuarios")
        );


        window.BD_usuarios=[];


        usuarios.forEach(d=>{

            window.BD_usuarios.push({
                id:d.id,
                ...d.data()
            });

        });





        const afiliados =
        await getDocs(
            collection(db,"afiliados")
        );


        window.BD_afiliados=[];


        afiliados.forEach(d=>{

            window.BD_afiliados.push({
                id:d.id,
                ...d.data()
            });

        });






        const historial =
        await getDocs(
            collection(db,"historial")
        );


        window.BD_historial=[];


        historial.forEach(d=>{

            window.BD_historial.push({
                id:d.id,
                ...d.data()
            });

        });







        const cobros =
        await getDocs(
            collection(db,"cobros")
        );


        window.BD_cobros=[];


        cobros.forEach(d=>{

            window.BD_cobros.push({
                id:d.id,
                ...d.data()
            });

        });







        const config =
        await getDoc(
            doc(db,"configuracion","principal")
        );



        if(config.exists()){

            window.BD_configuracion =
            config.data();

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


valor=String(valor);



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
