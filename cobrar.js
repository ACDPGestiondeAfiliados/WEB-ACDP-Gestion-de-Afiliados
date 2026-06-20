// =====================================
// ACDP - COBRAR
// =====================================



let afiliadoSeleccionadoPago = null;



function cargarCobrar(){


let contenedor =
document.getElementById(
"contenidoCobrar"
);



contenedor.innerHTML = `


<p>

Busque un afiliado por DNI o Número de Afiliado

</p>


<input

id="buscarPago"

maxlength="8"

placeholder="DNI o Nro Afiliado"

oninput="buscarAfiliadoPago()"

>


<div id="resultadoPago">

</div>


`;



}






function buscarAfiliadoPago(){



let valor =
document.getElementById(
"buscarPago"
).value;



valor =
valor.replace(/\D/g,"");



if(valor.length !== 8){


document.getElementById(
"resultadoPago"
).innerHTML="";


return;

}





let afiliado =
BD.afiliados.find(a=>

a.dni===valor ||
a.numero===valor

);





if(!afiliado){


document.getElementById(
"resultadoPago"
).innerHTML=

"Afiliado no encontrado";


return;


}




afiliadoSeleccionadoPago =
afiliado;




document.getElementById(
"resultadoPago"
).innerHTML = `


<table>


<tr>

<th>Nro Afiliado</th>
<th>DNI</th>
<th>Nombre</th>
<th>Apellido</th>
<th>Estado</th>
<th>Acción</th>


</tr>


<tr>


<td>${afiliado.numero}</td>

<td>${afiliado.dni}</td>

<td>${afiliado.nombre}</td>

<td>${afiliado.apellido}</td>

<td>${afiliado.estado}</td>


<td>

<button onclick="abrirPago()">

Registrar Pago

</button>


</td>


</tr>


</table>


`;



}








function abrirPago(){


let a =
afiliadoSeleccionadoPago;



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




let html = `


<h2>

Registrar Pago

</h2>


<p>

Seleccione meses que abonará

</p>



<div id="listaMeses">


`;





meses.forEach(m=>{


html += `


<label>


<input

type="checkbox"

value="${m}"

onchange="calcularPago()"

>

${m}


</label>

<br>


`;


});





html += `


<h3>

Total:

$<span id="totalPago">0</span>

</h3>



<button onclick="registrarPago()">

Aceptar

</button>



<button onclick="cerrarModal()">

Cancelar

</button>



`;



abrirModal(html);



}




function calcularPago(){



let checks =
document.querySelectorAll(
"#listaMeses input:checked"
);



let total =
checks.length *
BD.configuracion.cuota;



document.getElementById(
"totalPago"
).innerHTML =
formatearPesos(total);



}








function registrarPago(){



let checks =
document.querySelectorAll(
"#listaMeses input:checked"
);




if(checks.length===0){


alert(
"Seleccione al menos un mes"
);


return;

}





let meses=[];



checks.forEach(c=>{

meses.push(c.value);

});




let monto =
checks.length *
BD.configuracion.cuota;





let a =
afiliadoSeleccionadoPago;





BD.pagos.push({


usuario:
usuarioActivo,


numero:
a.numero,


dni:
a.dni,


afiliado:
a.nombre+" "+a.apellido,


meses,


monto,


fecha:
fechaActual(),


hora:
horaActual(),


estado:
"ACTIVO"


});







registrarHistorial({

usuario:
usuarioActivo,


afiliado:
a.nombre+" "+a.apellido,


dni:
a.dni,


numero:
a.numero,


accion:
"Pago registrado",


detalles:
"Meses: "+meses.join(", ")

});






guardarBD();



alert(
"PAGO REGISTRADO"
);



cerrarModal();



cargarCobrar();



}




function formatearPesos(valor){


return Number(valor)
.toLocaleString(
"es-AR",
{

minimumFractionDigits:2,

maximumFractionDigits:2

}
);


}



