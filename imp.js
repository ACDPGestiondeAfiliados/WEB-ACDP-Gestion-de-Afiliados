/* =====================================
   ACDP - IMPRESIÓN
===================================== */



function imprimirComprobante(pago){



let ventana =
window.open(
"",
"",
"width=500,height=700"
);





ventana.document.write(`


<!DOCTYPE html>

<html>

<head>

<title>
Comprobante ACDP
</title>



<style>


body{

font-family:Arial;
padding:30px;
}


.ticket{

width:300px;

border:1px solid #000;

padding:20px;

text-align:center;

}



</style>



</head>



<body>




<div class="ticket">



<h2>
ACDP - Gremio Docente
</h2>



<h3>
Comprobante de pago
</h3>



<br>



<b>Afiliado:</b>

<br>

${pago.afiliado}



<br><br>


<b>Nro:</b>

${pago.numero}



<br><br>



<b>Meses abonados:</b>


<br>

${pago.meses.join(", ")}



<br><br>



<b>Monto:</b>

<br>

$${formatoPesos(pago.monto)}



<br><br>



<b>Método:</b>

<br>

${pago.metodo || "No especificado"}



<br><br><br>



Muchas gracias!




</div>





<script>

window.onload=function(){

window.print();

window.close();

}

</script>




</body>

</html>


`);





ventana.document.close();



}









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





let color;



if(
afiliado.estado==="ACTIVO"
){


color="#F600FF";


}
else{


color="#FFB700";


}







let ventana =
window.open(
"",
"",
"width=500,height=400"
);






ventana.document.write(`



<!DOCTYPE html>


<html>


<head>


<title>
Carnet ACDP
</title>



<style>



.carnet{


width:8cm;

height:6cm;

border:3px solid ${color};

padding:10px;

font-family:Arial;


}




.codigo{


font-size:20px;

letter-spacing:3px;

}



</style>



</head>



<body>





<div class="carnet">





<h2>

ACDP

</h2>



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



Nº Afiliado:

${afiliado.numero}




<br><br>




<div class="codigo">

${crearCodigoBarras(
afiliado.numero
)}

</div>




</div>







<script>


window.onload=function(){

window.print();

window.close();

}


</script>



</body>


</html>



`);




ventana.document.close();



}









function crearCodigoBarras(numero){



let resultado="";





for(
let i=0;
i<numero.length;
i++
){



let valor =
Number(
numero[i]
);




for(
let j=0;
j<valor+1;
j++
){



resultado += "|";


}



resultado += " ";


}




return resultado;



}









function imprimirTabla(id){



let tabla =
document
.getElementById(id)
.outerHTML;






let ventana =
window.open(
"",
"",
"width=900,height=700"
);





ventana.document.write(`


<html>

<head>

<title>
Impresión ACDP
</title>


<style>


table{

border-collapse:collapse;

width:100%;

}


td,th{

border:1px solid black;

padding:8px;

text-align:center;

}


</style>


</head>


<body>


${tabla}



<script>


window.onload=function(){

window.print();

window.close();

}


</script>


</body>


</html>


`);




ventana.document.close();



}
