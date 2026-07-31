// =====================================
// ACDP - API NOTIFICACIONES
// Vercel Function
// api/notif.js
// =====================================


module.exports = async function handler(req, res) {

    try {

const API_KEY = process.env.MAILJET_API_KEY;
const SECRET_KEY = process.env.MAILJET_SECRET_KEY;


        const auth =
        Buffer
        .from(
            `${API_KEY}:${SECRET_KEY}`
        )
        .toString("base64");



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


                        To:[{

                            Email:
                            "fraga.aranda@gmail.com"

                        }],


                        Subject:
                        "Prueba ACDP Mailjet",


                        HTMLPart:
                        `

                        <h2>
                        Prueba de notificaciones ACDP
                        </h2>


                        <p>
                        Si recibiste este correo,
                        Mailjet funciona correctamente.
                        </p>


                        <br>

                        <p>
                        Gracias por formar parte de ACDP
                        </p>

                        `

                    }]

                })

            }
        );



        const resultado =
        await respuesta.json();



        res.status(200)
        .json({

            correcto:true,

            resultado

        });


    }


    catch(error){

        console.error(error);


        res.status(500)
        .json({

            correcto:false,

            error:error.message

        });

    }

}
