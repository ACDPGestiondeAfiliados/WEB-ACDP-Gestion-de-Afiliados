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
margin:40px;
color:#222;

}


.ficha{

border:2px solid #003b73;
border-radius:12px;
padding:30px;
width:500px;
margin:auto;

}



.logo{

width:120px;
display:block;
margin:auto;

}



h1{

text-align:center;
color:#003b73;

}


h2{

text-align:center;

}



.linea{

height:2px;
background:#003b73;
margin:20px 0;

}



.dato{

font-size:18px;
margin:12px 0;

}



strong{

color:#003b73;

}



</style>


</head>


<body>



<div class="ficha">


<img 
src="logo.jpg"
class="logo"
>


<h1>ACDP</h1>


<h2>Ficha de afiliado</h2>



<div class="linea"></div>



<div class="dato">

<strong>Número afiliado:</strong>

${afiliado.numero||""}

</div>



<div class="dato">

<strong>DNI:</strong>

${afiliado.dni||""}

</div>



<div class="dato">

<strong>Nombre:</strong>

${afiliado.nombre||""}

</div>



<div class="dato">

<strong>Apellido:</strong>

${afiliado.apellido||""}

</div>



<div class="dato">

<strong>Celular:</strong>

${afiliado.celular||""}

</div>



<div class="dato">

<strong>Correo:</strong>

${afiliado.correo||""}

</div>



<div class="dato">

<strong>Estado:</strong>

${afiliado.estado||""}

</div>



<div class="dato">

<strong>Fecha alta:</strong>

${afiliado.fecha||""}

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
