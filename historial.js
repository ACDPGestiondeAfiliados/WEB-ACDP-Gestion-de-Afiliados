/* =====================================
   ACDP - HISTORIAL
===================================== */


let fechaHistorialActual = new Date();

let filtroHistorialActual = "";






document.addEventListener(
"DOMContentLoaded",
()=>{


iniciarHistorial();


});









function iniciarHistorial(){



document
.getElementById(
"historialAnterior")
.onclick =
()=>{


cambiarDiaHistorial(-1);


};






document
.getElementById(
"historialSiguiente")
.onclick =
()=>{


cambiarDiaHistorial(1);


};






document
.getElementById(
"filtroHistorial")
.addEventListener(
"input",
()=>{


filtroHistorialActual =
limpiarNumero(
document.getElementById(
"filtroHistorial"
).value
);



cargarHistorial();



});






document
.getElementById(
"btnImprimirHistorial")
.onclick =
()=>{


imprimirTabla(
"tablaHistorial"
);



};



}









function cargarHistorial(){



actualizarFechaHistorial();





let tabla =
document
.querySelector(
"#tablaHistorial tbody"
);



tabla.innerHTML="";







let fecha =
formatoFecha(
fechaHistorialActual
);







let lista =
BD.historial.filter(h=>

h.fecha===fecha

);






if(
filtroHistorialActual.length===8
){



lista =
lista.filter(h=>

h.dni===filtroHistorialActual
||
h.numero===filtroHistorialActual

);



}










lista.forEach(h=>{



let fila =
document.createElement(
"tr"
);





fila.innerHTML =
`

<td>${h.usuario}</td>

<td>${h.afiliado}</td>

<td>${h.dni}</td>

<td>${h.numero}</td>

<td>${h.fecha}</td>

<td>${h.hora}</td>

<td></td>

<td>${h.detalles}</td>

`;






let acciones =
fila.children[6];






if(
h.accion==="Pago registrado"
&&
!h.cancelado
){





acciones.appendChild(
crearBoton(
"Reimprimir",
()=>reimprimirDesdeHistorial(h)
)
);






acciones.appendChild(
crearBoton(
"Eliminar",
()=>cancelarPagoHistorial(h)
)
);




}

else
if(h.cancelado)
{


fila.classList.add(
"fila-bloqueada"
);



acciones.textContent =
"Cancelado";



}





tabla.appendChild(
fila
);



});






actualizarMontoHistorial(
lista
);



}









function cambiarDiaHistorial(dias){



fechaHistorialActual.setDate(

fechaHistorialActual.getDate()
+
dias

);




cargarHistorial();



}









function actualizarFechaHistorial(){



document
.getElementById(
"fechaHistorial")
.textContent =
formatoFecha(
fechaHistorialActual
);



}









function formatoFecha(f){



return (

String(
f.getDate()
)
.padStart(2,"0")

+

"/"

+

String(
f.getMonth()+1
)
.padStart(2,"0")

+

"/"

+

f.getFullYear()


);



}









function actualizarMontoHistorial(lista){



let total = 0;






lista.forEach(h=>{



if(
h.accion==="Pago registrado"
&&
!h.cancelado
){



let pago =
BD.pagos.find(p=>

p.fecha===h.fecha
&&
p.hora===h.hora
&&
p.numero===h.numero

);




if(pago){

total += pago.monto;

}



}



});







document
.getElementById(
"montoHistorial")
.textContent =
"$"+
formatoPesos(total);



}









function reimprimirDesdeHistorial(h){



let pago =
BD.pagos.find(p=>

p.numero===h.numero
&&
p.fecha===h.fecha
&&
p.hora===h.hora

);




if(!pago){

alert(
"Pago no encontrado"
);

return;

}




imprimirComprobante(
pago
);



}









function cancelarPagoHistorial(h){



let confirmar =
confirm(
"¿Desea cancelar este pago?"
);



if(!confirmar)
return;







h.cancelado = true;






let pago =
BD.pagos.find(p=>

p.numero===h.numero
&&
p.fecha===h.fecha
&&
p.hora===h.hora

);






if(pago){


pago.activo=false;


}








registrarHistorial({

usuario:
usuarioActivo,


afiliado:
h.afiliado,


dni:
h.dni,


numero:
h.numero,



accion:
"Pago cancelado",


detalles:
"Pago eliminado"



});







guardarBD();





cargarHistorial();



}
