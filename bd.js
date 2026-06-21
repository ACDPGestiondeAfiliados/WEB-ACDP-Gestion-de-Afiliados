// ===============================
// BASE DE DATOS ACDP
// Datos separados por módulo
// ===============================


// ===============================
// USUARIOS DEL SISTEMA
// ===============================

let BD_usuarios=[
    {
        usuario:"Admin",
        pin:"9999",
        tipo:"Administrador"
    }
];



// ===============================
// AFILIADOS
// Registro principal
// ===============================

let BD_afiliados=[];



// ===============================
// HISTORIAL
// Registros de pagos y acciones
// ===============================

let BD_historial=[];



// ===============================
// COBROS
// Pagos realizados
// ===============================

let BD_cobros=[];



// ===============================
// CONFIGURACIÓN
// Valores generales
// ===============================

let BD_configuracion={

    monto:0

};



// ===============================
// GUARDAR TODA LA BASE
// ===============================

function guardarBD(){

    const datos={

        usuarios:BD_usuarios,

        afiliados:BD_afiliados,

        historial:BD_historial,

        cobros:BD_cobros,

        configuracion:BD_configuracion

    };


    localStorage.setItem(
        "ACDP_BD",
        JSON.stringify(datos)
    );

}



// ===============================
// CARGAR BASE EXISTENTE
// ===============================

function cargarBD(){


    const datos=
    localStorage.getItem("ACDP_BD");


    if(!datos){

        guardarBD();

        return;

    }



    const bd=JSON.parse(datos);



    BD_usuarios=
    bd.usuarios || [];


    BD_afiliados=
    bd.afiliados || [];


    BD_historial=
    bd.historial || [];


    BD_cobros=
    bd.cobros || [];


    BD_configuracion=
    bd.configuracion || {monto:0};


}



// Inicia base

cargarBD();




// ===============================
// FUNCIONES GENERALES
// ===============================


function buscarAfiliado(valor){

    valor=String(valor);


    return BD_afiliados.filter(a=>

        a.dni===valor ||
        a.numero===valor

    );

}



function guardarCambios(){

    guardarBD();

}
