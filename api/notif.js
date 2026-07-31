// =====================================
// ACDP - API NOTIFICACIONES
// Vercel Function
// api/notif.js
// =====================================


const admin = require("firebase-admin");



// ===============================
// FIREBASE ADMIN
// ===============================

if (!admin.apps.length) {


    admin.initializeApp({

        credential:

        admin.credential.cert({

            projectId:
            process.env.FIREBASE_PROJECT_ID,


            clientEmail:
            process.env.FIREBASE_CLIENT_EMAIL,


            privateKey:
            process.env.FIREBASE_PRIVATE_KEY
            .replace(/\\n/g, "\n")


        })

    });


}



const db =
admin.firestore();





// ===============================
// HANDLER
// ===============================

module.exports = async function handler(req,res){


try{


console.log(
"INICIO ENVIO NOTIFICACION ACDP"
);



// Datos recibidos desde config.js

const {

titulo,

cuerpo

} = req.body;



if(!titulo || !cuerpo){

throw new Error(
"Falta titulo o cuerpo"
);

}




// ===============================
// LEER AFILIADOS
// ===============================


const snapshot =
await db
.collection("afiliados")
.get();



let correos=[];



snapshot.forEach(doc=>{


const afiliado =
doc.data();



const correo =
afiliado.correo;



if(

correo &&

correo.includes("@")

){


correos.push({

Email:
correo


});


}



});





if(correos.length===0){


return res.status(200)
.json({

correcto:false,

mensaje:
"No hay afiliados con correo válido"


});


}





console.log(
"Correos encontrados:",
correos.length
);





// ===============================
// MAILJET
// ===============================


const API_KEY =
process.env.MAILJET_API_KEY;


const SECRET_KEY =
process.env.MAILJET_SECRET_KEY;




const auth =
Buffer
.from(
`${API_KEY}:${SECRET_KEY}`
)
.toString("base64");





// ===============================
// LOTES
// ===============================


const tamañoLote = 500;


let enviados=0;


let respuestas=[];



for(
let i=0;
i<correos.length;
i+=tamañoLote
){



const lote =
correos.slice(
i,
i+tamañoLote
);





const respuesta =
await fetch(

"https://api.mailjet.com/v3.1/send",

{


method:"POST",


headers:{


"Authorization":
`Basic ${auth}`,


"Content-Type":
"application/json"


},



body:JSON.stringify({

Messages:[{


From:{


Email:
"consultas.acdp@gmail.com",


Name:
"ACDP"


},



To:
lote,



Subject:
titulo,



HTMLPart:


`

<div>

<p>
Elegiste recibir correos de ACDP.
Si no deseas recibir más correos,
puedes solicitar la baja.
</p>


<hr>


<h2>
${titulo}
</h2>


<p>
${cuerpo}
</p>


<br>


<p>
Gracias por formar parte de ACDP
</p>


</div>

`


}]


})


}

);



const resultado =
await respuesta.json();



respuestas.push(resultado);



enviados += lote.length;




// esperar entre lotes si hay más

if(
i + tamañoLote < correos.length
){

await new Promise(
r=>setTimeout(r,60000)
);

}



}





// ===============================
// RESPUESTA
// ===============================


res.status(200)
.json({


correcto:true,


afiliadosEncontrados:
correos.length,


correosEnviados:
enviados,


respuestas



});




}


catch(error){


console.error(
"ERROR NOTIFICACIONES:",
error
);



res.status(500)
.json({


correcto:false,

error:
error.message


});


}



};
