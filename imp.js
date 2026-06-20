// ===============================
// IMPRESIÓN CARNET ACDP
// Generación temporal PNG
// Tamaño real 8x6cm
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
<span class="valor">${afiliado.nombre||""}</span>
</div>


<div class="dato">
Apellido:
<span class="valor">${afiliado.apellido||""}</span>
</div>


<div class="dato">
DNI:
<span class="valor">${afiliado.dni||""}</span>
</div>


<div class="dato">
Afiliado N°:
<span class="valor">${afiliado.numero||""}</span>
</div>


<svg id="barra"></svg>


</div>


</div>


<script>


function iniciar(){


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


document.body.innerHTML=`


<img src="${canvas.toDataURL("image/png")}"

style="

width:8cm;

height:6cm;

object-fit:contain;

">


`;



setTimeout(()=>{


window.print();


window.onafterprint=function(){

window.close();

};


},300);



});


}



window.onload=()=>{


setTimeout(iniciar,500);


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

// ===============================
// IMPRESIÓN ACDP
// Generación temporal para imprimir
// Carnet + Historial
// ===============================


// ===============================
// IMPRIMIR CARNET AFILIADO
// ===============================

function generarPDF(afiliado){


const ventana =
window.open(
"",
"_blank",
"width=500,height=400"
);



if(!ventana){

    return;

}



const colorEstado =
afiliado.estado==="ADHERENTE" ||
afiliado.estado==="Adherente"
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

size:8.5cm 5.5cm;
margin:0;

}



*{

box-sizing:border-box;

}



body{

margin:0;
padding:0;
width:8.5cm;
height:5.5cm;
font-family:Arial,Helvetica,sans-serif;
background:white;

}



.carnet{


width:8.5cm;
height:5.5cm;


border:2px solid ${colorEstado};


display:flex;

padding:6px;


overflow:hidden;


}



.izquierda{


width:28%;


display:flex;

align-items:center;

justify-content:center;


}



.logo{


width:50px;

height:auto;


}




.derecha{


width:72%;


padding-left:6px;


display:flex;

flex-direction:column;


justify-content:center;


}




.titulo{


font-size:18px;

font-weight:bold;

color:#005baa;

margin-bottom:5px;


}




.subtitulo{


font-size:10px;

font-weight:bold;

margin-bottom:6px;


}




.dato{


font-size:10px;

margin:2px 0;


}



.valor{


font-weight:bold;


}




.codigo{


margin-top:5px;


}




#barra{


width:120px;

height:28px;


}



.pie{


font-size:7px;

margin-top:3px;

color:#555;


}



</style>


</head>


<body>



<div class="carnet">



<div class="izquierda">


<img 
src="logo.jpg"
class="logo"
>


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




<div class="codigo">


<svg id="barra"></svg>


</div>

</div>

</div>


<script>


JsBarcode(

"#barra",

"${afiliado.numero||afiliado.dni}",

{

format:"CODE128",

displayValue:false,

height:28,

width:1.5,

margin:0

}

);



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

display:flex;

justify-content:center;

}



.contenedor{

width:100%;

text-align:center;

}



h2{

margin-bottom:10px;

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



th{

font-weight:bold;

}



.fecha{

margin-bottom:10px;

}



.total{

margin-top:10px;

font-weight:bold;

}



</style>


</head>


<body>


<div class="contenedor">


<h2>Historial ACDP</h2>


<div class="fecha">

Fecha:
${fecha ? fecha.value || fecha.textContent : ""}

</div>



${tabla ? tabla.outerHTML : ""}



<div class="total">

Total:
${monto ? monto.textContent : "$0"}

</div>


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
// COMPATIBILIDAD GLOBAL ACDP
// ===============================

window.generarPDF = generarPDF;
window.imprimirHistorial = imprimirHistorial;
