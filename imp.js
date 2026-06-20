// ===============================
// IMPRESIÓN ACDP
// Ficha individual de afiliado
// Generación temporal para imprimir
// ===============================


function generarPDF(afiliado){


    const ventana=
    window.open(
        "",
        "_blank",
        "width=800,height=900"
    );


    if(!ventana){

        return;

    }



    ventana.document.write(`


<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">


<title>Ficha afiliado ACDP</title>


<style>


body{

font-family:Arial,Helvetica,sans-serif;
margin:0;
padding:30px;
background:white;
color:#222;

}



.ficha{

width:600px;
margin:auto;
border:3px solid #005baa;
border-radius:10px;
padding:25px;

}



.encabezado{

display:flex;
align-items:center;
justify-content:flex-start;
gap:25px;
border-bottom:3px solid #005baa;
padding-bottom:15px;

}



.logo{

width:90px;
height:auto;

}



.titulo{

text-align:left;

}



.titulo h1{

margin:0;
color:#005baa;
font-size:34px;

}



.titulo h2{

margin:5px 0 0;
font-size:20px;

}



.contenido{

margin-top:25px;

}



.dato{

font-size:18px;
margin:12px 0;

}



.dato span{

font-weight:bold;
color:#005baa;

}



.codigo{

margin-top:30px;
text-align:center;

}



.barras{

font-family:"Libre Barcode 39",
monospace;
font-size:55px;
letter-spacing:3px;

}



.pie{

margin-top:25px;
text-align:center;
font-size:13px;
color:#555;

}



</style>


</head>


<body>



<div class="ficha">



<div class="encabezado">


<img 
src="logo.jpg"
class="logo"
>


<div class="titulo">

<h1>ACDP</h1>

<h2>Ficha de afiliado</h2>

</div>


</div>





<div class="contenido">



<div class="dato">

<span>Número afiliado:</span>

${afiliado.numero||""}

</div>



<div class="dato">

<span>DNI:</span>

${afiliado.dni||""}

</div>



<div class="dato">

<span>Nombre:</span>

${afiliado.nombre||""}

</div>



<div class="dato">

<span>Apellido:</span>

${afiliado.apellido||""}

</div>



<div class="dato">

<span>Celular:</span>

${afiliado.celular||""}

</div>



<div class="dato">

<span>Correo:</span>

${afiliado.correo||""}

</div>



<div class="dato">

<span>Estado:</span>

${afiliado.estado||""}

</div>



<div class="dato">

<span>Fecha de alta:</span>

${afiliado.fecha||""}

</div>



</div>




<div class="codigo">


<div class="barras">

*${afiliado.numero||afiliado.dni}*

</div>


</div>



<div class="pie">

Documento generado automáticamente - ACDP

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
