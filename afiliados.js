// =====================================
// ACDP - AFILIADOS
// =====================================


let paginaAfiliados = 0;

const limiteAfiliados = 20;



function cargarAfiliados(){


    let contenedor =
    document.getElementById(
        "contenidoAfiliados"
    );


    let inicio =
    paginaAfiliados * limiteAfiliados;


    let lista =
    [...BD.afiliados]
    .sort((a,b)=>
        Number(b.numero)-
        Number(a.numero)
    )
    .slice(
        inicio,
        inicio+limiteAfiliados
    );



    let html = `


    <p>
    Bienvenido ${usuarioActivo || ""}
    desde AFILIADOS, podés ver todos los afiliados registrados en el gremio
    </p>


    <div class="barra">

    <input
    id="buscarAfiliado"
    maxlength="8"
    placeholder="DNI o Nro Afiliado">


    <button onclick="modalNuevoAfiliado()">
    Agregar Afiliado Nuevo
    </button>


    </div>



    <table>

    <thead>

    <tr>

    <th>Nro Afiliado</th>
    <th>DNI</th>
    <th>Nombre(s)</th>
    <th>Apellido(s)</th>
    <th>Celular</th>
    <th>Correo</th>
    <th>Estado</th>
    <th>Fecha</th>
    <th>Acción</th>

    </tr>

    </thead>


    <tbody>

    `;




    lista.forEach(a=>{


        html += `

        <tr>

        <td>${a.numero}</td>
        <td>${a.dni}</td>
        <td>${a.nombre}</td>
        <td>${a.apellido}</td>
        <td>${a.celular}</td>
        <td>${a.correo}</td>
        <td>${a.estado}</td>
        <td>${a.fecha}</td>


        <td>

        <button onclick="editarAfiliado('${a.numero}')">
        Editar
        </button>


        <button onclick="eliminarAfiliado('${a.numero}')">
        Eliminar
        </button>


        <button onclick="imprimirCarnet('${a.numero}')">
        Imprimir
        </button>


        </td>


        </tr>

        `;


    });



    html += `

    </tbody>

    </table>


    <div class="paginacion">

    <button onclick="paginaAnteriorAfiliados()">
    <
    </button>


    <button onclick="paginaSiguienteAfiliados()">
    >
    </button>


    </div>

    `;



    contenedor.innerHTML=html;



}





function crearAfiliado(){


let dni =
document.getElementById("dniNuevo").value;


let nombre =
document.getElementById("nombreNuevo").value;


let apellido =
document.getElementById("apellidoNuevo").value;


let celular =
document.getElementById("celularNuevo").value;


let correo =
document.getElementById("correoNuevo").value;


let estado =
document.getElementById("estadoNuevo").value;



if(
!dni ||
!nombre ||
!apellido ||
!celular ||
!correo
){

alert(
"Por favor complete todos los datos"
);

return;

}



let afiliado={


numero:
generarNumeroAfiliado(),

dni,
nombre,
apellido,
celular,
correo,
estado,

fecha:
fechaActual()+" "+horaActual()


};



BD.afiliados.push(afiliado);


registrarHistorial({

usuario:usuarioActivo,

afiliado:
nombre+" "+apellido,

dni,

numero:
afiliado.numero,

accion:
"Alta afiliado",

detalles:
"Nuevo afiliado creado"


});



guardarBD();

cerrarModal();

cargarAfiliados();


}







function modalNuevoAfiliado(){



abrirModal(`


<h2>Agregar Afiliado</h2>


<input id="dniNuevo" placeholder="DNI">


<br><br>


<input id="nombreNuevo" placeholder="Nombre">


<br><br>


<input id="apellidoNuevo" placeholder="Apellido">


<br><br>


<input id="celularNuevo" placeholder="Celular">


<br><br>


<input id="correoNuevo" placeholder="Correo">


<br><br>


<select id="estadoNuevo">

<option>ACTIVO</option>
<option>ADHERENTE</option>

</select>


<br><br>


<button onclick="crearAfiliado()">
Aceptar
</button>


<button onclick="cerrarModal()">
Cancelar
</button>



`);

}


