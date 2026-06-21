// ===============================
// FIREBASE ACDP
// Configuración central
// ===============================


import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";



import {

    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot

}
from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";




// ===============================
// CONFIG FIREBASE
// ===============================


const firebaseConfig = {


    apiKey: "TU_API_KEY",

    authDomain: "TU_AUTH_DOMAIN",

    projectId: "TU_PROJECT_ID",

    storageBucket: "TU_STORAGE_BUCKET",

    messagingSenderId: "TU_MESSAGING_SENDER_ID",

    appId: "TU_APP_ID"


};




// ===============================
// INICIALIZAR
// ===============================


const app =
initializeApp(firebaseConfig);



const db =
getFirestore(app);





// ===============================
// EXPORTS GLOBALES
// ===============================


export {

    db,


    collection,
    doc,

    getDoc,
    getDocs,

    addDoc,
    setDoc,

    updateDoc,
    deleteDoc,

    query,
    where,
    orderBy,

    onSnapshot


};

window.db = db;
window.firebaseApp = app;
