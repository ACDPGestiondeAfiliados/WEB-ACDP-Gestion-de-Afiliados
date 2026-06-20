// ===============================
// IMPRESIÓN ACDP
// Carnet PNG temporal + Historial A4
// ===============================



// ===============================
// IMPRIMIR CARNET AFILIADO
// ===============================

function generarPDF(afiliado){


const ventana =
window.open(
"",
"_blank",
"width=600,height=500"
);



if(!ventana){

    return;

}



ventana.document.write(`


<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">


<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>


<style>


@page{

size:8cm 6cm;
margin:0;

}


body{

margin:0;
padding:0;

display:flex;
justify-content:center;
align-items:center;

width:8cm;
height:6cm;

}


#carnet{

width:8cm;
height:6cm;

border:2px solid #005baa;

font-family:Arial,Helvetica,sans-serif;

display:flex;

padding:6px;

box-sizing:border-box;

}


.izquierda{

width:30%;

display:flex;
align-items:center;
justify-content:center;

}


.logo{

width:55px;

}



.derecha{

width:70%;
padding-left:6px;

}



.titulo{

font-size:20px;
font-weight:bold;
color:#005baa;

}



.subtitulo{

font-size:10px;
font-weight:bold;
margin-bottom:8px;

}



.dato{

font-size:10px;
margin:3px 0;

}



.valor{

font-weight:bold;

}



#barra{

width:120px;
height:25px;

}


</style>

</head>


<body>


<div id="carnet">


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
<span class="valor">
${afiliado.nombre||""}
</span>

</div>



<div class="dato">

Apellido:
<span class="valor">
${afiliado.apellido||""}
</span>

</div>



<div class="dato">

DNI:
<span class="valor">
${afiliado.dni||""}
</span>

</div>



<div class="dato">

Afiliado N°:
<span class="valor">
${afiliado.numero||""}
</span>

</div>



<svg id="barra"></svg>


</div>


</div>



<script>


window.onload=function(){


JsBarcode(

"#barra",

"${afiliado.numero||afiliado.dni}",

{

format:"CODE128",

displayValue:false,

height:25,

width:1.5,

margin:0

}

);



html2canvas(

document.getElementById("carnet"),

{

scale:4

}

).then(canvas=>{


document.body.innerHTML=

`

<img src="${canvas.toDataURL("image/png")}"

style="width:8cm;height:6cm;">

`;



setTimeout(()=>{


window.print();



window.onafterprint=function(){

window.close();

};


},300);



});


};


</script>


</body>

</html>


`);



ventana.document.close();


}





// ===============================
// IMPRIMIR HISTORIAL ACTUAL
// ===============================


function imprimirHistorial(){


const ventana =
window.open(
"",
"_blank",
"width=900,height=700"
);



if(!ventana){

    return;

}



const tabla =
document.getElementById("tablaHistorial");


const fecha =
document.getElementById("fechaHistorial");


const monto =
document.getElementById("montoHistorial");



ventana.document.write(`


<!DOCTYPE html>

<html>


<head>


<meta charset="UTF-8">


<title>Historial ACDP</title>


<style>


@page{

size:A4;

margin:10mm;

}



body{

font-family:Arial,Helvetica,sans-serif;

}



.contenedor{

width:100%;

text-align:center;

}



table{

width:100%;

border-collapse:collapse;

}



th,td{

border:1px solid #000;

padding:6px;

font-size:12px;

}



</style>


</head>


<body>


<div class="contenedor">


<h2>Historial ACDP</h2>


<p>

Fecha:
${fecha ? fecha.value || fecha.textContent : ""}

</p>



${tabla ? tabla.outerHTML : ""}



<h3>

Total:
${monto ? monto.textContent : "$0"}

</h3>


</div>



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
// CONECTORES GLOBALES
// ===============================

window.generarPDF = generarPDF;

window.imprimirHistorial = imprimirHistorial;
