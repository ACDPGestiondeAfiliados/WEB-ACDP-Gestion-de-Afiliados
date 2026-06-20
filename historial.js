// ===============================
// HISTORIAL ACDP
// Registro de pagos y consultas
// ===============================


let fechaActual=new Date();
let historialVista=[];



document.addEventListener("DOMContentLoaded",()=>{

    iniciarHistorial();

});




// ===============================
// UTIL
// ===============================

function normalizarTexto(valor){

    if(valor===null || valor===undefined){
        return "";
    }


    if(typeof valor==="object"){

        return valor.usuario ||
        valor.nombre ||
        valor.afiliado ||
        "Desconocido";

    }


    return String(valor);

}




// ===============================
// Inicialización
// ===============================

function iniciarHistorial(){

    cargarHistorial();

    eventosHistorial();

}






// ===============================
// Eventos
// ===============================

function eventosHistorial(){


const filtro=document.getElementById("filtroHistorial");

const anterior=document.getElementById("historialAnterior");

const siguiente=document.getElementById("historialSiguiente");

const selector=document.getElementById("fechaHistorial");




if(filtro){

filtro.addEventListener("input",()=>{

filtrarHistorial(filtro.value);

});

}





if(anterior){

anterior.addEventListener("click",()=>{

cambiarFecha(-1);

});

}





if(siguiente){

siguiente.addEventListener("click",()=>{

cambiarFecha(1);

});

}





if(selector){


selector.addEventListener("change",()=>{


if(!selector.value)return;



const partes=
selector.value.split("-");



fechaActual=
new Date(
partes[0],
partes[1]-1,
partes[2]
);



cargarHistorialFecha();

actualizarFecha();



});




selector.addEventListener("keydown",(e)=>{


if(e.key==="Enter"){


const partes=
selector.value.split("-");


fechaActual=
new Date(
partes[0],
partes[1]-1,
partes[2]
);



cargarHistorialFecha();

actualizarFecha();


}



});

}


}






// ===============================
// Carga
// ===============================


function cargarHistorial(){

cargarHistorialFecha();

}





function cargarHistorialFecha(){


const fechaBuscada =
fechaActual.toLocaleDateString();



historialVista =
BD_historial.filter(h=>{


if(!h.fecha)return false;



const partes=
h.fecha.split("/");



if(partes.length!==3)return false;



const fechaRegistro =
new Date(
partes[2],
partes[1]-1,
partes[0]
);



return fechaRegistro.toLocaleDateString()
===fechaBuscada;



}).reverse();



mostrarHistorial();


}






// ===============================
// Buscar
// ===============================


function filtrarHistorial(valor){


valor=valor.trim();



if(!valor){

cargarHistorialFecha();

return;

}



historialVista =
BD_historial.filter(h=>

h.dni===valor ||
h.numero===valor

).reverse();



mostrarHistorial;



}






// ===============================
// Tabla
// ===============================


function mostrarHistorial(){



const cuerpo=
document.getElementById("tablaHistorial")
.querySelector("tbody");



cuerpo.innerHTML="";



let montoTotal=0;



if(historialVista.length===0){


cuerpo.innerHTML=`

<tr>

<td colspan="8">
SIN REGISTRO
</td>

</tr>

`;

}



historialVista.forEach(h=>{


if(h.estado!=="Anulado"){

montoTotal+=obtenerMonto(h.detalle);

}



const clase =
h.estado==="Anulado"
?
"historialAnulado"
:
"";





cuerpo.innerHTML+=`


<tr class="${clase}">


<td>
${normalizarTexto(h.usuario)}
</td>



<td>
${normalizarTexto(h.afiliado)}
</td>



<td>
${h.dni||""}
</td>



<td>
${h.numero||""}
</td>



<td>
${h.fecha||""}
</td>



<td>
${h.hora||""}
</td>



<td>


<img

src="print.png"  width="25%" height="25%"

class="iconoHistorial"

onclick="imprimirRegistro('${h.dni}','${h.fecha}','${h.hora}')"


>



<img

src="delete.png" width="25%" height="25%"

class="iconoHistorial"

onclick="solicitarAnulacion('${h.dni}','${h.fecha}','${h.hora}')"


>



</td>




<td>
${h.detalle||""}
</td>



</tr>



`;



});




document.getElementById("montoHistorial")
.textContent=
"$"+montoTotal.toFixed(2);



actualizarFecha();



}








