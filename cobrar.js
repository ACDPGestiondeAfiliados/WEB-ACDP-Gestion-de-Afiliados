// ===============================
// MÓDULO COBRAR ACDP
// Gestión de cuotas y pagos
// ===============================


document.addEventListener("DOMContentLoaded",()=>{

    iniciarCobrar();

});


// ===============================
// Inicialización del módulo
// ===============================

function iniciarCobrar(){

    cargarTablaCobrar();


    const filtro=document.getElementById("filtroCobrar");


    if(filtro){

        filtro.addEventListener("input",()=>{

            buscarParaCobrar(filtro.value);

        });

    }

}



// ===============================
// Carga tabla inicial
// ===============================

function cargarTablaCobrar(){

    mostrarCobros(BD_afiliados);

}



// ===============================
// Buscar afiliados
// ===============================

function buscarParaCobrar(valor){

    valor=valor.trim();


    if(!valor){

        mostrarCobros(BD_afiliados);

        return;

    }


    mostrarCobros(
        buscarAfiliado(valor)
    );

}



// ===============================
// Render tabla de cobro
// ===============================

function mostrarCobros(lista){

    const cuerpo=document
    .getElementById("tablaCobrar")
    .querySelector("tbody");


    cuerpo.innerHTML="";


    lista.forEach(a=>{


        let boton="";


        if(a.estado==="Eliminado"){

            boton=`

            <button onclick="cobrarAfiliado('${a.dni}')">
            Bloqueado
            </button>

            `;

        }else{

            boton=`

            <button onclick="cobrarAfiliado('${a.dni}')">
            Cobrar
            </button>

            `;

        }



        cuerpo.innerHTML+=`

        <tr>

            <td>${a.numero||""}</td>

            <td>${a.dni||""}</td>

            <td>${a.nombre||""}</td>

            <td>${a.apellido||""}</td>

            <td>${a.estado||"Activo"}</td>

            <td>

                ${boton}

            </td>

        </tr>

        `;


    });

}



// ===============================
// Ejecuta cobro
// ===============================

function cobrarAfiliado(dni){


    const afiliado=BD_afiliados.find(a=>

        a.dni===dni

    );



    if(!afiliado){

        return;

    }



    // Bloqueo afiliados eliminados

    if(afiliado.estado==="Eliminado"){


        alert(
        "Este afiliado fue eliminado, por favor, consulte en HISTORIAL, o pregunte a un administrador."
        );


        return;

    }



const monto = (BD_configuracion && BD_configuracion.monto) ? BD_configuracion.monto : 0;



    const fecha=new Date();



    const pago={


        usuario:"Admin",


        afiliado:
        afiliado.nombre+" "+afiliado.apellido,


        dni:
        afiliado.dni,


        numero:
        afiliado.numero,


        fecha:
        fecha.toLocaleDateString(),


        hora:
        fecha.toLocaleTimeString(),


        accion:"Cobro",


        detalle:
        "Cuota abonada: $"+monto

    };



    // Guarda en historial

    BD_historial.push(pago);



    // Guarda en registro de cobros

    BD_cobros.push(pago);



    guardarBD();



    if(typeof escribirConsola==="function"){

        escribirConsola(
        "Cobro registrado: "+afiliado.dni
        );

    }



    alert(
    "Cobro registrado correctamente"
    );


}
