// ===============================
// COBRAR ACDP FIREBASE
// Gestión de cuotas y pagos
// ===============================


import {

db,
collection,
addDoc,
getDocs,
doc,
updateDoc

} from "./firebase.js";




document.addEventListener("DOMContentLoaded",()=>{

iniciarCobrar();

});




let cobros=[];



// ===============================
// INICIO
// ===============================


async function iniciarCobrar(){


await cargarCobros();


cargarTablaCobrar();



const filtro =
document.getElementById("filtroCobrar");



if(filtro)

filtro.addEventListener(
"input",
()=>buscarParaCobrar(filtro.value)
);


}






async function cargarCobros(){


const snap =
await getDocs(
collection(db,"cobros")
);



cobros=[];



snap.forEach(d=>{


cobros.push({

id:d.id,

...d.data()

});


});



window.BD_cobros=cobros;



}







// ===============================
// TABLA
// ===============================


function cargarTablaCobrar(){

mostrarCobros(
window.BD_afiliados || []
);

}





function buscarParaCobrar(valor){


valor=valor.trim();



if(!valor){

mostrarCobros(
window.BD_afiliados
);

return;

}



mostrarCobros(
buscarAfiliado(valor)
);


}






function buscarAfiliado(valor){


return window.BD_afiliados.filter(a=>

String(a.dni)===valor ||

String(a.numero)===valor

);


}








function mostrarCobros(lista){



const cuerpo =
document
.getElementById("tablaCobrar")
.querySelector("tbody");



cuerpo.innerHTML="";



lista.forEach(a=>{



cuerpo.innerHTML+=`


<tr>


<td>${a.numero||""}</td>

<td>${a.dni||""}</td>

<td>${a.nombre||""}</td>

<td>${a.apellido||""}</td>

<td>${a.estado||"Activo"}</td>


<td>

<button onclick="cobrarAfiliado('${a.dni}')">

Cobrar

</button>


</td>


</tr>


`;



});


}







// ===============================
// COBRAR
// ===============================


function cobrarAfiliado(dni){



const afiliado =
window.BD_afiliados.find(
a=>a.dni===dni
);



if(!afiliado)return;



if(afiliado.estado==="Eliminado"){

alert(
"Afiliado eliminado"
);

return;

}



crearModalCobro(afiliado);


}






function obtenerMesesPagadosActivos(dni){


let meses=[];



const anio =
new Date()
.getFullYear();




cobros.forEach(c=>{


if(

c.dni===dni &&

c.estado!=="Anulado" &&

Array.isArray(c.meses)

){


if(c.anio!==anio)return;



c.meses.forEach(m=>{


const clave =
m+"-"+anio;



if(!meses.includes(clave))

meses.push(clave);


});


}



});



return meses;


}







// ===============================
// MODAL
// ===============================


function crearModalCobro(afiliado){


const meses=[

"Enero",
"Febrero",
"Marzo",
"Abril",
"Mayo",
"Junio",
"Julio",
"Agosto",
"Septiembre",
"Octubre",
"Noviembre",
"Diciembre"

];



const anio =
new Date()
.getFullYear();



const pagados =
obtenerMesesPagadosActivos(
afiliado.dni
);



let html="";



meses.forEach(m=>{


const usado =
pagados.includes(
m+"-"+anio
);



html+=`

<label>


<input
type="checkbox"
class="checkMes"
value="${m}"
${usado?"checked disabled":""}
>


${m}


</label><br>


`;



});




const div =
document.createElement("div");


div.id="modalCobro";

div.className="modal-fondo activo";



div.innerHTML=`


<div class="modal">


<h3>Cobrar afiliado</h3>


<p>
${afiliado.nombre}
${afiliado.apellido}
</p>


${html}


<button onclick="confirmarCobro('${afiliado.dni}')">

Aceptar

</button>


<button onclick="cerrarModalCobro()">

Cancelar

</button>


</div>


`;



document.body.appendChild(div);


}







function cerrarModalCobro(){


document
.getElementById("modalCobro")
?.remove();


}







// ===============================
// CONFIRMAR COBRO FIRESTORE
// ===============================


async function confirmarCobro(dni){



const afiliado =
window.BD_afiliados.find(
a=>a.dni===dni
);



if(!afiliado)return;




let meses=[];



document
.querySelectorAll(".checkMes")
.forEach(c=>{


if(c.checked && !c.disabled)

meses.push(c.value);


});



if(!meses.length){

alert(
"Seleccione meses"
);

return;

}




const monto =
window.BD_configuracion?.monto || 0;



const total =
monto * meses.length;



const fecha =
new Date();



const cobro={


usuario:
window.usuarioActivo || "Sistema",


afiliado:
afiliado.nombre+
" "+
afiliado.apellido,


dni:afiliado.dni,


numero:afiliado.numero,


fecha:
fecha.toLocaleDateString(),


hora:
fecha.toLocaleTimeString(),


anio:
fecha.getFullYear(),


accion:"Cobro",


meses,


total


};





const ref =
await addDoc(

collection(db,"cobros"),

cobro

);





cobro.id=ref.id;



cobros.push(cobro);

window.BD_cobros=cobros;






if(!afiliado.mesesPagados)

afiliado.mesesPagados=[];



meses.forEach(m=>{


const clave =
m+"-"+fecha.getFullYear();



if(!afiliado.mesesPagados.includes(clave))

afiliado.mesesPagados.push(clave);


});






await updateDoc(

doc(db,"afiliados",afiliado.id),

{

mesesPagados:
afiliado.mesesPagados

}

);





if(typeof registrarHistorial==="function")

registrarHistorial(

"Cobro",

afiliado,

"Meses: "+meses.join(", ")+" Total: $"+total

);






cerrarModalCobro();




generarComprobanteCobro(
afiliado,
meses,
total
);



}







function generarComprobanteCobro(
afiliado,
meses,
total
){



const ventana =
window.open(
"",
"_blank",
"width=400,height=600"
);



if(!ventana)return;



ventana.document.write(`


<html>

<body style="font-family:Arial;text-align:center">


<h2>ACDP</h2>


<p>

${afiliado.nombre}
${afiliado.apellido}

</p>


<p>

DNI:
${afiliado.dni}

</p>


<p>

${meses.join("<br>")}

</p>


<h3>

$${total}

</h3>


<script>

window.print();

</script>


</body>

</html>


`);



ventana.document.close();


}
