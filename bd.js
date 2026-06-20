// =====================================
// ACDP - BASE DE DATOS PRINCIPAL
// =====================================


// Carga inicial de datos

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




// Guardar datos

function guardarBD(){

    localStorage.setItem(
        "ACDP_BD",
        JSON.stringify(BD)
    );

}



// Cargar datos

function cargarBD(){


    let datos = localStorage.getItem("ACDP_BD");


    if(datos){

        BD = JSON.parse(datos);

    }
    else{

        guardarBD();

    }


}




// Inicialización

cargarBD();




// Generador de ID afiliado

function generarNumeroAfiliado(){


    let ultimo = 0;


    if(BD.afiliados.length > 0){


        ultimo = Math.max(

            ...BD.afiliados.map(a =>
                Number(a.numero)
            )

        );


    }



    ultimo++;


    return String(ultimo).padStart(8,"0");


}




// Fecha actual

function fechaActual(){


    let f = new Date();


    return (

        String(f.getDate()).padStart(2,"0")
        +"/"+
        String(f.getMonth()+1).padStart(2,"0")
        +"/"+
        f.getFullYear()

    );


}




// Hora actual

function horaActual(){


    let f = new Date();


    return (

        String(f.getHours()).padStart(2,"0")
        +":"+
        String(f.getMinutes()).padStart(2,"0")

    );


}




// Registrar historial

function registrarHistorial(datos){


    BD.historial.push({

        usuario: datos.usuario,

        afiliado: datos.afiliado || "",

        dni: datos.dni || "",

        numero: datos.numero || "",

        fecha: fechaActual(),

        hora: horaActual(),

        accion: datos.accion,

        detalles: datos.detalles || ""

    });


    guardarBD();


}
