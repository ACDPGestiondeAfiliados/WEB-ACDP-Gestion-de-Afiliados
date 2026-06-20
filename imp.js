// =====================================
// ACDP - IMPRESIÓN TEMPORAL
// =====================================



// -------------------------------------
// COMPROBANTE DE PAGO
// -------------------------------------


function imprimirComprobante(pago){


let html = `


<div class="comprobante">


<h2>
ACDP - Gremio Docente
</h2>


<h3>
Comprobante de pago
</h3>



<br>


<b>Afiliado:</b>

${pago.afiliado}



<br>


<b>Nro:</b>

${pago.numero}



<br><br>


<b>Meses abonados:</b>

${pago.meses.join(", ")}



<br><br>



<b>Monto:</b>

$${formatearPesos(pago.monto)}



<br><br>


<b>Método:</b>

${pago.metodo || "No especificado"}



<br><br><br>


Muchas gracias!


</div>


`;



abrirVentanaImpresion(html);



}









// -------------------------------------
// CARNET AFILIADO
// -------------------------------------


function imprimirCarnet(numero){



let afiliado =
BD.afiliados.find(a=>

a.numero===numero

);




if(!afiliado){


alert(
"Afiliado inexistente"
);


return;

}




let color =
afiliado.estado==="ACTIVO"

?

"#F600FF"

:

"#FFB700";







let html = `



<div class="carnet"
style="
width:8cm;
height:6cm;
border:3px solid ${color};
padding:15px;
">


<div>


<h3>

ACDP

</h3>



</div>



<div>


<b>
${afiliado.nombre}
</b>


<br>


<b>
${afiliado.apellido}
</b>



<br><br>



DNI:

${afiliado.dni}



<br>


Afiliado:

${afiliado.numero}



<br><br>



<div class="codigo">

${generarCodigoBarras(
afiliado.numero
)}

</div>



</div>


</div>



`;




abrirVentanaImpresion(html);



}










// -------------------------------------
// GENERADOR SIMPLE DE CODIGO BARRAS
// -------------------------------------


function generarCodigoBarras(numero){



let barras = "";




for(let i=0;i<numero.length;i++){


let n =
Number(numero[i]);



for(let j=0;j<n+1;j++){


barras += "|";

}


barras += " ";


}




return barras;



}










// -------------------------------------
// IMPRESIÓN GENERAL
// -------------------------------------


function abrirVentanaImpresion(contenido){



let ventana =
window.open(
"",
"_blank",
"width=700,height=700"
);




ventana.document.write(`



<html>


<head>


<title>
Impresión ACDP
</title>



<style>


body{

font-family:Arial;
padding:30px;

}



.comprobante{

text-align:center;

border:1px solid #000;

padding:25px;

}



.carnet{

font-family:Arial;

}



.codigo{

font-size:22px;

letter-spacing:2px;

}



</style>


</head>



<body>


${contenido}



<script>


window.onload=function(){

window.print();

}


</script>



</body>


</html>



`);




ventana.document.close();



}










// -------------------------------------
// IMPRIMIR TABLA HISTORIAL
// -------------------------------------


function imprimirTabla(elemento){



let contenido =
document.getElementById(elemento)
.innerHTML;



abrirVentanaImpresion(

`

<h2>

ACDP - Historial

</h2>


${contenido}

`

);



}
