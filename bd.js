// ===============================
// BASE DE DATOS LOCAL ACDP
// Maneja almacenamiento permanente
// del navegador mediante localStorage
// ===============================

const BD_KEY="acdp_datos";


// Estructura inicial del sistema

const datosIniciales={
    usuarios:[
        {
            usuario:"Admin",
            pin:"9999",
            tipo:"Administrador"
        }
    ],

    afiliados:[],

    historial:[],

    configuracion:{
        monto:0
    }
};


// Cargar base de datos existente
// Si no existe, crea una nueva

function cargarBD(){

    const datos=localStorage.getItem(BD_KEY);

    if(!datos){

        localStorage.setItem(
            BD_KEY,
            JSON.stringify(datosIniciales)
        );

        return datosIniciales;
    }

    return JSON.parse(datos);

}



// Variable global de trabajo

let BD=cargarBD();



// Guardar cambios en la base

function guardarBD(){

    localStorage.setItem(
        BD_KEY,
        JSON.stringify(BD)
    );

}



// Agrega registro al historial del sistema

function registrarHistorial(registro){

    BD.historial.push(registro);

    guardarBD();

}



// Busca afiliado por DNI o número

function buscarAfiliado(valor){

    valor=String(valor);

    return BD.afiliados.filter(a=>

        a.dni===valor ||
        a.numero===valor

    );

}



// Obtener configuración actual

function obtenerConfiguracion(){

    return BD.configuracion;

}



// Actualizar configuración

function actualizarConfiguracion(nueva){

    BD.configuracion=nueva;

    guardarBD();

}
