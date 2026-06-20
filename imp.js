// ===============================
// IMPRESIÓN ACDP
// Vista previa y generación temporal
// de comprobantes
// ===============================


function generarPDF(datos){

    abrirVistaImpresion(datos);

}



// Abre vista previa en modal

function abrirVistaImpresion(datos){

    const fondo=document.getElementById("modalFondo");
    const contenido=document.getElementById("modalContenido");


    if(!fondo || !contenido){

        return;

    }



    let filas="";


    datos.forEach(d=>{


        filas+=`

        <tr>

            <td>${d.afiliado||""}</td>
            <td>${d.dni||""}</td>
            <td>${d.fecha||""}</td>
            <td>${d.detalle||""}</td>

        </tr>

        `;


    });



    contenido.innerHTML=`

    <h2>ACDP</h2>

    <h3>Comprobante</h3>


    <table>

        <thead>

            <tr>

                <th>Afiliado</th>
                <th>DNI</th>
                <th>Fecha</th>
                <th>Detalle</th>

            </tr>

        </thead>


        <tbody>

            ${filas}

        </tbody>


    </table>


    <br>


    <button onclick="window.print()">

        Imprimir

    </button>

    `;



    fondo.classList.add("activo");

}
