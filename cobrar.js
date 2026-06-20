// ===============================
// MÓDULO COBRAR ACDP
// Gestión de cuotas y pagos
// ===============================


document.addEventListener("DOMContentLoaded",()=>{

    iniciarCobrar();

});


// Inicializa buscador y tabla

function iniciarCobrar(){

    cargarTablaCobrar();

    const filtro=document.getElementById("filtroCobrar");


    if(filtro){

        filtro.addEventListener("input",()=>{

            buscarParaCobrar(
                filtro.value
            );

        });

    }

}



// Carga tabla inicial

function cargarTablaCobrar(){

    mostrarCobros(BD.afiliados);

}



// Busca afiliados

function buscarParaCobrar(valor){

    valor=valor.trim();


    if(!valor){

        mostrarCobros(BD.afiliados);

        return;

    }


    mostrarCobros(
        buscarAfiliado(valor)
    );

}



// Render tabla cobrar

function mostrarCobros(lista){

    const cuerpo=document
    .getElementById("tablaCobrar")
    .querySelector("tbody");


    cuerpo.innerHTML="";


    lista.forEach(a=>{


        cuerpo.innerHTML+=`

        <tr>

            <td>${a.numero||""}</td>

            <td>${a.dni||""}</td>

            <td>${a.nombre||""}</td>

            <td>${a.apellido||""}</td>

            <td>${a.estado||""}</td>

            <td>

                <button onclick="cobrarAfiliado('${a.dni}')">
                    Cobrar
                </button>

            </td>

        </tr>

        `;


    });

}



// Ejecuta cobro

function cobrarAfiliado(dni){

    const afiliado=BD.afiliados.find(a=>

        a.dni===dni

    );


    if(!afiliado){

        return;

    }


    const monto=obtenerConfiguracion()
    .monto || 0;



    const pago={

        usuario:"Admin",

        afiliado:
        afiliado.nombre+" "+afiliado.apellido,

        dni:
        afiliado.dni,

        numero:
        afiliado.numero,

        fecha:
        new Date().toLocaleDateString(),

        hora:
        new Date().toLocaleTimeString(),

        accion:"Cobro",

        detalle:
        "Cuota abonada: $"+monto

    };



    registrarHistorial(pago);



    escribirConsola(
        "Cobro registrado: "+afiliado.dni
    );


    alert(
        "Cobro registrado correctamente"
    );

}
