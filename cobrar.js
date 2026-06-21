// ===============================
// MÓDULO COBRAR ACDP
// Gestión de cuotas y pagos
// ===============================


document.addEventListener("DOMContentLoaded",()=>{

    iniciarCobrar();

});



// ===============================
// Inicialización
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
// Tabla
// ===============================

function cargarTablaCobrar(){

    mostrarCobros(BD_afiliados);

}




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




function mostrarCobros(lista){

    const cuerpo=
    document.getElementById("tablaCobrar")
    .querySelector("tbody");


    cuerpo.innerHTML="";


    lista.forEach(a=>{


        let boton=`


        <button onclick="cobrarAfiliado('${a.dni}')">

        Cobrar

        </button>


        `;



        if(a.estado==="Eliminado"){

            boton=`

            <button onclick="cobrarAfiliado('${a.dni}')">

            Bloqueado

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

        <td>${boton}</td>


        </tr>

        `;


    });


}



// ===============================
// Abrir modal cobro
// ===============================


function cobrarAfiliado(dni){


const afiliado=
BD_afiliados.find(a=>a.dni===dni);



if(!afiliado)return;



if(afiliado.estado==="Eliminado"){

alert(
"Este afiliado fue eliminado."
);

return;

}


crearModalCobro(afiliado);


}



// ===============================
// Obtener meses pagados por año
// ===============================

function obtenerMesesPagadosActivos(dni){


let meses=[];


const anioActual =
new Date().getFullYear();



if(!Array.isArray(BD_cobros)){

return meses;

}



BD_cobros.forEach(c=>{


if(
c.dni===dni &&
c.estado!=="Anulado" &&
Array.isArray(c.meses)
){


const anioCobro =
c.anio || anioActual;



if(anioCobro!==anioActual){

return;

}



c.meses.forEach(m=>{


const clave =
m+"-"+anioCobro;



if(!meses.includes(clave)){

meses.push(clave);

}


});


}



});



return meses;


}



// ===============================
// Modal
// ===============================

function crearModalCobro(afiliado){


const anterior =
document.getElementById("modalCobro");


if(anterior){

anterior.remove();

}



let meses=[

"Enero",
"Febrero",
"Marzo",
"Abril",
"Mayo",
"Junio",
"Julio",
"Agosto",
"Septiembre",
"Octubre",
"Noviembre",
"Diciembre"

];


const anioActual =
new Date().getFullYear();



let pagados =
obtenerMesesPagadosActivos(afiliado.dni);



let html="";



meses.forEach((m)=>{


const clave =
m+"-"+anioActual;



let existe =
pagados.includes(clave);



html+=`

<label>


<input 
type="checkbox"
class="checkMes"
value="${m}"
${existe ? "checked disabled":""}
>


${m}


</label>

<br>

`;



});





const div=document.createElement("div");


div.id="modalCobro";


div.className="modal-fondo activo";



div.innerHTML=`

<div class="modal">


<h3>

Cobrar afiliado

</h3>


<p>

${afiliado.nombre}
${afiliado.apellido}

</p>


${html}


<br>


<button onclick="confirmarCobro('${afiliado.dni}')">

Aceptar

</button>


<button onclick="cerrarModalCobro()">

Cancelar

</button>



</div>

`;



document.body.appendChild(div);


}



// ===============================
// Cerrar modal
// ===============================

function cerrarModalCobro(){

const m=
document.getElementById("modalCobro");


if(m){

m.remove();

}


}



// ===============================
// Confirmar pago
// ===============================


function confirmarCobro(dni){



const afiliado=
BD_afiliados.find(a=>a.dni===dni);



if(!afiliado)return;




const checks=
document.querySelectorAll(".checkMes");



let nuevos=[];



checks.forEach(c=>{


if(c.checked && !c.disabled){

nuevos.push(c.value);

}


});





if(nuevos.length===0){

alert(
"Seleccione al menos un mes."
);

return;

}




const monto=
(BD_configuracion && BD_configuracion.monto)
?
BD_configuracion.monto
:
0;



const total =
monto * nuevos.length;




const fecha=new Date();



const anioActual =
fecha.getFullYear();



const usuarioRegistro =
(typeof usuarioActivo !== "undefined" &&
usuarioActivo &&
usuarioActivo!=="Admin")
?
usuarioActivo
:
"Sistema";






const cobroNuevo={


usuario:usuarioRegistro,


afiliado:
afiliado.nombre+
" "+
afiliado.apellido,


dni:
afiliado.dni,


numero:
afiliado.numero,


fecha:
fecha.toLocaleDateString(),


hora:
fecha.toLocaleTimeString(),


anio:
anioActual,


accion:
"Cobro",


detalle:
"Meses: "+
nuevos.join(", ")+
" | Total: $"+
total,


meses:
nuevos,


total:
total


};





registrarHistorial(

"Cobro",

afiliado,

"Meses: "+
nuevos.join(", ")+
" | Total: $"+
total

);





BD_cobros.push(
cobroNuevo
);





if(!afiliado.mesesPagados){

afiliado.mesesPagados=[];

}



nuevos.forEach(m=>{


const clave =
m+"-"+anioActual;



if(!afiliado.mesesPagados.includes(clave)){


afiliado.mesesPagados.push(clave);


}


});






guardarBD();




cerrarModalCobro();



alert(
"Cobro registrado correctamente"
);




generarComprobanteCobro(

afiliado,

nuevos,

total

);



}



// ===============================
// Ticket
// ===============================


function generarComprobanteCobro(
afiliado,
meses,
total
){



const ventana=
window.open(
"",
"_blank",
"width=400,height=600"
);



if(!ventana)return;




ventana.document.write(`


<html>

<body style="font-family:Arial;text-align:center">


<h2>

ACDP - Comprobante

</h2>


<p>

Afiliado:

<br>

${afiliado.nombre}
${afiliado.apellido}

</p>



<p>

DNI:

<br>

${afiliado.dni}

</p>



<p>

Meses:

<br>

${meses.join("<br>")}

</p>



<h3>

Total:

<br>

$${total}

</h3>



<br>


<p>

Muchas gracias!

</p>



<script>

window.print();

</script>



</body>


</html>


`);



ventana.document.close();



}
