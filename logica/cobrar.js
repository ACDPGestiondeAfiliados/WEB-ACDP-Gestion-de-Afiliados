// ===============================
// ACDP - COBRAR CONTROLLER
// Firebase + Cuota + Historial prep
// ===============================

import {
    db,
    collection,
    getDocs,
    addDoc,
    setDoc,
    doc
} from "../firebase.js";


// ===============================
// CUOTA GLOBAL
// ===============================

window.BD_configuracion = window.BD_configuracion || {
    monto: 8000
};


// ===============================
// ESTADO
// ===============================

let CACHE_AFILIADOS = [];
let CACHE_COBROS = [];


// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarCobrar();
    bindCuotaButton();

});


// ===============================
// INIT COBRAR
// ===============================

async function iniciarCobrar(){

    await cargarConfiguracion();
    await cargarCobros();
    await cargarAfiliados();


    const filtro =
    document.getElementById("filtroCobrar");


    if(filtro){

        filtro.addEventListener("input",()=>{

            buscarParaCobrar(filtro.value);

        });

    }

}


// ===============================
// CONFIG FIREBASE
// ===============================

async function cargarConfiguracion(){

    const snap =
    await getDocs(collection(db,"configuracion"));


    snap.forEach(d=>{

        window.BD_configuracion =
        d.data();

    });


    if(!window.BD_configuracion.monto){

        window.BD_configuracion.monto=8000;

    }

}


// ===============================
// COBROS CACHE
// ===============================

async function cargarCobros(){

    CACHE_COBROS=[];


    const snap =
    await getDocs(collection(db,"cobros"));


    snap.forEach(d=>{

        CACHE_COBROS.push({
            id:d.id,
            ...d.data()
        });

    });

}


// ===============================
// BOTON CUOTA
// ===============================

function bindCuotaButton(){

    const btn =
    document.getElementById("btnCambiarCuota");


    if(!btn)return;


    btn.onclick=abrirModalCuota;

}



// ===============================
// MODAL CUOTA
// ===============================

function abrirModalCuota(){

abrirModal(`

<h3>Cambiar cuota mensual</h3>


<p>
Valor actual:
<b>
$${window.BD_configuracion.monto}
</b>
</p>


<input
id="nuevaCuota"
type="number"
min="0"
max="999999"
placeholder="Nuevo valor"
>


<br><br>


<input
id="pinAdminCuota"
type="password"
maxlength="4"
placeholder="PIN administrador"
>


<p
id="errorPin"
style="color:red;display:none;"
>
PIN incorrecto ¡Cuidado!
</p>


<br>


<button id="guardarCuota">
Guardar
</button>

`);

setTimeout(()=>{

document
.getElementById("guardarCuota")
.onclick=validarCuota;

},100);

}



// ===============================
// VALIDAR CUOTA
// ===============================

async function validarCuota(){

const pin =
document.getElementById("pinAdminCuota").value;


const valor =
document.getElementById("nuevaCuota").value;


const error =
document.getElementById("errorPin");



let valido=false;



if(pin==="2015"){

valido=true;

}



const usuarios =
window.BD_usuarios || [];



if(
usuarios.some(u=>
u.pin===pin &&
u.rol==="ADMINISTRADOR"
)
){

valido=true;

}



if(!valido){

error.style.display="block";
return;

}



const monto=parseInt(valor);



if(
isNaN(monto) ||
monto<0 ||
monto>999999
)return;



window.BD_configuracion.monto=monto;



await setDoc(
doc(db,"configuracion","general"),
{
monto
}
);



cerrarModal();


alert("Cuota actualizada");

}



// ===============================
// MODAL BASE
// ===============================

function abrirModal(html){

document
.getElementById("modalContenido")
.innerHTML=html;


document
.getElementById("modalFondo")
.classList.add("activo");


document
.getElementById("cerrarModal")
.onclick=cerrarModal;

}



function cerrarModal(){

document
.getElementById("modalContenido")
.innerHTML="";


document
.getElementById("modalFondo")
.classList.remove("activo");

}



// ===============================
// AFILIADOS
// ===============================

async function cargarAfiliados(){

const snap =
await getDocs(collection(db,"afiliados"));


CACHE_AFILIADOS=[];


snap.forEach(d=>{

CACHE_AFILIADOS.push({
id:d.id,
...d.data()
});

});


mostrarCobros(CACHE_AFILIADOS);

}



// ===============================
// BUSCAR
// ===============================

function buscarParaCobrar(valor){

valor=valor.trim();


if(!valor){

mostrarCobros(CACHE_AFILIADOS);
return;

}


mostrarCobros(

CACHE_AFILIADOS.filter(a=>

a.dni?.includes(valor) ||
a.numeroAfiliado?.includes(valor)

)

);

}



// ===============================
// TABLA
// ===============================

function mostrarCobros(lista){

const cuerpo =
document.querySelector("#tablaCobrar tbody");


if(!cuerpo)return;


cuerpo.innerHTML="";



lista.forEach(a=>{


cuerpo.innerHTML+=`

<tr>

<td>${a.numeroAfiliado}</td>

<td>${a.dni}</td>

<td>${a.nombre}</td>

<td>${a.apellido}</td>

<td>${a.estado}</td>

<td>

<button onclick="COBRAR.cobrarAfiliado('${a.id}')">

COBRAR

</button>

</td>

</tr>

`;

});

}



// ===============================
// COBRAR
// ===============================

function cobrarAfiliado(id){

const afiliado =
CACHE_AFILIADOS.find(a=>a.id===id);


if(!afiliado)return;


crearModalCobro(afiliado);

}

