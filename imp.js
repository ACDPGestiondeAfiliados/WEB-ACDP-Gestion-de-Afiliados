// ===============================
// IMPRESIÓN ACDP
// Carnet afiliado + Historial
// Compatible Firestore
// ===============================


// ===============================
// CARNET AFILIADO
// ===============================

function generarPDF(afiliado) {

    if (!afiliado) return;

    const ventana = window.open("", "_blank", "width=600,height=500");
    if (!ventana) return;

    const estado = (afiliado.estado || "").toUpperCase();

    const colorEstado =
        estado === "ADHERENTE"
            ? "#FFB700"
            : "#F600FF";

    ventana.document.write(`

<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Carnet ACDP</title>

<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

<style>

@page {
    size: 8cm 6cm;
    margin: 5mm;
}

body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: Arial;
}

.carnet {
    width: 8cm;
    height: 6cm;
    border: 2px solid ${colorEstado};
    display: flex;
    padding: 6px;
    box-sizing: border-box;
}

.izquierda {
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo {
    width: 55px;
}

.derecha {
    width: 70%;
    padding-left: 6px;
}

.titulo {
    font-size: 20px;
    font-weight: bold;
    color: #F600FF;
}

.subtitulo {
    font-size: 10px;
    font-weight: bold;
    margin-bottom: 8px;
}

.dato {
    font-size: 10px;
    margin: 3px 0;
}

#barra {
    width: 120px;
    height: 25px;
}

</style>

</head>

<body>

<div class="carnet">

    <div class="izquierda">
        <img src="logo.jpg" class="logo">
    </div>

    <div class="derecha">

        <div class="titulo">ACDP</div>

        <div class="subtitulo">Carnet de afiliado</div>

        <div class="dato">Nombre: <b>${afiliado.nombre || ""}</b></div>
        <div class="dato">Apellido: <b>${afiliado.apellido || ""}</b></div>
        <div class="dato">DNI: <b>${afiliado.dni || ""}</b></div>
        <div class="dato">Afiliado N°: <b>${afiliado.numero || ""}</b></div>

        <svg id="barra"></svg>

    </div>

</div>

<script>

window.onload = function () {

    JsBarcode(
        "#barra",
        "${afiliado.numero || afiliado.dni || ""}",
        {
            format: "CODE128",
            displayValue: false,
            height: 25,
            width: 1.5,
            margin: 0
        }
    );

    window.print();

    window.onafterprint = function () {
        window.close();
    };

};

</script>

</body>
</html>

    `);

    ventana.document.close();
}


// ===============================
// HISTORIAL COMPLETO
// ===============================

function imprimirHistorial() {

    const ventana = window.open("", "_blank", "width=900,height=700");
    if (!ventana) return;

    const tabla = document.getElementById("tablaHistorial");
    const fecha = document.getElementById("fechaHistorial");
    const monto = document.getElementById("montoHistorial");

    const fechaTexto =
        fecha
            ? (fecha.value || fecha.textContent || "")
            : "";

    const totalTexto =
        monto
            ? (monto.textContent || "$0")
            : "$0";

    ventana.document.write(`

<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Historial ACDP</title>

<style>

@page {
    size: A4;
    margin: 10mm;
}

body {
    font-family: Arial;
}

.contenedor {
    text-align: center;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    border: 1px solid #000;
    padding: 6px;
    font-size: 12px;
}

</style>

</head>

<body>

<div class="contenedor">

<h2>Historial ACDP</h2>

<div>
Fecha: ${fechaTexto}
</div>

<br>

${tabla ? tabla.outerHTML : "<p>Sin datos</p>"}

<h3>Total: ${totalTexto}</h3>

</div>

<script>

window.onload = function () {

    window.print();

    window.onafterprint = function () {
        window.close();
    };

};

</script>

</body>
</html>

    `);

    ventana.document.close();
}


// ===============================
// EXPORT GLOBAL
// ===============================

window.generarPDF = generarPDF;
window.imprimirHistorial = imprimirHistorial;
