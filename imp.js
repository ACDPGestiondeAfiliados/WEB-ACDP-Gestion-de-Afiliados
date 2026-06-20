// ===============================
// IMPRESIÓN ACDP
// Ficha individual de afiliado
// Generación temporal para imprimir
// ===============================


function generarPDF(afiliado){

    abrirVistaImpresion(afiliado);

}



// ===============================
// Vista previa impresión
// ===============================

function abrirVistaImpresion(afiliado){


const fondo=document.getElementById("modalFondo");
const contenido=document.getElementById("modalContenido");


if(!fondo || !contenido){

    return;

}



contenido.innerHTML=`

<div class="fichaImpresion">


<img 
src="logo.jpg"
class="logoFicha"
>



<h2>ACDP</h2>

<h3>Ficha de afiliado</h3>



<hr>



<div class="datosFicha">


<p>
<strong>Número afiliado:</strong>
${afiliado.numero}
</p>


<p>
<strong>DNI:</strong>
${afiliado.dni}
</p>


<p>
<strong>Nombre:</strong>
${afiliado.nombre}
</p>


<p>
<strong>Apellido:</strong>
${afiliado.apellido}
</p>


<p>
<strong>Celular:</strong>
${afiliado.celular}
</p>


<p>
<strong>Correo:</strong>
${afiliado.correo}
</p>


<p>
<strong>Estado:</strong>
${afiliado.estado}
</p>


<p>
<strong>Fecha de alta:</strong>
${afiliado.fecha}
</p>


</div>



<br>



<button onclick="window.print()">

Imprimir ficha

</button>



</div>

`;



fondo.classList.add("activo");


}
