// ===============================
// IMPRESIÓN ACDP
// Ficha carnet afiliado
// Generación temporal para imprimir
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

size:8cm 6cm;
margin:0;

}



body{

margin:0;
padding:0;
font-family:Arial,Helvetica,sans-serif;
background:white;

}



.carnet{


width:8cm;
height:6cm;

border:3px solid ${colorEstado};

box-sizing:border-box;

display:flex;

padding:8px;

overflow:hidden;

}



.izquierda{


width:35%;

display:flex;

align-items:center;

justify-content:center;

}



.logo{

width:65px;

height:auto;

}



.derecha{


width:65%;

padding-left:8px;

display:flex;

flex-direction:column;

justify-content:center;

}



.titulo{

font-size:18px;

font-weight:bold;

color:#005baa;

margin-bottom:8px;

}



.dato{

font-size:12px;

margin:3px 0;

}



.valor{

font-weight:bold;

}



.codigo{

margin-top:8px;

}



#barra{

width:140px;

height:35px;

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

N° Afiliado:

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

height:35,

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
