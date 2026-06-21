// ===============================
// IMPRESION ACDP
// Compatible Firebase
// ===============================



// ===============================
// CARNET AFILIADO
// ===============================


function generarPDF(afiliado){



const ventana =
window.open(
"",
"_blank",
"width=600,height=500"
);



if(!ventana)return;




const colorEstado =
(
afiliado.estado==="Adherente" ||
afiliado.estado==="ADHERENTE"
)

?

"#FFB700"

:

"#F600FF";





ventana.document.write(`


<!DOCTYPE html>

<html>


<head>

<meta charset="UTF-8">


<title>Carnet ACDP</title>


<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>


<style>

@page{

size:8cm 6cm;

margin:0;

}


body{

height:100vh;

display:flex;

align-items:center;

justify-content:center;

font-family:Arial;

}



.carnet{

width:8cm;

height:6cm;

border:2px solid ${colorEstado};

display:flex;

padding:6px;

box-sizing:border-box;

}



.logo{

width:55px;

}



.izquierda{

display:flex;

align-items:center;

}



.derecha{

padding-left:8px;

}



.titulo{

font-size:20px;

font-weight:bold;

color:#F600FF;

}



.subtitulo{

font-size:11px;

}



.dato{

font-size:10px;

margin-top:4px;

}


</style>


</head>



<body>



<div class="carnet">


<div class="izquierda">

<img src="logo.jpg" class="logo">

</div>



<div class="derecha">


<div class="titulo">

ACDP

</div>


<div class="subtitulo">

Carnet de afiliado

</div>



<div class="dato">

Nombre:

<b>${afiliado.nombre||""}</b>

</div>



<div class="dato">

Apellido:

<b>${afiliado.apellido||""}</b>

</div>



<div class="dato">

DNI:

<b>${afiliado.dni||""}</b>

</div>



<div class="dato">

Afiliado:

<b>${afiliado.numero||""}</b>

</div>



<svg id="codigo"></svg>



</div>



</div>




<script>


window.onload=function(){


JsBarcode(

"#codigo",

"${afiliado.numero || afiliado.dni || ""}",

{

format:"CODE128",

displayValue:false,

height:25,

width:1.5

}

);



window.print();


window.onafterprint=function(){

window.close();

};


};


</script>



</body>


</html>


`);



ventana.document.close();


}









// ===============================
// HISTORIAL
// ===============================


function imprimirHistorial(){



const ventana =
window.open(
"",
"_blank",
"width=900,height=700"
);



if(!ventana)return;





const tabla =
document.getElementById(
"tablaHistorial"
);



const fecha =
document.getElementById(
"fechaHistorial"
);



const monto =
document.getElementById(
"montoHistorial"
);






ventana.document.write(`


<!DOCTYPE html>


<html>


<head>


<meta charset="UTF-8">


<title>Historial ACDP</title>


<style>


body{

font-family:Arial;

}


table{

width:100%;

border-collapse:collapse;

}


td,th{

border:1px solid #000;

padding:6px;

}


</style>


</head>


<body>



<h2 style="text-align:center">

Historial ACDP

</h2>



<p>

Fecha:

${fecha?.value || fecha?.textContent || ""}

</p>



${tabla?.outerHTML || ""}



<h3>

Total:

${monto?.textContent || "$0"}

</h3>



<script>


window.onload=function(){

window.print();

window.onafterprint=function(){

window.close();

};

};


</script>


</body>


</html>


`);



ventana.document.close();


}







// ===============================
// EXPORTS GLOBALES
// ===============================


window.generarPDF =
generarPDF;


window.imprimirHistorial =
imprimirHistorial;
