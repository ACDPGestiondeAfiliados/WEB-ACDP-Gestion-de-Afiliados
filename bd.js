/* =====================================
   ACDP - BASE DE DATOS
===================================== */



const BD_KEY = "ACDP_BASE_DATOS";



let BD = {


    afiliados: [],


    pagos: [],


    historial: [],


    usuarios: [


        {

            usuario:"Admin",

            tipo:"Administrador",

            pin:"9999"

        }


    ],



    configuracion:{


        cuota:15000


    }



};






function iniciarBD(){



    let datos =
    localStorage.getItem(BD_KEY);



    if(datos){


        BD =
        JSON.parse(datos);


    }
    else{


        guardarBD();


    }



}






function guardarBD(){


    localStorage.setItem(

        BD_KEY,

        JSON.stringify(BD)

    );


}








function generarNumeroAfiliado(){



    let ultimo = 0;



    BD.afiliados.forEach(a=>{


        let numero =
        Number(a.numero);



        if(numero > ultimo){

            ultimo = numero;

        }



    });





    ultimo++;





    return String(ultimo)
    .padStart(8,"0");



}








function obtenerFecha(){


    let f =
    new Date();



    return (

        String(f.getDate())
        .padStart(2,"0")

        +

        "/"

        +

        String(
        f.getMonth()+1)
        .padStart(2,"0")

        +

        "/"

        +

        f.getFullYear()

    );



}








function obtenerHora(){



    let f =
    new Date();




    return (

        String(f.getHours())
        .padStart(2,"0")

        +

        ":"

        +

        String(f.getMinutes())
        .padStart(2,"0")

    );



}









function registrarHistorial(datos){



    BD.historial.push({


        usuario:
        datos.usuario || "",


        afiliado:
        datos.afiliado || "",


        dni:
        datos.dni || "",


        numero:
        datos.numero || "",



        fecha:
        obtenerFecha(),


        hora:
        obtenerHora(),



        accion:
        datos.accion || "",


        detalles:
        datos.detalles || "SIN MOTIVOS"



    });





    guardarBD();



}








function limpiarNumero(valor){


    return String(valor)
    .replace(/\D/g,"");


}







function formatoPesos(valor){



    return Number(valor)
    .toLocaleString(
        "es-AR",
        {

        minimumFractionDigits:2,

        maximumFractionDigits:2

        }

    );



}







iniciarBD();
