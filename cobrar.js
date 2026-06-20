/* =====================================
   ACDP - COBRAR
===================================== */


let afiliadoSeleccionadoPago = null;



const meses =
[
"enero",
"febrero",
"marzo",
"abril",
"mayo",
"junio",
"julio",
"agosto",
"septiembre",
"octubre",
"noviembre",
"diciembre"
];







document.addEventListener(
"DOMContentLoaded",
()=>{


iniciarCobrar();


});









function iniciarCobrar(){



let filtro =
document.getElementById(
"filtroCobrar"
);



if(filtro){


filtro.addEventListener(
"input",
buscarAfiliadoCobro
);


}



}








function cargarCobrar(){



document
.querySelector(
"#tablaCobrar tbody")
.innerHTML="";



}









function buscarAfiliadoCobro(){



let valor =
limpiarNumero(
document.getElementById(
"filtroCobrar"
).value
);




let tabla =
document
.querySelector(
"#tablaCobrar tbody"
);



tabla.innerHTML="";




if(
valor.length!==8
)
return;





let encontrados =
BD.afiliados.filter(a=>

a.dni===valor
||
a.numero===valor

);







encontrados.forEach(a=>{


let fila =
document.createElement(
"tr"
);



fila.innerHTML =
`

<td>${a.numero}</td>

<td>${a.dni}</td>

<td>${a.nombre}</td>

<td>${a.apellido}</td>

<td>${a.estado}</td>

<td></td>

`;





fila.children[5]
.appendChild(
crearBoton(
"Registrar Pago",
()=>abrirPago(a)
)
);



tabla.appendChild(fila);



});



}









function abrirPago(afiliado){



afiliadoSeleccionadoPago =
afiliado;



abrirModal();




let caja =
document.getElementById(
"modalContenido"
);



caja.innerHTML="";





let titulo =
document.createElement(
"h2"
);



titulo.textContent =
"Registrar Pago";



caja.appendChild(titulo);





let texto =
document.createElement(
"p"
);



texto.textContent =
"Seleccione meses a abonar";



caja.appendChild(texto);








let pagos =
BD.pagos.filter(p=>

p.numero===afiliado.numero
&&
p.activo!==false

);




let pagados =
[];




pagos.forEach(p=>{


p.meses.forEach(m=>{

pagados.push(m);

});


});







meses.forEach(m=>{


let label =
document.createElement(
"label"
);



let check =
document.createElement(
"input"
);



check.type =
"checkbox";



check.value =
m;



if(
pagados.includes(m)
){


check.disabled =
true;


label.className =
"bloqueado";


}




label.appendChild(check);


label.appendChild(
document.createTextNode(
" "+m
)
);



caja.appendChild(label);



});







let boton =
crearBoton(
"Aceptar",
confirmarPago
);



caja.appendChild(boton);



}









function confirmarPago(){



let checks =
document
.querySelectorAll(
"#modalContenido input[type=checkbox]:checked"
);





let seleccionados =
[];




checks.forEach(c=>{


seleccionados.push(
c.value
);


});







if(
seleccionados.length===0
){


alert(
"Seleccione meses"
);



return;



}







let monto =
seleccionados.length *
BD.configuracion.cuota;







let pago = {


usuario:
usuarioActivo,


numero:
afiliadoSeleccionadoPago.numero,


dni:
afiliadoSeleccionadoPago.dni,



afiliado:
afiliadoSeleccionadoPago.nombre
+" "
+afiliadoSeleccionadoPago.apellido,



meses:
seleccionados,



monto,



fecha:
obtenerFecha(),

hora:
obtenerHora(),



activo:true,


metodo:
""



};







BD.pagos.push(
pago
);





registrarHistorial({

usuario:
usuarioActivo,


afiliado:
pago.afiliado,


dni:
pago.dni,


numero:
pago.numero,



accion:
"Pago registrado",


detalles:
seleccionados.join(", ")

});






guardarBD();






cerrarModal();






alert(
"PAGO REGISTRADO"
);







imprimirComprobante(
pago
);





}
