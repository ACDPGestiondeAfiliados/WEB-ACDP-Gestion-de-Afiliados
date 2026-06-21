 ===============================
 CONFIG FIREBASE ACDP
 ===============================

const firebaseConfig = {

    apiKey TU_API_KEY,
    authDomain TU_PROYECTO.firebaseapp.com,
    projectId TU_PROYECTO,

};


firebase.initializeApp(firebaseConfig);


const dbFirebase =
firebase.firestore();