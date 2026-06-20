// =====================================
// ACDP - CONFIGURACIÓN
// =====================================



function cargarConfiguracion(){


let contenedor =
document.getElementById(
"contenidoConfig"
);




if(
usuarioActivo!=="Admin"
){


contenedor.innerHTML = `


<h2>

Configuración y Monto

</h2>


<p>

Acceso restringido.

Solo el administrador puede ingresar.

</p>


`;



return;

}






let cuota =
BD.configuracion.cuota;



contenedor.innerHTML = `



<h2>

Configuración y Monto

</h2>




<p>

Valor actual de cuota:

<b>

$${formatearPesos(cuota)}

</b>

</p>






<input

id="nuevoMonto"

placeholder="Monto"

oninput="formatearInputMonto(this)"

>




<br><br>



<button onclick="guardarConfiguracion()">

Guardar

</button>





<h3>

Registro del sistema

</h3>



<div id="logSistema" class="log">


${obtenerLog()}


</div>



`;




}









function guardarConfiguracion(){



let valor =
document.getElementById(
"nuevoMonto"
).value;





valor =
valor.replace(/\D/g,"");



valor =
Number(valor);





if(
valor < 10000 ||
valor > 999999
){


alert(

"El monto debe estar entre $10.000 y $999.999"

);


return;


}







BD.configuracion.cuota =
valor;






registrarHistorial({


usuario:usuarioActivo,

accion:
"Configuración modificada",

detalles:
"Nuevo valor cuota: $"+
formatearPesos(valor)


});







agregarLog(

"Cuota actualizada a $"+
formatearPesos(valor)

);





guardarBD();



alert(
"Configuración guardada"
);



cargarConfiguracion();



}









function formatearInputMonto(input){



let valor =
input.value.replace(
/\D/g,
""
);



if(valor){


input.value =
Number(valor)
.toLocaleString(
"es-AR"
);


}



}










// =====================================
// SISTEMA DE LOG
// =====================================



function agregarLog(texto){



let logs =
JSON.parse(
localStorage.getItem(
"ACDP_LOG"
)
)
||
[];




logs.push({

fecha:
fechaActual(),

hora:
horaActual(),

texto

});





localStorage.setItem(

"ACDP_LOG",

JSON.stringify(logs)

);



}







function obtenerLog(){



let logs =
JSON.parse(
localStorage.getItem(
"ACDP_LOG"
)
)
||
[];





if(logs.length===0){


return "Sin registros";


}





return logs
.reverse()
.map(l=>{


return `

<div>

[${l.fecha} ${l.hora}]
${l.texto}

</div>

`;


})
.join("");



}
