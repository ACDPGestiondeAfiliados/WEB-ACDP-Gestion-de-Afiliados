// =====================================
// ACDP - API NOTIFICACIONES
// Vercel Function
// api/notif.js
// =====================================


import admin from "firebase-admin";


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
            ?.replace(/\\n/g, "\n")

        })

    });

}


const db =
admin.firestore();



// ===============================
// MAILJET
// ===============================

const MAILJET_API =
process.env.MAILJET_API_KEY;


const MAILJET_SECRET =
process.env.MAILJET_SECRET_KEY;



// ===============================
// HANDLER
// ===============================


export default async function handler(req,res){


    if(req.method !== "POST"){

        return res.status(405).json({

            ok:false,

            error:"Método no permitido"

        });

    }



    try {


        const {
            notificacionId

        } = req.body;



        if(!notificacionId){

            return res.status(400).json({

                ok:false,

                error:"Falta ID notificación"

            });

        }



        // ===============================
        // 1) LEER NOTIFICACIÓN
        // ===============================


        const notifSnap =
        await db
        .collection("notificaciones")
        .doc(notificacionId)
        .get();



        if(!notifSnap.exists){

            return res.status(404).json({

                ok:false,

                error:"Notificación inexistente"

            });

        }



        const notif =
        notifSnap.data();



        // ===============================
        // 2) LEER AFILIADOS
        // ===============================


        const afiliadosSnap =
        await db
        .collection("afiliados")
        .get();



        let correos = [];



        afiliadosSnap.forEach(doc=>{


            const a =
            doc.data();



            if(
                a.correo &&
                a.estado !== "Eliminado"
            ){

                correos.push(
                    a.correo.trim()
                );

            }


        });



        // ===============================
        // 3) CREAR HTML
        // ===============================


        const html = `

        <div style="
        font-family:Arial;
        max-width:650px;
        margin:auto;
        ">


        <p style="
        font-size:12px;
        color:#777;
        ">

        Elegiste recibir este mail.
        Si no deseas recibir más correos de ACDP,
        <a href="#">
        CLIC AQUI
        </a>

        </p>


        <hr>


        <h2>
        ${notif.titulo}
        </h2>


        <p>
        ${notif.cuerpo}
        </p>


        <br>


        <strong>
        Gracias por formar parte de ACDP
        </strong>


        </div>

        `;



        // ===============================
        // 4) ENVIAR LOTES
        // ===============================


        let enviados = 0;
        let errores = 0;


        const lote = 100;


        for(
            let i=0;
            i<correos.length;
            i+=lote
        ){


            const grupo =
            correos.slice(
                i,
                i+lote
            );



            for(const correo of grupo){


                try{


                    // Aquí irá la llamada Mailjet


                    enviados++;


                }

                catch(e){

                    errores++;

                }


            }



            // espera entre lotes

            if(
                i + lote < correos.length
            ){

                await new Promise(
                    r=>setTimeout(
                        r,
                        60000
                    )
                );

            }


        }



        // ===============================
        // 5) RESPUESTA
        // ===============================


        return res.json({

            ok:true,

            total:
            correos.length,

            enviados,

            errores

        });



    }

    catch(error){


        console.error(error);


        return res.status(500).json({

            ok:false,

            error:error.message

        });


    }


}
