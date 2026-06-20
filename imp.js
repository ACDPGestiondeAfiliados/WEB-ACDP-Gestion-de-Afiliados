/* =====================================
   ACDP - CONFIGURACIÓN
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


iniciarConfiguracion();


});








function iniciarConfiguracion(){



document
.getElementById(
"guardarConfiguracion")
.onclick =
guardarConfiguracion;



}









function cargarConfiguracion(){



if(
usuarioActivo!=="Admin"
){



document
.getElementById(
"montoConfiguracion")
.value =
"";



document
.getElementById(
"consolaSistema")
.textContent =
"Acceso restringido";



return;


}






document
.getElementById(
"montoConfiguracion")
.value =
formatearNumero(
BD.configuracion.cuota
);






mostrarLogs();



}









function guardarConfiguracion(){



if(
usuarioActivo!=="Admin"
){


alert(
"Acceso restringido"
);


return;


}







let valor =
document
.getElementById(
"montoConfiguracion")
.value;






valor =
limpiarNumero(
valor
);




valor =
Number(valor);








if(
valor < 10000
||
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

usuario:
usuarioActivo,


accion:
"Configuración modificada",


detalles:
"Nuevo monto: $"
+
formatearNumero(valor)



});






agregarLog(

"Cuota modificada: $"
+
formatearNumero(valor)

);





guardarBD();






alert(
"Configuración guardada"
);





cargarConfiguracion();



}









function agregarLog(texto){



if(!BD.logs)
BD.logs=[];





BD.logs.push({



fecha:
obtenerFecha(),



hora:
obtenerHora(),



texto



});






guardarBD();



}









function mostrarLogs(){



let consola =
document
.getElementById(
"consolaSistema"
);





consola.innerHTML="";





if(
!BD.logs
||
BD.logs.length===0
){



consola.textContent =
"Sin registros";



return;


}







BD.logs
.slice()
.reverse()
.forEach(log=>{



let linea =
document.createElement(
"div"
);



linea.textContent =
`

[${log.fecha} ${log.hora}]
${log.texto}

`;



consola.appendChild(
linea
);



});




}









function formatearNumero(valor){



return Number(valor)
.toLocaleString(
"es-AR"
);



}