// ===============================
// MESES PAGADOS
// ===============================

function mesesPagados(dni){

let usados=[];


const anioActual =
new Date().getFullYear();



CACHE_COBROS.forEach(c=>{


if(
c.dni===dni &&
c.anio===anioActual
){


(c.meses||[])
.forEach(m=>{


if(!usados.includes(m)){

usados.push(m);

}


});


}


});


return usados;

}



// ===============================
// MODAL COBRO
// ===============================

function crearModalCobro(afiliado){


const meses=[
"Enero","Febrero","Marzo","Abril",
"Mayo","Junio","Julio","Agosto",
"Septiembre","Octubre","Noviembre","Diciembre"
];


const pagados =
mesesPagados(afiliado.dni);



let html="";


meses.forEach(m=>{


const bloqueado =
pagados.includes(m);


html+=`

<label>

<input

type="checkbox"

class="checkMes"

value="${m}"

${bloqueado?"disabled":""}

>

${m}

${bloqueado?" (Pagado)":""}

</label>

<br>

`;

});



abrirModal(`

<div class="modalCobro">


<h3>Cobrar afiliado</h3>


<h4>
${afiliado.nombre}
${afiliado.apellido}
</h4>


<p>
DNI: ${afiliado.dni}
</p>


<div class="listaMeses">

${html}

</div>


<br>


<select id="medioPago">


<option value="EFECTIVO">
EFECTIVO
</option>


<option value="TRANSFERENCIA">
TRANSFERENCIA
</option>


<option value="OTRO">
OTRO
</option>


</select>



<br><br>



<button onclick="COBRAR.confirmarCobro('${afiliado.id}')">

Aceptar

</button>



<button onclick="COBRAR.cerrarModal()">

Cancelar

</button>


</div>

`);

}



// ===============================
// CONFIRMAR
// ===============================

async function confirmarCobro(id){

const afiliado =
CACHE_AFILIADOS.find(a=>a.id===id);


if(!afiliado)return;



let meses=[];



document
.querySelectorAll(".checkMes")
.forEach(c=>{


if(c.checked){

meses.push(c.value);

}


});



if(!meses.length){

alert("Seleccione meses");

return;

}



const medio =
document.getElementById("medioPago").value;



const total =
meses.length *
window.BD_configuracion.monto;



const fecha=new Date();



const codigo =
generarCodigoComprobante();



const cobro={


usuario:
window.ACDP?.usuario || "Sistema",


dni:
afiliado.dni,


numeroAfiliado:
afiliado.numeroAfiliado,


afiliado:
afiliado.nombre+
" "+
afiliado.apellido,


anio:
fecha.getFullYear(),


meses,


medioPago:
medio,


total,


codigoComprobante:
codigo,


fecha:
fecha.toLocaleDateString(),


hora:
fecha.toLocaleTimeString().slice(0,5),


detalleHistorial:

"Cobro | "+
meses.join(", ")+
" | $"+
total+
" | "+
medio+
" | Codigo: "+
codigo


};



await addDoc(
collection(db,"cobros"),
cobro
);

if(window.registrarHistorial){

await window.registrarHistorial({

usuario:
window.ACDP?.usuario || "Sistema",

afiliado:
afiliado.nombre+" "+afiliado.apellido,

dni:
afiliado.dni,

numeroAfiliado:
afiliado.numeroAfiliado,

detalleHistorial:
"Pago realizado | Código: "+
codigo+
" | "+
meses.join(", ")+
" | $"+
total+
" | "+
medio

});

}

CACHE_COBROS.push(cobro);



cerrarModal();



generarTicket(

afiliado,

meses,

total,

medio,

codigo

);



}



// ===============================
// CODIGO UNICO
// ===============================

function generarCodigoComprobante(){


const letras =
"ABCDEFGHIJKLMNOPQRSTUVWXYZ";


let codigo="";



for(let i=0;i<9;i++){


codigo += letras.charAt(

Math.floor(
Math.random()*letras.length
)

);


}


return codigo;

}



// ===============================
// TICKET
// ===============================

function generarTicket(
afiliado,
meses,
total,
medio,
codigo
){


const fecha =
new Date();



const fechaTexto =
fecha.toLocaleDateString();



const horaTexto =
fecha.toLocaleTimeString().slice(0,5);




const win =
window.open(
"",
"_blank",
"width=300,height=420"
);



win.document.write(`


<html>


<body style="
font-family:Arial;
text-align:center;
padding:5px;
font-size:9px;
">


<div style="
width:5cm;
min-height:4cm;
border:2px solid #A602AB;
padding:6px;
border-radius:6px;
box-sizing:border-box;
">


<img 
src="./iconos/logo.jpg"
style="width:35px;"
>



<h3 style="
margin:2px;
font-size:11px;
">

ACDP

</h3>



<b>
COMPROBANTE DE PAGO
</b>



<p style="margin:3px;">

${afiliado.nombre}

${afiliado.apellido}

</p>



<p style="margin:3px;">

DNI: ${afiliado.dni}

</p>



<hr>



<p style="margin:3px;">

${meses.join(" - ")}

</p>




<b>

TOTAL $${total}

</b>




<p style="margin:3px;">

${medio}

</p>



<p style="margin:3px;">

${fechaTexto}

${horaTexto}

</p>



<hr>



<b>

Código:

${codigo}

</b>



</div>



<p style="
font-size:8px;
">

Comprobante válido ACDP

</p>



<script>

window.print();

</script>



</body>


</html>


`);



win.document.close();


}



// ===============================
// EXPORT
// ===============================

window.COBRAR={


cobrarAfiliado,

confirmarCobro,

cerrarModal


};
