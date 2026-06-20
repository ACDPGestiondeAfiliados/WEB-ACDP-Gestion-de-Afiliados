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