// ===============================
// Fecha
// ===============================


function cambiarFecha(valor){


fechaActual.setDate(
fechaActual.getDate()+valor
);



actualizarFecha();

cargarHistorialFecha();


}






function actualizarFecha(){


const fecha=
document.getElementById("fechaHistorial");



if(fecha){


const año =
fechaActual.getFullYear();



const mes =
String(fechaActual.getMonth()+1)
.padStart(2,"0");



const dia =
String(fechaActual.getDate())
.padStart(2,"0");



if(fecha.tagName==="INPUT"){


fecha.value =
año+"-"+mes+"-"+dia;


}else{


fecha.textContent =
fechaActual.toLocaleDateString();


}


}



const siguiente =
document.getElementById("historialSiguiente");



if(siguiente){


const hoy=new Date();



siguiente.disabled =
fechaActual.toDateString()
===
hoy.toDateString();



}



}






// ===============================
// Monto
// ===============================


function obtenerMonto(texto){

if(!texto)return 0;



const numero =
texto.replace(/\D/g,"");



return Number(numero)||0;


}







// ===============================
// Registrar
// ===============================


function registrarHistorial(
accion,
afiliado,
detalle
){


if(!Array.isArray(BD_historial))return;



const ahora=new Date();



const usuarioReal =

(typeof window.usuarioActivo !== "undefined"
&& window.usuarioActivo
&& window.usuarioActivo!=="Admin")

?

window.usuarioActivo

:

(typeof usuarioActivo !== "undefined"
&& usuarioActivo)

?

usuarioActivo

:

"Sistema";




BD_historial.push({


usuario:usuarioReal,


afiliado:
afiliado?.nombre+" "+
afiliado?.apellido || "",



dni:
afiliado?.dni || "",



numero:
afiliado?.numero || "",



fecha:
ahora.toLocaleDateString(),



hora:
ahora.toLocaleTimeString(),



accion:accion,



detalle:
detalle || ""



});



guardarBD();


}









// ===============================
// Imprimir registro
// ===============================


function imprimirRegistro(
dni,
fecha,
hora
){


const registro =
BD_historial.find(h=>

h.dni===dni &&
h.fecha===fecha &&
h.hora===hora

);



if(!registro)return;



if(typeof generarComprobanteCobro==="function"){


let afiliado={

nombre:
registro.afiliado.split(" ")[0],

apellido:
registro.afiliado.split(" ")[1]||"",

dni:
registro.dni

};



let meses =
registro.meses ||
[];



let total =
registro.total ||
obtenerMonto(registro.detalle);



generarComprobanteCobro(
afiliado,
meses,
total
);


}


}








// ===============================
// Anulación
// ===============================


function solicitarAnulacion(
dni,
fecha,
hora
){


if(typeof pedirPinAdmin==="function"){


    pedirPinAdmin(()=>{


        anularRegistro(
            dni,
            fecha,
            hora
        );


    });


}else{


    alert(
    "No se pudo abrir el acceso administrador"
    );


}


}





function anularRegistro(
dni,
fecha,
hora
){



const registro =
BD_historial.find(h=>

h.dni===dni &&
h.fecha===fecha &&
h.hora===hora

);



if(!registro)return;



if(registro.estado==="Anulado"){

return;

}




registro.estado="Anulado";


registro.detalle +=
" | ANULADO";






const afiliado =
BD_afiliados.find(a=>

a.dni===dni

);



if(
afiliado &&
registro.meses
){


if(!afiliado.mesesPagados){

afiliado.mesesPagados=[];

}



afiliado.mesesPagados =
afiliado.mesesPagados.filter(m=>

!registro.meses.includes(m)

);


}







const cobro =
BD_cobros.find(c=>

c.dni===dni &&
c.fecha===fecha &&
c.hora===hora

);



if(cobro){

cobro.estado="Anulado";

}




guardarBD();



mostrarHistorial();



alert(
"Registro anulado correctamente"
);



}
// ===============================
// impresión general
// ===============================


function imprimirHistorial(){


escribirConsola(
"Solicitud impresión historial"
);



if(typeof generarPDF==="function"){


generarPDF(historialVista);


}


}
