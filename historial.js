// =====================================
// ACDP - HISTORIAL
// =====================================


let fechaHistorial = new Date();



function cargarHistorial(){


    let contenedor =
    document.getElementById(
        "contenidoHistorial"
    );



    let fechaTexto =
    formatoFechaHistorial(
        fechaHistorial
    );



    let registros =
    obtenerHistorialDia(
        fechaTexto
    );





    let html = `


    <h2>
    HISTORIAL
    </h2>



    <p class="centrado">

    Bienvenido ${usuarioActivo || ""}

    desde el HISTORIAL, podés ver todos los movimientos realizados el día de hoy

    </p>



    <div class="navegacionFecha">


    <button onclick="diaAnteriorHistorial()">
    <
    </button>



    <b>
    ${fechaTexto}
    </b>



    <button onclick="diaSiguienteHistorial()">
    >
    </button>



    </div>





    <br>



    <input

    id="buscarHistorial"

    maxlength="8"

    placeholder="DNI o Nro Afiliado"

    oninput="filtrarHistorial()"

    >



    <button onclick="imprimirHistorial()">

    Imprimir

    </button>




    <br><br>





    <table>


    <thead>

    <tr>

    <th>
    Usuario
    </th>

    <th>
    Afiliado
    </th>

    <th>
    DNI
    </th>

    <th>
    Nro Afiliado
    </th>

    <th>
    Fecha
    </th>

    <th>
    Hora
    </th>

    <th>
    Acción
    </th>

    <th>
    Detalles
    </th>


    </tr>


    </thead>



    <tbody id="tablaHistorial">


    `;




    registros.forEach(r=>{


        html += crearFilaHistorial(r);



    });




    html += `


    </tbody>


    </table>



    <h3>

    Monto:
    $
    <span id="montoDia">

    ${calcularMontoDia(registros)}

    </span>


    </h3>


    `;




    contenedor.innerHTML =
    html;




}









function crearFilaHistorial(r){



return `


<tr>


<td>

${r.usuario}

</td>


<td>

${r.afiliado}

</td>



<td>

${r.dni}

</td>



<td>

${r.numero}

</td>



<td>

${r.fecha}

</td>



<td>

${r.hora}

</td>




<td>

${r.accion}


</td>





<td>

${r.detalles || "SIN DETALLES"}


</td>



</tr>



`;



}









function obtenerHistorialDia(fecha){



return BD.historial.filter(h=>

h.fecha===fecha

);



}










function diaAnteriorHistorial(){



fechaHistorial.setDate(

fechaHistorial.getDate()-1

);



cargarHistorial();



}







function diaSiguienteHistorial(){



fechaHistorial.setDate(

fechaHistorial.getDate()+1

);



cargarHistorial();


}









function formatoFechaHistorial(fecha){


return (

String(fecha.getDate())
.padStart(2,"0")

+

"/"

+

String(
fecha.getMonth()+1
)
.padStart(2,"0")

+

"/"

+

fecha.getFullYear()

);



}









function filtrarHistorial(){



let valor =
document.getElementById(
"buscarHistorial"
).value;



valor =
valor.replace(/\D/g,"");




if(valor.length!==8){


cargarHistorial();

return;


}





let filas =
BD.historial.filter(h=>

(h.dni===valor ||
h.numero===valor)

&&

h.fecha===formatoFechaHistorial(fechaHistorial)

);




let cuerpo =
document.getElementById(
"tablaHistorial"
);



cuerpo.innerHTML="";



filas.forEach(r=>{


cuerpo.innerHTML +=
crearFilaHistorial(r);



});





}









function calcularMontoDia(lista){



let total=0;



lista.forEach(r=>{


if(
r.accion==="Pago registrado"
){


let pago =
BD.pagos.find(p=>

p.fecha===r.fecha
&&
p.hora===r.hora
&&
p.numero===r.numero

);



if(pago){

total+=pago.monto;

}


}


});



if(total<0){

total=0;

}



return formatearPesos(total);



}








function imprimirHistorial(){



if(typeof generarPDF==="function"){


generarPDF(

"historial"

);


}

else{


alert(
"Impresión preparada próximamente"
);


}


}
