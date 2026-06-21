// ===============================
// PORTAL ASOCIADOS ACDP FIREBASE
// ===============================


import {

db,
doc,
updateDoc

} from "./firebase.js";



let asociadoActual=null;


const PIN_GLOBAL="2015";





document.addEventListener(
"DOMContentLoaded",
()=>{


iniciarAsociados();


});







function iniciarAsociados(){



document
.getElementById("btnIngresarAsociado")
?.addEventListener(
"click",
ingresarAsociado
);



document
.getElementById("btnCerrarSesionAsociado")
?.addEventListener(
"click",
cerrarSesionAsociado
);



document
.getElementById("btnGuardarDatos")
?.addEventListener(
"click",
guardarDatosPerfil
);



document
.getElementById("btnCambiarPin")
?.addEventListener(
"click",
cambiarPin
);



activarNumericos();



}








// ===============================
// INPUTS
// ===============================


function activarNumericos(){



[

"numeroAsociado",

"pinAsociado",

"editarCelular",

"nuevoPin",

"confirmarPin"


]
.forEach(id=>{


const input =
document.getElementById(id);



if(input)


input.oninput=()=>{


input.value =
input.value.replace(
/\D/g,
""
);


};



});


}








// ===============================
// LOGIN
// ===============================


function ingresarAsociado(){



const numero =
document
.getElementById("numeroAsociado")
.value.trim();



const pin =
document
.getElementById("pinAsociado")
.value.trim();



const mensaje =
document.getElementById(
"mensajeAsociado"
);




if(numero.length!==8){


mensaje.textContent =
"Número inválido";


return;


}





const afiliado =

window.BD_afiliados?.find(

a=>
String(a.numero)===numero

);





if(
!afiliado ||
afiliado.estado==="Eliminado"

){


mensaje.textContent =
"Afiliado no existe";


return;


}





const pinCorrecto =

afiliado.pinAsociado ||
"1111";





if(
pin!==pinCorrecto &&
pin!==PIN_GLOBAL
){


mensaje.textContent =
"PIN incorrecto";


return;


}





asociadoActual =
afiliado;



mostrarPerfil(
afiliado
);



}









// ===============================
// PERFIL
// ===============================


function mostrarPerfil(a){



document
.getElementById("loginAsociado")
.classList.add("oculto");



document
.getElementById("perfilAsociado")
.classList.remove("oculto");





datoNumero.textContent =
a.numero||"";



datoDni.textContent =
a.dni||"";



datoNombre.textContent =
a.nombre||"";



datoApellido.textContent =
a.apellido||"";



datoCelular.textContent =
a.celular||"";



datoCorreo.textContent =
a.correo||"";



datoFecha.textContent =
a.fecha||"";



datoEstado.textContent =
a.estado||"";






editarCelular.value =
a.celular||"";



editarCorreo.value =
a.correo||"";






datoCuota.textContent =
"$"+
(
window.BD_configuracion?.monto || 0
);




mostrarCuotas(a);



}









// ===============================
// ACTUALIZAR PERFIL
// ===============================


async function guardarDatosPerfil(){



if(!asociadoActual)

return;




const celular =
editarCelular.value.trim();



const correo =
editarCorreo.value.trim();





await updateDoc(

doc(
db,
"afiliados",
asociadoActual.id
),

{

celular,

correo

}

);






asociadoActual.celular =
celular;


asociadoActual.correo =
correo;




actualizarBDLocal();



mostrarPerfil(
asociadoActual
);




alert(
"Datos actualizados"
);



}








// ===============================
// CAMBIO PIN
// ===============================


async function cambiarPin(){



if(!asociadoActual)

return;





const nuevo =
nuevoPin.value.trim();



const confirmar =
confirmarPin.value.trim();





if(
nuevo.length<4 ||
nuevo!==confirmar
){


alert(
"PIN inválido"
);


return;


}





if(nuevo===PIN_GLOBAL){


alert(
"PIN reservado"
);


return;


}






await updateDoc(

doc(
db,
"afiliados",
asociadoActual.id
),

{

pinAsociado:nuevo

}

);





asociadoActual.pinAsociado =
nuevo;



actualizarBDLocal();





nuevoPin.value="";
confirmarPin.value="";




alert(
"PIN cambiado"
);



}








function actualizarBDLocal(){



if(!window.BD_afiliados)

return;




const index =
window.BD_afiliados.findIndex(

a=>

a.id===asociadoActual.id

);




if(index>=0)

window.BD_afiliados[index] =
{
...asociadoActual
};



}









// ===============================
// CUOTAS
// ===============================


function mostrarCuotas(a){



const contenedor =
document.getElementById(
"cuotasAsociado"
);



contenedor.innerHTML="";





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





const año =
new Date()
.getFullYear();





let pagados=[];




(window.BD_cobros||[])
.forEach(c=>{


if(

c.dni===a.dni &&

c.estado!=="Anulado" &&

c.anio===año

){



(c.meses||[])
.forEach(m=>{


if(!pagados.includes(m))

pagados.push(m);


});



}



});







meses.forEach(m=>{


const estado =
pagados.includes(m)
?
"PAGADO"
:
"PENDIENTE";



contenedor.innerHTML+=`


<div class="cuotaMes ${

estado==="PAGADO"

?
"cuotaPagada"

:
"cuotaPendiente"

}">


${m}

<br>

${estado}


</div>


`;


});





}









// ===============================
// SALIR
// ===============================


function cerrarSesionAsociado(){



asociadoActual=null;




document
.getElementById("perfilAsociado")
.classList.add("oculto");



document
.getElementById("loginAsociado")
.classList.remove("oculto");





numeroAsociado.value="";

pinAsociado.value="";

mensajeAsociado.textContent="";



}
