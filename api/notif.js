// =====================================
// ACDP - API NOTIFICACIONES
// Vercel Function
// api/notif.js
// =====================================


module.exports = async function handler(req, res) {


    try {


        console.log(
            "NOTIF.JS EJECUTADO"
        );


        const {

            titulo,

            cuerpo

        } = req.body;



        console.log(
            "Datos recibidos:",
            titulo,
            cuerpo
        );



        const API_KEY =
        process.env.MAILJET_API_KEY;



        const SECRET_KEY =
        process.env.MAILJET_SECRET_KEY;



        if(!API_KEY || !SECRET_KEY){

            throw new Error(
                "Faltan claves Mailjet en Vercel"
            );

        }




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
                        titulo ||
                        "Notificación ACDP",




                        HTMLPart:`


                        <h2>
                        ${titulo || "ACDP"}
                        </h2>



                        <p>
                        ${cuerpo || ""}
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





        console.log(
            "Respuesta Mailjet:",
            resultado
        );





        res.status(200)
        .json({

            correcto:true,

            resultado

        });





    }

    catch(error){


        console.error(
            "ERROR NOTIF:",
            error
        );



        res.status(500)
        .json({


            correcto:false,


            error:
            error.message


        });


    }


}
